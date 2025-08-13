"use client";

import { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';

import { useCryptoStore } from '@/store/useCryptoStore';
import { COIN_CATEGORIES, getCoinsByCategory, type CategoryKey } from '@/app/lib/coinApi';
import type Coin from '@/app/types/coin';

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
    setCoins 
  } = useCryptoStore();
  
  const [globalFilter, setGlobalFilter] = useState('');

  // Handle category change with API call - prevent fast clicking
  const handleCategoryChange = useCallback(async (category: CategoryKey) => {
    if (category === currentCategory || isLoading) return; // Prevent fast clicking
    
    setCurrentCategory(category);
    
    // If we already have data for this category, use it
    if (categoryCoins[category]) {
      setCoins(categoryCoins[category]);
      return;
    }
    
    // If it's "all" category, we should already have this data
    if (category === 'all' && categoryCoins.all) {
      setCoins(categoryCoins.all);
      return;
    }
    
    // Fetch new category data from API
    if (COIN_CATEGORIES[category].apiCategory) {
      setLoading(true);
      try {
        const categoryData = await getCoinsByCategory(COIN_CATEGORIES[category].apiCategory!);
        setCategoryCoins(category, categoryData);
        setCoins(categoryData);
      } catch (error) {
        console.error(`Failed to fetch ${category} coins:`, error);
        alert('Failed to load data. Please wait a moment and try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [currentCategory, categoryCoins, isLoading, setCurrentCategory, setCategoryCoins, setCoins, setLoading]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('market_cap_rank', {
        header: '#',
        cell: (info) => (
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {info.getValue() || '-'}
            </span>
          </div>
        ),
        size: 60,
      }),
      columnHelper.accessor('name', {
        header: 'Coin',
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
                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                  {coin.symbol}
                </div>
              </div>
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor('current_price', {
        header: 'Price',
        cell: (info) => (
          <div className="text-center font-medium text-gray-900 dark:text-white">
            ${info.getValue().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: info.getValue() < 1 ? 6 : 2
            })}
          </div>
        ),
        size: 120,
      }),
      columnHelper.accessor('price_change_percentage_24h', {
        header: '24h Change',
        cell: (info) => {
          const value = info.getValue();
          return (
            <div className="text-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  value >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {value >= 0 ? "+" : ""}{value.toFixed(2)}%
              </span>
            </div>
          );
        },
        size: 120,
      }),
      columnHelper.accessor('market_cap', {
        header: 'Market Cap',
        cell: (info) => (
          <div className="text-center text-gray-900 dark:text-white">
            ${info.getValue().toLocaleString()}
          </div>
        ),
        size: 140,
      }),
      // Watchlist column
      columnHelper.display({
        id: 'watchlist',
        header: 'Watchlist',
        cell: (info) => {
          const coin = info.row.original;
          return (
            <div className="text-center">
              <button
                onClick={() => {
                  // TODO: Add to watchlist logic
                  console.log('Add to watchlist:', coin.name);
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                title="Add to Watchlist"
                aria-label={`Add ${coin.name} to watchlist`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          );
        },
        size: 80,
      }),
      // Portfolio column
      columnHelper.display({
        id: 'portfolio',
        header: 'Portfolio',
        cell: (info) => {
          const coin = info.row.original;
          return (
            <div className="text-center">
              <button
                onClick={() => {
                  // TODO: Add to portfolio logic
                  console.log('Add to portfolio:', coin.name);
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
                title="Add to Portfolio"
                aria-label={`Add ${coin.name} to portfolio`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          );
        },
        size: 80,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: coins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 100, // Show 100 per page for 1500 coins = 15 pages (like CoinGecko)
      },
    },
  });

  if (!coins.length && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header with Title and Controls */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cryptocurrency Markets
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {COIN_CATEGORIES[currentCategory].description} • {table.getFilteredRowModel().rows.length} coins
            </p>
          </div>
          
          {/* Search Input */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coins..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters - Enhanced Buttons with better dark mode */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(COIN_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key as CategoryKey)}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                currentCategory === key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {isLoading && currentCategory === key ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
                  <span>{category.label}</span>
                </div>
              ) : (
                category.label
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading {COIN_CATEGORIES[currentCategory].label} coins...</p>
          </div>
        </div>
      )}

      {/* Table with mixed alignment - Coin column left, others center */}
      <div className="overflow-x-auto relative">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      header.id === 'name' ? 'text-left' : 'text-center'
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className={`flex items-center space-x-1 ${
                      header.id === 'name' ? 'justify-start' : 'justify-center'
                    }`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Enhanced Buttons with better dark mode */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}