import type { UserSettings, CoordinateSelection, MonthSystem, AppTheme } from './types';
import type { Language } from './i18n';

const SETTINGS_STORAGE_KEY = 'drik_panchanga_user_settings_v1';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  lang: 'en',
  ayanamsa: 'citra',
  monthSystem: 'amanta',
  currentCity: 'Bengaluru, IN',
  theme: 'parchment',
  customCoords: null,
};

/**
 * Safely load saved settings from browser localStorage
 */
export function loadUserSettings(): UserSettings {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_USER_SETTINGS;
    }
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_USER_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      lang: (['en', 'hi', 'sa'].includes(parsed.lang) ? parsed.lang : DEFAULT_USER_SETTINGS.lang) as Language,
      ayanamsa: (parsed.ayanamsa || DEFAULT_USER_SETTINGS.ayanamsa) as CoordinateSelection,
      monthSystem: (parsed.monthSystem || DEFAULT_USER_SETTINGS.monthSystem) as MonthSystem,
      currentCity: typeof parsed.currentCity === 'string' && parsed.currentCity.trim() ? parsed.currentCity : DEFAULT_USER_SETTINGS.currentCity,
      theme: (['parchment', 'nightSky'].includes(parsed.theme) ? parsed.theme : DEFAULT_USER_SETTINGS.theme) as AppTheme,
      customCoords: parsed.customCoords && typeof parsed.customCoords.lat === 'number' && typeof parsed.customCoords.lon === 'number'
        ? {
            lat: parsed.customCoords.lat,
            lon: parsed.customCoords.lon,
            tz: parsed.customCoords.tz || 'Asia/Kolkata',
            name: parsed.customCoords.name || 'Custom Location',
            isDeviceLocation: Boolean(parsed.customCoords.isDeviceLocation),
            accuracyMeters: parsed.customCoords.accuracyMeters,
          }
        : null,
      savedAt: parsed.savedAt,
    };
  } catch (err) {
    console.warn('Failed to parse saved user settings from localStorage:', err);
    return DEFAULT_USER_SETTINGS;
  }
}

/**
 * Save user settings to browser localStorage
 */
export function saveUserSettings(settings: UserSettings): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const payload: UserSettings = {
      ...settings,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save user settings to localStorage:', err);
    return false;
  }
}

/**
 * Clear saved user settings and return defaults
 */
export function clearUserSettings(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      return true;
    }
  } catch (err) {
    console.error('Failed to remove user settings from localStorage:', err);
  }
  return false;
}
