"use client";

interface PriceChangeCellProps {
  value: number | null | undefined;
}

export const PriceChangeCell = ({ value }: PriceChangeCellProps) => {
  if (value === null || value === undefined) {
    return (
      <div className="text-center">
        <span className="text-gray-500 dark:text-gray-400">-</span>
      </div>
    );
  }
  return (
    <div className="text-center">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          value >= 0
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {value >= 0 ? "+" : ""}
        {value.toFixed(2)}%
      </span>
    </div>
  );
};
