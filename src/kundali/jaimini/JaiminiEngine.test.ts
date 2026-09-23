import { describe, it, expect } from "vitest";
import { JaiminiEngine } from "./JaiminiEngine";
import { CharaKarakaEngine } from "./CharaKarakaEngine";
import { ArudhaEngine } from "./ArudhaEngine";
import { JaiminiRashiDrishtiEngine } from "./JaiminiRashiDrishtiEngine";
import { CharaDashaEngine } from "./CharaDashaEngine";
import { JaiminiValidation } from "./JaiminiValidation";
import { GOLDEN_JAIMINI_VECTORS } from "../../../tests/kundali/jaimini/GoldenJaiminiVectors";

describe("Phase 6: Classical Jaimini Astrology Engine", () => {
  const engine = new JaiminiEngine();

  // ==========================================
  // 1. CHARA KARAKA SYSTEM TESTS
  // ==========================================
  describe("Chara Karaka Engine", () => {
    it("computes 7-Karaka scheme accurately against Golden Vector 1", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const res = CharaKarakaEngine.calculateCharaKarakas(v.planetsD1, "7_karaka");

      expect(res.scheme).toBe("7_karaka");
      expect(res.karakas.length).toBe(7);
      expect(res.atmakaraka.planet).toBe("Sun");
      expect(res.amatyakaraka.planet).toBe("Jupiter");
      expect(res.darakaraka.planet).toBe("Moon");

      if (v.expectedKarakas) {
        for (const [code, exp] of Object.entries(v.expectedKarakas)) {
          const k = res.karakas.find((item) => item.karakaId === code);
          expect(k, `Karaka ${code} should exist`).toBeDefined();
          expect(k?.planet).toBe(exp.planet);
          expect(k?.rank).toBe(exp.rank);
        }
      }

      const val = JaiminiValidation.validateCharaKarakas(res);
      expect(val.isValid).toBe(true);
      expect(val.errors.length).toBe(0);
    });

    it("computes 8-Karaka scheme with Rahu retrograde inversion (30 - deg)", () => {
      const v = GOLDEN_JAIMINI_VECTORS[1];
      const res = CharaKarakaEngine.calculateCharaKarakas(v.planetsD1, "8_karaka");

      expect(res.scheme).toBe("8_karaka");
      expect(res.karakas.length).toBe(8);
      // Rahu at 7° in Gemini -> effective traversed degree is 23° -> Rank 2 (AmK)
      expect(res.atmakaraka.planet).toBe("Sun");
      expect(res.amatyakaraka.planet).toBe("Rahu");
      expect(res.karakas.some((k) => k.karakaId === "PiK")).toBe(true);

      if (v.expectedKarakas) {
        for (const [code, exp] of Object.entries(v.expectedKarakas)) {
          const k = res.karakas.find((item) => item.karakaId === code);
          expect(k, `Karaka ${code} should exist`).toBeDefined();
          expect(k?.planet).toBe(exp.planet);
          expect(k?.rank).toBe(exp.rank);
        }
      }

      const val = JaiminiValidation.validateCharaKarakas(res);
      expect(val.isValid).toBe(true);
    });

    it("resolves exact degree ties deterministically using motion and natural priority", () => {
      const tiedPlanets = [
        { id: "Sun" as const, longitude: 15.5, signIndex: 0, degreeInSign: 15.5, speed: 0.98 },
        { id: "Mars" as const, longitude: 45.5, signIndex: 1, degreeInSign: 15.5, speed: 0.65 },
        { id: "Jupiter" as const, longitude: 70.0, signIndex: 2, degreeInSign: 10.0 },
        { id: "Venus" as const, longitude: 98.0, signIndex: 3, degreeInSign: 8.0 },
        { id: "Saturn" as const, longitude: 126.0, signIndex: 4, degreeInSign: 6.0 },
        { id: "Mercury" as const, longitude: 154.0, signIndex: 5, degreeInSign: 4.0 },
        { id: "Moon" as const, longitude: 182.0, signIndex: 6, degreeInSign: 2.0 },
      ];

      const res = CharaKarakaEngine.calculateCharaKarakas(tiedPlanets, "7_karaka");
      expect(res.tieOccurred).toBe(true);
      expect(res.atmakaraka.planet).toBe("Sun"); // Sun has higher speed and natural priority
      expect(res.amatyakaraka.planet).toBe("Mars");
      expect(res.atmakaraka.isTieResolved).toBe(true);
    });
  });

  // ==========================================
  // 2. ARUDHA PADA ENGINE TESTS
  // ==========================================
  describe("Arudha Engine & Classical Exceptions", () => {
    it("computes Arudha Padas with classical Jaimini Sutra 1.1.30–31 exceptions", () => {
      const v = GOLDEN_JAIMINI_VECTORS[2];
      const report = ArudhaEngine.calculateAllArudhas(
        v.housesD1,
        v.lagnaD1Sign,
        "StandardNeelakantha",
      );

      // AL: Aries lord Mars in Aries -> raw sign = 0 -> Exception 1: falls into 10th (Capricorn = 9)
      const al = report.padas.find((p) => p.padaCode === "AL");
      expect(al?.finalPadaSignIndex).toBe(9);
      expect(al?.isExceptionApplied).toBe(true);

      // A7: Libra lord Venus in Aries (7th) -> raw sign = 6 -> Exception 1: falls into 10th from Libra (Cancer = 3)
      const a7 = report.padas.find((p) => p.padaCode === "A7");
      expect(a7?.finalPadaSignIndex).toBe(3);
      expect(a7?.isExceptionApplied).toBe(true);

      // A4: Cancer lord Moon in Libra (4th) -> raw sign = 9 (7th from Cancer) -> Exception 2: falls into 4th from raw (Aries = 0)
      const a4 = report.padas.find((p) => p.padaCode === "A4");
      expect(a4?.finalPadaSignIndex).toBe(0);
      expect(a4?.isExceptionApplied).toBe(true);

      const val = JaiminiValidation.validateArudhas(report);
      expect(val.isValid).toBe(true);
    });

    it("supports NoExceptions convention strictly for mathematical baseline comparison", () => {
      const v = GOLDEN_JAIMINI_VECTORS[2];
      const report = ArudhaEngine.calculateAllArudhas(v.housesD1, v.lagnaD1Sign, "NoExceptions");

      const al = report.padas.find((p) => p.padaCode === "AL");
      expect(al?.finalPadaSignIndex).toBe(0); // Raw sign kept
      expect(al?.isExceptionApplied).toBe(false);
    });
  });

  // ==========================================
  // 3. UPAPADA (UL / A12) TESTS
  // ==========================================
  describe("Upapada Engine", () => {
    it("evaluates Upapada Lagna, lord placement, aspects, and 2nd from UL", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const profile = engine.calculateJaiminiProfile(
        v.planetsD1,
        v.housesD1,
        v.lagnaD1Sign,
        v.lagnaD9Sign,
        v.planetsD9,
      );

      expect(profile.upapada).toBeDefined();
      expect(profile.upapada.pada.padaCode).toBe("UL");
      expect(profile.upapada.lord).toBeDefined();
      expect(profile.upapada.secondFromUpapadaSignIndex).toBe((profile.upapada.signIndex + 1) % 12);
    });
  });

  // ==========================================
  // 4. KARAKAMSHA & SWAMSHA TESTS
  // ==========================================
  describe("Karakamsha Engine", () => {
    it("accurately identifies Karakamsha as Navamsha sign of Atmakaraka", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const profile = engine.calculateJaiminiProfile(
        v.planetsD1,
        v.housesD1,
        v.lagnaD1Sign,
        v.lagnaD9Sign,
        v.planetsD9,
      );

      expect(profile.karakamsha.atmakarakaPlanet).toBe("Sun");
      expect(profile.karakamsha.karakamshaSignIndex).toBe(4); // Sun in D9 is Leo (4)
      expect(profile.karakamsha.swamshaSignIndex).toBe(8); // Lagna D9 is Sagittarius (8)
      expect(profile.karakamsha.karakamshaHouseInD1).toBe(5); // Leo from Aries Lagna is 5th house
    });
  });

  // ==========================================
  // 5. JAIMINI RASHI DRISHTI EXHAUSTIVE TESTS
  // ==========================================
  describe("Jaimini Rashi Drishti (Sign Aspects)", () => {
    it("validates Movable (Chara) sign aspects: aspects all Fixed signs except adjacent", () => {
      // Aries (0, Chara) -> aspects Leo (4), Scorpio (7), Aquarius (10) [NOT adjacent Taurus (1)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(0)).toEqual([4, 7, 10]);

      // Cancer (3, Chara) -> aspects Scorpio (7), Aquarius (10), Taurus (1) [NOT adjacent Leo (4)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(3)).toEqual([1, 7, 10]);

      // Libra (6, Chara) -> aspects Aquarius (10), Taurus (1), Leo (4) [NOT adjacent Scorpio (7)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(6)).toEqual([1, 4, 10]);

      // Capricorn (9, Chara) -> aspects Taurus (1), Leo (4), Scorpio (7) [NOT adjacent Aquarius (10)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(9)).toEqual([1, 4, 7]);
    });

    it("validates Fixed (Sthira) sign aspects: aspects all Movable signs except adjacent", () => {
      // Taurus (1, Sthira) -> aspects Cancer (3), Libra (6), Capricorn (9) [NOT adjacent Aries (0)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(1)).toEqual([3, 6, 9]);

      // Leo (4, Sthira) -> aspects Libra (6), Capricorn (9), Aries (0) [NOT adjacent Cancer (3)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(4)).toEqual([0, 6, 9]);

      // Scorpio (7, Sthira) -> aspects Capricorn (9), Aries (0), Cancer (3) [NOT adjacent Libra (6)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(7)).toEqual([0, 3, 9]);

      // Aquarius (10, Sthira) -> aspects Aries (0), Cancer (3), Libra (6) [NOT adjacent Capricorn (9)]
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(10)).toEqual([0, 3, 6]);
    });

    it("validates Dual (Dvisvabhava) sign aspects: aspects all other Dual signs", () => {
      // Gemini (2, Dual) -> aspects Virgo (5), Sagittarius (8), Pisces (11)
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(2)).toEqual([5, 8, 11]);

      // Virgo (5, Dual) -> aspects Gemini (2), Sagittarius (8), Pisces (11)
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(5)).toEqual([2, 8, 11]);

      // Sagittarius (8, Dual) -> aspects Gemini (2), Virgo (5), Pisces (11)
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(8)).toEqual([2, 5, 11]);

      // Pisces (11, Dual) -> aspects Gemini (2), Virgo (5), Sagittarius (8)
      expect(JaiminiRashiDrishtiEngine.getAspectedSigns(11)).toEqual([2, 5, 8]);
    });

    it("guarantees mathematical symmetry across all 12 signs without exception", () => {
      const val = JaiminiValidation.validateRashiDrishtiSymmetries();
      expect(val.isValid).toBe(true);
      expect(val.errors.length).toBe(0);
    });
  });

  // ==========================================
  // 6. JAIMINI CHARA DASHA TESTS
  // ==========================================
  describe("Jaimini Chara Dasha Engine", () => {
    it("computes direct dasha progression for Aries Lagna", () => {
      const seq = CharaDashaEngine.getDashaSignSequence(0); // Aries Lagna
      expect(seq).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it("computes indirect dasha progression for Cancer Lagna", () => {
      const seq = CharaDashaEngine.getDashaSignSequence(3); // Cancer Lagna
      expect(seq).toEqual([3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4]);
    });

    it("calculates complete timeline with 12 subperiods per Mahadasha", () => {
      const dashaEngine = new CharaDashaEngine();
      const birthMs = Date.UTC(2000, 0, 1, 12, 0, 0);
      const planets = [
        { id: "Mars", signIndex: 3, longitude: 105.0, degreeInSign: 15.0 },
        { id: "Sun", signIndex: 0, longitude: 15.0, degreeInSign: 15.0, dignity: "exalted" },
        { id: "Moon", signIndex: 6, longitude: 195.0, degreeInSign: 15.0 },
      ];

      const timeline = dashaEngine.calculateDashaTimeline(birthMs, 0, planets);
      expect(timeline.periods.length).toBe(12);
      expect(timeline.periods[0].subPeriods?.length).toBe(12);
      expect(timeline.periods[0].durationYears).toBeGreaterThanOrEqual(1);
      expect(timeline.periods[0].durationYears).toBeLessThanOrEqual(12);

      const targetMs = Date.UTC(2005, 5, 1);
      const active = dashaEngine.getCurrentPeriod(timeline, targetMs);
      expect(active).toBeDefined();
    });
  });

  // ==========================================
  // 7. COMPREHENSIVE PROFILE INTEGRATION
  // ==========================================
  describe("Jaimini Profile Integration & Validation", () => {
    it("generates a complete valid JaiminiProfile satisfying all canonical invariants", () => {
      const v = GOLDEN_JAIMINI_VECTORS[0];
      const birthMs = Date.UTC(1995, 4, 15, 6, 30, 0);

      const profile = engine.calculateJaiminiProfile(
        v.planetsD1,
        v.housesD1,
        v.lagnaD1Sign,
        v.lagnaD9Sign,
        v.planetsD9,
        birthMs,
      );

      const val = JaiminiValidation.validateProfile(profile);
      expect(val.isValid).toBe(true);
      expect(val.errors.length).toBe(0);

      expect(profile.charaKarakas.atmakaraka.karakaId).toBe("AK");
      expect(profile.arudhas.arudhaLagna.padaCode).toBe("AL");
      expect(profile.upapada.pada.padaCode).toBe("UL");
      expect(profile.karakamsha.karakamshaSignIndex).toBe(4);
      expect(profile.rashiDrishti.length).toBe(12);
      expect(profile.charaDasha?.periods.length).toBe(12);
    });
  });
});
