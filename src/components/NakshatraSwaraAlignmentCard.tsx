import React, { useState, useMemo } from "react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { Language } from "../i18n";
import {
  evaluateNakshatraSwaraAlignment,
  TATTVA_MASTER_TABLE,
  ZODIAC_NADI_MASTER_TABLE,
  NAKSHATRA_NADI_DEFINITIONS,
  SWARA_CYCLE_RULES,
} from "../swaraYoga";
import {
  computeNakshatraSwaraEvents,
  isNakshatraSwaraEventActive,
  getNakshatraSwaraRule,
} from "../lib/nakshatraSwaraEngine";
import {
  Sparkles,
  Sun,
  Moon,
  Flame,
  Droplets,
  Wind,
  Mountain,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sliders,
  BookOpen,
  ArrowRight,
  Info,
  Layers,
} from "lucide-react";

interface NakshatraSwaraAlignmentCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const NakshatraSwaraAlignmentCard: React.FC<NakshatraSwaraAlignmentCardProps> = ({
  data,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";

  // Today's live parameters from Panchanga response
  const primaryTithiNum = data.tithi?.[0]?.number || 1;
  const primaryNakNum = data.nakshatra?.[0]?.number || 1;
  const moonPlanet = data.planets?.find((p) => p.id === "moon");
  const moonPada = moonPlanet?.pada || 1;
  const moonRashiNum = moonPlanet?.rasiNumber || 1;

  // Simulator / Custom calculation state
  const [customTithi, setCustomTithi] = useState<number>(primaryTithiNum);
  const [customNak, setCustomNak] = useState<number>(primaryNakNum);
  const [customPada, setCustomPada] = useState<number>(moonPada);
  const [activeSubTab, setActiveSubTab] = useState<"live" | "simulator" | "tables">("live");
  const [selectedTableTab, setSelectedTableTab] = useState<"tattvas" | "rashis">("tattvas");

  // Today's Live alignment
  const liveAlignment = useMemo(() => {
    return evaluateNakshatraSwaraAlignment(primaryTithiNum, primaryNakNum, moonPada, moonRashiNum);
  }, [primaryTithiNum, primaryNakNum, moonPada, moonRashiNum]);

  // Simulator alignment
  const simAlignment = useMemo(() => {
    return evaluateNakshatraSwaraAlignment(customTithi, customNak, customPada);
  }, [customTithi, customNak, customPada]);

  const nowMs = Date.now();
  const primaryNakSeg = data.nakshatra?.[0];
  const liveNakSwara = useMemo(() => {
    if (!primaryNakSeg) return null;
    return (
      primaryNakSeg.nakshatraSwara ||
      computeNakshatraSwaraEvents(primaryNakSeg, data.timezone, nowMs, lang === "hi" ? "hi" : "en")
    );
  }, [primaryNakSeg, data.timezone, nowMs, lang]);

  const simRule = useMemo(() => {
    return getNakshatraSwaraRule(customNak);
  }, [customNak, customPada]);

  // Handler to load the prompt's reference test case (Day 1 Shukla Pratipada + Pushya)
  const loadReferenceTestCase = () => {
    setCustomTithi(1); // Shukla Pratipada
    setCustomNak(8); // Pushya
    setCustomPada(1);
    setActiveSubTab("simulator");
  };

  // Helper to get element icon
  const getTattvaIcon = (element: string, className = "h-4 w-4") => {
    switch (element) {
      case "prithvi":
        return <Mountain className={className} />;
      case "jala":
        return <Droplets className={className} />;
      case "tejas":
        return <Flame className={className} />;
      case "vayu":
        return <Wind className={className} />;
      case "akash":
      default:
        return <CircleDot className={className} />;
    }
  };

  // Helper for Rating Badge
  const renderRatingBadge = (rating: "Perfect" | "Neutral" | "Incompatible") => {
    if (rating === "Perfect") {
      return (
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{lang === "hi" ? "उत्तम संरेखण" : "Perfect Alignment"}</span>
        </span>
      );
    }
    if (rating === "Neutral") {
      return (
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>{lang === "hi" ? "तटस्थ / संधिकाल" : "Neutral / Transitional"}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-800 dark:text-rose-300">
        <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
        <span>{lang === "hi" ? "विपरीत / विरोध" : "Incompatible / Conflict"}</span>
      </span>
    );
  };

  return (
    <div
      id="nakshatra-swara-alignment-module"
      className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 p-5 shadow-xs space-y-5 text-stone-800 dark:text-stone-100"
    >
      {/* Module Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-amber-200/70">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="font-serif-vedic text-base sm:text-lg font-bold text-amber-950 dark:text-amber-100">
              {lang === "hi"
                ? "नक्षत्र-स्वर संरेखण एवं तत्त्व विज्ञान"
                : "Nakshatra-Nadi Alignment & Tattvas"}
            </h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {lang === "hi"
              ? "शिवस्वरोदय श्लोक ७३-७४ अनुसार: तिथि स्वर, नक्षत्र नाड़ी एवं पंचतत्त्वों का संश्लेषित संरेखण"
              : "Shiva Swarodaya Verses 73–74: Cross-referencing Tithi Breath, Star Nadi, & 5 Elements"}
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center space-x-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 p-1 border border-stone-200 dark:border-stone-700 text-xs">
          <button
            onClick={() => setActiveSubTab("live")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
              activeSubTab === "live"
                ? "bg-white dark:bg-stone-700 text-amber-950 dark:text-amber-200 shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            {lang === "hi" ? "दैनिक सक्रिय संरेखण" : "Today's Alignment"}
          </button>
          <button
            onClick={() => setActiveSubTab("simulator")}
            className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1.5 font-bold transition-all ${
              activeSubTab === "simulator"
                ? "bg-white dark:bg-stone-700 text-amber-950 dark:text-amber-200 shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Sliders className="h-3 w-3" />
            <span>{lang === "hi" ? "परीक्षक / सिमुलेटर" : "Simulator"}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("tables")}
            className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1.5 font-bold transition-all ${
              activeSubTab === "tables"
                ? "bg-white dark:bg-stone-700 text-amber-950 dark:text-amber-200 shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <BookOpen className="h-3 w-3" />
            <span>{lang === "hi" ? "शास्त्र संदर्भ तालिका" : "Master Tables"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TODAY'S LIVE ALIGNMENT
         ========================================================================= */}
      {activeSubTab === "live" && (
        <div className="space-y-4">
          {/* Main Card */}
          <div className="rounded-xl border border-amber-200/90 bg-white/80 dark:bg-stone-900/60 p-4 sm:p-5 shadow-2xs space-y-4">
            {/* Top row: Status & Score */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-stone-200/70 dark:border-stone-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{liveAlignment.alignmentIcon}</span>
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-stone-500">
                    {lang === "hi" ? "स्वर-नक्षत्र संगति स्थिति" : "Nostril Alignment Status"}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {liveAlignment.alignmentStatus[lang]}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {renderRatingBadge(liveAlignment.alignmentRating)}
              </div>
            </div>

            {/* 3 Step Decomposition Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* 1. Tithi */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 p-3">
                <div className="flex items-center justify-between text-stone-500 pb-1.5 border-b border-stone-200/60 dark:border-stone-700/60">
                  <span className="font-bold flex items-center gap-1">
                    {liveAlignment.requiredNostril === "Left" ? (
                      <Moon className="h-3.5 w-3.5 text-sky-600" />
                    ) : (
                      <Sun className="h-3.5 w-3.5 text-orange-600" />
                    )}
                    <span>1. {lang === "hi" ? "तिथि" : "Tithi"}</span>
                  </span>
                  <span className="font-mono text-[10px]">Tithi #{liveAlignment.tithiNumber}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {liveAlignment.tithiName}
                  </div>
                  <div className="text-stone-600 dark:text-stone-300">
                    {lang === "hi" ? "अपेक्षित स्वर:" : "Required Nostril:"}{" "}
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {liveAlignment.requiredNostril === "Left"
                        ? lang === "hi"
                          ? "वाम / इड़ा (Left Nostril)"
                          : "Left (Ida / Lunar)"
                        : lang === "hi"
                          ? "दक्षिण / पिङ्गला (Right Nostril)"
                          : "Right (Pingala / Solar)"}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 italic">{liveAlignment.paksha}</div>
                </div>
              </div>

              {/* 2. Star (Zodiac) */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 p-3">
                <div className="flex items-center justify-between text-stone-500 pb-1.5 border-b border-stone-200/60 dark:border-stone-700/60">
                  <span className="font-bold flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-amber-600" />
                    <span>2. {lang === "hi" ? "नक्षत्र राशि" : "Zodiac"}</span>
                  </span>
                  <span className="font-mono text-[10px]">
                    Nak #{liveAlignment.nakshatraNumber}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {liveAlignment.nakshatraName}{" "}
                    {liveAlignment.selectedPada ? `(Pada ${liveAlignment.selectedPada})` : ""}
                  </div>
                  <div className="text-stone-600 dark:text-stone-300">
                    {lang === "hi" ? "पोषक स्वर:" : "Supported Nostril:"}{" "}
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {liveAlignment.starNostril === "Left"
                        ? lang === "hi"
                          ? "वाम / इड़ा (Left Nostril)"
                          : "Left (Ida / Lunar)"
                        : liveAlignment.starNostril === "Right"
                          ? lang === "hi"
                            ? "दक्षिण / पिङ्गला (Right Nostril)"
                            : "Right (Pingala / Solar)"
                          : lang === "hi"
                            ? "उभय (Mixed / Both)"
                            : "Mixed / Both Signs"}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {liveAlignment.activeRashiName} ({liveAlignment.activeRashiSanskrit})
                  </div>
                </div>
              </div>

              {/* 3. Star Element (Tattva) */}
              <div
                className={`rounded-xl border p-3 ${liveAlignment.tattvaDetails.badgeBg} ${liveAlignment.tattvaDetails.badgeBorder}`}
              >
                <div className="flex items-center justify-between text-stone-600 pb-1.5 border-b border-stone-300/60 dark:border-stone-700/60">
                  <span className="font-bold flex items-center gap-1">
                    {getTattvaIcon(liveAlignment.tattva)}
                    <span>3. {lang === "hi" ? "नक्षत्र तत्त्व" : "Star Element"}</span>
                  </span>
                  <span className="text-base">{liveAlignment.tattvaDetails.symbol}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {liveAlignment.tattvaDetails.name[lang]}
                  </div>
                  <div className="font-bold text-xs">
                    {liveAlignment.tattvaDetails.quality[lang]}
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-300 leading-tight">
                    {liveAlignment.tattvaDetails.application[lang]}
                  </div>
                </div>
              </div>
            </div>

            {/* Nakshatra Swara 1-Hour Start & End Windows */}
            {liveNakSwara && (liveNakSwara.startEvent || liveNakSwara.endEvent) && (
              <div className="rounded-xl border border-sky-300/80 bg-sky-50/70 dark:bg-sky-950/30 dark:border-sky-800 p-3.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-sky-950 dark:text-sky-200">
                    <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>
                      {lang === "hi"
                        ? "नक्षत्र नाड़ी कालखंड (आरंभ १ घंटा व समापन विपरीत १ घंटा)"
                        : "Nakshatra Nadi Alignment (1h Start & 1h Opposite End)"}
                    </span>
                  </div>
                  {liveNakSwara.hasOverlap && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 self-start sm:self-auto">
                      {lang === "hi" ? "संक्षिप्त नक्षत्र (<२ घंटे)" : "<2h Overlap Handled"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Start Event */}
                  {liveNakSwara.startEvent && (
                    <div
                      className={`rounded-lg p-2.5 border transition-all ${
                        isNakshatraSwaraEventActive(liveNakSwara.startEvent, nowMs)
                          ? "bg-amber-100/90 border-amber-500 shadow-xs ring-1 ring-amber-400 dark:bg-amber-950/70"
                          : "bg-white/80 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-stone-200 dark:border-stone-700">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-stone-600 dark:text-stone-300">
                          {lang === "hi"
                            ? "आरंभ नाड़ी (प्रथम १ घंटा)"
                            : "Starting Nadi (1st 1 Hour)"}
                        </span>
                        {isNakshatraSwaraEventActive(liveNakSwara.startEvent, nowMs) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-extrabold text-[8px] uppercase animate-pulse">
                            Active Now
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 font-mono font-bold text-stone-900 dark:text-stone-100 text-xs">
                        {liveNakSwara.startEvent.formattedRange ||
                          `${liveNakSwara.startEvent.formattedStart} → ${liveNakSwara.startEvent.formattedEnd}`}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            liveNakSwara.startEvent.nadi === "pingala"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-sky-700 dark:text-sky-300"
                          }`}
                        >
                          {liveNakSwara.startEvent.nadiLabel}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {liveNakSwara.startEvent.nadi === "pingala" ? "☀️ Pingala" : "🌙 Ida"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* End Event */}
                  {liveNakSwara.endEvent && (
                    <div
                      className={`rounded-lg p-2.5 border transition-all ${
                        isNakshatraSwaraEventActive(liveNakSwara.endEvent, nowMs)
                          ? "bg-amber-100/90 border-amber-500 shadow-xs ring-1 ring-amber-400 dark:bg-amber-950/70"
                          : "bg-white/80 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-stone-200 dark:border-stone-700">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-stone-600 dark:text-stone-300">
                          {lang === "hi"
                            ? "समापन नाड़ी (अंतिम १ घंटा, विपरीत)"
                            : "Ending Nadi (Opposite Final 1h)"}
                        </span>
                        {isNakshatraSwaraEventActive(liveNakSwara.endEvent, nowMs) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-extrabold text-[8px] uppercase animate-pulse">
                            Active Now
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 font-mono font-bold text-stone-900 dark:text-stone-100 text-xs">
                        {liveNakSwara.endEvent.formattedRange ||
                          `${liveNakSwara.endEvent.formattedStart} → ${liveNakSwara.endEvent.formattedEnd}`}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            liveNakSwara.endEvent.nadi === "pingala"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-sky-700 dark:text-sky-300"
                          }`}
                        >
                          {liveNakSwara.endEvent.nadiLabel}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {liveNakSwara.endEvent.nadi === "pingala"
                            ? "☀️ Pingala (Opposite)"
                            : "🌙 Ida (Opposite)"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Element Warning Box (Caution) */}
            <div
              className={`rounded-xl border p-3.5 flex items-start space-x-3 ${
                liveAlignment.tattva === "tejas"
                  ? "border-rose-300 bg-rose-50/80 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
                  : liveAlignment.tattva === "vayu"
                    ? "border-amber-300 bg-amber-50/80 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                    : "border-sky-300 bg-sky-50/80 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
              }`}
            >
              <span className="text-lg shrink-0 mt-0.5">
                {liveAlignment.tattva === "tejas" || liveAlignment.tattva === "vayu" ? "⚠️" : "💡"}
              </span>
              <div className="space-y-0.5 text-xs">
                <span className="font-bold uppercase tracking-wider block">
                  {lang === "hi"
                    ? "तत्त्व प्रभाव एवं चेतावनी (Element Warning)"
                    : "Element Quality & Advisory"}
                </span>
                <p className="leading-relaxed">{liveAlignment.elementWarning[lang]}</p>
              </div>
            </div>

            {/* Synthesized Cosmic Advice */}
            <div className="rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 to-orange-50/80 dark:from-stone-800 dark:to-stone-800/80 p-4 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-amber-950 dark:text-amber-200">
                <Sparkles className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span>
                  {lang === "hi"
                    ? "क्रियात्मक स्वर मार्गदर्शन (Cosmic Advice)"
                    : "Synthesized Cosmic Advice"}
                </span>
              </div>
              <p className="text-stone-800 dark:text-stone-200 text-sm font-medium leading-relaxed">
                "{liveAlignment.advice[lang]}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INTERACTIVE SIMULATOR / TESTER
         ========================================================================= */}
      {activeSubTab === "simulator" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200/90 bg-white/80 dark:bg-stone-900/60 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-stone-200/70 dark:border-stone-800">
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-amber-600" />
                  <span>
                    {lang === "hi"
                      ? "स्वर-नक्षत्र संरेखण सिम्युलेटर"
                      : "Cosmic Alignment Simulator"}
                  </span>
                </h4>
                <p className="text-xs text-stone-500">
                  {lang === "hi"
                    ? "किसी भी तिथि, नक्षत्र व चरण का चयन कर परिणाम तुरंत जांचें"
                    : "Select any lunar Tithi & Nakshatra to evaluate instant breath alignment"}
                </p>
              </div>

              {/* Quick load button for the reference test case */}
              <button
                onClick={loadReferenceTestCase}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-amber-400 bg-amber-100/70 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition-colors shadow-2xs"
              >
                <Flame className="h-3.5 w-3.5 text-red-600" />
                <span>
                  {lang === "hi"
                    ? "उदाहरण लोड करें: शुक्ल प्रतिपदा + पुष्य"
                    : "Load Example: Shukla Pratipada + Pushya"}
                </span>
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tithi Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {lang === "hi" ? "१. तिथि का चयन करें:" : "1. Select Lunar Day (Tithi):"}
                </label>
                <select
                  value={customTithi}
                  onChange={(e) => setCustomTithi(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {SWARA_CYCLE_RULES.map((r) => (
                    <option key={r.dayNumber} value={r.dayNumber}>
                      Day {r.dayNumber}: {r.tithiName} ({r.paksha}) → {r.sunriseNostril}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nakshatra Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {lang === "hi" ? "२. नक्षत्र का चयन करें:" : "2. Select Nakshatra:"}
                </label>
                <select
                  value={customNak}
                  onChange={(e) => setCustomNak(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {Object.values(NAKSHATRA_NADI_DEFINITIONS).map((nak) => (
                    <option key={nak.nakshatraNumber} value={nak.nakshatraNumber}>
                      #{nak.nakshatraNumber}: {nak.nakshatraName} (
                      {TATTVA_MASTER_TABLE[nak.tattva].symbol}{" "}
                      {TATTVA_MASTER_TABLE[nak.tattva].name.en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pada Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {lang === "hi" ? "३. नक्षत्र चरण:" : "3. Nakshatra Pada (Quarter):"}
                </label>
                <select
                  value={customPada}
                  onChange={(e) => setCustomPada(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value={1}>Pada 1 (प्रथम चरण)</option>
                  <option value={2}>Pada 2 (द्वितीय चरण)</option>
                  <option value={3}>Pada 3 (तृतीय चरण)</option>
                  <option value={4}>Pada 4 (चतुर्थ चरण)</option>
                </select>
              </div>
            </div>

            {/* Simulated Output Card */}
            <div className="rounded-xl border border-amber-300 bg-stone-50/80 dark:bg-stone-800/80 p-4 space-y-3 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{simAlignment.alignmentIcon}</span>
                  <div>
                    <div className="text-xs uppercase font-bold text-stone-500">
                      {lang === "hi" ? "सिमुलेटेड संरेखण परिणाम" : "Simulated Alignment Result"}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                      {simAlignment.alignmentStatus[lang]}
                    </div>
                  </div>
                </div>

                <div>{renderRatingBadge(simAlignment.alignmentRating)}</div>
              </div>

              {/* Detail pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-white dark:bg-stone-700/80 p-2.5 border border-stone-200 dark:border-stone-600">
                  <span className="text-stone-500 block text-[11px]">
                    {lang === "hi" ? "तिथि नियम:" : "Tithi Breath Required:"}
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {simAlignment.requiredNostril} Nostril (
                    {simAlignment.requiredNadi === "ida" ? "Ida" : "Pingala"})
                  </span>
                </div>

                <div className="rounded-lg bg-white dark:bg-stone-700/80 p-2.5 border border-stone-200 dark:border-stone-600">
                  <span className="text-stone-500 block text-[11px]">
                    {lang === "hi" ? "नक्षत्र राशि पोषण:" : "Star Channel Support:"}
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {simAlignment.starNostril} Nostril ({simAlignment.activeRashiName})
                  </span>
                </div>

                <div className="rounded-lg bg-white dark:bg-stone-700/80 p-2.5 border border-stone-200 dark:border-stone-600">
                  <span className="text-stone-500 block text-[11px]">
                    {lang === "hi" ? "तत्त्व प्रकृति:" : "Star Element:"}
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                    <span>{simAlignment.tattvaDetails.symbol}</span>
                    <span>{simAlignment.tattvaDetails.name[lang]}</span>
                  </span>
                </div>
              </div>

              {/* Nakshatra Nadi Alignment */}
              <div className="rounded-lg border border-sky-300/80 bg-sky-50/70 dark:bg-stone-700/60 p-3 text-xs space-y-2">
                <div className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>
                    {lang === "hi"
                      ? "नक्षत्र नाड़ी (आरंभ व समापन)"
                      : "Nakshatra Nadi (Start & End)"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-white dark:bg-stone-800 p-2 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      {lang === "hi" ? "आरंभ नाड़ी" : "Starting Nadi"}
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {simRule.startNadi === "ida"
                        ? lang === "hi"
                          ? "इड़ा नाड़ी / बायाँ स्वर (Ida / Left)"
                          : "Ida Nadi / Left Nostril"
                        : lang === "hi"
                          ? "पिंगला नाड़ी / दायाँ स्वर (Pingala / Right)"
                          : "Pingala Nadi / Right Nostril"}
                    </span>
                  </div>

                  <div className="rounded bg-white dark:bg-stone-800 p-2 border border-stone-200 dark:border-stone-700">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      {lang === "hi" ? "समापन नाड़ी" : "Ending Nadi"}
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {simRule.endNadi === "ida"
                        ? lang === "hi"
                          ? "इड़ा नाड़ी / बायाँ स्वर"
                          : "Ida Nadi / Left Nostril"
                        : lang === "hi"
                          ? "पिंगला नाड़ी / दायाँ स्वर"
                          : "Pingala Nadi / Right Nostril"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advice */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-stone-700 p-3 text-xs">
                <span className="font-bold text-amber-950 dark:text-amber-200 block mb-0.5">
                  {lang === "hi"
                    ? "संश्लेषित शास्त्र सम्मत परामर्श:"
                    : "Vedic Synthesis & Advisory:"}
                </span>
                <p className="text-stone-800 dark:text-stone-200 text-xs font-medium leading-relaxed">
                  "{simAlignment.advice[lang]}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SCRIPTURAL REFERENCE TABLES
         ========================================================================= */}
      {activeSubTab === "tables" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs">
            <button
              onClick={() => setSelectedTableTab("tattvas")}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                selectedTableTab === "tattvas"
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              1.{" "}
              {lang === "hi"
                ? "नक्षत्र-तत्त्व सारणी (28 नक्षत्र)"
                : "Nakshatra-Tattva Master Table (28 Stars)"}
            </button>
            <button
              onClick={() => setSelectedTableTab("rashis")}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                selectedTableTab === "rashis"
                  ? "bg-amber-500 text-white"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              2.{" "}
              {lang === "hi"
                ? "राशि-नाड़ी सारणी (श्लोक ७३-७४)"
                : "Zodiac-Nadi Table (Verses 73–74)"}
            </button>
          </div>

          {/* Table 1: Tattvas */}
          {selectedTableTab === "tattvas" && (
            <div className="space-y-3">
              <div className="text-xs text-stone-600 dark:text-stone-300 italic">
                {lang === "hi"
                  ? "शिवस्वरोदय शास्त्र अनुसार २८ नक्षत्रों (अभिजीत सहित) का पंचतत्त्वों में वर्गीकरण तथा उनका फल:"
                  : "Vedic classification of all 28 Stars (including Abhijit) into the 5 Elements (Tattvas) and their functional qualities:"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Earth */}
                <div className="rounded-xl border border-amber-300 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">🌍</span>
                      <span>
                        {lang === "hi" ? "पृथ्वी तत्त्व (Earth / Prithvi)" : "Earth (Prithvi)"}
                      </span>
                    </span>
                    <span className="rounded-full bg-amber-200 dark:bg-amber-900 px-2 py-0.5 text-[10px]">
                      {lang === "hi" ? "स्थिर कार्यसिद्धि" : "Steady Success"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 dark:text-stone-300">
                    <strong className="block text-amber-900 dark:text-amber-300">
                      {lang === "hi" ? "संबंधित नक्षत्र (Stars):" : "Included Stars:"}
                    </strong>
                    Dhanishta, Rohini, Jyeshtha, Anuradha, Shravana, Abhijit, Uttarashada
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-900/50 p-2 rounded-lg">
                    <strong>{lang === "hi" ? "उपयोग:" : "Application:"}</strong>{" "}
                    {TATTVA_MASTER_TABLE.prithvi.application[lang]}
                  </div>
                </div>

                {/* Water */}
                <div className="rounded-xl border border-sky-300 bg-sky-50/60 dark:bg-sky-950/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-sky-950 dark:text-sky-200">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">💧</span>
                      <span>{lang === "hi" ? "जल तत्त्व (Water / Jala)" : "Water (Jala)"}</span>
                    </span>
                    <span className="rounded-full bg-sky-200 dark:bg-sky-900 px-2 py-0.5 text-[10px]">
                      {lang === "hi" ? "द्रव लाभ एवं शांति" : "Fluid Gain"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 dark:text-stone-300">
                    <strong className="block text-sky-900 dark:text-sky-300">
                      {lang === "hi" ? "संबंधित नक्षत्र (Stars):" : "Included Stars:"}
                    </strong>
                    Purvashada, Ashlesha, Mula, Ardra, Revati, Uttara Bhadrapada, Shatabhisha
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-900/50 p-2 rounded-lg">
                    <strong>{lang === "hi" ? "उपयोग:" : "Application:"}</strong>{" "}
                    {TATTVA_MASTER_TABLE.jala.application[lang]}
                  </div>
                </div>

                {/* Fire */}
                <div className="rounded-xl border border-rose-300 bg-rose-50/60 dark:bg-rose-950/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-rose-950 dark:text-rose-200">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">🔥</span>
                      <span>{lang === "hi" ? "अग्नि तत्त्व (Fire / Tejas)" : "Fire (Tejas)"}</span>
                    </span>
                    <span className="rounded-full bg-rose-200 dark:bg-rose-900 px-2 py-0.5 text-[10px]">
                      {lang === "hi" ? "उग्रता व ऊर्जा" : "Aggression / Loss"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 dark:text-stone-300">
                    <strong className="block text-rose-900 dark:text-rose-300">
                      {lang === "hi" ? "संबंधित नक्षत्र (Stars):" : "Included Stars:"}
                    </strong>
                    Bharani, Krittika, Pushya, Magha, Purva Phalguni, Purva Bhadrapada, Swati
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-900/50 p-2 rounded-lg">
                    <strong>{lang === "hi" ? "उपयोग व चेतावनी:" : "Application & Warning:"}</strong>{" "}
                    {TATTVA_MASTER_TABLE.tejas.application[lang]}
                  </div>
                </div>

                {/* Air */}
                <div className="rounded-xl border border-slate-300 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-950 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">🌬️</span>
                      <span>{lang === "hi" ? "वायु तत्त्व (Air / Vayu)" : "Air (Vayu)"}</span>
                    </span>
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px]">
                      {lang === "hi" ? "चंचलता व गति" : "Movement / Instability"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 dark:text-stone-300">
                    <strong className="block text-slate-900 dark:text-slate-300">
                      {lang === "hi" ? "संबंधित नक्षत्र (Stars):" : "Included Stars:"}
                    </strong>
                    Vishakha, Uttara Phalguni, Hasta, Chitra, Punarvasu, Ashwini, Mrigashira
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-900/50 p-2 rounded-lg">
                    <strong>{lang === "hi" ? "उपयोग व चेतावनी:" : "Application & Warning:"}</strong>{" "}
                    {TATTVA_MASTER_TABLE.vayu.application[lang]}
                  </div>
                </div>

                {/* Ether (Full width) */}
                <div className="sm:col-span-2 rounded-xl border border-purple-300 bg-purple-50/60 dark:bg-purple-950/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-bold text-purple-950 dark:text-purple-200">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">🌌</span>
                      <span>{lang === "hi" ? "आकाश तत्त्व (Ether / Akash)" : "Ether (Akash)"}</span>
                    </span>
                    <span className="rounded-full bg-purple-200 dark:bg-purple-900 px-2 py-0.5 text-[10px]">
                      {lang === "hi" ? "शून्य / आध्यात्मिक" : "Null / Spiritual Only"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 dark:text-stone-300">
                    <em>
                      {lang === "hi"
                        ? "विशेष नक्षत्र आवंटित नहीं (संधिकाल, शून्य अथवा सुषुम्णा का प्रतीक)।"
                        : "Not assigned specific stars (Represents the void, transition, or Sushumna)."}
                    </em>
                  </div>
                  <div className="text-[10px] text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-900/50 p-2 rounded-lg">
                    <strong>{lang === "hi" ? "उपयोग:" : "Application:"}</strong>{" "}
                    {TATTVA_MASTER_TABLE.akash.application[lang]}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table 2: Rashis */}
          {selectedTableTab === "rashis" && (
            <div className="space-y-3">
              {/* Scriptural Verse */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-stone-800/80 p-3 text-center text-xs">
                <p className="font-devanagari font-bold text-amber-950 dark:text-amber-200">
                  ॥ मेषे मिथुन सिंहे च तुलायां चाप कुम्भयोः । प्रवहते यदा सूर्यः तदा सिद्ध्यन्ति वै
                  क्रियाः ॥
                  <br />॥ वृषे कर्के च कन्यायां वृश्चिके मकरे तथा । मीने प्रवहते चन्द्रः सिद्ध्यन्ति
                  शुभकर्मणि ॥
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 italic">
                  — शिवस्वरोदय (श्लोक ७३-७४)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Pingala / Right Column */}
                <div className="rounded-xl border border-orange-300 bg-orange-50/40 dark:bg-orange-950/20 p-3.5 space-y-2.5">
                  <div className="flex items-center space-x-1.5 font-bold text-orange-900 dark:text-orange-200 pb-2 border-b border-orange-200 dark:border-orange-800">
                    <Sun className="h-4 w-4 text-orange-600" />
                    <span>
                      {lang === "hi"
                        ? "दायां नथुना (पिङ्गला) राशियाँ — विषम राशियां"
                        : "Right Nostril (Pingala) Stars — Odd Signs"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ZODIAC_NADI_MASTER_TABLE.filter((z) => z.nadi === "pingala").map((z) => (
                      <div
                        key={z.rashiNumber}
                        className="rounded-lg bg-white/80 dark:bg-stone-800/80 p-2.5 border border-orange-200/80 dark:border-stone-700 space-y-0.5"
                      >
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                          <span>
                            {z.sanskritName} ({z.rashiName})
                          </span>
                          <span className="font-mono text-[10px] text-stone-500">
                            Sign #{z.rashiNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-stone-300">
                          {z.starsIncluded[lang]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ida / Left Column */}
                <div className="rounded-xl border border-sky-300 bg-sky-50/40 dark:bg-sky-950/20 p-3.5 space-y-2.5">
                  <div className="flex items-center space-x-1.5 font-bold text-sky-900 dark:text-sky-200 pb-2 border-b border-sky-200 dark:border-sky-800">
                    <Moon className="h-4 w-4 text-sky-600" />
                    <span>
                      {lang === "hi"
                        ? "बायां नथुना (इड़ा) राशियाँ — सम राशियां"
                        : "Left Nostril (Ida) Stars — Even Signs"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ZODIAC_NADI_MASTER_TABLE.filter((z) => z.nadi === "ida").map((z) => (
                      <div
                        key={z.rashiNumber}
                        className="rounded-lg bg-white/80 dark:bg-stone-800/80 p-2.5 border border-sky-200/80 dark:border-stone-700 space-y-0.5"
                      >
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                          <span>
                            {z.sanskritName} ({z.rashiName})
                          </span>
                          <span className="font-mono text-[10px] text-stone-500">
                            Sign #{z.rashiNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-stone-300">
                          {z.starsIncluded[lang]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
