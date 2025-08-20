"use client";

interface SearchBarProps {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
}

export const SearchBar = ({
  globalFilter,
  setGlobalFilter,
}: SearchBarProps) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search from top 250 coin"
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};
