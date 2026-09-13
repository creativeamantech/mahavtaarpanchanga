import React, { useState } from 'react';
import type { PlanetPosition, AppTheme } from '../types';
import type { Language } from '../i18n';
import { getLocalizedRasi } from '../i18n';
import { Compass, Sparkles } from 'lucide-react';

interface KundaliChartProps {
  planets: PlanetPosition[];
  lang: Language;
  coordinateMode?: string;
  theme?: AppTheme;
}

// 12 Zodiac signs in order
const RASI_ORDER = [
  'meṣa',
  'vṛṣabha',
  'mithuna',
  'karka',
  'siṁha',
  'kanyā',
  'tulā',
  'vṛścika',
  'dhanu',
  'makara',
  'kumbha',
  'mīna',
];

const RASI_ENGLISH: Record<string, string> = {
  meṣa: 'Aries',
  vṛṣabha: 'Taurus',
  mithuna: 'Gemini',
  karka: 'Cancer',
  siṁha: 'Leo',
  kanyā: 'Virgo',
  tulā: 'Libra',
  vṛścika: 'Scorpio',
  dhanu: 'Sagittarius',
  makara: 'Capricorn',
  kumbha: 'Aquarius',
  mīna: 'Pisces',
};

const GRAHA_ABBR: Record<string, { en: string; hi: string; sa: string; isBenefic: boolean }> = {
  sun: { en: 'Su', hi: 'सू', sa: 'सूर्', isBenefic: false },
  moon: { en: 'Mo', hi: 'चं', sa: 'चन्द्र', isBenefic: true },
  mars: { en: 'Ma', hi: 'मं', sa: 'मंग', isBenefic: false },
  mercury: { en: 'Me', hi: 'बु', sa: 'बुध', isBenefic: true },
  jupiter: { en: 'Ju', hi: 'गु', sa: 'गुरु', isBenefic: true },
  venus: { en: 'Ve', hi: 'शु', sa: 'शुक्र', isBenefic: true },
  saturn: { en: 'Sa', hi: 'श', sa: 'शनि', isBenefic: false },
  rahu: { en: 'Ra', hi: 'रा', sa: 'राहु', isBenefic: false },
  ketu: { en: 'Ke', hi: 'के', sa: 'केतु', isBenefic: false },
};

