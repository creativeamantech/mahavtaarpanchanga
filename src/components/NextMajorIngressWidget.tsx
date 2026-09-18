import React, { useMemo, useState, useEffect } from "react";
import { Sparkles, ArrowRight, Orbit, Calendar, Clock } from "lucide-react";
import type { PanchangaResponse, PlanetTransitionEvent, AppTheme } from "../types";
import { type Language, translations, GRAHA_TRANSLATIONS, getLocalizedRasi } from "../i18n";

interface NextMajorIngressWidgetProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

function getCountdownParts(targetDateMs: number, nowMs: number) {
  const diffMs = targetDateMs - nowMs;
  if (diffMs < 0) return { days: 0, hours: 0, minutes: 0, isPast: true };

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isPast: false };
}

function getRelativeTime(targetDateMs: number, nowMs: number, lang: string): string {
  const diffMs = targetDateMs - nowMs;
  if (diffMs < 0) return lang === "hi" ? "हो चुका है" : "Already passed";

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const remMins = totalMinutes % 60;

  if (days === 0) {
    if (totalHours === 0) {
      return lang === "hi" ? `${remMins} मिनट में` : `in ${remMins}m`;
    }
    return lang === "hi"
      ? `${totalHours} घंटे ${remMins} मिनट में`
      : `in ${totalHours}h ${remMins}m`;
  }
  if (days === 1) {
    return lang === "hi" ? `कल (${remHours} घंटे शेष)` : `in 1d ${remHours}h`;
  }
  return lang === "hi" ? `${days} दिन ${remHours} घंटे में` : `in ${days}d ${remHours}h`;
}

