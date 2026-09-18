import React, { useState } from "react";
import { planetsData } from "../data";
import { Planet } from "../types";
import { Star, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface NavagrahaViewProps {
  lang: "en" | "hi";
  theme: "parchment" | "nightSky";
}

export const NavagrahaView: React.FC<NavagrahaViewProps> = ({ lang, theme }) => {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>(planetsData[0].id);

  const selectedPlanet = planetsData.find((p) => p.id === selectedPlanetId) || planetsData[0];

  const isNight = theme === "nightSky";

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Sidebar for Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <h3 className={cn(
          "text-xs font-bold uppercase tracking-widest px-2 mb-2",
          isNight ? "text-slate-400" : "text-stone-500"
        )}>
          {lang === "hi" ? "ग्रह चयन" : "Select Planet"}
        </h3>
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 hide-scrollbar">
          {planetsData.map((planet) => (
            <button
              key={planet.id}
              onClick={() => setSelectedPlanetId(planet.id)}
              className={cn(
                "relative flex items-center justify-between w-auto md:w-full px-4 py-3 rounded-xl font-bold transition-all text-sm shrink-0 md:shrink border",
                selectedPlanetId === planet.id
                  ? isNight
                    ? "bg-indigo-900/40 text-amber-300 border-indigo-500/40 shadow-sm"
                    : "bg-white text-amber-700 border-amber-200 shadow-sm"
                  : isNight
                    ? "bg-[#0e1424]/50 text-slate-400 border-indigo-950/40 hover:bg-indigo-950/40 hover:text-slate-200"
                    : "bg-transparent text-stone-500 border-transparent hover:bg-stone-100 hover:text-stone-800"
              )}
            >
              <span className="font-devanagari whitespace-nowrap">
                {lang === "hi" ? planet.name : planet.englishName.split(" - ")[0]}
              </span>
              {selectedPlanetId === planet.id && (
                <motion.div layoutId="navagraha-active-indicator" className="hidden md:block">
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPlanet.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "rounded-2xl p-6 sm:p-8 border shadow-sm h-full",
              isNight ? "bg-[#0e1424]/80 border-indigo-950/60" : "bg-white border-amber-100"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className={cn(
                  "text-2xl sm:text-3xl font-black font-devanagari mb-2",
                  isNight ? "text-amber-300" : "text-amber-900"
                )}>
                  {selectedPlanet.name}
                </h2>
                <p className={cn(
                  "text-sm font-bold tracking-wide",
                  isNight ? "text-slate-400" : "text-stone-500"
                )}>
                  {selectedPlanet.englishName}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                selectedPlanet.colorTheme.bg
              )}>
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className={cn(
                "p-3 rounded-xl border",
                isNight ? "bg-indigo-950/20 border-indigo-900/30" : "bg-stone-50 border-stone-100"
              )}>
                <div className={cn("text-[10px] uppercase tracking-wider font-bold mb-1", isNight ? "text-slate-500" : "text-stone-400")}>
                  {lang === "hi" ? "अधिदेवता" : "Deity"}
                </div>
                <div className={cn("text-sm font-bold font-devanagari", isNight ? "text-slate-200" : "text-stone-800")}>
                  {selectedPlanet.deity}
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-xl border",
                isNight ? "bg-indigo-950/20 border-indigo-900/30" : "bg-stone-50 border-stone-100"
              )}>
                <div className={cn("text-[10px] uppercase tracking-wider font-bold mb-1", isNight ? "text-slate-500" : "text-stone-400")}>
                  {lang === "hi" ? "रत्न" : "Gemstone"}
                </div>
                <div className={cn("text-sm font-bold font-devanagari", isNight ? "text-slate-200" : "text-stone-800")}>
                  {selectedPlanet.gemstone}
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-xl border",
                isNight ? "bg-indigo-950/20 border-indigo-900/30" : "bg-stone-50 border-stone-100"
              )}>
                <div className={cn("text-[10px] uppercase tracking-wider font-bold mb-1", isNight ? "text-slate-500" : "text-stone-400")}>
                  {lang === "hi" ? "दिशा" : "Direction"}
                </div>
                <div className={cn("text-sm font-bold font-devanagari", isNight ? "text-slate-200" : "text-stone-800")}>
                  {selectedPlanet.direction}
                </div>
              </div>
              <div className={cn(
                "p-3 rounded-xl border",
                isNight ? "bg-indigo-950/20 border-indigo-900/30" : "bg-stone-50 border-stone-100"
              )}>
                <div className={cn("text-[10px] uppercase tracking-wider font-bold mb-1", isNight ? "text-slate-500" : "text-stone-400")}>
                  {lang === "hi" ? "समिधा" : "Samidha"}
                </div>
                <div className={cn("text-sm font-bold font-devanagari", isNight ? "text-slate-200" : "text-stone-800")}>
                  {selectedPlanet.samidha}
                </div>
              </div>
            </div>

            {/* Mantras Section */}
            <div className="space-y-6">
              {/* Dhyan Mantra (Highlighted) */}
              <div className={cn(
                "p-5 rounded-xl border border-l-4 relative overflow-hidden",
                selectedPlanet.colorTheme.lightBg,
                selectedPlanet.colorTheme.border,
                `border-l-${selectedPlanet.colorTheme.bg.split('-')[1]}-500`
              )}>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Star className={cn("w-24 h-24", selectedPlanet.colorTheme.text)} />
                </div>
                <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-2", selectedPlanet.colorTheme.text)}>
                  {lang === "hi" ? "ध्यान मन्त्र" : "Dhyan Mantra"}
                </h4>
                <p className={cn("text-lg sm:text-xl font-medium font-devanagari leading-relaxed whitespace-pre-line", isNight ? "text-slate-900" : "text-stone-900")}>
                  {selectedPlanet.dhyanMantra}
                </p>
                <div className={cn("mt-3 text-xs font-medium flex items-center gap-1.5 opacity-80", selectedPlanet.colorTheme.text)}>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "जप संख्या:" : "Chant Count:"} {selectedPlanet.japCount}</span>
                </div>
              </div>

              {/* Gayatri Mantra */}
              <div>
                <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-2", isNight ? "text-slate-400" : "text-stone-500")}>
                  {lang === "hi" ? "गायत्री मन्त्र" : "Gayatri Mantra"}
                </h4>
                <p className={cn("text-base font-medium font-devanagari leading-loose", isNight ? "text-slate-300" : "text-stone-700")}>
                  {selectedPlanet.gayatriMantra}
                </p>
              </div>

              {/* Vedokta Mantra */}
              <div>
                <h4 className={cn("text-xs font-bold uppercase tracking-widest mb-2", isNight ? "text-slate-400" : "text-stone-500")}>
                  {lang === "hi" ? "वेदोक्त मन्त्र" : "Vedokta Mantra"}
                </h4>
                <p className={cn("text-base font-medium font-devanagari leading-loose whitespace-pre-line", isNight ? "text-slate-300" : "text-stone-700")}>
                  {selectedPlanet.vedoktaMantra}
                </p>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
