import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Table } from "@tanstack/react-table";

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export const Pagination = <TData,>({ table }: TablePaginationProps<TData>) => {
  return (
    <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Results count */}
        <div className="text-center text-sm text-gray-700 sm:text-left dark:text-gray-300">
          {table.getFilteredRowModel().rows.length > 0 ? (
            <span>
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
            <span>Showing 0 results</span>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
