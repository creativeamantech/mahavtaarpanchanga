import React, { useState, useEffect } from "react";
import {
  DailyHoras,
  Hora,
  TattvaPeriod,
  computeDailyHoras,
  resolveCurrentHora,
  CurrentHoraData,
} from "../horaEngine";
import { Sun, Moon, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { PanchangaResponse } from "../types";
import { Language } from "../i18n";

export function VedicHorasView({
  panchangaData,
  lang,
}: {
  panchangaData: PanchangaResponse;
  lang: Language;
}) {
  const [dailyHoras, setDailyHoras] = useState<DailyHoras | null>(null);
  const [now, setNow] = useState(Date.now());
  const [expandedHora, setExpandedHora] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (panchangaData) {
      const weekday = panchangaData.weekday;
      const horas = computeDailyHoras(
        panchangaData.date,
        panchangaData.sunrise_ms!,
        panchangaData.sunset_ms!,
        panchangaData.next_sunrise_ms!,
        weekday,
        panchangaData.tithi[0]?.number || 1,
        panchangaData.timezone,
        now,
      );
      setDailyHoras(horas);
    }
  }, [panchangaData, now]);

  if (!dailyHoras) return null;

  // Current Hora resolution
  const currentLiveHoraData = resolveCurrentHora(now, panchangaData);
  const activeHora = currentLiveHoraData?.hora || null;
  const activeTattva = currentLiveHoraData?.tattva || null;

  // Auspicious activities map based on Planet & Element
  const adviceMapEn = {
    Sun: "Leadership, authority, health, spiritual practices.",
    Moon: "Public relations, emotions, mother, food, changes.",
    Mars: "Courage, technical work, physical activity, surgery.",
    Mercury: "Communication, business, writing, analytics.",
    Jupiter: "Wisdom, wealth, education, religious acts.",
    Venus: "Arts, romance, luxury, comforts, diplomacy.",
    Saturn: "Discipline, hard work, dealing with elders, delays.",
  };

  const adviceMapHi = {
    Sun: "नेतृत्व, स्वास्थ्य, आध्यात्मिक कार्य, सरकारी कार्य।",
    Moon: "जनसंपर्क, भावनाएं, माता, भोजन, बदलाव।",
    Mars: "साहस, तकनीकी कार्य, शारीरिक गतिविधि, शल्य चिकित्सा।",
    Mercury: "संचार, व्यापार, लेखन, बौद्धिक कार्य।",
    Jupiter: "ज्ञान, धन, शिक्षा, धार्मिक कार्य।",
    Venus: "कला, प्रेम, विलासिता, कूटनीति, सौंदर्य।",
    Saturn: "अनुशासन, कड़ी मेहनत, वृद्ध लोगों से व्यवहार, विलंब।",
  };

  const adviceMap = lang === "hi" ? adviceMapHi : adviceMapEn;

  const rulerMapHi: Record<string, string> = {
    Sun: "सूर्य",
    Moon: "चन्द्र",
    Mars: "मंगल",
    Mercury: "बुध",
    Jupiter: "गुरु",
    Venus: "शुक्र",
    Saturn: "शनि",
  };

  const getTattvaColor = (name: string) => {
    switch (name) {
      case "Prithvi":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Jala":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Agni":
        return "bg-red-100 text-red-800 border-red-300";
      case "Vayu":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Akasha":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  const formatMins = (ms: number) => Math.round(ms / 60000);

  return (
    <div className="space-y-6">
      {/* SCREEN 1: Current Live Status */}
      <div className="glass-card rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h2 className="text-xl font-black text-stone-800 tracking-tight">
            {lang === "hi" ? "वर्तमान होरा स्थिति" : "Current Hora Status"}
          </h2>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span>{lang === "hi" ? "लाइव ट्रैकिंग" : "Live Tracking"}</span>
          </div>
        </div>

        {activeHora && activeTattva ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* Current Active Elements */}
            <div className="rounded-2xl bg-indigo-900 text-white p-6 shadow-md shadow-indigo-900/20">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                    {lang === "hi" ? "सक्रिय ग्रह (होरा)" : "Active Planet (Hora)"}
                  </div>
                  <div className="text-3xl font-black tracking-tight">
                    {lang === "hi" ? rulerMapHi[activeHora.ruler] || activeHora.ruler : activeHora.ruler}
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-800 border border-indigo-700/50 shadow-inner">
                  {activeHora.isDay ? (
                    <Sun className="h-7 w-7 text-amber-400" />
                  ) : (
                    <Moon className="h-7 w-7 text-indigo-300" />
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-indigo-100 font-mono text-sm bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-800/50">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span>
                    {activeHora.startTime} - {activeHora.endTime}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      activeHora.nadi === "ida"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : activeHora.nadi === "pingala"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {activeHora.nadi === "ida"
                      ? (lang === "hi" ? "इड़ा (चन्द्र नाड़ी)" : "Ida (Lunar Nadi)")
                      : activeHora.nadi === "pingala"
                        ? (lang === "hi" ? "पिंगला (सूर्य नाड़ी)" : "Pingala (Solar Nadi)")
                        : (lang === "hi" ? "सुषुम्ना" : "Sushumna")}
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-indigo-800/50">
                <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">
                  {lang === "hi" ? "सूक्ष्म पंच तत्त्व" : "Micro Pancha Tattva"}
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getTattvaColor(activeTattva.name)}`}
                >
                  {lang === "hi" ? "तत्त्व: " : "Tattva: "} {activeTattva.sanskrit} ({lang === "hi" ? getTattvaNameHi(activeTattva.name) : activeTattva.name})
                </span>
              </div>
            </div>

            {/* Visual Progress & Advice */}
            <div className="rounded-2xl bg-white p-6 border border-stone-100 shadow-xs flex flex-col justify-center space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                  <span>{lang === "hi" ? "होरा प्रगति" : "Hora Progress"}</span>
                  <span>
                    {formatMins(now - activeHora.startTimeMs)} / {formatMins(activeHora.durationMs)} {lang === "hi" ? "मिनट" : "mins"}
                  </span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((now - activeHora.startTimeMs) / activeHora.durationMs) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                  <span>{lang === "hi" ? "तत्त्व प्रगति" : "Tattva Progress"}</span>
                  <span>
                    {formatMins(now - activeTattva.startTimeMs)} / {formatMins(activeTattva.durationMs)} {lang === "hi" ? "मिनट" : "mins"}
                  </span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((now - activeTattva.startTimeMs) / activeTattva.durationMs) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-stone-100">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  {lang === "hi" ? "शुभ कार्य (सलाह)" : "Auspicious Focus"}
                </div>
                <div className="text-sm text-stone-700 italic">
                  "{adviceMap[activeHora.ruler as keyof typeof adviceMap]}"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-500">
            {lang === "hi" ? "सक्रिय होरा केवल वर्तमान दिन के लिए दिखाई जाती है।" : "Active Hora is only shown for the current day."}
          </div>
        )}
      </div>

      {/* SCREEN 2: 24-Hour Timeline */}
      <div className="glass-card rounded-[2rem] p-6 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-bold text-stone-800">
            {lang === "hi" ? "दैनिक सारणी: २४ वैदिक होरा" : "Daily Schedule: 24 Vedic Horas"}
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {lang === "hi" ? "ग्रह स्वामी एवं स्वर नाड़ी" : "Planetary Rulers & Matched Swara Nadis"}
          </span>
        </div>
        <div className="space-y-2.5">
          {dailyHoras.horas.map((hora) => {
            const isActive = hora.index === activeHora?.index;
            const isExpanded = expandedHora === hora.index || isActive;

            return (
              <div
                key={hora.index}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isActive ? "border-indigo-400 shadow-md bg-indigo-50/30" : "border-stone-200 bg-white hover:border-indigo-200"}`}
              >
                <div
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => setExpandedHora(isExpanded && !isActive ? null : hora.index)}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${isActive ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-600"}`}
                    >
                      {hora.index}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        {hora.isDay ? (
                          <Sun className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Moon className="h-4 w-4 text-indigo-400" />
                        )}
                        <span
                          className={`font-bold ${isActive ? "text-indigo-900" : "text-stone-700"}`}
                        >
                          {lang === "hi" ? rulerMapHi[hora.ruler] || hora.ruler : hora.ruler}
                        </span>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full animate-pulse">
                            {lang === "hi" ? "अभी" : "Now"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {hora.startTime} - {hora.endTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${hora.nadi === "ida" ? "bg-sky-50 text-sky-700 border-sky-200" : hora.nadi === "pingala" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}
                    >
                      {hora.nadi === "ida"
                        ? (lang === "hi" ? "इड़ा 🔵 (चन्द्र)" : "Ida 🔵 (Lunar)")
                        : hora.nadi === "pingala"
                          ? (lang === "hi" ? "पिंगला 🔴 (सूर्य)" : "Pingala 🔴 (Solar)")
                          : (lang === "hi" ? "सुषुम्ना" : "Sushumna")}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-stone-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-stone-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50/50 p-4 animate-in slide-in-from-top-2">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                      {lang === "hi" ? "पंच तत्त्व सूक्ष्म अवधि" : "Pancha Tattva (5 Elements) Micro-Periods"}
                    </div>
                    <div className="space-y-2">
                      {hora.tattvas.map((tattva, tIdx) => {
                        const isTattvaActive = isActive && activeTattva?.name === tattva.name;

                        return (
                          <div
                            key={tIdx}
                            className={`flex items-center justify-between p-2.5 rounded-xl border ${isTattvaActive ? "border-emerald-400 shadow-xs bg-white" : "border-stone-100 bg-white/50"}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTattvaColor(tattva.name)}`}
                              >
                                {tattva.sanskrit} ({lang === "hi" ? getTattvaNameHi(tattva.name) : tattva.name})
                              </span>
                              {isTattvaActive && (
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-stone-600">
                              {tattva.startTime} - {tattva.endTime}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTattvaNameHi(name: string) {
  switch (name) {
    case "Prithvi": return "पृथ्वी";
    case "Jala": return "जल";
    case "Agni": return "अग्नि";
    case "Vayu": return "वायु";
    case "Akasha": return "आकाश";
    default: return name;
  }
}
