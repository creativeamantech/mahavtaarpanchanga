import * as Astronomy from 'astronomy-engine';
import fs from 'fs';
import path from 'path';
import type {
  CityLocation,
  CoordinateSelection,
  MonthSystem,
  PanchangaResponse,
  PlanetPosition,
  Segment,
  TimingInterval,
  PlanetTransitionEvent,
  PlanetTransitStatus,
  PlanetTransitionsData,
  TransitType,
} from '../src/types';

interface SanskritNamesData {
  masas: Record<string, string>;
  ekadashis: Record<string, { S: string; K: string }>;
  tithis: Record<string, string>;
  nakshatras: Record<string, string>;
  yogas: Record<string, string>;
  karanas: Record<string, string>;
  varas: Record<string, string>;
  samvats: Record<string, string>;
  ritus: Record<string, string>;
  gauri: Record<string, string[]>;
  planets: Record<string, string>;
  zodiac: Record<string, string>;
}

let citiesData: Record<string, any> = {};
let sanskritNames: SanskritNamesData | null = null;
let cityList: { key: string; name: string; country: string; population: number }[] = [];

export function initPanchangaEngine(rootDir: string = process.cwd()) {
  try {
    const namesPath = path.join(rootDir, 'data', 'sanskrit_names.json');
    if (fs.existsSync(namesPath)) {
      sanskritNames = JSON.parse(fs.readFileSync(namesPath, 'utf-8'));
    }

    const citiesPath = path.join(rootDir, 'data', 'cities.json');
    if (fs.existsSync(citiesPath)) {
      citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
      cityList = Object.entries(citiesData).map(([key, info]: [string, any]) => {
        return {
          key,
          name: key.split(',')[0].trim(),
          country: info.country || '',
          population: Number(info.population) || 0,
        };
      });
      // Sort city list by population descending for intuitive autocomplete
      cityList.sort((a, b) => b.population - a.population);
    }
  } catch (err) {
    console.error('Failed to initialize panchanga engine data:', err);
  }
}

