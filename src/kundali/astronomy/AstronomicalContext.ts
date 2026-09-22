import * as Astronomy from "astronomy-engine";

/**
 * Canonical Physical Celestial Body Identifier
 */
export type CanonicalBodyId =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu"
  | "Uranus"
  | "Neptune"
  | "Pluto";

/**
 * Classical Navagraha (9 Vedic Planets)
 */
export const CLASSICAL_NAVAGRAHA: CanonicalBodyId[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
];

/**
 * 7 Classical Saptagrahas (used in Ashtakavarga, Shadbala, Karakas)
 */
export const SAPTA_GRAHAS: CanonicalBodyId[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

/**
 * Unified Time Representation
 */
export interface TimeContext {
  /** UTC timestamp in milliseconds */
  utcMs: number;
  /** ISO UTC date string (e.g., 2026-09-22T15:00:00.000Z) */
  isoUtc: string;
  /** Julian Date (UT) */
  julianDay: number;
  /** Centuries since J2000.0 (JD 2451545.0): t.ut / 36525.0 */
  centuriesSinceJ2000: number;
  /** Standard Astronomy.AstroTime handle from astronomy-engine */
  astroTime: Astronomy.AstroTime;
  /** Wall clock representations */
  local: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    timezone: string;
    formattedTime: string;
  };
}

/**
 * Geographic Observer Location Context
 */
export interface LocationContext {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  cityName: string;
  timezone: string;
  observer: Astronomy.Observer;
}

/**
 * Vector and Spherical Coordinates of a Celestial Body
 */
export interface PlanetaryPosition {
  id: CanonicalBodyId;
  /** Tropical Ecliptic Longitude in degrees [0, 360) */
  tropicalLongitude: number;
  /** Tropical Ecliptic Latitude in degrees [-90, +90] */
  tropicalLatitude: number;
  /** Geocentric Distance in Astronomical Units (AU) */
  distanceAU: number;
  /** True daily speed in degrees/day (dLon/dt) */
  speedDegPerDay: number;
  /** Retrograde status (true if longitude decreasing over time) */
  isRetrograde: boolean;
  /** Right Ascension in degrees [0, 360) */
  rightAscensionDeg: number;
  /** Declination in degrees [-90, +90] */
  declinationDeg: number;
}

/**
 * Sidereal Transformed Position after applying an Ayanamsha
 */
export interface SiderealPosition {
  id: CanonicalBodyId;
  /** Nirayana (Sidereal) Longitude [0, 360) */
  siderealLongitude: number;
  /** Zodiac sign index: 0 = Aries (Mesha), 11 = Pisces (Meena) */
  signIndex: number;
  /** Degree within the sign [0, 30) */
  degreeInSign: number;
  /** Nakshatra 1 to 27 (1 = Ashwini, 27 = Revati) */
  nakshatraIndex: number;
  /** Pada 1 to 4 */
  pada: number;
  /** Daily speed preserved */
  speedDegPerDay: number;
  isRetrograde: boolean;
}

/**
 * Topocentric Lagna (Ascendant) & Cardinal Points
 */
export interface LagnaPosition {
  /** Tropical Ascendant degree [0, 360) */
  tropicalAscendant: number;
  /** Sidereal Ascendant degree [0, 360) */
  siderealAscendant: number;
  signIndex: number;
  degreeInSign: number;
  nakshatraIndex: number;
  pada: number;
  /** Greenwich Mean Sidereal Time in hours [0, 24) */
  gmstHours: number;
  /** Local Apparent Sidereal Time in hours [0, 24) */
  lastHours: number;
  /** Right Ascension of Midheaven (RAMC) in degrees [0, 360) */
  ramcDegrees: number;
  /** True Obliquity of the Ecliptic (epsilon) in degrees */
  obliquityDegrees: number;
}

/**
 * The Canonical Astronomical Context
 * Created ONCE per calculation; consumed by all downstream Jyotisha engines.
 */
export interface AstronomicalContext {
  time: TimeContext;
  location: LocationContext;
  /** Tropical coordinates of all monitored bodies */
  positions: Record<CanonicalBodyId, PlanetaryPosition>;
  /** Topocentric Lagna calculation */
  lagna: LagnaPosition;
  /** Active Ayanamsha applied */
  ayanamsa: {
    system: string;
    degrees: number;
    description: string;
  };
  /** Pre-calculated Sidereal positions for active Ayanamsha */
  siderealPositions: Record<CanonicalBodyId, SiderealPosition>;
}
