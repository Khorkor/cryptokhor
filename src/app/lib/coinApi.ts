import axios, { AxiosError } from 'axios';

import { useCryptoStore } from '@/store/useCryptoStore';

import type Coin from "@/app/types/coin";
export const coingeckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 10000,
});

// Enhanced cache with longer persistence for offline scenarios
// The `data` property is now explicitly typed as an array of `CoinMarketData`.
const cache = new Map<string, { data: Coin[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for emergency fallback

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // Increased to 2 seconds to prevent fast clicking issues

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Real-world error handling - Use cached data or throw error
// The `error` parameter is now typed as `AxiosError | Error` for better type safety.
const handleAPIError = (
  error: AxiosError | Error,
  cacheKey: string,
): Coin[] => {
  const cached = cache.get(cacheKey);

  // First try: Recent cache (preferred)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.warn("API failed, using fresh cached data");
    return cached.data;
  }

  // Second try: Stale cache (emergency fallback)
  if (cached && Date.now() - cached.timestamp < STALE_CACHE_DURATION) {
    console.warn("API failed, using stale cached data (may be outdated)");
    return cached.data;
  }

  // Last resort: Throw error for UI to handle gracefully
  console.error("API failed with no cached data available");
  throw new Error(
    `Unable to fetch cryptocurrency data. Please try again in a moment.`,
    { cause: error },
  );
};

// Enhanced API call with retry logic
// The function is now generic, allowing it to return a specific type `T`.
const makeAPICall = async <T>(
  endpoint: string,
  params: Record<string, unknown>,
  retries = 1,
): Promise<T> => {
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Type assertion is safe here as the data is checked against the cache key.
    return cached.data as T;
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
      const response = await coingeckoAPI.get<T>(endpoint, { params });

      // Cache successful response. We need to cast here as the cache expects CoinMarketData[]
      cache.set(cacheKey, {
        data: response.data as Coin[],
        timestamp: Date.now(),
      });

      return response.data;
    } catch (error: unknown) {
      // `unknown` is the safest type for caught errors.
      console.warn(
        `API attempt ${attempt + 1} failed:`,
        (error as Error).message,
      );

      // If it's the last attempt, handle the error
      if (attempt === retries) {
        // We cast the error to AxiosError to pass it to the handler
        return handleAPIError(error as AxiosError, cacheKey) as T;
      }

      // Wait before retry
      await delay(1000);
    }
  }
  // This line is needed to satisfy TypeScript's return requirements, though it's unreachable.
  throw new Error("Failed to make API call after retries.");
};

// Get general market data - fetch 1500 quality coins (avoids shitcoins)
// The function now returns a Promise with a specific type.
export const getCoinsMarkets = async (
  page = 1,
  per_page = 250,
): Promise<Coin[]> => {
  return await makeAPICall<Coin[]>("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page,
    page,
    sparkline: false,
  });
};

// Get coins by category - also increase for better coverage
// The function now returns a Promise with a specific type.

export const getCoinsByCategory = async (
  category: string,
  per_page = 250,
): Promise<Coin[]> => {
  // Return watchlist coins if the category is 'watchlist'
  if (category === "watchlist") {
    const store = useCryptoStore.getState();
    return store.watchlist;
  }

  return await makeAPICall<Coin[]>("/coins/markets", {
    vs_currency: "usd",
    category: category,
    order: "market_cap_desc",
    per_page,
    page: 1,
    sparkline: false,
  });
};
