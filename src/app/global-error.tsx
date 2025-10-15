"use client";

import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
    toast.error("An unexpected error occurred. Please try again.", {
      position: "bottom-right",
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <button
              onClick={reset}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
