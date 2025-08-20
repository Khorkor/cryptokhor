"use client";

import { CategoryKey, COIN_CATEGORIES } from "@/app/types/coinCategories";

interface CategoryFilterProps {
  currentCategory: CategoryKey;
  isLoading: boolean;
  onCategoryChange: (category: CategoryKey) => void;
}

export const CategoryFilter = ({
  currentCategory,
  isLoading,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {Object.entries(COIN_CATEGORIES).map(([key, category]) => (
        <button
          key={key}
          onClick={() => onCategoryChange(key as CategoryKey)}
          disabled={isLoading}
          className={`transform rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            currentCategory === key
              ? "border-blue-600 bg-blue-600 text-white shadow-md"
              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
          }`}
        >
          {isLoading && currentCategory === key ? (
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
              <span>{category.label}</span>
            </div>
          ) : (
            category.label
          )}
        </button>
      ))}
    </div>
  );
};
