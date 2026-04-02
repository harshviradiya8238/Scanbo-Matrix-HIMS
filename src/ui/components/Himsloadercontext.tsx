"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
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
}

const HimsLoaderContext = createContext<HimsLoaderContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export const HimsLoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Loading...");

  const showLoader = useCallback((msg = "Loading...") => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const hideLoader = useCallback(() => {
    setOpen(false);
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

  return (
    <HimsLoaderContext.Provider value={{ showLoader, hideLoader, withLoader }}>
      {children}
      <HimsLoader open={open} message={message} />
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
