import { CategoryKey } from '@/app/types/coinCategories';

interface FilterButtonProps {
  category: CategoryKey;
  currentCategory: CategoryKey;
  isLoading: boolean;
  onSelect: () => void;
  label: string;
}

export const FilterButton = ({
  category,
  currentCategory,
  isLoading,
  onSelect,
  label,
}: FilterButtonProps) => {
  const isActive = category === currentCategory;

  return (
    <button
      onClick={onSelect}
      disabled={isLoading}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      {label}
    </button>
  );
};
