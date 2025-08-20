"use client";

import { Coin } from "@/app/types/coin";
import { CategoryKey } from "@/app/types/coinCategories";

interface TableEmptyStateProps {
  colSpan: number;
  currentCategory: CategoryKey;
  watchlist: Coin[];
  globalFilter: string;
}

export const TableEmptyState = ({
  colSpan,
  currentCategory,
  watchlist,
  globalFilter,
}: TableEmptyStateProps) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-6 text-center text-gray-600 dark:text-gray-300"
      >
        {currentCategory === "watchlist" && watchlist.length === 0
          ? "Your watchlist is empty."
          : globalFilter
            ? "The coin you searched is not in the top 250 coins."
            : null}
      </td>
    </tr>
  );
};
