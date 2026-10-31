import React, { useRef, useState } from "react";
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
  Home,
  FileSpreadsheet,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Search,
  Share2,
  MapPin,
} from "lucide-react";
import { type Language, translations } from "../i18n";
import type { AppTheme, PanchangaResponse } from "../types";
import { PWAInstallButton } from "./PWAInstallButton";
import { getLocalizedMasa, getLocalizedPaksha, getLocalizedVaara } from "../i18n";
import type { AppUser } from "../services/userAuthService";
import { KeyHint } from "./ds";

export type ActiveView =
  | "home"
  | "panchanga"
  | "today"
  | "timings"
  | "planets"
  | "kundli"
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
  currentUser?: AppUser | null;
  onLogout?: () => void;
  onOpenAdminUsers?: () => void;
  onDateChange: (newDateStr: string) => void;
  onViewChange: (view: ActiveView) => void;
  onOpenLocation: () => void;
  onDetectDeviceLocation?: () => void;
  onOpenSettings: () => void;
  onOpenCalendarSync?: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenCommandPalette?: () => void;
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
  activeView = "today",
  panchangaData,
  currentUser,
  onLogout,
  onOpenAdminUsers,
  onDateChange,
  onViewChange,
  onOpenLocation,
  onDetectDeviceLocation,
  onOpenSettings,
  onOpenCalendarSync,
  onOpenGoogleSheets,
  onOpenCommandPalette,
  onPrint,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
}) => {
  const t = translations[lang];
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const openNativeDatePicker = () => {
    try {
      const inputEl = dateInputRef.current as HTMLInputElement & { showPicker?: () => void };
      if (inputEl) {
        if (typeof inputEl.showPicker === "function") {
          try {
            inputEl.showPicker();
            return;
          } catch {
            // Ignore cross-origin iframe restrictions
          }
        }
        inputEl.click();
      }
    } catch {
      dateInputRef.current?.focus();
    }
  };

  // Compact mobile date string (e.g., "Tue, 31 Oct") vs full desktop string
  const mobileDateDisplay = currentDateObj.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const desktopDateDisplay = currentDateObj.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const getVedicSubtitle = () => {
    if (!panchangaData) return "";
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
    return `${rawMasa} · ${rawPaksha} · ${rawVaara}`;
  };

  const isNight = theme === "nightSky";
  const shortCityName = currentCity.split(",")[0].trim();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-surface-1/95 backdrop-blur-md border-b border-border-subtle text-text-1 transition-colors"
    >
      {/* Hidden native date input shared by mobile and desktop */}
      <input
        ref={dateInputRef}
        type="date"
        value={inputDateVal}
        onChange={handleDateInputChange}
        aria-label={lang === "hi" ? "तिथि चुनें" : "Choose Date"}
        className="sr-only"
      />

      {/* ─── MOBILE TOP BAR (56px, 3 clean elements: Location | Date | Lang) ─── */}
      <div className="flex lg:hidden items-center justify-between h-14 px-3 gap-2">
        {/* Left: Location Pill */}
        <div className="flex items-center gap-1 min-w-0 shrink">
          <button
            type="button"
            onClick={onOpenLocation}
            aria-label={`${lang === "hi" ? "स्थान बदलें" : "Change location"}: ${currentCity}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-border-subtle px-2.5 py-1.5 text-xs font-semibold text-text-1 min-h-[38px] max-w-[125px] cursor-pointer"
          >
            {isDeviceLocation ? (
              <span className="h-2 w-2 rounded-full bg-auspicious shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-saffron shrink-0" />
            )}
            <span className="truncate">{shortCityName}</span>
          </button>

          {onDetectDeviceLocation && (
            <button
              type="button"
              onClick={onDetectDeviceLocation}
              disabled={isDetectingLocation}
              aria-label={t.useDeviceLocation}
              title={t.useDeviceLocation}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 border border-border-subtle text-text-2 hover:text-text-1 shrink-0 cursor-pointer"
            >
              {isDetectingLocation ? (
                <Loader2 className="h-3.5 w-3.5 text-saffron animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Center: Date Stepper + Tap to pick date */}
        <div className="flex items-center gap-0.5 bg-surface-2/80 border border-border-subtle rounded-full px-1 py-0.5 min-w-0">
          <button
            type="button"
            onClick={handlePrevDay}
            aria-label={lang === "hi" ? "पिछला दिन" : "Previous day"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:text-text-1 hover:bg-surface-3 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={openNativeDatePicker}
            className="px-1.5 py-1 text-xs font-bold text-text-1 truncate tabular-time cursor-pointer"
          >
            {mobileDateDisplay}
          </button>

          {!isCurrentDayToday() && (
            <button
              type="button"
              onClick={handleToday}
              className="px-1.5 py-0.5 rounded-full bg-saffron text-white text-xs font-bold cursor-pointer"
            >
              {lang === "hi" ? "आज" : "Today"}
            </button>
          )}

          <button
            type="button"
            onClick={handleNextDay}
            aria-label={lang === "hi" ? "अगला दिन" : "Next day"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-2 hover:text-text-1 hover:bg-surface-3 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Language Quick-Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onLangChange(lang === "hi" ? "en" : "hi")}
            aria-label={lang === "hi" ? "Switch to English" : "हिन्दी में बदलें"}
            className="inline-flex items-center justify-center rounded-full bg-surface-2 border border-border-subtle px-2.5 py-1.5 text-xs font-bold text-text-1 min-h-[38px] min-w-[42px] cursor-pointer"
          >
            {lang === "hi" ? "EN" : "हिं"}
          </button>
        </div>
      </div>

      {/* ─── DESKTOP TOP BAR (>= 1024px) ────────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between h-16 px-6 gap-4 max-w-[1600px] mx-auto">
        {/* Left: Date Stepper + Vedic Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onViewChange("home")}
            aria-label={lang === "hi" ? "होम हब" : "Home Hub"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              activeView === "home"
                ? "bg-saffron text-white border-saffron"
                : "bg-surface-2 hover:bg-surface-3 text-text-1 border-border-subtle"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "होम" : "Hub"}</span>
          </button>

          <div className="flex items-center gap-1 bg-surface-2 border border-border-subtle rounded-xl p-1">
            <button
              type="button"
              onClick={handlePrevDay}
              aria-label="Previous Day"
              title="Previous Day (←)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-2 hover:text-text-1 hover:bg-surface-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={openNativeDatePicker}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-surface-1 text-left transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-saffron shrink-0" />
              <div>
                <div className="text-xs font-bold text-text-1 tabular-time leading-tight">
                  {desktopDateDisplay}
                </div>
                {panchangaData && (
                  <div className="text-xs text-text-2 font-devanagari leading-tight truncate max-w-[230px]">
                    {getVedicSubtitle()}
                  </div>
                )}
              </div>
            </button>

            {!isCurrentDayToday() && (
              <button
                type="button"
                onClick={handleToday}
                title="Jump to Today (T)"
                className="px-2.5 py-1 rounded-lg bg-saffron text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer"
              >
                {lang === "hi" ? "आज" : "Today"}
              </button>
            )}

            <button
              type="button"
              onClick={handleNextDay}
              aria-label="Next Day"
              title="Next Day (→)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-2 hover:text-text-1 hover:bg-surface-1 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Location Pill */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenLocation}
              title="Change Location (/)"
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-subtle px-3 py-2 text-xs font-semibold text-text-1 transition-colors cursor-pointer"
            >
              {isDeviceLocation ? (
                <span className="h-2 w-2 rounded-full bg-auspicious shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-saffron shrink-0" />
              )}
              <span className="max-w-[150px] truncate">{currentCity}</span>
            </button>

            {onDetectDeviceLocation && (
              <button
                type="button"
                onClick={onDetectDeviceLocation}
                disabled={isDetectingLocation}
                title={t.useDeviceLocation}
                aria-label={t.useDeviceLocation}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-subtle text-text-2 hover:text-text-1 transition-colors cursor-pointer"
              >
                {isDetectingLocation ? (
                  <Loader2 className="h-4 w-4 text-saffron animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Center: Command Palette Search Trigger */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center justify-between gap-3 w-64 xl:w-80 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-subtle px-3 py-2 text-xs text-text-2 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate font-devanagari">
              <Search className="w-3.5 h-3.5 text-saffron shrink-0" />
              <span>
                {lang === "hi"
                  ? "व्यू, शहर या वैदिक शब्द खोजें..."
                  : "Search views, cities, terms..."}
              </span>
            </span>
            <KeyHint keys="⌘K" />
          </button>
        )}

        {/* Right: Language, Theme, Share & Export, Settings, User */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Segmented Switch */}
          <div className="flex items-center rounded-xl bg-surface-2 p-0.5 border border-border-subtle">
            {(["en", "hi"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLangChange(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                  lang === l
                    ? "bg-surface-1 text-text-1 shadow-2xs"
                    : "text-text-2 hover:text-text-1"
                }`}
              >
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isNight ? t.switchToParchment : t.switchToNightSky}
            aria-label={isNight ? t.switchToParchment : t.switchToNightSky}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-subtle px-3 text-xs font-semibold text-text-1 transition-colors cursor-pointer"
          >
            {isNight ? (
              <Sun className="h-4 w-4 text-saffron" />
            ) : (
              <Moon className="h-4 w-4 text-info" />
            )}
            <span className="hidden xl:inline">
              {isNight
                ? lang === "hi"
                  ? "पर्चमेंट"
                  : "Light"
                : lang === "hi"
                  ? "नाइट स्काई"
                  : "Dark"}
            </span>
          </button>

          {/* Consolidated Share & Export Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu((prev) => !prev)}
              aria-expanded={showExportMenu}
              aria-label={lang === "hi" ? "सिंक एवं एक्सपोर्ट" : "Sync & Export"}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-subtle px-3 text-xs font-semibold text-text-1 transition-colors cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-saffron" />
              <span>{lang === "hi" ? "सिंक / प्रिंट" : "Sync & Export"}</span>
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-1 border border-border-subtle shadow-xl p-1.5 z-50 space-y-1">
                  {onOpenCalendarSync && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        onOpenCalendarSync();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-text-1 hover:bg-surface-2 text-left cursor-pointer"
                    >
                      <CalendarIcon className="w-4 h-4 text-saffron" />
                      <span>
                        {lang === "hi" ? "Google Calendar सिंक" : "Google Calendar Sync"}
                      </span>
                    </button>
                  )}
                  {onOpenGoogleSheets && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false);
                        onOpenGoogleSheets();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-text-1 hover:bg-surface-2 text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-auspicious" />
                      <span>
                        {lang === "hi" ? "Google Sheets एक्सपोर्ट" : "Google Sheets Export"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      onPrint();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-text-1 hover:bg-surface-2 text-left cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-info" />
                    <span>{lang === "hi" ? "प्रिंट / PDF पंचांग" : "Print / Save PDF"}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={t.settings}
            aria-label={t.settings}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 hover:bg-surface-3 border border-border-subtle text-text-1 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Admin Access */}
          {currentUser?.role === "admin" && onOpenAdminUsers && (
            <button
              type="button"
              onClick={onOpenAdminUsers}
              title={lang === "hi" ? "यूजर एवं एक्सेस प्रबंधन" : "User & Access Management"}
              aria-label="Admin Access Control"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-saffron-lt border border-saffron/30 px-2.5 text-xs font-bold text-saffron cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden xl:inline">{lang === "hi" ? "एडमिन" : "Admin"}</span>
            </button>
          )}

          {/* User Pill + Logout */}
          {currentUser && (
            <div className="flex items-center gap-1 pl-1 border-l border-border-subtle">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border-subtle text-xs text-text-1"
                title={`${currentUser.fullName} (@${currentUser.username})`}
              >
                <UserIcon className="h-3.5 w-3.5 text-saffron" />
                <span className="font-semibold max-w-[85px] truncate">
                  {currentUser.fullName.split(" ")[0]}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title={lang === "hi" ? "लॉगआउट करें" : "Sign Out"}
                  aria-label="Logout"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-inauspicious-subtle border border-inauspicious/30 text-inauspicious hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
