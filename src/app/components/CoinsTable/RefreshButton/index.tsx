"use client";

import { useState } from 'react';

import { getCoinsMarkets } from '@/app/lib/coinApi';
import { useCryptoStore } from '@/store/useCryptoStore';

export const RefreshButton = () => {
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const setCoins = useCryptoStore((state) => state.setCoins);
  const setLoading = useCryptoStore((state) => state.setLoading);
  const setLastTableRefresh = useCryptoStore(
    (state) => state.setLastTableRefresh,
  );
  const isLoading = useCryptoStore((state) => state.isLoading);

  const handleRefresh = async () => {
    if (refreshCooldown || isLoading) return;
    setLoading(true);
    try {
      const data = await getCoinsMarkets(1, 250);
      setCoins(data);
      setLastTableRefresh(Date.now());
      setRefreshCooldown(true);
      setTimeout(() => setRefreshCooldown(false), 10000); // 10-second cooldown
    } catch (error) {
      console.error("Failed to refresh coin data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading || refreshCooldown}
      className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 ${
        isLoading || refreshCooldown ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <svg
        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
};
