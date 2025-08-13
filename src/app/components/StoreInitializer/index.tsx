"use client";

import { useEffect } from 'react';
import { useCryptoStore } from '@/store/useCryptoStore';
import type Coin from "@/app/types/coin";

interface StoreInitializerProps {
  initialCoins: Coin[];
}

export default function StoreInitializer({ initialCoins }: StoreInitializerProps) {
  const { initializeCoins, isInitialized } = useCryptoStore();

  useEffect(() => {
    if (!isInitialized && initialCoins.length > 0) {
      initializeCoins(initialCoins);
    }
  }, [initialCoins, initializeCoins, isInitialized]);

  return null; // This component doesn't render anything
}