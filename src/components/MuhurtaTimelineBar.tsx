import React, { useState } from 'react';
import type { PanchangaResponse, TimingInterval } from '../types';
import type { Language } from '../i18n';
import { translations } from '../i18n';
import { Clock, Info } from 'lucide-react';

interface MuhurtaTimelineBarProps {
  data: PanchangaResponse;
  lang: Language;
}

interface TimelineSegment {
  name: string;
  startMins: number;
  endMins: number;
  type: 'auspicious' | 'inauspicious' | 'neutral' | 'solar';
  color: string;
  description: string;
}

export const MuhurtaTimelineBar: React.FC<MuhurtaTimelineBarProps> = ({ data, lang }) => {
  const [hoveredSegment, setHoveredSegment] = useState<TimelineSegment | null>(null);
  const t = translations[lang];

  const parseMins = (timeStr?: string | null): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const formatMins = (mins: number): string => {
    const h = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const segments: TimelineSegment[] = [];

  const addInterval = (
    interval: TimingInterval | undefined | null,
    name: string,
    type: 'auspicious' | 'inauspicious' | 'neutral',
    color: string,
    desc: string
  ) => {
    if (!interval || !interval.start || !interval.end) return;
    const s = parseMins(interval.start);
    const e = parseMins(interval.end);
    if (s == null || e == null) return;

    if (e >= s) {
      segments.push({ name, startMins: s, endMins: e, type, color, description: desc });
    } else {
      // wraps around midnight
      segments.push({ name, startMins: s, endMins: 1440, type, color, description: desc });
      segments.push({ name, startMins: 0, endMins: e, type, color, description: desc });
    }
  };

  // 1. Brahma Muhurta
  addInterval(
    data.brahma_muhurta,
    t.brahmaMuhurta,
    'auspicious',
    'bg-amber-400',
    t.brahmaMuhurtaDesc
  );

  // 2. Abhijit Muhurta
  addInterval(
    data.abhijit_muhurta,
    t.abhijit,
    'auspicious',
    'bg-emerald-500',
    t.abhijitDesc
  );

  // 3. Rahu Kala
  addInterval(
    data.rahu_kala,
    t.rahuKala,
    'inauspicious',
    'bg-rose-500',
    t.rahuKalaDesc
  );

  // 4. Yamaganda
  addInterval(
    data.yamaganda,
    t.yamaganda,
    'inauspicious',
    'bg-orange-500',
    t.yamagandaDesc
  );

  // 5. Gulika Kala
  addInterval(
    data.gulika_kala,
    t.gulikaKala,
    'inauspicious',
    'bg-purple-400',
    t.gulikaKalaDesc
  );

  // 6. Amrita Kala
  if (data.amrita_kala) {
    data.amrita_kala.forEach((ak, i) => {
      addInterval(ak, `${t.amritaKala} #${i + 1}`, 'auspicious', 'bg-teal-500', t.amritaKalaDesc);
    });
  }

  // 7. Durmuhurta
  if (data.durmuhurta) {
    data.durmuhurta.forEach((dm, i) => {
      addInterval(dm, `${t.durmuhurta} #${i + 1}`, 'inauspicious', 'bg-red-400', t.durmuhurtaDesc);
    });
  }

  // Calculate now in minutes
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const currentPosPercent = (currentMins / 1440) * 100;

  const sunriseMins = parseMins(data.sunrise);
  const sunsetMins = parseMins(data.sunset);

  return (
    <div
      id="muhurta-timeline-card"
      className="glass-card rounded-[1.5rem] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 font-serif-vedic">
              {lang === 'sa'
                ? '२४-होरात्मक मुहूर्तावलोकनम्'
                : lang === 'hi'
                ? '२४ घंटे का दृश्य मुहूर्त चक्र'
                : '24-Hour Muhūrta Visual Timeline'}
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              {lang === 'sa'
                ? 'सूर्योदयानुसारं शुभाशुभमुहूर्तानां कालमानम्'
                : lang === 'hi'
                ? 'शुभ व अशुभ मुहूर्तों का स्पष्ट कालमान'
                : 'Interactive diurnal timeline with exact solar transition and periods'}
            </p>
          </div>
        </div>

        {/* Hover detail box */}
        <div className="text-xs font-mono text-stone-700 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 min-h-[32px] flex items-center">
          {hoveredSegment ? (
            <span className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${hoveredSegment.color}`}></span>
              <strong>{hoveredSegment.name}:</strong> {formatMins(hoveredSegment.startMins)} –{' '}
              {formatMins(hoveredSegment.endMins)} ({hoveredSegment.description.slice(0, 35)}...)
            </span>
          ) : (
            <span className="text-stone-400 font-sans text-[11px] flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              {lang === 'sa'
                ? 'विवरणं द्रष्टुं रेखाखण्डे स्पर्शं कुर्वन्तु'
                : lang === 'hi'
                ? 'विवरण देखने हेतु टाइमलाइन पर माउस ले जाएं'
                : 'Hover or tap segments on timeline to inspect'}
            </span>
          )}
        </div>
      </div>

      {/* The Timeline Track */}
      <div className="mt-5 space-y-2">
        {/* Time markers: 00:00, 06:00, 12:00, 18:00, 24:00 */}
        <div className="flex justify-between text-[11px] font-mono text-stone-400 px-0.5">
          <span>00:00 (Night)</span>
          <span>06:00 (Dawn)</span>
          <span>12:00 (Midday)</span>
          <span>18:00 (Dusk)</span>
          <span>24:00 (Midnight)</span>
        </div>

        {/* Base Track */}
        <div className="relative h-9 w-full rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shadow-inner flex items-center">
          {/* Day / Night background split */}
          {sunriseMins != null && sunsetMins != null && (
            <div
              className="absolute top-0 bottom-0 bg-amber-100/40 border-l border-r border-amber-300/60"
              style={{
                left: `${(sunriseMins / 1440) * 100}%`,
                width: `${((sunsetMins - sunriseMins) / 1440) * 100}%`,
              }}
              title={`Daytime: ${data.sunrise} to ${data.sunset}`}
            />
          )}

          {/* Render segments */}
          {segments.map((seg, idx) => {
            const leftPct = (seg.startMins / 1440) * 100;
            const widthPct = Math.max(1.2, ((seg.endMins - seg.startMins) / 1440) * 100);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`absolute top-1 bottom-1 rounded-md cursor-pointer transition-all hover:scale-y-110 hover:shadow-md ${seg.color} opacity-90 hover:opacity-100`}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  zIndex: seg.type === 'inauspicious' ? 10 : 8,
                }}
              />
            );
          })}

          {/* Sunrise needle */}
          {sunriseMins != null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-600 z-20 pointer-events-none"
              style={{ left: `${(sunriseMins / 1440) * 100}%` }}
              title={`Sunrise: ${data.sunrise}`}
            >
              <div className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-amber-600 shadow-xs" />
            </div>
          )}

          {/* Sunset needle */}
          {sunsetMins != null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-orange-600 z-20 pointer-events-none"
              style={{ left: `${(sunsetMins / 1440) * 100}%` }}
              title={`Sunset: ${data.sunset}`}
            >
              <div className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-orange-600 shadow-xs" />
            </div>
          )}

          {/* Real-time current needle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-indigo-900 z-30 pointer-events-none"
            style={{ left: `${currentPosPercent}%` }}
          >
            <div className="absolute -top-1.5 -left-1 h-3 w-3 rounded-full bg-indigo-900 ring-2 ring-white shadow-md animate-ping" />
            <div className="absolute -top-1.5 -left-1 h-3 w-3 rounded-full bg-indigo-900 ring-2 ring-white shadow-md" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 pt-2 border-t border-stone-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>Abhijit / Amṛta ({lang === 'sa' ? 'शुभम्' : lang === 'hi' ? 'शुभ' : 'Auspicious'})</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span>Rāhu Kāla ({lang === 'sa' ? 'वर्ज्यम्' : lang === 'hi' ? 'अशुभ' : 'Avoid'})</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
            <span>Yamagaṇḍa</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400"></span>
            <span>Gulikā</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <span>Brahma Muhūrta</span>
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-900 font-bold">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-900"></span>
          <span>Current Time Indicator</span>
        </div>
      </div>
    </div>
  );
};
