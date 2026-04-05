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
 * 3. Competitive share of voice — for each brand, count how many responses mention it
 */
export function getCompetitiveShareOfVoice(runId, allBrands) {
  const db = getDb();
  const total = db
    .prepare(`SELECT COUNT(*) as cnt FROM responses WHERE run_id = ?`)
    .get(runId).cnt;

  return allBrands
    .filter(Boolean)
    .map((brand) => {
      // SQLite JSON — check if brand appears in brands_mentioned JSON array
      const row = db
        .prepare(
          `SELECT COUNT(*) as mentions
           FROM responses
           WHERE run_id = ?
             AND (brands_mentioned LIKE ? OR brands_mentioned LIKE ? OR brands_mentioned LIKE ? OR brands_mentioned LIKE ?)`
        )
        .get(
          runId,
          `%"${brand}"%`,
          `%'${brand}'%`,
          `["${brand}"]`,
          `%${brand}%`
        );
      const mentions = row?.mentions || 0;
      return {
        brand,
        mentions,
        total,
        pct: total > 0 ? Math.round((mentions / total) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

/**
 * 4. Co-mention matrix
 * "When AI mentions Competitor X, how often does it also mention the primary brand?"
 */
export function getCoMentionMatrix(runId, primaryBrand, competitors) {
  const db = getDb();

  return competitors.filter(Boolean).map((competitor) => {
    // Responses that mention this competitor
    const competitorRows = db
      .prepare(
        `SELECT brands_mentioned FROM responses
         WHERE run_id = ? AND brands_mentioned LIKE ?`
      )
      .all(runId, `%${competitor}%`);

    const total = competitorRows.length;
    const coMentions = competitorRows.filter((r) => {
      const brands = JSON.parse(r.brands_mentioned || '[]');
      return brands.includes(primaryBrand);
    }).length;

    // Also split by model
    const byModel = ['gpt-4o', 'claude-3-5-sonnet'].map((model) => {
      const modelRows = db
        .prepare(
          `SELECT brands_mentioned FROM responses
           WHERE run_id = ? AND model = ? AND brands_mentioned LIKE ?`
        )
        .all(runId, model, `%${competitor}%`);
      const modelTotal = modelRows.length;
      const modelCoMentions = modelRows.filter((r) => {
        const brands = JSON.parse(r.brands_mentioned || '[]');
        return brands.includes(primaryBrand);
      }).length;
      return {
        model,
        total: modelTotal,
        coMentions: modelCoMentions,
        pct: modelTotal > 0 ? Math.round((modelCoMentions / modelTotal) * 1000) / 10 : 0,
      };
    });

    return {
      competitor,
      total,
      coMentions,
      pct: total > 0 ? Math.round((coMentions / total) * 1000) / 10 : 0,
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
  };
}
