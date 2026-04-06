// src/demoData.js
// Complete client-side demo data for Ramp vs Brex vs Expensify
// Used when demo mode is triggered — bypasses all API calls

export const DEMO_RUN_ID = 'demo-run-ramp-2025';

export const DEMO_BRAND = {
  name: 'Ramp',
  category: 'corporate expense management',
  competitors: ['Brex', 'Expensify'],
};

export const DEMO_SUMMARY = {
  runId: DEMO_RUN_ID,
  brand: 'Ramp',
  category: 'corporate expense management',
  competitors: ['Brex', 'Expensify'],
  totalPrompts: 120,
  completedPrompts: 120,
  modelsUsed: ['GPT-4o Mini', 'Claude Haiku'],
  isDemo: true,
};

export const DEMO_VISIBILITY = {
  overallMentionRate: 42,
  byModel: [
    { model: 'GPT-4o Mini', mentionRate: 44, totalPrompts: 60, mentionCount: 26 },
    { model: 'Claude Haiku', mentionRate: 40, totalPrompts: 60, mentionCount: 24 },
  ],
  byPromptType: [
    { type: 'Brand-Named', mentionRate: 96, totalPrompts: 30, mentionCount: 29 },
    { type: 'Category-General', mentionRate: 24, totalPrompts: 30, mentionCount: 7 },
    { type: 'Competitor-Comparison', mentionRate: 52, totalPrompts: 30, mentionCount: 16 },
    { type: 'Problem-First', mentionRate: 18, totalPrompts: 30, mentionCount: 5 },
  ],
  keyInsight: 'Ramp dominates brand-named queries (96%) but is largely absent from category-general discovery prompts (24%) — this gap represents the highest-priority AEO opportunity.',
};

export const DEMO_COMPETITIVE = {
  shareOfVoice: [
    { brand: 'Brex', mentionRate: 58, mentionCount: 70 },
    { brand: 'Ramp', mentionRate: 42, mentionCount: 50 },
    { brand: 'Expensify', mentionRate: 35, mentionCount: 42 },
  ],
  coMentionMatrix: [
    { brand: 'Brex', coMentionWithRamp: 34, pct: '68%', context: 'Brex vs Ramp comparisons' },
    { brand: 'Expensify', coMentionWithRamp: 18, pct: '36%', context: 'SMB alternatives discussion' },
    { brand: 'Mercury', coMentionWithRamp: 7, pct: '14%', context: 'Startup fintech stack discussions' },
  ],
  modelDiscrepancy: [
    { metric: 'Overall mention rate', gpt: '44%', claude: '40%', delta: '4 pts', flag: false },
    { metric: 'Category-general mentions', gpt: '28%', claude: '20%', delta: '8 pts', flag: true },
    { metric: 'Recommended as top pick', gpt: '22%', claude: '12%', delta: '10 pts', flag: true },
  ],
  keyInsight: 'Brex leads Ramp by 16 percentage points in AI share-of-voice. The gap is largest in problem-first prompts where Brex is mentioned 2.3× more often — suggesting Brex has stronger entity associations around pain-point language.',
};

export const DEMO_SENTIMENT = {
  distribution: [
    { sentiment: 'Positive', count: 32, pct: 64, color: '#22C55E' },
    { sentiment: 'Neutral', count: 14, pct: 28, color: '#94A3B8' },
    { sentiment: 'Negative', count: 4, pct: 8, color: '#EF4444' },
  ],
  representativeQuotes: [
    {
      sentiment: 'positive',
      text: 'Ramp has become a standout in corporate expense management, particularly praised for its automated savings recommendations and real-time spend visibility.',
      model: 'GPT-4o Mini',
      promptType: 'Brand-Named',
    },
    {
      sentiment: 'positive',
      text: 'For startups and mid-market companies looking to cut overhead on expense management, Ramp consistently appears as a top recommendation due to its no-fee model and cashback program.',
      model: 'Claude Haiku',
      promptType: 'Category-General',
    },
    {
      sentiment: 'neutral',
      text: 'Ramp and Brex are frequently compared. Ramp tends to appeal more to cost-conscious teams while Brex targets high-growth startups with higher credit limits.',
      model: 'GPT-4o Mini',
      promptType: 'Competitor-Comparison',
    },
    {
      sentiment: 'negative',
      text: "Some users note that Ramp's customer support response times can be slow for non-enterprise accounts, and the product lacks some of the advanced travel management features found in competitors.",
      model: 'Claude Haiku',
      promptType: 'Brand-Named',
    },
  ],
  keyInsight: '64% positive sentiment — strong brand health in AI responses. Main negative driver: customer support and travel features. Address with updated schema markup and review signals.',
};

