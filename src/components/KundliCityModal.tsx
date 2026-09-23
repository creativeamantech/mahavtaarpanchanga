import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  X,
  Navigation,
  Check,
  Loader2,
  Compass,
  Building2,
  Globe2,
  Sparkles,
} from "lucide-react";
import type { CityLocation } from "../types";

export interface KundliCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCityName: string;
  onSelectCity: (city: { name: string; lat: number; lon: number; tz: string }) => void;
}

const PILGRIMAGE_CITIES: { name: string; country: string; lat: number; lon: number; tz: string; desc: string }[] = [
  { name: "Varanasi (Kashi), India", country: "IN", lat: 25.3176, lon: 82.9739, tz: "Asia/Kolkata", desc: "काशी विश्वनाथ / मोक्ष नगरी" },
  { name: "Ujjain (Mahakal), India", country: "IN", lat: 23.1765, lon: 75.7885, tz: "Asia/Kolkata", desc: "महाकालेश्वर / काल गणना केंद्र" },
  { name: "Ayodhya, India", country: "IN", lat: 26.7922, lon: 82.1998, tz: "Asia/Kolkata", desc: "श्री राम जन्मभूमि" },
  { name: "Haridwar, India", country: "IN", lat: 29.9457, lon: 78.1642, tz: "Asia/Kolkata", desc: "हर की पौड़ी / गंगा द्वार" },
  { name: "Mathura / Vrindavan, India", country: "IN", lat: 27.4924, lon: 77.6737, tz: "Asia/Kolkata", desc: "श्री कृष्ण जन्मभूमि" },
  { name: "Prayagraj (Allahabad), India", country: "IN", lat: 25.4358, lon: 81.8463, tz: "Asia/Kolkata", desc: "त्रिवेणी संगम / तीर्थराज" },
  { name: "Tirupati, India", country: "IN", lat: 13.6288, lon: 79.4192, tz: "Asia/Kolkata", desc: "भगवान वेंकटेश्वर" },
  { name: "Rameswaram, India", country: "IN", lat: 9.2876, lon: 79.3129, tz: "Asia/Kolkata", desc: "रामनाथस्वामी ज्योतिर्लिंग" },
  { name: "Puri (Jagannath), India", country: "IN", lat: 19.8135, lon: 85.8312, tz: "Asia/Kolkata", desc: "श्री जगन्नाथ धाम" },
  { name: "Kedarnath, India", country: "IN", lat: 30.7346, lon: 79.0669, tz: "Asia/Kolkata", desc: "केदारनाथ ज्योतिर्लिंग" },
  { name: "Somnath, India", country: "IN", lat: 20.888, lon: 70.4012, tz: "Asia/Kolkata", desc: "प्रथम ज्योतिर्लिंग सोमनाथ" },
  { name: "Badrinath, India", country: "IN", lat: 30.7433, lon: 79.4938, tz: "Asia/Kolkata", desc: "श्री बद्रीनाथ धाम" },
  { name: "Dwarka, India", country: "IN", lat: 22.2442, lon: 68.9685, tz: "Asia/Kolkata", desc: "द्वारकाधीश धाम" },
  { name: "Rishikesh, India", country: "IN", lat: 30.0869, lon: 78.2676, tz: "Asia/Kolkata", desc: "योग नगरी / गंगा तट" },
  { name: "Nashik / Trimbakeshwar, India", country: "IN", lat: 19.9975, lon: 73.7898, tz: "Asia/Kolkata", desc: "त्र्यंबकेश्वर ज्योतिर्लिंग" },
];

