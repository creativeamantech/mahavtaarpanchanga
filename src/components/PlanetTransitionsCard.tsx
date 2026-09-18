import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRightLeft,
  Sparkles,
  Flame,
  Clock,
  Calendar,
  Compass,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Orbit,
} from "lucide-react";
import type {
  PanchangaResponse,
  PlanetTransitionEvent,
  PlanetTransitStatus,
  AppTheme,
} from "../types";
import {
  type Language,
  translations,
  GRAHA_TRANSLATIONS,
  getLocalizedRasi,
  getLocalizedNakshatra,
} from "../i18n";

interface PlanetTransitionsCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

const GRAHA_THEMES: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  sun: {
    bg: "bg-amber-100/80",
    text: "text-amber-900",
    border: "border-amber-200",
    accent: "bg-amber-500",
  },
  moon: {
    bg: "bg-indigo-100/80",
    text: "text-indigo-900",
    border: "border-indigo-200",
    accent: "bg-indigo-500",
  },
  mars: {
    bg: "bg-rose-100/80",
    text: "text-rose-900",
    border: "border-rose-200",
    accent: "bg-rose-500",
  },
  mercury: {
    bg: "bg-emerald-100/80",
    text: "text-emerald-900",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
  },
  jupiter: {
    bg: "bg-yellow-100/80",
    text: "text-yellow-900",
    border: "border-yellow-200",
    accent: "bg-yellow-500",
  },
  venus: {
    bg: "bg-fuchsia-100/80",
    text: "text-fuchsia-900",
    border: "border-fuchsia-200",
    accent: "bg-fuchsia-500",
  },
  saturn: {
    bg: "bg-slate-200/80",
    text: "text-slate-900",
    border: "border-slate-300",
    accent: "bg-slate-600",
  },
  rahu: {
    bg: "bg-purple-100/80",
    text: "text-purple-900",
    border: "border-purple-200",
    accent: "bg-purple-600",
  },
  ketu: {
    bg: "bg-stone-200/80",
    text: "text-stone-900",
    border: "border-stone-300",
    accent: "bg-stone-600",
  },
};

const GRAHA_THEMES_NIGHT: Record<
  string,
  { bg: string; text: string; border: string; accent: string }
> = {
  sun: {
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-900/60",
    accent: "bg-amber-500",
  },
  moon: {
    bg: "bg-indigo-950/70",
    text: "text-indigo-300",
    border: "border-indigo-900/60",
    accent: "bg-indigo-500",
  },
  mars: {
    bg: "bg-rose-950/70",
    text: "text-rose-300",
    border: "border-rose-900/60",
    accent: "bg-rose-500",
  },
  mercury: {
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    border: "border-emerald-900/60",
    accent: "bg-emerald-500",
  },
  jupiter: {
    bg: "bg-yellow-950/70",
    text: "text-yellow-300",
    border: "border-yellow-900/60",
    accent: "bg-yellow-500",
  },
  venus: {
    bg: "bg-fuchsia-950/70",
    text: "text-fuchsia-300",
    border: "border-fuchsia-900/60",
    accent: "bg-fuchsia-500",
  },
  saturn: {
    bg: "bg-slate-900/80",
    text: "text-slate-300",
    border: "border-slate-800",
    accent: "bg-slate-500",
  },
  rahu: {
    bg: "bg-purple-950/70",
    text: "text-purple-300",
    border: "border-purple-900/60",
    accent: "bg-purple-500",
  },
  ketu: {
    bg: "bg-stone-900/80",
    text: "text-stone-300",
    border: "border-stone-800",
    accent: "bg-stone-500",
  },
};

/**
 * Calculates accurate real-time relative transit status & countdown.
 * Differentiates past events from future countdowns and formats in Hindi/English.
 */
