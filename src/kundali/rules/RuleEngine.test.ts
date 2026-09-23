import { describe, it, expect } from "vitest";
import { RuleEngine } from "./RuleEngine";
import { RuleRegistry } from "./RuleRegistry";
import { RuleValidation } from "./RuleValidation";
import { CANONICAL_ASTROLOGY_RULES } from "./RuleMetadata";
import { GOLDEN_RULE_VECTORS } from "../../../tests/kundali/rules/GoldenRuleVectors";

describe("Phase 5: Classical Vedic Rule & Yoga Engine", () => {
  const engine = new RuleEngine();

  describe("Rule Metadata & Integrity", () => {
    it("ensures all canonical rules are valid and possess non-empty sources", () => {
      const allRules = RuleRegistry.getInstance().getAllRules();
      expect(allRules.length).toBeGreaterThanOrEqual(15);

      allRules.forEach((rule) => {
        const val = RuleValidation.validateRule(rule);
        expect(val.isValid).toBe(true);
        expect(rule.source).toBeTruthy();
        expect(rule.sourceReference).toBeTruthy();
        expect(rule.nameEn).toBeTruthy();
        expect(rule.nameHi).toBeTruthy();
        expect(rule.nameSa).toBeTruthy();
      });
    });

    it("verifies Pancha Mahapurusha rules exist with BPHS citations", () => {
      const mahapurushas = [
        "ruchaka_mahapurusha",
        "bhadra_mahapurusha",
        "hamsa_mahapurusha",
        "malavya_mahapurusha",
        "shasha_mahapurusha",
      ];

      mahapurushas.forEach((id) => {
        const r = RuleRegistry.getInstance().getRule(id);
        expect(r).toBeDefined();
        expect(r?.source).toContain("Brihat Parashara Hora Shastra");
        expect(r?.sourceReference).toContain("Adhyaya 75");
      });
    });
  });

  describe("Golden Rule Corpus Verification", () => {
    GOLDEN_RULE_VECTORS.forEach((vector) => {
      it(`evaluates golden test vector: ${vector.name} (${vector.id})`, () => {
        const results = engine.evaluateAll(vector.context);
        const resultMap = new Map(results.map((r) => [r.ruleId, r]));

        for (const [ruleId, expected] of Object.entries(vector.expectedRuleResults)) {
          const actual = resultMap.get(ruleId);
          expect(actual, `Rule ${ruleId} should be present in results`).toBeDefined();
          expect(
            actual?.status,
            `Expected ${ruleId} to have status ${expected.status}, got ${actual?.status}`,
          ).toBe(expected.status);

          if (expected.cancellationsTriggered) {
            expect(actual?.cancellationsTriggered).toEqual(
              expect.arrayContaining(expected.cancellationsTriggered),
            );
          }
        }
      });
    });
  });

  describe("Category-Specific Evaluations", () => {
    it("filters and evaluates only Mahapurusha yogas correctly", () => {
      const vector = GOLDEN_RULE_VECTORS[0];
      const mahapurushas = engine.evaluateCategory("Mahapurusha", vector.context);
      expect(mahapurushas.length).toBe(5);
      const activeIds = mahapurushas.filter((m) => m.status === "PRESENT").map((m) => m.ruleId);
      expect(activeIds).toContain("hamsa_mahapurusha");
      expect(activeIds).toContain("ruchaka_mahapurusha");
      expect(activeIds).toContain("shasha_mahapurusha");
      expect(activeIds).not.toContain("bhadra_mahapurusha");
    });

    it("filters and evaluates Viparita Raja yogas", () => {
      const viparitaVector = GOLDEN_RULE_VECTORS.find((v) => v.id === "vector_viparita_raja_yoga")!;
      const viparitaResults = engine.evaluateCategory("Viparita", viparitaVector.context);
      expect(viparitaResults.length).toBe(3);
      const active = viparitaResults.filter((v) => v.status === "PRESENT").map((v) => v.ruleId);
      expect(active).toContain("harsha_viparita_yoga");
      expect(active).toContain("sarala_viparita_yoga");
    });
  });

  describe("Dasha Activation Metadata", () => {
    it("correctly identifies Dasha lord participation without making predictions", () => {
      const vector = GOLDEN_RULE_VECTORS[0]; // Jupiter Maha, Mars Antar
      const results = engine.evaluateAll(vector.context);

      const hamsa = results.find((r) => r.ruleId === "hamsa_mahapurusha");
      expect(hamsa?.dashaActivation?.isActivatedByCurrentMaha).toBe(true);
      expect(hamsa?.dashaActivation?.activeMahadashaLord).toBe("Jupiter");

      const ruchaka = results.find((r) => r.ruleId === "ruchaka_mahapurusha");
      expect(ruchaka?.dashaActivation?.isActivatedByCurrentAntar).toBe(true);
      expect(ruchaka?.dashaActivation?.activeAntardashaLord).toBe("Mars");
    });
  });

  describe("Cancellation & Mitigation Engine", () => {
    it("mitigates Ruchaka when Mars is tightly combust by Sun", () => {
      const combustVector = GOLDEN_RULE_VECTORS.find(
        (v) => v.id === "vector_combustion_cancellation",
      )!;
      const res = engine.evaluateRule("ruchaka_mahapurusha", combustVector.context);
      expect(res?.status).toBe("PARTIAL");
      expect(res?.cancellationsTriggered.length).toBeGreaterThan(0);
      expect(res?.strengthFactors.some((f) => f.factor.includes("Combustion"))).toBe(true);
    });
  });
});
