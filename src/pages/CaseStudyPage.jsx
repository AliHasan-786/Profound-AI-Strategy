import PageHeader from '../components/layout/PageHeader';

export default function CaseStudyPage() {
  return (
    <div style={{ maxWidth: 860 }}>
      <PageHeader
        title="Case Study: AEO Studio"
        subtitle="Measuring brand visibility in the age of AI — and preparing for the agent economy"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Executive Summary */}
        <Section>
          <SectionLabel>Executive Summary</SectionLabel>
          <p style={prose}>
            AEO Studio is a full-stack AI brand visibility analyzer that runs 120+ structured prompts
            across GPT-4o Mini and Claude Haiku, stores results in a SQL database, and surfaces
            competitive share-of-voice gaps that traditional SEO tools miss entirely. Built to
            demonstrate that AI-powered search requires a fundamentally different measurement
            methodology, the tool also includes the first working prototype of Agent Engine
            Optimization (AEO 2.0) — simulating how autonomous AI agents evaluate and select brands
            when making purchases on behalf of users.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            <StatCard value="120+" label="prompts per analysis run" />
            <StatCard value="4" label="prompt taxonomy types" />
            <StatCard value="6" label="Agent Readiness criteria" />
          </div>
        </Section>

        {/* The Problem */}
        <Section>
          <SectionLabel>The Problem</SectionLabel>
          <p style={prose}>
            Traditional SEO measures how often a brand appears in Google results. But when ChatGPT
            answers "what's the best expense management tool for my startup?", Google rankings are
            irrelevant — and a brand with strong SEO can be entirely invisible to AI. Research from
            Profound (2026) shows that up to 60% of AI citations change month-over-month, making AI
            visibility fundamentally unstable and undertracked.
          </p>
          <p style={{ ...prose, marginTop: 16 }}>
            The problem compounds when you account for autonomous agents. Gartner projects that 90%
            of B2B purchasing decisions will involve AI intermediaries by 2028. When an AI agent is
            booking a hotel, procuring software, or selecting a vendor — it doesn't browse Google.
            It parses structured data, schema markup, pricing signals, and review density. A brand
            that scores well on traditional SEO but poorly on agent-legibility will be invisible to
            this next wave of commerce. No existing tool measures this.
          </p>
        </Section>

        {/* Methodology */}
        <Section>
          <SectionLabel>The Methodology</SectionLabel>
          <p style={{ ...prose, marginBottom: 20 }}>
            The core methodological insight is the prompt taxonomy. Four distinct prompt types reveal
            different dimensions of AI brand presence:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={th}>Prompt Type</th>
                <th style={th}>What it measures</th>
                <th style={th}>Example</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Brand-Named', 'Direct brand awareness in AI', '"What do you think of Ramp?"'],
                ['Category-General', 'Organic AI discovery', '"Best expense management tool for startups"'],
                ['Competitor-Comparison', 'Relative positioning', '"Ramp vs Brex — which is better?"'],
                ['Problem-First', 'Pain-point-triggered mentions', '"How do finance teams track remote employee spending?"'],
              ].map(([type, what, example]) => (
                <tr key={type} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={td}><span style={{ fontWeight: 600, color: '#F1F5F9' }}>{type}</span></td>
                  <td style={td}>{what}</td>
                  <td style={{ ...td, color: '#4B5563', fontStyle: 'italic' }}>{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...prose, marginTop: 16 }}>
            A brand can score 96% on brand-named prompts but only 18% on problem-first prompts —
            meaning AI mentions it when asked directly, but fails to surface it when users describe a
            problem the brand solves. That gap is where AEO strategy begins.
          </p>
        </Section>

        {/* Technical Architecture */}
        <Section>
          <SectionLabel>Technical Architecture</SectionLabel>
          <div style={{ margin: '0 0 20px' }}>
            <ArchFlow />
          </div>
          <p style={prose}>
            The SQL analysis layer is intentional. Rather than computing metrics in JavaScript, all
            brand mention rates, co-mention frequencies, sentiment distributions, and cross-model
            discrepancies are computed via named SQL query functions using GROUP BY, self-JOIN, and
            window functions — making the analytics reproducible, auditable, and extensible to larger
            datasets.
          </p>
        </Section>

        {/* Key Findings */}
        <Section>
          <SectionLabel>Key Findings — Ramp vs Brex vs Expensify (Demo)</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                num: '01',
                heading: 'Brex leads Ramp by 16 points in AI share-of-voice (58% vs 42%)',
                body: 'The gap is largest in problem-first prompts, where Brex is mentioned 2.3× more often, suggesting stronger entity associations around pain-point language.',
              },
              {
                num: '02',
                heading: "Ramp's category-general visibility is 4× lower than its brand-named visibility (24% vs 96%)",
                body: "Typical for brands with strong direct awareness but weak presence in AI's organic discovery layer.",
              },
              {
                num: '03',
                heading: 'GPT-4o Mini and Claude Haiku disagree most on "recommended as top pick" (22% vs 12%)',
                body: "A 10-point cross-model discrepancy signals that Ramp's positioning is inconsistent in the training data these models draw from.",
              },
              {
                num: '04',
                heading: '64% positive sentiment in AI responses',
                body: 'Strong brand health. Primary negative signal: customer support responsiveness and travel feature gaps. These are addressable via structured review signals and updated schema markup.',
              },
            ].map(({ num, heading, body }) => (
              <FindingCard key={num} num={num} heading={heading} body={body} />
            ))}
          </div>
        </Section>

        {/* AEO 2.0 */}
        <Section amber>
          <SectionLabel amber>Agent Engine Optimization: What Happens When AI Buys for You</SectionLabel>
          <p style={prose}>
            The current AEO conversation is about AI-powered search: will ChatGPT mention my brand?
            AEO 2.0 is about something more consequential: will an AI agent{' '}
            <em style={{ color: '#F1F5F9' }}>select</em> my brand when executing a purchase
            autonomously?
          </p>
          <p style={{ ...prose, marginTop: 16 }}>
            AEO Studio's Agent Simulation module sends a structured procurement task to an LLM —
            "You are a procurement AI for a 200-person company. Evaluate all expense management
            solutions and make a selection" — and parses the step-by-step elimination trace. The
            result is a 6-criteria Agent Readiness Scorecard: a diagnostic of how legible a brand
            is to an AI agent operating without a human in the loop.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, margin: '20px 0' }}>
            {[
              'Schema markup & structured data',
              'Real-time pricing availability',
              'Feature availability & freshness',
              'Review trust signal density',
              'Checkout/procurement integration',
              'Product identifiers (GTIN/SKU equivalents)',
            ].map((c) => (
              <div key={c} style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#94A3B8',
              }}>
                <span style={{ color: '#F59E0B', marginRight: 8 }}>◈</span>{c}
              </div>
            ))}
          </div>
          <p style={prose}>
            Ramp scores 74/100 on Agent Readiness — strong on pricing clarity and review density,
            but scoring near-zero on autonomous checkout integration. As agentic commerce scales from
            prototype to mainstream, this gap will matter more than any SEO ranking.
          </p>
        </Section>

        {/* What I'd Build Next */}
        <Section>
          <SectionLabel>What I'd Build Next</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Multi-run drift tracking: compare brand visibility month-over-month as AI training data updates',
              'Agent correction portal: when an AI misrepresents a brand, surface the exact response and provide a structured correction pathway to update training signals',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #1F2937' }}>
                <span style={{ color: '#4B5563', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, paddingTop: 2, flexShrink: 0 }}>
                  0{i + 1}
                </span>
                <span style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ children, amber }) {
  return (
    <div style={{
      background: amber ? 'rgba(245,158,11,0.04)' : '#1E293B',
      border: `1px solid ${amber ? 'rgba(245,158,11,0.2)' : '#334155'}`,
      borderRadius: 12,
      padding: '28px 32px',
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
    <div style={{
      background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10,
      padding: '20px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 700,
        color: '#3B82F6', lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: '#4B5563', marginTop: 8 }}>{label}</div>
    </div>
  );
}

function FindingCard({ num, heading, body }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '16px',
      background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
        color: '#3B82F6', flexShrink: 0, paddingTop: 2, width: 24,
      }}>{num}</div>
      <div>
        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 6, lineHeight: 1.4 }}>{heading}</div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

