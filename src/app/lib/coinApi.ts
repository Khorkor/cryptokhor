import axios, { AxiosError } from 'axios';

import { Coin } from '@/app/types/coin';
import { useCryptoStore } from '@/store/useCryptoStore';

export const coingeckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 10000,
});

// Cache setup
const cache = new Map<string, { data: Coin[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 min
const STALE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 h

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 sec

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleAPIError = (
  error: AxiosError | Error,
  cacheKey: string,
): Coin[] => {
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.warn("API failed, using fresh cached data");
    return cached.data;
  }

  if (cached && Date.now() - cached.timestamp < STALE_CACHE_DURATION) {
    console.warn("API failed, using stale cached data (may be outdated)");
    return cached.data;
  }

  console.error("API failed with no cached data available");
  throw new Error("Unable to fetch cryptocurrency data. Please try again.", {
    cause: error,
  });
};

const makeAPICall = async <T>(
  endpoint: string,
  params: Record<string, unknown>,
  retries = 1,
): Promise<T> => {
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION)
    return cached.data as T;

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      lastRequestTime = Date.now();
      const response = await coingeckoAPI.get<T>(endpoint, { params });
      cache.set(cacheKey, {
        data: response.data as Coin[],
        timestamp: Date.now(),
      });
      return response.data;
    } catch (error: unknown) {
      console.warn(
        `API attempt ${attempt + 1} failed:`,
        (error as Error).message,
      );
      if (attempt === retries)
        return handleAPIError(error as AxiosError, cacheKey) as T;
      await delay(1000);
    }
  }

  throw new Error("Failed to make API call after retries.");
};

// Fetch historical price data
export const getHistoricalPriceData = async (
  coinId: string,
  days = 1,
): Promise<{ prices: [number, number][] }> => {
  try {
    return await makeAPICall<{ prices: [number, number][] }>(
      `/coins/${coinId}/market_chart`,
      {
        vs_currency: "usd",
        days,
        interval: days === 1 ? "hourly" : "daily",
      },
    );
  } catch (error) {
    // Return empty prices array instead of throwing to avoid error boundary
    console.warn("Failed to fetch historical data, using fallback");
    return { prices: [] };
  }
};

// Fetch market data for all coins
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

// Fetch multiple coins by ids (batched). Uses /coins/markets with ids param.
export const getCoinsByIds = async (ids: string[]): Promise<Coin[]> => {
  if (!ids || ids.length === 0) return [];

  const batchSize = 100; // safe batch size
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize));
  }

  const results: Coin[] = [];
  for (const batch of batches) {
    try {
      const data = await makeAPICall<Coin[]>("/coins/markets", {
        vs_currency: "usd",
        ids: batch.join(","),
        order: "market_cap_desc",
        per_page: batch.length,
        page: 1,
        sparkline: false,
      });
      if (Array.isArray(data)) results.push(...data);
    } catch (err) {
      console.warn("Failed to fetch coins by ids for batch", batch, err);
    }
  }

  // Deduplicate by id
  const map = new Map<string, Coin>();
  results.forEach((c) => map.set(c.id, c));
  return Array.from(map.values());
};

// Fetch coins by category
export const getCoinsByCategory = async (
  category: string,
  per_page = 250,
): Promise<Coin[]> => {
  if (category === "watchlist") {
    const store = useCryptoStore.getState();
    return store.watchlist;
  }

  return await makeAPICall<Coin[]>("/coins/markets", {
    vs_currency: "usd",
    category,
    order: "market_cap_desc",
    per_page,
    page: 1,
    sparkline: false,
  });
};
