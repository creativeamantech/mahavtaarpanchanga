import React from "react";
import {
  X,
  Home,
  Sun,
  ListTodo,
  Clock,
  Compass,
  Moon,
  Star,
  Wind,
  Hourglass,
  Sparkles,
  CalendarDays,
  Flame,
  Printer,
  ShieldCheck,
  ChevronRight,
  Globe,
  Palette,
} from "lucide-react";
import type { ActiveView } from "./Header";
import type { AppTheme } from "../types";
import { type Language, translations } from "../i18n";
import type { AppUser } from "../services/userAuthService";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onPrint: () => void;
  currentUser?: AppUser | null;
  onOpenAdminUsers?: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
  onPrint,
  currentUser,
  onOpenAdminUsers,
}) => {
  if (!isOpen) return null;

  const isNight = theme === "nightSky";
  const t = translations[lang];

  const handleItemClick = (view: ActiveView) => {
    onSelectView(view);
    onClose();
  };

  const sections = [
    {
      title: lang === "hi" ? "दैनिक पंचांग व काल" : "Daily Panchanga & Time",
      items: [
        {
          id: "home" as ActiveView,
          label: lang === "hi" ? "मुख्य पृष्ठ (होम हब)" : "Home Hub",
          desc: lang === "hi" ? "कस्टमाइजेबल डैशबोर्ड व सारांश" : "Custom Dashboard & Summary",
          icon: Home,
          badge: lang === "hi" ? "केन्द्र" : "Hub",
        },
        {
          id: "panchanga" as ActiveView,
          label: t.views.panchanga,
          desc: lang === "hi" ? "पञ्च अङ्गानि • तिथि, नक्षत्र, योग, करण" : "Five Limbs & Vedic Metrics",
          icon: Sun,
        },
        {
          id: "today" as ActiveView,
          label: t.views.today,
          desc: lang === "hi" ? "दिन का समय-सारणी व अनुक्रम" : "Day Schedule & Ingress Timeline",
          icon: ListTodo,
        },
        {
          id: "timings" as ActiveView,
          label: t.views.timings,
          desc: lang === "hi" ? "अभिजीत, ब्रह्म, राहु काल, चौघड़िया" : "Abhijit, Brahma, Rahu Kala & Choghadiya",
          icon: Clock,
        },
      ],
    },
    {
      title: lang === "hi" ? "ज्योतिष व कुण्डली" : "Astrology & Kundali",
      items: [
        {
          id: "kundli" as ActiveView,
          label: t.views.kundli,
          desc: lang === "hi" ? "लग्न कुण्डली, विंशोत्तरी दशा, KP, गोचर" : "Birth Chart, Dasha, KP & Transit",
          icon: Compass,
          badge: lang === "hi" ? "11 विधाएं" : "11 Tabs",
        },
        {
          id: "planets" as ActiveView,
          label: t.views.planets,
          desc: lang === "hi" ? "नवग्रह प्रत्यक्ष खगोलीय व स्पष्ट स्थिति" : "Planetary Ephemeris & Ingress",
          icon: Moon,
        },
        {
          id: "navagraha" as ActiveView,
          label: t.views.navagraha,
          desc: lang === "hi" ? "बीज मन्त्र, स्तोत्र व रत्न उपाय" : "Mantras, Stotrams & Remedies",
          icon: Star,
        },
      ],
    },
    {
      title: lang === "hi" ? "स्वरोदय, होरा व तत्व" : "Esoteric & Swara",
      items: [
        {
          id: "swara" as ActiveView,
          label: t.views.swara,
          desc: lang === "hi" ? "इड़ा, पिङ्गला, सुषुम्णा नाड़ी प्रवाह" : "Ida, Pingala & Breath Flow",
          icon: Wind,
        },
        {
          id: "navtara" as ActiveView,
          label: t.views.navtara,
          desc: lang === "hi" ? "जन्मतारा से अति-मित्र सम्पद चक्र" : "Janma to Ati-Mitra Matrix",
          icon: Star,
        },
        {
          id: "horas" as ActiveView,
          label: t.views.horas,
          desc: lang === "hi" ? "24 होरा चक्र व तात्कालिक स्वामी" : "24 Hourly Planetary Rulers",
          icon: Hourglass,
        },
        {
          id: "tattva" as ActiveView,
          label: t.views.tattva,
          desc: lang === "hi" ? "पंच महाभूत तत्व काल गणना" : "Five Elemental Cycles",
          icon: Sparkles,
        },
      ],
    },
    {
      title: lang === "hi" ? "पर्व एवं त्यौहार" : "Festivals & Vratas",
      items: [
        {
          id: "festivals" as ActiveView,
          label: t.views.festivals,
          desc: lang === "hi" ? "एकादशी, प्रदोष, संक्रांति व जयंतियां" : "Ekadashi, Pradosh & Vratas",
          icon: Flame,
          badge: lang === "hi" ? "पर्व" : "Vrat",
        },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === "hi" ? "पंचांग नेविगेशन मेन्यू" : "Panchanga Navigation Menu"}
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        className={`relative w-full max-h-[88vh] flex flex-col rounded-t-3xl border-t shadow-2xl transition-transform duration-300 ${
          isNight
            ? "bg-[#0c1222] border-indigo-900/60 text-slate-100"
            : "bg-[#fbf9f5] border-amber-300/80 text-stone-900"
        }`}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        {/* Drawer Drag Indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className={`w-12 h-1.5 rounded-full ${
              isNight ? "bg-slate-700" : "bg-stone-300"
            }`}
          />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-inherit/40 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold shadow-xs ${
                isNight
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-900 text-amber-300 ring-1 ring-indigo-400/30"
                  : "bg-gradient-to-br from-amber-600 to-amber-700 text-white ring-1 ring-amber-500/40"
              }`}
            >
              <Sun className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base font-black tracking-tight font-serif-vedic">
                  {lang === "hi" ? "महावतार पंचांग" : "Mahavtaar Panchanga"}
                </h2>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isNight
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  दृग्गणित
                </span>
              </div>
              <p
                className={`text-[11px] leading-none ${
                  isNight ? "text-slate-400" : "text-stone-500"
                }`}
              >
                {lang === "hi" ? "वैदिक विधाएं एवं सेवाएं" : "Vedic Modules & Sections"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors touch-target-min cursor-pointer ${
              isNight
                ? "hover:bg-slate-800 text-slate-300"
                : "hover:bg-stone-200 text-stone-600"
            }`}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 hide-scrollbar">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1.5">
              <div className="flex items-center justify-between px-2 pt-1">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isNight ? "text-amber-400/90" : "text-amber-800/90"
                  }`}
                >
                  {sec.title}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    isNight ? "text-slate-500" : "text-stone-400"
                  }`}
                >
                  0{secIdx + 1}
                </span>
              </div>

              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeView === item.id ||
                    (item.id === "kundli" && activeView === "lagna") ||
                    (item.id === "panchanga" && activeView === "today");

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer touch-target-min ${
                        isActive
                          ? isNight
                            ? "bg-indigo-950/80 border border-indigo-500/40 text-amber-300 shadow-xs"
                            : "bg-amber-100/80 border border-amber-300/80 text-amber-950 shadow-xs"
                          : isNight
                            ? "hover:bg-slate-800/60 border border-transparent text-slate-200"
                            : "hover:bg-stone-100 border border-transparent text-stone-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                            isActive
                              ? isNight
                                ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                                : "bg-amber-600/15 text-amber-800 ring-1 ring-amber-600/30"
                              : isNight
                                ? "bg-slate-800 text-slate-300"
                                : "bg-stone-200/70 text-stone-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm font-semibold truncate leading-tight">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                                  isNight
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                    : "bg-amber-200 text-amber-900 border border-amber-300"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isNight ? "text-slate-400" : "text-stone-500"
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isActive
                            ? "text-amber-500 translate-x-0.5"
                            : isNight
                              ? "text-slate-600"
                              : "text-stone-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin Management Section (if current user is admin) */}
          {currentUser?.role === "admin" && onOpenAdminUsers && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminUsers();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isNight
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25"
                    : "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100/80"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">
                      {lang === "hi" ? "यूजर एवं एक्सेस प्रबंधन" : "User & Access Management"}
                    </div>
                    <div
                      className={`text-[10px] ${
                        isNight ? "text-amber-300/70" : "text-amber-800/80"
                      }`}
                    >
                      {lang === "hi"
                        ? "गूगल शीट्स आधारित RBAC यूजर परमिशन"
                        : "Google Sheets RBAC User Management"}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/40">
                  {lang === "hi" ? "एडमिन" : "Admin"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Bottom Utility Bar: Language, Theme, Print */}
        <div
          className={`px-4 pt-3 border-t border-inherit/40 flex items-center justify-between gap-2 shrink-0 ${
            isNight ? "bg-slate-900/60" : "bg-stone-100/80"
          }`}
        >
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => onLangChange(lang === "hi" ? "en" : "hi")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all touch-target-min cursor-pointer ${
              isNight
                ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-white border-stone-300 text-stone-800 hover:bg-stone-50"
            }`}
          >
            <Globe className="h-4 w-4 text-amber-500" />
            <span>{lang === "hi" ? "English" : "हिन्दी"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all touch-target-min cursor-pointer ${
              isNight
                ? "bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-white border-stone-300 text-amber-800 hover:bg-stone-50"
            }`}
          >
            <Palette className="h-4 w-4 text-amber-500" />
            <span>{isNight ? (lang === "hi" ? "सात्विक" : "Light") : (lang === "hi" ? "रात्रि" : "Dark")}</span>
          </button>

          {/* Print / PDF Export */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onPrint();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all touch-target-min cursor-pointer ${
              isNight
                ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-white border-stone-300 text-stone-800 hover:bg-stone-50"
            }`}
          >
            <Printer className="h-4 w-4 text-amber-500" />
            <span>{lang === "hi" ? "प्रिंट/PDF" : "Print"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