export function searchCities(query: string, limit: number = 10): CityLocation[] {
  if (!query || query.trim().length === 0) {
    // Return top famous Indian and global cities by default
    const defaults = ['Bengaluru, IN', 'New Delhi, IN', 'Mumbai, IN', 'Chennai, IN', 'Kolkata, IN', 'Varanasi, IN', 'Tirupati, IN', 'London, GB', 'New York, US', 'Singapore, SG'];
    return defaults
      .filter((k) => citiesData[k])
      .map((k) => ({
        name: k,
        country: citiesData[k].country,
        latitude: citiesData[k].latitude,
        longitude: citiesData[k].longitude,
        timezone: citiesData[k].timezone,
        population: citiesData[k].population,
      }));
  }

  const cleanQuery = query.toLowerCase().trim();
  const results: { key: string; score: number }[] = [];

  for (const item of cityList) {
    const keyLower = item.key.toLowerCase();
    const nameLower = item.name.toLowerCase();

    if (nameLower === cleanQuery) {
      results.push({ key: item.key, score: 1000 + item.population });
    } else if (nameLower.startsWith(cleanQuery)) {
      results.push({ key: item.key, score: 500 + item.population });
    } else if (keyLower.startsWith(cleanQuery)) {
      results.push({ key: item.key, score: 300 + item.population });
    } else if (nameLower.includes(cleanQuery)) {
      results.push({ key: item.key, score: 100 + item.population });
    } else if (keyLower.includes(cleanQuery)) {
      results.push({ key: item.key, score: 50 + item.population });
    }

    if (results.length >= 100 && item.population < 50000) {
      break;
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map((r) => {
    const info = citiesData[r.key];
    return {
      name: r.key,
      country: info.country,
      latitude: info.latitude,
      longitude: info.longitude,
      timezone: info.timezone,
      population: info.population,
    };
  });
}

export function findNearestCity(lat: number, lon: number): { city: CityLocation; distanceKm: number } | null {
  if (!citiesData || Object.keys(citiesData).length === 0) return null;
  let closest: CityLocation | null = null;
  let minDistance = Infinity;

  for (const [key, info] of Object.entries(citiesData)) {
    const cLat = (info as any).latitude;
    const cLon = (info as any).longitude;
    if (typeof cLat !== 'number' || typeof cLon !== 'number') continue;

    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = ((cLat - lat) * Math.PI) / 180;
    const dLon = ((cLon - lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((cLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    if (dist < minDistance) {
      minDistance = dist;
      closest = {
        name: key,
        country: (info as any).country || '',
        latitude: cLat,
        longitude: cLon,
        timezone: (info as any).timezone || 'Asia/Kolkata',
        population: (info as any).population,
      };
    }
  }

  return closest ? { city: closest, distanceKm: Math.round(minDistance) } : null;
}

export function resolveCity(cityName: string): CityLocation {
  const direct = citiesData[cityName];
  if (direct) {
    return {
      name: cityName,
      country: direct.country,
      latitude: direct.latitude,
      longitude: direct.longitude,
      timezone: direct.timezone,
      population: direct.population,
    };
  }

  const query = cityName.toLowerCase().trim();
  for (const [key, info] of Object.entries(citiesData)) {
    if (key.toLowerCase() === query || key.toLowerCase().startsWith(query + ',')) {
      return {
        name: key,
        country: info.country,
        latitude: info.latitude,
        longitude: info.longitude,
        timezone: info.timezone,
        population: info.population,
      };
    }
  }

  // Fallback to top match
  const matches = searchCities(cityName, 1);
  if (matches.length > 0) {
    return matches[0];
  }

  // Default to Bengaluru, India if totally unrecognized
  return {
    name: 'Bengaluru, IN',
    country: 'IN',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
    population: 8443675,
  };
}

function getTimezoneOffsetHours(timeZone: string, date: Date): number {
  try {
    const str = date.toLocaleString('en-US', { timeZone, timeZoneName: 'shortOffset' });
    const match = str.match(/GMT([+-]\d+)(?::(\d+))?/);
    if (!match) return 5.5;
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours >= 0 ? hours + minutes / 60 : hours - minutes / 60;
  } catch {
    return 5.5; // default IST
  }
}

export function calculateAyanamsa(t: Astronomy.AstroTime, key: CoordinateSelection): number {
  if (key === 'tropical') {
    return 0.0;
  }
  // In astronomy-engine, t.ut is days since J2000.0 (JD 2451545.0)
  const T = t.ut / 36525.0;
  // Lahiri (Chitra Paksha) ayanamsa in degrees
  const lahiri = 23.857092 + 1.3969713 * T + 0.0003086 * T * T;

  switch (key) {
    case 'citra':
      return lahiri;
    case 'revati':
      return lahiri - 0.25;
    case 'rohini':
      return lahiri + 1.25;
    case 'pushya':
      return lahiri - 0.50;
    case 'mula':
      return lahiri + 0.75;
    case 'krishnamurti':
      return lahiri - 0.0980556;
    case 'raman':
      return lahiri - 1.4666667;
    default:
      return lahiri;
  }
}

export function formatTimeHMS(totalHours: number): string {
  if (isNaN(totalHours)) return '--:--:--';
  const isNegative = totalHours < 0;
  const absHours = Math.abs(totalHours);
  const h = Math.floor(absHours);
  const remMinutes = (absHours - h) * 60;
  const m = Math.floor(remMinutes);
  const s = Math.floor((remMinutes - m) * 60);

  const sign = isNegative ? '-' : '';
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return `${sign}${hh}:${mm}:${ss}`;
}

export function formatDegreesDMS(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  const d = Math.floor(norm);
  const remM = (norm - d) * 60;
  const m = Math.floor(remM);
  const s = Math.floor((remM - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

function getTropicalSunLon(t: Astronomy.AstroTime): number {
  return Astronomy.SunPosition(t).elon;
}

function getTropicalMoonLon(t: Astronomy.AstroTime): number {
  const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, t, true);
  return Astronomy.Ecliptic(moonGeo).elon;
}

function getSiderealLon(tropicalLon: number, ayanamsa: number): number {
  return ((tropicalLon - ayanamsa) % 360 + 360) % 360;
}

function getTithiFraction(t: Astronomy.AstroTime): number {
  const sunLon = getTropicalSunLon(t);
  const moonLon = getTropicalMoonLon(t);
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  return diff / 12.0;
}

function getNakshatraFraction(t: Astronomy.AstroTime, ayanamsaKey: CoordinateSelection): number {
  const ayanamsa = calculateAyanamsa(t, ayanamsaKey);
  const moonLon = getSiderealLon(getTropicalMoonLon(t), ayanamsa);
  return moonLon / (360.0 / 27.0);
}

function getYogaFraction(t: Astronomy.AstroTime, ayanamsaKey: CoordinateSelection): number {
  const ayanamsa = calculateAyanamsa(t, ayanamsaKey);
  const sunLon = getSiderealLon(getTropicalSunLon(t), ayanamsa);
  const moonLon = getSiderealLon(getTropicalMoonLon(t), ayanamsa);
  const sum = (sunLon + moonLon) % 360;
  return sum / (360.0 / 27.0);
}

function getKaranaFraction(t: Astronomy.AstroTime): number {
  const sunLon = getTropicalSunLon(t);
  const moonLon = getTropicalMoonLon(t);
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  return diff / 6.0;
}

// Bisection root finder to find the exact moment a celestial variable crosses a target boundary
function findBoundaryCrossing(
  fn: (t: Astronomy.AstroTime) => number,
  target: number,
  tMin: Astronomy.AstroTime,
  tMax: Astronomy.AstroTime,
  maxIterations: number = 30
): Astronomy.AstroTime | null {
  const period = 360;
  let t1 = tMin.date.getTime();
  let t2 = tMax.date.getTime();

  // Evaluate at intervals of 1 hour to detect crossing
  const stepMs = 30 * 60 * 1000;
  let bracketA = t1;
  let bracketB = t2;
  let foundBracket = false;

  let prevT = t1;
  let prevVal = fn(Astronomy.MakeTime(new Date(prevT)));
  let prevDiff = (prevVal - target) % period;
  if (prevDiff > period / 2) prevDiff -= period;
  if (prevDiff < -period / 2) prevDiff += period;

  for (let curT = t1 + stepMs; curT <= t2 + stepMs; curT += stepMs) {
    const curTimeObj = Astronomy.MakeTime(new Date(curT));
    const curVal = fn(curTimeObj);
    let curDiff = (curVal - target) % period;
    if (curDiff > period / 2) curDiff -= period;
    if (curDiff < -period / 2) curDiff += period;

    if (prevDiff * curDiff <= 0 && Math.abs(curDiff - prevDiff) < period / 2) {
      bracketA = prevT;
      bracketB = curT;
      foundBracket = true;
      break;
    }
    prevT = curT;
    prevDiff = curDiff;
  }

  if (!foundBracket) {
    return null;
  }

  // Refine bracket using bisection
  let low = bracketA;
  let high = bracketB;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const midTime = Astronomy.MakeTime(new Date(mid));
    const midVal = fn(midTime);
    let midDiff = (midVal - target) % period;
    if (midDiff > period / 2) midDiff -= period;
    if (midDiff < -period / 2) midDiff += period;

    if (Math.abs(midDiff) < 1e-6 || Math.abs(high - low) < 1000) {
      return midTime;
    }

    const lowTime = Astronomy.MakeTime(new Date(low));
    const lowVal = fn(lowTime);
    let lowDiff = (lowVal - target) % period;
    if (lowDiff > period / 2) lowDiff -= period;
    if (lowDiff < -period / 2) lowDiff += period;

    if (lowDiff * midDiff <= 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return Astronomy.MakeTime(new Date((low + high) / 2));
}

// Find segments (current and consecutive) between sunrise and next sunrise
function findSegments(
  fn: (t: Astronomy.AstroTime) => number,
  namesMap: Record<string, string>,
  tSunrise: Astronomy.AstroTime,
  tNextSunrise: Astronomy.AstroTime,
  localMidnight: Date,
  totalItems: number = 30
): Segment[] {
  const vSunrise = fn(tSunrise);
  const currentNum = (Math.floor(vSunrise) % totalItems) + 1;
  const segments: Segment[] = [];

  const name = namesMap[currentNum.toString()] || `Item ${currentNum}`;
  let target = Math.floor(vSunrise) + 1;

  const crossing = findBoundaryCrossing(fn, target, tSunrise, tNextSunrise);

  if (crossing && crossing.date.getTime() <= tNextSunrise.date.getTime()) {
    const localHours = (crossing.date.getTime() - localMidnight.getTime()) / 3600000;
    const endsStr = formatTimeHMS(localHours);
    segments.push({
      number: currentNum,
      name,
      ends: endsStr,
    });

    // Check for a second segment (Vriddhi/consecutive item) before next sunrise
    const nextNum = (currentNum % totalItems) + 1;
    const nextName = namesMap[nextNum.toString()] || `Item ${nextNum}`;
    const target2 = target + 1;
    const crossing2 = findBoundaryCrossing(fn, target2, crossing, tNextSunrise);

    if (crossing2 && crossing2.date.getTime() <= tNextSunrise.date.getTime()) {
      const localHours2 = (crossing2.date.getTime() - localMidnight.getTime()) / 3600000;
      segments.push({
        number: nextNum,
        name: nextName,
        ends: formatTimeHMS(localHours2),
      });
    } else {
      segments.push({
        number: nextNum,
        name: nextName,
        ends: null,
      });
    }
  } else {
    // Current segment lasts all day past next sunrise
    segments.push({
      number: currentNum,
      name,
      ends: null,
    });
  }

  return segments;
}

const VARJYAM_START_GHATIS = [
  0, 50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30,
];

const SANKRANTI_NAMES = [
  'Meṣa Saṅkrānti',
  'Vṛṣabha Saṅkrānti',
  'Mithuna Saṅkrānti',
  'Karkaṭa Saṅkrānti',
  'Siṁha Saṅkrānti',
  'Kanyā Saṅkrānti',
  'Tulā Saṅkrānti',
  'Vṛścika Saṅkrānti',
  'Dhanu Saṅkrānti',
  'Makara Saṅkrānti',
  'Kumbha Saṅkrānti',
  'Mīna Saṅkrānti',
];

const ZODIAC_NAMES_DATA: Array<{ en: string; hi: string; sa: string }> = [
  { en: 'Aries', hi: 'मेष', sa: 'मेष' },
  { en: 'Taurus', hi: 'वृषभ', sa: 'वृषभ' },
  { en: 'Gemini', hi: 'मिथुन', sa: 'मिथुन' },
  { en: 'Cancer', hi: 'कर्क', sa: 'कर्क' },
  { en: 'Leo', hi: 'सिंह', sa: 'सिंह' },
  { en: 'Virgo', hi: 'कन्या', sa: 'कन्या' },
  { en: 'Libra', hi: 'तुला', sa: 'तुला' },
  { en: 'Scorpio', hi: 'वृश्चिक', sa: 'वृश्चिक' },
  { en: 'Sagittarius', hi: 'धनु', sa: 'धनु' },
  { en: 'Capricorn', hi: 'मकर', sa: 'मकर' },
  { en: 'Aquarius', hi: 'कुम्भ', sa: 'कुम्भ' },
  { en: 'Pisces', hi: 'मीन', sa: 'मीन' },
];

const NAKSHATRA_NAMES_DATA: Array<{ en: string; hi: string; sa: string }> = [
  { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी' },
  { en: 'Bharani', hi: 'भरणी', sa: 'भरणी' },
  { en: 'Krittika', hi: 'कृत्तिका', sa: 'कृत्तिका' },
  { en: 'Rohini', hi: 'रोहिणी', sa: 'रोहिणी' },
  { en: 'Mrigashirsha', hi: 'मृगशिरा', sa: 'मृगशीर्षा' },
  { en: 'Ardra', hi: 'आर्द्रा', sa: 'आर्द्रा' },
  { en: 'Punarvasu', hi: 'पुनर्वसु', sa: 'पुनर्वसु' },
  { en: 'Pushya', hi: 'पुष्य', sa: 'पुष्य' },
  { en: 'Ashlesha', hi: 'आश्लेषा', sa: 'आश्लेषा' },
  { en: 'Magha', hi: 'मघा', sa: 'मघा' },
  { en: 'Purva Phalguni', hi: 'पूर्वा फाल्गुनी', sa: 'पूर्वाफाल्गुनी' },
  { en: 'Uttara Phalguni', hi: 'उत्तरा फाल्गुनी', sa: 'उत्तराफाल्गुनी' },
  { en: 'Hasta', hi: 'हस्त', sa: 'हस्त' },
  { en: 'Chitra', hi: 'चित्रा', sa: 'चित्रा' },
  { en: 'Swati', hi: 'स्वाति', sa: 'स्वाती' },
  { en: 'Vishakha', hi: 'विशाखा', sa: 'विशाखा' },
  { en: 'Anuradha', hi: 'अनुराधा', sa: 'अनुराधा' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठा', sa: 'ज्येष्ठा' },
  { en: 'Mula', hi: 'मूल', sa: 'मूल' },
  { en: 'Purva Ashadha', hi: 'पूर्वाषाढ़ा', sa: 'पूर्वाषाढा' },
  { en: 'Uttara Ashadha', hi: 'उत्तराषाढ़ा', sa: 'उत्तराषाढा' },
  { en: 'Shravana', hi: 'श्रवण', sa: 'श्रवण' },
  { en: 'Dhanishta', hi: 'धनिष्ठा', sa: 'धनिष्ठा' },
  { en: 'Shatabhisha', hi: 'शतभिषा', sa: 'शतभिषा' },
  { en: 'Purva Bhadrapada', hi: 'पूर्वा भाद्रपद', sa: 'पूर्वभाद्रपदा' },
  { en: 'Uttara Bhadrapada', hi: 'उत्तरा भाद्रपद', sa: 'उत्तरभाद्रपदा' },
  { en: 'Revati', hi: 'रेवती', sa: 'रेवती' },
];

function formatDateInTz(d: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  } catch {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  }
}

function formatTimeInTz(d: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(d);
  } catch {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }
}

function formatDayOfWeekInTz(d: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(d);
  } catch {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getUTCDay()];
  }
}

function formatRelativeTime(targetDate: Date, baseDate: Date): string {
  const diffMs = targetDate.getTime() - baseDate.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const totalMinutes = Math.floor(absMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const remMins = totalMinutes % 60;

  if (days === 0) {
    if (totalHours === 0) {
      return isPast ? `${remMins}m ago` : `in ${remMins}m`;
    }
    return isPast ? `${totalHours}h ${remMins}m ago` : `in ${totalHours}h ${remMins}m`;
  }
  if (days === 1) {
    return isPast ? `yesterday` : `in 1d ${remHours}h`;
  }
  return isPast ? `${days}d ago` : `in ${days}d ${remHours}h`;
}

function getBodySiderealLongitude(bodyId: string, t: Astronomy.AstroTime, ayanamsaKey: CoordinateSelection): number {
  let tropLon = 0;
  if (bodyId === 'sun') {
    tropLon = Astronomy.SunPosition(t).elon;
  } else if (bodyId === 'moon') {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, t, true)).elon;
  } else if (bodyId === 'mars') {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Mars, t, true)).elon;
  } else if (bodyId === 'mercury') {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Mercury, t, true)).elon;
  } else if (bodyId === 'jupiter') {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Jupiter, t, true)).elon;
  } else if (bodyId === 'venus') {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Venus, t, true)).elon;
  } else if (bodyId === 'saturn') {
    tropLon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Saturn, t, true)).elon;
  } else if (bodyId === 'rahu' || bodyId === 'ketu') {
    const T = t.ut / 36525.0;
    let r = (125.04452 - 1934.136261 * T + 0.0020708 * T * T) % 360;
    if (r < 0) r += 360;
    tropLon = bodyId === 'rahu' ? r : (r + 180) % 360;
  }
  const ayanamsa = calculateAyanamsa(t, ayanamsaKey);
  return ((tropLon - ayanamsa) % 360 + 360) % 360;
}

