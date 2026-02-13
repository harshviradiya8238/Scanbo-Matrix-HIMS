'use client';

import * as React from 'react';
import { Provider } from 'react-redux';
import { useRef } from 'react';
import { AppStore, makeStore } from '@/src/store/store';
import {
  hydrateOpdFromStorage,
  OpdPersistedData,
  selectPersistableOpdData,
} from '@/src/store/slices/opdSlice';

const OPD_STORAGE_KEY = 'scanbo:hims:opd:v1';
const OPD_STORAGE_VERSION = 1;

interface OpdStoragePayload {
  version: number;
  savedAt: string;
  data: Partial<OpdPersistedData>;
}

const parseStoredOpdData = (raw: string | null): Partial<OpdPersistedData> | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OpdStoragePayload | Partial<OpdPersistedData>;
    if (!parsed || typeof parsed !== 'object') return null;

    if ('data' in parsed && parsed.data && typeof parsed.data === 'object') {
      return parsed.data;
    }

    return parsed as Partial<OpdPersistedData>;
  } catch {
    return null;
  }
};

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (typeof window !== 'undefined') {
      const restoredData = parseStoredOpdData(localStorage.getItem(OPD_STORAGE_KEY));
      if (restoredData) {
        storeRef.current.dispatch(hydrateOpdFromStorage(restoredData));
      }
    }
  }

  React.useEffect(() => {
    const store = storeRef.current;
    if (!store) return;

    let previous = '';

    const persistSnapshot = () => {
      const payload: OpdStoragePayload = {
        version: OPD_STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        data: selectPersistableOpdData(store.getState().opd),
      };
      const serialized = JSON.stringify(payload);
      if (serialized === previous) return;
      previous = serialized;
      localStorage.setItem(OPD_STORAGE_KEY, serialized);
    };

    try {
      persistSnapshot();
    } catch {
      // Ignore storage quota and private-mode errors.
    }

    const unsubscribe = store.subscribe(() => {
      try {
        persistSnapshot();
      } catch {
        // Ignore storage quota and private-mode errors.
      }
    });

    return unsubscribe;
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
