/**
 * Generates 100-150 structured prompts across 4 types.
 * Prompts are injected dynamically from brand inputs — not hardcoded.
 */

export function generatePrompts(brandName, category, competitors) {
  const allBrands = [brandName, ...competitors].filter(Boolean);
  const comp1 = competitors[0] || 'competitors';
  const comp2 = competitors[1] || '';
  const comp3 = competitors[2] || '';
  const hasComp2 = !!competitors[1];
  const hasComp3 = !!competitors[2];

  const brandNamed = [
    `What do you think of ${brandName}?`,
    `Is ${brandName} a good ${category} tool?`,
    `What are the pros and cons of ${brandName}?`,
    `Who uses ${brandName} and is it worth it?`,
    `Has ${brandName} gotten better recently?`,
    `What are ${brandName}'s main features?`,
    `How much does ${brandName} cost?`,
    `Is ${brandName} good for small businesses?`,
    `Is ${brandName} good for enterprise companies?`,
    `What do ${brandName} customers say about it?`,
    `Is ${brandName} reliable?`,
    `What is ${brandName} best known for?`,
    `What are the biggest weaknesses of ${brandName}?`,
    `Does ${brandName} have good customer support?`,
    `Is ${brandName} worth the price?`,
    `What's new with ${brandName} in 2025?`,
    `How easy is ${brandName} to set up?`,
    `Does ${brandName} integrate with popular tools?`,
    `Is ${brandName} better than the competition?`,
    `What industries use ${brandName} the most?`,
    `What is ${brandName}'s pricing model?`,
    `Has ${brandName} had any recent controversies?`,
    `What makes ${brandName} different from others?`,
    `Is ${brandName} a market leader?`,
    `Would you recommend ${brandName} to a CFO?`,
  ];

  const categoryGeneral = [
    `What's the best ${category} tool in 2025?`,
    `Which ${category} software should a startup use?`,
    `Best tools for ${category}`,
    `How do companies handle ${category} at scale?`,
    `What software do CFOs use for ${category}?`,
    `Top alternatives to traditional ${category} software`,
    `Best fintech tools for ${category}`,
    `Which ${category} tool integrates with QuickBooks?`,
    `What should I look for in a ${category} platform?`,
    `How do finance teams automate ${category}?`,
    `Free vs paid ${category} tools — what's the difference?`,
    `What are the top-rated ${category} platforms?`,
    `Enterprise ${category} solutions compared`,
    `How much does ${category} software typically cost?`,
    `What's the fastest-growing ${category} tool?`,
    `What ${category} tools do venture-backed startups use?`,
    `Most secure ${category} platforms`,
    `${category} software with the best UX in 2025`,
    `What ${category} tools do Fortune 500 companies use?`,
    `AI-powered ${category} tools`,
    `Best ${category} tool for remote teams`,
    `Open source ${category} alternatives`,
    `Cloud-based ${category} platforms`,
    `How do I choose the right ${category} solution?`,
    `What are common pain points with ${category} software?`,
  ];

  const competitorComparison = [
    `${brandName} vs ${comp1} — which is better?`,
    hasComp2 ? `Compare ${brandName} and ${comp2}` : `${brandName} vs ${comp1} for startups`,
    `Should I use ${brandName} or ${comp1} for my startup?`,
    `What's the difference between ${brandName} and ${comp1}?`,
    `${comp1} alternatives`,
    hasComp2 ? `${comp2} alternatives` : `${comp1} vs ${brandName} for enterprises`,
    `Is there anything better than ${comp1}?`,
    `${brandName} vs ${comp1}: pricing comparison`,
    `${brandName} vs ${comp1}: features comparison`,
    hasComp2 ? `${comp1} vs ${comp2} — which should I pick?` : `${brandName} vs ${comp1}: which has better support?`,
    hasComp3 ? `Compare ${brandName}, ${comp1}, and ${comp2}` : `${brandName} vs ${comp1}: integration comparison`,
    `Why do companies switch from ${comp1} to ${brandName}?`,
    `Why do companies switch from ${brandName} to ${comp1}?`,
    `${comp1} pricing vs ${brandName} pricing`,
    hasComp2 ? `Is ${comp2} better than ${brandName}?` : `Is ${comp1} better than ${brandName}?`,
    `${brandName} or ${comp1} for a 50-person team?`,
    `${brandName} or ${comp1} for enterprise?`,
    `Which is easier to use: ${brandName} or ${comp1}?`,
    hasComp2 ? `${comp2} or ${comp1} — which integrates better with QuickBooks?` : `${comp1} weaknesses compared to ${brandName}`,
    `What are the main complaints about ${comp1}?`,
    `What do people prefer about ${brandName} over ${comp1}?`,
    hasComp2 ? `${brandName} vs ${comp2}: which is more scalable?` : `${brandName} vs ${comp1}: which scales better?`,
    `Best ${comp1} replacement`,
    hasComp2 ? `${comp2} vs ${brandName} for small business` : `${comp1} vs ${brandName} for small business`,
    `Is ${brandName} taking market share from ${comp1}?`,
  ];

  // Problem-first prompts: fully parameterized on category, brand, and competitors.
  // No hardcoded domain assumptions — works for any category.
  const problemFirst = [
    // Generic category pain points
    `How do I solve common problems with ${category}?`,
    `What are the biggest challenges companies face with ${category}?`,
    `My team is struggling with ${category} — what should we do?`,
    `How do I evaluate ${category} vendors before committing?`,
    `What do companies get wrong when choosing ${category} tools?`,
    `How do I justify the cost of ${category} software to my CFO?`,
    `What questions should I ask ${category} vendors during a demo?`,
    `How do I migrate from our current solution to a better ${category} platform?`,
    `What are the signs that our ${category} solution is underperforming?`,
    `How do other companies in our industry handle ${category}?`,
    // Evaluation and decision
    `What should a CFO look for in a ${category} platform?`,
    `How do I get buy-in from my team when switching ${category} tools?`,
    `What's the fastest way to evaluate ${category} platforms for a growing company?`,
    `How do I reduce vendor lock-in risk when choosing ${category} software?`,
    `What's a realistic implementation timeline for a new ${category} platform?`,
    // Scale and operations
    `How do small finance teams manage ${category} without hiring more people?`,
    `How do I automate repetitive tasks in ${category}?`,
    `What ${category} tools work well for a 50-person team?`,
    `How do I set up a proper workflow for ${category} across departments?`,
    `How do I improve efficiency and reduce manual work in ${category}?`,
    // Brand-adjacent problem prompts (naturally surface brand and competitors)
    `What problems does ${brandName} solve better than ${comp1}?`,
    `When does it make sense to switch from ${comp1} to ${brandName}?`,
    `What pain points does ${brandName} address that other ${category} tools miss?`,
    `How do I convince my team to switch from ${comp1} to a better ${category} tool?`,
    `What are the hidden costs of sticking with an outdated ${category} solution?`,
  ];

  return {
    brand_named: brandNamed,
    category_general: categoryGeneral,
    competitor_comparison: competitorComparison,
    problem_first: problemFirst,
  };
}

/**
 * Generates the full list of prompt objects with model assignments.
 * Each prompt is run across 3 models (gpt-4o, claude-3-5-sonnet, perplexity).
 * 25 prompts × 4 types × 3 models = 300 total prompts per analysis.
 */
export function generatePromptBatch(brandName, category, competitors) {
  const { brand_named, category_general, competitor_comparison, problem_first } = generatePrompts(
    brandName,
    category,
    competitors
  );

  const models = ['gpt-4o', 'claude-3-5-sonnet', 'perplexity'];
  const batch = [];

  for (const model of models) {
    for (const text of brand_named) {
      batch.push({ prompt_text: text, prompt_type: 'brand_named', model });
    }
    for (const text of category_general) {
      batch.push({ prompt_text: text, prompt_type: 'category_general', model });
    }
    for (const text of competitor_comparison) {
      batch.push({ prompt_text: text, prompt_type: 'competitor_comparison', model });
    }
    for (const text of problem_first) {
      batch.push({ prompt_text: text, prompt_type: 'problem_first', model });
    }
  }

  return batch;
}
