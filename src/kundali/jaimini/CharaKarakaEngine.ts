import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import {
  CharaKarakaId,
  CharaKarakaReport,
  CharaKarakaResult,
  CharaKarakaScheme,
} from "./JaiminiTypes";

export interface PlanetPositionInput {
  readonly id: CanonicalBodyId;
  readonly longitude: number; // 0 to 360
  readonly signIndex: number; // 0 to 11
  readonly degreeInSign: number; // 0 to 30
  readonly speed?: number; // Daily motion in degrees
}

const KARAKA_METADATA_7: Array<{
  id: CharaKarakaId;
  en: string;
  hi: string;
  sa: string;
}> = [
  { id: "AK", en: "Atmakaraka", hi: "आत्मकारक", sa: "आत्मकारकः" },
  { id: "AmK", en: "Amatyakaraka", hi: "अमात्यकारक", sa: "अमात्यकारकः" },
  { id: "BK", en: "Bhratrikaraka", hi: "भ्रातृकारक", sa: "भ्रातृकारकः" },
  { id: "MK", en: "Matrikaraka", hi: "मातृकारक", sa: "मातृकारकः" },
  { id: "PK", en: "Putrakaraka", hi: "पुत्रकारक", sa: "पुत्रकारकः" },
  { id: "GK", en: "Gnatikaraka", hi: "ज्ञातिकारक", sa: "ज्ञातिकारकः" },
  { id: "DK", en: "Darakaraka", hi: "दारकारक", sa: "दारकारकः" },
];

const KARAKA_METADATA_8: Array<{
  id: CharaKarakaId;
  en: string;
  hi: string;
  sa: string;
}> = [
  { id: "AK", en: "Atmakaraka", hi: "आत्मकारक", sa: "आत्मकारकः" },
  { id: "AmK", en: "Amatyakaraka", hi: "अमात्यकारक", sa: "अमात्यकारकः" },
  { id: "BK", en: "Bhratrikaraka", hi: "भ्रातृकारक", sa: "भ्रातृकारकः" },
  { id: "MK", en: "Matrikaraka", hi: "मातृकारक", sa: "मातृकारकः" },
  { id: "PiK", en: "Pitrikaraka", hi: "पितृकारक", sa: "पितृकारकः" },
  { id: "PK", en: "Putrakaraka", hi: "पुत्रकारक", sa: "पुत्रकारकः" },
  { id: "GK", en: "Gnatikaraka", hi: "ज्ञातिकारक", sa: "ज्ञातिकारकः" },
  { id: "DK", en: "Darakaraka", hi: "दारकारक", sa: "दारकारकः" },
];

const NATURAL_GRAHA_PRIORITY: Record<string, number> = {
  Sun: 8,
  Moon: 7,
  Mars: 6,
  Mercury: 5,
  Jupiter: 4,
  Venus: 3,
  Saturn: 2,
  Rahu: 1,
};

export class CharaKarakaEngine {
  /**
   * Computes the Chara Karakas for a given set of planetary positions.
   * Supports both 7-Karaka (Parashara/K.N. Rao) and 8-Karaka (Neelakantha/Rath) schemes.
   */
  public static calculateCharaKarakas(
    planets: PlanetPositionInput[],
    scheme: CharaKarakaScheme = "7_karaka",
  ): CharaKarakaReport {
    // 1. Filter planets according to scheme
    const eligibleBodies: CanonicalBodyId[] =
      scheme === "7_karaka"
        ? ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
        : ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"];

    const eligiblePlanets = planets.filter((p) => eligibleBodies.includes(p.id));

    // 2. Compute effective traversed degree in sign
    // For Rahu (always retrograde nodal point), classical convention counts from the end of the sign (30 - deg)
    const evaluated = eligiblePlanets.map((p) => {
      let effDeg = p.degreeInSign;
      if (scheme === "8_karaka" && p.id === "Rahu") {
        effDeg = 30.0 - p.degreeInSign;
        if (effDeg < 0) effDeg += 30.0;
        if (effDeg >= 30) effDeg -= 30.0;
      }
      return {
        ...p,
        effectiveDegree: effDeg,
      };
    });

    // 3. Sort descending by effective degree with deterministic tie resolution
    let tieOccurred = false;
    evaluated.sort((a, b) => {
      const diff = b.effectiveDegree - a.effectiveDegree;
      if (Math.abs(diff) > 1e-6) {
        return diff;
      }

      // Tie detected down to arcseconds!
      tieOccurred = true;

      // Primary tie-breaker: Daily speed / motion (higher speed planet advances)
      if (a.speed !== undefined && b.speed !== undefined && Math.abs(a.speed - b.speed) > 1e-6) {
        return Math.abs(b.speed) - Math.abs(a.speed);
      }

      // Secondary tie-breaker: Classical natural planetary order (Sun > Moon > Mars > ...)
      const prioA = NATURAL_GRAHA_PRIORITY[a.id] ?? 0;
      const prioB = NATURAL_GRAHA_PRIORITY[b.id] ?? 0;
      return prioB - prioA;
    });

    // 4. Assign Karaka Roles
    const metaList = scheme === "7_karaka" ? KARAKA_METADATA_7 : KARAKA_METADATA_8;
    const karakas: CharaKarakaResult[] = evaluated.slice(0, metaList.length).map((item, idx) => {
      const meta = metaList[idx];
      return {
        karakaId: meta.id,
        nameEn: meta.en,
        nameHi: meta.hi,
        nameSa: meta.sa,
        planet: item.id,
        signIndex: item.signIndex,
        longitude: item.longitude,
        degreeInSign: item.degreeInSign,
        effectiveDegree: item.effectiveDegree,
        rank: idx + 1,
        isTieResolved: tieOccurred,
        tieResolutionMethod: tieOccurred
          ? "Arcsecond motion velocity and natural priority order"
          : undefined,
      };
    });

    const atmakaraka = karakas[0];
    const amatyakaraka = karakas[1];
    const darakaraka = karakas[karakas.length - 1];

    return {
      scheme,
      karakas,
      atmakaraka,
      amatyakaraka,
      darakaraka,
      tieOccurred,
    };
  }
}
