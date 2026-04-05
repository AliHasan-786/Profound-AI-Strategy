export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #1F2937',
    }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
