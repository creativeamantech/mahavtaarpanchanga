import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { MonthSystem, MonthlyPanchangaDay } from '../types';
import { type Language, translations, getLocalizedVaara } from '../i18n';

interface MonthlyCalendarViewProps {
  currentDateStr: string;
  currentCity: string;
  monthSystem: MonthSystem;
  ayanamsa: string;
  onSelectDate: (dateStr: string) => void;
  lang: Language;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'
];

const MONTH_NAMES_SA = [
  'जनवरी (मासः)', 'फ़रवरी (मासः)', 'मार्च (मासः)', 'अप्रैल (मासः)', 'मई (मासः)', 'जून (मासः)',
  'जुलाई (मासः)', 'अगस्त (मासः)', 'सितम्बर (मासः)', 'अक्टूबर (मासः)', 'नवम्बर (मासः)', 'दिसम्बर (मासः)'
];

const WEEKDAYS: Record<Language, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  sa: ['रविवासरः', 'सोमवासरः', 'मङ्गलवासरः', 'बुधवासरः', 'गुरुवासरः', 'शुक्रवासरः', 'शनिवासरः'],
};

const parseDateString = (str: string): { year: number; month: number; day: number } => {
  if (!str) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  if (str.includes('/')) {
    const [d, m, y] = str.split('/').map((v) => parseInt(v, 10));
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, month: m, day: d };
    }
  }
  if (str.includes('-')) {
    const [y, m, d] = str.split('-').map((v) => parseInt(v, 10));
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, month: m, day: d };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  currentDateStr,
  currentCity,
  monthSystem,
  ayanamsa,
  onSelectDate,
  lang,
}) => {
  const t = translations[lang];

  const parsed = parseDateString(currentDateStr);
  const [year, setYear] = useState<number>(parsed.year);
  const [month, setMonth] = useState<number>(parsed.month);
  const [days, setDays] = useState<MonthlyPanchangaDay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'special' | 'sukla' | 'krishna'>('all');
  const [inspectedDay, setInspectedDay] = useState<MonthlyPanchangaDay | null>(null);

  // Sync year/month when currentDateStr changes
  useEffect(() => {
    const p = parseDateString(currentDateStr);
    if (p.year !== year || p.month !== month) {
      setYear(p.year);
      setMonth(p.month);
    }
  }, [currentDateStr]);

  useEffect(() => {
    let isCancelled = false;
    async function loadMonth() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/panchanga/month?year=${year}&month=${month}&city=${encodeURIComponent(
            currentCity
          )}&month_system=${monthSystem}&ayanamsa=${ayanamsa}`
        );
        if (!res.ok) throw new Error('Failed to load month data');
        const json = await res.json();
        if (!isCancelled && json.days) {
          setDays(json.days);
          // Set initial inspected day matching currentDateStr or day 1
          const match = json.days.find((d: MonthlyPanchangaDay) => d.date === currentDateStr);
          setInspectedDay(match || json.days[0] || null);
        }
      } catch (err) {
        console.error('Error fetching monthly panchanga:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMonth();
    return () => {
      isCancelled = true;
    };
  }, [year, month, currentCity, monthSystem, ayanamsa, currentDateStr]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  const monthNames = lang === 'sa' ? MONTH_NAMES_SA : lang === 'hi' ? MONTH_NAMES_HI : MONTH_NAMES_EN;
  const firstDayWeekday = new Date(year, month - 1, 1).getDay();

  return (
    <div
      id="monthly-calendar-container"
      className="glass-card rounded-[1.5rem] p-6 sm:p-8 space-y-6"
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300/60">
              <CalendarIcon className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif-vedic">
                {monthNames[month - 1]} {year}
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                {t.monthlySub} • {currentCity}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills & Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              id="filter-all"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-stone-950 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {lang === 'sa' ? 'सर्वे' : lang === 'hi' ? 'सभी दिन' : 'All'}
            </button>
            <button
              type="button"
              id="filter-special"
              onClick={() => setFilterMode('special')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'special'
                  ? 'bg-white text-amber-950 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {lang === 'sa' ? 'पर्व/एकादशी' : lang === 'hi' ? 'पर्व व एकादशी' : 'Vratas & Festivals'}
            </button>
            <button
              type="button"
              id="filter-sukla"
              onClick={() => setFilterMode('sukla')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'sukla'
                  ? 'bg-white text-amber-950 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Śukla (शुक्ल)
            </button>
            <button
              type="button"
              id="filter-krishna"
              onClick={() => setFilterMode('krishna')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'krishna'
                  ? 'bg-white text-indigo-950 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Kṛṣṇa (कृष्ण)
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-stone-700 hover:bg-stone-100 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              id="current-month-btn"
              onClick={handleTodayMonth}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              {t.today}
            </button>
            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-stone-700 hover:bg-stone-100 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-sm text-stone-500">
          Calculating observational astronomical ephemeris for {monthNames[month - 1]} {year}...
        </div>
      ) : (
        <div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-stone-200 text-center text-xs font-bold uppercase tracking-wider text-stone-700 pb-2.5 font-sans">
            {WEEKDAYS[lang].map((dayName, idx) => (
              <div key={idx} className={idx === 0 ? 'text-rose-700' : ''}>
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b border-r border-stone-200">
            {/* Empty slots for days before 1st of month */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[105px] border-t border-l border-stone-100 bg-stone-50/40 p-2"
              />
            ))}

            {/* Day Cells */}
            {days.map((dayData) => {
              const isSelected = dayData.date === currentDateStr;
              const isInspected = inspectedDay?.date === dayData.date;
              const isSunday = new Date(year, month - 1, dayData.day).getDay() === 0;

              const isEkadashi =
                (dayData.tithi || '').toLowerCase().includes('ekādaśī') ||
                (dayData.tithi || '').includes('एकादशी');
              const isPurnima =
                (dayData.tithi || '').toLowerCase().includes('pūrṇimā') ||
                (dayData.tithi || '').includes('पूर्णिमा');
              const isAmavasya =
                (dayData.tithi || '').toLowerCase().includes('amāvāsyā') ||
                (dayData.tithi || '').includes('अमावस्या');

              const isSukla = dayData.paksha === 'Śukla';

              // Filter matching
              if (filterMode === 'special' && !isEkadashi && !isPurnima && !isAmavasya) {
                return (
                  <div
                    key={dayData.day}
                    className="min-h-[105px] border-t border-l border-stone-100 bg-stone-50/20 p-2 opacity-30 cursor-not-allowed"
                  >
                    <span className="text-xs text-stone-400">{dayData.day}</span>
                  </div>
                );
              }
              if (filterMode === 'sukla' && !isSukla) {
                return (
                  <div
                    key={dayData.day}
                    className="min-h-[105px] border-t border-l border-stone-100 bg-stone-50/20 p-2 opacity-30 cursor-not-allowed"
                  >
                    <span className="text-xs text-stone-400">{dayData.day}</span>
                  </div>
                );
              }
              if (filterMode === 'krishna' && isSukla) {
                return (
                  <div
                    key={dayData.day}
                    className="min-h-[105px] border-t border-l border-stone-100 bg-stone-50/20 p-2 opacity-30 cursor-not-allowed"
                  >
                    <span className="text-xs text-stone-400">{dayData.day}</span>
                  </div>
                );
              }

              return (
                <div
                  key={dayData.day}
                  id={`calendar-cell-${dayData.day}`}
                  onClick={() => {
                    setInspectedDay(dayData);
                  }}
                  onDoubleClick={() => {
                    onSelectDate(dayData.date);
                  }}
                  className={`min-h-[105px] border-t border-l border-stone-200 p-2 text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                    isInspected
                      ? 'bg-amber-100/70 ring-2 ring-amber-600 ring-inset z-10 shadow-xs'
                      : isSelected
                      ? 'bg-amber-50 ring-1 ring-amber-400 ring-inset'
                      : isPurnima
                      ? 'bg-amber-50/50 hover:bg-amber-100/40'
                      : isAmavasya
                      ? 'bg-stone-100/70 hover:bg-stone-200/50'
                      : isEkadashi
                      ? 'bg-emerald-50/50 hover:bg-emerald-100/40'
                      : 'bg-white hover:bg-amber-50/40'
                  }`}
                >
                  {/* Top: Day number & Special Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-extrabold ${
                        isInspected
                          ? 'text-amber-950 font-black'
                          : isSunday
                          ? 'text-rose-700'
                          : 'text-stone-900'
                      }`}
                    >
                      {dayData.day}
                    </span>

                    <div className="flex items-center space-x-1">
                      {isPurnima && (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-amber-600 shadow-2xs"
                          title="Pūrṇimā (Full Moon)"
                        />
                      )}
                      {isAmavasya && (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-stone-800 border border-stone-600 shadow-2xs"
                          title="Amāvāsyā (New Moon)"
                        />
                      )}
                      {isEkadashi && (
                        <span
                          className="h-2.5 w-2.5 rotate-45 bg-emerald-600 shadow-2xs"
                          title="Ekādaśī Vrata"
                        />
                      )}
                      <span className="text-[10px] text-stone-400 font-mono">
                        {dayData.sunrise?.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Tithi & Nakshatra */}
                  <div className="my-1 space-y-0.5">
                    <div
                      className={`text-xs font-bold truncate ${
                        isPurnima
                          ? 'text-amber-900 font-black'
                          : isAmavasya
                          ? 'text-stone-900 font-black'
                          : isEkadashi
                          ? 'text-emerald-900 font-black'
                          : 'text-amber-950'
                      }`}
                      title={dayData.tithi}
                    >
                      {dayData.tithi
                        ?.replace('Śukla pakṣa ', 'Ś. ')
                        ?.replace('Kṛṣṇa pakṣa ', 'K. ')
                        ?.replace('शुक्ल पक्ष ', 'शु. ')
                        ?.replace('कृष्ण पक्ष ', 'कृ. ')}
                    </div>
                    <div
                      className="text-[11px] text-stone-600 truncate font-devanagari"
                      title={dayData.nakshatra}
                    >
                      {dayData.nakshatra}
                    </div>
                  </div>

                  {/* Bottom: Vaara & Rahu */}
                  <div className="text-[10px] text-stone-400 flex items-center justify-between border-t border-stone-100/90 pt-1 font-mono">
                    <span className="truncate">{dayData.vaara?.slice(0, 4)}</span>
                    {dayData.rahu_kala && (
                      <span
                        className="text-rose-600 font-semibold truncate"
                        title={`Rāhu: ${dayData.rahu_kala.start}-${dayData.rahu_kala.end}`}
                      >
                        R: {dayData.rahu_kala.start?.slice(0, 5)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Day Details Preview Panel */}
      {inspectedDay && (
        <div
          id="calendar-inspected-day-card"
          className="rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/60 via-stone-50 to-orange-50/50 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="rounded-lg bg-amber-600 text-white font-black text-xs px-2.5 py-0.5 font-mono">
                {inspectedDay.date}
              </span>
              <span className="font-bold text-stone-900 font-devanagari text-sm">
                {getLocalizedVaara(inspectedDay.vaara, lang)}
              </span>
              <span className="text-xs text-stone-500 font-sans">
                • {inspectedDay.masa} ({inspectedDay.paksha} Pakṣa)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-800 pt-1 font-sans">
              <span>
                <strong className="text-amber-950 font-devanagari">Tithi:</strong> {inspectedDay.tithi}
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-950 font-devanagari">Nakṣatra:</strong> {inspectedDay.nakshatra}
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-950 font-devanagari">Yoga:</strong> {inspectedDay.yoga}
              </span>
              <span>•</span>
              <span>
                <strong className="text-amber-950 font-devanagari">Karaṇa:</strong> {inspectedDay.karana}
              </span>
            </div>
            {inspectedDay.swara_yoga && (
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1.5 font-sans">
                <span className="text-stone-500 font-medium">Sunrise Swara:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    inspectedDay.swara_yoga.sunriseSwara === 'ida'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : 'bg-orange-100 text-orange-950 border border-orange-200'
                  }`}
                >
                  {inspectedDay.swara_yoga.sunriseSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}
                </span>
                {inspectedDay.swara_yoga.sunriseWindow && (
                  <span className="text-[10px] font-mono text-stone-500">
                    ({inspectedDay.swara_yoga.sunriseWindow.windowFormatted})
                  </span>
                )}
                <span>•</span>
                <span className="text-stone-500 font-medium">Sunset Swara:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    inspectedDay.swara_yoga.sunsetSwara === 'ida'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : 'bg-orange-100 text-orange-950 border border-orange-200'
                  }`}
                >
                  {inspectedDay.swara_yoga.sunsetSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}
                </span>
                {inspectedDay.swara_yoga.sunsetWindow && (
                  <span className="text-[10px] font-mono text-stone-500">
                    ({inspectedDay.swara_yoga.sunsetWindow.windowFormatted})
                  </span>
                )}
                <span>•</span>
                <span className="text-stone-500 font-medium">Moonrise Swara:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    inspectedDay.swara_yoga.moonriseSwara === 'ida'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : 'bg-orange-100 text-orange-950 border border-orange-200'
                  }`}
                >
                  {inspectedDay.swara_yoga.moonriseSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}
                </span>
                {inspectedDay.swara_yoga.moonriseWindow && (
                  <span className="text-[10px] font-mono text-stone-500">
                    ({inspectedDay.swara_yoga.moonriseWindow.windowFormatted})
                  </span>
                )}
                <span>•</span>
                <span className="text-stone-500 font-medium">Moonset Swara:</span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    inspectedDay.swara_yoga.moonsetSwara === 'ida'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : 'bg-orange-100 text-orange-950 border border-orange-200'
                  }`}
                >
                  {inspectedDay.swara_yoga.moonsetSwara === 'ida' ? 'Ida (Left)' : 'Pingala (Right)'}
                </span>
                {inspectedDay.swara_yoga.moonsetWindow && (
                  <span className="text-[10px] font-mono text-stone-500">
                    ({inspectedDay.swara_yoga.moonsetWindow.windowFormatted})
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            id="view-selected-date-btn"
            onClick={() => onSelectDate(inspectedDay.date)}
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0"
          >
            <span>
              {lang === 'sa'
                ? 'अस्य दिनस्य सम्पूर्णपञ्चाङ्गम्'
                : lang === 'hi'
                ? 'इस दिन का सम्पूर्ण पञ्चाङ्ग देखें'
                : 'Open Daily Panchanga for This Date'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
