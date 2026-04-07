import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import AgentSimSetup from '../components/agent/AgentSimSetup';
import DecisionTrace from '../components/agent/DecisionTrace';
import AgentReadinessScore from '../components/agent/AgentReadinessScore';
import { DEMO_AGENT_SIM } from '../demoData';

function buildDemoResult() {
  return {
    brandName: DEMO_AGENT_SIM.brandName,
    isDemo: true,
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
}

export default function AgentSimPage() {
  // Demo trace loads immediately — the primary experience, no backend required
  const [result, setResult] = useState(() => buildDemoResult());
  const [showLiveSim, setShowLiveSim] = useState(false);

  function handleLiveResult(r) {
    setResult({ ...r, isDemo: false });
    setShowLiveSim(false);
  }

  return (
    <div>
      <PageHeader
        title="Agent Engine Optimization"
        subtitle="B2A — will an AI agent select your brand when completing a purchase?"
      />

      {/* Context banner */}
      <div style={{
        background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: 10, padding: '16px 20px', marginBottom: 24,
      }}>
        <div style={{ fontWeight: 600, color: '#F59E0B', fontSize: 14, marginBottom: 6 }}>
          AEO 2.0 — Beyond Mention Rate
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, maxWidth: 760 }}>
          AEO 1.0 asks: "Does ChatGPT mention my brand?" AEO 2.0 asks: "Does an AI agent{' '}
          <em style={{ color: '#94A3B8' }}>select</em> my brand when executing a purchase autonomously?"
          The simulation below sends a structured procurement task to an LLM and parses its step-by-step
          elimination reasoning — revealing exactly where and why brands are dropped from consideration.
        </div>
      </div>

      {/* Demo badge */}
      {result?.isDemo && (
        <div style={{
          fontSize: 12, color: '#4B5563', border: '1px solid #1F2937',
          borderRadius: 6, padding: '5px 12px', marginBottom: 20,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#22C55E', fontWeight: 700 }}>●</span>
          Demo trace — Software Procurement scenario · Ramp vs Brex vs Expensify · GPT-4o Mini
          <button
            onClick={() => setShowLiveSim(!showLiveSim)}
            style={{
              background: 'none', border: '1px solid #1F2937', borderRadius: 4,
              color: '#4B5563', fontSize: 11, padding: '1px 8px', cursor: 'pointer',
              marginLeft: 4,
            }}
          >
            {showLiveSim ? 'Hide live sim' : 'Run live →'}
          </button>
        </div>
      )}

      {/* Live simulation — collapsed by default, shown on demand */}
      {showLiveSim && (
        <div style={{
          background: '#111827', border: '1px solid #1F2937',
          borderRadius: 10, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 4 }}>
            Live Simulation
          </div>
          <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 16 }}>
            Requires backend running locally + <code style={{ background: '#0F172A', padding: '1px 5px', borderRadius: 3 }}>OPENROUTER_API_KEY</code> in .env.
            Each run costs ~$0.001.
          </div>
          <AgentSimSetup onResult={handleLiveResult} />
        </div>
      )}

      {/* Results — always visible */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <DecisionTrace
          trace={result.trace}
          brandName={result.brandName}
        />
        <AgentReadinessScore
          scores={result.readinessScores}
          brandName={result.brandName}
        />
        <RawResponse text={result.rawResponse} />
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
        <span>Agent's Raw Response</span>
        <span>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          padding: '16px 20px 20px', fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12, color: '#6B7280', lineHeight: 1.7, whiteSpace: 'pre-wrap',
          borderTop: '1px solid #1F2937', maxHeight: 400, overflowY: 'auto',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}
