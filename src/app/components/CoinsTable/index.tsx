"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { getCoinsByCategory } from "@/app/lib/coinApi";
import { CategoryKey, COIN_CATEGORIES } from "@/app/types/coinCategories";
import { useCryptoStore } from "@/store/useCryptoStore";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type Coin from "@/app/types/coin";
const columnHelper = createColumnHelper<Coin>();

export default function CoinsTable() {
  const {
    coins,
    isLoading,
    currentCategory,
    categoryCoins,
    setLoading,
    setCurrentCategory,
    setCategoryCoins,
    setCoins,
    addToWatchlist,
    watchlist,
    removeFromWatchlist,
  } = useCryptoStore();

  const [globalFilter, setGlobalFilter] = useState("");

  const handleCategoryChange = useCallback(
    async (category: CategoryKey) => {
      if (category === currentCategory || isLoading) return;

      setCurrentCategory(category);

      // Watchlist category
      if (category === "watchlist") {
        setCoins(watchlist);
        return;
      }

      // Already loaded category
      if (categoryCoins[category]) {
        setCoins(categoryCoins[category]);
        return;
      }

      // "all" category
      if (category === "all" && categoryCoins.all) {
        setCoins(categoryCoins.all);
        return;
      }

      // Fetch from API
      if (COIN_CATEGORIES[category].apiCategory) {
        setLoading(true);
        try {
          const categoryData = await getCoinsByCategory(
            COIN_CATEGORIES[category].apiCategory!,
          );
          setCategoryCoins(category, categoryData);
          setCoins(categoryData);
        } catch (error) {
          console.error(`Failed to fetch ${category} coins:`, error);
          alert("Failed to load data. Please wait a moment and try again.");
        } finally {
          setLoading(false);
        }
      }
    },
    [
      currentCategory,
      categoryCoins,
      isLoading,
      setCoins,
      setCategoryCoins,
      setCurrentCategory,
      setLoading,
      watchlist,
    ],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("market_cap_rank", {
        header: "#",
        cell: (info) => (
          <div className="text-center">
            <span className="font-medium text-gray-500 dark:text-gray-400">
              {info.getValue() || "-"}
            </span>
          </div>
        ),
        size: 60,
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("name", {
        header: "Coin",
        cell: (info) => {
          const coin = info.row.original;
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
        },
        size: 200,
      }),
      columnHelper.accessor("current_price", {
        header: "Price",
        cell: (info) => (
          <div className="text-center font-medium text-gray-900 dark:text-white">
            $
            {info.getValue().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: info.getValue() < 1 ? 6 : 2,
            })}
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor("price_change_percentage_24h", {
        header: "24h Change",
        cell: (info) => {
          const value = info.getValue();
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
        },
        size: 120,
      }),
      columnHelper.accessor("market_cap", {
        header: "Market Cap",
        cell: (info) => (
          <div className="text-center text-gray-900 dark:text-white">
            ${info.getValue().toLocaleString()}
          </div>
        ),
        size: 140,
      }),
      columnHelper.display({
        id: "watchlist",
        header: "Watchlist",
        cell: (info) => {
          const coin = info.row.original;
          const isInWatchlist = watchlist.some((c) => c.id === coin.id);

          return (
            <div className="text-center">
              <button
                onClick={() => {
                  if (isInWatchlist) {
                    removeFromWatchlist(coin.id);
                    if (currentCategory === "watchlist") {
                      setCoins(watchlist.filter((c) => c.id !== coin.id));
                    }
                    // toast.error() is good for "removed" actions
                    toast.error(`${coin.name} removed from your watchlist!`, {
                      position: "bottom-right",
                    });
                  } else {
                    addToWatchlist(coin);
                    // toast.success() is great for "added" actions
                    toast.success(`${coin.name} added to your watchlist!`, {
                      position: "bottom-right",
                    });
                  }
                }}
              >
                {isInWatchlist ? (
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          );
        },
        size: 80,
      }),
      columnHelper.display({
        id: "portfolio",
        header: "Portfolio",
        cell: (info) => {
          const coin = info.row.original;
          return (
            <div className="text-center">
              <button
                onClick={() => {
                  console.log("Add to portfolio:", coin.name);
                }}
                className="transform rounded-lg p-2 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-yellow-50 hover:text-yellow-600 active:scale-95 dark:hover:bg-yellow-900/20"
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
        },
        size: 80,
      }),
    ],
    [addToWatchlist, removeFromWatchlist, watchlist, currentCategory, setCoins],
  );

  const table = useReactTable({
    data: coins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 50,
      },
      sorting: [
        {
          id: "market_cap_rank",
          desc: false,
        },
      ],
    },
  });

  if (!coins.length && !isLoading && currentCategory !== "watchlist") {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading cryptocurrency data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cryptocurrency Markets
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {COIN_CATEGORIES[currentCategory].description} •{" "}
              {table.getFilteredRowModel().rows.length} coins
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Data of top 250 coins (CoinGecko free tier)
            </p>
          </div>

          <div className="flex items-center space-x-4">
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
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(COIN_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key as CategoryKey)}
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
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/50 dark:bg-gray-900/50">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Loading {COIN_CATEGORIES[currentCategory].label} coins...
            </p>
          </div>
        </div>
      )}

      <div className="relative overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`cursor-pointer px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 ${
                      header.id === "name" ? "text-left" : "text-center"
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div
                      className={`flex items-center space-x-1 ${
                        header.id === "name"
                          ? "justify-start"
                          : "justify-center"
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {header.column.getIsSorted() === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-6 text-center text-gray-600 dark:text-gray-300"
                >
                  {currentCategory === "watchlist" && watchlist.length === 0
                    ? "Your watchlist is empty."
                    : globalFilter
                      ? "The coin you searched is not in the top 250 coins."
                      : null}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {table.getFilteredRowModel().rows.length > 0 ? (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{" "}
                of {table.getFilteredRowModel().rows.length} results
              </span>
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing 0 results
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="transform rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="transform rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="transform rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="transform rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
