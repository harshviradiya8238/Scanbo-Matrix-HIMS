/**
 * Internationalization types and interfaces
 * Structure ready for i18next or similar library integration
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface TranslationKeys {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    increment: string;
    decrement: string;
    reset: string;
    add: string;
  };
  // Navigation
  nav: {
    home: string;
    dashboard: string;
    settings: string;
  };
  // Pages
  pages: {
    home: {
      title: string;
      welcome: string;
    };
  };
}

/**
 * Translation function type
 */
export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

