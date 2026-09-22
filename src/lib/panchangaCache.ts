import type { PanchangaResponse } from "../types";

const PANCHANGA_CACHE_PREFIX = "mahavtaar_panchanga_cache_v1_";
const PANCHANGA_MONTH_CACHE_PREFIX = "mahavtaar_panchanga_month_cache_v1_";
const LAST_SUCCESS_KEY = "mahavtaar_panchanga_last_success_v1";

/**
 * Generate a deterministic cache key for daily Panchanga calculations
 */
export function getPanchangaCacheKey(
  date: string,
  city: string,
  coords: { lat: number; lon: number; tz: string } | null,
  monthSystem: string,
  ayanamsa: string,
): string {
  if (coords) {
    return `${PANCHANGA_CACHE_PREFIX}${date}_${coords.lat.toFixed(3)}_${coords.lon.toFixed(3)}_${monthSystem}_${ayanamsa}`;
  }
  return `${PANCHANGA_CACHE_PREFIX}${date}_${city.toLowerCase().trim()}_${monthSystem}_${ayanamsa}`;
}

/**
 * Load cached daily Panchanga from browser localStorage
 */
export function loadCachedPanchanga(key: string): PanchangaResponse | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.city && parsed.date && parsed.tithi) {
      return parsed as PanchangaResponse;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Persist computed Panchanga into localStorage
 */
export function saveCachedPanchanga(key: string, data: PanchangaResponse): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(data));
    window.localStorage.setItem(LAST_SUCCESS_KEY, JSON.stringify(data));
  } catch {
    // LocalStorage quota or privacy mode restriction
  }
}

/**
 * Fallback to the most recent successful Panchanga computed on this device
 */
export function loadLastSuccessfulPanchanga(): PanchangaResponse | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LAST_SUCCESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.city && parsed.date) {
      return parsed as PanchangaResponse;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Generate a deterministic cache key for monthly Panchanga calendar days
 */
export function getMonthCacheKey(
  year: number,
  month: number,
  city: string,
  monthSystem: string,
  ayanamsa: string,
): string {
  return `${PANCHANGA_MONTH_CACHE_PREFIX}${year}_${month}_${city.toLowerCase().trim()}_${monthSystem}_${ayanamsa}`;
}

/**
 * Load cached monthly Panchanga calendar days from browser localStorage
 */
export function loadCachedMonth(key: string): any[] | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Persist computed monthly calendar days into localStorage
 */
export function saveCachedMonth(key: string, days: any[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(days));
  } catch {
    // LocalStorage quota or privacy mode restriction
  }
}
