import React, { useState, useEffect, useMemo } from "react";
import {
  computeFullKundli,
  FullKundliData,
  KundliChartType,
  KundliChartStyle,
  KundliHouse,
  KundliPlanet,
} from "../lib/kundliEngine";
import { KundliChartRenderer } from "./KundliChartRenderer";
import { KundliCityModal } from "./KundliCityModal";
import { KundliWelcomeFlow } from "./KundliWelcomeFlow";
import { AshtakavargaView } from "./AshtakavargaView";
import { GunaMilanView } from "./GunaMilanView";
import { KpAstrologyView } from "./KpAstrologyView";
import { GocharView } from "./GocharView";
import { JaiminiView } from "./JaiminiView";
import { ShadbalaView } from "./ShadbalaView";
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
  Layers,
  Search,
  Split,
  Heart,
  BarChart2,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  ArrowRight,
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

type TabGroup = "basic" | "timing" | "advanced" | "match";

type TabId =
  | "overview"
  | "chart"
  | "planets"
  | "bhavas"
  | "dasha"
  | "yogas"
  | "doshas"
  | "gochar"
  | "shadbala"
  | "jaimini"
  | "ashtakavarga"
  | "kp"
  | "gunaMilan"
  | "avakahada";

const TAB_GROUP_CONFIG: Record<
  TabGroup,
  {
    label: string;
    icon: string;
    subTabs: { id: TabId; label: string; icon: any }[];
  }
> = {
  basic: {
    label: "🌟 मूल — Basic",
    icon: "🌟",
    subTabs: [
      { id: "overview", label: "अवलोकन", icon: Sparkles },
      { id: "chart", label: "कुण्डली चक्र", icon: Compass },
      { id: "planets", label: "ग्रह स्थिति", icon: Sun },
      { id: "bhavas", label: "12 भाव", icon: Layers },
    ],
  },
  timing: {
    label: "⏱ दशा — Timing",
    icon: "⏱",
    subTabs: [
      { id: "dasha", label: "दशा चक्र", icon: Clock },
      { id: "yogas", label: "शुभ योग", icon: Award },
      { id: "doshas", label: "दोष", icon: ShieldAlert },
      { id: "gochar", label: "गोचर", icon: RefreshCw },
    ],
  },
  advanced: {
    label: "📊 उन्नत — Advanced",
    icon: "📊",
    subTabs: [
      { id: "shadbala", label: "ग्रह शक्ति", icon: Zap },
      { id: "jaimini", label: "जैमिनी", icon: Award },
      { id: "ashtakavarga", label: "बिंदु तालिका", icon: BarChart2 },
      { id: "kp", label: "K.P. भाव", icon: Compass },
    ],
  },
  match: {
    label: "💑 मिलान — Match",
    icon: "💑",
    subTabs: [
      { id: "gunaMilan", label: "गुण मिलान", icon: Heart },
      { id: "avakahada", label: "अवकहड़ा", icon: BookOpen },
    ],
  },
};

const TAB_TO_GROUP: Record<TabId, TabGroup> = {
  overview: "basic",
  chart: "basic",
  planets: "basic",
  bhavas: "basic",
  dasha: "timing",
  yogas: "timing",
  doshas: "timing",
  gochar: "timing",
  shadbala: "advanced",
  jaimini: "advanced",
  ashtakavarga: "advanced",
  kp: "advanced",
  gunaMilan: "match",
  avakahada: "match",
};

