import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { ArudhaPadaResult, UpapadaDetails } from "./JaiminiTypes";
import { JaiminiRashiDrishtiEngine, ZODIAC_SIGN_NAMES } from "./JaiminiRashiDrishtiEngine";

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

export class UpapadaEngine {
  /**
   * Evaluates Upapada Lagna (A12) structural metadata, planetary occupants, aspects, and 2nd from UL.
   */
  public static evaluateUpapada(
    ulPada: ArudhaPadaResult,
    lagnaSignIndex: number,
    planetPositions: Array<{ id: CanonicalBodyId; signIndex: number }>,
  ): UpapadaDetails {
    const ulSign = ulPada.finalPadaSignIndex;
    const ulLord = SIGN_LORDS[ulSign];

    // Find lord placement
    const lordPlanet = planetPositions.find((p) => p.id === ulLord);
    const lordSign = lordPlanet ? lordPlanet.signIndex : 0;
    const lordHouseFromLagna = ((lordSign - lagnaSignIndex + 12) % 12) + 1;

    // Planets in Upapada
    const planetsInUpapada = planetPositions.filter((p) => p.signIndex === ulSign).map((p) => p.id);

    // Planets aspecting Upapada via Jaimini Rashi Drishti
    const aspectingSigns = JaiminiRashiDrishtiEngine.getAspectedSigns(ulSign);
    const planetsAspectingUpapada = planetPositions
      .filter((p) => aspectingSigns.includes(p.signIndex))
      .map((p) => p.id);

    // 2nd house from Upapada
    const secondSign = (ulSign + 1) % 12;
    const planetsInSecond = planetPositions
      .filter((p) => p.signIndex === secondSign)
      .map((p) => p.id);

    return {
      pada: ulPada,
      signIndex: ulSign,
      signNameEn: ZODIAC_SIGN_NAMES[ulSign],
      signNameHi: ZODIAC_SIGNS_HI[ulSign],
      houseFromLagna: ulPada.finalPadaHouseNumber,
      lord: ulLord,
      lordHouseFromLagna,
      planetsInUpapada,
      planetsAspectingUpapada,
      secondFromUpapadaSignIndex: secondSign,
      planetsInSecondFromUpapada: planetsInSecond,
    };
  }
}
