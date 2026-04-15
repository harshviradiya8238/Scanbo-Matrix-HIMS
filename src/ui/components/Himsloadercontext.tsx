"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import HimsLoader from "./Himsloader";

// ─── Context ──────────────────────────────────────────────────

interface HimsLoaderContextValue {
  /** Show loader with optional message */
  showLoader: (message?: string) => void;
  /** Hide loader */
  hideLoader: () => void;
  /**
   * Wrap any async function — auto shows + hides loader.
   * Returns the result of the async fn.
   *
   * Usage:
   *   const data = await withLoader(
   *     () => fetch('/api/roles').then(r => r.json()),
   *     'Loading roles...'
   *   );
   */
  withLoader: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
  /** Show loader during route/menu navigation */
  showRouteLoader: (message?: string, targetPath?: string) => void;
}

const HimsLoaderContext = createContext<HimsLoaderContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export const HimsLoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [bootLoading, setBootLoading] = useState(true);
  const [activeRequests, setActiveRequests] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [message, setMessage] = useState("Preparing workspace...");
  const routeFromPathRef = React.useRef<string | null>(pathname ?? null);
  const routeTargetPathRef = React.useRef<string | null>(null);
  const hasBlockingLoad = bootLoading || activeRequests > 0;
  const routeOnlyLoading = routeLoading && !hasBlockingLoad;
  const open = hasBlockingLoad || routeOnlyLoading;

  const showLoader = useCallback((msg = "Loading...") => {
    setMessage(msg);
    setActiveRequests((count) => count + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveRequests((count) => Math.max(0, count - 1));
  }, []);

  const withLoader = useCallback(
    async <T,>(fn: () => Promise<T>, msg = "Loading..."): Promise<T> => {
      showLoader(msg);
      try {
        return await fn();
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader],
  );

  const showRouteLoader = useCallback((msg = "Opening...", targetPath?: string) => {
    setMessage(msg);
    routeFromPathRef.current = pathname ?? null;
    routeTargetPathRef.current = targetPath ?? null;
    setRouteLoading(true);
  }, [pathname]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setBootLoading(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!routeLoading) return;
    const fromPath = routeFromPathRef.current;
    const targetPath = routeTargetPathRef.current;
    const reachedTarget = targetPath
      ? pathname === targetPath
      : fromPath !== null && pathname !== fromPath;

    if (!reachedTarget) return;

    const timer = window.setTimeout(() => {
      routeFromPathRef.current = null;
      routeTargetPathRef.current = null;
      setRouteLoading(false);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [pathname, routeLoading]);

  React.useEffect(() => {
    if (!routeLoading) return;
    const fallback = window.setTimeout(() => {
      routeFromPathRef.current = null;
      routeTargetPathRef.current = null;
      setRouteLoading(false);
    }, 10000);
    return () => window.clearTimeout(fallback);
  }, [routeLoading]);

  return (
    <HimsLoaderContext.Provider
      value={{ showLoader, hideLoader, withLoader, showRouteLoader }}
    >
      {children}
      <HimsLoader
        open={open}
        message={message}
        dimBackground
        pointerEvents={routeOnlyLoading ? "none" : "auto"}
      />
    </HimsLoaderContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────

export const useHimsLoader = (): HimsLoaderContextValue => {
  const ctx = useContext(HimsLoaderContext);
  if (!ctx) {
    throw new Error("useHimsLoader must be used inside <HimsLoaderProvider>");
  }
  return ctx;
};
