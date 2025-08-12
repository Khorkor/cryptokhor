import { create } from 'zustand';

import Coin from '@/app/types/coin';

interface CryptoState {
  coins: Coin[];
  setCoins: (newCoins: Coin[]) => void;
  // add watchlist, portfolio state/actions here too
}

export const useCryptoStore = create<CryptoState>((set) => ({
  coins: [],
  setCoins: (newCoins) => set({ coins: newCoins }),
}));
