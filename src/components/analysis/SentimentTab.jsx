import MetricCard from '../shared/MetricCard';

const SENTIMENT_COLORS = {
  positive: '#22C55E',
  neutral: '#94A3B8',
  negative: '#EF4444',
};

const SENTIMENT_LABELS = { positive: 'Positive', neutral: 'Neutral', negative: 'Negative' };

export default function SentimentTab({ results }) {
  const { sentimentByBrand, sampleResponses, run } = results;
  const brandName = run?.brand_name || 'Your Brand';

  const positive = sentimentByBrand.find((s) => s.sentiment === 'positive');
  const neutral = sentimentByBrand.find((s) => s.sentiment === 'neutral');
  const negative = sentimentByBrand.find((s) => s.sentiment === 'negative');

  // Sample responses that mention the brand, with sentiment excerpts
  const brandResponses = sampleResponses?.filter((r) => r.brand_mentioned) || [];
  const positiveExamples = brandResponses.filter((r) => r.sentiment === 'positive').slice(0, 3);
  const negativeExamples = brandResponses.filter((r) => r.sentiment === 'negative').slice(0, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Sentiment scorecard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <MetricCard
          label="Positive Sentiment"
          value={`${positive?.pct || 0}%`}
          subtext={`${positive?.count || 0} responses`}
          color="#22C55E"
          tooltip={`When ${brandName} is mentioned, ${positive?.pct || 0}% of responses frame it positively. Above 60% is strong — it means the AI associates your brand with quality and reliability.`}
        />
        <MetricCard
          label="Neutral Sentiment"
          value={`${neutral?.pct || 0}%`}
          subtext={`${neutral?.count || 0} responses`}
          color="#94A3B8"
          tooltip={`Neutral responses mention ${brandName} factually without strong positive or negative framing. This is normal for informational queries.`}
        />
        <MetricCard
          label="Negative Sentiment"
          value={`${negative?.pct || 0}%`}
          subtext={`${negative?.count || 0} responses`}
          color="#EF4444"
          tooltip={`When ${brandName} is mentioned in ${negative?.pct || 0}% of responses, it's framed negatively. High values (>15%) may indicate reputational issues in training data.`}
        />
      </div>

      {/* Sentiment bar */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 16 }}>
          Sentiment Distribution
        </div>
        <div style={{ height: 24, display: 'flex', borderRadius: 6, overflow: 'hidden', gap: 2 }}>
          {sentimentByBrand.map((s) => (
            <div
              key={s.sentiment}
              title={`${SENTIMENT_LABELS[s.sentiment]}: ${s.pct}%`}
              style={{
                height: '100%', width: `${s.pct}%`,
                background: SENTIMENT_COLORS[s.sentiment] || '#4B5563',
                transition: 'width 0.5s ease',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {sentimentByBrand.map((s) => (
            <div key={s.sentiment} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: SENTIMENT_COLORS[s.sentiment] || '#4B5563' }} />
              <span style={{ fontSize: 13, color: '#94A3B8' }}>{SENTIMENT_LABELS[s.sentiment]}: {s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Representative quotes */}
      {positiveExamples.length > 0 && (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 16 }}>
            Representative Positive Responses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {positiveExamples.map((r, i) => (
              <QuoteCard key={i} response={r} brandName={brandName} />
            ))}
          </div>
        </div>
      )}

      {negativeExamples.length > 0 && (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
          <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 16 }}>
            Negative Responses to Monitor
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {negativeExamples.map((r, i) => (
              <QuoteCard key={i} response={r} brandName={brandName} negative />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuoteCard({ response, brandName, negative }) {
  const color = negative ? '#EF4444' : '#22C55E';
  return (
    <div style={{
      background: '#0F172A', borderRadius: 8, padding: '14px 16px',
      borderLeft: `3px solid ${color}20`,
    }}>
      <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 6, display: 'flex', gap: 8 }}>
        <span style={{
          background: response.model === 'gpt-4o' ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
          color: response.model === 'gpt-4o' ? '#22C55E' : '#8B5CF6',
          padding: '1px 8px', borderRadius: 4, fontWeight: 600, fontSize: 11,
        }}>
          {response.model === 'gpt-4o' ? 'GPT-4o Mini' : 'Claude Haiku'}
        </span>
        <span style={{ color: '#374151' }}>"{response.prompt_text}"</span>
      </div>
      <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
        {highlightBrand(response.response_text, brandName)}
      </div>
    </div>
  );
}

function highlightBrand(text, brand) {
  if (!brand) return text;
  const regex = new RegExp(`(${brand})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: 'rgba(245,158,11,0.25)', color: '#F59E0B', borderRadius: 2, padding: '0 2px' }}>
        {part}
      </mark>
    ) : part
  );
}
