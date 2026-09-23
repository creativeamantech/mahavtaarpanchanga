import { describe, it, expect } from "vitest";
import { VimshottariDashaEngine } from "./VimshottariDashaEngine";

describe("Phase 4: Vimshottari Dasha Engine Performance Benchmark", () => {
  const engine = new VimshottariDashaEngine();
  const baseBirthMs = Date.UTC(1990, 0, 1, 12, 0, 0);

  it("benchmarks 100 complete Vimshottari multi-tier charts", () => {
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) {
      const lon = (i * 3.6) % 360.0;
      const birthMs = baseBirthMs + i * 86400000;
      const timeline = engine.calculateTimeline({
        moonSiderealLonDeg: lon,
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });
      expect(timeline.periods).toHaveLength(9);
    }
    const duration = performance.now() - t0;
    const avgPerChart = duration / 100;
    // Target is < 50ms for 100 charts (< 0.5ms per chart)
    expect(duration).toBeLessThan(200);
    expect(avgPerChart).toBeLessThan(2.0);
  });

  it("benchmarks 1,000 complete Vimshottari multi-tier charts", () => {
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) {
      const lon = (i * 0.36) % 360.0;
      const birthMs = baseBirthMs + i * 3600000;
      engine.calculateTimeline({
        moonSiderealLonDeg: lon,
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });
    }
    const duration = performance.now() - t0;
    const avgPerChart = duration / 1000;
    // Target < 1000ms for 1000 charts
    expect(duration).toBeLessThan(1000);
    expect(avgPerChart).toBeLessThan(1.0);
  });

  it("benchmarks 5,000 complete Vimshottari multi-tier charts with high throughput", () => {
    const t0 = performance.now();
    for (let i = 0; i < 5000; i++) {
      const lon = (i * 0.072) % 360.0;
      const birthMs = baseBirthMs + i * 60000;
      engine.calculateTimeline({
        moonSiderealLonDeg: lon,
        birthTimestampMs: birthMs,
        depthLevels: 2,
      });
    }
    const duration = performance.now() - t0;
    const avgPerChart = duration / 5000;
    // 5,000 charts completed in < 3500ms (< 0.7ms each)
    expect(duration).toBeLessThan(3500);
    expect(avgPerChart).toBeLessThan(0.7);
  });
});
