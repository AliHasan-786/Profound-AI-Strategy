import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { generatePromptBatch } from '../services/promptGenerator.js';
import { callModelWithCitations } from '../services/llmClient.js';
import { parseResponse, classifyThemesWithLLM, extractCitations } from '../services/responseParser.js';
import { getFullResults } from '../services/sqlAnalytics.js';
import { DEMO_RESULTS, DEMO_RUN_ID } from '../data/demoCache.js';

const router = Router();

// Track SSE clients: runId -> Set of response objects
const sseClients = new Map();

function broadcast(runId, data) {
  const clients = sseClients.get(runId);
  if (!clients) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch (_) {}
  }
}

// POST /api/analysis/run
router.post('/run', async (req, res) => {
  const { brandName, category, competitors = [], useDemo = false } = req.body;

  if (!brandName || !category) {
    return res.status(400).json({ error: 'brandName and category are required' });
  }

  // Demo mode — return immediately
  if (useDemo) {
    return res.json({
      runId: DEMO_RUN_ID,
      status: 'complete',
      totalPrompts: 100,
      demo: true,
    });
  }

  // Live mode
  const db = getDb();
  const runId = uuidv4();
  const prompts = generatePromptBatch(brandName, category, competitors);

  db.prepare(
    `INSERT INTO analysis_runs (id, brand_name, category, competitors, status, total_prompts)
     VALUES (?, ?, ?, ?, 'running', ?)`
  ).run(runId, brandName, category, JSON.stringify(competitors), prompts.length);

  res.json({ runId, status: 'running', totalPrompts: prompts.length });

  // Fire-and-forget background execution
  runAnalysisBackground(runId, brandName, competitors, prompts).catch(console.error);
});

