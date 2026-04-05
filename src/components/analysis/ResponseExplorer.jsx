import { useState } from 'react';

const MODEL_COLORS = {
  'gpt-4o': { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' },
  'claude-3-5-sonnet': { bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6' },
};

const PROMPT_TYPE_COLORS = {
  brand_named: '#3B82F6',
  category_general: '#F59E0B',
  competitor_comparison: '#8B5CF6',
  problem_first: '#22C55E',
};

function highlightBrands(text, brands) {
  if (!brands?.length) return text;
  const regex = new RegExp(`(${brands.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', borderRadius: 2, padding: '0 2px' }}>
        {part}
      </mark>
    ) : part
  );
}

export default function ResponseExplorer({ responses, brandName }) {
  const [expanded, setExpanded] = useState(null);

  if (!responses?.length) return null;

  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
      <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 16 }}>
        Response Explorer
        <span style={{ marginLeft: 10, fontSize: 13, color: '#4B5563', fontWeight: 400 }}>
          Brand mentions highlighted in amber
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {responses.map((r, i) => {
          const brands = JSON.parse(r.brands_mentioned || '[]');
          const model = MODEL_COLORS[r.model] || { bg: '#1F2937', text: '#94A3B8' };
          const isOpen = expanded === i;

          return (
            <div key={r.id || i} style={{ border: '1px solid #1F2937', borderRadius: 8, overflow: 'hidden' }}>
              {/* Row header */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: isOpen ? '#0F172A' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderBottom: isOpen ? '1px solid #1F2937' : 'none',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, background: model.bg, color: model.text, padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>
                  {r.model === 'gpt-4o' ? 'GPT-4o' : 'Claude'}
                </span>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: r.brand_mentioned ? '#22C55E' : '#334155',
                }} />
                <span style={{ fontSize: 13, color: '#94A3B8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.prompt_text}
                </span>
                <span style={{
                  fontSize: 11, color: '#4B5563', flexShrink: 0,
                  borderLeft: `2px solid ${PROMPT_TYPE_COLORS[r.prompt_type] || '#334155'}`,
                  paddingLeft: 8,
                }}>
                  {r.prompt_type?.replace(/_/g, ' ')}
                </span>
                <span style={{ color: '#4B5563', fontSize: 14, flexShrink: 0 }}>{isOpen ? '▴' : '▾'}</span>
              </button>

              {/* Expanded response */}
              {isOpen && (
                <div style={{ padding: '14px 16px', background: '#0F172A' }}>
                  <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>
                    {highlightBrands(r.response_text, brands)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {brands.map((b) => (
                      <span key={b} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4,
                        background: b === brandName ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.1)',
                        color: b === brandName ? '#F59E0B' : '#3B82F6',
                      }}>{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
