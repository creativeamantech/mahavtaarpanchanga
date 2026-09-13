import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, ShieldCheck, Sun, Moon, AlertCircle } from 'lucide-react';
import type { PanchangaResponse, TimingInterval } from '../types';
import { type Language, translations, getLocalizedChoghadiya } from '../i18n';

interface CurrentMuhurtaWidgetProps {
  data: PanchangaResponse;
  lang: Language;
}

export const CurrentMuhurtaWidget: React.FC<CurrentMuhurtaWidgetProps> = ({ data, lang }) => {
  const [now, setNow] = useState<Date>(new Date());
  const t = translations[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse "HH:MM:SS" or "HH:MM" into minutes from midnight
  const parseTimeToMinutes = (timeStr?: string | null): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parts.length > 2 ? parseInt(parts[2], 10) : 0;
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m + s / 60;
  };

  // Get current city time in minutes from midnight
  // Use data.timezone if available
  const getCityCurrentMinutes = (): { totalMinutes: number; timeFormatted: string; isToday: boolean } => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: data.timezone || 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat([], options);
      const timeStr = formatter.format(now);
      const [h, m, s] = timeStr.split(':').map((v) => parseInt(v, 10));
      const total = h * 60 + m + (s || 0) / 60;

      // Check if Panchanga date equals today in that timezone
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: data.timezone || 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      };
      const dateFormatter = new Intl.DateTimeFormat([], dateOptions);
      // Returns DD/MM/YYYY or similar depending on locale
      const todayInTzParts = dateFormatter.formatToParts(now);
      const dayVal = todayInTzParts.find((p) => p.type === 'day')?.value || '';
      const monthVal = todayInTzParts.find((p) => p.type === 'month')?.value || '';
      const yearVal = todayInTzParts.find((p) => p.type === 'year')?.value || '';
      const todayFormatted = `${dayVal}/${monthVal}/${yearVal}`;
      const isToday = data.date === todayFormatted;

      return { totalMinutes: total, timeFormatted: timeStr, isToday };
    } catch {
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const total = h * 60 + m + s / 60;
      const str = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      return { totalMinutes: total, timeFormatted: str, isToday: true };
    }
  };

  const { totalMinutes: currentMins, timeFormatted: currentTimeString, isToday } = getCityCurrentMinutes();

  const sunriseMins = parseTimeToMinutes(data.sunrise);
  const sunsetMins = parseTimeToMinutes(data.sunset);

  // Calculate Dina Ghati (1 day = 60 ghatis; 1 ghati = 24 minutes; 1 vighati = 24 seconds)
  let ghatiDisplay = '—';
  if (sunriseMins != null && isToday) {
    let diffMins = currentMins - sunriseMins;
    if (diffMins < 0) {
      diffMins += 24 * 60; // pre-sunrise from previous day
    }
    const totalGhatis = diffMins / 24;
    const ghati = Math.floor(totalGhatis);
    const vighati = Math.floor((totalGhatis - ghati) * 60);
    ghatiDisplay = `${ghati} ${lang === 'sa' ? 'घटिका' : lang === 'hi' ? 'घटी' : 'Ghati'} ${vighati} ${lang === 'sa' ? 'विघटिका' : lang === 'hi' ? 'पल (विघटी)' : 'Pala'}`;
  }

  // Check if an interval is currently active
  const isIntervalActive = (interval?: TimingInterval | null): { active: boolean; remainingMins: number; progress: number } => {
    if (!interval || !interval.start || !interval.end) {
      return { active: false, remainingMins: 0, progress: 0 };
    }
    const startM = parseTimeToMinutes(interval.start);
    const endM = parseTimeToMinutes(interval.end);
    if (startM == null || endM == null) {
      return { active: false, remainingMins: 0, progress: 0 };
    }

    if (endM > startM) {
      if (currentMins >= startM && currentMins <= endM) {
        const total = endM - startM;
        const elapsed = currentMins - startM;
        return {
          active: true,
          remainingMins: Math.round(endM - currentMins),
          progress: Math.min(100, Math.max(0, (elapsed / total) * 100)),
        };
      }
    } else {
      // Crosses midnight
      if (currentMins >= startM || currentMins <= endM) {
        const total = (24 * 60 - startM) + endM;
        const elapsed = currentMins >= startM ? currentMins - startM : (24 * 60 - startM) + currentMins;
        const rem = currentMins >= startM ? (24 * 60 - currentMins) + endM : endM - currentMins;
        return {
          active: true,
          remainingMins: Math.round(rem),
          progress: Math.min(100, Math.max(0, (elapsed / total) * 100)),
        };
      }
    }
    return { active: false, remainingMins: 0, progress: 0 };
  };

  const isRahuActive = isIntervalActive(data.rahu_kala);
  const isYamaActive = isIntervalActive(data.yamaganda);
  const isGulikaActive = isIntervalActive(data.gulika_kala);
  const isAbhijitActive = isIntervalActive(data.abhijit_muhurta);
  const isBrahmaActive = isIntervalActive(data.brahma_muhurta);

  // Active Choghadiya
  const isDayTime =
    sunriseMins != null && sunsetMins != null && currentMins >= sunriseMins && currentMins < sunsetMins;

  const currentChoghadiyaList = isDayTime ? data.gauri_choghadiya_day : data.gauri_choghadiya_night;
  let activeChoghadiya: { item: any; remainingMins: number; progress: number } | null = null;

  if (currentChoghadiyaList) {
    for (const item of currentChoghadiyaList) {
      const check = isIntervalActive(item);
      if (check.active) {
        activeChoghadiya = { item, remainingMins: check.remainingMins, progress: check.progress };
        break;
      }
    }
  }

  const activeChoghadiyaLoc = activeChoghadiya
    ? getLocalizedChoghadiya(activeChoghadiya.item.name || '', lang)
    : null;

  return (
    <div
      id="current-muhurta-widget"
      className="glass-card rounded-[1.5rem] p-5 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Real-time clock & Ghati */}
        <div className="flex items-center space-x-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-900 border border-amber-300/70">
            <Clock className="h-5 w-5 animate-pulse text-amber-700" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-stone-900">
                {currentTimeString}
              </span>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {data.timezone?.split('/')[1]?.replace('_', ' ') || 'Local Time'}
              </span>
            </div>
            <div className="text-xs text-stone-600 flex items-center gap-2 mt-0.5 font-sans">
              <span className="font-semibold text-amber-900 font-devanagari">{ghatiDisplay}</span>
              <span>•</span>
              <span className="text-stone-400">
                {isDayTime ? (
                  <span className="inline-flex items-center text-amber-700">
                    <Sun className="h-3 w-3 mr-1" /> {lang === 'sa' ? 'दिनमानम्' : lang === 'hi' ? 'दिनमान' : 'Daytime'}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-indigo-700">
                    <Moon className="h-3 w-3 mr-1" /> {lang === 'sa' ? 'रात्रिमानम्' : lang === 'hi' ? 'रात्रिमान' : 'Nighttime'}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Special Muhurta Alert */}
        <div className="flex-1 max-w-md">
          {isRahuActive.active ? (
            <div className="flex items-center space-x-2.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs text-rose-950 shadow-2xs animate-pulse">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold font-devanagari">
                  {lang === 'sa' ? 'राहुकालः प्रवृत्तः' : lang === 'hi' ? 'राहु काल चल रहा है' : 'Rāhu Kāla Active'}
                </span>
                <span className="ml-1 text-rose-800">
                  ({isRahuActive.remainingMins} {lang === 'sa' ? 'निमेषाः अवशिष्टाः' : lang === 'hi' ? 'मिनट शेष' : 'mins remaining'})
                </span>
              </div>
            </div>
          ) : isAbhijitActive.active ? (
            <div className="flex items-center space-x-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-950 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold font-devanagari">
                  {lang === 'sa' ? 'अभिजित्मुहूर्तः प्रवृत्तः (परमशुभः)' : lang === 'hi' ? 'अभिजित् मुहूर्त सक्रिय (अति शुभ)' : 'Abhijit Muhūrta Active (Highly Auspicious)'}
                </span>
                <span className="ml-1 text-emerald-800">
                  ({isAbhijitActive.remainingMins} mins left)
                </span>
              </div>
            </div>
          ) : isYamaActive.active ? (
            <div className="flex items-center space-x-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs text-amber-950 shadow-2xs">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold font-devanagari">
                  {t.yamaganda}: {isYamaActive.remainingMins} mins left
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5 rounded-xl border border-stone-200/80 bg-stone-50/70 px-3.5 py-2 text-xs text-stone-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="font-semibold font-devanagari">
                  {lang === 'sa' ? 'सामान्य-शुभवेला' : lang === 'hi' ? 'सामान्य शुभ काल' : 'Regular Auspicious Window'}
                </span>
                <span className="ml-1 text-stone-500">
                  • {t.sunrise}: {data.sunrise} • {t.sunset}: {data.sunset}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Choghadiya Progress */}
        {activeChoghadiya && activeChoghadiyaLoc && (
          <div className="shrink-0 min-w-[220px] rounded-xl border border-stone-200 bg-stone-50/90 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    activeChoghadiyaLoc.natureType === 'auspicious'
                      ? 'bg-emerald-500'
                      : activeChoghadiyaLoc.natureType === 'inauspicious'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="font-bold font-devanagari text-stone-900">
                  {activeChoghadiyaLoc.name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                {activeChoghadiya.remainingMins}m left
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  activeChoghadiyaLoc.natureType === 'auspicious'
                    ? 'bg-emerald-500'
                    : activeChoghadiyaLoc.natureType === 'inauspicious'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${activeChoghadiya.progress}%` }}
              />
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <span>{activeChoghadiya.item.start}</span>
              <span className="font-sans font-medium text-stone-600 truncate ml-1 mr-1">
                {activeChoghadiyaLoc.nature}
              </span>
              <span>{activeChoghadiya.item.end}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
