import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { BhavaBalaDetailed } from "./ShadbalaTypes";
import { SIGN_LORDS } from "./SthanaBala";
import { calculateRawDrishti } from "./DrikBala";

/**
 * Returns the peak directional house (1, 4, 7, 10) for a given zodiac sign
 * Nara -> 1st, Jala -> 4th, Keeta -> 7th, Chatushpada -> 10th
 */
export function getBhavaSignPeakHouse(signIndex: number, degInSign: number): number {
  // 0: Aries (Quadruped -> 10)
  // 1: Taurus (Quadruped -> 10)
  // 2: Gemini (Human -> 1)
  // 3: Cancer (Watery -> 4)
  // 4: Leo (Quadruped -> 10)
  // 5: Virgo (Human -> 1)
  // 6: Libra (Human -> 1)
  // 7: Scorpio (Insect -> 7)
  // 8: Sagittarius (0-15° Human -> 1, 15-30° Quadruped -> 10)
  // 9: Capricorn (0-15° Quadruped -> 10, 15-30° Watery -> 4)
  // 10: Aquarius (Human -> 1)
  // 11: Pisces (Watery -> 4)
  switch (signIndex) {
    case 2: // Gemini
    case 5: // Virgo
    case 6: // Libra
    case 10: // Aquarius
      return 1;
    case 3: // Cancer
    case 11: // Pisces
      return 4;
    case 7: // Scorpio
      return 7;
    case 0: // Aries
    case 1: // Taurus
    case 4: // Leo
      return 10;
    case 8: // Sagittarius
      return degInSign < 15.0 ? 1 : 10;
    case 9: // Capricorn
      return degInSign < 15.0 ? 10 : 4;
    default:
      return 1;
  }
}

/**
 * Calculates Bhava Dig Bala based on sign affinity
 */
export function calculateBhavaDigBala(
  houseNumber: number,
  signIndex: number,
  degInSign: number,
): number {
  const peakHouse = getBhavaSignPeakHouse(signIndex, degInSign);
  const diff = Math.abs(houseNumber - peakHouse);
  const separation = Math.min(diff, 12 - diff); // 0 to 6
  return (1.0 - separation / 6.0) * 60.0;
}

/**
 * Calculates Bhava Drishti Bala (Aspect on house midpoint)
 */
export function calculateBhavaDrishtiBala(
  houseMidpointDeg: number,
  allPlanetLons: Record<CanonicalBodyId, number>,
  isMoonWaxing: boolean,
): number {
  let beneficDrishti = 0;
  let maleficDrishti = 0;

  const planets: CanonicalBodyId[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
  ];

  for (const p of planets) {
    const pLon = allPlanetLons[p];
    if (pLon === undefined) continue;

    const raw = calculateRawDrishti(p, houseMidpointDeg, pLon);
    const quarter = raw / 4.0;

    let isBenefic = false;
    if (p === "Jupiter" || p === "Venus") {
      isBenefic = true;
    } else if (p === "Moon") {
      isBenefic = isMoonWaxing;
    } else if (p === "Mercury") {
      isBenefic = true;
    }

    if (isBenefic) {
      beneficDrishti += quarter;
    } else {
      maleficDrishti += quarter;
    }
  }

  return beneficDrishti - maleficDrishti;
}

/**
 * Computes Bhava Bala for all 12 Houses
 * BPHS Ch. 27, v. 38-42
 *
 * @param houseMidpointsDeg Array of 12 house midpoints (index 0 = 1st house)
 * @param planetShadbalasVirupas Map of planetary Shadbala totals in Virupas
 * @param allPlanetLons Map of planetary sidereal longitudes
 * @param isMoonWaxing Boolean
 */
export function calculateAllBhavaBalas(
  houseMidpointsDeg: number[],
  planetShadbalasVirupas: Record<CanonicalBodyId, number>,
  allPlanetLons: Record<CanonicalBodyId, number>,
  isMoonWaxing: boolean,
): BhavaBalaDetailed[] {
  const results: BhavaBalaDetailed[] = [];

  for (let h = 1; h <= 12; h++) {
    const midpoint = houseMidpointsDeg[h - 1] ?? (houseMidpointsDeg[0] + (h - 1) * 30.0) % 360.0;
    const signIndex = Math.floor((((midpoint % 360.0) + 360.0) % 360.0) / 30.0);
    const degInSign = ((midpoint % 30.0) + 30.0) % 30.0;
    const signLord = SIGN_LORDS[signIndex];

    // 1. Bhavadhipati Bala (Lord's Shadbala transferred directly)
    const bhavadhipatiBala = planetShadbalasVirupas[signLord] ?? 300.0;

    // 2. Bhava Dig Bala (Sign direction)
    const bhavaDigBala = calculateBhavaDigBala(h, signIndex, degInSign);

    // 3. Bhava Drishti Bala (Aspect on house midpoint)
    const bhavaDrishtiBala = calculateBhavaDrishtiBala(midpoint, allPlanetLons, isMoonWaxing);

    const totalVirupas = bhavadhipatiBala + bhavaDigBala + bhavaDrishtiBala;

    results.push({
      houseNumber: h,
      signIndex,
      signLord,
      bhavadhipatiBala,
      bhavaDigBala,
      bhavaDrishtiBala,
      totalVirupas,
      totalRupas: totalVirupas / 60.0,
      rank: 1, // populated below
      source: "Brihat Parashara Hora Shastra, Ch. 27, v. 38-42",
    });
  }

  // Sort by total strength descending to assign ranks
  const sorted = [...results].sort((a, b) => b.totalVirupas - a.totalVirupas);
  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}
