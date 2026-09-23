import { describe, it, expect } from "vitest";
import { VimshottariDashaEngine } from "./VimshottariDashaEngine";
import {
  VIMSHOTTARI_LORDS,
  NAKSHATRA_ARC_DEG,
  PADA_ARC_DEG,
  getNakshatraInfo,
  getMsPerYear,
} from "./VimshottariSequence";
import { validateTimeline, validateNestedPeriods } from "./VimshottariValidation";

describe("Phase 4: Vimshottari Dasha Engine & Multi-Tier Timeline", () => {
  const engine = new VimshottariDashaEngine();

  describe("1. Nakshatra Boundaries & Birth Balance (भोग्य दशा)", () => {
    it("calculates exact full balance at 0° (Ashwini Nakshatra start, Ketu)", () => {
      const balance = engine.calculateBirthBalance(0.0);
      expect(balance.lord).toBe("Ketu");
      expect(balance.nakshatraIndex).toBe(0);
      expect(balance.nakshatraNameEn).toBe("Ashwini");
      expect(balance.pada).toBe(1);
      expect(balance.elapsedFraction).toBeCloseTo(0.0, 6);
      expect(balance.remainingFraction).toBeCloseTo(1.0, 6);
      expect(balance.remainingYearsTotal).toBeCloseTo(7.0, 6);
      expect(balance.years).toBe(7);
      expect(balance.months).toBe(0);
      expect(balance.days).toBe(0);
    });

    it("calculates exact transition at 13°20' (Ashwini end / Bharani start, Venus)", () => {
      const ashwiniEnd = engine.calculateBirthBalance(NAKSHATRA_ARC_DEG - 0.000001);
      expect(ashwiniEnd.lord).toBe("Ketu");
      expect(ashwiniEnd.remainingYearsTotal).toBeCloseTo(0.0, 4);

      const bharaniStart = engine.calculateBirthBalance(NAKSHATRA_ARC_DEG);
      expect(bharaniStart.lord).toBe("Venus");
      expect(bharaniStart.nakshatraIndex).toBe(1);
      expect(bharaniStart.nakshatraNameEn).toBe("Bharani");
      expect(bharaniStart.pada).toBe(1);
      expect(bharaniStart.remainingFraction).toBeCloseTo(1.0, 6);
      expect(bharaniStart.remainingYearsTotal).toBeCloseTo(20.0, 6);
      expect(bharaniStart.years).toBe(20);
      expect(bharaniStart.months).toBe(0);
      expect(bharaniStart.days).toBe(0);
    });

    it("calculates exact midpoint (50% elapsed) of Krittika (Sun, 6 years total)", () => {
      // Krittika starts at 26.666667°, midpoint is 26.666667° + 6.666667° = 33.333333°
      const krittikaMid = 2 * NAKSHATRA_ARC_DEG + NAKSHATRA_ARC_DEG / 2.0;
      const balance = engine.calculateBirthBalance(krittikaMid);
      expect(balance.lord).toBe("Sun");
      expect(balance.nakshatraNameEn).toBe("Krittika");
      expect(balance.pada).toBe(3);
      expect(balance.elapsedFraction).toBeCloseTo(0.5, 6);
      expect(balance.remainingFraction).toBeCloseTo(0.5, 6);
      expect(balance.remainingYearsTotal).toBeCloseTo(3.0, 6);
      expect(balance.years).toBe(3);
      expect(balance.months).toBe(0);
      expect(balance.days).toBe(0);
    });

    it("calculates exact Pada boundaries across a Nakshatra", () => {
      // Rohini (Moon, starts at 40.0°)
      const start = 3 * NAKSHATRA_ARC_DEG; // 40.0°
      expect(getNakshatraInfo(start + 0.1).pada).toBe(1);
      expect(getNakshatraInfo(start + PADA_ARC_DEG + 0.1).pada).toBe(2);
      expect(getNakshatraInfo(start + 2 * PADA_ARC_DEG + 0.1).pada).toBe(3);
      expect(getNakshatraInfo(start + 3 * PADA_ARC_DEG + 0.1).pada).toBe(4);
    });

    it("handles 359.99° -> 0° zodiac wraparound (Revati end, Mercury 17y)", () => {
      const balance = engine.calculateBirthBalance(359.9);
      expect(balance.lord).toBe("Mercury");
      expect(balance.nakshatraIndex).toBe(26);
      expect(balance.nakshatraNameEn).toBe("Revati");
      expect(balance.pada).toBe(4);
      expect(balance.remainingFraction).toBeLessThan(0.01);
      expect(balance.remainingYearsTotal).toBeLessThan(0.2);
    });
  });

  describe("2. Mahadasha Sequence & Parashari Lord Ordering", () => {
    it("generates exactly 9 Mahadashas beginning with birth lord and in cyclic order", () => {
      // Birth with Moon at 42.1° (Rohini, Moon lord)
      const birthMs = Date.UTC(1990, 0, 15, 6, 30, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 42.1,
        birthTimestampMs: birthMs,
        depthLevels: 1,
      });

      expect(timeline.periods).toHaveLength(9);
      expect(timeline.periods[0].lord).toBe("Moon");
      expect(timeline.periods[1].lord).toBe("Mars");
      expect(timeline.periods[2].lord).toBe("Rahu");
      expect(timeline.periods[3].lord).toBe("Jupiter");
      expect(timeline.periods[4].lord).toBe("Saturn");
      expect(timeline.periods[5].lord).toBe("Mercury");
      expect(timeline.periods[6].lord).toBe("Ketu");
      expect(timeline.periods[7].lord).toBe("Venus");
      expect(timeline.periods[8].lord).toBe("Sun");
    });

    it("ensures contiguous timeline across all 9 Mahadashas", () => {
      const birthMs = Date.UTC(1985, 5, 20, 14, 0, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 141.2967, // Purva Phalguni (Venus)
        birthTimestampMs: birthMs,
        depthLevels: 1,
      });

      expect(timeline.periods[0].startTimestampMs).toBe(birthMs);

      for (let i = 0; i < timeline.periods.length - 1; i++) {
        expect(timeline.periods[i].endTimestampMs).toBe(timeline.periods[i + 1].startTimestampMs);
      }
    });
  });

  describe("3. Deterministic Nested Period Generation (Levels 2 to 5)", () => {
    it("generates 9 Antardashas within each Mahadasha starting with the Mahadasha lord", () => {
      const birthMs = Date.UTC(2000, 0, 1, 0, 0, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 100.0, // Pushya (Saturn)
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });

      const firstMaha = timeline.periods[0];
      expect(firstMaha.lord).toBe("Saturn");
      expect(firstMaha.children).toBeDefined();
      expect(firstMaha.children).toHaveLength(9);

      // Sub-periods must start with Saturn and follow sequence
      expect(firstMaha.children![0].lord).toBe("Saturn");
      expect(firstMaha.children![1].lord).toBe("Mercury");
      expect(firstMaha.children![2].lord).toBe("Ketu");
      expect(firstMaha.children![3].lord).toBe("Venus");
      expect(firstMaha.children![4].lord).toBe("Sun");
      expect(firstMaha.children![5].lord).toBe("Moon");
      expect(firstMaha.children![6].lord).toBe("Mars");
      expect(firstMaha.children![7].lord).toBe("Rahu");
      expect(firstMaha.children![8].lord).toBe("Jupiter");
    });

    it("verifies mathematical conservation: SUM(children ms) === Parent duration ms", () => {
      const birthMs = Date.UTC(1995, 2, 10, 10, 30, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 215.0, // Anuradha (Saturn)
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });

      for (const maha of timeline.periods) {
        const issues = validateNestedPeriods(maha, maha.children!);
        expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
        const childrenSumMs = maha.children!.reduce(
          (sum, c) => sum + (c.endTimestampMs - c.startTimestampMs),
          0,
        );
        expect(childrenSumMs).toBe(maha.endTimestampMs - maha.startTimestampMs);
      }
    });

    it("generates Level 3 (Pratyantardasha) with exact continuity and conservation", () => {
      const birthMs = Date.UTC(1990, 0, 15, 6, 30, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 141.2967,
        birthTimestampMs: birthMs,
        depthLevels: 3,
      });

      const firstMaha = timeline.periods[0];
      const firstAntar = firstMaha.children![0];
      expect(firstAntar.children).toBeDefined();
      expect(firstAntar.children).toHaveLength(9);

      const pratSumMs = firstAntar.children!.reduce(
        (sum, p) => sum + (p.endTimestampMs - p.startTimestampMs),
        0,
      );
      expect(pratSumMs).toBe(firstAntar.endTimestampMs - firstAntar.startTimestampMs);
      expect(firstAntar.children![0].startTimestampMs).toBe(firstAntar.startTimestampMs);
      expect(firstAntar.children![8].endTimestampMs).toBe(firstAntar.endTimestampMs);
    });

    it("generates Level 4 (Sookshma) and Level 5 (Prana) on demand via getNestedPeriods", () => {
      const birthMs = Date.UTC(1990, 0, 15, 6, 30, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 141.2967,
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });

      const activeAntar = timeline.periods[0].children![0];
      // Generate Level 3
      const pratyantardashas = engine.getNestedPeriods(activeAntar, 3);
      expect(pratyantardashas).toHaveLength(9);

      // Generate Level 4 (Sookshma)
      const sookshmas = engine.getNestedPeriods(pratyantardashas[0], 4);
      expect(sookshmas).toHaveLength(9);
      const sookshmaSumMs = sookshmas.reduce(
        (sum, s) => sum + (s.endTimestampMs - s.startTimestampMs),
        0,
      );
      expect(sookshmaSumMs).toBe(
        pratyantardashas[0].endTimestampMs - pratyantardashas[0].startTimestampMs,
      );

      // Generate Level 5 (Prana)
      const pranas = engine.getNestedPeriods(sookshmas[0], 5);
      expect(pranas).toHaveLength(9);
      const pranaSumMs = pranas.reduce(
        (sum, p) => sum + (p.endTimestampMs - p.startTimestampMs),
        0,
      );
      expect(pranaSumMs).toBe(sookshmas[0].endTimestampMs - sookshmas[0].startTimestampMs);
    });
  });

  describe("4. Leap Years, Timezones & Date Conventions", () => {
    it("respects Gregorian solar year convention (365.2425 days)", () => {
      const msPerYear = getMsPerYear("gregorian_solar");
      expect(msPerYear).toBe(365.2425 * 86400 * 1000);
    });

    it("supports Savana year convention (360 civil days)", () => {
      const msPerYear = getMsPerYear("savana");
      expect(msPerYear).toBe(360 * 86400 * 1000);
    });

    it("maintains deterministic timestamps regardless of query local time zone", () => {
      const birthMs = Date.UTC(2005, 3, 14, 8, 45, 0);
      const timelineUTC = engine.calculateTimeline({
        moonSiderealLonDeg: 55.4,
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });

      const timelineRepeat = engine.calculateTimeline({
        moonSiderealLonDeg: 55.4,
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });

      expect(timelineUTC.periods[0].startTimestampMs).toBe(
        timelineRepeat.periods[0].startTimestampMs,
      );
      expect(timelineUTC.periods[0].endTimestampMs).toBe(timelineRepeat.periods[0].endTimestampMs);
      expect(timelineUTC.periods[0].children![0].startTimestampMs).toBe(
        timelineRepeat.periods[0].children![0].startTimestampMs,
      );
    });
  });

  describe("5. Validation Suite & Invariants", () => {
    it("passes all invariants on full timeline generation", () => {
      const birthMs = Date.UTC(1992, 7, 24, 18, 15, 0);
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: 88.5, // Punarvasu (Jupiter)
        birthTimestampMs: birthMs,
        depthLevels: 3,
      });

      const issues = validateTimeline(timeline);
      const errors = issues.filter((i) => i.severity === "error");
      expect(errors).toHaveLength(0);
    });
  });
});
