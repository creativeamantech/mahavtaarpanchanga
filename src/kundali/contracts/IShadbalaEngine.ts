import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";

/**
 * 1. Sthana Bala (Positional Strength)
 */
export interface SthanaBalaBreakdown {
  uchchaBala: number; // Exaltation strength (max 60 virupas)
  saptavargajaBala: number; // Strength from 7 divisional charts (max 45 virupas)
  ojayugmarashiBala: number; // Odd/Even sign strength (15 virupas)
  kendradiBala: number; // Kendra (60), Panaphara (30), Apoklima (15)
  drekkanaBala: number; // Decanate strength (15 virupas)
  totalVirupas: number;
  totalRupas: number; // virupas / 60
}

/**
 * 2. Dig Bala (Directional Strength)
 * Sun/Mars strong in 10th (South), Jupiter/Mercury in 1st (East),
 * Saturn in 7th (West), Venus/Moon in 4th (North).
 */
export interface DigBalaBreakdown {
  directionalDistanceDeg: number;
  totalVirupas: number; // max 60 virupas
  totalRupas: number;
}

/**
 * 3. Kala Bala (Temporal / Time Strength)
 */
export interface KalaBalaBreakdown {
  natonnataBala: number; // Diurnal / Nocturnal strength
  pakshaBala: number; // Lunar fortnight strength (benefics vs malefics)
  tribhagaBala: number; // Three parts of day and night
  varshaBala: number; // Year lord strength (15 virupas)
  masaBala: number; // Month lord strength (30 virupas)
  dinaBala: number; // Day (Vara) lord strength (45 virupas)
  horaBala: number; // Planetary hour lord strength (60 virupas)
  ayanaBala: number; // Solstitial / Declination strength
  yuddhaBala?: number; // Planetary war bonus/penalty
  totalVirupas: number;
  totalRupas: number;
}

/**
 * 4. Cheshta Bala (Motional Strength - Retrogression, Stations, Fast Motion)
 */
export interface CheshtaBalaBreakdown {
  motionState:
    "vakra" | "anuvakra" | "vikala" | "manda" | "mandatara" | "sama" | "chara" | "atichara";
  totalVirupas: number; // max 60 virupas (Sun and Moon substitute with Ayana Bala)
  totalRupas: number;
}

/**
 * 5. Naisargika Bala (Natural Inherent Strength)
 * Fixed constant according to BPHS Ch. 27:
 * Sun (60), Moon (51.43), Venus (42.86), Jupiter (34.29), Mercury (25.71), Mars (17.14), Saturn (8.57)
 */
export interface NaisargikaBalaBreakdown {
  totalVirupas: number;
  totalRupas: number;
}

/**
 * 6. Drik Bala (Aspectual Strength)
 * Net benefic minus malefic drishti values in Virupas
 */
export interface DrikBalaBreakdown {
  beneficAspects: number;
  maleficAspects: number;
  totalVirupas: number;
  totalRupas: number;
}

/**
 * Complete Six-Fold Strength for a Single Graha
 */
export interface GrahaShadbala {
  planet: CanonicalBodyId;
  sthanaBala: SthanaBalaBreakdown;
  digBala: DigBalaBreakdown;
  kalaBala: KalaBalaBreakdown;
  cheshtaBala: CheshtaBalaBreakdown;
  naisargikaBala: NaisargikaBalaBreakdown;
  drikBala: DrikBalaBreakdown;
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number; // Standard BPHS benchmark (e.g. 5.0 for Sun, 6.0 for Moon, etc.)
  strengthRatio: number; // totalRupas / requiredRupas (>= 1.0 indicates strong planet)
  rank: number; // 1 to 7
}

/**
 * Bhava Bala (House Strength)
 */
export interface BhavaBala {
  houseNumber: number;
  bhavadhipatiBala: number; // House lord's Shadbala
  bhavaDigBala: number; // Directional strength of house
  bhavaDrishtiBala: number; // Aspect strength on house
  totalVirupas: number;
  totalRupas: number;
  rank: number; // 1 to 12
}

/**
 * Complete Shadbala & Bhava Bala System Output
 */
export interface ShadbalaResult {
  planets: Record<CanonicalBodyId, GrahaShadbala>;
  bhavas: BhavaBala[];
  mostPowerfulPlanet: CanonicalBodyId;
  weakestPlanet: CanonicalBodyId;
}

/**
 * Contract for Shadbala Engine
 */
export interface IShadbalaEngine {
  readonly metadata: RepositoryMetadata;
  calculateShadbala(
    siderealLons: Record<CanonicalBodyId, number>,
    lagnaSiderealLon: number,
    utcTimestampMs: number,
    latitude: number,
    longitude: number,
  ): ShadbalaResult;
}
