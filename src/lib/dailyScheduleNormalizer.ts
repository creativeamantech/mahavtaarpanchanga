/**
 * UNIFIED DAILY SCHEDULE NORMALIZER
 *
 * Transforms raw outputs from:
 * - Panchanga Engine (Sun, Moon, Tithi, Nakshatra, Yoga, Karana)
 * - Hora Engine (24 Horas & 120 Proportional Pancha-Tattvas)
 * - Swara Engine (Celestial Sunrise/Sunset/Moonrise windows, hourly alternating Nadi, 5 Swara Tattvas)
 * - Tithi-Swara Engine (Tithi Start/End 1-hour Swara events & overlap detection)
 * - Muhurta Engine (Brahma, Abhijit, Rahu, Yama, Gulika, Amrita, Durmuhurta, Varjyam, Choghadiya)
 * - Planetary Engine (Graha Gochara transits, retrograde, direct, combustion)
 * - Calendar Engine (Festivals & Vratas)
 *
 * All operations use absolute Unix milliseconds. Timezone is for presentation formatting only.
 */

import type { PanchangaResponse, TimingInterval, Segment } from "../types";
import type { Language } from "../i18n";
import { computeDailyHoras } from "./horaEngine";
import { computeSwaraYoga } from "../swaraYoga";
import { calculateTithiSwaraInfo } from "./tithiSwaraEngine";
import { EKADASHI_NAMES } from "../vedicData";
import type {
  DailyScheduleEvent,
  DailyScheduleEventType,
  DailyScheduleTimeSlot,
  UnifiedDailySchedule,
  EventCategory,
} from "./dailyScheduleModel";

// Priority map for deterministic secondary sort when startTimeMs are identical
const EVENT_PRIORITIES: Record<DailyScheduleEventType, number> = {
  sunrise: 10,
  sunset: 11,
  moonrise: 12,
  moonset: 13,
  tithi: 20,
  nakshatra: 21,
  yoga: 22,
  karana: 23,
  hora: 30,
  "hora-tattva": 35,
  swara: 40,
  nadi: 42,
  "swara-tattva": 45,
  "tithi-swara-start": 50,
  "tithi-swara-end": 51,
  "planetary-transit": 60,
  "planetary-retrograde": 61,
  "planetary-direct": 62,
  "planetary-combustion": 63,
  muhurta: 70,
  festival: 80,
  vrata: 81,
  other: 90,
};

/**
 * Timezone-aware date formatter for presentation strings.
 */
function formatTimeInZone(ms: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleTimeString();
  }
}

function formatShortTimeInZone(ms: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleTimeString();
  }
}

/**
 * Resolves a date string in HH:MM:SS or HH:MM AM/PM relative to sunrise timestamp.
 */
function resolveTimeStringToMs(
  timeStr: string | null | undefined,
  baseDateMs: number,
  timeZone: string,
): number | null {
  if (!timeStr || timeStr === "--" || timeStr.toLowerCase().includes("no")) return null;

  try {
    // If it's already an ISO timestamp
    const parsedIso = Date.parse(timeStr);
    if (!isNaN(parsedIso) && timeStr.includes("T")) {
      return parsedIso;
    }

    // Try parsing HH:MM:SS or HH:MM AM/PM
    const cleaned = timeStr.trim();
    const parts = cleaned.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!parts) return null;

    let hour = parseInt(parts[1], 10);
    const minute = parseInt(parts[2], 10);
    const second = parts[3] ? parseInt(parts[3], 10) : 0;
    const meridian = parts[4]?.toUpperCase();

    if (meridian === "PM" && hour < 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    // Use base date in target timezone to build timestamp
    const baseDate = new Date(baseDateMs);
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    // Construct approximate UTC then refine with Intl offset if needed
    const candidate = new Date(Date.UTC(year, month, day, hour, minute, second));
    return candidate.getTime();
  } catch {
    return null;
  }
}

/**
 * Category color theme helper for UI presentation.
 */
