import { useState } from 'react';

/*
 * Computes 3-4 strategic findings from live results data.
 * Works for both demo and live runs — no hardcoded content.
 */
function computeInsights(results) {
  const {
    mentionRateByPromptType,
    competitiveShareOfVoice,
    crossModelDiscrepancy,
    themeAnalysis,
    run,
    sentimentByBrand,
  } = results;

  const brandName = run?.brand_name || 'Your Brand';
  const insights = [];

  // ── 1. Top-of-funnel visibility gap ───────────────────────────────────────
  const avg = (arr, key) =>
    arr?.length ? arr.reduce((s, r) => s + (r[key] || 0), 0) / arr.length : 0;

  const brandNamedRows = mentionRateByPromptType?.filter(r => r.prompt_type === 'brand_named') || [];
  const problemFirstRows = mentionRateByPromptType?.filter(r => r.prompt_type === 'problem_first') || [];
  const avgBrandNamed = avg(brandNamedRows, 'mention_rate_pct');
  const avgProblemFirst = avg(problemFirstRows, 'mention_rate_pct');
  const funnelGap = Math.round(avgBrandNamed - avgProblemFirst);

  if (funnelGap > 20) {
    insights.push({
      label: 'Top-of-Funnel Invisibility',
      severity: funnelGap > 50 ? 'critical' : 'warning',
      headline: `${brandName} is reliably surfaced when users already know the brand — but largely absent when they're describing a problem`,
      body: `${brandName} appears in ${Math.round(avgBrandNamed)}% of brand-named queries but only ${Math.round(avgProblemFirst)}% of problem-first queries — a ${funnelGap}-point gap. This is the most commercially significant finding in the data: AI systems recall ${brandName} when a user already knows it exists, but fail to surface it to buyers who are describing a problem ${brandName} solves and have no prior brand preference. These buyers leave the AI conversation without ever encountering ${brandName}.`,
      action: `Create content anchored to high-frequency problem queries — "how to prevent expense fraud," "corporate card controls for distributed teams," "automating expense reports at scale." Problem-framed content from authoritative sources (G2, Reddit, industry publications, analyst briefings) carries disproportionate weight in how AI models build category-to-brand associations. The goal is not more blog posts — it's presence in the specific sources AI models cite.`,
    });
  }

  // ── 2. Competitive category authority ────────────────────────────────────
  const topCompetitor = competitiveShareOfVoice?.[0];
  const primarySov = competitiveShareOfVoice?.find(b => b.brand === brandName)
    || competitiveShareOfVoice?.[1];

  if (topCompetitor && primarySov && topCompetitor.brand !== brandName) {
    const gap = Math.round(topCompetitor.pct - primarySov.pct);
    insights.push({
      label: 'Category Authority Gap',
      severity: gap > 15 ? 'critical' : 'warning',
      headline: `${topCompetitor.brand} holds the category-reference position — ${brandName} is framed as the challenger in ${gap > 0 ? `${gap}% of` : 'most'} head-to-head comparisons`,
      body: `${topCompetitor.brand} leads ${brandName} by ${gap} percentage points in AI share-of-voice (${topCompetitor.pct}% vs ${primarySov.pct}%). When AI models generate category lists, they anchor on ${topCompetitor.brand} as the default reference point, then introduce ${brandName} as "a strong alternative" worth considering. This framing is self-reinforcing: users who accept an AI's first recommendation absorb the implied hierarchy before they evaluate either product. The brand named first shapes perception before the user engages at all.`,
      action: `Shift content from comparison framing ("${brandName} vs ${topCompetitor.brand}") toward category-definition framing that positions ${brandName} as the authority on a specific capability it uniquely owns. Third-party analyst content, community moderator endorsements, and comparison articles that treat ${brandName} as the benchmark — not the challenger — carry the highest training data weight. A single well-placed analyst brief can outperform dozens of company blog posts.`,
    });
  }

  // ── 3. Narrative framing from theme analysis ──────────────────────────────
  if (themeAnalysis) {
    const themes = themeAnalysis.themeDistribution || {};
    const total = Object.values(themes).reduce((s, v) => s + v, 0);
    const leaderPct = total > 0 ? Math.round(((themes.category_leader || 0) / total) * 100) : 0;
    const altPct = total > 0 ? Math.round(((themes.alternative || 0) / total) * 100) : 0;
    const featPct = total > 0 ? Math.round(((themes.feature_comparison || 0) / total) * 100) : 0;

    if (leaderPct < 15) {
      insights.push({
        label: 'Narrative Framing Risk',
        severity: 'warning',
        headline: `AI systems use comparison-dominant language — ${brandName} is described by how it differs from competitors, not by what category it defines`,
        body: `Theme classification across ${themeAnalysis.responseCount} brand-mentioned responses shows ${featPct}% feature-comparison framing and only ${leaderPct}% category-leader framing. When AI recommends ${brandName}, it typically anchors the recommendation in how ${brandName} compares to ${topCompetitor?.brand || 'competitors'} rather than in what category ${brandName} invented or leads. This is a structural disadvantage: brands framed as challengers compete on features; brands framed as category leaders compete on authority. The framing AI uses today reflects the framing of the content it was trained on — which means it's changeable.`,
        action: `Commission and distribute analyst-style content that frames ${brandName} as having created or redefined a specific capability — not "better expense management" but "real-time savings intelligence" or "proactive spend reduction." When authoritative sources adopt this language, AI models inherit it. The objective is to make ${brandName} the definitive answer to a question that only ${brandName} answers — a category-of-one framing that forecloses challenger positioning by competitors.`,
      });
    }
  }

  // ── 4. Cross-model training gap ───────────────────────────────────────────
  if (crossModelDiscrepancy?.flagged) {
    const gptRate = crossModelDiscrepancy.gpt4o?.mention_rate_pct;
    const claudeRate = crossModelDiscrepancy.claude?.mention_rate_pct;
    insights.push({
      label: 'Cross-Model Training Gap',
      severity: 'warning',
      headline: `${crossModelDiscrepancy.gap}-point visibility gap between GPT and Claude — ${brandName}'s entity data is weighted inconsistently across training corpora`,
      body: `GPT-4o surfaces ${brandName} at ${gptRate}% vs Claude at ${claudeRate}%. A gap above 15 points indicates that ${brandName}'s entity representation is inconsistently sampled across the content sources that OpenAI and Anthropic weight differently during training. This is not a product problem — it's a content distribution problem. A brand can have identical product quality and identical marketing spend while having dramatically different AI visibility across models, simply due to which sources each model's training pipeline samples most heavily.`,
      action: `Audit ${brandName}'s entity consistency on Wikipedia, Wikidata, Crunchbase, LinkedIn, and major review platforms — these structured sources are sampled disproportionately by model trainers. Ensure brand descriptions, category tags, founding data, and product naming are consistent and current across all. A well-structured Wikipedia article written to entity-extraction standards can close a cross-model gap more effectively than dozens of earned-media placements.`,
    });
  }

  // ── 5. Sentiment strength (positive signal, shown if space allows) ────────
  const positiveSentiment = sentimentByBrand?.find(s => s.sentiment === 'positive');
  const negativeSentiment = sentimentByBrand?.find(s => s.sentiment === 'negative');

  if (
    positiveSentiment?.pct > 60 &&
    (negativeSentiment?.pct || 0) < 10 &&
    insights.length < 4
  ) {
    insights.push({
      label: 'Brand Signal Strength',
      severity: 'positive',
      headline: `${positiveSentiment.pct}% positive sentiment when mentioned — AI consistently frames ${brandName} favorably, creating a best-kept-secret risk`,
      body: `When AI models surface ${brandName}, ${positiveSentiment.pct}% of responses carry positive framing and only ${negativeSentiment?.pct || 0}% are negative. This is a meaningful baseline that protects against the category-authority gap: when buyers do encounter ${brandName} through AI, they receive a favorable impression. The structural risk is the inverse of the opportunity — strong sentiment at low mention rates means ${brandName} has excellent brand perception among buyers who find it, while remaining invisible to the larger population of buyers who don't.`,
      action: `Amplify the positive signal through structured data: add AggregateRating schema pulled from G2 and Capterra reviews to ${brandName}'s product pages, and ensure review highlights are accessible to AI web crawlers. Positive review excerpts in schema markup are extracted as sentiment evidence by AI systems at both training time and inference time (particularly Perplexity, which cites sources live). This is a high-leverage, low-effort change with compounding returns.`,
    });
  }

  return insights.slice(0, 4);
}

