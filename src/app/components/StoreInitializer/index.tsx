"use client";

import { useEffect } from 'react';

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
    if (!isInitialized && initialCoins.length > 0) {
      initializeCoins(initialCoins);
    }
  }, [initialCoins, initializeCoins, isInitialized]);

  return null;
}
