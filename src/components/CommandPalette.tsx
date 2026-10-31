import React, { useState } from "react";
import { Command } from "cmdk";
import {
  Search,
  Sun,
  CalendarDays,
  Compass,
  Clock,
  Moon,
  Star,
  Wind,
  Hourglass,
  Sparkles,
  Flame,
  Home,
  MapPin,
  Settings,
  Printer,
  CalendarSync,
  FileSpreadsheet,
  Languages,
  Palette,
  Keyboard,
  X,
  BookOpen,
} from "lucide-react";
import type { ActiveView } from "./Header";
import { type Language, translations } from "../i18n";
import type { AppTheme, CityLocation } from "../types";
import { VEDIC_TERM_GLOSSARY } from "./VedicTermTooltip";
import { KeyHint } from "./ds";

const POPULAR_CITIES: CityLocation[] = [
  { name: "Varanasi", country: "India", latitude: 25.3176, longitude: 82.9739, timezone: "Asia/Kolkata" },
  { name: "Ujjain", country: "India", latitude: 23.1765, longitude: 75.7885, timezone: "Asia/Kolkata" },
  { name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
  { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
  { name: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  { name: "Ayodhya", country: "India", latitude: 26.7922, longitude: 82.1998, timezone: "Asia/Kolkata" },
  { name: "Haridwar", country: "India", latitude: 29.9457, longitude: 78.1642, timezone: "Asia/Kolkata" },
  { name: "Puri", country: "India", latitude: 19.8135, longitude: 85.8312, timezone: "Asia/Kolkata" },
  { name: "Kanchipuram", country: "India", latitude: 12.8342, longitude: 79.7036, timezone: "Asia/Kolkata" },
  { name: "Kolkata", country: "India", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata" },
  { name: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  { name: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867, timezone: "Asia/Kolkata" },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ActiveView) => void;
  onSelectCity: (city: CityLocation) => void;
  onJumpToday: () => void;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
  onOpenCalendarSync: () => void;
  onOpenGoogleSheets: () => void;
  onPrint: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  lang: Language;
  theme: AppTheme;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onSelectCity,
  onJumpToday,
  onOpenLocation,
  onOpenSettings,
  onOpenCalendarSync,
  onOpenGoogleSheets,
  onPrint,
  onToggleTheme,
  onToggleLang,
  lang,
}) => {
  const [search, setSearch] = useState("");
  const t = translations[lang];

  if (!isOpen) return null;

  const runAction = (fn: () => void) => {
    fn();
    onClose();
  };

  const viewCommands: {
    id: ActiveView;
    label: string;
    sub: string;
    icon: React.ElementType;
    shortcut?: string;
  }[] = [
    {
      id: "today",
      label: lang === "hi" ? "आज का पंचांग व समय-सारणी" : "Today — Overview & Live Muhurta",
      sub: lang === "hi" ? "तिथि, नक्षत्र, राहु काल, चौघड़िया" : "Tithi, Nakshatra, Rahu Kala, Sun Arc",
      icon: Sun,
      shortcut: "T",
    },
    {
      id: "panchanga",
      label: t.views.panchanga,
      sub: lang === "hi" ? "पञ्च अङ्गानि विस्तृत विवरण" : "Detailed Five Angas & Summary",
      icon: Sun,
    },
    {
      id: "calendar",
      label: t.views.calendar,
      sub: lang === "hi" ? "मासिक पंचांग ग्रिड व व्रत" : "Monthly Panchanga Grid & Vratas",
      icon: CalendarDays,
      shortcut: "C",
    },
    {
      id: "kundli",
      label: t.views.kundli,
      sub: lang === "hi" ? "जन्म कुण्डली, षोडशवर्ग, दशा, KP, गुण मिलान" : "Birth Chart, Vargas, Dasha, KP, Matchmaking",
      icon: Compass,
      shortcut: "K",
    },
    {
      id: "timings",
      label: t.views.timings,
      sub: lang === "hi" ? "अभिजीत, ब्रह्म मुहूर्त, चौघड़िया" : "Abhijit, Brahma Muhurta, Choghadiya",
      icon: Clock,
    },
    {
      id: "horas",
      label: t.views.horas,
      sub: lang === "hi" ? "24 वैदिक होरा चक्र" : "24 Planetary Hora Rulers",
      icon: Hourglass,
    },
    {
      id: "swara",
      label: t.views.swara,
      sub: lang === "hi" ? "शिव स्वरोदय नाड़ी प्रवाह" : "Shiva Swarodaya Breath Flow",
      icon: Wind,
    },
    {
      id: "tattva",
      label: t.views.tattva,
      sub: lang === "hi" ? "पंच महाभूत तत्व चक्र" : "Five Elemental Cycles",
      icon: Sparkles,
    },
    {
      id: "navtara",
      label: t.views.navtara,
      sub: lang === "hi" ? "27 नक्षत्र ताराबल चक्र" : "27-Star Tarabala Matrix",
      icon: Star,
    },
    {
      id: "planets",
      label: t.views.planets,
      sub: lang === "hi" ? "नवग्रह स्पष्ट एवं राशि गोचर" : "Planetary Ephemeris & Transits",
      icon: Moon,
    },
    {
      id: "navagraha",
      label: t.views.navagraha,
      sub: lang === "hi" ? "नवग्रह बीज मन्त्र एवं स्तोत्र" : "Navagraha Mantras & Remedies",
      icon: Star,
    },
    {
      id: "festivals",
      label: t.views.festivals,
      sub: lang === "hi" ? "एकादशी, प्रदोष, संक्रांति, पर्व" : "Ekadashi, Pradosh, Sankranti & Festivals",
      icon: Flame,
    },
    {
      id: "home",
      label: lang === "hi" ? "होम हब (डैशबोर्ड)" : "Home Hub (Launcher)",
      sub: lang === "hi" ? "सभी वैदिक टूल्स एक स्थान पर" : "All Vedic tools & customization",
      icon: Home,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === "hi" ? "त्वरित खोज और कमांड पैलेट" : "Quick Search & Command Palette"}
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-surface-1 border border-border-subtle shadow-2xl overflow-hidden text-text-1">
        <Command label="Command Menu" shouldFilter={true} className="w-full">
          <div className="flex items-center gap-2.5 border-b border-border-subtle px-4 py-3">
            <Search className="w-4 h-4 text-saffron shrink-0" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder={
                lang === "hi"
                  ? "व्यू, शहर, वैदिक शब्द या एक्शन खोजें..."
                  : "Jump to view, city, Vedic term, or action..."
              }
              className="w-full bg-transparent text-sm sm:text-base text-text-1 placeholder:text-text-3 focus:outline-none font-devanagari"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close command palette"
              className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-[68vh] overflow-y-auto p-2 space-y-2">
            <Command.Empty className="py-8 text-center text-sm text-text-2 font-devanagari">
              {lang === "hi" ? "कोई परिणाम नहीं मिला।" : "No matching results found."}
            </Command.Empty>

            <Command.Group
              heading={lang === "hi" ? "नेविगेशन (दृश्य)" : "Views & Tools"}
              className="text-xs font-semibold text-text-3 px-2 py-1"
            >
              {viewCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <Command.Item
                    key={cmd.id}
                    value={`${cmd.id} ${cmd.label} ${cmd.sub}`}
                    onSelect={() => runAction(() => onSelectView(cmd.id))}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-saffron-lt text-saffron">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold font-devanagari truncate">{cmd.label}</div>
                        <div className="text-xs text-text-2 font-devanagari truncate">
                          {cmd.sub}
                        </div>
                      </div>
                    </div>
                    {cmd.shortcut && <KeyHint keys={cmd.shortcut} />}
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group
              heading={lang === "hi" ? "त्वरित क्रियाएं" : "Quick Actions"}
              className="text-xs font-semibold text-text-3 px-2 py-1"
            >
              <Command.Item
                value="Jump to Today Aaj"
                onSelect={() => runAction(onJumpToday)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "आज की तिथि पर जाएं" : "Jump to Today's Date"}
                  </span>
                </div>
                <KeyHint keys="T" />
              </Command.Item>

              <Command.Item
                value="Change Location City GPS"
                onSelect={() => runAction(onOpenLocation)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "स्थान / शहर बदलें" : "Change Location / City"}
                  </span>
                </div>
                <KeyHint keys="/" />
              </Command.Item>

              <Command.Item
                value="Toggle Language Hindi English"
                onSelect={() => runAction(onToggleLang)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "भाषा बदलें (English / हिन्दी)" : "Switch Language (Hindi / English)"}
                  </span>
                </div>
              </Command.Item>

              <Command.Item
                value="Toggle Theme Dark Light Night Sky Parchment"
                onSelect={() => runAction(onToggleTheme)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "थीम बदलें (पर्चमेंट / नाइट स्काई)" : "Toggle Theme (Parchment / Night Sky)"}
                  </span>
                </div>
              </Command.Item>

              <Command.Item
                value="Google Calendar Sync"
                onSelect={() => runAction(onOpenCalendarSync)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CalendarSync className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "Google Calendar सिंक खोलें" : "Open Google Calendar Sync"}
                  </span>
                </div>
              </Command.Item>

              <Command.Item
                value="Google Sheets Export Sync"
                onSelect={() => runAction(onOpenGoogleSheets)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-auspicious" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "Google Sheets एक्सपोर्ट व सिंक" : "Google Sheets Export & Sync"}
                  </span>
                </div>
              </Command.Item>

              <Command.Item
                value="Print PDF Almanac Report"
                onSelect={() => runAction(onPrint)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Printer className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "पंचांग प्रिंट / PDF रिपोर्ट" : "Print / Save PDF Almanac"}
                  </span>
                </div>
              </Command.Item>

              <Command.Item
                value="Settings Ayanamsa Month System Notifications"
                onSelect={() => runAction(onOpenSettings)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-saffron" />
                  <span className="font-devanagari">
                    {lang === "hi" ? "गणना सेटिंग्स (अयनांश, मास प्रणाली)" : "Calculation & Notification Settings"}
                  </span>
                </div>
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading={lang === "hi" ? "प्रमुख शहर" : "Popular Cities"}
              className="text-xs font-semibold text-text-3 px-2 py-1"
            >
              {POPULAR_CITIES.map((city) => (
                <Command.Item
                  key={city.name}
                  value={`city ${city.name} ${city.country}`}
                  onSelect={() => runAction(() => onSelectCity(city))}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-text-3" />
                    <span>{city.name}</span>
                  </div>
                  <span className="text-xs text-text-3 tabular-time">
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading={lang === "hi" ? "वैदिक शब्दकोश (शब्दावली)" : "Vedic Glossary"}
              className="text-xs font-semibold text-text-3 px-2 py-1"
            >
              {Object.entries(VEDIC_TERM_GLOSSARY).slice(0, 12).map(([key, item]) => (
                <Command.Item
                  key={key}
                  value={`term ${key} ${item.en.title} ${item.hi.title}`}
                  onSelect={() => runAction(() => onSelectView("today"))}
                  className="flex items-start gap-3 rounded-xl px-3 py-2 text-sm text-text-1 hover:bg-surface-2 aria-selected:bg-surface-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-semibold font-devanagari">
                      {lang === "hi" ? item.hi.title : item.en.title}
                    </div>
                    <div className="text-xs text-text-2 font-devanagari line-clamp-2">
                      {lang === "hi" ? item.hi.desc : item.en.desc}
                    </div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border-subtle bg-surface-2/60 px-4 py-2 text-xs text-text-3">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>Press ? for shortcuts</span>
          </div>
        </Command>
      </div>
    </div>
  );
};

export const KeyboardShortcutsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "⌘K / Ctrl+K", desc: lang === "hi" ? "कमांड पैलेट / वैश्विक खोज खोलें" : "Open Command Palette" },
    { key: "← / →", desc: lang === "hi" ? "पिछला / अगला दिन" : "Previous / Next Day" },
    { key: "T", desc: lang === "hi" ? "आज की तिथि पर जाएं" : "Jump to Today" },
    { key: "C", desc: lang === "hi" ? "मासिक कैलेंडर खोलें" : "Open Monthly Calendar" },
    { key: "K", desc: lang === "hi" ? "जन्म कुण्डली खोलें" : "Open Kundli Studio" },
    { key: "/", desc: lang === "hi" ? "स्थान / शहर खोजें" : "Search City / Location" },
    { key: "?", desc: lang === "hi" ? "कीबोर्ड शॉर्टकट सहायता" : "Show Keyboard Shortcuts" },
    { key: "Esc", desc: lang === "hi" ? "मॉडल / ड्रॉअर बंद करें" : "Close active modal or sheet" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface-1 border border-border-subtle p-5 shadow-2xl text-text-1">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-saffron" />
            <h2 className="type-heading font-devanagari">
              {lang === "hi" ? "कीबोर्ड शॉर्टकट" : "Keyboard Shortcuts"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-border-subtle">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-text-2 font-devanagari">{s.desc}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-semibold bg-surface-2 border border-border-subtle rounded text-text-1">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
