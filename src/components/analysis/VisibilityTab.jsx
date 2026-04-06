import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import MetricCard from '../shared/MetricCard';
import ResponseExplorer from './ResponseExplorer';

const PROMPT_TYPE_LABELS = {
  brand_named: 'Brand Named',
  category_general: 'Category General',
  competitor_comparison: 'Competitor Comparison',
  problem_first: 'Problem First',
};

const CHART_COLORS = { 'gpt-4o': '#3B82F6', 'claude-3-5-sonnet': '#8B5CF6' };

export default function VisibilityTab({ results }) {
  const { mentionRateByModel, mentionRateByPromptType, crossModelDiscrepancy, sampleResponses, run } = results;

  const overallRate =
    mentionRateByModel.length
      ? Math.round((mentionRateByModel.reduce((s, r) => s + r.mention_rate_pct, 0) / mentionRateByModel.length) * 10) / 10
      : 0;

  const gptRate = mentionRateByModel.find((m) => m.model === 'gpt-4o')?.mention_rate_pct || 0;
  const claudeRate = mentionRateByModel.find((m) => m.model === 'claude-3-5-sonnet')?.mention_rate_pct || 0;

  // Reshape for grouped bar chart: one entry per prompt type
  const chartData = Object.keys(PROMPT_TYPE_LABELS).map((type) => {
    const gpt = mentionRateByPromptType.find((r) => r.prompt_type === type && r.model === 'gpt-4o');
    const claude = mentionRateByPromptType.find((r) => r.prompt_type === type && r.model === 'claude-3-5-sonnet');
    return {
      name: PROMPT_TYPE_LABELS[type],
      'GPT-4o Mini': gpt?.mention_rate_pct || 0,
      'Claude Haiku': claude?.mention_rate_pct || 0,
    };
  });

  const brandName = run?.brand_name || 'Your Brand';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <MetricCard
          label="Overall Mention Rate"
          value={`${overallRate}%`}
          subtext={`Across both models`}
          color="#3B82F6"
          tooltip={`${brandName} appears in ${overallRate}% of all prompts tested. Brands above 50% typically appear in authoritative industry lists and have active Reddit thread coverage.`}
        />
        <MetricCard
          label="GPT-4o Mini Mention Rate"
          value={`${gptRate}%`}
          subtext={`${mentionRateByModel.find((m) => m.model === 'gpt-4o')?.mentions || 0} / ${mentionRateByModel.find((m) => m.model === 'gpt-4o')?.total_prompts || 0} prompts`}
          color="#22C55E"
          tooltip={`OpenAI's GPT-4o Mini mentions ${brandName} in ${gptRate}% of queries. This reflects how well your brand is represented in OpenAI's training data and RLHF alignment.`}
        />
        <MetricCard
          label="Claude Haiku Mention Rate"
          value={`${claudeRate}%`}
          subtext={`${mentionRateByModel.find((m) => m.model === 'claude-3-5-sonnet')?.mentions || 0} / ${mentionRateByModel.find((m) => m.model === 'claude-3-5-sonnet')?.total_prompts || 0} prompts`}
          color="#8B5CF6"
          tooltip={`Anthropic's Claude Haiku mentions ${brandName} in ${claudeRate}% of queries. Differences from GPT-4o Mini indicate model-specific training data gaps.`}
        />
      </div>

      {/* Cross-model discrepancy alert */}
      {crossModelDiscrepancy?.flagged && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>⚠</span>
          <div>
            <div style={{ fontWeight: 600, color: '#F59E0B', fontSize: 14 }}>
              Cross-Model Discrepancy Detected ({crossModelDiscrepancy.gap}pt gap)
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              GPT-4o Mini ({gptRate}%) and Claude Haiku ({claudeRate}%) differ by more than 15 points.
              This signals inconsistent brand entity recognition across training corpora — likely fixable with structured data and more consistent brand mentions in high-citation sources.
            </div>
          </div>
        </div>
      )}

      {/* Mention rate by prompt type chart */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16 }}>Mention Rate by Prompt Type</div>
          <div style={{ color: '#4B5563', fontSize: 13, marginTop: 4 }}>
            Brand-named prompts have highest mention rate — category and problem-first reveal organic discovery gaps
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#F1F5F9', marginBottom: 4 }}
              formatter={(val, name) => [`${val}%`, name]}
            />
            <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 13 }} />
            <Bar dataKey="GPT-4o Mini" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Claude Haiku" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Response Explorer */}
      <ResponseExplorer responses={sampleResponses} brandName={brandName} />
    </div>
  );
}
