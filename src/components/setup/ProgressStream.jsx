import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MODEL_COLORS = {
  'gpt-4o': '#22C55E',
  'claude-3-5-sonnet': '#8B5CF6',
};

export default function ProgressStream({ runId, isDemo, onComplete }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState({ completed: 0, total: 0, current: '' });
  const [done, setDone] = useState(false);
  const esRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isDemo) {
      // Demo is already complete — call onComplete immediately
      setTimeout(() => onComplete(runId), 800);
      return;
    }

    const es = new EventSource(`${API}/api/analysis/${runId}/stream`);
    esRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'status') {
        setStatus({ completed: data.completedPrompts, total: data.totalPrompts, current: '' });
        if (data.status === 'complete') {
          setDone(true);
          onComplete(runId);
          es.close();
        }
      } else if (data.type === 'progress') {
        setStatus({ completed: data.completedPrompts, total: data.totalPrompts, current: data.currentPrompt });
        setEvents((prev) => [
          { id: data.completedPrompts, prompt: data.currentPrompt, model: data.model },
          ...prev.slice(0, 49),
        ]);
      } else if (data.type === 'complete') {
        setDone(true);
        onComplete(runId);
        es.close();
      }
    };

    es.onerror = () => {
      // Fallback to polling
      es.close();
      startPolling();
    };

    return () => { es.close(); };
  }, [runId, isDemo]);

  function startPolling() {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/analysis/${runId}/status`);
        const data = await res.json();
        setStatus({ completed: data.completedPrompts, total: data.totalPrompts, current: data.currentPrompt || '' });
        if (data.status === 'complete') {
          clearInterval(interval);
          setDone(true);
          onComplete(runId);
        }
      } catch (_) {}
    }, 1500);
    return () => clearInterval(interval);
  }

  const pct = status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0;

  if (isDemo) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#94A3B8' }}>Loading pre-cached demo results...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: '#94A3B8' }}>
            {done ? 'Analysis complete' : `Running prompts...`}
          </span>
          <span style={{ color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {status.completed} / {status.total}
          </span>
        </div>
        <div style={{ height: 6, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#3B82F6', borderRadius: 3,
            width: `${pct}%`, transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Prompt stream */}
      <div style={{
        background: '#111827', border: '1px solid #1F2937', borderRadius: 12,
        maxHeight: 320, overflow: 'hidden auto', padding: '12px',
      }}>
        <AnimatePresence initial={false}>
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '7px 8px', borderRadius: 6, marginBottom: 4,
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.3px', padding: '2px 7px',
                borderRadius: 4, background: MODEL_COLORS[evt.model] + '20',
                color: MODEL_COLORS[evt.model], whiteSpace: 'nowrap', marginTop: 1,
              }}>
                {evt.model === 'gpt-4o' ? 'GPT-4o Mini' : 'Claude Haiku'}
              </span>
              <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.4 }}>
                {evt.prompt}
              </span>
              <span style={{ marginLeft: 'auto', color: '#22C55E', fontSize: 14, flexShrink: 0 }}>✓</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#374151', fontSize: 13 }}>
            Waiting for first prompt...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
