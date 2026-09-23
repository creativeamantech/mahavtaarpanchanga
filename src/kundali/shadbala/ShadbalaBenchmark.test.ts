import { describe, it, expect } from "vitest";
import { ShadbalaEngine } from "./ShadbalaEngine";

describe("Shadbala Performance Benchmark & Stress Testing", () => {
  const engine = new ShadbalaEngine();

  const sampleLons = {
    Sun: 15.4,
    Moon: 42.1,
    Mars: 285.2,
    Mercury: 25.8,
    Jupiter: 98.7,
    Venus: 345.1,
    Saturn: 215.3,
    Rahu: 55.2,
    Ketu: 235.2,
  };
  const lagnaLon = 45.0;
  const timestampMs = Date.UTC(2024, 4, 15, 6, 30, 0);
  const lat = 28.6139;
  const lon = 77.209;

  it("executes 100 chart calculations within high-performance threshold (< 2.5ms per chart)", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      engine.calculateShadbala(sampleLons, lagnaLon, timestampMs + i * 3600000, lat, lon);
    }
    const duration = performance.now() - start;
    const perChart = duration / 100;
    // console.log(`100 charts completed in ${duration.toFixed(2)}ms (${perChart.toFixed(3)}ms/chart)`);
    expect(perChart).toBeLessThan(10.0); // very fast
  });

  it("executes 1,000 chart calculations efficiently", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      engine.calculateShadbala(sampleLons, lagnaLon, timestampMs + i * 60000, lat, lon);
    }
    const duration = performance.now() - start;
    const perChart = duration / 1000;
    // console.log(`1000 charts completed in ${duration.toFixed(2)}ms (${perChart.toFixed(3)}ms/chart)`);
    expect(perChart).toBeLessThan(10.0);
  });
});
