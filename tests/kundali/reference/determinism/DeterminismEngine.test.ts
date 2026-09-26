import { describe, it, expect } from "vitest";
import { calculateKundliData } from "../../../../src/lib/kundliEngine";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";
import { AyanamshaRegistry } from "../../../../src/kundali/astronomy/AyanamshaProvider";

describe("Reference Corpus — Determinism & State Isolation Suite", () => {
  const sampleInput = {
    name: "Determinism Test Native",
    year: 1995,
    month: 11,
    day: 23,
    hour: 7,
    minute: 30,
    second: 0,
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: "Asia/Kolkata",
    ayanamsaKey: "lahiri" as const,
  };

  it("verifies 100 repeated calculations yield 100% bit-identical results", () => {
    const firstRun = calculateKundliData(sampleInput);
    const baselineFingerprint = JSON.stringify({
      lagna: firstRun.lagna.longitude,
      navamshaLagna: firstRun.navamshaLagna.signIndex,
      planets: firstRun.planets.map((p) => ({
        id: p.id,
        lon: p.longitude,
        sign: p.signIndex,
        deg: p.degreeInSign,
        speed: p.speed,
        retro: p.isRetrograde,
        dignity: p.dignity,
      })),
      dashaBalance: firstRun.vimshottari.balanceAtBirth,
    });

    for (let i = 0; i < 100; i++) {
      const run = calculateKundliData(sampleInput);
      const runFingerprint = JSON.stringify({
        lagna: run.lagna.longitude,
        navamshaLagna: run.navamshaLagna.signIndex,
        planets: run.planets.map((p) => ({
          id: p.id,
          lon: p.longitude,
          sign: p.signIndex,
          deg: p.degreeInSign,
          speed: p.speed,
          retro: p.isRetrograde,
          dignity: p.dignity,
        })),
        dashaBalance: run.vimshottari.balanceAtBirth,
      });

      expect(runFingerprint, `Run #${i + 1} diverged from baseline`).toBe(baselineFingerprint);
    }
  });

  it(
    "verifies 1,000 repeated calculations maintain absolute determinism (no mutable state leak)",
    { timeout: 15000 },
    () => {
      const baseline = calculateKundliData(sampleInput);
      const baselineLagnaLon = baseline.lagna.longitude;
      const baselineSunLon = baseline.planets.find((p) => p.id === "Sun")?.longitude;

      for (let i = 0; i < 1000; i++) {
        const result = calculateKundliData(sampleInput);
        expect(result.lagna.longitude).toBe(baselineLagnaLon);
        expect(result.planets.find((p) => p.id === "Sun")?.longitude).toBe(baselineSunLon);
      }
    },
  );

  it(
    "verifies 5,000 repeated calculations under high throughput with 0 state divergence",
    { timeout: 15000 },
    () => {
      const t = Astronomy.MakeTime(new Date("1995-11-23T02:00:00Z"));
      const baselineMoon = AstronomicalCore.calculatePlanetaryPosition("Moon", t);
      const baselineAyanamsa = AyanamshaRegistry.calculate("lahiri", t);

      let matchCount = 0;
      for (let i = 0; i < 5000; i++) {
        const result = AstronomicalCore.calculatePlanetaryPosition("Moon", t);
        const ayanamsa = AyanamshaRegistry.calculate("lahiri", t);
        if (
          result.tropicalLongitude === baselineMoon.tropicalLongitude &&
          ayanamsa === baselineAyanamsa
        ) {
          matchCount++;
        }
      }

      expect(matchCount).toBe(5000);
    },
  );
});
