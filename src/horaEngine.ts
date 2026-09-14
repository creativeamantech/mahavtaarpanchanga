import { PanchangaResponse } from "./types";
import { computeSwaraYoga } from "./swaraYoga";

export interface TattvaPeriod {
  name: string;
  sanskrit: string;
  durationMs: number;
  startTime: string; // hh:mm:ss A (e.g., 06:15:23 AM)
  endTime: string; // hh:mm:ss A
  startTimeMs: number;
  endTimeMs: number;
}

export interface Hora {
  index: number;
  isDay: boolean;
  startTime: string; // hh:mm:ss A
  endTime: string; // hh:mm:ss A
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  ruler: string;
  nadi: "ida" | "pingala" | "sushumna";
  tattvas: TattvaPeriod[];
}

export interface DailyHoras {
  date: string;
  horas: Hora[];
  activeHora: Hora | null;
  activeTattva: TattvaPeriod | null;
}

const HORA_LORDS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
const WEEKDAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4]; // Sun to Sat

const TATTVA_DEFS = [
  {
    name: "Space",
    sanskrit: "Akasha",
    ratio: 1 / 15,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    name: "Air",
    sanskrit: "Vayu",
    ratio: 2 / 15,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    name: "Fire",
    sanskrit: "Agni",
    ratio: 3 / 15,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    name: "Earth",
    sanskrit: "Prithvi",
    ratio: 5 / 15,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    name: "Water",
    sanskrit: "Jala",
    ratio: 4 / 15,
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
];

function formatHMS(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function computeDailyHoras(
  dateStr: string,
  sunriseMs: number,
  sunsetMs: number,
  nextSunriseMs: number,
  weekday: number, // 0-6 (Sun-Sat)
  tithiNum: number,
  timeZone: string,
  currentTimeMs?: number, // optional real-time check
): DailyHoras {
  const now = currentTimeMs ?? Date.now();

  // Validate inputs
  if (
    !sunriseMs ||
    !sunsetMs ||
    !nextSunriseMs ||
    isNaN(sunriseMs) ||
    isNaN(sunsetMs) ||
    isNaN(nextSunriseMs)
  ) {
    throw new Error("Invalid astronomical timestamps provided for Hora calculation.");
  }
  if (sunriseMs >= sunsetMs || sunsetMs >= nextSunriseMs) {
    throw new Error("Invalid chronological ordering of sunrise and sunset.");
  }
  if (weekday < 0 || weekday > 6) {
    throw new Error("Weekday must be between 0 and 6.");
  }

  const dayDurationMs = sunsetMs - sunriseMs;
  const nightDurationMs = nextSunriseMs - sunsetMs;

  const dayHoraDuration = dayDurationMs / 12;
  const nightHoraDuration = nightDurationMs / 12;

  const initialNadi = computeSwaraYoga(tithiNum, "00:00:00", "00:00:00").sunriseSwara; // sunrise Swara rules based on tithi
  const startIndex = WEEKDAY_START_INDEX[weekday % 7];

  const horas: Hora[] = [];
  let activeHora: Hora | null = null;
  let activeTattva: TattvaPeriod | null = null;

  for (let i = 0; i < 24; i++) {
    const isDay = i < 12;
    const duration = isDay ? dayHoraDuration : nightHoraDuration;

    // Guarantee exact endpoints to prevent floating point drift
    const startTimeMs = i === 0 ? sunriseMs : horas[i - 1].endTimeMs;
    const endTimeMs = i === 11 ? sunsetMs : i === 23 ? nextSunriseMs : startTimeMs + duration;

    const ruler = HORA_LORDS[(startIndex + i) % 7];
    const nadi = i % 2 === 0 ? initialNadi : initialNadi === "ida" ? "pingala" : "ida";

    const tattvas: TattvaPeriod[] = [];
    let tattvaStartMs = startTimeMs;

    for (let t = 0; t < TATTVA_DEFS.length; t++) {
      const tDef = TATTVA_DEFS[t];
      const tDuration = duration * tDef.ratio;
      // Exact ending for the last tattva to avoid tiny gaps
      const tEndMs = t === TATTVA_DEFS.length - 1 ? endTimeMs : tattvaStartMs + tDuration;

      const tp: TattvaPeriod = {
        name: tDef.name,
        sanskrit: tDef.sanskrit,
        durationMs: tEndMs - tattvaStartMs,
        startTimeMs: tattvaStartMs,
        endTimeMs: tEndMs,
        startTime: formatHMS(new Date(tattvaStartMs), timeZone),
        endTime: formatHMS(new Date(tEndMs), timeZone),
      };

      tattvas.push(tp);

      // Half-open interval for current time match
      if (now >= tattvaStartMs && now < tEndMs) {
        activeTattva = tp;
      }

      tattvaStartMs = tEndMs;
    }

    const hora: Hora = {
      index: i + 1,
      isDay,
      startTimeMs,
      endTimeMs,
      durationMs: endTimeMs - startTimeMs,
      startTime: formatHMS(new Date(startTimeMs), timeZone),
      endTime: formatHMS(new Date(endTimeMs), timeZone),
      ruler,
      nadi,
      tattvas,
    };

    horas.push(hora);

    if (now >= startTimeMs && now < endTimeMs) {
      activeHora = hora;
    }
  }

  return {
    date: dateStr,
    horas,
    activeHora,
    activeTattva,
  };
}


export interface CurrentHoraData {
  hora: Hora;
  tattva: TattvaPeriod | null;
}

export function resolveCurrentHora(
  nowMs: number,
  data: PanchangaResponse
): CurrentHoraData | null {
  const sunrise = data.sunrise_ms;
  const sunset = data.sunset_ms;
  const nextSunrise = data.next_sunrise_ms;
  
  if (!sunrise || !sunset || !nextSunrise) return null;

  // If before today's sunrise, use previous day's data
  if (nowMs < sunrise) {
    const prevSunrise = data.previous_sunrise_ms;
    const prevSunset = data.previous_sunset_ms;
    
    if (prevSunrise && prevSunset) {
      const prevWeekday = (data.weekday - 1 + 7) % 7;
      const prevHoras = computeDailyHoras(
        data.date,
        prevSunrise,
        prevSunset,
        sunrise,
        prevWeekday,
        data.tithi[0]?.number || 1,
        data.timezone,
        nowMs
      );
      if (prevHoras.activeHora) {
        return { hora: prevHoras.activeHora, tattva: prevHoras.activeTattva };
      }
    }
  } 
  // If between today's sunrise and tomorrow's sunrise
  else if (nowMs >= sunrise && nowMs < nextSunrise) {
    const todayHoras = computeDailyHoras(
      data.date,
      sunrise,
      sunset,
      nextSunrise,
      data.weekday,
      data.tithi[0]?.number || 1,
      data.timezone,
      nowMs
    );
    if (todayHoras.activeHora) {
      return { hora: todayHoras.activeHora, tattva: todayHoras.activeTattva };
    }
  }

  return null;
}
