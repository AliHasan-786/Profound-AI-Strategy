export default function EmptyState({ title = 'No data yet', message, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '64px 32px', gap: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, opacity: 0.3 }}>◻</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>{title}</div>
      {message && <div style={{ fontSize: 14, color: '#4B5563', maxWidth: 360 }}>{message}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
