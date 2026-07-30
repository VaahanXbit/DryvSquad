// src/config/searchRegistry.js

/**
 * Central registry for all static website pages and tools
 * Add new pages/tools here and they'll automatically appear in search
 */

export const searchRegistry = [
  // ========================================
  // TOOLS
  // ========================================
  {
    id: 'ev-range-calculator',
    type: 'tool',
    title: 'EV Range Calculator',
    description: 'Calculate electric vehicle range based on battery capacity, driving conditions, and weather.',
    keywords: ['ev', 'electric', 'range', 'calculator', 'battery', 'charging'],
    path: '/ev-range-calculator',
    icon: '⚡',
    priority: 10,
  },
  {
    id: 'auto-loan-emi-calculator',
    type: 'tool',
    title: 'Auto Loan EMI Calculator',
    description: 'Calculate your car loan EMI, interest costs, and total payment with easy monthly installments.',
    keywords: ['loan', 'emi', 'auto', 'car', 'finance', 'payment', 'interest', 'calculator'],
    path: '/auto-loan-emi-calculator',
    icon: '💰',
    priority: 10,
  },
  {
    id: 'used-car-valuation',
    type: 'tool',
    title: 'Used Car Valuation',
    description: 'Find the fair market value of your used car based on model, year, condition, and mileage.',
    keywords: ['used', 'car', 'valuation', 'price', 'resale', 'value', 'depreciation'],
    path: '/used-car-valuation',
    icon: '📊',
    priority: 10,
  },
  {
    id: 'ai-car-finder',
    type: 'tool',
    title: 'AI Car Finder',
    description: 'Find the perfect car for your needs with AI-powered recommendations based on your preferences.',
    keywords: ['ai', 'car', 'finder', 'recommendation', 'smart', 'assistant'],
    path: '/ai-car-finder',
    icon: '🤖',
    priority: 9,
  },

  // ========================================
  // MAIN PAGES
  // ========================================
  {
    id: 'compare-cars',
    type: 'page',
    title: 'Compare Cars',
    description: 'Compare cars side by side to find the perfect vehicle for your needs and budget.',
    keywords: ['compare', 'cars', 'comparison', 'specs', 'features', 'vs'],
    path: '/compare-cars',
    icon: '🔄',
    priority: 8,
  },
  {
    id: 'articles',
    type: 'page',
    title: 'Articles',
    description: 'Read expert articles on automotive topics, car reviews, and industry insights.',
    keywords: ['articles', 'blog', 'news', 'reviews', 'expert', 'insights'],
    path: '/articles',
    icon: '📰',
    priority: 5,
  },
  {
    id: 'travelogues',
    type: 'page',
    title: 'Travelogues',
    description: 'Explore road trip stories, travel experiences, and adventure journeys from fellow drivers.',
    keywords: ['travelogues', 'travel', 'road trip', 'adventure', 'journey', 'explore'],
    path: '/travelogues',
    icon: '🗺️',
    priority: 5,
  },
  {
    id: 'about',
    type: 'page',
    title: 'About DryvSquad',
    description: 'Learn about DryvSquad, your trusted partner for automotive information and car buying guidance.',
    keywords: ['about', 'company', 'team', 'mission', 'vision'],
    path: '/about',
    icon: 'ℹ️',
    priority: 5,
  },
  {
    id: 'contact',
    type: 'page',
    title: 'Contact Us',
    description: 'Get in touch with the DryvSquad team for support, inquiries, or feedback.',
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'feedback'],
    path: '/contact',
    icon: '📧',
    priority: 5,
  },
  {
    id: 'profile',
    type: 'page',
    title: 'My Profile',
    description: 'Manage your DryvSquad profile, preferences, and saved content.',
    keywords: ['profile', 'account', 'settings', 'preferences', 'user'],
    path: '/profile',
    icon: '👤',
    priority: 3,
  },

  // ========================================
  // LEAD PAGES
  // ========================================
  {
    id: 'loan-quotes',
    type: 'lead',
    title: 'Auto Loan Quotes',
    description: 'Get personalized auto loan quotes from leading banks and financial institutions.',
    keywords: ['loan', 'auto', 'car', 'finance', 'quotes', 'emi', 'interest', 'bank'],
    path: '/loan-quotes',
    icon: '🏦',
    priority: 7,
  },
  {
    id: 'insurance-quotes',
    type: 'lead',
    title: 'Insurance Quotes',
    description: 'Compare car insurance quotes and find the best coverage for your vehicle.',
    keywords: ['insurance', 'car', 'auto', 'coverage', 'policy', 'premium', 'quotes'],
    path: '/insurance-quotes',
    icon: '🛡️',
    priority: 7,
  },
];

/**
 * Get all registry items grouped by type
 */
export const getSearchRegistryByType = () => {
  const grouped = {};
  searchRegistry.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  });
  return grouped;
};

/**
 * Search the registry for matching items
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum results
 * @returns {Array} - Array of matching results
 */
export const searchRegistryItems = (query, maxResults = 10) => {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  searchRegistry.forEach(item => {
    // Check title, description, and keywords
    const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
    const descMatch = item.description.toLowerCase().includes(normalizedQuery);
    const keywordMatch = item.keywords.some(kw => 
      kw.toLowerCase().includes(normalizedQuery)
    );

    // Prioritize title matches over keyword matches
    let score = 0;
    let matchType = '';
    if (titleMatch) {
      score = 10;
      matchType = 'title';
    } else if (descMatch) {
      score = 5;
      matchType = 'description';
    } else if (keywordMatch) {
      score = 3;
      matchType = 'keyword';
    }

    if (score > 0) {
      results.push({
        ...item,
        score,
        matchType,
      });
    }
  });

  // Sort by score (title matches first)
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, maxResults);
};

/**
 * Get the type name for display
 */
export const getTypeDisplayName = (type) => {
  const map = {
    tool: 'Tools',
    page: 'Pages',
    lead: 'Lead Forms',
    article: 'Articles',
    travelogue: 'Travelogues',
  };
  return map[type] || type;
};