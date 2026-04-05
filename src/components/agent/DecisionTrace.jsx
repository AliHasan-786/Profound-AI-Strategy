export default function DecisionTrace({ trace, brandName }) {
  if (!trace) return null;

  const { steps, finalSelection, primaryBrandConsidered, primaryBrandSelected, primaryBrandEliminatedAtStep } = trace;
  const hasBrand = !!brandName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Outcome banner */}
      {hasBrand && (
        <div style={{
          background: primaryBrandSelected
            ? 'rgba(34,197,94,0.1)'
            : primaryBrandConsidered
            ? 'rgba(245,158,11,0.1)'
            : 'rgba(239,68,68,0.1)',
          border: `1px solid ${primaryBrandSelected ? 'rgba(34,197,94,0.3)' : primaryBrandConsidered ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 12, padding: '20px 24px',
        }}>
          <div style={{
            fontSize: 22, fontWeight: 700,
            color: primaryBrandSelected ? '#22C55E' : primaryBrandConsidered ? '#F59E0B' : '#EF4444',
            letterSpacing: '-0.5px',
          }}>
            {primaryBrandSelected
              ? `✓ ${brandName} WAS SELECTED`
              : primaryBrandConsidered
              ? `⚠ ${brandName} was considered but not selected`
              : `✗ ${brandName} WAS NOT SELECTED`}
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>
            {primaryBrandSelected
              ? `The AI agent chose ${brandName} as its final recommendation.`
              : primaryBrandConsidered
              ? `${brandName} appeared in the agent's consideration set but was eliminated${primaryBrandEliminatedAtStep ? ` at step ${primaryBrandEliminatedAtStep}` : ''}.`
              : `${brandName} did not appear in the agent's decision process. This is an agent visibility gap.`}
          </div>
          {finalSelection && (
            <div style={{ marginTop: 10, fontSize: 14, color: '#94A3B8' }}>
              Final selection: <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{finalSelection}</span>
            </div>
          )}
        </div>
      )}

      {/* Step timeline */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 20 }}>
          Agent Decision Trace
        </div>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 19, top: 0, bottom: 0,
            width: 2, background: '#1F2937', zIndex: 0,
          }} />

          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={step.step} style={{ display: 'flex', gap: 16, marginBottom: isLast ? 0 : 24, position: 'relative', zIndex: 1 }}>
                {/* Step number circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: isLast ? (primaryBrandSelected ? '#22C55E' : '#1E293B') : '#1E293B',
                  border: `2px solid ${isLast ? (primaryBrandSelected ? '#22C55E' : '#334155') : '#334155'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
                  color: isLast ? (primaryBrandSelected ? '#22C55E' : '#94A3B8') : '#6B7280',
                }}>
                  {step.step}
                </div>

                {/* Step content */}
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>
                    {step.action}
                  </div>

                  {/* Brands in consideration set */}
                  {step.brandsConsidered?.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, marginRight: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Considering
                      </span>
                      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {step.brandsConsidered.map((b) => (
                          <span key={b} style={{
                            fontSize: 12, padding: '3px 10px', borderRadius: 20,
                            background: b === brandName ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                            color: b === brandName ? '#3B82F6' : '#94A3B8',
                            border: `1px solid ${b === brandName ? 'rgba(59,130,246,0.3)' : '#1F2937'}`,
                            fontWeight: b === brandName ? 600 : 400,
                          }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Eliminated brands */}
                  {step.eliminated?.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, marginRight: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Eliminated
                      </span>
                      <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {step.eliminated.map((b) => (
                          <span key={b} style={{
                            fontSize: 12, padding: '3px 10px', borderRadius: 20,
                            background: 'rgba(239,68,68,0.08)',
                            color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)',
                            textDecoration: 'line-through', opacity: 0.8,
                          }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  {step.reason && (
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginTop: 4, paddingLeft: 1 }}>
                      {step.reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
