import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { ArudhaExceptionRule, ArudhaPadaResult, ArudhaReport } from "./JaiminiTypes";

export interface HouseLordInput {
  readonly houseNumber: number; // 1 to 12
  readonly signIndex: number; // 0 to 11
  readonly lord: CanonicalBodyId;
  readonly lordSignIndex: number;
}

const PADA_NAMES: Array<{
  code: string;
  en: string;
  hi: string;
  sa: string;
}> = [
  { code: "AL", en: "Arudha Lagna", hi: "आरूढ़ लग्न", sa: "आरूढ-लग्नम्" },
  { code: "A2", en: "Dhana Pada (A2)", hi: "धन पद (A2)", sa: "धन-पदम्" },
  { code: "A3", en: "Bhratri Pada (A3)", hi: "भ्रातृ पद (A3)", sa: "भ्रातृ-पदम्" },
  { code: "A4", en: "Matri Pada (A4)", hi: "मातृ पद (A4)", sa: "मातृ-पदम्" },
  { code: "A5", en: "Putra Pada (A5)", hi: "पुत्र पद (A5)", sa: "पुत्र-पदम्" },
  { code: "A6", en: "Shatru Pada (A6)", hi: "शत्रु पद (A6)", sa: "शत्रु-पदम्" },
  { code: "A7", en: "Dara Pada (A7)", hi: "दार पद (A7)", sa: "दार-पदम्" },
  { code: "A8", en: "Mrityu Pada (A8)", hi: "मृत्यु पद (A8)", sa: "मृत्यु-पदम्" },
  { code: "A9", en: "Bhagya Pada (A9)", hi: "भाग्य पद (A9)", sa: "भाग्य-पदम्" },
  { code: "A10", en: "Karma Pada (A10)", hi: "कर्म पद (A10)", sa: "कर्म-पदम्" },
  { code: "A11", en: "Labha Pada (A11)", hi: "लाभ पद (A11)", sa: "लाभ-पदम्" },
  { code: "UL", en: "Upapada Lagna (UL/A12)", hi: "उपपद लग्न (UL/A12)", sa: "उपपद-लग्नम्" },
];

export class ArudhaEngine {
  /**
   * Computes the Arudha Pada for an individual house.
   * Generic formula: count distance D from house sign to lord's sign, then D signs from lord.
   * Applies classical Jaimini Sutra 1.1.30–31 exception rules when the raw pada falls in 1st or 7th.
   */
  public static calculateArudhaPada(
    house: HouseLordInput,
    lagnaSignIndex: number,
    convention: ArudhaExceptionRule = "StandardNeelakantha",
  ): ArudhaPadaResult {
    const sH = ((house.signIndex % 12) + 12) % 12;
    const sL = ((house.lordSignIndex % 12) + 12) % 12;

    // Distance D in signs (1 to 12) from house to its lord
    const dist = ((sL - sH + 12) % 12) + 1;

    // Raw pada is dist signs forward from lord
    const rawSign = (sL + (dist - 1)) % 12;

    let finalSign = rawSign;
    let isExceptionApplied = false;
    let exceptionReason: string | undefined;

    if (convention !== "NoExceptions") {
      const houseSame = rawSign === sH;
      const seventhFromHouse = rawSign === (sH + 6) % 12;

      if (houseSame) {
        // Exception 1: Arudha cannot fall in the house itself.
        // It is displaced to the 10th house from the raw sign.
        finalSign = (rawSign + 9) % 12;
        isExceptionApplied = true;
        exceptionReason =
          "Jaimini Sutra 1.1.30: Arudha falling in the house itself is displaced to the 10th house.";
      } else if (seventhFromHouse) {
        // Exception 2: Arudha cannot fall in the 7th house from the original house.
        if (convention === "StandardNeelakantha") {
          // Neelakantha Commentary: displaced to 4th house from raw sign (bringing it to 10th from house)
          finalSign = (rawSign + 3) % 12;
          isExceptionApplied = true;
          exceptionReason =
            "Neelakantha: Arudha falling in 7th from house is displaced by 4 signs (10th from house).";
        } else if (convention === "RathException") {
          // Sanjay Rath: displaced to 10th from raw sign (bringing it to 4th from house)
          finalSign = (rawSign + 9) % 12;
          isExceptionApplied = true;
          exceptionReason =
            "Rath: Arudha falling in 7th from house is displaced to the 10th from raw sign (4th from house).";
        }
      }
    }

    const houseFromLagna = ((finalSign - lagnaSignIndex + 12) % 12) + 1;
    const meta = PADA_NAMES[house.houseNumber - 1];

    return {
      houseNumber: house.houseNumber,
      padaCode: meta.code,
      nameEn: meta.en,
      nameHi: meta.hi,
      nameSa: meta.sa,
      houseSignIndex: sH,
      lord: house.lord,
      lordSignIndex: sL,
      rawPadaSignIndex: rawSign,
      finalPadaSignIndex: finalSign,
      finalPadaHouseNumber: houseFromLagna,
      isExceptionApplied,
      exceptionReason,
    };
  }

  /**
   * Computes all 12 Arudha Padas for the chart.
   */
  public static calculateAllArudhas(
    houses: HouseLordInput[],
    lagnaSignIndex: number,
    convention: ArudhaExceptionRule = "StandardNeelakantha",
  ): ArudhaReport {
    const padas = houses.map((h) =>
      ArudhaEngine.calculateArudhaPada(h, lagnaSignIndex, convention),
    );
    const arudhaLagna = padas[0]; // A1 / AL
    const upapadaLagna = padas[11]; // A12 / UL

    return {
      exceptionConvention: convention,
      padas,
      arudhaLagna,
      upapadaLagna,
    };
  }
}
