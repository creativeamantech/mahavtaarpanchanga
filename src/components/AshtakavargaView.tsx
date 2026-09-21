import React, { useState } from "react";
import { AshtakavargaData, computeAshtakavarga } from "../lib/ashtakavargaEngine";
import { KundliPlanet, ZODIAC_SIGNS } from "../lib/kundliEngine";
import { Table, ShieldCheck, Zap, Info, Sparkles, BarChart2 } from "lucide-react";

interface AshtakavargaViewProps {
  planets: KundliPlanet[];
  lagnaSignIndex: number;
}

export const AshtakavargaView: React.FC<AshtakavargaViewProps> = ({
  planets,
  lagnaSignIndex,
}) => {
  const [selectedPlanetBAV, setSelectedPlanetBAV] = useState<string>("all");
  const data: AshtakavargaData = computeAshtakavarga(planets, lagnaSignIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900/90 to-amber-950/80 border border-amber-500/30 text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-amber-200">
              सर्व अष्टकवर्ग चक्र (Sarvashtakavarga - SAV)
            </h3>
          </div>
          <p className="text-xs text-amber-300/80">
            महर्षि पराशर विरचित बृहत्पाराशर होराशास्त्र अनुसार कुल ३३७ रेखा/बिन्दु का १२ राशियों में वितरण
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-950/60 px-4 py-2 rounded-xl border border-amber-500/20">
          <div className="text-center">
            <span className="text-[10px] text-amber-400 block uppercase font-bold">कुल रेखा (Total SAV)</span>
            <span className="text-lg font-black text-amber-100">{data.totalSAV} / 337</span>
          </div>
          <div className="h-7 w-px bg-amber-500/20"></div>
          <div className="text-center">
            <span className="text-[10px] text-amber-400 block uppercase font-bold">औसत प्रति भाव</span>
            <span className="text-lg font-black text-emerald-300">28.08</span>
          </div>
        </div>
      </div>

      {/* 12 Houses / Signs SAV Grid */}
      <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <h4 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            द्वादश भाव एवं राशि बिन्दु सामर्थ्य (House & Sign Bindu Strengths)
          </h4>
          <span className="text-xs text-amber-300/70 hidden sm:inline">
            (&gt;28 बिन्दु: शुभ एवं समृद्ध, &lt;25 बिन्दु: सामान्य)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {data.savByHouse.map((h) => {
            const isHigh = h.bindus >= 30;
            const isMedium = h.bindus >= 25 && h.bindus < 30;
            return (
              <div
                key={h.houseNumber}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                  isHigh
                    ? "bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                    : isMedium
                    ? "bg-amber-950/30 border-amber-500/30"
                    : "bg-rose-950/25 border-rose-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    भाव {h.houseNumber} ({h.signNameHi})
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isHigh
                        ? "bg-emerald-900/60 text-emerald-200 border border-emerald-400/40"
                        : isMedium
                        ? "bg-amber-900/50 text-amber-200"
                        : "bg-rose-900/50 text-rose-200"
                    }`}
                  >
                    {isHigh ? "बलवान" : isMedium ? "मध्यम" : "अल्प"}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-100">{h.bindus}</span>
                  <span className="text-[11px] text-amber-300/70 font-mono">बिन्दु</span>
                </div>

                <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${
                      isHigh ? "bg-emerald-400" : isMedium ? "bg-amber-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${Math.min(100, (h.bindus / 40) * 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bhinnashtakavarga (BAV) Table & Selector */}
      <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-3 gap-3">
          <h4 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            भिन्नाष्टकवर्ग सारणी (Bhinnashtakavarga - BAV of 7 Grahas)
          </h4>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setSelectedPlanetBAV("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold border ${
                selectedPlanetBAV === "all"
                  ? "bg-amber-700 text-white border-amber-400"
                  : "bg-amber-950/40 text-amber-300/80 border-amber-500/20"
              }`}
            >
              सभी ग्रह
            </button>
            {data.bavByPlanet.map((p) => (
              <button
                key={p.planetId}
                onClick={() => setSelectedPlanetBAV(p.planetId)}
                className={`px-2.5 py-1 rounded-lg font-semibold border ${
                  selectedPlanetBAV === p.planetId
                    ? "bg-amber-700 text-white border-amber-400"
                    : "bg-amber-950/40 text-amber-300/80 border-amber-500/20"
                }`}
              >
                {p.planetNameHi.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive BAV Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-amber-500/20">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-amber-950/70 text-amber-300 border-b border-amber-500/30 font-bold">
              <tr>
                <th className="p-2.5">ग्रह (Planet)</th>
                {ZODIAC_SIGNS.map((s, idx) => (
                  <th key={s.id} className="p-2.5 text-center">
                    <div>{s.hi}</div>
                    <div className="text-[10px] text-amber-400/60 font-mono">R{idx + 1}</div>
                  </th>
                ))}
                <th className="p-2.5 text-center bg-amber-900/40">योग</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10 text-amber-100">
              {data.bavByPlanet
                .filter((p) => selectedPlanetBAV === "all" || p.planetId === selectedPlanetBAV)
                .map((p) => (
                  <tr key={p.planetId} className="hover:bg-amber-950/30 transition-colors">
                    <td className="p-2.5 font-bold text-amber-200">{p.planetNameHi}</td>
                    {p.bindus.map((b, signIdx) => (
                      <td
                        key={signIdx}
                        className={`p-2.5 text-center font-mono ${
                          b >= 5 ? "font-bold text-emerald-300 bg-emerald-950/20" : b <= 2 ? "text-rose-300" : ""
                        }`}
                      >
                        {b}
                      </td>
                    ))}
                    <td className="p-2.5 text-center font-bold font-mono bg-amber-900/30 text-amber-200">
                      {p.totalBindus}
                    </td>
                  </tr>
                ))}

              {/* SAV Total Row */}
              <tr className="bg-amber-950/90 font-bold text-amber-200 border-t-2 border-amber-500/40">
                <td className="p-2.5 text-amber-300">सर्व अष्टकवर्ग (SAV)</td>
                {data.savBySign.map((total, idx) => (
                  <td
                    key={idx}
                    className={`p-2.5 text-center font-mono text-sm ${
                      total >= 28 ? "text-emerald-300 font-black" : "text-amber-100"
                    }`}
                  >
                    {total}
                  </td>
                ))}
                <td className="p-2.5 text-center font-mono text-sm text-emerald-300 font-black bg-amber-900/60">
                  {data.totalSAV}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Shodhita Ashtakavarga Reductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Trikona Shodhana */}
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            त्रिकोण शोधन (Trikona Shodhana Reduction)
          </h4>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            धर्म, अर्थ, काम व मोक्ष त्रिकोणों (1-5-9, 2-6-10, 3-7-11, 4-8-12) के न्यूनतम बिन्दु घटाकर शोधन:
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {data.trikonaShodhitaSAV.map((val, idx) => (
              <div key={idx} className="p-2 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-[10px] text-amber-400 block">{ZODIAC_SIGNS[idx].hi}</span>
                <span className="text-sm font-bold text-amber-100 font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekadhipatya Shodhana */}
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            एकाधिपत्य शोधन (Ekadhipatya Shodhana Reduction)
          </h4>
          <p className="text-xs text-amber-300/80 leading-relaxed">
            मंगल, बुध, गुरु, शुक्र व शनि की दोहरी राशियों में ग्रह स्थिति अनुसार शोधित मान:
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {data.ekadhipatyaShodhitaSAV.map((val, idx) => (
              <div key={idx} className="p-2 bg-amber-950/40 rounded-xl border border-amber-500/15">
                <span className="text-[10px] text-amber-400 block">{ZODIAC_SIGNS[idx].hi}</span>
                <span className="text-sm font-bold text-amber-100 font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
