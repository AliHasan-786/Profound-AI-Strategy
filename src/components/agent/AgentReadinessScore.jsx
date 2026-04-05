const STATUS_CONFIG = {
  present:      { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   label: 'Present',       icon: '✓' },
  partial:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Partial',       icon: '~' },
  missing:      { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Missing',       icon: '✗' },
  manual_check: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Manual Check',  icon: '?' },
};

export default function AgentReadinessScore({ scores, brandName }) {
  if (!scores?.length) return null;

  const scored = scores.filter((s) => s.status !== 'manual_check');
  const passing = scored.filter((s) => s.status === 'present').length;
  const total = scores.length;
  const pct = total > 0 ? Math.round((passing / total) * 100) : 0;

  const scoreColor = pct >= 67 ? '#22C55E' : pct >= 33 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16 }}>
            Agent Readiness Scorecard
          </div>
          <div style={{ fontSize: 13, color: '#4B5563', marginTop: 3 }}>
            Is {brandName || 'your brand'}'s data structured for AI agent selection?
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700,
            color: scoreColor, lineHeight: 1,
          }}>
            {passing}<span style={{ fontSize: 20, color: '#4B5563' }}>/{total}</span>
          </div>
          <div style={{ fontSize: 11, color: '#4B5563', marginTop: 4 }}>criteria met</div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: 6, background: '#0F172A', borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: scoreColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>

      {/* Criteria list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {scores.map((criterion) => {
          const cfg = STATUS_CONFIG[criterion.status] || STATUS_CONFIG.manual_check;
          return (
            <div key={criterion.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 14px',
              background: '#0F172A', borderRadius: 8, border: '1px solid #1F2937',
            }}>
              {/* Status badge */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: cfg.color,
              }}>
                {cfg.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>{criterion.label}</span>
                  <span style={{
                    fontSize: 11, padding: '1px 8px', borderRadius: 20,
                    background: cfg.bg, color: cfg.color, fontWeight: 600,
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#4B5563' }}>{criterion.description}</div>
                {criterion.note && criterion.note !== 'Manual verification required' && (
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontStyle: 'italic' }}>
                    {criterion.note}
                  </div>
                )}
                {criterion.status === 'manual_check' && (
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>
                    Requires manual site audit — cannot be determined from agent response alone
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div style={{
        marginTop: 20, padding: '14px 16px', background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, fontSize: 13, color: '#6B7280',
      }}>
        <span style={{ color: '#F59E0B', fontWeight: 600 }}>AEO 2.0 insight: </span>
        Brands that standardize, structure, and expose clear data will be preferred by agents over brands relying on branding and UX.
        AI agents don't experience your website — they query your data.
      </div>
    </div>
  );
}
