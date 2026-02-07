'use client';

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'hims_favorites';
const RECENT_STORAGE_KEY = 'hims_recent';
const MAX_RECENT_ITEMS = 10;

/**
 * Hook for managing favorite menu items
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    }
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      }
      
      return newFavorites;
    });
  }, []);

  return { favorites: mounted ? favorites : [], toggleFavorite };
}

/**
 * Hook for managing recent menu items
 */
export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    }
  }, []);

  const addRecentItem = useCallback((itemId: string) => {
    setRecentItems((prev) => {
      // Remove if already exists and add to front
      const filtered = prev.filter((id) => id !== itemId);
      const newRecent = [itemId, ...filtered].slice(0, MAX_RECENT_ITEMS);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(newRecent));
      }
      
      return newRecent;
    });
  }, []);

  return { recentItems: mounted ? recentItems : [], addRecentItem };
}

/**
 * Combined hook for navigation state
 */
export function useNavigationState() {
  const { favorites, toggleFavorite } = useFavorites();
  const { recentItems, addRecentItem } = useRecentItems();

  return {
    favorites,
    toggleFavorite,
    recentItems,
    addRecentItem,
  };
}

