'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

const SIDEBAR_STATE_KEY = 'hims_sidebar_expanded';

// Module-level store so every hook instance stays in sync
let expandedState = true;
const listeners = new Set<() => void>();

const persistState = (value: boolean) => {
  expandedState = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(value));
  }
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => expandedState;

// For SSR
const getServerSnapshot = () => true;

/**
 * Hook for managing sidebar expand/collapse state
 */
export function useSidebarState() {
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (stored !== null) {
        persistState(JSON.parse(stored));
      }
    }
  }, []);

  const isExpanded = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    persistState(!getSnapshot());
  }, []);

  const expand = useCallback(() => {
    persistState(true);
  }, []);

  const collapse = useCallback(() => {
    persistState(false);
  }, []);

  return {
    isExpanded: mounted ? isExpanded : true, // Return default during SSR
    toggle,
    expand,
    collapse,
  };
}
