import React from 'react';
import { X, Printer } from 'lucide-react';
import type { PanchangaResponse } from '../types';
import {
  type Language,
  translations,
  getLocalizedTithi,
  getLocalizedNakshatra,
  getLocalizedYoga,
  getLocalizedKarana,
  getLocalizedVaara,
  getLocalizedMasa,
  getLocalizedRasi,
} from '../i18n';

interface PrintablePanchangaProps {
  data: PanchangaResponse;
  onClose: () => void;
  lang: Language;
}

export const PrintablePanchanga: React.FC<PrintablePanchangaProps> = ({ data, onClose, lang }) => {
  const t = translations[lang];

  const handlePrint = () => {
    window.print();
  };

  const localizedVaara = getLocalizedVaara(data.vaara, lang);
  const localizedMasa = getLocalizedMasa(data.masa, lang);

  return (
    <div
      id="printable-panchanga-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="printable-panchanga-dialog"
        className="relative w-full max-w-3xl rounded-2xl border border-stone-200 bg-white shadow-2xl my-8"
      >
        {/* Modal Toolbar (hidden during actual browser print) */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-3 bg-stone-50 print:hidden rounded-t-2xl">
          <span className="text-sm font-bold text-stone-800 font-devanagari">
            {t.printTitle} ({data.date})
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              id="confirm-print-btn"
              className="inline-flex items-center rounded-xl bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 shadow-xs"
            >
              <Printer className="mr-1.5 h-4 w-4" /> {t.printAction}
            </button>
            <button
              onClick={onClose}
              id="close-print-modal-btn"
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* The Printable Page Sheet */}
        <div id="print-sheet-content" className="p-8 font-serif-vedic text-stone-900 bg-white">
          {/* Sheet Header */}
          <div className="text-center border-b-2 border-amber-900/40 pb-4">
            <div className="text-xs uppercase tracking-widest text-amber-900 font-bold">
              {t.invocation}
            </div>
            <h1 className="text-2xl font-black mt-1 tracking-tight font-serif-vedic">
              {t.appName}
            </h1>
            <p className="text-xs text-stone-600 font-sans mt-0.5">
              {data.city} ({data.coordinate_label}) • {data.timezone}
            </p>
            <div className="mt-2 text-sm font-bold font-devanagari">
              {data.date} • {localizedVaara}
            </div>
          </div>

          {/* Vedic Hierarchy Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-b border-stone-200 pb-4">
            <div>
              <span className="text-stone-500">{t.samvatsara}:</span>{' '}
              <span className="font-bold">{data.samvatsara}</span>
            </div>
            <div>
              <span className="text-stone-500">{t.masa}:</span>{' '}
              <span className="font-bold">{localizedMasa} ({data.paksha} Pakṣa)</span>
            </div>
            <div>
              <span className="text-stone-500">{t.ayana}:</span>{' '}
              <span className="font-bold">{data.ayana} ({data.drik_ayana})</span>
            </div>
            <div>
              <span className="text-stone-500">{t.rtu}:</span>{' '}
              <span className="font-bold">{data.rtu} ({data.drik_rtu})</span>
            </div>
            <div>
              <span className="text-stone-500">{t.sunSign}:</span>{' '}
              <span className="font-bold">{getLocalizedRasi(data.sun_rasi || '', lang)}</span>
            </div>
            <div>
              <span className="text-stone-500">{t.moonSign}:</span>{' '}
              <span className="font-bold">{getLocalizedRasi(data.moon_rasi || '', lang)}</span>
            </div>
          </div>

          {/* Sun & Moon Cycle */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-xs border-b border-stone-200 pb-4 text-center font-sans">
            <div>
              <div className="text-stone-500 text-[11px]">{t.sunrise}</div>
              <div className="font-bold font-mono text-sm">{data.sunrise}</div>
            </div>
            <div>
              <div className="text-stone-500 text-[11px]">{t.sunset}</div>
              <div className="font-bold font-mono text-sm">{data.sunset}</div>
            </div>
            <div>
              <div className="text-stone-500 text-[11px]">{t.moonrise}</div>
              <div className="font-bold font-mono text-sm">{data.moonrise || '—'}</div>
            </div>
            <div>
              <div className="text-stone-500 text-[11px]">{t.moonset}</div>
              <div className="font-bold font-mono text-sm">{data.moonset || '—'}</div>
            </div>
          </div>

          {/* Pañca Aṅgāni Section */}
          <div className="mt-5 border-b border-stone-200 pb-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900 mb-3">
              {t.limbsTitle}
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-bold text-stone-700">{t.tithi}:</span>
                <span className="font-semibold text-right">
                  {data.tithi?.map((seg) => {
                    const loc = seg.number ? getLocalizedTithi(seg.number, lang) : seg.name;
                    return `${loc}${seg.ends ? ` (up to ${seg.ends})` : ''}`;
                  }).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-bold text-stone-700">{t.nakshatra}:</span>
                <span className="font-semibold text-right">
                  {data.nakshatra?.map((seg) => {
                    const loc = seg.number ? getLocalizedNakshatra(seg.number, seg.name, lang) : seg.name;
                    return `${loc}${seg.ends ? ` (up to ${seg.ends})` : ''}`;
                  }).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-bold text-stone-700">{t.yoga}:</span>
                <span className="font-semibold text-right">
                  {data.yoga?.map((seg) => {
                    const loc = seg.number ? getLocalizedYoga(seg.number, seg.name, lang) : seg.name;
                    return `${loc}${seg.ends ? ` (up to ${seg.ends})` : ''}`;
                  }).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="font-bold text-stone-700">{t.karana}:</span>
                <span className="font-semibold text-right">
                  {data.karana?.map((seg) => {
                    const loc = seg.number ? getLocalizedKarana(seg.number, seg.name, lang) : seg.name;
                    return `${loc}${seg.ends ? ` (up to ${seg.ends})` : ''}`;
                  }).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold text-stone-700">{t.vaara}:</span>
                <span className="font-semibold">{localizedVaara}</span>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <div className="font-bold text-rose-800 uppercase tracking-wider mb-2">
                {t.inauspiciousTimings}
              </div>
              <div className="space-y-1">
                <div>Rāhu Kāla: <span className="font-mono font-bold">{data.rahu_kala?.start} - {data.rahu_kala?.end}</span></div>
                {data.yamaganda && <div>Yamagaṇḍa: <span className="font-mono">{data.yamaganda.start} - {data.yamaganda.end}</span></div>}
                {data.gulika_kala && <div>Gulikā: <span className="font-mono">{data.gulika_kala.start} - {data.gulika_kala.end}</span></div>}
              </div>
            </div>
            <div>
              <div className="font-bold text-emerald-800 uppercase tracking-wider mb-2">
                {t.auspiciousTimings}
              </div>
              <div className="space-y-1">
                {data.abhijit_muhurta && <div>Abhijit: <span className="font-mono font-bold">{data.abhijit_muhurta.start} - {data.abhijit_muhurta.end}</span></div>}
                {data.brahma_muhurta && <div>Brahma Muhūrta: <span className="font-mono">{data.brahma_muhurta.start} - {data.brahma_muhurta.end}</span></div>}
              </div>
            </div>
          </div>

          {/* Eras footer */}
          <div className="mt-6 pt-3 border-t-2 border-stone-800 flex justify-between text-[11px] text-stone-500 font-sans">
            <div>Śaka: {data.saka_year} • Vikrama: {data.vikrama_year} • Kali: {data.kali_year}</div>
            <div>Ayanāṁśa: {data.ayanamsa} ({data.ayanamsa_degrees?.toFixed(4)}°)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
