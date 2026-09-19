import React, { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Sun,
  Moon,
  Navigation,
  Loader2,
  Printer,
  Calendar as CalendarIcon,
} from "lucide-react";
import { type Language, translations } from "../i18n";
import type { AppTheme, PanchangaResponse } from "../types";
import { PWAInstallButton } from "./PWAInstallButton";
import { getLocalizedMasa, getLocalizedPaksha, getLocalizedVaara } from "../i18n";

export type ActiveView =
  | "panchanga"
  | "today"
  | "timings"
  | "planets"
  | "swara"
  | "navtara"
  | "horas"
  | "tattva"
  | "calendar"
  | "lagna"
  | "festivals"
  | "navagraha";

interface HeaderProps {
  currentDate: string; // dd/mm/yyyy
  currentCity: string;
  isDeviceLocation?: boolean;
  isDetectingLocation?: boolean;
  activeView: ActiveView;
  panchangaData?: PanchangaResponse | null;
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
  panchangaData,
  onDateChange,
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Parse dd/mm/yyyy to standard date object
  const parseDateStr = (str: string): Date => {
    const parts = str.split("/");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    return new Date();
  };

  const formatDateToDDMMYYYY = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const currentDateObj = parseDateStr(currentDate);

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

  const isCurrentDayToday = () => {
    const todayStr = formatDateToDDMMYYYY(new Date());
    return currentDate === todayStr;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd for input[type=date]
  const dateParts = currentDate.split("/");
  const inputDateVal =
    dateParts.length === 3
      ? `${dateParts[2]}-${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}`
      : "";

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split("-");
    if (y && m && d) {
      onDateChange(`${d}/${m}/${y}`);
    }
  };

  // Formatted Gregorian Date (e.g., Monday, 14 September 2026)
  const gregorianDisplay = currentDateObj.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Formatted Vedic Date
  const getVedicDisplay = () => {
    if (panchangaData) {
      let rawMasa = panchangaData.masa || "";
      if (rawMasa.includes("Adhika")) {
        const base = rawMasa.replace("Adhika ", "").trim();
        const translatedBase = getLocalizedMasa(base, lang);
        rawMasa = lang === "hi" ? `अधिक ${translatedBase}` : `Adhika ${translatedBase}`;
      } else {
        rawMasa = getLocalizedMasa(rawMasa, lang);
      }

      const rawPaksha = panchangaData.paksha ? getLocalizedPaksha(panchangaData.paksha, lang) : "";
      const rawVaara = panchangaData.vaara ? getLocalizedVaara(panchangaData.vaara, lang) : "";

      if (lang === "hi") {
        return `${rawMasa} ${rawPaksha} पक्ष · ${rawVaara}`;
      } else {
        return `${rawMasa} · ${rawPaksha} Paksha · ${rawVaara}`;
      }
    }
    const vaarasEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const vaarasHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
    const dayIdx = currentDateObj.getDay();
    return lang === "hi"
      ? `वैदिक पंचांग · ${vaarasHi[dayIdx]}`
      : `Drik Almanac · ${vaarasEn[dayIdx]}`;
  };

