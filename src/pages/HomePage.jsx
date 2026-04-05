import PageHeader from '../components/layout/PageHeader';
import BrandSetupForm from '../components/setup/BrandSetupForm';

export default function HomePage() {
  return (
    <div>
      <PageHeader
        title="AEO Studio"
        subtitle="AI Brand Visibility & Agent Engine Optimization Analyzer"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Left: Form */}
        <div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>
              Run an AI Visibility Analysis
            </h2>
            <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6 }}>
              Enter your brand and we'll send 100+ structured prompts to GPT-4o and Claude,
              then analyze where you appear, how you're framed, and how you stack up against competitors.
            </p>
          </div>
          <BrandSetupForm />
        </div>

        {/* Right: How it works */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            How it works
          </div>

          {[
            {
              step: '01',
              title: '100+ Structured Prompts',
              desc: '4 prompt types: brand-named, category-general, competitor-comparison, and problem-first — mirroring how AI strategists actually run analyses.',
              color: '#3B82F6',
            },
            {
              step: '02',
              title: 'Dual-Model Analysis',
              desc: 'Every prompt runs on GPT-4o and Claude 3.5 Sonnet. Cross-model discrepancies > 15pts are flagged automatically.',
              color: '#8B5CF6',
            },
            {
              step: '03',
              title: 'SQL-Powered Analytics',
              desc: 'Results stored in SQLite. Mention rate, share-of-voice, co-mention matrix, and sentiment — all computed with GROUP BY queries.',
              color: '#22C55E',
            },
            {
              step: '04',
              title: 'B2A Agent Simulation',
              desc: 'See if an AI agent selects your brand when completing a purchase. Step-by-step decision trace with Agent Readiness Scorecard.',
              color: '#F59E0B',
            },
          ].map(({ step, title, desc, color }) => (
            <div key={step} style={{
              display: 'flex', gap: 16, padding: '16px', background: '#1E293B',
              border: '1px solid #334155', borderRadius: 10,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                color, width: 28, flexShrink: 0, paddingTop: 1,
              }}>
                {step}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8,
          }}>
            {[
              { val: '100+', label: 'prompts per run' },
              { val: '2', label: 'AI models' },
              { val: '6', label: 'SQL analytics' },
            ].map(({ val, label }) => (
              <div key={label} style={{
                background: '#111827', border: '1px solid #1F2937', borderRadius: 8,
                padding: '14px', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700,
                  color: '#3B82F6',
                }}>{val}</div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
