import { computeSwaraYoga } from './swaraYoga';

export interface TattvaPeriod {
  name: string;
  sanskrit: string;
  durationMs: number;
  startTime: string; // HH:mm:ss
  endTime: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface Hora {
  index: number;
  isDay: boolean;
  startTime: string;
  endTime: string;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  ruler: string;
  nadi: 'ida' | 'pingala' | 'sushumna';
  tattvas: TattvaPeriod[];
}

export interface DailyHoras {
  date: string;
  horas: Hora[];
  activeHora: Hora | null;
  activeTattva: TattvaPeriod | null;
}

const HORA_LORDS = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
const WEEKDAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4]; // Sun to Sat

const TATTVA_DEFS = [
  { name: 'Space', sanskrit: 'Akasha', ratio: 1 / 15, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { name: 'Air', sanskrit: 'Vayu', ratio: 2 / 15, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'Fire', sanskrit: 'Agni', ratio: 3 / 15, color: 'bg-red-100 text-red-800 border-red-200' },
  { name: 'Earth', sanskrit: 'Prithvi', ratio: 5 / 15, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'Water', sanskrit: 'Jala', ratio: 4 / 15, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
];

function formatHMS(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  const h12 = (date.getHours() % 12 || 12).toString().padStart(2, '0');
  return `${h12}:${m}:${s} ${ampm}`;
}

export function computeDailyHoras(
  dateStr: string,
  sunriseHours: number,
  sunsetHours: number,
  nextSunriseHours: number,
  weekday: number, // 0-6 (Sun-Sat)
  tithiNum: number,
  currentTimeMs?: number // optional real-time check
): DailyHoras {
  const now = currentTimeMs || Date.now();
  
  // Create base date for midnight of the provided dateStr (DD/MM/YYYY)
  const [dd, mm, yyyy] = dateStr.split('/');
  const baseDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const midnightMs = baseDate.getTime();
  
  const sunriseMs = midnightMs + sunriseHours * 3600000;
  const sunsetMs = midnightMs + sunsetHours * 3600000;
  const nextSunriseMs = midnightMs + nextSunriseHours * 3600000;
  
  const dayDurationMs = sunsetMs - sunriseMs;
  const nightDurationMs = nextSunriseMs - sunsetMs;
  
  const dayHoraDuration = dayDurationMs / 12;
  const nightHoraDuration = nightDurationMs / 12;

  const initialNadi = computeSwaraYoga(tithiNum, '00:00:00', '00:00:00').sunriseSwara; // sunrise Swara rules based on tithi
  const startIndex = WEEKDAY_START_INDEX[weekday % 7];

  const horas: Hora[] = [];
  let activeHora: Hora | null = null;
  let activeTattva: TattvaPeriod | null = null;

  for (let i = 0; i < 24; i++) {
    const isDay = i < 12;
    const duration = isDay ? dayHoraDuration : nightHoraDuration;
    const startTimeMs = isDay 
      ? sunriseMs + i * dayHoraDuration 
      : sunsetMs + (i - 12) * nightHoraDuration;
    const endTimeMs = startTimeMs + duration;
    
    const ruler = HORA_LORDS[(startIndex + i) % 7];
    const nadi = (i % 2 === 0) ? initialNadi : (initialNadi === 'ida' ? 'pingala' : 'ida');
    
    const tattvas: TattvaPeriod[] = [];
    let tattvaStartMs = startTimeMs;
    
    for (const tDef of TATTVA_DEFS) {
      const tDuration = duration * tDef.ratio;
      const tEndMs = tattvaStartMs + tDuration;
      
      const tp: TattvaPeriod = {
        name: tDef.name,
        sanskrit: tDef.sanskrit,
        durationMs: tDuration,
        startTimeMs: tattvaStartMs,
        endTimeMs: tEndMs,
        startTime: formatHMS(new Date(tattvaStartMs)),
        endTime: formatHMS(new Date(tEndMs)),
      };
      
      tattvas.push(tp);
      
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
      durationMs: duration,
      startTime: formatHMS(new Date(startTimeMs)),
      endTime: formatHMS(new Date(endTimeMs)),
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
    activeTattva
  };
}
