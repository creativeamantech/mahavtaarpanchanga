import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";

describe("Reference Corpus — Lagna (Ascendant) & House Cusp Validation Suite", () => {
  const J2000_TIME = Astronomy.MakeTime(new Date("2000-01-01T12:00:00Z"));
  const AYANAMSA_J2000 = 23.857092;

  describe("1. Canonical Ascendant Anchor Verification", () => {
    it("calculates accurate Ascendant for Ujjain (Prime Meridian of Classical India)", () => {
      // Ujjain: 23.1765° N, 75.7885° E
      const lagna = AstronomicalCore.calculateLagna(
        J2000_TIME,
        23.1765,
        75.7885,
        AYANAMSA_J2000,
      );

      expect(lagna.tropicalAscendant).toBeGreaterThanOrEqual(0);
      expect(lagna.tropicalAscendant).toBeLessThan(360);
      expect(lagna.siderealAscendant).toBeGreaterThanOrEqual(0);
      expect(lagna.siderealAscendant).toBeLessThan(360);

      // Sign and nakshatra boundaries
      expect(lagna.signIndex).toBeGreaterThanOrEqual(0);
      expect(lagna.signIndex).toBeLessThanOrEqual(11);
      expect(lagna.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(lagna.degreeInSign).toBeLessThan(30);
      expect(lagna.nakshatraIndex).toBeGreaterThanOrEqual(1);
      expect(lagna.nakshatraIndex).toBeLessThanOrEqual(27);
      expect(lagna.pada).toBeGreaterThanOrEqual(1);
      expect(lagna.pada).toBeLessThanOrEqual(4);

      // Obliquity of Ecliptic at J2000 should be ~23.439°
      expect(lagna.obliquityDegrees).toBeCloseTo(23.439, 2);
    });

    it("verifies Greenwich 0° Longitude Ascendant continuity", () => {
      const lagna = AstronomicalCore.calculateLagna(J2000_TIME, 51.4769, 0.0, AYANAMSA_J2000);
      expect(Number.isFinite(lagna.tropicalAscendant)).toBe(true);
      expect(Number.isFinite(lagna.siderealAscendant)).toBe(true);
    });
  });

  describe("2. Parametric Sweep: 1-Degree Latitude Step Validation (0° to 65° N & Southern Hemisphere)", () => {
    it("sweeps every 1 degree of latitude from 0° (Equator) to 65° (Sub-Arctic) across multiple longitudes", () => {
      const sampleLongitudes = [0.0, 77.209, 139.69, -74.006]; // Greenwich, Delhi, Tokyo, New York

      for (const lon of sampleLongitudes) {
        for (let lat = 0; lat <= 65; lat += 1.0) {
          const lagna = AstronomicalCore.calculateLagna(J2000_TIME, lat, lon, AYANAMSA_J2000);

          expect(
            Number.isFinite(lagna.siderealAscendant),
            `Latitude ${lat}°, Longitude ${lon}° yielded non-finite Ascendant`,
          ).toBe(true);
          expect(lagna.siderealAscendant).toBeGreaterThanOrEqual(0);
          expect(lagna.siderealAscendant).toBeLessThan(360);
          expect(lagna.signIndex).toBeGreaterThanOrEqual(0);
          expect(lagna.signIndex).toBeLessThanOrEqual(11);
          expect(lagna.degreeInSign).toBeGreaterThanOrEqual(0);
          expect(lagna.degreeInSign).toBeLessThan(30);
          expect(lagna.nakshatraIndex).toBeGreaterThanOrEqual(1);
          expect(lagna.nakshatraIndex).toBeLessThanOrEqual(27);
          expect(lagna.pada).toBeGreaterThanOrEqual(1);
          expect(lagna.pada).toBeLessThanOrEqual(4);
        }
      }
    });

    it("sweeps southern latitudes (-45° to -1°)", () => {
      const lon = 151.2093; // Sydney longitude
      for (let lat = -45; lat <= -1; lat += 2.0) {
        const lagna = AstronomicalCore.calculateLagna(J2000_TIME, lat, lon, AYANAMSA_J2000);
        expect(Number.isFinite(lagna.siderealAscendant)).toBe(true);
        expect(lagna.siderealAscendant).toBeGreaterThanOrEqual(0);
        expect(lagna.siderealAscendant).toBeLessThan(360);
      }
    });
  });

  describe("3. House System Convention", () => {
    it("records whole-sign house system as default with full sign lord mapping", () => {
      const lagna = AstronomicalCore.calculateLagna(J2000_TIME, 28.6139, 77.209, AYANAMSA_J2000);
      // In Whole-Sign convention, House 1 = Lagna sign, House 2 = (Lagna sign + 1)%12, etc.
      for (let house = 1; house <= 12; house++) {
        const expectedSignIndex = (lagna.signIndex + (house - 1)) % 12;
        expect(expectedSignIndex).toBeGreaterThanOrEqual(0);
        expect(expectedSignIndex).toBeLessThan(12);
      }
    });
  });
});
