import { CategoryKey, COIN_CATEGORIES } from '@/app/types/coinCategories';

import { FilterButton } from './FilterButtons';
import { RefreshButton } from './RefreshButton';

interface CategoryFilterProps {
  currentCategory: CategoryKey;
  isLoading: boolean;
  onCategoryChange: (category: CategoryKey) => Promise<void>;
}

export const CategoryFilter = ({
  currentCategory,
  isLoading,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <RefreshButton />
        {Object.entries(COIN_CATEGORIES).map(([key, { label }]) => (
          <FilterButton
            key={key}
            category={key as CategoryKey}
            currentCategory={currentCategory}
            isLoading={isLoading}
            onSelect={() => onCategoryChange(key as CategoryKey)}
            label={label}
          />
        ))}
      </div>
    </div>
  );
};
