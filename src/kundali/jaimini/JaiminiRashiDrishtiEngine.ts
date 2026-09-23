import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { RashiDrishtiResult, SignMobility } from "./JaiminiTypes";

export const ZODIAC_SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export class JaiminiRashiDrishtiEngine {
  /**
   * Returns the mobility type of a sign:
   * 0, 3, 6, 9 -> Chara (Movable)
   * 1, 4, 7, 10 -> Sthira (Fixed)
   * 2, 5, 8, 11 -> Dvisvabhava (Dual)
   */
  public static getSignMobility(signIndex: number): SignMobility {
    const mod = ((signIndex % 12) + 12) % 12;
    if (mod % 3 === 0) return "Chara";
    if (mod % 3 === 1) return "Sthira";
    return "Dvisvabhava";
  }

  /**
   * Computes the 3 signs aspected by a given sign according to Jaimini Sutra 1.1.3–6:
   * - Movable signs aspect all Fixed signs except the adjacent one.
   * - Fixed signs aspect all Movable signs except the adjacent one.
   * - Dual signs aspect all other Dual signs.
   */
  public static getAspectedSigns(signIndex: number): number[] {
    const s = ((signIndex % 12) + 12) % 12;
    const mobility = JaiminiRashiDrishtiEngine.getSignMobility(s);

    if (mobility === "Chara") {
      // Movable signs aspect Fixed signs (1, 4, 7, 10) except adjacent (s + 1)
      const allFixed = [1, 4, 7, 10];
      const adjacent = (s + 1) % 12;
      return allFixed.filter((f) => f !== adjacent);
    } else if (mobility === "Sthira") {
      // Fixed signs aspect Movable signs (0, 3, 6, 9) except adjacent (s - 1)
      const allMovable = [0, 3, 6, 9];
      const adjacent = (s + 11) % 12;
      return allMovable.filter((m) => m !== adjacent);
    } else {
      // Dual signs aspect all other Dual signs (2, 5, 8, 11)
      const allDual = [2, 5, 8, 11];
      return allDual.filter((d) => d !== s);
    }
  }

  /**
   * Checks if signA aspects signB according to Jaimini Rashi Drishti
   */
  public static doesSignAspect(signA: number, signB: number): boolean {
    const aspected = JaiminiRashiDrishtiEngine.getAspectedSigns(signA);
    return aspected.includes(((signB % 12) + 12) % 12);
  }

  /**
   * Computes comprehensive Rashi Drishti map for all 12 signs, including planets present
   */
  public static computeAllRashiDrishti(
    planetPositions: Array<{ id: CanonicalBodyId; signIndex: number }>,
  ): RashiDrishtiResult[] {
    const signPlanets: Map<number, CanonicalBodyId[]> = new Map();
    for (let i = 0; i < 12; i++) {
      signPlanets.set(i, []);
    }
    for (const p of planetPositions) {
      const s = ((p.signIndex % 12) + 12) % 12;
      signPlanets.get(s)?.push(p.id);
    }

    const results: RashiDrishtiResult[] = [];
    for (let s = 0; s < 12; s++) {
      const mobility = JaiminiRashiDrishtiEngine.getSignMobility(s);
      const aspectedSignIndices = JaiminiRashiDrishtiEngine.getAspectedSigns(s);
      const aspectedSignNamesEn = aspectedSignIndices.map((idx) => ZODIAC_SIGN_NAMES[idx]);
      const aspectingPlanets = signPlanets.get(s) || [];

      // Collect all planets in the aspected signs
      const aspectedPlanets: CanonicalBodyId[] = [];
      for (const aspIdx of aspectedSignIndices) {
        const plInSign = signPlanets.get(aspIdx) || [];
        aspectedPlanets.push(...plInSign);
      }

      results.push({
        signIndex: s,
        signNameEn: ZODIAC_SIGN_NAMES[s],
        mobility,
        aspectedSignIndices,
        aspectedSignNamesEn,
        aspectingPlanets,
        aspectedPlanets,
      });
    }

    return results;
  }
}
