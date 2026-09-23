import { describe, it, expect } from "vitest";
import { JaiminiEngine } from "./JaiminiEngine";
import { GOLDEN_JAIMINI_VECTORS } from "../../../tests/kundali/jaimini/GoldenJaiminiVectors";

describe("Phase 6: Jaimini Engine Performance Benchmark", () => {
  const engine = new JaiminiEngine();
  const v = GOLDEN_JAIMINI_VECTORS[0];
  const birthMs = Date.UTC(1995, 4, 15, 6, 30, 0);

  it("benchmarks 100 Jaimini chart calculations (< 100ms)", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      engine.calculateJaiminiProfile(
        v.planetsD1,
        v.housesD1,
        v.lagnaD1Sign,
        v.lagnaD9Sign,
        v.planetsD9,
        birthMs,
      );
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it("benchmarks 1,000 Jaimini chart calculations (< 400ms)", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      engine.calculateJaiminiProfile(
        v.planetsD1,
        v.housesD1,
        v.lagnaD1Sign,
        v.lagnaD9Sign,
        v.planetsD9,
        birthMs,
      );
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(400);
  });

  it("benchmarks 5,000 Jaimini chart calculations with high throughput", () => {
    const start = performance.now();
    for (let i = 0; i < 5000; i++) {
      engine.calculateJaiminiProfile(
        v.planetsD1,
        v.housesD1,
        v.lagnaD1Sign,
        v.lagnaD9Sign,
        v.planetsD9,
        birthMs,
      );
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1500);
  });
});
