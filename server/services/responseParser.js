import { callModel } from './llmClient.js';

const POSITIVE_SIGNALS = [
  'excellent', 'highly recommend', 'great', 'best', 'leading', 'top', 'love',
  'loved', 'impressive', 'strong', 'outstanding', 'exceptional', 'fantastic',
  'superb', 'brilliant', 'amazing', 'wonderful', 'perfect', 'superior',
  'recommended', 'reliable', 'trusted', 'innovative', 'powerful', 'easy to use',
];

const NEGATIVE_SIGNALS = [
  'poor', 'avoid', 'not recommended', 'issues', 'problems', 'limited',
  'disappointing', 'weak', 'unreliable', 'terrible', 'awful', 'bad',
  'frustrating', 'complicated', 'expensive', 'overpriced', 'buggy',
  'slow', 'difficult', 'clunky', 'outdated', 'mediocre', 'inferior',
];

/**
 * Normalizes a string: lowercase, remove punctuation.
 */
function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, ' ');
}

/**
 * Split text into sentences.
 */
function toSentences(text) {
  return text.match(/[^.!?]+[.!?]*/g) || [text];
}

/**
 * Check if a brand name appears in a normalized text.
 */
function brandInText(brand, normalizedText) {
  return normalizedText.includes(brand.toLowerCase());
}

/**
 * Find the sentence most strongly associated with a sentiment.
 */
function findSentimentExcerpt(text, sentiment) {
  const sentences = toSentences(text);
  const signals = sentiment === 'positive' ? POSITIVE_SIGNALS : NEGATIVE_SIGNALS;

  let best = null;
  let bestScore = 0;

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    let score = 0;
    for (const signal of signals) {
      if (lower.includes(signal)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = sentence.trim();
    }
  }

  return best || sentences[0]?.trim() || '';
}

/**
 * Parse a single LLM response for brand mentions and sentiment.
 */
export function parseResponse(responseText, primaryBrand, allBrands) {
  const normalized = normalize(responseText);

  // Brand mention detection
  const brand_mentioned = brandInText(primaryBrand, normalized) ? 1 : 0;
  const brands_mentioned = allBrands.filter((b) => b && brandInText(b, normalized));

  // Sentiment classification
  const lowerText = responseText.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  for (const signal of POSITIVE_SIGNALS) {
    if (lowerText.includes(signal)) positiveScore++;
  }
  for (const signal of NEGATIVE_SIGNALS) {
    if (lowerText.includes(signal)) negativeScore++;
  }

  let sentiment = 'neutral';
  if (positiveScore > negativeScore && positiveScore > 0) sentiment = 'positive';
  else if (negativeScore > positiveScore && negativeScore > 0) sentiment = 'negative';

  const sentiment_excerpt = sentiment !== 'neutral' ? findSentimentExcerpt(responseText, sentiment) : '';

  return {
    brand_mentioned,
    brands_mentioned: JSON.stringify(brands_mentioned),
    sentiment,
    sentiment_excerpt,
  };
}

/**
 * Extract citation URLs from a Perplexity-style response.
 *
 * Perplexity includes citations as [1]: https://... blocks at the end of a
 * response, or inline as bare URLs after numbered references. This function
 * matches all http/https URLs in the text, deduplicates them, and filters
 * out noise (very short strings, example.com placeholder URLs).
 *
 * @param {string} responseText
 * @returns {string[]} Deduplicated array of plausible source URLs
 */
export function extractCitations(responseText) {
  const urlPattern = /https?:\/\/[^\s\)\]\,\"\']+/g;
  const urls = responseText.match(urlPattern) || [];
  return [...new Set(urls)].filter(u => u.length > 15 && !u.includes('example.com'));
}

/**
 * LLM-based theme classification across a batch of brand-mentioned responses.
 *
 * Takes up to 20 responses where brand_mentioned = 1, sends them to Claude Haiku
 * in a single call, and returns theme + funnel stage distributions.
 *
 * @param {Array<{response_text: string}>} responses - Filtered to brand-mentioned only
 * @param {string} brandName
 * @returns {Promise<{themeDistribution: object, funnelDistribution: object, classifications: Array, responseCount: number} | null>}
 */
export async function classifyThemesWithLLM(responses, brandName) {
  // Cap at 10 responses and truncate each to 200 chars.
  // callModel uses max_tokens: 400. At 20 responses × 300 chars the JSON output
  // was 800-1000+ tokens — the response was silently truncated and JSON.parse
  // failed. 10 objects × ~30 tokens each ≈ 300 tokens, safely within budget.
  const sample = responses.slice(0, 10);
  const n = sample.length;

  if (n === 0) return null;

  const classificationPrompt = `You are analyzing how AI systems discuss a brand. Below are ${n} AI responses that mention "${brandName}".

For each response, classify:
1. buying_funnel_stage: "awareness" | "consideration" | "decision"
2. primary_theme: one of ["cost_value", "feature_comparison", "social_proof", "problem_solution", "category_leader", "alternative"]
3. sentiment_confidence: "high" | "medium" | "low"

Responses:
${sample.map((r, i) => `[${i + 1}] ${r.response_text.slice(0, 200)}`).join('\n\n')}

Return a JSON array with ${n} objects: [{buying_funnel_stage, primary_theme, sentiment_confidence}]
Only return the JSON array, no other text.`;

  try {
    const raw = await callModel('claude-3-5-sonnet', classificationPrompt);

    // Strip any markdown code fences the model might add
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const classifications = JSON.parse(cleaned);

    if (!Array.isArray(classifications)) return null;

    // Aggregate theme distribution
    const themeDistribution = {
      cost_value: 0,
      feature_comparison: 0,
      social_proof: 0,
      problem_solution: 0,
      category_leader: 0,
      alternative: 0,
    };
    const funnelDistribution = { awareness: 0, consideration: 0, decision: 0 };

    for (const cls of classifications) {
      if (cls.primary_theme && themeDistribution.hasOwnProperty(cls.primary_theme)) {
        themeDistribution[cls.primary_theme]++;
      }
      if (cls.buying_funnel_stage && funnelDistribution.hasOwnProperty(cls.buying_funnel_stage)) {
        funnelDistribution[cls.buying_funnel_stage]++;
      }
    }

    return {
      themeDistribution,
      funnelDistribution,
      classifications,
      responseCount: n,
    };
  } catch (err) {
    // Classification is additive — never break the analysis run
    console.error('[classifyThemesWithLLM] Failed silently:', err.message);
    return null;
  }
}
