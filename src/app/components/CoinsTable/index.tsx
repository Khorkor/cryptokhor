// app/CoinsTable.tsx
"use client";
import Image from 'next/image';

import { useCryptoStore } from '@/store/useCryptoStore';

export default function CoinsTable() {
  const coins = useCryptoStore((state) => state.coins);

  return (
    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
      <thead className="bg-gray-200 dark:bg-gray-800">
        <tr>
          <th className="border border-gray-300 p-2">Logo</th>
          <th className="border border-gray-300 p-2 text-left">Name</th>
          <th className="border border-gray-300 p-2">Price</th>
          <th className="border border-gray-300 p-2">Market Cap</th>
          <th className="border border-gray-300 p-2">24h Change</th>
        </tr>
      </thead>
      <tbody>
        {coins.map((coin) => (
          <tr
            key={coin.id}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <td className="border border-gray-300 p-2 text-center">
              <Image
                src={coin.image}
                alt={coin.name}
                width={24}
                height={24}
                className="inline-block"
              />
            </td>
            <td className="border border-gray-300 p-2">
              {coin.name} ({coin.symbol.toUpperCase()})
            </td>
            <td className="border border-gray-300 p-2 text-right">
              ${coin.current_price.toLocaleString()}
            </td>
            <td className="border border-gray-300 p-2 text-right">
              ${coin.market_cap.toLocaleString()}
            </td>
            <td
              className={`border border-gray-300 p-2 text-right ${
                coin.price_change_percentage_24h >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {coin.price_change_percentage_24h.toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
