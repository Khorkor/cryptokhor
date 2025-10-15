// import { create } from 'zustand';
// import { createJSONStorage, persist } from 'zustand/middleware';

// import { Coin } from '@/app/types/coin';
// import { CategoryKey } from '@/app/types/coinCategories';

// interface CryptoState {
//   coins: Coin[];
//   isInitialized: boolean;
//   isLoading: boolean;
//   currentCategory: CategoryKey;
//   categoryCoins: Record<CategoryKey, Coin[]>;
//   watchlist: Coin[];

//   // Coins / categories
//   setCoins: (newCoins: Coin[]) => void;
//   initializeCoins: (initialCoins: Coin[]) => void;
//   setLoading: (loading: boolean) => void;
//   setCurrentCategory: (category: CategoryKey) => void;
//   setCategoryCoins: (category: CategoryKey, coins: Coin[]) => void;

//   // Watchlist
//   addToWatchlist: (coin: Coin) => void;
//   removeFromWatchlist: (coinId: string) => void;

//   // Update coin details (for details page)
//   updateCoinDetails: (coinId: string, details: Partial<Coin>) => void;
// }

// export const useCryptoStore = create<CryptoState>()(
//   persist(
//     (set, get) => ({
//       coins: [],
//       isInitialized: false,
//       isLoading: false,
//       currentCategory: "all",
//       categoryCoins: {} as Record<CategoryKey, Coin[]>,
//       watchlist: [],

//       setCoins: (newCoins) => set({ coins: newCoins }),
//       initializeCoins: (initialCoins) =>
//         set({
//           coins: initialCoins,
//           isInitialized: true,
//           categoryCoins: { ...get().categoryCoins, all: initialCoins },
//         }),
//       setLoading: (loading) => set({ isLoading: loading }),
//       setCurrentCategory: (category) => set({ currentCategory: category }),
//       setCategoryCoins: (category, coins) =>
//         set((state) => ({
//           categoryCoins: { ...state.categoryCoins, [category]: coins },
//           coins: category === state.currentCategory ? coins : state.coins,
//         })),

//       addToWatchlist: (coin) =>
//         set((state) => ({
//           watchlist: state.watchlist.some((c) => c.id === coin.id)
//             ? state.watchlist
//             : [...state.watchlist, coin],
//         })),
//       removeFromWatchlist: (coinId) =>
//         set((state) => ({
//           watchlist: state.watchlist.filter((c) => c.id !== coinId),
//         })),

//       updateCoinDetails: (coinId, details) =>
//         set((state) => ({
//           coins: state.coins.map((c) =>
//             c.id === coinId ? { ...c, ...details } : c,
//           ),
//           categoryCoins: Object.fromEntries(
//             Object.entries(state.categoryCoins).map(([cat, coins]) => [
//               cat,
//               coins.map((c) => (c.id === coinId ? { ...c, ...details } : c)),
//             ]),
//           ) as Record<CategoryKey, Coin[]>,
//         })),
//     }),
//     {
//       name: "crypto-storage",
//       storage: createJSONStorage(() => localStorage),
//       partialize: (state) => ({
//         watchlist: state.watchlist,
//       }),
//     },
//   ),
// );

