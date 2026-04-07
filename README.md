# AEO Studio — AI Brand Visibility Analyzer

A full-stack tool that measures how often AI models mention your brand, identifies competitive visibility gaps, and simulates whether autonomous AI agents would select your brand when making a purchase.

**[Live Demo](https://profound-ai-strategy.vercel.app)** — works without API keys. Click "Try Demo" on the setup page.

---

## What It Does

Traditional SEO measures Google rankings. But when a user asks ChatGPT "what's the best expense management tool for my startup?", Google rankings are irrelevant — and a brand with strong SEO can be entirely invisible to AI.

AEO Studio addresses this by:

1. **Running 120+ structured prompts** across GPT-4o Mini and Claude Haiku, organized into four prompt types that reveal different dimensions of AI brand visibility
2. **Storing all responses in SQLite** and computing analytics via named SQL query functions (GROUP BY, self-JOIN, window functions)
3. **Surfacing competitive share-of-voice gaps** — including a co-mention matrix showing how often competitors appear alongside your brand across both models
4. **Simulating B2A agent procurement** — sending structured purchasing tasks to an LLM and parsing the step-by-step brand elimination trace

---

## The Prompt Taxonomy

The core methodological insight is that a single prompt doesn't capture AI brand presence. Four types reveal fundamentally different signals:

| Type | What It Measures | Why It Matters |
|------|-----------------|----------------|
| **Brand-Named** | Direct AI recall | Baseline — AI knows your brand exists |
| **Category-General** | Organic discovery | Does AI surface you without being asked? |
| **Competitor-Comparison** | Relative positioning | Are you in the consideration set when buyers compare? |
| **Problem-First** | Pain-point association | Does AI connect your brand to problems you solve? |

A brand can score 100% on brand-named prompts but only 12% on problem-first — meaning AI knows the brand but doesn't surface it to buyers in discovery mode. That 88-point gap is the most commercially significant finding: it represents buyers who exit the AI conversation without ever encountering the brand.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 + Vite | Component-based SPA |
| Routing | React Router v7 | Client-side navigation |
| Backend | Node.js + Express 5 | REST API + SSE streaming |
| Database | SQLite (better-sqlite3) | Zero-setup, synchronous, SQL-native analytics |
| Charts | Recharts | Composable React charting |
| Animation | Framer Motion | Live prompt stream animation |
| PDF Export | jsPDF | Client-side 4-page audit report |
| AI APIs | OpenRouter (unified gateway) | Single key for GPT-4o Mini + Claude Haiku |
| Deployment | Vercel (frontend) + Railway (backend) | |

---

## Architecture

```
Browser (Vercel)
  └─ React SPA
       ├─ Setup page → POST /api/analysis/run → returns runId immediately
       ├─ ProgressStream → SSE /api/analysis/:id/stream → live prompt animation
       ├─ Analysis tabs → GET /api/analysis/:id/results → SQL-computed metrics
       └─ Agent Sim → POST /api/agent-sim/run → decision trace parser

Railway (Node.js/Express)
  ├─ promptGenerator.js   — 30 variants × 4 types = 120 prompt templates
  ├─ llmClient.js         — OpenRouter calls with retry on 429/503
  ├─ responseParser.js    — brand mention detection + keyword sentiment
  ├─ sqlAnalytics.js      — 6 named SQL query functions
  └─ aeo-studio.db        — SQLite: analysis_runs, prompts, responses, agent_simulations
```

All brand mention rates, sentiment distributions, and competitive share-of-voice metrics are computed via SQL — not JavaScript. This keeps analytics reproducible, auditable, and portable to larger datasets.

---

## SQL Analytics Layer

Six named query functions back every metric in the dashboard:

```sql
-- getMentionRateByModel: overall mention rate per AI model
SELECT model,
  COUNT(*) AS total_prompts,
  SUM(brand_mentioned) AS mentions,
  ROUND(100.0 * SUM(brand_mentioned) / COUNT(*), 1) AS mention_rate_pct
FROM responses WHERE run_id = ? GROUP BY model

-- getMentionRateByPromptType: the funnel gap (JOIN + GROUP BY)
SELECT p.prompt_type, r.model,
  ROUND(100.0 * SUM(r.brand_mentioned) / COUNT(*), 1) AS mention_rate_pct
FROM responses r JOIN prompts p ON r.prompt_id = p.id
WHERE r.run_id = ? GROUP BY p.prompt_type, r.model

-- getSentimentByBrand: window function for proportional breakdown
SELECT sentiment, COUNT(*) AS count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM responses WHERE run_id = ? AND brand_mentioned = 1
GROUP BY sentiment

-- getCoMentionMatrix: when AI mentions competitor X, how often also mentions brand Y?
-- getCompetitiveShareOfVoice: JSON_EACH scan across brands_mentioned JSON arrays
-- getCrossModelDiscrepancy: side-by-side pivot flagging >15pt gaps between models
```

---

## Agent Engine Optimization (AEO 2.0)

The B2A module addresses the next wave: will an AI agent *select* your brand when executing a purchase autonomously?

Three scenario types are supported:
- **Hotel Booking** — business traveler budget + preference constraints
- **Software Procurement** — team size, budget/user, integration requirements
- **Product Purchase** — budget, quality, availability filters

The agent receives a structured task prompt with explicit step-by-step reasoning instructions. The response is parsed into a decision trace showing which brands were considered, which were eliminated at each step, and why. A 6-criteria Agent Readiness Scorecard evaluates the brand's data completeness for agent-era commerce.

**Key finding from a live run:** When Claude was asked to book a hotel near SFO under $200/night, it eliminated Hyatt on budget, applied loyalty/amenity filters to Marriott's sub-brand portfolio, and selected Marriott Fairfield Inn & Suites. The deciding factor was sub-brand pricing clarity. A hotel chain with vague or hidden pricing would have been eliminated at step 2. Brand awareness didn't matter; data structure did.

---

## Running Locally

```bash
# Prerequisites: Node 20+

git clone <repo>
cd aeo-studio
npm install

# Copy env and add your OpenRouter API key
cp .env.example .env
# Edit .env: OPENROUTER_API_KEY=sk-or-...

# Run frontend + backend together
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

Demo mode works without API keys — click "Try Demo" on the setup page.

---

## Environment Variables

```
OPENROUTER_API_KEY=    # Required for live analysis (openrouter.ai)
PORT=3001
NODE_ENV=development
CORS_ORIGIN=           # Comma-separated allowed origins (optional)
```

---

## Database Schema

```sql
CREATE TABLE analysis_runs (
  id TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  category TEXT NOT NULL,
  competitors TEXT,              -- JSON array e.g. ["Brex","Expensify"]
  status TEXT DEFAULT 'running', -- 'running' | 'complete' | 'failed'
  total_prompts INTEGER,
  completed_prompts INTEGER DEFAULT 0
);

CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES analysis_runs(id),
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL,     -- 'brand_named' | 'category_general' |
                                  -- 'competitor_comparison' | 'problem_first'
  model TEXT NOT NULL            -- 'gpt-4o' | 'claude-3-5-sonnet'
);

CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  prompt_id TEXT NOT NULL REFERENCES prompts(id),
  run_id TEXT NOT NULL,
  response_text TEXT NOT NULL,
  brand_mentioned INTEGER NOT NULL,  -- 0 or 1
  brands_mentioned TEXT,             -- JSON array of all brands found
  sentiment TEXT,                    -- 'positive' | 'neutral' | 'negative'
  model TEXT NOT NULL
);

CREATE TABLE agent_simulations (
  id TEXT PRIMARY KEY,
  scenario_type TEXT NOT NULL,       -- 'hotel_booking' | 'software_procurement' | 'product_purchase'
  task_prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  decision_trace TEXT NOT NULL,      -- JSON: [{step, action, brandsConsidered, eliminated, reason}]
  selected_brand TEXT,
  brand_selected INTEGER DEFAULT 0,
  raw_response TEXT NOT NULL
);
```

---

## Key Design Decisions

| Decision | Why | Trade-off |
|----------|-----|-----------|
| SQLite over Postgres | Zero server setup, in-process, synchronous API | Single-file DB, no multi-user persistence |
| OpenRouter over separate API keys | One key, unified billing, OpenAI SDK interface for both models | ~5-10% markup over direct pricing |
| Keyword sentiment over LLM scoring | $0.001/run vs $0.05+ for LLM-scored sentiment | Lower accuracy on ambiguous language |
| Client-side PDF (jsPDF) | Works on static Vercel deploy, no server needed | Limited layout vs Puppeteer |
| SSE streaming + polling fallback | Live progress without WebSockets; polling handles proxy timeouts | Railway proxy cuts long-lived SSE connections |
| Static agent readiness scores | No crawling infrastructure for MVP | Scores inferred from agent response text |

---

## Project Structure

```
aeo-studio/
├── server/
│   ├── index.js                    # Express entry point, CORS, route mounting
│   ├── db.js                       # SQLite schema creation on startup
│   ├── routes/
│   │   ├── analysis.js             # POST /run, GET /status, GET /results, SSE /stream
│   │   ├── agent-sim.js            # POST /run — prompt templates + decision trace parser
│   │   └── export.js               # GET /audit/:id
│   ├── services/
│   │   ├── promptGenerator.js      # 30 variants × 4 types × dynamic brand injection
│   │   ├── llmClient.js            # OpenRouter wrapper with retry logic
│   │   ├── responseParser.js       # Brand mention detection + keyword sentiment
│   │   └── sqlAnalytics.js         # 6 named SQL query functions
│   └── data/
│       └── demoCache.js            # Pre-cached Ramp/Brex/Expensify results
│
└── src/
    ├── pages/
    │   ├── HomePage.jsx            # Brand setup form
    │   ├── AnalysisPage.jsx        # 5-tab analysis view + recent runs
    │   ├── AgentSimPage.jsx        # B2A agent simulation
    │   └── CaseStudyPage.jsx       # Technical + strategic write-up
    ├── components/
    │   ├── analysis/               # VisibilityTab, CompetitiveTab, SentimentTab,
    │   │                           # ResponseExplorer, MethodologyTab, StrategicInsights
    │   └── agent/                  # AgentSimSetup, DecisionTrace, AgentReadinessScore
    └── utils/
        └── pdfExport.js            # 4-page jsPDF report generator
```

---

## V2 Roadmap

| Feature | Why | Approach |
|---------|-----|----------|
| Citation drift tracking | Run same analysis monthly, surface drops >5pt — core Profound use case | Timestamp runs, compare deltas |
| Perplexity + Gemini support | Perplexity cites sources directly — citation authority becomes measurable | Add to llmClient.js |
| Live schema markup verification | Replace static Agent Readiness with actual site crawl | Crawl4AI integration |
| Citation source attribution | "Get listed on these 3 sites" — actionable output | Correlate Perplexity citations with high-mention responses |
| Multi-tenant auth | Persistent history per account, team sharing | Clerk.dev + Vercel Postgres |
