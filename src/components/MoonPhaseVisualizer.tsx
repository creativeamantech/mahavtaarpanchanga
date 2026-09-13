import React from 'react';
import type { PanchangaResponse } from '../types';
import type { Language } from '../i18n';
import { translations } from '../i18n';
import { Moon, Sun, Compass } from 'lucide-react';

interface MoonPhaseVisualizerProps {
  data: PanchangaResponse;
  lang: Language;
}

export const MoonPhaseVisualizer: React.FC<MoonPhaseVisualizerProps> = ({ data, lang }) => {
  const t = translations[lang];

  // Primary tithi number (1 to 30)
  const primaryTithiNum = data.tithi[0]?.number || 1;
  const isSukla = data.paksha === 'Śukla' || primaryTithiNum <= 15;

  // Approximate solar-lunar elongation (each tithi is 12 degrees of elongation)
  const elongationDeg = ((primaryTithiNum - 0.5) * 12) % 360;
  const elongationRad = (elongationDeg * Math.PI) / 180;
  const illuminationPercent = Math.round(((1 - Math.cos(elongationRad)) / 2) * 100);

  // Phase name
  const getPhaseName = () => {
    if (primaryTithiNum === 30 || primaryTithiNum === 0) {
      return { en: 'New Moon (Amāvāsyā)', hi: 'अमावस्या (दर्श)', sa: 'दर्शः / अमावास्या' };
    }
    if (primaryTithiNum === 15) {
      return { en: 'Full Moon (Pūrṇimā)', hi: 'पूर्णिमा (राका)', sa: 'पूर्णिमा' };
    }
    if (primaryTithiNum === 8) {
      return { en: 'First Quarter (Śukla Aṣṭamī)', hi: 'शुक्ल अष्टमी (अर्धचन्द्र)', sa: 'शुक्लार्धचन्द्रः' };
    }
    if (primaryTithiNum === 23) {
      return { en: 'Last Quarter (Kṛṣṇa Aṣṭamī)', hi: 'कृष्ण अष्टमी (अर्धचन्द्र)', sa: 'कृष्णार्धचन्द्रः' };
    }
    if (primaryTithiNum < 8) {
      return { en: 'Waxing Crescent', hi: 'शुक्ल बालचन्द्र', sa: 'शुक्ल-बालचन्द्रः' };
    }
    if (primaryTithiNum < 15) {
      return { en: 'Waxing Gibbous', hi: 'शुक्ल कुब्जचन्द्र', sa: 'शुक्ल-कुब्जचन्द्रः' };
    }
    if (primaryTithiNum < 23) {
      return { en: 'Waning Gibbous', hi: 'कृष्ण कुब्जचन्द्र', sa: 'कृष्ण-कुब्जचन्द्रः' };
    }
    return { en: 'Waning Crescent', hi: 'कृष्ण बालचन्द्र', sa: 'कृष्ण-बालचन्द्रः' };
  };

  const phaseName = getPhaseName();

  // SVG Moon graphic calculation
  // Radius R = 32. If full moon (15), complete circle. If new moon (30), dark circle.
  // Semi-major axis varies with cos(elongationRad).
  const R = 32;
  const cx = 40;
  const cy = 40;
  const cosElong = Math.cos(elongationRad);

  return (
    <div
      id="moon-phase-visualizer"
      className="glass-card !bg-indigo-950/90 !border-indigo-800/60 rounded-[1.5rem] text-indigo-50 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen"></div>
      
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-3 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-300">
            <Moon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-300 font-serif-vedic">
              {lang === 'sa'
                ? 'चन्द्रकला एवं दृश्यमानम्'
                : lang === 'hi'
                ? 'चन्द्र कला एवं प्रदीप्ति'
                : 'Lunar Phase & Illumination'}
            </h4>
            <span className="text-[11px] text-stone-400 font-sans">
              {isSukla
                ? lang === 'sa'
                  ? 'शुक्लपक्षः (आप्यायमानः)'
                  : lang === 'hi'
                  ? 'शुक्ल पक्ष (बढ़ती कलाएं)'
                  : 'Śukla Pakṣa (Waxing)'
                : lang === 'sa'
                  ? 'कृष्णपक्षः (क्षीयमाणः)'
                  : lang === 'hi'
                  ? 'कृष्ण पक्ष (घटती कलाएं)'
                  : 'Kṛṣṇa Pakṣa (Waning)'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black font-mono text-amber-200">
            {illuminationPercent}%
          </span>
          <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-sans">
            Illuminated
          </span>
        </div>
      </div>

      {/* Center Moon Display & Gauge */}
      <div className="my-4 flex items-center justify-around gap-4">
        {/* Visual Moon Disc */}
        <div className="relative flex flex-col items-center">
          <div className="relative h-20 w-20 rounded-full shadow-[0_0_25px_rgba(251,191,36,0.25)] flex items-center justify-center overflow-hidden bg-stone-950 border border-stone-700">
            <svg viewBox="0 0 80 80" className="h-full w-full">
              {/* Moon background (dark side) */}
              <circle cx={cx} cy={cy} r={R} fill="#1c1917" />

              {/* Lit portion based on elongation */}
              {primaryTithiNum === 15 ? (
                // Full Moon
                <circle cx={cx} cy={cy} r={R} fill="#fef3c7" />
              ) : primaryTithiNum === 30 ? (
                // New Moon
                <circle cx={cx} cy={cy} r={R} fill="#0c0a09" stroke="#44403c" strokeWidth="1" />
              ) : (
                <g>
                  {/* Base semi-circle on lit side */}
                  {isSukla ? (
                    <path
                      d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} Z`}
                      fill="#fef3c7"
                    />
                  ) : (
                    <path
                      d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} Z`}
                      fill="#fef3c7"
                    />
                  )}
                  {/* Elliptical overlay for phase terminator */}
                  <path
                    d={`M ${cx} ${cy - R} A ${Math.abs(R * cosElong)} ${R} 0 0 ${
                      cosElong > 0 ? (isSukla ? 1 : 0) : isSukla ? 0 : 1
                    } ${cx} ${cy + R} Z`}
                    fill={cosElong > 0 ? (isSukla ? '#1c1917' : '#fef3c7') : isSukla ? '#fef3c7' : '#1c1917'}
                  />
                </g>
              )}
            </svg>
          </div>
          <span className="mt-2 text-xs font-bold text-amber-200 font-devanagari text-center">
            {phaseName[lang]}
          </span>
        </div>

        {/* Angular details */}
        <div className="space-y-2 text-xs">
          <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 text-[11px] mb-0.5">
              <span className="flex items-center gap-1">
                <Compass className="h-3 w-3 text-amber-400" />
                <span>Sun-Moon Angle (अन्तरम्)</span>
              </span>
            </div>
            <span className="font-mono font-bold text-stone-100 text-sm">
              {elongationDeg.toFixed(1)}°
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              12° per Tithi progression
            </span>
          </div>

          <div className="rounded-lg bg-stone-800/80 p-2.5 border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 text-[11px] mb-0.5">
              <span className="flex items-center gap-1">
                <Sun className="h-3 w-3 text-amber-400" />
                <span>Rāśi Position</span>
              </span>
            </div>
            <span className="font-serif-vedic font-bold text-stone-100 text-xs">
              {data.moon_rasi} (Candra)
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Sun in {data.sun_rasi}
            </span>
          </div>
        </div>
      </div>

      {/* Fortnight Progression Tracker */}
      <div className="border-t border-stone-800 pt-3">
        <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1 font-sans">
          <span>{isSukla ? 'Pratipat (१)' : 'Pratipat (१६)'}</span>
          <span className="font-semibold text-amber-300">
            {isSukla ? `Day ${primaryTithiNum} of 15 (Śukla)` : `Day ${primaryTithiNum - 15} of 15 (Kṛṣṇa)`}
          </span>
          <span>{isSukla ? 'Pūrṇimā (१५)' : 'Amāvāsyā (३०)'}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-stone-800 overflow-hidden border border-stone-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all"
            style={{
              width: `${Math.min(100, Math.max(5, ((isSukla ? primaryTithiNum : primaryTithiNum - 15) / 15) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
