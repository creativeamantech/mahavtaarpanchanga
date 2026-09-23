import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { DrikBalaBreakdown } from "./ShadbalaTypes";

/**
 * Calculates raw Drishti (Aspect Value, 0 to 60 Virupas) based on piecewise linear BPHS curve
 * BPHS Ch. 27, v. 30-33
 *
 * @param aspectingPlanet The planet casting the aspect
 * @param aspectedLonDeg Longitude of aspected planet or house cusp
 * @param aspectingLonDeg Longitude of aspecting planet
 */
export function calculateRawDrishti(
  aspectingPlanet: CanonicalBodyId,
  aspectedLonDeg: number,
  aspectingLonDeg: number,
): number {
  const theta = (aspectedLonDeg - aspectingLonDeg + 360.0) % 360.0;

  let drishti = 0;
  if (theta >= 0 && theta < 30) {
    drishti = 0;
  } else if (theta >= 30 && theta < 60) {
    drishti = (theta - 30.0) / 2.0;
  } else if (theta >= 60 && theta < 90) {
    drishti = 15.0 + (theta - 60.0);
  } else if (theta >= 90 && theta < 120) {
    drishti = 45.0 - (theta - 90.0) / 2.0;
  } else if (theta >= 120 && theta < 150) {
    drishti = 30.0 - (theta - 120.0);
  } else if (theta >= 150 && theta < 180) {
    drishti = (theta - 150.0) * 2.0;
  } else if (theta >= 180 && theta < 300) {
    drishti = (300.0 - theta) / 2.0;
  } else {
    drishti = 0;
  }

  // Special Parashari Vishesha Drishti Adjustments
  if (aspectingPlanet === "Mars") {
    // 4th house (~90°) and 8th house (~210°)
    if ((theta >= 75 && theta <= 105) || (theta >= 195 && theta <= 225)) {
      drishti = Math.min(60.0, drishti + 15.0);
    }
  } else if (aspectingPlanet === "Jupiter") {
    // 5th house (~120°) and 9th house (~240°)
    if ((theta >= 105 && theta <= 135) || (theta >= 225 && theta <= 255)) {
      drishti = Math.min(60.0, drishti + 30.0);
    }
  } else if (aspectingPlanet === "Saturn") {
    // 3rd house (~60°) and 10th house (~270°)
    if ((theta >= 45 && theta <= 75) || (theta >= 255 && theta <= 285)) {
      drishti = Math.min(60.0, drishti + 45.0);
    }
  }

  return Math.max(0, Math.min(60.0, drishti));
}

/**
 * Calculates Drik Bala (Aspectual Strength) for a planet
 * BPHS Ch. 27, v. 30-33
 *
 * @param aspectedPlanet Planet receiving the aspects
 * @param allPlanetLons Sidereal longitudes of all 7 planets
 * @param isMoonWaxing Whether the Moon is in Shukla Paksha
 */
export function calculateDrikBala(
  aspectedPlanet: CanonicalBodyId,
  allPlanetLons: Record<CanonicalBodyId, number>,
  isMoonWaxing: boolean,
): DrikBalaBreakdown {
  const targetLon = allPlanetLons[aspectedPlanet];
  if (targetLon === undefined) {
    return {
      beneficDrishti: 0,
      maleficDrishti: 0,
      totalVirupas: 0,
      totalRupas: 0,
      formulaVersion: "BPHS-27.30-33",
      source: "Brihat Parashara Hora Shastra, Ch. 27, v. 30-33",
    };
  }

  let beneficDrishti = 0;
  let maleficDrishti = 0;

  const aspectingPlanets: CanonicalBodyId[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
  ];

  for (const p of aspectingPlanets) {
    if (p === aspectedPlanet) continue;
    const pLon = allPlanetLons[p];
    if (pLon === undefined) continue;

    const rawDrishti = calculateRawDrishti(p, targetLon, pLon);
    const quarterDrishti = rawDrishti / 4.0; // Aspectual contribution is 1/4th of raw drishti (Virupas)

    // Benefics vs Malefics
    let isBenefic = false;
    if (p === "Jupiter" || p === "Venus") {
      isBenefic = true;
    } else if (p === "Moon") {
      isBenefic = isMoonWaxing;
    } else if (p === "Mercury") {
      isBenefic = true; // Natural benefic unless heavily afflicted
    }

    if (isBenefic) {
      beneficDrishti += quarterDrishti;
    } else {
      maleficDrishti += quarterDrishti;
    }
  }

  const totalVirupas = beneficDrishti - maleficDrishti;

  return {
    beneficDrishti,
    maleficDrishti,
    totalVirupas,
    totalRupas: totalVirupas / 60.0,
    formulaVersion: "BPHS-27.30-33-QuarterRule",
    source: "Brihat Parashara Hora Shastra, Ch. 27, v. 30-33",
  };
}
