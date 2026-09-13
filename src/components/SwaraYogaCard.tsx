import React, { useState, useEffect } from 'react';
import type { PanchangaResponse } from '../types';
import type { Language } from '../i18n';
import {
  SWARA_CYCLE_RULES,
  SWARA_DETAILS,
  computeSwaraYoga,
  getSwaraForTithiNumber,
} from '../swaraYoga';
import {
  Wind,
  Sun,
  Moon,
  Compass,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Table as TableIcon,
  Flame,
  Droplets,
  Layers,
} from 'lucide-react';

import type { AppTheme } from "../types";

interface SwaraYogaCardProps {
  theme?: AppTheme;
  data: PanchangaResponse;
  lang: Language;
}

export const SwaraYogaCard: React.FC<SwaraYogaCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === "nightSky";
  const [showTable, setShowTable] = useState(false);
  const [tableFilter, setTableFilter] = useState<'all' | 'shukla' | 'krishna'>('all');
  const [activeTab, setActiveTab] = useState<'current' | 'activities' | 'tattva'>('current');
  const [currentTime, setCurrentTime] = useState<{ hours: number; minutes: number; seconds: number }>(() => {
    const now = new Date();
    return { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() };
  });

  // Update real-time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime({ hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const primaryTithiNum = data.tithi?.[0]?.number || 1;
  const swaraData = computeSwaraYoga(
    primaryTithiNum,
    data.sunrise,
    data.sunset,
    currentTime,
    data.moonrise,
    data.moonset
  );

  const sunriseDetails = SWARA_DETAILS[swaraData.sunriseSwara];
  const sunsetDetails = SWARA_DETAILS[swaraData.sunsetSwara];
  const moonriseDetails = SWARA_DETAILS[swaraData.moonriseSwara];
  const moonsetDetails = SWARA_DETAILS[swaraData.moonsetSwara];
  const activeDetails = swaraData.currentActiveSwara
    ? SWARA_DETAILS[swaraData.currentActiveSwara]
    : sunriseDetails;

  // Filtered 30-day table
  const filteredDays = SWARA_CYCLE_RULES.filter((rule) => {
    if (tableFilter === 'shukla') return rule.dayNumber <= 15;
    if (tableFilter === 'krishna') return rule.dayNumber > 15;
    return true;
  });

  return (
    <div
      id="swara-yoga-card"
      className="overflow-hidden glass-card rounded-[2rem] border border-amber-300/50 bg-gradient-to-b from-amber-50/40 via-white/50 to-orange-50/30 transition-all"
    >
      {/* Header Banner with Vedic styling */}
      <div className="border-b border-amber-200/50 bg-gradient-to-r from-amber-100/50 via-orange-100/30 to-amber-100/50 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-700 text-amber-50 shadow-xs">
              <Wind className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-vedic text-xl font-bold text-stone-900 tracking-wide">
                  {lang === 'sa'
                    ? 'शिवस्वरोदयः (स्वरयोगः)'
                    : lang === 'hi'
                    ? 'शिव स्वरोदय (स्वर योग एवं नाड़ी ज्ञान)'
                    : 'Shiva Swarodaya (Swara Yoga)'}
                </h3>
                <span className="rounded-full border border-amber-400/80 bg-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-900 uppercase">
                  {lang === 'sa' ? 'प्राणविज्ञानम्' : lang === 'hi' ? 'प्राण विज्ञान' : 'Pranic Breath Science'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {lang === 'sa'
                  ? 'तिथ्यनुसारं सूर्योदय-सूर्यास्त-स्वरप्रवाह-साधनम्'
                  : lang === 'hi'
                  ? 'तिथि एवं पक्ष अनुसार सूर्योदय व सूर्यास्त के स्वर का सटीक निर्धारण'
                  : 'Daily solar rising breath, nostril dominance & lunar day alignment'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTable(!showTable)}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-white/90 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100/70 transition-colors shadow-2xs"
            >
              <TableIcon className="h-3.5 w-3.5 text-amber-700" />
              <span>
                {showTable
                  ? lang === 'hi' ? 'तालिका छिपाएँ' : lang === 'sa' ? 'सारणीं गोपय' : 'Hide 30-Day Table'
                  : lang === 'hi' ? '30-दिवसीय चक्र तालिका' : lang === 'sa' ? 'त्रिंशद्-दिवस-सारणी' : 'View 30-Day Table'}
              </span>
              {showTable ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sacred Verse / Scriptural Citation with Celestial Swara Axiom */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="text-center">
            <p className="font-devanagari text-base sm:text-lg font-bold text-amber-950 leading-relaxed">
              ॥ इडायां चन्द्रमा ज्ञेयः पिङ्गलायां दिवाकरः । सुषुम्णायां भवेद्ब्रह्मा सर्वपापप्रणाशनः ॥
            </p>
            <p className="text-xs text-stone-600 mt-1 italic">
              {lang === 'hi'
                ? 'बाएं नथुने (इड़ा) में चन्द्रमा, दाएं नथुने (पिङ्गला) में सूर्य, तथा दोनों समान चलने पर (सुषुम्णा) में ब्रह्म स्थित होते हैं।'
                : lang === 'sa'
                ? 'इडानाड्यां चन्द्रस्वरः, पिङ्गलायां सूर्यस्वरः, सुषुम्णायां ब्रह्मभावश्च स्थितः भवति।'
                : 'Ida (left nostril) embodies lunar nectar; Pingala (right nostril) is the solar fire; Sushumna (balanced flow) is the cosmic soul.'}
            </p>
          </div>

          {/* Core Celestial Swara Axiom & 1-Hour Windows */}
          <div className="mt-3.5 pt-3 border-t border-amber-200/80 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-center">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-950">
                <Sparkles className="h-3.5 w-3.5 text-amber-800" />
                <span>
                  {lang === 'hi' ? 'स्वर काल एवं नाड़ी नियम (1 घंटा काल)' : lang === 'sa' ? 'स्वरकाल-नाडीनियमः (१ होरा)' : '1-Hour Celestial Swara Windows'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-stone-700 font-sans mt-2">
              <div className="rounded-xl border border-amber-200/70 bg-white/70 p-2 text-center">
                <span className="font-bold text-amber-950 block">
                  {lang === 'hi' ? '१. सूर्योदय स्वर' : lang === 'sa' ? '१. सूर्योदयस्वरः' : '1. Sunrise Swara'}
                </span>
                <span className="text-stone-600 block mt-0.5">
                  {lang === 'hi' ? 'सूर्योदय starting से 1 घंटे तक' : lang === 'sa' ? 'सूर्योदयात् १ होरापर्यन्तम्' : '1 hr from sunrise starting'}
                </span>
                {swaraData.sunriseWindow && (
                  <span className="font-mono font-bold text-amber-900 block mt-0.5 text-[10px] bg-amber-100/60 rounded py-0.5">
                    {swaraData.sunriseWindow.windowFormatted}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-amber-200/70 bg-white/70 p-2 text-center">
                <span className="font-bold text-amber-950 block">
                  {lang === 'hi' ? '२. सूर्यास्त स्वर' : lang === 'sa' ? '२. सूर्यास्तस्वरः' : '2. Sunset Swara'}
                </span>
                <span className="text-stone-600 block mt-0.5">
                  {lang === 'hi' ? 'सूर्यास्त से 1 घंटा पहले प्रारंभ' : lang === 'sa' ? 'सूर्यास्तात् १ होरा पूर्वम्' : 'Starts 1 hr before sunset'}
                </span>
                {swaraData.sunsetWindow && (
                  <span className="font-mono font-bold text-amber-900 block mt-0.5 text-[10px] bg-amber-100/60 rounded py-0.5">
                    {swaraData.sunsetWindow.windowFormatted}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-amber-200/70 bg-white/70 p-2 text-center">
                <span className="font-bold text-amber-950 block">
                  {lang === 'hi' ? '३. चन्द्रोदय स्वर' : lang === 'sa' ? '३. चन्द्रोदयस्वरः' : '3. Moonrise Swara'}
                </span>
                <span className="text-stone-600 block mt-0.5">
                  {lang === 'hi' ? 'चन्द्रोदय starting से 1 घंटे तक (सूर्योदय का विपरीत)' : lang === 'sa' ? 'चन्द्रोदयात् १ होरापर्यन्तम् (सूर्योदयविपरीतम्)' : '1 hr from moonrise (opp. of sunrise)'}
                </span>
                <span className="font-mono font-bold text-amber-900 block mt-0.5 text-[10px] bg-amber-100/60 rounded py-0.5">
                  {swaraData.moonriseWindow?.windowFormatted || '—'}
                </span>
              </div>

              <div className="rounded-xl border border-amber-200/70 bg-white/70 p-2 text-center">
                <span className="font-bold text-amber-950 block">
                  {lang === 'hi' ? '४. चन्द्रास्त स्वर' : lang === 'sa' ? '४. चन्द्रास्तस्वरः' : '4. Moonset Swara'}
                </span>
                <span className="text-stone-600 block mt-0.5">
                  {lang === 'hi' ? 'चन्द्रास्त से 1 घंटा पहले प्रारंभ (सूर्यास्त का विपरीत)' : lang === 'sa' ? 'चन्द्रास्तात् १ होरा पूर्वम् (सूर्यास्तविपरीतम्)' : 'Starts 1 hr before moonset (opp. of sunset)'}
                </span>
                <span className="font-mono font-bold text-amber-900 block mt-0.5 text-[10px] bg-amber-100/60 rounded py-0.5">
                  {swaraData.moonsetWindow?.windowFormatted || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Today Summary Grid: 4 Celestial Alignments (Sunrise, Sunset, Moonrise, Moonset) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Sunrise Swara */}
          <div
            className={`rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
              swaraData.sunriseWindow?.isActive
                ? 'ring-2 ring-emerald-500 shadow-md '
                : ''
            }${
              swaraData.sunriseSwara === 'ida'
                ? 'border-sky-300 bg-sky-50/50'
                : 'border-orange-300 bg-orange-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <div className="flex items-center space-x-1.5">
                  <Sun className={`h-4 w-4 ${swaraData.sunriseSwara === 'ida' ? 'text-sky-600' : 'text-orange-600'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {lang === 'hi' ? 'सूर्योदय स्वर' : lang === 'sa' ? 'सूर्योदयस्वरः' : 'Sunrise Swara'}
                  </span>
                </div>
                {swaraData.sunriseWindow?.isActive ? (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
                    <span>●</span>
                    <span>{lang === 'hi' ? 'अभी सक्रिय' : 'Active Now'}</span>
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {data.sunrise}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start space-x-2.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-2xs ${
                    swaraData.sunriseSwara === 'ida' ? 'bg-sky-600' : 'bg-orange-600'
                  }`}
                >
                  {swaraData.sunriseSwara === 'ida' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-serif-vedic text-base font-bold text-stone-900">
                    {swaraData.sunriseSwara === 'ida'
                      ? lang === 'hi' ? 'इड़ा (वाम)' : lang === 'sa' ? 'इड़ा (वामनासा)' : 'Ida (Left)'
                      : lang === 'hi' ? 'पिङ्गला (दक्षिण)' : lang === 'sa' ? 'पिङ्गला (दक्षिणनासा)' : 'Pingala (Right)'}
                  </h4>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    {sunriseDetails.energy[lang]}
                  </div>
                </div>
              </div>

              {/* Exact 1-Hour Time Window Badge */}
              <div className="mt-2.5 rounded-lg bg-white/70 border border-stone-200/60 p-1.5 text-center">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'काल (सूर्योदय से 1 घंटा)' : lang === 'sa' ? 'कालः (सूर्योदयात् १ होरा)' : 'Window (1 hr from sunrise)'}
                </div>
                <div className="font-mono text-xs font-bold text-stone-900 mt-0.5">
                  {swaraData.sunriseWindow?.windowFormatted}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
              <span className="text-stone-500">{lang === 'hi' ? 'तत्त्व' : lang === 'sa' ? 'तत्त्वम्' : 'Element'}:</span>
              <span className="font-bold text-stone-800">{sunriseDetails.element[lang]}</span>
            </div>
          </div>

          {/* 2. Sunset Swara */}
          <div
            className={`rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
              swaraData.sunsetWindow?.isActive
                ? 'ring-2 ring-emerald-500 shadow-md '
                : ''
            }${
              swaraData.sunsetSwara === 'ida'
                ? 'border-sky-300 bg-sky-50/50'
                : 'border-orange-300 bg-orange-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <div className="flex items-center space-x-1.5">
                  <Sun className={`h-4 w-4 ${swaraData.sunsetSwara === 'ida' ? 'text-sky-600' : 'text-orange-600'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {lang === 'hi' ? 'सूर्यास्त स्वर' : lang === 'sa' ? 'सूर्यास्तस्वरः' : 'Sunset Swara'}
                  </span>
                </div>
                {swaraData.sunsetWindow?.isActive ? (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
                    <span>●</span>
                    <span>{lang === 'hi' ? 'अभी सक्रिय' : 'Active Now'}</span>
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {data.sunset}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start space-x-2.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-2xs ${
                    swaraData.sunsetSwara === 'ida' ? 'bg-sky-600' : 'bg-orange-600'
                  }`}
                >
                  {swaraData.sunsetSwara === 'ida' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-serif-vedic text-base font-bold text-stone-900">
                    {swaraData.sunsetSwara === 'ida'
                      ? lang === 'hi' ? 'इड़ा (वाम)' : lang === 'sa' ? 'इड़ा (वामनासा)' : 'Ida (Left)'
                      : lang === 'hi' ? 'पिङ्गला (दक्षिण)' : lang === 'sa' ? 'पिङ्गला (दक्षिणनासा)' : 'Pingala (Right)'}
                  </h4>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    {sunsetDetails.energy[lang]}
                  </div>
                </div>
              </div>

              {/* Exact 1-Hour Time Window Badge */}
              <div className="mt-2.5 rounded-lg bg-white/70 border border-stone-200/60 p-1.5 text-center">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'काल (सूर्यास्त से 1 घंटा पहले)' : lang === 'sa' ? 'कालः (सूर्यास्तात् १ होरा पूर्वम्)' : 'Window (1 hr before sunset)'}
                </div>
                <div className="font-mono text-xs font-bold text-stone-900 mt-0.5">
                  {swaraData.sunsetWindow?.windowFormatted}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
              <span className="text-stone-500">{lang === 'hi' ? 'तत्त्व' : lang === 'sa' ? 'तत्त्वम्' : 'Element'}:</span>
              <span className="font-bold text-stone-800">{sunsetDetails.element[lang]}</span>
            </div>
          </div>

          {/* 3. Moonrise Swara (Opposite of Sunrise) */}
          <div
            className={`rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
              swaraData.moonriseWindow?.isActive
                ? 'ring-2 ring-emerald-500 shadow-md '
                : ''
            }${
              swaraData.moonriseSwara === 'ida'
                ? 'border-sky-300 bg-sky-50/50'
                : 'border-orange-300 bg-orange-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <div className="flex items-center space-x-1.5">
                  <Moon className={`h-4 w-4 ${swaraData.moonriseSwara === 'ida' ? 'text-sky-600' : 'text-orange-600'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {lang === 'hi' ? 'चन्द्रोदय स्वर' : lang === 'sa' ? 'चन्द्रोदयस्वरः' : 'Moonrise Swara'}
                  </span>
                </div>
                {swaraData.moonriseWindow?.isActive ? (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
                    <span>●</span>
                    <span>{lang === 'hi' ? 'अभी सक्रिय' : 'Active Now'}</span>
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {data.moonrise || '—'}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start space-x-2.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-2xs ${
                    swaraData.moonriseSwara === 'ida' ? 'bg-sky-600' : 'bg-orange-600'
                  }`}
                >
                  {swaraData.moonriseSwara === 'ida' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-serif-vedic text-base font-bold text-stone-900">
                    {swaraData.moonriseSwara === 'ida'
                      ? lang === 'hi' ? 'इड़ा (वाम)' : lang === 'sa' ? 'इड़ा (वामनासा)' : 'Ida (Left)'
                      : lang === 'hi' ? 'पिङ्गला (दक्षिण)' : lang === 'sa' ? 'पिङ्गला (दक्षिणनासा)' : 'Pingala (Right)'}
                  </h4>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    <span className="inline-block rounded bg-stone-200/60 px-1 py-0.2 text-[10px] font-bold text-stone-700 mr-1">
                      {lang === 'hi' ? 'सूर्योदय विपरीत' : lang === 'sa' ? 'सूर्योदयविपरीतम्' : 'Opposite of Sunrise'}
                    </span>
                    {moonriseDetails.energy[lang]}
                  </div>
                </div>
              </div>

              {/* Exact 1-Hour Time Window Badge */}
              <div className="mt-2.5 rounded-lg bg-white/70 border border-stone-200/60 p-1.5 text-center">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'काल (चन्द्रोदय से 1 घंटा)' : lang === 'sa' ? 'कालः (चन्द्रोदयात् १ होरा)' : 'Window (1 hr from moonrise)'}
                </div>
                <div className="font-mono text-xs font-bold text-stone-900 mt-0.5">
                  {swaraData.moonriseWindow?.windowFormatted || '—'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
              <span className="text-stone-500">{lang === 'hi' ? 'तत्त्व' : lang === 'sa' ? 'तत्त्वम्' : 'Element'}:</span>
              <span className="font-bold text-stone-800">{moonriseDetails.element[lang]}</span>
            </div>
          </div>

          {/* 4. Moonset Swara (Opposite of Sunset) */}
          <div
            className={`rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
              swaraData.moonsetWindow?.isActive
                ? 'ring-2 ring-emerald-500 shadow-md '
                : ''
            }${
              swaraData.moonsetSwara === 'ida'
                ? 'border-sky-300 bg-sky-50/50'
                : 'border-orange-300 bg-orange-50/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <div className="flex items-center space-x-1.5">
                  <Moon className={`h-4 w-4 ${swaraData.moonsetSwara === 'ida' ? 'text-sky-600' : 'text-orange-600'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {lang === 'hi' ? 'चन्द्रास्त स्वर' : lang === 'sa' ? 'चन्द्रास्तस्वरः' : 'Moonset Swara'}
                  </span>
                </div>
                {swaraData.moonsetWindow?.isActive ? (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold animate-pulse">
                    <span>●</span>
                    <span>{lang === 'hi' ? 'अभी सक्रिय' : 'Active Now'}</span>
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {data.moonset || '—'}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start space-x-2.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-2xs ${
                    swaraData.moonsetSwara === 'ida' ? 'bg-sky-600' : 'bg-orange-600'
                  }`}
                >
                  {swaraData.moonsetSwara === 'ida' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-serif-vedic text-base font-bold text-stone-900">
                    {swaraData.moonsetSwara === 'ida'
                      ? lang === 'hi' ? 'इड़ा (वाम)' : lang === 'sa' ? 'इड़ा (वामनासा)' : 'Ida (Left)'
                      : lang === 'hi' ? 'पिङ्गला (दक्षिण)' : lang === 'sa' ? 'पिङ्गला (दक्षिणनासा)' : 'Pingala (Right)'}
                  </h4>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    <span className="inline-block rounded bg-stone-200/60 px-1 py-0.2 text-[10px] font-bold text-stone-700 mr-1">
                      {lang === 'hi' ? 'सूर्यास्त विपरीत' : lang === 'sa' ? 'सूर्यास्तविपरीतम्' : 'Opposite of Sunset'}
                    </span>
                    {moonsetDetails.energy[lang]}
                  </div>
                </div>
              </div>

              {/* Exact 1-Hour Time Window Badge */}
              <div className="mt-2.5 rounded-lg bg-white/70 border border-stone-200/60 p-1.5 text-center">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'काल (चन्द्रास्त से 1 घंटा पहले)' : lang === 'sa' ? 'कालः (चन्द्रास्तात् १ होरा पूर्वम्)' : 'Window (1 hr before moonset)'}
                </div>
                <div className="font-mono text-xs font-bold text-stone-900 mt-0.5">
                  {swaraData.moonsetWindow?.windowFormatted || '—'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs">
              <span className="text-stone-500">{lang === 'hi' ? 'तत्त्व' : lang === 'sa' ? 'तत्त्वम्' : 'Element'}:</span>
              <span className="font-bold text-stone-800">{moonsetDetails.element[lang]}</span>
            </div>
          </div>
        </div>

        {/* Dedicated Real-Time Active Estimated Swara & Tattva Flow */}
        <div className="rounded-2xl border border-amber-300 bg-linear-to-r from-amber-50 via-orange-50/50 to-amber-50 p-4 sm:p-5 shadow-2xs space-y-3">
          {/* Active Celestial Window Special Notice */}
          {swaraData.activeCelestialWindow && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 px-3.5 py-2.5 text-xs text-emerald-950 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {swaraData.activeCelestialWindow === 'sunrise' && (lang === 'hi' ? 'वर्तमान में सूर्योदय स्वर काल सक्रिय है (सूर्योदय से 1 घंटे तक)' : lang === 'sa' ? 'साम्प्रतं सूर्योदयस्वरकालः प्रचलति (सूर्योदयात् १ होरा)' : 'Active Now: Sunrise Swara Window (1 hr from sunrise)')}
                  {swaraData.activeCelestialWindow === 'sunset' && (lang === 'hi' ? 'वर्तमान में सूर्यास्त स्वर काल सक्रिय है (सूर्यास्त से 1 घंटा पहले)' : lang === 'sa' ? 'साम्प्रतं सूर्यास्तस्वरकालः प्रचलति (सूर्यास्तात् १ होरा पूर्वम्)' : 'Active Now: Sunset Swara Window (1 hr before sunset)')}
                  {swaraData.activeCelestialWindow === 'moonrise' && (lang === 'hi' ? 'वर्तमान में चन्द्रोदय स्वर काल सक्रिय है (चन्द्रोदय से 1 घंटे तक)' : lang === 'sa' ? 'साम्प्रतं चन्द्रोदयस्वरकालः प्रचलति (चन्द्रोदयात् १ होरा)' : 'Active Now: Moonrise Swara Window (1 hr from moonrise)')}
                  {swaraData.activeCelestialWindow === 'moonset' && (lang === 'hi' ? 'वर्तमान में चन्द्रास्त स्वर काल सक्रिय है (चन्द्रास्त से 1 घंटा पहले)' : lang === 'sa' ? 'साम्प्रतं चन्द्रास्तस्वरकालः प्रचलति (चन्द्रास्तात् १ होरा पूर्वम्)' : 'Active Now: Moonset Swara Window (1 hr before moonset)')}
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-950 bg-white/90 px-2.5 py-0.5 rounded-lg border border-emerald-300 text-center">
                {swaraData.activeCelestialWindow === 'sunrise' && swaraData.sunriseWindow?.windowFormatted}
                {swaraData.activeCelestialWindow === 'sunset' && swaraData.sunsetWindow?.windowFormatted}
                {swaraData.activeCelestialWindow === 'moonrise' && swaraData.moonriseWindow?.windowFormatted}
                {swaraData.activeCelestialWindow === 'moonset' && swaraData.moonsetWindow?.windowFormatted}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/70">
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                {lang === 'hi' ? 'वर्तमान प्रवहमान स्वर एवं नाड़ी स्थिति' : lang === 'sa' ? 'वर्तमानस्वरप्रवाहः नाडीस्थितिः च' : 'Current Active Swara & Flow Status'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                Cycle #{swaraData.cycleNumberToday || 1}
              </span>
              <span className="text-stone-600">
                {lang === 'hi' ? 'अगला परिवर्तन' : lang === 'sa' ? 'अग्रिमपरिवर्तनम्' : 'Next switch in'}:{' '}
                <strong className="text-amber-950 font-mono font-bold">~{swaraData.minutesRemainingInCycle} mins</strong>
              </span>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-2xs ${
                  swaraData.currentActiveSwara === 'ida'
                    ? 'bg-sky-600'
                    : swaraData.currentActiveSwara === 'pingala'
                    ? 'bg-orange-600'
                    : 'bg-purple-600'
                }`}
              >
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-serif-vedic text-lg font-bold text-stone-900">
                    {activeDetails.sanskritName}
                  </h4>
                  <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-xs font-bold text-stone-800">
                    {activeDetails.nostril[lang]}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {activeDetails.energy[lang]} — {activeDetails.element[lang]}
                </p>
              </div>
            </div>

            {swaraData.activeTattva && (
              <div className="rounded-xl border border-amber-200/80 bg-white/80 p-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    {lang === 'hi' ? 'वर्तमान सक्रिय तत्त्व' : lang === 'sa' ? 'वर्तमानसक्रियतत्त्वम्' : 'Active Tattva'}
                  </div>
                  <div className="font-serif-vedic text-sm font-bold text-stone-900 flex items-center space-x-1.5 mt-0.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: swaraData.activeTattva.color }}
                    ></span>
                    <span>{swaraData.activeTattva.sanskrit}</span>
                    <span className="text-xs font-normal text-stone-500 font-sans">
                      ({swaraData.activeTattva.name})
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] max-w-[180px] text-stone-600">
                  <span className="font-semibold text-amber-900">{lang === 'hi' ? 'शुभ कार्य' : lang === 'sa' ? 'शुभकार्यम्' : 'Best for'}:</span> {swaraData.activeTattva.karya}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable 30-Day Master Reference Table */}
        {showTable && (
          <div
            id="swara-30day-table"
            className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs animate-in fade-in duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h4 className="font-serif-vedic text-lg font-bold text-stone-900">
                  {lang === 'hi'
                    ? '30-दिवसीय शिवस्वरोदय सारणी (तिथि व पक्ष अनुसार)'
                    : lang === 'sa'
                    ? 'त्रिंशद्-दिवसीया शिवस्वरोदय-चक्रसारणी'
                    : 'Classical 30-Day Shiva Swarodaya Table'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Exact Vedic rhythm alternating every 3 lunar days between Chandra (Ida) & Surya (Pingala) nadis
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200/70 text-xs">
                <button
                  onClick={() => setTableFilter('all')}
                  className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                    tableFilter === 'all'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'सभी 30 दिन' : lang === 'sa' ? 'सर्वे' : 'All 30 Days'}
                </button>
                <button
                  onClick={() => setTableFilter('shukla')}
                  className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                    tableFilter === 'shukla'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'शुक्ल पक्ष (1–15)' : lang === 'sa' ? 'शुक्लपक्षः' : 'Shukla Paksha (1–15)'}
                </button>
                <button
                  onClick={() => setTableFilter('krishna')}
                  className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                    tableFilter === 'krishna'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'कृष्ण पक्ष (16–30)' : lang === 'sa' ? 'कृष्णपक्षः' : 'Krishna Paksha (16–30)'}
                </button>
              </div>
            </div>

            {/* The Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Days</th>
                    <th className="py-2.5 px-3">Tithis</th>
                    <th className="py-2.5 px-3">Pakshya</th>
                    <th className="py-2.5 px-3">
                      <div>Sunrise Swara</div>
                      <div className="text-[10px] font-normal lowercase text-stone-500">1 hr from sunrise</div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div>Sunset Swara</div>
                      <div className="text-[10px] font-normal lowercase text-stone-500">1 hr before sunset</div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div>Moonrise Swara</div>
                      <div className="text-[10px] font-normal lowercase text-stone-500">1 hr from moonrise (opp.)</div>
                    </th>
                    <th className="py-2.5 px-3">
                      <div>Moonset Swara</div>
                      <div className="text-[10px] font-normal lowercase text-stone-500">1 hr before moonset (opp.)</div>
                    </th>
                    <th className="py-2.5 px-3">Nature / Nadi Energy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {filteredDays.map((rule) => {
                    const isCurrentDay = rule.dayNumber === primaryTithiNum;
                    const sunriseIsIda = rule.sunriseSwara === 'ida';
                    const sunsetIsIda = rule.sunsetSwara === 'ida';
                    const moonriseIsIda = rule.moonriseSwara === 'ida';
                    const moonsetIsIda = rule.moonsetSwara === 'ida';

                    return (
                      <tr
                        key={rule.dayNumber}
                        className={`transition-colors ${
                          isCurrentDay
                            ? 'bg-amber-100/70 font-semibold ring-2 ring-amber-500/50'
                            : 'hover:bg-stone-50/80'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                          {rule.dayNumber}
                          {isCurrentDay && (
                            <span className="ml-2 rounded-md bg-amber-600 text-white px-1.5 py-0.5 text-[10px] font-sans uppercase">
                              Today
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-stone-800">
                          {rule.tithiName}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              rule.paksha.includes('Shukla') || rule.paksha === 'Full moon'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-stone-100 text-stone-800 border border-stone-200'
                            }`}
                          >
                            {rule.paksha}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                              sunriseIsIda
                                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                : 'bg-orange-100 text-orange-950 border border-orange-300'
                            }`}
                          >
                            {sunriseIsIda ? <Moon className="h-3.5 w-3.5 text-sky-600" /> : <Sun className="h-3.5 w-3.5 text-orange-600" />}
                            <span>
                              {sunriseIsIda
                                ? 'Ida (left nostril)'
                                : 'Pingala (right nostril)'}
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                              sunsetIsIda
                                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                : 'bg-orange-100 text-orange-950 border border-orange-300'
                            }`}
                          >
                            {sunsetIsIda ? <Moon className="h-3.5 w-3.5 text-sky-600" /> : <Sun className="h-3.5 w-3.5 text-orange-600" />}
                            <span>
                              {sunsetIsIda
                                ? 'Ida'
                                : 'Pingala'}
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                              moonriseIsIda
                                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                : 'bg-orange-100 text-orange-950 border border-orange-300'
                            }`}
                          >
                            {moonriseIsIda ? <Moon className="h-3.5 w-3.5 text-sky-600" /> : <Sun className="h-3.5 w-3.5 text-orange-600" />}
                            <span>
                              {moonriseIsIda
                                ? 'Ida (left)'
                                : 'Pingala (right)'}
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                              moonsetIsIda
                                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                : 'bg-orange-100 text-orange-950 border border-orange-300'
                            }`}
                          >
                            {moonsetIsIda ? <Moon className="h-3.5 w-3.5 text-sky-600" /> : <Sun className="h-3.5 w-3.5 text-orange-600" />}
                            <span>
                              {moonsetIsIda
                                ? 'Ida'
                                : 'Pingala'}
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                          {sunriseIsIda
                            ? 'Somya / Cooling Lunar Nectar at Dawn'
                            : 'Agni / Heating Solar Fire at Dawn'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Practical Application Guide: Sub-Tabs for Ida vs Pingala vs Tattvas */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="h-5 w-5 text-amber-700" />
              <h4 className="font-serif-vedic text-base font-bold text-stone-900">
                {lang === 'hi'
                  ? 'स्वर विज्ञान एवं दैनिक कार्यों में उपयोग'
                  : lang === 'sa'
                  ? 'स्वरविज्ञानम् कर्मसु विनियोगश्च'
                  : 'Svara Shastra: Auspicious Deeds for Each Breath'}
              </h4>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200/60 text-xs">
              <button
                onClick={() => setActiveTab('current')}
                className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                  activeTab === 'current'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'hi' ? 'सक्रिय स्वर मार्गदर्शिका' : lang === 'sa' ? 'सक्रियस्वरमार्गः' : 'Active Swara Guide'}
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                  activeTab === 'activities'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'hi' ? 'इड़ा बनाम पिङ्गला कार्य' : lang === 'sa' ? 'इड़ा-पिङ्गला-कार्याणि' : 'Ida vs Pingala Tasks'}
              </button>
              <button
                onClick={() => setActiveTab('tattva')}
                className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                  activeTab === 'tattva'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'hi' ? 'पंचमहाभूत तत्त्व चक्र' : lang === 'sa' ? 'पञ्चतत्त्वचक्रम्' : '5 Mahabhuta Tattvas'}
              </button>
            </div>
          </div>

          <div className="mt-4">
            {/* Tab 1: Current Active Guide */}
            {activeTab === 'current' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs text-stone-600">
                  <span>Currently predicted flow is:</span>
                  <span className="font-bold text-stone-900 font-serif-vedic">
                    {activeDetails.sanskritName} ({activeDetails.nostril[lang]})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
                    <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      <span>
                        {lang === 'hi'
                          ? 'वर्तमान स्वर में प्रशस्त व शुभ कार्य'
                          : lang === 'sa'
                          ? 'अस्मिन् स्वरे प्रशस्तानि कार्याणि'
                          : 'Auspicious Works in Current Flow'}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-950 font-sans">
                      {activeDetails.auspiciousWorks[lang].slice(0, 5).map((w, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5">
                    <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs mb-2">
                      <XCircle className="h-4 w-4 text-rose-700" />
                      <span>
                        {lang === 'hi'
                          ? 'वर्तमान स्वर में वर्जित या अनुचित कार्य'
                          : lang === 'sa'
                          ? 'अस्मिन् स्वरे त्याज्यानि कार्याणि'
                          : 'Inadvisable Works in Current Flow'}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-rose-950 font-sans">
                      {activeDetails.inauspiciousWorks[lang].map((w, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-rose-700 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Ida vs Pingala Master Comparison */}
            {activeTab === 'activities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Ida */}
                <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4">
                  <div className="flex items-center space-x-2 border-b border-sky-200/80 pb-2 mb-3">
                    <Moon className="h-4 w-4 text-sky-700" />
                    <span className="font-serif-vedic font-bold text-sky-950 text-sm">
                      {lang === 'hi' ? 'इड़ा नाड़ी (चन्द्र स्वर - वाम नासिका)' : 'Ida Nadi (Chandra Swara - Left)'}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-stone-800">
                    <p className="text-[11px] text-sky-900 font-medium">
                      Best for peaceful, permanent, generative, gentle (Saumya) deeds:
                    </p>
                    <ul className="space-y-1">
                      {SWARA_DETAILS.ida.auspiciousWorks[lang].map((act, i) => (
                        <li key={i} className="flex items-start space-x-1.5 text-stone-700">
                          <span className="text-sky-600 font-bold">✓</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Pingala */}
                <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4">
                  <div className="flex items-center space-x-2 border-b border-orange-200/80 pb-2 mb-3">
                    <Sun className="h-4 w-4 text-orange-700" />
                    <span className="font-serif-vedic font-bold text-orange-950 text-sm">
                      {lang === 'hi' ? 'पिङ्गला नाड़ी (सूर्य स्वर - दक्षिण नासिका)' : 'Pingala Nadi (Surya Swara - Right)'}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-stone-800">
                    <p className="text-[11px] text-orange-900 font-medium">
                      Best for active, metabolic, vigorous, bold (Agni/Raudra) deeds:
                    </p>
                    <ul className="space-y-1">
                      {SWARA_DETAILS.pingala.auspiciousWorks[lang].map((act, i) => (
                        <li key={i} className="flex items-start space-x-1.5 text-stone-700">
                          <span className="text-orange-600 font-bold">✓</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: The 5 Mahabhuta Tattvas inside each Swara */}
            {activeTab === 'tattva' && (
              <div className="space-y-3 text-xs">
                <p className="text-stone-600 text-xs">
                  Within each ~60-minute Swara flow (approx 2.5 Ghaṭī), the five Mahābhūta Tattvas cycle in precise sequence:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span>1. Pṛthvī (Earth)</span>
                      <span className="text-[10px] font-mono">20m</span>
                    </div>
                    <div className="text-[11px] text-amber-800 mt-1 font-medium">Stable / Grounding</div>
                    <div className="text-[10px] text-stone-600 mt-1">
                      Yellow color. Ideal for contracts, buying land, permanent works.
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-300 bg-sky-50 p-3">
                    <div className="flex items-center justify-between font-bold text-sky-950">
                      <span>2. Jala (Water)</span>
                      <span className="text-[10px] font-mono">16m</span>
                    </div>
                    <div className="text-[11px] text-sky-800 mt-1 font-medium">Flow / Nourishing</div>
                    <div className="text-[10px] text-stone-600 mt-1">
                      White crescent. Ideal for peace, friendship, healing, trade.
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-300 bg-red-50 p-3">
                    <div className="flex items-center justify-between font-bold text-red-950">
                      <span>3. Tejas (Fire)</span>
                      <span className="text-[10px] font-mono">12m</span>
                    </div>
                    <div className="text-[11px] text-red-800 mt-1 font-medium">Energy / Agni</div>
                    <div className="text-[10px] text-stone-600 mt-1">
                      Red triangle. Ideal for meals/digestion, athletics, debate, bold actions.
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
                    <div className="flex items-center justify-between font-bold text-slate-950">
                      <span>4. Vāyu (Air)</span>
                      <span className="text-[10px] font-mono">8m</span>
                    </div>
                    <div className="text-[11px] text-slate-800 mt-1 font-medium">Motion / Speed</div>
                    <div className="text-[10px] text-stone-600 mt-1">
                      Smoky/blue. Ideal for short travel, rapid changes, agile tasks.
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-300 bg-purple-50 p-3">
                    <div className="flex items-center justify-between font-bold text-purple-950">
                      <span>5. Ākāśa (Ether)</span>
                      <span className="text-[10px] font-mono">4m</span>
                    </div>
                    <div className="text-[11px] text-purple-800 mt-1 font-medium">Space / Silence</div>
                    <div className="text-[10px] text-stone-600 mt-1">
                      Subtle void. Ideal solely for Dhyāna, Mantra Japa, detachment.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
