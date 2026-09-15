import React, { useState, useEffect } from "react";
import { Moon, Star, Sun, Activity, PieChart, Clock, CircleDashed } from "lucide-react";
import type { PanchangaResponse, Segment, AppTheme } from "../types";
import { computeTithiSwaraEvents } from "../lib/tithiSwaraEngine";
import { computeNakshatraSwaraEvents } from "../lib/nakshatraSwaraEngine";
import {
  type Language,
  translations,
  getLocalizedTithi,
  getLocalizedNakshatra,
  getLocalizedYoga,
  getLocalizedKarana,
  getLocalizedVaara,
} from "../i18n";

interface FiveAngasCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

const getActiveAndNext = (segments: Segment[], nowMs: number) => {
  if (!segments || segments.length === 0) return { active: null, next: null };
  let active = segments[0];
  let next = segments.length > 1 ? segments[1] : null;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.endTimeMs && nowMs > seg.endTimeMs) {
      continue;
    }
    active = seg;
    next = segments.length > i + 1 ? segments[i + 1] : null;
    break;
  }
  return { active, next };
};

export const FiveAngasCard: React.FC<FiveAngasCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === "nightSky";
  const t = translations[lang];

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getVaaraDetails = (vaara: string) => {
    switch (vaara) {
      case "Ravivāra":
        return {
          deity: lang === "hi" ? "स्वामी: सूर्य देव" : "Ruled by Sūrya (Sun)",
          metal: lang === "hi" ? "तांबा • माणिक" : "Copper • Ruby",
        };
      case "Somavāra":
        return {
          deity: lang === "hi" ? "स्वामी: चन्द्र देव" : "Ruled by Candra (Moon)",
          metal: lang === "hi" ? "चांदी • मोती" : "Silver • Pearl",
        };
      case "Maṅgalavāra":
        return {
          deity: lang === "hi" ? "स्वामी: मङ्गल देव" : "Ruled by Maṅgala (Mars)",
          metal: lang === "hi" ? "तांबा • मूंगा" : "Copper • Red Coral",
        };
      case "Budhavāra":
        return {
          deity: lang === "hi" ? "स्वामी: बुध देव" : "Ruled by Budha (Mercury)",
          metal: lang === "hi" ? "कांसा • पन्ना" : "Bronze • Emerald",
        };
      case "Guruvāra":
        return {
          deity: lang === "hi" ? "स्वामी: बृहस्पति (गुरु)" : "Ruled by Bṛhaspati (Jupiter)",
          metal: lang === "hi" ? "स्वर्ण • पुखराज" : "Gold • Yellow Sapphire",
        };
      case "Śukravāra":
        return {
          deity: lang === "hi" ? "स्वामी: शुक्र देव" : "Ruled by Śukra (Venus)",
          metal: lang === "hi" ? "चांदी • हीरा" : "Silver • Diamond",
        };
      case "Śanivāra":
        return {
          deity: lang === "hi" ? "स्वामी: शनि देव" : "Ruled by Śani (Saturn)",
          metal: lang === "hi" ? "लोहा • नीलम" : "Iron • Blue Sapphire",
        };
      default:
        return null;
    }
  };

  const VaaraRow = () => {
    const localizedVaara = getLocalizedVaara(data.vaara, lang);
    const details = getVaaraDetails(data.vaara);

    return (
      <div
        className={`p-3 sm:p-4 rounded-xl border transition-all ${isNight ? "bg-slate-900/40 border-slate-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "bg-white border-stone-200/80 shadow-xs"} flex flex-col gap-2`}
      >
        <div className="flex items-center gap-2 mb-1 border-b pb-2 border-stone-200/60 dark:border-slate-800">
          <div
            className={`p-1.5 rounded-lg ${isNight ? "bg-amber-900/30 text-amber-400" : "bg-amber-100/60 text-amber-600"}`}
          >
            <Sun className="w-4 h-4" />
          </div>
          <h3
            className={`font-bold uppercase tracking-wider text-xs ${isNight ? "text-slate-300" : "text-stone-500"}`}
          >
            {lang === "hi" ? "१. वार (दिन)" : "1. Vaara (Day)"}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${isNight ? "text-emerald-400" : "text-emerald-700"}`}
              >
                {lang === "hi" ? "आज का वार" : "Today"}
              </span>
            </div>
            <span
              className={`text-lg sm:text-xl font-bold font-devanagari mt-0.5 ${isNight ? "text-white" : "text-stone-900"}`}
            >
              {localizedVaara}
            </span>
          </div>

          {details && (
            <div
              className={`text-xs flex flex-col sm:items-end ${isNight ? "text-slate-300" : "text-stone-600"}`}
            >
              <div className={`font-bold ${isNight ? "text-amber-200" : "text-amber-700"}`}>
                {details.deity}
              </div>
              <div className="opacity-80 mt-0.5">{details.metal}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderNadiCycle = (swaraInfo: any, labelPrefix: string = "") => {
    if (!swaraInfo || (!swaraInfo.startEvent && !swaraInfo.endEvent)) return null;
    return (
      <div
        className={`mt-2 p-2.5 rounded-lg border flex flex-col gap-2 ${isNight ? "bg-slate-900/50 border-slate-700/60" : "bg-stone-50 border-stone-200/60"}`}
      >
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-500 dark:text-slate-400">
          <span>
            {labelPrefix ? `${labelPrefix} ` : ""}
            {lang === "hi" ? "नाड़ी चक्र (Nadi Cycle)" : "Nadi Cycle"}
          </span>
          {swaraInfo.hasOverlap && (
            <span className="text-amber-600 dark:text-amber-400">
              {lang === "hi" ? "संक्षिप्त (<2h)" : "Short (<2h)"}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Start Nadi */}
          {swaraInfo.startEvent &&
            (() => {
              const isNadiActive =
                nowMs >= swaraInfo.startEvent.startTimeMs &&
                nowMs <= swaraInfo.startEvent.endTimeMs;
              return (
                <div
                  className={`flex-1 p-2 rounded-md border flex items-center justify-between transition-colors ${
                    isNadiActive
                      ? "ring-1 ring-amber-400 bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700/50 shadow-sm"
                      : isNight
                        ? "bg-slate-800/50 border-slate-700/50"
                        : "bg-white border-stone-200"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-stone-500 dark:text-slate-400 uppercase">
                        {lang === "hi" ? "आरंभ नाड़ी" : "Start Nadi"}
                      </span>
                      {isNadiActive && (
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        swaraInfo.startEvent.nadi === "pingala"
                          ? "text-amber-600 dark:text-amber-400"
                          : swaraInfo.startEvent.nadi === "ida"
                            ? "text-sky-600 dark:text-cyan-400"
                            : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {swaraInfo.startEvent.nadiLabel}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono font-medium text-stone-600 dark:text-slate-300">
                      {swaraInfo.startEvent.formattedStart}
                    </span>
                    <span className="text-[9px] text-stone-400 dark:text-slate-500">1 hr</span>
                  </div>
                </div>
              );
            })()}

          {/* End Nadi */}
          {swaraInfo.endEvent &&
            (() => {
              const isNadiActive =
                nowMs >= swaraInfo.endEvent.startTimeMs && nowMs <= swaraInfo.endEvent.endTimeMs;
              return (
                <div
                  className={`flex-1 p-2 rounded-md border flex items-center justify-between transition-colors ${
                    isNadiActive
                      ? "ring-1 ring-amber-400 bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700/50 shadow-sm"
                      : isNight
                        ? "bg-slate-800/50 border-slate-700/50"
                        : "bg-white border-stone-200"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-stone-500 dark:text-slate-400 uppercase">
                        {lang === "hi" ? "समापन नाड़ी" : "End Nadi"}
                      </span>
                      {isNadiActive && (
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        swaraInfo.endEvent.nadi === "pingala"
                          ? "text-amber-600 dark:text-amber-400"
                          : swaraInfo.endEvent.nadi === "ida"
                            ? "text-sky-600 dark:text-cyan-400"
                            : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {swaraInfo.endEvent.nadiLabel}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono font-medium text-stone-600 dark:text-slate-300">
                      {swaraInfo.endEvent.formattedStart}
                    </span>
                    <span className="text-[9px] text-stone-400 dark:text-slate-500">Final 1h</span>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    );
  };
  const AngaRow = ({
    index,
    title,
    icon: Icon,
    segments,
    localizeFn,
    color,
    angaType,
  }: {
    index: number;
    title: string;
    icon: React.ElementType;
    segments?: Segment[];
    localizeFn?: (num: number, raw: string, l: Language) => string;
    color: "indigo" | "rose" | "purple" | "cyan";
    angaType?: "tithi" | "nakshatra";
  }) => {
    if (!segments || segments.length === 0) return null;

    const { active, next } = getActiveAndNext(segments, nowMs);
    if (!active) return null;

    const activeName =
      localizeFn && active.number != null
        ? localizeFn(active.number, active.name, lang)
        : active.name;

    const nextName =
      next && localizeFn && next.number != null
        ? localizeFn(next.number, next.name, lang)
        : next?.name;

    const colorVariants = {
      indigo: {
        bg: isNight ? "bg-indigo-900/30" : "bg-indigo-100/60",
        text: isNight ? "text-indigo-400" : "text-indigo-600",
        accent: isNight ? "text-indigo-200" : "text-indigo-700",
      },
      rose: {
        bg: isNight ? "bg-rose-900/30" : "bg-rose-100/60",
        text: isNight ? "text-rose-400" : "text-rose-600",
        accent: isNight ? "text-rose-200" : "text-rose-700",
      },
      purple: {
        bg: isNight ? "bg-purple-900/30" : "bg-purple-100/60",
        text: isNight ? "text-purple-400" : "text-purple-600",
        accent: isNight ? "text-purple-200" : "text-purple-700",
      },
      cyan: {
        bg: isNight ? "bg-cyan-900/30" : "bg-cyan-100/60",
        text: isNight ? "text-cyan-400" : "text-cyan-600",
        accent: isNight ? "text-cyan-200" : "text-cyan-700",
      },
    };

    const colors = colorVariants[color];

    let swara = null;
    let nextSwara = null;
    if (angaType === "tithi") {
      swara =
        active.tithiSwara ||
        computeTithiSwaraEvents(active, data.timezone, nowMs, lang === "hi" ? "hi" : "en");
      if (next) {
        nextSwara =
          next.tithiSwara ||
          computeTithiSwaraEvents(next, data.timezone, nowMs, lang === "hi" ? "hi" : "en");
      }
    } else if (angaType === "nakshatra") {
      swara =
        active.nakshatraSwara ||
        computeNakshatraSwaraEvents(active, data.timezone, nowMs, lang === "hi" ? "hi" : "en");
      if (next) {
        nextSwara =
          next.nakshatraSwara ||
          computeNakshatraSwaraEvents(next, data.timezone, nowMs, lang === "hi" ? "hi" : "en");
      }
    }

    return (
      <div
        className={`p-3 sm:p-4 rounded-xl border transition-all ${isNight ? "bg-slate-900/40 border-slate-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "bg-white border-stone-200/80 shadow-xs"} flex flex-col gap-2`}
      >
        <div className="flex items-center gap-2 mb-1 border-b pb-2 border-stone-200/60 dark:border-slate-800">
          <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3
            className={`font-bold uppercase tracking-wider text-xs ${isNight ? "text-slate-300" : "text-stone-500"}`}
          >
            {index}. {title}
          </h3>
        </div>

        {/* Active Segment */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${isNight ? "text-emerald-400" : "text-emerald-700"}`}
              >
                {lang === "hi" ? "अभी चल रहा है" : "Active Now"}
              </span>
            </div>
            <span
              className={`text-lg sm:text-xl font-bold font-devanagari mt-0.5 ${isNight ? "text-white" : "text-stone-900"}`}
            >
              {activeName}
            </span>
            {lang !== "en" && active.name !== activeName && (
              <span className={`text-[11px] ${isNight ? "text-slate-400" : "text-stone-500"}`}>
                {active.name}
              </span>
            )}
          </div>

          {/* Timing */}
          <div
            className={`text-xs font-mono font-medium flex flex-col sm:items-end ${isNight ? "text-slate-300" : "text-stone-600"}`}
          >
            {active.starts && (
              <div>
                {lang === "hi" ? "प्रारंभ:" : "Starts:"} {active.starts}
              </div>
            )}
            {active.ends && (
              <div>
                {lang === "hi" ? "समापन:" : "Ends:"} {active.ends}
              </div>
            )}
            {!active.starts && !active.ends && <div className="italic">{t.throughoutDay}</div>}
          </div>
        </div>

        {/* Nadi Info */}
        {renderNadiCycle(swara)}
        {/* Next Segment */}
        {next && (
          <div
            className={`mt-1.5 pt-2 border-t border-dashed ${isNight ? "border-slate-800" : "border-stone-200"} flex flex-col gap-2`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex flex-col">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${isNight ? "text-slate-400" : "text-stone-500"}`}
                  >
                    {lang === "hi" ? "आने वाला (Next)" : "Upcoming (Next)"}
                  </span>
                  <span className={`text-sm font-bold font-devanagari ${colors.accent}`}>
                    {nextName}
                  </span>
                </div>
              </div>

              <div
                className={`text-[11px] font-mono font-medium flex flex-col sm:items-end ${isNight ? "text-slate-400" : "text-stone-500"}`}
              >
                {next.starts && (
                  <div>
                    {lang === "hi" ? "प्रारंभ:" : "Starts:"} {next.starts}
                  </div>
                )}
                {next.ends && (
                  <div>
                    {lang === "hi" ? "समापन:" : "Ends:"} {next.ends}
                  </div>
                )}
              </div>
            </div>

            {nextSwara && renderNadiCycle(nextSwara, lang === "hi" ? "आगामी" : "Upcoming")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden ${isNight ? "bg-[#1A1F36] border-indigo-900/40" : "bg-stone-50/50 border-stone-200"}`}
    >
      <div
        className={`p-4 border-b ${isNight ? "border-indigo-900/40 bg-[#121629]" : "border-stone-200 bg-white"}`}
      >
        <h2
          className={`text-lg font-black uppercase tracking-wider ${isNight ? "text-amber-200" : "text-amber-900"} flex items-center gap-2`}
        >
          <div className={`p-1.5 rounded-lg ${isNight ? "bg-amber-900/40" : "bg-amber-100"}`}>
            <Star className="w-4 h-4" />
          </div>
          {lang === "hi" ? "पंचांग के ५ अंग" : "The 5 Angas (Limbs)"}
        </h2>
        <p className={`text-xs mt-1 font-medium ${isNight ? "text-slate-400" : "text-stone-500"}`}>
          {lang === "hi"
            ? "वार, तिथि, नक्षत्र, योग और करण का वर्तमान एवं आगामी विवरण।"
            : "Current and upcoming states for Vaara, Tithi, Nakshatra, Yoga, and Karana."}
        </p>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-3">
        <VaaraRow />
        <AngaRow
          index={2}
          title={lang === "hi" ? "तिथि (Lunar Day)" : "Tithi (Lunar Day)"}
          icon={Moon}
          segments={data.tithi}
          localizeFn={(num, raw, l) => getLocalizedTithi(num, l)}
          color="indigo"
          angaType="tithi"
        />
        <AngaRow
          index={3}
          title={lang === "hi" ? "नक्षत्र (Lunar Mansion)" : "Nakshatra (Lunar Mansion)"}
          icon={Star}
          segments={data.nakshatra}
          localizeFn={(num, raw, l) => getLocalizedNakshatra(num, raw, l)}
          color="rose"
          angaType="nakshatra"
        />
        <AngaRow
          index={4}
          title={lang === "hi" ? "योग (Luni-Solar Day)" : "Yoga (Luni-Solar Day)"}
          icon={Activity}
          segments={data.yoga}
          localizeFn={(num, raw, l) => getLocalizedYoga(num, raw, l)}
          color="cyan"
        />
        <AngaRow
          index={5}
          title={lang === "hi" ? "करण (Half Lunar Day)" : "Karana (Half Lunar Day)"}
          icon={CircleDashed}
          segments={data.karana}
          localizeFn={(num, raw, l) => getLocalizedKarana(num, raw, l)}
          color="purple"
        />
      </div>
    </div>
  );
};
