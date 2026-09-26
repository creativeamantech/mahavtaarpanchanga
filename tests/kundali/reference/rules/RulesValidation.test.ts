import { describe, it, expect } from "vitest";
import { RuleEngine } from "../../../../src/kundali/rules/RuleEngine";
import { createMockContext } from "../../rules/GoldenRuleVectors";

describe("Reference Corpus — Parashari Rule & Yoga Validation Suite", () => {
  const engine = new RuleEngine();

  // Helper to evaluate a specific rule on a mock context
  function evaluateRule(
    ruleId: string,
    params: Parameters<typeof createMockContext>[0],
  ) {
    const ctx = createMockContext(params);
    const results = engine.evaluateAll(ctx);
    return results.find((r) => r.ruleId === ruleId);
  }

  describe("1. Pancha Mahapurusha Yogas (5 Core Rules)", () => {
    // 1. Ruchaka (Mars)
    it("Ruchaka: Positive (Mars in Aries H1), Negative (Mars in Taurus H1), Cancellation (Combust Sun)", () => {
      // Positive: Mars in Aries (sign 0), 1st House (Kendra)
      const pos = evaluateRule("ruchaka_mahapurusha", {
        lagnaSign: 0,
        moonSign: 3,
        planets: [{ id: "Mars", sign: 0, house: 1, deg: 10 }],
      });
      expect(pos?.status).toBe("PRESENT");

      // Negative: Mars in Taurus (sign 1, not own/exalted) in 1st house
      const neg = evaluateRule("ruchaka_mahapurusha", {
        lagnaSign: 1,
        moonSign: 3,
        planets: [{ id: "Mars", sign: 1, house: 1, deg: 10 }],
      });
      expect(neg?.status).toBe("ABSENT");

      // Cancellation: Mars within 3° of Sun -> triggers mitigation / cancellation
      const canc = evaluateRule("ruchaka_mahapurusha", {
        lagnaSign: 0,
        moonSign: 3,
        planets: [
          { id: "Mars", sign: 0, house: 1, deg: 10 },
          { id: "Sun", sign: 0, house: 1, deg: 11.5 },
        ],
      });
      expect(["CANCELLED", "PARTIAL"]).toContain(canc?.status);
      expect(canc?.cancellationsTriggered?.length).toBeGreaterThan(0);
    });

    // 2. Bhadra (Mercury)
    it("Bhadra: Positive (Mercury in Gemini H4), Negative (H6 Dusthana), Cancellation (Sun tight combustion)", () => {
      const pos = evaluateRule("bhadra_mahapurusha", {
        lagnaSign: 11, // Pisces Lagna -> Gemini is H4 (Kendra)
        moonSign: 3,
        planets: [{ id: "Mercury", sign: 2, house: 4, deg: 12 }],
      });
      expect(pos?.status).toBe("PRESENT");

      const neg = evaluateRule("bhadra_mahapurusha", {
        lagnaSign: 9, // Capricorn -> Gemini is H6 (Trika)
        moonSign: 3,
        planets: [{ id: "Mercury", sign: 2, house: 6, deg: 12 }],
      });
      expect(neg?.status).toBe("ABSENT");

      const canc = evaluateRule("bhadra_mahapurusha", {
        lagnaSign: 11,
        moonSign: 3,
        planets: [
          { id: "Mercury", sign: 2, house: 4, deg: 12 },
          { id: "Sun", sign: 2, house: 4, deg: 13 },
        ],
      });
      expect(["CANCELLED", "PARTIAL"]).toContain(canc?.status);
      expect(canc?.cancellationsTriggered?.length).toBeGreaterThan(0);
    });

    // 3. Hamsa (Jupiter)
    it("Hamsa: Positive (Jupiter in Cancer H1), Negative (Jupiter in Leo H1)", () => {
      const pos = evaluateRule("hamsa_mahapurusha", {
        lagnaSign: 3, // Cancer
        moonSign: 0,
        planets: [{ id: "Jupiter", sign: 3, house: 1, deg: 5 }],
      });
      expect(pos?.status).toBe("PRESENT");

      const neg = evaluateRule("hamsa_mahapurusha", {
        lagnaSign: 4, // Leo
        moonSign: 0,
        planets: [{ id: "Jupiter", sign: 4, house: 1, deg: 5 }],
      });
      expect(neg?.status).toBe("ABSENT");
    });

    // 4. Malavya (Venus)
    it("Malavya: Positive (Venus in Pisces H10), Negative (Venus in Aries H10)", () => {
      const pos = evaluateRule("malavya_mahapurusha", {
        lagnaSign: 2, // Gemini -> Pisces is H10
        moonSign: 0,
        planets: [{ id: "Venus", sign: 11, house: 10, deg: 27 }],
      });
      expect(pos?.status).toBe("PRESENT");

      const neg = evaluateRule("malavya_mahapurusha", {
        lagnaSign: 3, // Cancer -> Aries is H10
        moonSign: 0,
        planets: [{ id: "Venus", sign: 0, house: 10, deg: 15 }],
      });
      expect(neg?.status).toBe("ABSENT");
    });

    // 5. Shasha (Saturn)
    it("Shasha: Positive (Saturn in Libra H7), Negative (Saturn in Scorpio H7)", () => {
      const pos = evaluateRule("shasha_mahapurusha", {
        lagnaSign: 0, // Aries -> Libra is H7
        moonSign: 1,
        planets: [{ id: "Saturn", sign: 6, house: 7, deg: 20 }],
      });
      expect(pos?.status).toBe("PRESENT");

      const neg = evaluateRule("shasha_mahapurusha", {
        lagnaSign: 1, // Taurus -> Scorpio is H7
        moonSign: 1,
        planets: [{ id: "Saturn", sign: 7, house: 7, deg: 20 }],
      });
      expect(neg?.status).toBe("ABSENT");
    });
  });

  describe("2. Major Solar, Lunar & Planetary Combinations", () => {
    // 6. Gajakesari
    it("Gajakesari: Positive (Jupiter in H4 from Moon), Negative (Jupiter in H6 from Moon), Cancellation (Debilitated)", () => {
      // Moon in Aries (0), Jupiter in Cancer (3) -> H4 from Moon
      const pos = evaluateRule("gajakesari_yoga", {
        lagnaSign: 0,
        moonSign: 0,
        planets: [
          { id: "Moon", sign: 0, house: 1, deg: 15 },
          { id: "Jupiter", sign: 3, house: 4, deg: 15 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");

      // Jupiter in Virgo (5) -> H6 from Moon
      const neg = evaluateRule("gajakesari_yoga", {
        lagnaSign: 0,
        moonSign: 0,
        planets: [
          { id: "Moon", sign: 0, house: 1, deg: 15 },
          { id: "Jupiter", sign: 5, house: 6, deg: 15 },
        ],
      });
      expect(neg?.status).toBe("ABSENT");

      // Cancellation: Jupiter in Capricorn (9, debilitated)
      const canc = evaluateRule("gajakesari_yoga", {
        lagnaSign: 0,
        moonSign: 9, // Moon in Capricorn
        planets: [
          { id: "Moon", sign: 9, house: 10, deg: 10 },
          { id: "Jupiter", sign: 9, house: 10, deg: 5, dignity: "debilitated" },
        ],
      });
      expect(["CANCELLED", "PARTIAL"]).toContain(canc?.status);
      expect(canc?.cancellationsTriggered?.length).toBeGreaterThan(0);
    });

    // 7. Budhaditya
    it("Budhaditya: Positive (Sun + Mercury in H1), Negative (Different houses), Cancellation (Combustion < 3°)", () => {
      // Positive: Sun at 10°, Mercury at 15° (sep = 5°)
      const pos = evaluateRule("budhaditya_yoga", {
        lagnaSign: 0,
        moonSign: 1,
        planets: [
          { id: "Sun", sign: 0, house: 1, deg: 10 },
          { id: "Mercury", sign: 0, house: 1, deg: 15 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");

      // Negative: Sun in H1, Mercury in H2
      const neg = evaluateRule("budhaditya_yoga", {
        lagnaSign: 0,
        moonSign: 1,
        planets: [
          { id: "Sun", sign: 0, house: 1, deg: 10 },
          { id: "Mercury", sign: 1, house: 2, deg: 15 },
        ],
      });
      expect(neg?.status).toBe("ABSENT");

      // Cancellation: Sun at 10°, Mercury at 11.5° (sep = 1.5° < 3°)
      const canc = evaluateRule("budhaditya_yoga", {
        lagnaSign: 0,
        moonSign: 1,
        planets: [
          { id: "Sun", sign: 0, house: 1, deg: 10 },
          { id: "Mercury", sign: 0, house: 1, deg: 11.5 },
        ],
      });
      expect(["CANCELLED", "PARTIAL"]).toContain(canc?.status);
      expect(canc?.cancellationsTriggered?.length).toBeGreaterThan(0);
    });

    // 8. Chandra-Mangala
    it("Chandra-Mangala: Positive (Moon + Mars conjoined), Negative (No aspect)", () => {
      const pos = evaluateRule("chandra_mangala_yoga", {
        lagnaSign: 0,
        moonSign: 1,
        planets: [
          { id: "Moon", sign: 1, house: 2, deg: 10 },
          { id: "Mars", sign: 1, house: 2, deg: 18 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");

      const neg = evaluateRule("chandra_mangala_yoga", {
        lagnaSign: 0,
        moonSign: 1,
        planets: [
          { id: "Moon", sign: 1, house: 2, deg: 10 },
          { id: "Mars", sign: 3, house: 4, deg: 18 },
        ],
      });
      expect(neg?.status).toBe("ABSENT");
    });
  });

  describe("3. Raja Yoga & Dhana Yoga Foundations", () => {
    // 9. Kendra-Trikona Lord Raja Yoga
    it("Kendra-Trikona Raja Yoga: Positive (H1 lord + H5 lord conjoined)", () => {
      // Aries Lagna: H1 lord = Mars, H5 lord = Sun. Mars & Sun conjoined in H1
      const pos = evaluateRule("kendra_trikona_raja_yoga", {
        lagnaSign: 0,
        moonSign: 2,
        planets: [
          { id: "Mars", sign: 0, house: 1, deg: 10 },
          { id: "Sun", sign: 0, house: 1, deg: 20 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");
    });

    // 10. Dhana Yoga (2nd & 11th Lords)
    it("Dhana Yoga: Positive (2nd lord + 11th lord in H11)", () => {
      // Aries Lagna: 2nd lord = Venus, 11th lord = Saturn. Both in H11 (Aquarius)
      const pos = evaluateRule("dhana_yoga_2_11", {
        lagnaSign: 0,
        moonSign: 2,
        planets: [
          { id: "Venus", sign: 10, house: 11, deg: 10 },
          { id: "Saturn", sign: 10, house: 11, deg: 20 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");
    });
  });

  describe("4. Viparita, Neechabhanga & Guru-Chandal Yogas", () => {
    // 11. Viparita Raja Yoga (Harsha)
    it("Viparita Raja Yoga (Harsha): Positive (6th lord in 8th house)", () => {
      // Aries Lagna: 6th lord = Mercury. Placed in 8th house (Scorpio)
      const pos = evaluateRule("harsha_viparita_yoga", {
        lagnaSign: 0,
        moonSign: 2,
        planets: [{ id: "Mercury", sign: 7, house: 8, deg: 15 }],
      });
      expect(pos?.status).toBe("PRESENT");
    });

    // 12. Neechabhanga (Dispositor in Kendra)
    it("Neechabhanga: Positive (Debilitated Sun in Libra H7, dispositor Venus in Kendra H1)", () => {
      const pos = evaluateRule("neechabhanga_dispositor_kendra", {
        lagnaSign: 0,
        moonSign: 0,
        planets: [
          { id: "Sun", sign: 6, house: 7, deg: 10, dignity: "debilitated" },
          { id: "Venus", sign: 0, house: 1, deg: 15 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");
    });

    // 13. Guru-Chandal Yoga
    it("Guru-Chandal Yoga: Positive (Jupiter + Rahu conjoined in H9)", () => {
      const pos = evaluateRule("guru_chandal_yoga", {
        lagnaSign: 0,
        moonSign: 0,
        planets: [
          { id: "Jupiter", sign: 8, house: 9, deg: 12 },
          { id: "Rahu", sign: 8, house: 9, deg: 14 },
        ],
      });
      expect(pos?.status).toBe("PRESENT");
    });
  });
});
