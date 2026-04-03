/**
 * Centralized exchange rate types and defaults
 */

export interface Rates {
  USD: number;
  EUR: number;
  MLC: number;
  timestamp?: string;
  source?: string;
}

/** Fallback rates used when no cache or network is available */
export const FALLBACK_RATES: Rates = {
  USD: 515,
  EUR: 582,
  MLC: 392,
  timestamp: 'Estimadas',
  source: 'fallback',
};

export const STORAGE_KEY = 'calcuba_rates';
