"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function setThemeCookie(theme: "dark" | "light") {
  // 1 year in seconds
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie =
    "cryptokhor-theme=" +
    theme +
    "; path=/; max-age=" +
    maxAge +
    "; SameSite=Lax";
}

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("cryptokhor-theme");
      if (saved) {
        setIsDark(saved === "dark");
        // ensure html class matches (in case server-side set different)
        if (saved === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      } else {
        // fallback to whatever html currently has (server or inline script set it)
        setIsDark(document.documentElement.classList.contains("dark"));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore storage errors
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("cryptokhor-theme", "dark");
      } catch {}
      setThemeCookie("dark");
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("cryptokhor-theme", "light");
      } catch {}
      setThemeCookie("light");
    }
  };

  if (!mounted) {
    return <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100 p-2" />;
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="transform rounded-lg border border-transparent p-2 text-gray-500 shadow-sm transition-all duration-200 hover:scale-110 hover:border-gray-200 hover:bg-gray-100 hover:shadow-md active:scale-95"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  );
}
