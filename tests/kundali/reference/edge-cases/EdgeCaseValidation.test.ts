import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";
import { normalize360 } from "../../../../src/kundali/astronomy/AyanamshaProvider";

describe("Reference Corpus — Edge Cases & Numerical Robustness Suite", () => {
  const J2000_TIME = Astronomy.MakeTime(new Date("2000-01-01T12:00:00Z"));

  describe("1. Trigonometric Normalization & Wrap-Around", () => {
    it("handles 0°, 360°, 720°, negative values and infinitesimal epsilons cleanly", () => {
      expect(normalize360(0.0)).toBe(0.0);
      expect(normalize360(360.0)).toBe(0.0);
      expect(normalize360(720.0)).toBe(0.0);
      expect(normalize360(-0.00000001)).toBeCloseTo(359.99999999, 7);
      expect(normalize360(-360.0)).toBe(0.0);
      expect(normalize360(360.00000001)).toBeCloseTo(0.00000001, 7);
    });
  });

  describe("2. High-Latitude Ascendant Numerical Stability", () => {
    it("evaluates Fairbanks, Alaska (64.8° N) without mathematical singularity or NaN", () => {
      const lagna = AstronomicalCore.calculateLagna(J2000_TIME, 64.8378, -147.7164, 23.857);
      expect(Number.isFinite(lagna.tropicalAscendant)).toBe(true);
      expect(Number.isFinite(lagna.siderealAscendant)).toBe(true);
      expect(lagna.signIndex).toBeGreaterThanOrEqual(0);
      expect(lagna.signIndex).toBeLessThanOrEqual(11);
    });

    it("evaluates Tromsø, Norway (69.6° N) without throwing an uncaught exception", () => {
      const lagna = AstronomicalCore.calculateLagna(J2000_TIME, 69.6492, 18.9553, 23.857);
      expect(Number.isFinite(lagna.siderealAscendant)).toBe(true);
    });
  });

  describe("3. Calendar Leap Year & Century Rollover Edge Cases", () => {
    it("safely processes Leap Year 2000 (Feb 29) century leap", () => {
      const tc = AstronomicalCore.createTimeContext(
        2000,
        2,
        29,
        12,
        0,
        0,
        "UTC",
      );

      const d = new Date(tc.utcMs);
      expect(d.getUTCFullYear()).toBe(2000);
      expect(d.getUTCMonth()).toBe(1); // Feb
      expect(d.getUTCDate()).toBe(29);
      expect(tc.julianDay).toBeCloseTo(2451604.0, 1);
    });

    it("safely handles 1900 non-leap century transition", () => {
      const tc = AstronomicalCore.createTimeContext(
        1900,
        2,
        28,
        23,
        59,
        59,
        "UTC",
      );

      const d = new Date(tc.utcMs);
      expect(d.getUTCFullYear()).toBe(1900);
      expect(d.getUTCMonth()).toBe(1);
      expect(d.getUTCDate()).toBe(28);
    });
  });
});
