import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sun,
  Moon,
  Clock,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
  Wind,
  Radio,
  Globe,
  Bell,
  LocateFixed,
} from "lucide-react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { TattvaPeriod } from "../horaEngine";
import type { Language } from "../i18n";
import {
  translations,
  getLocalizedTithi,
  getLocalizedNakshatra,
  getLocalizedYoga,
  getLocalizedKarana,
} from "../i18n";
import { normalizeDailySchedule } from "../lib/dailyScheduleNormalizer";
import { resolveLiveCosmicState, formatCountdown } from "../lib/liveCosmicState";
import type {
  DailyScheduleEvent,
  EventCategory,
  UnifiedDailySchedule,
} from "../lib/dailyScheduleModel";

interface TodayScheduleViewProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
  currentDateStr: string;
  onSelectDate: (newDateStr: string) => void;
  onOpenSettings?: () => void;
}

export const TodayScheduleView: React.FC<TodayScheduleViewProps> = ({
  data,
  lang,
  theme = "parchment",
  currentDateStr,
  onSelectDate,
  onOpenSettings,
}) => {
  const isNight = theme === "nightSky";
  const t = translations[lang];

  // 1. Precompute normalized daily schedule once per data update
  const schedule: UnifiedDailySchedule = useMemo(() => {
    return normalizeDailySchedule(data, lang, Date.now());
  }, [data, lang]);

  // 2. High-precision live ticker updating nowMs every second
  const [nowMs, setNowMs] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Resolve real-time cosmic state from the unified stream
  const liveState = useMemo(() => {
    return resolveLiveCosmicState(nowMs, schedule, data);
  }, [nowMs, schedule, data]);

  // 4. UI Filters & Expanded states
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [collapsedSlots, setCollapsedSlots] = useState<Record<string, boolean>>({});
  const [isLiveExpanded, setIsLiveExpanded] = useState<boolean>(false);

  // Refs for auto-scroll and jump-to-now
  const nowMarkerRef = useRef<HTMLDivElement | null>(null);

  const handleJumpToNow = () => {
    nowMarkerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Date Navigation handlers
  const handleShiftDate = (days: number) => {
    const parts = currentDateStr.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      const cur = new Date(y, m - 1, d);
      cur.setDate(cur.getDate() + days);
      const newD = String(cur.getDate()).padStart(2, "0");
      const newM = String(cur.getMonth() + 1).padStart(2, "0");
      const newY = cur.getFullYear();
      onSelectDate(`${newD}/${newM}/${newY}`);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    onSelectDate(`${d}/${m}/${y}`);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === "all") return schedule.events;
    return schedule.events.filter((e) => e.category === selectedCategory);
  }, [schedule.events, selectedCategory]);

  // Group events by startTimeMs for same-time event grouping
  const groupedSlots = useMemo(() => {
    const groups = new Map<number, DailyScheduleEvent[]>();
    filteredEvents.forEach((e) => {
      const list = groups.get(e.startTimeMs);
      if (list) {
        list.push(e);
      } else {
        groups.set(e.startTimeMs, [e]);
      }
    });
    return Array.from(groups.entries()).map(([ts, slotEvents]) => ({
      startTimeMs: ts,
      events: slotEvents,
    }));
  }, [filteredEvents]);

  // Find index where the "NOW" marker should appear chronologically
  const nowInsertionIndex = useMemo(() => {
    if (!schedule.isToday) return -1;
    for (let i = 0; i < groupedSlots.length; i++) {
      if (nowMs < groupedSlots[i].startTimeMs) {
        return i;
      }
    }
    return groupedSlots.length;
  }, [groupedSlots, nowMs, schedule.isToday]);

  // Format slot time for mobile gutter (separate time and period)
  const formatSlotTime = (ms: number, tz: string) => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).formatToParts(new Date(ms));
      const hour = parts.find((p) => p.type === "hour")?.value || "";
      const minute = parts.find((p) => p.type === "minute")?.value || "";
      const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value || "";
      return {
        time: `${hour}:${minute}`,
        period: dayPeriod,
      };
    } catch {
      const d = new Date(ms);
      return {
        time: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        period: "",
      };
    }
  };

  // Visual styling accents per event category
  const getCategoryStyles = (category: EventCategory, auspiciousness?: string) => {
    if (auspiciousness === "auspicious") {
      return {
        borderAccent: "border-l-emerald-500",
        badge: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300",
        label: lang === "hi" ? "शुभ" : "Auspicious",
      };
    }
    if (auspiciousness === "inauspicious") {
      return {
        borderAccent: "border-l-rose-500",
        badge: "bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300",
        label: lang === "hi" ? "अशुभ" : "Inauspicious",
      };
    }
    switch (category) {
      case "hora":
        return {
          borderAccent: "border-l-indigo-500",
          badge: "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300",
          label: "Hora",
        };
      case "swara":
        return {
          borderAccent: "border-l-cyan-500",
          badge: "bg-cyan-100 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-300",
          label: "Swara",
        };
      case "panchanga":
        return {
          borderAccent: "border-l-amber-500",
          badge: "bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300",
          label: "Panchanga",
        };
      case "astronomical":
        return {
          borderAccent: "border-l-orange-500",
          badge: "bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-300",
          label: "Astronomy",
        };
      case "planetary":
        return {
          borderAccent: "border-l-purple-500",
          badge: "bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300",
          label: "Planetary",
        };
      case "calendar":
        return {
          borderAccent: "border-l-pink-500",
          badge: "bg-pink-100 dark:bg-pink-950/70 text-pink-900 dark:text-pink-300",
          label: "Festival",
        };
      default:
        return {
          borderAccent: "border-l-stone-400",
          badge: "bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300",
          label: "Event",
        };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto px-1 sm:px-2">
      {/* --------------------------------------------------------------------- */}
      {/* 1. COMPACT HEADER: Date, Astronomy Strip & Navigator                  */}
      {/* --------------------------------------------------------------------- */}
      <div
        className={`rounded-2xl p-3.5 sm:p-5 border shadow-xs transition-all ${
          isNight
            ? "bg-[#12182B] border-indigo-900/40 text-slate-100"
            : "bg-white border-[#E4E2DD] text-stone-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Cosmic Metrics */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 font-devanagari">
                <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                {lang === "hi" ? "दैनिक समय-सारणी" : "Today Schedule"}
              </span>

              {schedule.isToday ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE NOW
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700">
                  {lang === "hi" ? "नियत दिवस" : "Scheduled Day"}
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-black font-serif-vedic tracking-tight truncate">
              {data.vaara} · {data.date}
            </h1>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-600" />
                <span className="truncate max-w-[110px] sm:max-w-none">{data.city}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                <Sun className="w-3 h-3" />
                {data.sunrise}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-medium">
                <Moon className="w-3 h-3" />
                {data.sunset}
              </span>
            </div>
          </div>

          {/* Date Navigator Controls */}
          <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-semibold flex items-center transition-colors shadow-2xs"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {!schedule.isToday && (
              <button
                type="button"
                onClick={handleGoToday}
                className="px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <LocateFixed className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>{lang === "hi" ? "आज" : "Today"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-semibold flex items-center transition-colors shadow-2xs"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {schedule.isToday && (
              <button
                type="button"
                onClick={handleJumpToNow}
                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-950 dark:text-indigo-200 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs ml-0.5"
                title="Jump to current time in timeline"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span className="hidden xs:inline">Now</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. COMPACT LIVE NOW BAR (Streamlined for mobile screens 320-430px)     */}
      {/* --------------------------------------------------------------------- */}
      {schedule.isToday && (
        <div
          id="live-now-card"
          className={`rounded-2xl border shadow-xs transition-all overflow-hidden ${
            isNight
              ? "bg-gradient-to-br from-[#12182B] to-[#171A38] border-indigo-900/50"
              : "bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border-amber-200"
          }`}
        >
          <div className="p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-2.5 w-2.5 relative shrink-0 mt-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-devanagari flex items-center gap-1.5 leading-none">
                      <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                      {liveState.horaState?.hora
                        ? `${liveState.horaState.hora.ruler} Hora`
                        : "Live Cosmic State"}
                    </span>
                    {liveState.horaState?.horaRemainingMs != null && (
                      <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {formatCountdown(liveState.horaState.horaRemainingMs)} left
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-600 dark:text-slate-300 mt-1.5 truncate">
                    <strong className="text-stone-900 dark:text-white">
                      {liveState.currentTithi?.title?.split("(")[0]?.trim() || data.tithi?.[0]?.name}
                    </strong>
                    {" · "}
                    <span>
                      {liveState.currentNakshatra?.title?.split("(")[0]?.trim() ||
                        data.nakshatra?.[0]?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Tattva & Nadi */}
            {liveState.horaState?.activeTattva && liveState.horaState?.hora && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 text-sm">
                <div className="flex items-center gap-2 flex-1 border-b sm:border-b-0 sm:border-r border-purple-200/50 dark:border-purple-800/30 pb-2 sm:pb-0 sm:pr-3">
                  <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    {lang === "hi" ? "सक्रिय नाड़ी: " : "Active Nadi: "}
                    {liveState.horaState.hora.nadi === "ida" ? (lang === "hi" ? "चन्द्र (इड़ा)" : "Lunar (Ida)") :
                     liveState.horaState.hora.nadi === "pingala" ? (lang === "hi" ? "सूर्य (पिंगला)" : "Solar (Pingala)") :
                     (lang === "hi" ? "सुषुम्ना" : "Sushumna")}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-purple-900 dark:text-purple-200">
                      {lang === "hi" ? "सक्रिय तत्त्व: " : "Active Tattva: "} 
                      {liveState.horaState.activeTattva.sanskrit} ({liveState.horaState.activeTattva.name})
                    </span>
                  </div>
                  {liveState.horaState.tattvaRemainingMs != null && (
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-300 ml-2">
                      {formatCountdown(liveState.horaState.tattvaRemainingMs)} left
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* Tithi */}
              <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/70 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                  {lang === "hi" ? "तिथि" : "Tithi"}
                </div>
                <div className="font-bold text-stone-900 dark:text-white truncate">
                  {liveState.currentTithi?.title?.split("(")[0]?.trim() ||
                    (data.tithi?.[0] ? getLocalizedTithi(data.tithi[0].number || 1, lang) : "—")}
                </div>
              </div>
              {/* Nakshatra */}
              <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-200/70 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 mb-0.5">
                  {lang === "hi" ? "नक्षत्र" : "Nakshatra"}
                </div>
                <div className="font-bold text-stone-900 dark:text-white truncate">
                  {liveState.currentNakshatra?.title?.split("(")[0]?.trim() ||
                    (data.nakshatra?.[0]
                      ? getLocalizedNakshatra(
                          data.nakshatra[0].number || 1,
                          data.nakshatra[0].name,
                          lang,
                        )
                      : "—")}
                </div>
              </div>
              {/* Yoga */}
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                  {lang === "hi" ? "योग" : "Yoga"}
                </div>
                <div className="font-bold text-stone-900 dark:text-white truncate">
                  {liveState.currentYoga?.title?.split("(")[0]?.trim() ||
                    (data.yoga?.[0]
                      ? getLocalizedYoga(data.yoga[0].number || 1, data.yoga[0].name, lang)
                      : "—")}
                </div>
              </div>
              {/* Karana */}
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                  {lang === "hi" ? "करण" : "Karana"}
                </div>
                <div className="font-bold text-stone-900 dark:text-white truncate">
                  {liveState.currentKarana?.title?.split("(")[0]?.trim() ||
                    (data.karana?.[0]
                      ? getLocalizedKarana(data.karana[0].number || 1, data.karana[0].name, lang)
                      : "—")}
                </div>
              </div>
            </div>

            {/* Active Muhurtas */}
            {liveState.activeMuhurtas.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs pt-1">
                {liveState.activeMuhurtas.map((m) => (
                  <span
                    key={m.id}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm ${
                      m.auspiciousness === "inauspicious"
                        ? "bg-rose-100 border border-rose-200 text-rose-900"
                        : "bg-emerald-100 border border-emerald-200 text-emerald-900"
                    }`}
                  >
                    {lang === "hi" ? "सक्रिय: " : "Active: "} {m.title}
                  </span>
                ))}
              </div>
            )}

            {/* Next event countdown */}
            {liveState.nextUpcomingEvent && liveState.nextEventRemainingMs != null && (
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm pt-3 border-t border-stone-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 dark:text-slate-400 font-medium">{lang === "hi" ? "आने वाला समय (Next):" : "Upcoming (Next):"}</span>
                  <span className="font-bold text-stone-800 dark:text-slate-200">
                    {liveState.nextUpcomingEvent.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded border border-amber-200/50 dark:border-amber-800/50 self-start sm:self-auto">
                  <span>{lang === "hi" ? "शुरू होने में:" : "Starts in:"}</span>
                  <span>{formatCountdown(liveState.nextEventRemainingMs)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* --------------------------------------------------------------------- */}
      {/* 3. COMPACT CATEGORY PILLS BAR                                         */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 dark:border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto cat-nav-scroll py-1 w-full">
          {(
            [
              { id: "all", label: "All", count: schedule.counts.total },
              { id: "hora", label: "Horas", count: schedule.counts.hora },
              { id: "swara", label: "Swara", count: schedule.counts.swara },
              { id: "muhurta", label: "Muhurtas", count: schedule.counts.muhurta },
              { id: "panchanga", label: "Panchanga", count: schedule.counts.panchanga },
              { id: "astronomical", label: "Sun/Moon", count: schedule.counts.astronomical },
              ...(schedule.counts.planetary > 0
                ? [
                    {
                      id: "planetary",
                      label: "Planets",
                      count: schedule.counts.planetary,
                    },
                  ]
                : []),
              ...(schedule.counts.calendar > 0
                ? [
                    {
                      id: "calendar",
                      label: "Festivals",
                      count: schedule.counts.calendar,
                    },
                  ]
                : []),
            ] as { id: EventCategory; label: string; count: number }[]
          ).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? isNight
                      ? "bg-[#F0C96A] text-[#12182B] shadow-2xs"
                      : "bg-[#D4680A] text-white shadow-2xs"
                    : isNight
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span>{cat.label}</span>
                <span className="opacity-75 text-[10px]">({cat.count})</span>
              </button>
            );
          })}
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-md shrink-0"
            title="Notification Alerts"
            aria-label="Notification Alerts"
          >
            <Bell className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. VERTICAL AGENDA STREAM (Optimized for 320-430px mobile devices)    */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-3 sm:space-y-4">
        {filteredEvents.map((ev, eIdx) => {
          const isExpanded = expandedEventId === ev.id;
          const styles = getCategoryStyles(ev.category, ev.auspiciousness);
          const hasHoraTattvas = ev.type === "hora" && Array.isArray(ev.metadata?.tattvas);
          
          const startTimeStr = new Date(ev.startTimeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          const endTimeStr = ev.endTimeMs ? new Date(ev.endTimeMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "";

          // Show the exact current time marker if we are scrolling past the current active moment
          const isFirstActive = ev.isCurrent && (eIdx === 0 || !filteredEvents[eIdx - 1].isCurrent);

          return (
            <React.Fragment key={`${ev.id}-${ev.startTimeMs}`}>
              {isFirstActive && schedule.isToday && (
                <div ref={nowMarkerRef} id="agenda-now-marker" className="flex items-center gap-3 py-2 my-2 select-none">
                  <div className="h-0.5 flex-1 bg-emerald-500/50 rounded-full" />
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm animate-pulse flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {lang === "hi" ? "वर्तमान समय" : "CURRENT TIME"}
                  </span>
                  <div className="h-0.5 flex-1 bg-emerald-500/50 rounded-full" />
                </div>
              )}

              <div 
                className={`vedic-card rounded-xl border p-4 transition-all shadow-sm ${styles.borderAccent} ${
                  ev.isCurrent
                    ? "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md"
                    : isNight
                      ? "bg-[#12182B] border-indigo-900/40 hover:border-indigo-800"
                      : "bg-white border-[#E4E2DD] hover:border-amber-300 hover:shadow-md"
                }`}
              >
                {/* Top Row: Category Badge & Timing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-stone-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                      {styles.label}
                    </span>
                    
                    {ev.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                        {lang === "hi" ? "अभी चल रहा है" : "ACTIVE NOW"}
                      </span>
                    )}

                    {ev.hasOverlap && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {lang === "hi" ? "अतिव्यापन (Overlap)" : "Overlap"}
                      </span>
                    )}
                  </div>

                  {/* Big clear time display */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200 bg-stone-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-stone-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
                    <span>{startTimeStr}</span>
                    {endTimeStr && (
                      <>
                        <span className="text-stone-400 mx-1">➔</span>
                        <span>{endTimeStr}</span>
                      </>
                    )}
                    {ev.durationMs ? (
                      <span className="text-stone-400 font-normal ml-1.5 text-[11px]">
                        ({Math.round(ev.durationMs / 60000)}m)
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Event Title & Subtitle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white font-serif-vedic leading-tight">
                      {ev.title}
                    </h4>
                    {ev.subtitle && (
                      <p className="text-xs text-stone-600 dark:text-slate-400 mt-1.5 leading-snug">
                        {ev.subtitle}
                      </p>
                    )}
                  </div>

                  {(hasHoraTattvas || ev.type.startsWith("tithi-swara")) && (
                    <button
                      type="button"
                      onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                      className="p-1.5 rounded-md text-stone-500 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 hover:text-stone-900 dark:hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[11px] font-bold uppercase"
                      title={isExpanded ? "Less Details" : "More Details"}
                    >
                      <span>{isExpanded ? (lang === "hi" ? "कम" : "LESS") : (lang === "hi" ? "विवरण" : "DETAILS")}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-stone-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
                    {hasHoraTattvas && (
                      <div className="space-y-2 bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-purple-600" />
                          {lang === "hi" ? "पंच-तत्त्व सूक्ष्म अनुक्रम (Pancha-Tattva Sequence)" : "Pancha-Tattva Micro-Sequence"}
                        </div>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                          {(ev.metadata?.tattvas as TattvaPeriod[]).map((tp, idx) => {
                            const isTattvaActive = schedule.isToday && nowMs >= tp.startTimeMs && nowMs < tp.endTimeMs;
                            return (
                              <div
                                key={tp.sanskrit + idx}
                                className={`p-2 rounded-lg border transition-all ${
                                  isTattvaActive
                                    ? "border-purple-400 bg-purple-100 dark:bg-purple-900/40 text-purple-950 dark:text-purple-100 font-bold ring-2 ring-purple-400/50 shadow-sm scale-[1.02]"
                                    : "border-stone-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-stone-700 dark:text-slate-300 hover:border-purple-300"
                                }`}
                              >
                                <div className="text-xs font-bold truncate mb-0.5">{tp.sanskrit}</div>
                                <div className="text-[10px] text-stone-500 dark:text-slate-400 truncate font-mono">
                                  {tp.startTime}–{tp.endTime}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {ev.type.startsWith("tithi-swara") && (
                      <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30 text-xs text-stone-700 dark:text-slate-300 flex items-center flex-wrap gap-2">
                        <span className="flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span className="uppercase text-[10px] font-bold text-sky-700 dark:text-sky-300">{lang === "hi" ? "तिथि:" : "Tithi:"}</span>
                          <strong className="text-sky-900 dark:text-sky-100">{String(ev.metadata?.tithiName)}</strong>
                        </span>
                        <span className="text-stone-300 dark:text-slate-600">|</span>
                        <span className="flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="uppercase text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{lang === "hi" ? "नाड़ी:" : "Nadi:"}</span>
                          <strong className="text-emerald-900 dark:text-emerald-100">
                            {String(ev.metadata?.nadiLabel || ev.metadata?.nadi)}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="py-8 text-center text-stone-500 dark:text-slate-400 text-xs">
            {lang === "hi"
              ? "इस श्रेणी के लिए कोई घटना नहीं मिली।"
              : "No events found for this category filter."}
          </div>
        )}
      </div>
    </div>
  );
};
