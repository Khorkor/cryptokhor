"use client";

import Link from 'next/link';
import { useState } from 'react';
import DarkModeToggle from '@/app/components/DarkModeToggle';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                CryptoKhor
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link
                href="/"
                className="text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Markets
              </Link>
              <Link
                href="/watchlist"
                className="text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                Watchlist
              </Link>
              <Link
                href="/portfolio"
                className="text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
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
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                className="text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Markets
              </Link>
              <Link
                href="/watchlist"
                className="text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Watchlist
              </Link>
              <Link
                href="/portfolio"
                className="text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
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