import { Locale, TranslationKeys, TranslateFunction } from './types';
import { en } from './locales/en';

/**
 * Translation registry
 * Add new locales here
 */
const translations: Record<Locale, TranslationKeys> = {
  en,
  // Add more locales as needed
  es: en, // Placeholder
  fr: en, // Placeholder
  de: en, // Placeholder
  ja: en, // Placeholder
  zh: en, // Placeholder
};

/**
 * Get current locale (defaults to 'en')
 * In production, this would read from user preferences, URL, or headers
 */
export function getCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale;
    if (stored && translations[stored]) {
      return stored;
    }
  }
  return 'en';
}

/**
 * Get translations for current locale
 */
export function getTranslations(locale?: Locale): TranslationKeys {
  const currentLocale = locale || getCurrentLocale();
  return translations[currentLocale] || translations.en;
}

/**
 * Simple translation function
 * For production, use i18next or similar library
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  const translations = getTranslations();
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Simple parameter replacement
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Format number based on locale
 */
export function formatNumber(value: number, locale?: Locale): string {
  const currentLocale = locale || getCurrentLocale();
  return new Intl.NumberFormat(currentLocale).format(value);
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date | string, locale?: Locale): string {
  const currentLocale = locale || getCurrentLocale();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(currentLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale?: Locale
): string {
  const currentLocale = locale || getCurrentLocale();
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency,
  }).format(value);
}

