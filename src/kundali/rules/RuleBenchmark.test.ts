import { describe, it, expect } from "vitest";
import { RuleEngine } from "./RuleEngine";
import { GOLDEN_RULE_VECTORS } from "../../../tests/kundali/rules/GoldenRuleVectors";

describe("Phase 5: Rule Engine Performance & Stress Testing", () => {
  const engine = new RuleEngine();
  const context = GOLDEN_RULE_VECTORS[0].context;

  it("benchmarks 100 complete chart rule evaluations", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const results = engine.evaluateAll(context);
      expect(results.length).toBeGreaterThanOrEqual(15);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(300); // Target < 300ms for 100 charts
  });

  it("benchmarks 1,000 complete chart rule evaluations", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const results = engine.evaluateAll(context);
      expect(results.length).toBeGreaterThanOrEqual(15);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1200); // Target < 1200ms for 1,000 charts
  });

  it("benchmarks 5,000 complete chart rule evaluations with high throughput", () => {
    const start = performance.now();
    for (let i = 0; i < 5000; i++) {
      const results = engine.evaluateAll(context);
      expect(results.length).toBeGreaterThanOrEqual(15);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(4000); // Target < 4000ms for 5,000 charts
  });
});
