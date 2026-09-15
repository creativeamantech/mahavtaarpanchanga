import React, { useState, useEffect } from "react";
import { Star, Compass, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { NAKSHATRA_NAMES, calculateNavtara, generateNavtaraTable, type NavtaraResult } from "../lib/navtaraEngine";
import type { AppTheme, PanchangaResponse } from "../types";
import { translations, type Language } from "../i18n";

interface NavtaraViewProps {
  data: PanchangaResponse | null;
  lang: Language;
  theme: AppTheme;
}

const TARA_COLORS = {
  "Highly Auspicious": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Auspicious": "bg-green-100 text-green-800 border-green-300",
  "Neutral / Mixed": "bg-stone-100 text-stone-700 border-stone-300",
  "Neutral": "bg-stone-100 text-stone-700 border-stone-300",
  "Inauspicious": "bg-orange-100 text-orange-800 border-orange-300",
  "Severely Inauspicious": "bg-rose-100 text-rose-800 border-rose-300",
};

export function NavtaraView({ data, lang, theme }: NavtaraViewProps) {
  const [birthNakshatra, setBirthNakshatra] = useState<number>(1);
  const [table, setTable] = useState<NavtaraResult[]>([]);
  
  useEffect(() => {
    // Try to load from local storage
    const saved = localStorage.getItem("mahavtaar_birth_nakshatra");
    if (saved) {
      setBirthNakshatra(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    setTable(generateNavtaraTable(birthNakshatra));
    localStorage.setItem("mahavtaar_birth_nakshatra", birthNakshatra.toString());
  }, [birthNakshatra]);

  const currentNakshatraName = data?.nakshatra?.[0]?.name?.split(" ")[0]; // Get current transit nakshatra
  const currentNakshatraIndex = NAKSHATRA_NAMES.findIndex(n => currentNakshatraName?.toLowerCase().includes(n.toLowerCase())) + 1;
  const currentTara = currentNakshatraIndex > 0 ? calculateNavtara(birthNakshatra, currentNakshatraIndex) : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Selector Card */}
      <div className={`p-6 rounded-2xl border backdrop-blur-xl shadow-lg relative overflow-hidden ${
        theme === "nightSky" 
          ? "bg-[#0b101e]/80 border-indigo-900/50" 
          : "bg-white/90 border-amber-200/60"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between relative z-10">
          <div>
            <h3 className={`text-lg font-bold font-serif-vedic mb-1 flex items-center gap-2 ${
              theme === "nightSky" ? "text-amber-300" : "text-amber-800"
            }`}>
              <Star className="w-5 h-5 text-amber-500" />
              Janma Nakshatra (Birth Star)
            </h3>
            <p className={`text-sm ${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}`}>
              Select your birth Nakshatra to calculate your personal Navtara Chakra for transit evaluation.
            </p>
          </div>
          
          <div className="relative min-w-[240px]">
            <select
              value={birthNakshatra}
              onChange={(e) => setBirthNakshatra(parseInt(e.target.value, 10))}
              className={`w-full appearance-none rounded-xl border p-3.5 pr-10 text-sm font-bold font-devanagari transition-all focus:ring-2 focus:outline-none ${
                theme === "nightSky"
                  ? "bg-[#131b2f] border-indigo-900/60 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20"
                  : "bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            >
              {NAKSHATRA_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}. {name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
              <Star className={`h-4 w-4 ${theme === "nightSky" ? "text-slate-400" : "text-stone-400"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Transit Highlight */}
      {currentTara && (
        <div className={`p-6 rounded-2xl border shadow-md relative overflow-hidden ${
          theme === "nightSky" 
            ? "bg-gradient-to-br from-[#111827] to-[#0f1423] border-indigo-900/50" 
            : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60"
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${
            theme === "nightSky" ? "text-indigo-300" : "text-amber-800"
          }`}>
            Today's Transit Tara
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 flex items-center justify-between gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 w-full">
              <div className="text-center">
                <span className="block text-[10px] uppercase text-stone-500 dark:text-slate-400 font-bold tracking-wider mb-1">Birth</span>
                <span className={`font-bold font-devanagari ${theme === "nightSky" ? "text-amber-100" : "text-stone-800"}`}>
                  {currentTara.birth_nakshatra.name}
                </span>
              </div>
              <ArrowRight className={`w-5 h-5 ${theme === "nightSky" ? "text-slate-600" : "text-stone-400"}`} />
              <div className="text-center">
                <span className="block text-[10px] uppercase text-stone-500 dark:text-slate-400 font-bold tracking-wider mb-1">Today</span>
                <span className={`font-bold font-devanagari ${theme === "nightSky" ? "text-amber-300" : "text-amber-700"}`}>
                  {currentTara.target_nakshatra.name}
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                  TARA_COLORS[currentTara.nature] || TARA_COLORS["Neutral / Mixed"]
                }`}>
                  {currentTara.tara_name} Tara
                </span>
                <span className={`text-xs font-bold ${
                  currentTara.nature.includes("Inauspicious") ? "text-rose-600" : "text-emerald-600"
                }`}>
                  {currentTara.nature}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${theme === "nightSky" ? "text-slate-300" : "text-stone-600"}`}>
                {currentTara.result_description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full 9x3 Navtara Grid */}
      <div className="space-y-6">
        <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 px-2 ${
          theme === "nightSky" ? "text-slate-300" : "text-amber-800"
        }`}>
          <Compass className="w-4 h-4 text-amber-500" />
          Navtara Chakra
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(paryaya => (
            <div key={paryaya} className={`rounded-xl border overflow-hidden ${
              theme === "nightSky" ? "bg-[#0b101e] border-indigo-900/40" : "bg-white border-stone-200"
            }`}>
              <div className={`px-4 py-3 border-b text-xs font-bold uppercase tracking-widest ${
                theme === "nightSky" 
                  ? "bg-indigo-950/40 border-indigo-900/40 text-indigo-300" 
                  : "bg-stone-50 border-stone-200 text-stone-600"
              }`}>
                Paryaya {paryaya} {paryaya === 1 ? "(Janma)" : paryaya === 2 ? "(Anugatika)" : "(Mitra)"}
              </div>
              <div className="divide-y divide-stone-100 dark:divide-indigo-900/20">
                {table.filter(t => t.paryaya === paryaya).map((tara, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-indigo-900/10 transition-colors">
                    <div>
                      <div className={`text-sm font-bold font-devanagari mb-0.5 ${
                        theme === "nightSky" ? "text-slate-200" : "text-stone-800"
                      }`}>
                        {tara.target_nakshatra.index}. {tara.target_nakshatra.name}
                      </div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${
                        theme === "nightSky" ? "text-slate-500" : "text-stone-500"
                      }`}>
                        {tara.tara_number}. {tara.tara_name}
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                      TARA_COLORS[tara.nature] || TARA_COLORS["Neutral / Mixed"]
                    }`}>
                      {tara.nature.replace(/ \/ Mixed|Severely |Highly /g, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
