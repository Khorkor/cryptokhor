import type { Metadata } from "next";
import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/app/components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoKhor - Crypto Portfolio Tracker",
  description: "Track your cryptocurrency portfolio with real-time prices and market data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        {/* Full-width Navbar (Facebook-style) */}
        <Navbar />
        
        {/* Main Content Container - Centered like Facebook */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}