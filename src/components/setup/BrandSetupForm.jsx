import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_DATA, DEMO_RUN_ID } from '../../demoData';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BrandSetupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    brandName: '',
    category: '',
    competitors: ['', '', ''],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isValid = form.brandName.trim() && form.category.trim();

  function setCompetitor(i, val) {
    const c = [...form.competitors];
    c[i] = val;
    setForm((f) => ({ ...f, competitors: c }));
  }

  function handleDemo() {
    sessionStorage.setItem('aeo_demo_results', JSON.stringify(DEMO_DATA));
    navigate('/analysis', { state: { results: DEMO_DATA, isDemo: true, runId: DEMO_RUN_ID } });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        brandName: form.brandName.trim(),
        category: form.category.trim(),
        competitors: form.competitors.map((c) => c.trim()).filter(Boolean),
        useDemo: false,
      };

      const res = await fetch(`${API}/api/analysis/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      navigate(`/analysis?runId=${data.runId}`);
    } catch (err) {
      const isFetchError = !err.message || err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network');
      setError(isFetchError
        ? 'Backend server is not running. Use the demo button above to explore the full analysis — no setup needed.'
        : err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Primary demo CTA */}
      <button
        onClick={handleDemo}
        style={{
          width: '100%', background: '#F1F5F9', border: 'none', color: '#0F172A',
          borderRadius: 10, padding: '16px 0', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', marginBottom: 8,
        }}
      >
        Try Demo — Ramp vs Brex vs Expensify
      </button>
      <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 28 }}>
        See Ramp vs Brex vs Expensify — no API key needed
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 1, background: '#1F2937' }} />
        <span style={{ fontSize: 12, color: '#4B5563', whiteSpace: 'nowrap' }}>or run your own analysis</span>
        <div style={{ flex: 1, height: 1, background: '#1F2937' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field
            label="Brand Name *"
            placeholder="e.g. Ramp"
            value={form.brandName}
            onChange={(v) => setForm((f) => ({ ...f, brandName: v }))}
          />
          <Field
            label="Product Category *"
            placeholder="e.g. corporate expense management"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
          />

          <div>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 10 }}>
              Competitors <span style={{ color: '#4B5563' }}>(optional, up to 3)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.competitors.map((c, i) => (
                <input
                  key={i}
                  placeholder={`Competitor ${i + 1}`}
                  value={c}
                  onChange={(e) => setCompetitor(i, e.target.value)}
                  style={inputStyle}
                />
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            style={{
              background: 'transparent',
              border: isValid ? '1px solid #3B82F6' : '1px solid #334155',
              color: isValid ? '#3B82F6' : '#4B5563',
              borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 600,
              cursor: isValid ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              width: '100%',
            }}
          >
            {isSubmitting ? 'Starting analysis...' : 'Run Analysis →'}
          </button>

          <div style={{ fontSize: 12, color: '#374151', textAlign: 'center' }}>
            Sends ~100 prompts to GPT-4o Mini and Claude Haiku · ~90 seconds · ~$0.10 in API costs
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 8 }}>
        {label}
      </label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#1E293B', border: '1px solid #334155',
  borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#F1F5F9',
  outline: 'none', transition: 'border-color 0.15s',
};
