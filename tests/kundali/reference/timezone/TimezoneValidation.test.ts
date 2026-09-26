import { describe, it, expect } from "vitest";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";

describe("Reference Corpus — Timezone & Temporal Boundary Validation Suite", () => {
  describe("1. Standard Indian Fractional Timezone (Asia/Kolkata +05:30)", () => {
    it("converts local 12:00:00 IST to exactly 06:30:00 UTC", () => {
      const tc = AstronomicalCore.createTimeContext(
        2024,
        5,
        1,
        12,
        0,
        0,
        "Asia/Kolkata",
      );

      const d = new Date(tc.utcMs);
      expect(d.getUTCHours()).toBe(6);
      expect(d.getUTCMinutes()).toBe(30);
      expect(d.getUTCSeconds()).toBe(0);
    });
  });

  describe("2. Non-Half-Hour Fractional Timezone (Asia/Kathmandu +05:45)", () => {
    it("converts local 12:00:00 NPT to exactly 06:15:00 UTC", () => {
      const tc = AstronomicalCore.createTimeContext(
        2024,
        5,
        1,
        12,
        0,
        0,
        "Asia/Kathmandu",
      );

      const d = new Date(tc.utcMs);
      expect(d.getUTCHours()).toBe(6);
      expect(d.getUTCMinutes()).toBe(15);
      expect(d.getUTCSeconds()).toBe(0);
    });
  });

  describe("3. US Daylight Saving Transition (America/New_York)", () => {
    it("converts EDT (Summer, UTC-4) accurately", () => {
      // July 15: EDT active (UTC - 4)
      const tc = AstronomicalCore.createTimeContext(
        2024,
        7,
        15,
        12,
        0,
        0,
        "America/New_York",
      );

      const d = new Date(tc.utcMs);
      expect(d.getUTCHours()).toBe(16); // 12 + 4 = 16 UTC
    });

    it("converts EST (Winter, UTC-5) accurately", () => {
      // January 15: EST active (UTC - 5)
      const tc = AstronomicalCore.createTimeContext(
        2024,
        1,
        15,
        12,
        0,
        0,
        "America/New_York",
      );

      const d = new Date(tc.utcMs);
      expect(d.getUTCHours()).toBe(17); // 12 + 5 = 17 UTC
    });
  });
});
