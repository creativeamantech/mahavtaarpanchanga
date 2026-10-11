/**
 * Mahavtaar Kundali Engine - Unified Full Kundali Data Contract
 * Phase 8 Production System Architecture
 */

import { CalculationProfile } from "./CalculationProfile";
import { KundaliBirthInput } from "./KundaliBirthInput";
import { CalculationProvenance } from "../audit/ProvenanceSystem";
import { CanonicalBodyId, SiderealPosition } from "../astronomy/AstronomicalContext";
import { VargaChartResult, VargaType } from "../contracts/IVargaEngine";
import { CompleteShadbalaResult } from "../shadbala/ShadbalaTypes";
import { DashaTimeline } from "../dasha/types/DashaTypes";
import { RuleResult } from "../rules/RuleTypes";
import { JaiminiProfile } from "../jaimini/JaiminiTypes";

export interface AstronomyData {
  ayanamshaDeg: number;
  utcTimestampMs: number;
  planets: Record<
    CanonicalBodyId,
    SiderealPosition & {
      tropicalLongitude: number;
      houseD1: number;
      houseD9: number;
      dignity: string;
      isCombust: boolean;
      isBenefic: boolean;
    }
  >;
  ascendant: {
    signIndex: number;
    degreeInSign: number;
    tropicalLongitude: number;
    siderealLongitude: number;
    nakshatraNumber: number;
    nakshatraName: string;
    pada: number;
  };
  mc?: {
    tropicalLongitude: number;
    siderealLongitude: number;
  };
}

export interface HouseCuspInfo {
  houseNumber: number; // 1 to 12
  signIndex: number; // 0 to 11
  signNameEn: string;
  signNameHi: string;
  lord: CanonicalBodyId;
  cuspLongitudeDeg: number;
  occupants: CanonicalBodyId[];
  aspectingPlanets: CanonicalBodyId[];
}

export interface HouseData {
  houseSystem: string;
  cusps: HouseCuspInfo[];
}

export interface AshtakavargaHousePoints {
  houseNumber: number;
  signIndex: number;
  totalPoints: number; // Samudaya Ashtakavarga points (0-56)
  planetContributions: Record<CanonicalBodyId, number>; // 0 or 1 per planet
}

export interface AshtakavargaData {
  bhinna: Record<CanonicalBodyId, number[]>; // 12 houses points per planet
  samudaya: number[]; // 12 houses total points
  houses: AshtakavargaHousePoints[];
}

export interface KpCuspInfo {
  houseNumber: number;
  longitudeDeg: number;
  signIndex: number;
  signLord: CanonicalBodyId;
  starLord: CanonicalBodyId;
  subLord: CanonicalBodyId;
  subSubLord: CanonicalBodyId;
}

export interface KpPlanetInfo {
  planet: CanonicalBodyId;
  longitudeDeg: number;
  signIndex: number;
  signLord: CanonicalBodyId;
  starLord: CanonicalBodyId;
  subLord: CanonicalBodyId;
  subSubLord: CanonicalBodyId;
}

export interface KpData {
  ayanamsaKey: string;
  ayanamsaDeg: number;
  cusps: KpCuspInfo[];
  planets: KpPlanetInfo[];
}

export interface GocharTransitPlanet {
  planet: CanonicalBodyId;
  transitLongitudeDeg: number;
  transitSignIndex: number;
  houseFromNatalMoon: number;
  houseFromNatalLagna: number;
  isBeneficTransit: boolean;
  transitNature: "Auspicious" | "Inauspicious" | "Neutral";
}

export interface GocharData {
  transitTimestampMs: number;
  transitPlanets: Record<CanonicalBodyId, GocharTransitPlanet>;
}

export interface ResultHashes {
  astronomyHash: string;
  vargasHash: string;
  shadbalaHash: string;
  dashaHash: string;
  rulesHash: string;
  jaiminiHash: string;
  ashtakavargaHash: string;
  kpHash: string;
  gocharHash: string;
  completeKundaliHash: string;
}

export interface FullKundliData {
  schemaVersion: "1.0.0-phase8";
  calculationId: string;
  birthInput: KundaliBirthInput;
  profile: CalculationProfile;
  engineVersion: string;
  provenance: CalculationProvenance;
  hashes: ResultHashes;
  astronomy: AstronomyData;
  houses: HouseData;
  vargas: Record<VargaType, VargaChartResult>;
  shadbala: CompleteShadbalaResult;
  dasha: DashaTimeline;
  rules: RuleResult[];
  jaimini: JaiminiProfile;
  ashtakavarga: AshtakavargaData;
  kp: KpData;
  gochar: GocharData;
}
