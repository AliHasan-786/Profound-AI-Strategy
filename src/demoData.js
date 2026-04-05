/**
 * Re-export demo data for client-side use (agent sim demo trace).
 * The full demo cache lives server-side in server/data/demoCache.js.
 */
export const DEMO_RESULTS = {
  agentSimulation: {
    id: 'demo-agent-sim-1',
    scenario_type: 'hotel_booking',
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
          reason: 'Holiday Inn has IHG Rewards but limited points earning vs Marriott Bonvoy, Hilton Honors, and World of Hyatt.',
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
          reason: 'Marriott Courtyard SFO offers the most accessible Bonvoy points earning rate, free breakfast with status, and full free cancellation.',
        },
      ],
      finalSelection: 'Marriott Courtyard SFO',
      primaryBrandConsidered: true,
      primaryBrandSelected: true,
      primaryBrandEliminatedAtStep: null,
    }),
  },
};
