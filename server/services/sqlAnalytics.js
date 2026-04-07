import { getDb } from '../db.js';

/**
 * 1. Overall mention rate by model
 */
export function getMentionRateByModel(runId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT model,
        COUNT(*) as total_prompts,
        SUM(brand_mentioned) as mentions,
        ROUND(100.0 * SUM(brand_mentioned) / COUNT(*), 1) as mention_rate_pct
      FROM responses
      WHERE run_id = ?
      GROUP BY model`
    )
    .all(runId);
}

/**
 * 2. Mention rate by prompt type (joined with prompts table)
 */
export function getMentionRateByPromptType(runId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.prompt_type, r.model,
        COUNT(*) as total,
        SUM(r.brand_mentioned) as mentions,
        ROUND(100.0 * SUM(r.brand_mentioned) / COUNT(*), 1) as mention_rate_pct
      FROM responses r
      JOIN prompts p ON r.prompt_id = p.id
      WHERE r.run_id = ?
      GROUP BY p.prompt_type, r.model
      ORDER BY mention_rate_pct DESC`
    )
    .all(runId);
}

/**
 * 3. Competitive share of voice — true SOV using a window function.
 *
 *    SOV = brand_mentions / total_brand_mentions_across_all_brands.
 *    This is analytically distinct from mention rate (mentions / total_responses).
 *    Both are returned so the UI can display either.
 *
 *    SUM(COUNT(*)) OVER () sums all per-brand mention counts in the grouped
 *    result, giving the total number of brand mentions across all brands.
 */
export function getCompetitiveShareOfVoice(runId, allBrands) {
  const db = getDb();
  const brands = allBrands.filter(Boolean);
  if (brands.length === 0) return [];

  // Build a parameterised IN list — one placeholder per brand
  const placeholders = brands.map(() => '?').join(', ');

  const rows = db
    .prepare(
      `SELECT
         je.value AS brand,
         COUNT(*) AS mentions,
         (SELECT COUNT(*) FROM responses WHERE run_id = ?) AS total_responses,
         ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS sov_pct,
         ROUND(
           100.0 * COUNT(*) / (SELECT COUNT(*) FROM responses WHERE run_id = ?),
           1
         ) AS mention_rate_pct
       FROM responses r, json_each(r.brands_mentioned) AS je
       WHERE r.run_id = ?
         AND je.value IN (${placeholders})
       GROUP BY je.value
       ORDER BY mentions DESC`
    )
    // params: two subquery run_ids + outer WHERE run_id + brand list
    .all(runId, runId, runId, ...brands);

  // Ensure every brand has an entry even if it has zero mentions
  const resultMap = new Map(rows.map((r) => [r.brand, r]));
  const total_responses = rows[0]?.total_responses ?? db
    .prepare(`SELECT COUNT(*) as cnt FROM responses WHERE run_id = ?`)
    .get(runId).cnt;

  return brands.map((brand) =>
    resultMap.get(brand) ?? {
      brand,
      mentions: 0,
      total_responses,
      sov_pct: 0,
      mention_rate_pct: 0,
    }
  );
}

/**
 * Helper — get the overall mention rate (0–1) for a single brand across all
 * responses in a run. Used by getCoMentionMatrix to compute lift.
 */
