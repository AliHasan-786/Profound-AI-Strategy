export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 32px', gap: 12, textAlign: 'center',
    }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#EF4444' }}>Error</div>
      <div style={{ fontSize: 14, color: '#94A3B8', maxWidth: 360 }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{
          marginTop: 8, background: '#1E293B', border: '1px solid #334155',
          color: '#F1F5F9', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer',
        }}>
          Retry
        </button>
      )}
    </div>
  );
}