const MAJOR_INDIA_CITIES: { name: string; country: string; lat: number; lon: number; tz: string }[] = [
  { name: "New Delhi, India", country: "IN", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  { name: "Mumbai, India", country: "IN", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  { name: "Bengaluru, India", country: "IN", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  { name: "Kolkata, India", country: "IN", lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
  { name: "Chennai, India", country: "IN", lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
  { name: "Hyderabad, India", country: "IN", lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" },
  { name: "Ahmedabad, India", country: "IN", lat: 23.0225, lon: 72.5714, tz: "Asia/Kolkata" },
  { name: "Pune, India", country: "IN", lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" },
  { name: "Jaipur, India", country: "IN", lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
  { name: "Lucknow, India", country: "IN", lat: 26.8467, lon: 80.9462, tz: "Asia/Kolkata" },
  { name: "Chandigarh, India", country: "IN", lat: 30.7333, lon: 76.7794, tz: "Asia/Kolkata" },
  { name: "Bhopal, India", country: "IN", lat: 23.2599, lon: 77.4126, tz: "Asia/Kolkata" },
  { name: "Patna, India", country: "IN", lat: 25.5941, lon: 85.1376, tz: "Asia/Kolkata" },
  { name: "Indore, India", country: "IN", lat: 22.7196, lon: 75.8577, tz: "Asia/Kolkata" },
  { name: "Surat, India", country: "IN", lat: 21.1702, lon: 72.8311, tz: "Asia/Kolkata" },
  { name: "Nagpur, India", country: "IN", lat: 21.1458, lon: 79.0882, tz: "Asia/Kolkata" },
];

const GLOBAL_CITIES: { name: string; country: string; lat: number; lon: number; tz: string }[] = [
  { name: "Kathmandu, Nepal", country: "NP", lat: 27.7172, lon: 85.324, tz: "Asia/Kathmandu" },
  { name: "London, United Kingdom", country: "GB", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "New York, USA", country: "US", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "San Francisco, USA", country: "US", lat: 37.7749, lon: -122.4194, tz: "America/Los_Angeles" },
  { name: "Chicago, USA", country: "US", lat: 41.8781, lon: -87.6298, tz: "America/Chicago" },
  { name: "Toronto, Canada", country: "CA", lat: 43.6532, lon: -79.3832, tz: "America/Toronto" },
  { name: "Dubai, UAE", country: "AE", lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai" },
  { name: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198, tz: "Asia/Singapore" },
  { name: "Sydney, Australia", country: "AU", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
  { name: "Tokyo, Japan", country: "JP", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  { name: "Frankfurt, Germany", country: "DE", lat: 50.1109, lon: 8.6821, tz: "Europe/Berlin" },
  { name: "Paris, France", country: "FR", lat: 48.8566, lon: 2.3522, tz: "Europe/Paris" },
];

const COMMON_TIMEZONES = [
  { label: "India / Sri Lanka (IST, UTC+05:30)", tz: "Asia/Kolkata" },
  { label: "Nepal (NPT, UTC+05:45)", tz: "Asia/Kathmandu" },
  { label: "Bangladesh (BST, UTC+06:00)", tz: "Asia/Dhaka" },
  { label: "Pakistan (PKT, UTC+05:00)", tz: "Asia/Karachi" },
  { label: "Gulf / Dubai (GST, UTC+04:00)", tz: "Asia/Dubai" },
  { label: "Singapore / Malaysia (SGT, UTC+08:00)", tz: "Asia/Singapore" },
  { label: "United Kingdom (GMT / BST)", tz: "Europe/London" },
  { label: "Central Europe (CET / CEST)", tz: "Europe/Paris" },
  { label: "US Eastern Time (EST / EDT)", tz: "America/New_York" },
  { label: "US Central Time (CST / CDT)", tz: "America/Chicago" },
  { label: "US Mountain Time (MST / MDT)", tz: "America/Denver" },
  { label: "US Pacific Time (PST / PDT)", tz: "America/Los_Angeles" },
  { label: "Eastern Australia (AEST / AEDT)", tz: "Australia/Sydney" },
  { label: "Japan (JST, UTC+09:00)", tz: "Asia/Tokyo" },
];

export const KundliCityModal: React.FC<KundliCityModalProps> = ({
  isOpen,
  onClose,
  selectedCityName,
  onSelectCity,
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "pilgrimage" | "popular" | "global" | "custom">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<{ loading: boolean; error?: string; detected?: { name: string; lat: number; lon: number; tz: string } }>({
    loading: false,
  });

  // Custom coordinate inputs
  const [customName, setCustomName] = useState("कस्टम स्थान (Custom)");
  const [customLat, setCustomLat] = useState("28.6139");
  const [customLon, setCustomLon] = useState("77.2090");
  const [customTz, setCustomTz] = useState("Asia/Kolkata");

  // Fetch cities on search change
  useEffect(() => {
    if (!isOpen) return;

    if (!searchTerm.trim()) {
      fetch("/api/cities?limit=15")
        .then((res) => res.json())
        .then((data) => setSearchResults(data.cities || []))
        .catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/cities?q=${encodeURIComponent(searchTerm.trim())}&limit=25`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.cities || []);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ loading: false, error: "आपके ब्राउज़र में GPS सुविधा समर्थित नहीं है।" });
      return;
    }

    setGpsStatus({ loading: true });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
        let nearestName = `GPS (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`;

        try {
          const res = await fetch(`/api/nearest-city?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.city?.name) {
              nearestName = `${data.city.name.split(",")[0].trim()} (GPS Location)`;
            }
          }
        } catch {
          // ignore
        }

        const detected = {
          name: nearestName,
          lat: Number(lat.toFixed(5)),
          lon: Number(lon.toFixed(5)),
          tz,
        };

        setGpsStatus({ loading: false, detected });
        setCustomLat(String(detected.lat));
        setCustomLon(String(detected.lon));
        setCustomTz(detected.tz);
        setCustomName(detected.name);
      },
      (err) => {
        setGpsStatus({
          loading: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? "स्थान (GPS) अनुमति अस्वीकृत है। कृपया ब्राउज़र में स्थान अनुमति दें।"
              : "स्थान प्राप्त करने में समय समाप्त हो गया। कृपया पुनः प्रयास करें।",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleApplyCity = (item: { name: string; lat: number; lon: number; tz: string }) => {
    onSelectCity(item);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) return;
    onSelectCity({
      name: customName.trim() || `कस्टम (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
      lat,
      lon,
      tz: customTz || "Asia/Kolkata",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-text">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-700 flex items-center justify-between bg-zinc-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                जन्म स्थान चयन (Select Birth City)
              </h3>
              <p className="text-xs text-zinc-400">
                सटीक अक्षांश, देशान्तर व स्थानीय समयानुसार अचूक लग्न कुण्डली गणना
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action Strip */}
        <div className="px-4 sm:px-5 py-3 bg-zinc-800/60 border-b border-zinc-700 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleDetectGPS}
            disabled={gpsStatus.loading}
            className="flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {gpsStatus.loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Navigation className="w-4 h-4 text-amber-400" />
            )}
            <span>वर्तमान स्थान (Live GPS) से लें</span>
          </button>

          {gpsStatus.detected && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-medium">
                ✓ {gpsStatus.detected.name} ({gpsStatus.detected.lat}°, {gpsStatus.detected.lon}°)
              </span>
              <button
                onClick={() => handleApplyCity(gpsStatus.detected!)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                लागू करें
              </button>
            </div>
          )}

          {gpsStatus.error && (
            <span className="text-xs text-red-400 font-medium">{gpsStatus.error}</span>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-zinc-700 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: "search", label: "खोजें (Search)", icon: Search },
            { id: "pilgrimage", label: "तीर्थ व पवित्र नगर", icon: Sparkles },
            { id: "popular", label: "भारत के महानगर", icon: Building2 },
            { id: "global", label: "विश्व के प्रमुख नगर", icon: Globe2 },
            { id: "custom", label: "कस्टम निर्देशांक", icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[40px] px-3.5 py-2 rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-amber-500 text-white bg-zinc-800 font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* 1. Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="नगर का नाम लिखें (उदा. Varanasi, Ujjain, Jaipur, London)..."
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[44px]"
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
                {searchTerm && !isLoading && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="divide-y divide-zinc-700 max-h-72 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-800/40">
                {searchResults.length > 0 ? (
                  searchResults.map((city, idx) => {
                    const isSelected = selectedCityName.toLowerCase().includes(city.name.toLowerCase().split(",")[0]);
                    return (
                      <div
                        key={`${city.name}-${idx}`}
                        onClick={() =>
                          handleApplyCity({
                            name: city.name,
                            lat: city.latitude,
                            lon: city.longitude,
                            tz: city.timezone,
                          })
                        }
                        className={`p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-800 ${
                          isSelected ? "bg-zinc-800 border-l-4 border-amber-500" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-white">{city.name}</div>
                            <div className="text-xs text-zinc-400">
                              अक्षांश: {city.latitude.toFixed(4)}°N • देशान्तर: {city.longitude.toFixed(4)}°E • {city.timezone}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    {isLoading ? "खोज रहे हैं..." : "कोई नगर नहीं मिला। कृपया अलग नाम लिखकर खोजें।"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Pilgrimage Cities Tab */}
          {activeTab === "pilgrimage" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PILGRIMAGE_CITIES.map((c) => (
                <div
                  key={c.name}
                  onClick={() => handleApplyCity(c)}
                  className="p-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 hover:border-amber-500 cursor-pointer transition-all flex flex-col justify-between min-h-[64px]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{c.name.split(",")[0]}</div>
                      <div className="text-xs text-amber-400 font-medium mt-0.5">{c.desc}</div>
                    </div>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                    {c.lat.toFixed(2)}°N, {c.lon.toFixed(2)}°E • {c.tz}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Major India Cities Tab */}
          {activeTab === "popular" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MAJOR_INDIA_CITIES.map((c) => (
                <div
                  key={c.name}
                  onClick={() => handleApplyCity(c)}
                  className="p-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 hover:border-amber-500 cursor-pointer transition-all flex items-center justify-between min-h-[60px]"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{c.name.split(",")[0]}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {c.lat.toFixed(2)}°N, {c.lon.toFixed(2)}°E
                    </div>
                  </div>
                  <Building2 className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}

          {/* 4. Global Cities Tab */}
          {activeTab === "global" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GLOBAL_CITIES.map((c) => (
                <div
                  key={c.name}
                  onClick={() => handleApplyCity(c)}
                  className="p-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 hover:border-amber-500 cursor-pointer transition-all flex items-center justify-between min-h-[60px]"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{c.tz}</div>
                  </div>
                  <Globe2 className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          )}

          {/* 5. Custom Coordinates Form */}
          {activeTab === "custom" && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  स्थान का नाम (Location Name):
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="उदा. मेरा जन्म स्थान"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    अक्षांश (Latitude in Degrees, + उत्तर / - दक्षिण):
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="उदा. 28.6139"
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    देशान्तर (Longitude in Degrees, + पूर्व / - पश्चिम):
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="उदा. 77.2090"
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  समय क्षेत्र (Time Zone):
                </label>
                <select
                  value={customTz}
                  onChange={(e) => setCustomTz(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono min-h-[44px]"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.tz} value={tz.tz} className="bg-zinc-900 text-white">
                      {tz.label} ({tz.tz})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-600 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 min-h-[40px] cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg active:scale-95 min-h-[40px] cursor-pointer"
                >
                  कस्टम स्थान लागू करें
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
