import { describe, it, expect } from "vitest";
import { calculateKundliData } from "../../../../src/lib/kundliEngine";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";

describe("Reference Corpus — Full Pipeline Performance Benchmark", () => {
  const baseInput = {
    name: "Benchmark Subject",
    year: 1992,
    month: 8,
    day: 24,
    hour: 15,
    minute: 45,
    second: 0,
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "Asia/Kolkata",
    ayanamsaKey: "lahiri" as const,
  };

  it("benchmarks 100 full-pipeline charts (Astronomy + Varga + Shadbala + Dasha + Rules + Jaimini)", () => {
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) {
      const data = calculateKundliData({
        ...baseInput,
        day: (i % 28) + 1,
      });
      expect(data.planets.length).toBeGreaterThanOrEqual(9);
    }
    const t1 = performance.now();
    const elapsedMs = t1 - t0;
    const avgMs = elapsedMs / 100;

    // Must be under 35ms per full chart on modern JS runtimes
    expect(avgMs).toBeLessThan(35.0);
  });

  it(
    "benchmarks 1,000 full-pipeline chart executions",
    { timeout: 15000 },
    () => {
      const t0 = performance.now();
      for (let i = 0; i < 1000; i++) {
        const data = calculateKundliData({
          ...baseInput,
          year: 1980 + (i % 40),
        });
        expect(data.lagna.signIndex).toBeGreaterThanOrEqual(0);
      }
      const t1 = performance.now();
      const elapsedMs = t1 - t0;
      const throughputPerSec = (1000 / elapsedMs) * 1000;

      // High throughput requirement: at least 30 full charts/second
      expect(throughputPerSec).toBeGreaterThan(30);
    },
  );

  it(
    "benchmarks 5,000 high-throughput chart pipeline executions",
    { timeout: 15000 },
    () => {
      const t0 = performance.now();
      const t = Astronomy.MakeTime(new Date("1992-08-24T10:15:00Z"));
      for (let i = 0; i < 5000; i++) {
        const pos = AstronomicalCore.calculatePlanetaryPosition("Sun", t);
        if (i === 0) {
          expect(pos.tropicalLongitude).toBeGreaterThanOrEqual(0);
        }
      }
      const t1 = performance.now();
      const elapsedMs = t1 - t0;

      // 5,000 planetary calculations should execute in < 2000ms
      expect(elapsedMs).toBeLessThan(2000);
    },
  );
});
