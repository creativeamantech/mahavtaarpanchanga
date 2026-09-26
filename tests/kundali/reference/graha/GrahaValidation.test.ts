import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";
import { getPlanetDignity } from "../../../../src/lib/kundliEngine";

describe("Reference Corpus — Graha Validation Suite", () => {
  const J2000_TIME = Astronomy.MakeTime(new Date("2000-01-01T12:00:00Z"));

  describe("1. Classical Exaltation & Debilitation Dignity Anchors", () => {
    it("Sun: Aries (0) exalted, Libra (6) debilitated", () => {
      expect(getPlanetDignity("Sun", 0, 10.0).dignity).toBe("exalted");
      expect(getPlanetDignity("Sun", 6, 10.0).dignity).toBe("debilitated");
    });

    it("Moon: Taurus (1) exalted, Scorpio (7) debilitated", () => {
      expect(getPlanetDignity("Moon", 1, 3.0).dignity).toBe("exalted");
      expect(getPlanetDignity("Moon", 7, 3.0).dignity).toBe("debilitated");
    });

    it("Mars: Capricorn (9) exalted, Cancer (3) debilitated", () => {
      expect(getPlanetDignity("Mars", 9, 28.0).dignity).toBe("exalted");
      expect(getPlanetDignity("Mars", 3, 28.0).dignity).toBe("debilitated");
    });

    it("Jupiter: Cancer (3) exalted, Capricorn (9) debilitated", () => {
      expect(getPlanetDignity("Jupiter", 3, 5.0).dignity).toBe("exalted");
      expect(getPlanetDignity("Jupiter", 9, 5.0).dignity).toBe("debilitated");
    });

    it("Venus: Pisces (11) exalted, Virgo (5) debilitated", () => {
      expect(getPlanetDignity("Venus", 11, 27.0).dignity).toBe("exalted");
      expect(getPlanetDignity("Venus", 5, 27.0).dignity).toBe("debilitated");
    });

    it("Saturn: Libra (6) exalted, Aries (0) debilitated", () => {
      expect(getPlanetDignity("Saturn", 6, 20.0).dignity).toBe("exalted");
      expect(getPlanetDignity("Saturn", 0, 20.0).dignity).toBe("debilitated");
    });
  });

  describe("2. Planetary Motion & Orbit Continuity", () => {
    it("ensures Sun and Moon speeds are always positive (direct motion)", () => {
      const dates = [
        "1980-01-01T00:00:00Z",
        "2000-06-15T00:00:00Z",
        "2024-03-21T00:00:00Z",
        "2040-12-31T00:00:00Z",
      ];

      dates.forEach((d) => {
        const t = Astronomy.MakeTime(new Date(d));
        const sun = AstronomicalCore.calculatePlanetaryPosition("Sun", t);
        const moon = AstronomicalCore.calculatePlanetaryPosition("Moon", t);

        expect(sun.speedDegPerDay).toBeGreaterThan(0.9); // ~0.95 to 1.02 deg/day
        expect(sun.speedDegPerDay).toBeLessThan(1.1);
        expect(sun.isRetrograde).toBe(false);

        expect(moon.speedDegPerDay).toBeGreaterThan(11.0); // ~11.8 to 15.2 deg/day
        expect(moon.speedDegPerDay).toBeLessThan(16.0);
        expect(moon.isRetrograde).toBe(false);
      });
    });
  });
});
