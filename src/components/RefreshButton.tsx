"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface RefreshButtonProps {
  autoRefreshInterval?: number; // in seconds, 0 = disabled
}

export function RefreshButton({ autoRefreshInterval = 0 }: RefreshButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(autoRefreshInterval > 0);
  const [countdown, setCountdown] = useState(autoRefreshInterval);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    // Reset state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
      setCountdown(autoRefreshInterval);
    }, 1000);
  }, [router, autoRefreshInterval]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefresh || autoRefreshInterval === 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, autoRefreshInterval, handleRefresh]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-3 py-1.5 bg-muted border border-border rounded text-sm hover:bg-muted/80 disabled:opacity-50 flex items-center gap-2"
      >
        <svg
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>

      <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => {
            setAutoRefresh(e.target.checked);
            setCountdown(autoRefreshInterval);
          }}
          className="rounded border-border"
        />
        Auto
        {autoRefresh && countdown > 0 && (
          <span className="text-xs">({countdown}s)</span>
        )}
      </label>
    </div>
  );
}
