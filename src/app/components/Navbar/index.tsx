"use client";

import Link from "next/link";
import { useState } from "react";

import DarkModeToggle from "@/app/components/DarkModeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                CryptoKhor
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link
                href="/"
                className="transform rounded-lg px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:text-gray-100 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="transform rounded-lg px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:text-gray-100 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              >
                Portfolio
              </Link>
            </div>
          </div>

          {/* Dark Mode Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* Working Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex transform items-center justify-center rounded-lg p-2 text-gray-400 transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-gray-200 px-2 pt-2 pb-3 sm:px-3 dark:border-gray-700">
              <Link
                href="/"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-100 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-900 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-100 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <div className="px-3 py-2">
                <DarkModeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
