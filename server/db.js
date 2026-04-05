import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'aeo-studio.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS analysis_runs (
      id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      category TEXT NOT NULL,
      competitors TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'running',
      total_prompts INTEGER,
      completed_prompts INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES analysis_runs(id),
      prompt_text TEXT NOT NULL,
      prompt_type TEXT NOT NULL,
      model TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      prompt_id TEXT NOT NULL REFERENCES prompts(id),
      run_id TEXT NOT NULL,
      response_text TEXT NOT NULL,
      brand_mentioned INTEGER NOT NULL,
      brands_mentioned TEXT,
      sentiment TEXT,
      sentiment_excerpt TEXT,
      model TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agent_simulations (
      id TEXT PRIMARY KEY,
      run_id TEXT,
      scenario_type TEXT NOT NULL,
      task_prompt TEXT NOT NULL,
      model TEXT NOT NULL,
      decision_trace TEXT NOT NULL,
      selected_brand TEXT,
      brand_selected INTEGER DEFAULT 0,
      raw_response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
