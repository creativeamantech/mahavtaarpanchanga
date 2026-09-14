import React, { useState, useEffect } from "react";
import { Wind, Clock, Sparkles } from "lucide-react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { Language } from "../i18n";
import { computeSwaraYoga, SWARA_DETAILS } from "../swaraYoga";
import { computeDailyHoras, resolveCurrentHora } from "../horaEngine";

interface ActiveCosmicForcesWidgetProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const ActiveCosmicForcesWidget: React.FC<ActiveCosmicForcesWidgetProps> = ({
  data,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute City Time
  const timeZone = data.timezone || "Asia/Kolkata";
  let cityHours = now.getHours();
  let cityMinutes = now.getMinutes();
  let citySeconds = now.getSeconds();

  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const timeStr = new Intl.DateTimeFormat([], options).format(now);
    const [h, m, s] = timeStr.split(":").map(Number);
    cityHours = h || 0;
    cityMinutes = m || 0;
    citySeconds = s || 0;
  } catch (e) {
    // ignore
  }

  const primaryTithiNum = data.tithi?.[0]?.number || 1;
  const swaraData = computeSwaraYoga(
    primaryTithiNum,
    data.sunrise,
    data.sunset,
    { hours: cityHours, minutes: cityMinutes, seconds: citySeconds },
    data.moonrise,
    data.moonset,
  );

  const activeSwaraId = swaraData.currentActiveSwara || swaraData.sunriseSwara;
  const activeSwara = SWARA_DETAILS[activeSwaraId];

  // Compute Hora
  const weekday = data.weekday;

  // Compute Hora and Tattva using canonical resolveCurrentHora
  const horaState = resolveCurrentHora(now.getTime(), data);
  const activeHora = horaState?.hora || null;
  const activeTattva = horaState?.activeTattva || null;

  return (
    <div
      className={`rounded-[1.5rem] p-5 sm:p-6 flex flex-col gap-4 ${isNight ? "bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl" : "glass-card border border-stone-200/60 shadow-sm"}`}
    >
      <div className="flex items-center space-x-3 border-b border-stone-200/30 pb-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${isNight ? "bg-indigo-900/50 text-indigo-300" : "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800"}`}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3
            className={`text-sm font-bold font-devanagari ${isNight ? "text-amber-300" : "text-amber-900"}`}
          >
            {lang === "hi"
              ? "सक्रिय ब्रह्मांडीय ऊर्जा"
              : lang === "sa"
                ? "सक्रिय-ब्रह्माण्डीय-ऊर्जा"
                : "Active Cosmic Forces"}
          </h3>
          <p
            className={`text-[10px] uppercase tracking-wider ${isNight ? "text-slate-400" : "text-stone-500"}`}
          >
            Running Swara & Hora
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Swara Widget */}
        <div
          className={`rounded-xl p-4 border ${isNight ? "bg-indigo-950/40 border-indigo-800/40" : "bg-white/70 border-stone-200/60"}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Wind className={`w-4 h-4 ${isNight ? "text-sky-400" : "text-sky-600"}`} />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${isNight ? "text-slate-300" : "text-stone-700"}`}
              >
                {lang === "hi" ? "वर्तमान स्वर" : lang === "sa" ? "वर्तमान-स्वरः" : "Current Swara"}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-lg font-bold font-devanagari ${isNight ? "text-amber-300" : "text-amber-700"}`}
            >
              {activeSwara.sanskritName}{" "}
              <span className="text-sm font-sans font-medium text-slate-500">
                ({activeSwara.nostril[lang]})
              </span>
            </div>
            <p
              className={`text-xs mt-1 leading-relaxed ${isNight ? "text-slate-400" : "text-stone-600"}`}
            >
              {activeSwara.energy[lang]} • {activeSwara.element[lang]}
            </p>
          </div>
        </div>

        {/* Hora Widget */}
        <div
          className={`rounded-xl p-4 border ${isNight ? "bg-indigo-950/40 border-indigo-800/40" : "bg-white/70 border-stone-200/60"}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Clock className={`w-4 h-4 ${isNight ? "text-rose-400" : "text-rose-600"}`} />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${isNight ? "text-slate-300" : "text-stone-700"}`}
              >
                {lang === "hi" ? "वर्तमान होरा" : lang === "sa" ? "वर्तमान-होरा" : "Current Hora"}
              </span>
            </div>
            {activeHora && (
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-600"}`}
              >
                {activeHora.startTime} - {activeHora.endTime}
              </span>
            )}
          </div>
          <div className="mt-3">
            {activeHora ? (
              <>
                <div
                  className={`text-lg font-bold font-devanagari ${isNight ? "text-rose-300" : "text-rose-700"}`}
                >
                  {activeHora.ruler} Hora
                </div>
                {activeTattva && (
                  <div className="mt-1 text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      Tattva: {activeTattva.sanskrit} ({activeTattva.name}) ·{" "}
                      {activeTattva.startTime}–{activeTattva.endTime}
                    </span>
                  </div>
                )}
                <p className={`text-xs mt-1 ${isNight ? "text-slate-400" : "text-stone-600"}`}>
                  {lang === "hi"
                    ? "इस समय " + activeHora.ruler + " का प्रभाव है।"
                    : lang === "sa"
                      ? activeHora.ruler + " होरा प्रचलति।"
                      : "The ruling planet for this hour is " + activeHora.ruler + "."}
                </p>
              </>
            ) : (
              <div className={`text-xs ${isNight ? "text-slate-400" : "text-stone-500"}`}>
                Active Hora is only shown for the current day.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
