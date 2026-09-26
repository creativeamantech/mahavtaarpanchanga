import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";
import { CLASSICAL_NAVAGRAHA } from "../../../../src/kundali/astronomy/AstronomicalContext";
import { EPHEMERIS_COMPARISON_MATRIX } from "./EphemerisComparisonTable";

describe("Reference Corpus — Astronomical Validation & Ephemeris Conformance", () => {
  const J2000_TIME = Astronomy.MakeTime(new Date("2000-01-01T12:00:00Z"));

  describe("1. Navagraha Coordinates, Speed & Retrograde Flags", () => {
    CLASSICAL_NAVAGRAHA.forEach((bodyId) => {
      it(`calculates valid normalized geocentric coordinates for ${bodyId}`, () => {
        const pos = AstronomicalCore.calculatePlanetaryPosition(bodyId, J2000_TIME);

        expect(pos.id).toBe(bodyId);
        expect(pos.tropicalLongitude).toBeGreaterThanOrEqual(0);
        expect(pos.tropicalLongitude).toBeLessThan(360);

        // Latitude checks
        if (bodyId === "Sun" || bodyId === "Rahu" || bodyId === "Ketu") {
          expect(pos.tropicalLatitude).toBe(0);
        } else {
          // All planets orbit close to ecliptic plane (< 8 degrees for classical planets)
          expect(Math.abs(pos.tropicalLatitude)).toBeLessThan(8.0);
        }

        // Distance in AU
        expect(pos.distanceAU).toBeGreaterThan(0);

        // Daily speed check
        expect(Number.isFinite(pos.speedDegPerDay)).toBe(true);

        // Retrograde flag consistency: speed < 0 should imply isRetrograde
        if (bodyId !== "Rahu" && bodyId !== "Ketu") {
          expect(pos.isRetrograde).toBe(pos.speedDegPerDay < 0);
        } else {
          // Mean Lunar nodes are always in retrograde motion in classical Jyotisha
          expect(pos.isRetrograde).toBe(true);
          expect(pos.speedDegPerDay).toBeLessThan(0);
        }
      });
    });
  });

  describe("2. Rahu & Ketu Invariant — Strict 180° Anti-Podal Alignment", () => {
    it("ensures Rahu and Ketu are always exactly 180° apart at all epochs", () => {
      const epochs = [
        "1947-08-15T00:00:00Z",
        "2000-01-01T12:00:00Z",
        "2024-04-14T06:00:00Z",
        "2050-01-01T00:00:00Z",
      ];

      epochs.forEach((epochStr) => {
        const t = Astronomy.MakeTime(new Date(epochStr));
        const rahu = AstronomicalCore.calculatePlanetaryPosition("Rahu", t);
        const ketu = AstronomicalCore.calculatePlanetaryPosition("Ketu", t);

        let delta = Math.abs(rahu.tropicalLongitude - ketu.tropicalLongitude);
        if (delta > 180.001) delta = 360.0 - delta;

        expect(delta).toBeCloseTo(180.0, 5);
      });
    });
  });

  describe("3. Multi-Engine Comparison Matrix Validation", () => {
    it("verifies every entry in the comparison matrix is certified MATCH or WITHIN_TOLERANCE", () => {
      expect(EPHEMERIS_COMPARISON_MATRIX.length).toBeGreaterThanOrEqual(5);

      EPHEMERIS_COMPARISON_MATRIX.forEach((entry) => {
        expect(["MATCH", "WITHIN_TOLERANCE"]).toContain(entry.status);
        expect(Number(entry.difference)).toBeLessThanOrEqual(Number(entry.tolerance));
        expect(entry.engine).toBeTruthy();
        expect(entry.classification).toBeTruthy();
        expect(entry.notes).toBeTruthy();
      });
    });
  });
});
