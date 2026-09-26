import { describe, it, expect } from "vitest";
import { VimshottariDashaEngine } from "../../../../src/kundali/dasha/vimshottari/VimshottariDashaEngine";
import {
  VIMSHOTTARI_LORDS,
  NAKSHATRA_ARC_DEG,
  PADA_ARC_DEG,
} from "../../../../src/kundali/dasha/vimshottari/VimshottariSequence";
import { DashaPeriod } from "../../../../src/kundali/dasha/types/DashaTypes";

describe("Reference Corpus — Vimshottari Dasha 5-Tier Timeline & Sum Conservation", () => {
  const engine = new VimshottariDashaEngine();

  describe("1. Birth Balance at Nakshatra & Pada Boundaries", () => {
    it("tests Ashwini 0° exact boundary (Ketu 7 years 100% balance)", () => {
      const bal = engine.calculateBirthBalance(0.0);
      expect(bal.lord).toBe("Ketu");
      expect(bal.nakshatraIndex).toBe(0);
      expect(bal.pada).toBe(1);
      expect(bal.remainingFraction).toBeCloseTo(1.0, 6);
      expect(bal.remainingYearsTotal).toBeCloseTo(7.0, 6);
      expect(bal.years).toBe(7);
      expect(bal.months).toBe(0);
      expect(bal.days).toBe(0);
    });

    it("tests Bharani 13°20' exact boundary (Venus 20 years 100% balance)", () => {
      const bal = engine.calculateBirthBalance(NAKSHATRA_ARC_DEG);
      expect(bal.lord).toBe("Venus");
      expect(bal.nakshatraIndex).toBe(1);
      expect(bal.pada).toBe(1);
      expect(bal.remainingFraction).toBeCloseTo(1.0, 6);
      expect(bal.remainingYearsTotal).toBeCloseTo(20.0, 6);
      expect(bal.years).toBe(20);
    });

    it("tests Pada 2 transition (3°20' in Ashwini)", () => {
      const bal = engine.calculateBirthBalance(PADA_ARC_DEG);
      expect(bal.lord).toBe("Ketu");
      expect(bal.pada).toBe(2);
      expect(bal.elapsedFraction).toBeCloseTo(0.25, 5);
      expect(bal.remainingFraction).toBeCloseTo(0.75, 5);
      expect(bal.remainingYearsTotal).toBeCloseTo(5.25, 5);
    });

    it("tests Revati terminal boundary (359.9999° Mercury)", () => {
      const bal = engine.calculateBirthBalance(360.0 - 0.0001);
      expect(bal.lord).toBe("Mercury");
      expect(bal.nakshatraIndex).toBe(26);
      expect(bal.pada).toBe(4);
      expect(bal.remainingFraction).toBeCloseTo(0.0, 3);
    });
  });

  describe("2. Mathematical Sum Conservation: Child Periods Strictly Equal Parent Period", () => {
    function assertChildrenSumToParent(period: DashaPeriod) {
      if (!period.children || period.children.length === 0) return;

      expect(period.children.length).toBe(9);
      const parentDurationMs = period.endTimestampMs - period.startTimestampMs;
      const childrenSumMs = period.children.reduce(
        (acc, c) => acc + (c.endTimestampMs - c.startTimestampMs),
        0,
      );

      // Child durations must sum to parent duration within rounding delta (< 50ms)
      const diffMs = Math.abs(parentDurationMs - childrenSumMs);
      expect(
        diffMs,
        `Period ${period.periodId} (L${period.level}) children sum differs by ${diffMs}ms`,
      ).toBeLessThanOrEqual(50);

      // Verify continuity: child[i].endTimestampMs === child[i+1].startTimestampMs
      for (let i = 0; i < period.children.length - 1; i++) {
        expect(period.children[i].endTimestampMs).toBe(period.children[i + 1].startTimestampMs);
      }

      // First child start = parent start; last child end = parent end (within 50ms)
      expect(period.children[0].startTimestampMs).toBe(period.startTimestampMs);
      expect(Math.abs(period.children[8].endTimestampMs - period.endTimestampMs)).toBeLessThanOrEqual(
        50,
      );

      // Recursively test lower levels
      for (const child of period.children) {
        assertChildrenSumToParent(child);
      }
    }

    it("validates 5-tier nested timeline (Maha, Antar, Pratyantar, Sookshma, Prana) sum conservation", () => {
      const birthMs = Date.UTC(1990, 4, 15, 9, 0, 0); // 1990-05-15 09:00 UTC
      const timeline = engine.calculateTimeline({
        birthTimestampMs: birthMs,
        moonSiderealLonDeg: 45.5, // Rohini, Moon dasha balance
        depthLevels: 5,
        targetTimestampMs: birthMs + 1000 * 86400 * 365 * 2, // 2 years after birth
        convention: "gregorian_solar",
      });

      expect(timeline.periods.length).toBe(9);

      // Check sum conservation across all generated levels
      timeline.periods.forEach((maha) => {
        assertChildrenSumToParent(maha);
      });
    });
  });

  describe("3. 120-Year Full Cycle Wrap & Leap Year Invariants", () => {
    it("ensures total cycle spans 120 Vimshottari years starting from any birth balance", () => {
      const birthMs = Date.UTC(2000, 0, 1, 0, 0, 0);
      const timeline = engine.calculateTimeline({
        birthTimestampMs: birthMs,
        moonSiderealLonDeg: 0.0, // Ashwini 0° -> Ketu starts with full 7 years
        depthLevels: 1,
        convention: "gregorian_solar",
      });

      // Sum of remaining years in Mahadashas should equal 120.0
      const totalYears = timeline.periods.reduce((acc, p) => acc + p.durationYears, 0);
      expect(totalYears).toBeCloseTo(120.0, 2);

      // Final period end date should be approx 120 years later
      const finalEndYear = new Date(timeline.periods[8].endTimestampMs).getUTCFullYear();
      expect(finalEndYear).toBe(2120);
    });
  });
});