function getEventColorTheme(type: DailyScheduleEventType, auspiciousness?: string) {
  if (auspiciousness === "inauspicious") {
    return {
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-900",
      badgeBorder: "border-rose-200",
      barColor: "bg-rose-500",
      iconColor: "text-rose-600",
    };
  }
  if (auspiciousness === "auspicious") {
    return {
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-900",
      badgeBorder: "border-emerald-200",
      barColor: "bg-emerald-500",
      iconColor: "text-emerald-600",
    };
  }

  switch (type) {
    case "sunrise":
    case "sunset":
    case "moonrise":
    case "moonset":
      return {
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-900",
        badgeBorder: "border-amber-200",
        barColor: "bg-amber-500",
        iconColor: "text-amber-600",
      };
    case "hora":
      return {
        badgeBg: "bg-indigo-100",
        badgeText: "text-indigo-900",
        badgeBorder: "border-indigo-200",
        barColor: "bg-indigo-600",
        iconColor: "text-indigo-600",
      };
    case "hora-tattva":
      return {
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-900",
        badgeBorder: "border-purple-200",
        barColor: "bg-purple-500",
        iconColor: "text-purple-600",
      };
    case "swara":
    case "nadi":
    case "swara-tattva":
      return {
        badgeBg: "bg-cyan-100",
        badgeText: "text-cyan-900",
        badgeBorder: "border-cyan-200",
        barColor: "bg-cyan-500",
        iconColor: "text-cyan-600",
      };
    case "tithi-swara-start":
    case "tithi-swara-end":
      return {
        badgeBg: "bg-sky-100",
        badgeText: "text-sky-900",
        badgeBorder: "border-sky-200",
        barColor: "bg-sky-500",
        iconColor: "text-sky-600",
      };
    case "tithi":
    case "nakshatra":
    case "yoga":
    case "karana":
      return {
        badgeBg: "bg-amber-50",
        badgeText: "text-stone-800",
        badgeBorder: "border-amber-200",
        barColor: "bg-amber-400",
        iconColor: "text-amber-700",
      };
    case "planetary-transit":
    case "planetary-retrograde":
    case "planetary-direct":
    case "planetary-combustion":
      return {
        badgeBg: "bg-orange-100",
        badgeText: "text-orange-900",
        badgeBorder: "border-orange-200",
        barColor: "bg-orange-500",
        iconColor: "text-orange-600",
      };
    case "festival":
    case "vrata":
      return {
        badgeBg: "bg-fuchsia-100",
        badgeText: "text-fuchsia-900",
        badgeBorder: "border-fuchsia-200",
        barColor: "bg-fuchsia-500",
        iconColor: "text-fuchsia-600",
      };
    default:
      return {
        badgeBg: "bg-stone-100",
        badgeText: "text-stone-800",
        badgeBorder: "border-stone-200",
        barColor: "bg-stone-400",
        iconColor: "text-stone-600",
      };
  }
}

/**
 * Maps event type to user filter category.
 */
function mapTypeToCategory(type: DailyScheduleEventType): EventCategory {
  switch (type) {
    case "sunrise":
    case "sunset":
    case "moonrise":
    case "moonset":
      return "astronomical";
    case "tithi":
    case "nakshatra":
    case "yoga":
    case "karana":
      return "panchanga";
    case "hora":
    case "hora-tattva":
      return "hora";
    case "swara":
    case "nadi":
    case "swara-tattva":
    case "tithi-swara-start":
    case "tithi-swara-end":
      return "swara";
    case "muhurta":
      return "muhurta";
    case "planetary-transit":
    case "planetary-retrograde":
    case "planetary-direct":
    case "planetary-combustion":
      return "planetary";
    case "festival":
    case "vrata":
      return "calendar";
    default:
      return "all";
  }
}

/**
 * Normalizes all supported events into a single, unified chronological stream.
 */