  const isNight = theme === "nightSky";

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-50 transition-all duration-200 border-b shadow-md ${
        isNight
          ? "bg-[#0B0F1E] border-indigo-900/50 shadow-black/50 text-white"
          : "bg-[#1A1F5E] border-[#15194D] shadow-indigo-950/20 text-white"
      }`}
    >
      {/* ─── HEADER TOP ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-[3.5rem] sm:min-h-[4rem] py-2 gap-2">
          {/* App Name & Sacred Vedic Branding */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0">
            <div
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shadow-inner border ${
                isNight
                  ? "bg-indigo-950/80 border-indigo-700/60 text-[#F0C96A]"
                  : "bg-white/10 border-white/15 text-[#F0C96A]"
              }`}
            >
              <span className="font-serif-vedic font-bold text-xl sm:text-2xl leading-none">ॐ</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif-vedic font-bold text-base sm:text-lg text-[#F0C96A] tracking-tight leading-tight">
                  Mahavtaar Panchanga
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/15 text-amber-200 border border-white/20">
                  Drik
                </span>
              </div>
              <span className="text-[11px] font-devanagari text-white/60 tracking-wider leading-none mt-0.5">
                महावतार पञ्चाङ्ग
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
            {/* Location Pill */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={onOpenLocation}
                className="flex items-center space-x-1.5 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors shadow-2xs max-w-[90px] sm:max-w-[170px]"
                title={isDeviceLocation ? `${currentCity} (Active GPS)` : "Change Location"}
              >
                {isDeviceLocation ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                ) : (
                  <span className="text-xs shrink-0">📍</span>
                )}
                <span className="truncate text-[10px] sm:text-xs">{currentCity}</span>
              </button>

              {onDetectDeviceLocation && (
                <button
                  type="button"
                  onClick={onDetectDeviceLocation}
                  disabled={isDetectingLocation}
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-colors shrink-0"
                  title={t.useDeviceLocation}
                  aria-label={t.useDeviceLocation}
                >
                  {isDetectingLocation ? (
                    <Loader2 className="h-3.5 w-3.5 text-[#F0C96A] animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg bg-white/10 p-0.5 border border-white/15 shrink-0">
              {(["en", "hi"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLangChange(l)}
                  className={`rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase transition-all tracking-wider ${
                    lang === l
                      ? "bg-[#F0C96A] text-[#1A1F5E] shadow-xs font-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {l === "en" ? "EN" : "HI"}
                </button>
              ))}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="flex h-7 sm:h-8 px-2 items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-colors shrink-0"
              title={isNight ? t.switchToParchment : t.switchToNightSky}
              aria-label={isNight ? t.switchToParchment : t.switchToNightSky}
            >
              {isNight ? (
                <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#F0C96A] fill-[#F0C96A]/20" />
              ) : (
                <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-200 fill-amber-200/20" />
              )}
              <span className="text-[10px] sm:text-xs font-semibold">
                {lang === "hi" ? "थीम" : "Theme"}
              </span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={onPrint}
              className="hidden md:flex h-8 px-2 items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-colors shrink-0"
              title={lang === "hi" ? "प्रिंट / PDF" : "Print / PDF Almanac"}
              aria-label="Print"
            >
              <Printer className="h-4 w-4" />
              <span className="text-xs font-semibold">{lang === "hi" ? "प्रिंट" : "Print"}</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex h-7 sm:h-8 px-2 items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-colors shrink-0"
              title={t.settings}
              aria-label={t.settings}
            >
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-semibold">
                {lang === "hi" ? "सेटिंग्स" : "Settings"}
              </span>
            </button>

            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* ─── DATE STRIP ─────────────────────────────────────────── */}
      <div
        className={`border-t px-3 sm:px-6 lg:px-8 py-2 transition-colors ${
          isNight ? "border-indigo-900/40 bg-black/20" : "border-white/10 bg-black/15"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Previous Day */}
          <button
            type="button"
            onClick={handlePrevDay}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/85 text-base sm:text-lg transition-colors leading-none"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Date Center Info */}
          <div className="flex flex-col items-center justify-center text-center px-2 cursor-pointer group">
            <div className="flex items-center gap-2">
              <span
                onClick={() =>
                  dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()
                }
                className="text-xs sm:text-sm font-semibold text-white/95 tracking-wide group-hover:text-[#F0C96A] transition-colors flex items-center gap-1.5"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#F0C96A]/80 inline-block" />
                {gregorianDisplay}
              </span>

              {!isCurrentDayToday() && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToday();
                  }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4680A] text-white hover:bg-[#E5761A] transition-colors uppercase tracking-wider"
                >
                  {t.today}
                </button>
              )}
            </div>

            <span className="text-[11px] sm:text-xs font-devanagari text-[#F0A44A] mt-0.5 tracking-wide">
              {getVedicDisplay()}
            </span>

            {/* Hidden native input for custom date selection */}
            <input
              ref={dateInputRef}
              type="date"
              value={inputDateVal}
              onChange={handleDateInputChange}
              className="sr-only"
              tabIndex={-1}
            />
          </div>

          {/* Next Day */}
          <button
            type="button"
            onClick={handleNextDay}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/85 text-base sm:text-lg transition-colors leading-none"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
