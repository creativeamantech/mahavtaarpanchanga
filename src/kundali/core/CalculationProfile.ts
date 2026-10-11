/**
 * Mahavtaar Kundali Engine - Canonical Calculation Profile
 * Phase 8 Production System Architecture
 */

import { InvalidCalculationProfileError } from "./ErrorModel";

export type AyanamshaMode = "lahiri" | "raman" | "kp" | "yukteshwar" | "tropical";
export type ZodiacMode = "sidereal" | "tropical";
export type EphemerisSource = "astronomy_engine_v2";
export type HouseSystem = "whole_sign" | "placidus" | "equal" | "sripati";
export type CoordinateSystem = "geocentric";
export type TimeScale = "utc";
export type DashaYearConvention = "365.2425" | "360_savana" | "365_solar";
export type VargaConvention = "parashara";
export type NodeConvention = "mean" | "true";
export type RetrogradeConvention = "astronomy_engine";
export type RoundingPolicy = "4_decimal_places" | "standard";
export type PrecisionPolicy = "double_precision_64";

export interface CalculationProfile {
  profileId: string;
  version: string; // e.g. "1.0.0"
  ayanamsha: AyanamshaMode;
  zodiac: ZodiacMode;
  ephemeris: EphemerisSource;
  houseSystem: HouseSystem;
  coordinateSystem: CoordinateSystem;
  timeScale: TimeScale;
  geographicCoordinatePrecision: number; // e.g., 4
  elevationMeters: number;
  dashaYearConvention: DashaYearConvention;
  vargaConvention: VargaConvention;
  nodeConvention: NodeConvention;
  retrogradeConvention: RetrogradeConvention;
  roundingPolicy: RoundingPolicy;
  precisionPolicy: PrecisionPolicy;
  engineVersion: string; // e.g. "1.0.0-phase8"
  calculationProfileVersion: string; // e.g. "1.0.0"
}

export const DEFAULT_CALCULATION_PROFILE: CalculationProfile = {
  profileId: "default_canonical_lahiri_parashara",
  version: "1.0.0",
  ayanamsha: "lahiri",
  zodiac: "sidereal",
  ephemeris: "astronomy_engine_v2",
  houseSystem: "whole_sign",
  coordinateSystem: "geocentric",
  timeScale: "utc",
  geographicCoordinatePrecision: 4,
  elevationMeters: 0,
  dashaYearConvention: "365.2425",
  vargaConvention: "parashara",
  nodeConvention: "mean",
  retrogradeConvention: "astronomy_engine",
  roundingPolicy: "4_decimal_places",
  precisionPolicy: "double_precision_64",
  engineVersion: "1.0.0-phase8",
  calculationProfileVersion: "1.0.0",
};

export function validateCalculationProfile(profile: CalculationProfile): void {
  if (!profile) {
    throw new InvalidCalculationProfileError("CalculationProfile cannot be null or undefined");
  }
  if (!profile.profileId || typeof profile.profileId !== "string") {
    throw new InvalidCalculationProfileError("Invalid profileId in CalculationProfile");
  }
  if (!profile.version || typeof profile.version !== "string") {
    throw new InvalidCalculationProfileError("Invalid version in CalculationProfile");
  }
  const validAyanamshas: AyanamshaMode[] = ["lahiri", "raman", "kp", "yukteshwar", "tropical"];
  if (!validAyanamshas.includes(profile.ayanamsha)) {
    throw new InvalidCalculationProfileError(`Unsupported ayanamsha mode: ${profile.ayanamsha}`);
  }
  if (profile.geographicCoordinatePrecision < 0 || profile.geographicCoordinatePrecision > 10) {
    throw new InvalidCalculationProfileError(
      "Geographic coordinate precision must be between 0 and 10",
    );
  }
}

export function createCalculationProfile(
  overrides?: Partial<CalculationProfile>,
): CalculationProfile {
  const profile: CalculationProfile = {
    ...DEFAULT_CALCULATION_PROFILE,
    ...overrides,
  };
  validateCalculationProfile(profile);
  return profile;
}
