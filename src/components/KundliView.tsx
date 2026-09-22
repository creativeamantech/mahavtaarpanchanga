import React, { useState, useEffect, useMemo } from "react";
import {
  computeFullKundli,
  FullKundliData,
  KundliChartType,
  KundliChartStyle,
  KundliHouse,
  ZODIAC_SIGNS,
} from "../lib/kundliEngine";
import { KundliChartRenderer } from "./KundliChartRenderer";
import { KundliCityModal } from "./KundliCityModal";
import { AshtakavargaView } from "./AshtakavargaView";
import { GunaMilanView } from "./GunaMilanView";
import { KpAstrologyView } from "./KpAstrologyView";
import { GocharView } from "./GocharView";
import { CoordinateSelection } from "../types";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Compass,
  User,
  Save,
  Bookmark,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Layers,
  Search,
  Sliders,
  Maximize2,
  Minimize2,
  Split,
  Eye,
  RotateCcw,
  Check,
  Heart,
  BarChart2,
  RefreshCw,
} from "lucide-react";

interface KundliViewProps {
  initialCity?: string;
  initialLat?: number;
  initialLon?: number;
  initialTimezone?: string;
  initialAyanamsa?: CoordinateSelection;
}

interface SavedProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsaKey: CoordinateSelection;
  gender?: string;
}

