import { useState } from 'react';

export default function MetricCard({ label, value, subtext, tooltip, color, variant }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div style={{
      background: '#1E293B', border: '1px solid #334155', borderRadius: 12,
      padding: '20px 24px', position: 'relative',
      borderTop: color ? `3px solid ${color}` : '3px solid #334155',
      transition: 'background 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 600,
            color: color || '#F1F5F9', letterSpacing: '-1px', lineHeight: 1,
          }}>
            {value}
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 8, fontWeight: 500 }}>{label}</div>
          {subtext && <div style={{ fontSize: 12, color: '#4B5563', marginTop: 4 }}>{subtext}</div>}
        </div>

        {tooltip && (
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              style={{
                background: 'none', border: '1px solid #334155', borderRadius: '50%',
                width: 22, height: 22, fontSize: 11, color: '#4B5563', cursor: 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >ℹ</button>
            {showTip && (
              <div style={{
                position: 'absolute', right: 0, top: 28, width: 240, zIndex: 50,
                background: '#0F172A', border: '1px solid #334155', borderRadius: 8,
                padding: '12px 14px', fontSize: 13, color: '#94A3B8', lineHeight: 1.5,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
