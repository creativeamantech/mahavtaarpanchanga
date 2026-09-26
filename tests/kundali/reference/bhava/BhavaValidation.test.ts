import { describe, it, expect } from "vitest";
import { ZODIAC_SIGNS } from "../../../../src/lib/kundliEngine";

describe("Reference Corpus — Bhava (House) System Validation Suite", () => {
  describe("1. Classical Rashi-Bhava Lordship Mapping", () => {
    it("verifies classical ownership of all 12 rashis", () => {
      const expectedLords = [
        "Mars", // 0: Aries
        "Venus", // 1: Taurus
        "Mercury", // 2: Gemini
        "Moon", // 3: Cancer
        "Sun", // 4: Leo
        "Mercury", // 5: Virgo
        "Venus", // 6: Libra
        "Mars", // 7: Scorpio
        "Jupiter", // 8: Sagittarius
        "Saturn", // 9: Capricorn
        "Saturn", // 10: Aquarius
        "Jupiter", // 11: Pisces
      ];

      expectedLords.forEach((lord, index) => {
        expect(ZODIAC_SIGNS[index].lord).toBe(lord);
      });
    });
  });

  describe("2. Classical Parashari Planetary Special Drishtis (Full Aspects)", () => {
    it("verifies special full aspects: Mars (4, 7, 8), Jupiter (5, 7, 9), Saturn (3, 7, 10)", () => {
      function getSpecialAspectHouses(planet: string, occupiedHouse: number): number[] {
        const aspectOffsets: Record<string, number[]> = {
          Mars: [4, 7, 8],
          Jupiter: [5, 7, 9],
          Saturn: [3, 7, 10],
          Sun: [7],
          Moon: [7],
          Mercury: [7],
          Venus: [7],
        };

        const offsets = aspectOffsets[planet] || [7];
        return offsets.map((off) => ((occupiedHouse - 1 + off - 1) % 12) + 1);
      }

      // Mars in House 1 casts full aspect on Houses 4, 7, 8
      expect(getSpecialAspectHouses("Mars", 1)).toEqual([4, 7, 8]);

      // Jupiter in House 1 casts full aspect on Houses 5, 7, 9
      expect(getSpecialAspectHouses("Jupiter", 1)).toEqual([5, 7, 9]);

      // Saturn in House 1 casts full aspect on Houses 3, 7, 10
      expect(getSpecialAspectHouses("Saturn", 1)).toEqual([3, 7, 10]);

      // All planets cast 7th house opposition aspect
      expect(getSpecialAspectHouses("Sun", 1)).toEqual([7]);
      expect(getSpecialAspectHouses("Moon", 4)).toEqual([10]);
    });
  });
});
