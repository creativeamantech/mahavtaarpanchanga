import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  HeartHandshake,
  Zap,
  Clock,
  Printer,
  Download,
  User,
  Sparkles,
  Timer,
  ChevronRight,
  Calendar,
  Layers,
} from "lucide-react";
import {
  NAKSHATRA_NAMES,
  calculateNavtara,
  generateNavtaraTable,
  type NavtaraResult,
} from "../lib/navtaraEngine";
import {
  generateComprehensiveVedicAnalysis,
  VIMSHOTTARI_SEQUENCE,
} from "../lib/vedicAstrologyEngine";
import type { AppTheme, PanchangaResponse } from "../types";
import { translations, type Language } from "../i18n";
import { PrintableNavtaraReport } from "./PrintableNavtaraReport";
import {
  ALL_27_NAKSHATRAS,
  getActiveNakshatraChangeInfo,
  getUpcomingNakshatraTransitions,
  PADA_EXPLANATIONS,
} from "../lib/nakshatraTransitionHelper";

interface NavtaraViewProps {
  data: PanchangaResponse | null;
  lang: Language;
  theme: AppTheme;
  birthNakshatra: number;
  onBirthNakshatraChange?: (n: number) => void;
}

const TARA_COLORS: Record<string, string> = {
  "Highly Auspicious": "bg-emerald-100 text-emerald-800 border-emerald-300",
  Auspicious: "bg-green-100 text-green-800 border-green-300",
  "Neutral / Mixed": "bg-stone-100 text-stone-700 border-stone-300",
  Neutral: "bg-stone-100 text-stone-700 border-stone-300",
  Inauspicious: "bg-orange-100 text-orange-800 border-orange-300",
  "Severely Inauspicious": "bg-rose-100 text-rose-800 border-rose-300",
};

