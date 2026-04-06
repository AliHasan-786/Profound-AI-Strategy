import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';

export default function CaseStudyPage() {
  return (
    <div style={{ maxWidth: 880 }}>
      <PageHeader
        title="Case Study: AEO Studio"
        subtitle="Measuring brand visibility in the age of AI — and preparing for the agent economy"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Executive Summary */}
        <Section>
          <SectionLabel>Executive Summary</SectionLabel>
          <p style={prose}>
            AEO Studio is a full-stack AI brand visibility analyzer that runs 120+ structured prompts
            across GPT-4o Mini and Claude Haiku, stores all responses in a SQLite database, and surfaces
            competitive share-of-voice gaps that traditional SEO tools miss entirely. It also includes
            the first working prototype of Agent Engine Optimization (AEO 2.0) — simulating how
            autonomous AI agents evaluate and select brands when making purchases on behalf of users.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
            <StatCard value="120+" label="prompts per run" />
            <StatCard value="4" label="prompt types" />
            <StatCard value="6" label="SQL analytics queries" />
            <StatCard value="2" label="LLM models compared" />
          </div>
        </Section>

        {/* The Problem */}
        <Section>
          <SectionLabel>Problem Definition</SectionLabel>
          <p style={prose}>
            Traditional SEO measures Google ranking. But when ChatGPT answers "what's the best expense
            management tool for my startup?", Google rankings are irrelevant — and a brand with strong
            SEO can be entirely invisible to AI. Research from Profound (2026) shows that up to 60%
            of AI citations change month-over-month, making AI visibility fundamentally unstable and
            undertracked.
          </p>
          <p style={{ ...prose, marginTop: 14 }}>
            The problem compounds with autonomous agents. Gartner projects that 90% of B2B purchasing
            decisions will involve AI intermediaries by 2028. When an AI agent selects a vendor, it
            doesn't browse Google — it parses structured data, pricing signals, schema markup, and
            review density. A brand that scores well on SEO but poorly on agent-legibility will be
            invisible to the next wave of B2B commerce.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { stat: '60%', label: 'of AI citations change month-over-month', source: 'Profound, 2026' },
              { stat: '73%', label: 'of consumers already use AI in purchase journeys', source: 'Gartner, 2025' },
              { stat: '90%', label: 'of B2B purchases will be AI-intermediated by 2028', source: 'Gartner, 2026' },
            ].map(({ stat, label, source }) => (
              <div key={stat} style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, padding: '16px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace' }}>{stat}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 6 }}>{source}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* User Persona + Discovery */}
        <Section>
          <SectionLabel>User Persona & Discovery</SectionLabel>
          <p style={{ ...prose, marginBottom: 20 }}>
            The primary user is a B2B SaaS marketer or growth PM who has started noticing that ChatGPT
            doesn't mention their brand, or mentions a competitor instead. They Google "how to appear in
            ChatGPT results" and find almost nothing actionable — existing tools are either vague
            (marketing blogs about "AI SEO") or enterprise-only (Profound, Goodie AI at $15k+ per year).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, padding: '18px' }}>
              <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 13, marginBottom: 12 }}>User Jobs-to-be-Done</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Functional', 'Measure how often ChatGPT mentions my brand vs competitors'],
                  ['Functional', 'Identify which prompt types surface vs bury my brand'],
                  ['Emotional', 'Have a concrete answer when the CEO asks "do we show up in AI?"'],
                  ['Social', 'Present a data-backed AI visibility report to the growth team'],
                ].map(([type, job]) => (
                  <div key={job} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <span style={{ color: '#374151', fontSize: 11, paddingTop: 2, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>{type}</span>
                    <span style={{ color: '#94A3B8', lineHeight: 1.4 }}>{job}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, padding: '18px' }}>
              <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 13, marginBottom: 12 }}>Pain Points with Existing Solutions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Profound, Goodie AI: $15k+ annually, no self-serve option',
                  'Manual testing: type prompts into ChatGPT one at a time — not reproducible',
                  'Existing SEO tools (Ahrefs, SEMrush): measure Google, not LLM citation',
                  'No tool quantifies cross-model discrepancy (GPT vs Claude)',
                  'Zero visibility into agent-era readiness (schema markup, pricing legibility)',
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#94A3B8', lineHeight: 1.4 }}>
                    <span style={{ color: '#EF4444', flexShrink: 0 }}>✗</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Methodology: prompt taxonomy */}
        <Section>
          <SectionLabel>Core Methodology: The Prompt Taxonomy</SectionLabel>
          <p style={{ ...prose, marginBottom: 20 }}>
            The key insight is that a single prompt doesn't capture AI brand presence. Four distinct
            prompt types reveal different dimensions — and the gaps between them are where strategy begins.
            A brand can score 96% on brand-named prompts but only 18% on problem-first, meaning AI knows
            the brand but doesn't surface it organically. That's the signal.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={th}>Type</th>
                <th style={th}>What it reveals</th>
                <th style={th}>AEO implication if low</th>
                <th style={th}>Example prompt</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Brand-Named', 'Direct AI awareness', 'Brand entity is weak in training data', '"What do you think of Ramp?"'],
                ['Category-General', 'Organic AI discovery', 'Brand not associated with the category', '"Best expense management tool for startups"'],
                ['Competitor-Comparison', 'Relative positioning', 'Competitors are dominating the comparison space', '"Ramp vs Brex — which should I use?"'],
                ['Problem-First', 'Pain-point-triggered mentions', 'Brand not linked to the problems it solves', '"How do I reduce employee expense fraud?"'],
              ].map(([type, reveals, implication, example]) => (
                <tr key={type} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={td}><span style={{ fontWeight: 600, color: '#F1F5F9' }}>{type}</span></td>
                  <td style={td}>{reveals}</td>
                  <td style={{ ...td, color: '#EF4444', fontSize: 12 }}>{implication}</td>
                  <td style={{ ...td, color: '#4B5563', fontStyle: 'italic' }}>{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Prioritization decisions */}
        <Section>
          <SectionLabel>Product Decisions & Trade-offs</SectionLabel>
          <p style={{ ...prose, marginBottom: 20 }}>
            Every major technical decision was a deliberate trade-off. The goal was maximum insight
            per unit of complexity — not the most sophisticated system, but the right one for this MVP.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                decision: 'SQLite over PostgreSQL',
                chose: 'Zero server setup — ships in-process, works on a developer laptop',
                tradeoff: 'No multi-user persistence; single-file DB limits cloud scaling',
                v2: 'Vercel Postgres or PlanetScale for shared history',
              },
              {
                decision: 'OpenRouter over separate OpenAI + Anthropic keys',
                chose: 'One API key, one billing account, OpenAI SDK interface for both models',
                tradeoff: 'Slight markup over direct API pricing (~5-10%)',
                v2: 'Direct API calls when cost optimization becomes critical',
              },
              {
                decision: 'Keyword-based sentiment over a second LLM call',
                chose: '$0.001 per analysis vs $0.05+ for LLM-scored sentiment at scale',
                tradeoff: 'Lower accuracy on ambiguous language and sarcasm',
                v2: 'Fine-tuned classifier or Claude Haiku for sentiment-only batch processing',
              },
              {
                decision: 'Client-side PDF export (jsPDF) over server-side (Puppeteer)',
                chose: 'Works on Vercel static deploy — no server required for export',
                tradeoff: 'Limited layout control; chart rendering inconsistency across browsers',
                v2: 'Puppeteer on Railway for pixel-perfect PDF generation',
              },
              {
                decision: 'Static Agent Readiness scorecard over live site crawl',
                chose: 'No crawling infrastructure needed for MVP; ships in 30 minutes',
                tradeoff: 'Scores are based on agent response text, not actual schema verification',
                v2: 'Crawl4AI integration to verify schema.org markup, pricing JSON, review count',
              },
              {
                decision: '100 prompts per run over 500+',
                chose: 'API cost of $0.15–0.40 per run vs $0.75–2.00 for 500 prompts',
                tradeoff: 'Smaller sample size; category-general and problem-first have fewer variants',
                v2: 'Configurable prompt count with real-time cost preview before running',
              },
            ].map(({ decision, chose, tradeoff, v2 }) => (
              <Collapsible key={decision} title={decision}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 0 2px' }}>
                  <Row label="Chose this because" value={chose} color="#22C55E" />
                  <Row label="Trade-off accepted" value={tradeoff} color="#F59E0B" />
                  <Row label="V2 path" value={v2} color="#3B82F6" />
                </div>
              </Collapsible>
            ))}
          </div>
        </Section>

        {/* Technical Architecture */}
        <Section>
          <SectionLabel>Technical Architecture</SectionLabel>
          <div style={{ margin: '0 0 20px' }}>
            <ArchFlow />
          </div>
          <p style={prose}>
            All brand mention rates, sentiment distributions, and competitive share-of-voice metrics
            are computed via named SQL query functions using GROUP BY, self-JOIN, and window functions
            — not in JavaScript. This makes analytics reproducible, auditable, and portable to larger
            datasets. The SQL layer is the part of this project that maps most directly to Profound's
            internal analytics infrastructure.
          </p>
        </Section>

        {/* Key Findings */}
        <Section>
          <SectionLabel>Key Findings — Ramp vs Brex vs Expensify (Demo)</SectionLabel>
          <div style={{
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
            borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6B7280', marginBottom: 16,
          }}>
            Note: Demo data is illustrative — crafted to reflect realistic LLM output patterns, not generated by live API calls.
            A live analysis run produces identical structure from real responses.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                num: '01',
                heading: 'Brex leads Ramp by 16 points in AI share-of-voice (58% vs 42%)',
                body: 'The gap is largest in problem-first prompts, where Brex is mentioned 2.3× more often — suggesting stronger entity associations around pain-point language in LLM training data. The fix: Ramp needs more content targeting problem-first queries (e.g. "how to stop employee expense fraud") that gets cited in high-authority sources.',
              },
              {
                num: '02',
                heading: "Ramp's category-general visibility (24%) is 4× lower than brand-named visibility (96%)",
                body: "Classic 'awareness without discovery' pattern. AI knows Ramp when asked directly, but doesn't surface it organically in category queries. This typically signals weak presence in industry directory listings, review aggregators, and comparison content that LLMs use to build category associations.",
              },
              {
                num: '03',
                heading: 'GPT-4o Mini and Claude Haiku disagree on "top pick" recommendation (22% vs 12%)',
                body: "A 10-point cross-model discrepancy on head-to-head comparisons signals inconsistent brand entity representation across the training corpora these models draw from. Fixable with more consistent brand mention patterns in high-citation sources — particularly sources that appear in both OpenAI and Anthropic training pipelines.",
              },
              {
                num: '04',
                heading: '64% positive sentiment — but support and travel features are consistent negatives',
                body: "Strong baseline brand health. Primary negative signals: customer support responsiveness and travel feature gaps. These are addressable without product changes — structured review responses on G2/Capterra and updated FAQ schema markup can shift the sentiment excerpt that AI surfaces.",
              },
            ].map(({ num, heading, body }) => (
              <FindingCard key={num} num={num} heading={heading} body={body} />
            ))}
          </div>
        </Section>

        {/* Success Metrics */}
        <Section>
          <SectionLabel>Success Metrics — What Good Looks Like</SectionLabel>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={th}>Metric</th>
                <th style={th}>Current (demo)</th>
                <th style={th}>Target</th>
                <th style={th}>Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Overall AI mention rate', '42%', '55%+', 'Industry leaders typically 50-70%'],
                ['Problem-first mention rate', '18%', '35%+', 'Indicates organic discovery, not just awareness'],
                ['Cross-model discrepancy', '4pt gap', '<10pt gap', '>15pt signals training data inconsistency'],
                ['Share-of-voice vs #1 competitor', '−16pt vs Brex', '<−5pt', 'Parity goal for funded challenger brands'],
                ['Positive sentiment', '64%', '70%+', 'Below 50% requires urgent review management'],
                ['Agent Readiness score', '74/100', '85+', 'Critical threshold before 2027 agent commerce scale'],
              ].map(([metric, current, target, benchmark]) => (
                <tr key={metric} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ ...td, fontWeight: 600, color: '#F1F5F9' }}>{metric}</td>
                  <td style={{ ...td, fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>{current}</td>
                  <td style={{ ...td, fontFamily: 'JetBrains Mono, monospace', color: '#22C55E' }}>{target}</td>
                  <td style={{ ...td, color: '#4B5563', fontSize: 12 }}>{benchmark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* AEO 2.0 */}
        <Section amber>
          <SectionLabel amber>Agent Engine Optimization: AEO 2.0</SectionLabel>
          <p style={prose}>
            The current AEO conversation is about AI-powered search: will ChatGPT mention my brand?
            AEO 2.0 is about something more consequential: will an AI agent{' '}
            <em style={{ color: '#F1F5F9' }}>select</em> my brand when executing a purchase autonomously?
          </p>
          <p style={{ ...prose, marginTop: 14 }}>
            AEO Studio's Agent Simulation sends a structured procurement task to an LLM —
            "You are a procurement AI for a 200-person company. Evaluate all expense management
            solutions and make a selection" — and parses the step-by-step elimination trace.
            The result is a 6-criteria Agent Readiness Scorecard.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '20px 0' }}>
            {[
              ['Schema.org Markup', 'Is the brand parseable as a structured entity?'],
              ['Real-time Pricing Signals', 'Can an agent verify current pricing without a human?'],
              ['Feature Availability Freshness', 'Is product data updated within 24 hours?'],
              ['Review Trust Density', 'Are there enough verified third-party reviews to trust?'],
              ['Checkout / Procurement Integration', 'Can an agent complete a purchase without a human?'],
              ['Structured Product Identifiers', 'Does the brand have machine-readable product IDs?'],
            ].map(([criterion, desc]) => (
              <div key={criterion} style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>◈ {criterion}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* What I'd Build Next */}
        <Section>
          <SectionLabel>What I'd Build Next — Prioritized Roadmap</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                pri: 'P0',
                color: '#EF4444',
                title: 'Citation drift tracking',
                body: 'Run the same analysis monthly and store runs by timestamp. Surface when a brand\'s mention rate drops >5pt — triggered by AI model updates or competitor citation campaigns. This is the core product Profound sells as a service.',
              },
              {
                pri: 'P0',
                color: '#EF4444',
                title: 'Perplexity + Gemini model support',
                body: 'Add Perplexity (real-time web citations) and Gemini to the comparison. Perplexity is especially valuable because it actively cites sources — making citation authority directly measurable.',
              },
              {
                pri: 'P1',
                color: '#F59E0B',
                title: 'Real-time schema markup verification',
                body: 'Use Crawl4AI to actually check whether the brand\'s website has Organization schema, Product schema, FAQ schema, and pricing JSON. Replace the static Agent Readiness scorecard with a live crawl result.',
              },
              {
                pri: 'P1',
                color: '#F59E0B',
                title: 'Citation source attribution',
                body: 'When AI mentions a brand positively, which source is it drawing from? Correlate high-mention-rate responses with the specific citations Perplexity surfaces. This gives brands an actionable target list: "get listed on these 3 sites."',
              },
              {
                pri: 'P2',
                color: '#22C55E',
                title: 'AI response correction portal',
                body: 'When an AI misrepresents a brand (wrong pricing, discontinued features), surface the exact response and provide a structured pathway to update structured data that influences that model\'s future responses.',
              },
              {
                pri: 'P2',
                color: '#22C55E',
                title: 'Multi-tenant SaaS with Clerk.dev auth',
                body: 'Persistent history per account. Brands can track their AEO score over time, share reports with their team, and benchmark against competitors. This is the obvious B2B SaaS productization path.',
              },
            ].map(({ pri, color, title, body }) => (
              <div key={title} style={{ display: 'flex', gap: 14, padding: '14px', background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, height: 'fit-content',
                  background: `${color}18`, color, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {pri}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#F1F5F9', fontSize: 14, fontWeight: 600, textAlign: 'left',
        }}
      >
        {title}
        <span style={{ color: '#4B5563', fontSize: 14 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && <div style={{ padding: '0 18px 14px' }}>{children}</div>}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
      <span style={{ color, fontWeight: 600, flexShrink: 0, width: 160 }}>{label}</span>
      <span style={{ color: '#94A3B8', lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function Section({ children, amber }) {
  return (
    <div style={{
      background: amber ? 'rgba(245,158,11,0.04)' : '#1E293B',
      border: `1px solid ${amber ? 'rgba(245,158,11,0.2)' : '#334155'}`,
      borderRadius: 12, padding: '28px 32px',
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, amber }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
      color: amber ? '#F59E0B' : '#4B5563', marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, padding: '18px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#3B82F6', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#4B5563', marginTop: 8 }}>{label}</div>
    </div>
  );
}

function FindingCard({ num, heading, body }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px', background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#3B82F6', flexShrink: 0, paddingTop: 2, width: 24 }}>{num}</div>
      <div>
        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>{heading}</div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{body}</div>
      </div>
    </div>
  );
}

function ArchFlow() {
  const nodes = [
    { label: 'React SPA', sub: 'Vercel CDN', color: '#3B82F6' },
    { label: 'Express Backend', sub: 'Railway', color: '#8B5CF6' },
    { label: 'OpenRouter', sub: 'GPT-4o Mini + Claude Haiku', color: '#22C55E' },
    { label: 'SQLite', sub: 'better-sqlite3', color: '#F59E0B' },
    { label: '6 SQL Queries', sub: 'GROUP BY · JOIN · window', color: '#94A3B8' },
    { label: 'Dashboard + PDF', sub: 'Recharts + jsPDF', color: '#3B82F6' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#0F172A', border: `1px solid ${node.color}30`, borderRadius: 8, padding: '10px 14px', textAlign: 'center', borderTop: `2px solid ${node.color}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{node.label}</div>
            <div style={{ fontSize: 11, color: '#4B5563', marginTop: 3 }}>{node.sub}</div>
          </div>
          {i < nodes.length - 1 && <div style={{ color: '#334155', fontSize: 18, padding: '0 6px' }}>→</div>}
        </div>
      ))}
    </div>
  );
}

const prose = { fontSize: 14, color: '#94A3B8', lineHeight: 1.75, margin: 0 };
const th = { textAlign: 'left', padding: '10px 12px', color: '#4B5563', fontSize: 12, fontWeight: 600 };
const td = { padding: '12px', color: '#94A3B8', fontSize: 13, verticalAlign: 'top' };
