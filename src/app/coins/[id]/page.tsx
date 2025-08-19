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

  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!coinId) return;

    // Find coin in store
    const foundCoin = coins.find((c) => c.id === coinId);
    if (foundCoin) setCoin(foundCoin);

    // Prepare chart: simulate 24h prices (here just example with random fluctuations)
    if (foundCoin) {
      const prices: number[] = [];
      const labels: string[] = [];
      const now = Date.now();
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        labels.push(`${time.getHours()}:00`);
        prices.push(
          +(foundCoin.current_price * (0.95 + Math.random() * 0.1)).toFixed(2),
        ); // example fluctuation ±5%
      }
      setChartData(prices);
      setChartLabels(labels);
    }
  }, [coinId, coins]);

  if (!coin) return <div className="py-20 text-center">Coin not found</div>;

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: `${coin.name} Price (USD)`,
        data: chartData,
        borderColor: "#4ade80", // green for light theme
        backgroundColor: "rgba(74, 222, 128, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Last 24h Price Chart",
      },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Left column - Coin info */}
        <div className="space-y-4 rounded-xl bg-gray-900 p-6 text-white shadow-md dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <Image
              src={coin.image}
              alt={coin.name}
              width={58}
              height={58}
              className="rounded-full"
            />
            <h2 className="text-2xl font-bold">
              {coin.name} ({coin.symbol.toUpperCase()})
            </h2>
          </div>
          <div className="space-y-1">
            <p>
              <span className="font-semibold">Current Price:</span> $
              {coin.current_price.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Market Cap:</span> $
              {coin.market_cap.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">24h Volume:</span> $
              {coin.total_volume.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">ATH:</span> $
              {coin.ath?.toLocaleString() ?? "N/A"} (
              {coin.ath_change_percentage?.toFixed(2) ?? "0"}%)
            </p>
            <p>
              <span className="font-semibold">Market Cap Rank:</span>{" "}
              {coin.market_cap_rank}
            </p>
            <p>
              <span className="font-semibold">Circulating Supply:</span>{" "}
              {coin.circulating_supply?.toLocaleString() ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold">Total Supply:</span>{" "}
              {coin.total_supply?.toLocaleString() ?? "N/A"}
            </p>
            <p>
              <span className="font-semibold">Max Supply:</span>{" "}
              {coin.max_supply?.toLocaleString() ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Right column - Chart */}
        <div className="rounded-xl bg-gray-900 p-6 shadow-md dark:bg-gray-800">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