// @/store/useCryptoStore.ts

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
  lastTableRefresh: number; // NEW: Timestamp for last successful API refresh

  // Coins / categories
  setCoins: (newCoins: Coin[]) => void;
  initializeCoins: (initialCoins: Coin[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCategory: (category: CategoryKey) => void;
  setCategoryCoins: (category: CategoryKey, coins: Coin[]) => void;
  setLastTableRefresh: (timestamp: number) => void; // NEW: Setter for refresh time

  // Watchlist
  addToWatchlist: (coin: Coin) => void;
  removeFromWatchlist: (coinId: string) => void;
  mergeWatchlistWithCoins: (newCoins: Coin[]) => Promise<void>;

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
      lastTableRefresh: 0, // NEW: Initialize to 0 (timestamp)

      setCoins: (newCoins) => set({ coins: newCoins }),
      // initializeCoins now sets the initial refresh time
      initializeCoins: (initialCoins) =>
        set({
          coins: initialCoins,
          isInitialized: true,
          categoryCoins: { ...get().categoryCoins, all: initialCoins },
          lastTableRefresh: Date.now(), // NEW: Set timestamp on initial load
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentCategory: (category) => set({ currentCategory: category }),

      // setCategoryCoins now updates the refresh time upon successful fetch
      setCategoryCoins: (category, coins) =>
        set((state) => ({
          categoryCoins: { ...state.categoryCoins, [category]: coins },
          coins: category === state.currentCategory ? coins : state.coins,
          lastTableRefresh: Date.now(), // NEW: Set timestamp on successful category fetch
        })),

      setLastTableRefresh: (timestamp) => set({ lastTableRefresh: timestamp }), // NEW ACTION
      // Merge watchlist entries with fresh coin data (newCoins may be from main refresh)
      mergeWatchlistWithCoins: async (newCoins: Coin[]) => {
        const store = get();
        const newMap = new Map(newCoins.map((c) => [c.id, c]));

        // Start with any watchlist items that exist in the freshly fetched coins
        const interimWatchlist = store.watchlist.map((w) =>
          newMap.has(w.id) ? { ...w, ...newMap.get(w.id) } : w,
        );

        // Determine which watchlist ids still need fetching
        const missingIds = interimWatchlist
          .filter((w) => !newMap.has(w.id))
          .map((w) => w.id);

        // Attempt to fetch missing ids
        let fetchedMap = new Map<string, Coin>();
        if (missingIds.length > 0) {
          try {
            const { getCoinsByIds } = await import("@/app/lib/coinApi");
            const fetched = await getCoinsByIds(missingIds);
            fetchedMap = new Map(fetched.map((c) => [c.id, c]));
          } catch {
            // ignore fetch errors and proceed with interimWatchlist
          }
        }

        // Combine maps (prioritize already-fetched newCoins then fetchedMap)
        const combinedMap = new Map<string, Coin>([...newMap, ...fetchedMap]);

        // Merge core market fields into watchlist items
        const finalWatchlist = store.watchlist.map((w) => {
          const updated = combinedMap.get(w.id);
          if (!updated) return w;

          return {
            ...w,
            current_price: updated.current_price ?? w.current_price,
            market_cap: updated.market_cap ?? w.market_cap,
            total_volume: updated.total_volume ?? w.total_volume,
            price_change_percentage_24h:
              updated.price_change_percentage_24h ??
              w.price_change_percentage_24h,
            market_cap_rank: updated.market_cap_rank ?? w.market_cap_rank,
            ath: updated.ath ?? w.ath,
            image: updated.image ?? w.image,
            name: updated.name ?? w.name,
            symbol: updated.symbol ?? w.symbol,
          } as Coin;
        });

        // Update main coins array where applicable
        const updatedCoins = store.coins.map((c) => {
          const updated = combinedMap.get(c.id);
          if (!updated) return c;
          return {
            ...c,
            current_price: updated.current_price ?? c.current_price,
            market_cap: updated.market_cap ?? c.market_cap,
            total_volume: updated.total_volume ?? c.total_volume,
            price_change_percentage_24h:
              updated.price_change_percentage_24h ??
              c.price_change_percentage_24h,
            market_cap_rank: updated.market_cap_rank ?? c.market_cap_rank,
            ath: updated.ath ?? c.ath,
          } as Coin;
        });

        // Update categoryCoins similar to coins
        const updatedCategoryCoins = Object.fromEntries(
          Object.entries(store.categoryCoins).map(([cat, coins]) => [
            cat,
            coins.map((c) => {
              const updated = combinedMap.get(c.id);
              if (!updated) return c;
              return {
                ...c,
                current_price: updated.current_price ?? c.current_price,
                market_cap: updated.market_cap ?? c.market_cap,
                total_volume: updated.total_volume ?? c.total_volume,
                price_change_percentage_24h:
                  updated.price_change_percentage_24h ??
                  c.price_change_percentage_24h,
                market_cap_rank: updated.market_cap_rank ?? c.market_cap_rank,
                ath: updated.ath ?? c.ath,
              } as Coin;
            }),
          ]),
        ) as Record<CategoryKey, Coin[]>;

        set({
          watchlist: finalWatchlist,
          coins: updatedCoins,
          categoryCoins: updatedCategoryCoins,
        });
      },

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
      // We don't want to persist lastTableRefresh, it should be 0 on page reload
      partialize: (state) => ({
        watchlist: state.watchlist,
      }),
    },
  ),
);
