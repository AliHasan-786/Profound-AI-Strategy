import PageHeader from '../components/layout/PageHeader';

export default function PMPage() {
  return (
    <div>
      <PageHeader
        title="PM Artifacts"
        subtitle="Product specification, A/B experiment design, and research synthesis"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* PRD */}
        <Section title="Product Requirements Document (PRD)" accent="#3B82F6">
          <Field label="Product Name" value="AEO Studio — AI Brand Visibility & Agent Engine Optimization Analyzer" />
          <Field label="Version" value="1.0 — MVP" />
          <Field label="Status" value="Approved for Build" />
          <Field label="Author" value="Ali Hasan" />

          <Divider />

          <SubSection title="Problem Statement">
            Digital marketing strategists and brand managers have invested in SEO and content marketing
            but have no visibility into whether their brand surfaces in AI-generated answers.
            In 18–24 months, the problem compounds: AI agents completing purchase tasks will skip brands
            whose product data isn't machine-readable — not because of a citation gap,
            but because the brand isn't structured for agent decision criteria.
          </SubSection>

          <SubSection title="User Personas">
            <PersonaCard
              name="Alex — Digital Marketing Strategist"
              exp="4–6 years B2B SaaS"
              goal={"Success state: \"Here's our AI visibility score vs. competitors, here's where we're losing, here's the one action to take first.\""}
              isPrimary
            />
            <PersonaCard
              name="Jordan — Head of Growth / VP Marketing"
              exp="8–12 years"
              goal="Lost enterprise deals because prospects couldn't find them on ChatGPT. Needs strategic assessment for board meeting."
            />
          </SubSection>

          <SubSection title="RICE Prioritization">
            <RiceTable />
          </SubSection>

          <SubSection title="Core User Stories">
            {[
              { epic: 'Brand Analysis Setup', story: 'As Alex, I want to enter brand + category + competitors and see prompt-by-prompt progress during the ~90s analysis run.' },
              { epic: 'Visibility Dashboard', story: 'Overall mention rate by model, cross-model discrepancy alert (>15pt gap), response explorer with brand highlights in amber.' },
              { epic: 'Competitive Analysis', story: 'Share-of-voice for all 4 brands. Co-mention matrix: "When AI mentions Competitor X, how often does it also mention my brand?" Competitive gap auto-summary.' },
              { epic: 'Agent Engine Optimization', story: 'Select agentic task scenario (hotel booking, software procurement). View step-by-step agent decision trace. See brand selection outcome prominently.' },
              { epic: 'Export', story: 'AI Visibility Audit PDF — one-page CMO-ready brief. Filename: [Brand]_AI_Visibility_Audit_[Date].pdf' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #1F2937' }}>
                <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.epic}</div>
                <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>{s.story}</div>
              </div>
            ))}
          </SubSection>

          <SubSection title="Success Metrics">
            <MetricRow label="Analysis completion rate" target="> 60%" type="primary" />
            <MetricRow label="B2A module engagement" target="> 30% of completers" type="secondary" />
            <MetricRow label="PDF export rate" target="> 20%" type="secondary" />
            <MetricRow label="API cost per session" target="< $0.50" type="guardrail" />
          </SubSection>

          <SubSection title="Scope — In vs. Out for MVP">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <ScopeList label="In Scope" color="#22C55E" items={[
                'Brand input → multi-platform query engine → SQLite storage → analysis dashboard',
                'B2A Agent Simulation (one scenario; decision trace; readiness scorecard)',
                'AI Visibility Audit PDF (client-side, print-optimized)',
                'PM Artifacts tab with embedded PRD and A/B experiment',
                'Demo mode (Ramp/Brex/Expensify — no API keys required)',
              ]} />
              <ScopeList label="V2 Backlog" color="#4B5563" items={[
                'User accounts + saved analysis history',
                'Citation drift tracking across sessions',
                'Real schema markup scanning (requires site crawling)',
                'Real-time pricing data for agent simulation',
                'Perplexity API integration',
              ]} />
            </div>
          </SubSection>
        </Section>

        {/* A/B Experiment */}
        <Section title="A/B Experiment Design" accent="#8B5CF6">
          <Field label="Decision Under Test" value="Progressive prompt stream vs. simple loading spinner during 90-second analysis run" />

          <SubSection title="Hypothesis">
            Progressive disclosure (Treatment) reduces abandonment during the wait because it educates users
            about methodology — showing which prompts are running builds trust and makes the wait feel productive.
            A simple spinner (Control) is cognitively opaque.
          </SubSection>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
            <VariantCard
              label="Control"
              color="#4B5563"
              items={['Simple loading spinner', 'No prompt visibility', 'Baseline behavior']}
            />
            <VariantCard
              label="Treatment"
              color="#8B5CF6"
              items={[
                'Live prompt stream with model badges',
                'Framer Motion staggered animation',
                'Progress bar + estimated time remaining',
              ]}
              isActive
            />
          </div>

          <MetricRow label="Primary: Analysis completion rate" target="≥ 10% lift" type="primary" />
          <MetricRow label="Secondary: B2A module engagement rate" target="Directional improvement" type="secondary" />
          <MetricRow label="Guardrail: Bounce rate before first result tab" target="< 40%" type="guardrail" />

          <SubSection title="Why This Matters for Profound">
            This experiment tests the fundamental product design tension Profound faces: show HOW the analysis
            works (transparent methodology = trust) vs. just showing results (simpler = faster to value).
            The hypothesis is that for an AI strategy tool — where users are trying to understand an opaque system —
            transparency is itself a feature, not friction.
          </SubSection>
        </Section>

        {/* Research Synthesis */}
        <Section title="Research Synthesis — 8 Pain Points" accent="#22C55E">
          {[
            {
              num: '01', title: 'Brand Invisible to AI Despite Google Success',
              stat: '30–40% of brands with strong Google rankings are completely invisible to AI search',
              source: 'HackerNews / Shopify stores study',
            },
            {
              num: '02', title: 'Inconsistency Makes Metrics Unreliable',
              stat: 'Same brand list appears < 1% of the time across repeated runs of the same prompt',
              source: 'SparkToro — 2,961 prompts, 600 participants',
            },
            {
              num: '03', title: 'Hallucination Rate — No Correction Portal',
              stat: '9.2% hallucination rate on brand facts. AI hallucinations cost brands $67.4B in 2024',
              source: 'Mersel.ai hallucination study',
            },
            {
              num: '04', title: 'Citation Drift — 60% Monthly Volatility',
              stat: 'ChatGPT citations change by up to 60% in one month. Google AI Overviews: 59.3% drift',
              source: 'Profound — 680M citations analyzed',
            },
            {
              num: '05', title: 'Multi-Platform Conflicts',
              stat: 'A brand accurate in Perplexity may be misrepresented in Gemini. Each model sources differently',
              source: 'TrySight.ai / Profound research',
            },
            {
              num: '06', title: 'Traditional SEO Has Near-Zero Influence',
              stat: 'Backlinks and domain authority have near-zero influence on AI recommendations',
              source: 'Onely.com — ChatGPT decision hierarchy study',
            },
            {
              num: '07', title: 'Reddit Is the Primary AI Visibility Lever',
              stat: 'Reddit leads with 2.4% of ChatGPT social citations — 2.4x more than any other social platform',
              source: 'Profound — 700K ChatGPT social citations',
            },
            {
              num: '08', title: 'Entity Recognition Failure = Invisibility',
              stat: 'Pages with complete Product + AggregateRating schema get indexed 3.1x faster',
              source: 'Microsoft / StrideDC research (March 2025)',
            },
          ].map(({ num, title, stat, source }) => (
            <div key={num} style={{
              display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #1F2937',
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
                color: '#22C55E', width: 28, flexShrink: 0, paddingTop: 2,
              }}>{num}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4, lineHeight: 1.5 }}>{stat}</div>
                <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>Source: {source}</div>
              </div>
            </div>
          ))}

          {/* B2A stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { val: '520%', label: 'AI-assisted shopping growth (2025 holiday)' },
              { val: '73%', label: 'Consumers using AI in purchase journey (Q1 2026)' },
              { val: '25–30%', label: 'US purchases involving AI agent (Q1 2026)' },
              { val: '90%', label: 'B2B purchases AI-intermediated by 2028 (Gartner)' },
            ].map(({ val, label }) => (
              <div key={val} style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 10, padding: '16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>{val}</div>
                <div style={{ fontSize: 11, color: '#4B5563', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* JD Keyword Map */}
        <Section title="JD Alignment Map" accent="#F59E0B">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '10px 0', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>Feature Built</th>
                <th style={{ textAlign: 'left', padding: '10px 0', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>JD Keywords Demonstrated</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Multi-platform LLM query engine', 'Large Language Models (LLMs) · AI-powered search · AI discovery'],
                ['SQLite + SQL analytics', 'SQL · large-scale datasets · unstructured data'],
                ['Mention rate by prompt type', 'classify / cluster / synthesize · prompt patterns'],
                ['Cross-model visibility dashboard', 'analytics dashboard · brand visibility'],
                ['Competitive share-of-voice', 'data analysis · Fortune 500 clients'],
                ['AI Visibility Audit PDF', 'client-facing · strategic clarity · executive reporting'],
                ['Agent Simulation + Readiness Scorecard', 'AI strategy · high ownership · edge cases'],
                ['Built with Claude Code + React/Node', 'Cursor · Claude Code (explicit Profound hiring signal)'],
              ].map(([feature, keywords]) => (
                <tr key={feature} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px 0', fontSize: 14, color: '#F1F5F9', fontWeight: 500 }}>{feature}</td>
                  <td style={{ padding: '12px 0', fontSize: 13, color: '#4B5563' }}>{keywords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  );
}

// Sub-components
function Section({ title, accent, children }) {
  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '18px 24px', borderBottom: '1px solid #334155',
        borderLeft: `4px solid ${accent}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>{title}</h2>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #1F2937', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#4B5563', fontWeight: 600, minWidth: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#F1F5F9' }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#1F2937', margin: '16px 0' }} />;
}

function PersonaCard({ name, exp, goal, isPrimary }) {
  return (
    <div style={{
      background: '#0F172A', borderRadius: 8, padding: '14px 16px', marginBottom: 10,
      borderLeft: `3px solid ${isPrimary ? '#3B82F6' : '#334155'}`,
    }}>
      <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>
        {name}
        {isPrimary && <span style={{ marginLeft: 8, fontSize: 11, color: '#3B82F6', background: 'rgba(59,130,246,0.1)', padding: '1px 7px', borderRadius: 4 }}>Primary</span>}
      </div>
      <div style={{ fontSize: 12, color: '#4B5563', margin: '4px 0' }}>{exp}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{goal}</div>
    </div>
  );
}

function RiceTable() {
  const rows = [
    ['Brand input + LLM query engine', '10', '10', '9', '6', '150', 'CORE'],
    ['Visibility analysis dashboard', '10', '9', '9', '5', '162', 'CORE'],
    ['Competitive share-of-voice', '9', '9', '8', '4', '162', 'CORE'],
    ['Sentiment analysis layer', '8', '7', '7', '5', '78', 'CORE'],
    ['Agent Simulation (B2A)', '6', '10', '7', '7', '60', 'DIFFERENTIATOR'],
    ['AI Visibility Audit PDF', '7', '8', '8', '4', '112', 'CORE'],
    ['Perplexity API', '4', '6', '5', '4', '30', 'Stretch'],
  ];
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #334155' }}>
          {['Feature', 'R', 'I', 'C', 'E', 'Score', 'Decision'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([feature, r, i, c, e, score, decision]) => (
          <tr key={feature} style={{ borderBottom: '1px solid #1F2937' }}>
            <td style={{ padding: '10px 0', color: '#F1F5F9' }}>{feature}</td>
            <td style={{ padding: '10px 0', color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>{r}</td>
            <td style={{ padding: '10px 0', color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>{i}</td>
            <td style={{ padding: '10px 0', color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>{c}</td>
            <td style={{ padding: '10px 0', color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>{e}</td>
            <td style={{ padding: '10px 0', color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{score}</td>
            <td style={{ padding: '10px 0', color: decision === 'DIFFERENTIATOR' ? '#F59E0B' : decision === 'Stretch' ? '#4B5563' : '#22C55E', fontWeight: 600 }}>{decision}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricRow({ label, target, type }) {
  const colors = { primary: '#3B82F6', secondary: '#94A3B8', guardrail: '#EF4444' };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1F2937' }}>
      <span style={{ fontSize: 13, color: '#94A3B8' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: colors[type], marginRight: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{type}</span>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace' }}>{target}</span>
    </div>
  );
}

function VariantCard({ label, color, items, isActive }) {
  return (
    <div style={{
      background: isActive ? `${color}10` : '#0F172A',
      border: `1px solid ${isActive ? color + '40' : '#1F2937'}`,
      borderRadius: 10, padding: '16px',
    }}>
      <div style={{ fontWeight: 700, color: isActive ? color : '#4B5563', fontSize: 14, marginBottom: 12 }}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: '#6B7280', marginBottom: 6, paddingLeft: 14, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, color: isActive ? color : '#374151' }}>•</span>
          {item}
        </div>
      ))}
    </div>
  );
}

function ScopeList({ label, color, items }) {
  return (
    <div>
      <div style={{ fontWeight: 700, color, fontSize: 13, marginBottom: 10 }}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 13, color: '#6B7280', marginBottom: 7, paddingLeft: 16, position: 'relative', lineHeight: 1.5 }}>
          <span style={{ position: 'absolute', left: 0, color }}>•</span>
          {item}
        </div>
      ))}
    </div>
  );
}
