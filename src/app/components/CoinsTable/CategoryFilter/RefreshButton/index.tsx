import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { getCoinsMarkets } from '@/app/lib/coinApi';
import { useCryptoStore } from '@/store/useCryptoStore';

const COOLDOWN_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds

export const RefreshButton = () => {
  const {
    setLoading,
    setCoins,
    setCurrentCategory,
    setCategoryCoins,
    mergeWatchlistWithCoins,
  } = useCryptoStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const diff = Math.max(
        0,
        Math.ceil((COOLDOWN_TIME - (Date.now() - lastRefreshTime)) / 1000),
      );
      setSecondsRemaining(diff);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  const isRefreshDisabled = secondsRemaining > 0;

  const handleRefresh = useCallback(async () => {
    if (isRefreshDisabled || isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    try {
      const freshCoins = await getCoinsMarkets(1, 250);
      setCoins(freshCoins);
      setCurrentCategory("all");
      setCategoryCoins("all", freshCoins);

      // Refresh watchlist prices (merge results and fetch missing ids)
      try {
        await mergeWatchlistWithCoins(freshCoins);
      } catch (e) {
        console.warn("mergeWatchlistWithCoins failed", e);
      }

      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error("Failed to refresh coins:", error);
      alert("Failed to refresh data. Please try again later.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [
    isRefreshDisabled,
    isRefreshing,
    setCoins,
    setLoading,
    setCurrentCategory,
    setCategoryCoins,
    mergeWatchlistWithCoins,
  ]);

  const formatCountdown = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshDisabled}
      className={`flex h-9 items-center space-x-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isRefreshDisabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
      } `}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span>
        {isRefreshDisabled ? formatCountdown(secondsRemaining) : "Refresh"}
      </span>
    </button>
  );
};
