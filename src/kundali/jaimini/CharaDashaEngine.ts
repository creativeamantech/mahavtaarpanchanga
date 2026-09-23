import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { IJaiminiDashaAdapter } from "./contracts/IJaiminiDashaAdapter";
import {
  CharaDashaReport,
  DashaCountingDirection,
  JaiminiDashaPeriod,
  JaiminiDashaSubPeriod,
} from "./JaiminiTypes";
import { ZODIAC_SIGN_NAMES } from "./JaiminiRashiDrishtiEngine";

const ZODIAC_SIGNS_HI = [
  "मेष",
  "वृषभ",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुम्भ",
  "मीन",
];

const SIGN_LORDS: Record<number, CanonicalBodyId> = {
  0: "Mars",
  1: "Venus",
  2: "Mercury",
  3: "Moon",
  4: "Sun",
  5: "Mercury",
  6: "Venus",
  7: "Mars",
  8: "Jupiter",
  9: "Saturn",
  10: "Saturn",
  11: "Jupiter",
};

const DIRECT_SIGNS = [0, 1, 2, 6, 7, 8]; // Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius
const INDIRECT_SIGNS = [3, 4, 5, 9, 10, 11]; // Cancer, Leo, Virgo, Capricorn, Aquarius, Pisces

const MS_PER_YEAR = 365.2425 * 86400 * 1000;
const MS_PER_MONTH = MS_PER_YEAR / 12;

export class CharaDashaEngine implements IJaiminiDashaAdapter {
  public readonly systemName = "Chara Dasha";
  public readonly tradition = "Jaimini (K.N. Rao System)";

  /**
   * Evaluates the sequence of 12 Mahadasha signs starting from Lagna
   */
  public static getDashaSignSequence(lagnaSignIndex: number): number[] {
    const isDirect = DIRECT_SIGNS.includes(lagnaSignIndex);
    const seq: number[] = [];
    for (let i = 0; i < 12; i++) {
      const s = isDirect ? (lagnaSignIndex + i) % 12 : (((lagnaSignIndex - i) % 12) + 12) % 12;
      seq.push(s);
    }
    return seq;
  }

  /**
   * Determines the effective lord and sign placement for a given sign,
   * accounting for dual rulership in Scorpio (Mars/Ketu) and Aquarius (Saturn/Rahu).
   */
  public static getStrongerLord(
    signIndex: number,
    planetPositions: Array<{
      id: string;
      signIndex: number;
      longitude: number;
      degreeInSign: number;
      dignity?: string;
    }>,
  ): { lord: CanonicalBodyId; signIndex: number; dignity?: string } {
    if (signIndex === 7) {
      // Scorpio: Mars vs Ketu
      const mars = planetPositions.find((p) => p.id === "Mars");
      const ketu = planetPositions.find((p) => p.id === "Ketu");
      if (mars && ketu) {
        // Compare number of conjoined planets in their respective signs
        const marsConj = planetPositions.filter((p) => p.signIndex === mars.signIndex).length;
        const ketuConj = planetPositions.filter((p) => p.signIndex === ketu.signIndex).length;
        if (ketuConj > marsConj) {
          return { lord: "Ketu", signIndex: ketu.signIndex, dignity: ketu.dignity };
        }
        if (marsConj > ketuConj) {
          return { lord: "Mars", signIndex: mars.signIndex, dignity: mars.dignity };
        }
        // Tie-breaker: higher degree in sign
        if (ketu.degreeInSign > mars.degreeInSign) {
          return { lord: "Ketu", signIndex: ketu.signIndex, dignity: ketu.dignity };
        }
      }
      return {
        lord: "Mars",
        signIndex: mars ? mars.signIndex : 7,
        dignity: mars?.dignity,
      };
    }

    if (signIndex === 10) {
      // Aquarius: Saturn vs Rahu
      const saturn = planetPositions.find((p) => p.id === "Saturn");
      const rahu = planetPositions.find((p) => p.id === "Rahu");
      if (saturn && rahu) {
        const satConj = planetPositions.filter((p) => p.signIndex === saturn.signIndex).length;
        const rahuConj = planetPositions.filter((p) => p.signIndex === rahu.signIndex).length;
        if (rahuConj > satConj) {
          return { lord: "Rahu", signIndex: rahu.signIndex, dignity: rahu.dignity };
        }
        if (satConj > rahuConj) {
          return { lord: "Saturn", signIndex: saturn.signIndex, dignity: saturn.dignity };
        }
        if (rahu.degreeInSign > saturn.degreeInSign) {
          return { lord: "Rahu", signIndex: rahu.signIndex, dignity: rahu.dignity };
        }
      }
      return {
        lord: "Saturn",
        signIndex: saturn ? saturn.signIndex : 10,
        dignity: saturn?.dignity,
      };
    }

    const defaultLord = SIGN_LORDS[signIndex];
    const pl = planetPositions.find((p) => p.id === defaultLord);
    return {
      lord: defaultLord,
      signIndex: pl ? pl.signIndex : signIndex,
      dignity: pl?.dignity,
    };
  }

