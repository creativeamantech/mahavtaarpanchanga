import React from 'react';
import { Sun, Moon, Clock, Compass, Sparkles, Wind } from 'lucide-react';
import type { PanchangaResponse, AppTheme } from '../types';
import { computeSwaraYoga } from '../swaraYoga';
import {
  type Language,
  translations,
  getLocalizedMasa,
  getLocalizedRasi,
  getLocalizedVaara,
} from '../i18n';

interface PanchangaSummaryCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const PanchangaSummaryCard: React.FC<PanchangaSummaryCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === 'nightSky';
  const t = translations[lang];

  const localizedMasa = getLocalizedMasa(data.masa, lang);
  const localizedVaara = getLocalizedVaara(data.vaara, lang);
  const localizedSunRasi = getLocalizedRasi(data.sun_rasi || '', lang);
  const localizedMoonRasi = getLocalizedRasi(data.moon_rasi || '', lang);

  const localizedPaksha =
    (data.paksha || '').toLowerCase().includes('k') || (data.paksha || '').toLowerCase().includes('krishna')
      ? t.krishna
      : t.sukla;

  const primaryTithiNum = data.tithi?.[0]?.number || 1;
  const swara = computeSwaraYoga(primaryTithiNum, data.sunrise, data.sunset, undefined, data.moonrise, data.moonset);

  return (
    <div id="panchanga-summary-card" className="space-y-6">
      {/* Vedic Calendar Hierarchy Banner */}
      <div
        id="vedic-calendar-banner"
        className={`glass-card rounded-[2rem] p-6 sm:p-8 relative overflow-hidden transition-colors ${
          isNight ? 'border-indigo-800/50 bg-[#0e1424]/90 text-slate-100' : ''
        }`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Moon className="w-64 h-64" />
        </div>
        
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-6 relative z-10 ${
          isNight ? 'border-indigo-800/40' : 'border-stone-200/60'
        }`}>
          <div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
              isNight ? 'text-indigo-300/80' : 'text-indigo-900/60'
            }`}>
              {t.vedicAlmanac}
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-serif-vedic flex items-baseline gap-2 ${
              isNight ? 'text-amber-200' : 'text-stone-800'
            }`}>
              <span>{data.samvatsara}</span>
              <span className={`text-xs font-semibold font-sans tracking-wide ${
                isNight ? 'text-slate-400' : 'text-stone-500'
              }`}>
                {t.samvatsara}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              id="masa-badge"
              className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold font-devanagari shadow-2xs border ${
                isNight
                  ? 'bg-amber-950/60 text-amber-200 border-amber-700/50'
                  : 'bg-amber-100 text-amber-950 border-amber-300/80'
              }`}
            >
              {localizedMasa} {t.masa}
            </span>
            <span
              id="paksha-badge"
              className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold font-devanagari shadow-2xs border ${
                isNight
                  ? 'bg-orange-950/60 text-orange-200 border-orange-700/50'
                  : 'bg-orange-100 text-orange-950 border-orange-300/80'
              }`}
            >
              {localizedPaksha} {t.paksha}
            </span>
            <span
              id="vaara-badge"
              className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold font-devanagari shadow-2xs border ${
                isNight
                  ? 'bg-indigo-950/60 text-indigo-200 border-indigo-700/50'
                  : 'bg-stone-100 text-stone-900 border-stone-300/80'
              }`}
            >
              {localizedVaara}
            </span>
          </div>
        </div>

        {/* Sub-attributes grid: Ayana, Ritu, Sun Rasi, Moon Rasi */}
        <div className="grid grid-cols-2 gap-3.5 pt-4 sm:grid-cols-4">
          <div id="attr-ayana" className={`p-3 rounded-xl border ${
            isNight ? 'bg-indigo-950/40 border-indigo-800/40' : 'bg-white/70 border-stone-200/60'
          }`}>
            <span className={`text-xs block font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.ayana}</span>
            <span className={`text-sm font-bold font-devanagari mt-0.5 block ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
              {data.ayana}
            </span>
            <span className={`text-[11px] block mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>
              {t.drikAyana}: {data.drik_ayana}
            </span>
          </div>

          <div id="attr-rtu" className={`p-3 rounded-xl border ${
            isNight ? 'bg-indigo-950/40 border-indigo-800/40' : 'bg-white/70 border-stone-200/60'
          }`}>
            <span className={`text-xs block font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.rtu}</span>
            <span className={`text-sm font-bold font-devanagari mt-0.5 block ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
              {data.rtu}
            </span>
            <span className={`text-[11px] block mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>
              {t.drikRtu}: {data.drik_rtu}
            </span>
          </div>

          <div id="attr-sun-rasi" className={`p-3 rounded-xl border ${
            isNight ? 'bg-indigo-950/40 border-indigo-800/40' : 'bg-white/70 border-stone-200/60'
          }`}>
            <span className={`text-xs block font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.sunSign}</span>
            <span className={`text-sm font-bold font-devanagari mt-0.5 block ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
              {localizedSunRasi}
            </span>
            {lang !== 'en' && data.sun_rasi && (
              <span className={`text-[11px] block capitalize ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>{data.sun_rasi}</span>
            )}
          </div>

          <div id="attr-moon-rasi" className={`p-3 rounded-xl border ${
            isNight ? 'bg-indigo-950/40 border-indigo-800/40' : 'bg-white/70 border-stone-200/60'
          }`}>
            <span className={`text-xs block font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.moonSign}</span>
            <span className={`text-sm font-bold font-devanagari mt-0.5 block ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
              {localizedMoonRasi}
            </span>
            {lang !== 'en' && data.moon_rasi && (
              <span className={`text-[11px] block capitalize ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>{data.moon_rasi}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sun, Moon, Key Muhurtas, and Eras Cards */}
      <div id="celestial-events-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sunrise & Sunset */}
        <div
          id="sun-timings-card"
          className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between backdrop-blur-sm transition-colors ${
            isNight
              ? 'border-amber-500/30 bg-[#0e1424]/90 text-slate-100'
              : 'border-amber-200/80 bg-white/60'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-2 ${
            isNight ? 'border-amber-500/20' : 'border-amber-100'
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isNight ? 'text-amber-300' : 'text-amber-900'
            }`}>
              {t.solarDay}
            </span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isNight ? 'bg-amber-950/80 text-amber-300 border border-amber-700/40' : 'bg-amber-100 text-amber-700'
            }`}>
              <Sun className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={`text-xs font-medium ${isNight ? 'text-slate-400' : 'text-stone-600'}`}>{t.sunrise}</span>
              <span id="sunrise-val" className={`text-base font-bold font-mono ${isNight ? 'text-amber-200' : 'text-stone-900'}`}>
                {data.sunrise}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-xs font-medium ${isNight ? 'text-slate-400' : 'text-stone-600'}`}>{t.sunset}</span>
              <span id="sunset-val" className={`text-base font-bold font-mono ${isNight ? 'text-amber-200' : 'text-stone-900'}`}>
                {data.sunset}
              </span>
            </div>
          </div>

          <div className={`mt-3 border-t pt-2 flex items-center justify-between text-xs ${
            isNight ? 'border-slate-800 text-slate-400' : 'border-stone-100 text-stone-600'
          }`}>
            <span className="font-medium">{t.dayLength}</span>
            <span className={`font-bold font-mono ${isNight ? 'text-amber-300' : 'text-amber-900'}`}>{data.day_duration}</span>
          </div>

          <div className={`mt-2.5 border-t pt-2 space-y-1.5 text-[11px] ${
            isNight ? 'border-slate-800/80' : 'border-amber-100/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>Sunrise Swara:</span>
              <div className="flex items-center space-x-1.5">
                {swara.sunriseWindow?.isActive && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Active Now"></span>
                )}
                <span className={`inline-flex items-center space-x-1 rounded px-1.5 py-0.5 font-bold ${
                  swara.sunriseSwara === 'ida'
                    ? isNight ? 'bg-sky-950 text-sky-200 border border-sky-800/50' : 'bg-sky-100 text-sky-900'
                    : isNight ? 'bg-orange-950 text-orange-200 border border-orange-800/50' : 'bg-orange-100 text-orange-950'
                }`}>
                  <span>{swara.sunriseSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}</span>
                </span>
                {swara.sunriseWindow && (
                  <span className={`text-[10px] font-mono hidden sm:inline ${isNight ? 'text-slate-400' : 'text-stone-500'}`} title="1 hr from sunrise">
                    ({swara.sunriseWindow.windowFormatted})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>Sunset Swara:</span>
              <div className="flex items-center space-x-1.5">
                {swara.sunsetWindow?.isActive && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Active Now"></span>
                )}
                <span className={`inline-flex items-center space-x-1 rounded px-1.5 py-0.5 font-bold ${
                  swara.sunsetSwara === 'ida'
                    ? isNight ? 'bg-sky-950 text-sky-200 border border-sky-800/50' : 'bg-sky-100 text-sky-900'
                    : isNight ? 'bg-orange-950 text-orange-200 border border-orange-800/50' : 'bg-orange-100 text-orange-950'
                }`}>
                  <span>{swara.sunsetSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}</span>
                </span>
                {swara.sunsetWindow && (
                  <span className={`text-[10px] font-mono hidden sm:inline ${isNight ? 'text-slate-400' : 'text-stone-500'}`} title="1 hr before sunset">
                    ({swara.sunsetWindow.windowFormatted})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Moonrise & Moonset */}
        <div
          id="moon-timings-card"
          className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between backdrop-blur-sm transition-colors ${
            isNight
              ? 'border-indigo-500/30 bg-[#0e1424]/90 text-slate-100'
              : 'border-indigo-200/80 bg-white/60'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-2 ${
            isNight ? 'border-indigo-500/20' : 'border-indigo-100'
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isNight ? 'text-indigo-300' : 'text-indigo-900'
            }`}>
              {t.lunarNight}
            </span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isNight ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/40' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Moon className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={`text-xs font-medium ${isNight ? 'text-slate-400' : 'text-stone-600'}`}>{t.moonrise}</span>
              <span id="moonrise-val" className={`text-base font-bold font-mono ${isNight ? 'text-indigo-200' : 'text-stone-900'}`}>
                {data.moonrise || '—'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-xs font-medium ${isNight ? 'text-slate-400' : 'text-stone-600'}`}>{t.moonset}</span>
              <span id="moonset-val" className={`text-base font-bold font-mono ${isNight ? 'text-indigo-200' : 'text-stone-900'}`}>
                {data.moonset || '—'}
              </span>
            </div>
          </div>

          <div className={`mt-3 border-t pt-2 flex items-center justify-between text-xs ${
            isNight ? 'border-slate-800 text-slate-400' : 'border-stone-100 text-stone-600'
          }`}>
            <span className="font-medium">{t.nightLength}</span>
            <span className={`font-bold font-mono ${isNight ? 'text-indigo-300' : 'text-indigo-900'}`}>{data.night_duration || '—'}</span>
          </div>

          <div className={`mt-2.5 border-t pt-2 space-y-1.5 text-[11px] ${
            isNight ? 'border-slate-800/80' : 'border-indigo-100/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>Moonrise Swara:</span>
              <div className="flex items-center space-x-1.5">
                {swara.moonriseWindow?.isActive && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Active Now"></span>
                )}
                <span className={`inline-flex items-center space-x-1 rounded px-1.5 py-0.5 font-bold ${
                  swara.moonriseSwara === 'ida'
                    ? isNight ? 'bg-sky-950 text-sky-200 border border-sky-800/50' : 'bg-sky-100 text-sky-900'
                    : isNight ? 'bg-orange-950 text-orange-200 border border-orange-800/50' : 'bg-orange-100 text-orange-950'
                }`}>
                  <span>{swara.moonriseSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}</span>
                </span>
                {swara.moonriseWindow && (
                  <span className={`text-[10px] font-mono hidden sm:inline ${isNight ? 'text-slate-400' : 'text-stone-500'}`} title="1 hr from moonrise">
                    ({swara.moonriseWindow.windowFormatted})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>Moonset Swara:</span>
              <div className="flex items-center space-x-1.5">
                {swara.moonsetWindow?.isActive && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Active Now"></span>
                )}
                <span className={`inline-flex items-center space-x-1 rounded px-1.5 py-0.5 font-bold ${
                  swara.moonsetSwara === 'ida'
                    ? isNight ? 'bg-sky-950 text-sky-200 border border-sky-800/50' : 'bg-sky-100 text-sky-900'
                    : isNight ? 'bg-orange-950 text-orange-200 border border-orange-800/50' : 'bg-orange-100 text-orange-950'
                }`}>
                  <span>{swara.moonsetSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}</span>
                </span>
                {swara.moonsetWindow && (
                  <span className={`text-[10px] font-mono hidden sm:inline ${isNight ? 'text-slate-400' : 'text-stone-500'}`} title="1 hr before moonset">
                    ({swara.moonsetWindow.windowFormatted})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Auspicious / Inauspicious Timings */}
        <div
          id="quick-muhurta-card"
          className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between backdrop-blur-sm transition-colors ${
            isNight
              ? 'border-indigo-500/20 bg-[#0e1424]/90 text-slate-100'
              : 'border-stone-200 bg-white/60'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-2 ${
            isNight ? 'border-slate-800' : 'border-stone-100'
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isNight ? 'text-indigo-300' : 'text-stone-700'
            }`}>
              {lang === 'sa' ? 'मुख्यकालाः' : lang === 'hi' ? 'प्रमुख मुहूर्त' : 'Key Muhūrtas'}
            </span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isNight ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
            }`}>
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <div className="flex items-baseline justify-between text-xs">
                <span className={`font-bold font-devanagari ${isNight ? 'text-rose-400' : 'text-rose-700'}`}>{t.rahuKala}</span>
                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${
                  isNight
                    ? 'text-rose-300 bg-rose-950/60 border-rose-800/60'
                    : 'text-rose-900 bg-rose-50 border-rose-200'
                }`}>
                  {data.rahu_kala ? `${data.rahu_kala.start} – ${data.rahu_kala.end}` : '—'}
                </span>
              </div>
            </div>

            {data.abhijit_muhurta && (
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className={`font-bold font-devanagari ${isNight ? 'text-emerald-400' : 'text-emerald-700'}`}>{t.abhijit}</span>
                  <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${
                    isNight
                      ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60'
                      : 'text-emerald-900 bg-emerald-50 border-emerald-200'
                  }`}>
                    {data.abhijit_muhurta.start} – {data.abhijit_muhurta.end}
                  </span>
                </div>
              </div>
            )}

            {data.brahma_muhurta && (
              <div className="flex items-baseline justify-between text-xs">
                <span className={`font-medium font-devanagari ${isNight ? 'text-slate-300' : 'text-stone-700'}`}>{t.brahmaMuhurta}</span>
                <span className={`font-mono ${isNight ? 'text-slate-200' : 'text-stone-800'}`}>
                  {data.brahma_muhurta.start} – {data.brahma_muhurta.end}
                </span>
              </div>
            )}
          </div>

          <div className={`mt-3 border-t pt-2 text-[11px] ${
            isNight ? 'border-slate-800 text-slate-400' : 'border-stone-100 text-stone-400'
          }`}>
            {data.city} • {data.coordinate_label}
          </div>
        </div>

        {/* Traditional Hindu Eras (Saṁvat) */}
        <div
          id="hindu-eras-card"
          className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between backdrop-blur-sm transition-colors ${
            isNight
              ? 'border-indigo-500/20 bg-[#0e1424]/90 text-slate-100'
              : 'border-stone-200 bg-white/60'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-2 ${
            isNight ? 'border-slate-800' : 'border-stone-100'
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isNight ? 'text-indigo-300' : 'text-stone-700'
            }`}>
              {t.eraDetails}
            </span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isNight ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
            }`}>
              <Compass className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded-lg border ${
              isNight ? 'bg-slate-800/60 border-slate-700/60' : 'bg-stone-50 border-stone-200/60'
            }`}>
              <span className={`block text-[11px] font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.sakaEra}</span>
              <span className={`font-extrabold font-mono text-sm ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>{data.saka_year}</span>
            </div>
            <div className={`p-2 rounded-lg border ${
              isNight ? 'bg-slate-800/60 border-slate-700/60' : 'bg-stone-50 border-stone-200/60'
            }`}>
              <span className={`block text-[11px] font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.vikramaEra}</span>
              <span className={`font-extrabold font-mono text-sm ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>{data.vikrama_year}</span>
            </div>
            <div className={`p-2 rounded-lg border ${
              isNight ? 'bg-slate-800/60 border-slate-700/60' : 'bg-stone-50 border-stone-200/60'
            }`}>
              <span className={`block text-[11px] font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.kaliYear}</span>
              <span className={`font-extrabold font-mono text-sm ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>{data.kali_year}</span>
            </div>
            <div className={`p-2 rounded-lg border ${
              isNight ? 'bg-slate-800/60 border-slate-700/60' : 'bg-stone-50 border-stone-200/60'
            }`}>
              <span className={`block text-[11px] font-medium ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.ahargana}</span>
              <span className={`font-mono font-extrabold text-xs truncate block ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>{data.kali_day}</span>
            </div>
          </div>

          <div className={`mt-3 border-t pt-2 text-[11px] font-mono truncate ${
            isNight ? 'border-slate-800 text-slate-400' : 'border-stone-100 text-stone-500'
          }`}>
            {data.ayanamsa || 'Tropical'} ({data.ayanamsa_degrees != null ? `${data.ayanamsa_degrees.toFixed(4)}°` : '0°'})
          </div>
        </div>
      </div>
    </div>
  );
};