function getRasiTransitDescription(
  planetId: string,
  planetName: string,
  toRasiNameEn: string,
  toRasiNameHi: string,
  toRasiNameSa: string,
  specialName?: string
) {
  if (planetId === 'sun' && specialName) {
    return {
      en: `Sūrya enters ${toRasiNameEn} marking sacred ${specialName}. Auspicious period for solar worship, charity (Dāna), ancestor homage (Tarpaṇa), and spiritual sadhana.`,
      hi: `सूर्य का ${toRasiNameHi} में प्रवेश — पावन ${specialName}। सूर्य तर्पण, दान-पुण्य, पितृ शांति एवं जप-तप हेतु विशेष फलदायी।`,
      sa: `सूर्यस्य ${toRasiNameSa}प्रवेशः (${specialName})। पितृतर्पण-दान-जप-सूर्यपूजनार्थं महापुण्यप्रदः कालः।`,
    };
  }
  if (planetId === 'moon') {
    return {
      en: `Candra enters ${toRasiNameEn} (Chandra Gochara). Influences mental tranquility, emotional rhythm, and daily astrological favorability.`,
      hi: `चन्द्रमा का ${toRasiNameHi} में प्रवेश (चंद्र गोचर)। मनोबल, मानसिक शांति व दैनिक शुभ कार्यों को प्रभावित करता है।`,
      sa: `चन्द्रस्य ${toRasiNameSa}प्रवेशः। मनोवृत्ति-सौभाग्य-दैनिकगोचरप्रभावाय शुभप्रदः।`,
    };
  }
  if (planetId === 'mars') {
    return {
      en: `Maṅgala enters ${toRasiNameEn}. Energizes courage, physical vigor, property ventures, and bold undertakings.`,
      hi: `मंगल का ${toRasiNameHi} में प्रवेश। साहस, पराक्रम, भूमि व ऊर्जा संबंधी कार्यों पर प्रभाव।`,
      sa: `मङ्गलस्य ${toRasiNameSa}प्रवेशः। पराक्रम-ऊर्जा-विजयकार्यार्थं फलप्रदः।`,
    };
  }
  if (planetId === 'mercury') {
    return {
      en: `Budha enters ${toRasiNameEn}. Enhances intellect, commercial negotiations, speech, and mathematical precision.`,
      hi: `बुध का ${toRasiNameHi} में प्रवेश। बुद्धि, वाणी, व्यापार व कलात्मक निर्णयों के लिए अनुकूल।`,
      sa: `बुधस्य ${toRasiNameSa}प्रवेशः। बुद्धि-विद्या-वाणिज्य-संवादार्थं शुभकरः।`,
    };
  }
  if (planetId === 'jupiter') {
    return {
      en: `Guru (Bṛhaspati) enters ${toRasiNameEn}. Major divine blessing for wisdom, dharma, progeny, higher knowledge, and auspicious ceremonies.`,
      hi: `देवगुरु बृहस्पति का ${toRasiNameHi} में प्रवेश। ज्ञान, धर्म, संतति एवं मांगलिक आयोजनों के लिए अत्यंत कल्याणकारी।`,
      sa: `गुरोः ${toRasiNameSa}प्रवेशः। धर्म-विद्या-माङ्गलिककार्याणां कृते परमशुभप्रदः।`,
    };
  }
  if (planetId === 'venus') {
    return {
      en: `Śukra enters ${toRasiNameEn}. Auspicious for creative arts, aesthetic grace, marital harmony, and prosperity.`,
      hi: `शुक्र का ${toRasiNameHi} में प्रवेश। सुख-समृद्धि, कला, सौंदर्य एवं दांपत्य सौहार्द को बढ़ाता है।`,
      sa: `शुक्रस्य ${toRasiNameSa}प्रवेशः। सौन्दर्य-समृद्धि-कलानां कृते शुभप्रदः।`,
    };
  }
  if (planetId === 'saturn') {
    return {
      en: `Śani enters ${toRasiNameEn}. Karmic milestone; rewards perseverance, justice, discipline, and devotion to righteous conduct.`,
      hi: `शनि देव का ${toRasiNameHi} में प्रवेश। महत्वपूर्ण कर्मफल गोचर; अनुशासन, संयम व धर्मपालन का संदेश।`,
      sa: `शनेः ${toRasiNameSa}प्रवेशः। कर्मफल-संयम-न्यायधर्मपालनार्थं विशेषकालः।`,
    };
  }
  if (planetId === 'rahu' || planetId === 'ketu') {
    return {
      en: `${planetName} retrogrades into ${toRasiNameEn}. Significant nodal shift guiding karmic purification and spiritual transformation.`,
      hi: `${planetName} का वक्री गति से ${toRasiNameHi} में प्रवेश। आध्यात्मिक मंथन व गहन जीवन परिवर्तन का काल।`,
      sa: `राहोः/केतोः वक्रगत्या ${toRasiNameSa}प्रवेशः। आत्मनिरीक्षण-आध्यात्मिकपरिवर्तनार्थं कारकः।`,
    };
  }
  return {
    en: `${planetName} enters ${toRasiNameEn}.`,
    hi: `${planetName} का ${toRasiNameHi} में प्रवेश।`,
    sa: `${planetName}स्य ${toRasiNameSa}प्रवेशः।`,
  };
}

