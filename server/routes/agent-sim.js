import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { callModel } from '../services/llmClient.js';

const router = Router();

const SCENARIO_TEMPLATES = {
  hotel_booking: (brandName, params) => `
You are an AI assistant helping a business traveler book a hotel room. Your task is to select the best available hotel and complete the booking.

Task parameters:
- Location: near ${params.location || 'downtown'}
- Budget: under $${params.budget || 200}/night
- Dates: ${params.nights || 2} nights (checking in tomorrow)
- Traveler preferences: loyalty program preferred, free cancellation, business amenities
${brandName ? `- Preferred brand to consider: ${brandName}` : ''}

Please think through this decision step by step:
Step 1: Identify which hotel brands/chains match the location criteria
Step 2: Filter by budget constraint
Step 3: Apply the traveler preference filters
Step 4: Select the best option and explain your selection criteria

For each step, explicitly state: which options you are considering, which you are eliminating and why. Be specific about brand names.
`.trim(),

  software_procurement: (brandName, params) => `
You are an AI procurement assistant helping a ${params.teamSize || 50}-person startup select an expense management platform. Your task is to evaluate options and make a recommendation.

Requirements:
- Budget: under $${params.budget || 12}/user/month
- Must integrate with QuickBooks
- Real-time spend visibility required
- Corporate card issuance preferred

Brands to evaluate: ${[brandName, ...(params.competitors || [])].filter(Boolean).join(', ')}

Think through this step by step:
Step 1: List all brands under consideration
Step 2: Filter by budget constraint
Step 3: Filter by QuickBooks integration
Step 4: Apply remaining requirements
Step 5: Final recommendation

For each step, explicitly state which brands you eliminate and why. Name specific brands in each step.
`.trim(),

  product_purchase: (brandName, params) => `
You are an AI shopping assistant helping a customer select a ${params.productType || 'product'}.

Task parameters:
- Budget: $${params.budget || 100}
- Requirements: ${params.requirements || 'best value, highly rated, available for immediate delivery'}
${brandName ? `- Brand to consider: ${brandName}` : ''}

Please reason step by step:
Step 1: Identify relevant options in this category
Step 2: Filter by budget
Step 3: Apply quality and availability filters
Step 4: Make final selection

For each step, name specific brands/products and explain why you are including or eliminating them.
`.trim(),
};

const READINESS_CRITERIA = [
  { id: 'schema_markup', label: 'Schema.org Markup', description: 'Product/Organization schema present for AI crawlers' },
  { id: 'pricing_data', label: 'Real-time Pricing Signals', description: 'Current pricing accessible to AI crawlers' },
  { id: 'availability', label: 'Availability Data Freshness', description: 'Stock/availability data updated < 24hrs' },
  { id: 'review_trust', label: 'Review Trust Score', description: 'Verified third-party reviews present on authoritative sites' },
  { id: 'checkout_integration', label: 'Checkout Integration', description: 'In-chat or API-accessible checkout flow' },
  { id: 'structured_data', label: 'Structured Product Data', description: 'GTIN/SKU/EAN identifiers + machine-readable attributes' },
];

// Bug 3 fix — extract capitalized proper nouns from a block of text as a fallback
// brand list supplement. Matches words that start with a capital letter and are
// at least 3 characters long, excluding common sentence-starting words.
const COMMON_SENTENCE_STARTERS = new Set([
  'The', 'This', 'These', 'Those', 'That', 'They', 'Their', 'There',
  'When', 'Where', 'Which', 'Who', 'What', 'Why', 'How',
  'For', 'And', 'But', 'Not', 'Also', 'Both', 'Each', 'With',
  'Step', 'First', 'Second', 'Third', 'Finally', 'Additionally',
  'However', 'Therefore', 'Overall', 'Based', 'Given', 'Since',
  // Common gerunds and action verbs that start agent reasoning steps
  'Identifying', 'Filtering', 'Applying', 'Considering', 'Evaluating',
  'Selecting', 'Recommending', 'Narrowing', 'Looking', 'Finding',
  'Comparing', 'Eliminating', 'Checking', 'Reviewing', 'Assessing',
  'Focusing', 'Analyzing', 'Searching', 'Matching', 'Using',
  'Starting', 'Moving', 'Proceeding', 'Taking', 'Making',
  'After', 'Before', 'Within', 'Between', 'Among', 'Across',
  'Requires', 'Meets', 'Offers', 'Provides', 'Includes',
]);

