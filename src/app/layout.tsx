import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";

import Navbar from "@/app/components/Navbar";

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
  description:
    "Track your cryptocurrency portfolio with real-time prices and market data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-white text-gray-900 antialiased transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100`}
      >
        {/* Full-width Navbar (Facebook-style) */}
        <Navbar />

        {/* Main Content Container - Centered like Facebook */}
        <main className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
            <ToastContainer />
          </div>
        </main>
      </body>
    </html>
  );
}
