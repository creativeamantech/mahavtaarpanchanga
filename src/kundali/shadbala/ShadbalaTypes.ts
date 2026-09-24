import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";

/**
 * Standard Shadbala Measurement Units
 */
export enum ShadbalaUnit {
  VIRUPA = "Virupa", // 1/60th of a Rupa
  RUPA = "Rupa", // 60 Virupas
  DEGREE = "Degree", // Angular measure (0 - 360)
  RATIO = "Ratio", // Ratio of actual strength to required benchmark
}

/**
 * 1. Sthana Bala (Positional Strength) Breakdown
 */
export interface SthanaBalaBreakdown {
  uchchaBala: number; // Exaltation strength (0 - 60 Virupas)
  saptavargajaBala: number; // Strength from Saptavarga divisional charts (D1, D2, D3, D7, D9, D12, D30)
  ojayugmarashiBala: number; // Odd/Even sign strength in D1 & D9 (0, 15, or 30 Virupas)
  kendradiBala: number; // Kendra (60), Panaphara (30), Apoklima (15 Virupas)
  drekkanaBala: number; // Decanate gender affinity strength (0 or 15 Virupas)
  totalVirupas: number;
  totalRupas: number;
  formulaVersion: string;
  source: string;
}

/**
 * 2. Dig Bala (Directional Strength) Breakdown
 */
export interface DigBalaBreakdown {
  referenceHouse: number; // Cardinal house of maximum strength (1, 4, 7, 10)
  zeroPointDeg: number; // Cusp of zero strength (180 deg away)
  angularDistanceDeg: number; // Arc from zero point
  totalVirupas: number; // 0 - 60 Virupas
  totalRupas: number;
  formulaVersion: string;
  source: string;
}

/**
 * 3. Kala Bala (Temporal / Time Strength) Breakdown
 */
export interface KalaBalaBreakdown {
  natonnataBala: number; // Diurnal / Nocturnal strength
  pakshaBala: number; // Lunar fortnight elongation strength
  tribhagaBala: number; // Day/Night 3-part period ruler strength
  varshaBala: number; // Solar year lord strength (15 Virupas)
  masaBala: number; // Solar month lord strength (30 Virupas)
  dinaBala: number; // Weekday (Vara) lord strength (45 Virupas)
  horaBala: number; // Planetary hour (Hora) lord strength (60 Virupas)
  ayanaBala: number; // Declination (Kranti) strength
  yuddhaBala: number; // Planetary war adjustment (0 if no war)
  totalVirupas: number;
  totalRupas: number;
  formulaVersion: string;
  source: string;
}

/**
 * 4. Cheshta Bala (Motional Strength) Breakdown
 */
export type PlanetaryMotionState =
  | "vakra" // Retrograde (60 Virupas)
  | "anuvakra" // Resumed direct, slow (30 Virupas)
  | "vikala" // Stationary / zero velocity (15 Virupas)
  | "manda" // Slow direct (<50% mean speed, 30 Virupas)
  | "mandatara" // Very slow direct (<25% mean speed, 15 Virupas)
  | "sama" // Mean speed (7.5 Virupas)
  | "chara" // Accelerated speed (>120% mean speed, 45 Virupas)
  | "atichara"; // Super-accelerated (>150% mean speed, 30 Virupas)

export interface CheshtaBalaBreakdown {
  motionState: PlanetaryMotionState;
  dailySpeedDeg: number;
  meanDailySpeedDeg: number;
  isRetrograde: boolean;
  totalVirupas: number; // 0 - 60 Virupas
  totalRupas: number;
  formulaVersion: string;
  source: string;
}

/**
 * 5. Naisargika Bala (Natural Inherent Strength) Breakdown
 */
export interface NaisargikaBalaBreakdown {
  rankIndex: number; // 1 to 7 (Sun = 7 down to Saturn = 1)
  fractionalValue: string; // e.g. "60/7", "120/7", etc.
  totalVirupas: number; // Fixed constant
  totalRupas: number;
  source: string;
}

/**
 * 6. Drik Bala (Aspectual Strength) Breakdown
 */
export interface DrikBalaBreakdown {
  beneficDrishti: number; // Positive aspectual Virupas
  maleficDrishti: number; // Negative aspectual Virupas
  totalVirupas: number; // Net (can be positive or negative)
  totalRupas: number;
  formulaVersion: string;
  source: string;
}

/**
 * Ishta Phala & Kashta Phala
 */
export interface IshtaKashtaResult {
  ishtaPhala: number; // Auspicious fruit (0 - 60)
  kashtaPhala: number; // Inauspicious fruit (0 - 60)
  uchchaFactor: number;
  cheshtaFactor: number;
  source: string;
}

/**
 * Complete Six-Fold Strength for a Single Graha
 */
export interface GrahaShadbalaDetailed {
  planet: CanonicalBodyId;
  sthanaBala: SthanaBalaBreakdown;
  digBala: DigBalaBreakdown;
  kalaBala: KalaBalaBreakdown;
  cheshtaBala: CheshtaBalaBreakdown;
  naisargikaBala: NaisargikaBalaBreakdown;
  drikBala: DrikBalaBreakdown;
  ishtaKashta: IshtaKashtaResult;
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number; // Classical BPHS benchmark
  requiredVirupas: number;
  strengthRatio: number; // totalRupas / requiredRupas (>= 1.0 indicates strong)
  isAdequate: boolean; // totalVirupas >= requiredVirupas
  rank: number; // 1 (strongest) to 7 (weakest)
}

/**
 * Bhava Bala (House Strength) Detailed Breakdown
 */
export interface BhavaBalaDetailed {
  houseNumber: number; // 1 to 12
  signIndex: number; // 0 to 11
  signLord: CanonicalBodyId;
  bhavadhipatiBala: number; // Lord's Shadbala transferred to house (Virupas)
  bhavaDigBala: number; // House sign's directional strength (Virupas)
  bhavaDrishtiBala: number; // Net aspectual strength on house midpoint (Virupas)
  totalVirupas: number;
  totalRupas: number;
  rank: number; // 1 to 12
  source: string;
}

/**
 * Complete Shadbala & Bhava Bala System Result
 */
export interface CompleteShadbalaResult {
  metadata: RepositoryMetadata;
  planets: Record<CanonicalBodyId, GrahaShadbalaDetailed>;
  bhavas: BhavaBalaDetailed[];
  planetaryShadbala?: Record<CanonicalBodyId, GrahaShadbalaDetailed>;
  bhavaBala?: BhavaBalaDetailed[];
  strongestPlanet: CanonicalBodyId;
  weakestPlanet: CanonicalBodyId;
  strongestHouse: number;
  weakestHouse: number;
  calculationTimestamp: number;
}
