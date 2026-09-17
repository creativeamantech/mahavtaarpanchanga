import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Droplets,
  Wind,
  Mountain,
  Flame,
  CircleDot,
  Activity,
  CalendarDays,
  Hourglass,
  Layers,
} from "lucide-react";
import {
  getVaraTattva,
  ELEMENT_UI_DATA,
  NADI_UI_DATA,
  VARA_TATTVA_MAPPING,
} from "../lib/varaTattvaEngine";
import {
  computeTithiTattvaPeriods,
  getCanonicalNadiAtTime,
  TithiTattvaPeriod,
} from "../lib/tithiTattvaEngine";

import { resolveCurrentHora } from "../horaEngine";
import {
  getKaranaTattvaCycle,
  getActiveKaranaTattva,
  getKaranaTattvaMaasOverlaps,
  KaranaTattvaCycle,
  KaranaTattvaName,
  KaranaTattvaPeriod,
} from "../lib/karanaTattvaEngine";
import type { PanchangaResponse, AppTheme } from "../types";

const ELEMENT_ICONS: Record<KaranaTattvaName, React.ElementType> = {
  Akasha: CircleDot,
  Vayu: Wind,
  Agni: Flame,
  Prithvi: Mountain,
  Jala: Droplets,
};

const ELEMENT_COLORS: Record<KaranaTattvaName, { bg: string; text: string; border: string }> = {
  Akasha: {
    bg: "bg-indigo-50/80 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  Vayu: {
    bg: "bg-sky-50/80 dark:bg-sky-950/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
  },
  Agni: {
    bg: "bg-rose-50/80 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  Prithvi: {
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  Jala: {
    bg: "bg-cyan-50/80 dark:bg-cyan-950/30",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
  },
};

function formatDuration(ms: number) {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTimeRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function TattvaView({
  panchangaData,
  theme,
  lang,
}: {
  panchangaData: PanchangaResponse;
  theme: AppTheme;
  lang: string;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cycle = useMemo(() => {
    if (!panchangaData) return null;
    const targetMs = panchangaData.sunrise_ms || now;
    const ayanamsa = (panchangaData.ayanamsa_key || "lahiri") as any;
    return getKaranaTattvaCycle(targetMs, ayanamsa);
  }, [panchangaData]);

  const tithiTattvaPeriods = useMemo(() => {
    if (!panchangaData) return [];
    return computeTithiTattvaPeriods(panchangaData);
  }, [panchangaData]);

  const currentTithiTattva = useMemo(() => {
    return (
      tithiTattvaPeriods.find((p) => p.startTime <= now && now < p.endTime) || tithiTattvaPeriods[0]
    );
  }, [tithiTattvaPeriods, now]);

  const currentNadi = useMemo(() => {
    if (!currentTithiTattva) return "ida";
    // Tithi Swara alternates every 60 minutes starting from the Tithi's start time
    const msElapsed = now - currentTithiTattva.startTime;
    const hoursElapsed = Math.floor(msElapsed / (60 * 60 * 1000));
    const isOpposite = (hoursElapsed % 2) !== 0;
    
    if (isOpposite) {
      return currentTithiTattva.startNadi === "ida" ? "pingala" : "ida";
    }
    return currentTithiTattva.startNadi;
  }, [now, currentTithiTattva]);

  const overlaps = useMemo(() => {
    if (!cycle || !panchangaData) return {};
    const ayanamsa = (panchangaData.ayanamsa_key || "lahiri") as any;
    const map: Record<string, any[]> = {};
    for (const p of cycle.periods) {
      map[p.element] = getKaranaTattvaMaasOverlaps(p, ayanamsa);
    }
    return map;
  }, [cycle, panchangaData]);

  if (!cycle)
    return <div className="p-4 text-center text-stone-500">Loading Karana Tattva Data...</div>;

  const activePeriod = getActiveKaranaTattva(now, cycle);

  const varaTattva = panchangaData ? getVaraTattva(panchangaData.weekday) : null;
  const currentLiveHoraData = panchangaData ? resolveCurrentHora(now, panchangaData) : null;
  const activeHora = currentLiveHoraData?.hora || null;
  const activeHoraTattva = currentLiveHoraData?.tattva || null;

  const getHoraTattvaRemaining = () => {
    if (!activeHoraTattva) return null;
    return Math.max(0, activeHoraTattva.endTimeMs - now);
  };

  const cycleLabel =
    cycle.type === "CHAITRA_TO_SHARAD" ? "Chaitra → Sharad" : "Sharad → Next Chaitra";

  return (
    <div className="space-y-6">
      {/* CURRENT STATE OVERVIEW */}
      <div
        className={`p-5 rounded-2xl border ${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}`}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-500" />
          {lang === "hi" ? "वर्तमान तत्व स्थिति" : "Current State"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
              Vara (Weekday)
            </div>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {varaTattva
                ? lang === "hi"
                  ? ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][
                      varaTattva.weekday
                    ]
                  : varaTattva.weekdayName
                : "-"}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Element</div>
                <div className="text-sm font-medium">
                  {varaTattva ? ELEMENT_UI_DATA[varaTattva.element][lang as "en" | "hi"] : "-"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider opacity-70">Nadi</div>
                <div className="text-sm font-medium">
                  {varaTattva ? NADI_UI_DATA[varaTattva.nadi][lang as "en" | "hi"] : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
              Hora Tattva
            </div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {activeHoraTattva ? activeHoraTattva.sanskrit : "-"}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Hora</div>
                <div className="text-sm font-medium">{activeHora ? activeHora.planet : "-"}</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
              Karana Tattva
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {activePeriod ? activePeriod.element : "-"}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Start</div>
                <div className="text-sm font-medium">
                  {activePeriod ? formatDate(activePeriod.startTime) : "-"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider opacity-70">End</div>
                <div className="text-sm font-medium">
                  {activePeriod ? formatDate(activePeriod.endTime) : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VARA ELEMENT & NADI */}
      <div
        className={`p-5 rounded-2xl border ${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}`}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-sky-500" />
          {lang === "hi" ? "वार तत्व एवं नाड़ी" : "Vara Element & Nadi"}
        </h3>
        {varaTattva ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                {lang === "hi" ? "आज का वार" : "Current Vara"}
              </div>
              <div className="text-xl font-bold text-sky-700 dark:text-sky-300">
                {lang === "hi"
                  ? ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][
                      varaTattva.weekday
                    ]
                  : varaTattva.weekdayName}{" "}
                {varaTattva.weekday === 4 && !lang.includes("hi") ? "(Thu)" : ""}
              </div>
            </div>

            <div className="flex gap-8">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  {lang === "hi" ? "तत्व" : "Element"}
                </div>
                <div className="text-lg font-bold">
                  {ELEMENT_UI_DATA[varaTattva.element][lang as "en" | "hi"]}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  {lang === "hi" ? "नाड़ी" : "Nadi"}
                </div>
                <div className="text-lg font-bold">
                  {NADI_UI_DATA[varaTattva.nadi][lang as "en" | "hi"]}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm opacity-70">
            {lang === "hi" ? "जानकारी लोड हो रही है..." : "Loading data..."}
          </div>
        )}
      </div>

      {/* TITHI TATTVA & NADI */}
      <div
        className={`p-5 rounded-2xl border ${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}`}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-fuchsia-500" />
          {lang === "hi" ? "तिथि तत्व एवं नाड़ी" : "Tithi Tattva & Nadi"}
        </h3>

        {currentTithiTattva && (
          <div className="flex gap-4">
            {/* Start Panel */}
            <div className="flex-1 p-4 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-2">
                {lang === "hi" ? "आरंभ" : "Start"}
              </div>
              <div className="font-mono text-sm font-bold mb-3">
                {formatTime(currentTithiTattva.startTime)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "तत्व" : "Start Element"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.startElement}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "नाड़ी" : "Start Nadi"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.startNadi}</span>
                </div>
              </div>
            </div>

            {/* End Panel */}
            <div className="flex-1 p-4 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-2">
                {lang === "hi" ? "समापन" : "End"}
              </div>
              <div className="font-mono text-sm font-bold mb-3">
                {formatTime(currentTithiTattva.endTime)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "तत्व" : "End Element"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.endElement}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "नाड़ी" : "End Nadi"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.endNadi}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tithi Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-stone-200 dark:border-white/10">
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Paksha
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Tithi
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Start Time
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Start Element
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Start Nadi
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  End Time
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  End Element
                </th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">
                  End Nadi
                </th>
              </tr>
            </thead>
            <tbody>
              {tithiTattvaPeriods.map((t, idx) => {
                const isActive = t === currentTithiTattva;
                return (
                  <tr
                    key={idx}
                    className={`border-b last:border-0 border-stone-100 dark:border-white/5 ${isActive ? (theme === "nightSky" ? "bg-fuchsia-900/20" : "bg-fuchsia-50") : ""}`}
                  >
                    <td className="py-2.5 px-3 text-xs font-medium">{t.paksha}</td>
                    <td className="py-2.5 px-3 text-xs font-bold">{t.tithi}</td>
                    <td className="py-2.5 px-3 text-xs font-mono">{formatTime(t.startTime)}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.startElement}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.startNadi}</td>
                    <td className="py-2.5 px-3 text-xs font-mono">{formatTime(t.endTime)}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.endElement}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.endNadi}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* HORA TATTVA */}
      {activeHora && (
        <div
          className={`p-5 rounded-2xl border ${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}`}
        >
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            {lang === "hi" ? "होरा तत्व (वर्तमान)" : "Hora Tattva (Current Hora)"}
          </h3>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-black/20">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                Current Hora
              </div>
              <div className="text-lg font-bold font-serif-vedic">{activeHora.planet}</div>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  Start
                </div>
                <div className="text-sm font-bold">{activeHora.startTime}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  End
                </div>
                <div className="text-sm font-bold">{activeHora.endTime}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">
              Five Tattvas Sequence
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {activeHora.tattvas.map((t, idx) => {
                const isTattvaActive = activeHoraTattva?.sanskrit === t.sanskrit;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${isTattvaActive ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-stone-100 dark:border-white/5"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-sm font-bold ${isTattvaActive ? "text-emerald-700 dark:text-emerald-300" : ""}`}
                      >
                        {t.sanskrit}
                      </span>
                      {isTattvaActive && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-70">{t.name}</div>
                    <div className="text-xs font-mono mt-1">
                      {t.startTime} - {t.endTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* KARANA TATTVA CYCLE */}
      <h3 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2 mt-8 mb-2">
        <Activity className="w-4 h-4 text-amber-600" />
        {lang === "hi" ? "कारण तत्व चक्र" : "Karana Tattva Cycle"}
      </h3>
      <div
        className={`p-5 rounded-2xl border ${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
              Current Cycle
            </h3>
            <div className="text-lg font-bold font-serif-vedic">{cycleLabel}</div>
            <div className="text-xs mt-1 opacity-80">
              {formatDate(cycle.startTime)} — {formatDate(cycle.endTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Active Element */}
      {activePeriod && (
        <div
          className={`p-6 rounded-2xl border ${ELEMENT_COLORS[activePeriod.element].bg} ${ELEMENT_COLORS[activePeriod.element].border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-widest ${ELEMENT_COLORS[activePeriod.element].text}`}
            >
              Active Element
            </span>
          </div>

          <div className="flex items-center gap-4">
            {React.createElement(ELEMENT_ICONS[activePeriod.element], {
              className: `w-10 h-10 ${ELEMENT_COLORS[activePeriod.element].text}`,
            })}
            <div>
              <div className={`text-2xl font-bold ${ELEMENT_COLORS[activePeriod.element].text}`}>
                {activePeriod.element} (आकाश/वायु/अग्नि/पृथ्वी/जल)
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div
              className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 ${ELEMENT_COLORS[activePeriod.element].text}`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                Started
              </div>
              <div className="text-sm font-bold">{formatDate(activePeriod.startTime)}</div>
              <div className="text-xs">{formatTime(activePeriod.startTime)}</div>
            </div>
            <div
              className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 ${ELEMENT_COLORS[activePeriod.element].text}`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                Ends
              </div>
              <div className="text-sm font-bold">{formatDate(activePeriod.endTime)}</div>
              <div className="text-xs">{formatTime(activePeriod.endTime)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Sequence & Maas Correlation */}
      <div
        className={`rounded-2xl border overflow-hidden ${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50" : "bg-white border-stone-200 shadow-sm"}`}
      >
        <div className="p-4 border-b border-stone-100 dark:border-white/5">
          <h3
            className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${theme === "nightSky" ? "text-indigo-300" : "text-indigo-800"}`}
          >
            <Activity className="w-4 h-4" />
            Tattva Sequence & Maas
          </h3>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-white/5">
          {cycle.periods.map((p, idx) => {
            const Icon = ELEMENT_ICONS[p.element];
            const isActive = activePeriod?.element === p.element;
            const elementOverlaps = overlaps[p.element] || [];

            return (
              <div
                key={idx}
                className={`p-4 transition-colors ${isActive ? (theme === "nightSky" ? "bg-indigo-900/20" : "bg-indigo-50/50") : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg mt-1 ${ELEMENT_COLORS[p.element].bg} ${ELEMENT_COLORS[p.element].text}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}`}
                        >
                          {p.element}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-1 mb-3">
                      {formatDate(p.startTime)} — {formatDate(p.endTime)}
                    </div>

                    {/* Maas Overlaps */}
                    {elementOverlaps.length > 0 && (
                      <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-stone-200 dark:border-white/10">
                        {elementOverlaps.map((overlap, oIdx) => (
                          <div key={oIdx} className="flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-1.5 text-stone-600 dark:text-slate-400">
                              <CalendarDays className="w-3 h-3 opacity-60" />
                              <span className="font-medium">
                                {overlap.maasName} {overlap.maasType === "Adhika" ? "(Adhika)" : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
