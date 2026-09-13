import React, { useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import type { PanchangaResponse } from '../types';
import { type Language, translations, getLocalizedChoghadiya } from '../i18n';

import type { AppTheme } from "../types";

interface GauriChoghadiyaCardProps {
  theme?: AppTheme;
  data: PanchangaResponse;
  lang: Language;
}

export const GauriChoghadiyaCard: React.FC<GauriChoghadiyaCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === "nightSky";
  const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');
  const t = translations[lang];

  const getBadgeStyle = (natureType: 'auspicious' | 'neutral' | 'inauspicious') => {
    switch (natureType) {
      case 'auspicious':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold';
      case 'neutral':
        return 'bg-stone-100 text-stone-900 border-stone-300 font-semibold';
      case 'inauspicious':
        return 'bg-rose-100 text-rose-950 border-rose-300 font-bold';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const intervals = activeTab === 'day' ? data.gauri_choghadiya_day : data.gauri_choghadiya_night;

  return (
    <div
      id="gauri-choghadiya-card"
      className="glass-card rounded-[1.5rem] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-3.5 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-vedic">
            {t.choghadiyaTitle}
          </h3>
          <p className="text-xs text-stone-500">{t.choghadiyaSub}</p>
        </div>

        {/* Day / Night toggle */}
        <div className="flex items-center space-x-1.5 rounded-xl bg-stone-100 p-1 border border-stone-200/60 self-start sm:self-auto">
          <button
            type="button"
            id="tab-choghadiya-day"
            onClick={() => setActiveTab('day')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'day'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-600" />
            <span>{t.dayChoghadiya}</span>
          </button>
          <button
            type="button"
            id="tab-choghadiya-night"
            onClick={() => setActiveTab('night')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'night'
                ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-indigo-600" />
            <span>{t.nightChoghadiya}</span>
          </button>
        </div>
      </div>

      {/* Grid of 8 intervals */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {intervals && intervals.length > 0 ? (
          intervals.map((item, index) => {
            const loc = getLocalizedChoghadiya(item.name || '', lang);
            return (
              <div
                key={index}
                id={`choghadiya-item-${index}`}
                className="flex flex-col justify-between rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block rounded-md px-2.5 py-0.5 text-xs border font-devanagari ${getBadgeStyle(
                        loc.natureType
                      )}`}
                    >
                      {loc.name}
                    </span>
                    {lang !== 'en' && item.name && (
                      <div className="text-[11px] text-stone-400 font-sans mt-0.5">
                        {item.name}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                    #{index + 1}
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 mt-2 font-medium">
                  {loc.nature}
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-baseline justify-between">
                  <span className="font-mono text-xs font-bold text-stone-900">
                    {item.start}
                  </span>
                  <span className="text-[11px] text-stone-400">→</span>
                  <span className="font-mono text-xs font-bold text-stone-800">
                    {item.end}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-6 text-center text-sm text-stone-500">
            Choghadiya calculations unavailable for this date.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3.5 text-xs text-stone-500">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>{' '}
            {lang === 'sa'
              ? 'अमृतम् / शुभम् / लाभः (प्रशस्ताः)'
              : lang === 'hi'
              ? 'अमृत / शुभ / लाभ (श्रेष्ठ-शुभ)'
              : 'Amṛta / Śubha / Lābha (Auspicious)'}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-400"></span>{' '}
            {lang === 'sa' ? 'चलम् (मध्यमः)' : lang === 'hi' ? 'चर (सामान्य)' : 'Chara (Neutral / Motion)'}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>{' '}
            {lang === 'sa'
              ? 'उद्वेगः / कालः / रोगः (वर्ज्याः)'
              : lang === 'hi'
              ? 'उद्वेग / काल / रोग (अशुभ-त्याज्य)'
              : 'Udvega / Kāla / Roga (Avoid)'}
          </span>
        </div>
        <div className="text-[11px] text-stone-400">
          {lang === 'sa'
            ? 'अष्टधा समानभागाः'
            : lang === 'hi'
            ? '८ समान भागों में विभाजित'
            : '8 equal diurnal/nocturnal subdivisions'}
        </div>
      </div>
    </div>
  );
};
