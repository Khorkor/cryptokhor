"use client";

import { useEffect } from 'react';

import { useCryptoStore } from '@/store/useCryptoStore';

import type Coin from "@/app/types/coin";

interface CryptoProviderProps {
  initialCoins: Coin[];
  children: React.ReactNode;
}

export default function CryptoProvider({
  initialCoins,
  children,
}: CryptoProviderProps) {
  const setCoins = useCryptoStore((state) => state.setCoins);

  useEffect(() => {
    setCoins(initialCoins);
  }, [initialCoins, setCoins]);

  return <>{children}</>;
}
