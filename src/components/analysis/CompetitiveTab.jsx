import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const BRAND_COLORS = ['#3B82F6', '#8B5CF6', '#6B7280', '#4B5563'];

export default function CompetitiveTab({ results }) {
  const { competitiveShareOfVoice, coMentionMatrix, run } = results;
  const brandName = run?.brand_name || 'Your Brand';

  // Find biggest gap
  const primary = competitiveShareOfVoice.find((b) => b.brand === brandName);
  const leader = competitiveShareOfVoice[0];
  const gap = leader && primary ? Math.round((leader.pct - primary.pct) * 10) / 10 : 0;
  const isLeader = leader?.brand === brandName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Biggest Gap insight */}
      <div style={{
        background: isLeader ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${isLeader ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: 10, padding: '14px 18px',
      }}>
        {isLeader ? (
          <div>
            <span style={{ fontWeight: 700, color: '#22C55E', fontSize: 15 }}>
              {brandName} leads share-of-voice
            </span>
            <span style={{ color: '#6B7280', fontSize: 13, marginLeft: 8 }}>
              at {primary?.pct}% across all prompts tested.
            </span>
          </div>
        ) : (
          <div>
            <span style={{ fontWeight: 700, color: '#EF4444', fontSize: 15 }}>
              {gap}pt share-of-voice gap vs {leader?.brand}
            </span>
            <span style={{ color: '#6B7280', fontSize: 13, marginLeft: 8 }}>
              {leader?.brand} ({leader?.pct}%) vs {brandName} ({primary?.pct}%). Close this gap by securing more
              mentions in authoritative industry lists, comparison articles, and high-citation Reddit communities.
            </span>
          </div>
        )}
      </div>

      {/* Share-of-Voice horizontal bar chart */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16 }}>Competitive Share of Voice</div>
          <div style={{ color: '#4B5563', fontSize: 13, marginTop: 4 }}>
            % of all tested prompts where each brand was mentioned by either model
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {competitiveShareOfVoice.map((brand, i) => (
            <div key={brand.brand}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 14, fontWeight: brand.brand === brandName ? 700 : 500,
                  color: brand.brand === brandName ? '#F1F5F9' : '#94A3B8',
                }}>
                  {brand.brand}
                  {brand.brand === brandName && (
                    <span style={{
                      marginLeft: 8, fontSize: 11, color: '#3B82F6',
                      background: 'rgba(59,130,246,0.1)', padding: '1px 6px', borderRadius: 4,
                    }}>you</span>
                  )}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600,
                  color: BRAND_COLORS[i] || '#6B7280',
                }}>
                  {brand.pct}%
                </span>
              </div>
              <div style={{ height: 10, background: '#0F172A', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${brand.pct}%`,
                  background: BRAND_COLORS[i] || '#6B7280', borderRadius: 5,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Co-mention Matrix */}
      {coMentionMatrix && coMentionMatrix.length > 0 && (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16 }}>Co-Mention Matrix</div>
            <div style={{ color: '#4B5563', fontSize: 13, marginTop: 4 }}>
              When AI mentions a competitor, how often does it also mention {brandName}?
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>
                  When AI mentions...
                </th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#22C55E', fontSize: 12, fontWeight: 600 }}>GPT-4o Mini</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#8B5CF6', fontSize: 12, fontWeight: 600 }}>Claude Haiku</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#4B5563', fontSize: 12, fontWeight: 600 }}>Overall</th>
              </tr>
            </thead>
            <tbody>
              {coMentionMatrix.map((row) => (
                <tr key={row.competitor} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px', color: '#94A3B8', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: '#F1F5F9' }}>{row.competitor}</span>
                    <span style={{ color: '#4B5563', marginLeft: 6, fontSize: 12 }}>
                      (also mentions {brandName}...)
                    </span>
                  </td>
                  {row.byModel.map((m) => (
                    <td key={m.model} style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600,
                        color: m.pct >= 50 ? '#22C55E' : m.pct >= 30 ? '#F59E0B' : '#EF4444',
                      }}>
                        {m.pct}%
                      </span>
                      <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>
                        {m.coMentions}/{m.total}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700,
                      color: row.pct >= 50 ? '#22C55E' : row.pct >= 30 ? '#F59E0B' : '#EF4444',
                    }}>
                      {row.pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
