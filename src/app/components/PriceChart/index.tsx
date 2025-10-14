"use client";

import {
    CategoryScale, Chart as ChartJS, ChartData, ChartOptions, Filler, Legend, LinearScale,
    LineElement, PointElement, Title, Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title,
);

interface PriceChartProps {
  coinId: string;
  currentPrice: number;
  isDarkMode?: boolean;
  currency?: string;
}

interface MarketChartResponse {
  prices: [number, number][];
}

const PriceChart = ({
  coinId,
  currentPrice,
  isDarkMode = false,
  currency = "usd",
}: PriceChartProps) => {
  const [chartData, setChartData] = useState<ChartData<"line"> | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=1`,
        );
        const data: MarketChartResponse = await res.json();

        if (data?.prices?.length > 0) {
          // Limit chart points to 1 per hour
          const hourlyMap = new Map<string, number>();
          data.prices.forEach(([timestamp, price]) => {
            const date = new Date(timestamp);
            const hour = date.getHours();
            hourlyMap.set(hour.toString(), price); // always use latest price for that hour
          });

          // Sort hours ascending
          const sortedHours = Array.from(hourlyMap.keys())
            .map(Number)
            .sort((a, b) => a - b);

          const labels = sortedHours.map((h) => {
            const date = new Date();
            date.setHours(h, 0, 0, 0);
            return date.toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            });
          });

          const values = sortedHours.map((h) => hourlyMap.get(h.toString())!);

          // Ensure latest hour shows current price
          const currentHourLabel = new Date().toLocaleTimeString([], {
            hour: "numeric",
            hour12: true,
          });
          if (labels[labels.length - 1] !== currentHourLabel) {
            labels.push(currentHourLabel);
            values.push(currentPrice);
          } else {
            values[values.length - 1] = currentPrice;
          }

          const chart: ChartData<"line"> = {
            labels,
            datasets: [
              {
                label: "Price (USD)",
                data: values,
                borderColor: "#4ade80",
                backgroundColor: "rgba(74, 222, 128, 0.2)",
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
              },
            ],
          };

          setChartData(chart);
        }
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      }
    };

    fetchChartData();
  }, [coinId, currentPrice, currency]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Hourly Price Chart (Updated: ${new Date().toLocaleTimeString()})`,
        color: isDarkMode ? "#fff" : "#111827",
        font: { size: 14 },
        padding: { bottom: 15 },
      },
      tooltip: {
        backgroundColor: isDarkMode
          ? "rgba(31,41,55,0.8)"
          : "rgba(255,255,255,0.8)",
        titleColor: isDarkMode ? "#fff" : "#111827",
        bodyColor: isDarkMode ? "#d1d5db" : "#4b5563",
        displayColors: false,
        callbacks: {
          label: (context) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 6,
            }).format(context.parsed.y as number),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: isDarkMode ? "#9ca3af" : "#6b7280", maxRotation: 0 },
        grid: {
          color: isDarkMode ? "rgba(107,114,128,0.2)" : "rgba(229,231,235,0.6)",
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          callback: (value) => {
            const num = Number(value);
            if (num >= 1000) return `$${(num / 1000).toFixed(1)}k`;
            return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
          },
        },
        grid: {
          color: isDarkMode ? "rgba(107,114,128,0.2)" : "rgba(229,231,235,0.6)",
        },
      },
    },
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-[250px] flex-1 md:h-[40vh]">
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-center text-gray-400">Loading chart...</p>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">
        Times shown in local timezone
      </p>
    </div>
  );
};

export default PriceChart;
