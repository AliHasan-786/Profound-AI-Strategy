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

  const problemFirst = [
    `How do I reduce employee expense fraud?`,
    `How do I give employees corporate cards without losing control of spending?`,
    `What's the best way to manage receipts for a 50-person company?`,
    `How do finance teams automate ${category}?`,
    `My employees are misusing corporate cards — what should I do?`,
    `How do I get real-time visibility into company spending?`,
    `What's the easiest way to handle employee reimbursements?`,
    `How do I enforce spending policies automatically?`,
    `What's the best way to track SaaS subscriptions for a startup?`,
    `How do I reduce time spent on expense reports?`,
    `How can a small finance team manage hundreds of employee expenses?`,
    `What's the fastest way to close the books at month end?`,
    `How do I stop employees from over-spending on travel?`,
    `What should a CFO look for in a ${category} platform?`,
    `How do I improve cashback on company spending?`,
    `What tools help automate accounting reconciliation?`,
    `How do I give department heads budget visibility?`,
    `What's the best way to issue virtual cards to employees?`,
    `How do I manage multi-currency expenses for a global team?`,
    `How do I create an approval workflow for large purchases?`,
    `What's the easiest ${category} tool to get buy-in from employees?`,
    `How do I avoid manual data entry for expense reports?`,
    `What's the fastest way to set up spending limits for employees?`,
    `How do I audit employee expenses without micromanaging?`,
    `What tools help a startup scale its finance operations?`,
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
 * Each prompt is duplicated for both models (gpt-4o and claude-3-5-sonnet).
 */
export function generatePromptBatch(brandName, category, competitors) {
  const { brand_named, category_general, competitor_comparison, problem_first } = generatePrompts(
    brandName,
    category,
    competitors
  );

  const models = ['gpt-4o', 'claude-3-5-sonnet'];
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