  /**
   * Computes the duration in completed years for a given sign Mahadasha
   */
  public static calculateSignDurationYears(
    signIndex: number,
    planetPositions: Array<{
      id: string;
      signIndex: number;
      longitude: number;
      degreeInSign: number;
      dignity?: string;
    }>,
  ): { durationYears: number; direction: DashaCountingDirection } {
    const isDirect = DIRECT_SIGNS.includes(signIndex);
    const direction: DashaCountingDirection = isDirect ? "direct" : "indirect";
    const lordInfo = CharaDashaEngine.getStrongerLord(signIndex, planetPositions);

    let years = 0;
    if (isDirect) {
      // Count forward from sign to lord
      const dist = ((lordInfo.signIndex - signIndex + 12) % 12) + 1;
      years = dist - 1;
      if (years === 0) years = 12;
    } else {
      // Count backward from sign to lord
      const dist = ((signIndex - lordInfo.signIndex + 12) % 12) + 1;
      years = dist - 1;
      if (years === 0) years = 12;
    }

    // Exaltation / Debilitation adjustment (+1 year for exalted, -1 for debilitated)
    if (lordInfo.dignity === "exalted" && years < 12) {
      years += 1;
    } else if (lordInfo.dignity === "debilitated" && years > 1) {
      years -= 1;
    }

    return { durationYears: years, direction };
  }

  public calculateDashaTimeline(
    birthTimeMs: number,
    lagnaSignIndex: number,
    planetPositions: Array<{
      id: string;
      signIndex: number;
      longitude: number;
      degreeInSign: number;
      dignity?: string;
    }>,
    targetDateMs?: number,
  ): CharaDashaReport {
    const signSeq = CharaDashaEngine.getDashaSignSequence(lagnaSignIndex);
    const periods: JaiminiDashaPeriod[] = [];

    let currentStartMs = birthTimeMs;

    for (const s of signSeq) {
      const { durationYears, direction } = CharaDashaEngine.calculateSignDurationYears(
        s,
        planetPositions,
      );
      const durationMs = durationYears * MS_PER_YEAR;
      const periodEndMs = currentStartMs + durationMs;

      // Generate 12 Subperiods (Antardashas)
      const subSeq = CharaDashaEngine.getDashaSignSequence(s);
      const subPeriods: JaiminiDashaSubPeriod[] = [];
      let subStartMs = currentStartMs;
      const subDurationMs = durationMs / 12;

      for (const subS of subSeq) {
        const subEndMs = subStartMs + subDurationMs;
        subPeriods.push({
          signIndex: subS,
          signNameEn: ZODIAC_SIGN_NAMES[subS],
          signNameHi: ZODIAC_SIGNS_HI[subS],
          durationMonths: durationYears,
          startDateMs: subStartMs,
          endDateMs: subEndMs,
        });
        subStartMs = subEndMs;
      }

      periods.push({
        signIndex: s,
        signNameEn: ZODIAC_SIGN_NAMES[s],
        signNameHi: ZODIAC_SIGNS_HI[s],
        durationYears,
        startDateMs: currentStartMs,
        endDateMs: periodEndMs,
        direction,
        subPeriods,
      });

      currentStartMs = periodEndMs;
    }

    const checkTime = targetDateMs ?? Date.now();
    const currentPeriod = periods.find(
      (p) => checkTime >= p.startDateMs && checkTime < p.endDateMs,
    );

    return {
      tradition: "Jaimini_KN_Rao",
      startingSignIndex: lagnaSignIndex,
      periods,
      currentPeriod,
    };
  }

  public getCurrentPeriod(
    timeline: CharaDashaReport,
    targetDateMs: number,
  ): JaiminiDashaPeriod | undefined {
    return timeline.periods.find(
      (p) => targetDateMs >= p.startDateMs && targetDateMs < p.endDateMs,
    );
  }
}