function ArchFlow() {
  const nodes = [
    { label: 'React SPA', sub: 'Vercel CDN', color: '#3B82F6' },
    { label: 'Express Backend', sub: 'Railway', color: '#8B5CF6' },
    { label: 'OpenRouter API', sub: 'GPT-4o Mini + Claude Haiku', color: '#22C55E' },
    { label: 'SQLite', sub: 'better-sqlite3', color: '#F59E0B' },
    { label: '6 SQL Queries', sub: 'GROUP BY · JOIN · window', color: '#94A3B8' },
    { label: 'Dashboard + PDF', sub: 'React + jsPDF', color: '#3B82F6' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: '#0F172A', border: `1px solid ${node.color}30`,
            borderRadius: 8, padding: '10px 14px', textAlign: 'center',
            borderTop: `2px solid ${node.color}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{node.label}</div>
            <div style={{ fontSize: 11, color: '#4B5563', marginTop: 3 }}>{node.sub}</div>
          </div>
          {i < nodes.length - 1 && (
            <div style={{ color: '#334155', fontSize: 18, padding: '0 6px' }}>→</div>
          )}
        </div>
      ))}
    </div>
  );
}

const prose = {
  fontSize: 14, color: '#94A3B8', lineHeight: 1.75, margin: 0,
};

const th = {
  textAlign: 'left', padding: '10px 12px', color: '#4B5563',
  fontSize: 12, fontWeight: 600,
};

const td = {
  padding: '12px', color: '#94A3B8', fontSize: 13, verticalAlign: 'top',
};
