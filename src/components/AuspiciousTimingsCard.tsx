import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, LayoutGrid, List } from "lucide-react";
import type { PanchangaResponse, AppTheme } from "../types";
import { type Language, translations } from "../i18n";

interface AuspiciousTimingsCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const AuspiciousTimingsCard: React.FC<AuspiciousTimingsCardProps> = ({
  data,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div id="auspicious-timings-section" className="space-y-6">
      {/* View Mode Switcher Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif-vedic font-bold text-lg sm:text-xl text-stone-900 dark:text-amber-100">
            {lang === "hi"
              ? "दैनिक मुहूर्त एवं काल विभाजन"
              : "Daily Muhurtas & Cosmic Timing Spans"}
          </h3>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
            {lang === "hi"
              ? "स्थानीय सूर्योदय-सूर्यास्त आधारित शुभ एवं अशुभ काल"
              : "Calculated from exact local sunrise and sunset divisions"}
          </p>
        </div>

        <div className="flex items-center rounded-lg p-0.5 bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-xs"
                : "text-stone-500 dark:text-slate-400 hover:text-stone-900"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-xs"
                : "text-stone-500 dark:text-slate-400 hover:text-stone-900"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        /* ─── MASTER REFERENCE LIST DESIGN ─────────────────────── */
        <div className="space-y-6">
          {/* Inauspicious Periods Block */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>
                {t.inauspiciousTimings} ({lang === "hi" ? "अशुभ काल" : "Aśubha Kāla"})
              </span>
            </div>

            <div
              className={`vedic-card divide-y ${
                isNight
                  ? "bg-[#12182B] divide-indigo-950/80 border-indigo-900/40"
                  : "bg-white divide-stone-100 border-[#E4E2DD]"
              }`}
            >
              {/* Rahu Kala */}
              <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                      {t.rahuKala}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-slate-400">
                      {t.rahuKalaDesc}
                    </div>
                  </div>
                </div>
                <div className="font-serif-vedic font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                  {data.rahu_kala ? `${data.rahu_kala.start} – ${data.rahu_kala.end}` : "—"}
                </div>
              </div>

              {/* Yamaganda */}
              {data.yamaganda && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.yamaganda}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.yamagandaDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                    {data.yamaganda.start} – {data.yamaganda.end}
                  </div>
                </div>
              )}

              {/* Gulika Kala */}
              {data.gulika_kala && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.gulikaKala}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.gulikaKalaDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-stone-800 dark:text-slate-200">
                    {data.gulika_kala.start} – {data.gulika_kala.end}
                  </div>
                </div>
              )}

              {/* Durmuhurta */}
              {data.durmuhurta && data.durmuhurta.length > 0 && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.durmuhurta}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.durmuhurtaDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300 text-right">
                    {data.durmuhurta.map((dm) => `${dm.start} – ${dm.end}`).join(", ")}
                  </div>
                </div>
              )}

              {/* Varjyam */}
              {data.varjyam && data.varjyam.length > 0 && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.varjyam}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.varjyamDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300 text-right">
                    {data.varjyam.map((v) => `${v.start} – ${v.end}`).join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auspicious Periods Block */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>
                {t.auspiciousTimings} ({lang === "hi" ? "शुभ काल" : "Śubha Kāla"})
              </span>
            </div>

            <div
              className={`vedic-card divide-y ${
                isNight
                  ? "bg-[#12182B] divide-indigo-950/80 border-indigo-900/40"
                  : "bg-white divide-stone-100 border-[#E4E2DD]"
              }`}
            >
              {/* Brahma Muhurta */}
              {data.brahma_muhurta && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.brahmaMuhurta}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.brahmaMuhurtaDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                    {data.brahma_muhurta.start} – {data.brahma_muhurta.end}
                  </div>
                </div>
              )}

              {/* Abhijit Muhurta */}
              {data.abhijit_muhurta && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.abhijit}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.abhijitDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                    {data.abhijit_muhurta.start} – {data.abhijit_muhurta.end}
                  </div>
                </div>
              )}

              {/* Amrita Kala */}
              {data.amrita_kala && data.amrita_kala.length > 0 && (
                <div className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {t.amritaKala}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-slate-400">
                        {t.amritaKalaDesc}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif-vedic font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 text-right">
                    {data.amrita_kala.map((a) => `${a.start} – ${a.end}`).join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── GRID CARD DESIGN ───────────────────────────────── */
        <div className="space-y-6">
          {/* Inauspicious Cards */}
          <div
            className={`rounded-2xl p-5 sm:p-6 transition-colors border ${
              isNight
                ? "bg-[#12182B] border-rose-950/60 text-slate-100"
                : "bg-white border-rose-200"
            }`}
          >
            <div className="flex items-center space-x-2.5 border-b pb-3 border-rose-100 dark:border-rose-900/40 mb-4">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <h4 className="font-serif-vedic font-bold text-base text-rose-900 dark:text-rose-200">
                {t.inauspiciousTimings}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Rahu Kala */}
              <div className="p-3.5 rounded-xl border bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50">
                <div className="font-bold text-xs text-rose-900 dark:text-rose-300">
                  {t.rahuKala}
                </div>
                <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                  {t.rahuKalaDesc}
                </div>
                <div className="font-mono font-bold text-xs mt-2 text-rose-900 dark:text-rose-200">
                  {data.rahu_kala ? `${data.rahu_kala.start} – ${data.rahu_kala.end}` : "—"}
                </div>
              </div>

              {/* Yamaganda */}
              {data.yamaganda && (
                <div className="p-3.5 rounded-xl border bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50">
                  <div className="font-bold text-xs text-amber-900 dark:text-amber-300">
                    {t.yamaganda}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    {t.yamagandaDesc}
                  </div>
                  <div className="font-mono font-bold text-xs mt-2 text-amber-900 dark:text-amber-200">
                    {data.yamaganda.start} – {data.yamaganda.end}
                  </div>
                </div>
              )}

              {/* Gulika Kala */}
              {data.gulika_kala && (
                <div className="p-3.5 rounded-xl border bg-stone-50 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800">
                  <div className="font-bold text-xs text-stone-900 dark:text-slate-200">
                    {t.gulikaKala}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                    {t.gulikaKalaDesc}
                  </div>
                  <div className="font-mono font-bold text-xs mt-2 text-stone-900 dark:text-slate-100">
                    {data.gulika_kala.start} – {data.gulika_kala.end}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auspicious Cards */}
          <div
            className={`rounded-2xl p-5 sm:p-6 transition-colors border ${
              isNight
                ? "bg-[#12182B] border-emerald-950/60 text-slate-100"
                : "bg-white border-emerald-200"
            }`}
          >
            <div className="flex items-center space-x-2.5 border-b pb-3 border-emerald-100 dark:border-emerald-900/40 mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h4 className="font-serif-vedic font-bold text-base text-emerald-900 dark:text-emerald-200">
                {t.auspiciousTimings}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Brahma Muhurta */}
              {data.brahma_muhurta && (
                <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50">
                  <div className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                    {t.brahmaMuhurta}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {t.brahmaMuhurtaDesc}
                  </div>
                  <div className="font-mono font-bold text-xs mt-2 text-emerald-900 dark:text-emerald-200">
                    {data.brahma_muhurta.start} – {data.brahma_muhurta.end}
                  </div>
                </div>
              )}

              {/* Abhijit Muhurta */}
              {data.abhijit_muhurta && (
                <div className="p-3.5 rounded-xl border bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50">
                  <div className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                    {t.abhijit}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {t.abhijitDesc}
                  </div>
                  <div className="font-mono font-bold text-xs mt-2 text-emerald-900 dark:text-emerald-200">
                    {data.abhijit_muhurta.start} – {data.abhijit_muhurta.end}
                  </div>
                </div>
              )}

              {/* Amrita Kala */}
              {data.amrita_kala && data.amrita_kala.length > 0 && (
                <div className="p-3.5 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40">
                  <div className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                    {t.amritaKala}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {t.amritaKalaDesc}
                  </div>
                  <div className="font-mono font-bold text-xs mt-2 text-emerald-900 dark:text-emerald-200">
                    {data.amrita_kala.map((a) => `${a.start} – ${a.end}`).join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