const POPULAR_BIRTH_CITIES: { name: string; country: string; lat: number; lon: number; tz: string }[] = [
  { name: "Varanasi (Kashi), India", country: "IN", lat: 25.3176, lon: 82.9739, tz: "Asia/Kolkata" },
  { name: "Ujjain (Mahakal), India", country: "IN", lat: 23.1765, lon: 75.7885, tz: "Asia/Kolkata" },
  { name: "New Delhi, India", country: "IN", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  { name: "Ayodhya, India", country: "IN", lat: 26.7922, lon: 82.1998, tz: "Asia/Kolkata" },
  { name: "Haridwar, India", country: "IN", lat: 29.9457, lon: 78.1642, tz: "Asia/Kolkata" },
  { name: "Mumbai, India", country: "IN", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  { name: "Bengaluru, India", country: "IN", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  { name: "Kolkata, India", country: "IN", lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
  { name: "Chennai, India", country: "IN", lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
  { name: "Jaipur, India", country: "IN", lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
  { name: "Ahmedabad, India", country: "IN", lat: 23.0225, lon: 72.5714, tz: "Asia/Kolkata" },
  { name: "Kathmandu, Nepal", country: "NP", lat: 27.7172, lon: 85.324, tz: "Asia/Kathmandu" },
  { name: "London, United Kingdom", country: "GB", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "New York, USA", country: "US", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "Dubai, UAE", country: "AE", lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai" },
];

export const KundliView: React.FC<KundliViewProps> = ({
  initialCity = "Varanasi (Kashi), India",
  initialLat = 25.3176,
  initialLon = 82.9739,
  initialTimezone = "Asia/Kolkata",
  initialAyanamsa = "citra",
}) => {
  // Matched default city for accurate fallback coordinates
  const matchedInitialCity = useMemo(() => {
    if (!initialCity) return POPULAR_BIRTH_CITIES[0];
    const prefix = initialCity.split(",")[0].trim().toLowerCase();
    const found = POPULAR_BIRTH_CITIES.find((c) =>
      c.name.toLowerCase().includes(prefix) || prefix.includes(c.name.toLowerCase().split(",")[0].trim())
    );
    return found || POPULAR_BIRTH_CITIES[0];
  }, [initialCity]);

  // Birth Input States
  const [personName, setPersonName] = useState<string>("जातक (Jātaka)");
  const [gender, setGender] = useState<string>("male");
  const [birthDate, setBirthDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [birthTime, setBirthTime] = useState<string>("12:00:00");
  const [selectedCity, setSelectedCity] = useState<string>(
    initialCity && POPULAR_BIRTH_CITIES.some((c) => c.name === initialCity)
      ? initialCity
      : matchedInitialCity.name
  );
  const [latitude, setLatitude] = useState<number>(
    typeof initialLat === "number" && !isNaN(initialLat) ? initialLat : matchedInitialCity.lat
  );
  const [longitude, setLongitude] = useState<number>(
    typeof initialLon === "number" && !isNaN(initialLon) ? initialLon : matchedInitialCity.lon
  );
  const [timezone, setTimezone] = useState<string>(
    initialTimezone || matchedInitialCity.tz || "Asia/Kolkata"
  );
  const [ayanamsaKey, setAyanamsaKey] = useState<CoordinateSelection>(initialAyanamsa || "citra");
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const [showAdvancedLocation, setShowAdvancedLocation] = useState<boolean>(false);

  // Chart Presentation States
  const [activeChartType, setActiveChartType] = useState<KundliChartType>("d1");
  const [chartStyle, setChartStyle] = useState<KundliChartStyle>("north");
  const [showDegrees, setShowDegrees] = useState<boolean>(true);
  const [chartSize, setChartSize] = useState<"standard" | "large" | "compact">("standard");
  const [isDualView, setIsDualView] = useState<boolean>(false);
  const [selectedHouse, setSelectedHouse] = useState<KundliHouse | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    | "chart"
    | "planets"
    | "bhavas"
    | "dasha"
    | "ashtakavarga"
    | "gunaMilan"
    | "gochar"
    | "kp"
    | "doshas"
    | "yogas"
    | "avakahada"
  >("chart");
  const [expandedMahadasha, setExpandedMahadasha] = useState<string | null>(null);
  const [yogaFilter, setYogaFilter] = useState<"all" | "auspicious" | "inauspicious">("all");

  // Saved Profiles in LocalStorage
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load saved profiles from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("drik_kundli_profiles");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedProfiles(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute Full Kundli Data
  const kundliData: FullKundliData = useMemo(() => {
    return computeFullKundli(
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
      selectedCity,
      ayanamsaKey,
      personName,
      gender
    );
  }, [birthDate, birthTime, latitude, longitude, timezone, selectedCity, ayanamsaKey, personName, gender]);

  // Set default expanded Mahadasha to current active one
  useEffect(() => {
    if (kundliData.vimshottari.currentMahadasha && !expandedMahadasha) {
      setExpandedMahadasha(kundliData.vimshottari.currentMahadasha.planet);
    }
  }, [kundliData, expandedMahadasha]);

  // Time Stepper Function (for Birth Time Rectification and Prashna)
  const adjustBirthTimeMinutes = (mins: number) => {
    try {
      const [h, m, s] = birthTime.split(":").map((v) => parseInt(v, 10) || 0);
      const totalSec = h * 3600 + m * 60 + s + mins * 60;
      const normalizedSec = ((totalSec % 86400) + 86400) % 86400;
      const newH = Math.floor(normalizedSec / 3600);
      const newM = Math.floor((normalizedSec % 3600) / 60);
      const newS = normalizedSec % 60;
      setBirthTime(
        `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:${String(newS).padStart(2, "0")}`
      );
    } catch {
      // ignore
    }
  };

  // Handle City Change from Modal
  const handleCitySelectFromModal = (city: { name: string; lat: number; lon: number; tz: string }) => {
    setSelectedCity(city.name);
    setLatitude(city.lat);
    setLongitude(city.lon);
    setTimezone(city.tz);
  };

  // Set to Current Time (Prashna Kundali)
  const handleSetCurrentTime = () => {
    const now = new Date();
    setBirthDate(now.toISOString().split("T")[0]);
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    setBirthTime(`${h}:${m}:${s}`);
    setPersonName("प्रश्न कुण्डली (Prashna)");
  };

  // Save Current Profile
  const handleSaveProfile = () => {
    const newProfile: SavedProfile = {
      id: Date.now().toString(),
      name: personName || "जातक",
      birthDate,
      birthTime,
      cityName: selectedCity,
      latitude,
      longitude,
      timezone,
      ayanamsaKey,
      gender,
    };
    const updated = [newProfile, ...savedProfiles.filter((p) => p.name !== newProfile.name)].slice(0, 10);
    setSavedProfiles(updated);
    try {
      localStorage.setItem("drik_kundli_profiles", JSON.stringify(updated));
      setSaveSuccessMsg("कुण्डली प्रोफाइल सुरक्षित कर ली गई है!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch {
      // ignore
    }
  };

  // Load a Saved Profile
  const handleLoadProfile = (prof: SavedProfile) => {
    setPersonName(prof.name);
    setBirthDate(prof.birthDate);
    setBirthTime(prof.birthTime);
    setSelectedCity(prof.cityName);
    setLatitude(prof.latitude);
    setLongitude(prof.longitude);
    setTimezone(prof.timezone);
    setAyanamsaKey(prof.ayanamsaKey || "citra");
    if (prof.gender) setGender(prof.gender);
  };

  // Delete a Saved Profile
  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter((p) => p.id !== id);
    setSavedProfiles(updated);
    try {
      localStorage.setItem("drik_kundli_profiles", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Print Kundli Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-5 select-text text-amber-100">
      {/* City Search Modal */}
      <KundliCityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCityName={selectedCity}
        onSelectCity={handleCitySelectFromModal}
      />

      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-500/30 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              वैदिक दृक-गणित कुण्डली प्रणाली
            </span>
            <span className="text-[11px] text-amber-300/80 font-mono hidden lg:inline">
              अयनांश: {kundliData.profile.ayanamsaName} ({kundliData.profile.ayanamsaDeg.toFixed(2)}°)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-100 tracking-tight flex items-center gap-2">
            जन्म कुण्डली एवं षोडशवर्ग चक्र (Janm Kundli)
          </h1>
          <p className="text-xs text-amber-300/80 mt-0.5">
            {kundliData.profile.name} • जन्म: {kundliData.profile.birthDate} {kundliData.profile.birthTime} • {kundliData.profile.cityName.split(",")[0]}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleSetCurrentTime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all shadow-md active:scale-95"
            title="वर्तमान समय की प्रश्न कुण्डली बनाएं"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            प्रश्न (Now)
          </button>

          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700/60 hover:bg-amber-600/70 text-amber-100 border border-amber-400/40 text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-amber-300" />
            सहेजें
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            प्रिंट / PDF
          </button>

          <button
            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/25 text-xs font-semibold transition-all"
            title={isFormCollapsed ? "जन्म विवरण प्रविष्टि खोलें" : "जन्म विवरण प्रविष्टि छुपाएं"}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFormCollapsed ? "विवरण बदलें" : "संक्षिप्त करें"}</span>
            {isFormCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Saved Profiles Quick Selector Chips */}
      {savedProfiles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-amber-300/70 font-semibold flex items-center gap-1 whitespace-nowrap">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" /> सहेजी गई कुण्डलियाँ:
          </span>
          {savedProfiles.map((p) => (
            <div
              key={p.id}
              onClick={() => handleLoadProfile(p)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs cursor-pointer border transition-all whitespace-nowrap ${
                personName === p.name && birthDate === p.birthDate
                  ? "bg-amber-700/70 border-amber-400 text-amber-100 font-bold shadow-md"
                  : "bg-amber-950/40 border-amber-500/20 text-amber-300/80 hover:bg-amber-900/40 hover:text-amber-100"
              }`}
            >
              <User className="w-3 h-3 text-amber-400" />
              <span>{p.name}</span>
              <span className="text-[10px] opacity-60">({p.birthDate.slice(0, 4)})</span>
              <button
                onClick={(e) => handleDeleteProfile(p.id, e)}
                className="hover:text-rose-400 ml-1 text-xs font-bold"
                title="हटाएं"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Birth Input Controls Panel (Collapsible) */}
      {!isFormCollapsed && (
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-5 backdrop-blur-sm shadow-xl space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
            <h2 className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-400" />
              जन्म विवरण प्रविष्टि (Birth Details Form)
            </h2>

            {/* Quick Rectification Stepper Buttons */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-amber-300/70 mr-1 hidden sm:inline">समय सुधार:</span>
              <button
                onClick={() => adjustBirthTimeMinutes(-60)}
                className="bg-amber-950 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20"
                title="1 घंटा घटाएं"
              >
                -1h
              </button>
              <button
                onClick={() => adjustBirthTimeMinutes(-5)}
                className="bg-amber-950 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20"
                title="5 मिनट घटाएं"
              >
                -5m
              </button>
              <button
                onClick={() => adjustBirthTimeMinutes(-1)}
                className="bg-amber-950 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20"
                title="1 मिनट घटाएं"
              >
                -1m
              </button>
              <button
                onClick={() => adjustBirthTimeMinutes(1)}
                className="bg-amber-950 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20"
                title="1 मिनट बढ़ाएं"
              >
                +1m
              </button>
              <button
                onClick={() => adjustBirthTimeMinutes(5)}
                className="bg-amber-950 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20"
                title="5 मिनट बढ़ाएं"
              >
                +5m
              </button>
              <button
                onClick={() => adjustBirthTimeMinutes(60)}
                className="bg-amber-950 hover:bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20"
                title="1 घंटा बढ़ाएं"
              >
                +1h
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Person Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" /> जातक का नाम (Name):
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="नाम दर्ज करें"
                className="w-full bg-amber-950/50 border border-amber-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> जन्म तिथि (Date of Birth):
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-amber-950/50 border border-amber-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> जन्म समय (Time - HH:mm:ss):
              </label>
              <input
                type="time"
                step="1"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-amber-950/50 border border-amber-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner font-mono"
              />
            </div>

            {/* Birth City Selector with Modal Trigger */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> जन्म स्थान (City):
                </span>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="text-amber-400 hover:text-amber-200 underline text-[11px] font-medium"
                >
                  खोजें / GPS
                </button>
              </label>
              <div
                onClick={() => setIsCityModalOpen(true)}
                className="w-full bg-amber-950/50 border border-amber-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors shadow-inner"
              >
                <span className="truncate">{selectedCity}</span>
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
              </div>
            </div>
          </div>

          {/* Gender & Ayanamsa Secondary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-300">लिंग (Gender):</label>
              <div className="flex gap-2">
                {[
                  { id: "male", label: "पुरुष (M)" },
                  { id: "female", label: "स्त्री (F)" },
                  { id: "other", label: "अन्य" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      gender === g.id
                        ? "bg-amber-700 border-amber-400 text-amber-100 shadow-xs"
                        : "bg-amber-950/40 border-amber-500/20 text-amber-300/80 hover:bg-amber-900/40"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ayanamsa Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" /> अयनांश (Ayanamsa System):
              </label>
              <select
                value={ayanamsaKey}
                onChange={(e) => setAyanamsaKey(e.target.value as CoordinateSelection)}
                className="w-full bg-amber-950/50 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
              >
                <option value="citra">चित्रापक्षीय / लाहिरी (Lahiri Ayanamsa - Drik)</option>
                <option value="raman">बी.वी. रमण (B.V. Raman)</option>
                <option value="kp">के.पी. अयनांश (Krishnamurti Padhdhati)</option>
                <option value="fagan">फागन/ब्रैडले (Fagan-Bradley)</option>
                <option value="tropical">सायन / ट्रॉपिकल (Sayana Tropical)</option>
              </select>
            </div>

            {/* Advanced Coordinates toggle */}
            <div className="space-y-1 flex flex-col justify-end">
              <button
                type="button"
                onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-300 hover:text-amber-100 flex items-center justify-center gap-1.5"
              >
                <span>{showAdvancedLocation ? "कस्टम अक्षांश/देशांतर छुपाएं" : "कस्टम अक्षांश/देशांतर देखें"}</span>
                {showAdvancedLocation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Advanced Coordinates Inputs */}
          {showAdvancedLocation && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-950/60 rounded-xl border border-amber-500/20 text-xs animate-fadeIn">
              <div>
                <label className="text-amber-300 font-semibold block mb-1">अक्षांश (Latitude):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-900 border border-amber-500/30 rounded-lg p-1.5 text-amber-100 font-mono"
                />
              </div>
              <div>
                <label className="text-amber-300 font-semibold block mb-1">देशांतर (Longitude):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-900 border border-amber-500/30 rounded-lg p-1.5 text-amber-100 font-mono"
                />
              </div>
              <div>
                <label className="text-amber-300 font-semibold block mb-1">समय क्षेत्र (Timezone):</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-stone-900 border border-amber-500/30 rounded-lg p-1.5 text-amber-100 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top 5 Essential Vital Astrological Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* 1. Lagna */}
        <div className="bg-stone-950/80 border border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-md">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">लग्न (Ascendant)</div>
          <div className="text-sm sm:text-base font-black text-amber-100 mt-0.5">
            {kundliData.lagna.signNameHi} ({kundliData.lagna.degreeInSign.toFixed(1)}°)
          </div>
          <div className="text-[11px] text-amber-300/70 truncate mt-0.5">
            {kundliData.lagna.nakshatraNameHi} (पाद {kundliData.lagna.pada}) • {kundliData.lagna.lordHi}
          </div>
        </div>

        {/* 2. Moon Sign */}
        <div className="bg-stone-950/80 border border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-md">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">चन्द्र राशि (Moon Sign)</div>
          <div className="text-sm sm:text-base font-black text-amber-100 mt-0.5">
            {kundliData.chandraLagna.signNameHi}
          </div>
          <div className="text-[11px] text-amber-300/70 truncate mt-0.5">
            {kundliData.planets.find((p) => p.id === "Moon")?.nakshatraNameHi} • {kundliData.avakahada.gana.hi} गण
          </div>
        </div>

        {/* 3. Sun Sign */}
        <div className="bg-stone-950/80 border border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-md">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">सूर्य राशि (Sun Sign)</div>
          <div className="text-sm sm:text-base font-black text-amber-100 mt-0.5">
            {kundliData.suryaLagna.signNameHi}
          </div>
          <div className="text-[11px] text-amber-300/70 truncate mt-0.5">
            {kundliData.planets.find((p) => p.id === "Sun")?.nakshatraNameHi} • {kundliData.planets.find((p) => p.id === "Sun")?.degreeInSign.toFixed(1)}°
          </div>
        </div>

        {/* 4. Active Dasha */}
        <div className="bg-stone-950/80 border border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-md">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> सक्रिय महादशा
          </div>
          <div className="text-sm sm:text-base font-black text-amber-100 mt-0.5 truncate">
            {kundliData.vimshottari.currentMahadasha?.planetNameHi || "गुरु"}
            {kundliData.vimshottari.currentAntardasha ? `-${kundliData.vimshottari.currentAntardasha.planetNameHi}` : ""}
          </div>
          <div className="text-[11px] text-amber-300/70 truncate mt-0.5 font-mono">
            तक: {kundliData.vimshottari.currentAntardasha?.endDate.slice(0, 10) || "2028"}
          </div>
        </div>

        {/* 5. Dosha Indicators */}
        <div className="bg-stone-950/80 border border-amber-500/30 p-3 sm:p-3.5 rounded-2xl shadow-md col-span-2 sm:col-span-1">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> मुख्य दोष स्थिति
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                kundliData.doshas.manglik.isManglik
                  ? "bg-rose-950 text-rose-300 border-rose-500/40"
                  : "bg-emerald-950 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {kundliData.doshas.manglik.isManglik ? "मांगलिक" : "मांगलिक नहीं"}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                kundliData.doshas.kalsarpa.present
                  ? "bg-amber-950 text-amber-300 border-amber-500/40"
                  : "bg-emerald-950 text-emerald-300 border-emerald-500/40"
              }`}
            >
              {kundliData.doshas.kalsarpa.present ? "कालसर्प" : "कालसर्प मुक्त"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-amber-500/25 scrollbar-thin">
        {[
          { id: "chart", label: "कुण्डली चक्र (Charts)", icon: Compass },
          { id: "planets", label: "ग्रह स्पष्ट (Planets DMS)", icon: Sun },
          { id: "bhavas", label: "द्वादश भाव (12 Houses)", icon: Layers },
          { id: "dasha", label: "विंशोत्तरी दशा (Dasha Tree)", icon: Clock },
          { id: "ashtakavarga", label: "अष्टकवर्ग (SAV/BAV)", icon: BarChart2 },
          { id: "gunaMilan", label: "गुण मिलान (Matchmaking)", icon: Heart },
          { id: "gochar", label: "गोचर प्रभाव (Transits)", icon: RefreshCw },
          { id: "kp", label: "के.पी. पद्धति (KP Cusps)", icon: Compass },
          { id: "doshas", label: "दोष विश्लेषण (Doshas)", icon: ShieldAlert },
          { id: "yogas", label: "शुभ राजयोग (Yogas)", icon: Award },
          { id: "avakahada", label: "अवकहड़ा चक्र (Avakahada)", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-t border-x ${
                isActive
                  ? "bg-stone-950 text-amber-200 border-amber-500/40 shadow-lg border-b-2 border-b-transparent"
                  : "bg-amber-950/30 text-amber-300/70 border-transparent hover:bg-amber-900/30 hover:text-amber-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-amber-400/60"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: KUNDLI CHARTS & SHODASHVARGA ================= */}
      {selectedTab === "chart" && (
        <div className="space-y-4">
          {/* Chart Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950/80 p-3.5 rounded-2xl border border-amber-500/25 shadow-lg">
            {/* Chart Type Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-amber-300 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> चक्र:
              </span>
              {[
                { id: "d1", label: "लग्न (D1)", desc: "जन्म चक्र" },
                { id: "d9", label: "नवांश (D9)", desc: "धर्म व भाग्य" },
                { id: "chandra", label: "चन्द्र लग्न", desc: "मन व विचार" },
                { id: "surya", label: "सूर्य लग्न", desc: "आत्मबल व कीर्ति" },
                { id: "d10", label: "दशांश (D10)", desc: "कर्म व आजीविका" },
                { id: "chalit", label: "भाव चलित", desc: "भाव-मध्य फल" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChartType(c.id as KundliChartType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    activeChartType === c.id
                      ? "bg-amber-600 text-amber-50 border-amber-400 font-bold shadow-md"
                      : "bg-amber-950/50 text-amber-300/90 border-amber-500/20 hover:bg-amber-900/60 hover:text-amber-100"
                  }`}
                  title={c.desc}
                >
                  {c.label}
                </button>
              ))}

              {/* Shodashavarga All 16 Charts Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={activeChartType}
                  onChange={(e) => {
                    if (e.target.value) {
                      setActiveChartType(e.target.value as KundliChartType);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border appearance-none cursor-pointer pr-7 ${
                    ![
                      "d1",
                      "d9",
                      "chandra",
                      "surya",
                      "d10",
                      "chalit",
                    ].includes(activeChartType)
                      ? "bg-amber-600 text-amber-50 border-amber-400 font-bold shadow-md"
                      : "bg-amber-950/50 text-amber-300/90 border-amber-500/20 hover:bg-amber-900/60 hover:text-amber-100"
                  }`}
                  title="षोडशवर्ग (सभी 16 वर्ग चक्र)"
                >
                  <option value="" disabled className="bg-stone-900 text-stone-400">
                    षोडशवर्ग (D1-D60) ▾
                  </option>
                  {[
                    { id: "d1", label: "D1 - लग्न / राशि (Rashi)" },
                    { id: "d2", label: "D2 - होरा (Hora)" },
                    { id: "d3", label: "D3 - द्रेष्काण (Drekkana)" },
                    { id: "d4", label: "D4 - चतुर्थांश (Chaturthamsha)" },
                    { id: "d7", label: "D7 - सप्तांश (Saptamsha)" },
                    { id: "d9", label: "D9 - नवांश (Navamsha)" },
                    { id: "d10", label: "D10 - दशांश (Dashamsha)" },
                    { id: "d12", label: "D12 - द्वादशांश (Dwadashamsha)" },
                    { id: "d16", label: "D16 - षोडशांश (Shodashamsha)" },
                    { id: "d20", label: "D20 - विंशांश (Vimshamsha)" },
                    { id: "d24", label: "D24 - चतुर्विंशांश (Chaturvimshamsha)" },
                    { id: "d27", label: "D27 - सप्तविंशांश (Saptavimshamsha)" },
                    { id: "d30", label: "D30 - त्रिंशांश (Trimshamsha)" },
                    { id: "d40", label: "D40 - खवेदांश (Khavedamsha)" },
                    { id: "d45", label: "D45 - अक्षवेदांश (Akshavedamsha)" },
                    { id: "d60", label: "D60 - षष्ट्यंश (Shashtiamsha)" },
                  ].map((v) => (
                    <option key={v.id} value={v.id} className="bg-stone-900 text-amber-200">
                      {v.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 text-amber-400 text-[10px]">▼</div>
              </div>
            </div>

            {/* Visual Customization Options (Style, Degrees, Size, Dual View) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Style Selector */}
              <div className="flex items-center rounded-xl bg-amber-950/60 p-0.5 border border-amber-500/20 text-xs">
                <button
                  onClick={() => setChartStyle("north")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    chartStyle === "north" ? "bg-amber-600 text-white font-bold shadow-xs" : "text-amber-300/80"
                  }`}
                >
                  उत्तर (Diamond)
                </button>
                <button
                  onClick={() => setChartStyle("south")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    chartStyle === "south" ? "bg-amber-600 text-white font-bold shadow-xs" : "text-amber-300/80"
                  }`}
                >
                  दक्षिण (Square)
                </button>
              </div>

              {/* Show Degrees Toggle */}
              <button
                onClick={() => setShowDegrees(!showDegrees)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showDegrees
                    ? "bg-amber-800/60 text-amber-100 border-amber-400/40"
                    : "bg-amber-950/40 text-amber-300/60 border-amber-500/20"
                }`}
                title="चार्ट में ग्रहों के अंश दिखाएं या छुपाएं"
              >
                डिग्री (12°) {showDegrees ? "✓" : "✗"}
              </button>

              {/* Dual View Toggle (D1 + D9 Side by Side) */}
              <button
                onClick={() => setIsDualView(!isDualView)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                  isDualView
                    ? "bg-indigo-900/80 text-indigo-100 border-indigo-400 font-bold shadow-md"
                    : "bg-amber-950/40 text-amber-300/80 border-amber-500/20 hover:bg-amber-900/40"
                }`}
                title="D1 और D9 को एक साथ देखें"
              >
                <Split className="w-3.5 h-3.5" />
                <span>D1 + D9 युगल दृश्य</span>
              </button>
            </div>
          </div>

          {/* Dual View Rendering Mode */}
          {isDualView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-bold text-amber-300 mb-2 px-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  मूल लग्न चक्र (D1 Rasi Chart)
                </div>
                <KundliChartRenderer
                  kundliData={kundliData}
                  activeChartType="d1"
                  chartStyle={chartStyle}
                  showDegrees={showDegrees}
                  onSelectHouse={(house) => setSelectedHouse(house)}
                  selectedHouseNumber={selectedHouse?.houseNumber}
                />
              </div>

              <div>
                <div className="text-xs font-bold text-amber-300 mb-2 px-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  नवांश चक्र (D9 Navamsha Chart)
                </div>
                <KundliChartRenderer
                  kundliData={kundliData}
                  activeChartType="d9"
                  chartStyle={chartStyle}
                  showDegrees={showDegrees}
                  onSelectHouse={(house) => setSelectedHouse(house)}
                  selectedHouseNumber={selectedHouse?.houseNumber}
                />
              </div>
            </div>
          ) : (
            /* Single Primary Chart Renderer */
            <KundliChartRenderer
              kundliData={kundliData}
              activeChartType={activeChartType}
              chartStyle={chartStyle}
              showDegrees={showDegrees}
              chartSize={chartSize}
              onSelectHouse={(house) => setSelectedHouse(house)}
              selectedHouseNumber={selectedHouse?.houseNumber}
            />
          )}
        </div>
      )}

      {/* ================= TAB 2: PLANETARY POSITIONS TABLE (GRAHA SPASHTA) ================= */}
      {selectedTab === "planets" && (
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-200 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                ग्रह स्पष्ट सारणी (Planetary Longitudes & Dignities)
              </h3>
              <p className="text-xs text-amber-300/70 mt-0.5">
                दृक-गणित स्पष्ट भोगांश, नक्षत्र, चरण, गति, वक्री/अस्त स्थिति, गरिमा एवं जैमिनी कारक
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-900/40 text-amber-300 border-b border-amber-500/30">
                  <th className="p-3 font-bold">ग्रह (Graha)</th>
                  <th className="p-3 font-bold">राशि (Rasi)</th>
                  <th className="p-3 font-bold">अंश-कला-विकला (DMS)</th>
                  <th className="p-3 font-bold">नक्षत्र व चरण</th>
                  <th className="p-3 font-bold">नक्षत्र स्वामी</th>
                  <th className="p-3 font-bold">उप-स्वामी (KP Sub)</th>
                  <th className="p-3 font-bold">D1 भाव</th>
                  <th className="p-3 font-bold">D9 भाव</th>
                  <th className="p-3 font-bold">गरिमा (Dignity)</th>
                  <th className="p-3 font-bold">जैमिनी कारक</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/15 font-sans">
                {/* Lagna Row */}
                <tr className="bg-amber-900/20 font-semibold text-amber-100">
                  <td className="p-3 flex items-center gap-2 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>लग्न (Ascendant)</span>
                  </td>
                  <td className="p-3">{kundliData.lagna.signNameHi}</td>
                  <td className="p-3 font-mono font-bold text-amber-200">
                    {kundliData.lagna.dms.deg}° {kundliData.lagna.dms.min}&apos; {kundliData.lagna.dms.sec}&quot;
                  </td>
                  <td className="p-3">
                    {kundliData.lagna.nakshatraNameHi} (चरण {kundliData.lagna.pada})
                  </td>
                  <td className="p-3">{kundliData.lagna.lordHi}</td>
                  <td className="p-3 text-amber-300/80">-</td>
                  <td className="p-3 font-bold text-amber-300">१म भाव</td>
                  <td className="p-3 font-bold text-amber-300">१म भाव</td>
                  <td className="p-3 text-amber-300 font-bold">उदय लग्न</td>
                  <td className="p-3">-</td>
                </tr>

                {kundliData.planets.map((planet) => (
                  <tr key={planet.id} className="hover:bg-amber-900/20 transition-colors">
                    <td className="p-3 font-bold flex items-center gap-2">
                      <span className="text-amber-400">{planet.symbol}</span>
                      <span className="text-amber-100">
                        {planet.nameHi} ({planet.nameEn})
                      </span>
                      {planet.isRetrograde && (
                        <span className="bg-amber-700/60 text-amber-100 text-[10px] px-1.5 py-0.2 rounded border border-amber-400/40">
                          वक्री
                        </span>
                      )}
                      {planet.isCombust && (
                        <span className="bg-rose-900/60 text-rose-200 text-[10px] px-1.5 py-0.2 rounded border border-rose-400/40">
                          अस्त
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium">{planet.signNameHi}</td>
                    <td className="p-3 font-mono text-amber-200 font-semibold">
                      {planet.dms.deg}° {planet.dms.min}&apos; {planet.dms.sec}&quot;
                    </td>
                    <td className="p-3">
                      {planet.nakshatraNameHi} (चरण {planet.pada})
                    </td>
                    <td className="p-3 font-medium">{planet.nakshatraLord}</td>
                    <td className="p-3 text-amber-300/80 font-medium">{planet.subLord}</td>
                    <td className="p-3 font-bold text-amber-300">{planet.houseD1}म</td>
                    <td className="p-3 font-bold text-amber-300/80">{planet.houseD9}म</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          planet.dignity === "exalted"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                            : planet.dignity === "debilitated"
                            ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                            : planet.dignity === "own"
                            ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                            : "bg-amber-950/60 text-amber-200/80 border border-amber-500/20"
                        }`}
                      >
                        {planet.dignityLabelHi}
                      </span>
                    </td>
                    <td className="p-3 text-amber-300/90 font-mono font-semibold">
                      {planet.jaiminiKaraka || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 12 BHAVAS & CHALIT VIEW ================= */}
      {selectedTab === "bhavas" && (
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="border-b border-amber-500/20 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-amber-200 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              द्वादश भाव विश्लेषण एवं चलित विवरण (12 Houses Detailed Breakdown)
            </h3>
            <p className="text-xs text-amber-300/70 mt-0.5">
              प्रत्येक भाव की राशि, भावेश (स्वामी), स्थित ग्रह, दृष्टि प्रभाव एवं कारकत्व
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {kundliData.housesD1.map((house) => (
              <div
                key={house.houseNumber}
                className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 space-y-2.5 hover:border-amber-400/40 transition-colors shadow-md"
              >
                <div className="flex items-center justify-between text-xs border-b border-amber-500/15 pb-2">
                  <span className="font-bold text-amber-100 text-sm">
                    {house.houseNumber}म भाव ({house.nameSanskrit})
                  </span>
                  <span className="text-amber-400 font-bold bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                    {house.signNameHi} (स्वामी: {house.lordHi})
                  </span>
                </div>

                <p className="text-xs text-amber-200/90 leading-relaxed line-clamp-3">
                  {house.significanceHi}
                </p>

                <div className="pt-2 border-t border-amber-500/10 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-amber-400 font-bold text-[11px]">स्थित ग्रह:</span>
                    {house.planets.length > 0 ? (
                      house.planets.map((p) => (
                        <span
                          key={p.id}
                          className="bg-amber-800/60 text-amber-100 text-[11px] px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold"
                        >
                          {p.nameHi} ({p.degreeInSign.toFixed(1)}°)
                        </span>
                      ))
                    ) : (
                      <span className="text-amber-400/60 text-[11px]">कोई ग्रह नहीं</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-amber-400/80 font-bold text-[11px]">दृष्टि प्रभाव:</span>
                    {house.aspectingPlanets.length > 0 ? (
                      house.aspectingPlanets.map((p) => (
                        <span key={p.id} className="text-amber-300 text-[11px]">
                          {p.nameHi},
                        </span>
                      ))
                    ) : (
                      <span className="text-amber-400/60 text-[11px]">कोई नहीं</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: VIMSHOTTARI DASHA ENGINE ================= */}
      {selectedTab === "dasha" && (
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                विंशोत्तरी महादशा एवं अन्तर्दशा चक्र (120-Year Vimshottari Tree)
              </h3>
              <p className="text-xs text-amber-300/70 mt-0.5">
                जन्म समय भोग्य दशा: {kundliData.vimshottari.balanceAtBirth.lord} (
                {kundliData.vimshottari.balanceAtBirth.years} वर्ष, {kundliData.vimshottari.balanceAtBirth.months} माह,{" "}
                {kundliData.vimshottari.balanceAtBirth.days} दिन)
              </p>
            </div>

            {/* Currently Running Dasha Highlight */}
            {kundliData.vimshottari.currentMahadasha && (
              <div className="bg-amber-800/60 border border-amber-400/40 px-4 py-2 rounded-xl text-xs">
                <span className="text-amber-300 block text-[10px] font-bold uppercase tracking-wider">
                  वर्तमान सक्रिय दशा:
                </span>
                <span className="font-bold text-amber-100 text-sm">
                  {kundliData.vimshottari.currentMahadasha.planetNameHi} महादशा
                  {kundliData.vimshottari.currentAntardasha
                    ? ` / ${kundliData.vimshottari.currentAntardasha.planetNameHi} अन्तर्दशा`
                    : ""}
                </span>
              </div>
            )}
          </div>

          {/* Dasha Expansion Tree */}
          <div className="space-y-3">
            {kundliData.vimshottari.dashas.map((maha) => {
              const isExpanded = expandedMahadasha === maha.planet;
              return (
                <div
                  key={maha.planet}
                  className={`rounded-2xl border transition-all ${
                    maha.isCurrent
                      ? "bg-amber-900/40 border-amber-400 shadow-md"
                      : "bg-amber-950/40 border-amber-500/20 hover:border-amber-500/40"
                  }`}
                >
                  <div
                    onClick={() => setExpandedMahadasha(isExpanded ? null : maha.planet)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          maha.isCurrent ? "bg-emerald-400 animate-ping" : "bg-amber-600/60"
                        }`}
                      ></span>
                      <span className="font-bold text-amber-100 text-sm sm:text-base">
                        {maha.planetNameHi} ({maha.planet}) महादशा
                      </span>
                      {maha.isCurrent && (
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                          वर्तमान में सक्रिय (Running)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-amber-300/80 font-mono font-semibold">
                        {maha.startDate} से {maha.endDate} ({maha.durationYears} वर्ष)
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>

                  {/* Sub-period (Antardashas) Table */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-amber-500/15 animate-fadeIn">
                      <div className="text-[11px] font-bold text-amber-400 mb-2.5">
                        {maha.planetNameHi} महादशा के अन्तर्गत 9 अन्तर्दशाएं:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {maha.antardashas.map((antar) => (
                          <div
                            key={antar.planet}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                              antar.isCurrent
                                ? "bg-amber-700/70 border-amber-300 font-bold text-amber-50 shadow-md"
                                : "bg-amber-950/50 border-amber-500/15 text-amber-200/80"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                {maha.planetNameHi}-{antar.planetNameHi} ({antar.planet})
                              </span>
                              {antar.isCurrent && (
                                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                  सक्रिय
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-amber-300/80 font-mono mt-1">
                              {antar.startDate} → {antar.endDate} ({antar.durationMonths} माह)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 5: VEDIC DOSHAS ANALYSIS ================= */}
      {selectedTab === "doshas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Manglik / Kuja Dosha Card */}
          <div
            className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl space-y-3.5 ${
              kundliData.doshas.manglik.isManglik
                ? "bg-rose-950/30 border-rose-500/40"
                : "bg-emerald-950/25 border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Flame
                  className={`w-5 h-5 ${
                    kundliData.doshas.manglik.isManglik ? "text-rose-400" : "text-emerald-400"
                  }`}
                />
                <span className={kundliData.doshas.manglik.isManglik ? "text-rose-200 font-black" : "text-emerald-200 font-black"}>
                  मांगलिक दोष (Kuja Dosha)
                </span>
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  kundliData.doshas.manglik.isManglik
                    ? "bg-rose-900/60 text-rose-200 border-rose-400/40"
                    : "bg-emerald-900/60 text-emerald-200 border-emerald-400/40"
                }`}
              >
                {kundliData.doshas.manglik.isManglik
                  ? "मांगलिक प्रभाव उपस्थित"
                  : kundliData.doshas.manglik.isCancelled
                  ? "दोष निष्प्रभावी (Cancelled)"
                  : "मांगलिक दोष नहीं"}
              </span>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              {kundliData.doshas.manglik.descriptionHi}
            </p>

            <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-300 block">वैदिक उपाय व मार्गदर्शन:</span>
              <p className="text-amber-200/80">{kundliData.doshas.manglik.remedyHi}</p>
            </div>
          </div>

          {/* Kalsarpa Dosha Card */}
          <div
            className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl space-y-3.5 ${
              kundliData.doshas.kalsarpa.present
                ? "bg-amber-950/40 border-amber-500/40"
                : "bg-emerald-950/25 border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShieldAlert
                  className={`w-5 h-5 ${
                    kundliData.doshas.kalsarpa.present ? "text-amber-400" : "text-emerald-400"
                  }`}
                />
                <span className={kundliData.doshas.kalsarpa.present ? "text-amber-200 font-black" : "text-emerald-200 font-black"}>
                  कालसर्प योग (Kalsarpa Analysis)
                </span>
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  kundliData.doshas.kalsarpa.present
                    ? "bg-amber-900/60 text-amber-200 border-amber-400/40"
                    : "bg-emerald-900/60 text-emerald-200 border-emerald-400/40"
                }`}
              >
                {kundliData.doshas.kalsarpa.present ? "कालसर्प योग उपस्थित" : "कालसर्प योग नहीं"}
              </span>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              {kundliData.doshas.kalsarpa.descriptionHi}
            </p>

            <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-300 block">वैदिक उपाय व मार्गदर्शन:</span>
              <p className="text-amber-200/80">{kundliData.doshas.kalsarpa.remedyHi}</p>
            </div>
          </div>

          {/* Sade Sati & Dhaiya Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-500/25 bg-stone-950/80 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-400" />
                शनि साढ़े साती एवं ढैय्या गोचर
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-900/50 text-amber-200 border border-amber-500/30">
                {kundliData.doshas.sadeSati.statusLabelHi}
              </span>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              {kundliData.doshas.sadeSati.descriptionHi}
            </p>

            <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-300 block">शनि कृपा व शांति उपाय:</span>
              <p className="text-amber-200/80">{kundliData.doshas.sadeSati.remedyHi}</p>
            </div>
          </div>

          {/* Gandanta & Moola Nakshatra Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-500/25 bg-stone-950/80 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                गण्डान्त व मूल नक्षत्र स्थिति
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-900/50 text-amber-200 border border-amber-500/30">
                {kundliData.doshas.gandanta.isGandanta ? "गण्डान्त प्रभाव" : "गण्डान्त मुक्त"}
              </span>
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              {kundliData.doshas.gandanta.descriptionHi}
            </p>

            <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-300 block">शांति उपाय:</span>
              <p className="text-amber-200/80">{kundliData.doshas.gandanta.remedyHi}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: AUSPICIOUS YOGAS ================= */}
      {selectedTab === "yogas" && (
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                कुण्डली में उपस्थित विशिष्ट योग व फल (Planetary Yogas)
              </h3>
              <p className="text-xs text-amber-300/70 mt-0.5">
                गजकेसरी, बुधादित्य, पंचमहापुरुष एवं अन्य शुभ-अशुभ वैदिक योग संयोजन
              </p>
            </div>

            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setYogaFilter("all")}
                className={`px-3 py-1 rounded-lg font-semibold border ${
                  yogaFilter === "all"
                    ? "bg-amber-700 text-white border-amber-400"
                    : "bg-amber-950/40 text-amber-300/80 border-amber-500/20"
                }`}
              >
                सभी
              </button>
              <button
                onClick={() => setYogaFilter("auspicious")}
                className={`px-3 py-1 rounded-lg font-semibold border ${
                  yogaFilter === "auspicious"
                    ? "bg-emerald-800 text-white border-emerald-400"
                    : "bg-amber-950/40 text-amber-300/80 border-amber-500/20"
                }`}
              >
                शुभ योग
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {kundliData.yogas
              .filter((y) => (yogaFilter === "all" ? true : y.type === yogaFilter))
              .map((yoga, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    yoga.present
                      ? yoga.type === "auspicious"
                        ? "bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                        : "bg-rose-950/30 border-rose-500/40"
                      : "bg-amber-950/30 border-amber-500/15 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {yoga.present ? (
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            yoga.type === "auspicious" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-600/40"></span>
                      )}
                      <span className="font-bold text-amber-100 text-sm">{yoga.nameHi}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        yoga.present
                          ? "bg-emerald-900/60 text-emerald-200 border border-emerald-400/40"
                          : "bg-amber-900/30 text-amber-400/60"
                      }`}
                    >
                      {yoga.present ? "सक्रिय (Present)" : "अनुपस्थित"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80 leading-relaxed">{yoga.descriptionHi}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= TAB 7: AVAKAHADA CHAKRA & JANMA PANCHANGA ================= */}
      {selectedTab === "avakahada" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Avakahada Chakra Card */}
          <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-2.5">
              <BookOpen className="w-5 h-5 text-amber-400" />
              अवकहड़ा चक्र विवरण (Avakahada Chakra)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15">
                <span className="text-amber-400 font-bold block text-[11px]">वर्ण (Varna)</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.varna.hi}</span>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15">
                <span className="text-amber-400 font-bold block text-[11px]">वश्य (Vashya)</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.vashya.hi}</span>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15">
                <span className="text-amber-400 font-bold block text-[11px]">योनि (Yoni)</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.yoni.hi}</span>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15">
                <span className="text-amber-400 font-bold block text-[11px]">गण (Gana)</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.gana.hi}</span>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15">
                <span className="text-amber-400 font-bold block text-[11px]">नाड़ी (Nadi)</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.nadi.hi}</span>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15">
                <span className="text-amber-400 font-bold block text-[11px]">तत्त्व (Tatva)</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.tatva.hi}</span>
              </div>
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/15 col-span-2">
                <span className="text-amber-400 font-bold block text-[11px]">पाया (Paya)</span>
                <span className="text-sm font-bold text-amber-100">
                  {kundliData.avakahada.paya.hi} पाया ({kundliData.avakahada.paya.quality})
                </span>
              </div>
            </div>
          </div>

          {/* Lucky Astrological Identifiers Card */}
          <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              भाग्यशाली रत्न, रंग व इष्टदेव (Lucky Factors)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-amber-300 font-semibold">शुभ रत्न (Lucky Gemstone):</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.luckyGemstone.hi}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-amber-300 font-semibold">शुभ रंग (Lucky Color):</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.luckyColor.hi}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-amber-300 font-semibold">शुभ अंक (Lucky Number):</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.luckyNumber}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-amber-300 font-semibold">इष्ट देव (Presiding Deity):</span>
                <span className="text-sm font-bold text-amber-100">{kundliData.avakahada.luckyDeity.hi}</span>
              </div>

              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-amber-300 font-semibold block mb-1.5">अनुकूल राशियां (Friendly Signs):</span>
                <div className="flex flex-wrap gap-1.5">
                  {kundliData.avakahada.friendlyRasis.map((r, i) => (
                    <span
                      key={i}
                      className="bg-amber-800/50 text-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-500/30 text-xs font-medium"
                    >
                      {r} राशि
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 8: ASHTAKAVARGA ================= */}
      {selectedTab === "ashtakavarga" && (
        <AshtakavargaView
          planets={kundliData.planets}
          lagnaSignIndex={kundliData.lagna.signIndex}
        />
      )}

      {/* ================= TAB 9: GUNA MILAN (MATCHMAKING) ================= */}
      {selectedTab === "gunaMilan" && (
        <GunaMilanView
          currentPersonName={kundliData.profile.name}
          currentMoonNakshatra={
            kundliData.planets.find((p) => p.id === "Moon")?.nakshatraNumber || 1
          }
          currentMoonPada={
            kundliData.planets.find((p) => p.id === "Moon")?.pada || 1
          }
          currentMoonRasi={kundliData.chandraLagna.signIndex}
          currentIsManglik={kundliData.doshas.manglik.isManglik}
        />
      )}

      {/* ================= TAB 10: GOCHAR (PLANETARY TRANSITS) ================= */}
      {selectedTab === "gochar" && (
        <GocharView
          natalMoonSignIndex={kundliData.chandraLagna.signIndex}
          natalLagnaSignIndex={kundliData.lagna.signIndex}
          latitude={kundliData.profile.latitude}
          longitude={kundliData.profile.longitude}
        />
      )}

      {/* ================= TAB 11: KP ASTROLOGY CUSPS ================= */}
      {selectedTab === "kp" && (
        <KpAstrologyView
          lagnaLongitude={kundliData.lagna.longitude}
          planets={kundliData.planets}
        />
      )}
    </div>
  );
};
