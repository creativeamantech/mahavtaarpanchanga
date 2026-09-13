import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { PanchangaResponse, AppTheme } from '../types';
import { type Language, translations } from '../i18n';

interface AuspiciousTimingsCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const AuspiciousTimingsCard: React.FC<AuspiciousTimingsCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === 'nightSky';
  const t = translations[lang];

  return (
    <div id="auspicious-timings-section" className="space-y-6">
      {/* Inauspicious Periods (Aśubha Muhūrtas) */}
      <div
        id="inauspicious-card"
        className={`rounded-[1.5rem] p-6 sm:p-8 transition-colors ${
          isNight
            ? 'border border-rose-950/50 bg-[#0e1424]/90 text-slate-100 shadow-xl'
            : 'glass-card border border-stone-200/80 bg-white/70'
        }`}
      >
        <div className={`flex items-center space-x-3 border-b pb-3.5 ${
          isNight ? 'border-rose-900/40' : 'border-rose-100'
        }`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-2xs ${
            isNight ? 'bg-rose-950/80 text-rose-300' : 'bg-rose-100 text-rose-800'
          }`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold font-serif-vedic ${
              isNight ? 'text-rose-200' : 'text-stone-900'
            }`}>
              {t.inauspiciousTimings}
            </h3>
            <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.inauspiciousSub}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Rahu Kala */}
          <div
            id="period-rahu-kala"
            className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
              isNight
                ? 'bg-rose-950/40 border-rose-900/60'
                : 'bg-rose-50/80 border-rose-200'
            }`}
          >
            <div className="mb-2">
              <div className={`text-sm font-bold font-devanagari ${
                isNight ? 'text-rose-300' : 'text-rose-950'
              }`}>
                {t.rahuKala}
              </div>
              <div className={`text-xs mt-0.5 ${isNight ? 'text-rose-400' : 'text-rose-700/90'}`}>
                {t.rahuKalaDesc}
              </div>
            </div>
            <div className={`mt-auto font-mono text-sm font-extrabold px-2.5 py-1.5 rounded-lg border shadow-2xs w-fit ${
              isNight
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : 'bg-white text-rose-950 border-rose-300'
            }`}>
              {data.rahu_kala ? `${data.rahu_kala.start} – ${data.rahu_kala.end}` : '—'}
            </div>
          </div>

          {/* Yamaganda */}
          {data.yamaganda && (
            <div
              id="period-yamaganda"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-[#12182b] border-indigo-900/40 text-slate-200'
                  : 'bg-stone-50/90 border-stone-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-slate-200' : 'text-stone-900'
                }`}>
                  {t.yamaganda}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
                  {t.yamagandaDesc}
                </div>
              </div>
              <div className={`mt-auto font-mono text-sm font-bold px-2.5 py-1.5 rounded-lg border shadow-2xs w-fit ${
                isNight
                  ? 'bg-slate-900 text-slate-200 border-indigo-900/60'
                  : 'bg-white text-stone-800 border-stone-200'
              }`}>
                {data.yamaganda.start} – {data.yamaganda.end}
              </div>
            </div>
          )}

          {/* Gulika Kala */}
          {data.gulika_kala && (
            <div
              id="period-gulika"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-[#12182b] border-indigo-900/40 text-slate-200'
                  : 'bg-stone-50/90 border-stone-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-slate-200' : 'text-stone-900'
                }`}>
                  {t.gulikaKala}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
                  {t.gulikaKalaDesc}
                </div>
              </div>
              <div className={`mt-auto font-mono text-sm font-bold px-2.5 py-1.5 rounded-lg border shadow-2xs w-fit ${
                isNight
                  ? 'bg-slate-900 text-slate-200 border-indigo-900/60'
                  : 'bg-white text-stone-800 border-stone-200'
              }`}>
                {data.gulika_kala.start} – {data.gulika_kala.end}
              </div>
            </div>
          )}

          {/* Durmuhurta */}
          {data.durmuhurta && data.durmuhurta.length > 0 && (
            <div
              id="period-durmuhurta"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-[#12182b] border-indigo-900/40 text-slate-200'
                  : 'bg-stone-50/90 border-stone-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-slate-200' : 'text-stone-900'
                }`}>
                  {t.durmuhurta}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
                  {t.durmuhurtaDesc}
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                {data.durmuhurta.map((dm, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-mono font-bold shadow-2xs border ${
                      isNight
                        ? 'bg-slate-900 text-slate-200 border-slate-700'
                        : 'bg-stone-200/90 text-stone-900 border-stone-300'
                    }`}
                  >
                    {dm.start} – {dm.end}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Varjyam */}
          {data.varjyam && data.varjyam.length > 0 && (
            <div
              id="period-varjyam"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-[#12182b] border-indigo-900/40 text-slate-200'
                  : 'bg-stone-50/90 border-stone-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-slate-200' : 'text-stone-900'
                }`}>
                  {t.varjyam}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>
                  {t.varjyamDesc}
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                {data.varjyam.map((v, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-mono font-bold border shadow-2xs ${
                      isNight
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                        : 'bg-rose-100/90 text-rose-900 border-rose-200'
                    }`}
                  >
                    {v.start} – {v.end}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auspicious Periods (Śubha Muhūrtas) */}
      <div
        id="auspicious-card"
        className={`rounded-[1.5rem] p-6 sm:p-8 transition-colors ${
          isNight
            ? 'border border-emerald-950/50 bg-[#0e1424]/90 text-slate-100 shadow-xl'
            : 'glass-card border border-stone-200/80 bg-white/70'
        }`}
      >
        <div className={`flex items-center space-x-3 border-b pb-3.5 ${
          isNight ? 'border-emerald-900/40' : 'border-emerald-100'
        }`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-2xs ${
            isNight ? 'bg-emerald-950/80 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold font-serif-vedic ${
              isNight ? 'text-emerald-300' : 'text-stone-900'
            }`}>
              {t.auspiciousTimings}
            </h3>
            <p className={`text-xs ${isNight ? 'text-slate-400' : 'text-stone-500'}`}>{t.auspiciousSub}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Abhijit Muhurta */}
          {data.abhijit_muhurta ? (
            <div
              id="period-abhijit"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-emerald-950/40 border-emerald-900/60 text-slate-200'
                  : 'bg-emerald-50/80 border-emerald-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-emerald-300' : 'text-emerald-950'
                }`}>
                  {t.abhijit}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {t.abhijitDesc}
                </div>
              </div>
              <div className={`mt-auto font-mono text-sm font-extrabold px-2.5 py-1.5 rounded-lg border shadow-2xs w-fit ${
                isNight
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
                  : 'bg-white text-emerald-950 border-emerald-300'
              }`}>
                {data.abhijit_muhurta.start} – {data.abhijit_muhurta.end}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col justify-center p-4 text-xs rounded-xl border ${
              isNight
                ? 'bg-[#12182b] text-slate-400 border-indigo-900/40'
                : 'bg-stone-50 text-stone-500 border-stone-200'
            }`}>
              {lang === 'sa'
                ? 'बुधवासरे अभिजित्मुहूर्तः वर्ज्यते।'
                : lang === 'hi'
                ? 'बुधवार के दिन अभिजित् मुहूर्त का परिहार माना जाता है।'
                : 'Abhijit Muhurta is avoided on Wednesdays (Budhavara).'}
            </div>
          )}

          {/* Brahma Muhurta */}
          {data.brahma_muhurta && (
            <div
              id="period-brahma"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-amber-950/40 border-amber-900/60 text-slate-200'
                  : 'bg-amber-50/80 border-amber-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-amber-300' : 'text-amber-950'
                }`}>
                  {t.brahmaMuhurta}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-amber-400' : 'text-amber-800'}`}>
                  {t.brahmaMuhurtaDesc}
                </div>
              </div>
              <div className={`mt-auto font-mono text-sm font-extrabold px-2.5 py-1.5 rounded-lg border shadow-2xs w-fit ${
                isNight
                  ? 'bg-amber-950/90 text-amber-200 border-amber-800'
                  : 'bg-white text-amber-950 border-amber-300'
              }`}>
                {data.brahma_muhurta.start} – {data.brahma_muhurta.end}
              </div>
            </div>
          )}

          {/* Amrita Kala */}
          {data.amrita_kala && data.amrita_kala.length > 0 && (
            <div
              id="period-amrita"
              className={`flex flex-col rounded-xl p-4 border transition-all hover:shadow-sm ${
                isNight
                  ? 'bg-emerald-950/30 border-emerald-900/50'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="mb-2">
                <div className={`text-sm font-bold font-devanagari ${
                  isNight ? 'text-emerald-300' : 'text-emerald-950'
                }`}>
                  {t.amritaKala}
                </div>
                <div className={`text-xs mt-0.5 ${isNight ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {t.amritaKalaDesc}
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                {data.amrita_kala.map((a, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-mono font-bold border shadow-2xs ${
                      isNight
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {a.start} – {a.end}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vedic Guidance Note */}
        <div className={`mt-5 rounded-xl p-4 text-xs border ${
          isNight
            ? 'bg-indigo-950/40 border-indigo-900/50 text-slate-300'
            : 'bg-amber-50/40 border-amber-200/60 text-stone-600'
        }`}>
          <p className="leading-relaxed">
            <strong>{lang === 'sa' ? 'सूचना:' : lang === 'hi' ? 'विशेष:' : 'Note:'}</strong>{' '}
            {lang === 'sa'
              ? 'सर्वे मुहूर्ताः स्थानीयसूर्योदयानुसारं प्रत्यक्षदृग्गणितेन साधिताः।'
              : lang === 'hi'
              ? 'समस्त मुहूर्त काल स्थानीय सूर्योदय, सूर्यास्त व दिनमान के प्रत्यक्ष दृग्गणित पर आधारित हैं।'
              : `All Muhūrta spans are astronomically calculated based on exact civil sunrise and day/night length in ${data.city}.`}
          </p>
        </div>
      </div>
    </div>
  );
};

