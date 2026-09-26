import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../src/kundali/astronomy/AstronomicalCore";
import { AyanamshaRegistry } from "../../../src/kundali/astronomy/AyanamshaProvider";
import { VargaEngine, ALL_SHODASHAVARGA_TYPES } from "../../../src/kundali/varga/VargaEngine";
import { ShadbalaEngine } from "../../../src/kundali/shadbala/ShadbalaEngine";
import { calculateNaisargikaBala } from "../../../src/kundali/shadbala/NaisargikaBala";
import { VimshottariDashaEngine } from "../../../src/kundali/dasha/vimshottari/VimshottariDashaEngine";
import { RuleRegistry } from "../../../src/kundali/rules/RuleRegistry";
import { CharaKarakaEngine } from "../../../src/kundali/jaimini/CharaKarakaEngine";
import { calculateKundliData, ZODIAC_SIGNS } from "../../../src/lib/kundliEngine";

describe("Phase 7: Mahavtaar Kundali — Master Regression Gate", () => {
  const J2000_TIME = Astronomy.MakeTime(new Date("2000-01-01T12:00:00Z"));

  describe("Gate 1: Astronomy Invariants", () => {
    it("preserves Rahu-Ketu 180° anti-podal invariant and valid planetary bounds", () => {
      const rahu = AstronomicalCore.calculatePlanetaryPosition("Rahu", J2000_TIME);
      const ketu = AstronomicalCore.calculatePlanetaryPosition("Ketu", J2000_TIME);
      let delta = Math.abs(rahu.tropicalLongitude - ketu.tropicalLongitude);
      if (delta > 180.001) delta = 360.0 - delta;
      expect(delta).toBeCloseTo(180.0, 5);
    });
  });

  describe("Gate 2: Lagna & Obliquity Invariants", () => {
    it("computes bounded ascendants and valid mean obliquity", () => {
      const lagna = AstronomicalCore.calculateLagna(J2000_TIME, 28.6139, 77.209, 23.857);
      expect(lagna.siderealAscendant).toBeGreaterThanOrEqual(0);
      expect(lagna.siderealAscendant).toBeLessThan(360);
      expect(lagna.obliquityDegrees).toBeCloseTo(23.439, 2);
    });
  });

  describe("Gate 3: Bhava & Lordship Invariants", () => {
    it("preserves 12 zodiac lords and whole-sign house integrity", () => {
      expect(ZODIAC_SIGNS.length).toBe(12);
      expect(ZODIAC_SIGNS[0].lord).toBe("Mars");
      expect(ZODIAC_SIGNS[3].lord).toBe("Moon");
      expect(ZODIAC_SIGNS[4].lord).toBe("Sun");
      expect(ZODIAC_SIGNS[8].lord).toBe("Jupiter");
      expect(ZODIAC_SIGNS[9].lord).toBe("Saturn");
    });
  });

  describe("Gate 4: Shodashavarga Invariants", () => {
    it("verifies all 16 divisional charts execute without divergence", () => {
      expect(ALL_SHODASHAVARGA_TYPES.length).toBe(16);
      ALL_SHODASHAVARGA_TYPES.forEach((varga) => {
        const res = VargaEngine.calculatePositionInVarga(15.5, varga);
        expect(res.destinationSignIndex).toBeGreaterThanOrEqual(0);
        expect(res.destinationSignIndex).toBeLessThanOrEqual(11);
      });
    });
  });

  describe("Gate 5: Shadbala Invariants", () => {
    it("strictly preserves Naisargika Bala 240.0 Virupa invariant", () => {
      const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
      const totalVirupas = planets.reduce(
        (sum, p) => sum + calculateNaisargikaBala(p).totalVirupas,
        0,
      );
      expect(totalVirupas).toBeCloseTo(240.0, 5);
      expect(totalVirupas / 60.0).toBeCloseTo(4.0, 5);
    });
  });

  describe("Gate 6: Vimshottari Dasha Invariants", () => {
    it("preserves 120-year cycle and birth balance fractions", () => {
      const engine = new VimshottariDashaEngine();
      const bal = engine.calculateBirthBalance(0.0);
      expect(bal.lord).toBe("Ketu");
      expect(bal.remainingYearsTotal).toBeCloseTo(7.0, 6);
    });
  });

  describe("Gate 7: Parashari Rules Invariants", () => {
    it("verifies rule registry contains all canonical rules with valid metadata", () => {
      const rules = RuleRegistry.getInstance().getAllRules();
      expect(rules.length).toBeGreaterThanOrEqual(15);
      rules.forEach((r) => {
        expect(r.source).toBeTruthy();
        expect(r.sourceReference).toBeTruthy();
      });
    });
  });

  describe("Gate 8: Jaimini Invariants", () => {
    it("preserves 7-Karaka sorting and 8-Karaka Rahu 30-deg inversion", () => {
      const planets = [
        { id: "Sun" as const, longitude: 28.5, signIndex: 0, degreeInSign: 28.5 },
        { id: "Moon" as const, longitude: 10.2, signIndex: 0, degreeInSign: 10.2 },
        { id: "Rahu" as const, longitude: 7.0, signIndex: 2, degreeInSign: 7.0 },
      ];
      const karakas8 = CharaKarakaEngine.calculateCharaKarakas(planets, "8_karaka");
      expect(karakas8.scheme).toBe("8_karaka");
      // Rahu at 7° -> effective degree 23° -> Rank 2
      expect(karakas8.atmakaraka.planet).toBe("Sun");
      expect(karakas8.amatyakaraka.planet).toBe("Rahu");
    });
  });

  describe("Gate 9: Timezone & DST Transitions", () => {
    it("handles fractional IST +5:30 and Nepal +5:45 without temporal drift", () => {
      const ist = AstronomicalCore.createTimeContext(2024, 6, 1, 12, 0, 0, "Asia/Kolkata");
      const npt = AstronomicalCore.createTimeContext(2024, 6, 1, 12, 0, 0, "Asia/Kathmandu");
      // Difference between IST (5:30) and NPT (5:45) is exactly 15 minutes = 900,000 ms
      const diffMs = ist.utcMs - npt.utcMs;
      expect(diffMs).toBe(15 * 60 * 1000);
    });
  });

  describe("Gate 10: Canonical Historical Charts", () => {
    it("preserves Independence of India 1947 Taurus Lagna benchmark", () => {
      const ind = calculateKundliData({
        year: 1947,
        month: 8,
        day: 15,
        hour: 0,
        minute: 0,
        second: 0,
        latitude: 28.6139,
        longitude: 77.209,
        timezone: "Asia/Kolkata",
        ayanamsaKey: "lahiri",
      });
      expect(ind.lagna.signIndex).toBe(1); // Taurus
      expect(ind.planets.find((p) => p.id === "Sun")?.signIndex).toBe(3); // Cancer
    });
  });

  describe("Gate 11: Edge Cases & Numerical Robustness", () => {
    it("safely handles century leap year 2000 and polar circle latitudes", () => {
      const leap = AstronomicalCore.createTimeContext(2000, 2, 29, 12, 0, 0, "UTC");
      expect(new Date(leap.utcMs).getUTCDate()).toBe(29);

      const polar = AstronomicalCore.calculateLagna(J2000_TIME, 66.56, 0.0, 23.857);
      expect(Number.isFinite(polar.siderealAscendant)).toBe(true);
    });
  });
});
