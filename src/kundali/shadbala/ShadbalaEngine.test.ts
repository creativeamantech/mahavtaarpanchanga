import { describe, it, expect } from "vitest";
import { ShadbalaEngine } from "./ShadbalaEngine";
import {
  calculateUchchaBala,
  calculateKendradiBala,
  calculateDrekkanaBala,
  calculateOjayugmarashiBala,
} from "./SthanaBala";
import { calculateDigBala } from "./DigBala";
import { calculateNaisargikaBala, NAISARGIKA_BALA_TABLE } from "./NaisargikaBala";
import { calculateCheshtaBala } from "./CheshtaBala";
import { calculateRawDrishti } from "./DrikBala";
import { calculateIshtaKashtaPhala } from "./IshtaKashtaPhala";
import { validateShadbalaResult } from "./ShadbalaValidation";

describe("Phase 3: Shadbala & Bhava Bala Computational Engine", () => {
  const engine = new ShadbalaEngine();

  describe("1. Naisargika Bala (Natural Inherent Strength)", () => {
    it("matches exact classical values for all 7 Grahas", () => {
      const sun = calculateNaisargikaBala("Sun");
      expect(sun.totalVirupas).toBeCloseTo(60.0, 4);
      expect(sun.totalRupas).toBeCloseTo(1.0, 4);

      const moon = calculateNaisargikaBala("Moon");
      expect(moon.totalVirupas).toBeCloseTo(51.42857, 4);

      const venus = calculateNaisargikaBala("Venus");
      expect(venus.totalVirupas).toBeCloseTo(42.85714, 4);

      const jupiter = calculateNaisargikaBala("Jupiter");
      expect(jupiter.totalVirupas).toBeCloseTo(34.28571, 4);

      const mercury = calculateNaisargikaBala("Mercury");
      expect(mercury.totalVirupas).toBeCloseTo(25.71428, 4);

      const mars = calculateNaisargikaBala("Mars");
      expect(mars.totalVirupas).toBeCloseTo(17.14285, 4);

      const saturn = calculateNaisargikaBala("Saturn");
      expect(saturn.totalVirupas).toBeCloseTo(8.57142, 4);
    });

    it("verifies the classical sum invariant: sum of 7 Grahas is exactly 240.0 Virupas (4.0 Rupas)", () => {
      const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
      const totalVirupas = planets.reduce(
        (sum, p) => sum + calculateNaisargikaBala(p).totalVirupas,
        0,
      );
      expect(totalVirupas).toBeCloseTo(240.0, 5);
      expect(totalVirupas / 60.0).toBeCloseTo(4.0, 5);
    });
  });

  describe("2. Sthana Bala (Positional Strength)", () => {
    it("calculates exact Uchcha Bala at deep exaltation and debilitation", () => {
      // Sun deep exaltation at Aries 10°
      const sunEx = calculateUchchaBala("Sun", 10.0);
      expect(sunEx).toBeCloseTo(60.0, 4);

      // Sun deep debilitation at Libra 10° (190°)
      const sunDeb = calculateUchchaBala("Sun", 190.0);
      expect(sunDeb).toBeCloseTo(0.0, 4);

      // Moon deep exaltation at Taurus 3° (33°)
      const moonEx = calculateUchchaBala("Moon", 33.0);
      expect(moonEx).toBeCloseTo(60.0, 4);

      // Mars deep exaltation at Capricorn 28° (298°)
      const marsEx = calculateUchchaBala("Mars", 298.0);
      expect(marsEx).toBeCloseTo(60.0, 4);

      // Jupiter deep exaltation at Cancer 5° (95°)
      const jupEx = calculateUchchaBala("Jupiter", 95.0);
      expect(jupEx).toBeCloseTo(60.0, 4);
    });

    it("calculates Kendradi Bala according to Kendra, Panaphara, Apoklima", () => {
      // Kendra houses (1, 4, 7, 10) = 60
      expect(calculateKendradiBala(1)).toBe(60);
      expect(calculateKendradiBala(4)).toBe(60);
      expect(calculateKendradiBala(7)).toBe(60);
      expect(calculateKendradiBala(10)).toBe(60);

      // Panaphara houses (2, 5, 8, 11) = 30
      expect(calculateKendradiBala(2)).toBe(30);
      expect(calculateKendradiBala(5)).toBe(30);
      expect(calculateKendradiBala(8)).toBe(30);
      expect(calculateKendradiBala(11)).toBe(30);

      // Apoklima houses (3, 6, 9, 12) = 15
      expect(calculateKendradiBala(3)).toBe(15);
      expect(calculateKendradiBala(6)).toBe(15);
      expect(calculateKendradiBala(9)).toBe(15);
      expect(calculateKendradiBala(12)).toBe(15);
    });

    it("calculates Drekkana Bala based on planetary gender and decanate", () => {
      // Sun (male) in 1st drekkana (0-10°) = 15
      expect(calculateDrekkanaBala("Sun", 5.0)).toBe(15);
      // Sun in 2nd drekkana (10-20°) = 0
      expect(calculateDrekkanaBala("Sun", 15.0)).toBe(0);

      // Saturn (neutral) in 2nd drekkana = 15
      expect(calculateDrekkanaBala("Saturn", 15.0)).toBe(15);
      expect(calculateDrekkanaBala("Saturn", 5.0)).toBe(0);

      // Venus (female) in 3rd drekkana (20-30°) = 15
      expect(calculateDrekkanaBala("Venus", 25.0)).toBe(15);
      expect(calculateDrekkanaBala("Venus", 5.0)).toBe(0);
    });
  });

  describe("3. Dig Bala (Directional Strength)", () => {
    // 12 houses starting at Lagna = 0°
    const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

    it("gives 60 Virupas at peak cardinal cusp and 0 at opposite zero-point", () => {
      // Jupiter/Mercury peak in 1st house (0°)
      const jupAt1 = calculateDigBala("Jupiter", 0.0, cusps);
      expect(jupAt1.totalVirupas).toBeCloseTo(60.0, 4);
      const jupAt7 = calculateDigBala("Jupiter", 180.0, cusps);
      expect(jupAt7.totalVirupas).toBeCloseTo(0.0, 4);

      // Sun/Mars peak in 10th house (270°)
      const sunAt10 = calculateDigBala("Sun", 270.0, cusps);
      expect(sunAt10.totalVirupas).toBeCloseTo(60.0, 4);
      const sunAt4 = calculateDigBala("Sun", 90.0, cusps);
      expect(sunAt4.totalVirupas).toBeCloseTo(0.0, 4);

      // Saturn peak in 7th house (180°)
      const satAt7 = calculateDigBala("Saturn", 180.0, cusps);
      expect(satAt7.totalVirupas).toBeCloseTo(60.0, 4);
      const satAt1 = calculateDigBala("Saturn", 0.0, cusps);
      expect(satAt1.totalVirupas).toBeCloseTo(0.0, 4);

      // Moon/Venus peak in 4th house (90°)
      const moonAt4 = calculateDigBala("Moon", 90.0, cusps);
      expect(moonAt4.totalVirupas).toBeCloseTo(60.0, 4);
      const moonAt10 = calculateDigBala("Moon", 270.0, cusps);
      expect(moonAt10.totalVirupas).toBeCloseTo(0.0, 4);
    });
  });

  describe("4. Cheshta Bala (Motional Strength)", () => {
    it("gives 60 Virupas for retrograde planets", () => {
      const jupiterVakra = calculateCheshtaBala("Jupiter", -0.05, true);
      expect(jupiterVakra.motionState).toBe("vakra");
      expect(jupiterVakra.totalVirupas).toBe(60.0);
    });

    it("gives 15 Virupas for stationary planets", () => {
      const saturnStationary = calculateCheshtaBala("Saturn", 0.0005, false);
      expect(saturnStationary.motionState).toBe("vikala");
      expect(saturnStationary.totalVirupas).toBe(15.0);
    });

    it("correctly assigns Sun Cheshta Bala to Ayana Bala and Moon to Paksha Bala", () => {
      const sun = calculateCheshtaBala("Sun", 0.9856, false, 45.2, 0);
      expect(sun.totalVirupas).toBe(45.2);
      expect(sun.source).toContain("Ayana Bala");

      const moon = calculateCheshtaBala("Moon", 13.1764, false, 0, 52.8);
      expect(moon.totalVirupas).toBe(52.8);
      expect(moon.source).toContain("Paksha Bala");
    });
  });

  describe("5. Drik Bala (Aspectual Strength)", () => {
    it("computes exact raw aspect angles from piecewise BPHS curves", () => {
      // 180° opposition aspect: (180 - 150) * 2 = 60 Virupas
      const fullAspect = calculateRawDrishti("Jupiter", 180.0, 0.0);
      expect(fullAspect).toBe(60.0);

      // 0° conjunction aspect: 0 Virupas
      const zeroAspect = calculateRawDrishti("Jupiter", 0.0, 0.0);
      expect(zeroAspect).toBe(0.0);

      // 60° sextile: 15 + (60 - 60) = 15 Virupas
      const sextile = calculateRawDrishti("Mercury", 60.0, 0.0);
      expect(sextile).toBe(15.0);
    });
  });

  describe("6. Ishta Phala and Kashta Phala", () => {
    it("computes exact geometric means", () => {
      // Max Uchcha (60) and Max Cheshta (60)
      const maxIshta = calculateIshtaKashtaPhala(60.0, 60.0);
      expect(maxIshta.ishtaPhala).toBeCloseTo(60.0, 4);
      expect(maxIshta.kashtaPhala).toBeCloseTo(0.0, 4);

      // Zero Uchcha (0) and Zero Cheshta (0)
      const minIshta = calculateIshtaKashtaPhala(0.0, 0.0);
      expect(minIshta.ishtaPhala).toBeCloseTo(0.0, 4);
      expect(minIshta.kashtaPhala).toBeCloseTo(60.0, 4);

      // Intermediate: Uchcha 30, Cheshta 30 => Ishta = 30, Kashta = 30
      const mid = calculateIshtaKashtaPhala(30.0, 30.0);
      expect(mid.ishtaPhala).toBeCloseTo(30.0, 4);
      expect(mid.kashtaPhala).toBeCloseTo(30.0, 4);
    });
  });

  describe("7. Full Shadbala and Bhava Bala Integration", () => {
    const sampleLons = {
      Sun: 15.4, // Aries
      Moon: 42.1, // Taurus
      Mars: 285.2, // Capricorn
      Mercury: 25.8, // Aries
      Jupiter: 98.7, // Cancer
      Venus: 345.1, // Pisces
      Saturn: 215.3, // Scorpio
      Rahu: 55.2,
      Ketu: 235.2,
    };
    const lagnaLon = 45.0; // Taurus
    const timestampMs = Date.UTC(2024, 4, 15, 6, 30, 0); // May 15, 2024
    const lat = 28.6139; // New Delhi
    const lon = 77.209;

    it("satisfies the IShadbalaEngine interface contract completely", () => {
      const result = engine.calculateShadbala(sampleLons, lagnaLon, timestampMs, lat, lon);

      expect(result).toHaveProperty("planets");
      expect(result).toHaveProperty("bhavas");
      expect(result).toHaveProperty("mostPowerfulPlanet");
      expect(result).toHaveProperty("weakestPlanet");

      const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
      for (const p of planets) {
        const graha = result.planets[p];
        expect(graha).toBeDefined();
        expect(graha.totalVirupas).toBeGreaterThan(150);
        expect(graha.totalRupas).toBeCloseTo(graha.totalVirupas / 60.0, 4);
        expect(graha.strengthRatio).toBeCloseTo(graha.totalRupas / graha.requiredRupas, 4);
        expect(graha.rank).toBeGreaterThanOrEqual(1);
        expect(graha.rank).toBeLessThanOrEqual(7);
      }

      // 12 Bhavas
      expect(result.bhavas.length).toBe(12);
      for (let h = 1; h <= 12; h++) {
        const bhava = result.bhavas.find((b) => b.houseNumber === h);
        expect(bhava).toBeDefined();
        expect(bhava!.totalVirupas).toBeGreaterThan(0);
        expect(bhava!.rank).toBeGreaterThanOrEqual(1);
        expect(bhava!.rank).toBeLessThanOrEqual(12);
      }
    });

    it("detailed result passes all physical and classical invariant validation checks", () => {
      const detailed = engine.calculateDetailedShadbala(
        sampleLons,
        lagnaLon,
        timestampMs,
        lat,
        lon,
      );
      const issues = validateShadbalaResult(detailed);
      expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("produces strictly deterministic calculations across multiple runs", () => {
      const run1 = engine.calculateDetailedShadbala(sampleLons, lagnaLon, timestampMs, lat, lon);
      const run2 = engine.calculateDetailedShadbala(sampleLons, lagnaLon, timestampMs, lat, lon);

      const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
      for (const p of planets) {
        expect(run1.planets[p].totalVirupas).toBe(run2.planets[p].totalVirupas);
        expect(run1.planets[p].ishtaKashta.ishtaPhala).toBe(run2.planets[p].ishtaKashta.ishtaPhala);
      }
      for (let h = 0; h < 12; h++) {
        expect(run1.bhavas[h].totalVirupas).toBe(run2.bhavas[h].totalVirupas);
      }
    });
  });
});
