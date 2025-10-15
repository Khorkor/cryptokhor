"use client";

import { useEffect } from 'react';

import { getCoinsMarkets } from '@/app/lib/coinApi';
import { Coin } from '@/app/types/coin';
import { useCryptoStore } from '@/store/useCryptoStore';

interface StoreInitializerProps {
  initialCoins: Coin[];
}

export default function StoreInitializer({
  initialCoins,
}: StoreInitializerProps) {
  const { initializeCoins, isInitialized } = useCryptoStore();

  useEffect(() => {
    if (!isInitialized) {
      if (initialCoins.length > 0) {
        initializeCoins(initialCoins);
      } else {
        // If no initial coins, fetch them on client side
        const fetchInitialCoins = async () => {
          try {
            const coins = await getCoinsMarkets(1, 250);
            initializeCoins(coins);
          } catch (error) {
            console.error("Failed to fetch initial coins:", error);
          }
        };
        fetchInitialCoins();
      }
    }
  }, [initialCoins, initializeCoins, isInitialized]);

  return null;
}
