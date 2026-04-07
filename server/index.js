import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import analysisRouter from './routes/analysis.js';
import agentSimRouter from './routes/agent-sim.js';
import exportRouter from './routes/export.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:4173', 'https://profound-ai-strategy.vercel.app'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Initialize DB on startup
getDb();

app.use('/api/analysis', analysisRouter);
app.use('/api/agent-sim', agentSimRouter);
app.use('/api/export', exportRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`AEO Studio server running on http://localhost:${PORT}`);
});
