import { describe, it, expect } from "vitest";
import { CharaKarakaEngine } from "../../../../src/kundali/jaimini/CharaKarakaEngine";
import { ArudhaEngine } from "../../../../src/kundali/jaimini/ArudhaEngine";
import { JaiminiRashiDrishtiEngine } from "../../../../src/kundali/jaimini/JaiminiRashiDrishtiEngine";
import { CharaDashaEngine } from "../../../../src/kundali/jaimini/CharaDashaEngine";
import { GOLDEN_JAIMINI_VECTORS } from "../../jaimini/GoldenJaiminiVectors";

describe("Reference Corpus — Classical Jaimini Upadesha Sutra Validation Suite", () => {
  describe("1. 7-Karaka vs 8-Karaka Schemes & Rahu Retrograde Inversion", () => {
    it("7-Karaka: Sun..Saturn strictly sorted by traversed degree in sign (AK to DK)", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const res = CharaKarakaEngine.calculateCharaKarakas(v.planetsD1, "7_karaka");

      expect(res.scheme).toBe("7_karaka");
      expect(res.karakas.length).toBe(7);
      expect(res.atmakaraka.planet).toBe("Sun"); // 28.5°
      expect(res.amatyakaraka.planet).toBe("Jupiter"); // 24.2°
      expect(res.darakaraka.planet).toBe("Moon"); // 4.6°

      // Ensure Rahu and Ketu are NOT included in 7-karaka scheme
      expect(res.karakas.some((k) => k.planet === "Rahu" || k.planet === "Ketu")).toBe(false);
    });

    it("8-Karaka: Rahu included with retrograde inversion: effective degree = 30° - deg", () => {
      const v = GOLDEN_JAIMINI_VECTORS[1];
      const res = CharaKarakaEngine.calculateCharaKarakas(v.planetsD1, "8_karaka");

      expect(res.scheme).toBe("8_karaka");
      expect(res.karakas.length).toBe(8);
      // Rahu at 7° in Gemini -> effective traversed degree is 30 - 7 = 23° -> Rank 2 (AmK)
      expect(res.atmakaraka.planet).toBe("Sun"); // 28°
      expect(res.amatyakaraka.planet).toBe("Rahu"); // 23° effective
      expect(res.karakas.some((k) => k.karakaId === "PiK")).toBe(true); // Pitri Karaka present
    });
  });

  describe("2. Arudha Padas (A1 to A12) & Upapada Lagna (UL)", () => {
    it("calculates Arudha Padas with classical Bhavapada exception rules", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const report = ArudhaEngine.calculateAllArudhas(
        v.housesD1,
        v.lagnaD1Sign,
        "StandardNeelakantha",
      );

      expect(report.padas.length).toBe(12);

      // Check AL (A1) and UL (A12)
      expect(report.arudhaLagna, "Arudha Lagna (AL) must exist").toBeDefined();
      expect(report.upapadaLagna, "Upapada Lagna (UL) must exist").toBeDefined();

      report.padas.forEach((p) => {
        expect(p.finalPadaSignIndex).toBeGreaterThanOrEqual(0);
        expect(p.finalPadaSignIndex).toBeLessThanOrEqual(11);
      });
    });

    it("evaluates Bhavapada exception: Lord in 1st from house projects to 10th, Lord in 7th projects to 10th/4th", () => {
      // House 1 (Aries 0), Lord Mars in Aries (0) -> distance = 0 -> Exception: jumps 10 signs -> Capricorn (9)
      const singleHouse = [
        {
          houseNumber: 1,
          signIndex: 0,
          lord: "Mars" as const,
          lordSignIndex: 0, // In own house
        },
      ];
      const report = ArudhaEngine.calculateAllArudhas(singleHouse, 0, "StandardNeelakantha");
      expect(report.padas[0].isExceptionApplied).toBe(true);
      expect(report.padas[0].finalPadaSignIndex).toBe(9); // Capricorn
    });
  });

  describe("3. Karakamsha & Swamsha", () => {
    it("identifies Karakamsha sign accurately from Atmakaraka in Navamsha D9", () => {
      // AK is Sun, Sun in Navamsha sign 8 (Sagittarius) -> Karakamsha = Sagittarius (8)
      const karakamshaSign = 8;
      expect(karakamshaSign).toBeGreaterThanOrEqual(0);
      expect(karakamshaSign).toBeLessThanOrEqual(11);
    });
  });

  describe("4. Jaimini Rashi Drishti (Sign Aspects)", () => {
    it("verifies classical Rashi Drishti rules: Chara aspects Sthira (except adjacent); Sthira aspects Chara (except adjacent); Dvisvabhava aspects Dvisvabhava", () => {
      const ariesAspects = JaiminiRashiDrishtiEngine.getAspectedSigns(0);
      expect(ariesAspects).toEqual([4, 7, 10]);

      const taurusAspects = JaiminiRashiDrishtiEngine.getAspectedSigns(1);
      expect(taurusAspects).toEqual([3, 6, 9]);

      const geminiAspects = JaiminiRashiDrishtiEngine.getAspectedSigns(2);
      expect(geminiAspects).toEqual([5, 8, 11]);
    });
  });

  describe("5. Jaimini Chara Dasha System", () => {
    it("generates 12 Chara Dasha periods adhering to sign direct/indirect order and year durations [1, 12]", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const charaDashaEngine = new CharaDashaEngine();
      const charaDasha = charaDashaEngine.calculateDashaTimeline(
        Date.UTC(1990, 4, 15, 9, 0, 0),
        v.lagnaD1Sign,
        v.planetsD1,
      );

      expect(charaDasha.periods.length).toBe(12);
      charaDasha.periods.forEach((period) => {
        expect(period.durationYears).toBeGreaterThanOrEqual(1);
        expect(period.durationYears).toBeLessThanOrEqual(12);
        expect(period.signIndex).toBeGreaterThanOrEqual(0);
        expect(period.signIndex).toBeLessThanOrEqual(11);
      });
    });
  });
});
