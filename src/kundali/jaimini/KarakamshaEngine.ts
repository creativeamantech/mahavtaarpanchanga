import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { KarakamshaReport } from "./JaiminiTypes";
import { JaiminiRashiDrishtiEngine } from "./JaiminiRashiDrishtiEngine";

export class KarakamshaEngine {
  /**
   * Evaluates Karakamsha (Navamsha sign of Atmakaraka) and Swamsha (Navamsha Lagna).
   */
  public static evaluateKarakamsha(
    atmakarakaPlanet: CanonicalBodyId,
    atmakarakaD1SignIndex: number,
    atmakarakaD9SignIndex: number,
    lagnaD1SignIndex: number,
    lagnaD9SignIndex: number,
    d9Planets: Array<{ id: CanonicalBodyId; signIndex: number }>,
  ): KarakamshaReport {
    // Karakamsha house reckoned from D1 Lagna
    const karakamshaHouseInD1 = ((atmakarakaD9SignIndex - lagnaD1SignIndex + 12) % 12) + 1;

    // Planets in Karakamsha sign in D9
    const planetsInKarakamshaD9 = d9Planets
      .filter((p) => p.signIndex === atmakarakaD9SignIndex)
      .map((p) => p.id);

    // Planets aspecting Karakamsha sign in D9 via Jaimini Rashi Drishti
    const aspectingSigns = JaiminiRashiDrishtiEngine.getAspectedSigns(atmakarakaD9SignIndex);
    const planetsAspectingKarakamshaD9 = d9Planets
      .filter((p) => aspectingSigns.includes(p.signIndex))
      .map((p) => p.id);

    return {
      atmakarakaPlanet,
      atmakarakaD1SignIndex,
      karakamshaSignIndex: atmakarakaD9SignIndex,
      karakamshaHouseInD1,
      swamshaSignIndex: lagnaD9SignIndex,
      planetsInKarakamshaD9,
      planetsAspectingKarakamshaD9,
    };
  }
}
