import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SpiritualTabs } from './components/SpiritualTabs';
import { VedicInvocationBanner } from './components/VedicInvocationBanner';
import { CurrentMuhurtaWidget } from './components/CurrentMuhurtaWidget';
import { FestivalCard } from './components/FestivalCard';
import { MoonPhaseVisualizer } from './components/MoonPhaseVisualizer';
import { MuhurtaTimelineBar } from './components/MuhurtaTimelineBar';
import { PanchangaSummaryCard } from './components/PanchangaSummaryCard';
import { FiveAngasCard } from './components/FiveAngasCard';
import { AuspiciousTimingsCard } from './components/AuspiciousTimingsCard';
import { GauriChoghadiyaCard } from './components/GauriChoghadiyaCard';
import { SwaraYogaCard } from './components/SwaraYogaCard';
import { ActiveCosmicForcesWidget } from './components/ActiveCosmicForcesWidget';
import { PlanetaryPositionsCard } from './components/PlanetaryPositionsCard';
import { PlanetTransitionsCard } from './components/PlanetTransitionsCard';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { LocationModal } from './components/LocationModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintablePanchanga } from './components/PrintablePanchanga';
import { VedicHorasView } from './components/VedicHorasView';
import type { PanchangaResponse, CityLocation, MonthSystem, CoordinateSelection, AppTheme } from './types';
import { AlertCircle, RefreshCw, Sun, Moon, Clock, Wind, Calendar, LayoutGrid, BookmarkCheck, Check, Navigation } from 'lucide-react';
import { type Language, translations } from './i18n';
import type { ActiveView } from './components/Header';
import { motion, AnimatePresence } from 'motion/react';
import {
  loadUserSettings,
  saveUserSettings,
  clearUserSettings,
  DEFAULT_USER_SETTINGS,
} from './settingsStorage';

