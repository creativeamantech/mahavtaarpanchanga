import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sun,
  Moon,
  Clock,
  Wind,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
  ArrowRight,
  Radio,
  Flame,
  Globe,
  Bell,
  LocateFixed,
} from "lucide-react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { Language } from "../i18n";
import { translations } from "../i18n";
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

  // 2. High-precision live ticker updating nowMs every second (without astronomical recalculation)
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

  // Refs for auto-scroll and jump-to-now
  const nowMarkerRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef<boolean>(false);

  // Auto-scroll to current time marker on initial load if viewing today
  useEffect(() => {
    if (schedule.isToday && nowMarkerRef.current && !hasAutoScrolledRef.current) {
      setTimeout(() => {
        nowMarkerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        hasAutoScrolledRef.current = true;
      }, 400);
    }
  }, [schedule.isToday]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* --------------------------------------------------------------------- */}
      {/* HEADER: Date, Location, Timezone, Sunrise, Sunset, Date Navigator   */}
      {/* --------------------------------------------------------------------- */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-sm transition-all ${
          isNight
            ? "bg-slate-900/90 border-slate-800 text-slate-100"
            : "bg-white/90 border-amber-200/70 text-stone-900"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 font-devanagari">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                {lang === "hi"
                  ? "दैनिक समय-सारणी"
                  : lang === "sa"
                    ? "अद्यतन-समयसारणी"
                    : "Today Schedule"}
              </span>

              {schedule.isToday ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  LIVE NOW
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                  {lang === "hi" ? "ऐतिहासिक / भावी दिवस" : "Scheduled Day"}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-serif-vedic tracking-tight">
              {data.vaara} · {data.date}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-2">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                {data.city}
              </span>
              <span>•</span>
              <span>{schedule.timeZone}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Sun className="w-3.5 h-3.5" />
                {data.sunrise}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-700 font-medium">
                <Moon className="w-3.5 h-3.5" />
                {data.sunset}
              </span>
            </div>
          </div>

          {/* Date Navigator Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => handleShiftDate(-1)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {!schedule.isToday && (
              <button
                onClick={handleGoToday}
                className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <LocateFixed className="w-3.5 h-3.5 text-amber-700" />
                {lang === "hi" ? "आज" : "Today"}
              </button>
            )}

            <button
              onClick={() => handleShiftDate(1)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              title="Next Day"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {schedule.isToday && (
              <button
                onClick={handleJumpToNow}
                className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ml-1"
                title="Scroll to current time"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Jump to Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* LIVE NOW CARD (Only active and displayed when date is Today)           */}
      {/* --------------------------------------------------------------------- */}
      {schedule.isToday && (
        <div
          id="live-now-card"
          className={`rounded-2xl p-6 sm:p-8 border shadow-md relative overflow-hidden transition-all ${
            isNight
              ? "bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-indigo-800/60"
              : "bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-orange-500/10 border-amber-300"
          }`}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300 font-devanagari flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                {lang === "hi"
                  ? "वर्तमान स्थिति (LIVE NOW)"
                  : lang === "sa"
                    ? "वर्तमान-खगोलीयस्थितिः"
                    : "Live Cosmic State"}
              </h2>
            </div>

            {/* Next upcoming event countdown */}
            {liveState.nextUpcomingEvent && liveState.nextEventRemainingMs != null && (
              <div className="flex items-center gap-2 text-xs bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 shadow-2xs">
                <span className="text-stone-500">Next:</span>
                <span className="font-bold text-stone-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">
                  {liveState.nextUpcomingEvent.title}
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  in {formatCountdown(liveState.nextEventRemainingMs)}
                </span>
              </div>
            )}
          </div>

          {/* Core Grid: Hora & Tattva (5-Tattva Proportional Micro-period) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Active Hora & Active Hora-Tattva */}
            <div className="rounded-xl border border-amber-200/80 bg-white/90 dark:bg-slate-900/80 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Active Planetary Hora
                  </div>
                  <div className="text-2xl font-black font-serif-vedic text-stone-900 dark:text-white mt-0.5">
                    {liveState.horaState?.hora
                      ? `${liveState.horaState.hora.ruler} Hora`
                      : "Calculating Hora..."}
                  </div>
                  {liveState.horaState?.hora && (
                    <div className="text-xs text-stone-500 mt-1">
                      {liveState.horaState.hora.startTime} — {liveState.horaState.hora.endTime} ·{" "}
                      {liveState.horaState.hora.isDay ? "Daytime" : "Nighttime"} #
                      {liveState.horaState.hora.index}
                    </div>
                  )}
                </div>

                {liveState.horaState?.horaRemainingMs != null && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-stone-400">
                      Hora Remaining
                    </div>
                    <div className="text-lg font-black font-mono text-indigo-700 dark:text-indigo-400">
                      {formatCountdown(liveState.horaState.horaRemainingMs)}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Hora Tattva Micro-Period */}
              {liveState.horaState?.activeTattva && (
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Active Hora Tattva (Micro-period)
                      </div>
                      <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
                        {liveState.horaState.activeTattva.sanskrit} (
                        {liveState.horaState.activeTattva.name})
                      </div>
                      <div className="text-xs text-stone-500">
                        {liveState.horaState.activeTattva.startTime} —{" "}
                        {liveState.horaState.activeTattva.endTime}
                      </div>
                    </div>

                    {liveState.horaState.tattvaRemainingMs != null && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-stone-400">
                          Tattva Remaining
                        </div>
                        <div className="text-base font-black font-mono text-purple-700 dark:text-purple-400">
                          {formatCountdown(liveState.horaState.tattvaRemainingMs)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Swara, Nadi & Panchanga Highlights */}
            <div className="rounded-xl border border-cyan-200/80 bg-white/90 dark:bg-slate-900/80 p-5 shadow-xs space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-600" />
                Active Breathing Current (Shiva Swarodaya)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-cyan-50/70 dark:bg-slate-800/60 border border-cyan-100 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-400">
                    Active Nadi
                  </div>
                  <div className="text-sm font-black text-stone-900 dark:text-white mt-0.5 capitalize">
                    {liveState.currentNadi?.metadata?.nadi ||
                    liveState.horaState?.hora?.nadi === "ida"
                      ? "Ida (Chandra / Left)"
                      : "Pingala (Surya / Right)"}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {String(liveState.currentNadi?.metadata?.nostril ?? "Inflow nostril")}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-purple-50/70 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400">
                    Swara Tattva
                  </div>
                  <div className="text-sm font-black text-stone-900 dark:text-white mt-0.5">
                    {liveState.currentSwaraTattva?.title?.replace("Swara ", "") ||
                      "Prithvi (Earth)"}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Swarodaya element</div>
                </div>
              </div>

              {/* Panchanga Core Badges */}
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
                {liveState.currentTithi && (
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                    Tithi: {liveState.currentTithi.title.split("(")[0]}
                  </span>
                )}
                {liveState.currentNakshatra && (
                  <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium">
                    Nakshatra: {liveState.currentNakshatra.title.split("(")[0]}
                  </span>
                )}
                {liveState.activeMuhurtas.length > 0 && (
                  <span
                    className={`px-2.5 py-1 rounded-md font-bold ${
                      liveState.activeMuhurtas.some((m) => m.auspiciousness === "inauspicious")
                        ? "bg-rose-100 border border-rose-200 text-rose-900"
                        : "bg-emerald-100 border border-emerald-200 text-emerald-900"
                    }`}
                  >
                    Active: {liveState.activeMuhurtas[0].title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* FILTER TABS & SEARCH BAR                                              */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            All Events ({schedule.counts.total})
          </button>

          <button
            onClick={() => setSelectedCategory("hora")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === "hora"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900"
            }`}
          >
            Horas & Tattvas ({schedule.counts.hora})
          </button>

          <button
            onClick={() => setSelectedCategory("swara")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === "swara"
                ? "bg-cyan-600 text-white shadow-xs"
                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-900"
            }`}
          >
            Swara & Nadi ({schedule.counts.swara})
          </button>

          <button
            onClick={() => setSelectedCategory("muhurta")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === "muhurta"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900"
            }`}
          >
            Muhurtas ({schedule.counts.muhurta})
          </button>

          <button
            onClick={() => setSelectedCategory("panchanga")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === "panchanga"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100 text-amber-900"
            }`}
          >
            Panchanga ({schedule.counts.panchanga})
          </button>

          <button
            onClick={() => setSelectedCategory("astronomical")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedCategory === "astronomical"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-orange-50 hover:bg-orange-100 text-orange-900"
            }`}
          >
            Sun & Moon ({schedule.counts.astronomical})
          </button>

          {schedule.counts.planetary > 0 && (
            <button
              onClick={() => setSelectedCategory("planetary")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === "planetary"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-900"
              }`}
            >
              Planets ({schedule.counts.planetary})
            </button>
          )}

          {schedule.counts.calendar > 0 && (
            <button
              onClick={() => setSelectedCategory("calendar")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === "calendar"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-900"
              }`}
            >
              Festivals ({schedule.counts.calendar})
            </button>
          )}
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 ml-auto"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notification Alerts</span>
          </button>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* CHRONOLOGICAL TIMELINE STREAM                                         */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative pl-4 sm:pl-8 border-l-2 border-amber-200/60 dark:border-slate-800 space-y-6">
        {groupedSlots.map((slot, sIdx) => {
          const isSlotActive = slot.events.some((e) => e.isCurrent);
          const isMultiple = slot.events.length > 1;
          const slotKey = `slot-${slot.startTimeMs}`;
          const isSlotCollapsed = collapsedSlots[slotKey] ?? false;

          // Render live now marker if current time falls right before this slot
          const showNowMarkerBeforeThis = sIdx === nowInsertionIndex;

          return (
            <React.Fragment key={slot.startTimeMs}>
              {/* Chronological NOW Marker */}
              {showNowMarkerBeforeThis && (
                <div
                  ref={nowMarkerRef}
                  className="relative -ml-[25px] sm:-ml-[41px] my-6 flex items-center gap-3 z-20 animate-pulse"
                >
                  <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_10px_rgba(244,63,94,0.8)] shrink-0" />
                  <div className="h-0.5 bg-rose-500 flex-1 shadow-xs" />
                  <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    NOW ·{" "}
                    {new Date(nowMs).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <div className="h-0.5 bg-rose-500 w-8" />
                </div>
              )}

              {/* Time slot anchor & timeline dot */}
              <div className="relative group">
                <div
                  className={`absolute -left-[23px] sm:-left-[39px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 ${
                    isSlotActive
                      ? "bg-emerald-500 border-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : "bg-white border-amber-400 dark:bg-slate-900"
                  }`}
                />

                {/* Same-time Grouping Header (If multiple simultaneous events) */}
                {isMultiple ? (
                  <div className="mb-3 flex items-center justify-between bg-stone-100/80 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      <span className="text-xs font-black text-stone-900 dark:text-white">
                        {slot.events[0].formattedStart ||
                          new Date(slot.startTimeMs).toLocaleTimeString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/80 text-amber-950">
                        {slot.events.length} simultaneous events
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCollapsedSlots((prev) => ({ ...prev, [slotKey]: !isSlotCollapsed }))
                      }
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                    >
                      {isSlotCollapsed ? (
                        <>
                          Show details <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Collapse <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                ) : null}

                {/* Event Cards inside this time slot */}
                {(!isMultiple || !isSlotCollapsed) && (
                  <div className="space-y-3">
                    {slot.events.map((ev) => {
                      const isExpanded = expandedEventId === ev.id;
                      const hasHoraTattvas =
                        ev.type === "hora" &&
                        ev.metadata?.tattvas &&
                        Array.isArray(ev.metadata.tattvas);

                      return (
                        <div
                          key={ev.id}
                          className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                            ev.isCurrent
                              ? "border-emerald-400 bg-emerald-50/20 shadow-md ring-1 ring-emerald-400/40"
                              : isNight
                                ? "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                                : "bg-white/80 border-stone-200/80 hover:border-amber-300 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              {/* Meta Badge Row */}
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                {/* Time Range */}
                                <span className="text-xs font-bold text-stone-900 dark:text-white font-mono">
                                  {ev.formattedRange}
                                </span>

                                {ev.durationMs ? (
                                  <span className="text-[11px] text-stone-500">
                                    ({Math.round(ev.durationMs / 60000)} min)
                                  </span>
                                ) : null}

                                {/* Engine Source Tag */}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                                  {ev.source}
                                </span>

                                {/* Auspiciousness Badge */}
                                {ev.auspiciousness && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      ev.auspiciousness === "auspicious"
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                        : "bg-rose-100 text-rose-800 border border-rose-200"
                                    }`}
                                  >
                                    {ev.auspiciousness}
                                  </span>
                                )}

                                {/* Overlap Alert */}
                                {ev.hasOverlap && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    Overlapping Tithi
                                  </span>
                                )}

                                {/* Live Now status pill */}
                                {ev.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-2xs animate-pulse">
                                    ACTIVE NOW
                                  </span>
                                )}
                              </div>

                              {/* Event Title & Subtitle */}
                              <h3 className="text-base font-black text-stone-900 dark:text-white font-serif-vedic">
                                {ev.title}
                              </h3>

                              {ev.subtitle && (
                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                                  {ev.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Details Toggle Button */}
                            <button
                              type="button"
                              onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <span className="hidden sm:inline">Less</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span className="hidden sm:inline">Details</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>

                          {/* Expandable Section */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                              {/* 5-Tattva Breakdown for Hora Events */}
                              {hasHoraTattvas && (
                                <div className="space-y-2">
                                  <div className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                                    Pancha-Tattva Micro-Period Sequence (Proportional Scaling)
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                    {(ev.metadata?.tattvas as any[]).map((tp, idx) => {
                                      const isTattvaActive =
                                        schedule.isToday &&
                                        nowMs >= tp.startTimeMs &&
                                        nowMs < tp.endTimeMs;

                                      return (
                                        <div
                                          key={tp.sanskrit + idx}
                                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                                            isTattvaActive
                                              ? "border-purple-400 bg-purple-100 text-purple-950 font-bold ring-2 ring-purple-400/50"
                                              : "border-stone-200 bg-stone-50/60 text-stone-700"
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold">{tp.sanskrit}</span>
                                            {isTattvaActive && (
                                              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                                            )}
                                          </div>
                                          <div className="text-[11px] text-stone-500 mt-0.5">
                                            {tp.name}
                                          </div>
                                          <div className="text-[10px] font-mono mt-1 text-stone-600 font-medium">
                                            {tp.startTime} – {tp.endTime}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Tithi-Swara Details */}
                              {ev.type.startsWith("tithi-swara") && (
                                <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs space-y-1">
                                  <div className="font-bold text-sky-950 dark:text-sky-200">
                                    Classical Swarodaya 30-Tithi Rule
                                  </div>
                                  <div className="text-stone-600 dark:text-stone-300">
                                    Tithi: <strong>{String(ev.metadata?.tithiName)}</strong> · Nadi:{" "}
                                    <strong>
                                      {String(ev.metadata?.nadiLabel || ev.metadata?.nadi)}
                                    </strong>
                                    . The 1-hour window transitions the respiratory prana current
                                    for spiritual harmony.
                                  </div>
                                </div>
                              )}

                              {/* General Metadata display */}
                              <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
                                <div>
                                  <strong>Exact Start:</strong> {ev.formattedStart}
                                </div>
                                {ev.formattedEnd && (
                                  <div>
                                    <strong>Exact End:</strong> {ev.formattedEnd}
                                  </div>
                                )}
                                <div>
                                  <strong>ID:</strong>{" "}
                                  <code className="text-[10px] bg-stone-100 px-1 py-0.5 rounded">
                                    {ev.id}
                                  </code>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* If NOW marker belongs at the very end of today's schedule */}
        {nowInsertionIndex === groupedSlots.length && schedule.isToday && (
          <div
            ref={nowMarkerRef}
            className="relative -ml-[25px] sm:-ml-[41px] my-6 flex items-center gap-3 z-20 animate-pulse"
          >
            <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_10px_rgba(244,63,94,0.8)] shrink-0" />
            <div className="h-0.5 bg-rose-500 flex-1 shadow-xs" />
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              NOW ·{" "}
              {new Date(nowMs).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <div className="h-0.5 bg-rose-500 w-8" />
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="py-12 text-center text-stone-500 text-sm">
            No events found for this category filter.
          </div>
        )}
      </div>
    </div>
  );
};
