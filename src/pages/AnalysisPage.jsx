import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TABS = [
  { id: 'visibility', label: 'Visibility' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'responses', label: 'Responses' },
];

export default function AnalysisPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const runId = params.get('runId');
  const isDemo = params.get('demo') === 'true';

  const [phase, setPhase] = useState(runId ? 'streaming' : 'empty');
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('visibility');
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // If demo, skip streaming immediately
  useEffect(() => {
    if (isDemo && runId) {
      handleStreamComplete(runId);
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

  if (!runId) {
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
          results && (
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                background: '#1E293B', border: '1px solid #334155', color: '#F1F5F9',
                borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {exporting ? '⏳ Exporting...' : '↓ Export PDF'}
            </button>
          )
        }
      />

      {/* Streaming phase */}
      {phase === 'streaming' && !isDemo && (
        <div>
          <div style={{ marginBottom: 24, fontSize: 14, color: '#4B5563' }}>
            Sending prompts to GPT-4o and Claude. This takes ~90 seconds.
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
