"use client";

import {
    CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip
} from 'chart.js';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TableLoadingOverlay } from '@/app/components/CoinsTable/LoadingOverlay';
import PriceChart from '@/app/components/PriceChart';
import { Coin } from '@/app/types/coin';
import { useCryptoStore } from '@/store/useCryptoStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const DetailsPage = () => {
  const params = useParams();
  const coinId = params.id;

  const coins = useCryptoStore((state) => state.coins);
  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(false);

  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (!coinId) return;

    const foundCoin = coins.find((c) => c.id === coinId);
    if (foundCoin) {
      setCoin(foundCoin);
      generateChart(foundCoin);
    } else {
      setLoading(true);
      fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        .then((res) => res.json())
        .then((data) => {
          const mappedCoin: Coin = {
            id: data.id,
            name: data.name,
            symbol: data.symbol,
            image: data.image.large,
            current_price: data.market_data.current_price.usd,
            market_cap: data.market_data.market_cap.usd,
            total_volume: data.market_data.total_volume.usd,
            market_cap_rank: data.market_cap_rank,
            ath: data.market_data.ath.usd,
            circulating_supply: data.market_data.circulating_supply,
            total_supply: data.market_data.total_supply,
            max_supply: data.market_data.max_supply,
            price_change_percentage_24h:
              data.market_data.price_change_percentage_24h,
          };
          setCoin(mappedCoin);
          generateChart(mappedCoin);
        })
        .finally(() => setLoading(false));
    }
  }, [coinId, coins]);

  const generateChart = (coinData: Coin) => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/${coinData.id}/market_chart?vs_currency=usd&days=1`,
    )
      .then((res) => res.json())
      .then((data: { prices: [number, number][] }) => {
        let prices: number[] = [];
        let labels: string[] = [];

        if (data?.prices?.length > 0) {
          prices = data.prices.map(([, price]) => price);
          labels = data.prices.map(([timestamp]) =>
            new Date(timestamp).toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            }),
          );
        } else {
          // fallback
          const now = new Date();
          const basePrice = coinData.current_price;
          const priceChange = coinData.price_change_percentage_24h || 0;
          const startPrice = basePrice / (1 + priceChange / 100);

          for (let i = 24; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            labels.push(
              time.toLocaleTimeString([], { hour: "numeric", hour12: true }),
            );

            const progress = (24 - i) / 24;
            const estimatedPrice =
              startPrice + (basePrice - startPrice) * progress;
            prices.push(
              +(estimatedPrice * (0.99 + Math.random() * 0.02)).toFixed(2),
            );
          }
        }

        // Replace last price with currentPrice for accuracy
        if (prices.length > 0) {
          prices[prices.length - 1] = coinData.current_price;
        }

        setChartData(prices);
        setChartLabels(labels);
      })
      .catch(() => {
        // fallback if API fails completely
        const now = Date.now();
        const prices: number[] = [];
        const labels: string[] = [];
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now - i * 60 * 60 * 1000);
          labels.push(
            time.toLocaleTimeString([], { hour: "numeric", hour12: true }),
          );
          prices.push(coinData.current_price * (0.95 + Math.random() * 0.1));
        }
        setChartData(prices);
        setChartLabels(labels);
      });
  };

  if (loading || !coin) return <TableLoadingOverlay currentCategory="all" />;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-none border-0 bg-white p-0 shadow-sm md:flex md:rounded-lg md:border md:p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid h-full w-full grid-cols-1 gap-6 md:grid-cols-[1fr_2fr]">
        {/* Left Info */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Image
                src={coin.image}
                alt={coin.name}
                width={34}
                height={34}
                className="rounded-full md:h-12 md:w-12"
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                  {coin.name}
                </h2>
                <span className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
                  {coin.symbol.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 md:text-base dark:text-white">
                $
                {coin.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </p>
              <p
                className={`text-xs md:text-sm ${
                  coin.price_change_percentage_24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2 overflow-y-auto text-sm">
            {[
              {
                label: "Market Cap",
                value: `$${coin.market_cap?.toLocaleString() ?? "N/A"}`,
              },
              {
                label: "24h Volume",
                value: `$${coin.total_volume?.toLocaleString() ?? "N/A"}`,
              },
              {
                label: "Market Cap Rank",
                value: `#${coin.market_cap_rank ?? "N/A"}`,
              },
              {
                label: "ATH",
                value: `$${coin.ath?.toLocaleString() ?? "N/A"}`,
              },
              {
                label: "Circulating Supply",
                value: coin.circulating_supply?.toLocaleString() ?? "N/A",
              },
              {
                label: "Total Supply",
                value: coin.total_supply?.toLocaleString() ?? "N/A",
              },
              {
                label: "Max Supply",
                value: coin.max_supply?.toLocaleString() ?? "N/A",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
              </div>
            ))}
            <Link
              href="/"
              className="inline-block rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              ← Back to Markets
            </Link>
          </div>
        </div>

        {/* Right Chart */}
        <PriceChart
          coinId={coin.id}
          currentPrice={coin.current_price}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default DetailsPage;
