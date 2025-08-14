// store/useCryptoStore.ts
import { create } from 'zustand';

import Coin from '@/app/types/coin';
import { CategoryKey } from '@/app/types/coinCategories';

interface CryptoState {
  coins: Coin[];
  isInitialized: boolean;
  isLoading: boolean;
  currentCategory: CategoryKey;
  categoryCoins: Record<CategoryKey, Coin[]>;
  watchlist: Coin[];
  portfolio: Coin[];

  // Coins / categories
  setCoins: (newCoins: Coin[]) => void;
  initializeCoins: (initialCoins: Coin[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCategory: (category: CategoryKey) => void;
  setCategoryCoins: (category: CategoryKey, coins: Coin[]) => void;

  // Watchlist
  addToWatchlist: (coin: Coin) => void;
  removeFromWatchlist: (coinId: string) => void;

  // Portfolio
  addToPortfolio: (coin: Coin) => void;
  removeFromPortfolio: (coinId: string) => void;
}

export const useCryptoStore = create<CryptoState>((set, get) => ({
  coins: [],
  isInitialized: false,
  isLoading: false,
  currentCategory: "all",
  categoryCoins: {} as Record<CategoryKey, Coin[]>,
  watchlist: [],
  portfolio: [],

  // Coins / categories
  setCoins: (newCoins) => set({ coins: newCoins }),
  initializeCoins: (initialCoins) =>
    set({
      coins: initialCoins,
      isInitialized: true,
      categoryCoins: { ...get().categoryCoins, all: initialCoins },
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setCategoryCoins: (category, coins) =>
    set((state) => ({
      categoryCoins: { ...state.categoryCoins, [category]: coins },
      coins: category === state.currentCategory ? coins : state.coins,
    })),

  // Watchlist actions
  addToWatchlist: (coin) =>
    set((state) => {
      if (state.watchlist.some((c) => c.id === coin.id)) return state;
      return { watchlist: [...state.watchlist, coin] };
    }),
  removeFromWatchlist: (coinId) =>
    set((state) => ({
      watchlist: state.watchlist.filter((c) => c.id !== coinId),
    })),

  // Portfolio actions
  addToPortfolio: (coin) =>
    set((state) => {
      if (state.portfolio.some((c) => c.id === coin.id)) return state;
      return { portfolio: [...state.portfolio, coin] };
    }),
  removeFromPortfolio: (coinId) =>
    set((state) => ({
      portfolio: state.portfolio.filter((c) => c.id !== coinId),
    })),
}));