// Sidebar Navigation Item Component
const NavItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick,
  theme,
}: { 
  icon: any; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  theme: AppTheme;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-devanagari transition-all group relative overflow-hidden ${
      isActive 
        ? theme === 'nightSky'
          ? 'text-amber-300 font-bold bg-indigo-950/70 border border-indigo-500/40 shadow-xs'
          : 'text-amber-950 font-bold bg-amber-100/50 border border-amber-200/60 shadow-xs' 
        : theme === 'nightSky'
          ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
    }`}
  >
    {isActive && (
      <motion.div
        layoutId="sidebarActiveTab"
        className={`absolute inset-0 rounded-xl -z-10 shadow-xs border ${
          theme === 'nightSky'
            ? 'bg-indigo-900/40 border-indigo-500/40'
            : 'bg-white/60 border-amber-200/80'
        }`}
        initial={false}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
    <Icon className={`w-5 h-5 shrink-0 transition-transform ${
      isActive 
        ? theme === 'nightSky' ? 'text-amber-300 scale-110' : 'text-amber-700 scale-110' 
        : theme === 'nightSky' ? 'text-slate-400 group-hover:text-slate-200' : 'text-stone-400 group-hover:text-stone-600'
    }`} />
    <span className="text-sm tracking-wide z-10">{label}</span>
  </button>
);

export default function App() {
  // Current date formatted as DD/MM/YYYY
  const getTodayFormatted = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // Load saved device settings from localStorage
  const savedSettings = loadUserSettings();

  const [lang, setLang] = useState<Language>(savedSettings.lang);
  const [currentDate, setCurrentDate] = useState<string>(getTodayFormatted());
  const [currentCity, setCurrentCity] = useState<string>(savedSettings.currentCity);
  const [customCoords, setCustomCoords] = useState<{
    lat: number;
    lon: number;
    tz: string;
    name: string;
    isDeviceLocation?: boolean;
    accuracyMeters?: number;
  } | null>(savedSettings.customCoords);

  const [monthSystem, setMonthSystem] = useState<MonthSystem>(savedSettings.monthSystem);
  const [ayanamsa, setAyanamsa] = useState<CoordinateSelection>(savedSettings.ayanamsa);
  const [theme, setTheme] = useState<AppTheme>(savedSettings.theme || 'parchment');
  const [activeView, setActiveView] = useState<ActiveView>('panchanga');

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [panchangaData, setPanchangaData] = useState<PanchangaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  // Sync theme with HTML root and body class
  useEffect(() => {
    if (theme === 'nightSky') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('theme-night-sky');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('theme-night-sky');
    }
  }, [theme]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Save current preferences to device localStorage
  const persistSettings = useCallback(
    (
      newLang: Language = lang,
      newAyanamsa: CoordinateSelection = ayanamsa,
      newMonthSystem: MonthSystem = monthSystem,
      newCity: string = currentCity,
      newCoords: typeof customCoords = customCoords,
      newTheme: AppTheme = theme
    ) => {
      saveUserSettings({
        lang: newLang,
        ayanamsa: newAyanamsa,
        monthSystem: newMonthSystem,
        currentCity: newCity,
        customCoords: newCoords,
        theme: newTheme,
      });
    },
    [lang, ayanamsa, monthSystem, currentCity, customCoords, theme]
  );

  const handleToggleTheme = useCallback(() => {
    const nextTheme: AppTheme = theme === 'nightSky' ? 'parchment' : 'nightSky';
    setTheme(nextTheme);
    persistSettings(lang, ayanamsa, monthSystem, currentCity, customCoords, nextTheme);
    showToast(nextTheme === 'nightSky' ? t.switchToNightSky : t.switchToParchment);
  }, [theme, lang, ayanamsa, monthSystem, currentCity, customCoords, persistSettings, showToast, t.switchToNightSky, t.switchToParchment]);

  // Take device location (GPS)
  const handleDetectDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported on this device/browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

        let nearestCityName: string | undefined;
        try {
          const res = await fetch(`/api/nearest-city?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.city?.name) {
              nearestCityName = data.city.name.split(',')[0].trim();
            }
          }
        } catch {
          // ignore lookup failure
        }

        const name = nearestCityName
          ? `${nearestCityName} (GPS)`
          : `GPS (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;

        const newCoords = {
          lat,
          lon,
          tz,
          name,
          isDeviceLocation: true,
          accuracyMeters: accuracy,
        };

        setCustomCoords(newCoords);
        setCurrentCity(name);
        setIsDetectingGps(false);

        // Automatically persist device location setting
        persistSettings(lang, ayanamsa, monthSystem, name, newCoords);
        showToast(`${t.locationDetected}: ${name}`);
      },
      (err) => {
        setIsDetectingGps(false);
        let msg = 'Could not access device GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow GPS access in your browser.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        showToast(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, [lang, ayanamsa, monthSystem, persistSettings, showToast, t.locationDetected]);

  // Fetch Panchanga data whenever date, city/coords, or calculation settings change
  const fetchPanchanga = useCallback(() => {
    setIsLoading(true);
    setError(null);

    let url = `/api/panchanga?date=${encodeURIComponent(currentDate)}&month_system=${monthSystem}&ayanamsa=${ayanamsa}`;

    if (customCoords) {
      url += `&lat=${customCoords.lat}&lon=${customCoords.lon}&tz=${encodeURIComponent(
        customCoords.tz
      )}&city=${encodeURIComponent(customCoords.name)}`;
    } else {
      url += `&city=${encodeURIComponent(currentCity)}`;
    }

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Calculation error (Status ${res.status})`);
        }
        return res.json();
      })
      .then((data: PanchangaResponse) => {
        setPanchangaData(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error('Panchanga fetch error:', err);
        setError(err.message || 'Failed to calculate Panchanga for this date and location.');
        setIsLoading(false);
      });
  }, [currentDate, currentCity, customCoords, monthSystem, ayanamsa]);

  useEffect(() => {
    fetchPanchanga();
  }, [fetchPanchanga]);

  const handleSelectCity = (city: CityLocation, saveDefault: boolean = true) => {
    setCustomCoords(null);
    setCurrentCity(city.name);
    if (saveDefault) {
      persistSettings(lang, ayanamsa, monthSystem, city.name, null);
      showToast(t.settingsSavedToast);
    }
  };

  const handleSelectCustom = (
    lat: number,
    lon: number,
    tz: string,
    name: string,
    isDeviceLocation: boolean = false,
    accuracyMeters?: number,
    saveDefault: boolean = true
  ) => {
    const newCoords = {
      lat,
      lon,
      tz,
      name,
      isDeviceLocation,
      accuracyMeters,
    };
    setCustomCoords(newCoords);
    setCurrentCity(name);
    if (saveDefault) {
      persistSettings(lang, ayanamsa, monthSystem, name, newCoords);
      showToast(t.settingsSavedToast);
    }
  };

  const handleUpdateSettings = (
    newAyanamsa: CoordinateSelection,
    newMonthSystem: MonthSystem,
    saveToDevice: boolean = true,
    newTheme?: AppTheme
  ) => {
    setAyanamsa(newAyanamsa);
    setMonthSystem(newMonthSystem);
    const activeTheme = newTheme || theme;
    if (newTheme && newTheme !== theme) {
      setTheme(newTheme);
    }
    if (saveToDevice) {
      persistSettings(lang, newAyanamsa, newMonthSystem, currentCity, customCoords, activeTheme);
      showToast(t.settingsSavedToast);
    }
  };

  const handleResetDefaults = () => {
    clearUserSettings();
    setLang(DEFAULT_USER_SETTINGS.lang);
    setAyanamsa(DEFAULT_USER_SETTINGS.ayanamsa);
    setMonthSystem(DEFAULT_USER_SETTINGS.monthSystem);
    setCurrentCity(DEFAULT_USER_SETTINGS.currentCity);
    setCustomCoords(DEFAULT_USER_SETTINGS.customCoords);
    setTheme(DEFAULT_USER_SETTINGS.theme || 'parchment');
    showToast('Settings reset to default');
  };

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    persistSettings(newLang, ayanamsa, monthSystem, currentCity, customCoords, theme);
  };

  return (
    <div
      id="app-root-container"
      data-theme={theme}
      className={`flex h-screen overflow-hidden font-sans antialiased transition-colors duration-300 ${
        theme === 'nightSky'
          ? 'theme-night-sky bg-[#0b0f19] text-slate-100 selection:bg-indigo-900 selection:text-amber-200'
          : 'theme-parchment bg-[#f6f4f0] text-stone-900 selection:bg-indigo-200 selection:text-indigo-900'
      }`}
    >
      {/* Premium Cosmic Overlay Texture */}
      <div className="pointer-events-none fixed inset-0 mix-blend-overlay opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-0"></div>
      
      {/* Sidebar (Desktop Only) */}
      <aside
        className={`hidden lg:flex flex-col w-72 backdrop-blur-xl border-r z-50 transition-colors ${
          theme === 'nightSky'
            ? 'bg-[#0e1424]/90 border-indigo-950/60 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.6)]'
            : 'bg-white/80 border-amber-200/50 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.05)]'
        }`}
      >
        <div className={`p-6 border-b ${theme === 'nightSky' ? 'border-indigo-950/60' : 'border-amber-200/50'}`}>
          <div className="flex items-center space-x-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-md ring-1 ${
                theme === 'nightSky'
                  ? 'bg-gradient-to-br from-indigo-700 to-indigo-950 text-amber-300 ring-indigo-500/30'
                  : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white ring-amber-900/20'
              }`}
            >
              <Sun className="h-6 w-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1
                  className={`text-xl font-black tracking-tight font-serif-vedic ${
                    theme === 'nightSky' ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {t.appName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border font-devanagari uppercase ${
                    theme === 'nightSky'
                      ? 'bg-indigo-950/80 text-amber-300 border-indigo-700/60'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  Drik
                </span>
              </div>
              <p className={`text-[11px] font-sans mt-0.5 ${theme === 'nightSky' ? 'text-slate-400' : 'text-stone-500'}`}>
                {t.appSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 hide-scrollbar">
          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 ml-2 font-sans">
            Spiritual Navigation
          </div>
          <NavItem icon={LayoutGrid} label={t.dailyPanchanga} isActive={activeView === 'panchanga'} onClick={() => setActiveView('panchanga')} theme={theme} />
          <NavItem icon={Clock} label={t.muhurtasAndTimings} isActive={activeView === 'timings'} onClick={() => setActiveView('timings')} theme={theme} />
          <NavItem icon={Moon} label={t.grahaSthiti} isActive={activeView === 'planets'} onClick={() => setActiveView('planets')} theme={theme} />
          <NavItem icon={Wind} label={t.views.swara} isActive={activeView === 'swara'} onClick={() => setActiveView('swara')} theme={theme} />
          <NavItem icon={Clock} label={lang === 'hi' ? 'वैदिक होरा' : lang === 'sa' ? 'वैदिकहोरा' : 'Vedic Horas'} isActive={activeView === 'horas'} onClick={() => setActiveView('horas')} theme={theme} />
          <NavItem icon={Calendar} label={t.monthCalendar} isActive={activeView === 'calendar'} onClick={() => setActiveView('calendar')} theme={theme} />
        </div>

        <div className={`p-5 border-t ${theme === 'nightSky' ? 'border-indigo-950/60' : 'border-amber-200/50'}`}>
          <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">
            VSOP87 / ELP2000 Ephemeris
          </div>
          <div className="text-[10px] text-stone-400 font-medium">
            NASA JPL Algorithms • Lahiri Ayanāṁśa
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Navigation Header with Language Switcher */}
        <Header
          currentDate={currentDate}
          currentCity={currentCity}
          isDeviceLocation={Boolean(customCoords?.isDeviceLocation)}
          isDetectingLocation={isDetectingGps}
          activeView={activeView}
          onDateChange={setCurrentDate}
          onViewChange={setActiveView}
          onOpenLocation={() => setIsLocationOpen(true)}
          onDetectDeviceLocation={handleDetectDeviceLocation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onPrint={() => setIsPrintOpen(true)}
          lang={lang}
          onLangChange={handleLangChange}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Mobile Tabs Bar - Hidden on Desktop */}
        <div className="lg:hidden sticky top-[64px] sm:top-[68px] z-30 pt-3 pb-3 glass-header border-b border-amber-200/40 w-full shadow-xs">
          <SpiritualTabs activeView={activeView} onViewChange={setActiveView} lang={lang} theme={theme} />
        </div>

        {/* Scrollable Content */}
        <main id="main-content" className="flex-1 w-full overflow-y-auto relative z-10 hide-scrollbar">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            
            {/* Spiritual Context Banner */}
            {activeView !== 'calendar' && !error && !isLoading && panchangaData && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                <VedicInvocationBanner lang={lang} theme={theme} />
              </div>
            )}

          {/* Error State */}
          {error && (
            <div
              id="error-banner"
              className="mb-8 flex items-start space-x-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm max-w-5xl mx-auto"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold">Calculation Notice</h4>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={fetchPanchanga}
                className="inline-flex items-center rounded-xl border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-850 hover:bg-rose-100 transition-colors"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !panchangaData ? (
            <div id="loading-state" className="flex flex-col items-center justify-center py-32 text-center">
              <div className="flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-amber-200 border-t-amber-700 shadow-sm"></div>
              <div className="mt-5 text-lg font-bold font-serif-vedic text-stone-900">
                {lang === 'sa'
                  ? 'दृग्गणित-ग्रहस्थितीनां साधनं क्रियते...'
                  : lang === 'hi'
                  ? 'दृग्गणित अनुसार ग्रह स्थितियों एवं पंचांग की गणना जारी है...'
                  : 'Calculating Observational Planetary Positions & Panchanga...'}
              </div>
              <p className="text-xs text-stone-500 mt-2 max-w-sm font-sans mx-auto">
                Computing High-Precision Drik-Ganita Ephemeris for {currentCity}
              </p>
            </div>
          ) : panchangaData ? (
            <div className="max-w-7xl mx-auto">
              
              {/* View: Daily Panchanga (Overview) */}
              {activeView === 'panchanga' && (
                <div id="view-daily-panchanga" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent to-amber-200/80 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                       <Sun className="w-4 h-4 text-amber-600" />
                       {lang === 'hi' ? 'दैनिक पंचांग सारांश' : lang === 'sa' ? 'दैनिक-पञ्चाङ्ग-सारांशः' : 'Daily Panchanga Overview'}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    <div className="lg:col-span-8 space-y-10">
                      <section>
                        <PanchangaSummaryCard data={panchangaData} lang={lang} theme={theme} />
                      </section>
                      <section>
                        <div className="flex items-center gap-2.5 mb-4 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                            {lang === 'hi' ? 'पंचांग के पांच अंग' : lang === 'sa' ? 'पञ्चाङ्गस्य पञ्च अङ्गानि' : 'The Five Angas'}
                          </h3>
                        </div>
                        <FiveAngasCard data={panchangaData} lang={lang} theme={theme} />
                      </section>
                    </div>
                    
                    <div className="lg:col-span-4 space-y-10">
                      <section>
                        <ActiveCosmicForcesWidget data={panchangaData} lang={lang} theme={theme} />
                      </section>
                      <section>
                        <div className="flex items-center gap-2.5 mb-4 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                            {lang === 'hi' ? 'चंद्र कला एवं स्थिति' : lang === 'sa' ? 'चन्द्र-कला एवं स्थितिः' : 'Lunar Phase & State'}
                          </h3>
                        </div>
                        <MoonPhaseVisualizer data={panchangaData} lang={lang} theme={theme} />
                      </section>

                      <section>
                        <div className="flex items-center gap-2.5 mb-4 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                            {lang === 'hi' ? 'आज के व्रत एवं त्यौहार' : lang === 'sa' ? 'अद्यतनानि व्रतानि उत्सवाः च' : 'Festivals & Vratas'}
                          </h3>
                        </div>
                        <FestivalCard data={panchangaData} lang={lang} theme={theme} />
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* View: Muhurtas & Timings */}
              {activeView === 'timings' && (
                <div id="view-timings-dedicated" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent to-amber-200/80 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                       <Clock className="w-4 h-4 text-amber-600" />
                       {lang === 'hi' ? 'मुहूर्त एवं समय' : lang === 'sa' ? 'मुहूर्ताः समयाः च' : 'Muhurtas & Timings'}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                  </div>

                  <div className="flex flex-col space-y-10">
                    <section>
                      <MuhurtaTimelineBar data={panchangaData} lang={lang} theme={theme} />
                    </section>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                      <div className="lg:col-span-4">
                        <section className="sticky top-6">
                          <div className="flex items-center gap-2.5 mb-4 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                              {lang === 'hi' ? 'वर्तमान मुहूर्त' : lang === 'sa' ? 'वर्तमान-मुहूर्तः' : 'Active Muhurta'}
                            </h3>
                          </div>
                          <CurrentMuhurtaWidget data={panchangaData} lang={lang} theme={theme} />
                        </section>
                      </div>
                      <div className="lg:col-span-8 space-y-10">
                        <section>
                          <div className="flex items-center gap-2.5 mb-4 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                              {lang === 'hi' ? 'शुभ एवं अशुभ समय' : lang === 'sa' ? 'शुभ-अशुभ-समयाः' : 'Auspicious & Inauspicious'}
                            </h3>
                          </div>
                          <AuspiciousTimingsCard data={panchangaData} lang={lang} theme={theme} />
                        </section>
                        <section>
                          <div className="flex items-center gap-2.5 mb-4 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"></span>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                              {lang === 'hi' ? 'गौरी एवं चौघड़िया' : lang === 'sa' ? 'गौरी-चौघड़िया' : 'Gauri & Choghadiya'}
                            </h3>
                          </div>
                          <GauriChoghadiyaCard data={panchangaData} lang={lang} theme={theme} />
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View: Planetary Ephemeris Dedicated */}
              {activeView === 'planets' && (
                <div id="view-planets-dedicated" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent to-amber-200/80 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                       <Moon className="w-4 h-4 text-amber-600" />
                       {lang === 'hi' ? 'ग्रह स्थिति (गोचर)' : lang === 'sa' ? 'ग्रहस्थितिः' : 'Planetary Ephemeris'}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                  </div>

                  <div className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                      <div className="lg:col-span-4 space-y-10">
                        <section>
                          <div className="flex items-center gap-2.5 mb-4 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                              {lang === 'hi' ? 'चंद्र कला' : lang === 'sa' ? 'चन्द्र-कला' : 'Lunar Phase'}
                            </h3>
                          </div>
                          <MoonPhaseVisualizer data={panchangaData} lang={lang} theme={theme} />
                        </section>
                      </div>
                      <div className="lg:col-span-8">
                        <section>
                          <div className="flex items-center gap-2.5 mb-4 px-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                              {lang === 'hi' ? 'नवग्रह स्पष्ट' : lang === 'sa' ? 'नवग्रह-स्पष्टम्' : 'Navagraha Positions'}
                            </h3>
                          </div>
                          <PlanetaryPositionsCard data={panchangaData} lang={lang} theme={theme} />
                        </section>
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center gap-2.5 mb-4 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                          {lang === 'hi' ? 'ग्रह गोचर एवं राशि संक्रमण' : lang === 'sa' ? 'ग्रहगोचरः राशिसंक्रमणं च' : 'Planet Transitions & Ingress (Graha Gochara)'}
                        </h3>
                      </div>
                      <PlanetTransitionsCard data={panchangaData} lang={lang} theme={theme} />
                    </section>
                  </div>
                </div>
              )}

              {/* View: Dedicated Swara Yoga (Shiva Swarodaya) */}
              {activeView === 'swara' && (
                <div id="view-swara-dedicated" className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent to-amber-200/80 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                       <Wind className="w-4 h-4 text-amber-600" />
                       {lang === 'hi' ? 'शिव स्वरोदय' : lang === 'sa' ? 'शिव-स्वरोदयः' : 'Shiva Swarodaya'}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                  </div>

                  <section className="space-y-6">
                    <SwaraYogaCard data={panchangaData} lang={lang} theme={theme} />
                  </section>
                </div>
              )}

              {/* View: Vedic Horas */}
              {activeView === 'horas' && (
                <div id="view-vedic-horas" className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent to-amber-200/80 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                       <Clock className="w-4 h-4 text-amber-600" />
                       {lang === 'hi' ? 'वैदिक होरा चक्र' : lang === 'sa' ? 'वैदिक-होरा-चक्रम्' : 'Vedic Hora Chart'}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                  </div>

                  <section className="space-y-6">
                    <VedicHorasView panchangaData={panchangaData} />
                  </section>
                </div>
              )}

              {/* View: Monthly Calendar */}
              {activeView === 'calendar' && (
                <div id="view-month-calendar" className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="h-px bg-gradient-to-r from-transparent to-amber-200/80 flex-1"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                       <Calendar className="w-4 h-4 text-amber-600" />
                       {lang === 'hi' ? 'मासिक पंचांग' : lang === 'sa' ? 'मासिक-पञ्चाङ्गम्' : 'Monthly Calendar'}
                    </h2>
                    <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                  </div>

                  <section className="space-y-6">
                    <MonthlyCalendarView
                      currentCity={currentCity}
                      monthSystem={monthSystem}
                      ayanamsa={ayanamsa}
                      currentDateStr={currentDate}
                      onSelectDate={(newDate) => {
                        setCurrentDate(newDate);
                        setActiveView('panchanga');
                      }}
                      lang={lang}
                    />
                  </section>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Footer inside scroll area */}
          <footer
            id="app-footer"
            className="mt-8 border-t border-stone-200/50 pt-8 pb-4 text-xs text-stone-500 relative z-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center space-x-2">
                <span className="font-serif-vedic font-black text-indigo-950 text-sm tracking-wide">
                  {t.appName}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-devanagari font-semibold">
                  {lang === 'sa'
                    ? 'दृग्गणित-पद्धत्या विशुद्ध-खगोलीयपञ्चाङ्गम्'
                    : lang === 'hi'
                    ? 'दृग्गणित पद्धति पर आधारित शुद्ध भारतीय पंचांग'
                    : 'Drig-ganita Observational Almanac System'}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </main>
      </div>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentCity={currentCity}
        customCoords={customCoords}
        onSelectCity={handleSelectCity}
        onSelectCustom={handleSelectCustom}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ayanamsa={ayanamsa}
        monthSystem={monthSystem}
        currentCity={currentCity}
        customCoords={customCoords}
        theme={theme}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          persistSettings(lang, ayanamsa, monthSystem, currentCity, customCoords, newTheme);
        }}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetDefaults}
        lang={lang}
      />

      {isPrintOpen && panchangaData && (
        <PrintablePanchanga
          data={panchangaData}
          onClose={() => setIsPrintOpen(false)}
          lang={lang}
        />
      )}

      {/* Floating Toast Notification for Saved Settings & Device Location */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 rounded-2xl border border-amber-300/80 bg-stone-900/90 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
