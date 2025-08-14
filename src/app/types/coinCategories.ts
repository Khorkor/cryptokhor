// Available categories from CoinGecko API
export const COIN_CATEGORIES = {
  watchlist: {
    label: "Watchlist",
    apiCategory: null, // no API call for this
    description: "Coins you added to your watchlist",
  },
  all: {
    label: "All Coins",
    apiCategory: null,
    description: "Top cryptocurrencies by market cap",
  },
  "meme-token": {
    label: "Meme",
    apiCategory: "meme-token",
    description: "Meme-based cryptocurrencies",
  },
  "artificial-intelligence": {
    label: "AI",
    apiCategory: "artificial-intelligence",
    description: "AI and machine learning tokens",
  },
  gaming: {
    label: "Gaming",
    apiCategory: "gaming",
    description: "Gaming and metaverse tokens",
  },
  "decentralized-finance-defi": {
    label: "DeFi",
    apiCategory: "decentralized-finance-defi",
    description: "Decentralized finance protocols",
  },
  "layer-1": {
    label: "Layer 1",
    apiCategory: "layer-1",
    description: "Layer 1 blockchain platforms",
  },
} as const;

export type CategoryKey = keyof typeof COIN_CATEGORIES;