function getLiveTransitStatus(targetDateStrOrMs: string | number, nowMs: number, lang: string) {
  const targetMs =
    typeof targetDateStrOrMs === "number"
      ? targetDateStrOrMs
      : new Date(targetDateStrOrMs).getTime();
  const diffMs = targetMs - nowMs;
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const totalMins = Math.floor(absMs / 60000);
  const totalHours = Math.floor(totalMins / 60);
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const remMins = totalMins % 60;

  if (isPast) {
    if (days === 0) {
      if (totalHours === 0) {
        return {
          isPast: true,
          label: lang === "hi" ? `✓ संपन्न (${remMins} मि. पहले)` : `✓ Completed (${remMins}m ago)`,
          badgeClass:
            "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/90 dark:text-stone-300 dark:border-stone-700",
        };
      }
      return {
        isPast: true,
        label:
          lang === "hi"
            ? `✓ संपन्न (${totalHours} घं. ${remMins} मि. पहले)`
            : `✓ Completed (${totalHours}h ${remMins}m ago)`,
        badgeClass:
          "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/90 dark:text-stone-300 dark:border-stone-700",
      };
    }
    if (days === 1) {
      return {
        isPast: true,
        label: lang === "hi" ? `✓ संपन्न (कल)` : `✓ Completed (yesterday)`,
        badgeClass:
          "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/90 dark:text-stone-300 dark:border-stone-700",
      };
    }
    return {
      isPast: true,
      label: lang === "hi" ? `✓ संपन्न (${days} दिन पहले)` : `✓ Completed (${days}d ago)`,
      badgeClass:
        "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/90 dark:text-stone-300 dark:border-stone-700",
    };
  }

  // Future countdown
  if (days === 0) {
    if (totalHours === 0) {
      return {
        isPast: false,
        label: lang === "hi" ? `⏳ ${remMins} मिनट शेष` : `⏳ in ${remMins}m`,
        badgeClass:
          "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80 font-bold",
      };
    }
    return {
      isPast: false,
      label:
        lang === "hi"
          ? `⏳ ${totalHours} घंटे ${remMins} मिनट शेष`
          : `⏳ in ${totalHours}h ${remMins}m`,
      badgeClass:
        "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/80 font-bold",
    };
  }
  if (days === 1) {
    return {
      isPast: false,
      label: lang === "hi" ? `⏳ कल (${remHours} घं. शेष)` : `⏳ in 1d ${remHours}h`,
      badgeClass:
        "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60 font-semibold",
    };
  }
  return {
    isPast: false,
    label: lang === "hi" ? `⏳ ${days} दिन ${remHours} घंटे शेष` : `⏳ in ${days}d ${remHours}h`,
    badgeClass:
      "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60 font-semibold",
  };
}