export function normalizeDailySchedule(
  data: PanchangaResponse,
  lang: Language = "en",
  nowMs?: number,
): UnifiedDailySchedule {
  const events: DailyScheduleEvent[] = [];
  const timeZone = data.timezone || "Asia/Kolkata";
  const currentNow = nowMs ?? Date.now();

  const sunriseMs = data.sunrise_ms;
  const sunsetMs = data.sunset_ms;
  const nextSunriseMs = data.next_sunrise_ms;

  if (!sunriseMs || !sunsetMs || !nextSunriseMs) {
    return {
      dateStr: data.date,
      city: data.city,
      timeZone,
      isToday: false,
      computedAtMs: currentNow,
      events: [],
      timeSlots: [],
      counts: {
        total: 0,
        hora: 0,
        swara: 0,
        panchanga: 0,
        muhurta: 0,
        astronomical: 0,
        planetary: 0,
        calendar: 0,
      },
    };
  }

  // Check if today matches schedule
  const isToday = currentNow >= sunriseMs - 3600000 * 6 && currentNow <= nextSunriseMs;

  // ---------------------------------------------------------------------------
  // 1. ASTRONOMICAL EVENTS
  // ---------------------------------------------------------------------------
  // Sunrise
  events.push({
    id: `astronomy-sunrise-${sunriseMs}`,
    type: "sunrise",
    source: "Astronomical Engine",
    category: "astronomical",
    startTimeMs: sunriseMs,
    endTimeMs: null,
    title: lang === "hi" ? "सूर्योदय" : lang === "sa" ? "सूर्योदयः" : "Sunrise",
    subtitle: `${formatTimeInZone(sunriseMs, timeZone)} · Beginning of Vedic Day`,
    localizedTitle: { en: "Sunrise", hi: "सूर्योदय", sa: "सूर्योदयः" },
    priority: EVENT_PRIORITIES.sunrise,
    colorTheme: getEventColorTheme("sunrise"),
  });

  // Sunset
  events.push({
    id: `astronomy-sunset-${sunsetMs}`,
    type: "sunset",
    source: "Astronomical Engine",
    category: "astronomical",
    startTimeMs: sunsetMs,
    endTimeMs: null,
    title: lang === "hi" ? "सूर्यास्त" : lang === "sa" ? "सूर्यास्तः" : "Sunset",
    subtitle: `${formatTimeInZone(sunsetMs, timeZone)} · Beginning of Vedic Night`,
    localizedTitle: { en: "Sunset", hi: "सूर्यास्त", sa: "सूर्यास्तः" },
    priority: EVENT_PRIORITIES.sunset,
    colorTheme: getEventColorTheme("sunset"),
  });

  // Moonrise
  const moonriseMs = resolveTimeStringToMs(data.moonrise, sunriseMs, timeZone);
  if (moonriseMs && moonriseMs >= sunriseMs - 86400000 && moonriseMs <= nextSunriseMs + 86400000) {
    events.push({
      id: `astronomy-moonrise-${moonriseMs}`,
      type: "moonrise",
      source: "Astronomical Engine",
      category: "astronomical",
      startTimeMs: moonriseMs,
      endTimeMs: null,
      title: lang === "hi" ? "चन्द्रोदय" : lang === "sa" ? "चन्द्रोदयः" : "Moonrise",
      subtitle: `${formatTimeInZone(moonriseMs, timeZone)} · Chandra Udaya`,
      localizedTitle: { en: "Moonrise", hi: "चन्द्रोदय", sa: "चन्द्रोदयः" },
      priority: EVENT_PRIORITIES.moonrise,
      colorTheme: getEventColorTheme("moonrise"),
    });
  }

  // Moonset
  const moonsetMs = resolveTimeStringToMs(data.moonset, sunriseMs, timeZone);
  if (moonsetMs && moonsetMs >= sunriseMs - 86400000 && moonsetMs <= nextSunriseMs + 86400000) {
    events.push({
      id: `astronomy-moonset-${moonsetMs}`,
      type: "moonset",
      source: "Astronomical Engine",
      category: "astronomical",
      startTimeMs: moonsetMs,
      endTimeMs: null,
      title: lang === "hi" ? "चन्द्रास्त" : lang === "sa" ? "चन्द्रास्तः" : "Moonset",
      subtitle: `${formatTimeInZone(moonsetMs, timeZone)} · Chandra Asta`,
      localizedTitle: { en: "Moonset", hi: "चन्द्रास्त", sa: "चन्द्रास्तः" },
      priority: EVENT_PRIORITIES.moonset,
      colorTheme: getEventColorTheme("moonset"),
    });
  }

  // ---------------------------------------------------------------------------
  // 2. PANCHANGA ANGAS (Tithi, Nakshatra, Yoga, Karana)
  // ---------------------------------------------------------------------------
  const addSegments = (
    segments: Segment[] | undefined,
    type: "tithi" | "nakshatra" | "yoga" | "karana",
    labelEn: string,
    labelHi: string,
    labelSa: string,
  ) => {
    if (!segments || !Array.isArray(segments)) return;
    segments.forEach((seg, idx) => {
      if (!seg.startTimeMs || !seg.endTimeMs) return;
      const durationMs = seg.endTimeMs - seg.startTimeMs;
      events.push({
        id: `panchanga-${type}-${seg.number || idx}-${seg.startTimeMs}`,
        type,
        source: "Panchanga Engine",
        category: "panchanga",
        startTimeMs: seg.startTimeMs,
        endTimeMs: seg.endTimeMs,
        durationMs,
        title: `${seg.name} (${lang === "hi" ? labelHi : lang === "sa" ? labelSa : labelEn})`,
        subtitle: `${labelEn} #${seg.number || idx + 1} · ${Math.round(durationMs / 3600000)}h duration`,
        metadata: { ...seg },
        priority: EVENT_PRIORITIES[type],
        colorTheme: getEventColorTheme(type),
      });
    });
  };

  addSegments(data.tithi, "tithi", "Tithi", "तिथि", "तिथिः");
  addSegments(data.nakshatra, "nakshatra", "Nakshatra", "नक्षत्र", "नक्षत्रम्");
  addSegments(data.yoga, "yoga", "Yoga", "योग", "योगः");
  addSegments(data.karana, "karana", "Karana", "करण", "करणम्");

  // ---------------------------------------------------------------------------
  // 3. HORA & HORA-TATTVA (5-Tattva Micro-Periods, Proportional Scaling)
  // ---------------------------------------------------------------------------
  try {
    const dailyHoras = computeDailyHoras(
      data.date,
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      data.weekday,
      data.tithi[0]?.number || 1,
      timeZone,
      currentNow,
    );

    dailyHoras.horas.forEach((h) => {
      // 3.1 Planetary Hora Event
      events.push({
        id: `hora-${h.index}-${h.startTimeMs}`,
        type: "hora",
        source: "Hora Engine",
        category: "hora",
        startTimeMs: h.startTimeMs,
        endTimeMs: h.endTimeMs,
        durationMs: h.durationMs,
        title: `${h.ruler} Hora`,
        subtitle: `${h.isDay ? "Day" : "Night"} Hora #${h.index} · Nadi: ${h.nadi.toUpperCase()}`,
        localizedTitle: {
          en: `${h.ruler} Hora`,
          hi: `${h.ruler} होरा`,
          sa: `${h.ruler} होरा`,
        },
        metadata: {
          horaIndex: h.index,
          ruler: h.ruler,
          isDay: h.isDay,
          nadi: h.nadi,
          tattvas: h.tattvas,
        },
        priority: EVENT_PRIORITIES.hora,
        colorTheme: getEventColorTheme("hora"),
      });

      // 3.2 Hora-Tattva Micro-Period Events (All 5 periods)
      h.tattvas.forEach((tp, tIdx) => {
        events.push({
          id: `hora-tattva-${h.index}-${tp.sanskrit}-${tp.startTimeMs}`,
          type: "hora-tattva",
          source: "Hora Engine",
          category: "hora",
          startTimeMs: tp.startTimeMs,
          endTimeMs: tp.endTimeMs,
          durationMs: tp.durationMs,
          title: `${tp.sanskrit} Tattva (${tp.name})`,
          subtitle: `${h.ruler} Hora · Micro-period ${tIdx + 1}/5`,
          localizedTitle: {
            en: `${tp.sanskrit} Tattva (${tp.name})`,
            hi: `${tp.sanskrit} तत्त्व (${tp.name})`,
            sa: `${tp.sanskrit}-तत्त्वम्`,
          },
          metadata: {
            parentHoraIndex: h.index,
            parentHoraRuler: h.ruler,
            tattvaIndex: tIdx + 1,
            sanskrit: tp.sanskrit,
            name: tp.name,
          },
          priority: EVENT_PRIORITIES["hora-tattva"],
          colorTheme: getEventColorTheme("hora-tattva"),
        });
      });
    });
  } catch (err) {
    console.warn("Hora normalization error:", err);
  }

  // ---------------------------------------------------------------------------
  // 4. SWARA / NADI (Shiva Swarodaya Windows & Hourly Cycles)
  // ---------------------------------------------------------------------------
  try {
    const swaraYoga = computeSwaraYoga(
      data.tithi[0]?.number || 1,
      formatTimeInZone(sunriseMs, timeZone),
      formatTimeInZone(sunsetMs, timeZone),
    );

    // 4.1 Sunrise Swara Window (60 mins from Sunrise)
    const sunriseSwaraEndMs = sunriseMs + 3600000;
    events.push({
      id: `swara-sunrise-${sunriseMs}`,
      type: "swara",
      source: "Swara Engine",
      category: "swara",
      startTimeMs: sunriseMs,
      endTimeMs: sunriseSwaraEndMs,
      durationMs: 3600000,
      title: `Sunrise Swara · ${swaraYoga.sunriseSwara === "ida" ? "Ida (Lunar / Left)" : "Pingala (Solar / Right)"}`,
      subtitle: `${swaraYoga.sunriseNostril} Nostril · 1st Hour Classical Swara Window`,
      priority: EVENT_PRIORITIES.swara,
      colorTheme: getEventColorTheme("swara"),
      metadata: {
        window: "sunrise",
        nadi: swaraYoga.sunriseSwara,
        nostril: swaraYoga.sunriseNostril,
      },
    });

    // 4.2 Sunset Swara Window (60 mins before Sunset)
    const sunsetSwaraStartMs = sunsetMs - 3600000;
    events.push({
      id: `swara-sunset-${sunsetSwaraStartMs}`,
      type: "swara",
      source: "Swara Engine",
      category: "swara",
      startTimeMs: sunsetSwaraStartMs,
      endTimeMs: sunsetMs,
      durationMs: 3600000,
      title: `Sunset Swara · ${swaraYoga.sunsetSwara === "ida" ? "Ida (Lunar / Left)" : "Pingala (Solar / Right)"}`,
      subtitle: `${swaraYoga.sunsetNostril} Nostril · Sandhya Transition Swara Window`,
      priority: EVENT_PRIORITIES.swara,
      colorTheme: getEventColorTheme("swara"),
      metadata: {
        window: "sunset",
        nadi: swaraYoga.sunsetSwara,
        nostril: swaraYoga.sunsetNostril,
      },
    });

    // 4.3 24 Hourly Alternating Nadi Cycles
    const totalCycles = 24;
    const cycleDurationMs = (nextSunriseMs - sunriseMs) / 24;

    for (let c = 0; c < totalCycles; c++) {
      const cycleStartMs = Math.round(sunriseMs + c * cycleDurationMs);
      const cycleEndMs = Math.round(
        c === totalCycles - 1 ? nextSunriseMs : cycleStartMs + cycleDurationMs,
      );
      const cycleNadi =
        c % 2 === 0 ? swaraYoga.sunriseSwara : swaraYoga.sunriseSwara === "ida" ? "pingala" : "ida";
      const cycleNostril = cycleNadi === "ida" ? "Left Nostril" : "Right Nostril";

      // Nadi alternating cycle
      events.push({
        id: `swara-nadi-cycle-${c + 1}-${cycleStartMs}`,
        type: "nadi",
        source: "Swara Engine",
        category: "swara",
        startTimeMs: cycleStartMs,
        endTimeMs: cycleEndMs,
        durationMs: cycleEndMs - cycleStartMs,
        title: `${cycleNadi === "ida" ? "Ida Nadi" : "Pingala Nadi"} Cycle #${c + 1}`,
        subtitle: `${cycleNostril} · Active Breathing Current (${Math.round((cycleEndMs - cycleStartMs) / 60000)} min)`,
        priority: EVENT_PRIORITIES.nadi,
        colorTheme: getEventColorTheme("nadi"),
        metadata: {
          cycleNumber: c + 1,
          nadi: cycleNadi,
          nostril: cycleNostril,
        },
      });

      // Swara Tattva sub-periods (Classical Swarodaya 5 Tattvas in order: Prithvi 20m, Jala 16m, Tejas 12m, Vayu 8m, Akasha 4m)
      const swaraTattvaRatios = [
        { name: "Earth", sanskrit: "Prithvi", minutes: 20 },
        { name: "Water", sanskrit: "Jala", minutes: 16 },
        { name: "Fire", sanskrit: "Tejas", minutes: 12 },
        { name: "Air", sanskrit: "Vayu", minutes: 8 },
        { name: "Space", sanskrit: "Akasha", minutes: 4 },
      ];

      let stStart = cycleStartMs;
      const actualDuration = cycleEndMs - cycleStartMs;
      const totalRatioMinutes = 60;

      swaraTattvaRatios.forEach((st, stIdx) => {
        const stDuration = Math.round(actualDuration * (st.minutes / totalRatioMinutes));
        const stEnd = stIdx === swaraTattvaRatios.length - 1 ? cycleEndMs : stStart + stDuration;

        events.push({
          id: `swara-tattva-${c + 1}-${st.sanskrit}-${stStart}`,
          type: "swara-tattva",
          source: "Swara Engine",
          category: "swara",
          startTimeMs: stStart,
          endTimeMs: stEnd,
          durationMs: stEnd - stStart,
          title: `Swara ${st.sanskrit} (${st.name})`,
          subtitle: `${cycleNadi === "ida" ? "Ida" : "Pingala"} · Swarodaya Sub-period ${stIdx + 1}/5`,
          priority: EVENT_PRIORITIES["swara-tattva"],
          colorTheme: getEventColorTheme("swara-tattva"),
          metadata: {
            cycle: c + 1,
            nadi: cycleNadi,
            sanskrit: st.sanskrit,
            name: st.name,
          },
        });

        stStart = stEnd;
      });
    }
  } catch (err) {
    console.warn("Swara normalization error:", err);
  }

  // ---------------------------------------------------------------------------
  // 5. TITHI-SWARA EVENTS (1-hour Start and 1-hour End Swara Events)
  // ---------------------------------------------------------------------------
  try {
    if (data.tithi && Array.isArray(data.tithi)) {
      data.tithi.forEach((tithiSeg, tIdx) => {
        if (!tithiSeg.startTimeMs || !tithiSeg.endTimeMs) return;

        const pakshaStr = (data.paksha || "").toLowerCase().includes("krishna")
          ? "krishna"
          : "shukla";
        const tithiNum = tithiSeg.number || tIdx + 1;
        const info = calculateTithiSwaraInfo(
          tithiNum,
          pakshaStr,
          tithiSeg.startTimeMs,
          tithiSeg.endTimeMs,
        );

        // Start Event
        if (info.startEvent) {
          const se = info.startEvent;
          events.push({
            id: `tithi-swara-start-${tithiNum}-${se.startTimeMs}`,
            type: "tithi-swara-start",
            source: "Tithi-Swara Engine",
            category: "swara",
            startTimeMs: se.startTimeMs,
            endTimeMs: se.endTimeMs,
            durationMs: se.durationMs,
            title: `Tithi Start Swara · ${se.nadi === "ida" ? "Ida Nadi" : "Pingala Nadi"}`,
            subtitle: `${tithiSeg.name} Beginning · ${se.nadi === "ida" ? "Left Nostril" : "Right Nostril"} (60 min)`,
            hasOverlap: se.hasOverlap,
            priority: EVENT_PRIORITIES["tithi-swara-start"],
            colorTheme: getEventColorTheme("tithi-swara-start"),
            metadata: {
              tithiName: tithiSeg.name,
              tithiNumber: tithiNum,
              paksha: pakshaStr,
              nadi: se.nadi,
              nadiLabel: se.nadiLabel,
              hasOverlap: se.hasOverlap,
            },
          });
        }

        // End Event
        if (info.endEvent) {
          const ee = info.endEvent;
          events.push({
            id: `tithi-swara-end-${tithiNum}-${ee.startTimeMs}`,
            type: "tithi-swara-end",
            source: "Tithi-Swara Engine",
            category: "swara",
            startTimeMs: ee.startTimeMs,
            endTimeMs: ee.endTimeMs,
            durationMs: ee.durationMs,
            title: `Tithi End Swara · ${ee.nadi === "ida" ? "Ida Nadi" : "Pingala Nadi"}`,
            subtitle: `${tithiSeg.name} Completion · ${ee.nadi === "ida" ? "Left Nostril" : "Right Nostril"} (60 min)`,
            hasOverlap: ee.hasOverlap,
            priority: EVENT_PRIORITIES["tithi-swara-end"],
            colorTheme: getEventColorTheme("tithi-swara-end"),
            metadata: {
              tithiName: tithiSeg.name,
              tithiNumber: tithiNum,
              paksha: pakshaStr,
              nadi: ee.nadi,
              nadiLabel: ee.nadiLabel,
              hasOverlap: ee.hasOverlap,
            },
          });
        }
      });
    }
  } catch (err) {
    console.warn("Tithi-Swara normalization error:", err);
  }

  // ---------------------------------------------------------------------------
  // 6. MUHURTAS & TIMINGS (Brahma, Abhijit, Rahu, Yama, Gulika, Amrita, Choghadiya)
  // ---------------------------------------------------------------------------
  const addTiming = (
    interval: TimingInterval | undefined | null,
    titleEn: string,
    titleHi: string,
    titleSa: string,
    auspiciousness: "auspicious" | "inauspicious" | "neutral",
    customId: string,
  ) => {
    if (!interval || !interval.startTimeMs || !interval.endTimeMs) return;
    const durationMs = interval.endTimeMs - interval.startTimeMs;
    events.push({
      id: `muhurta-${customId}-${interval.startTimeMs}`,
      type: "muhurta",
      source: "Muhurta Engine",
      category: "muhurta",
      startTimeMs: interval.startTimeMs,
      endTimeMs: interval.endTimeMs,
      durationMs,
      title: lang === "hi" ? titleHi : lang === "sa" ? titleSa : titleEn,
      subtitle: `${auspiciousness === "auspicious" ? "Auspicious Timing" : "Inauspicious Period"} · ${Math.round(durationMs / 60000)} min`,
      localizedTitle: { en: titleEn, hi: titleHi, sa: titleSa },
      auspiciousness,
      priority: EVENT_PRIORITIES.muhurta,
      colorTheme: getEventColorTheme("muhurta", auspiciousness),
      metadata: { ...interval },
    });
  };

  addTiming(
    data.brahma_muhurta,
    "Brahma Muhūrta",
    "ब्रह्म मुहूर्त",
    "ब्रह्म-मुहूर्तः",
    "auspicious",
    "brahma",
  );
  addTiming(
    data.abhijit_muhurta,
    "Abhijit Muhūrta",
    "अभिजित मुहूर्त",
    "अभिजित्-मुहूर्तः",
    "auspicious",
    "abhijit",
  );
  addTiming(data.rahu_kala, "Rāhu Kāla", "राहुकाल", "राहुकालः", "inauspicious", "rahu");
  addTiming(data.yamaganda, "Yama Gaṇḍa", "यमगण्ड", "यमगण्डः", "inauspicious", "yamaganda");
  addTiming(data.gulika_kala, "Gulikā Kāla", "गुलिक काल", "गुलिक-कालः", "inauspicious", "gulika");

  // Amrita Kala intervals
  if (Array.isArray(data.amrita_kala)) {
    data.amrita_kala.forEach((ak, i) => {
      addTiming(
        ak,
        `Amṛta Kāla #${i + 1}`,
        `अमृत काल #${i + 1}`,
        `अमृत-कालः #${i + 1}`,
        "auspicious",
        `amrita-${i}`,
      );
    });
  }

  // Durmuhurta intervals
  if (Array.isArray(data.durmuhurta)) {
    data.durmuhurta.forEach((dm, i) => {
      addTiming(
        dm,
        `Durmuhūrta #${i + 1}`,
        `दुर्मुहूर्त #${i + 1}`,
        `दुर्मुहूर्तः #${i + 1}`,
        "inauspicious",
        `durmuhurta-${i}`,
      );
    });
  }

  // Varjyam intervals
  if (Array.isArray(data.varjyam)) {
    data.varjyam.forEach((vj, i) => {
      addTiming(
        vj,
        `Varjyam #${i + 1}`,
        `वर्ज्यम् #${i + 1}`,
        `वर्ज्यम् #${i + 1}`,
        "inauspicious",
        `varjyam-${i}`,
      );
    });
  }

  // Gauri Choghadiya (Day & Night)
  const addChoghadiyas = (intervals: TimingInterval[] | undefined, isNight: boolean) => {
    if (!intervals || !Array.isArray(intervals)) return;
    intervals.forEach((cg, idx) => {
      if (!cg.startTimeMs || !cg.endTimeMs) return;
      const durationMs = cg.endTimeMs - cg.startTimeMs;
      const name = cg.name || "";
      const isGood = /amrit|shubh|labh|char|अमृत|शुभ|लाभ|चर/i.test(name);
      const isBad = /rog|kaal|udveg|रोग|काल|उद्वेग/i.test(name);
      const ausp = isGood ? "auspicious" : isBad ? "inauspicious" : "neutral";

      events.push({
        id: `muhurta-choghadiya-${isNight ? "night" : "day"}-${idx}-${cg.startTimeMs}`,
        type: "muhurta",
        source: "Muhurta Engine",
        category: "muhurta",
        startTimeMs: cg.startTimeMs,
        endTimeMs: cg.endTimeMs,
        durationMs,
        title: `${name} (${isNight ? "Night" : "Day"} Choghaḍiyā)`,
        subtitle: `${(cg as { lord?: string }).lord ? "Ruler: " + (cg as { lord?: string }).lord + " · " : ""}${Math.round(durationMs / 60000)} min`,
        auspiciousness: ausp,
        priority: EVENT_PRIORITIES.muhurta,
        colorTheme: getEventColorTheme("muhurta", ausp),
        metadata: { ...cg, isNight },
      });
    });
  };

  addChoghadiyas(data.gauri_choghadiya_day, false);
  addChoghadiyas(data.gauri_choghadiya_night, true);

  // ---------------------------------------------------------------------------
  // 7. PLANETARY TRANSITS & CHANGES (Graha Gochara)
  // ---------------------------------------------------------------------------
  if (data.planet_transitions?.todayEvents && Array.isArray(data.planet_transitions.todayEvents)) {
    data.planet_transitions.todayEvents.forEach((pe, idx) => {
      const eventTimeMs = pe.timestamp
        ? new Date(pe.timestamp).getTime()
        : resolveTimeStringToMs(pe.timeStr, sunriseMs, timeZone);
      if (!eventTimeMs) return;

      let pType: DailyScheduleEventType = "planetary-transit";
      if (pe.type === "retrograde") pType = "planetary-retrograde";
      else if (pe.type === "direct") pType = "planetary-direct";
      else if (pe.type === "combust") pType = "planetary-combustion";

      events.push({
        id: `planetary-${pe.planetId || idx}-${pe.type}-${eventTimeMs}`,
        type: pType,
        source: "Planetary Engine",
        category: "planetary",
        startTimeMs: eventTimeMs,
        endTimeMs: null,
        title: `${pe.planetName} ${pe.specialName || pe.type.toUpperCase()}`,
        subtitle: pe.description?.[lang] || pe.relativeText || `${pe.planetName} transit event`,
        priority: EVENT_PRIORITIES[pType],
        colorTheme: getEventColorTheme(pType),
        metadata: { ...pe },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 8. FESTIVALS & VRATAS (Calendar Engine)
  // ---------------------------------------------------------------------------
  try {
    const primaryTithiNum = data.tithi[0]?.number || 1;
    const isSukla = data.paksha === "Śukla" || primaryTithiNum <= 15;

    // Check Ekadashi (11 or 26)
    if (primaryTithiNum === 11 || primaryTithiNum === 26) {
      const rawMasa = (data.masa || "").split(" ")[0];
      const ekadashiEntry = EKADASHI_NAMES[rawMasa];
      let specificName = "Ekādaśī Mahāvrata";
      if (ekadashiEntry) {
        specificName = isSukla ? ekadashiEntry.shukla : ekadashiEntry.krishna;
      }

      events.push({
        id: `calendar-ekadashi-${sunriseMs}`,
        type: "vrata",
        source: "Calendar Engine",
        category: "calendar",
        startTimeMs: sunriseMs,
        endTimeMs: sunsetMs,
        title: `Śrī Hari ${specificName}`,
        subtitle: "Supreme Vaishnava Fasting Day Dedicated to Lord Vishnu",
        localizedTitle: {
          en: `Śrī Hari ${specificName}`,
          hi: `श्रीहरि ${specificName}`,
          sa: `श्रीहरि-${specificName}`,
        },
        priority: EVENT_PRIORITIES.vrata,
        colorTheme: getEventColorTheme("vrata"),
      });
    }

    // Purnima / Amavasya
    if (primaryTithiNum === 15) {
      events.push({
        id: `calendar-purnima-${sunriseMs}`,
        type: "festival",
        source: "Calendar Engine",
        category: "calendar",
        startTimeMs: sunriseMs,
        endTimeMs: sunsetMs,
        title: "Pūrṇimā Mahotsava (Full Moon)",
        subtitle: "Auspicious Satyanarayana Puja & Sacred Bathing Day",
        priority: EVENT_PRIORITIES.festival,
        colorTheme: getEventColorTheme("festival"),
      });
    } else if (primaryTithiNum === 30 || primaryTithiNum === 0) {
      events.push({
        id: `calendar-amavasya-${sunriseMs}`,
        type: "vrata",
        source: "Calendar Engine",
        category: "calendar",
        startTimeMs: sunriseMs,
        endTimeMs: sunsetMs,
        title: "Amāvasyā (New Moon / Pitru Puja)",
        subtitle: "Sacred Tarpanam Day Dedicated to Ancestors",
        priority: EVENT_PRIORITIES.vrata,
        colorTheme: getEventColorTheme("vrata"),
      });
    }
  } catch (err) {
    console.warn("Festival normalization error:", err);
  }

  // ---------------------------------------------------------------------------
  // 9. DETERMINISTIC CHRONOLOGICAL SORTING & LIVE STATE ENRICHMENT
  // ---------------------------------------------------------------------------
  events.sort((a, b) => {
    if (a.startTimeMs !== b.startTimeMs) {
      return a.startTimeMs - b.startTimeMs;
    }
    return (a.priority ?? 50) - (b.priority ?? 50);
  });

  // Enrich formatted times and live flags
  events.forEach((e) => {
    e.formattedStart = formatTimeInZone(e.startTimeMs, timeZone);
    if (e.endTimeMs !== null) {
      e.formattedEnd = formatTimeInZone(e.endTimeMs, timeZone);
      e.formattedRange = `${formatShortTimeInZone(e.startTimeMs, timeZone)} – ${formatShortTimeInZone(e.endTimeMs, timeZone)}`;
      e.durationMs = e.endTimeMs - e.startTimeMs;
    } else {
      e.formattedRange = formatTimeInZone(e.startTimeMs, timeZone);
    }

    // Real-time live status against currentNow
    if (isToday) {
      if (e.endTimeMs === null) {
        // Instantaneous event: active within 60 seconds
        e.isCurrent = currentNow >= e.startTimeMs && currentNow - e.startTimeMs < 60000;
        e.isUpcoming = e.startTimeMs > currentNow;
        e.isCompleted = currentNow > e.startTimeMs + 60000;
      } else {
        // Duration event: half-open interval [start, end)
        e.isCurrent = currentNow >= e.startTimeMs && currentNow < e.endTimeMs;
        e.isUpcoming = e.startTimeMs > currentNow;
        e.isCompleted = currentNow >= e.endTimeMs;
      }
    } else {
      e.isCurrent = false;
      e.isUpcoming = false;
      e.isCompleted = false;
    }
  });

  // ---------------------------------------------------------------------------
  // 10. TIME-SLOT GROUPING FOR SAME-TIME EVENTS (UI Presentation)
  // ---------------------------------------------------------------------------
  const slotsMap = new Map<number, DailyScheduleEvent[]>();
  events.forEach((ev) => {
    const existing = slotsMap.get(ev.startTimeMs);
    if (existing) {
      existing.push(ev);
    } else {
      slotsMap.set(ev.startTimeMs, [ev]);
    }
  });

  const timeSlots: DailyScheduleTimeSlot[] = Array.from(slotsMap.entries()).map(
    ([ts, slotEvents]) => ({
      key: `slot-${ts}`,
      startTimeMs: ts,
      formattedTime: formatTimeInZone(ts, timeZone),
      events: slotEvents,
    }),
  );

  // Counts summary
  const counts = {
    total: events.length,
    hora: events.filter((e) => e.category === "hora").length,
    swara: events.filter((e) => e.category === "swara").length,
    panchanga: events.filter((e) => e.category === "panchanga").length,
    muhurta: events.filter((e) => e.category === "muhurta").length,
    astronomical: events.filter((e) => e.category === "astronomical").length,
    planetary: events.filter((e) => e.category === "planetary").length,
    calendar: events.filter((e) => e.category === "calendar").length,
  };

  return {
    dateStr: data.date,
    city: data.city,
    timeZone,
    isToday,
    computedAtMs: currentNow,
    events,
    timeSlots,
    counts,
  };
}
