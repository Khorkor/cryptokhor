"use client";

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { CategoryFilter } from '@/app/components/CoinsTable/CategoryFilter';
import { CoinCell } from '@/app/components/CoinsTable/CoinCell';
import { TableLoadingOverlay } from '@/app/components/CoinsTable/LoadingOverlay';
import { PriceChangeCell } from '@/app/components/CoinsTable/PriceChangeCell';
import { SearchBar } from '@/app/components/CoinsTable/SearchBar';
import { TableEmptyState } from '@/app/components/CoinsTable/TableEmptyState';
import { WatchlistButton } from '@/app/components/CoinsTable/WatchlistButton';
import { Pagination } from '@/app/components/Pagination';
import { getCoinsByCategory } from '@/app/lib/coinApi';
import { Coin } from '@/app/types/coin';
import { CategoryKey, COIN_CATEGORIES } from '@/app/types/coinCategories';
import { useCryptoStore } from '@/store/useCryptoStore';
import {
    createColumnHelper, FilterFn, flexRender, getCoreRowModel, getFilteredRowModel,
    getPaginationRowModel, getSortedRowModel, useReactTable
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Coin>();

const coinSearchFilter: FilterFn<Coin> = (row, columnId, filterValue) => {
  const name = row.original.name?.toLowerCase() || "";
  const symbol = row.original.symbol?.toLowerCase() || "";
  const filter = filterValue.toLowerCase();

  return name.includes(filter) || symbol.includes(filter);
};

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
    watchlist,
  } = useCryptoStore();

  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

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
        cell: (info) => <CoinCell coin={info.row.original} />,
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
        cell: (info) => <PriceChangeCell value={info.getValue()} />,
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
        cell: (info) => <WatchlistButton coin={info.row.original} />,
        size: 80,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: coins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Use the custom fuzzy filter function for global search
    globalFilterFn: coinSearchFilter,
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
              Data of top 250 coins in each category (CoinGecko free tier)
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manual page refresh required for latest data due to API rate
              limits • Updated: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBar
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              currentCategory={currentCategory}
            />
          </div>
        </div>

        <CategoryFilter
          currentCategory={currentCategory}
          isLoading={isLoading}
          onCategoryChange={handleCategoryChange}
        />
      </div>
      {isLoading && <TableLoadingOverlay currentCategory={currentCategory} />}
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
                  onClick={() => router.push(`/coins/${row.original.id}`)}
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
              <TableEmptyState
                colSpan={columns.length}
                currentCategory={currentCategory}
                watchlist={watchlist}
                globalFilter={globalFilter}
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination table={table} />
    </div>
  );
}
