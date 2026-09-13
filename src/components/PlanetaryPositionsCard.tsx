import React, { useState } from 'react';
import { Orbit, ArrowDownRight, ArrowUpRight, Grid3X3, LayoutGrid, ArrowRightLeft, Flame } from 'lucide-react';
import type { PanchangaResponse, PlanetTransitStatus, AppTheme } from '../types';
import {
  type Language,
  translations,
  GRAHA_TRANSLATIONS,
  getLocalizedRasi,
  getLocalizedNakshatra,
} from '../i18n';
import { KundaliChart } from './KundaliChart';
import { PlanetTransitionsCard } from './PlanetTransitionsCard';

interface PlanetaryPositionsCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const PlanetaryPositionsCard: React.FC<PlanetaryPositionsCardProps> = ({ data, lang, theme }) => {
  const [displayMode, setDisplayMode] = useState<'table' | 'kundali' | 'transitions'>('table');
  const isNight = theme === 'nightSky';
  const t = translations[lang];
  const planets = data.planets || [];
  const transitPlanetsMap = new Map<string, PlanetTransitStatus>(
    (data.planet_transitions?.planets || []).map((p) => [p.planetId, p])
  );

  return (
    <div
      id="planetary-positions-card"
      className={`rounded-[1.5rem] p-6 sm:p-8 space-y-6 transition-colors ${
        isNight
          ? 'bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl'
          : 'glass-card'
      }`}
    >
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3.5 gap-3 ${
        isNight ? 'border-indigo-800/40' : 'border-stone-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-2xs ${
            isNight ? 'bg-indigo-950/80 text-amber-300' : 'bg-amber-100 text-amber-800'
          }`}>
            <Orbit className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold font-serif-vedic ${
              isNight ? 'text-amber-200' : 'text-stone-900'
            }`}>
              {t.planetsTitle}
            </h3>
            <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
              {t.planetsSub} ({data.sunrise}) • {data.coordinate_label}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Toggle between Table, Kundali Chart, and Transitions */}
          <div className={`inline-flex rounded-xl p-1 border text-xs font-semibold ${
            isNight ? 'bg-[#12182b] border-indigo-900/60' : 'bg-stone-100 border-stone-200'
          }`}>
            <button
              type="button"
              id="planets-mode-table-btn"
              onClick={() => setDisplayMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                displayMode === 'table'
                  ? isNight ? 'bg-indigo-900/60 text-slate-100 font-bold shadow-2xs' : 'bg-white text-stone-950 font-bold shadow-2xs'
                  : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{lang === 'sa' ? 'तालिका' : lang === 'hi' ? 'तालिका' : 'Table'}</span>
            </button>
            <button
              type="button"
              id="planets-mode-kundali-btn"
              onClick={() => setDisplayMode('kundali')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                displayMode === 'kundali'
                  ? isNight ? 'bg-indigo-900/60 text-amber-300 font-bold shadow-2xs' : 'bg-white text-amber-950 font-bold shadow-2xs'
                  : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Grid3X3 className={`h-3.5 w-3.5 ${isNight ? 'text-amber-400' : 'text-amber-700'}`} />
              <span>{lang === 'sa' ? 'कुण्डली' : lang === 'hi' ? 'कुण्डली' : 'Kundali'}</span>
            </button>
            <button
              type="button"
              id="planets-mode-transitions-btn"
              onClick={() => setDisplayMode('transitions')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                displayMode === 'transitions'
                  ? isNight ? 'bg-indigo-900/60 text-amber-300 font-bold shadow-2xs' : 'bg-white text-amber-950 font-bold shadow-2xs'
                  : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ArrowRightLeft className={`h-3.5 w-3.5 ${isNight ? 'text-amber-400' : 'text-amber-700'}`} />
              <span>{lang === 'sa' ? 'गोचरः' : lang === 'hi' ? 'गोचर' : 'Transits'}</span>
            </button>
          </div>

          <div className={`text-xs font-mono px-3 py-1 rounded-full border ${
            isNight
              ? 'bg-slate-800/80 text-slate-300 border-slate-700/80'
              : 'bg-stone-100 text-stone-600 border-stone-200'
          }`}>
            {t.ayanamsaSystem}: {data.ayanamsa_degrees != null ? `${data.ayanamsa_degrees.toFixed(4)}°` : '0.0000°'} ({data.ayanamsa || 'Lahiri'})
          </div>
        </div>
      </div>

      {displayMode === 'kundali' ? (
        <KundaliChart planets={planets} lang={lang} coordinateMode={data.coordinate_label} theme={theme} />
      ) : displayMode === 'transitions' ? (
        <PlanetTransitionsCard data={data} lang={lang} theme={theme} />
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider font-sans ${
                isNight
                  ? 'border-indigo-900/50 bg-[#12182b] text-indigo-300'
                  : 'border-amber-200/70 bg-amber-50/50 text-amber-950'
              }`}>
                <th className="px-3.5 py-3">{t.graha}</th>
                <th className="px-3.5 py-3">{t.rasi}</th>
                <th className="px-3.5 py-3">{t.degrees}</th>
                <th className="px-3.5 py-3">{t.pada}</th>
                <th className="px-3.5 py-3">Sidereal Lon</th>
                <th className="px-3.5 py-3 text-center">{t.motion}</th>
                <th className="px-3.5 py-3">{t.nextTransit || 'Next Transit'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${isNight ? 'divide-indigo-900/40' : 'divide-stone-100'}`}>
              {planets.map((planet) => {
                const grahaInfo = GRAHA_TRANSLATIONS[planet.id];
                const grahaLabel = grahaInfo ? grahaInfo[lang] || planet.name : planet.name;
                const rasiLabel = getLocalizedRasi(planet.rasi, lang);
                const nakLabel = getLocalizedNakshatra(planet.nakshatraNumber, planet.nakshatra, lang);
                const transitStatus = transitPlanetsMap.get(planet.id);
                const nextRasi = transitStatus?.nextRasiTransit;

                return (
                  <tr
                    key={planet.id}
                    id={`graha-row-${planet.id}`}
                    className={`transition-colors ${isNight ? 'hover:bg-[#12182b]/80' : 'hover:bg-amber-50/30'}`}
                  >
                    {/* Planet Name & Symbol */}
                    <td className="px-3.5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-sm font-devanagari ${
                          isNight ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100/70 text-amber-900'
                        }`}>
                          {grahaInfo?.symbol || '●'}
                        </span>
                        <div>
                          <div className={`font-bold font-devanagari flex items-center gap-1.5 ${
                            isNight ? 'text-slate-100' : 'text-stone-900'
                          }`}>
                            <span>{grahaLabel}</span>
                            {transitStatus?.isCombust && (
                              <span
                                title="Combust (Asta)"
                                className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  isNight
                                    ? 'bg-amber-950/70 text-amber-300'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                <Flame className={`h-2.5 w-2.5 mr-0.5 ${isNight ? 'text-amber-500' : 'text-amber-600'}`} />
                                {t.combust || 'Asta'}
                              </span>
                            )}
                          </div>
                          {lang !== 'en' && (
                            <div className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>{planet.name}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rasi */}
                    <td className="px-3.5 py-3.5">
                      <div className={`font-semibold font-devanagari ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                        {rasiLabel}
                      </div>
                      <div className={`text-[11px] ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>#{planet.rasiNumber}</div>
                    </td>

                    {/* Degrees in Sign */}
                    <td className={`px-3.5 py-3.5 font-mono text-xs font-semibold ${isNight ? 'text-slate-300' : 'text-stone-800'}`}>
                      <div>{planet.degreesInRasi}</div>
                      {transitStatus && (
                        <div className={`text-[10px] font-sans ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
                          {transitStatus.progressPercent}% {lang === 'hi' ? 'भोग' : 'done'}
                        </div>
                      )}
                    </td>

                    {/* Nakshatra & Pada */}
                    <td className="px-3.5 py-3.5">
                      <div className={`font-medium font-devanagari ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                        {nakLabel}
                      </div>
                      <div className={`text-xs font-medium ${isNight ? 'text-amber-400' : 'text-amber-900'}`}>
                        {lang === 'sa'
                          ? `${planet.pada} पादः`
                          : lang === 'hi'
                          ? `चरण ${planet.pada}`
                          : `Pāda ${planet.pada}`}{' '}
                        <span className={`font-mono ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>(#{planet.nakshatraNumber})</span>
                      </div>
                    </td>

                    {/* Sidereal Longitude */}
                    <td className={`px-3.5 py-3.5 font-mono text-xs ${isNight ? 'text-slate-400' : 'text-stone-600'}`}>
                      {planet.siderealLongitude.toFixed(4)}°
                    </td>

                    {/* Retrograde Status */}
                    <td className="px-3.5 py-3.5 text-center">
                      {planet.isRetrograde ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          isNight
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                          {t.retrograde}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isNight
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          <ArrowUpRight className={`mr-1 h-3 w-3 ${isNight ? 'text-slate-500' : 'text-stone-400'}`} />
                          {t.direct}
                        </span>
                      )}
                    </td>

                    {/* Next Transit (Rashi Ingress) */}
                    <td className="px-3.5 py-3.5">
                      {nextRasi ? (
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center space-x-1">
                            <span className={`font-bold ${isNight ? 'text-amber-500' : 'text-amber-700'}`}>→</span>
                            <span className={`font-bold font-devanagari ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                              {nextRasi.toName || nextRasi.toValue}
                            </span>
                          </div>
                          <div className={`text-[11px] font-medium ${isNight ? 'text-amber-300' : 'text-amber-900'}`}>
                            {nextRasi.relativeText}
                          </div>
                          <div className={`text-[10px] font-mono ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>
                            {nextRasi.dateStr}
                          </div>
                        </div>
                      ) : (
                        <span className={`text-xs ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className={`border-t pt-3 flex flex-wrap items-center justify-between text-xs gap-2 ${
        isNight ? 'border-indigo-900/40 text-slate-400' : 'border-stone-100 text-stone-500'
      }`}>
        <div>
          {lang === 'sa'
            ? '* राहु-केतु छायाग्रहाः सदा वक्रिणः १८:०० समसप्तके तिष्ठतः।'
            : lang === 'hi'
            ? '* राहु व केतु छायाग्रह हैं और परस्पर १८०° पर सदैव वक्री गति में रहते हैं।'
            : '* Rāhu and Ketu are true Mean Lunar Nodes in opposite 180° sidereal alignment.'}
        </div>
        <div className={`font-mono text-[11px] ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
          VSOP87 / ELP2000 Ephemeris • NASA JPL Algorithms
        </div>
      </div>
    </div>
  );
};
