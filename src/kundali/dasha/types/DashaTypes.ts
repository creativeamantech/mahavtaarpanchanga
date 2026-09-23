import { CanonicalBodyId } from "../../astronomy/AstronomicalContext";

/**
 * Supported or Planned Dasha Systems in the Mahavtaar Jyotisha Core
 */
export type DashaSystem =
  | "vimshottari" // 120-year Nakshatra cycle (Universal standard, Parashari)
  | "ashtottari" // 108-year conditional Nakshatra cycle (Rahu/Ketu excluded/included)
  | "yogini" // 36-year cyclic Dasha (Mangala to Sankata)
  | "chara" // Jaimini Rashi progression
  | "kaalchakra" // Savya/Apasavya Nakshatra-pada Deha-Jeeva cycle
  | "narayana" // Jaimini Padakrama progression
  | "shoola" // Jaimini Ayur dasha
  | "dwisaptati_sama" // 72-year conditional Dasha (Lagnesha in 7th or 7th lord in Lagna)
  | "chaturashiti_sama"; // 84-year conditional Dasha (10th lord in 10th house)

/**
 * 5-Tier Canonical Dasha Hierarchy Levels
 */
export type DashaLevel =
  | 1 // Mahadasha (महादशा)
  | 2 // Antardasha / Bhukti (अन्तर्दशा / भुक्ति)
  | 3 // Pratyantardasha (प्रत्यन्तर्दशा)
  | 4 // Sookshma Dasha (सूक्ष्मदशा)
  | 5; // Prana Dasha (प्राणदशा)

export const DASHA_LEVEL_NAMES: Record<DashaLevel, { en: string; hi: string; sa: string }> = {
  1: { en: "Mahadasha", hi: "महादशा", sa: "महादशा" },
  2: { en: "Antardasha", hi: "अन्तर्दशा", sa: "अन्तर्दशा (भुक्ति)" },
  3: { en: "Pratyantardasha", hi: "प्रत्यन्तर्दशा", sa: "प्रत्यन्तर्दशा" },
  4: { en: "Sookshma Dasha", hi: "सूक्ष्मदशा", sa: "सूक्ष्मदशा" },
  5: { en: "Prana Dasha", hi: "प्राणदशा", sa: "प्राणदशा" },
};

/**
 * Dasha Lord identity: either Graha CanonicalBodyId or Rashi Name for Jaimini systems
 */
export type DashaLord = CanonicalBodyId | string;

/**
 * Year convention used for converting fractional/decimal dasha years to timestamps
 */
export type DashaYearConvention =
  | "gregorian_solar" // 365.2425 days per year (31,556,952,000 ms) — Modern Standard
  | "savana" // 360 days per year (31,104,000,000 ms) — Classical Civil Year (BPHS)
  | "sidereal" // 365.256363 days per year — Astronomical sidereal year
  | "julian"; // 365.25 days per year — Julian year

/**
 * Unified Canonical Dasha Period Structure representing any tier in the hierarchy
 */
export interface DashaPeriod {
  /** System identifier (e.g. vimshottari) */
  system: DashaSystem;
  /** Hierarchy tier depth (1 to 5) */
  level: DashaLevel;
  /** Lord of this period */
  lord: DashaLord;
  /** Localized Hindi name of the lord */
  lordNameHi: string;
  /** Classical Sanskrit name of the lord */
  lordNameSa: string;
  /** Start timestamp in UTC milliseconds */
  startTimestampMs: number;
  /** End timestamp in UTC milliseconds */
  endTimestampMs: number;
  /** ISO Date string formatted YYYY-MM-DD */
  startDateIso: string;
  /** ISO Date string formatted YYYY-MM-DD */
  endDateIso: string;
  /** Duration in exact/fractional years */
  durationYears: number;
  /** Duration in exact days */
  durationDays: number;
  /** Unique deterministic identifier (e.g., 'vimshottari-L1-Venus-L2-Sun') */
  periodId: string;
  /** Parent period identifier (undefined for Level 1 Mahadashas) */
  parentPeriodId?: string;
  /** Sequence index within parent (1 to 9 for Parashari, 1 to 12 for Jaimini) */
  sequence: number;
  /** Classical textual authority citation */
  source: string;
  /** Mathematical time-scaling convention */
  calculationConvention: DashaYearConvention;
  /** Software formula version */
  formulaVersion: string;
  /** Invariant validation status */
  validationStatus: "valid" | "warning" | "error";
  /** Whether this period is currently running relative to query time */
  isCurrent?: boolean;
  /** Nested child periods (if requested and computed) */
  children?: DashaPeriod[];
}

/**
 * Birth Balance of Dasha (भोग्य दशा)
 */
export interface BirthDashaBalance {
  lord: DashaLord;
  lordNameHi: string;
  lordNameSa: string;
  nakshatraIndex: number;
  nakshatraNameEn: string;
  nakshatraNameHi: string;
  pada: number;
  passedArcDeg: number;
  remainingArcDeg: number;
  elapsedFraction: number;
  remainingFraction: number;
  remainingYearsTotal: number;
  years: number;
  months: number;
  days: number;
}

/**
 * Current Active Dasha Hierarchy snapshot
 */
export interface CurrentDashaSnapshot {
  mahadasha?: DashaPeriod;
  antardasha?: DashaPeriod;
  pratyantardasha?: DashaPeriod;
  sookshma?: DashaPeriod;
  prana?: DashaPeriod;
}

/**
 * Full Multi-Tier Dasha Timeline Result
 */
export interface DashaTimeline {
  system: DashaSystem;
  systemNameEn: string;
  systemNameSa: string;
  totalCycleYears: number;
  birthTimestampMs: number;
  targetTimestampMs: number;
  balanceAtBirth: BirthDashaBalance;
  periods: DashaPeriod[];
  currentPeriods: CurrentDashaSnapshot;
  convention: DashaYearConvention;
  depthLevels: DashaLevel;
}

/**
 * Context input for Dasha calculations
 */
export interface DashaContext {
  moonSiderealLonDeg: number;
  birthTimestampMs: number;
  targetTimestampMs?: number; // query date, defaults to Date.now()
  depthLevels?: DashaLevel; // 1 to 5, default 2 (Mahadasha + Antardasha) or 3
  convention?: DashaYearConvention; // default gregorian_solar (365.2425 days)
  maxYears?: number; // default full cycle (120 years for Vimshottari)
}
