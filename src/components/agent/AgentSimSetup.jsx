import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SCENARIOS = [
  {
    id: 'hotel_booking',
    label: 'Hotel Booking',
    icon: '🏨',
    description: 'AI agent selects a hotel for a business traveler',
    params: [
      { key: 'location', label: 'Location', placeholder: 'SFO', default: 'SFO' },
      { key: 'budget', label: 'Budget ($/night)', placeholder: '200', default: '200', type: 'number' },
      { key: 'nights', label: 'Nights', placeholder: '2', default: '2', type: 'number' },
    ],
  },
  {
    id: 'software_procurement',
    label: 'Software Procurement',
    icon: '💻',
    description: 'AI agent evaluates and recommends an expense management platform',
    params: [
      { key: 'teamSize', label: 'Team Size', placeholder: '50', default: '50', type: 'number' },
      { key: 'budget', label: 'Budget ($/user/mo)', placeholder: '12', default: '12', type: 'number' },
    ],
  },
  {
    id: 'product_purchase',
    label: 'Product Purchase',
    icon: '🛒',
    description: 'AI agent selects a product for a customer',
    params: [
      { key: 'productType', label: 'Product Type', placeholder: 'business software subscription', default: 'business software subscription' },
      { key: 'budget', label: 'Budget ($)', placeholder: '100', default: '100', type: 'number' },
      { key: 'requirements', label: 'Requirements', placeholder: 'best value, highly rated', default: 'best value, highly rated' },
    ],
  },
];

export default function AgentSimSetup({ onResult }) {
  const [scenario, setScenario] = useState('software_procurement');
  const [brandName, setBrandName] = useState('');
  const [competitors, setCompetitors] = useState(['', '']);
  const [model, setModel] = useState('gpt-4o');
  const [params, setParams] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedScenario = SCENARIOS.find((s) => s.id === scenario);

  function setParam(key, val) {
    setParams((p) => ({ ...p, [key]: val }));
  }

  async function handleRun(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build params with defaults
    const resolvedParams = {};
    for (const p of selectedScenario.params) {
      resolvedParams[p.key] = params[p.key] || p.default;
    }
    if (competitors.some(Boolean)) {
      resolvedParams.competitors = competitors.filter(Boolean);
    }

    try {
      const res = await fetch(`${API}/api/agent-sim/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: brandName.trim() || null, scenario, parameters: resolvedParams, model }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRun} style={{ maxWidth: 560 }}>
      {/* Scenario selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 12 }}>
          Select Scenario
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SCENARIOS.map((s) => (
            <label key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: scenario === s.id ? 'rgba(245,158,11,0.1)' : '#1E293B',
              border: `1px solid ${scenario === s.id ? 'rgba(245,158,11,0.3)' : '#334155'}`,
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <input type="radio" name="scenario" value={s.id}
                checked={scenario === s.id} onChange={() => setScenario(s.id)}
                style={{ accentColor: '#F59E0B' }} />
              <div>
                <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>
                  {s.icon} {s.label}
                </div>
                <div style={{ fontSize: 12, color: '#4B5563', marginTop: 2 }}>{s.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Brand input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 8 }}>
          Brand to Track <span style={{ color: '#4B5563' }}>(optional)</span>
        </div>
        <input
          placeholder="e.g. Marriott, Ramp, your brand..."
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Competitors (for procurement scenario) */}
      {scenario === 'software_procurement' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 8 }}>
            Competitors to Include
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {competitors.map((c, i) => (
              <input key={i} placeholder={`Competitor ${i + 1}`} value={c}
                onChange={(e) => { const arr = [...competitors]; arr[i] = e.target.value; setCompetitors(arr); }}
                style={inputStyle} />
            ))}
          </div>
        </div>
      )}

      {/* Dynamic params */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 12 }}>
          Parameters
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {selectedScenario.params.map((p) => (
            <div key={p.key}>
              <label style={{ fontSize: 12, color: '#4B5563', display: 'block', marginBottom: 6 }}>{p.label}</label>
              <input
                type={p.type || 'text'}
                placeholder={p.placeholder}
                defaultValue={p.default}
                onChange={(e) => setParam(p.key, e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Model selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 10 }}>Model</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['gpt-4o', 'claude-3-5-sonnet'].map((m) => (
            <label key={m} style={{
              flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 8, cursor: 'pointer',
              background: model === m ? 'rgba(59,130,246,0.12)' : '#1E293B',
              border: `1px solid ${model === m ? '#3B82F6' : '#334155'}`,
              fontSize: 13, color: model === m ? '#3B82F6' : '#94A3B8', fontWeight: model === m ? 600 : 400,
            }}>
              <input type="radio" name="model" value={m} checked={model === m}
                onChange={() => setModel(m)} style={{ display: 'none' }} />
              {m === 'gpt-4o' ? 'GPT-4o' : 'Claude 3.5 Sonnet'}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        width: '100%', background: '#F59E0B', border: 'none', color: '#000',
        borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
      }}>
        {loading ? 'Running simulation...' : 'Run Agent Simulation →'}
      </button>
    </form>
  );
}

const inputStyle = {
  width: '100%', background: '#1E293B', border: '1px solid #334155',
  borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#F1F5F9', outline: 'none',
};
