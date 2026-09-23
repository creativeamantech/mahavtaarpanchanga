import { CanonicalBodyId } from "../../astronomy/AstronomicalContext";
import { DashaYearConvention } from "../types/DashaTypes";

export interface VimshottariLordDefinition {
  planet: CanonicalBodyId;
  years: number;
  nameEn: string;
  nameHi: string;
  nameSa: string;
  symbol: string;
}

/**
 * Classical BPHS Vimshottari Sequence of 9 Planetary Lords (Total 120 Years)
 * BPHS Adhyaya 46, Shlokas 12-15
 */
export const VIMSHOTTARI_LORDS: readonly VimshottariLordDefinition[] = [
  { planet: "Ketu", years: 7, nameEn: "Ketu", nameHi: "केतु", nameSa: "केतुः", symbol: "☋" },
  { planet: "Venus", years: 20, nameEn: "Venus", nameHi: "शुक्र", nameSa: "शुक्रः", symbol: "♀" },
  { planet: "Sun", years: 6, nameEn: "Sun", nameHi: "सूर्य", nameSa: "सूर्यः", symbol: "☉" },
  { planet: "Moon", years: 10, nameEn: "Moon", nameHi: "चन्द्र", nameSa: "चन्द्रः", symbol: "☽" },
  { planet: "Mars", years: 7, nameEn: "Mars", nameHi: "मंगल", nameSa: "मङ्गलः", symbol: "♂" },
  { planet: "Rahu", years: 18, nameEn: "Rahu", nameHi: "राहु", nameSa: "राहुः", symbol: "☊" },
  { planet: "Jupiter", years: 16, nameEn: "Jupiter", nameHi: "गुरु", nameSa: "गुरुः", symbol: "♃" },
  { planet: "Saturn", years: 19, nameEn: "Saturn", nameHi: "शनि", nameSa: "शनिः", symbol: "♄" },
  { planet: "Mercury", years: 17, nameEn: "Mercury", nameHi: "बुध", nameSa: "बुधः", symbol: "☿" },
] as const;

export const TOTAL_VIMSHOTTARI_YEARS = 120;

/**
 * 27 Classical Nakshatras with respective Vimshottari rulers
 * Each Nakshatra spans exactly 13°20' (13.333333333333334°)
 */
export interface NakshatraDefinition {
  index: number; // 0 to 26
  number: number; // 1 to 27
  nameEn: string;
  nameHi: string;
  nameSa: string;
  lord: CanonicalBodyId;
}

export const VEDIC_NAKSHATRAS: readonly NakshatraDefinition[] = [
  { index: 0, number: 1, nameEn: "Ashwini", nameHi: "अश्विनी", nameSa: "अश्विनी", lord: "Ketu" },
  { index: 1, number: 2, nameEn: "Bharani", nameHi: "भरणी", nameSa: "भरणी", lord: "Venus" },
  { index: 2, number: 3, nameEn: "Krittika", nameHi: "कृत्तिका", nameSa: "कृत्तिका", lord: "Sun" },
  { index: 3, number: 4, nameEn: "Rohini", nameHi: "रोहिणी", nameSa: "रोहिणी", lord: "Moon" },
  {
    index: 4,
    number: 5,
    nameEn: "Mrigashira",
    nameHi: "मृगशिरा",
    nameSa: "मृगशीर्ष",
    lord: "Mars",
  },
  { index: 5, number: 6, nameEn: "Ardra", nameHi: "आर्द्रा", nameSa: "आर्द्रा", lord: "Rahu" },
  {
    index: 6,
    number: 7,
    nameEn: "Punarvasu",
    nameHi: "पुनर्वसु",
    nameSa: "पुनर्वसु",
    lord: "Jupiter",
  },
  { index: 7, number: 8, nameEn: "Pushya", nameHi: "पुष्य", nameSa: "पुष्य", lord: "Saturn" },
  {
    index: 8,
    number: 9,
    nameEn: "Ashlesha",
    nameHi: "आश्लेषा",
    nameSa: "आश्लेषा",
    lord: "Mercury",
  },
  { index: 9, number: 10, nameEn: "Magha", nameHi: "मघा", nameSa: "मघा", lord: "Ketu" },
  {
    index: 10,
    number: 11,
    nameEn: "Purva Phalguni",
    nameHi: "पूर्वा फाल्गुनी",
    nameSa: "पूर्वफाल्गुनी",
    lord: "Venus",
  },
  {
    index: 11,
    number: 12,
    nameEn: "Uttara Phalguni",
    nameHi: "उत्तरा फाल्गुनी",
    nameSa: "उत्तरफाल्गुनी",
    lord: "Sun",
  },
  { index: 12, number: 13, nameEn: "Hasta", nameHi: "हस्त", nameSa: "हस्त", lord: "Moon" },
  { index: 13, number: 14, nameEn: "Chitra", nameHi: "चित्रा", nameSa: "चित्रा", lord: "Mars" },
  { index: 14, number: 15, nameEn: "Swati", nameHi: "स्वाति", nameSa: "स्वाति", lord: "Rahu" },
  {
    index: 15,
    number: 16,
    nameEn: "Vishakha",
    nameHi: "विशाखा",
    nameSa: "विशाखा",
    lord: "Jupiter",
  },
  {
    index: 16,
    number: 17,
    nameEn: "Anuradha",
    nameHi: "अनुराधा",
    nameSa: "अनुराधा",
    lord: "Saturn",
  },
  {
    index: 17,
    number: 18,
    nameEn: "Jyeshtha",
    nameHi: "ज्येष्ठा",
    nameSa: "ज्येष्ठा",
    lord: "Mercury",
  },
  { index: 18, number: 19, nameEn: "Mula", nameHi: "मूल", nameSa: "मूल", lord: "Ketu" },
  {
    index: 19,
    number: 20,
    nameEn: "Purva Ashadha",
    nameHi: "पूर्वाषाढ़ा",
    nameSa: "पूर्वाषाढा",
    lord: "Venus",
  },
  {
    index: 20,
    number: 21,
    nameEn: "Uttara Ashadha",
    nameHi: "उत्तराषाढ़ा",
    nameSa: "उत्तराषाढा",
    lord: "Sun",
  },
  { index: 21, number: 22, nameEn: "Shravana", nameHi: "श्रवण", nameSa: "श्रावण", lord: "Moon" },
  {
    index: 22,
    number: 23,
    nameEn: "Dhanishta",
    nameHi: "धनिष्ठा",
    nameSa: "धनिष्ठा",
    lord: "Mars",
  },
  {
    index: 23,
    number: 24,
    nameEn: "Shatabhisha",
    nameHi: "शतभिषा",
    nameSa: "शतभिषज्",
    lord: "Rahu",
  },
  {
    index: 24,
    number: 25,
    nameEn: "Purva Bhadrapada",
    nameHi: "पूर्व भाद्रपद",
    nameSa: "पूर्वप्रोष्ठपदा",
    lord: "Jupiter",
  },
  {
    index: 25,
    number: 26,
    nameEn: "Uttara Bhadrapada",
    nameHi: "उत्तर भाद्रपद",
    nameSa: "उत्तरप्रोष्ठपदा",
    lord: "Saturn",
  },
  { index: 26, number: 27, nameEn: "Revati", nameHi: "रेवती", nameSa: "रेवती", lord: "Mercury" },
] as const;

