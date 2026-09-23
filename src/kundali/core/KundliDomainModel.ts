import {
  AstronomicalContext,
  CanonicalBodyId,
  SiderealPosition,
} from "../astronomy/AstronomicalContext";
import { AyanamshaSystemKey } from "../astronomy/AyanamshaProvider";

/**
 * Standard User Input for Chart Generation
 */
export interface KundliInput {
  name?: string;
  gender?: "male" | "female" | "other";
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  cityName?: string;
  timezone?: string;
  ayanamsaKey?: AyanamshaSystemKey | string;
  chartStyle?: "north" | "south" | "east";
}

/**
 * Classical Vedic Rashi (Zodiac Sign)
 */
export interface RashiInfo {
  index: number; // 0 to 11
  nameEn: string; // Aries, Taurus, etc.
  nameHi: string; // मेष, वृषभ, etc.
  nameSa: string; // मेषः, वृषभः, etc.
  element: "fire" | "earth" | "air" | "water";
  modality: "chara" | "sthira" | "dvisvabhava"; // Movable, Fixed, Dual
  gender: "male" | "female";
  ruler: CanonicalBodyId;
  exaltedPlanet?: CanonicalBodyId;
  debilitatedPlanet?: CanonicalBodyId;
  moolatrikonaPlanet?: CanonicalBodyId;
}

/**
 * Classical Vedic Bhava (House)
 */
export interface BhavaInfo {
  houseNumber: number; // 1 to 12
  signIndex: number; // Rashi index occupying this bhava in whole-sign
  signNameEn: string;
  signNameHi: string;
  signNameSa: string;
  lord: CanonicalBodyId;
  occupants: CanonicalBodyId[];
  aspectingPlanets: CanonicalBodyId[];
  cuspLongitudeDeg?: number; // For Sripati / KP cusp calculations
}

/**
 * Rich Graha (Planet) Astrological Details
 */
export interface GrahaState extends SiderealPosition {
  nameEn: string;
  nameHi: string;
  nameSa: string;
  dignity:
    | "exalted"
    | "moolatrikona"
    | "own"
    | "great_friend"
    | "friend"
    | "neutral"
    | "enemy"
    | "great_enemy"
    | "debilitated";
  combust: boolean;
  houseOccupied: number; // 1 to 12 from Lagna
  housesOwned: number[]; // 1 to 12
  aspectsCastingOnHouses: number[]; // List of house numbers aspected
}

/**
 * Unified Context containing both astronomy and classical astrological state
 */
export interface KundliContext {
  input: KundliInput;
  astronomy: AstronomicalContext;
  grahas: Record<CanonicalBodyId, GrahaState>;
  bhavas: BhavaInfo[];
  rashis: RashiInfo[];
}

/**
 * Complete immutable State of a Kundali
 */
export interface KundliState {
  context: KundliContext;
  status: "idle" | "calculating" | "ready" | "error";
  errorMessage?: string;
  calculatedAt: string;
}