function extractProperNouns(text, knownBrands = []) {
  const matches = text.match(/\b([A-Z][A-Za-z]{2,}(?:\s[A-Z][A-Za-z]{2,})?)\b/g) || [];
  return [...new Set(matches.filter((w) => {
    const first = w.split(' ')[0];
    if (COMMON_SENTENCE_STARTERS.has(first)) return false;
    // Filter 2-4 char all-caps strings (airport codes, acronyms) unless they're a known brand
    if (/^[A-Z]{2,4}$/.test(w) && !knownBrands.some(b => b.toUpperCase() === w.toUpperCase())) return false;
    return true;
  }))];
}

// Bug 4 fix helper — given a text block and a list of known brands, return the
// last brand that appears in the text, or null.
function findLastMentionedBrand(text, knownBrands) {
  const lower = text.toLowerCase();
  let lastIndex = -1;
  let lastBrand = null;
  for (const brand of knownBrands) {
    const idx = lower.lastIndexOf(brand.toLowerCase());
    if (idx > lastIndex) {
      lastIndex = idx;
      lastBrand = brand;
    }
  }
  return lastBrand;
}

function parseDecisionTrace(responseText, primaryBrand, competitorBrands = []) {
  // Bug 1 fix — strip markdown bold (**) and italic (*) before parsing so
  // patterns like "**Step 1:**" become "Step 1:" and match the regex correctly.
  const cleaned = responseText.replace(/\*\*/g, '').replace(/\*/g, '');

  const steps = [];
  const lines = cleaned.split('\n');

  // Updated regex handles optional leading/trailing punctuation after stripping markdown.
  const stepPattern = /^step\s*(\d+)[:\s.\-]/i;
  let currentStep = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(stepPattern);
    if (match) {
      if (currentStep) steps.push(currentStep);
      currentStep = {
        step: parseInt(match[1]),
        action: trimmed.replace(stepPattern, '').trim(),
        brandsConsidered: [],
        eliminated: [],
        reason: '',
      };
    } else if (currentStep) {
      if (currentStep.action.length < 100) {
        currentStep.action += ' ' + trimmed;
      } else {
        currentStep.reason += ' ' + trimmed;
      }
    }
  }

  if (currentStep) steps.push(currentStep);

  if (steps.length === 0) {
    steps.push({
      step: 1,
      action: 'Agent evaluation completed',
      brandsConsidered: [],
      eliminated: [],
      reason: responseText.slice(0, 300),
    });
  }

  // Bug 3 fix — build a dynamic brand list from known inputs first, then
  // supplement with proper nouns extracted from the full response as a fallback.
  // This ensures brands the user did not pre-register (e.g. "Nintendo") are
  // still detected if the LLM mentions them.
  const knownBrands = [
    ...(primaryBrand ? [primaryBrand] : []),
    ...competitorBrands,
  ];
  const properNounFallback = extractProperNouns(cleaned, knownBrands);
  // Merge: prefer known brands, then add any proper noun not already covered.
  const allBrands = [...knownBrands];
  for (const noun of properNounFallback) {
    if (!allBrands.some((b) => b.toLowerCase() === noun.toLowerCase())) {
      allBrands.push(noun);
    }
  }

  for (const step of steps) {
    const stepText = step.action + ' ' + step.reason;
    const stepTextLower = stepText.toLowerCase();

    // brandsConsidered — use the dynamic allBrands list (Bug 3)
    const brandsFound = allBrands.filter(
      (b) => b && stepTextLower.includes(b.toLowerCase())
    );
    step.brandsConsidered = [...new Set(brandsFound)];

    // Elimination detection — same regex patterns, but now working on cleaned text
    const eliminationPatterns = [
      /eliminat\w+\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:is\s+)?(?:ruled out|eliminated|excluded|too expensive|exceeds budget)/g,
    ];
    for (const pattern of eliminationPatterns) {
      const matches = [...stepText.matchAll(pattern)];
      for (const m of matches) {
        if (m[1]) step.eliminated.push(m[1]);
      }
    }
    step.eliminated = [...new Set(step.eliminated)];
  }

  // Bug 4 fix — the old regex was too broad and captured things like
  // "selecting the most cost-effective" → "The Most Cost". New approach:
  // 1. Run the regex but only accept the match if it overlaps with a known brand.
  // 2. If that fails, fall back to the last brand mentioned in the final step text.
  const selectionRegex = /(?:recommend|select(?:ing|ed)?|best option is|final (?:choice|selection|recommendation)|choosing|go with|I (?:would |will )?choose)\s*:?\s*([A-Z][A-Za-z0-9\s]{1,40}?)(?:\.|,|\n|$)/gi;
  let finalSelection = null;

  const regexMatches = [...cleaned.matchAll(selectionRegex)];
  for (const m of regexMatches) {
    const candidate = m[1].trim();
    // Accept only if the candidate overlaps with a known brand (case-insensitive)
    const matchedBrand = allBrands.find((b) =>
      candidate.toLowerCase().includes(b.toLowerCase()) ||
      b.toLowerCase().includes(candidate.toLowerCase())
    );
    if (matchedBrand) {
      finalSelection = matchedBrand; // normalize to the canonical brand name
      break;
    }
  }

  // Fallback — take the last brand mentioned in the final step (Bug 4)
  if (!finalSelection && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    const lastStepText = lastStep.action + ' ' + lastStep.reason;
    finalSelection = findLastMentionedBrand(lastStepText, allBrands);
  }

  const lowerResponse = responseText.toLowerCase();
  const primaryBrandLower = primaryBrand?.toLowerCase() || '';
  const primaryBrandConsidered = primaryBrandLower
    ? lowerResponse.includes(primaryBrandLower)
    : false;
  const primaryBrandSelected =
    primaryBrandConsidered && finalSelection
      ? finalSelection.toLowerCase().includes(primaryBrandLower)
      : false;

  // Bug 2 fix — scan every step's eliminated array to find the step where
  // the primary brand was first eliminated, if ever.
  let primaryBrandEliminatedAtStep = null;
  if (primaryBrandLower) {
    for (const step of steps) {
      const wasEliminated = step.eliminated.some(
        (e) => e.toLowerCase().includes(primaryBrandLower)
      );
      if (wasEliminated) {
        primaryBrandEliminatedAtStep = step.step;
        break;
      }
    }
  }

  return {
    steps,
    finalSelection,
    primaryBrandConsidered,
    primaryBrandSelected,
    primaryBrandEliminatedAtStep,
  };
}

