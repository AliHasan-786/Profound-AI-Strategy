const PROMPT_EXAMPLES = {
  brand_named: [
    'What do you think of {brand}?',
    'Is {brand} a good {category} tool?',
    'What are the pros and cons of {brand}?',
    'Who uses {brand} and is it worth it?',
    'What are {brand}\'s main features?',
    'How much does {brand} cost?',
    'What do {brand} customers say about it?',
  ],
  category_general: [
    'What\'s the best {category} tool in 2025?',
    'Which {category} software should a startup use?',
    'Best tools for {category}',
    'How do companies handle {category} at scale?',
    'What software do CFOs use for {category}?',
    'Top alternatives to traditional {category} software',
  ],
  competitor_comparison: [
    '{brand} vs {competitor1} — which is better?',
    'Compare {brand} and {competitor2}',
    'Should I use {brand} or {competitor1} for my startup?',
    'What\'s the difference between {brand} and {competitor2}?',
    '{competitor1} alternatives',
    'Is there anything better than {competitor1}?',
  ],
  problem_first: [
    'How do I reduce employee expense fraud?',
    'How do I give employees cards without losing spend control?',
    'What\'s the best way to manage receipts for a 50-person company?',
    'My employees are misusing corporate cards — what should I do?',
    'How do finance teams automate expense reporting?',
  ],
};

const AEO_RECOMMENDATIONS = [
  {
    category: 'Structured Data',
    priority: 'High',
    color: '#EF4444',
    actions: [
      'Add Organization schema with sameAs links to Wikipedia, Crunchbase, LinkedIn',
      'Add Product schema with complete pricing, features, and review aggregates',
      'Ensure FAQPage schema covers your most common brand-named prompt questions',
    ],
  },
  {
    category: 'Citation Authority',
    priority: 'High',
    color: '#EF4444',
    actions: [
      'Get listed in authoritative industry directories (G2, Capterra, TechCrunch)',
      'Build Wikipedia presence — models heavily weight Wikipedia citations',
      'Publish data-backed research reports that industry publications cite',
      'Earn bylines in sources LLMs frequently cite (Forbes, WSJ, Wired for your category)',
    ],
  },
  {
    category: 'Reddit & Community Coverage',
    priority: 'Medium',
    color: '#F59E0B',
    actions: [
      'Monitor r/smallbusiness, r/entrepreneur, r/fintech for your category questions',
      'Ensure your brand appears in community recommendation threads',
      'Respond authentically to questions in your domain — models index Reddit heavily',
    ],
  },
  {
    category: 'Consistent Brand Entity',
    priority: 'Medium',
    color: '#F59E0B',
    actions: [
      'Use identical brand name spelling across all properties (avoid "BRAND" vs "Brand" vs "brand")',
      'Maintain consistent category language — choose one term (e.g. "expense management") and use it everywhere',
      'Keep your G2/Capterra categories consistent with how you describe yourself on your site',
    ],
  },
  {
    category: 'Problem-First Content',
    priority: 'Medium',
    color: '#F59E0B',
    actions: [
      'Create content targeting problem-first queries your brand should answer (e.g. "how to reduce expense fraud")',
      'Your blog should address the pain points in category-general prompts, not just product features',
      'Case studies with quantified outcomes get cited in problem-first responses',
    ],
  },
  {
    category: 'Agent Readiness',
    priority: 'Low (now) / Critical (2027)',
    color: '#22C55E',
    actions: [
      'Expose pricing as machine-readable JSON (not buried in PDF or "contact us")',
      'Implement API-accessible feature availability and integration lists',
      'Build or partner with checkout APIs that autonomous agents can trigger',
    ],
  },
];