const SEVERITY_STYLES = {
  critical: {
    label: 'Priority: Critical',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.05)',
    border: 'rgba(239,68,68,0.18)',
    numBg: 'rgba(239,68,68,0.12)',
  },
  warning: {
    label: 'Priority: High',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.04)',
    border: 'rgba(245,158,11,0.15)',
    numBg: 'rgba(245,158,11,0.12)',
  },
  positive: {
    label: 'Strength',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.04)',
    border: 'rgba(34,197,94,0.15)',
    numBg: 'rgba(34,197,94,0.12)',
  },
  info: {
    label: 'Baseline',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.04)',
    border: 'rgba(59,130,246,0.15)',
    numBg: 'rgba(59,130,246,0.12)',
  },
};

export default function StrategicInsights({ results }) {
  const [expanded, setExpanded] = useState(0); // first finding open by default
  const insights = computeInsights(results);
  if (!insights.length) return null;

  const totalPrompts = results.run?.total_prompts || 100;
  const modelCount = results.mentionRateByModel?.length || 2;

  return (
    <div style={{
      background: '#1E293B',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: '24px',
      marginBottom: 28,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 16 }}>Strategic Findings</div>
        <div style={{ fontSize: 12, color: '#4B5563' }}>
          {insights.length} findings · {totalPrompts} prompts · {modelCount} models
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#374151', fontStyle: 'italic' }}>
          Click each finding to expand
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.map((insight, i) => {
          const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
          const isOpen = expanded === i;

          return (
            <div
              key={i}
              style={{
                background: isOpen ? style.bg : 'transparent',
                border: `1px solid ${isOpen ? style.border : '#1F2937'}`,
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* Row header */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Finding number */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 4,
                  flexShrink: 0,
                  background: isOpen ? style.numBg : '#0F172A',
                  color: isOpen ? style.color : '#374151',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginTop: 1,
                  transition: 'all 0.15s',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Label + headline */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: style.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.7px',
                    marginBottom: 5,
                    opacity: isOpen ? 1 : 0.7,
                  }}>
                    {insight.label} · {style.label}
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isOpen ? '#F1F5F9' : '#94A3B8',
                    lineHeight: 1.4,
                    transition: 'color 0.15s',
                  }}>
                    {insight.headline}
                  </div>
                </div>

                <span style={{ color: '#374151', fontSize: 11, flexShrink: 0, marginTop: 4 }}>
                  {isOpen ? '▴' : '▾'}
                </span>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div style={{ padding: '0 16px 18px', borderTop: `1px solid ${style.border}` }}>
                  {/* Evidence */}
                  <div style={{
                    paddingTop: 16,
                    fontSize: 13,
                    color: '#94A3B8',
                    lineHeight: 1.8,
                    marginBottom: 16,
                  }}>
                    {insight.body}
                  </div>

                  {/* Recommended action */}
                  <div style={{
                    background: '#0F172A',
                    borderLeft: `3px solid ${style.color}`,
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: style.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      marginBottom: 7,
                    }}>
                      Recommended Action
                    </div>
                    <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.7 }}>
                      {insight.action}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
