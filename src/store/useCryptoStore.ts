import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Coin } from '@/app/types/coin';
import { CategoryKey } from '@/app/types/coinCategories';

interface CryptoState {
  coins: Coin[];
  isInitialized: boolean;
  isLoading: boolean;
  currentCategory: CategoryKey;
  categoryCoins: Record<CategoryKey, Coin[]>;
  watchlist: Coin[];

  // Coins / categories
  setCoins: (newCoins: Coin[]) => void;
  initializeCoins: (initialCoins: Coin[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCategory: (category: CategoryKey) => void;
  setCategoryCoins: (category: CategoryKey, coins: Coin[]) => void;

  // Watchlist
  addToWatchlist: (coin: Coin) => void;
  removeFromWatchlist: (coinId: string) => void;

  // Update coin details (for details page)
  updateCoinDetails: (coinId: string, details: Partial<Coin>) => void;
}

export const useCryptoStore = create<CryptoState>()(
  persist(
    (set, get) => ({
      coins: [],
      isInitialized: false,
      isLoading: false,
      currentCategory: "all",
      categoryCoins: {} as Record<CategoryKey, Coin[]>,
      watchlist: [],

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

      addToWatchlist: (coin) =>
        set((state) => ({
          watchlist: state.watchlist.some((c) => c.id === coin.id)
            ? state.watchlist
            : [...state.watchlist, coin],
        })),
      removeFromWatchlist: (coinId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((c) => c.id !== coinId),
        })),

      updateCoinDetails: (coinId, details) =>
        set((state) => ({
          coins: state.coins.map((c) =>
            c.id === coinId ? { ...c, ...details } : c,
          ),
          categoryCoins: Object.fromEntries(
            Object.entries(state.categoryCoins).map(([cat, coins]) => [
              cat,
              coins.map((c) => (c.id === coinId ? { ...c, ...details } : c)),
            ]),
          ) as Record<CategoryKey, Coin[]>,
        })),
    }),
    {
      name: "crypto-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchlist: state.watchlist,
      }),
    },
  ),
);
