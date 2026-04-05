import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { generatePromptBatch } from '../services/promptGenerator.js';
import { callModel } from '../services/llmClient.js';
import { parseResponse } from '../services/responseParser.js';
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

  const insertPrompt = db.prepare(
    `INSERT INTO prompts (id, run_id, prompt_text, prompt_type, model) VALUES (?, ?, ?, ?, ?)`
  );
  const insertResponse = db.prepare(
    `INSERT INTO responses (id, prompt_id, run_id, response_text, brand_mentioned, brands_mentioned, sentiment, sentiment_excerpt, model)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const updateProgress = db.prepare(
    `UPDATE analysis_runs SET completed_prompts = ? WHERE id = ?`
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
          const responseText = await callModel(model, prompt_text);
          const parsed = parseResponse(responseText, brandName, allBrands);

          insertResponse.run(
            uuidv4(), promptId, runId, responseText,
            parsed.brand_mentioned, parsed.brands_mentioned,
            parsed.sentiment, parsed.sentiment_excerpt, model
          );

          completed++;
          updateProgress.run(completed, runId);

          broadcast(runId, {
            type: 'progress',
            completedPrompts: completed,
            totalPrompts: prompts.length,
            currentPrompt: prompt_text,
            model,
          });
        } catch (err) {
          completed++;
          updateProgress.run(completed, runId);
          console.error(`[${model}] Error on prompt "${prompt_text}":`, err.message);
        }
      })
    );
  }

  db.prepare(`UPDATE analysis_runs SET status = 'complete' WHERE id = ?`).run(runId);
  broadcast(runId, { type: 'complete', runId });

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
      totalPrompts: run.total_prompts,
    })}\n\n`);

    if (run.status === 'complete') {
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
    return res.json({ status: 'complete', completedPrompts: 100, totalPrompts: 100 });
  }
  const db = getDb();
  const run = db.prepare(`SELECT * FROM analysis_runs WHERE id = ?`).get(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json({
    status: run.status,
    completedPrompts: run.completed_prompts,
    totalPrompts: run.total_prompts,
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
  res.json(results);
});

export default router;
