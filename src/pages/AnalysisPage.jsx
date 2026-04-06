import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import ProgressStream from '../components/setup/ProgressStream';
import VisibilityTab from '../components/analysis/VisibilityTab';
import CompetitiveTab from '../components/analysis/CompetitiveTab';
import SentimentTab from '../components/analysis/SentimentTab';
import ResponseExplorer from '../components/analysis/ResponseExplorer';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import EmptyState from '../components/shared/EmptyState';
import { generateAuditPDF } from '../utils/pdfExport';
import { DEMO_DATA } from '../demoData';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TABS = [
  { id: 'visibility', label: 'Visibility' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'responses', label: 'Responses' },
];

function adaptDemoData(demo) {
  // Map DEMO_DATA shape to the results shape the tabs consume
  return {
    run: {
      brand_name: demo.summary.brand,
      category: demo.summary.category,
      total_prompts: demo.summary.totalPrompts,
      status: 'complete',
      competitors: JSON.stringify(demo.summary.competitors),
    },
    mentionRateByModel: demo.visibility.byModel.map(m => ({
      model: m.model === 'GPT-4o Mini' ? 'gpt-4o' : 'claude-3-5-sonnet',
      mention_rate_pct: m.mentionRate,
      mentions: m.mentionCount,
      total_prompts: m.totalPrompts,
    })),
    mentionRateByPromptType: demo.visibility.byPromptType.flatMap(pt => [
      { prompt_type: pt.type.toLowerCase().replace(/-/g, '_').replace(/ /g, '_'), model: 'gpt-4o', mention_rate_pct: pt.mentionRate, total: pt.totalPrompts, mentions: pt.mentionCount },
      { prompt_type: pt.type.toLowerCase().replace(/-/g, '_').replace(/ /g, '_'), model: 'claude-3-5-sonnet', mention_rate_pct: Math.max(0, pt.mentionRate - 4), total: pt.totalPrompts, mentions: pt.mentionCount },
    ]),
    competitiveShareOfVoice: demo.competitive.shareOfVoice.map(b => ({
      brand: b.brand, pct: b.mentionRate, mentions: b.mentionCount, total: demo.summary.totalPrompts,
    })),
    coMentionMatrix: demo.competitive.coMentionMatrix.map(c => ({
      competitor: c.brand, pct: parseFloat(c.pct), coMentions: c.coMentionWithRamp, total: 50,
      byModel: [
        { model: 'gpt-4o', pct: parseFloat(c.pct) + 5, coMentions: Math.round(c.coMentionWithRamp * 0.55), total: 25 },
        { model: 'claude-3-5-sonnet', pct: parseFloat(c.pct) - 5, coMentions: Math.round(c.coMentionWithRamp * 0.45), total: 25 },
      ],
    })),
    sentimentByBrand: demo.sentiment.distribution.map(s => ({
      sentiment: s.sentiment.toLowerCase(), count: s.count, pct: s.pct,
    })),
    crossModelDiscrepancy: {
      gpt4o: { model: 'gpt-4o', mention_rate_pct: 44, total_prompts: 60, mentions: 26 },
      claude: { model: 'claude-3-5-sonnet', mention_rate_pct: 40, total_prompts: 60, mentions: 24 },
      gap: 4, flagged: false,
    },
    sampleResponses: demo.responses.map(r => ({
      id: r.id, response_text: r.responseText, brand_mentioned: r.brandMentioned ? 1 : 0,
      brands_mentioned: JSON.stringify(r.brandMentioned ? ['Ramp'] : []),
      sentiment: r.sentiment, model: r.model === 'GPT-4o Mini' ? 'gpt-4o' : 'claude-3-5-sonnet',
      prompt_text: r.promptText, prompt_type: r.promptType.toLowerCase().replace(/-/g, '_').replace(/ /g, '_'),
    })),
  };
}

