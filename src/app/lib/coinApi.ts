import axios from 'axios';

export const coingeckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 10000,
});

// Enhanced cache with longer persistence for offline scenarios
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for emergency fallback

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // Increased to 2 seconds to prevent fast clicking issues

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Real-world error handling - Use cached data or throw error
const handleAPIError = (error: any, cacheKey: string) => {
  const cached = cache.get(cacheKey);
  
  // First try: Recent cache (preferred)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.warn('API failed, using fresh cached data');
    return cached.data;
  }
  
  // Second try: Stale cache (emergency fallback)
  if (cached && Date.now() - cached.timestamp < STALE_CACHE_DURATION) {
    console.warn('API failed, using stale cached data (may be outdated)');
    return cached.data;
  }
  
  // Last resort: Throw error for UI to handle gracefully
  console.error('API failed with no cached data available');
  throw new Error(`Unable to fetch cryptocurrency data. Please try again in a moment.`);
};

// Enhanced API call with retry logic
const makeAPICall = async (endpoint: string, params: any, retries = 1) => {
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Rate limiting - prevent fast API calls
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      lastRequestTime = Date.now();
      const response = await coingeckoAPI.get(endpoint, { params });
      
      // Cache successful response
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error: any) {
      console.warn(`API attempt ${attempt + 1} failed:`, error.message);
      
      // If it's the last attempt, handle the error
      if (attempt === retries) {
        return handleAPIError(error, cacheKey);
      }
      
      // Wait before retry
      await delay(1000);
    }
  }
};

// Get general market data - fetch 1500 quality coins (avoids shitcoins)
export const getCoinsMarkets = async (page = 1, per_page = 1500) => {
  return await makeAPICall("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page,
    page,
    sparkline: false,
  });
};

// Get coins by category - also increase for better coverage
export const getCoinsByCategory = async (category: string, per_page = 500) => {
  return await makeAPICall("/coins/markets", {
    vs_currency: "usd",
    category: category,
    order: "market_cap_desc",
    per_page,
    page: 1,
    sparkline: false,
  });
};

// Available categories from CoinGecko API
export const COIN_CATEGORIES = {
  all: { 
    label: 'All Coins', 
    apiCategory: null,
    description: 'Top cryptocurrencies by market cap'
  },
  'meme-token': { 
    label: 'Meme', 
    apiCategory: 'meme-token',
    description: 'Meme-based cryptocurrencies'
  },
  'artificial-intelligence': { 
    label: 'AI', 
    apiCategory: 'artificial-intelligence',
    description: 'AI and machine learning tokens'
  },
  'gaming': { 
    label: 'Gaming', 
    apiCategory: 'gaming',
    description: 'Gaming and metaverse tokens'
  },
  'decentralized-finance-defi': { 
    label: 'DeFi', 
    apiCategory: 'decentralized-finance-defi',
    description: 'Decentralized finance protocols'
  },
  'layer-1': { 
    label: 'Layer 1', 
    apiCategory: 'layer-1',
    description: 'Layer 1 blockchain platforms'
  },
} as const;

export type CategoryKey = keyof typeof COIN_CATEGORIES;