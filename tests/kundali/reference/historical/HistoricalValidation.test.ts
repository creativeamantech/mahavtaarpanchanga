import { describe, it, expect } from "vitest";
import { calculateKundliData } from "../../../../src/lib/kundliEngine";

describe("Reference Corpus — Historical Chart Verification Suite", () => {
  describe("1. Independence of India (Aug 15, 1947, 00:00 IST, New Delhi)", () => {
    it("matches the canonical Taurus Ascendant with stellium in Cancer", () => {
      const chart = calculateKundliData({
        name: "Indian Independence",
        year: 1947,
        month: 8,
        day: 15,
        hour: 0,
        minute: 0,
        second: 0,
        latitude: 28.6139,
        longitude: 77.209,
        timezone: "Asia/Kolkata",
        ayanamsaKey: "lahiri",
      });

      // Canonical Lagna: Taurus (Vrishabha = 1)
      expect(chart.lagna.signIndex).toBe(1);
      expect(chart.lagna.signNameEn).toBe("Taurus");

      // Canonical Rahu placement: Taurus (House 1)
      const rahu = chart.planets.find((p) => p.id === "Rahu");
      expect(rahu?.signIndex).toBe(1);

      // Canonical Cancer Stellium (House 3): Sun, Moon, Mercury, Venus, Saturn
      const sun = chart.planets.find((p) => p.id === "Sun");
      const moon = chart.planets.find((p) => p.id === "Moon");
      const mercury = chart.planets.find((p) => p.id === "Mercury");
      const venus = chart.planets.find((p) => p.id === "Venus");
      const saturn = chart.planets.find((p) => p.id === "Saturn");

      expect(sun?.signIndex).toBe(3); // Cancer
      expect(moon?.signIndex).toBe(3); // Cancer
      expect(mercury?.signIndex).toBe(3); // Cancer
      expect(venus?.signIndex).toBe(3); // Cancer
      expect(saturn?.signIndex).toBe(3); // Cancer

      // Moon in Pushya nakshatra (lord Saturn)
      expect(moon?.nakshatraNameEn).toBe("Pushya");
    });
  });

  describe("2. Swami Vivekananda (Jan 12, 1863, 06:33 IST, Kolkata)", () => {
    it("matches the canonical Sagittarius Ascendant with Sun in Ascendant", () => {
      const chart = calculateKundliData({
        name: "Swami Vivekananda",
        year: 1863,
        month: 1,
        day: 12,
        hour: 6,
        minute: 33,
        second: 0,
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: "Asia/Kolkata",
        ayanamsaKey: "lahiri",
      });

      // Sagittarius Lagna (8)
      expect(chart.lagna.signIndex).toBe(8);
      expect(chart.lagna.signNameEn).toBe("Sagittarius");

      // Sun also in Sagittarius (rising at dawn)
      const sun = chart.planets.find((p) => p.id === "Sun");
      expect(sun?.signIndex).toBe(8);
    });
  });

  describe("3. Dr. B.V. Raman (Aug 8, 1912, 19:38 IST, Bangalore)", () => {
    it("matches canonical Aquarius Ascendant (Kumbha Lagna)", () => {
      const chart = calculateKundliData({
        name: "Dr. B.V. Raman",
        year: 1912,
        month: 8,
        day: 8,
        hour: 19,
        minute: 38,
        second: 0,
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: "Asia/Kolkata",
        ayanamsaKey: "raman",
      });

      expect(chart.lagna.signIndex).toBe(10); // Aquarius
      expect(chart.lagna.signNameEn).toBe("Aquarius");
    });
  });
});
