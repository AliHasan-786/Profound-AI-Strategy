import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import BrandSetupForm from '../components/setup/BrandSetupForm';

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('aeo_onboarded')
  );

  function dismissOnboarding() {
    localStorage.setItem('aeo_onboarded', '1');
    setShowOnboarding(false);
  }

  return (
    <div>
      {/* Onboarding hint */}
      {showOnboarding && (
        <div style={{
          background: '#1E293B', border: '1px solid #334155', borderRadius: 8,
          padding: '10px 16px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
            This tool measures how often your brand appears in AI answers — and scores your readiness
            for AI-agent commerce.{' '}
            <span style={{ color: '#94A3B8' }}>Start with the demo to see what the analysis looks like.</span>
          </span>
          <button
            onClick={dismissOnboarding}
            style={{
              background: 'none', border: 'none', color: '#4B5563', fontSize: 18,
              cursor: 'pointer', flexShrink: 0, lineHeight: 1, padding: '0 4px',
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.6px',
          marginBottom: 10, lineHeight: 1.25,
        }}>
          How visible is your brand to AI?
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
          AEO Studio runs 120+ structured prompts across two AI models, measures your brand's
          mention rate against competitors, and scores your readiness for AI-agent-driven commerce.{' '}
          <span style={{ color: '#94A3B8' }}>No SEO tool does this.</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
        {/* Left: Form */}
        <BrandSetupForm />

        {/* Right: How it works + differentiation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* How it works */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#4B5563',
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16,
            }}>
              How it works
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                {
                  step: '1',
                  title: 'Enter your brand + up to 3 competitors',
                  desc: 'Brand name, product category, and competitor names. That\'s all you need.',
                },
                {
                  step: '2',
                  title: 'We run 120 prompts across GPT-4o Mini and Claude Haiku',
                  desc: '4 prompt types: brand-named, category-general, competitor-comparison, problem-first. Each prompt hits both models.',
                },
                {
                  step: '3',
                  title: 'See your AI share-of-voice, sentiment, and Agent Readiness score',
                  desc: 'Results are computed via SQL queries on the stored responses — mention rate, co-mention matrix, cross-model discrepancy, sentiment distribution.',
                },
              ].map(({ step, title, desc }, i) => (
                <div key={step} style={{
                  display: 'flex', gap: 16, padding: '16px',
                  background: '#1E293B',
                  borderRadius: i === 0 ? '10px 10px 0 0' : i === 2 ? '0 0 10px 10px' : 0,
                  borderBottom: i < 2 ? '1px solid #0F172A' : 'none',
                  border: '1px solid #334155',
                  marginTop: i > 0 ? -1 : 0,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: '#0F172A', border: '1px solid #334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                    color: '#3B82F6',
                  }}>
                    {step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: 14, marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Differentiation callout */}
          <blockquote style={{
            margin: 0, padding: '16px 20px',
            borderLeft: '3px solid #334155',
            background: 'transparent',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#4B5563',
              textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10,
            }}>
              What AEO Studio does that Profound doesn't
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
              Profound shows you where your brand appears in AI answers today.
              AEO Studio measures your brand's legibility to autonomous AI agents —
              the procurement bots, booking assistants, and purchasing AIs that will
              run B2B commerce by 2028. That analysis doesn't exist anywhere else yet.
            </p>
          </blockquote>

        </div>
      </div>
    </div>
  );
}