// Bug 5 fix — contextual readiness scoring. Instead of checking whether a
// keyword appears anywhere in the raw response (which fires on competitor
// mentions), we check whether the keyword appears within 100 characters of
// the primary brand name. We also accept the keyword appearing in the same
// sentence as the brand name as a second signal.
function sentencesContaining(text, word) {
  // Split on sentence-ending punctuation followed by whitespace or end-of-string.
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.toLowerCase().includes(word.toLowerCase()));
}

function keywordNearBrand(text, keyword, brandName, windowSize = 100) {
  const lower = text.toLowerCase();
  const kw = keyword.toLowerCase();
  const brand = brandName.toLowerCase();

  let searchFrom = 0;
  while (true) {
    const kwIdx = lower.indexOf(kw, searchFrom);
    if (kwIdx === -1) break;
    const start = Math.max(0, kwIdx - windowSize);
    const end = Math.min(lower.length, kwIdx + kw.length + windowSize);
    if (lower.slice(start, end).includes(brand)) return true;
    searchFrom = kwIdx + 1;
  }
  return false;
}

function scoreReadiness(traceText, brandName) {
  const brandLower = (brandName || '').toLowerCase();

  return READINESS_CRITERIA.map((criterion) => {
    let status = 'manual_check';
    let note = 'Manual verification required';

    if (criterion.id === 'schema_markup') {
      const keywords = ['schema', 'structured data'];
      const contextual = keywords.some((kw) => keywordNearBrand(traceText, kw, brandName));
      const inSentence = keywords.some((kw) =>
        sentencesContaining(traceText, kw).some((s) => s.toLowerCase().includes(brandLower))
      );
      if (contextual || inSentence) {
        const negative = keywordNearBrand(traceText, 'missing', brandName) ||
          keywordNearBrand(traceText, 'no schema', brandName);
        status = negative ? 'missing' : 'present';
        note = status === 'present'
          ? 'Mentioned positively in agent evaluation of this brand'
          : 'Agent flagged as missing for this brand';
      }
    } else if (criterion.id === 'pricing_data') {
      const keywords = ['pricing', 'price', 'cost'];
      const contextual = keywords.some((kw) => keywordNearBrand(traceText, kw, brandName));
      const inSentence = keywords.some((kw) =>
        sentencesContaining(traceText, kw).some((s) => s.toLowerCase().includes(brandLower))
      );
      if (contextual || inSentence) {
        const negative = keywordNearBrand(traceText, 'unclear', brandName) ||
          keywordNearBrand(traceText, 'no pricing', brandName);
        status = negative ? 'partial' : 'present';
        note = status === 'present'
          ? 'Pricing referenced for this brand in agent decision'
          : 'Pricing data for this brand unclear to agent';
      }
    } else if (criterion.id === 'review_trust') {
      const keywords = ['review', 'rating', 'recommended'];
      const contextual = keywords.some((kw) => keywordNearBrand(traceText, kw, brandName));
      const inSentence = keywords.some((kw) =>
        sentencesContaining(traceText, kw).some((s) => s.toLowerCase().includes(brandLower))
      );
      if (contextual || inSentence) {
        status = 'present';
        note = 'Reviews referenced for this brand in agent evaluation';
      }
    }

    return { ...criterion, status, note };
  });
}

