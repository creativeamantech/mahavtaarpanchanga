import React, { useState, useEffect } from "react";
import { Clock, Sparkles, Compass, Wind } from "lucide-react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { Language } from "../i18n";
import { computeSwaraYoga, SWARA_DETAILS } from "../swaraYoga";
import { resolveCurrentHora } from "../horaEngine";

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

  // Compute Hora and Tattva using canonical resolveCurrentHora
  const horaState = resolveCurrentHora(now.getTime(), data);
  const activeHora = horaState?.hora || null;
  const activeTattva = horaState?.activeTattva || null;
  const activeNadi = activeHora?.nadi || swaraData.sunriseSwara;
  const nadiDetails = SWARA_DETAILS[activeNadi];

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "0m 00s";
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  return (
    <div
      className={`rounded-[1.5rem] p-5 sm:p-6 flex flex-col gap-4 ${isNight ? "bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl" : "glass-card border border-stone-200/60 shadow-sm"}`}
    >
      <div className="flex items-center justify-between border-b border-stone-200/30 pb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${isNight ? "bg-indigo-900/50 text-indigo-300" : "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800"}`}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3
              className={`text-sm font-bold font-devanagari ${isNight ? "text-amber-300" : "text-amber-900"}`}
            >
              {lang === "hi" ? "सक्रिय होरा एवं नाड़ी" : "Active Hora & Nadi"}
            </h3>
            <p
              className={`text-[10px] uppercase tracking-wider ${isNight ? "text-slate-400" : "text-stone-500"}`}
            >
              Planetary Hour & Swara Current
            </p>
          </div>
        </div>

        {horaState && (
          <div className="text-right">
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                isNight
                  ? "bg-indigo-950/60 border-indigo-700/60 text-indigo-300"
                  : "bg-amber-100/80 border-amber-300/80 text-amber-900"
              }`}
            >
              {formatCountdown(horaState.horaRemainingMs ?? 0)}{" "}
              <span className="text-[9px] font-sans font-normal opacity-80">
                {lang === "hi" ? "शेष" : "left"}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Special Celestial Sandhya Window Notice if active */}
      {swaraData.activeCelestialWindow && (
        <div
          className={`rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 border ${
            isNight
              ? "bg-indigo-950/50 border-indigo-700/40 text-indigo-200"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <Wind className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>
              {swaraData.activeCelestialWindow === "sunrise"
                ? lang === "hi"
                  ? "सूर्योदय स्वर काल:"
                  : "Sunrise Swara Sandhya:"
                : lang === "hi"
                  ? "सूर्यास्त स्वर काल:"
                  : "Sunset Swara Sandhya:"}
            </strong>{" "}
            {swaraData.activeCelestialWindow === "sunrise"
              ? swaraData.sunriseWindow?.windowFormatted
              : swaraData.sunsetWindow?.windowFormatted}{" "}
            (
            {swaraData.activeCelestialWindow === "sunrise"
              ? swaraData.sunriseNostril
              : swaraData.sunsetNostril}{" "}
            nostril)
          </span>
        </div>
      )}

      {/* Primary Unified Hora & Nadi Card */}
      <div
        className={`rounded-xl p-4 border ${isNight ? "bg-indigo-950/40 border-indigo-800/40" : "bg-white/70 border-stone-200/60"}`}
      >
        {activeHora ? (
          <div className="space-y-3.5">
            {/* Top row: Hora Ruler & Active Nadi */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold font-devanagari ${isNight ? "text-rose-300" : "text-rose-700"}`}
                  >
                    {activeHora.ruler} Hora
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {activeHora.isDay ? "Day" : "Night"} #{activeHora.index}
                  </span>
                </div>
                <div className="text-xs font-mono text-stone-500 mt-0.5">
                  {activeHora.startTime} – {activeHora.endTime}
                </div>
              </div>

              {/* Nadi Badge */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                    activeHora.nadi === "ida"
                      ? "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800"
                      : "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  {activeHora.nadi === "ida"
                    ? lang === "hi"
                      ? "इड़ा (चन्द्र नाड़ी)"
                      : "Ida (Chandra Nadi)"
                    : lang === "hi"
                      ? "पिङ्गला (सूर्य नाड़ी)"
                      : "Pingala (Surya Nadi)"}
                </span>
                <div className="text-[11px] text-stone-500 dark:text-slate-400 mt-1 font-medium">
                  {nadiDetails.nostril[lang]}
                </div>
              </div>
            </div>

            {/* Description of nature and energy */}
            <p
              className={`text-xs leading-relaxed ${isNight ? "text-slate-300" : "text-stone-700"}`}
            >
              {lang === "hi"
                ? `${activeHora.ruler} की होरा में ${activeHora.nadi === "ida" ? "इड़ा (चन्द्र)" : "पिङ्गला (सूर्य)"} नाड़ी प्रभावी है — ${nadiDetails.energy[lang]} (${nadiDetails.element[lang]})।`
                : `In ${activeHora.ruler} Hora, ${activeHora.nadi === "ida" ? "Ida (Lunar)" : "Pingala (Solar)"} Nadi governs the cosmic flow — ${nadiDetails.energy[lang]} (${nadiDetails.element[lang]}).`}
            </p>

            {/* Tattva Micro-Period */}
            {activeTattva && (
              <div
                className={`rounded-lg p-2.5 flex items-center justify-between text-xs border ${
                  isNight
                    ? "bg-slate-900/60 border-indigo-900/50 text-slate-200"
                    : "bg-amber-50/70 border-amber-200/70 text-stone-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeTattva.color }}
                  />
                  <span className="font-bold font-devanagari">{activeTattva.sanskrit}</span>
                  <span className="text-stone-500 dark:text-slate-400">({activeTattva.name})</span>
                </div>
                <div className="font-mono text-[11px] font-bold text-amber-900 dark:text-amber-300">
                  {activeTattva.startTime} – {activeTattva.endTime}
                </div>
              </div>
            )}

            {/* Ruling Grahas for this Nadi */}
            <div
              className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                isNight
                  ? "border-indigo-900/50 text-slate-400"
                  : "border-stone-200/60 text-stone-600"
              }`}
            >
              <span className="font-semibold text-stone-500">
                {lang === "hi" ? "नाड़ी शासक ग्रह:" : "Planets for this Nadi:"}
              </span>
              <span className="font-medium text-stone-800 dark:text-slate-200">
                {nadiDetails.rulingDeities[lang]}
              </span>
            </div>
          </div>
        ) : (
          <div className={`text-xs ${isNight ? "text-slate-400" : "text-stone-500"}`}>
            {lang === "hi"
              ? "वर्तमान होरा केवल आज के दिन के लिए प्रदर्शित की जाती है।"
              : "Active Hora is only calculated for the current day."}
          </div>
        )}
      </div>
    </div>
  );
};