const POPULAR_BIRTH_CITIES: {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
}[] = [
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
  const matchedInitialCity = useMemo(() => {
    if (!initialCity) return POPULAR_BIRTH_CITIES[0];
    const prefix = initialCity.split(",")[0].trim().toLowerCase();
    const found = POPULAR_BIRTH_CITIES.find(
      (c) =>
        c.name.toLowerCase().includes(prefix) ||
        prefix.includes(c.name.toLowerCase().split(",")[0].trim())
    );
    return found || POPULAR_BIRTH_CITIES[0];
  }, [initialCity]);

  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [formMode, setFormMode] = useState<"beginner" | "expert">("beginner");

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
    typeof initialLat === "number" && !isNaN(initialLat)
      ? initialLat
      : matchedInitialCity.lat
  );
  const [longitude, setLongitude] = useState<number>(
    typeof initialLon === "number" && !isNaN(initialLon)
      ? initialLon
      : matchedInitialCity.lon
  );
  const [timezone, setTimezone] = useState<string>(
    initialTimezone || matchedInitialCity.tz || "Asia/Kolkata"
  );
  const [ayanamsaKey, setAyanamsaKey] = useState<CoordinateSelection>(
    initialAyanamsa || "citra"
  );
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const [showAdvancedLocation, setShowAdvancedLocation] = useState<boolean>(false);

  const [activeChartType, setActiveChartType] = useState<KundliChartType>("d1");
  const [chartStyle, setChartStyle] = useState<KundliChartStyle>("north");
  const [showDegrees, setShowDegrees] = useState<boolean>(true);
  const [isDualView, setIsDualView] = useState<boolean>(false);
  const [selectedHouse, setSelectedHouse] = useState<KundliHouse | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<KundliPlanet | null>(null);

  const [activeTabGroup, setActiveTabGroup] = useState<TabGroup>("basic");
  const [selectedTab, setSelectedTab] = useState<TabId>("overview");

  const [expandedMahadasha, setExpandedMahadasha] = useState<string | null>(null);
  const [expandedAntardasha, setExpandedAntardasha] = useState<string | null>(null);
  const [yogaFilter, setYogaFilter] = useState<"all" | "auspicious" | "inauspicious">("all");
  const [planetFilter, setPlanetFilter] = useState<
    "all" | "benefic" | "malefic" | "retrograde" | "exalted"
  >("all");
  const [planetSearchQuery, setPlanetSearchQuery] = useState<string>("");

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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
  }, [
    birthDate,
    birthTime,
    latitude,
    longitude,
    timezone,
    selectedCity,
    ayanamsaKey,
    personName,
    gender,
  ]);

  useEffect(() => {
    if (kundliData.vimshottari.currentMahadasha && !expandedMahadasha) {
      setExpandedMahadasha(kundliData.vimshottari.currentMahadasha.planet);
    }
  }, [kundliData, expandedMahadasha]);

  useEffect(() => {
    if (!selectedHouse && kundliData.housesD1 && kundliData.housesD1.length > 0) {
      setSelectedHouse(kundliData.housesD1[0]);
    }
  }, [kundliData, selectedHouse]);

  const handleSelectTabWithGroup = (tab: TabId) => {
    setSelectedTab(tab);
    const parentGroup = TAB_TO_GROUP[tab];
    if (parentGroup && parentGroup !== activeTabGroup) {
      setActiveTabGroup(parentGroup);
    }
  };

  const handleGroupSelect = (group: TabGroup) => {
    setActiveTabGroup(group);
    const firstSubTab = TAB_GROUP_CONFIG[group].subTabs[0]?.id || "overview";
    setSelectedTab(firstSubTab);
  };

  const adjustBirthTimeMinutes = (mins: number) => {
    try {
      const [h, m, s] = birthTime.split(":").map((v) => parseInt(v, 10) || 0);
      const totalSec = h * 3600 + m * 60 + s + mins * 60;
      const normalizedSec = ((totalSec % 86400) + 86400) % 86400;
      const newH = Math.floor(normalizedSec / 3600);
      const newM = Math.floor((normalizedSec % 3600) / 60);
      const newS = normalizedSec % 60;
      setBirthTime(
        `${String(newH).padStart(2, "0")}:${String(newM).padStart(
          2,
          "0"
        )}:${String(newS).padStart(2, "0")}`
      );
    } catch {
      // ignore
    }
  };

  const handleCitySelectFromModal = (city: {
    name: string;
    lat: number;
    lon: number;
    tz: string;
  }) => {
    setSelectedCity(city.name);
    setLatitude(city.lat);
    setLongitude(city.lon);
    setTimezone(city.tz);
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    setBirthDate(now.toISOString().split("T")[0]);
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    setBirthTime(`${h}:${m}:${s}`);
    setPersonName("प्रश्न कुण्डली (Prashna)");
  };

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
    const updated = [
      newProfile,
      ...savedProfiles.filter((p) => p.name !== newProfile.name),
    ].slice(0, 10);
    setSavedProfiles(updated);
    try {
      localStorage.setItem("drik_kundli_profiles", JSON.stringify(updated));
      setSaveSuccessMsg("कुण्डली प्रोफाइल सुरक्षित कर ली गई है!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch {
      // ignore
    }
  };

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
    setShowWelcome(false);
  };

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

  const handlePrint = () => {
    window.print();
  };

  const filteredPlanets = useMemo(() => {
    return kundliData.planets.filter((planet) => {
      if (planetSearchQuery) {
        const q = planetSearchQuery.toLowerCase();
        const matchesName =
          planet.nameHi.toLowerCase().includes(q) ||
          planet.nameEn.toLowerCase().includes(q) ||
          planet.signNameHi.toLowerCase().includes(q) ||
          planet.nakshatraNameHi.toLowerCase().includes(q);
        if (!matchesName) return false;
      }
      if (planetFilter === "benefic") return planet.isBenefic;
      if (planetFilter === "malefic") return !planet.isBenefic;
      if (planetFilter === "retrograde") return planet.isRetrograde;
      if (planetFilter === "exalted")
        return planet.dignity === "exalted" || planet.dignity === "own";
      return true;
    });
  }, [kundliData.planets, planetFilter, planetSearchQuery]);

  const handleHouseSelect = (house: KundliHouse) => {
    setSelectedHouse(house);
    setSelectedPlanet(null);
  };

  const handlePlanetSelect = (planet: KundliPlanet) => {
    setSelectedPlanet(planet);
    const house =
      kundliData.housesD1.find((h) => h.houseNumber === planet.houseD1) || null;
    if (house) setSelectedHouse(house);
  };

  if (showWelcome) {
    return (
      <div className="w-full bg-zinc-950 min-h-screen">
        <KundliCityModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          selectedCityName={selectedCity}
          onSelectCity={handleCitySelectFromModal}
        />
        <KundliWelcomeFlow
          personName={personName}
          setPersonName={setPersonName}
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          birthTime={birthTime}
          setBirthTime={setBirthTime}
          selectedCity={selectedCity}
          onOpenCityModal={() => setIsCityModalOpen(true)}
          onComplete={() => setShowWelcome(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6 select-text text-zinc-100">
      {/* City Search Modal */}
      <KundliCityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCityName={selectedCity}
        onSelectCity={handleCitySelectFromModal}
      />

      {/* ================= TOP WORKSPACE COMMAND HEADER ================= */}
      <div className="bg-zinc-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-700 backdrop-blur-md shadow-2xl space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-1 flex-wrap">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold tracking-widest uppercase bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-600 text-amber-400">
                वैदिक कुण्डली अनुसंधान केंद्र (Kundali Workspace)
              </span>
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                अयनांश: {kundliData.profile.ayanamsaName} (
                {kundliData.profile.ayanamsaDeg.toFixed(2)}°)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{kundliData.profile.name}</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 font-mono">
                ({kundliData.profile.birthDate} • {kundliData.profile.birthTime})
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {kundliData.profile.cityName}
              </span>
              <span>•</span>
              <span className="font-mono">
                {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">
                {gender === "male"
                  ? "पुरुष (Male)"
                  : gender === "female"
                  ? "स्त्री (Female)"
                  : "जातक"}
              </span>
            </p>
          </div>

          {/* Quick Command Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleSetCurrentTime}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              title="वर्तमान समय की प्रश्न कुण्डली बनाएं"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              प्रश्न (Now)
            </button>

            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              सहेजें
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              प्रिंट
            </button>

            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 text-xs font-semibold transition-all shadow-md cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFormCollapsed ? "विवरण सम्पादित करें" : "संक्षिप्त करें"}</span>
              {isFormCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-950 border border-emerald-600 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Saved Profiles Quick Selector Chips */}
      {savedProfiles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1 whitespace-nowrap">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" /> सहेजी गई कुण्डलियाँ:
          </span>
          {savedProfiles.map((p) => (
            <div
              key={p.id}
              onClick={() => handleLoadProfile(p)}
              className={`flex items-center gap-1.5 min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs cursor-pointer border transition-all whitespace-nowrap ${
                personName === p.name && birthDate === p.birthDate
                  ? "bg-amber-600 border-amber-500 text-white font-bold shadow-md"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{p.name}</span>
              <span className="text-[10px] opacity-60">
                ({p.birthDate.slice(0, 4)})
              </span>
              <button
                onClick={(e) => handleDeleteProfile(p.id, e)}
                className="hover:text-red-400 ml-1 text-sm font-bold"
                title="हटाएं"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= BIRTH INPUT CONTROLS PANEL (BEGINNER / EXPERT TOGGLE) ================= */}
      {!isFormCollapsed && (
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-5 backdrop-blur-sm shadow-xl space-y-4 animate-fadeIn">
          {/* Header with Beginner / Expert Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-700 pb-3 gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-400" />
              जन्म विवरण प्रविष्टि (Birth Data Form)
            </h2>

            {/* Beginner / Expert Mode Buttons */}
            <div className="flex items-center rounded-xl bg-zinc-800 p-1 border border-zinc-600 text-xs">
              <button
                type="button"
                onClick={() => setFormMode("beginner")}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  formMode === "beginner"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                सरल (Beginner)
              </button>
              <button
                type="button"
                onClick={() => setFormMode("expert")}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  formMode === "expert"
                    ? "bg-amber-600 text-white shadow-md font-bold"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                विशेषज्ञ (Expert)
              </button>
            </div>
          </div>

          {/* Core Beginner Fields (Always Visible) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Person Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" /> जातक का नाम:
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="नाम दर्ज करें"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[44px]"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> जन्म तिथि:
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[44px]"
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> जन्म समय (HH:mm:ss):
              </label>
              <input
                type="time"
                step="1"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[44px] font-mono"
              />
            </div>

            {/* City Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> जन्म स्थान (City):
                </span>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 underline text-[11px] font-medium cursor-pointer"
                >
                  खोजें / GPS
                </button>
              </label>
              <div
                onClick={() => setIsCityModalOpen(true)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white flex items-center justify-between cursor-pointer hover:border-amber-500 transition-colors min-h-[44px]"
              >
                <span className="truncate">{selectedCity}</span>
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
              </div>
            </div>
          </div>

          {/* Expert Mode Additional Fields */}
          {formMode === "expert" && (
            <div className="space-y-3.5 pt-2 border-t border-zinc-700 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">लिंग (Gender):</label>
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
                        className={`flex-1 min-h-[44px] py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          gender === g.id
                            ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                            : "bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ayanamsa Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-400" /> अयनांश (Ayanamsa System):
                  </label>
                  <select
                    value={ayanamsaKey}
                    onChange={(e) =>
                      setAyanamsaKey(e.target.value as CoordinateSelection)
                    }
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    <option value="citra">चित्रापक्षीय / लाहिरी (Lahiri - Drik)</option>
                    <option value="raman">बी.वी. रमण (B.V. Raman)</option>
                    <option value="kp">के.पी. अयनांश (KP Ayanamsa)</option>
                    <option value="fagan">फागन/ब्रैडले (Fagan-Bradley)</option>
                    <option value="tropical">सायन / ट्रॉपिकल (Sayana)</option>
                  </select>
                </div>

                {/* Advanced Coordinates toggle */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-zinc-800 border border-zinc-600 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {showAdvancedLocation
                        ? "कस्टम अक्षांश/देशांतर छुपाएं"
                        : "कस्टम अक्षांश/देशांतर देखें"}
                    </span>
                    {showAdvancedLocation ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Advanced Coordinates Custom Inputs */}
              {showAdvancedLocation && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-xs animate-fadeIn">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">
                      अक्षांश (Latitude):
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-2 text-white font-mono min-h-[40px] focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">
                      देशांतर (Longitude):
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-2 text-white font-mono min-h-[40px] focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">
                      समय क्षेत्र (Timezone):
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-600 rounded-lg p-2 text-white font-mono min-h-[40px] focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Time Rectification Stepper Bar in Expert Mode */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-700 text-xs flex-wrap">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>जन्म समय सूक्ष्म सुधार (Rectification):</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    onClick={() => adjustBirthTimeMinutes(-60)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-h-[36px]"
                    title="1 घंटा घटाएं"
                  >
                    -1h
                  </button>
                  <button
                    onClick={() => adjustBirthTimeMinutes(-5)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-h-[36px]"
                    title="5 मिनट घटाएं"
                  >
                    -5m
                  </button>
                  <button
                    onClick={() => adjustBirthTimeMinutes(-1)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-h-[36px]"
                    title="1 मिनट घटाएं"
                  >
                    -1m
                  </button>
                  <span className="px-3 py-1.5 bg-zinc-800 text-white font-mono font-bold rounded-lg border border-zinc-600 min-h-[36px] flex items-center">
                    {birthTime}
                  </span>
                  <button
                    onClick={() => adjustBirthTimeMinutes(1)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-h-[36px]"
                    title="1 मिनट बढ़ाएं"
                  >
                    +1m
                  </button>
                  <button
                    onClick={() => adjustBirthTimeMinutes(5)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-h-[36px]"
                    title="5 मिनट बढ़ाएं"
                  >
                    +5m
                  </button>
                  <button
                    onClick={() => adjustBirthTimeMinutes(60)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-h-[36px]"
                    title="1 घंटा बढ़ाएं"
                  >
                    +1h
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2-LEVEL TAB SYSTEM (STICKY ON MOBILE) ================= */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md pb-2 pt-1 border-b border-zinc-700 space-y-2">
        {/* Level 1: 4 Group Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {(["basic", "timing", "advanced", "match"] as TabGroup[]).map((groupKey) => {
            const config = TAB_GROUP_CONFIG[groupKey];
            const isActive = activeTabGroup === groupKey;
            return (
              <button
                key={groupKey}
                onClick={() => handleGroupSelect(groupKey)}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-amber-600 text-white border-amber-500 shadow-lg scale-102"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Level 2: Sub-tabs of Active Group */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {TAB_GROUP_CONFIG[activeTabGroup].subTabs.map((subTab) => {
            const Icon = subTab.icon;
            const isSubActive = selectedTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => handleSelectTabWithGroup(subTab.id)}
                className={`min-h-[40px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSubActive
                    ? "bg-amber-600 text-white border-amber-500 shadow-md"
                    : "bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSubActive ? "text-white" : "text-amber-400"}`} />
                <span>{subTab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 0: OVERVIEW INTELLIGENCE DASHBOARD ================= */}
      {selectedTab === "overview" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top 5 Essential Vital Astrological Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Lagna */}
            <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-2xl shadow-md">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                लग्न (Ascendant)
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {kundliData.lagna.signNameHi} ({kundliData.lagna.degreeInSign.toFixed(1)}°)
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {kundliData.lagna.nakshatraNameHi} (पाद {kundliData.lagna.pada}) • {kundliData.lagna.lordHi}
              </div>
            </div>

            {/* 2. Moon Sign */}
            <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-2xl shadow-md">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                चन्द्र राशि (Moon Sign)
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {kundliData.chandraLagna.signNameHi}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {kundliData.planets.find((p) => p.id === "Moon")?.nakshatraNameHi} • {kundliData.avakahada.gana.hi} गण
              </div>
            </div>

            {/* 3. Sun Sign */}
            <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-2xl shadow-md">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                सूर्य राशि (Sun Sign)
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {kundliData.suryaLagna.signNameHi}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {kundliData.planets.find((p) => p.id === "Sun")?.nakshatraNameHi} • {kundliData.planets.find((p) => p.id === "Sun")?.degreeInSign.toFixed(1)}°
              </div>
            </div>

            {/* 4. Active Dasha */}
            <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-2xl shadow-md">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> सक्रिय महादशा
              </div>
              <div className="text-base font-bold text-white mt-0.5 truncate">
                {kundliData.vimshottari.currentMahadasha?.planetNameHi || "गुरु"}
                {kundliData.vimshottari.currentAntardasha
                  ? `-${kundliData.vimshottari.currentAntardasha.planetNameHi}`
                  : ""}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                तक: {kundliData.vimshottari.currentAntardasha?.endDate.slice(0, 10) || "2028"}
              </div>
            </div>

            {/* 5. Dosha Indicators */}
            <div className="bg-zinc-900 border border-zinc-700 p-3.5 rounded-2xl shadow-md col-span-2 sm:col-span-1">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> मुख्य दोष स्थिति
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    kundliData.doshas.manglik.isManglik
                      ? "bg-red-950 text-red-300 border-red-800"
                      : "bg-emerald-950 text-emerald-300 border-emerald-800"
                  }`}
                >
                  {kundliData.doshas.manglik.isManglik ? "मांगलिक" : "मांगलिक नहीं"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    kundliData.doshas.kalsarpa.present
                      ? "bg-orange-950 text-orange-300 border-orange-800"
                      : "bg-emerald-950 text-emerald-300 border-emerald-800"
                  }`}
                >
                  {kundliData.doshas.kalsarpa.present ? "कालसर्प" : "कालसर्प मुक्त"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              {
                title: "लग्न कुण्डली (D1)",
                desc: "मूल जन्म चक्र",
                icon: Compass,
                action: () => {
                  setActiveChartType("d1");
                  handleSelectTabWithGroup("chart");
                },
              },
              {
                title: "नवांश चक्र (D9)",
                desc: "भाग्य व विवाह",
                icon: Sparkles,
                action: () => {
                  setActiveChartType("d9");
                  handleSelectTabWithGroup("chart");
                },
              },
              {
                title: "विंशोत्तरी दशा",
                desc: "120-वर्षीय समय चक्र",
                icon: Clock,
                action: () => handleSelectTabWithGroup("dasha"),
              },
              {
                title: "षड्बल विश्लेषण",
                desc: "6-स्तरीय ग्रह बल",
                icon: Zap,
                action: () => handleSelectTabWithGroup("shadbala"),
              },
              {
                title: "जैमिनी पद्धति",
                desc: "कारक व अरूढ़",
                icon: Award,
                action: () => handleSelectTabWithGroup("jaimini"),
              },
              {
                title: "अष्टकवर्ग (SAV)",
                desc: "सामर्थ्य मैट्रिक्स",
                icon: BarChart2,
                action: () => handleSelectTabWithGroup("ashtakavarga"),
              },
              {
                title: "गुण मिलान",
                desc: "अष्टकूट 36 अंक",
                icon: Heart,
                action: () => handleSelectTabWithGroup("gunaMilan"),
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <button
                  key={idx}
                  onClick={card.action}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 p-3 rounded-2xl text-left transition-all group flex flex-col justify-between min-h-[72px] cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {card.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {card.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Dual Preview: D1 Chart + Core Planetary Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart Area */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  लग्न कुण्डली चक्र (D1 Birth Chart)
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setChartStyle(chartStyle === "north" ? "south" : "north")
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-600 text-zinc-200 hover:bg-zinc-700 min-h-[36px]"
                  >
                    {chartStyle === "north" ? "उत्तर (Diamond)" : "दक्षिण (Square)"}
                  </button>
                  <button
                    onClick={() => {
                      setActiveChartType("d1");
                      handleSelectTabWithGroup("chart");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-600 border border-amber-500 text-white font-semibold min-h-[36px]"
                  >
                    विस्तार से देखें
                  </button>
                </div>
              </div>

              <KundliChartRenderer
                kundliData={kundliData}
                activeChartType="d1"
                chartStyle={chartStyle}
                showDegrees={showDegrees}
                onSelectHouse={handleHouseSelect}
                onSelectPlanet={handlePlanetSelect}
                selectedHouseNumber={selectedHouse?.houseNumber}
              />
            </div>

            {/* Quick Planetary Snapshot & Active Yogas */}
            <div className="lg:col-span-6 space-y-4">
              {/* Planetary Quick List */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ग्रह स्थिति सारांश (Planetary Status)
                  </h4>
                  <button
                    onClick={() => handleSelectTabWithGroup("planets")}
                    className="text-amber-400 hover:text-amber-300 text-xs font-medium underline cursor-pointer"
                  >
                    सम्पूर्ण DMS सारणी ➔
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {kundliData.planets.map((planet) => (
                    <div
                      key={planet.id}
                      onClick={() => handlePlanetSelect(planet)}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-2 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1">
                          <span className="text-amber-400 font-bold">{planet.symbol}</span>
                          <span>{planet.nameHi.split(" ")[0]}</span>
                        </span>
                        {planet.isRetrograde && (
                          <span className="text-[9px] bg-orange-900 text-orange-300 px-1 rounded">
                            व
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-300 mt-0.5">
                        {planet.signNameHi.split(" ")[0]} • {planet.degreeInSign.toFixed(1)}°
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {planet.nakshatraNameHi} ({planet.pada})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Yogas Snapshot */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    सक्रिय वैदिक योग (Active Yogas)
                  </h4>
                  <button
                    onClick={() => handleSelectTabWithGroup("yogas")}
                    className="text-amber-400 hover:text-amber-300 text-xs font-medium underline cursor-pointer"
                  >
                    सभी योग देखें ➔
                  </button>
                </div>

                <div className="space-y-2">
                  {kundliData.yogas
                    .filter((y) => y.present)
                    .slice(0, 3)
                    .map((yoga, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-950 border border-emerald-700 p-2.5 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {yoga.nameHi}
                          </span>
                          <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded font-semibold border border-emerald-600">
                            सक्रिय
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 line-clamp-2">
                          {yoga.descriptionHi}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 1: KUNDLI CHARTS & SHODASHVARGA ================= */}
      {selectedTab === "chart" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Chart Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 p-3.5 rounded-2xl border border-zinc-700 shadow-lg">
            {/* Primary Varga Selectors */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-zinc-300 mr-1 flex items-center gap-1">
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
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    activeChartType === c.id
                      ? "bg-amber-600 text-white border-amber-500 font-bold shadow-md"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
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
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border appearance-none cursor-pointer pr-7 ${
                    ![
                      "d1",
                      "d9",
                      "chandra",
                      "surya",
                      "d10",
                      "chalit",
                    ].includes(activeChartType)
                      ? "bg-amber-600 text-white border-amber-500 font-bold shadow-md"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                  }`}
                  title="षोडशवर्ग (सभी 16 वर्ग चक्र)"
                >
                  <option value="" disabled className="bg-zinc-900 text-zinc-400">
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
                    <option key={v.id} value={v.id} className="bg-zinc-900 text-white">
                      {v.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2 text-amber-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Visual Customization Options */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Style Selector */}
              <div className="flex items-center rounded-xl bg-zinc-800 p-0.5 border border-zinc-600 text-xs">
                <button
                  onClick={() => setChartStyle("north")}
                  className={`min-h-[36px] px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    chartStyle === "north"
                      ? "bg-amber-600 text-white font-bold shadow-xs"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  उत्तर (Diamond)
                </button>
                <button
                  onClick={() => setChartStyle("south")}
                  className={`min-h-[36px] px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    chartStyle === "south"
                      ? "bg-amber-600 text-white font-bold shadow-xs"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  दक्षिण (Square)
                </button>
              </div>

              {/* Show Degrees Toggle */}
              <button
                onClick={() => setShowDegrees(!showDegrees)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  showDegrees
                    ? "bg-amber-600 text-white border-amber-500"
                    : "bg-zinc-800 text-zinc-400 border-zinc-600 hover:text-white"
                }`}
                title="चार्ट में ग्रहों के अंश दिखाएं या छुपाएं"
              >
                अंश {showDegrees ? "✓" : "✗"}
              </button>

              {/* Dual View Toggle */}
              <button
                onClick={() => setIsDualView(!isDualView)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                  isDualView
                    ? "bg-amber-600 text-white border-amber-500 font-bold shadow-md"
                    : "bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                }`}
                title="D1 और D9 को एक साथ देखें"
              >
                <Split className="w-3.5 h-3.5" />
                <span>D1 + D9 युगल</span>
              </button>
            </div>
          </div>

          {/* Dual View Rendering Mode */}
          {isDualView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-bold text-zinc-300 mb-2 px-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  मूल लग्न चक्र (D1 Rasi Chart)
                </div>
                <KundliChartRenderer
                  kundliData={kundliData}
                  activeChartType="d1"
                  chartStyle={chartStyle}
                  showDegrees={showDegrees}
                  onSelectHouse={handleHouseSelect}
                  onSelectPlanet={handlePlanetSelect}
                  selectedHouseNumber={selectedHouse?.houseNumber}
                />
              </div>

              <div>
                <div className="text-xs font-bold text-zinc-300 mb-2 px-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  नवांश चक्र (D9 Navamsha Chart)
                </div>
                <KundliChartRenderer
                  kundliData={kundliData}
                  activeChartType="d9"
                  chartStyle={chartStyle}
                  showDegrees={showDegrees}
                  onSelectHouse={handleHouseSelect}
                  onSelectPlanet={handlePlanetSelect}
                  selectedHouseNumber={selectedHouse?.houseNumber}
                />
              </div>
            </div>
          ) : (
            /* Standard 2-Column Responsive Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Chart on Left / Main Area */}
              <div className="lg:col-span-8">
                <KundliChartRenderer
                  kundliData={kundliData}
                  activeChartType={activeChartType}
                  chartStyle={chartStyle}
                  showDegrees={showDegrees}
                  onSelectHouse={handleHouseSelect}
                  onSelectPlanet={handlePlanetSelect}
                  selectedHouseNumber={selectedHouse?.houseNumber}
                />
              </div>

              {/* Real-time Contextual House & Planet Inspector Panel on Right */}
              <div className="lg:col-span-4 space-y-4">
                {selectedHouse && (
                  <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                          भाव अनुसन्धान (House Inspector)
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {selectedHouse.houseNumber}म भाव — {selectedHouse.nameSanskrit}
                        </h4>
                      </div>
                      <span className="bg-zinc-800 text-amber-400 text-xs px-2.5 py-1 rounded-lg border border-zinc-600 font-bold">
                        {selectedHouse.signNameHi} (स्वामी: {selectedHouse.lordHi})
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedHouse.significanceHi}
                    </p>

                    {/* House Occupants */}
                    <div className="pt-2 border-t border-zinc-700 space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-300 block">
                        भाव में स्थित ग्रह:
                      </span>
                      {selectedHouse.planets.length > 0 ? (
                        <div className="space-y-1">
                          {selectedHouse.planets.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handlePlanetSelect(p)}
                              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-between text-xs cursor-pointer transition-colors"
                            >
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="text-amber-400">{p.symbol}</span>
                                <span>{p.nameHi}</span>
                              </span>
                              <span className="text-zinc-300 font-mono">
                                {p.degreeInSign.toFixed(2)}° ({p.nakshatraNameHi})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 italic block">
                          इस भाव में कोई ग्रह स्थित नहीं है।
                        </span>
                      )}
                    </div>

                    {/* Aspecting Planets */}
                    <div className="pt-2 border-t border-zinc-700 space-y-1">
                      <span className="text-xs font-semibold text-zinc-300 block">
                        भाव पर दृष्टि रखने वाले ग्रह:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHouse.aspectingPlanets.length > 0 ? (
                          selectedHouse.aspectingPlanets.map((p) => (
                            <span
                              key={p.id}
                              className="bg-zinc-800 text-zinc-200 text-[11px] px-2 py-0.5 rounded-lg border border-zinc-600"
                            >
                              {p.nameHi}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">
                            कोई प्रत्यक्ष दृष्टि नहीं
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Planet Inspector Card */}
                {selectedPlanet && (
                  <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4 space-y-2.5 shadow-xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-amber-400 font-bold">
                          {selectedPlanet.symbol}
                        </span>
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                            ग्रह विश्लेषण
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {selectedPlanet.nameHi} ({selectedPlanet.nameEn})
                          </h4>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          selectedPlanet.dignity === "exalted"
                            ? "bg-emerald-900 text-emerald-300 border-emerald-600"
                            : selectedPlanet.dignity === "debilitated"
                            ? "bg-red-900/60 text-red-300 border-red-600"
                            : "bg-zinc-800 text-zinc-300 border-zinc-600"
                        }`}
                      >
                        {selectedPlanet.dignityLabelHi}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                        <span className="text-[10px] text-zinc-400 block">
                          राशि व भोगांश:
                        </span>
                        <span className="font-bold text-white">
                          {selectedPlanet.signNameHi} ({selectedPlanet.degreeInSign.toFixed(2)}°)
                        </span>
                      </div>
                      <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                        <span className="text-[10px] text-zinc-400 block">
                          नक्षत्र व चरण:
                        </span>
                        <span className="font-bold text-white">
                          {selectedPlanet.nakshatraNameHi} ({selectedPlanet.pada})
                        </span>
                      </div>
                      <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                        <span className="text-[10px] text-zinc-400 block">
                          नक्षत्र / उप स्वामी:
                        </span>
                        <span className="font-bold text-white">
                          {selectedPlanet.nakshatraLord} / {selectedPlanet.subLord}
                        </span>
                      </div>
                      <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                        <span className="text-[10px] text-zinc-400 block">
                          D1 / D9 भाव:
                        </span>
                        <span className="font-bold text-white">
                          {selectedPlanet.houseD1}म / {selectedPlanet.houseD9}म भाव
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PLANETARY POSITIONS TABLE (GRAHA SPASHTA) ================= */}
      {selectedTab === "planets" && (
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-700 pb-3 gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-200 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                ग्रह स्पष्ट सारणी (Planetary Longitudes & Dignities)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                दृक-गणित स्पष्ट भोगांश, नक्षत्र, चरण, गति, वक्री/अस्त स्थिति, गरिमा एवं जैमिनी कारक
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ग्रह खोजें..."
                  value={planetSearchQuery}
                  onChange={(e) => setPlanetSearchQuery(e.target.value)}
                  className="bg-zinc-800 border border-zinc-600 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[40px]"
                />
              </div>

              <div className="flex items-center rounded-xl bg-zinc-800 p-0.5 border border-zinc-600 text-xs">
                {[
                  { id: "all", label: "सभी" },
                  { id: "benefic", label: "शुभ ग्रह" },
                  { id: "malefic", label: "पाप ग्रह" },
                  { id: "retrograde", label: "वक्री" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPlanetFilter(f.id as typeof planetFilter)}
                    className={`min-h-[36px] px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      planetFilter === f.id
                        ? "bg-amber-600 text-white font-bold shadow-xs"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-800 text-zinc-300 border-b border-zinc-700">
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
              <tbody className="divide-y divide-zinc-700 font-sans">
                {/* Lagna Row */}
                <tr className="bg-zinc-800/40 font-semibold text-zinc-100">
                  <td className="p-3 flex items-center gap-2 font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>लग्न (Ascendant)</span>
                  </td>
                  <td className="p-3 text-zinc-300">{kundliData.lagna.signNameHi}</td>
                  <td className="p-3 font-mono font-bold text-amber-300">
                    {kundliData.lagna.dms.deg}° {kundliData.lagna.dms.min}&apos;{" "}
                    {kundliData.lagna.dms.sec}&quot;
                  </td>
                  <td className="p-3 text-zinc-300">
                    {kundliData.lagna.nakshatraNameHi} (चरण {kundliData.lagna.pada})
                  </td>
                  <td className="p-3 text-zinc-300">{kundliData.lagna.lordHi}</td>
                  <td className="p-3 text-zinc-500">-</td>
                  <td className="p-3 font-bold text-amber-400">१म भाव</td>
                  <td className="p-3 font-bold text-amber-400">१म भाव</td>
                  <td className="p-3 text-amber-400 font-bold">उदय लग्न</td>
                  <td className="p-3 text-zinc-500">-</td>
                </tr>

                {filteredPlanets.map((planet) => (
                  <tr
                    key={planet.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-3 font-bold flex items-center gap-2">
                      <span className="text-amber-400 font-bold">{planet.symbol}</span>
                      <span className="text-white">
                        {planet.nameHi} ({planet.nameEn})
                      </span>
                      {planet.isRetrograde && (
                        <span className="bg-orange-900 text-orange-300 text-[10px] px-1.5 py-0.2 rounded border border-orange-700 font-semibold">
                          वक्री
                        </span>
                      )}
                      {planet.isCombust && (
                        <span className="bg-red-900/60 text-red-300 text-[10px] px-1.5 py-0.2 rounded border border-red-600 font-semibold">
                          अस्त
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-zinc-300">{planet.signNameHi}</td>
                    <td className="p-3 font-mono text-amber-300 font-semibold">
                      {planet.dms.deg}° {planet.dms.min}&apos; {planet.dms.sec}&quot;
                    </td>
                    <td className="p-3 text-zinc-300">
                      {planet.nakshatraNameHi} (चरण {planet.pada})
                    </td>
                    <td className="p-3 font-medium text-zinc-300">{planet.nakshatraLord}</td>
                    <td className="p-3 text-zinc-400 font-medium">
                      {planet.subLord}
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      {planet.houseD1}म
                    </td>
                    <td className="p-3 font-bold text-zinc-400">
                      {planet.houseD9}म
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          planet.dignity === "exalted"
                            ? "bg-emerald-900 text-emerald-300 border border-emerald-600"
                            : planet.dignity === "debilitated"
                            ? "bg-red-900/60 text-red-300 border border-red-600"
                            : planet.dignity === "own"
                            ? "bg-blue-900 text-blue-300 border border-blue-600"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-600"
                        }`}
                      >
                        {planet.dignityLabelHi}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300 font-mono font-semibold">
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
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="border-b border-zinc-700 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-zinc-200 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              द्वादश भाव विश्लेषण एवं चलित विवरण (12 Houses Detailed Breakdown)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              प्रत्येक भाव की राशि, भावेश (स्वामी), स्थित ग्रह, दृष्टि प्रभाव एवं कारकत्व
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {kundliData.housesD1.map((house) => {
              const isKendra = [1, 4, 7, 10].includes(house.houseNumber);
              const isTrikona = [1, 5, 9].includes(house.houseNumber);
              const isDusthana = [6, 8, 12].includes(house.houseNumber);
              return (
                <div
                  key={house.houseNumber}
                  className={`bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-2.5 hover:border-zinc-500 transition-colors shadow-md flex flex-col justify-between ${
                    isKendra
                      ? "border-l-4 border-l-amber-500"
                      : isTrikona
                      ? "border-l-4 border-l-emerald-500"
                      : isDusthana
                      ? "border-l-4 border-l-red-500"
                      : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-zinc-700 pb-2">
                      <span className="font-bold text-white text-sm">
                        {house.houseNumber}म भाव ({house.nameSanskrit})
                      </span>
                      <div className="flex items-center gap-1">
                        {isKendra && (
                          <span className="text-[10px] bg-zinc-800 text-amber-400 px-1.5 py-0.2 rounded border border-zinc-600 font-bold">
                            केन्द्र
                          </span>
                        )}
                        {isTrikona && !isKendra && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                            त्रिकोण
                          </span>
                        )}
                        {isDusthana && (
                          <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-800 font-bold">
                            दुःस्थान
                          </span>
                        )}
                        <span className="text-amber-400 font-bold bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-600">
                          {house.signNameHi} (स्वामी: {house.lordHi})
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {house.significanceHi}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-700 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-amber-400 font-bold text-[11px]">
                        स्थित ग्रह:
                      </span>
                      {house.planets.length > 0 ? (
                        house.planets.map((p) => (
                          <span
                            key={p.id}
                            className="bg-zinc-800 text-zinc-100 text-[11px] px-2 py-0.5 rounded-lg border border-zinc-600 font-semibold"
                          >
                            {p.nameHi} ({p.degreeInSign.toFixed(1)}°)
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 text-[11px]">
                          कोई ग्रह नहीं
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-400 font-bold text-[11px]">
                        दृष्टि प्रभाव:
                      </span>
                      {house.aspectingPlanets.length > 0 ? (
                        house.aspectingPlanets.map((p) => (
                          <span key={p.id} className="text-zinc-300 text-[11px]">
                            {p.nameHi},
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 text-[11px]">
                          कोई नहीं
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: VIMSHOTTARI DASHA ENGINE ================= */}
      {selectedTab === "dasha" && (
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-700 pb-3 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                विंशोत्तरी महादशा एवं अन्तर्दशा चक्र (120-Year Vimshottari Tree)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                जन्म समय भोग्य दशा: {kundliData.vimshottari.balanceAtBirth.lord} (
                {kundliData.vimshottari.balanceAtBirth.years} वर्ष,{" "}
                {kundliData.vimshottari.balanceAtBirth.months} माह,{" "}
                {kundliData.vimshottari.balanceAtBirth.days} दिन)
              </p>
            </div>

            {/* Currently Running Dasha Highlight */}
            {kundliData.vimshottari.currentMahadasha && (
              <div className="bg-zinc-800 border border-amber-500/40 px-4 py-2 rounded-xl text-xs">
                <span className="text-amber-400 block text-[10px] font-bold uppercase tracking-wider">
                  वर्तमान सक्रिय दशा:
                </span>
                <span className="font-bold text-white text-sm">
                  {kundliData.vimshottari.currentMahadasha.planetNameHi} महादशा
                  {kundliData.vimshottari.currentAntardasha
                    ? ` / ${kundliData.vimshottari.currentAntardasha.planetNameHi} अन्तर्दशा`
                    : ""}
                  {kundliData.vimshottari.canonicalTimeline?.currentPeriods
                    .pratyantardasha
                    ? ` / ${kundliData.vimshottari.canonicalTimeline.currentPeriods.pratyantardasha.lordNameHi} प्रत्यन्तर`
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
                      ? "bg-amber-900/40 border-amber-600 shadow-md"
                      : "bg-zinc-900 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <div
                    onClick={() =>
                      setExpandedMahadasha(isExpanded ? null : maha.planet)
                    }
                    className="p-4 flex items-center justify-between cursor-pointer select-none text-xs sm:text-sm min-h-[48px]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          maha.isCurrent
                            ? "bg-emerald-400 animate-ping"
                            : "bg-zinc-600"
                        }`}
                      ></span>
                      <span className="font-bold text-white text-sm sm:text-base">
                        {maha.planetNameHi} ({maha.planet}) महादशा
                      </span>
                      {maha.isCurrent && (
                        <span className="bg-emerald-800 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-600 font-bold">
                          वर्तमान में सक्रिय (Running)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-zinc-300 font-mono font-semibold">
                        {maha.startDate} से {maha.endDate} ({maha.durationYears}{" "}
                        वर्ष)
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Sub-period (Antardashas) Table */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-zinc-700 animate-fadeIn">
                      <div className="text-[11px] font-bold text-amber-400 mb-2.5">
                        {maha.planetNameHi} महादशा के अन्तर्गत 9 अन्तर्दशाएं
                        (प्रत्यन्तर्दशा देखने हेतु क्लिक करें):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {maha.antardashas.map((antar) => {
                          const antarKey = `${maha.planet}-${antar.planet}`;
                          const isAntarExpanded =
                            expandedAntardasha === antarKey;
                          return (
                            <div
                              key={antar.planet}
                              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                                isAntarExpanded
                                  ? "col-span-full ring-1 ring-amber-500"
                                  : ""
                              } ${
                                antar.isCurrent
                                  ? "bg-amber-700 text-white border-amber-500 font-bold shadow-md"
                                  : "bg-zinc-800 border-zinc-700 text-zinc-200"
                              }`}
                            >
                              <div
                                onClick={() =>
                                  setExpandedAntardasha(
                                    isAntarExpanded ? null : antarKey
                                  )
                                }
                                className="cursor-pointer select-none"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold flex items-center gap-1.5">
                                    {maha.planetNameHi}-{antar.planetNameHi} (
                                    {antar.planet})
                                    {antar.pratyantardashas && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-700 text-zinc-300 border border-zinc-600">
                                        9 प्रत्यन्तर {isAntarExpanded ? "▲" : "▼"}
                                      </span>
                                    )}
                                  </span>
                                  {antar.isCurrent && (
                                    <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                                      सक्रिय
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-300 font-mono mt-1">
                                  {antar.startDate} → {antar.endDate} (
                                  {antar.durationMonths} माह)
                                </div>
                              </div>

                              {/* Nested Level 3: Pratyantardashas */}
                              {isAntarExpanded && antar.pratyantardashas && (
                                <div className="mt-3 pt-2.5 border-t border-zinc-700 animate-fadeIn">
                                  <div className="text-[10px] font-bold text-amber-400 mb-2">
                                    {maha.planetNameHi}-{antar.planetNameHi} के
                                    अन्तर्गत 9 प्रत्यन्तर्दशाएं (Level 3):
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                                    {antar.pratyantardashas.map((prat) => (
                                      <div
                                        key={prat.planet}
                                        className={`p-1.5 rounded-lg border text-[11px] ${
                                          prat.isCurrent
                                            ? "bg-emerald-900/80 border-emerald-600 text-emerald-200 font-bold"
                                            : "bg-zinc-900 border-zinc-700 text-zinc-300"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span>
                                            {prat.planetNameHi} ({prat.planet})
                                          </span>
                                          {prat.isCurrent && (
                                            <span className="text-[8px] bg-emerald-800 text-emerald-200 px-1 rounded">
                                              वर्तमान
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[9px] text-zinc-400 font-mono">
                                          {prat.startDate} → {prat.endDate} (
                                          {prat.durationDays} दिन)
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SHADBALA VIEW ================= */}
      {selectedTab === "shadbala" && (
        <ShadbalaView shadbala={kundliData.shadbala} />
      )}

      {/* ================= TAB 6: JAIMINI JYOTISHA SYSTEM ================= */}
      {selectedTab === "jaimini" && (
        <JaiminiView jaimini={kundliData.jaimini} />
      )}

      {/* ================= TAB 7: ASHTAKAVARGA ================= */}
      {selectedTab === "ashtakavarga" && (
        <AshtakavargaView
          planets={kundliData.planets}
          lagnaSignIndex={kundliData.lagna.signIndex}
        />
      )}

      {/* ================= TAB 8: KP ASTROLOGY CUSPS ================= */}
      {selectedTab === "kp" && (
        <KpAstrologyView
          lagnaLongitude={kundliData.lagna.longitude}
          planets={kundliData.planets}
        />
      )}

      {/* ================= TAB 9: AUSPICIOUS YOGAS ================= */}
      {selectedTab === "yogas" && (
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-700 pb-3 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                कुण्डली में उपस्थित विशिष्ट योग व फल (Planetary Yogas)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                गजकेसरी, बुधादित्य, पंचमहापुरुष एवं अन्य शुभ-अशुभ वैदिक योग संयोजन
              </p>
            </div>

            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setYogaFilter("all")}
                className={`min-h-[36px] px-3 py-1 rounded-lg font-semibold border cursor-pointer ${
                  yogaFilter === "all"
                    ? "bg-amber-600 text-white border-amber-500"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
              >
                सभी
              </button>
              <button
                onClick={() => setYogaFilter("auspicious")}
                className={`min-h-[36px] px-3 py-1 rounded-lg font-semibold border cursor-pointer ${
                  yogaFilter === "auspicious"
                    ? "bg-emerald-900 text-emerald-300 border-emerald-600"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
              >
                शुभ योग
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {kundliData.yogas
              .filter((y) => (yogaFilter === "all" ? true : y.type === yogaFilter))
              .map((yoga, idx) => {
                const matchingRule = kundliData.ruleResults?.find(
                  (r) =>
                    r.nameEn.toLowerCase() === yoga.nameEn.toLowerCase() ||
                    r.nameHi === yoga.nameHi
                );
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      yoga.present
                        ? yoga.type === "auspicious"
                          ? "bg-emerald-950 border border-emerald-700 shadow-sm"
                          : "bg-red-950/60 border border-red-600"
                        : "bg-zinc-900 border border-zinc-700 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {yoga.present ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              yoga.type === "auspicious"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                        )}
                        <span className={`text-sm ${yoga.present ? "font-bold text-emerald-300" : "font-semibold text-zinc-400"}`}>
                          {yoga.nameHi}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          yoga.present
                            ? "bg-emerald-800 text-emerald-200 border border-emerald-600"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }`}
                      >
                        {yoga.present ? "सक्रिय (Present)" : "अनुपस्थित"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {yoga.descriptionHi}
                    </p>
                    {matchingRule && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-700 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-600">
                          {matchingRule.sourceReference}
                        </span>
                        {matchingRule.dashaActivation
                          ?.isActivatedByCurrentMaha && (
                          <span className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600 font-bold">
                            दशा सक्रिय (
                            {matchingRule.dashaActivation.activeMahadashaLord})
                          </span>
                        )}
                        <span className="text-amber-400 font-mono">
                          बल: {(matchingRule.overallStrengthScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ================= TAB 10: VEDIC DOSHAS ANALYSIS ================= */}
      {selectedTab === "doshas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {/* Manglik / Kuja Dosha Card */}
          <div
            className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl space-y-3.5 ${
              kundliData.doshas.manglik.isManglik
                ? "bg-red-950 border border-red-800"
                : "bg-emerald-950 border border-emerald-800"
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Flame
                  className={`w-5 h-5 ${
                    kundliData.doshas.manglik.isManglik
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                />
                <span
                  className={
                    kundliData.doshas.manglik.isManglik
                      ? "text-red-200 font-bold"
                      : "text-emerald-200 font-bold"
                  }
                >
                  मांगलिक दोष (Kuja Dosha)
                </span>
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  kundliData.doshas.manglik.isManglik
                    ? "bg-red-900/60 text-red-300 border-red-600"
                    : "bg-emerald-900 text-emerald-300 border-emerald-600"
                }`}
              >
                {kundliData.doshas.manglik.isManglik
                  ? "मांगलिक प्रभाव उपस्थित"
                  : kundliData.doshas.manglik.isCancelled
                  ? "दोष निष्प्रभावी (Cancelled)"
                  : "मांगलिक दोष नहीं"}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {kundliData.doshas.manglik.descriptionHi}
            </p>

            <div className="bg-zinc-800 p-3.5 rounded-xl border border-zinc-700 text-xs space-y-1">
              <span className="font-bold text-amber-400 block">
                वैदिक उपाय व मार्गदर्शन:
              </span>
              <p className="text-zinc-300">
                {kundliData.doshas.manglik.remedyHi}
              </p>
            </div>
          </div>

          {/* Kalsarpa Dosha Card */}
          <div
            className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl space-y-3.5 ${
              kundliData.doshas.kalsarpa.present
                ? "bg-orange-950 border border-orange-800"
                : "bg-emerald-950 border border-emerald-800"
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShieldAlert
                  className={`w-5 h-5 ${
                    kundliData.doshas.kalsarpa.present
                      ? "text-orange-400"
                      : "text-emerald-400"
                  }`}
                />
                <span
                  className={
                    kundliData.doshas.kalsarpa.present
                      ? "text-orange-200 font-bold"
                      : "text-emerald-200 font-bold"
                  }
                >
                  कालसर्प योग (Kalsarpa Analysis)
                </span>
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  kundliData.doshas.kalsarpa.present
                    ? "bg-orange-900 text-orange-300 border-orange-700"
                    : "bg-emerald-900 text-emerald-300 border-emerald-600"
                }`}
              >
                {kundliData.doshas.kalsarpa.present
                  ? "कालसर्प योग उपस्थित"
                  : "कालसर्प योग नहीं"}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {kundliData.doshas.kalsarpa.descriptionHi}
            </p>

            <div className="bg-zinc-800 p-3.5 rounded-xl border border-zinc-700 text-xs space-y-1">
              <span className="font-bold text-amber-400 block">
                वैदिक उपाय व मार्गदर्शन:
              </span>
              <p className="text-zinc-300">
                {kundliData.doshas.kalsarpa.remedyHi}
              </p>
            </div>
          </div>

          {/* Sade Sati & Dhaiya Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-700 bg-zinc-900 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
              <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-400" />
                शनि साढ़े साती एवं ढैय्या गोचर
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-zinc-800 text-zinc-200 border border-zinc-600">
                {kundliData.doshas.sadeSati.statusLabelHi}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {kundliData.doshas.sadeSati.descriptionHi}
            </p>

            <div className="bg-zinc-800 p-3.5 rounded-xl border border-zinc-700 text-xs space-y-1">
              <span className="font-bold text-amber-400 block">
                शनि कृपा व शांति उपाय:
              </span>
              <p className="text-zinc-300">
                {kundliData.doshas.sadeSati.remedyHi}
              </p>
            </div>
          </div>

          {/* Gandanta & Moola Nakshatra Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-700 bg-zinc-900 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
              <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                गण्डान्त व मूल नक्षत्र स्थिति
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-zinc-800 text-zinc-200 border border-zinc-600">
                {kundliData.doshas.gandanta.isGandanta
                  ? "गण्डान्त प्रभाव"
                  : "गण्डान्त मुक्त"}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {kundliData.doshas.gandanta.descriptionHi}
            </p>

            <div className="bg-zinc-800 p-3.5 rounded-xl border border-zinc-700 text-xs space-y-1">
              <span className="font-bold text-amber-400 block">शांति उपाय:</span>
              <p className="text-zinc-300">
                {kundliData.doshas.gandanta.remedyHi}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 11: GUNA MILAN (MATCHMAKING) ================= */}
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

      {/* ================= TAB 12: GOCHAR (PLANETARY TRANSITS) ================= */}
      {selectedTab === "gochar" && (
        <GocharView
          natalMoonSignIndex={kundliData.chandraLagna.signIndex}
          natalLagnaSignIndex={kundliData.lagna.signIndex}
          latitude={kundliData.profile.latitude}
          longitude={kundliData.profile.longitude}
        />
      )}

      {/* ================= TAB 13: AVAKAHADA CHAKRA & JANMA PANCHANGA ================= */}
      {selectedTab === "avakahada" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {/* Avakahada Chakra Card */}
          <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-700 pb-2.5">
              <BookOpen className="w-5 h-5 text-amber-400" />
              अवकहड़ा चक्र विवरण (Avakahada Chakra)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  वर्ण (Varna)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.varna.hi}
                </span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  वश्य (Vashya)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.vashya.hi}
                </span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  योनि (Yoni)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.yoni.hi}
                </span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  गण (Gana)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.gana.hi}
                </span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  नाड़ी (Nadi)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.nadi.hi}
                </span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  तत्त्व (Tatva)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.tatva.hi}
                </span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 col-span-2">
                <span className="text-zinc-400 font-bold block text-[11px]">
                  पाया (Paya)
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.paya.hi} पाया (
                  {kundliData.avakahada.paya.quality})
                </span>
              </div>
            </div>
          </div>

          {/* Lucky Astrological Identifiers Card */}
          <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-700 pb-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              भाग्यशाली रत्न, रंग व इष्टदेव (Lucky Factors)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-zinc-300 font-semibold">
                  शुभ रत्न (Lucky Gemstone):
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.luckyGemstone.hi}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-zinc-300 font-semibold">
                  शुभ रंग (Lucky Color):
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.luckyColor.hi}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-zinc-300 font-semibold">
                  शुभ अंक (Lucky Number):
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.luckyNumber}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-zinc-300 font-semibold">
                  इष्ट देव (Presiding Deity):
                </span>
                <span className="text-sm font-bold text-white">
                  {kundliData.avakahada.luckyDeity.hi}
                </span>
              </div>

              <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-zinc-300 font-semibold block mb-1.5">
                  अनुकूल राशियां (Friendly Signs):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {kundliData.avakahada.friendlyRasis.map((r, i) => (
                    <span
                      key={i}
                      className="bg-zinc-900 text-amber-400 px-2.5 py-0.5 rounded-lg border border-zinc-600 text-xs font-medium"
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
    </div>
  );
};
