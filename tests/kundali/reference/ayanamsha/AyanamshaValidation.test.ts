import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AyanamshaRegistry } from "../../../../src/kundali/astronomy/AyanamshaProvider";

interface AyanamshaCorpusEntry {
  systemKey: string;
  name: string;
  epochDate: string;
  expectedDeg: number;
  toleranceDeg: number;
  source: string;
  citation: string;
}

const AYANAMSHA_CORPUS: AyanamshaCorpusEntry[] = [
  {
    systemKey: "lahiri",
    name: "Lahiri (Chitrapaksha)",
    epochDate: "2000-01-01T12:00:00Z",
    expectedDeg: 23.857092,
    toleranceDeg: 0.0001,
    source: "Calendar Reform Committee (Govt of India, 1955)",
    citation: "Report of the Calendar Reform Committee / Indian Astronomical Ephemeris",
  },
  {
    systemKey: "lahiri",
    name: "Lahiri (Chitrapaksha)",
    epochDate: "1900-01-01T12:00:00Z",
    expectedDeg: 22.4604,
    toleranceDeg: 0.01,
    source: "Positional Astronomy Centre Historical Tables",
    citation: "IAE Centennial Tables (1900-2000)",
  },
  {
    systemKey: "raman",
    name: "B.V. Raman",
    epochDate: "2000-01-01T12:00:00Z",
    expectedDeg: 22.390425,
    toleranceDeg: 0.001,
    source: "Dr. B.V. Raman Manual of Hindu Astrology",
    citation: "Raman Publications, Bangalore (1°28' Lahiri offset)",
  },
  {
    systemKey: "krishnamurti",
    name: "Krishnamurti (KP)",
    epochDate: "2000-01-01T12:00:00Z",
    expectedDeg: 23.759036,
    toleranceDeg: 0.001,
    source: "KP Reader I (Prof. K.S. Krishnamurti)",
    citation: "KP Reader Vol 1: Casting the Horoscope",
  },
  {
    systemKey: "sayana",
    name: "Sayana (Tropical Zero)",
    epochDate: "2024-04-14T00:00:00Z",
    expectedDeg: 0.0,
    toleranceDeg: 0.0000001,
    source: "International Astronomical Union (IAU) Tropical Definition",
    citation: "Standard Western Tropical Equinox",
  },
  {
    systemKey: "true_chitra",
    name: "True Chitra (Spica 180°)",
    epochDate: "2000-01-01T12:00:00Z",
    expectedDeg: 23.84366,
    toleranceDeg: 0.001,
    source: "Hipparcos Star Catalog / Spica (Alpha Virginis) Coordinates",
    citation: "HIP 65474 / Alpha Virginis Ecliptic Position",
  },
];

describe("Reference Corpus — Ayanamsha Validation Suite", () => {
  it("validates all registered ayanamshas against published reference points", () => {
    AYANAMSHA_CORPUS.forEach((item) => {
      const provider = AyanamshaRegistry.get(item.systemKey);
      expect(provider).toBeDefined();
      expect(provider.metadata.citation).toBeTruthy();
      expect(provider.metadata.description).toBeTruthy();

      const t = Astronomy.MakeTime(new Date(item.epochDate));
      const calculated = provider.calculate(t);
      const diff = Math.abs(calculated - item.expectedDeg);

      expect(
        diff,
        `Ayanamsha ${item.name} at ${item.epochDate} expected ${item.expectedDeg}°, got ${calculated}° (delta: ${diff}°)`,
      ).toBeLessThanOrEqual(item.toleranceDeg);
    });
  });

  it("strictly enforces Sayana Ayanamsha is 0.0 at all times", () => {
    const sayana = AyanamshaRegistry.get("sayana");
    const dates = ["1900-01-01", "2000-01-01", "2024-06-01", "2099-12-31"];
    dates.forEach((d) => {
      expect(sayana.calculate(Astronomy.MakeTime(new Date(d)))).toBe(0.0);
    });
  });

  it("verifies mathematical ordering: Raman < KP < Lahiri at J2000.0", () => {
    const t = Astronomy.MakeTime(new Date("2000-01-01T12:00:00Z"));
    const raman = AyanamshaRegistry.calculate("raman", t);
    const kp = AyanamshaRegistry.calculate("krishnamurti", t);
    const lahiri = AyanamshaRegistry.calculate("lahiri", t);

    expect(raman).toBeLessThan(kp);
    expect(kp).toBeLessThan(lahiri);
    expect(lahiri - raman).toBeCloseTo(1.466667, 4); // ~1°28'
    expect(lahiri - kp).toBeCloseTo(0.098056, 4); // ~0°05'53"
  });
});
