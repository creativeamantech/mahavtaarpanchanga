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
  const [table, setTable] = useState<NavtaraResult[]>([]);
  const [kendraPlanet, setKendraPlanet] = useState("Jupiter");
  const [moonLongitude, setMoonLongitude] = useState(0);

  useEffect(() => {
    setTable(generateNavtaraTable(birthNakshatra));
    // Approximate Moon Longitude for the middle of the selected Nakshatra
    setMoonLongitude((birthNakshatra - 1) * 13.3333333 + 6.666666);
  }, [birthNakshatra]);

  const currentNakshatraIndex = data?.nakshatra?.[0]?.number || 0;
  const currentTara =
    currentNakshatraIndex > 0 ? calculateNavtara(birthNakshatra, currentNakshatraIndex) : null;

  // New Comprehensive Vedic Analysis
  const vedicAnalysis = useMemo(() => {
    return generateComprehensiveVedicAnalysis(
      moonLongitude,
      kendraPlanet,
      currentNakshatraIndex > 0
        ? {
            target_nakshatra_num: currentNakshatraIndex,
            planet: "Moon",
            ashtakavarga_rekhas: 5, // Simulated High Rekhas to trigger Vedha if applicable
          }
        : undefined,
    );
  }, [moonLongitude, kendraPlanet, currentNakshatraIndex]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Selector Card */}
      <div
        className={`p-6 rounded-2xl border backdrop-blur-xl shadow-lg relative overflow-hidden ${
          theme === "nightSky"
            ? "bg-[#0b101e]/80 border-indigo-900/50"
            : "bg-white/80 border-stone-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2
              className={`text-xl font-bold font-devanagari mb-2 flex items-center gap-2 ${
                theme === "nightSky" ? "text-slate-100" : "text-stone-800"
              }`}
            >
              <Star className="w-5 h-5 text-amber-500" />
              Janma Nakshatra (Birth Star)
            </h2>
            <p
              className={`text-sm max-w-md ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
            >
              Select your birth Nakshatra to generate the complete Navtara Chakra, Tara Dasa
              sequence, and check for transit Vedha blocks.
            </p>
          </div>

          <select
            value={birthNakshatra}
            onChange={(e) => onBirthNakshatraChange?.(Number(e.target.value))}
            className={`px-4 py-3 rounded-xl border appearance-none font-bold outline-none ring-2 ring-transparent focus:ring-amber-500 transition-all cursor-pointer ${
              theme === "nightSky"
                ? "bg-black/50 border-indigo-900 text-slate-200"
                : "bg-stone-50 border-stone-200 text-stone-800"
            }`}
            style={{ minWidth: "220px" }}
          >
            {NAKSHATRA_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {idx + 1}. {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gandanta & Moola Warning (If applicable) */}
      {vedicAnalysis.natal_nakshatra_info.is_gandanta && (
        <div
          className={`p-5 rounded-xl border flex items-start gap-4 ${
            theme === "nightSky"
              ? "bg-rose-950/20 border-rose-900/50"
              : "bg-rose-50 border-rose-200"
          }`}
        >
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3
              className={`font-bold mb-1 ${theme === "nightSky" ? "text-rose-400" : "text-rose-700"}`}
            >
              {vedicAnalysis.natal_nakshatra_info.gandanta_type} Detected
            </h3>
            <p
              className={`text-sm mb-3 ${theme === "nightSky" ? "text-rose-200/70" : "text-rose-800/70"}`}
            >
              Your estimated birth degree falls near a critical junction (Gandanta). Special
              parihara is traditionally advised.
            </p>
            {vedicAnalysis.remedial_measures.gandanta_parihara && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-3 rounded-lg border ${theme === "nightSky" ? "bg-black/40 border-rose-900/30" : "bg-white/60 border-rose-100"}`}
                >
                  <span className="block font-bold mb-1 opacity-70">Ritual</span>
                  {vedicAnalysis.remedial_measures.gandanta_parihara.ritual}
                </div>
                <div
                  className={`p-3 rounded-lg border ${theme === "nightSky" ? "bg-black/40 border-rose-900/30" : "bg-white/60 border-rose-100"}`}
                >
                  <span className="block font-bold mb-1 opacity-70">Havana</span>
                  {vedicAnalysis.remedial_measures.gandanta_parihara.havana}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Today's Transit Card */}
      {currentTara && (
        <div
          className={`p-6 rounded-2xl border relative overflow-hidden ${
            theme === "nightSky"
              ? "bg-indigo-950/20 border-indigo-900/40"
              : "bg-white border-stone-200"
          }`}
        >
          <h3
            className={`text-xs font-bold uppercase tracking-widest mb-4 ${
              theme === "nightSky" ? "text-indigo-300" : "text-amber-800"
            }`}
          >
            Today's Transit Tara
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 w-full">
              <div className="text-center">
                <span className="block text-[10px] uppercase text-stone-500 dark:text-slate-400 font-bold tracking-wider mb-1">
                  Birth
                </span>
                <span
                  className={`font-bold font-devanagari ${theme === "nightSky" ? "text-amber-100" : "text-stone-800"}`}
                >
                  {currentTara.birth_nakshatra.name}
                </span>
              </div>
              <ArrowRight
                className={`w-5 h-5 ${theme === "nightSky" ? "text-slate-600" : "text-stone-400"}`}
              />
              <div className="text-center">
                <span className="block text-[10px] uppercase text-stone-500 dark:text-slate-400 font-bold tracking-wider mb-1">
                  Today
                </span>
                <span
                  className={`font-bold font-devanagari ${theme === "nightSky" ? "text-amber-300" : "text-amber-700"}`}
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
                className={`text-sm leading-relaxed ${theme === "nightSky" ? "text-slate-300" : "text-stone-600"}`}
              >
                {currentTara.result_description}
              </p>

              {vedicAnalysis.transit_vedha_and_override?.is_vedha_blocked && (
                <div
                  className={`mt-4 p-3 rounded-lg border text-left ${
                    theme === "nightSky"
                      ? "bg-indigo-950/40 border-indigo-500/30"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <h4
                    className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1 ${
                      theme === "nightSky" ? "text-indigo-300" : "text-emerald-700"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Tara-Gochara Vedha Active (Neutralized)
                  </h4>
                  <p
                    className={`text-xs ${theme === "nightSky" ? "text-slate-300" : "text-stone-600"}`}
                  >
                    High Ashtakavarga score (
                    {vedicAnalysis.transit_vedha_and_override.ashtakavarga_rekhas} Rekhas)
                    neutralizes the malefic transit of{" "}
                    {vedicAnalysis.transit_vedha_and_override.base_tara} Tara.
                  </p>
                  <div className="mt-2 text-[10px] uppercase font-bold tracking-wider">
                    <span
                      className={`px-2 py-1 rounded-md ${theme === "nightSky" ? "bg-black/40 text-slate-300" : "bg-white text-stone-600"}`}
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
                      theme === "nightSky"
                        ? "bg-rose-950/20 border-rose-900/50"
                        : "bg-rose-50 border-rose-100"
                    }`}
                  >
                    <h4
                      className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2 ${
                        theme === "nightSky" ? "text-rose-400" : "text-rose-700"
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Parihara (Remedies)
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Deity:
                        </span>
                        <span
                          className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.deity_to_worship}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Mantra:
                        </span>
                        <span
                          className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.recommended_mantra}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Donate:
                        </span>
                        <span
                          className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}
                        >
                          {currentTara.parihara.recommended_donation}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`font-semibold shrink-0 ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
                        >
                          Avoid:
                        </span>
                        <span
                          className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}
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
        <h3
          className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 px-2 ${
            theme === "nightSky" ? "text-slate-300" : "text-amber-800"
          }`}
        >
          <Compass className="w-4 h-4 text-amber-500" />
          Navtara Chakra
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((paryaya) => (
            <div
              key={paryaya}
              className={`rounded-xl border overflow-hidden ${
                theme === "nightSky"
                  ? "bg-[#0b101e] border-indigo-900/40"
                  : "bg-white border-stone-200"
              }`}
            >
              <div
                className={`px-4 py-3 border-b text-xs font-bold uppercase tracking-widest flex justify-between items-center ${
                  theme === "nightSky"
                    ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-300"
                    : "bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                <span>
                  Paryaya {paryaya}{" "}
                  {paryaya === 1 ? "(Janma)" : paryaya === 2 ? "(Anugatika)" : "(Mitra)"}
                </span>
                <span className="opacity-70">
                  Intensity: {paryaya === 1 ? "100%" : paryaya === 2 ? "50%" : "25-75%"}
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
                            theme === "nightSky" ? "text-slate-200" : "text-stone-800"
                          }`}
                        >
                          {tara.target_nakshatra.index}. {tara.target_nakshatra.name}
                        </div>
                        <div
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            theme === "nightSky" ? "text-slate-500" : "text-stone-500"
                          }`}
                        >
                          {tara.tara_number}. {tara.tara_name}
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
          theme === "nightSky"
            ? "bg-[#0b101e]/80 border-indigo-900/50"
            : "bg-white border-stone-200 shadow-sm"
        }`}
      >
        <div className="mb-6">
          <h3
            className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2 ${
              theme === "nightSky" ? "text-rose-400" : "text-rose-700"
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Navtara Remedial Measures (Parihara)
          </h3>
          <p
            className={`text-sm max-w-2xl ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
          >
            Classical Vedic remedies for the naturally sensitive or inauspicious Taras. Following
            these guidelines helps neutralize malefic effects during adverse planetary transits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {table
            .filter((t) => t.paryaya === 1 && t.parihara)
            .map((tara, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border flex flex-col gap-4 ${
                  theme === "nightSky"
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
                    className={`text-xs font-bold ${theme === "nightSky" ? "text-slate-300" : "text-stone-600"}`}
                  >
                    {tara.nature.replace(/ \/ Mixed|Severely |Highly /g, "")}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      Deity
                    </span>
                    <span
                      className={`font-medium ${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.deity_to_worship}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      Mantra
                    </span>
                    <span
                      className={`font-medium ${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.recommended_mantra}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      Donate
                    </span>
                    <span
                      className={`font-medium ${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}`}
                    >
                      {tara.parihara?.recommended_donation}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span
                      className={`font-bold shrink-0 w-16 ${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}`}
                    >
                      Avoid
                    </span>
                    <span
                      className={`font-medium ${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}`}
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
          theme === "nightSky"
            ? "bg-[#0b101e]/80 border-indigo-900/50"
            : "bg-white border-stone-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2 ${
                theme === "nightSky" ? "text-slate-300" : "text-amber-800"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Tara Dasa (Vimshottari Alignment)
            </h3>
            <p
              className={`text-sm max-w-xl ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}
            >
              In Tara Dasa, the Dasa names correspond to the 9 Taras, commencing from the strongest
              Kendra planet in the chart.
            </p>
          </div>
          <div className="shrink-0">
            <label
              className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${
                theme === "nightSky" ? "text-slate-500" : "text-stone-400"
              }`}
            >
              Strongest Kendra Planet
            </label>
            <select
              value={kendraPlanet}
              onChange={(e) => setKendraPlanet(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-bold outline-none cursor-pointer ${
                theme === "nightSky"
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
                theme === "nightSky"
                  ? "bg-black/40 border-indigo-900/30"
                  : "bg-stone-50 border-stone-100"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70 ${
                  theme === "nightSky" ? "text-slate-400" : "text-stone-500"
                }`}
              >
                {dasa.tara_name}
              </span>
              <span
                className={`font-bold mb-1 ${
                  theme === "nightSky" ? "text-slate-200" : "text-stone-800"
                }`}
              >
                {dasa.planet}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  theme === "nightSky"
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
    </div>
  );
}