export function NavtaraView({
  data,
  lang,
  theme,
  birthNakshatra,
  onBirthNakshatraChange,
}: NavtaraViewProps) {
  const isNight = theme === "nightSky";
  const isHindi = lang === "hi";

  const [personName, setPersonName] = useState<string>("स्वयं (Self)");
  const [birthPada, setBirthPada] = useState<number>(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [table, setTable] = useState<NavtaraResult[]>([]);
  const [kendraPlanet, setKendraPlanet] = useState("Jupiter");
  const [moonLongitude, setMoonLongitude] = useState(0);

  // Real-time ticking state for exact countdowns
  const [nowMs, setNowMs] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTable(generateNavtaraTable(birthNakshatra));
    // Approximate Moon Longitude for the middle of the selected Nakshatra & pada
    setMoonLongitude((birthNakshatra - 1) * 13.3333333 + (birthPada - 0.5) * 3.3333333);
  }, [birthNakshatra, birthPada]);

  // Real-time Nakshatra change calculation
  const changeInfo = useMemo(() => {
    return getActiveNakshatraChangeInfo(data, nowMs);
  }, [data, nowMs]);

  const upcomingIngresses = useMemo(() => {
    return getUpcomingNakshatraTransitions(data);
  }, [data]);

  const currentNakshatraIndex = changeInfo?.currentNumber || data?.nakshatra?.[0]?.number || 1;
  const nextNakshatraIndex = changeInfo?.nextNumber || ((currentNakshatraIndex % 27) + 1);

  const currentTara = useMemo(() => {
    return currentNakshatraIndex > 0 ? calculateNavtara(birthNakshatra, currentNakshatraIndex) : null;
  }, [birthNakshatra, currentNakshatraIndex]);

  const nextTara = useMemo(() => {
    return nextNakshatraIndex > 0 ? calculateNavtara(birthNakshatra, nextNakshatraIndex) : null;
  }, [birthNakshatra, nextNakshatraIndex]);

  const currentMeta = ALL_27_NAKSHATRAS.find((n) => n.index === currentNakshatraIndex) || ALL_27_NAKSHATRAS[0];
  const nextMeta = ALL_27_NAKSHATRAS.find((n) => n.index === nextNakshatraIndex) || ALL_27_NAKSHATRAS[1];
  const selectedBirthMeta = ALL_27_NAKSHATRAS.find((n) => n.index === birthNakshatra) || ALL_27_NAKSHATRAS[0];

  // Comprehensive Vedic Analysis
  const vedicAnalysis = useMemo(() => {
    return generateComprehensiveVedicAnalysis(
      moonLongitude,
      kendraPlanet,
      currentNakshatraIndex > 0
        ? {
            target_nakshatra_num: currentNakshatraIndex,
            planet: "Moon",
            ashtakavarga_rekhas: 5, // High Rekhas for Vedha check
          }
        : undefined,
    );
  }, [moonLongitude, kendraPlanet, currentNakshatraIndex]);

  return (
    <div id="navtara-view-container" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Action & Report Banner */}
      <div
        className={`p-6 rounded-2xl border backdrop-blur-xl shadow-lg relative overflow-hidden transition-colors ${
          isNight
            ? "bg-[#0b101e]/90 border-indigo-900/50"
            : "bg-white border-stone-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Compass className="w-5 h-5" />
              </span>
              <h2
                className={`text-xl sm:text-2xl font-bold font-devanagari ${
                  isNight ? "text-slate-100" : "text-stone-900"
                }`}
              >
                {isHindi ? "नवतारा चक्र एवं नक्षत्र गोचर रिपोर्ट" : "Navtara Chakra & Nakshatra Transit Report"}
              </h2>
            </div>
            <p className={`text-sm max-w-xl leading-relaxed ${isNight ? "text-slate-400" : "text-stone-600"}`}>
              {isHindi
                ? "किसी भी जातक के जन्म नक्षत्र के अनुसार 27 नक्षत्रों का त्रिपर्याय नवतारा चक्र, वर्तमान नक्षत्र परिवर्तन समय तथा शास्त्रोक्त परिहार।"
                : "Astrological 27-star Navtara matrix, real-time Nakshatra transition timings, and personalized classical Vedic remedies."}
            </p>
          </div>

          {/* Export PDF Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              id="open-navtara-pdf-btn"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isHindi ? "सम्पूर्ण मासिक रिपोर्ट (PDF)" : "Export Monthly PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NATIVE / PERSON PROFILE CONFIGURATION CARD */}
      <div
        id="native-selector-card"
        className={`p-6 rounded-2xl border shadow-md relative overflow-hidden transition-colors ${
          isNight
            ? "bg-[#0f172a]/90 border-indigo-900/60"
            : "bg-gradient-to-br from-amber-50/50 to-white border-amber-200/80"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 mb-4 border-amber-900/10 dark:border-indigo-900/40">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isNight ? "text-amber-400" : "text-amber-900"}`}>
              {isHindi ? "जातक विवरण चयन (Select Person for Report)" : "Native Astral Configuration"}
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {isHindi ? "किसी के भी नक्षत्र की रिपोर्ट निकालें" : "Generate Report For Anyone"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Native Name Input */}
          <div className="sm:col-span-4">
            <label className={`block text-xs font-bold mb-1.5 ${isNight ? "text-slate-300" : "text-stone-700"}`}>
              {isHindi ? "जातक / व्यक्ति का नाम" : "Person / Native Name"}
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder={isHindi ? "जैसे: राहुल शर्मा / स्वयं" : "e.g. Rahul Sharma / Self"}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                isNight
                  ? "bg-black/50 border-indigo-900/80 text-slate-100"
                  : "bg-white border-stone-300 text-stone-900"
              }`}
            />
          </div>

          {/* Birth Nakshatra Selector */}
          <div className="sm:col-span-5">
            <label className={`block text-xs font-bold mb-1.5 ${isNight ? "text-slate-300" : "text-stone-700"}`}>
              {isHindi ? "जन्म नक्षत्र (Birth Nakshatra)" : "Janma Nakshatra (Birth Star)"}
            </label>
            <select
              value={birthNakshatra}
              onChange={(e) => onBirthNakshatraChange?.(Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer ${
                isNight
                  ? "bg-black/50 border-indigo-900/80 text-slate-100"
                  : "bg-white border-stone-300 text-stone-900"
              }`}
            >
              {ALL_27_NAKSHATRAS.map((nak) => (
                <option key={nak.index} value={nak.index}>
                  {nak.index}. {nak.nameHi} ({nak.nameEn}) — {isHindi ? nak.lordHi : nak.lord}
                </option>
              ))}
            </select>
          </div>

          {/* Pada Selector */}
          <div className="sm:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-xs font-bold ${isNight ? "text-slate-300" : "text-stone-700"}`}>
                {isHindi ? "नक्षत्र चरण (पद 1, 2, 3, 4)" : "Star Pada (1-4)"}
              </label>
              <span className={`text-[10px] font-semibold ${isNight ? "text-amber-400" : "text-amber-800"}`}>
                {PADA_EXPLANATIONS[birthPada]?.purusharthaHi.split(" ")[0]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBirthPada(p)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    birthPada === p
                      ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                      : isNight
                        ? "bg-black/30 border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Quick Pada Explanation Badge */}
            <div className={`mt-2 p-2 rounded-lg text-[11px] font-sans border ${
              isNight
                ? "bg-indigo-950/40 border-indigo-900/60 text-slate-300"
                : "bg-amber-50/80 border-amber-200 text-amber-950"
            }`}>
              <div className="font-bold font-devanagari text-xs mb-0.5">
                {isHindi ? PADA_EXPLANATIONS[birthPada]?.nameHi : PADA_EXPLANATIONS[birthPada]?.nameEn}:{" "}
                {isHindi ? PADA_EXPLANATIONS[birthPada]?.purusharthaHi : PADA_EXPLANATIONS[birthPada]?.purusharthaEn}
              </div>
              <p className="text-[10px] opacity-90 leading-tight">
                {isHindi ? PADA_EXPLANATIONS[birthPada]?.shortSummaryHi : PADA_EXPLANATIONS[birthPada]?.shortSummaryEn}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Nakshatra Badges */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-indigo-900/40 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className={`px-2.5 py-1 rounded-md font-semibold ${isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"}`}>
            <strong>{isHindi ? "स्वामी:" : "Lord:"}</strong> {isHindi ? selectedBirthMeta.lordHi : selectedBirthMeta.lord}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-semibold ${isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"}`}>
            <strong>{isHindi ? "देवता:" : "Deity:"}</strong> {isHindi ? selectedBirthMeta.deityHi : selectedBirthMeta.deity}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-semibold ${isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"}`}>
            <strong>{isHindi ? "तत्व:" : "Tattva:"}</strong> {isHindi ? selectedBirthMeta.tattvaHi : selectedBirthMeta.tattva}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-semibold ${isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"}`}>
            <strong>{isHindi ? "गण:" : "Gana:"}</strong> {isHindi ? selectedBirthMeta.ganaHi : selectedBirthMeta.gana}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-semibold ${isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"}`}>
            <strong>{isHindi ? "नाड़ी:" : "Nadi:"}</strong> {isHindi ? selectedBirthMeta.nadiHi : selectedBirthMeta.nadi}
          </span>
        </div>
      </div>

      {/* Gandanta & Moola Warning (If applicable) */}
      {vedicAnalysis.natal_nakshatra_info.is_gandanta && (
        <div
          className={`p-5 rounded-xl border flex items-start gap-4 animate-in fade-in duration-300 ${
            isNight
              ? "bg-rose-950/20 border-rose-900/50"
              : "bg-rose-50 border-rose-200"
          }`}
        >
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className={`font-bold mb-1 ${isNight ? "text-rose-400" : "text-rose-700"}`}>
              {vedicAnalysis.natal_nakshatra_info.gandanta_type} {isHindi ? "उपस्थिति" : "Detected"}
            </h3>
            <p className={`text-sm mb-3 ${isNight ? "text-rose-200/70" : "text-rose-800/70"}`}>
              {isHindi
                ? "जातक का जन्म नक्षत्र संधि स्थल (गण्डान्त क्षेत्र) में पड़ता है। शास्त्रानुसार शान्ति अथवा परिहार करना श्रेयस्कर है।"
                : "Your birth degree falls near a critical junction (Gandanta). Special parihara is traditionally advised."}
            </p>
            {vedicAnalysis.remedial_measures.gandanta_parihara && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-3 rounded-lg border ${
                    isNight ? "bg-black/40 border-rose-900/30 text-rose-200" : "bg-white/70 border-rose-100 text-stone-800"
                  }`}
                >
                  <span className="block font-bold mb-1 opacity-80">{isHindi ? "विहित अनुष्ठान" : "Ritual"}</span>
                  {vedicAnalysis.remedial_measures.gandanta_parihara.ritual}
                </div>
                <div
                  className={`p-3 rounded-lg border ${
                    isNight ? "bg-black/40 border-rose-900/30 text-rose-200" : "bg-white/70 border-rose-100 text-stone-800"
                  }`}
                >
                  <span className="block font-bold mb-1 opacity-80">{isHindi ? "हवन" : "Havana"}</span>
                  {vedicAnalysis.remedial_measures.gandanta_parihara.havana}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAKSHATRA TRANSITION TIMINGS CARD (नक्षत्र कब चेंज हो रहे हैं) */}
      <div
        id="nakshatra-change-timeline-card"
        className={`p-6 rounded-2xl border shadow-md relative overflow-hidden transition-colors ${
          isNight
            ? "bg-slate-900/70 border-indigo-900/50"
            : "bg-white border-stone-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-5 border-stone-200 dark:border-indigo-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-devanagari ${isNight ? "text-slate-100" : "text-stone-900"}`}>
                {isHindi ? "नक्षत्र कब चेंज हो रहे हैं? (नक्षत्र परिवर्तन समय)" : "When Are Nakshatras Changing? (Transition Times)"}
              </h3>
              <p className={`text-xs ${isNight ? "text-slate-400" : "text-stone-500"}`}>
                {isHindi
                  ? "वर्तमान सक्रिय नक्षत्र की समाप्ति, समय शेष, एवं आगामी नक्षत्र परिवर्तन का विवरण"
                  : "Active sky nakshatra duration, transition moments, time remaining, and upcoming ingress"}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isHindi ? "लाइव गोचर स्थिति" : "Live Sky Status"}
          </span>
        </div>

        {/* Active vs Next Nakshatra Transition Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Active Nakshatra Now */}
          <div
            className={`p-5 rounded-xl border relative ${
              isNight ? "bg-black/30 border-slate-700/60" : "bg-stone-50 border-stone-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {isHindi ? "वर्तमान सक्रिय नक्षत्र (Active Now)" : "Currently Running Star"}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                #{currentMeta.index} / 27
              </span>
            </div>

            <div className="text-xl font-black font-devanagari text-stone-900 dark:text-slate-100 mb-1">
              {currentMeta.index}. {isHindi ? currentMeta.nameHi : currentMeta.nameEn}
            </div>

            <div className="text-xs text-stone-600 dark:text-slate-300 flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span><strong>{isHindi ? "स्वामी:" : "Lord:"}</strong> {isHindi ? currentMeta.lordHi : currentMeta.lord}</span>
              <span><strong>{isHindi ? "देवता:" : "Deity:"}</strong> {isHindi ? currentMeta.deityHi : currentMeta.deity}</span>
            </div>

            {/* Timing Row */}
            <div className="space-y-2 text-xs border-t pt-3 border-stone-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-slate-400">
                  {isHindi ? "परिवर्तन / समाप्ति समय:" : "Changes / Ends At:"}
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                  {changeInfo?.endsFormatted || "Throughout cycle"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-slate-400">
                  {isHindi ? "परिवर्तन में शेष समय:" : "Time Remaining:"}
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {changeInfo?.timeRemainingFormatted || "—"}
                </span>
              </div>

              {/* Progress Bar */}
              {changeInfo?.progressPercentage != null && (
                <div className="pt-1">
                  <div className="w-full bg-stone-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${changeInfo.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>{changeInfo.startsFormatted}</span>
                    <span>{changeInfo.progressPercentage}% {isHindi ? "व्यतीत" : "elapsed"}</span>
                    <span>{changeInfo.endsFormatted || "Next Sunrise"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Tara for Native */}
            {currentTara && (
              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-stone-600 dark:text-slate-400 font-semibold">
                  {personName} {isHindi ? "के लिए तारा:" : "Tara:"}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${TARA_COLORS[currentTara.nature] || TARA_COLORS["Neutral / Mixed"]}`}>
                  {currentTara.tara_name} Tara ({currentTara.tara_score}%)
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Incoming Next Nakshatra */}
          <div
            className={`p-5 rounded-xl border relative ${
              isNight ? "bg-black/30 border-slate-700/60" : "bg-stone-50 border-stone-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {isHindi ? "आगामी अगला नक्षत्र (Upcoming Ingress)" : "Upcoming Next Star"}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                #{nextMeta.index} / 27
              </span>
            </div>

            <div className="text-xl font-black font-devanagari text-stone-900 dark:text-slate-100 mb-1">
              {nextMeta.index}. {isHindi ? nextMeta.nameHi : nextMeta.nameEn}
            </div>

            <div className="text-xs text-stone-600 dark:text-slate-300 flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span><strong>{isHindi ? "स्वामी:" : "Lord:"}</strong> {isHindi ? nextMeta.lordHi : nextMeta.lord}</span>
              <span><strong>{isHindi ? "देवता:" : "Deity:"}</strong> {isHindi ? nextMeta.deityHi : nextMeta.deity}</span>
            </div>

            {/* Timing Row */}
            <div className="space-y-2 text-xs border-t pt-3 border-stone-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-slate-400">
                  {isHindi ? "प्रारंभ समय (प्रवेश):" : "Starts at:"}
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                  {changeInfo?.endsFormatted || "Next Sunrise"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-slate-400">
                  {isHindi ? "प्रकृति (Nature):" : "Nature:"}
                </span>
                <span className="font-semibold text-stone-700 dark:text-slate-300">
                  {isHindi ? nextMeta.natureHi : nextMeta.nature}
                </span>
              </div>

              {/* Tara Transition Alert for the Native */}
              {nextTara && currentTara && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 text-xs text-stone-800 dark:text-slate-200 leading-relaxed">
                  <strong>{isHindi ? "तारा परिवर्तन चेतावनी:" : "Transition Outlook:"} </strong>
                  {isHindi ? (
                    <>
                      {changeInfo?.endsFormatted || "परिवर्तन"} के पश्चात यह{" "}
                      <strong className="text-amber-800 dark:text-amber-300">{nextTara.tara_name} तारा ({nextTara.nature})</strong> में प्रवेश करेगा।
                    </>
                  ) : (
                    <>
                      After {changeInfo?.endsFormatted || "transition"}, the Tara switches to{" "}
                      <strong className="text-amber-800 dark:text-amber-300">{nextTara.tara_name} Tara ({nextTara.nature})</strong>.
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Next Tara for Native */}
            {nextTara && (
              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-stone-600 dark:text-slate-400 font-semibold">
                  {isHindi ? "परिवर्तन उपरांत तारा:" : "Next Resulting Tara:"}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${TARA_COLORS[nextTara.nature] || TARA_COLORS["Neutral / Mixed"]}`}>
                  {nextTara.tara_name} Tara ({nextTara.tara_score}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Planetary Nakshatra Ingress Schedule */}
        {upcomingIngresses.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isNight ? "text-slate-300" : "text-stone-700"}`}>
                {isHindi ? "आगामी ग्रह नक्षत्र गोचर समय सूची (Planetary Nakshatra Transitions)" : "Upcoming Planetary Nakshatra Ingress Schedule"}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {upcomingIngresses.slice(0, 6).map((ev, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    isNight ? "bg-black/20 border-slate-800 text-slate-200" : "bg-stone-50 border-stone-200 text-stone-800"
                  }`}
                >
                  <div>
                    <div className="font-bold font-devanagari text-amber-700 dark:text-amber-400">
                      {isHindi ? ev.planetHi : ev.planet}
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-slate-400">
                      {ev.fromNakshatra} ➔ <strong className="text-stone-900 dark:text-white">{ev.toNakshatra}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono font-bold text-stone-700 dark:text-slate-300 text-[11px]">
                      {ev.exactDate}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {ev.exactTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's Transit Card (Detailed) */}
      {currentTara && (
        <div
          className={`p-6 rounded-2xl border relative overflow-hidden ${
            isNight
              ? "bg-indigo-950/20 border-indigo-900/40"
              : "bg-white border-stone-200"
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-widest mb-4 ${
              isNight ? "text-indigo-300" : "text-amber-800"
            }`}
          >
            {isHindi ? "आज का नक्षत्र गोचर विश्लेषण" : "Today's Transit Tara Analysis"}
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 w-full">
              <div className="text-center">
                <span className="block text-[10px] uppercase text-stone-500 dark:text-slate-400 font-bold tracking-wider mb-1">
                  {isHindi ? "जन्म नक्षत्र" : "Birth"}
                </span>
                <span
                  className={`font-bold font-devanagari ${isNight ? "text-amber-100" : "text-stone-800"}`}
                >
                  {currentTara.birth_nakshatra.name}
                </span>
              </div>
              <ArrowRight
                className={`w-5 h-5 ${isNight ? "text-slate-600" : "text-stone-400"}`}
              />
              <div className="text-center">
                <span className="block text-[10px] uppercase text-stone-500 dark:text-slate-400 font-bold tracking-wider mb-1">
                  {isHindi ? "आज का गोचर" : "Today"}
                </span>
                <span
                  className={`font-bold font-devanagari ${isNight ? "text-amber-300" : "text-amber-700"}`}
                >
                  {currentTara.target_nakshatra.name}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                    TARA_COLORS[currentTara.nature] || TARA_COLORS["Neutral / Mixed"]
                  }`}
                >
                  {currentTara.tara_name} Tara
                </span>
                <span
                  className={`text-xs font-bold ${
                    currentTara.nature.includes("Inauspicious")
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }`}
                >
                  {currentTara.nature}
                </span>
              </div>

              <p
                className={`text-sm leading-relaxed ${isNight ? "text-slate-300" : "text-stone-600"}`}
              >
                {currentTara.result_description}
              </p>

              {vedicAnalysis.transit_vedha_and_override?.is_vedha_blocked && (
                <div
                  className={`mt-4 p-3 rounded-lg border text-left ${
                    isNight
                      ? "bg-indigo-950/40 border-indigo-500/30"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <h4
                    className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1 ${
                      isNight ? "text-indigo-300" : "text-emerald-700"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Tara-Gochara Vedha Active (Neutralized)
                  </h4>
                  <p
                    className={`text-xs ${isNight ? "text-slate-300" : "text-stone-600"}`}
                  >
                    High Ashtakavarga score (
                    {vedicAnalysis.transit_vedha_and_override.ashtakavarga_rekhas} Rekhas)
                    neutralizes the malefic transit of{" "}
                    {vedicAnalysis.transit_vedha_and_override.base_tara} Tara.
                  </p>
                  <div className="mt-2 text-[10px] uppercase font-bold tracking-wider">
                    <span
                      className={`px-2 py-1 rounded-md ${isNight ? "bg-black/40 text-slate-300" : "bg-white text-stone-600"}`}
                    >
                      Net Malefic Intensity:{" "}
                      {vedicAnalysis.transit_vedha_and_override.net_malefic_intensity_percentage}%
                    </span>
                  </div>
                </div>
              )}

              {currentTara.parihara &&
                !vedicAnalysis.transit_vedha_and_override?.is_vedha_blocked && (
                  <div
                    className={`mt-4 p-3 rounded-lg border text-left ${
                      isNight
                        ? "bg-rose-950/20 border-rose-900/50"
                        : "bg-rose-50 border-rose-100"
                    }`}
                  >
                    <h4
                      className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2 ${
                        isNight ? "text-rose-400" : "text-rose-700"
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Parihara (Remedies)
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${isNight ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Deity:
                        </span>
                        <span
                          className={isNight ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.deity_to_worship}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${isNight ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Mantra:
                        </span>
                        <span
                          className={isNight ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.recommended_mantra}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${isNight ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Donate:
                        </span>
                        <span
                          className={isNight ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.recommended_donation}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${isNight ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Avoid:
                        </span>
                        <span
                          className={isNight ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.avoid_activities.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Full 9x3 Navtara Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3
            className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${
              isNight ? "text-slate-300" : "text-amber-800"
            }`}
          >
            <Compass className="w-4 h-4 text-amber-500" />
            {isHindi ? "त्रिपर्याय नवतारा चक्र" : "Navtara Chakra"}
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            27 {isHindi ? "नक्षत्र सारणी" : "Stars Table"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((paryaya) => (
            <div
              key={paryaya}
              className={`rounded-xl border overflow-hidden ${
                isNight
                  ? "bg-[#0b101e] border-indigo-900/40"
                  : "bg-white border-stone-200"
              }`}
            >
              <div
                className={`px-4 py-3 border-b text-xs font-bold uppercase tracking-widest flex justify-between items-center ${
                  isNight
                    ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-300"
                    : "bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                <span>
                  {isHindi ? `पर्याय ${paryaya}` : `Paryaya ${paryaya}`}{" "}
                  {paryaya === 1 ? "(Janma)" : paryaya === 2 ? "(Karma/Anugatika)" : "(Adhana/Mitra)"}
                </span>
                <span className="opacity-70">
                  {isHindi ? "तीव्रता:" : "Intensity:"} {paryaya === 1 ? "100%" : paryaya === 2 ? "50%" : "25-75%"}
                </span>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-indigo-900/20">
                {table
                  .filter((t) => t.paryaya === paryaya)
                  .map((tara, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-indigo-900/10 transition-colors"
                    >
                      <div>
                        <div
                          className={`text-sm font-bold font-devanagari mb-0.5 ${
                            isNight ? "text-slate-200" : "text-stone-800"
                          }`}
                        >
                          {tara.target_nakshatra.index}. {tara.target_nakshatra.name}
                        </div>
                        <div
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isNight ? "text-slate-500" : "text-stone-500"
                          }`}
                        >
                          {tara.tara_number}. {tara.tara_name} Tara
                        </div>
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                          TARA_COLORS[tara.nature] || TARA_COLORS["Neutral / Mixed"]
                        }`}
                      >
                        {tara.nature.replace(/ \/ Mixed|Severely |Highly /g, "")}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Remedial Measures Section */}
      <div
        className={`p-6 rounded-2xl border mt-8 ${
          isNight
            ? "bg-[#0b101e]/80 border-indigo-900/50"
            : "bg-white border-stone-200 shadow-xs"
        }`}
      >
        <div className="mb-6">
          <h3
            className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2 ${
              isNight ? "text-rose-400" : "text-rose-700"
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            {isHindi ? "शास्त्रोक्त नवतारा परिहार एवं उपाय" : "Navtara Remedial Measures (Parihara)"}
          </h3>
          <p
            className={`text-sm max-w-2xl ${isNight ? "text-slate-400" : "text-stone-500"}`}
          >
            {isHindi
              ? "विपत्, प्रत्यरि एवं वध तारा के प्रतिकूल प्रभावों को शान्त करने हेतु शास्त्रसम्मत वैदिक देव-पूजन, मन्त्र-जप एवं विशिष्ट दान।"
              : "Classical Vedic remedies for the naturally sensitive or inauspicious Taras. Following these guidelines helps neutralize malefic effects."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {table
            .filter((t) => t.paryaya === 1 && t.parihara)
            .map((tara, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border flex flex-col gap-4 ${
                  isNight
                    ? "bg-rose-950/10 border-rose-900/30"
                    : "bg-rose-50/50 border-rose-100"
                }`}
              >
                <div className="flex items-center gap-3 border-b pb-3 border-black/5 dark:border-white/5">
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                      tara.tara_number === 7
                        ? "bg-rose-600 text-white"
                        : tara.tara_number === 3 || tara.tara_number === 5
                          ? "bg-orange-500 text-white"
                          : "bg-stone-500 text-white"
                    }`}
                  >
                    {tara.tara_number}. {tara.tara_name} Tara
                  </span>
                  <span
                    className={`text-xs font-bold ${isNight ? "text-slate-300" : "text-stone-600"}`}
                  >
                    {tara.nature.replace(/ \/ Mixed|Severely |Highly /g, "")}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${isNight ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      {isHindi ? "देवता" : "Deity"}
                    </span>
                    <span
                      className={`font-medium ${isNight ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.deity_to_worship}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${isNight ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      {isHindi ? "मन्त्र" : "Mantra"}
                    </span>
                    <span
                      className={`font-medium ${isNight ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.recommended_mantra}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${isNight ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      {isHindi ? "दान" : "Donate"}
                    </span>
                    <span
                      className={`font-medium ${isNight ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.recommended_donation}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${isNight ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      {isHindi ? "वर्जित" : "Avoid"}
                    </span>
                    <span
                      className={`font-medium ${isNight ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.avoid_activities.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Tara Dasa Sequence Section */}
      <div
        className={`p-6 rounded-2xl border mt-8 ${
          isNight
            ? "bg-[#0b101e]/80 border-indigo-900/50"
            : "bg-white border-stone-200 shadow-xs"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2 ${
                isNight ? "text-slate-300" : "text-amber-800"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Tara Dasa (Vimshottari Alignment)
            </h3>
            <p
              className={`text-sm max-w-xl ${isNight ? "text-slate-400" : "text-stone-500"}`}
            >
              In Tara Dasa, the Dasa names correspond to the 9 Taras, commencing from the strongest
              Kendra planet in the chart.
            </p>
          </div>
          <div className="shrink-0">
            <label
              className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${
                isNight ? "text-slate-500" : "text-stone-400"
              }`}
            >
              Strongest Kendra Planet
            </label>
            <select
              value={kendraPlanet}
              onChange={(e) => setKendraPlanet(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none cursor-pointer ${
                isNight
                  ? "bg-black/50 border-indigo-900 text-slate-200 focus:border-indigo-500"
                  : "bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500"
              }`}
            >
              {VIMSHOTTARI_SEQUENCE.map((planet) => (
                <option key={planet} value={planet}>
                  {planet}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-3">
          {vedicAnalysis.tara_dasa_analysis.dasa_sequence.map((dasa, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                isNight
                  ? "bg-black/40 border-indigo-900/30"
                  : "bg-stone-50 border-stone-100"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70 ${
                  isNight ? "text-slate-400" : "text-stone-500"
                }`}
              >
                {dasa.tara_name}
              </span>
              <span
                className={`font-bold mb-1 ${
                  isNight ? "text-slate-200" : "text-stone-800"
                }`}
              >
                {dasa.planet}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isNight
                    ? "bg-indigo-900/40 text-indigo-300"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {dasa.years} Yrs
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RENDER PRINTABLE MODAL WHEN USER CLICKS EXPORT PDF */}
      {isPrintModalOpen && (
        <PrintableNavtaraReport
          data={data}
          lang={lang}
          initialBirthNakshatra={birthNakshatra}
          initialBirthPada={birthPada}
          initialPersonName={personName}
          cityName={data?.city || "New Delhi, IN"}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
