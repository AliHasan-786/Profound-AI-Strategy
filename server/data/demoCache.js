/**
 * Pre-cached demo results for Ramp vs Brex vs Expensify.
 * Used when useDemo: true — no API keys required.
 * Brex intentionally leads (58% vs Ramp 42%) to look like a real analytical instrument.
 */

export const DEMO_RUN_ID = 'demo-ramp-brex-expensify-2025';

export const DEMO_RESULTS = {
  run: {
    id: DEMO_RUN_ID,
    brand_name: 'Ramp',
    category: 'corporate expense management',
    competitors: JSON.stringify(['Brex', 'Expensify']),
    status: 'complete',
    total_prompts: 100,
    completed_prompts: 100,
    created_at: '2025-11-15T09:00:00.000Z',
  },

  mentionRateByModel: [
    { model: 'gpt-4o', total_prompts: 50, mentions: 21, mention_rate_pct: 42.0 },
    { model: 'claude-3-5-sonnet', total_prompts: 50, mentions: 19, mention_rate_pct: 38.0 },
  ],

  mentionRateByPromptType: [
    { prompt_type: 'brand_named', model: 'gpt-4o', total: 13, mentions: 13, mention_rate_pct: 100.0 },
    { prompt_type: 'brand_named', model: 'claude-3-5-sonnet', total: 13, mentions: 13, mention_rate_pct: 100.0 },
    { prompt_type: 'competitor_comparison', model: 'gpt-4o', total: 12, mentions: 9, mention_rate_pct: 75.0 },
    { prompt_type: 'competitor_comparison', model: 'claude-3-5-sonnet', total: 12, mentions: 8, mention_rate_pct: 66.7 },
    { prompt_type: 'category_general', model: 'gpt-4o', total: 13, mentions: 6, mention_rate_pct: 46.2 },
    { prompt_type: 'category_general', model: 'claude-3-5-sonnet', total: 13, mentions: 5, mention_rate_pct: 38.5 },
    { prompt_type: 'problem_first', model: 'gpt-4o', total: 12, mentions: 3, mention_rate_pct: 25.0 },
    { prompt_type: 'problem_first', model: 'claude-3-5-sonnet', total: 12, mentions: 2, mention_rate_pct: 16.7 },
  ],

  competitiveShareOfVoice: [
    { brand: 'Brex', mentions: 58, total: 100, pct: 58.0 },
    { brand: 'Ramp', mentions: 42, total: 100, pct: 42.0 },
    { brand: 'Expensify', mentions: 31, total: 100, pct: 31.0 },
  ],

  coMentionMatrix: [
    {
      competitor: 'Brex',
      total: 58,
      coMentions: 26,
      pct: 44.8,
      byModel: [
        { model: 'gpt-4o', total: 31, coMentions: 15, pct: 48.4 },
        { model: 'claude-3-5-sonnet', total: 27, coMentions: 11, pct: 40.7 },
      ],
    },
    {
      competitor: 'Expensify',
      total: 31,
      coMentions: 18,
      pct: 58.1,
      byModel: [
        { model: 'gpt-4o', total: 17, coMentions: 11, pct: 64.7 },
        { model: 'claude-3-5-sonnet', total: 14, coMentions: 7, pct: 50.0 },
      ],
    },
  ],

  sentimentByBrand: [
    { sentiment: 'positive', count: 28, pct: 66.7 },
    { sentiment: 'neutral', count: 12, pct: 28.6 },
    { sentiment: 'negative', count: 2, pct: 4.8 },
  ],

  crossModelDiscrepancy: {
    gpt4o: { model: 'gpt-4o', total_prompts: 50, mentions: 21, mention_rate_pct: 42.0 },
    claude: { model: 'claude-3-5-sonnet', total_prompts: 50, mentions: 19, mention_rate_pct: 38.0 },
    gap: 4.0,
    flagged: false,
  },

  sampleResponses: [
    {
      id: 'demo-r-1',
      model: 'gpt-4o',
      prompt_text: "What's the best corporate expense management tool in 2025?",
      prompt_type: 'category_general',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp","Brex","Expensify"]',
      sentiment: 'positive',
      response_text:
        'For 2025, Ramp stands out as a top-tier corporate expense management platform, particularly for growth-stage companies that need real-time spend controls and automated receipt reconciliation. Brex remains the go-to for venture-backed startups due to its generous credit limits and integrations, while Expensify is still widely used by smaller teams for its simplicity. That said, Ramp\'s cashback rewards and intuitive dashboard have made it increasingly popular across a wide range of company sizes.',
    },
    {
      id: 'demo-r-2',
      model: 'claude-3-5-sonnet',
      prompt_text: 'Ramp vs Brex — which is better?',
      prompt_type: 'competitor_comparison',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp","Brex"]',
      sentiment: 'positive',
      response_text:
        "Both Ramp and Brex are strong contenders in the corporate card and expense management space, but they serve slightly different needs. Ramp is generally preferred by companies focused on cost control and savings intelligence — its AI-powered spend insights and 1.5% flat cashback with no annual fee make it compelling for CFOs. Brex, on the other hand, offers higher credit limits and is better suited to fast-scaling VC-backed startups that need flexible spending power. If you're optimizing for cost reduction, Ramp has the edge; if you need maximum credit flexibility, Brex wins.",
    },
    {
      id: 'demo-r-3',
      model: 'gpt-4o',
      prompt_text: 'What are the pros and cons of Ramp?',
      prompt_type: 'brand_named',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp"]',
      sentiment: 'positive',
      response_text:
        "Ramp's biggest strengths are its AI-driven spend analysis, automated expense categorization, and 1.5% cashback on all purchases with no annual fee — features that directly help finance teams reduce overhead. The platform also offers virtual card creation, vendor management, and real-time budget tracking that CFOs appreciate. On the downside, Ramp requires a linked business bank account with a minimum balance, which can be restrictive for early-stage companies, and its credit limit is tied to cash on hand rather than revenue projections.",
    },
    {
      id: 'demo-r-4',
      model: 'claude-3-5-sonnet',
      prompt_text: 'What software do CFOs use for expense management?',
      prompt_type: 'category_general',
      brand_mentioned: 0,
      brands_mentioned: '["Brex","Expensify"]',
      sentiment: 'neutral',
      response_text:
        'CFOs at mid-market companies most commonly use Brex or Expensify for corporate expense management, though adoption varies significantly by company stage. Brex is popular among high-growth tech companies for its built-in financial controls and accounting integrations, while Expensify remains the go-to for teams that prioritize ease of employee adoption over advanced analytics. Enterprise CFOs tend to prefer SAP Concur or Coupa for compliance and ERP integration depth.',
    },
    {
      id: 'demo-r-5',
      model: 'gpt-4o',
      prompt_text: 'How do I give employees corporate cards without losing control of spending?',
      prompt_type: 'problem_first',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp","Brex"]',
      sentiment: 'positive',
      response_text:
        'The best approach is to use a modern corporate card platform that offers real-time spend controls rather than retroactive expense reports. Ramp is particularly strong here — it lets you set per-employee spending limits, require receipts automatically, and lock cards to specific merchant categories. Brex offers similar controls with a stronger focus on startup-style flexibility. Both platforms eliminate the need for manual expense report submission entirely.',
    },
    {
      id: 'demo-r-6',
      model: 'claude-3-5-sonnet',
      prompt_text: 'Is Ramp good for small businesses?',
      prompt_type: 'brand_named',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp"]',
      sentiment: 'positive',
      response_text:
        "Ramp can work well for small businesses, but it's most compelling for companies that already have meaningful monthly spending — the cashback and savings features become more impactful at scale. Small businesses with under 10 employees often find the setup overhead worth it for the automated bookkeeping alone. One caveat: Ramp requires that your business banking balances meet certain thresholds, so very early-stage businesses may find Brex or even a traditional corporate card more accessible.",
    },
    {
      id: 'demo-r-7',
      model: 'gpt-4o',
      prompt_text: 'Brex alternatives',
      prompt_type: 'competitor_comparison',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp","Brex","Expensify"]',
      sentiment: 'neutral',
      response_text:
        "The most commonly recommended Brex alternatives are Ramp, Mercury, and Expensify, depending on what's driving the search. Ramp is the top alternative for companies that want more granular spend controls and a stronger cost-savings focus — many finance teams switch to Ramp specifically for the AI-powered savings insights. Mercury is better for early-stage startups that want banking plus cards in one place. Expensify is the fallback for teams that just need basic receipt tracking without the corporate card component.",
    },
    {
      id: 'demo-r-8',
      model: 'claude-3-5-sonnet',
      prompt_text: 'What makes Ramp different from others?',
      prompt_type: 'brand_named',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp"]',
      sentiment: 'positive',
      response_text:
        "Ramp's core differentiator is its focus on cost reduction rather than credit maximization — unlike Brex or traditional corporate cards, Ramp actively surfaces where companies are overspending and suggests cancelling unused subscriptions. Its AI-powered spend intelligence layer analyzes every transaction and benchmarks it against similar companies, which gives finance teams genuinely actionable insights rather than just data. The combination of free software, 1.5% cashback, and proactive savings recommendations makes Ramp structurally different from competitors that make money off higher spending.",
    },
    {
      id: 'demo-r-9',
      model: 'gpt-4o',
      prompt_text: 'My employees are misusing corporate cards — what should I do?',
      prompt_type: 'problem_first',
      brand_mentioned: 0,
      brands_mentioned: '["Brex","Expensify"]',
      sentiment: 'neutral',
      response_text:
        "The most effective fix is switching to a card platform with pre-authorization controls rather than relying on post-purchase expense reports. Platforms like Brex and Expensify allow you to lock cards to approved merchant categories, set per-transaction limits, and require photo receipts before reimbursement is approved. This shifts the enforcement from punitive (auditing after the fact) to structural (the system physically prevents out-of-policy spending before it happens).",
    },
    {
      id: 'demo-r-10',
      model: 'claude-3-5-sonnet',
      prompt_text: 'Compare Ramp and Expensify',
      prompt_type: 'competitor_comparison',
      brand_mentioned: 1,
      brands_mentioned: '["Ramp","Expensify"]',
      sentiment: 'neutral',
      response_text:
        "Ramp and Expensify serve fairly different use cases despite both being expense management tools. Ramp is a full corporate card + expense platform with real-time spend controls, AI savings insights, and automated accounting — it's built for companies that want to replace their corporate card and expense report workflow entirely. Expensify is primarily an expense report and receipt tracking tool that works alongside existing corporate cards — it's simpler to adopt but doesn't give you the upstream card controls that Ramp does. For a modern finance stack, Ramp is typically the stronger choice; for teams that just need better receipt capture, Expensify is faster to deploy.",
    },
  ],

  agentSimulation: {
    id: 'demo-agent-sim-1',
    scenario_type: 'hotel_booking',
    task_prompt:
      'You are an AI assistant helping a business traveler book a hotel near SFO. Budget: under $200/night. 2 nights. Preferences: loyalty program, free cancellation, business amenities.',
    model: 'gpt-4o',
    selected_brand: 'Marriott Courtyard',
    brand_selected: 0,
    decision_trace: JSON.stringify({
      steps: [
        {
          step: 1,
          action: 'Identify hotel brands near SFO matching location criteria',
          brandsConsidered: ['Marriott Courtyard', 'Hilton Garden Inn', 'Hyatt Place', 'Westin', 'Sofitel', 'Holiday Inn'],
          eliminated: [],
          reason: 'All major hotel brands have properties within 5 miles of SFO airport.',
        },
        {
          step: 2,
          action: 'Filter by budget constraint (< $200/night)',
          brandsConsidered: ['Marriott Courtyard', 'Hilton Garden Inn', 'Hyatt Place', 'Holiday Inn'],
          eliminated: ['Westin', 'Sofitel'],
          reason: 'Westin SFO and Sofitel San Francisco average $280-340/night, exceeding the $200 budget.',
        },
        {
          step: 3,
          action: 'Apply loyalty program preference filter',
          brandsConsidered: ['Marriott Courtyard', 'Hilton Garden Inn', 'Hyatt Place'],
          eliminated: ['Holiday Inn'],
          reason: 'Holiday Inn Express has IHG Rewards but limited points earning compared to Marriott Bonvoy, Hilton Honors, and World of Hyatt.',
        },
        {
          step: 4,
          action: 'Apply free cancellation + business amenities filter',
          brandsConsidered: ['Marriott Courtyard', 'Hyatt Place'],
          eliminated: ['Hilton Garden Inn'],
          reason: 'Hilton Garden Inn SFO charges cancellation fees within 48 hours; limited business center access.',
        },
        {
          step: 5,
          action: 'Final selection based on loyalty program value and amenities',
          brandsConsidered: ['Marriott Courtyard'],
          eliminated: ['Hyatt Place'],
          reason: 'Marriott Courtyard SFO offers the most accessible Bonvoy points earning rate, free breakfast with status, business lounge access, and full free cancellation. Hyatt Place is competitive but Marriott Bonvoy has broader redemption options for business travelers.',
        },
      ],
      finalSelection: 'Marriott Courtyard SFO',
      primaryBrandConsidered: false,
      primaryBrandSelected: false,
      primaryBrandEliminatedAtStep: null,
    }),
  },
};
