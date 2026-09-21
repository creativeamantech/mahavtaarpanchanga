import React, { useState } from "react";
import { computeGochara, GocharaReport } from "../lib/gocharaEngine";
import { Compass, Calendar, ShieldCheck, AlertCircle, Sparkles, Moon } from "lucide-react";

interface GocharViewProps {
  natalMoonSignIndex: number;
  natalLagnaSignIndex: number;
  latitude?: number;
  longitude?: number;
}

export const GocharView: React.FC<GocharViewProps> = ({
  natalMoonSignIndex,
  natalLagnaSignIndex,
  latitude = 28.6139,
  longitude = 77.209,
}) => {
  const [selectedTransitDate, setSelectedTransitDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const report: GocharaReport = computeGochara(
    natalMoonSignIndex,
    natalLagnaSignIndex,
    new Date(selectedTransitDate),
    latitude,
    longitude
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900/90 to-amber-950/80 border border-amber-500/30 text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-amber-200">
              गोचर ग्रह स्थिति एवं वेध विश्लेषण (Planetary Transits & Vedha)
            </h3>
          </div>
          <p className="text-xs text-amber-300/80">
            जन्म चन्द्र राशि ({report.natalMoonSignHi}) एवं लग्न ({report.natalLagnaSignHi}) से वर्तमान गोचरीय प्रभाव
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-amber-950/70 p-1.5 rounded-xl border border-amber-500/30">
          <Calendar className="w-4 h-4 text-amber-400 ml-1.5" />
          <input
            type="date"
            value={selectedTransitDate}
            onChange={(e) => setSelectedTransitDate(e.target.value)}
            className="bg-stone-900 border-none text-xs text-amber-100 px-2 py-1 rounded-lg focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Sade Sati / Dhaiya Live Transit Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          report.sadeSatiTransit.inSadeSati
            ? "bg-amber-950/40 border-amber-500/40 text-amber-100"
            : "bg-stone-950/80 border-amber-500/25 text-amber-100"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-bold text-amber-400">
              शनि गोचर स्थिति:
            </span>
            <span className="text-sm font-bold text-amber-200">
              {report.sadeSatiTransit.phaseHi}
            </span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {report.sadeSatiTransit.descriptionHi}
          </p>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full font-bold border shrink-0 ${
            report.sadeSatiTransit.inSadeSati
              ? "bg-amber-900/60 text-amber-200 border-amber-400/40"
              : "bg-emerald-900/40 text-emerald-200 border-emerald-500/30"
          }`}
        >
          {report.sadeSatiTransit.inSadeSati ? "साढ़े साती सक्रिय" : "साढ़े साती से मुक्त"}
        </span>
      </div>

      {/* Transit Planets Grid */}
      <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          नवग्रह गोचर एवं चन्द्र कुण्डली से भाव स्थिति
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {report.transits.map((t) => (
            <div
              key={t.planetId}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                t.isFavorableFromMoon
                  ? "bg-emerald-950/30 border-emerald-500/40"
                  : t.hasVedha
                  ? "bg-amber-950/30 border-amber-500/40"
                  : "bg-stone-900/80 border-amber-500/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-amber-100">{t.planetNameHi}</span>
                    {t.isRetrograde && (
                      <span className="ml-1 text-[10px] text-rose-300 font-bold bg-rose-950 px-1 py-0.2 rounded border border-rose-500/30">
                        वक्र
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      t.isFavorableFromMoon
                        ? "bg-emerald-900/60 text-emerald-200 border border-emerald-400/40"
                        : t.hasVedha
                        ? "bg-amber-900/60 text-amber-200 border border-amber-400/40"
                        : "bg-stone-800 text-stone-300"
                    }`}
                  >
                    {t.verdictHi}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2 font-mono">
                  <span>
                    गोचर राशि: <b className="text-amber-100">{t.transitSignNameHi}</b> ({t.transitDegree.toFixed(1)}°)
                  </span>
                  <span>
                    चन्द्र से: <b className="text-amber-200">{t.houseFromMoon}वाँ भाव</b>
                  </span>
                </div>

                <p className="text-xs text-amber-200/90 leading-relaxed">{t.predictionHi}</p>
              </div>

              {t.hasVedha && (
                <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11px] text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>वेध बाधा: {t.vedhaPlanetName} द्वारा परिणाम बाधित</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