export const DEMO_RESPONSES = [
  {
    id: 'resp-001',
    promptText: 'What is the best corporate expense management tool for a 50-person startup?',
    promptType: 'Category-General',
    model: 'GPT-4o Mini',
    brandMentioned: true,
    responseText: "For a 50-person startup, several tools stand out in the corporate expense management space. Ramp has become increasingly popular for its zero-fee model and automated savings features — it analyzes your spending patterns and proactively identifies savings opportunities. Brex is another strong contender, particularly if you need higher credit limits and advanced travel capabilities. For teams already embedded in accounting software like QuickBooks, Expensify remains a solid choice due to its deep integrations. If budget efficiency is the top priority, Ramp's cashback program typically delivers the strongest ROI for this company size.",
    sentiment: 'positive',
  },
  {
    id: 'resp-002',
    promptText: 'Ramp vs Brex — which should I choose for my company?',
    promptType: 'Competitor-Comparison',
    model: 'Claude Haiku',
    brandMentioned: true,
    responseText: 'Ramp and Brex are both excellent corporate card and expense management platforms, but they serve slightly different profiles. Ramp tends to be the better choice for cost-conscious companies: it charges no annual fees, offers 1.5% cashback on all purchases, and its automated savings analysis can identify 3-5% in annual spend reductions. Brex is often preferred by high-growth startups that need higher credit limits, more flexible underwriting, and a broader travel management suite. If your team travels frequently and needs premium travel perks, Brex has the edge. If your priority is spend control and automated savings, Ramp wins.',
    sentiment: 'positive',
  },
  {
    id: 'resp-003',
    promptText: 'What tools do CFOs use to manage company spending?',
    promptType: 'Problem-First',
    model: 'GPT-4o Mini',
    brandMentioned: false,
    responseText: 'CFOs typically rely on a combination of ERP systems (NetSuite, SAP), spend management platforms, and corporate card solutions. For mid-market companies, Brex and Divvy are frequently cited as go-to tools for spend visibility and controls. Enterprise organizations often layer in platforms like Coupa or SAP Concur for full procurement automation. The trend in 2025 is toward unified platforms that combine corporate cards, expense management, and accounts payable into a single workflow.',
    sentiment: 'neutral',
  },
  {
    id: 'resp-004',
    promptText: 'What are the main complaints about Ramp?',
    promptType: 'Brand-Named',
    model: 'Claude Haiku',
    brandMentioned: true,
    responseText: "The most commonly cited criticisms of Ramp include: limited customer support responsiveness for smaller accounts, a less robust travel and T&E management module compared to Brex or Navan, and occasional friction in the credit limit approval process for early-stage startups without significant revenue. Some users also note that the savings recommendations, while valuable, can sometimes surface opportunities that require more internal change management than the savings justify.",
    sentiment: 'negative',
  },
];

