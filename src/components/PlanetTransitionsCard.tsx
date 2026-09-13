import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Sparkles,
  Sun,
  Flame,
  Clock,
  Calendar,
  Compass,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { PanchangaResponse, PlanetTransitionEvent, PlanetTransitStatus, AppTheme } from '../types';
import { type Language, translations, GRAHA_TRANSLATIONS, getLocalizedRasi, getLocalizedNakshatra } from '../i18n';

interface PlanetTransitionsCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

const GRAHA_THEMES: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  sun: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-200', bar: 'bg-amber-500' },
  moon: { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-200', bar: 'bg-indigo-500' },
  mars: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-200', bar: 'bg-rose-500' },
  mercury: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  jupiter: { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-200', bar: 'bg-yellow-500' },
  venus: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-900', border: 'border-fuchsia-200', bar: 'bg-fuchsia-500' },
  saturn: { bg: 'bg-slate-200', text: 'text-slate-900', border: 'border-slate-300', bar: 'bg-slate-600' },
  rahu: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-200', bar: 'bg-purple-600' },
  ketu: { bg: 'bg-stone-200', text: 'text-stone-900', border: 'border-stone-300', bar: 'bg-stone-600' },
};

const GRAHA_THEMES_NIGHT: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  sun: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-900/60', bar: 'bg-amber-500' },
  moon: { bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-900/60', bar: 'bg-indigo-500' },
  mars: { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-900/60', bar: 'bg-rose-500' },
  mercury: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-900/60', bar: 'bg-emerald-500' },
  jupiter: { bg: 'bg-yellow-950/80', text: 'text-yellow-300', border: 'border-yellow-900/60', bar: 'bg-yellow-500' },
  venus: { bg: 'bg-fuchsia-950/80', text: 'text-fuchsia-300', border: 'border-fuchsia-900/60', bar: 'bg-fuchsia-500' },
  saturn: { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700', bar: 'bg-slate-500' },
  rahu: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-900/60', bar: 'bg-purple-500' },
  ketu: { bg: 'bg-stone-800/80', text: 'text-stone-300', border: 'border-stone-700', bar: 'bg-stone-500' },
};

export const PlanetTransitionsCard: React.FC<PlanetTransitionsCardProps> = ({ data, lang, theme }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'timeline'>('matrix');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'rasi' | 'nakshatra' | 'today'>('all');
  const isNight = theme === 'nightSky';
  const themeMap = isNight ? GRAHA_THEMES_NIGHT : GRAHA_THEMES;

  const t = translations[lang];
  const transitionsData = data.planet_transitions;

  const planetsList: PlanetTransitStatus[] = useMemo(() => {
    return transitionsData?.planets || [];
  }, [transitionsData]);

  const upcomingEvents: PlanetTransitionEvent[] = useMemo(() => {
    return transitionsData?.upcomingEvents || [];
  }, [transitionsData]);

  const todayEvents: PlanetTransitionEvent[] = useMemo(() => {
    return transitionsData?.todayEvents || [];
  }, [transitionsData]);

  const filteredEvents = useMemo(() => {
    if (timelineFilter === 'today') return upcomingEvents.filter((e) => e.isToday);
    if (timelineFilter === 'rasi') return upcomingEvents.filter((e) => e.type === 'rasi');
    if (timelineFilter === 'nakshatra') return upcomingEvents.filter((e) => e.type === 'nakshatra');
    return upcomingEvents;
  }, [upcomingEvents, timelineFilter]);

  if (!transitionsData || planetsList.length === 0) {
    return null;
  }

  return (
    <div
      id="planet-transitions-card"
      className={`rounded-[1.5rem] p-6 sm:p-8 space-y-6 animate-in fade-in duration-500 transition-colors ${
        isNight ? 'bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl' : 'glass-card'
      }`}
    >
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-3 ${
        isNight ? 'border-indigo-800/40' : 'border-stone-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-2xs ${
            isNight ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-800'
          }`}>
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold font-serif-vedic ${
              isNight ? 'text-amber-200' : 'text-stone-900'
            }`}>
              {t.planetTransitionsTitle || 'Graha Gochara — Planetary Transitions'}
            </h3>
            <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
              {t.planetTransitionsSub || 'High-precision sidereal ingress into Rashis & Nakshatras with sacred Punya Kala'}
            </p>
          </div>
        </div>

        {/* View switcher: Matrix / Timeline */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`inline-flex rounded-xl p-1 border text-xs font-semibold ${
            isNight ? 'bg-[#12182b] border-indigo-900/60' : 'bg-stone-100 border-stone-200'
          }`}>
            <button
              type="button"
              id="transitions-view-matrix-btn"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'matrix'
                  ? isNight ? 'bg-indigo-900/60 text-slate-100 font-bold shadow-2xs' : 'bg-white text-stone-950 font-bold shadow-2xs'
                  : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{lang === 'sa' ? 'नवग्रहगोचरः' : lang === 'hi' ? 'ग्रह स्थिति व आगामी' : 'Graha Overview'}</span>
            </button>
            <button
              type="button"
              id="transitions-view-timeline-btn"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === 'timeline'
                  ? isNight ? 'bg-indigo-900/60 text-amber-300 font-bold shadow-2xs' : 'bg-white text-amber-950 font-bold shadow-2xs'
                  : isNight ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Clock className={`h-3.5 w-3.5 ${isNight ? 'text-amber-400' : 'text-amber-700'}`} />
              <span>
                {lang === 'sa' ? 'कालक्रमः' : lang === 'hi' ? 'गोचर कालक्रम' : 'Transit Timeline'}
                {upcomingEvents.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isNight ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {upcomingEvents.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Ingress Alert Banner (if any transition is happening on the selected day) */}
      {todayEvents.length > 0 && (
        <div
          id="today-transits-banner"
          className={`rounded-2xl p-4 shadow-xs border ${
            isNight
              ? 'bg-gradient-to-r from-amber-900/20 via-amber-800/30 to-amber-900/20 border-amber-700/50 text-amber-100'
              : 'bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-amber-500/10 border-amber-300/80'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5 shadow-xs ${
              isNight ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isNight ? 'text-amber-200' : 'text-amber-950'}`}>
                  {t.todayTransits || "Today's Planetary Transitions"}
                </h4>
                <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {todayEvents.length} {lang === 'hi' ? 'परिवर्तन आज' : 'Event(s) Today'}
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                {todayEvents.map((ev) => {
                  const desc = ev.description ? ev.description[lang] || ev.description.en : '';
                  return (
                    <div
                      key={ev.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-stone-800 bg-white/70 rounded-xl px-3 py-2 border border-amber-200/60 gap-1.5"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-950 font-bold text-xs">
                          {ev.symbol}
                        </span>
                        <span className="font-bold text-amber-950">
                          {lang === 'hi' || lang === 'sa' ? ev.sanskritName : ev.planetName}
                        </span>
                        <span className="text-stone-400">→</span>
                        <span className="font-semibold text-stone-900">
                          {ev.type === 'rasi' ? ev.toName || ev.toValue : ev.toName || ev.toValue}
                        </span>
                        {ev.specialName && (
                          <span className="rounded-md bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                            {ev.specialName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-stone-600 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span className="font-bold text-stone-900">{ev.timeStr}</span>
                        <span className="text-amber-800 font-sans font-semibold">({ev.relativeText})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 1: Graha Status Grid (Matrix) */}
      {activeTab === 'matrix' && (
        <div id="planet-transitions-matrix" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {planetsList.map((planet) => {
            const grahaInfo = GRAHA_TRANSLATIONS[planet.planetId];
            const grahaLabel = grahaInfo ? grahaInfo[lang] || planet.planetName : planet.planetName;
            const theme = themeMap[planet.planetId] || {
              bg: isNight ? 'bg-amber-950/80' : 'bg-amber-100',
              text: isNight ? 'text-amber-300' : 'text-amber-900',
              border: isNight ? 'border-amber-900/60' : 'border-amber-200',
              bar: 'bg-amber-500',
            };

            const nextRasi = planet.nextRasiTransit;
            const nextNak = planet.nextNakshatraTransit;

            return (
              <div
                key={planet.planetId}
                id={`transit-card-${planet.planetId}`}
                className={`group relative rounded-2xl border p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3 ${
                  isNight
                    ? 'bg-[#12182b] border-indigo-900/40 hover:border-indigo-600'
                    : 'bg-white/80 border-stone-200/70 hover:border-amber-300'
                }`}
              >
                {/* Graha Header */}
                <div>
                  <div className={`flex items-center justify-between pb-2 border-b ${
                    isNight ? 'border-indigo-900/40' : 'border-stone-100'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${theme.bg} ${theme.text} font-bold text-base shadow-2xs`}
                      >
                        {planet.symbol}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm font-devanagari ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
                          {grahaLabel}
                        </h4>
                        <div className={`text-[11px] font-sans ${isNight ? 'text-slate-400' : 'text-stone-400'}`}>
                          {planet.planetName} • {planet.sanskritName}
                        </div>
                      </div>
                    </div>

                    {/* Status Pills */}
                    <div className="flex items-center space-x-1">
                      {planet.isRetrograde ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          isNight ? 'bg-rose-950/80 text-rose-300 border-rose-900/60' : 'bg-rose-100 text-rose-900 border-rose-200'
                        }`}>
                          <ArrowDownRight className="mr-0.5 h-2.5 w-2.5" />
                          {t.retrograde}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isNight ? 'bg-slate-800/80 text-slate-300' : 'bg-stone-100 text-stone-600'
                        }`}>
                          <ArrowUpRight className={`mr-0.5 h-2.5 w-2.5 ${isNight ? 'text-slate-500' : 'text-stone-400'}`} />
                          {t.direct}
                        </span>
                      )}

                      {planet.isCombust && (
                        <span
                          title={`Combust within ${planet.combustDistanceDeg}° of Sun`}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            isNight ? 'bg-amber-950/80 text-amber-300 border-amber-900/60' : 'bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          <Flame className={`mr-0.5 h-2.5 w-2.5 ${isNight ? 'text-amber-400' : 'text-amber-600'}`} />
                          {t.combust || 'Asta'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current Sign & Degree Progress */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-sans ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
                        {lang === 'hi' ? 'वर्तमान राशि' : lang === 'sa' ? 'वर्तमानराशिः' : 'Current Sign'}:
                      </span>
                      <span className={`font-bold font-devanagari ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                        {planet.currentRasi}{' '}
                        <span className={`font-mono text-[11px] ${isNight ? 'text-slate-500' : 'text-stone-500'}`}>({planet.degreesInRasi})</span>
                      </span>
                    </div>

                    {/* Progress Bar through 30 degrees of current Rasi */}
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-stone-100" style={{ backgroundColor: isNight ? '#1e293b' : '#f5f5f4' }}>
                      <div
                        className={`h-full ${theme.bar} transition-all duration-700`}
                        style={{ width: `${planet.progressPercent}%` }}
                      ></div>
                    </div>
                    <div className={`flex items-center justify-between text-[10px] ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
                      <span>0°</span>
                      <span>{planet.progressPercent}% in sign</span>
                      <span>30°</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={`font-sans ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
                        {lang === 'hi' ? 'नक्षत्र व चरण' : lang === 'sa' ? 'नक्षत्रम्' : 'Nakshatra'}:
                      </span>
                      <span className={`font-semibold font-devanagari ${isNight ? 'text-slate-200' : 'text-stone-800'}`}>
                        {planet.currentNakshatra}{' '}
                        <span className={`text-[11px] font-sans ${isNight ? 'text-amber-400' : 'text-amber-800'}`}>
                          ({lang === 'hi' ? `चरण ${planet.currentPada}` : `Pāda ${planet.currentPada}`})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Ingress Highlights */}
                <div className={`mt-2 pt-2.5 border-t space-y-2 text-xs ${
                  isNight ? 'border-indigo-900/40' : 'border-stone-100/90'
                }`}>
                  {/* Next Rasi Transit */}
                  {nextRasi && (
                    <div className={`rounded-xl p-2.5 border space-y-1 ${
                      isNight ? 'bg-indigo-950/40 border-amber-900/30' : 'bg-amber-50/50 border-amber-200/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                          isNight ? 'text-amber-400' : 'text-amber-900'
                        }`}>
                          <ArrowRightLeft className={`h-3 w-3 ${isNight ? 'text-amber-500' : 'text-amber-700'}`} />
                          {lang === 'hi' ? 'आगामी राशि गोचर' : lang === 'sa' ? 'आगामीराशिप्रवेशः' : 'Next Sign Ingress'}
                        </span>
                        <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold font-sans ${
                          isNight ? 'bg-amber-900/60 text-amber-200' : 'bg-amber-200/80 text-amber-950'
                        }`}>
                          {nextRasi.relativeText}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className={`font-bold font-devanagari text-[13px] ${isNight ? 'text-slate-100' : 'text-stone-900'}`}>
                          → {nextRasi.toName || nextRasi.toValue}
                        </span>
                        <div className="text-[11px] text-stone-600 font-mono text-right">
                          <div>{nextRasi.dateStr}</div>
                          <div className="text-[10px] text-stone-400">{nextRasi.timeStr} ({nextRasi.dayOfWeek})</div>
                        </div>
                      </div>

                      {/* Sankranti & Punya Kala for Sun */}
                      {nextRasi.specialName && (
                        <div className={`mt-1 pt-1 border-t text-[11px] space-y-0.5 ${
                          isNight ? 'border-amber-900/40 text-amber-300' : 'border-amber-200/60 text-amber-950'
                        }`}>
                          <div className={`font-bold flex items-center gap-1 ${isNight ? 'text-amber-500' : 'text-amber-900'}`}>
                            <Sun className={`h-3 w-3 ${isNight ? 'text-amber-400' : 'text-amber-600'}`} />
                            {nextRasi.specialName}
                          </div>
                          {nextRasi.punyaKala && (
                            <div className={`text-[10px] flex items-center justify-between ${
                              isNight ? 'text-slate-400' : 'text-stone-600'
                            }`}>
                              <span className={`font-medium ${isNight ? 'text-amber-400' : 'text-amber-900'}`}>{t.punyaKala || 'Puṇyakāla'}:</span>
                              <span className="font-mono">{nextRasi.punyaKala.start} – {nextRasi.punyaKala.end}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Nakshatra Transit */}
                  {nextNak && (
                    <div className={`flex items-center justify-between text-[11px] px-1 ${
                      isNight ? 'text-slate-400' : 'text-stone-600'
                    }`}>
                      <span className={isNight ? 'text-slate-500' : 'text-stone-400'}>
                        {lang === 'hi' ? 'नक्षत्र प्रवेश' : 'Next Nakṣatra'}:
                      </span>
                      <div className="text-right">
                        <span className={`font-semibold font-devanagari ${
                          isNight ? 'text-slate-200' : 'text-stone-800'
                        }`}>
                          {nextNak.toName || nextNak.toValue}
                        </span>
                        <span className={`text-[10px] ml-1 ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
                          ({nextNak.relativeText})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Chronological Timeline Feed */}
      {activeTab === 'timeline' && (
        <div id="planet-transitions-timeline" className="space-y-4">
          {/* Filter Sub-Tabs */}
          <div className={`flex flex-wrap items-center justify-between gap-2 pb-2 border-b ${
            isNight ? 'border-indigo-900/40' : 'border-stone-100'
          }`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTimelineFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timelineFilter === 'all'
                    ? isNight ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-850 text-white shadow-2xs'
                    : isNight ? 'bg-[#12182b] border border-indigo-900/40 text-slate-300 hover:bg-indigo-900/40' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {lang === 'hi' ? 'सभी गोचर' : lang === 'sa' ? 'सर्वाणि संक्रमणानि' : 'All Transits'} ({upcomingEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setTimelineFilter('rasi')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timelineFilter === 'rasi'
                    ? isNight ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-850 text-white shadow-2xs'
                    : isNight ? 'bg-[#12182b] border border-indigo-900/40 text-slate-300 hover:bg-indigo-900/40' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {lang === 'hi' ? 'राशि प्रवेश (संक्रांति)' : lang === 'sa' ? 'राशिप्रवेशः' : 'Sign (Rāśi) Ingress'}
              </button>
              <button
                type="button"
                onClick={() => setTimelineFilter('nakshatra')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timelineFilter === 'nakshatra'
                    ? isNight ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-850 text-white shadow-2xs'
                    : isNight ? 'bg-[#12182b] border border-indigo-900/40 text-slate-300 hover:bg-indigo-900/40' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {lang === 'hi' ? 'नक्षत्र प्रवेश' : lang === 'sa' ? 'नक्षत्रप्रवेशः' : 'Nakṣatra Ingress'}
              </button>
              {todayEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTimelineFilter('today')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    timelineFilter === 'today'
                      ? isNight ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-500 text-white shadow-2xs'
                      : isNight ? 'bg-amber-900/40 text-amber-300 border border-amber-800/50 hover:bg-amber-800/40' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  {lang === 'hi' ? 'आज के गोचर' : lang === 'sa' ? 'अद्यतनानि' : 'Today'} ({todayEvents.length})
                </button>
              )}
            </div>

            <div className={`text-xs font-sans ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
              {lang === 'hi' ? 'आगामी ६० दिवस' : 'Next 60 days'}
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {filteredEvents.map((ev) => {
              const theme = themeMap[ev.planetId] || {
                bg: isNight ? 'bg-amber-950/80' : 'bg-amber-100',
                text: isNight ? 'text-amber-300' : 'text-amber-900',
                border: isNight ? 'border-amber-900/60' : 'border-amber-200',
                bar: 'bg-amber-500',
              };

              const desc = ev.description ? ev.description[lang] || ev.description.en : '';

              return (
                <div
                  key={ev.id}
                  id={`timeline-event-${ev.id}`}
                  className={`rounded-2xl border p-4 transition-all ${
                    ev.isToday
                      ? isNight
                        ? 'border-amber-700/50 bg-amber-900/20 shadow-xs ring-1 ring-amber-700/30'
                        : 'border-amber-300 bg-amber-50/40 shadow-xs ring-1 ring-amber-300/40'
                      : isNight
                        ? 'border-indigo-900/40 bg-[#12182b] hover:border-indigo-600'
                        : 'border-stone-200/70 bg-white hover:border-amber-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Left: Planet badge + Details */}
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.bg} ${theme.text} font-bold text-lg shadow-2xs mt-0.5`}
                      >
                        {ev.symbol}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm font-devanagari ${
                            isNight ? 'text-slate-100' : 'text-stone-900'
                          }`}>
                            {lang === 'hi' || lang === 'sa' ? ev.sanskritName : ev.planetName}
                          </span>
                          <span className={`text-xs ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
                            ({ev.type === 'rasi' ? (lang === 'hi' ? 'राशि गोचर' : 'Rāśi Transit') : (lang === 'hi' ? 'नक्षत्र गोचर' : 'Nakṣatra Transit')})
                          </span>
                          {ev.isToday && (
                            <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                              isNight
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-900/60'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}>
                              {lang === 'hi' ? 'आज' : 'TODAY'}
                            </span>
                          )}
                          {ev.specialName && (
                            <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                              isNight
                                ? 'bg-amber-900/60 text-amber-200 border-amber-800/80'
                                : 'bg-amber-200 text-amber-950 border-amber-300'
                            }`}>
                              {ev.specialName}
                            </span>
                          )}
                        </div>

                        {/* Transition path */}
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`font-devanagari ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{ev.fromName || ev.fromValue}</span>
                          <span className={`font-bold ${isNight ? 'text-amber-500' : 'text-amber-700'}`}>→</span>
                          <span className={`font-bold font-devanagari text-sm ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                            {ev.toName || ev.toValue}
                          </span>
                          <span className={`text-[11px] font-sans ${isNight ? 'text-slate-500' : 'text-stone-400'}`}>
                            ({ev.toValue})
                          </span>
                        </div>

                        {/* Spiritual significance description */}
                        {desc && (
                          <p className={`text-xs pt-1 leading-relaxed max-w-2xl font-sans ${isNight ? 'text-slate-300' : 'text-stone-600'}`}>
                            {desc}
                          </p>
                        )}

                        {/* Solar Sankranti Punya Kala details */}
                        {ev.punyaKala && (
                          <div className={`mt-2 flex flex-wrap items-center gap-3 text-xs rounded-xl px-3 py-1.5 border ${
                            isNight
                              ? 'bg-amber-950/40 border-amber-900/50'
                              : 'bg-amber-100/60 border-amber-200/80'
                          }`}>
                            <div className={`flex items-center space-x-1.5 font-medium ${isNight ? 'text-amber-300' : 'text-amber-950'}`}>
                              <Sparkles className={`h-3.5 w-3.5 ${isNight ? 'text-amber-400' : 'text-amber-700'}`} />
                              <span className="font-bold">{ev.punyaKala.name}:</span>
                              <span className="font-mono">{ev.punyaKala.start} – {ev.punyaKala.end}</span>
                            </div>
                            {ev.mahaPunyaKala && (
                              <div className={`flex items-center space-x-1 font-medium border-l pl-3 ${
                                isNight ? 'text-amber-400 border-amber-900' : 'text-amber-900 border-amber-300'
                              }`}>
                                <span className="font-bold">{ev.mahaPunyaKala.name}:</span>
                                <span className="font-mono">{ev.mahaPunyaKala.start} – {ev.mahaPunyaKala.end}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Date, Time & Countdown Badge */}
                    <div className={`flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0 ${
                      isNight ? 'border-indigo-900/40' : 'border-stone-100'
                    }`}>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold font-sans border ${
                        isNight
                          ? 'bg-amber-900/40 text-amber-300 border-amber-900/60'
                          : 'bg-amber-100/80 text-amber-900 border-amber-200'
                      }`}>
                        {ev.relativeText}
                      </span>
                      <div className={`text-xs font-mono font-bold pt-1 ${isNight ? 'text-slate-200' : 'text-stone-900'}`}>
                        {ev.dateStr}
                      </div>
                      <div className={`text-[11px] font-mono ${isNight ? 'text-slate-500' : 'text-stone-500'}`}>
                        {ev.timeStr} • {ev.dayOfWeek}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer notes */}
      <div className={`border-t pt-3 flex flex-wrap items-center justify-between text-xs gap-2 ${
        isNight ? 'border-indigo-900/40 text-slate-400' : 'border-stone-100 text-stone-500'
      }`}>
        <div>
          {lang === 'sa'
            ? '* ग्रहसंक्रमणानां गणना दृक्सिद्ध-निरयण-अयनांशेन क्रियते।'
            : lang === 'hi'
            ? '* सभी ग्रह गोचर व संक्रांति समय नासा जेपीएल प्रत्यक्ष दृश्य निरयण अयनांश आधारित हैं।'
            : '* Planetary ingress and Saṅkrānti computed with high-precision NASA JPL sidereal ephemeris.'}
        </div>
        <div className="font-mono text-[11px] text-stone-400">
          Root-bracketed Bisection Precision ±30s
        </div>
      </div>
    </div>
  );
};
