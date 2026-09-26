import React, { useState } from "react";
import { JaiminiProfile } from "../kundali/jaimini/JaiminiTypes";
import { ZODIAC_SIGNS } from "../lib/kundliEngine";
import { Award, Compass, Eye, Layers, Clock, ShieldCheck } from "lucide-react";

interface JaiminiViewProps {
  jaimini?: JaiminiProfile;
}

export const JaiminiView: React.FC<JaiminiViewProps> = ({ jaimini }) => {
  const [subTab, setSubTab] = useState<
    "karakas" | "arudhas" | "upapada" | "karakamsha" | "drishti" | "dasha"
  >("karakas");

  if (!jaimini) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center text-zinc-400">
        जैमिनी ज्योतिषीय डेटा उपलब्ध नहीं है (Jaimini Profile Unavailable).
      </div>
    );
  }

  const { charaKarakas, arudhas, upapada, karakamsha, rashiDrishti, charaDasha } = jaimini;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-700 pb-3">
        {[
          { id: "karakas", label: "चर कारक (Chara Karakas)", icon: Award },
          { id: "arudhas", label: "आरूढ़ पद (Arudha Padas)", icon: Layers },
          { id: "upapada", label: "उपपद लग्न (Upapada)", icon: ShieldCheck },
          { id: "karakamsha", label: "कारकांश (Karakamsha)", icon: Compass },
          { id: "drishti", label: "राशि दृष्टि (Rashi Drishti)", icon: Eye },
          { id: "dasha", label: "चर दशा (Chara Dasha)", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`min-h-[40px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                isActive
                  ? "bg-amber-600 text-white border-amber-500 font-bold shadow-md"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-amber-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. CHARA KARAKAS */}
      {subTab === "karakas" && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              सप्त/अष्ट चर कारक व्यवस्था (Chara Karaka System)
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-amber-400 border border-zinc-600 font-bold">
              {charaKarakas.scheme === "7_karaka"
                ? "7 Karakas (BPHS / Rao)"
                : "8 Karakas (Neelakantha)"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300">
            ग्रहों के राशिगत भोगांश (Degrees in Sign) के अवरोही क्रम द्वारा निर्धारित कारक। सर्वोच्च
            भोगांश आत्मकारक (AK) तथा न्यूनतम दाराकारक (DK) कहलाता है।
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-700">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-800 text-zinc-300 border-b border-zinc-700 font-bold">
                  <th className="py-2.5 px-3">पद (Code)</th>
                  <th className="py-2.5 px-3">कारक नाम (Karaka Name)</th>
                  <th className="py-2.5 px-3">ग्रह (Planet)</th>
                  <th className="py-2.5 px-3">राशि (Sign)</th>
                  <th className="py-2.5 px-3">अंश (Degree)</th>
                  <th className="py-2.5 px-3 text-right">क्रम (Rank)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700 text-white">
                {charaKarakas.karakas.map((k) => (
                  <tr key={k.karakaId} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{k.karakaId}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-white">{k.nameSa}</span>
                      <span className="text-xs text-zinc-400 block">{k.nameEn}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-amber-400">{k.planet}</td>
                    <td className="py-2.5 px-3 text-zinc-300">
                      {ZODIAC_SIGNS[k.signIndex]?.hi} ({ZODIAC_SIGNS[k.signIndex]?.en})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-300 font-semibold">
                      {k.degreeInSign.toFixed(2)}°
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-400 font-bold">#{k.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ARUDHA PADAS */}
      {subTab === "arudhas" && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              द्वादश आरूढ़ पद (12 Arudha / Bhava Padas)
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-amber-400 border border-zinc-600 font-bold">
              {arudhas.exceptionConvention}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300">
            भाव से भावेश की दूरी का दर्पण प्रतिबिम्ब। महर्षि जैमिनी के नियमानुसार (सूत्र १.१.३०–३१)
            प्रथम व सप्तम भाव के अपवादों का शुद्ध समावेशन।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {arudhas.padas.map((p) => (
              <div
                key={p.padaCode}
                className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3.5 space-y-1.5 hover:border-zinc-500 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700">
                    {p.padaCode}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">भाव {p.houseNumber}</span>
                </div>
                <div className="font-bold text-sm text-white">{p.nameSa}</div>
                <div className="text-xs text-zinc-400">
                  राशि:{" "}
                  <span className="text-amber-400 font-semibold">
                    {ZODIAC_SIGNS[p.finalPadaSignIndex]?.hi} (
                    {ZODIAC_SIGNS[p.finalPadaSignIndex]?.en})
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  लग्न से भाव: <span className="text-white font-mono font-bold">{p.finalPadaHouseNumber}</span>
                </div>
                {p.isExceptionApplied && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800 mt-1 font-semibold">
                    अपवाद नियम प्रयुक्त (Exception)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. UPAPADA LAGNA */}
      {subTab === "upapada" && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            उपपद लग्न विवरण (Upapada Lagna / UL / Gauna Pada)
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300">
            द्वादश भाव का आरूढ़ पद वैवाहिक सुख, जीवनसाथी के स्वभाव एवं गृहस्थ जीवन के स्थायित्व का
            मुख्य संकेतक है।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-zinc-400">उपपद राशि (UL Sign)</span>
              <div className="text-lg font-bold text-amber-400">
                {upapada.signNameHi} ({upapada.signNameEn})
              </div>
              <div className="text-xs text-zinc-400">लग्न से भाव: <b className="text-white">{upapada.houseFromLagna}</b></div>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-zinc-400">उपपद स्वामी (UL Lord)</span>
              <div className="text-lg font-bold text-white">{upapada.lord}</div>
              <div className="text-xs text-zinc-400">
                स्वामी की स्थिति: लग्न से भाव <b className="text-white">{upapada.lordHouseFromLagna}</b>
              </div>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-zinc-400">उपपद से द्वितीय भाव (2nd from UL)</span>
              <div className="text-lg font-bold text-amber-400">
                {ZODIAC_SIGNS[upapada.secondFromUpapadaSignIndex]?.hi}
              </div>
              <div className="text-xs text-zinc-400">
                ग्रह: <b className="text-zinc-200">{upapada.planetsInSecondFromUpapada.join(", ") || "कोई ग्रह नहीं (Empty)"}</b>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-semibold text-amber-400">उपपद में स्थित ग्रह:</span>
              <div className="text-sm text-white font-medium">
                {upapada.planetsInUpapada.length > 0
                  ? upapada.planetsInUpapada.join(", ")
                  : "कोई ग्रह नहीं (Empty)"}
              </div>
            </div>

            <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-semibold text-amber-400">
                उपपद पर जैमिनी दृष्टि रखने वाले ग्रह:
              </span>
              <div className="text-sm text-white font-medium">
                {upapada.planetsAspectingUpapada.length > 0
                  ? upapada.planetsAspectingUpapada.join(", ")
                  : "कोई दृष्टि नहीं (None)"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. KARAKAMSHA */}
      {subTab === "karakamsha" && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            कारकांश एवं स्वांश (Karakamsha & Swamsha)
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300">
            आत्मकारक (AK) नवमांश (D9) कुण्डली में जिस राशि में स्थित होता है, वह राशि कारकांश कहलाती
            है। यह जातक के आत्मिक उद्देश्य, उच्च कला एवं मोक्ष मार्ग को दर्शाती है।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-zinc-400">आत्मकारक ग्रह (AK)</span>
              <div className="text-lg font-bold text-white">{karakamsha.atmakarakaPlanet}</div>
              <div className="text-xs text-zinc-400">
                D1 राशि: <b className="text-amber-400">{ZODIAC_SIGNS[karakamsha.atmakarakaD1SignIndex]?.hi}</b>
              </div>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-zinc-400">कारकांश राशि (D9 Navamsha)</span>
              <div className="text-lg font-bold text-amber-400">
                {ZODIAC_SIGNS[karakamsha.karakamshaSignIndex]?.hi} (
                {ZODIAC_SIGNS[karakamsha.karakamshaSignIndex]?.en})
              </div>
              <div className="text-xs text-zinc-400">
                D1 लग्न से भाव: <b className="text-white">{karakamsha.karakamshaHouseInD1}</b>
              </div>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-zinc-400">स्वांश राशि (D9 Lagna)</span>
              <div className="text-lg font-bold text-amber-400">
                {ZODIAC_SIGNS[karakamsha.swamshaSignIndex]?.hi} (
                {ZODIAC_SIGNS[karakamsha.swamshaSignIndex]?.en})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RASHI DRISHTI */}
      {subTab === "drishti" && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            जैमिनी राशि दृष्टि चक्र (Jaimini Sign Aspects)
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300">
            जैमिनी पद्धति में राशियाँ राशियों को देखती हैं: चर राशियाँ समीपवर्ती को छोड़कर सभी स्थिर
            राशियों को, स्थिर राशियाँ समीपवर्ती को छोड़कर सभी चर राशियों को, तथा द्विस्वभाव राशियाँ
            अन्य सभी द्विस्वभाव राशियों को देखती हैं।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {rashiDrishti.map((d) => (
              <div
                key={d.signIndex}
                className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3.5 space-y-2 hover:border-zinc-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">
                    {ZODIAC_SIGNS[d.signIndex]?.hi} ({d.signNameEn})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-700 font-semibold">
                    {d.mobility}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  दृष्ट राशियाँ:
                  <div className="text-zinc-200 font-medium mt-0.5">
                    {d.aspectedSignNamesEn.join(", ")}
                  </div>
                </div>
                <div className="text-xs text-zinc-400">
                  स्थित ग्रह:{" "}
                  <span className="text-amber-400 font-semibold">
                    {d.aspectingPlanets.join(", ") || "कोई नहीं (None)"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CHARA DASHA */}
      {subTab === "dasha" && charaDasha && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              जैमिनी चर दशा कालक्रम (Chara Dasha Timeline)
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-amber-400 border border-zinc-600 font-bold">
              {charaDasha.tradition}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-700">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-800 text-zinc-300 border-b border-zinc-700 font-bold">
                  <th className="py-2.5 px-3">दशा राशि (Sign)</th>
                  <th className="py-2.5 px-3">अवधि (Years)</th>
                  <th className="py-2.5 px-3">दिशा (Direction)</th>
                  <th className="py-2.5 px-3">प्रारंभ (Start)</th>
                  <th className="py-2.5 px-3">समाप्ति (End)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700 text-white">
                {charaDasha.periods.map((p) => (
                  <tr key={p.signIndex} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {p.signNameHi} ({p.signNameEn})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-300 font-semibold">{p.durationYears} वर्ष</td>
                    <td className="py-2.5 px-3 text-zinc-300 capitalize">
                      {p.direction === "direct" ? "प्रत्यक्ष (Direct)" : "अप्रत्यक्ष (Indirect)"}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 font-mono">
                      {new Date(p.startDateMs).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-300 font-mono">
                      {new Date(p.endDateMs).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
