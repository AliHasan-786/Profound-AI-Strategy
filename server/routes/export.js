import { Router } from 'express';
import { getDb } from '../db.js';
import { getFullResults } from '../services/sqlAnalytics.js';
import { DEMO_RESULTS, DEMO_RUN_ID } from '../data/demoCache.js';

const router = Router();

// GET /api/export/audit/:id — returns structured data for PDF generation
router.get('/audit/:id', (req, res) => {
  const { id } = req.params;

  if (id === DEMO_RUN_ID) {
    return res.json(buildAuditPayload(DEMO_RESULTS));
  }

  const db = getDb();
  const run = db.prepare(`SELECT * FROM analysis_runs WHERE id = ?`).get(id);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  const competitors = JSON.parse(run.competitors || '[]');
  const results = getFullResults(id, run.brand_name, competitors);
  res.json(buildAuditPayload(results));
});

function buildAuditPayload(results) {
  const { run, mentionRateByModel, competitiveShareOfVoice, sentimentByBrand, crossModelDiscrepancy } = results;

  const overallMentionRate = mentionRateByModel.length
    ? Math.round(mentionRateByModel.reduce((s, r) => s + r.mention_rate_pct, 0) / mentionRateByModel.length * 10) / 10
    : 0;

  const primaryBrand = competitiveShareOfVoice[0];
  const topCompetitor = competitiveShareOfVoice.find((b) => b.brand !== run?.brand_name);
  const gap = topCompetitor
    ? Math.round((topCompetitor.pct - (primaryBrand?.pct || 0)) * 10) / 10
    : 0;

  const positiveSentiment = sentimentByBrand.find((s) => s.sentiment === 'positive')?.pct || 0;

  const recommendations = [];
  if (overallMentionRate < 30) {
    recommendations.push('Increase brand presence in authoritative industry lists and comparison articles — currently below the 30% threshold where AI models reliably surface brands.');
  }
  if (gap > 10 && topCompetitor) {
    recommendations.push(`Close the ${gap}-point share-of-voice gap with ${topCompetitor.brand} by securing mentions in high-citation content sources (industry publications, Reddit communities, review platforms).`);
  }
  if (crossModelDiscrepancy?.flagged) {
    recommendations.push(`Address the ${crossModelDiscrepancy.gap}-point discrepancy between GPT-4o and Claude visibility — indicates inconsistent brand entity recognition across training data sources.`);
  }
  if (recommendations.length < 3) {
    recommendations.push('Ensure Schema.org Organization and Product markup is complete and crawlable — pages with full schema get indexed 3.1x faster and recommended more often.');
  }

  return {
    brandName: run?.brand_name,
    category: run?.category,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    overallMentionRate,
    gptMentionRate: mentionRateByModel.find((m) => m.model === 'gpt-4o')?.mention_rate_pct || 0,
    claudeMentionRate: mentionRateByModel.find((m) => m.model === 'claude-3-5-sonnet')?.mention_rate_pct || 0,
    competitiveShareOfVoice,
    sentimentByBrand,
    topCompetitor: topCompetitor?.brand || null,
    shareOfVoiceGap: gap,
    crossModelDiscrepancy,
    recommendations: recommendations.slice(0, 3),
  };
}

export default router;
