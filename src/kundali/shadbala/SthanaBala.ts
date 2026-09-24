import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { SthanaBalaBreakdown } from "./ShadbalaTypes";
import { VargaEngine } from "../varga/VargaEngine";
import { VargaType } from "../contracts/IVargaEngine";

/**
 * Deep Exaltation Longitudes in Sidereal Zodiac (BPHS Ch. 3 & Ch. 27)
 */
export const DEEP_EXALTATION_DEG: Record<string, number> = {
  Sun: 10.0, // Aries 10°
  Moon: 33.0, // Taurus 3°
  Mars: 298.0, // Capricorn 28°
  Mercury: 165.0, // Virgo 15°
  Jupiter: 95.0, // Cancer 5°
  Venus: 357.0, // Pisces 27°
  Saturn: 200.0, // Libra 20°
  Rahu: 50.0, // Taurus 20° (Extended)
  Ketu: 230.0, // Scorpio 20° (Extended)
};

/**
 * Classical Sign Lords (0 to 11)
 */
export const SIGN_LORDS: CanonicalBodyId[] = [
  "Mars", // 0: Aries
  "Venus", // 1: Taurus
  "Mercury", // 2: Gemini
  "Moon", // 3: Cancer
  "Sun", // 4: Leo
  "Mercury", // 5: Virgo
  "Venus", // 6: Libra
  "Mars", // 7: Scorpio
  "Jupiter", // 8: Sagittarius
  "Saturn", // 9: Capricorn
  "Saturn", // 10: Aquarius
  "Jupiter", // 11: Pisces
];

/**
 * Naisargika (Natural) Planetary Relationships (BPHS Ch. 3, v. 55-60)
 * 1 = Friend, 0 = Neutral, -1 = Enemy
 */
export const NAISARGIKA_RELATIONSHIPS: Record<CanonicalBodyId, Record<string, number>> = {
  Sun: {
    Sun: 1,
    Moon: 1,
    Mars: 1,
    Jupiter: 1,
    Mercury: 0,
    Venus: -1,
    Saturn: -1,
    Rahu: -1,
    Ketu: -1,
  },
  Moon: {
    Sun: 1,
    Moon: 1,
    Mercury: 1,
    Mars: 0,
    Jupiter: 0,
    Venus: 0,
    Saturn: 0,
    Rahu: -1,
    Ketu: -1,
  },
  Mars: {
    Sun: 1,
    Moon: 1,
    Jupiter: 1,
    Mars: 1,
    Venus: 0,
    Saturn: 0,
    Mercury: -1,
    Rahu: -1,
    Ketu: -1,
  },
  Mercury: {
    Sun: 1,
    Venus: 1,
    Mercury: 1,
    Mars: 0,
    Jupiter: 0,
    Saturn: 0,
    Moon: -1,
    Rahu: 0,
    Ketu: 0,
  },
  Jupiter: {
    Sun: 1,
    Moon: 1,
    Mars: 1,
    Jupiter: 1,
    Saturn: 0,
    Mercury: -1,
    Venus: -1,
    Rahu: 0,
    Ketu: 0,
  },
  Venus: {
    Mercury: 1,
    Saturn: 1,
    Venus: 1,
    Mars: 0,
    Jupiter: 0,
    Sun: -1,
    Moon: -1,
    Rahu: 1,
    Ketu: 0,
  },
  Saturn: {
    Mercury: 1,
    Venus: 1,
    Saturn: 1,
    Jupiter: 0,
    Sun: -1,
    Moon: -1,
    Mars: -1,
    Rahu: 1,
    Ketu: -1,
  },
  Rahu: {
    Mercury: 1,
    Venus: 1,
    Saturn: 1,
    Jupiter: 0,
    Sun: -1,
    Moon: -1,
    Mars: -1,
    Rahu: 1,
    Ketu: 0,
  },
  Ketu: {
    Mars: 1,
    Venus: 1,
    Saturn: 1,
    Jupiter: 0,
    Mercury: 0,
    Sun: -1,
    Moon: -1,
    Rahu: 0,
    Ketu: 1,
  },
};

/**
 * Checks if a planet is in its Moolatrikona portion in D1
 */