export function calculatePlanetTransitions(
  location: CityLocation,
  tSunrise: Astronomy.AstroTime,
  tNextSunrise: Astronomy.AstroTime,
  ayanamsaKey: CoordinateSelection,
  civilDate: Date
): PlanetTransitionsData {
  const timeZone = location.timezone || 'Asia/Kolkata';
  const baseDate = tSunrise.date;
  const sunLon = getBodySiderealLongitude('sun', tSunrise, ayanamsaKey);

  const grahas: Array<{
    id: string;
    name: string;
    sanskritName: string;
    symbol: string;
    stepHours: number;
    maxScanHours: number;
  }> = [
    { id: 'sun', name: 'Sun', sanskritName: 'Sūrya', symbol: '☉', stepHours: 3, maxScanHours: 35 * 24 },
    { id: 'moon', name: 'Moon', sanskritName: 'Candra', symbol: '☽', stepHours: 1, maxScanHours: 4 * 24 },
    { id: 'mars', name: 'Mars', sanskritName: 'Maṅgala', symbol: '♂', stepHours: 3, maxScanHours: 70 * 24 },
    { id: 'mercury', name: 'Mercury', sanskritName: 'Budha', symbol: '☿', stepHours: 3, maxScanHours: 50 * 24 },
    { id: 'jupiter', name: 'Jupiter', sanskritName: 'Guru', symbol: '♃', stepHours: 12, maxScanHours: 400 * 24 },
    { id: 'venus', name: 'Venus', sanskritName: 'Śukra', symbol: '♀', stepHours: 3, maxScanHours: 50 * 24 },
    { id: 'saturn', name: 'Saturn', sanskritName: 'Śani', symbol: '♄', stepHours: 12, maxScanHours: 800 * 24 },
    { id: 'rahu', name: 'Rahu', sanskritName: 'Rāhu', symbol: '☊', stepHours: 12, maxScanHours: 600 * 24 },
    { id: 'ketu', name: 'Ketu', sanskritName: 'Ketu', symbol: '☋', stepHours: 12, maxScanHours: 600 * 24 },
  ];

  const planetStatuses: PlanetTransitStatus[] = [];
  const upcomingEvents: PlanetTransitionEvent[] = [];

  for (const g of grahas) {
    const currentLon = getBodySiderealLongitude(g.id, tSunrise, ayanamsaKey);
    const rasiIdx = Math.floor(currentLon / 30);
    const degInRasiNum = currentLon % 30;
    const degInRasiStr = formatDegreesDMS(degInRasiNum);
    const progressPercent = Math.min(100, Math.max(0, Math.round((degInRasiNum / 30.0) * 100)));

    const nakIdx = Math.floor(currentLon / (360.0 / 27.0));
    const pada = Math.floor((currentLon % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

    // Check motion (isRetrograde)
    let isRetrograde = false;
    if (g.id === 'rahu' || g.id === 'ketu') {
      isRetrograde = true;
    } else if (g.id === 'sun' || g.id === 'moon') {
      isRetrograde = false;
    } else {
      const tNext = Astronomy.MakeTime(new Date(baseDate.getTime() + 3600000));
      const nextLon = getBodySiderealLongitude(g.id, tNext, ayanamsaKey);
      let speed = (nextLon - currentLon) % 360;
      if (speed > 180) speed -= 360;
      if (speed < -180) speed += 360;
      isRetrograde = speed < 0;
    }

    // Check Combustion (Asta)
    let isCombust = false;
    let combustDistanceDeg: number | undefined;
    if (['mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(g.id)) {
      const angDiff = Math.abs((currentLon - sunLon + 540) % 360 - 180);
      combustDistanceDeg = Math.round(angDiff * 10) / 10;
      let limit = 15;
      if (g.id === 'mercury') limit = isRetrograde ? 12 : 14;
      else if (g.id === 'venus') limit = isRetrograde ? 8 : 10;
      else if (g.id === 'mars') limit = 17;
      else if (g.id === 'jupiter') limit = 11;
      else if (g.id === 'saturn') limit = 15;
      isCombust = angDiff <= limit;
    }

    // 1. Next Rasi Transit Search
    let nextRasiTransit: PlanetTransitionEvent | undefined;
    {
      let curMs = baseDate.getTime();
      let prevMs = curMs;
      const endMs = baseDate.getTime() + g.maxScanHours * 3600000;
      const stepMs = g.stepHours * 3600000;

      while (curMs < endMs) {
        curMs += stepMs;
        const testLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(curMs)), ayanamsaKey);
        const testRasi = Math.floor(testLon / 30);
        if (testRasi !== rasiIdx) {
          // Bisection root find between prevMs and curMs
          let low = prevMs;
          let high = curMs;
          while (high - low > 30000) {
            const mid = (low + high) / 2;
            const midLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(mid)), ayanamsaKey);
            if (Math.floor(midLon / 30) === rasiIdx) {
              low = mid;
            } else {
              high = mid;
            }
          }
          const transitDate = new Date(high);
          const toRasi = Math.floor(getBodySiderealLongitude(g.id, Astronomy.MakeTime(transitDate), ayanamsaKey) / 30);
          const fromRasiInfo = ZODIAC_NAMES_DATA[rasiIdx] || { en: 'Aries', hi: 'मेष', sa: 'मेष' };
          const toRasiInfo = ZODIAC_NAMES_DATA[toRasi] || { en: 'Aries', hi: 'मेष', sa: 'मेष' };

          let specialName: string | undefined;
          let punyaKala: TimingInterval | undefined;
          let mahaPunyaKala: TimingInterval | undefined;

          if (g.id === 'sun') {
            specialName = SANKRANTI_NAMES[toRasi];
            const pStart = new Date(transitDate.getTime() - 6.4 * 3600000);
            const pEnd = new Date(transitDate.getTime() + 6.4 * 3600000);
            punyaKala = {
              start: formatTimeInTz(pStart, timeZone),
              end: formatTimeInTz(pEnd, timeZone),
              name: `${specialName} Puṇyakāla`,
            };
            const mpStart = new Date(transitDate.getTime() - 1.6 * 3600000);
            const mpEnd = new Date(transitDate.getTime() + 1.6 * 3600000);
            mahaPunyaKala = {
              start: formatTimeInTz(mpStart, timeZone),
              end: formatTimeInTz(mpEnd, timeZone),
              name: `${specialName} Mahāpuṇyakāla`,
            };
          }

          const isToday =
            transitDate.getTime() >= tSunrise.date.getTime() &&
            transitDate.getTime() <= tNextSunrise.date.getTime();

          const desc = getRasiTransitDescription(
            g.id,
            g.sanskritName,
            toRasiInfo.en,
            toRasiInfo.hi,
            toRasiInfo.sa,
            specialName
          );

          nextRasiTransit = {
            id: `${g.id}-rasi-${transitDate.getTime()}`,
            planetId: g.id,
            planetName: g.name,
            sanskritName: g.sanskritName,
            symbol: g.symbol,
            type: 'rasi',
            timestamp: transitDate.toISOString(),
            dateStr: formatDateInTz(transitDate, timeZone),
            timeStr: formatTimeInTz(transitDate, timeZone),
            dayOfWeek: formatDayOfWeekInTz(transitDate, timeZone),
            relativeText: formatRelativeTime(transitDate, baseDate),
            isToday,
            fromValue: fromRasiInfo.en,
            toValue: toRasiInfo.en,
            fromName: fromRasiInfo.sa,
            toName: toRasiInfo.sa,
            specialName,
            punyaKala,
            mahaPunyaKala,
            description: desc,
          };
          break;
        }
        prevMs = curMs;
      }
    }

    // 2. Next Nakshatra Transit Search
    let nextNakshatraTransit: PlanetTransitionEvent | undefined;
    {
      let curMs = baseDate.getTime();
      let prevMs = curMs;
      const nakScanHours = g.id === 'moon' ? 36 : Math.min(g.maxScanHours, 120 * 24);
      const endMs = baseDate.getTime() + nakScanHours * 3600000;
      const stepMs = (g.id === 'moon' ? 1 : 2) * 3600000;

      while (curMs < endMs) {
        curMs += stepMs;
        const testLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(curMs)), ayanamsaKey);
        const testNak = Math.floor(testLon / (360.0 / 27.0));
        if (testNak !== nakIdx) {
          let low = prevMs;
          let high = curMs;
          while (high - low > 30000) {
            const mid = (low + high) / 2;
            const midLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(mid)), ayanamsaKey);
            if (Math.floor(midLon / (360.0 / 27.0)) === nakIdx) {
              low = mid;
            } else {
              high = mid;
            }
          }
          const transitDate = new Date(high);
          const toNak = Math.floor(getBodySiderealLongitude(g.id, Astronomy.MakeTime(transitDate), ayanamsaKey) / (360.0 / 27.0));
          const fromNakInfo = NAKSHATRA_NAMES_DATA[nakIdx] || { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी' };
          const toNakInfo = NAKSHATRA_NAMES_DATA[toNak] || { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी' };

          const isToday =
            transitDate.getTime() >= tSunrise.date.getTime() &&
            transitDate.getTime() <= tNextSunrise.date.getTime();

          nextNakshatraTransit = {
            id: `${g.id}-nak-${transitDate.getTime()}`,
            planetId: g.id,
            planetName: g.name,
            sanskritName: g.sanskritName,
            symbol: g.symbol,
            type: 'nakshatra',
            timestamp: transitDate.toISOString(),
            dateStr: formatDateInTz(transitDate, timeZone),
            timeStr: formatTimeInTz(transitDate, timeZone),
            dayOfWeek: formatDayOfWeekInTz(transitDate, timeZone),
            relativeText: formatRelativeTime(transitDate, baseDate),
            isToday,
            fromValue: fromNakInfo.en,
            toValue: toNakInfo.en,
            fromName: fromNakInfo.sa,
            toName: toNakInfo.sa,
            description: {
              en: `${g.name} enters ${toNakInfo.en} Nakṣatra (${toNakInfo.sa}). Shifts subtle cosmic resonance and lunar-planetary vibration.`,
              hi: `${g.sanskritName} का ${toNakInfo.hi} नक्षत्र में प्रवेश। सूक्ष्म ऊर्जा एवं नक्षत्र चरण प्रभाव में परिवर्तन।`,
              sa: `${g.sanskritName}स्य ${toNakInfo.sa}नक्षत्रे प्रवेशः। सूक्ष्मतरङ्गपरिवर्तनं जनयति।`,
            },
          };
          break;
        }
        prevMs = curMs;
      }
    }

    const curRasiInfo = ZODIAC_NAMES_DATA[rasiIdx] || { en: 'Aries', hi: 'मेष', sa: 'मेष' };
    const curNakInfo = NAKSHATRA_NAMES_DATA[nakIdx] || { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी' };

    planetStatuses.push({
      planetId: g.id,
      planetName: g.name,
      sanskritName: g.sanskritName,
      symbol: g.symbol,
      currentRasi: curRasiInfo.sa,
      currentRasiNumber: rasiIdx + 1,
      degreesInRasi: degInRasiStr,
      degreesInRasiNum: degInRasiNum,
      progressPercent,
      currentNakshatra: curNakInfo.sa,
      currentNakshatraNumber: nakIdx + 1,
      currentPada: pada,
      isRetrograde,
      isCombust,
      combustDistanceDeg,
      nextRasiTransit,
      nextNakshatraTransit,
    });
  }

  // 3. Scan Upcoming Timeline Events across the next 60 days
  const timelineEndMs = baseDate.getTime() + 60 * 86400000;
  for (const g of grahas) {
    let curMs = baseDate.getTime();
    let prevMs = curMs;
    let prevRasi = Math.floor(getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(curMs)), ayanamsaKey) / 30);
    const stepHours = g.id === 'moon' ? 2 : 6;
    const stepMs = stepHours * 3600000;

    while (curMs < timelineEndMs) {
      curMs += stepMs;
      const testLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(curMs)), ayanamsaKey);
      const testRasi = Math.floor(testLon / 30);
      if (testRasi !== prevRasi) {
        let low = prevMs;
        let high = curMs;
        while (high - low > 30000) {
          const mid = (low + high) / 2;
          const midLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(mid)), ayanamsaKey);
          if (Math.floor(midLon / 30) === prevRasi) {
            low = mid;
          } else {
            high = mid;
          }
        }
        const transitDate = new Date(high);
        const toRasi = Math.floor(getBodySiderealLongitude(g.id, Astronomy.MakeTime(transitDate), ayanamsaKey) / 30);
        const fromRasiInfo = ZODIAC_NAMES_DATA[prevRasi] || { en: 'Aries', hi: 'मेष', sa: 'मेष' };
        const toRasiInfo = ZODIAC_NAMES_DATA[toRasi] || { en: 'Aries', hi: 'मेष', sa: 'मेष' };

        let specialName: string | undefined;
        let punyaKala: TimingInterval | undefined;
        let mahaPunyaKala: TimingInterval | undefined;

        if (g.id === 'sun') {
          specialName = SANKRANTI_NAMES[toRasi];
          const pStart = new Date(transitDate.getTime() - 6.4 * 3600000);
          const pEnd = new Date(transitDate.getTime() + 6.4 * 3600000);
          punyaKala = {
            start: formatTimeInTz(pStart, timeZone),
            end: formatTimeInTz(pEnd, timeZone),
            name: `${specialName} Puṇyakāla`,
          };
          const mpStart = new Date(transitDate.getTime() - 1.6 * 3600000);
          const mpEnd = new Date(transitDate.getTime() + 1.6 * 3600000);
          mahaPunyaKala = {
            start: formatTimeInTz(mpStart, timeZone),
            end: formatTimeInTz(mpEnd, timeZone),
            name: `${specialName} Mahāpuṇyakāla`,
          };
        }

        const isToday =
          transitDate.getTime() >= tSunrise.date.getTime() &&
          transitDate.getTime() <= tNextSunrise.date.getTime();

        const desc = getRasiTransitDescription(
          g.id,
          g.sanskritName,
          toRasiInfo.en,
          toRasiInfo.hi,
          toRasiInfo.sa,
          specialName
        );

        upcomingEvents.push({
          id: `${g.id}-rasi-${transitDate.getTime()}`,
          planetId: g.id,
          planetName: g.name,
          sanskritName: g.sanskritName,
          symbol: g.symbol,
          type: 'rasi',
          timestamp: transitDate.toISOString(),
          dateStr: formatDateInTz(transitDate, timeZone),
          timeStr: formatTimeInTz(transitDate, timeZone),
          dayOfWeek: formatDayOfWeekInTz(transitDate, timeZone),
          relativeText: formatRelativeTime(transitDate, baseDate),
          isToday,
          fromValue: fromRasiInfo.en,
          toValue: toRasiInfo.en,
          fromName: fromRasiInfo.sa,
          toName: toRasiInfo.sa,
          specialName,
          punyaKala,
          mahaPunyaKala,
          description: desc,
        });

        prevRasi = testRasi;
      }
      prevMs = curMs;
    }
  }

  // Also include major planetary nakshatra transits over next 45 days (excluding rapid moon to prevent overwhelming timeline)
  const nakTimelineEndMs = baseDate.getTime() + 45 * 86400000;
  for (const g of grahas) {
    if (g.id === 'moon') continue; // Moon changes nakshatra daily, covered in 5 angas
    let curMs = baseDate.getTime();
    let prevMs = curMs;
    let prevNak = Math.floor(getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(curMs)), ayanamsaKey) / (360.0 / 27.0));
    const stepMs = 6 * 3600000;

    while (curMs < nakTimelineEndMs) {
      curMs += stepMs;
      const testLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(curMs)), ayanamsaKey);
      const testNak = Math.floor(testLon / (360.0 / 27.0));
      if (testNak !== prevNak) {
        let low = prevMs;
        let high = curMs;
        while (high - low > 30000) {
          const mid = (low + high) / 2;
          const midLon = getBodySiderealLongitude(g.id, Astronomy.MakeTime(new Date(mid)), ayanamsaKey);
          if (Math.floor(midLon / (360.0 / 27.0)) === prevNak) {
            low = mid;
          } else {
            high = mid;
          }
        }
        const transitDate = new Date(high);
        const toNak = Math.floor(getBodySiderealLongitude(g.id, Astronomy.MakeTime(transitDate), ayanamsaKey) / (360.0 / 27.0));
        const fromNakInfo = NAKSHATRA_NAMES_DATA[prevNak] || { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी' };
        const toNakInfo = NAKSHATRA_NAMES_DATA[toNak] || { en: 'Ashwini', hi: 'अश्विनी', sa: 'अश्विनी' };

        const isToday =
          transitDate.getTime() >= tSunrise.date.getTime() &&
          transitDate.getTime() <= tNextSunrise.date.getTime();

        upcomingEvents.push({
          id: `${g.id}-nak-${transitDate.getTime()}`,
          planetId: g.id,
          planetName: g.name,
          sanskritName: g.sanskritName,
          symbol: g.symbol,
          type: 'nakshatra',
          timestamp: transitDate.toISOString(),
          dateStr: formatDateInTz(transitDate, timeZone),
          timeStr: formatTimeInTz(transitDate, timeZone),
          dayOfWeek: formatDayOfWeekInTz(transitDate, timeZone),
          relativeText: formatRelativeTime(transitDate, baseDate),
          isToday,
          fromValue: fromNakInfo.en,
          toValue: toNakInfo.en,
          fromName: fromNakInfo.sa,
          toName: toNakInfo.sa,
          description: {
            en: `${g.name} enters ${toNakInfo.en} Nakṣatra (${toNakInfo.sa}). Shifts subtle cosmic resonance and vibrational influence.`,
            hi: `${g.sanskritName} का ${toNakInfo.hi} नक्षत्र में प्रवेश। सूक्ष्म ऊर्जा एवं नक्षत्र चरण प्रभाव में परिवर्तन।`,
            sa: `${g.sanskritName}स्य ${toNakInfo.sa}नक्षत्रे प्रवेशः। सूक्ष्मतरङ्गपरिवर्तनं जनयति।`,
          },
        });

        prevNak = testNak;
      }
      prevMs = curMs;
    }
  }

  // Sort upcoming events chronologically
  upcomingEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Filter today's events
  const todayEvents = upcomingEvents.filter((ev) => ev.isToday);

  return {
    planets: planetStatuses,
    upcomingEvents,
    todayEvents,
  };
}

