import React, { useState } from "react";
import { computeGunaMilan, GunaMilanResult } from "../lib/gunaMilanEngine";
import { NAKSHATRAS_LIST, ZODIAC_SIGNS } from "../lib/kundliEngine";
import { Heart, CheckCircle, AlertTriangle, Sparkles, User, RefreshCw } from "lucide-react";

interface GunaMilanViewProps {
  currentPersonName?: string;
  currentMoonNakshatra?: number;
  currentMoonPada?: number;
  currentMoonRasi?: number;
  currentIsManglik?: boolean;
}

export const GunaMilanView: React.FC<GunaMilanViewProps> = ({
  currentPersonName = "वर (Groom)",
  currentMoonNakshatra = 1,
  currentMoonPada = 1,
  currentMoonRasi = 0,
  currentIsManglik = false,
}) => {
  // Boy State
  const [boyName, setBoyName] = useState<string>(currentPersonName);
  const [boyNak, setBoyNak] = useState<number>(currentMoonNakshatra);
  const [boyPada, setBoyPada] = useState<number>(currentMoonPada);
  const [boyRasi, setBoyRasi] = useState<number>(currentMoonRasi);
  const [boyManglik, setBoyManglik] = useState<boolean>(currentIsManglik);

  // Girl State
  const [girlName, setGirlName] = useState<string>("कन्या (Bride)");
  const [girlNak, setGirlNak] = useState<number>(4); // Rohini default
  const [girlPada, setGirlPada] = useState<number>(2);
  const [girlRasi, setGirlRasi] = useState<number>(1); // Taurus default
  const [girlManglik, setGirlManglik] = useState<boolean>(false);

  const result: GunaMilanResult = computeGunaMilan(
    {
      name: boyName,
      nakshatraNum: boyNak,
      pada: boyPada,
      rasiIndex: boyRasi,
      isManglik: boyManglik,
    },
    {
      name: girlName,
      nakshatraNum: girlNak,
      pada: girlPada,
      rasiIndex: girlRasi,
      isManglik: girlManglik,
    }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-stone-900/90 to-amber-950/80 border border-rose-500/30 text-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400/30" />
            <h3 className="text-base sm:text-lg font-bold text-rose-200">
              अष्टकूट गुण मिलान (Ashtakoota 36 Guna Milan - Marriage Compatibility)
            </h3>
          </div>
          <p className="text-xs text-rose-200/80">
            वैदिक ज्योतिष अनुसार वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी का सम्पूर्ण विश्लेषण
          </p>
        </div>

        {/* Total Score Badge */}
        <div className="flex items-center gap-3 bg-stone-900/90 px-4 py-2 rounded-xl border border-rose-500/30 shadow-md">
          <div className="text-center">
            <span className="text-[10px] text-rose-300 block uppercase font-bold">कुल प्राप्त गुण</span>
            <span className="text-2xl font-black text-rose-300">
              {result.totalObtainedScore} / 36
            </span>
          </div>
          <div className="h-8 w-px bg-rose-500/20"></div>
          <div className="text-center">
            <span className="text-[10px] text-rose-300 block uppercase font-bold">अनुकूलता</span>
            <span className="text-lg font-black text-amber-300">{result.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Inputs Form for Groom & Bride */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Boy Details Card */}
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-blue-500/30 p-4 sm:p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
            <h4 className="text-sm font-bold text-blue-200 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              वर का विवरण (Groom Profile)
            </h4>
            <span className="text-xs bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
              वर पक्ष
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-blue-300 font-semibold block mb-1">वर का नाम (Name):</label>
              <input
                type="text"
                value={boyName}
                onChange={(e) => setBoyName(e.target.value)}
                className="w-full bg-stone-900 border border-blue-500/30 rounded-xl px-3 py-1.5 text-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-blue-300 font-semibold block mb-1">जन्म नक्षत्र (Nakshatra):</label>
                <select
                  value={boyNak}
                  onChange={(e) => setBoyNak(parseInt(e.target.value) || 1)}
                  className="w-full bg-stone-900 border border-blue-500/30 rounded-xl px-2.5 py-1.5 text-blue-100"
                >
                  {NAKSHATRAS_LIST.map((n) => (
                    <option key={n.num} value={n.num}>
                      {n.num}. {n.hi} ({n.en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-blue-300 font-semibold block mb-1">चरण / पाद (Pada):</label>
                <select
                  value={boyPada}
                  onChange={(e) => setBoyPada(parseInt(e.target.value) || 1)}
                  className="w-full bg-stone-900 border border-blue-500/30 rounded-xl px-2.5 py-1.5 text-blue-100 font-mono"
                >
                  <option value={1}>पाद १</option>
                  <option value={2}>पाद २</option>
                  <option value={3}>पाद ३</option>
                  <option value={4}>पाद ४</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-blue-300 font-semibold block mb-1">चन्द्र राशि (Moon Sign):</label>
                <select
                  value={boyRasi}
                  onChange={(e) => setBoyRasi(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-900 border border-blue-500/30 rounded-xl px-2.5 py-1.5 text-blue-100"
                >
                  {ZODIAC_SIGNS.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      {s.hi} ({s.en})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-stone-900 border border-blue-500/30 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={boyManglik}
                    onChange={(e) => setBoyManglik(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-blue-200 font-semibold text-[11px]">मांगलिक दोष उपस्थित</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Girl Details Card */}
        <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-rose-500/30 p-4 sm:p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
            <h4 className="text-sm font-bold text-rose-200 flex items-center gap-2">
              <User className="w-4 h-4 text-rose-400" />
              कन्या का विवरण (Bride Profile)
            </h4>
            <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-semibold">
              कन्या पक्ष
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-rose-300 font-semibold block mb-1">कन्या का नाम (Name):</label>
              <input
                type="text"
                value={girlName}
                onChange={(e) => setGirlName(e.target.value)}
                className="w-full bg-stone-900 border border-rose-500/30 rounded-xl px-3 py-1.5 text-rose-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-rose-300 font-semibold block mb-1">जन्म नक्षत्र (Nakshatra):</label>
                <select
                  value={girlNak}
                  onChange={(e) => setGirlNak(parseInt(e.target.value) || 1)}
                  className="w-full bg-stone-900 border border-rose-500/30 rounded-xl px-2.5 py-1.5 text-rose-100"
                >
                  {NAKSHATRAS_LIST.map((n) => (
                    <option key={n.num} value={n.num}>
                      {n.num}. {n.hi} ({n.en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-rose-300 font-semibold block mb-1">चरण / पाद (Pada):</label>
                <select
                  value={girlPada}
                  onChange={(e) => setGirlPada(parseInt(e.target.value) || 1)}
                  className="w-full bg-stone-900 border border-rose-500/30 rounded-xl px-2.5 py-1.5 text-rose-100 font-mono"
                >
                  <option value={1}>पाद १</option>
                  <option value={2}>पाद २</option>
                  <option value={3}>पाद ३</option>
                  <option value={4}>पाद ४</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-rose-300 font-semibold block mb-1">चन्द्र राशि (Moon Sign):</label>
                <select
                  value={girlRasi}
                  onChange={(e) => setGirlRasi(parseInt(e.target.value) || 0)}
                  className="w-full bg-stone-900 border border-rose-500/30 rounded-xl px-2.5 py-1.5 text-rose-100"
                >
                  {ZODIAC_SIGNS.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      {s.hi} ({s.en})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-stone-900 border border-rose-500/30 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={girlManglik}
                    onChange={(e) => setGirlManglik(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-rose-200 font-semibold text-[11px]">मांगलिक दोष उपस्थित</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Summary & Verdict */}
      <div
        className={`p-5 rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          result.totalObtainedScore >= 21
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
            : result.totalObtainedScore >= 18
            ? "bg-amber-950/40 border-amber-500/40 text-amber-100"
            : "bg-rose-950/40 border-rose-500/40 text-rose-100"
        }`}
      >
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300">
            विवाह मिलान निर्णय (Matchmaking Final Verdict)
          </span>
          <h4 className="text-lg sm:text-xl font-black">{result.verdictLabelHi}</h4>
          <p className="text-xs opacity-90 leading-relaxed">{result.remedyAdviceHi}</p>
        </div>

        <div className="p-3 bg-stone-950/80 rounded-2xl border border-amber-500/20 text-xs space-y-1 min-w-[240px]">
          <span className="text-amber-300 font-bold block">मांगलिक मिलान स्थिति:</span>
          <p className="text-amber-100">{result.manglikMatch.descriptionHi}</p>
        </div>
      </div>

      {/* Ashtakoota 8 Koota Breakdown Cards */}
      <div className="bg-stone-950/80 rounded-2xl sm:rounded-3xl border border-amber-500/25 p-4 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          अष्टकूट गुण विवरण (Detailed 8-Kootas Breakdown)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(result.kootas).map((koota, idx) => {
            const isFull = koota.obtainedScore === koota.maxScore;
            const isZero = koota.obtainedScore === 0;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isFull
                    ? "bg-emerald-950/30 border-emerald-500/40"
                    : isZero
                    ? "bg-rose-950/30 border-rose-500/40"
                    : "bg-amber-950/30 border-amber-500/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-200">{koota.nameHi}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                        isFull
                          ? "bg-emerald-900/70 text-emerald-200"
                          : isZero
                          ? "bg-rose-900/70 text-rose-200"
                          : "bg-amber-900/70 text-amber-200"
                      }`}
                    >
                      {koota.obtainedScore} / {koota.maxScore}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-300/80 leading-relaxed mb-2">
                    {koota.descriptionHi}
                  </p>
                </div>

                {koota.isCancelled && (
                  <div className="mt-1 pt-1.5 border-t border-amber-500/20 text-[10px] text-emerald-300 font-semibold">
                    परिहार: {koota.cancellationReasonHi}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
