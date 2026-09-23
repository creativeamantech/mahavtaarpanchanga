import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { DigBalaBreakdown } from "./ShadbalaTypes";

/**
 * Cardinal Direction Points of Maximum Strength
 * Jupiter, Mercury: 1st house (East / Lagna)
 * Moon, Venus: 4th house (North / 4th Cusp)
 * Saturn: 7th house (West / 7th Cusp)
 * Sun, Mars: 10th house (South / 10th Cusp)
 */
export const DIG_BALA_REFERENCE_HOUSES: Record<CanonicalBodyId, number> = {
  Jupiter: 1,
  Mercury: 1,
  Moon: 4,
  Venus: 4,
  Saturn: 7,
  Sun: 10,
  Mars: 10,
  Rahu: 7,
  Ketu: 1,
};

/**
 * Computes Dig Bala (Directional Strength) for a planet
 * BPHS Ch. 27, v. 12-14
 *
 * @param planet Canonical Graha identifier
 * @param planetLonDeg Sidereal longitude of the planet
 * @param houseCusps Array of 12 house cusp longitudes (1-indexed, index 0 unused or length 12 with index 0 = 1st house)
 */
export function calculateDigBala(
  planet: CanonicalBodyId,
  planetLonDeg: number,
  houseCusps: number[], // 12 house cusp longitudes (index 0 = 1st house)
): DigBalaBreakdown {
  const peakHouse = DIG_BALA_REFERENCE_HOUSES[planet] ?? 1;

  // Zero-strength house is exactly opposite (6 houses away)
  const zeroHouse = ((peakHouse - 1 + 6) % 12) + 1;
  const zeroPointDeg =
    houseCusps[zeroHouse - 1] ?? (houseCusps[0] + (zeroHouse - 1) * 30.0) % 360.0;

  let arc = Math.abs((planetLonDeg - zeroPointDeg + 360.0) % 360.0);
  if (arc > 180.0) {
    arc = 360.0 - arc;
  }

  // Dig Bala = Arc / 3 (since 180° / 3 = 60 Virupas)
  const totalVirupas = arc / 3.0;

  return {
    referenceHouse: peakHouse,
    zeroPointDeg,
    angularDistanceDeg: arc,
    totalVirupas,
    totalRupas: totalVirupas / 60.0,
    formulaVersion: "BPHS-27.12-14-Continuous",
    source: "Brihat Parashara Hora Shastra, Ch. 27, v. 12-14",
  };
}
