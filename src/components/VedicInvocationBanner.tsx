import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Language } from '../i18n';

interface VedicInvocationBannerProps {
  lang: Language;
}

export const VedicInvocationBanner: React.FC<VedicInvocationBannerProps> = ({ lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      id="vedic-invocation-banner"
      className="relative overflow-hidden glass-card rounded-[1.5rem] p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 shadow-xs font-serif-vedic text-base font-black">
            ॐ
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900/80 font-sans">
              {lang === 'sa'
                ? '॥ श्रीगणेशाय नमः • श्रीसूर्याय नमः ॥'
                : lang === 'hi'
                ? '॥ श्री गणेशाय नमः • श्री सूर्य देवाय नमः ॥'
                : '॥ Śrī Gaṇeśāya Namaḥ • Śrī Sūryāya Namaḥ ॥'}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-stone-900 font-serif-vedic tracking-wide mt-0.5">
              ॥ तिथेश्च श्रियमाप्नोति वारादायुष्यवर्धनम् । नक्षत्राद्धरते पापं योगाद्रोगनिवारणम् ॥
            </div>
          </div>
        </div>

        <button
          type="button"
          id="toggle-invocation-details"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center space-x-1 self-start sm:self-auto rounded-lg border border-amber-300/80 bg-white/80 px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-white transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          <span>
            {isExpanded
              ? lang === 'sa'
                ? 'संक्षिप्तम्'
                : lang === 'hi'
                ? 'संक्षिप्त करें'
                : 'Hide Significance'
              : lang === 'sa'
                ? 'पञ्चाङ्गफलम्'
                : lang === 'hi'
                ? 'पञ्चाङ्ग फल जानें'
                : 'Panchanga Phala'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-stone-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-amber-200/70 pt-3.5 text-xs text-stone-700 space-y-2.5 font-sans animate-in fade-in duration-200">
          <div className="font-serif-vedic text-stone-900 font-bold text-sm">
            ॥ करणात् कार्यसिद्धिः स्यात् पञ्चाङ्गस्य फलं महत् । एतेषां श्रवणान्नित्यं गङ्गास्नानफलं लभेत् ॥
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-950 font-serif-vedic block">१. तिथि (Tithi)</span>
              <span className="text-[11px] text-stone-600 mt-0.5 block">
                {lang === 'sa' ? 'श्रियमाप्नोति (लक्ष्मी-वैभवप्राप्तिः)' : lang === 'hi' ? 'लक्ष्मी व समृद्धि की प्राप्ति' : 'Confers Wealth & Prosperity (Lakṣmī)'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-950 font-serif-vedic block">२. वार (Vāra)</span>
              <span className="text-[11px] text-stone-600 mt-0.5 block">
                {lang === 'sa' ? 'आयुष्यवर्धनम् (दीर्घायुः)' : lang === 'hi' ? 'आयु एवं तेज में वृद्धि' : 'Augments Longevity & Vital Energy'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-950 font-serif-vedic block">३. नक्षत्र (Nakṣatra)</span>
              <span className="text-[11px] text-stone-600 mt-0.5 block">
                {lang === 'sa' ? 'हरते पापम् (पापक्षयः)' : lang === 'hi' ? 'पाप व नकारात्मक कर्मों का नाश' : 'Destroys Negative Karma & Sins'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-950 font-serif-vedic block">४. योग (Yoga)</span>
              <span className="text-[11px] text-stone-600 mt-0.5 block">
                {lang === 'sa' ? 'रोगनिवारणम् (आरोग्यम्)' : lang === 'hi' ? 'रोगों का निवारण एवं स्वास्थ्य' : 'Dispels Disease & Bestows Health'}
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-950 font-serif-vedic block">५. करण (Karaṇa)</span>
              <span className="text-[11px] text-stone-600 mt-0.5 block">
                {lang === 'sa' ? 'कार्यसिद्धिः (सफलता)' : lang === 'hi' ? 'मनोवांछित कार्यों में सफलता' : 'Ensures Success in Undertakings'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
