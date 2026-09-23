import React, { useState } from "react";
import {
  CompleteShadbalaResult,
  GrahaShadbalaDetailed,
  BhavaBalaDetailed,
} from "../kundali/shadbala/ShadbalaTypes";
import { CanonicalBodyId } from "../kundali/astronomy/AstronomicalContext";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Compass,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

interface ShadbalaViewProps {
  shadbala?: CompleteShadbalaResult;
}

const PLANET_NAMES: Record<CanonicalBodyId, { hi: string; en: string; symbol: string }> = {
  Sun: { hi: "सूर्य (Sun)", en: "Sun", symbol: "☉" },
  Moon: { hi: "चन्द्र (Moon)", en: "Moon", symbol: "☽" },
  Mars: { hi: "मंगल (Mars)", en: "Mars", symbol: "♂" },
  Mercury: { hi: "बुध (Mercury)", en: "Mercury", symbol: "☿" },
  Jupiter: { hi: "गुरु (Jupiter)", en: "Jupiter", symbol: "♃" },
  Venus: { hi: "शुक्र (Venus)", en: "Venus", symbol: "♀" },
  Saturn: { hi: "शनि (Saturn)", en: "Saturn", symbol: "♄" },
};

const ZODIAC_NAMES_HI = [
  "मेष (Aries)",
  "वृषभ (Taurus)",
  "मिथुन (Gemini)",
  "कर्क (Cancer)",
  "सिंह (Leo)",
  "कन्या (Virgo)",
  "तुला (Libra)",
  "वृश्चिक (Scorpio)",
  "धनु (Sagittarius)",
  "मकर (Capricorn)",
  "कुम्भ (Aquarius)",
  "मीन (Pisces)",
];

const BHAVA_NAMES_SANSKRIT = [
  "तनु (Lagna / 1st)",
  "धन (Dhana / 2nd)",
  "सहज (Bhrata / 3rd)",
  "सुख (Matru / 4th)",
  "पुत्र (Suta / 5th)",
  "रिपु (Ari / 6th)",
  "युवति (Jaya / 7th)",
  "रन्ध्र (Ayu / 8th)",
  "धर्म (Bhagya / 9th)",
  "कर्म (Karma / 10th)",
  "लाभ (Aya / 11th)",
  "व्यय (Vyaya / 12th)",
];

