import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { CharaKarakaEngine, PlanetPositionInput } from "./CharaKarakaEngine";
import { ArudhaEngine, HouseLordInput } from "./ArudhaEngine";
import { UpapadaEngine } from "./UpapadaEngine";
import { KarakamshaEngine } from "./KarakamshaEngine";
import { JaiminiRashiDrishtiEngine } from "./JaiminiRashiDrishtiEngine";
import { CharaDashaEngine } from "./CharaDashaEngine";
import { ArudhaExceptionRule, CharaKarakaScheme, JaiminiProfile } from "./JaiminiTypes";

export interface JaiminiCalculationConfig {
  readonly charaKarakaScheme?: CharaKarakaScheme;
  readonly arudhaExceptionRule?: ArudhaExceptionRule;
  readonly includeCharaDasha?: boolean;
  readonly targetDateMs?: number;
}

export class JaiminiEngine {
  private readonly charaDashaAdapter: CharaDashaEngine;

  constructor() {
    this.charaDashaAdapter = new CharaDashaEngine();
  }

  /**
   * Computes a complete, canonical Jaimini Astrology Profile from existing Kundli domain data.
   */
  public calculateJaiminiProfile(
    planetsD1: Array<{
      id: CanonicalBodyId;
      longitude: number;
      signIndex: number;
      degreeInSign: number;
      speed?: number;
      dignity?: string;
    }>,
    housesD1: Array<{
      houseNumber: number;
      signIndex: number;
      lord: CanonicalBodyId;
      lordSignIndex: number;
    }>,
    lagnaD1SignIndex: number,
    lagnaD9SignIndex: number,
    planetsD9: Array<{
      id: CanonicalBodyId;
      signIndex: number;
    }>,
    birthTimeMs?: number,
    config: JaiminiCalculationConfig = {},
  ): JaiminiProfile {
    const karakaScheme = config.charaKarakaScheme ?? "7_karaka";
    const arudhaRule = config.arudhaExceptionRule ?? "StandardNeelakantha";

    // 1. Chara Karakas
    const planetInputs: PlanetPositionInput[] = planetsD1.map((p) => ({
      id: p.id,
      longitude: p.longitude,
      signIndex: p.signIndex,
      degreeInSign: p.degreeInSign,
      speed: p.speed,
    }));
    const charaKarakas = CharaKarakaEngine.calculateCharaKarakas(planetInputs, karakaScheme);

    // 2. Arudha Padas (AL, A2–A11, UL)
    const houseInputs: HouseLordInput[] = housesD1.map((h) => ({
      houseNumber: h.houseNumber,
      signIndex: h.signIndex,
      lord: h.lord,
      lordSignIndex: h.lordSignIndex,
    }));
    const arudhas = ArudhaEngine.calculateAllArudhas(houseInputs, lagnaD1SignIndex, arudhaRule);

    // 3. Upapada Lagna Details
    const upapada = UpapadaEngine.evaluateUpapada(
      arudhas.upapadaLagna,
      lagnaD1SignIndex,
      planetsD1.map((p) => ({ id: p.id, signIndex: p.signIndex })),
    );

    // 4. Karakamsha & Swamsha
    const akPlanet = charaKarakas.atmakaraka.planet;
    const akD1 = planetsD1.find((p) => p.id === akPlanet);
    const akD9 = planetsD9.find((p) => p.id === akPlanet);
    const akD1Sign = akD1 ? akD1.signIndex : 0;
    const akD9Sign = akD9 ? akD9.signIndex : 0;

    const karakamsha = KarakamshaEngine.evaluateKarakamsha(
      akPlanet,
      akD1Sign,
      akD9Sign,
      lagnaD1SignIndex,
      lagnaD9SignIndex,
      planetsD9,
    );

    // 5. Jaimini Rashi Drishti
    const rashiDrishti = JaiminiRashiDrishtiEngine.computeAllRashiDrishti(
      planetsD1.map((p) => ({ id: p.id, signIndex: p.signIndex })),
    );

    // 6. Chara Dasha (optional/default true if birthTimeMs provided)
    let charaDasha = undefined;
    if (birthTimeMs !== undefined && config.includeCharaDasha !== false) {
      charaDasha = this.charaDashaAdapter.calculateDashaTimeline(
        birthTimeMs,
        lagnaD1SignIndex,
        planetsD1.map((p) => ({
          id: p.id,
          signIndex: p.signIndex,
          longitude: p.longitude,
          degreeInSign: p.degreeInSign,
          dignity: p.dignity,
        })),
        config.targetDateMs,
      );
    }

    return {
      charaKarakas,
      arudhas,
      upapada,
      karakamsha,
      rashiDrishti,
      charaDasha,
    };
  }
}
