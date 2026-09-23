import React, { useState } from "react";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

interface KundliWelcomeFlowProps {
  personName: string;
  setPersonName: (name: string) => void;
  birthDate: string;
  setBirthDate: (date: string) => void;
  birthTime: string;
  setBirthTime: (time: string) => void;
  selectedCity: string;
  onOpenCityModal: () => void;
  onComplete: () => void;
}

export const KundliWelcomeFlow: React.FC<KundliWelcomeFlowProps> = ({
  personName,
  setPersonName,
  birthDate,
  setBirthDate,
  birthTime,
  setBirthTime,
  selectedCity,
  onOpenCityModal,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 select-text text-zinc-100">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              वैदिक कुण्डली निर्माण
            </span>
            <span className="font-mono bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-600">
              चरण {step} / 3
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-amber-500 shadow-xs shadow-amber-500/50" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: NAAM */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                अपनी जन्म कुण्डली देखें
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                3 आसान चरणों में अपनी वैदिक कुण्डली बनाएं
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" /> आपका नाम:
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="उदा. राहुल शर्मा"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner min-h-[48px]"
                autoFocus
              />
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>आगे बढ़ें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: JANAM TITHI & SAMAY */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                जन्म तिथि व समय
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                सटीक वैदिक गणितीय गणना हेतु जन्म समय भरें
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" /> जन्म तिथि:
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[48px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> जन्म समय:
                </label>
                <input
                  type="time"
                  step="1"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl px-3 py-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>पीछे</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-[2] min-h-[48px] py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>स्थान चुनें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: JANAM STHAN */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                जन्म स्थान
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                स्थान के आधार पर लग्न एवं भाव स्पष्ट होंगे
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" /> जन्म नगर (City):
                </span>
                <span className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer" onClick={onOpenCityModal}>
                  स्थान बदलें / GPS
                </span>
              </label>

              <div
                onClick={onOpenCityModal}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-amber-500 hover:bg-zinc-750 transition-all min-h-[48px]"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm sm:text-base text-white truncate">
                    {selectedCity}
                  </span>
                </div>
                <Search className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
              </div>
            </div>

            <div className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> विवरण तैयार है
              </div>
              <p className="text-zinc-300">
                {personName || "जातक"} • {birthDate} {birthTime} • {selectedCity}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>पीछे</span>
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="flex-[2] min-h-[48px] py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>कुण्डली बनाएं →</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Skip button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onComplete}
            className="text-[11px] text-zinc-400 hover:text-amber-400 underline cursor-pointer"
          >
            सीधे मुख्य कुण्डली देखें
          </button>
        </div>
      </div>
    </div>
  );
};
