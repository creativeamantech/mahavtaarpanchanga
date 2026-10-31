import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  X,
  Navigation,
  Check,
  Loader2,
  Compass,
  BookmarkCheck,
  AlertTriangle,
} from "lucide-react";
import type { CityLocation } from "../types";
import { type Language, translations } from "../i18n";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  customCoords?: {
    lat: number;
    lon: number;
    tz: string;
    name: string;
    isDeviceLocation?: boolean;
    accuracyMeters?: number;
  } | null;
  onSelectCity: (city: CityLocation, saveAsDefault?: boolean) => void;
  onSelectCustom: (
    lat: number,
    lon: number,
    tz: string,
    name: string,
    isDeviceLocation?: boolean,
    accuracyMeters?: number,
    saveAsDefault?: boolean,
  ) => void;
  lang: Language;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  customCoords,
  onSelectCity,
  onSelectCustom,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<"device" | "search" | "custom">("device");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  // Detected device GPS state
  const [detectedGps, setDetectedGps] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
    tz: string;
    displayName: string;
    nearestCityName?: string;
    distanceKm?: number;
  } | null>(null);

  // Custom coordinates form state
  const [customName, setCustomName] = useState("My Location");
  const [customLat, setCustomLat] = useState(customCoords ? String(customCoords.lat) : "12.97194");
  const [customLon, setCustomLon] = useState(customCoords ? String(customCoords.lon) : "77.59369");
  const [customTz, setCustomTz] = useState(customCoords ? customCoords.tz : "Asia/Kolkata");

  const t = translations[lang];

  useEffect(() => {
    if (!isOpen) return;
    setGeoNotice(null);
    if (!searchTerm.trim()) {
      fetch("/api/cities?limit=12")
        .then((res) => res.json())
        .then((data) => setSearchResults(data.cities || []))
        .catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      setIsLoadingCities(true);
      fetch(`/api/cities?q=${encodeURIComponent(searchTerm.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.cities || []);
          setIsLoadingCities(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoadingCities(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (city: CityLocation) => {
    onSelectCity(city, saveAsDefault);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) {
      setGeoNotice("Invalid coordinates entered. Please verify latitude and longitude values.");
      return;
    }
    onSelectCustom(
      lat,
      lon,
      customTz.trim() || "Asia/Kolkata",
      customName.trim() || "Custom Location",
      false,
      undefined,
      saveAsDefault,
    );
    onClose();
  };

  const handleDetectDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

        let nearestCityName: string | undefined;
        let distanceKm: number | undefined;

        try {
          const res = await fetch(`/api/nearest-city?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.city?.name) {
              nearestCityName = data.city.name.split(",")[0].trim();
              distanceKm = data.distanceKm;
            }
          }
        } catch {
          // ignore lookup failure
        }

        const displayName = nearestCityName
          ? `${nearestCityName} (GPS)`
          : `GPS (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;

        setDetectedGps({
          lat,
          lon,
          accuracy,
          tz,
          displayName,
          nearestCityName,
          distanceKm,
        });

        // Also pre-fill custom tab fields in case user wants to review
        setCustomLat(String(lat));
        setCustomLon(String(lon));
        setCustomTz(tz);
        setCustomName(displayName);

        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        let msg =
          "Location access was unavailable. You can enter coordinates manually or select a city.";
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "Location permission was denied. Please allow location access in your browser settings, or select a city manually.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again or enter your coordinates.";
        }
        setGeoNotice(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const handleApplyDetectedGps = () => {
    if (!detectedGps) return;
    onSelectCustom(
      detectedGps.lat,
      detectedGps.lon,
      detectedGps.tz,
      detectedGps.displayName,
      true,
      detectedGps.accuracy,
      saveAsDefault,
    );
    onClose();
  };

  const QUICK_CITIES: CityLocation[] = [
    { name: "New Delhi, IN", country: "IN", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
    { name: "Varanasi, IN", country: "IN", latitude: 25.3176, longitude: 82.9739, timezone: "Asia/Kolkata" },
    { name: "Ujjain, IN", country: "IN", latitude: 23.1765, longitude: 75.7885, timezone: "Asia/Kolkata" },
    { name: "Bengaluru, IN", country: "IN", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
    { name: "Mumbai, IN", country: "IN", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
    { name: "Haridwar, IN", country: "IN", latitude: 29.9457, longitude: 78.1642, timezone: "Asia/Kolkata" },
  ];

  return (
    <div
      id="location-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="location-modal-dialog"
        className="w-full h-full sm:h-auto sm:max-h-[88vh] sm:max-w-lg rounded-none sm:rounded-3xl border border-stone-200/60 dark:border-indigo-900/40 bg-white dark:bg-[#0e1424] p-4 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-indigo-900/50 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-slate-100 font-serif-vedic">
                {t.changeLocation}
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-sans">
                {lang === "hi"
                  ? "सटीक प्रत्यक्ष गणना हेतु नगर या डिवाइस स्थान चुनें"
                  : `Currently active: ${currentCity}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-location-modal-btn"
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-stone-700 dark:hover:text-slate-200 transition-colors touch-target-min flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mt-4 flex rounded-xl bg-stone-100 p-1 border border-stone-200">
          <button
            type="button"
            id="tab-device-location"
            onClick={() => setActiveTab("device")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "device"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Navigation className="h-3.5 w-3.5 text-amber-700" />
            <span>{t.deviceGps}</span>
          </button>
          <button
            type="button"
            id="tab-search-cities"
            onClick={() => setActiveTab("search")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTab === "search"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.searchCity}
          </button>
          <button
            type="button"
            id="tab-custom-coords"
            onClick={() => setActiveTab("custom")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTab === "custom"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.customCoords}
          </button>
        </div>

        {geoNotice && (
          <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{geoNotice}</span>
          </div>
        )}

        {/* TAB 1: Device Location (GPS) */}
        {activeTab === "device" && (
          <div className="mt-4 space-y-4 flex-1 overflow-y-auto">
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-5 text-stone-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                  <Compass className="h-6 w-6 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 font-serif-vedic">
                    {lang === "hi"
                      ? "डिवाइस का प्रत्यक्ष जीपीएस स्थान"
                      : "High-Precision Device GPS Location"}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {lang === "hi"
                      ? "अपने उपकरण के वास्तविक जीपीएस द्वारा सूर्योदय, नक्षत्र एवं लग्न की शुद्धतम गणना करें।"
                      : "Directly reads browser GPS coordinates for exact local astronomical calculations."}
                  </p>
                </div>
              </div>

              {/* Detected GPS summary */}
              {detectedGps ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-emerald-950 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-700" />
                      {t.locationDetected}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ±{detectedGps.accuracy}m accuracy
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/80 rounded-lg p-2 border border-emerald-100">
                      <span className="text-[10px] text-stone-500 uppercase block font-bold">
                        Latitude
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {detectedGps.lat.toFixed(5)}° N
                      </span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2 border border-emerald-100">
                      <span className="text-[10px] text-stone-500 uppercase block font-bold">
                        Longitude
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {detectedGps.lon.toFixed(5)}° E
                      </span>
                    </div>
                  </div>
                  {detectedGps.nearestCityName && (
                    <div className="text-[11px] text-stone-700 bg-white/60 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                      <span>
                        Nearest City: <strong>{detectedGps.nearestCityName}</strong>
                      </span>
                      {detectedGps.distanceKm !== undefined && (
                        <span className="text-stone-500 font-mono">
                          ~{detectedGps.distanceKm} km
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Detection trigger button */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  id="detect-gps-trigger-btn"
                  disabled={isDetectingGps}
                  onClick={handleDetectDeviceLocation}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-50 shadow-xs transition-all"
                >
                  {isDetectingGps ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.detectingLocation}</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      <span>{detectedGps ? "Refresh Device Location" : t.detectGps}</span>
                    </>
                  )}
                </button>

                {detectedGps && (
                  <button
                    type="button"
                    id="apply-detected-gps-btn"
                    onClick={handleApplyDetectedGps}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs transition-all"
                  >
                    <Check className="h-4 w-4" />
                    <span>Apply & Use</span>
                  </button>
                )}
              </div>
            </div>

            {/* Current coordinates info if device is already active */}
            {customCoords?.isDeviceLocation && (
              <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-stone-700">
                    Currently using active device GPS: <strong>{customCoords.name}</strong>
                  </span>
                </div>
                {customCoords.accuracyMeters && (
                  <span className="text-[10px] text-stone-500 font-mono">
                    ±{customCoords.accuracyMeters}m
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Search Cities */}
        {activeTab === "search" && (
          <div className="mt-4 flex-1 flex flex-col min-h-0 space-y-3">
            {/* Quick GPS shortcut */}
            <button
              type="button"
              onClick={handleDetectDeviceLocation}
              disabled={isDetectingGps}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-300/80 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors touch-target-min cursor-pointer shrink-0"
            >
              {isDetectingGps ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>{lang === "hi" ? "जीपीएस से स्थान प्राप्त कर रहे हैं..." : "Detecting GPS location..."}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-amber-600" />
                  <span>{lang === "hi" ? "वर्तमान डिवाइस जीपीएस का उपयोग करें" : "Use My Current Device Location"}</span>
                </>
              )}
            </button>

            {/* Search Input - 16px to prevent iOS Safari auto-zoom */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
              <input
                id="city-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-stone-300 dark:border-indigo-900/50 bg-white dark:bg-slate-900/60 pl-10 pr-4 py-2.5 text-base sm:text-sm text-stone-900 dark:text-slate-100 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Quick Vedic Cities chips */}
            {!searchTerm.trim() && (
              <div className="space-y-1.5 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500">
                  {lang === "hi" ? "प्रमुख तीर्थ एवं नगर" : "Major Cities"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CITIES.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {c.name.split(",")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results list */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800 pr-1 border border-stone-200/60 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 p-1">
              {isLoadingCities ? (
                <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span>Searching global cities...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="w-full text-left py-2.5 px-3 hover:bg-amber-50/80 dark:hover:bg-indigo-950/40 rounded-lg flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-stone-900 dark:text-slate-100 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                        {city.name}
                      </div>
                      <div className="text-xs text-stone-400 dark:text-slate-500">
                        {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}° • {city.timezone}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-stone-400 group-hover:text-amber-700 bg-stone-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-slate-700">
                      {city.country}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-stone-500">
                  No cities found. You can enter custom coordinates in the next tab.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Custom Coordinates */}
        {activeTab === "custom" && (
          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3.5 flex-1 overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Location Label
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. My Home Observatory"
                className="w-full rounded-xl border border-stone-300 dark:border-indigo-900/50 bg-white dark:bg-slate-900/60 px-3.5 py-2.5 text-base sm:text-sm text-stone-900 dark:text-slate-100 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Latitude (° North)
                </label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="12.9719"
                  className="w-full rounded-xl border border-stone-300 dark:border-indigo-900/50 bg-white dark:bg-slate-900/60 px-3.5 py-2.5 text-base sm:text-sm text-stone-900 dark:text-slate-100 font-mono focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Longitude (° East)
                </label>
                <input
                  type="text"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  placeholder="77.5937"
                  className="w-full rounded-xl border border-stone-300 dark:border-indigo-900/50 bg-white dark:bg-slate-900/60 px-3.5 py-2.5 text-base sm:text-sm text-stone-900 dark:text-slate-100 font-mono focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                IANA Timezone
              </label>
              <input
                type="text"
                value={customTz}
                onChange={(e) => setCustomTz(e.target.value)}
                placeholder="Asia/Kolkata"
                className="w-full rounded-xl border border-stone-300 dark:border-indigo-900/50 bg-white dark:bg-slate-900/60 px-3.5 py-2.5 text-base sm:text-sm text-stone-900 dark:text-slate-100 font-mono focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 touch-target-min cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] px-5 py-2.5 text-xs font-bold text-white shadow-xs touch-target-min cursor-pointer"
              >
                Apply Coordinates
              </button>
            </div>
          </form>
        )}

        {/* Footer: Save as Default Device Location Checkbox */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="save-default-location-checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="h-4 w-4 rounded text-amber-700 focus:ring-amber-500 border-stone-300"
            />
            <span className="font-medium text-stone-800 flex items-center gap-1">
              <BookmarkCheck className="h-3.5 w-3.5 text-amber-700" />
              {t.saveAsDefault}
            </span>
          </label>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 text-xs font-semibold px-2 py-1"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
