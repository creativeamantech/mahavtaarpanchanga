import React, { useState } from "react";
import { AshtakavargaData, computeAshtakavarga } from "../lib/ashtakavargaEngine";
import { KundliPlanet, ZODIAC_SIGNS } from "../lib/kundliEngine";
import { Table, ShieldCheck, Zap, Sparkles, BarChart2 } from "lucide-react";

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
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              सर्व अष्टकवर्ग चक्र (Sarvashtakavarga - SAV)
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            महर्षि पराशर विरचित बृहत्पाराशर होराशास्त्र अनुसार कुल ३३७ रेखा/बिन्दु का १२ राशियों में वितरण
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700">
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">कुल रेखा (Total SAV)</span>
            <span className="text-lg font-black text-white font-mono">{data.totalSAV} / 337</span>
          </div>
          <div className="h-7 w-px bg-zinc-700"></div>
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">औसत प्रति भाव</span>
            <span className="text-lg font-black text-emerald-400 font-mono">28.08</span>
          </div>
        </div>
      </div>

      {/* 12 Houses / Signs SAV Grid */}
      <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            द्वादश भाव एवं राशि बिन्दु सामर्थ्य (House & Sign Bindu Strengths)
          </h4>
          <span className="text-xs text-zinc-400 hidden sm:inline">
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
                    ? "bg-emerald-950/40 border-emerald-700 shadow-sm"
                    : isMedium
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-red-950/40 border-red-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">
                    भाव {h.houseNumber} ({h.signNameHi})
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isHigh
                        ? "bg-emerald-900 text-emerald-300 border border-emerald-600"
                        : isMedium
                        ? "bg-zinc-700 text-zinc-200"
                        : "bg-red-900/60 text-red-300"
                    }`}
                  >
                    {isHigh ? "बलवान" : isMedium ? "मध्यम" : "अल्प"}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white font-mono">{h.bindus}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">बिन्दु</span>
                </div>

                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${
                      isHigh ? "bg-emerald-400" : isMedium ? "bg-amber-400" : "bg-red-400"
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
      <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-700 pb-3 gap-3">
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            भिन्नाष्टकवर्ग सारणी (Bhinnashtakavarga - BAV of 7 Grahas)
          </h4>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setSelectedPlanetBAV("all")}
              className={`min-h-[36px] px-3 py-1 rounded-xl font-semibold border cursor-pointer ${
                selectedPlanetBAV === "all"
                  ? "bg-amber-600 text-white border-amber-500 font-bold"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
              }`}
            >
              सभी ग्रह
            </button>
            {data.bavByPlanet.map((p) => (
              <button
                key={p.planetId}
                onClick={() => setSelectedPlanetBAV(p.planetId)}
                className={`min-h-[36px] px-2.5 py-1 rounded-xl font-semibold border cursor-pointer ${
                  selectedPlanetBAV === p.planetId
                    ? "bg-amber-600 text-white border-amber-500 font-bold"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
                }`}
              >
                {p.planetNameHi.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive BAV Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-zinc-800 text-zinc-300 border-b border-zinc-700 font-bold">
              <tr>
                <th className="p-2.5">ग्रह (Planet)</th>
                {ZODIAC_SIGNS.map((s, idx) => (
                  <th key={s.id} className="p-2.5 text-center">
                    <div>{s.hi}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">R{idx + 1}</div>
                  </th>
                ))}
                <th className="p-2.5 text-center bg-zinc-800/80 text-amber-400">योग</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700 text-white">
              {data.bavByPlanet
                .filter((p) => selectedPlanetBAV === "all" || p.planetId === selectedPlanetBAV)
                .map((p) => (
                  <tr key={p.planetId} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-2.5 font-bold text-white">{p.planetNameHi}</td>
                    {p.bindus.map((b, signIdx) => (
                      <td
                        key={signIdx}
                        className={`p-2.5 text-center font-mono ${
                          b >= 5 ? "font-bold text-emerald-300 bg-emerald-950/30" : b <= 2 ? "text-red-300" : "text-zinc-200"
                        }`}
                      >
                        {b}
                      </td>
                    ))}
                    <td className="p-2.5 text-center font-bold font-mono bg-zinc-800 text-amber-400">
                      {p.totalBindus}
                    </td>
                  </tr>
                ))}

              {/* SAV Total Row */}
              <tr className="bg-zinc-800 font-bold text-white border-t-2 border-zinc-600">
                <td className="p-2.5 text-amber-400 font-bold">सर्व अष्टकवर्ग (SAV)</td>
                {data.savBySign.map((total, idx) => (
                  <td
                    key={idx}
                    className={`p-2.5 text-center font-mono text-sm ${
                      total >= 28 ? "text-emerald-400 font-black" : "text-white"
                    }`}
                  >
                    {total}
                  </td>
                ))}
                <td className="p-2.5 text-center font-mono text-sm text-emerald-400 font-black bg-zinc-800">
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
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-700 pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            त्रिकोण शोधन (Trikona Shodhana Reduction)
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            धर्म, अर्थ, काम व मोक्ष त्रिकोणों (1-5-9, 2-6-10, 3-7-11, 4-8-12) के न्यूनतम बिन्दु घटाकर शोधन:
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {data.trikonaShodhitaSAV.map((val, idx) => (
              <div key={idx} className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-[10px] text-zinc-400 block">{ZODIAC_SIGNS[idx].hi}</span>
                <span className="text-sm font-bold text-white font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekadhipatya Shodhana */}
        <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-700 pb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            एकाधिपत्य शोधन (Ekadhipatya Shodhana Reduction)
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            मंगल, बुध, गुरु, शुक्र व शनि की दोहरी राशियों में ग्रह स्थिति अनुसार शोधित मान:
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {data.ekadhipatyaShodhitaSAV.map((val, idx) => (
              <div key={idx} className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="text-[10px] text-zinc-400 block">{ZODIAC_SIGNS[idx].hi}</span>
                <span className="text-sm font-bold text-white font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
