"use client";

import { CategoryKey, COIN_CATEGORIES } from "@/app/types/coinCategories";

interface TableLoadingOverlayProps {
  currentCategory: CategoryKey;
}

export const TableLoadingOverlay = ({
  currentCategory,
}: TableLoadingOverlayProps) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 dark:bg-gray-900/50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Loading {COIN_CATEGORIES[currentCategory].label} coins...
        </p>
      </div>
    </div>
  );
};
