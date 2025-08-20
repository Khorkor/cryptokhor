"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import { TableLoadingOverlay } from "@/app/components/CoinsTable/LoadingOverlay";
import { Coin } from "@/app/types/coin";
import { useCryptoStore } from "@/store/useCryptoStore";

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
    const prices: number[] = [];
    const labels: string[] = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000);
      labels.push(`${time.getHours()}:00`);
      prices.push(
        +(coinData.current_price * (0.95 + Math.random() * 0.1)).toFixed(2),
      );
    }
    setChartData(prices);
    setChartLabels(labels);
  };

  if (loading || !coin) return <TableLoadingOverlay currentCategory="all" />;

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: `${coin.name} Price (USD)`,
        data: chartData,
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280" },
        grid: {
          color: isDarkMode
            ? "rgba(107, 114, 128, 0.2)"
            : "rgba(229, 231, 235, 0.6)",
          borderColor: isDarkMode ? "#374151" : "#d1d5db",
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          callback: (value: string | number) =>
            `$${Number(value).toLocaleString()}`,
        },
        grid: {
          color: isDarkMode
            ? "rgba(107, 114, 128, 0.2)"
            : "rgba(229, 231, 235, 0.6)",
          borderColor: isDarkMode ? "#374151" : "#d1d5db",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: isDarkMode ? "#e5e7eb" : "#111827" },
      },
      title: {
        display: true,
        text: "Last 24h Price Chart",
        color: isDarkMode ? "#f9fafb" : "#111827",
      },
      tooltip: {
        backgroundColor: isDarkMode
          ? "rgba(31, 41, 55, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        titleColor: isDarkMode ? "#f9fafb" : "#111827",
        bodyColor: isDarkMode ? "#d1d5db" : "#4b5563",
        callbacks: {
          label: (context: {
            dataset: { label?: string };
            parsed: { y: number };
          }) => {
            let label = context.dataset.label ?? "";
            if (label) label += ": ";
            label += new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 6,
            }).format(context.parsed.y);
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:flex md:max-h-[80vh] md:items-center md:overflow-hidden dark:border-gray-700 dark:bg-gray-900">
      <div className="grid h-full w-full grid-cols-1 gap-6 md:grid-cols-[1fr_2fr]">
        {/* Left info column */}
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
                className={`text-xs md:text-sm ${coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2 overflow-y-auto text-sm">
            {/* Key metrics + supply */}
            {[
              {
                label: "Market Cap",
                value: `$${coin.market_cap.toLocaleString()}`,
              },
              {
                label: "24h Volume",
                value: `$${coin.total_volume.toLocaleString()}`,
              },
              { label: "Market Cap Rank", value: `#${coin.market_cap_rank}` },
              {
                label: "ATH",
                value: `$${coin.ath?.toLocaleString() ?? "N/A"}`,
              },
              { label: "Circulating Supply", value: coin.circulating_supply },
              { label: "Total Supply", value: coin.total_supply },
              { label: "Max Supply", value: coin.max_supply },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {metric.value?.toLocaleString() ?? "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right chart column */}
        <div className="flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="h-[40vh] w-full md:h-full">
            <Line data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
