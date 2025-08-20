"use client";

import { Coin } from "@/app/types/coin";

interface PortfolioButtonProps {
  coin: Coin;
}

export const PortfolioButton = ({ coin }: PortfolioButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Add to portfolio:", coin.name);
  };
  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        className="transform cursor-pointer rounded-lg p-2 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-yellow-50 hover:text-yellow-600 active:scale-95 dark:hover:bg-yellow-900/20"
        title="Add to Portfolio"
        aria-label={`Add ${coin.name} to portfolio`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    </div>
  );
};