export function getPopularCities(): CityLocation[] {
  const popular = [
    'Bengaluru, IN', 'New Delhi, IN', 'Mumbai, IN', 'Chennai, IN',
    'Kolkata, IN', 'Varanasi, IN', 'Ujjain, IN', 'Hyderabad, IN',
    'London, GB', 'New York, US', 'Singapore, SG', 'Dubai, AE'
  ];
  return popular.map((p) => resolveCity(p));
}

export function computePanchangaCustom(
  latitude: number,
  longitude: number,
  timezone: string,
  dateText: string,
  monthSystem: MonthSystem = 'amanta',
  coordinateSelection: CoordinateSelection = 'citra',
  name: string = 'Custom Location'
): PanchangaResponse {
  const customLoc: CityLocation = {
    name,
    country: '',
    latitude,
    longitude,
    timezone,
  };
  return computePanchanga(customLoc, dateText, monthSystem, coordinateSelection);
}

export function computePanchanga(
  cityNameOrLocation: string | CityLocation,
  dateText: string,
  monthSystem: MonthSystem = 'amanta',
  coordinateSelection: CoordinateSelection = 'citra'
): PanchangaResponse {
  if (!sanskritNames) {
    initPanchangaEngine();
  }
  const names = sanskritNames!;

  const location = typeof cityNameOrLocation === 'string' ? resolveCity(cityNameOrLocation) : cityNameOrLocation;
  // Parse date
  let civilDate: Date;
  if (dateText.includes('/')) {
    const [d, m, y] = dateText.split('/').map((s) => parseInt(s, 10));
    civilDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  } else if (dateText.includes('-')) {
    const [y, m, d] = dateText.split('-').map((s) => parseInt(s, 10));
    civilDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  } else {
    civilDate = new Date();
  }

  const y = civilDate.getUTCFullYear();
  const m = civilDate.getUTCMonth() + 1;
  const d = civilDate.getUTCDate();

  const tzHours = getTimezoneOffsetHours(location.timezone, new Date(Date.UTC(y, m - 1, d, 12, 0, 0)));
  const localMidnightMs = Date.UTC(y, m - 1, d, 0, 0, 0) - tzHours * 3600000;
  const localMidnight = new Date(localMidnightMs);

  const observer = new Astronomy.Observer(location.latitude, location.longitude, 0);

  // Search for sunrise from local midnight
  let tSunrise: Astronomy.AstroTime;
  try {
    tSunrise = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, localMidnight, 1.0, 0.0);
  } catch {
    // Fallback if polar day/night or near edge
    tSunrise = Astronomy.MakeTime(new Date(localMidnightMs + 6 * 3600000));
  }

  // Sunset
  let tSunset: Astronomy.AstroTime;
  try {
    tSunset = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, tSunrise.date, 1.0, 0.0);
  } catch {
    tSunset = Astronomy.MakeTime(new Date(tSunrise.date.getTime() + 12 * 3600000));
  }

  // Next sunrise
  let tNextSunrise: Astronomy.AstroTime;
  try {
    tNextSunrise = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, new Date(tSunrise.date.getTime() + 12 * 3600000), 1.0, 0.0);
  } catch {
    tNextSunrise = Astronomy.MakeTime(new Date(tSunrise.date.getTime() + 24 * 3600000));
  }

  const sunriseLocalHours = (tSunrise.date.getTime() - localMidnightMs) / 3600000;
  const sunsetLocalHours = (tSunset.date.getTime() - localMidnightMs) / 3600000;
  const nextSunriseLocalHours = (tNextSunrise.date.getTime() - localMidnightMs) / 3600000;

  const dayDurationHours = sunsetLocalHours - sunriseLocalHours;
  const nightDurationHours = nextSunriseLocalHours - sunsetLocalHours;

  const sunriseStr = formatTimeHMS(sunriseLocalHours);
  const sunsetStr = formatTimeHMS(sunsetLocalHours);
  const dayDurationStr = formatTimeHMS(dayDurationHours);

  // Moonrise and Moonset
  let moonriseStr: string | null = null;
  let moonriseStatus = 'none_today';
  try {
    const mr = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, localMidnight, 1.0);
    if (mr && mr.date.getTime() >= localMidnightMs && mr.date.getTime() < localMidnightMs + 24 * 3600000) {
      const mrHours = (mr.date.getTime() - localMidnightMs) / 3600000;
      moonriseStr = formatTimeHMS(mrHours);
      moonriseStatus = 'ok';
    }
  } catch {
    moonriseStatus = 'unavailable';
  }

  let moonsetStr: string | null = null;
  let moonsetStatus = 'none_today';
  try {
    const ms = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, localMidnight, 1.0);
    if (ms && ms.date.getTime() >= localMidnightMs && ms.date.getTime() < localMidnightMs + 24 * 3600000) {
      const msHours = (ms.date.getTime() - localMidnightMs) / 3600000;
      moonsetStr = formatTimeHMS(msHours);
      moonsetStatus = 'ok';
    }
  } catch {
    moonsetStatus = 'unavailable';
  }

  // Weekday (Vaara)
  const civilWeekday = civilDate.getUTCDay(); // 0 = Sunday
  const vaaraName = names.varas[civilWeekday.toString()] || 'Ravivāra';

  // Pancha Angas at sunrise
  const ayanamsaDeg = calculateAyanamsa(tSunrise, coordinateSelection);

  const tithiSegments = findSegments(getTithiFraction, names.tithis, tSunrise, tNextSunrise, localMidnight, 30);
  const nakshatraSegments = findSegments((t) => getNakshatraFraction(t, coordinateSelection), names.nakshatras, tSunrise, tNextSunrise, localMidnight, 27);
  const yogaSegments = findSegments((t) => getYogaFraction(t, coordinateSelection), names.yogas, tSunrise, tNextSunrise, localMidnight, 27);
  const karanaSegments = findSegments(getKaranaFraction, names.karanas, tSunrise, tNextSunrise, localMidnight, 60);

  // Astronomical Sun & Moon Longitudes
  const sunTropLon = getTropicalSunLon(tSunrise);
  const sunSidLon = getSiderealLon(sunTropLon, ayanamsaDeg);
  const moonTropLon = getTropicalMoonLon(tSunrise);
  const moonSidLon = getSiderealLon(moonTropLon, ayanamsaDeg);

  const sunRasiIdx = Math.floor(sunSidLon / 30);
  const moonRasiIdx = Math.floor(moonSidLon / 30);
  const sunRasiName = names.zodiac[sunRasiIdx.toString()] || 'meṣa';
  const moonRasiName = names.zodiac[moonRasiIdx.toString()] || 'meṣa';

  // Lunar Month (Māsa) calculation
  // Find New Moon immediately preceding this day
  let lastNmTime: Astronomy.AstroTime;
  try {
    lastNmTime = Astronomy.SearchMoonPhase(0, new Date(tSunrise.date.getTime() - 32 * 86400000), 33);
  } catch {
    lastNmTime = tSunrise;
  }

  const sunSidAtNm = getSiderealLon(getTropicalSunLon(lastNmTime), ayanamsaDeg);
  const solarRasiAtNm = Math.floor(sunSidAtNm / 30);
  let amantaMasaNum = ((solarRasiAtNm + 2) % 12) || 12;

  // Next New Moon to check for Adhika Masa
  let isAdhika = false;
  try {
    const nextNmTime = Astronomy.SearchMoonPhase(0, new Date(lastNmTime.date.getTime() + 15 * 86400000), 20);
    if (nextNmTime) {
      const sunSidAtNextNm = getSiderealLon(getTropicalSunLon(nextNmTime), ayanamsaDeg);
      const solarRasiAtNextNm = Math.floor(sunSidAtNextNm / 30);
      if (solarRasiAtNextNm === solarRasiAtNm) {
        isAdhika = true;
      }
    }
  } catch {
    // ignore
  }

  const primaryTithi = tithiSegments[0]?.number || 1;
  let displayMasaNum = amantaMasaNum;
  if (monthSystem === 'purnimanta' && primaryTithi > 15 && !isAdhika) {
    displayMasaNum = (amantaMasaNum % 12) + 1;
  }

  const baseMasaName = names.masas[displayMasaNum.toString()] || 'Caitra';
  const masaLabel = isAdhika ? `Adhika ${baseMasaName}` : baseMasaName;

  // Ṛtu (Season)
  const rtuIdx = Math.floor((amantaMasaNum - 1) / 2);
  const rtuName = names.ritus[rtuIdx.toString()] || 'Vasanta';

  // Drik Ṛtu (Solar season from tropical Sun longitude)
  const drikRtuIdx = Math.floor(((sunTropLon + 30) % 360) / 60);
  const drikRtuName = names.ritus[drikRtuIdx.toString()] || 'Vasanta';

  // Ayana
  const ayana = (sunRasiIdx >= 9 || sunRasiIdx <= 2) ? 'Uttarāyaṇa' : 'Dakṣiṇāyana';
  const drikAyana = (sunTropLon >= 270 || sunTropLon < 90) ? 'Uttarāyaṇa' : 'Dakṣiṇāyana';

  // Eras: in astronomy-engine, tSunrise.ut is days since J2000.0 (JD 2451545.0)
  const jd = tSunrise.ut + 2451545.0;
  const kaliDay = Math.floor(jd - 588465.5);
  // Śaka era began in 78 CE; Caitra changes year
  let sakaYear = y - 78;
  if (m < 3 || (m === 3 && d < 22)) {
    sakaYear -= 1;
  }
  const kaliYear = sakaYear + 3179;
  const vikramaYear = sakaYear + 135;

  // Samvatsara (60-year cycle)
  const samvatIdx = (sakaYear + 12) % 60;
  const samvatsara = names.samvats[samvatIdx.toString()] || 'Parābhava';
  const samvatsaraNorth = names.samvats[samvatIdx.toString()] || samvatsara;

  // Auspicious and Inauspicious Periods
  // Rāhu Kāla, Yamagaṇḍa, Gulikā Kāla (offsets by weekday)
  const rahuOffsets = [0.875, 0.125, 0.75, 0.5, 0.625, 0.375, 0.25];
  const gulikaOffsets = [0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0.0];
  const yamaOffsets = [0.5, 0.375, 0.25, 0.125, 0.0, 0.75, 0.625];

  const rahuStart = sunriseLocalHours + dayDurationHours * rahuOffsets[civilWeekday];
  const rahuEnd = rahuStart + 0.125 * dayDurationHours;

  const yamaStart = sunriseLocalHours + dayDurationHours * yamaOffsets[civilWeekday];
  const yamaEnd = yamaStart + 0.125 * dayDurationHours;

  const gulikaStart = sunriseLocalHours + dayDurationHours * gulikaOffsets[civilWeekday];
  const gulikaEnd = gulikaStart + 0.125 * dayDurationHours;

  // Abhijit Muhūrta: 8th muhurta of the 15 daytime muhurtas
  const abhijitStart = sunriseLocalHours + (7 / 15) * dayDurationHours;
  const abhijitEnd = sunriseLocalHours + (8 / 15) * dayDurationHours;

  // Brahma Muhūrta: 96 to 48 minutes before sunrise
  const brahmaStart = sunriseLocalHours - 96 / 60;
  const brahmaEnd = sunriseLocalHours - 48 / 60;

  // Durmuhūrtam
  const durmuhurtaOffsets = [
    [10.4, 0.0],
    [6.4, 8.8],
    [2.4, 4.8],
    [5.6, 0.0],
    [4.0, 8.8],
    [2.4, 6.4],
    [1.6, 0.0],
  ];

  const durmuhurtaIntervals: TimingInterval[] = [];
  const curOffsets = durmuhurtaOffsets[civilWeekday];
  for (let i = 0; i < 2; i++) {
    const off = curOffsets[i];
    if (off > 0) {
      let durBase = sunriseLocalHours;
      let durLen = dayDurationHours;
      if (civilWeekday === 2 && i === 1) {
        durBase = sunsetLocalHours;
        durLen = nightDurationHours;
      }
      const dmStart = durBase + (durLen * off) / 12;
      const dmEnd = dmStart + (dayDurationHours * 0.8) / 12;
      durmuhurtaIntervals.push({
        start: formatTimeHMS(dmStart),
        end: formatTimeHMS(dmEnd),
      });
    }
  }

  // Varjyam (Viṣaghatī)
  const varjyamIntervals: TimingInterval[] = [];
  const primaryNak = nakshatraSegments[0]?.number || 1;
  const nakDurationHours = 24.0; // approx
  const vGhati = VARJYAM_START_GHATIS[primaryNak] || 30;
  const nakStartTimeHours = sunriseLocalHours - 6; // conservative bracket
  const vStartHours = nakStartTimeHours + (nakDurationHours * vGhati) / 60;
  const vEndHours = vStartHours + (nakDurationHours * 4) / 60;

  if (vStartHours >= sunriseLocalHours && vStartHours < nextSunriseLocalHours) {
    varjyamIntervals.push({
      start: formatTimeHMS(vStartHours),
      end: formatTimeHMS(vEndHours),
      name: 'Varjyam',
    });
  }

  // Amṛta Kāla (calculated approx 14 ghatis after Varjyam start, duration 4 ghatis)
  const amritaIntervals: TimingInterval[] = [];
  const amStartHours = vStartHours + (14 * 24) / 60;
  const amEndHours = amStartHours + (4 * 24) / 60;
  if (amStartHours >= sunriseLocalHours && amStartHours < nextSunriseLocalHours) {
    amritaIntervals.push({
      start: formatTimeHMS(amStartHours),
      end: formatTimeHMS(amEndHours),
      name: 'Amṛta Kāla',
    });
  }

  // Gauri / Choghadiya intervals
  const choghadiyaTypes = ['Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga'];
  const dayStartOffsets = [0, 3, 6, 2, 5, 1, 4]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const nightStartOffsets = [5, 1, 6, 4, 2, 0, 3];

  const choghadiyaDay: TimingInterval[] = [];
  const dayPart = dayDurationHours / 8;
  const startDayIdx = dayStartOffsets[civilWeekday];
  for (let i = 0; i < 8; i++) {
    const cType = choghadiyaTypes[(startDayIdx + i) % 7];
    const cStart = sunriseLocalHours + i * dayPart;
    const cEnd = cStart + dayPart;
    choghadiyaDay.push({
      name: cType,
      start: formatTimeHMS(cStart),
      end: formatTimeHMS(cEnd),
    });
  }

  const choghadiyaNight: TimingInterval[] = [];
  const nightPart = nightDurationHours / 8;
  const startNightIdx = nightStartOffsets[civilWeekday];
  for (let i = 0; i < 8; i++) {
    const cType = choghadiyaTypes[(startNightIdx + i) % 7];
    const cStart = sunsetLocalHours + i * nightPart;
    const cEnd = cStart + nightPart;
    choghadiyaNight.push({
      name: cType,
      start: formatTimeHMS(cStart),
      end: formatTimeHMS(cEnd),
    });
  }

  // Navagrahas (Planets) positions
  const planetsList: PlanetPosition[] = [];
  const bodies: { id: string; name: string; sanskritName: string; body?: Astronomy.Body }[] = [
    { id: 'sun', name: 'Sun', sanskritName: 'Sūrya', body: Astronomy.Body.Sun },
    { id: 'moon', name: 'Moon', sanskritName: 'Candra', body: Astronomy.Body.Moon },
    { id: 'mars', name: 'Mars', sanskritName: 'Maṅgala', body: Astronomy.Body.Mars },
    { id: 'mercury', name: 'Mercury', sanskritName: 'Budha', body: Astronomy.Body.Mercury },
    { id: 'jupiter', name: 'Jupiter', sanskritName: 'Guru', body: Astronomy.Body.Jupiter },
    { id: 'venus', name: 'Venus', sanskritName: 'Śukra', body: Astronomy.Body.Venus },
    { id: 'saturn', name: 'Saturn', sanskritName: 'Śani', body: Astronomy.Body.Saturn },
  ];

  for (const item of bodies) {
    let elon = 0;
    let isRetrograde = false;
    if (item.body === Astronomy.Body.Sun) {
      elon = sunTropLon;
    } else if (item.body === Astronomy.Body.Moon) {
      elon = moonTropLon;
    } else if (item.body) {
      const vec = Astronomy.GeoVector(item.body, tSunrise, true);
      elon = Astronomy.Ecliptic(vec).elon;
      // Check speed / retrograde
      const tNext = Astronomy.MakeTime(new Date(tSunrise.date.getTime() + 3600000));
      const nextElon = Astronomy.Ecliptic(Astronomy.GeoVector(item.body, tNext, true)).elon;
      let diffSpeed = (nextElon - elon) % 360;
      if (diffSpeed > 180) diffSpeed -= 360;
      if (diffSpeed < -180) diffSpeed += 360;
      isRetrograde = diffSpeed < 0;
    }

    const sidLon = getSiderealLon(elon, ayanamsaDeg);
    const rIdx = Math.floor(sidLon / 30);
    const degInR = sidLon % 30;
    const nakIdx = Math.floor(sidLon / (360 / 27));
    const pada = Math.floor((sidLon % (360 / 27)) / (360 / 108)) + 1;

    planetsList.push({
      id: item.id,
      name: item.name,
      sanskritName: item.sanskritName,
      longitude: elon,
      siderealLongitude: sidLon,
      rasi: names.zodiac[rIdx.toString()] || 'meṣa',
      rasiNumber: rIdx + 1,
      degreesInRasi: formatDegreesDMS(degInR),
      nakshatra: names.nakshatras[(nakIdx + 1).toString()] || 'Aśvinī',
      nakshatraNumber: nakIdx + 1,
      pada,
      isRetrograde,
    });
  }

  // Rahu & Ketu (Mean Nodes)
  const T = tSunrise.ut / 36525.0;
  let rahuTrop = (125.04452 - 1934.136261 * T + 0.0020708 * T * T) % 360;
  if (rahuTrop < 0) rahuTrop += 360;
  const ketuTrop = (rahuTrop + 180) % 360;

  const rahuSid = getSiderealLon(rahuTrop, ayanamsaDeg);
  const ketuSid = getSiderealLon(ketuTrop, ayanamsaDeg);

  const rahuRasiIdx = Math.floor(rahuSid / 30);
  const ketuRasiIdx = Math.floor(ketuSid / 30);
  const rahuNakIdx = Math.floor(rahuSid / (360 / 27));
  const ketuNakIdx = Math.floor(ketuSid / (360 / 27));

  planetsList.push({
    id: 'rahu',
    name: 'Rahu',
    sanskritName: 'Rāhu',
    longitude: rahuTrop,
    siderealLongitude: rahuSid,
    rasi: names.zodiac[rahuRasiIdx.toString()] || 'meṣa',
    rasiNumber: rahuRasiIdx + 1,
    degreesInRasi: formatDegreesDMS(rahuSid % 30),
    nakshatra: names.nakshatras[(rahuNakIdx + 1).toString()] || 'Aśvinī',
    nakshatraNumber: rahuNakIdx + 1,
    pada: Math.floor((rahuSid % (360 / 27)) / (360 / 108)) + 1,
    isRetrograde: true,
  });

  planetsList.push({
    id: 'ketu',
    name: 'Ketu',
    sanskritName: 'Ketu',
    longitude: ketuTrop,
    siderealLongitude: ketuSid,
    rasi: names.zodiac[ketuRasiIdx.toString()] || 'meṣa',
    rasiNumber: ketuRasiIdx + 1,
    degreesInRasi: formatDegreesDMS(ketuSid % 30),
    nakshatra: names.nakshatras[(ketuNakIdx + 1).toString()] || 'Aśvinī',
    nakshatraNumber: ketuNakIdx + 1,
    pada: Math.floor((ketuSid % (360 / 27)) / (360 / 108)) + 1,
    isRetrograde: true,
  });

  const coordinateLabels: Record<CoordinateSelection, string> = {
    citra: 'Chitra Paksha (Lahiri)',
    revati: 'Revati (Usha-Shashi)',
    rohini: 'Rohini',
    pushya: 'Pushya',
    mula: 'Mula',
    krishnamurti: 'Krishnamurti (KP)',
    raman: 'B.V. Raman',
    tropical: 'Tropical (Sayana)',
  };

  const SWARA_RULES: Array<{
    dayNumber: number;
    tithiName: string;
    paksha: 'Shukla Paksha' | 'Krishna Paksha' | 'Full moon' | 'No Moon';
    sunriseSwara: 'ida' | 'pingala';
    sunsetSwara: 'ida' | 'pingala';
    sunriseNostril: 'Left' | 'Right';
    sunsetNostril: 'Left' | 'Right';
  }> = [
    { dayNumber: 1, tithiName: 'Pratipada', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 2, tithiName: 'Dwitiya', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 3, tithiName: 'Tritiya', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 4, tithiName: 'Chaturthi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 5, tithiName: 'Panchami', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 6, tithiName: 'Shashthi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 7, tithiName: 'Saptami', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 8, tithiName: 'Ashtami', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 9, tithiName: 'Navami', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 10, tithiName: 'Dashami', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 11, tithiName: 'Ekadasi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 12, tithiName: 'Dwadashi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 13, tithiName: 'Trayodashi', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 14, tithiName: 'Chaturdashi', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 15, tithiName: 'Purnima', paksha: 'Full moon', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 16, tithiName: 'Pratipada', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 17, tithiName: 'Dwitiya', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 18, tithiName: 'Tritiya', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 19, tithiName: 'Chaturthi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 20, tithiName: 'Panchami', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 21, tithiName: 'Shashthi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 22, tithiName: 'Saptami', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 23, tithiName: 'Ashtami', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 24, tithiName: 'Navami', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 25, tithiName: 'Dashami', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 26, tithiName: 'Ekadasi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 27, tithiName: 'Dwadashi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
    { dayNumber: 28, tithiName: 'Trayodashi', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 29, tithiName: 'Chaturdashi', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
    { dayNumber: 30, tithiName: 'Amawashya', paksha: 'No Moon', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  ];

  const rawRule = SWARA_RULES[(primaryTithi - 1) % 30] || SWARA_RULES[0];

  const parseTimeToMin = (tStr: string | null): number | null => {
    if (!tStr || tStr === 'None' || tStr === 'unavailable') return null;
    const parts = tStr.split(':').map((v) => parseInt(v, 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
  };

  const fmtMinToTime = (min: number): string => {
    const norm = ((Math.round(min) % 1440) + 1440) % 1440;
    const h = Math.floor(norm / 60);
    const m = Math.floor(norm % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const srMin = parseTimeToMin(sunriseStr) ?? 6 * 60;
  const ssMin = parseTimeToMin(sunsetStr) ?? 18 * 60;
  const mrMin = parseTimeToMin(moonriseStr);
  const msMin = parseTimeToMin(moonsetStr);

  const swaraRule = {
    ...rawRule,
    moonriseSwara: (rawRule.sunriseSwara === 'ida' ? 'pingala' : 'ida') as 'ida' | 'pingala',
    moonsetSwara: (rawRule.sunsetSwara === 'ida' ? 'pingala' : 'ida') as 'ida' | 'pingala',
    moonriseNostril: (rawRule.sunriseNostril === 'Left' ? 'Right' : 'Left') as 'Left' | 'Right',
    moonsetNostril: (rawRule.sunsetNostril === 'Left' ? 'Right' : 'Left') as 'Left' | 'Right',
    sunriseWindow: {
      start: fmtMinToTime(srMin),
      end: fmtMinToTime(srMin + 60),
      windowFormatted: `${fmtMinToTime(srMin)} – ${fmtMinToTime(srMin + 60)}`,
      ruleDescription: {
        en: 'Starts at Sunrise, runs for 1 hour',
        hi: 'सूर्योदय से 1 घंटे तक प्रवहमान रहता है',
        sa: 'सूर्योदयात् आरभ्य १ होरापर्यन्तं प्रवहति',
      },
    },
    sunsetWindow: {
      start: fmtMinToTime(ssMin - 60),
      end: fmtMinToTime(ssMin),
      windowFormatted: `${fmtMinToTime(ssMin - 60)} – ${fmtMinToTime(ssMin)}`,
      ruleDescription: {
        en: 'Starts 1 hour before Sunset, runs until Sunset',
        hi: 'सूर्यास्त से 1 घंटा पहले प्रारंभ होता है',
        sa: 'सूर्यास्तात् १ होरा पूर्वम् आरभ्य सूर्यास्तपर्यन्तं प्रवहति',
      },
    },
    moonriseWindow: mrMin !== null ? {
      start: fmtMinToTime(mrMin),
      end: fmtMinToTime(mrMin + 60),
      windowFormatted: `${fmtMinToTime(mrMin)} – ${fmtMinToTime(mrMin + 60)}`,
      ruleDescription: {
        en: 'Starts at Moonrise, runs for 1 hour (Opposite of Sunrise)',
        hi: 'चन्द्रोदय से 1 घंटे तक प्रवहमान रहता है (सूर्योदय का विपरीत)',
        sa: 'चन्द्रोदयात् आरभ्य १ होरापर्यन्तं प्रवहति (सूर्योदयविपरीतम्)',
      },
    } : null,
    moonsetWindow: msMin !== null ? {
      start: fmtMinToTime(msMin - 60),
      end: fmtMinToTime(msMin),
      windowFormatted: `${fmtMinToTime(msMin - 60)} – ${fmtMinToTime(msMin)}`,
      ruleDescription: {
        en: 'Starts 1 hour before Moonset, runs until Moonset (Opposite of Sunset)',
        hi: 'चन्द्रास्त से 1 घंटा पहले प्रारंभ होता है (सूर्यास्त का विपरीत)',
        sa: 'चन्द्रास्तात् १ होरा पूर्वम् आरभ्य चन्द्रास्तपर्यन्तं प्रवहति (सूर्यास्तविपरीतम्)',
      },
    } : null,
  };

  return {
    city: location.name,
    date: `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`,
    timezone: location.timezone,
    jd: Math.round(jd * 100000) / 100000,
    sunrise_jd: Math.round(tSunrise.ut * 100000) / 100000,
    coordinate_mode: coordinateSelection === 'tropical' ? 'tropical' : 'sidereal',
    coordinate_label: coordinateLabels[coordinateSelection] || 'Chitra Paksha',
    ayanamsa: coordinateSelection === 'tropical' ? null : coordinateLabels[coordinateSelection],
    ayanamsa_key: coordinateSelection === 'tropical' ? null : coordinateSelection,
    ayanamsa_degrees: coordinateSelection === 'tropical' ? null : Math.round(ayanamsaDeg * 1000000) / 1000000,
    month_system: monthSystem,
    month_system_label: monthSystem === 'amanta' ? 'Amānta (New Moon to New Moon)' : 'Pūrṇimānta (Full Moon to Full Moon)',
    samvatsara,
    samvatsara_north: samvatsaraNorth,
    ayana,
    drik_ayana: drikAyana,
    masa: masaLabel,
    masa_number: displayMasaNum,
    is_adhika: isAdhika,
    rtu: `${rtuName} Ṛtu`,
    drik_rtu: `${drikRtuName} Ṛtu`,
    vaara: vaaraName,
    kali_day: kaliDay,
    saka_year: sakaYear,
    kali_year: kaliYear,
    vikrama_year: vikramaYear,
    sunrise: sunriseStr,
    sunset: sunsetStr,
    next_sunrise: formatTimeHMS(nextSunriseLocalHours),
    sunrise_hours: sunriseLocalHours,
    sunset_hours: sunsetLocalHours,
    next_sunrise_hours: nextSunriseLocalHours,
    moonrise: moonriseStr,
    moonrise_status: moonriseStatus,
    moonset: moonsetStr,
    moonset_status: moonsetStatus,
    day_duration: dayDurationStr,
    night_duration: formatTimeHMS(nightDurationHours),
    paksha: (primaryTithi <= 15 ? 'Śukla' : 'Kṛṣṇa') as 'Śukla' | 'Kṛṣṇa',
    rahu_kala: { start: formatTimeHMS(rahuStart), end: formatTimeHMS(rahuEnd), name: 'Rāhu Kāla' },
    yamaganda: { start: formatTimeHMS(yamaStart), end: formatTimeHMS(yamaEnd), name: 'Yamagaṇḍa' },
    gulika_kala: { start: formatTimeHMS(gulikaStart), end: formatTimeHMS(gulikaEnd), name: 'Gulikā Kāla' },
    abhijit_muhurta: { start: formatTimeHMS(abhijitStart), end: formatTimeHMS(abhijitEnd), name: 'Abhijit Muhūrta' },
    brahma_muhurta: { start: formatTimeHMS(brahmaStart), end: formatTimeHMS(brahmaEnd), name: 'Brahma Muhūrta' },
    amrita_kala: amritaIntervals,
    durmuhurta: durmuhurtaIntervals,
    varjyam: varjyamIntervals,
    gauri_choghadiya_day: choghadiyaDay,
    gauri_choghadiya_night: choghadiyaNight,
    tithi: tithiSegments,
    nakshatra: nakshatraSegments,
    yoga: yogaSegments,
    karana: karanaSegments,
    planets: planetsList,
    sun_rasi: sunRasiName,
    moon_rasi: moonRasiName,
    swara_yoga: swaraRule,
    planet_transitions: calculatePlanetTransitions(
      location,
      tSunrise,
      tNextSunrise,
      coordinateSelection,
      civilDate
    ),
  };
}

export function generateICalendar(city: string, startYear: number, monthSystem: MonthSystem = 'amanta', coordinateSelection: CoordinateSelection = 'citra'): string {
  const events: string[] = [];
  const daysInYear = 365;

  const startDate = new Date(Date.UTC(startYear, 0, 1));

  for (let i = 0; i < 30; i++) {
    // Generate for 30 consecutive days or sample
    const curDate = new Date(startDate.getTime() + i * 86400000);
    const dStr = `${curDate.getUTCDate().toString().padStart(2, '0')}/${(curDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${curDate.getUTCFullYear()}`;
    try {
      const p = computePanchanga(city, dStr, monthSystem, coordinateSelection);
      const tithiName = p.tithi[0]?.name || '';
      const nakName = p.nakshatra[0]?.name || '';
      const dtFormatted = `${curDate.getUTCFullYear()}${(curDate.getUTCMonth() + 1).toString().padStart(2, '0')}${curDate.getUTCDate().toString().padStart(2, '0')}`;

      events.push(`BEGIN:VEVENT
UID:panchanga-${city}-${dtFormatted}@drikpanchanga
DTSTAMP:${dtFormatted}T000000Z
DTSTART;VALUE=DATE:${dtFormatted}
SUMMARY:${p.masa}: ${tithiName} | ${nakName}
DESCRIPTION:Drik Panchanga for ${p.city}\\nSunrise: ${p.sunrise}, Sunset: ${p.sunset}\\nTithi: ${tithiName}\\nNakshatra: ${nakName}\\nYoga: ${p.yoga[0]?.name || ''}\\nKarana: ${p.karana[0]?.name || ''}\\nRahu Kala: ${p.rahu_kala.start} - ${p.rahu_kala.end}\\nSamvatsara: ${p.samvatsara}, Saka: ${p.saka_year}
END:VEVENT`);
    } catch {
      // skip invalid dates
    }
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//bdsatish//Drik Panchanga//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Drik Panchanga - ${city}
${events.join('\n')}
END:VCALENDAR`;
}
