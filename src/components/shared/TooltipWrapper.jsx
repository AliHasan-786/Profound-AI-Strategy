import { useState } from 'react';

export default function TooltipWrapper({ children, tip }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && tip && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 8, width: 220, zIndex: 100,
          background: '#0F172A', border: '1px solid #334155', borderRadius: 8,
          padding: '10px 12px', fontSize: 12, color: '#94A3B8', lineHeight: 1.5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)', pointerEvents: 'none',
        }}>
          {tip}
        </div>
      )}
    </div>
  );
}
