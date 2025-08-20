import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers"; // server-only
import Script from "next/script";
import { ToastContainer } from "react-toastify";

import Navbar from "@/app/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoKhor - Crypto Portfolio Tracker",
  description:
    "Track your cryptocurrency portfolio with real-time prices and market data",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieTheme = (await cookies()).get("cryptokhor-theme")?.value;
  const isDarkServer = cookieTheme === "dark";

  return (
    <html
      lang="en"
      // add font variables here so SSR includes them
      className={`${geistSans.variable} ${geistMono.variable} h-full ${isDarkServer ? "dark" : ""}`}
    >
      <head>
        {/* Inline script runs before React hydration.
            It only sets the theme if the cookie isn't present,
            so it won't overwrite server-determined cookie theme. */}
        <Script id="theme-setter-inline" strategy="beforeInteractive">
          {`(function () {
            try {
              // if a theme cookie exists, trust the server (do nothing)
              if (document.cookie.indexOf('cryptokhor-theme=') !== -1) return;
              
              // Otherwise, prefer localStorage, then system preference
              var saved = null;
              try { saved = localStorage.getItem('cryptokhor-theme'); } catch (e) {}
              var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              var isDark = saved ? (saved === 'dark') : prefersDark;
              if (isDark) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            } catch (e) {}
          })();`}
        </Script>
      </head>
      <body className="min-h-full bg-white text-gray-900 antialiased transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
        <Navbar />
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