export function isPlanetInMoolatrikona(planet: CanonicalBodyId, longitudeDeg: number): boolean {
  const normDeg = ((longitudeDeg % 360) + 360) % 360;
  const signIndex = Math.floor(normDeg / 30);
  const degInSign = normDeg % 30;

  switch (planet) {
    case "Sun":
      return signIndex === 4 && degInSign >= 0 && degInSign <= 20; // Leo 0-20°
    case "Moon":
      return signIndex === 1 && degInSign > 3 && degInSign <= 30; // Taurus 3-30°
    case "Mars":
      return signIndex === 0 && degInSign >= 0 && degInSign <= 12; // Aries 0-12°
    case "Mercury":
      return signIndex === 5 && degInSign >= 15 && degInSign <= 20; // Virgo 15-20°
    case "Jupiter":
      return signIndex === 8 && degInSign >= 0 && degInSign <= 10; // Sagittarius 0-10°
    case "Venus":
      return signIndex === 6 && degInSign >= 0 && degInSign <= 15; // Libra 0-15°
    case "Saturn":
      return signIndex === 10 && degInSign >= 0 && degInSign <= 20; // Aquarius 0-20°
    default:
      return false;
  }
}

/**
 * 1. Calculate Uchcha Bala (Exaltation Strength)
 * BPHS Ch. 27, v. 2-3
 * Max: 60 Virupas, Min: 0 Virupas
 */
export function calculateUchchaBala(planet: CanonicalBodyId, siderealLonDeg: number): number {
  const deepEx = DEEP_EXALTATION_DEG[planet];
  if (deepEx === undefined) return 0;

  const deepDeb = (deepEx + 180.0) % 360.0;
  let arcFromDeb = Math.abs((siderealLonDeg - deepDeb + 360.0) % 360.0);
  if (arcFromDeb > 180.0) {
    arcFromDeb = 360.0 - arcFromDeb;
  }

  // Virupas = Arc / 3 (since 180° / 3 = 60 Virupas)
  return arcFromDeb / 3.0;
}

/**
 * 2. Calculate Saptavargaja Bala
 * Evaluated across D1, D2, D3, D7, D9, D12, D30
 * BPHS Ch. 27, v. 4-7
 */
export function calculateSaptavargajaBala(
  planet: CanonicalBodyId,
  natalLonDeg: number,
  allPlanetNatalLons: Record<string, number>,
): number {
  if (planet === "Rahu" || planet === "Ketu") return 0;

  const saptavargaTypes: VargaType[] = ["D1", "D2", "D3", "D7", "D9", "D12", "D30"];
  const natalSign = Math.floor((((natalLonDeg % 360) + 360) % 360) / 30);

  // Determine Tatkalika (Temporary) Relationships in D1
  // Planets in 2, 3, 4, 10, 11, 12 from planet are Tatkalika Mitra (+1)
  // Planets in 1, 5, 6, 7, 8, 9 are Tatkalika Shatru (-1)
  const tatkalikaMap: Partial<Record<string, number>> = {};
  for (const otherPlanet of Object.keys(allPlanetNatalLons) as CanonicalBodyId[]) {
    if (otherPlanet === planet || otherPlanet === "Rahu" || otherPlanet === "Ketu") {
      tatkalikaMap[otherPlanet] = 0;
      continue;
    }
    const otherSign = Math.floor((((allPlanetNatalLons[otherPlanet] % 360) + 360) % 360) / 30);
    const houseDiff = ((otherSign - natalSign + 12) % 12) + 1;
    if ([2, 3, 4, 10, 11, 12].includes(houseDiff)) {
      tatkalikaMap[otherPlanet] = 1; // Friend
    } else {
      tatkalikaMap[otherPlanet] = -1; // Enemy
    }
  }

  let totalSaptavargaPoints = 0;

  for (const varga of saptavargaTypes) {
    const vPos = VargaEngine.calculatePositionInVarga(natalLonDeg, varga);
    const signIndex = vPos.destinationSignIndex;
    const signLord = SIGN_LORDS[signIndex];

    // Check Moolatrikona (strictly in D1)
    if (varga === "D1" && isPlanetInMoolatrikona(planet, natalLonDeg)) {
      totalSaptavargaPoints += 45.0;
      continue;
    }

    // Own Sign
    if (signLord === planet) {
      totalSaptavargaPoints += 30.0;
      continue;
    }

    // Panchadha Maitri synthesis
    const naisargika = NAISARGIKA_RELATIONSHIPS[planet]?.[signLord] ?? 0;
    const tatkalika = tatkalikaMap[signLord] ?? 0;
    const combined = naisargika + tatkalika;

    if (combined >= 2) {
      totalSaptavargaPoints += 20.0; // Adhi-Mitra (Great Friend)
    } else if (combined === 1) {
      totalSaptavargaPoints += 15.0; // Mitra (Friend)
    } else if (combined === 0) {
      totalSaptavargaPoints += 10.0; // Sama (Neutral)
    } else if (combined === -1) {
      totalSaptavargaPoints += 5.0; // Shatru (Enemy)
    } else {
      totalSaptavargaPoints += 2.5; // Adhi-Shatru (Bitter Enemy)
    }
  }

  return totalSaptavargaPoints;
}