async function runAnalysisBackground(runId, brandName, competitors, prompts) {
  const db = getDb();
  const allBrands = [brandName, ...competitors].filter(Boolean);
  let completed = 0;
  let failed = 0;

  const insertPrompt = db.prepare(
    `INSERT INTO prompts (id, run_id, prompt_text, prompt_type, model) VALUES (?, ?, ?, ?, ?)`
  );
  const insertResponse = db.prepare(
    `INSERT INTO responses (id, prompt_id, run_id, response_text, brand_mentioned, brands_mentioned, sentiment, sentiment_excerpt, model, citation_urls)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const updateProgress = db.prepare(
    `UPDATE analysis_runs SET completed_prompts = ?, failed_prompts = ? WHERE id = ?`
  );

  // Concurrency limit to stay within rate limits
  const CONCURRENCY = 3;

  for (let i = 0; i < prompts.length; i += CONCURRENCY) {
    const batch = prompts.slice(i, i + CONCURRENCY);

    await Promise.allSettled(
      batch.map(async ({ prompt_text, prompt_type, model }) => {
        const promptId = uuidv4();
        insertPrompt.run(promptId, runId, prompt_text, prompt_type, model);

        try {
          const { content: responseText, citations } = await callModelWithCitations(model, prompt_text);
          const parsed = parseResponse(responseText, brandName, allBrands);

          // Perplexity returns structured citations; fall back to URL extraction from text
          const finalCitations = citations.length > 0
            ? citations
            : (model === 'perplexity' ? extractCitations(responseText) : []);

          insertResponse.run(
            uuidv4(), promptId, runId, responseText,
            parsed.brand_mentioned, parsed.brands_mentioned,
            parsed.sentiment, parsed.sentiment_excerpt, model,
            JSON.stringify(finalCitations)
          );

          completed++;
          updateProgress.run(completed, failed, runId);

          broadcast(runId, {
            type: 'progress',
            completedPrompts: completed,
            failedPrompts: failed,
            totalPrompts: prompts.length,
            currentPrompt: prompt_text,
            model,
          });
        } catch (err) {
          failed++;
          completed++;
          updateProgress.run(completed, failed, runId);
          console.error(`[${model}] Error on prompt "${prompt_text}":`, err.message);

          broadcast(runId, {
            type: 'progress',
            completedPrompts: completed,
            failedPrompts: failed,
            totalPrompts: prompts.length,
            currentPrompt: prompt_text,
            model,
            promptFailed: true,
          });
        }
      })
    );
  }

  // Determine final status: if >20% of prompts failed, mark the run as failed
  const failureRate = failed / prompts.length;
  const finalStatus = failureRate > 0.2 ? 'failed' : 'complete';
  const errorMessage = finalStatus === 'failed'
    ? `${failed} of ${prompts.length} prompts failed (${Math.round(failureRate * 100)}%). This exceeds the 20% threshold. Check API keys and rate limits.`
    : null;

  db.prepare(
    `UPDATE analysis_runs SET status = ?, error_message = ? WHERE id = ?`
  ).run(finalStatus, errorMessage, runId);

  broadcast(runId, {
    type: finalStatus === 'failed' ? 'failed' : 'complete',
    runId,
    failedPrompts: failed,
    totalPrompts: prompts.length,
    ...(errorMessage ? { error: errorMessage } : {}),
  });

  // Theme classification — runs after all prompts complete, only if the run succeeded
  if (finalStatus === 'complete') {
    try {
      const brandMentionedResponses = db.prepare(
        `SELECT response_text FROM responses WHERE run_id = ? AND brand_mentioned = 1 ORDER BY created_at ASC`
      ).all(runId);

      const themeAnalysis = await classifyThemesWithLLM(brandMentionedResponses, brandName);

      if (themeAnalysis) {
        db.prepare(
          `UPDATE analysis_runs SET theme_analysis = ? WHERE id = ?`
        ).run(JSON.stringify(themeAnalysis), runId);
      }
    } catch (err) {
      // Theme classification is additive — never fail the run over it
      console.error('[Theme classification] Failed silently:', err.message);
    }
  }

  // Close all SSE clients for this run
  const clients = sseClients.get(runId);
  if (clients) {
    for (const res of clients) { try { res.end(); } catch (_) {} }
    sseClients.delete(runId);
  }
}

// GET /api/analysis/:id/stream — SSE endpoint for live progress
router.get('/:id/stream', (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);

  // Send current status immediately
  const db = getDb();
  const run = db.prepare(`SELECT * FROM analysis_runs WHERE id = ?`).get(id);
  if (run) {
    res.write(`data: ${JSON.stringify({
      type: 'status',
      status: run.status,
      completedPrompts: run.completed_prompts,
      failedPrompts: run.failed_prompts || 0,
      totalPrompts: run.total_prompts,
    })}\n\n`);

    if (run.status === 'complete' || run.status === 'failed') {
      res.end();
      return;
    }
  }

  req.on('close', () => {
    const clients = sseClients.get(id);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(id);
    }
  });
});

// GET /api/analysis/:id/status — polling fallback
router.get('/:id/status', (req, res) => {
  if (req.params.id === DEMO_RUN_ID) {
    return res.json({ status: 'complete', completedPrompts: 100, failedPrompts: 0, totalPrompts: 100 });
  }
  const db = getDb();
  const run = db.prepare(`SELECT * FROM analysis_runs WHERE id = ?`).get(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json({
    status: run.status,
    completedPrompts: run.completed_prompts,
    failedPrompts: run.failed_prompts || 0,
    totalPrompts: run.total_prompts,
    ...(run.error_message ? { error: run.error_message } : {}),
  });
});

// GET /api/analysis/:id/results
router.get('/:id/results', (req, res) => {
  if (req.params.id === DEMO_RUN_ID) {
    return res.json(DEMO_RESULTS);
  }
  const db = getDb();
  const run = db.prepare(`SELECT * FROM analysis_runs WHERE id = ?`).get(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });

  const competitors = JSON.parse(run.competitors || '[]');
  const results = getFullResults(req.params.id, run.brand_name, competitors);

  // Attach theme analysis if available
  if (run.theme_analysis) {
    try {
      results.themeAnalysis = JSON.parse(run.theme_analysis);
    } catch (_) {
      results.themeAnalysis = null;
    }
  } else {
    results.themeAnalysis = null;
  }

  res.json(results);
});

export default router;