export default function MethodologyTab({ results }) {
  const brand = results?.run?.brand_name || 'YourBrand';
  const competitors = (() => {
    try { return JSON.parse(results?.run?.competitors || '[]'); } catch { return []; }
  })();

  function interpolate(template) {
    return template
      .replace(/{brand}/gi, brand)
      .replace(/{category}/gi, results?.run?.category || 'your category')
      .replace(/{competitor1}/gi, competitors[0] || 'Competitor A')
      .replace(/{competitor2}/gi, competitors[1] || 'Competitor B');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* How detection works */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <InfoCard title="Mention Detection">
          <p style={prose}>
            Each response is scanned for the brand name using case-insensitive substring matching.
            The full list of brands tracked includes the primary brand plus all competitors.
            A mention is counted even when the brand appears mid-sentence or hyphenated.
          </p>
          <CodeBlock>{`// responseParser.js
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const mentioned = brands.some(b =>
  normalize(response).includes(normalize(b))
);`}</CodeBlock>
        </InfoCard>

        <InfoCard title="Sentiment Classification">
          <p style={prose}>
            Keyword-based classification — no second LLM call (cost-prohibitive at scale).
            The sentence containing the most sentiment-charged language is extracted as the
            sentiment excerpt shown in the Sentiment tab.
          </p>
          <CodeBlock>{`// Positive signals
['excellent','highly recommend','best',
 'leading','loved','impressive','strong']
// Negative signals
['poor','avoid','issues','problems',
 'disappointing','weak','unreliable']
// Default → neutral`}</CodeBlock>
        </InfoCard>

        <InfoCard title="Model Parameters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {[
              ['Provider', 'OpenRouter (unified gateway)'],
              ['GPT model', 'openai/gpt-4o-mini'],
              ['Claude model', 'anthropic/claude-3-haiku'],
              ['Temperature', '0.7'],
              ['Max tokens', '400'],
              ['System prompt', '2-4 sentence concise answer, no bullet points'],
              ['Retries', '1 retry on 429 / 503 errors'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#4B5563' }}>{k}</span>
                <span style={{ color: '#CBD5E1', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</span>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="SQL Analytics Layer">
          <p style={prose}>
            All metrics are computed via 6 named SQL query functions — not in JavaScript.
            This keeps the analytics reproducible, auditable, and portable to larger databases.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {[
              'getMentionRateByModel — GROUP BY model',
              'getMentionRateByPromptType — JOIN + GROUP BY',
              'getCompetitiveShareOfVoice — JSON_EACH scan',
              'getCoMentionMatrix — self-filter per competitor',
              'getSentimentByBrand — window function for pct',
              'getCrossModelDiscrepancy — side-by-side pivot',
            ].map((q) => (
              <div key={q} style={{ fontSize: 12, color: '#4B5563', fontFamily: 'JetBrains Mono, monospace', padding: '4px 8px', background: '#0F172A', borderRadius: 4 }}>
                {q}
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* Prompt templates */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 6 }}>Prompt Templates</div>
        <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 20 }}>
          25 variants per type × 2 models = 100 total prompts. Brand, category, and competitor names are injected at runtime.
          {results && <span style={{ color: '#3B82F6' }}> Shown with your inputs interpolated.</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {Object.entries(PROMPT_EXAMPLES).map(([type, examples]) => (
            <div key={type} style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, padding: '16px' }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
                color: type === 'brand_named' ? '#3B82F6' : type === 'category_general' ? '#F59E0B' : type === 'competitor_comparison' ? '#8B5CF6' : '#22C55E',
                marginBottom: 12,
              }}>
                {type.replace(/_/g, ' ')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {examples.map((ex, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{interpolate(ex)}"
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AEO Improvement Guide */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px' }}>
        <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 16, marginBottom: 4 }}>
          AEO Improvement Guide
        </div>
        <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 20 }}>
          Concrete actions to improve your brand's visibility in AI responses, ordered by expected impact.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AEO_RECOMMENDATIONS.map((rec) => (
            <div key={rec.category} style={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #1F2937' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: `${rec.color}18`, color: rec.color,
                }}>
                  {rec.priority}
                </span>
                <span style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14 }}>{rec.category}</span>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rec.actions.map((action, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
                    <span style={{ color: rec.color, flexShrink: 0, marginTop: 1 }}>→</span>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '20px' }}>
      <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre style={{
      background: '#0F172A', border: '1px solid #1F2937', borderRadius: 6,
      padding: '10px 12px', fontSize: 11, color: '#6B7280',
      fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6,
      overflow: 'auto', marginTop: 12, whiteSpace: 'pre-wrap',
    }}>
      {children}
    </pre>
  );
}

const prose = { fontSize: 13, color: '#6B7280', lineHeight: 1.65, margin: 0 };
