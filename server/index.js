import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import analysisRouter from './routes/analysis.js';
import agentSimRouter from './routes/agent-sim.js';
import exportRouter from './routes/export.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
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
