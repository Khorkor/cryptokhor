import axios from 'axios';

export const coingeckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 10000,
});

export const getCoinsMarkets = async (page = 1, per_page = 100) => {
  const response = await coingeckoAPI.get("/coins/markets", {
    params: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page,
      page,
      sparkline: false,
    },
  });
  return response.data;
};