export const PlanetTransitionsCard: React.FC<PlanetTransitionsCardProps> = ({
  data,
  lang,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<"cards" | "timeline">("cards");
  const [timelineFilter, setTimelineFilter] = useState<"all" | "rasi" | "nakshatra" | "today">(
    "all",
  );
  const isNight = theme === "nightSky";

  // Dynamic real-time clock: updates every 10 seconds for ticking countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const themeMap = isNight ? GRAHA_THEMES_NIGHT : GRAHA_THEMES;
  const t = translations[lang];
  const transitionsData = data.planet_transitions;

  const planetsList: PlanetTransitStatus[] = useMemo(() => {
    return transitionsData?.planets || [];
  }, [transitionsData]);

  const upcomingEvents: PlanetTransitionEvent[] = useMemo(() => {
    return transitionsData?.upcomingEvents || [];
  }, [transitionsData]);

  const todayEvents: PlanetTransitionEvent[] = useMemo(() => {
    return transitionsData?.todayEvents || [];
  }, [transitionsData]);

  const filteredEvents = useMemo(() => {
    if (timelineFilter === "today") return upcomingEvents.filter((e) => e.isToday);
    if (timelineFilter === "rasi") return upcomingEvents.filter((e) => e.type === "rasi");
    if (timelineFilter === "nakshatra") return upcomingEvents.filter((e) => e.type === "nakshatra");
    return upcomingEvents;
  }, [upcomingEvents, timelineFilter]);

  if (!transitionsData || planetsList.length === 0) {
    return null;
  }

  return (
    <div
      id="planet-transitions-card"
      className={`space-y-6 animate-in fade-in duration-500 transition-colors ${
        isNight ? "text-slate-100" : "text-stone-900"
      }`}
    >
      {/* Section Header with Simple View Switcher */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-3 ${
          isNight ? "border-indigo-900/40" : "border-stone-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${
              isNight
                ? "bg-amber-950/80 text-amber-300 border border-amber-900/60"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h3
              className={`text-base sm:text-lg font-bold font-serif-vedic ${
                isNight ? "text-amber-200" : "text-stone-900"
              }`}
            >
              {lang === "hi"
                ? "ग्रह गोचर एवं राशि संक्रमण"
                : "Planetary Transitions (Graha Gochara)"}
            </h3>
            <p className={`text-xs ${isNight ? "text-slate-400" : "text-stone-500"}`}>
              {lang === "hi"
                ? "सभी नवग्रहों की वर्तमान स्थिति एवं आगामी राशि व नक्षत्र परिवर्तन का सटीक विवरण"
                : "Real-time planetary placements, upcoming sign & nakshatra ingresses"}
            </p>
          </div>
        </div>

        {/* View Switcher: Simplified Cards / Timeline */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex rounded-xl p-1 border text-xs font-semibold ${
              isNight ? "bg-[#12182b] border-indigo-900/60" : "bg-stone-100 border-stone-200"
            }`}
          >
            <button
              type="button"
              id="transitions-view-cards-btn"
              onClick={() => setActiveTab("cards")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "cards"
                  ? isNight
                    ? "bg-indigo-900/70 text-slate-100 font-bold shadow-xs"
                    : "bg-white text-stone-950 font-bold shadow-xs"
                  : isNight
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "ग्रह कार्ड" : "Graha Cards"}</span>
            </button>
            <button
              type="button"
              id="transitions-view-timeline-btn"
              onClick={() => setActiveTab("timeline")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "timeline"
                  ? isNight
                    ? "bg-indigo-900/70 text-amber-300 font-bold shadow-xs"
                    : "bg-white text-amber-950 font-bold shadow-xs"
                  : isNight
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Clock className={`h-3.5 w-3.5 ${isNight ? "text-amber-400" : "text-amber-700"}`} />
              <span>
                {lang === "hi" ? "कालक्रम" : "Timeline"}
                {upcomingEvents.length > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {upcomingEvents.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Ingress Alert Banner */}
      {todayEvents.length > 0 && (
        <div
          id="today-transits-banner"
          className={`rounded-2xl p-4 border transition-all ${
            isNight
              ? "bg-gradient-to-r from-amber-950/30 via-[#182038] to-amber-950/30 border-amber-800/50 text-amber-100"
              : "bg-gradient-to-r from-amber-50 via-amber-100/40 to-amber-50 border-amber-300/80 text-amber-950"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 mt-0.5 shadow-xs ${
                isNight ? "bg-amber-600 text-white" : "bg-amber-500 text-white"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isNight ? "text-amber-200" : "text-amber-950"
                  }`}
                >
                  {lang === "hi" ? "आज के मुख्य ग्रह परिवर्तन" : "Today's Planetary Transitions"}
                </h4>
                <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                  {todayEvents.length} {lang === "hi" ? "परिवर्तन" : "Events"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {todayEvents.map((ev) => {
                  const status = getLiveTransitStatus(ev.timestamp, now, lang);
                  return (
                    <div
                      key={ev.id}
                      className={`flex flex-col justify-between text-xs rounded-xl px-3 py-2 border gap-1.5 ${
                        isNight
                          ? "bg-[#12182b]/80 border-amber-800/40 text-slate-200"
                          : "bg-white/80 border-amber-200/70 text-stone-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-950 font-bold text-xs">
                            {ev.symbol}
                          </span>
                          <span className="font-bold">
                            {lang === "hi" ? ev.sanskritName : ev.planetName}
                          </span>
                          <span className="text-stone-400">→</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {ev.toName || ev.toValue}
                          </span>
                        </div>
                        {ev.specialName && (
                          <span className="rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                            {ev.specialName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-200/40 dark:border-indigo-900/40 font-mono">
                        <span className="text-stone-500 dark:text-slate-400">{ev.timeStr}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: Clean, Simplified Graha Cards */}
      {activeTab === "cards" && (
        <div
          id="planet-transitions-cards-grid"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {planetsList.map((planet) => {
            const grahaInfo = GRAHA_TRANSLATIONS[planet.planetId];
            const grahaLabel = grahaInfo ? grahaInfo[lang] || planet.planetName : planet.planetName;
            const themeStyle = themeMap[planet.planetId] || {
              bg: isNight ? "bg-amber-950/70" : "bg-amber-100/80",
              text: isNight ? "text-amber-300" : "text-amber-900",
              border: isNight ? "border-amber-900/60" : "border-amber-200",
              accent: "bg-amber-500",
            };

            const nextRasi = planet.nextRasiTransit;
            const nextNak = planet.nextNakshatraTransit;

            // Compute live status dynamically for this card
            const rasiStatus = nextRasi
              ? getLiveTransitStatus(nextRasi.timestamp, now, lang)
              : null;
            const nakStatus = nextNak ? getLiveTransitStatus(nextNak.timestamp, now, lang) : null;

            return (
              <div
                key={planet.planetId}
                id={`graha-card-${planet.planetId}`}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-sm ${
                  isNight
                    ? "bg-[#0e1424]/90 border-indigo-900/40 hover:border-indigo-700/70"
                    : "bg-white border-stone-200/90 hover:border-amber-300"
                }`}
              >
                {/* 1. Header: Symbol + Names + Motion Badges */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-indigo-900/40">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${themeStyle.bg} ${themeStyle.text} font-bold text-lg shadow-2xs border ${themeStyle.border}`}
                    >
                      {planet.symbol}
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-base font-devanagari leading-tight ${
                          isNight ? "text-slate-100" : "text-stone-900"
                        }`}
                      >
                        {grahaLabel}
                      </h4>
                      <div
                        className={`text-[11px] font-sans ${
                          isNight ? "text-slate-400" : "text-stone-500"
                        }`}
                      >
                        {planet.planetName} • {planet.sanskritName}
                      </div>
                    </div>
                  </div>

                  {/* Motion Status Pills */}
                  <div className="flex items-center space-x-1.5">
                    {planet.isRetrograde ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          isNight
                            ? "bg-rose-950/80 text-rose-300 border-rose-900/60"
                            : "bg-rose-100 text-rose-900 border-rose-200"
                        }`}
                      >
                        <ArrowDownRight className="mr-0.5 h-3 w-3" />
                        {t.retrograde}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                          isNight
                            ? "bg-slate-800/80 text-slate-300 border-slate-700/60"
                            : "bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        <ArrowUpRight className="mr-0.5 h-3 w-3 text-stone-400" />
                        {t.direct}
                      </span>
                    )}

                    {planet.isCombust && (
                      <span
                        title={`Combust within ${planet.combustDistanceDeg}° of Sun`}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          isNight
                            ? "bg-amber-950/80 text-amber-300 border-amber-900/60"
                            : "bg-amber-100 text-amber-900 border-amber-200"
                        }`}
                      >
                        <Flame className="mr-0.5 h-3 w-3 text-amber-600 dark:text-amber-400" />
                        {t.combust || "Asta"}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Current Position Box */}
                <div
                  className={`rounded-xl p-3 border space-y-1.5 ${
                    isNight
                      ? "bg-[#141b30]/80 border-indigo-900/30"
                      : "bg-stone-50/70 border-stone-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={isNight ? "text-slate-400" : "text-stone-500"}>
                      {lang === "hi" ? "वर्तमान राशि" : "Current Sign"}:
                    </span>
                    <span className="font-bold text-sm font-devanagari text-stone-900 dark:text-slate-100">
                      {planet.currentRasi}{" "}
                      <span className="font-mono text-xs font-normal text-amber-800 dark:text-amber-400">
                        {planet.degreesInRasi}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/40 dark:border-indigo-900/30">
                    <span className={isNight ? "text-slate-400" : "text-stone-500"}>
                      {lang === "hi" ? "नक्षत्र व चरण" : "Nakshatra"}:
                    </span>
                    <span className="font-medium text-xs font-devanagari text-stone-800 dark:text-slate-200">
                      {planet.currentNakshatra}{" "}
                      <span className="text-amber-800 dark:text-amber-400 font-sans">
                        (
                        {lang === "hi" ? `चरण ${planet.currentPada}` : `Pada ${planet.currentPada}`}
                        )
                      </span>
                    </span>
                  </div>
                </div>

                {/* 3. Upcoming Ingress Section */}
                <div
                  className={`rounded-xl p-3 border space-y-2 ${
                    isNight
                      ? "bg-amber-950/20 border-amber-900/40"
                      : "bg-amber-50/40 border-amber-200/70"
                  }`}
                >
                  {nextRasi ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                          <ArrowRightLeft className="h-3 w-3" />
                          {lang === "hi" ? "आगामी राशि गोचर" : "Next Ingress"}
                        </span>
                        {rasiStatus && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] border ${rasiStatus.badgeClass}`}
                          >
                            {rasiStatus.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1.5">
                        <span className="text-sm font-bold font-devanagari text-stone-900 dark:text-slate-100">
                          → {nextRasi.toName || nextRasi.toValue}
                        </span>
                        <div className="text-right text-[11px] font-mono text-stone-600 dark:text-slate-400">
                          <div>{nextRasi.dateStr}</div>
                          <div className="text-[10px] text-stone-500 dark:text-slate-500">
                            {nextRasi.timeStr} ({nextRasi.dayOfWeek})
                          </div>
                        </div>
                      </div>

                      {/* Sankranti & Punya Kala for Sun */}
                      {nextRasi.specialName && (
                        <div
                          className={`mt-2 pt-1.5 border-t text-xs space-y-0.5 ${
                            isNight
                              ? "border-amber-900/40 text-amber-300"
                              : "border-amber-200/70 text-amber-950"
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>{nextRasi.specialName}</span>
                          </div>
                          {nextRasi.punyaKala && (
                            <div className="text-[10px] font-mono text-stone-600 dark:text-slate-400 pl-4">
                              {lang === "hi" ? "पुण्यकाल" : "Puṇyakāla"}: {nextRasi.punyaKala.start}{" "}
                              – {nextRasi.punyaKala.end}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">
                      {lang === "hi"
                        ? "निकट भविष्य में कोई राशि परिवर्तन नहीं"
                        : "No upcoming sign ingress"}
                    </div>
                  )}

                  {/* Next Nakshatra Ingress (Compact One-Liner) */}
                  {nextNak && (
                    <div className="pt-2 border-t border-amber-200/40 dark:border-amber-900/30 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500 dark:text-slate-400">
                        {lang === "hi" ? "आगामी नक्षत्र:" : "Next Nakṣatra:"}
                      </span>
                      <div className="text-right flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 dark:text-slate-200 font-devanagari">
                          → {nextNak.toName || nextNak.toValue}
                        </span>
                        {nakStatus && (
                          <span className="text-[10px] text-stone-500 dark:text-slate-400 font-sans">
                            ({nakStatus.label.replace("✓ ", "").replace("⏳ ", "")})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Clean 60-Day Transit Timeline */}
      {activeTab === "timeline" && (
        <div id="planet-transitions-timeline" className="space-y-4">
          {/* Filters */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border ${
              isNight ? "bg-[#12182b] border-indigo-900/40" : "bg-stone-50/70 border-stone-200"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTimelineFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timelineFilter === "all"
                    ? isNight
                      ? "bg-amber-600 text-white"
                      : "bg-amber-500 text-white"
                    : isNight
                      ? "bg-stone-800 text-slate-300 hover:bg-stone-700"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {lang === "hi" ? "सभी गोचर" : "All"} ({upcomingEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setTimelineFilter("rasi")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timelineFilter === "rasi"
                    ? isNight
                      ? "bg-amber-600 text-white"
                      : "bg-amber-500 text-white"
                    : isNight
                      ? "bg-stone-800 text-slate-300 hover:bg-stone-700"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {lang === "hi" ? "केवल राशि गोचर" : "Rāśi Only"}
              </button>
              <button
                type="button"
                onClick={() => setTimelineFilter("nakshatra")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timelineFilter === "nakshatra"
                    ? isNight
                      ? "bg-amber-600 text-white"
                      : "bg-amber-500 text-white"
                    : isNight
                      ? "bg-stone-800 text-slate-300 hover:bg-stone-700"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {lang === "hi" ? "केवल नक्षत्र गोचर" : "Nakṣatra Only"}
              </button>
              {todayEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTimelineFilter("today")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    timelineFilter === "today"
                      ? isNight
                        ? "bg-amber-600 text-white"
                        : "bg-amber-500 text-white"
                      : isNight
                        ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                        : "bg-amber-100 text-amber-950 border border-amber-300"
                  }`}
                >
                  {lang === "hi" ? "आज के गोचर" : "Today"} ({todayEvents.length})
                </button>
              )}
            </div>

            <div className={`text-xs ${isNight ? "text-slate-400" : "text-stone-500"}`}>
              {lang === "hi" ? "आगामी ६० दिवस का विवरण" : "Next 60 days of planetary movements"}
            </div>
          </div>

          {/* Events Feed */}
          <div className="space-y-2.5">
            {filteredEvents.map((ev) => {
              const themeStyle = themeMap[ev.planetId] || {
                bg: isNight ? "bg-amber-950/70" : "bg-amber-100",
                text: isNight ? "text-amber-300" : "text-amber-900",
                border: isNight ? "border-amber-900/60" : "border-amber-200",
                accent: "bg-amber-500",
              };
              const liveStatus = getLiveTransitStatus(ev.timestamp, now, lang);

              return (
                <div
                  key={ev.id}
                  id={`timeline-event-${ev.id}`}
                  className={`rounded-xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    ev.isToday
                      ? isNight
                        ? "border-amber-700/60 bg-amber-950/20 shadow-xs"
                        : "border-amber-300 bg-amber-50/50 shadow-xs"
                      : isNight
                        ? "border-indigo-900/40 bg-[#0e1424]/60 hover:border-indigo-700/50"
                        : "border-stone-200/80 bg-white hover:border-stone-300"
                  }`}
                >
                  {/* Left: Planet Icon + Ingress Path */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeStyle.bg} ${themeStyle.text} font-bold text-base shadow-2xs border ${themeStyle.border}`}
                    >
                      {ev.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm font-devanagari text-stone-900 dark:text-slate-100">
                          {lang === "hi" ? ev.sanskritName : ev.planetName}
                        </span>
                        <span className="text-stone-400">→</span>
                        <span className="font-bold text-sm font-devanagari text-amber-800 dark:text-amber-300">
                          {ev.toName || ev.toValue}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                            ev.type === "rasi"
                              ? isNight
                                ? "bg-indigo-950/80 text-indigo-300 border border-indigo-900/60"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : isNight
                                ? "bg-stone-800 text-stone-300 border border-stone-700"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                          }`}
                        >
                          {ev.type === "rasi"
                            ? lang === "hi"
                              ? "राशि"
                              : "Rāśi"
                            : lang === "hi"
                              ? "नक्षत्र"
                              : "Nakṣatra"}
                        </span>
                        {ev.isToday && (
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 px-2 py-0.2 text-[10px] font-bold">
                            {lang === "hi" ? "आज" : "TODAY"}
                          </span>
                        )}
                        {ev.specialName && (
                          <span className="rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 px-2 py-0.2 text-[10px] font-bold">
                            {ev.specialName}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-500 dark:text-slate-400 font-mono mt-0.5">
                        {ev.dateStr} • {ev.timeStr} ({ev.dayOfWeek})
                      </div>
                    </div>
                  </div>

                  {/* Right: Real-time Countdown Badge */}
                  <div className="flex items-center sm:justify-end shrink-0 pl-12 sm:pl-0">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold border ${liveStatus.badgeClass}`}
                    >
                      {liveStatus.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
