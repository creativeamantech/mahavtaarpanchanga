import React from "react";
import { type ActiveView } from "./Header";
import { type Language, translations } from "../i18n";
import type { AppTheme } from "../types";

interface SpiritualTabsProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  lang: Language;
  theme?: AppTheme;
}

export const SpiritualTabs: React.FC<SpiritualTabsProps> = ({
  activeView,
  onViewChange,
  lang,
  theme = "parchment",
}) => {
  const t = translations[lang];
  const isNight = theme === "nightSky";

  const tabs: {
    id: ActiveView;
    label: string;
    icon: string;
    subLabel?: string;
  }[] = [
    {
      id: "panchanga",
      label: t.views.panchanga || (lang === "hi" ? "दैनिक पंचांग" : "Panchanga"),
      icon: "☀️",
      subLabel: "पञ्चाङ्ग",
    },
    {
      id: "today",
      label: lang === "hi" ? "दैनिक समय-सारणी" : "Schedule",
      icon: "📋",
      subLabel: "समय-सारणी",
    },
    {
      id: "timings",
      label: t.views.timings || (lang === "hi" ? "मुहूर्त" : "Timings"),
      icon: "⏰",
      subLabel: "मुहूर्ताः",
    },
    {
      id: "planets",
      label: t.views.planets || (lang === "hi" ? "ग्रह स्थिति" : "Planets"),
      icon: "🪐",
      subLabel: "ग्रहस्थिति",
    },
    {
      id: "navagraha",
      label: lang === "hi" ? "नवग्रह मन्त्र" : "Navagraha",
      icon: "🕉️",
      subLabel: "नवग्रह",
    },
    {
      id: "swara",
      label: t.views.swara || (lang === "hi" ? "स्वर विज्ञान" : "Swara Yoga"),
      icon: "🌬️",
      subLabel: "स्वरोदय",
    },
    {
      id: "navtara",
      label: lang === "hi" ? "नव तारा" : "Navtara",
      icon: "⭐",
      subLabel: "नव तारा",
    },
    {
      id: "horas",
      label: lang === "hi" ? "वैदिक होरा" : "Horas",
      icon: "🕐",
      subLabel: "होरा",
    },
    {
      id: "tattva",
      label: lang === "hi" ? "तत्व" : "Tattva",
      icon: "✨",
      subLabel: "तत्व",
    },
    {
      id: "calendar",
      label: t.views.calendar || (lang === "hi" ? "मासिक पंचांग" : "Calendar"),
      icon: "📅",
      subLabel: "मास-पत्रकम्",
    },
    {
      id: "lagna",
      label: lang === "hi" ? "लग्न कुण्डली" : "Lagna",
      icon: "🔯",
      subLabel: "लग्नम्",
    },
    {
      id: "festivals",
      label: lang === "hi" ? "पर्व व व्रत" : "Festivals",
      icon: "🪔",
      subLabel: "उत्सव",
    },
  ];

  return (
    <nav
      id="category-navigation"
      className={`sticky top-[96px] sm:top-[104px] z-40 border-b transition-colors shadow-2xs ${
        isNight
          ? "bg-[#0E1322]/95 border-indigo-950/70 text-slate-300 backdrop-blur-md"
          : "bg-white/95 border-[#E4E2DD] text-stone-700 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto cat-nav-scroll py-1">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`cat-tab-${tab.id}`}
                onClick={() => onViewChange(tab.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-[13px] font-semibold tracking-wide whitespace-nowrap shrink-0 transition-all border-b-[2.5px] -mb-1 ${
                  isActive
                    ? isNight
                      ? "text-[#F0C96A] border-[#F0C96A] font-bold"
                      : "text-[#D4680A] border-[#D4680A] font-bold"
                    : isNight
                      ? "text-slate-400 hover:text-slate-100 border-transparent hover:border-slate-700"
                      : "text-[#7C7F8E] hover:text-[#1C1B1A] border-transparent hover:border-stone-300"
                }`}
              >
                <span className="text-sm sm:text-base shrink-0 leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
