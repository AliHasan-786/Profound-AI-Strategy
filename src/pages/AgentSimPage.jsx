import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import AgentSimSetup from '../components/agent/AgentSimSetup';
import DecisionTrace from '../components/agent/DecisionTrace';
import AgentReadinessScore from '../components/agent/AgentReadinessScore';
import { DEMO_AGENT_SIM } from '../demoData';

export default function AgentSimPage() {
  const [result, setResult] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

  const activeResult = showDemo ? null : result;

  const handleDemoSim = () => {
    const demoResult = {
      brandName: DEMO_AGENT_SIM.brandName,
      trace: {
        steps: DEMO_AGENT_SIM.decisionTrace.map(step => ({
          step: step.step,
          action: step.action,
          brandsConsidered: step.brandsConsidered,
          eliminated: step.eliminated.map(e => e.brand),
          reason: step.eliminated.map(e => e.reason).join(' ') || step.analysis || '',
        })),
        finalSelection: DEMO_AGENT_SIM.finalSelection,
        primaryBrandConsidered: true,
        primaryBrandSelected: DEMO_AGENT_SIM.brandSelected,
        primaryBrandEliminatedAtStep: null,
      },
      readinessScores: DEMO_AGENT_SIM.agentReadinessCriteria.map(c => ({
        id: c.criterion.toLowerCase().replace(/\s+/g, '_'),
        label: c.criterion,
        description: c.note,
        status: c.score >= 4 ? 'present' : c.score >= 2 ? 'partial' : c.score === 0 ? 'missing' : 'manual_check',
        note: c.note,
      })),
      rawResponse: DEMO_AGENT_SIM.selectionReason,
    };
    setResult(demoResult);
    setShowDemo(false);
  };

  return (
    <div>
      <PageHeader
        title="Agent Engine Optimization"
        subtitle="B2A Simulation — will an AI agent select your brand when completing a purchase?"
      />

      {/* AEO 2.0 context banner */}
      <div style={{
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: 10, padding: '14px 18px', marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>◈</span>
        <div>
          <div style={{ fontWeight: 600, color: '#F59E0B', fontSize: 14, marginBottom: 4 }}>AEO 2.0 — The Next Frontier</div>
          <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
            AEO 1.0 asked: "Does ChatGPT mention my brand?" AEO 2.0 asks: "Does an AI agent <em>select</em> my brand when completing a purchase?"
            73% of consumers already use AI in purchase journeys. By 2028, 90% of B2B purchases will be AI-intermediated.
            This simulator shows exactly how an AI agent reasons about your brand in a procurement scenario.
          </div>
        </div>
      </div>

      {/* Requirements banner */}
      <div style={{
        background: '#111827', border: '1px solid #1F2937',
        borderRadius: 10, padding: '14px 18px', marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 13, marginBottom: 6 }}>
            Two ways to use this module
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              <span style={{ color: '#22C55E', fontWeight: 600 }}>Demo trace</span> — Instant, no setup. Pre-run expense management scenario with full step-by-step reasoning.
            </div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Live simulation</span> — Requires: backend running locally (<code style={{ background: '#1E293B', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>npm run dev</code>) + <code style={{ background: '#1E293B', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>OPENROUTER_API_KEY</code> in .env. Each run costs ~$0.001.
            </div>
          </div>
        </div>
        <button
          onClick={handleDemoSim}
          style={{
            background: '#1E293B', border: '1px solid #334155', color: '#F1F5F9',
            borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          View demo trace →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeResult ? '420px 1fr' : '560px 1fr', gap: 40, alignItems: 'start' }}>
        {/* Setup panel */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 4 }}>Live Simulation</div>
            <div style={{ fontSize: 13, color: '#4B5563' }}>
              Select a scenario, optionally enter your brand, and run with a live LLM call.
            </div>
          </div>

          <AgentSimSetup onResult={(r) => { setResult(r); setShowDemo(false); }} />
        </div>

        {/* Results panel */}
        {activeResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <DecisionTrace
              trace={activeResult.trace}
              brandName={activeResult.brandName}
            />
            <AgentReadinessScore
              scores={activeResult.readinessScores}
              brandName={activeResult.brandName}
            />

            {/* Raw response toggle */}
            <RawResponse text={activeResult.rawResponse} />
          </div>
        )}

        {!activeResult && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 32px', gap: 16, textAlign: 'center',
            background: '#111827', border: '1px dashed #1F2937', borderRadius: 12,
          }}>
            <div style={{ fontSize: 40, opacity: 0.2 }}>◈</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Run a simulation</div>
            <div style={{ fontSize: 13, color: '#374151', maxWidth: 280 }}>
              The agent's step-by-step decision trace will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RawResponse({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '14px 20px', background: 'transparent', border: 'none',
          color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>Raw LLM Response</span>
        <span>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          padding: '0 20px 20px', fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12, color: '#6B7280', lineHeight: 1.7, whiteSpace: 'pre-wrap',
          borderTop: '1px solid #1F2937', paddingTop: 16, maxHeight: 400, overflowY: 'auto',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}
