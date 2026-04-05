import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  async function handleSubmit(e, useDemo = false) {
    e.preventDefault();
    if (!isValid && !useDemo) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const body = useDemo
        ? { brandName: 'Ramp', category: 'corporate expense management', competitors: ['Brex', 'Expensify'], useDemo: true }
        : {
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
      navigate(`/analysis?runId=${data.runId}&demo=${useDemo ? 'true' : 'false'}`);
    } catch (err) {
      setError(err.message || 'Failed to start analysis');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Demo banner */}
      <div style={{
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 10, padding: '14px 18px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div>
          <div style={{ fontWeight: 600, color: '#F59E0B', fontSize: 13, marginBottom: 2 }}>
            No API keys? Try the demo
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            Pre-cached Ramp vs Brex vs Expensify — full results, no API calls
          </div>
        </div>
        <button
          onClick={(e) => handleSubmit(e, true)}
          disabled={isSubmitting}
          style={{
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            color: '#F59E0B', borderRadius: 8, padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          View Demo →
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
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
              background: isValid ? '#3B82F6' : '#1E293B',
              border: 'none', color: isValid ? '#fff' : '#4B5563',
              borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 600,
              cursor: isValid ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
              width: '100%',
            }}
          >
            {isSubmitting ? 'Starting analysis...' : 'Run Analysis →'}
          </button>

          <div style={{ fontSize: 12, color: '#374151', textAlign: 'center' }}>
            Sends ~100 prompts to GPT-4o and Claude · ~90 seconds · ~$0.40 in API costs
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