/** Exact Arc of one Nakshatra in degrees: 360 / 27 = 13° 20' = 13.333333333333334° */
export const NAKSHATRA_ARC_DEG = 360.0 / 27.0;

/** Exact Arc of one Pada in degrees: 13° 20' / 4 = 3° 20' = 3.3333333333333335° */
export const PADA_ARC_DEG = NAKSHATRA_ARC_DEG / 4.0;

/**
 * Normalizes any degree to [0, 360)
 */
export function normalize360(deg: number): number {
  if (deg >= 0 && deg < 360) {
    return deg;
  }
  const rem = deg % 360.0;
  return rem < 0 ? rem + 360.0 : rem;
}

/**
 * Returns Nakshatra index (0 to 26), Pada (1 to 4), passed arc, remaining arc
 */
export function getNakshatraInfo(longitudeDeg: number): {
  nakshatra: NakshatraDefinition;
  pada: number;
  passedArcDeg: number;
  remainingArcDeg: number;
  elapsedFraction: number;
  remainingFraction: number;
} {
  const normLon = normalize360(longitudeDeg);
  // Add 1e-12 tolerance for boundary precision
  const rawIndex = Math.floor((normLon + 1e-12) / NAKSHATRA_ARC_DEG);
  const nakIndex = Math.min(26, Math.max(0, rawIndex));
  const nakshatra = VEDIC_NAKSHATRAS[nakIndex];

  const passedArcDeg = normLon - nakIndex * NAKSHATRA_ARC_DEG;
  const clampedPassed = Math.max(0.0, Math.min(NAKSHATRA_ARC_DEG, passedArcDeg));
  const remainingArcDeg = Math.max(0.0, NAKSHATRA_ARC_DEG - clampedPassed);

  const rawPada = Math.floor((clampedPassed + 1e-12) / PADA_ARC_DEG) + 1;
  const pada = Math.min(4, Math.max(1, rawPada));

  const elapsedFraction = clampedPassed / NAKSHATRA_ARC_DEG;
  const remainingFraction = remainingArcDeg / NAKSHATRA_ARC_DEG;

  return {
    nakshatra,
    pada,
    passedArcDeg: clampedPassed,
    remainingArcDeg,
    elapsedFraction,
    remainingFraction,
  };
}

/**
 * Finds index in 9-lord sequence for a given planet
 */
export function getLordIndex(planet: CanonicalBodyId | string): number {
  const idx = VIMSHOTTARI_LORDS.findIndex((l) => l.planet === planet);
  return idx >= 0 ? idx : 0;
}

/**
 * Converts a year convention into milliseconds per year
 */
export function getMsPerYear(convention: DashaYearConvention = "gregorian_solar"): number {
  switch (convention) {
    case "savana":
      // Classical 360 civil tithi/days
      return 360.0 * 86400 * 1000; // 31,104,000,000 ms
    case "sidereal":
      // 365.256363 days
      return 365.256363 * 86400 * 1000;
    case "julian":
      // 365.25 days
      return 365.25 * 86400 * 1000;
    case "gregorian_solar":
    default:
      // Modern standard mean tropical/Gregorian year: 365.2425 days
      return 365.2425 * 86400 * 1000; // 31,556,952,000 ms
  }
}