export const ShadbalaView: React.FC<ShadbalaViewProps> = ({ shadbala }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "sixfold" | "ishtakashta" | "bhavabala"
  >("overview");
  const [selectedPlanet, setSelectedPlanet] = useState<CanonicalBodyId>("Sun");

  if (!shadbala || !shadbala.planets) {
    return (
      <div className="bg-stone-950/80 rounded-2xl border border-amber-500/25 p-6 text-center text-amber-300">
        <Info className="w-8 h-8 mx-auto mb-2 text-amber-400 opacity-60" />
        <p className="text-sm font-semibold">
          षड्बल गणना डेटा उपलब्ध नहीं है। कृपया जन्म समय और स्थान की पुष्टि करें।
        </p>
      </div>
    );
  }

  const planetList = Object.values(shadbala.planets) as GrahaShadbalaDetailed[];
  // Sort planets by Rank
  const sortedByRank = [...planetList].sort((a, b) => a.rank - b.rank);

  const activePlanetData = shadbala.planets[selectedPlanet] || planetList[0];

  return (
    <div className="bg-stone-950/90 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-2xl space-y-5 text-amber-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>बृहत्पाराशर होराशास्त्र — षड्बल निर्णय (BPHS 6-Fold Strength)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
            ग्रह षड्बल एवं द्वादश भावबल विश्लेषण
          </h3>
          <p className="text-xs text-amber-300/80 mt-0.5">
            स्थान बल, दिग् बल, काल बल, चेष्टा बल, नैसर्गिक बल एवं दृग् बल का सम्पूर्ण वैज्ञानिक विश्लेषण
          </p>
        </div>

        {/* Quick Highlights of Strongest and Weakest Planet */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-emerald-400 font-bold block text-[10px]">सर्वाधिक बली ग्रह:</span>
            <span className="font-black text-emerald-200">
              {PLANET_NAMES[shadbala.strongestPlanet]?.hi || shadbala.strongestPlanet} (#1)
            </span>
          </div>
          <div className="bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-rose-400 font-bold block text-[10px]">न्यूनतम बली ग्रह:</span>
            <span className="font-black text-rose-200">
              {PLANET_NAMES[shadbala.weakestPlanet]?.hi || shadbala.weakestPlanet} (#7)
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-amber-500/15 scrollbar-thin">
        {[
          { id: "overview", label: "षड्बल सारांश व रैंकिंग (Overview & Ranks)", icon: Award },
          { id: "sixfold", label: "षड्बल 6-घटक सारणी (6-Fold Matrix)", icon: BarChart3 },
          { id: "ishtakashta", label: "इष्ट फल एवं कष्ट फल (Ishta / Kashta)", icon: Zap },
          { id: "bhavabala", label: "द्वादश भाव बल (Bhava Bala 1-12)", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-amber-700/80 text-amber-50 border-amber-400 shadow-md"
                  : "bg-amber-950/40 text-amber-300/80 border-amber-500/20 hover:bg-amber-900/40 hover:text-amber-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= SUB-TAB 1: OVERVIEW & RANKINGS ================= */}
      {activeSubTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {sortedByRank.map((p) => {
              const meta = PLANET_NAMES[p.planet];
              const isSelected = selectedPlanet === p.planet;
              return (
                <div
                  key={p.planet}
                  onClick={() => setSelectedPlanet(p.planet)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-800/50 border-amber-300 ring-1 ring-amber-400 shadow-lg"
                      : "bg-amber-950/40 border-amber-500/20 hover:bg-amber-900/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-amber-100 flex items-center gap-1">
                        <span className="text-amber-400">{meta.symbol}</span>
                        <span>{meta.hi.split(" ")[0]}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-mono border ${
                          p.rank === 1
                            ? "bg-amber-500 text-stone-950 border-amber-300"
                            : p.rank <= 3
                            ? "bg-amber-900 text-amber-200 border-amber-500/40"
                            : "bg-stone-900 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        Rank #{p.rank}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between text-amber-300/80">
                        <span>कुल रूप (Rupa):</span>
                        <span className="font-mono font-bold text-amber-100">
                          {p.totalRupas.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-300/80">
                        <span>अपेक्षित (Required):</span>
                        <span className="font-mono text-amber-200">
                          {p.requiredRupas.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-300/80">
                        <span>सामर्थ्य (Ratio):</span>
                        <span
                          className={`font-mono font-bold ${
                            p.isAdequate ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {(p.strengthRatio * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Strength Progress Bar */}
                  <div className="mt-3 pt-2 border-t border-amber-500/15">
                    <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-amber-500/20">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.strengthRatio >= 1.2
                            ? "bg-emerald-400"
                            : p.strengthRatio >= 1.0
                            ? "bg-teal-400"
                            : p.strengthRatio >= 0.8
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                        style={{ width: `${Math.min(p.strengthRatio * 80, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-center font-bold mt-1">
                      {p.isAdequate ? (
                        <span className="text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> पूर्ण बली
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center justify-center gap-1">
                          बल की न्यूनता
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Planet Deep-Dive Inspector */}
          {activePlanetData && (
            <div className="bg-amber-950/50 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl text-amber-400">
                    {PLANET_NAMES[activePlanetData.planet].symbol}
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-amber-100">
                      {PLANET_NAMES[activePlanetData.planet].hi} — षड्बल विवरण
                    </h4>
                    <span className="text-xs text-amber-300/80">
                      रैंक: #{activePlanetData.rank} • कुल बल: {activePlanetData.totalVirupas.toFixed(1)} विरूपा ({activePlanetData.totalRupas.toFixed(2)} रूप)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-xl font-bold border ${
                      activePlanetData.isAdequate
                        ? "bg-emerald-950 text-emerald-200 border-emerald-500/40"
                        : "bg-rose-950 text-rose-200 border-rose-500/40"
                    }`}
                  >
                    {activePlanetData.isAdequate
                      ? "पर्याप्त शास्त्रीय बल युक्त"
                      : "शास्त्रीय न्यूनतम से कम"}
                  </span>
                </div>
              </div>

              {/* 6 Sub-Strengths Grid for Selected Planet */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                {/* 1. Sthana Bala */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/15 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">१. स्थान बल</span>
                  <span className="text-sm font-black text-amber-100 block">
                    {activePlanetData.sthanaBala.totalRupas.toFixed(2)} रूप
                  </span>
                  <span className="text-[10px] text-amber-300/70 block">
                    {activePlanetData.sthanaBala.totalVirupas.toFixed(1)} विरूपा
                  </span>
                  <div className="text-[9px] text-amber-400/80 pt-1 border-t border-amber-500/10">
                    उच्च बल: {activePlanetData.sthanaBala.uchchaBala.toFixed(1)}
                  </div>
                </div>

                {/* 2. Dig Bala */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/15 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">२. दिग् बल</span>
                  <span className="text-sm font-black text-amber-100 block">
                    {activePlanetData.digBala.totalRupas.toFixed(2)} रूप
                  </span>
                  <span className="text-[10px] text-amber-300/70 block">
                    {activePlanetData.digBala.totalVirupas.toFixed(1)} विरूपा
                  </span>
                  <div className="text-[9px] text-amber-400/80 pt-1 border-t border-amber-500/10">
                    दिशा भाव: {activePlanetData.digBala.referenceHouse}म
                  </div>
                </div>

                {/* 3. Kala Bala */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/15 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">३. काल बल</span>
                  <span className="text-sm font-black text-amber-100 block">
                    {activePlanetData.kalaBala.totalRupas.toFixed(2)} रूप
                  </span>
                  <span className="text-[10px] text-amber-300/70 block">
                    {activePlanetData.kalaBala.totalVirupas.toFixed(1)} विरूपा
                  </span>
                  <div className="text-[9px] text-amber-400/80 pt-1 border-t border-amber-500/10">
                    पक्ष बल: {activePlanetData.kalaBala.pakshaBala.toFixed(1)}
                  </div>
                </div>

                {/* 4. Cheshta Bala */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/15 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">४. चेष्टा बल</span>
                  <span className="text-sm font-black text-amber-100 block">
                    {activePlanetData.cheshtaBala.totalRupas.toFixed(2)} रूप
                  </span>
                  <span className="text-[10px] text-amber-300/70 block">
                    {activePlanetData.cheshtaBala.totalVirupas.toFixed(1)} विरूपा
                  </span>
                  <div className="text-[9px] text-amber-400/80 pt-1 border-t border-amber-500/10">
                    गति: {activePlanetData.cheshtaBala.motionState}
                  </div>
                </div>

                {/* 5. Naisargika Bala */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/15 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">५. नैसर्गिक बल</span>
                  <span className="text-sm font-black text-amber-100 block">
                    {activePlanetData.naisargikaBala.totalRupas.toFixed(2)} रूप
                  </span>
                  <span className="text-[10px] text-amber-300/70 block">
                    {activePlanetData.naisargikaBala.totalVirupas.toFixed(1)} विरूपा
                  </span>
                  <div className="text-[9px] text-amber-400/80 pt-1 border-t border-amber-500/10">
                    प्रकृति क्रम: #{activePlanetData.naisargikaBala.rankIndex}
                  </div>
                </div>

                {/* 6. Drik Bala */}
                <div className="bg-stone-900/80 p-3 rounded-xl border border-amber-500/15 space-y-1">
                  <span className="text-amber-400 font-bold block text-[11px]">६. दृग् बल</span>
                  <span className="text-sm font-black text-amber-100 block">
                    {activePlanetData.drikBala.totalRupas.toFixed(2)} रूप
                  </span>
                  <span className="text-[10px] text-amber-300/70 block">
                    {activePlanetData.drikBala.totalVirupas.toFixed(1)} विरूपा
                  </span>
                  <div className="text-[9px] text-amber-400/80 pt-1 border-t border-amber-500/10">
                    शुभ/अशुभ दृष्टि योग
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 2: SIX-FOLD MATRIX ================= */}
      {activeSubTab === "sixfold" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-amber-900/40 text-amber-300 border-b border-amber-500/30">
                <th className="p-3 font-bold">ग्रह (Graha)</th>
                <th className="p-3 font-bold">स्थान बल</th>
                <th className="p-3 font-bold">दिग् बल</th>
                <th className="p-3 font-bold">काल बल</th>
                <th className="p-3 font-bold">चेष्टा बल</th>
                <th className="p-3 font-bold">नैसर्गिक</th>
                <th className="p-3 font-bold">दृग् बल</th>
                <th className="p-3 font-bold">कुल विरूपा</th>
                <th className="p-3 font-bold">कुल रूप</th>
                <th className="p-3 font-bold">आवश्यक रूप</th>
                <th className="p-3 font-bold">प्रतिशत / रैंक</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/15">
              {sortedByRank.map((p) => {
                const meta = PLANET_NAMES[p.planet];
                return (
                  <tr key={p.planet} className="hover:bg-amber-900/20 transition-colors">
                    <td className="p-3 font-bold flex items-center gap-1.5">
                      <span className="text-amber-400">{meta.symbol}</span>
                      <span>{meta.hi}</span>
                    </td>
                    <td className="p-3 font-mono">{p.sthanaBala.totalVirupas.toFixed(1)}</td>
                    <td className="p-3 font-mono">{p.digBala.totalVirupas.toFixed(1)}</td>
                    <td className="p-3 font-mono">{p.kalaBala.totalVirupas.toFixed(1)}</td>
                    <td className="p-3 font-mono">{p.cheshtaBala.totalVirupas.toFixed(1)}</td>
                    <td className="p-3 font-mono">{p.naisargikaBala.totalVirupas.toFixed(1)}</td>
                    <td className="p-3 font-mono">{p.drikBala.totalVirupas.toFixed(1)}</td>
                    <td className="p-3 font-mono font-bold text-amber-200">
                      {p.totalVirupas.toFixed(1)}
                    </td>
                    <td className="p-3 font-mono font-black text-amber-100 text-sm">
                      {p.totalRupas.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-amber-300/80">
                      {p.requiredRupas.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            p.isAdequate ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {(p.strengthRatio * 100).toFixed(0)}%
                        </span>
                        <span className="bg-amber-900/60 px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-300">
                          #{p.rank}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= SUB-TAB 3: ISHTA & KASHTA PHALA ================= */}
      {activeSubTab === "ishtakashta" && (
        <div className="space-y-4">
          <div className="bg-amber-950/40 p-4 rounded-2xl border border-amber-500/20 text-xs leading-relaxed text-amber-200/90">
            <span className="font-bold text-amber-300 block mb-1">
              इष्ट फल एवं कष्ट फल का शास्त्रीय नियम:
            </span>
            इष्ट फल शुभ कर्मों और मनोकामना सिद्धि की सामर्थ्य को प्रकट करता है, जबकि कष्ट फल जीवन में आने वाले
            अवरोधों व संघर्ष को दर्शाता है। दोनों का योग सामान्यतः 60 विरूपा होता है।
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sortedByRank.map((p) => {
              const meta = PLANET_NAMES[p.planet];
              const ishta = p.ishtaKashta.ishtaPhala;
              const kashta = p.ishtaKashta.kashtaPhala;
              return (
                <div
                  key={p.planet}
                  className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                    <span className="font-black text-amber-100 text-sm flex items-center gap-1.5">
                      <span className="text-amber-400">{meta.symbol}</span>
                      <span>{meta.hi}</span>
                    </span>
                    <span className="text-xs bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-md font-bold">
                      रैंक #{p.rank}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Ishta Phala Progress */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-emerald-400">इष्ट फल (Auspicious Fruit):</span>
                        <span className="font-mono text-emerald-300 font-bold">{ishta.toFixed(2)} / 60</span>
                      </div>
                      <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-emerald-500/20">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${(ishta / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Kashta Phala Progress */}
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-rose-400">कष्ट फल (Inauspicious Fruit):</span>
                        <span className="font-mono text-rose-300 font-bold">{kashta.toFixed(2)} / 60</span>
                      </div>
                      <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-rose-500/20">
                        <div
                          className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${(kashta / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/10 text-[11px] text-amber-300/80 flex justify-between">
                    <span>इष्ट अनुपात: {((ishta / (ishta + kashta || 1)) * 100).toFixed(0)}%</span>
                    <span>
                      {ishta > kashta ? (
                        <span className="text-emerald-400 font-bold">शुभ फल प्रधान</span>
                      ) : (
                        <span className="text-rose-400 font-bold">कष्ट फल प्रधान</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: BHAVA BALA ================= */}
      {activeSubTab === "bhavabala" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {shadbala.bhavas.map((bhava) => (
              <div
                key={bhava.houseNumber}
                className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 space-y-2.5 hover:border-amber-400/40 transition-all shadow-md"
              >
                <div className="flex items-center justify-between border-b border-amber-500/15 pb-2 text-xs">
                  <span className="font-black text-amber-100 text-sm">
                    {bhava.houseNumber}म भाव ({BHAVA_NAMES_SANSKRIT[bhava.houseNumber - 1]})
                  </span>
                  <span className="bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-md font-bold font-mono">
                    रैंक #{bhava.rank}
                  </span>
                </div>

                <div className="text-xs text-amber-200/90 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-amber-400/80">राशि व भावेश:</span>
                    <span className="font-semibold text-amber-200">
                      {ZODIAC_NAMES_HI[bhava.signIndex]?.split(" ")[0]} (स्वामी: {PLANET_NAMES[bhava.signLord]?.hi?.split(" ")[0]})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400/80">भावाधिपति बल:</span>
                    <span className="font-mono text-amber-100">{bhava.bhavadhipatiBala.toFixed(1)} विरूपा</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400/80">भाव दिग्बल:</span>
                    <span className="font-mono text-amber-100">{bhava.bhavaDigBala.toFixed(1)} विरूपा</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400/80">भाव दृष्टि बल:</span>
                    <span className="font-mono text-amber-100">{bhava.bhavaDrishtiBala.toFixed(1)} विरूपा</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold">कुल भाव बल:</span>
                  <span className="font-black text-amber-100 font-mono text-sm">
                    {bhava.totalRupas.toFixed(2)} रूप ({bhava.totalVirupas.toFixed(0)} विरूपा)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
