import React, { useState } from "react";
import { computeGochara, GocharaReport } from "../lib/gocharaEngine";
import { Compass, Calendar, Sparkles, Moon, AlertCircle } from "lucide-react";

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
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              गोचर ग्रह स्थिति एवं वेध विश्लेषण (Planetary Transits & Vedha)
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            जन्म चन्द्र राशि ({report.natalMoonSignHi}) एवं लग्न ({report.natalLagnaSignHi}) से वर्तमान गोचरीय प्रभाव
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded-xl border border-zinc-600">
          <Calendar className="w-4 h-4 text-amber-400 ml-1" />
          <input
            type="date"
            value={selectedTransitDate}
            onChange={(e) => setSelectedTransitDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Sade Sati / Dhaiya Live Transit Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          report.sadeSatiTransit.inSadeSati
            ? "bg-zinc-900 border-amber-500/50 text-white"
            : "bg-zinc-900 border-zinc-700 text-white"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-bold text-amber-400">
              शनि गोचर स्थिति:
            </span>
            <span className="text-sm font-bold text-white">
              {report.sadeSatiTransit.phaseHi}
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {report.sadeSatiTransit.descriptionHi}
          </p>
        </div>

        <span
          className={`text-xs px-3.5 py-1.5 rounded-xl font-bold border shrink-0 ${
            report.sadeSatiTransit.inSadeSati
              ? "bg-orange-950 text-orange-300 border-orange-700"
              : "bg-emerald-950 text-emerald-300 border-emerald-700"
          }`}
        >
          {report.sadeSatiTransit.inSadeSati ? "साढ़े साती सक्रिय" : "साढ़े साती से मुक्त"}
        </span>
      </div>

      {/* Transit Planets Grid */}
      <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 border-b border-zinc-700 pb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          नवग्रह गोचर एवं चन्द्र कुण्डली से भाव स्थिति
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {report.transits.map((t) => (
            <div
              key={t.planetId}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                t.isFavorableFromMoon
                  ? "bg-emerald-950/40 border-emerald-700"
                  : t.hasVedha
                  ? "bg-zinc-800 border-amber-600/60"
                  : "bg-zinc-800 border-zinc-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-white">{t.planetNameHi}</span>
                    {t.isRetrograde && (
                      <span className="ml-1.5 text-[10px] text-orange-300 font-bold bg-orange-950 px-1.5 py-0.2 rounded border border-orange-800">
                        वक्री
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                      t.isFavorableFromMoon
                        ? "bg-emerald-900 text-emerald-300 border-emerald-600"
                        : t.hasVedha
                        ? "bg-orange-900 text-orange-300 border-orange-700"
                        : "bg-zinc-700 text-zinc-300 border-zinc-600"
                    }`}
                  >
                    {t.verdictHi}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
                  <span>
                    गोचर राशि: <b className="text-white">{t.transitSignNameHi}</b> ({t.transitDegree.toFixed(1)}°)
                  </span>
                  <span>
                    चन्द्र से: <b className="text-amber-400">{t.houseFromMoon}वाँ भाव</b>
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{t.predictionHi}</p>
              </div>

              {t.hasVedha && (
                <div className="mt-2.5 pt-2 border-t border-zinc-700 text-[11px] text-amber-400 flex items-center gap-1.5">
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
