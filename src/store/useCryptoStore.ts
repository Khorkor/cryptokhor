import { create } from 'zustand';

import Coin from '@/app/types/coin';
import type { CategoryKey } from '@/app/lib/coinApi';

interface CryptoState {
  coins: Coin[];
  isInitialized: boolean;
  isLoading: boolean;
  currentCategory: CategoryKey;
  categoryCoins: Record<CategoryKey, Coin[]>;
  setCoins: (newCoins: Coin[]) => void;
  initializeCoins: (initialCoins: Coin[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCategory: (category: CategoryKey) => void;
  setCategoryCoins: (category: CategoryKey, coins: Coin[]) => void;
  // add watchlist, portfolio state/actions here too
}

export const useCryptoStore = create<CryptoState>((set, get) => ({
  coins: [],
  isInitialized: false,
  isLoading: false,
  currentCategory: 'all',
  categoryCoins: {} as Record<CategoryKey, Coin[]>,
  
  setCoins: (newCoins) => set({ coins: newCoins }),
  initializeCoins: (initialCoins) => set({ 
    coins: initialCoins, 
    isInitialized: true,
    categoryCoins: { ...get().categoryCoins, all: initialCoins }
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setCategoryCoins: (category, coins) => set({ 
    categoryCoins: { ...get().categoryCoins, [category]: coins },
    coins: category === get().currentCategory ? coins : get().coins
  }),
}));