function getBrandMentionRate(db, runId, brand) {
  const row = db.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(
         CASE WHEN EXISTS (
           SELECT 1 FROM json_each(r.brands_mentioned) je
           WHERE je.value = ?
         ) THEN 1 ELSE 0 END
       ) AS mentions
     FROM responses r
     WHERE r.run_id = ?`
  ).get(brand, runId);

  if (!row || row.total === 0) return 0;
  return row.mentions / row.total;
}

/**
 * 4. Co-mention matrix — pure SQL using json_each() and conditional aggregation.
 *
 *    For each competitor we run one aggregate query (EXISTS subselects on
 *    json_each) plus one grouped-by-model variant. Total: 2 queries × N
 *    competitors. No rows are transferred into JS memory for filtering.
 *
 *    "When AI mentions Competitor X, how often does it also mention the
 *    primary brand?"
 *
 *    Also computes lift = co_mention_rate / (primary_rate × competitor_rate).
 *    lift > 1.5 → models strongly associate these brands
 *    lift 0.8–1.5 → co-mention at expected rates
 *    lift < 0.8 → models present as alternatives
 */
export function getCoMentionMatrix(runId, primaryBrand, competitors) {
  const db = getDb();

  // Get primary brand mention rate once — reused for every competitor's lift calc
  const primaryRate = getBrandMentionRate(db, runId, primaryBrand);

  // Prepared once; reused per competitor
  const overallStmt = db.prepare(
    `SELECT
       COUNT(*) AS total,
       SUM(
         CASE WHEN EXISTS (
           SELECT 1 FROM json_each(r.brands_mentioned) je2
           WHERE je2.value = ?
         ) THEN 1 ELSE 0 END
       ) AS co_mentions
     FROM responses r
     WHERE r.run_id = ?
       AND EXISTS (
         SELECT 1 FROM json_each(r.brands_mentioned) je1
         WHERE je1.value = ?
       )`
  );

  const byModelStmt = db.prepare(
    `SELECT
       r.model,
       COUNT(*) AS total,
       SUM(
         CASE WHEN EXISTS (
           SELECT 1 FROM json_each(r.brands_mentioned) je2
           WHERE je2.value = ?
         ) THEN 1 ELSE 0 END
       ) AS co_mentions
     FROM responses r
     WHERE r.run_id = ?
       AND r.model IN ('gpt-4o', 'claude-3-5-sonnet', 'perplexity')
       AND EXISTS (
         SELECT 1 FROM json_each(r.brands_mentioned) je1
         WHERE je1.value = ?
       )
     GROUP BY r.model`
  );

  return competitors.filter(Boolean).map((competitor) => {
    // params: primaryBrand (co-mention check), runId, competitor (outer filter)
    const overall = overallStmt.get(primaryBrand, runId, competitor);
    const total = overall?.total ?? 0;
    const coMentions = overall?.co_mentions ?? 0;
    const pct = total > 0 ? Math.round((coMentions / total) * 1000) / 10 : 0;

    // Lift = observed co-mention rate / (primary_rate × competitor_rate)
    const competitorRate = getBrandMentionRate(db, runId, competitor);
    const expectedRate = primaryRate * competitorRate;
    const coMentionRate = total > 0 ? coMentions / total : 0;
    const lift = expectedRate > 0
      ? Math.round((coMentionRate / expectedRate) * 100) / 100
      : null;

    const modelRows = byModelStmt.all(primaryBrand, runId, competitor);

    const byModel = ['gpt-4o', 'claude-3-5-sonnet', 'perplexity'].map((model) => {
      const row = modelRows.find((r) => r.model === model);
      const modelTotal = row?.total ?? 0;
      const modelCoMentions = row?.co_mentions ?? 0;
      return {
        model,
        total: modelTotal,
        coMentions: modelCoMentions,
        pct: modelTotal > 0
          ? Math.round((modelCoMentions / modelTotal) * 1000) / 10
          : 0,
      };
    });

    return {
      competitor,
      total,
      coMentions,
      pct,
      lift,
      byModel,
    };
  });
}

/**
 * 5. Sentiment distribution for the primary brand
 */
export function getSentimentByBrand(runId) {
  const db = getDb();
  return db
    .prepare(
      `SELECT sentiment, COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as pct
      FROM responses
      WHERE run_id = ? AND brand_mentioned = 1
      GROUP BY sentiment`
    )
    .all(runId);
}

/**
 * 6. Cross-model discrepancy — returns side-by-side mention rates + flags gap > 15pts
 */
export function getCrossModelDiscrepancy(runId) {
  const db = getDb();
  const rows = getMentionRateByModel(runId);

  const gpt = rows.find((r) => r.model === 'gpt-4o');
  const claude = rows.find((r) => r.model === 'claude-3-5-sonnet');
  const gap =
    gpt && claude ? Math.abs(gpt.mention_rate_pct - claude.mention_rate_pct) : 0;

  return {
    gpt4o: gpt || null,
    claude: claude || null,
    gap: Math.round(gap * 10) / 10,
    flagged: gap > 15,
  };
}

/**
 * Sample responses for ResponseExplorer
 */
export function getSampleResponses(runId, limit = 10) {
  const db = getDb();
  return db
    .prepare(
      `SELECT r.id, r.response_text, r.brand_mentioned, r.brands_mentioned,
              r.sentiment, r.model, p.prompt_text, p.prompt_type
       FROM responses r
       JOIN prompts p ON r.prompt_id = p.id
       WHERE r.run_id = ?
       ORDER BY r.brand_mentioned DESC, r.created_at DESC
       LIMIT ?`
    )
    .all(runId, limit);
}

/**
 * 7. Citation sources — Perplexity responses include citation URLs stored as a
 *    JSON array in the citation_urls column. Unnest and rank by domain frequency.
 *    Returns the top 20 URLs cited across all Perplexity responses for this run.
 */
export function getCitationSources(runId) {
  const db = getDb();
  return db.prepare(
    `SELECT
       je.value AS url,
       COUNT(*) AS frequency
     FROM responses r, json_each(r.citation_urls) AS je
     WHERE r.run_id = ?
       AND r.model = 'perplexity'
       AND r.citation_urls IS NOT NULL
       AND r.citation_urls != '[]'
     GROUP BY je.value
     ORDER BY frequency DESC
     LIMIT 20`
  ).all(runId);
}

/**
 * Run all analytics and return the full results object.
 */
export function getFullResults(runId, brandName, competitors) {
  const allBrands = [brandName, ...competitors].filter(Boolean);

  const run = getDb()
    .prepare(`SELECT * FROM analysis_runs WHERE id = ?`)
    .get(runId);

  return {
    run,
    mentionRateByModel: getMentionRateByModel(runId),
    mentionRateByPromptType: getMentionRateByPromptType(runId),
    competitiveShareOfVoice: getCompetitiveShareOfVoice(runId, allBrands),
    coMentionMatrix: getCoMentionMatrix(runId, brandName, competitors),
    sentimentByBrand: getSentimentByBrand(runId),
    crossModelDiscrepancy: getCrossModelDiscrepancy(runId),
    sampleResponses: getSampleResponses(runId, 10),
    citationSources: getCitationSources(runId),
  };
}