export default function AnalysisPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const demoResults = location.state?.results || (() => {
    const stored = sessionStorage.getItem('aeo_demo_results');
    return stored ? JSON.parse(stored) : null;
  })();
  const isDemo = location.state?.isDemo || !!demoResults;

  const runId = location.state?.runId || params.get('runId');

  const [phase, setPhase] = useState(() => {
    if (isDemo && demoResults) return 'results';
    if (runId) return 'streaming';
    return 'empty';
  });
  const [results, setResults] = useState(() => {
    if (isDemo && demoResults) return adaptDemoData(demoResults);
    return null;
  });
  const [activeTab, setActiveTab] = useState('visibility');
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isDemo && demoResults) {
      setResults(adaptDemoData(demoResults));
      setPhase('results');
      return;
    }

    if (runId && !isDemo) {
      // Normal streaming flow — nothing extra needed, ProgressStream handles it
    }
  }, []);

  async function handleStreamComplete(id) {
    setPhase('loading');
    try {
      const res = await fetch(`${API}/api/analysis/${id}/results`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const data = await res.json();
      setResults(data);
      setPhase('results');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  async function handleExportPDF() {
    if (!results) return;
    setExporting(true);
    try {
      const auditRes = await fetch(`${API}/api/export/audit/${runId}`);
      const auditData = await auditRes.json();
      await generateAuditPDF(auditData);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }

  if (!runId && !isDemo) {
    return (
      <div>
        <PageHeader title="Analysis" subtitle="Run an analysis from the Setup page" />
        <EmptyState
          title="No analysis yet"
          message="Go to the Setup page to enter a brand name and run an analysis."
          action={
            <button onClick={() => navigate('/')} style={{
              background: '#3B82F6', border: 'none', color: '#fff', borderRadius: 8,
              padding: '10px 20px', fontSize: 14, cursor: 'pointer',
            }}>
              Go to Setup
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={results ? `${results.run?.brand_name || 'Analysis'} — AI Visibility Report` : 'Running Analysis...'}
        subtitle={results ? `${results.run?.category} · ${results.run?.total_prompts} prompts` : null}
        action={
          results && !isDemo && (
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                background: '#1E293B', border: '1px solid #334155', color: '#F1F5F9',
                borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          )
        }
      />

      {/* Streaming phase */}
      {phase === 'streaming' && !isDemo && (
        <div>
          <div style={{ marginBottom: 24, fontSize: 14, color: '#4B5563' }}>
            Sending prompts to GPT-4o Mini and Claude Haiku. This takes ~90 seconds.
          </div>
          <ProgressStream runId={runId} isDemo={false} onComplete={handleStreamComplete} />
        </div>
      )}

      {phase === 'loading' && <LoadingState message="Computing analytics..." />}
      {phase === 'error' && <ErrorState message={error} onRetry={() => handleStreamComplete(runId)} />}

      {phase === 'results' && results && (
        <div>
          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 4, background: '#111827', border: '1px solid #1F2937',
            borderRadius: 10, padding: 4, marginBottom: 28, width: 'fit-content',
          }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#1E293B' : 'transparent',
                  border: 'none', color: activeTab === tab.id ? '#F1F5F9' : '#4B5563',
                  borderRadius: 8, padding: '8px 20px', fontSize: 14,
                  fontWeight: activeTab === tab.id ? 600 : 400, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Model disclosure banner */}
          {isDemo && (
            <div style={{
              fontSize: 12, color: '#4B5563', border: '1px solid #1F2937',
              borderRadius: 6, padding: '6px 12px', marginBottom: 16, display: 'inline-block',
            }}>
              Demo uses <strong style={{ color: '#94A3B8' }}>GPT-4o Mini</strong> and{' '}
              <strong style={{ color: '#94A3B8' }}>Claude Haiku</strong> for cost efficiency.
              Production deployments use GPT-4o and Claude Sonnet for higher accuracy.
            </div>
          )}

          {/* Tab content */}
          {activeTab === 'visibility' && <VisibilityTab results={results} />}
          {activeTab === 'competitive' && <CompetitiveTab results={results} />}
          {activeTab === 'sentiment' && <SentimentTab results={results} />}
          {activeTab === 'responses' && (
            <ResponseExplorer
              responses={results.sampleResponses}
              brandName={results.run?.brand_name}
            />
          )}
        </div>
      )}
    </div>
  );
}
