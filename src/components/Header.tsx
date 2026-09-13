import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Settings,
  Printer,
  Sun,
  Moon,
  Globe,
  Wind,
  Clock,
  Navigation,
  Loader2,
} from 'lucide-react';
import { type Language, translations } from '../i18n';
import type { AppTheme } from '../types';

export type ActiveView = 'panchanga' | 'calendar' | 'planets' | 'timings' | 'swara' | 'horas';

interface HeaderProps {
  currentDate: string; // dd/mm/yyyy
  currentCity: string;
  isDeviceLocation?: boolean;
  isDetectingLocation?: boolean;
  activeView: ActiveView;
  onDateChange: (newDateStr: string) => void;
  onViewChange: (view: ActiveView) => void;
  onOpenLocation: () => void;
  onDetectDeviceLocation?: () => void;
  onOpenSettings: () => void;
  onPrint: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  currentCity,
  isDeviceLocation = false,
  isDetectingLocation = false,
  activeView,
  onDateChange,
  onViewChange,
  onOpenLocation,
  onDetectDeviceLocation,
  onOpenSettings,
  onPrint,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
}) => {
  const t = translations[lang];

  // Parse dd/mm/yyyy to standard date object
  const parseDateStr = (str: string): Date => {
    const parts = str.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    return new Date();
  };

  const formatDateToDDMMYYYY = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handlePrevDay = () => {
    const d = parseDateStr(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(formatDateToDDMMYYYY(d));
  };

  const handleNextDay = () => {
    const d = parseDateStr(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(formatDateToDDMMYYYY(d));
  };

  const handleToday = () => {
    onDateChange(formatDateToDDMMYYYY(new Date()));
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd for input[type=date]
  const dateParts = currentDate.split('/');
  const inputDateVal =
    dateParts.length === 3
      ? `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
      : '';

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-');
    if (y && m && d) {
      onDateChange(`${d}/${m}/${y}`);
    }
  };

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        theme === 'nightSky'
          ? 'border-indigo-950/70 bg-[#0b0f19]/95 shadow-md shadow-black/40'
          : 'border-amber-200/80 bg-white/95 shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo and Title - Hidden on Desktop (moved to Sidebar) */}
          <div className="flex lg:hidden items-center space-x-3 shrink-0">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-md ring-1 ${
                theme === 'nightSky'
                  ? 'bg-gradient-to-br from-indigo-700 to-indigo-950 text-amber-300 ring-indigo-500/30'
                  : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white ring-amber-900/20'
              }`}
            >
              <Sun className="h-5 w-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1
                  className={`text-lg sm:text-xl font-black tracking-tight font-serif-vedic ${
                    theme === 'nightSky' ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {t.appName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border font-devanagari tracking-wide uppercase ${
                    theme === 'nightSky'
                      ? 'bg-indigo-950/80 text-amber-300 border-indigo-700/60'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  Drik
                </span>
              </div>
              <p
                className={`text-[11px] font-sans mt-0.5 hidden sm:block ${
                  theme === 'nightSky' ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls Area - Takes full width on desktop */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 w-full lg:w-auto">
            
            {/* Date Navigation */}
            <div
              className={`flex items-center space-x-1.5 p-1 rounded-xl border shadow-2xs ${
                theme === 'nightSky'
                  ? 'bg-[#12182b] border-indigo-900/60'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <button
                onClick={handlePrevDay}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                  theme === 'nightSky'
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-stone-600 hover:bg-white hover:shadow-xs'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleToday}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors font-devanagari ${
                  theme === 'nightSky'
                    ? 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30'
                    : 'text-amber-900 bg-amber-100/50 hover:bg-amber-100'
                }`}
              >
                {t.today}
              </button>
              <button
                onClick={handleNextDay}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                  theme === 'nightSky'
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-stone-600 hover:bg-white hover:shadow-xs'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div
                className={`relative border-l pl-1.5 ml-1.5 ${
                  theme === 'nightSky' ? 'border-indigo-900/60' : 'border-stone-200'
                }`}
              >
                <input
                  type="date"
                  value={inputDateVal}
                  onChange={handleDateInputChange}
                  className={`h-7 rounded-lg bg-transparent px-1 text-[11px] font-semibold cursor-pointer focus:outline-none w-[110px] ${
                    theme === 'nightSky' ? 'text-slate-200 [color-scheme:dark]' : 'text-stone-700'
                  }`}
                />
              </div>
            </div>

            {/* Divider */}
            <div
              className={`hidden sm:block h-6 w-px ${
                theme === 'nightSky' ? 'bg-indigo-950/80' : 'bg-stone-200'
              }`}
            />

            {/* Language & Actions */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center rounded-lg p-0.5 border ${
                  theme === 'nightSky'
                    ? 'bg-[#12182b] border-indigo-900/60'
                    : 'bg-stone-100/90 border-stone-200'
                }`}
              >
                {(['en', 'hi', 'sa'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => onLangChange(l)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition-all uppercase tracking-wider ${
                      lang === l
                        ? theme === 'nightSky'
                          ? 'bg-indigo-900/80 text-amber-300 shadow-xs border border-indigo-500/40'
                          : 'bg-white text-amber-950 shadow-xs border border-amber-200/80'
                        : theme === 'nightSky'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'hi' ? 'HI' : 'SA'}
                  </button>
                ))}
              </div>

              {/* Location Selector & Quick GPS */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={onOpenLocation}
                  className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-colors max-w-[140px] sm:max-w-[170px] ${
                    isDeviceLocation
                      ? theme === 'nightSky'
                        ? 'border-emerald-600/60 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                        : 'border-emerald-300 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100'
                      : theme === 'nightSky'
                      ? 'border-indigo-900/60 bg-[#12182b] text-slate-200 hover:bg-slate-800'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                  title={isDeviceLocation ? `${currentCity} (Active Device GPS)` : 'Change Location'}
                >
                  {isDeviceLocation ? (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                  ) : (
                    <MapPin
                      className={`h-3 w-3 shrink-0 ${
                        theme === 'nightSky' ? 'text-amber-400' : 'text-amber-600'
                      }`}
                    />
                  )}
                  <span className="truncate">{currentCity}</span>
                </button>

                {onDetectDeviceLocation && (
                  <button
                    onClick={onDetectDeviceLocation}
                    disabled={isDetectingLocation}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-2xs transition-colors ${
                      isDeviceLocation
                        ? theme === 'nightSky'
                          ? 'border-emerald-600/60 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/80'
                          : 'border-emerald-300 bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/80'
                        : theme === 'nightSky'
                        ? 'border-indigo-900/60 bg-[#12182b] text-slate-300 hover:bg-slate-800'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                    title={t.useDeviceLocation}
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Theme Toggle Button (Parchment <-> Night Sky) */}
              <button
                type="button"
                id="theme-toggle-btn"
                onClick={onToggleTheme}
                className={`flex h-7 items-center gap-1.5 rounded-lg border px-2 shadow-2xs transition-all ${
                  theme === 'nightSky'
                    ? 'border-indigo-800 bg-indigo-950/80 text-amber-300 hover:bg-indigo-900/90 hover:text-amber-200 ring-1 ring-indigo-500/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-amber-800'
                }`}
                title={theme === 'nightSky' ? t.switchToParchment : t.switchToNightSky}
                aria-label={theme === 'nightSky' ? t.switchToParchment : t.switchToNightSky}
              >
                {theme === 'nightSky' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider font-devanagari">
                      {t.nightSky}
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-indigo-700 fill-indigo-700/10 shrink-0" />
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider font-devanagari">
                      {t.parchment}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenSettings}
                className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-2xs transition-colors ${
                  theme === 'nightSky'
                    ? 'border-indigo-900/60 bg-[#12182b] text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
                title={t.settings}
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