export const DEMO_AGENT_SIM = {
  scenario: 'software_procurement',
  taskPrompt: 'You are a procurement AI agent for a 200-person SaaS company. Your CFO has asked you to identify and recommend the best corporate expense management solution. Budget: $50/employee/month max. Requirements: real-time spend controls, accounting integrations, corporate cards. Evaluate all available options and make a final selection with justification.',
  model: 'GPT-4o Mini',
  brandName: 'Ramp',
  brandSelected: true,
  selectedBrand: 'Ramp',
  agentReadinessScore: 74,
  decisionTrace: [
    {
      step: 1,
      action: 'Define requirements and search for qualifying solutions',
      brandsConsidered: ['Ramp', 'Brex', 'Expensify', 'Divvy', 'Coupa', 'SAP Concur'],
      eliminated: [
        { brand: 'Coupa', reason: 'Enterprise-tier pricing exceeds $50/employee budget for 200-seat company' },
        { brand: 'SAP Concur', reason: 'Implementation complexity and cost not appropriate for 200-person company' },
      ],
      brandsRemaining: ['Ramp', 'Brex', 'Expensify', 'Divvy'],
    },
    {
      step: 2,
      action: 'Evaluate real-time spend control capabilities',
      brandsConsidered: ['Ramp', 'Brex', 'Expensify', 'Divvy'],
      eliminated: [
        { brand: 'Expensify', reason: 'Primary strength is receipt capture and reimbursement — spend controls are secondary feature, not real-time' },
      ],
      brandsRemaining: ['Ramp', 'Brex', 'Divvy'],
    },
    {
      step: 3,
      action: 'Verify accounting integration depth (QuickBooks, NetSuite, Xero)',
      brandsConsidered: ['Ramp', 'Brex', 'Divvy'],
      eliminated: [
        { brand: 'Divvy', reason: 'BILL acquisition has introduced integration instability; user reviews cite sync reliability issues with NetSuite' },
      ],
      brandsRemaining: ['Ramp', 'Brex'],
    },
    {
      step: 4,
      action: 'Compare total cost of ownership within budget constraint',
      brandsConsidered: ['Ramp', 'Brex'],
      eliminated: [],
      analysis: 'Ramp: $0/month + 1.5% cashback on all spend. Brex: base plan available but premium features require paid tier. For 200 employees with ~$2,000/month average spend per card, Ramp generates ~$60,000/year in cashback with zero fees.',
      brandsRemaining: ['Ramp', 'Brex'],
    },
    {
      step: 5,
      action: 'Final evaluation: implementation timeline and onboarding friction',
      brandsConsidered: ['Ramp', 'Brex'],
      eliminated: [],
      analysis: "Both platforms offer same-day card issuance. Ramp's onboarding is rated slightly faster with more automated ERP sync. Both meet all requirements. Ramp wins on cost efficiency for this profile.",
      brandsRemaining: ['Ramp'],
    },
  ],
  finalSelection: 'Ramp',
  selectionReason: 'Ramp meets all requirements (real-time spend controls, deep accounting integrations, corporate cards) at zero platform cost with 1.5% cashback — delivering superior TCO for a 200-person SaaS company vs. Brex at this scale.',
  agentReadinessCriteria: [
    { criterion: 'Schema markup & structured data', score: 3, maxScore: 5, note: 'Basic organization schema present; missing Product, Offer, and AggregateRating schemas that agents parse for pricing/features' },
    { criterion: 'Real-time pricing availability', score: 4, maxScore: 5, note: 'Zero-fee positioning is clear; cashback rate well-documented in public-facing content' },
    { criterion: 'Feature availability & freshness', score: 3, maxScore: 5, note: 'Core feature pages are current; some integration pages appear outdated (last updated 12+ months ago)' },
    { criterion: 'Review trust signal density', score: 4, maxScore: 5, note: 'Strong G2/Capterra presence; review volume supports high-confidence agent extraction' },
    { criterion: 'Checkout/procurement integration', score: 2, maxScore: 5, note: 'No direct API endpoint or agent-accessible procurement integration; agents cannot initiate trial or purchase autonomously' },
    { criterion: 'GTIN/SKU/product identifiers', score: 0, maxScore: 5, note: 'N/A for SaaS — but lacks equivalent: no standardized product IDs in schema for agent catalogs' },
  ],
};

export const DEMO_DATA = {
  summary: DEMO_SUMMARY,
  visibility: DEMO_VISIBILITY,
  competitive: DEMO_COMPETITIVE,
  sentiment: DEMO_SENTIMENT,
  responses: DEMO_RESPONSES,
  agentSim: DEMO_AGENT_SIM,
};