/**
 * 3. Calculate Ojayugmarashi Bala (Odd / Even Sign Strength)
 * BPHS Ch. 27, v. 8-9
 * Moon and Venus get 15 Virupas in Even signs in D1 & D9
 * Sun, Mars, Jupiter, Mercury, Saturn get 15 Virupas in Odd signs in D1 & D9
 */
export function calculateOjayugmarashiBala(
  planet: CanonicalBodyId,
  siderealLonDeg: number,
): number {
  if (planet === "Rahu" || planet === "Ketu") return 0;

  const d1Sign = Math.floor((((siderealLonDeg % 360) + 360) % 360) / 30);
  const d9Sign = VargaEngine.calculatePositionInVarga(siderealLonDeg, "D9").destinationSignIndex;

  const isD1Odd = d1Sign % 2 === 0; // 0 (Aries) = Odd sign, 1 (Taurus) = Even sign
  const isD9Odd = d9Sign % 2 === 0;

  let points = 0;
  if (planet === "Moon" || planet === "Venus") {
    if (!isD1Odd) points += 15.0;
    if (!isD9Odd) points += 15.0;
  } else {
    if (isD1Odd) points += 15.0;
    if (isD9Odd) points += 15.0;
  }

  return points;
}

/**
 * 4. Calculate Kendradi Bala
 * BPHS Ch. 27, v. 10
 * Kendra (1, 4, 7, 10): 60 Virupas
 * Panaphara (2, 5, 8, 11): 30 Virupas
 * Apoklima (3, 6, 9, 12): 15 Virupas
 */
export function calculateKendradiBala(houseNumber: number): number {
  if ([1, 4, 7, 10].includes(houseNumber)) return 60.0;
  if ([2, 5, 8, 11].includes(houseNumber)) return 30.0;
  return 15.0;
}

/**
 * 5. Calculate Drekkana Bala
 * BPHS Ch. 27, v. 11
 * 1st Decanate (0-10°): Male planets (Sun, Mars, Jupiter) get 15 Virupas
 * 2nd Decanate (10-20°): Neutral planets (Mercury, Saturn) get 15 Virupas
 * 3rd Decanate (20-30°): Female planets (Moon, Venus) get 15 Virupas
 */
export function calculateDrekkanaBala(planet: CanonicalBodyId, siderealLonDeg: number): number {
  const degInSign = ((siderealLonDeg % 30) + 30) % 30;
  const drekkanaIndex = Math.floor(degInSign / 10); // 0, 1, or 2

  if (drekkanaIndex === 0 && ["Sun", "Mars", "Jupiter"].includes(planet)) {
    return 15.0;
  }
  if (drekkanaIndex === 1 && ["Mercury", "Saturn"].includes(planet)) {
    return 15.0;
  }
  if (drekkanaIndex === 2 && ["Moon", "Venus"].includes(planet)) {
    return 15.0;
  }
  return 0.0;
}

/**
 * Complete Sthana Bala calculation for a single planet
 */
export function calculateSthanaBala(
  planet: CanonicalBodyId,
  siderealLonDeg: number,
  houseNumber: number,
  allPlanetNatalLons: Record<string, number>,
): SthanaBalaBreakdown {
  const uchcha = calculateUchchaBala(planet, siderealLonDeg);
  const saptavargaja = calculateSaptavargajaBala(planet, siderealLonDeg, allPlanetNatalLons);
  const ojayugma = calculateOjayugmarashiBala(planet, siderealLonDeg);
  const kendradi = calculateKendradiBala(houseNumber);
  const drekkana = calculateDrekkanaBala(planet, siderealLonDeg);

  const totalVirupas = uchcha + saptavargaja + ojayugma + kendradi + drekkana;

  return {
    uchchaBala: uchcha,
    saptavargajaBala: saptavargaja,
    ojayugmarashiBala: ojayugma,
    kendradiBala: kendradi,
    drekkanaBala: drekkana,
    totalVirupas,
    totalRupas: totalVirupas / 60.0,
    formulaVersion: "BPHS-27.2-11",
    source: "Brihat Parashara Hora Shastra, Ch. 27, v. 2-11",
  };
}
