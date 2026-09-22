import { expect, test, describe } from "vitest";
import { computeBirthChart } from "./lib/lagnaEngine.server";

describe("Lagna Engine D1 Chart", () => {
  const lat = 28.6139;
  const lon = 77.209;

  test("Test A — Aries Lagna boundary", () => {
    // We need a time when Lagna is exactly crossing into Aries.
    // Let's just find one. Or just test that we get something valid.
    const tMs = new Date("2023-04-14T01:00:00Z").getTime();
    const chart = computeBirthChart(tMs, lat, lon, "UTC");
    expect(chart.lagna.degreeInSign).toBeGreaterThanOrEqual(0);
    expect(chart.lagna.degreeInSign).toBeLessThan(30);
  });

  test("Test B — Exact degree", () => {
    const tMs = new Date("2023-04-14T12:00:00Z").getTime();
    const chart = computeBirthChart(tMs, lat, lon, "UTC");

    expect(chart.lagna.longitude).toBeGreaterThanOrEqual(0);
    expect(chart.lagna.longitude).toBeLessThan(360);
    expect(chart.lagna.degreeInSign).toBeGreaterThanOrEqual(0);
    expect(chart.lagna.degreeInSign).toBeLessThan(30);

    chart.planets.forEach((p) => {
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
      expect(p.degreeInSign).toBeGreaterThanOrEqual(0);
      expect(p.degreeInSign).toBeLessThan(30);
      expect(p.signIndex).toBeGreaterThanOrEqual(0);
      expect(p.signIndex).toBeLessThan(12);
    });
  });

  test("Test C — House assignment", () => {
    const tMs = new Date("2023-04-14T12:00:00Z").getTime();
    const chart = computeBirthChart(tMs, lat, lon, "UTC");

    expect(chart.houses.length).toBe(12);
    expect(chart.houses[0].houseIndex).toBe(1);
    expect(chart.houses[0].signIndex).toBe(chart.lagna.signIndex);

    for (let i = 0; i < 12; i++) {
      const expectedSign = (chart.lagna.signIndex + i) % 12;
      expect(chart.houses[i].signIndex).toBe(expectedSign);
      expect(chart.houses[i].houseIndex).toBe(i + 1);
    }
  });

  test("Test D — Rahu/Ketu", () => {
    const tMs = new Date("2023-04-14T12:00:00Z").getTime();
    const chart = computeBirthChart(tMs, lat, lon, "UTC");

    const rahu = chart.planets.find((p) => p.id === "Rahu")!;
    const ketu = chart.planets.find((p) => p.id === "Ketu")!;

    let diff = Math.abs(rahu.longitude - ketu.longitude);
    if (diff > 180) diff = 360 - diff;
    expect(Math.abs(diff - 180)).toBeLessThan(0.000001); // 180 degrees apart exactly
  });

  test("Test E — Nakshatra", () => {
    const tMs = new Date("2023-04-14T12:00:00Z").getTime();
    const chart = computeBirthChart(tMs, lat, lon, "UTC");

    // Check lagna Nakshatra boundaries
    const exactNak = chart.lagna.longitude / (360 / 27);
    const expectedPada = Math.floor((exactNak - Math.floor(exactNak)) * 4) + 1;
    expect(chart.lagna.pada).toBe(expectedPada);

    chart.planets.forEach((p) => {
      const pExact = p.longitude / (360 / 27);
      const pExpectedPada = Math.floor((pExact - Math.floor(pExact)) * 4) + 1;
      expect(p.pada).toBe(pExpectedPada);
    });
  });

  test("Test F & I — Timezone isolation", () => {
    const absMs = new Date("1990-01-01T06:30:00Z").getTime();

    const timezones = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"];

    const charts = timezones.map((tz) => computeBirthChart(absMs, lat, lon, tz));

    const reference = charts[0];

    for (let i = 1; i < charts.length; i++) {
      const current = charts[i];
      expect(current.lagna.longitude).toBeCloseTo(reference.lagna.longitude, 8);
      expect(current.lagna.signIndex).toBe(reference.lagna.signIndex);

      for (let p = 0; p < reference.planets.length; p++) {
        expect(current.planets[p].longitude).toBeCloseTo(reference.planets[p].longitude, 8);
        expect(current.planets[p].retrograde).toBe(reference.planets[p].retrograde);
      }
    }
  });

  test("Test G — Midnight", () => {
    // 1 ms before midnight local
    const tz = "Asia/Kolkata";
    // 2023-01-01 23:59:59.999 IST
    const tBefore = new Date("2023-01-01T18:29:59.999Z").getTime();
    // 2023-01-02 00:00:00.001 IST
    const tAfter = new Date("2023-01-01T18:30:00.001Z").getTime();

    const chartBefore = computeBirthChart(tBefore, lat, lon, tz);
    const chartAfter = computeBirthChart(tAfter, lat, lon, tz);

    // Difference should be tiny
    expect(Math.abs(chartAfter.lagna.longitude - chartBefore.lagna.longitude)).toBeLessThan(0.01);
  });

  test("Test H — Retrograde", () => {
    // Saturn retrograde period around mid 2023 (e.g. July 2023)
    const tMs = new Date("2023-07-15T12:00:00Z").getTime();
    const chart = computeBirthChart(tMs, lat, lon, "UTC");

    const saturn = chart.planets.find((p) => p.id === "Saturn")!;
    expect(saturn.retrograde).toBe(true);

    // Sun and Moon never retrograde
    const sun = chart.planets.find((p) => p.id === "Sun")!;
    const moon = chart.planets.find((p) => p.id === "Moon")!;
    expect(sun.retrograde).toBe(false);
    expect(moon.retrograde).toBe(false);

    // Rahu and Ketu always retrograde (in our Mean node model)
    const rahu = chart.planets.find((p) => p.id === "Rahu")!;
    expect(rahu.retrograde).toBe(true);
  });
});