export const NextMajorIngressWidget: React.FC<NextMajorIngressWidgetProps> = ({
  data,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Smart event selection: find the next future rasi transit, while tracking any event that completed today
  const { nextMajorIngress, todayCompletedIngress } = useMemo(() => {
    const events = data.planet_transitions?.upcomingEvents || [];
    const rasiEvents = events.filter((e) => e.type === "rasi");

    // Find next event that is in the future relative to user's real-time clock
    const future = rasiEvents.find((e) => new Date(e.timestamp).getTime() > now);
    // Find if an event completed earlier today (within last 24h)
    const completed = rasiEvents.find((e) => {
      const t = new Date(e.timestamp).getTime();
      return t <= now && now - t < 24 * 3600000;
    });

    return {
      nextMajorIngress: future || completed || rasiEvents[0] || null,
      todayCompletedIngress: completed || null,
    };
  }, [data, now]);

  if (!nextMajorIngress) return null;

  const planetName =
    lang === "hi"
      ? nextMajorIngress.sanskritName
      : nextMajorIngress.planetName;

  const fromRasi = getLocalizedRasi(nextMajorIngress.fromName, lang);
  const toRasi = getLocalizedRasi(nextMajorIngress.toName, lang);

  // Format the date nicely
  const eventDate = new Date(nextMajorIngress.timestamp);
  const dateFormat = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(eventDate);

  const timeFormat = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(eventDate);

  const isMajor = ["jupiter", "saturn", "rahu", "ketu"].includes(nextMajorIngress.planetId);

  // Calculate against the real-time clock, but allow negative values for past events
  const targetDateMs = new Date(nextMajorIngress.timestamp).getTime();
  const { days, hours, minutes, isPast } = getCountdownParts(targetDateMs, now);

  return (
    <div
      className={`mb-12 rounded-2xl overflow-hidden border ${isNight ? "border-indigo-900/40 bg-[#0e1424]/80" : "border-stone-200 bg-stone-50/50"}`}
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="flex flex-col gap-2">
          {todayCompletedIngress && (
            <div
              className={`mb-2 inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold ${isNight ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60" : "bg-emerald-50 text-emerald-800 border border-emerald-200"}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>
                {lang === "hi"
                  ? `आज संपन्न: ${todayCompletedIngress.specialName || todayCompletedIngress.sanskritName + " → " + getLocalizedRasi(todayCompletedIngress.toName, lang)} (${new Intl.DateTimeFormat("hi-IN", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(todayCompletedIngress.timestamp))})`
                  : `Completed Today: ${todayCompletedIngress.specialName || todayCompletedIngress.planetName + " → " + getLocalizedRasi(todayCompletedIngress.toName, lang)} (${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).format(new Date(todayCompletedIngress.timestamp))})`}
              </span>
              {todayCompletedIngress.punyaKala && (
                <span className="text-[11px] opacity-85 font-mono">
                  • {lang === "hi" ? "पुण्यकाल" : "Puṇyakāla"}:{" "}
                  {todayCompletedIngress.punyaKala.start} - {todayCompletedIngress.punyaKala.end}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-1">
            <div
              className={`text-xs font-bold uppercase tracking-widest ${isNight ? "text-indigo-400" : "text-indigo-600"}`}
            >
              {lang === "hi" ? "आगामी गोचर" : "Next Ingress"}
            </div>
            {isMajor && (
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${isNight ? "bg-amber-900/50 text-amber-400" : "bg-amber-100 text-amber-800"}`}
              >
                {lang === "hi" ? "महा गोचर" : "Maha Gochara"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <h3
              className={`text-3xl sm:text-4xl font-bold tracking-tight ${isNight ? "text-slate-100" : "text-stone-900"}`}
            >
              {planetName}
            </h3>
            <span className={`text-3xl ${isNight ? "text-slate-500" : "text-stone-400"}`}>
              {nextMajorIngress.symbol}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-sm font-medium ${isNight ? "text-slate-400" : "text-stone-500"}`}
            >
              {fromRasi}
            </span>
            <ArrowRight className={`w-4 h-4 ${isNight ? "text-slate-600" : "text-stone-400"}`} />
            <span
              className={`text-sm font-bold ${isNight ? "text-indigo-300" : "text-indigo-700"}`}
            >
              {toRasi}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 mt-4 text-xs font-mono ${isNight ? "text-slate-400" : "text-stone-500"}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {dateFormat} &nbsp;•&nbsp; <Clock className="w-3.5 h-3.5" /> {timeFormat}
          </div>
        </div>

        {/* Right: The Countdown */}
        <div className="flex flex-col items-center md:items-end justify-center shrink-0">
          {isPast ? (
            <div
              className={`px-6 py-3 rounded-xl border font-bold tracking-wide ${isNight ? "bg-stone-800/80 border-stone-700 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-500"}`}
            >
              {lang === "hi" ? "हो चुका है" : "Transition Complete"}
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-4xl font-light font-mono border shadow-sm ${isNight ? "bg-[#161f36] border-indigo-900/50 text-slate-100" : "bg-white border-stone-200 text-stone-800"}`}
                >
                  {String(days).padStart(2, "0")}
                </div>
                <div
                  className={`mt-2 text-[10px] uppercase font-bold tracking-widest ${isNight ? "text-slate-500" : "text-stone-500"}`}
                >
                  {lang === "hi" ? "दिन" : "Days"}
                </div>
              </div>
              <div
                className={`text-2xl font-light pb-6 ${isNight ? "text-slate-600" : "text-stone-300"}`}
              >
                :
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-4xl font-light font-mono border shadow-sm ${isNight ? "bg-[#161f36] border-indigo-900/50 text-slate-100" : "bg-white border-stone-200 text-stone-800"}`}
                >
                  {String(hours).padStart(2, "0")}
                </div>
                <div
                  className={`mt-2 text-[10px] uppercase font-bold tracking-widest ${isNight ? "text-slate-500" : "text-stone-500"}`}
                >
                  {lang === "hi" ? "घंटे" : "Hrs"}
                </div>
              </div>
              <div
                className={`text-2xl font-light pb-6 ${isNight ? "text-slate-600" : "text-stone-300"}`}
              >
                :
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-4xl font-light font-mono border shadow-sm ${isNight ? "bg-[#161f36] border-indigo-900/50 text-indigo-400" : "bg-white border-stone-200 text-indigo-600"}`}
                >
                  {String(minutes).padStart(2, "0")}
                </div>
                <div
                  className={`mt-2 text-[10px] uppercase font-bold tracking-widest ${isNight ? "text-slate-500" : "text-stone-500"}`}
                >
                  {lang === "hi" ? "मिनट" : "Mins"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
