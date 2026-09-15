import React, { useState, useEffect } from "react";
import { Activity, Clock, Compass, Wind, Moon, Sun, Sparkles, AlertTriangle } from "lucide-react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { Language } from "../i18n";
import { 
  getLocalizedTithi, 
  getLocalizedNakshatra, 
  getLocalizedYoga, 
  getLocalizedKarana 
} from "../i18n";
import { computeSwaraYoga, SWARA_DETAILS } from "../swaraYoga";
import { resolveCurrentHora } from "../horaEngine";

const horaNamesHi: Record<string, string> = {
  Sun: "सूर्य",
  Moon: "चन्द्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "गुरु",
  Venus: "शुक्र",
  Saturn: "शनि",
};

const tattvaNamesHi: Record<string, string> = {
  Prithvi: "पृथ्वी",
  Jala: "जल",
  Agni: "अग्नि",
  Vayu: "वायु",
  Akasha: "आकाश",
};

interface RunningNowWidgetProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const RunningNowWidget: React.FC<RunningNowWidgetProps> = ({
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

  const nowMs = now.getTime();

  // Helper to check if a segment is currently active
  const isSegmentActive = (seg: any) => {
    const start = seg.startTimeMs || 0;
    const end = seg.endTimeMs || Infinity;
    return nowMs >= start && nowMs < end;
  };

  const activeTithi = data.tithi.find(isSegmentActive) || data.tithi[0];
  const activeNakshatra = data.nakshatra.find(isSegmentActive) || data.nakshatra[0];
  const activeYoga = data.yoga.find(isSegmentActive) || data.yoga[0];
  const activeKarana = data.karana.find(isSegmentActive) || data.karana[0];

  const tithiName = lang === "hi" && activeTithi?.number != null 
    ? getLocalizedTithi(activeTithi.number, lang) 
    : activeTithi?.name;
    
  const nakshatraName = lang === "hi" && activeNakshatra?.number != null 
    ? getLocalizedNakshatra(activeNakshatra.number, activeNakshatra.name, lang) 
    : activeNakshatra?.name;
    
  const yogaName = lang === "hi" && activeYoga?.number != null 
    ? getLocalizedYoga(activeYoga.number, activeYoga.name, lang) 
    : activeYoga?.name;
    
  const karanaName = lang === "hi" && activeKarana?.number != null 
    ? getLocalizedKarana(activeKarana.number, activeKarana.name, lang) 
    : activeKarana?.name;

  let sunriseTithiName = data.tithi[0]?.name;
  if (data.sunrise_ms) {
    const tithiAtSunrise = data.tithi.find(t => data.sunrise_ms! >= (t.startTimeMs || 0) && data.sunrise_ms! < (t.endTimeMs || Infinity));
    if (tithiAtSunrise) {
      sunriseTithiName = lang === "hi" && tithiAtSunrise.number != null 
        ? getLocalizedTithi(tithiAtSunrise.number, lang) 
        : tithiAtSunrise.name;
    }
  }

  // Check Muhurtas
  const activeMuhurtas: { name: string; type: "auspicious" | "inauspicious" }[] = [];
  
  if (data.rahu_kala && nowMs >= data.rahu_kala.startTimeMs && nowMs <= data.rahu_kala.endTimeMs) {
    activeMuhurtas.push({ name: lang === "hi" ? "राहु काल" : "Rahu Kala", type: "inauspicious" });
  }
  if (data.yamaganda && nowMs >= data.yamaganda.startTimeMs && nowMs <= data.yamaganda.endTimeMs) {
    activeMuhurtas.push({ name: lang === "hi" ? "यमगण्ड" : "Yamaganda", type: "inauspicious" });
  }
  if (data.gulika_kala && nowMs >= data.gulika_kala.startTimeMs && nowMs <= data.gulika_kala.endTimeMs) {
    activeMuhurtas.push({ name: lang === "hi" ? "गुलिका काल" : "Gulika Kala", type: "inauspicious" });
  }
  if (data.abhijit_muhurta && nowMs >= data.abhijit_muhurta.startTimeMs && nowMs <= data.abhijit_muhurta.endTimeMs) {
    activeMuhurtas.push({ name: lang === "hi" ? "अभिजित मुहूर्त" : "Abhijit Muhurta", type: "auspicious" });
  }
  if (data.brahma_muhurta && nowMs >= data.brahma_muhurta.startTimeMs && nowMs <= data.brahma_muhurta.endTimeMs) {
    activeMuhurtas.push({ name: lang === "hi" ? "ब्रह्म मुहूर्त" : "Brahma Muhurta", type: "auspicious" });
  }
  if (data.amrita_kala) {
    for (const am of data.amrita_kala) {
      if (nowMs >= am.startTimeMs && nowMs <= am.endTimeMs) {
        activeMuhurtas.push({ name: lang === "hi" ? "अमृत काल" : "Amrita Kala", type: "auspicious" });
      }
    }
  }

  // Compute City Time
  let cityHours = now.getHours();
  let cityMinutes = now.getMinutes();
  let citySeconds = now.getSeconds();
  
  try {
    const timeZone = data.timezone || "Asia/Kolkata";
    const options: Intl.DateTimeFormatOptions = {
      timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    };
    const timeStr = new Intl.DateTimeFormat([], options).format(now);
    const [h, m, s] = timeStr.split(":").map(Number);
    cityHours = h || 0;
    cityMinutes = m || 0;
    citySeconds = s || 0;
  } catch (e) {}

  const primaryTithiNum = data.tithi?.[0]?.number || 1;
  const swaraData = computeSwaraYoga(
    primaryTithiNum,
    data.sunrise,
    data.sunset,
    { hours: cityHours, minutes: cityMinutes, seconds: citySeconds },
    data.moonrise,
    data.moonset,
  );

  const horaState = resolveCurrentHora(now.getTime(), data);
  const activeHora = horaState?.hora || null;
  const activeTattva = horaState?.activeTattva || null;
  const activeNadi = activeHora?.nadi || swaraData.sunriseSwara;
  
  // Format current time
  const timeDisplay = now.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });

  return (
    <div className={`rounded-2xl p-5 shadow-md flex flex-col gap-4 transition-all ${
      isNight 
        ? "bg-[#0e1424]/95 border border-indigo-500/40 text-slate-100" 
        : "bg-linear-to-br from-emerald-50 via-teal-50/30 to-emerald-100/50 border border-emerald-200 text-stone-800"
    }`}>
      <div className="flex items-center justify-between border-b pb-3 border-emerald-200/50 dark:border-indigo-800/50">
        <div className="flex items-center space-x-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${
            isNight ? "bg-indigo-600/30 text-indigo-300" : "bg-emerald-500 text-white"
          }`}>
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-devanagari">
              {lang === "hi" ? "अभी चल रहा है" : "Running Now"}
            </h2>
            <div className="flex items-center gap-1.5 opacity-80 text-xs">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{timeDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panchanga & Muhurta */}
        <div className="space-y-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isNight ? "text-indigo-300" : "text-emerald-700"}`}>
            {lang === "hi" ? "पंचांग व मुहूर्त" : "Panchanga & Muhurta"}
          </h3>
          
          <div className={`rounded-xl p-3 space-y-2 border ${isNight ? "bg-slate-900/50 border-slate-700" : "bg-white/60 border-emerald-100"}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 dark:text-slate-400">{lang === "hi" ? "तिथि:" : "Tithi:"}</span>
              <span className="font-bold font-devanagari">{tithiName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 dark:text-slate-400">{lang === "hi" ? "नक्षत्र:" : "Nakshatra:"}</span>
              <span className="font-bold font-devanagari">{nakshatraName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 dark:text-slate-400">{lang === "hi" ? "योग / करण:" : "Yoga / Karana:"}</span>
              <span className="font-bold font-devanagari">{yogaName} / {karanaName}</span>
            </div>
          </div>

          <div className={`text-xs p-2 rounded-lg border ${isNight ? "bg-indigo-900/30 text-indigo-300 border-indigo-800" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
            <div className="flex items-center gap-1.5 font-medium">
              <Sun className="w-3.5 h-3.5" />
              {lang === "hi" ? `सूर्योदय के समय तिथि: ${sunriseTithiName}` : `Tithi at Sunrise: ${sunriseTithiName}`}
            </div>
          </div>

          {activeMuhurtas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeMuhurtas.map((mu, idx) => (
                <span key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
                  mu.type === "auspicious" 
                    ? (isNight ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800" : "bg-emerald-100 text-emerald-800 border border-emerald-200")
                    : (isNight ? "bg-rose-900/50 text-rose-300 border border-rose-800" : "bg-rose-100 text-rose-800 border border-rose-200")
                }`}>
                  {mu.type === "auspicious" ? <Sparkles className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {mu.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Swara & Hora */}
        <div className="space-y-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isNight ? "text-indigo-300" : "text-emerald-700"}`}>
            {lang === "hi" ? "स्वर, होरा व नाड़ी" : "Swara, Hora & Nadi"}
          </h3>
          
          <div className={`rounded-xl p-3 space-y-3 border ${isNight ? "bg-slate-900/50 border-slate-700" : "bg-white/60 border-emerald-100"}`}>
            {activeHora ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-slate-400">{lang === "hi" ? "सक्रिय होरा:" : "Active Hora:"}</span>
                <span className={`font-bold font-devanagari ${isNight ? "text-rose-300" : "text-rose-600"}`}>
                  {lang === "hi" ? (horaNamesHi[activeHora.ruler] || activeHora.ruler) : activeHora.ruler} ({activeHora.isDay ? (lang === "hi" ? "दिन" : "Day") : (lang === "hi" ? "रात्रि" : "Night")})
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 dark:text-slate-400">{lang === "hi" ? "प्रवहमान नाड़ी:" : "Flowing Nadi:"}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${
                activeNadi === "ida" 
                  ? (isNight ? "bg-sky-900/50 text-sky-200" : "bg-sky-100 text-sky-800")
                  : (isNight ? "bg-orange-900/50 text-orange-200" : "bg-orange-100 text-orange-800")
              }`}>
                {activeNadi === "ida" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                {activeNadi === "ida" ? (lang === "hi" ? "इड़ा (वाम)" : "Ida (Left)") : (lang === "hi" ? "पिङ्गला (दक्षिण)" : "Pingala (Right)")}
              </span>
            </div>
            {activeTattva ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-slate-400">{lang === "hi" ? "सक्रिय तत्त्व:" : "Active Tattva:"}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTattva.color }} />
                  <span className="font-bold font-devanagari">{lang === "hi" ? (tattvaNamesHi[activeTattva.sanskrit] || activeTattva.sanskrit) : activeTattva.sanskrit}</span>
                </div>
              </div>
            ) : null}
            
            {swaraData.activeCelestialWindow && (
              <div className={`mt-2 rounded-lg p-2.5 text-xs flex flex-col gap-1.5 ${
                isNight ? "bg-indigo-900/30 text-indigo-200 border border-indigo-800/50" : "bg-amber-50 text-amber-800 border border-amber-200/60"
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <Wind className="w-3.5 h-3.5" />
                  {swaraData.activeCelestialWindow === "sunrise" ? (lang === "hi" ? `सूर्योदय स्वर काल ${swaraData.sunriseSwara === "ida" ? "(इड़ा)" : "(पिङ्गला)"}` : `Sunrise Swara Window ${swaraData.sunriseSwara === "ida" ? "(Ida)" : "(Pingala)"}`) : ""}
                  {swaraData.activeCelestialWindow === "midday" ? (lang === "hi" ? `मध्याह्न स्वर काल ${swaraData.sunriseSwara === "ida" ? "(इड़ा)" : "(पिङ्गला)"}` : `Midday Swara Window ${swaraData.sunriseSwara === "ida" ? "(Ida)" : "(Pingala)"}`) : ""}
                  {swaraData.activeCelestialWindow === "sunset" ? (lang === "hi" ? `सूर्यास्त स्वर काल ${swaraData.sunsetSwara === "ida" ? "(इड़ा)" : "(पिङ्गला)"}` : `Sunset Swara Window ${swaraData.sunsetSwara === "ida" ? "(Ida)" : "(Pingala)"}`) : ""}
                  {swaraData.activeCelestialWindow === "moonrise" ? (lang === "hi" ? `चन्द्रोदय स्वर काल ${swaraData.moonriseSwara === "ida" ? "(इड़ा)" : "(पिङ्गला)"}` : `Moonrise Swara Window ${swaraData.moonriseSwara === "ida" ? "(Ida)" : "(Pingala)"}`) : ""}
                  {swaraData.activeCelestialWindow === "moonset" ? (lang === "hi" ? `चन्द्रास्त स्वर काल ${swaraData.moonsetSwara === "ida" ? "(इड़ा)" : "(पिङ्गला)"}` : `Moonset Swara Window ${swaraData.moonsetSwara === "ida" ? "(Ida)" : "(Pingala)"}`) : ""}
                </div>
                <div className="font-mono font-medium opacity-90 text-sm pl-5">
                  {swaraData.activeCelestialWindow === "sunrise" ? swaraData.sunriseWindow?.windowFormatted : ""}
                  {swaraData.activeCelestialWindow === "midday" ? swaraData.middayWindow?.windowFormatted : ""}
                  {swaraData.activeCelestialWindow === "sunset" ? swaraData.sunsetWindow?.windowFormatted : ""}
                  {swaraData.activeCelestialWindow === "moonrise" ? swaraData.moonriseWindow?.windowFormatted : ""}
                  {swaraData.activeCelestialWindow === "moonset" ? swaraData.moonsetWindow?.windowFormatted : ""}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
