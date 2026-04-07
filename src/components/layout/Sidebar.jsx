import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Setup', icon: '⬡', exact: true },
  { path: '/analysis', label: 'Analysis', icon: '▦' },
  { path: '/agent-sim', label: 'Agent Sim', icon: '◈', accent: true },
  { path: '/case-study', label: 'Case Study', icon: '◻' },
];

export default function Sidebar() {
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 220,
      background: '#111827', borderRight: '1px solid #1F2937',
      display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff',
          }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#F1F5F9', letterSpacing: '-0.3px' }}>AEO Studio</div>
            <div style={{ fontSize: 11, color: '#4B5563' }}>AI Visibility Analyzer</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon, exact, accent }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 4,
              textDecoration: 'none', transition: 'background 0.15s',
              background: isActive ? (accent ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)') : 'transparent',
              color: isActive ? (accent ? '#F59E0B' : '#3B82F6') : '#94A3B8',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
            })}
          >
            <span style={{ fontSize: 16, opacity: 0.8 }}>{icon}</span>
            {label}
            {accent && (
              <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                color: '#F59E0B', background: 'rgba(245,158,11,0.15)',
                padding: '1px 6px', borderRadius: 4,
              }}>B2A</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1F2937' }}>
        <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>
          <div style={{ color: '#4B5563', fontWeight: 500 }}>Built by Ali Hasan</div>
        </div>
      </div>
    </aside>
  );
}
