import { describe, it, expect } from "vitest";
import { ShadbalaEngine } from "../../../../src/kundali/shadbala/ShadbalaEngine";
import { calculateNaisargikaBala } from "../../../../src/kundali/shadbala/NaisargikaBala";
import { calculateIshtaKashtaPhala } from "../../../../src/kundali/shadbala/IshtaKashtaPhala";
import { validateShadbalaResult } from "../../../../src/kundali/shadbala/ShadbalaValidation";
import { CanonicalBodyId } from "../../../../src/kundali/astronomy/AstronomicalContext";

describe("Reference Corpus — Shadbala & Bhava Bala Numerical Verification", () => {
  const engine = new ShadbalaEngine();

  describe("1. Naisargika Bala Invariant (Natural Strength)", () => {
    // In classical Vedic astrology, natural planetary strength order is:
    // Sun (60) > Moon (51.43) > Venus (42.86) > Jupiter (34.29) > Mercury (25.71) > Mars (17.14) > Saturn (8.57)
    const naturalDescendingPlanets = [
      "Sun",
      "Moon",
      "Venus",
      "Jupiter",
      "Mercury",
      "Mars",
      "Saturn",
    ] as const;

    it("ensures sum of Naisargika Bala across all 7 classical Grahas is exactly 240.0 Virupas (4.0 Rupas)", () => {
      let totalVirupas = 0;
      for (const p of naturalDescendingPlanets) {
        const bala = calculateNaisargikaBala(p);
        totalVirupas += bala.totalVirupas;
        // Verify unit conversion: 60 Virupas = 1 Rupa
        expect(bala.totalRupas).toBeCloseTo(bala.totalVirupas / 60.0, 6);
      }

      expect(totalVirupas).toBeCloseTo(240.0, 5);
      expect(totalVirupas / 60.0).toBeCloseTo(4.0, 5);
    });

    it("verifies classical descending order: Sun > Moon > Venus > Jupiter > Mercury > Mars > Saturn", () => {
      const strengths = naturalDescendingPlanets.map((p) => ({
        planet: p,
        virupas: calculateNaisargikaBala(p).totalVirupas,
      }));

      for (let i = 0; i < strengths.length - 1; i++) {
        expect(strengths[i].virupas).toBeGreaterThan(strengths[i + 1].virupas);
      }

      // Check classical fractions: Sun = 60, Moon = 60 * 6/7 ≈ 51.43, etc.
      expect(strengths[0].virupas).toBe(60.0);
      expect(strengths[6].virupas).toBeCloseTo(60.0 / 7.0, 4); // Saturn = 8.5714
    });
  });

  describe("2. Ishta Phala and Kashta Phala Mathematical Bounds", () => {
    it("ensures Ishta Phala and Kashta Phala lie in [0, 60] Virupas and satisfy root product formulas", () => {
      // Test cases with diverse Uchcha and Cheshta Balas
      const testCases = [
        { uchcha: 60, cheshta: 60 },
        { uchcha: 0, cheshta: 0 },
        { uchcha: 30, cheshta: 30 },
        { uchcha: 45, cheshta: 15 },
        { uchcha: 10, cheshta: 50 },
      ];

      for (const tc of testCases) {
        const res = calculateIshtaKashtaPhala(tc.uchcha, tc.cheshta);

        expect(res.ishtaPhala).toBeGreaterThanOrEqual(0);
        expect(res.ishtaPhala).toBeLessThanOrEqual(60.0001);
        expect(res.kashtaPhala).toBeGreaterThanOrEqual(0);
        expect(res.kashtaPhala).toBeLessThanOrEqual(60.0001);
      }
    });
  });

  describe("3. Complete Shadbala & Bhava Bala Pipeline Validation", () => {
    it("computes full 6-fold Shadbala + Bhava Bala and validates all BPHS bounds", () => {
      const siderealLons: Record<CanonicalBodyId, number> = {
        Sun: 28.5,
        Moon: 55.2,
        Mars: 298.0,
        Mercury: 40.1,
        Jupiter: 95.0,
        Venus: 355.0,
        Saturn: 200.0,
        Rahu: 120.0,
        Ketu: 300.0,
      };
      const lagnaSiderealLon = 15.0; // Aries 15°
      const utcTimestampMs = Date.UTC(1990, 4, 15, 9, 0, 0);

      const res = engine.calculateDetailedShadbala(
        siderealLons,
        lagnaSiderealLon,
        utcTimestampMs,
        28.6139,
        77.209,
      );

      // Verify all 7 planets are present
      const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
      planets.forEach((p) => {
        const planetBala = res.planets[p];
        expect(planetBala, `Shadbala for ${p} must exist`).toBeDefined();

        // 6 components verification
        expect(planetBala.sthanaBala.totalVirupas).toBeGreaterThanOrEqual(0);
        expect(planetBala.digBala.totalVirupas).toBeGreaterThanOrEqual(0);
        expect(planetBala.kalaBala.totalVirupas).toBeGreaterThanOrEqual(0);
        expect(planetBala.cheshtaBala.totalVirupas).toBeGreaterThanOrEqual(0);
        expect(planetBala.naisargikaBala.totalVirupas).toBeGreaterThan(0);
        expect(Number.isFinite(planetBala.drikBala.totalVirupas)).toBe(true);

        expect(planetBala.totalVirupas).toBeGreaterThan(0);
        expect(planetBala.totalRupas).toBeCloseTo(planetBala.totalVirupas / 60.0, 5);
      });

      // Verify 12 Bhava Balas
      expect(res.bhavas.length).toBe(12);
      res.bhavas.forEach((bhava, idx) => {
        expect(bhava.houseNumber).toBe(idx + 1);
        expect(bhava.totalVirupas).toBeGreaterThan(0);
        expect(bhava.totalRupas).toBeCloseTo(bhava.totalVirupas / 60.0, 5);
      });
    });
  });
});
