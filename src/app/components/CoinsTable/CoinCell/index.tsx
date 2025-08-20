"use client";

import Image from "next/image";

import { Coin } from "@/app/types/coin";

interface CoinCellProps {
  coin: Coin;
}

export const CoinCell = ({ coin }: CoinCellProps) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <Image
          src={coin.image}
          alt={coin.name}
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>
      <div className="text-left">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {coin.name}
        </div>
        <div className="text-sm text-gray-500 uppercase dark:text-gray-400">
          {coin.symbol}
        </div>
      </div>
    </div>
  );
};
