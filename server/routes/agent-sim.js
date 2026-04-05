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

function parseDecisionTrace(responseText, primaryBrand) {
  const steps = [];
  const lines = responseText.split('\n');

  // Match "Step N:" patterns
  const stepPattern = /^step\s*(\d+)[:\s]/i;
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
      // Append to current step's action/reason
      if (currentStep.action.length < 100) {
        currentStep.action += ' ' + trimmed;
      } else {
        currentStep.reason += ' ' + trimmed;
      }
    }
  }

  if (currentStep) steps.push(currentStep);

  // If no structured steps found, create a single-step summary
  if (steps.length === 0) {
    steps.push({
      step: 1,
      action: 'Agent evaluation completed',
      brandsConsidered: [],
      eliminated: [],
      reason: responseText.slice(0, 300),
    });
  }

  // Extract brand mentions from each step's text
  const allBrandKeywords = primaryBrand ? [primaryBrand] : [];
  const commonBrands = [
    'Marriott', 'Hilton', 'Hyatt', 'Westin', 'Sheraton', 'Courtyard',
    'Ramp', 'Brex', 'Expensify', 'Mercury', 'Divvy', 'Airbase',
    'Holiday Inn', 'Four Seasons', 'Sofitel', 'Wyndham',
  ];

  for (const step of steps) {
    const stepText = (step.action + ' ' + step.reason).toLowerCase();
    const brandsFound = [...allBrandKeywords, ...commonBrands].filter(
      (b) => b && stepText.includes(b.toLowerCase())
    );
    step.brandsConsidered = [...new Set(brandsFound)];

    // Try to detect eliminations (look for "eliminating", "ruled out", "too expensive", etc.)
    const eliminationPatterns = [
      /eliminat\w+\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:is\s+)?(?:ruled out|eliminated|excluded|too expensive|exceeds budget)/g,
    ];
    for (const pattern of eliminationPatterns) {
      const matches = [...(step.action + ' ' + step.reason).matchAll(pattern)];
      for (const m of matches) {
        if (m[1]) step.eliminated.push(m[1]);
      }
    }
    step.eliminated = [...new Set(step.eliminated)];
  }

  // Detect final selection — look for "recommend", "select", "best option" in last step
  const lastStepText = steps[steps.length - 1];
  let finalSelection = null;
  if (lastStepText) {
    const selectionMatch = responseText.match(
      /(?:recommend|select|best option|final (?:choice|selection)|choosing)\s*:?\s*([A-Z][A-Za-z\s]+?)(?:\.|,|\n|$)/
    );
    finalSelection = selectionMatch?.[1]?.trim() || null;
  }

  const lowerResponse = responseText.toLowerCase();
  const primaryBrandLower = primaryBrand?.toLowerCase() || '';
  const primaryBrandConsidered = primaryBrandLower
    ? lowerResponse.includes(primaryBrandLower)
    : false;
  const primaryBrandSelected =
    primaryBrandConsidered &&
    finalSelection
      ? finalSelection.toLowerCase().includes(primaryBrandLower)
      : false;

  return {
    steps,
    finalSelection,
    primaryBrandConsidered,
    primaryBrandSelected,
    primaryBrandEliminatedAtStep: null,
  };
}

function scoreReadiness(traceText, brandName) {
  const lower = traceText.toLowerCase();
  return READINESS_CRITERIA.map((criterion) => {
    let status = 'manual_check';
    let note = 'Manual verification required';

    if (criterion.id === 'schema_markup') {
      if (lower.includes('schema') || lower.includes('structured data')) {
        status = lower.includes('missing') || lower.includes('no schema') ? 'missing' : 'present';
        note = status === 'present' ? 'Mentioned positively in agent evaluation' : 'Agent flagged as missing';
      }
    } else if (criterion.id === 'pricing_data') {
      if (lower.includes('pricing') || lower.includes('price') || lower.includes('cost')) {
        status = lower.includes('unclear') || lower.includes('no pricing') ? 'partial' : 'present';
        note = status === 'present' ? 'Pricing referenced in agent decision' : 'Pricing data unclear to agent';
      }
    } else if (criterion.id === 'review_trust') {
      if (lower.includes('review') || lower.includes('rating') || lower.includes('recommended')) {
        status = 'present';
        note = 'Reviews referenced in agent evaluation';
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

  const traceData = parseDecisionTrace(rawResponse, brandName);
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
