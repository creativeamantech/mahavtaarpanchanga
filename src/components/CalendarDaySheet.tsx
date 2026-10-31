import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "./ui/drawer";
import { Sun, Moon, Clock, ArrowRight, X, AlertTriangle } from "lucide-react";
import type { MonthlyPanchangaDay, AppTheme } from "../types";
import { type Language, getLocalizedVaara, getLocalizedTithi, getLocalizedNakshatra } from "../i18n";

interface CalendarDaySheetProps {
  isOpen: boolean;
  onClose: () => void;
  day: MonthlyPanchangaDay | null;
  onSelectDateForFullPanchanga: (dateStr: string) => void;
  lang: Language;
  theme: AppTheme;
}

export const CalendarDaySheet: React.FC<CalendarDaySheetProps> = ({
  isOpen,
  onClose,
  day,
  onSelectDateForFullPanchanga,
  lang,
  theme,
}) => {
  if (!day) return null;

  const isNight = theme === "nightSky";
  const localizedVaara = getLocalizedVaara(day.vaara, lang);
  const localizedTithi = getLocalizedTithi(day.tithi, lang);
  const localizedNakshatra = getLocalizedNakshatra(day.nakshatra, lang);

  const isPurnima =
    (day.tithi || "").toLowerCase().includes("pūrṇimā") ||
    (day.tithi || "").includes("पूर्णिमा");
  const isAmavasya =
    (day.tithi || "").toLowerCase().includes("amāvāsyā") ||
    (day.tithi || "").includes("अमावस्या");

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className={`max-w-lg mx-auto border-t rounded-t-3xl backdrop-blur-2xl ${
          isNight
            ? "bg-[#0e1424] text-slate-100 border-indigo-900/50"
            : "bg-[#fffdfa] text-stone-900 border-amber-200"
        }`}
      >
        <DrawerHeader className="text-left pb-2 pt-4 px-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-black text-xs font-mono shadow-xs">
                {day.date}
              </span>
              <span className="font-bold text-base font-devanagari text-foreground">
                {localizedVaara}
              </span>
            </div>
            {isPurnima && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700">
                🌕 {lang === "hi" ? "पूर्णिमा" : "Pūrṇimā"}
              </span>
            )}
            {isAmavasya && (
              <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-200 text-xs font-bold border border-stone-300 dark:border-stone-700">
                🌑 {lang === "hi" ? "अमावस्या" : "Amāvāsyā"}
              </span>
            )}
          </div>
          <DrawerTitle className="text-xl font-bold font-serif-vedic mt-2">
            {day.masa || "Māsa"} • {day.paksha || ""} {lang === "hi" ? "पक्ष" : "Pakṣa"}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground font-devanagari">
            {lang === "hi" ? "दैनिक पंचांग विवरण" : "Daily Panchanga Details"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Angas Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                isNight ? "bg-indigo-950/30 border-indigo-900/40" : "bg-amber-50/70 border-amber-200/60"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                {lang === "hi" ? "तिथि" : "Tithi"}
              </span>
              <span className="font-bold text-sm font-devanagari leading-snug block">
                {localizedTithi}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isNight ? "bg-indigo-950/30 border-indigo-900/40" : "bg-amber-50/70 border-amber-200/60"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                {lang === "hi" ? "नक्षत्र" : "Nakshatra"}
              </span>
              <span className="font-bold text-sm font-devanagari leading-snug block">
                {localizedNakshatra}
              </span>
            </div>
          </div>

          {/* Sun & Rahu Timings */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isNight ? "bg-slate-900/50 border-slate-800" : "bg-white border-stone-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                {lang === "hi" ? "सूर्योदय / सूर्यास्त" : "Sunrise / Sunset"}
              </span>
              <span className="font-mono font-bold">
                {day.sunrise || "--"} / {day.sunset || "--"}
              </span>
            </div>

            {day.rahu_kala && (
              <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2.5">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lang === "hi" ? "राहु काल" : "Rāhu Kāla"}
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {day.rahu_kala.start} – {day.rahu_kala.end}
                </span>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="px-6 pb-6 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => {
              onSelectDateForFullPanchanga(day.date);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md cursor-pointer"
          >
            <span>{lang === "hi" ? "इस दिन का सम्पूर्ण पंचांग देखें" : "View Full Day Panchanga"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <DrawerClose asChild>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl border border-input text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {lang === "hi" ? "बंद करें" : "Close"}
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