// POST /api/agent-sim/run
router.post('/run', async (req, res) => {
  const { brandName, scenario, parameters = {}, model = 'gpt-4o' } = req.body;

  if (!scenario || !SCENARIO_TEMPLATES[scenario]) {
    return res.status(400).json({
      error: `Invalid scenario. Must be one of: ${Object.keys(SCENARIO_TEMPLATES).join(', ')}`,
    });
  }

  const taskPrompt = SCENARIO_TEMPLATES[scenario](brandName, parameters);

  let rawResponse;
  try {
    rawResponse = await callModel(model, taskPrompt);
  } catch (err) {
    return res.status(502).json({ error: 'LLM call failed', detail: err.message });
  }

  // Pass competitor list through so parseDecisionTrace can build a dynamic
  // brand list (Bug 3 fix) without relying on a hardcoded array.
  const competitorBrands = Array.isArray(parameters.competitors)
    ? parameters.competitors.filter(Boolean)
    : [];

  const traceData = parseDecisionTrace(rawResponse, brandName, competitorBrands);
  const readinessScores = scoreReadiness(rawResponse, brandName);
  const simId = uuidv4();

  try {
    getDb().prepare(
      `INSERT INTO agent_simulations (id, scenario_type, task_prompt, model, decision_trace, selected_brand, brand_selected, raw_response)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      simId,
      scenario,
      taskPrompt,
      model,
      JSON.stringify(traceData),
      traceData.finalSelection,
      traceData.primaryBrandSelected ? 1 : 0,
      rawResponse
    );
  } catch (err) {
    console.error('DB insert error:', err.message);
  }

  res.json({
    simId,
    scenario,
    model,
    trace: traceData,
    readinessScores,
    rawResponse,
  });
});

export default router;