export const KundaliChart: React.FC<KundaliChartProps> = ({ planets, lang, theme }) => {
  const [chartType, setChartType] = useState<'south' | 'north'>('south');
  const [selectedRasi, setSelectedRasi] = useState<string | null>('meṣa');
  const isNight = theme === 'nightSky';

  // Group planets by their Rasi (lowercase normalized)
  const rasiPlanetsMap: Record<string, PlanetPosition[]> = {};
  RASI_ORDER.forEach((r) => {
    rasiPlanetsMap[r] = [];
  });

  planets.forEach((p) => {
    const cleanRasi = (p.rasi || '').toLowerCase().trim();
    const matchedRasi = RASI_ORDER.find(
      (r) => cleanRasi.includes(r) || r.includes(cleanRasi) || (p.rasiNumber && RASI_ORDER[p.rasiNumber - 1] === r)
    );
    if (matchedRasi && rasiPlanetsMap[matchedRasi]) {
      rasiPlanetsMap[matchedRasi].push(p);
    } else if (p.rasiNumber && p.rasiNumber >= 1 && p.rasiNumber <= 12) {
      const fallbackRasi = RASI_ORDER[p.rasiNumber - 1];
      rasiPlanetsMap[fallbackRasi].push(p);
    }
  });

  // South Indian chart layout mapping (4x4 grid):
  // [ Pisces(11),   Aries(0),      Taurus(1),     Gemini(2)    ]
  // [ Aquarius(10), (center),      (center),      Cancer(3)    ]
  // [ Capricorn(9), (center),      (center),      Leo(4)       ]
  // [ Sagittarius(8), Scorpio(7),  Libra(6),      Virgo(5)     ]
  const southIndianGrid: { row: number; col: number; rasi: string; rasiNum: number }[] = [
    { row: 1, col: 1, rasi: 'mīna', rasiNum: 12 },
    { row: 1, col: 2, rasi: 'meṣa', rasiNum: 1 },
    { row: 1, col: 3, rasi: 'vṛṣabha', rasiNum: 2 },
    { row: 1, col: 4, rasi: 'mithuna', rasiNum: 3 },
    { row: 2, col: 4, rasi: 'karka', rasiNum: 4 },
    { row: 3, col: 4, rasi: 'siṁha', rasiNum: 5 },
    { row: 4, col: 4, rasi: 'kanyā', rasiNum: 6 },
    { row: 4, col: 3, rasi: 'tulā', rasiNum: 7 },
    { row: 4, col: 2, rasi: 'vṛścika', rasiNum: 8 },
    { row: 4, col: 1, rasi: 'dhanu', rasiNum: 9 },
    { row: 3, col: 1, rasi: 'makara', rasiNum: 10 },
    { row: 2, col: 1, rasi: 'kumbha', rasiNum: 11 },
  ];

  const selectedPlanets = selectedRasi ? rasiPlanetsMap[selectedRasi] || [] : [];

  return (
    <div
      id="kundali-chart-card"
      className={`rounded-[1.5rem] p-6 sm:p-8 transition-colors ${
        isNight
          ? 'bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl'
          : 'glass-card'
      }`}
    >
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${
        isNight ? 'border-indigo-800/40' : 'border-stone-100'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            isNight ? 'bg-indigo-950/80 text-amber-300 border-amber-900/40' : 'bg-amber-100 text-amber-900 border-amber-300/60'
          }`}>
            <Compass className={`h-4 w-4 ${isNight ? 'text-amber-400' : 'text-amber-700'}`} />
          </div>
          <div>
            <h3 className={`text-base font-bold font-serif-vedic ${
              isNight ? 'text-amber-200' : 'text-stone-900'
            }`}>
              {lang === 'sa'
                ? 'राशौ ग्रहस्थितिः (कुण्डली / चक्रम्)'
                : lang === 'hi'
                ? 'राशि चक्र एवं ग्रह स्थिति (कुण्डली)'
                : 'Rāśi Chakra & Graha Kundali Chart'}
            </h3>
            <p className={`text-xs font-sans ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
              {lang === 'sa'
                ? 'द्वादशराशिषु नवग्रहाणाम् अवस्थितिः'
                : lang === 'hi'
                ? 'द्वादश राशियों में नवग्रहों की वास्तविक स्थिति'
                : 'Visual zodiac chart depicting current planetary house placements'}
            </p>
          </div>
        </div>

        {/* Chart Style Switcher */}
        <div className={`inline-flex rounded-xl p-1 border text-xs font-semibold ${
          isNight ? 'bg-[#12182b] border-indigo-900/60' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            type="button"
            id="chart-type-south"
            onClick={() => setChartType('south')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'south'
                ? isNight ? 'bg-indigo-900/60 text-amber-300 font-bold shadow-2xs' : 'bg-white text-amber-950 font-bold shadow-2xs'
                : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sa' ? 'दाक्षिणात्यचक्रम्' : lang === 'hi' ? 'दक्षिण भारतीय शैली' : 'South Indian Grid'}
          </button>
          <button
            type="button"
            id="chart-type-north"
            onClick={() => setChartType('north')}
            className={`px-3 py-1 rounded-lg transition-all ${
              chartType === 'north'
                ? isNight ? 'bg-indigo-900/60 text-amber-300 font-bold shadow-2xs' : 'bg-white text-amber-950 font-bold shadow-2xs'
                : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sa' ? 'उत्तरभारतीयचक्रम्' : lang === 'hi' ? 'उत्तर भारतीय शैली' : 'North Indian Diamond'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* The Chart Display */}
        <div className="lg:col-span-8 flex justify-center">
          {chartType === 'south' ? (
            /* South Indian Fixed Box Format (12 outer boxes, hollow center) */
            <div className={`relative w-full max-w-[420px] aspect-square rounded-2xl border-2 shadow-md p-1 grid grid-cols-4 grid-rows-4 gap-1 select-none ${
              isNight ? 'border-indigo-900/60 bg-[#12182b]' : 'border-stone-800 bg-stone-900'
            }`}>
              {/* Center Logo / Inscription */}
              <div className={`col-start-2 col-end-4 row-start-2 row-end-4 rounded-xl border flex flex-col items-center justify-center p-3 text-center ${
                isNight ? 'bg-indigo-950/40 border-indigo-900/40' : 'bg-stone-950 border-stone-800'
              }`}>
                <span className={`font-serif-vedic text-2xl font-bold ${isNight ? 'text-amber-500' : 'text-amber-400'}`}>ॐ</span>
                <span className={`text-xs font-bold font-serif-vedic mt-1 ${isNight ? 'text-amber-100' : 'text-stone-200'}`}>
                  {lang === 'sa' ? 'राशि चक्रम्' : lang === 'hi' ? 'राशि चक्र' : 'Rāśi Cakra'}
                </span>
                <span className={`text-[10px] font-mono mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>
                  {planets.length} Celestial Bodies
                </span>
                <span className={`text-[9px] mt-1 uppercase tracking-wider ${isNight ? 'text-amber-500' : 'text-amber-300/80'}`}>
                  Observational Drik
                </span>
              </div>

              {/* 12 Outer Houses */}
              {southIndianGrid.map((box) => {
                const isSelected = selectedRasi === box.rasi;
                const residingPlanets = rasiPlanetsMap[box.rasi] || [];
                const locRasi = getLocalizedRasi(box.rasi, lang);

                return (
                  <button
                    key={box.rasi}
                    type="button"
                    onClick={() => setSelectedRasi(box.rasi)}
                    style={{ gridRow: box.row, gridColumn: box.col }}
                    className={`relative rounded-xl p-1.5 flex flex-col justify-between text-left transition-all border ${
                      isSelected
                        ? isNight ? 'bg-amber-900/40 border-amber-500 ring-2 ring-amber-500/50' : 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/50'
                        : isNight ? 'bg-[#1a233a] border-indigo-900/40 hover:border-indigo-600 hover:bg-[#1f2945]' : 'bg-stone-800/90 border-stone-700 hover:border-stone-500 hover:bg-stone-800'
                    }`}
                  >
                    {/* Header: Sign name & number */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-serif-vedic font-bold truncate ${isNight ? 'text-amber-400' : 'text-amber-300'}`}>
                        {locRasi}
                      </span>
                      <span className={`text-[9px] font-mono ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>
                        {box.rasiNum}
                      </span>
                    </div>

                    {/* Planet chips */}
                    <div className="my-auto flex flex-wrap gap-1 py-1">
                      {residingPlanets.map((p) => {
                        const abbr = GRAHA_ABBR[p.id] || { en: p.name.slice(0, 2), hi: p.name.slice(0, 2), sa: p.name.slice(0, 2), isBenefic: true };
                        return (
                          <span
                            key={p.id}
                            title={`${p.name} at ${p.degreesInRasi} in ${p.nakshatra}`}
                            className={`inline-flex items-center px-1 rounded text-[10px] font-bold font-mono border ${
                              abbr.isBenefic
                                ? isNight ? 'bg-emerald-950/80 text-emerald-300 border-emerald-900' : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                                : isNight ? 'bg-rose-950/80 text-rose-300 border-rose-900' : 'bg-rose-950 text-rose-300 border-rose-700/60'
                            }`}
                          >
                            {abbr[lang]}
                            {p.isRetrograde && <span className={`ml-0.5 text-[8px] ${isNight ? 'text-amber-400' : 'text-amber-300'}`}>(R)</span>}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* North Indian Diamond Chart (SVG representation) */
            <div className={`relative w-full max-w-[420px] aspect-square rounded-2xl border shadow-md p-2 flex items-center justify-center ${
              isNight ? 'border-indigo-900/60 bg-[#12182b]' : 'border-stone-800 bg-stone-950'
            }`}>
              <svg viewBox="0 0 400 400" className="w-full h-full font-sans">
                {/* Outer frame */}
                <rect x="10" y="10" width="380" height="380" fill={isNight ? '#0e1424' : '#1c1917'} stroke={isNight ? '#312e81' : '#57534e'} strokeWidth="2" rx="12" />
                {/* Diagonal lines */}
                <line x1="10" y1="10" x2="390" y2="390" stroke={isNight ? '#4338ca' : '#78716c'} strokeWidth="1.5" />
                <line x1="390" y1="10" x2="10" y2="390" stroke={isNight ? '#4338ca' : '#78716c'} strokeWidth="1.5" />
                {/* Diamond lines connecting midpoints */}
                <polygon points="200,10 390,200 200,390 10,200" fill={isNight ? '#1e1b4b' : '#292524'} stroke={isNight ? '#4f46e5' : '#a8a29e'} strokeWidth="2" />

                {/* House 1 (Top Diamond) */}
                <text x="200" y="80" textAnchor="middle" fill={isNight ? '#fcd34d' : '#fde68a'} fontSize="13" fontWeight="bold" fontFamily="serif">
                  {getLocalizedRasi(RASI_ORDER[0], lang)} (1)
                </text>
                <text x="200" y="105" textAnchor="middle" fill={isNight ? '#6ee7b7' : '#34d399'} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {rasiPlanetsMap[RASI_ORDER[0]]?.map(p => (GRAHA_ABBR[p.id] ? GRAHA_ABBR[p.id][lang] : p.name.slice(0, 2)) + (p.isRetrograde ? '(R)' : '')).join(' ') || '—'}
                </text>

                {/* House 2 (Top-Left Triangle) */}
                <text x="110" y="60" textAnchor="middle" fill={isNight ? '#94a3b8' : '#d6d3d1'} fontSize="11" fontFamily="serif">
                  {RASI_ENGLISH[RASI_ORDER[1]]?.slice(0, 3)} (2)
                </text>
                <text x="110" y="80" textAnchor="middle" fill={isNight ? '#fca5a5' : '#f87171'} fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {rasiPlanetsMap[RASI_ORDER[1]]?.map(p => (GRAHA_ABBR[p.id] ? GRAHA_ABBR[p.id][lang] : p.name.slice(0, 2))).join(' ') || ''}
                </text>

                {/* House 4 (Left Diamond) */}
                <text x="90" y="200" textAnchor="middle" fill={isNight ? '#fcd34d' : '#fde68a'} fontSize="12" fontWeight="bold" fontFamily="serif">
                  {getLocalizedRasi(RASI_ORDER[3], lang)} (4)
                </text>
                <text x="90" y="220" textAnchor="middle" fill={isNight ? '#6ee7b7' : '#34d399'} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {rasiPlanetsMap[RASI_ORDER[3]]?.map(p => (GRAHA_ABBR[p.id] ? GRAHA_ABBR[p.id][lang] : p.name.slice(0, 2))).join(' ') || '—'}
                </text>

                {/* House 7 (Bottom Diamond) */}
                <text x="200" y="320" textAnchor="middle" fill={isNight ? '#fcd34d' : '#fde68a'} fontSize="12" fontWeight="bold" fontFamily="serif">
                  {getLocalizedRasi(RASI_ORDER[6], lang)} (7)
                </text>
                <text x="200" y="340" textAnchor="middle" fill={isNight ? '#6ee7b7' : '#34d399'} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {rasiPlanetsMap[RASI_ORDER[6]]?.map(p => (GRAHA_ABBR[p.id] ? GRAHA_ABBR[p.id][lang] : p.name.slice(0, 2))).join(' ') || '—'}
                </text>

                {/* House 10 (Right Diamond) */}
                <text x="310" y="200" textAnchor="middle" fill={isNight ? '#fcd34d' : '#fde68a'} fontSize="12" fontWeight="bold" fontFamily="serif">
                  {getLocalizedRasi(RASI_ORDER[9], lang)} (10)
                </text>
                <text x="310" y="220" textAnchor="middle" fill={isNight ? '#6ee7b7' : '#34d399'} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {rasiPlanetsMap[RASI_ORDER[9]]?.map(p => (GRAHA_ABBR[p.id] ? GRAHA_ABBR[p.id][lang] : p.name.slice(0, 2))).join(' ') || '—'}
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Selected Rasi Inspection Panel */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-3">
          <div className={`rounded-2xl border p-4 shadow-2xs ${
            isNight ? 'bg-[#12182b] border-indigo-900/40' : 'border-stone-200 bg-stone-50'
          }`}>
            <div className={`flex items-center justify-between border-b pb-2.5 ${
              isNight ? 'border-indigo-900/40' : 'border-stone-200/80'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider font-sans block ${
                  isNight ? 'text-amber-500' : 'text-amber-800'
                }`}>
                  {lang === 'sa' ? 'निर्वाचित-राशिः' : lang === 'hi' ? 'चयनित राशि' : 'Selected Sign'}
                </span>
                <h4 className={`text-lg font-black font-serif-vedic ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
                  {selectedRasi ? getLocalizedRasi(selectedRasi, lang) : 'Select a Sign'}
                </h4>
              </div>
              <span className={`rounded-lg px-2 py-1 text-xs font-bold font-mono ${
                isNight ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-900'
              }`}>
                {selectedRasi ? `${RASI_ORDER.indexOf(selectedRasi) + 1} / 12` : ''}
              </span>
            </div>

            <div className="mt-3">
              <span className={`text-xs font-semibold block mb-1.5 font-sans ${
                isNight ? 'text-slate-400' : 'text-stone-600'
              }`}>
                {lang === 'sa'
                  ? 'अस्यां राशौ स्थिताः ग्रहाः :'
                  : lang === 'hi'
                  ? 'इस राशि में स्थित ग्रह :'
                  : 'Grahas residing in this sign:'}
              </span>

              {selectedPlanets.length === 0 ? (
                <div className={`rounded-xl p-4 text-center text-xs border border-dashed ${
                  isNight ? 'bg-[#0e1424] text-slate-500 border-indigo-900/40' : 'bg-white text-stone-400 border-stone-300'
                }`}>
                  {lang === 'sa' ? 'कोऽपि ग्रहो नास्ति (रिक्तम्)' : lang === 'hi' ? 'कोई ग्रह नहीं (खाली)' : 'No planets in this sign currently'}
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPlanets.map((p) => {
                    const abbr = GRAHA_ABBR[p.id] || { isBenefic: true };
                    return (
                      <div
                        key={p.id}
                        className={`rounded-xl border p-2.5 flex items-center justify-between shadow-2xs ${
                          isNight ? 'border-indigo-900/40 bg-[#0e1424]' : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className={`font-bold font-serif-vedic text-sm ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                              {p.sanskritName || p.name}
                            </span>
                            {p.isRetrograde && (
                              <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${
                                isNight ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {lang === 'sa' ? 'वक्री' : lang === 'hi' ? 'वक्री' : 'Retrograde'}
                              </span>
                            )}
                            <span
                              className={`h-2 w-2 rounded-full ${
                                abbr.isBenefic ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                          </div>
                          <span className={`text-[11px] block font-sans ${isNight ? 'text-slate-500' : 'text-stone-500'}`}>
                            {p.nakshatra} (Pada {p.pada})
                          </span>
                        </div>
                        <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg border ${
                          isNight ? 'text-amber-300 bg-amber-950/40 border-amber-900/50' : 'text-amber-900 bg-amber-50 border-amber-200/60'
                        }`}>
                          {p.degreesInRasi}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className={`flex items-center justify-between text-[11px] px-1 font-sans ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{lang === 'sa' ? 'शुभग्रहाः' : lang === 'hi' ? 'सौम्य ग्रह' : 'Benefic (Guru, Śukra, etc.)'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{lang === 'sa' ? 'क्रूरग्रहाः' : lang === 'hi' ? 'क्रूर ग्रह' : 'Malefic (Śani, Maṅgala, etc.)'}</span>
            </span>
            <span className={`flex items-center gap-1 font-bold ${isNight ? 'text-amber-500' : 'text-amber-800'}`}>
              <Sparkles className="h-3 w-3" />
              <span>(R) Vakrī</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
