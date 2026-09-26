import React from "react";
import { computeKPAstrology } from "../lib/kpAstrologyEngine";
import { KundliPlanet } from "../lib/kundliEngine";
import { Compass, Sparkles, Table, Star } from "lucide-react";

interface KpAstrologyViewProps {
  lagnaLongitude: number;
  planets: KundliPlanet[];
}

export const KpAstrologyView: React.FC<KpAstrologyViewProps> = ({
  lagnaLongitude,
  planets,
}) => {
  const kpData = computeKPAstrology(lagnaLongitude, planets);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              के.पी. ज्योतिष पद्धति (Krishnamurti Padhdhati - KP System)
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            द्वादश भाव संधि (Cusps), राशि स्वामी, नक्षत्र स्वामी (Star Lord) एवं उप-स्वामी (Sub-Lord) सारणी
          </p>
        </div>

        <div className="bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-zinc-700 text-xs text-amber-400 font-mono">
          सटीक उप-स्वामी उप-विभाजन
        </div>
      </div>

      {/* Ruling Planets (RPs) */}
      <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-5 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-700 pb-2">
          <Star className="w-4 h-4 text-amber-400" />
          के.पी. शासक ग्रह (Ruling Planets - RPs)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {kpData.rulingPlanets.map((rp, idx) => (
            <div key={idx} className="p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-center">
              <span className="text-[10px] text-zinc-400 block truncate">{rp.factorHi}</span>
              <span className="text-sm font-bold text-white block mt-0.5">{rp.planetHi}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 12 House Cusps Table */}
      <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            द्वादश भाव कस्प (12 Bhava Cusps & KP Sub-Lords)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-zinc-800 text-zinc-300 border-b border-zinc-700 font-bold">
              <tr>
                <th className="p-2.5">भाव (Cusp)</th>
                <th className="p-2.5">राशि (Sign)</th>
                <th className="p-2.5">अंश (DMS)</th>
                <th className="p-2.5">राशि स्वामी (Sign Lord)</th>
                <th className="p-2.5">नक्षत्र स्वामी (Star Lord)</th>
                <th className="p-2.5 text-amber-400 font-bold">उप-स्वामी (Sub-Lord)</th>
                <th className="p-2.5">उप-उप-स्वामी (Sub-Sub)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700 text-white">
              {kpData.cusps.map((c) => (
                <tr key={c.houseNumber} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-2.5 font-bold text-amber-400">भाव {c.houseNumber}</td>
                  <td className="p-2.5 text-zinc-200">{c.signNameHi}</td>
                  <td className="p-2.5 font-mono text-amber-300">{c.dmsStr}</td>
                  <td className="p-2.5 text-zinc-200">{c.signLord}</td>
                  <td className="p-2.5 text-zinc-200">{c.starLord}</td>
                  <td className="p-2.5 font-bold text-amber-400 bg-zinc-800/60">{c.subLord}</td>
                  <td className="p-2.5 text-zinc-400">{c.subSubLord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KP Planetary Significations Table */}
      <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-700 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
          <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            ग्रह कारकत्व एवं ४-स्तरीय सिग्निफिकेटर्स (4-Fold Significations)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-zinc-800 text-zinc-300 border-b border-zinc-700 font-bold">
              <tr>
                <th className="p-2.5">ग्रह (Planet)</th>
                <th className="p-2.5">नक्षत्र स्वामी</th>
                <th className="p-2.5 text-amber-400 font-bold">उप-स्वामी (Sub)</th>
                <th className="p-2.5">स्तर १ (Star Lord Occupancy)</th>
                <th className="p-2.5">स्तर २ (Planet Occupancy)</th>
                <th className="p-2.5">स्तर ३ (Star Lord Ownership)</th>
                <th className="p-2.5">स्तर ४ (Planet Ownership)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700 text-white">
              {kpData.planetSignifications.map((p) => (
                <tr key={p.planetId} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-2.5 font-bold text-white">{p.planetNameHi}</td>
                  <td className="p-2.5 text-zinc-200">{p.starLord}</td>
                  <td className="p-2.5 font-bold text-amber-400 bg-zinc-800/60">{p.subLord}</td>
                  <td className="p-2.5 font-mono text-emerald-400">
                    {p.level1.length ? p.level1.join(", ") : "-"}
                  </td>
                  <td className="p-2.5 font-mono text-amber-300">
                    {p.level2.length ? p.level2.join(", ") : "-"}
                  </td>
                  <td className="p-2.5 font-mono text-blue-400">
                    {p.level3.length ? p.level3.join(", ") : "-"}
                  </td>
                  <td className="p-2.5 font-mono text-purple-400">
                    {p.level4.length ? p.level4.join(", ") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
