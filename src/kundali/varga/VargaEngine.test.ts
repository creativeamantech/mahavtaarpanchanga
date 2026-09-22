import { describe, expect, it } from "vitest";
import {
  ALL_SHODASHAVARGA_TYPES,
  normalize360,
  SHASHTIAMSHA_DEITIES,
  VARGA_DEFINITIONS,
  VargaEngine,
} from "./VargaEngine";
import {
  calculateDashamshaSignIndex,
  calculateNavamshaSignIndex,
} from "../../lib/kundliEngine";
import { CanonicalBodyId } from "../astronomy/AstronomicalContext";

describe("Canonical Shodashavarga Engine (VargaEngine)", () => {
  const engine = new VargaEngine();

  describe("Engine Architecture & Metadata", () => {
    it("should possess valid BPHS classical repository metadata", () => {
      expect(engine.metadata.repositoryName).toBe("Mahavtaar Jyotish Core");
      expect(engine.metadata.classicalTextReference).toContain("Brihat Parashara Hora Shastra");
      expect(engine.metadata.shlokaReference).toContain("Adhyaya 6");
    });

    it("should define all 16 classical Shodashavarga charts", () => {
      expect(ALL_SHODASHAVARGA_TYPES).toHaveLength(16);
      for (const varga of ALL_SHODASHAVARGA_TYPES) {
        const def = VARGA_DEFINITIONS[varga];
        expect(def).toBeDefined();
        expect(def.divisionFactor).toBeGreaterThan(0);
        expect(def.nameEn).toBeTruthy();
        expect(def.nameSa).toBeTruthy();
      }
    });

    it("should accurately normalize longitudes", () => {
      expect(normalize360(0)).toBe(0);
      expect(normalize360(360)).toBe(0);
      expect(normalize360(725)).toBe(5);
      expect(normalize360(-30)).toBe(330);
      expect(normalize360(-365)).toBe(355);
    });
  });

  describe("D1 — Rashi Chart", () => {
    it("should return the exact same sign and degree for D1", () => {
      const res1 = VargaEngine.calculatePositionInVarga(15.5, "D1");
      expect(res1.destinationSignIndex).toBe(0); // Aries
      expect(res1.degreeInVarga).toBeCloseTo(15.5, 6);

      const res2 = VargaEngine.calculatePositionInVarga(65.25, "D1");
      expect(res2.destinationSignIndex).toBe(2); // Gemini (60° - 90°)
      expect(res2.degreeInVarga).toBeCloseTo(5.25, 6);
    });
  });

  describe("D2 — Hora Chart (BPHS Sun/Moon Hora)", () => {
    it("should assign Odd signs: 0-15° to Sun (Leo: 4) and 15-30° to Moon (Cancer: 3)", () => {
      // Aries (Sign 0, Odd)
      const h1 = VargaEngine.calculatePositionInVarga(5.0, "D2");
      expect(h1.destinationSignIndex).toBe(4); // Leo
      expect(h1.deityName).toContain("Surya");

      const h2 = VargaEngine.calculatePositionInVarga(20.0, "D2");
      expect(h2.destinationSignIndex).toBe(3); // Cancer
      expect(h2.deityName).toContain("Chandra");
    });

    it("should assign Even signs: 0-15° to Moon (Cancer: 3) and 15-30° to Sun (Leo: 4)", () => {
      // Taurus (Sign 1, Even)
      const h1 = VargaEngine.calculatePositionInVarga(35.0, "D2"); // 5° in Taurus
      expect(h1.destinationSignIndex).toBe(3); // Cancer
      expect(h1.deityName).toContain("Chandra");

      const h2 = VargaEngine.calculatePositionInVarga(55.0, "D2"); // 25° in Taurus
      expect(h2.destinationSignIndex).toBe(4); // Leo
      expect(h2.deityName).toContain("Surya");
    });

    it("should test boundaries at 14.999° and 15.001°", () => {
      const b1 = VargaEngine.calculatePositionInVarga(14.9999, "D2"); // Aries
      expect(b1.destinationSignIndex).toBe(4); // Leo (1st half)

      const b2 = VargaEngine.calculatePositionInVarga(15.0001, "D2"); // Aries
      expect(b2.destinationSignIndex).toBe(3); // Cancer (2nd half)
    });
  });

  describe("D3 — Drekkana Chart (BPHS 1st, 5th, 9th)", () => {
    it("should map 0-10° to sign itself, 10-20° to 5th, 20-30° to 9th", () => {
      // Aries (0):
      expect(VargaEngine.calculatePositionInVarga(4.0, "D3").destinationSignIndex).toBe(0); // Aries (1st)
      expect(VargaEngine.calculatePositionInVarga(14.0, "D3").destinationSignIndex).toBe(4); // Leo (5th)
      expect(VargaEngine.calculatePositionInVarga(24.0, "D3").destinationSignIndex).toBe(8); // Sagittarius (9th)

      // Gemini (2):
      expect(VargaEngine.calculatePositionInVarga(65.0, "D3").destinationSignIndex).toBe(2); // Gemini (1st)
      expect(VargaEngine.calculatePositionInVarga(75.0, "D3").destinationSignIndex).toBe(6); // Libra (5th)
      expect(VargaEngine.calculatePositionInVarga(85.0, "D3").destinationSignIndex).toBe(10); // Aquarius (9th)
    });

    it("should assign correct deities (Narada, Agastya, Durvasa)", () => {
      expect(VargaEngine.calculatePositionInVarga(2.0, "D3").deityName).toContain("Narada");
      expect(VargaEngine.calculatePositionInVarga(12.0, "D3").deityName).toContain("Agastya");
      expect(VargaEngine.calculatePositionInVarga(22.0, "D3").deityName).toContain("Durvasa");
    });
  });

  describe("D4 — Chaturthamsha Chart (Kendras)", () => {
    it("should count kendras (1st, 4th, 7th, 10th from sign) in 7.5° spans", () => {
      // Aries (0):
      expect(VargaEngine.calculatePositionInVarga(2.0, "D4").destinationSignIndex).toBe(0); // Aries
      expect(VargaEngine.calculatePositionInVarga(8.0, "D4").destinationSignIndex).toBe(3); // Cancer (4th)
      expect(VargaEngine.calculatePositionInVarga(16.0, "D4").destinationSignIndex).toBe(6); // Libra (7th)
      expect(VargaEngine.calculatePositionInVarga(24.0, "D4").destinationSignIndex).toBe(9); // Capricorn (10th)
    });
  });

  describe("D7 — Saptamsha Chart", () => {
    it("should start from self for Odd signs and 7th for Even signs", () => {
      // Aries (Odd, 0):
      const d7_odd_p0 = VargaEngine.calculatePositionInVarga(2.0, "D7");
      expect(d7_odd_p0.destinationSignIndex).toBe(0); // Aries

      const d7_odd_p1 = VargaEngine.calculatePositionInVarga(5.0, "D7"); // part 1
      expect(d7_odd_p1.destinationSignIndex).toBe(1); // Taurus

      // Taurus (Even, 1):
      const d7_even_p0 = VargaEngine.calculatePositionInVarga(32.0, "D7"); // 2° in Taurus
      expect(d7_even_p0.destinationSignIndex).toBe(7); // Scorpio (7th from Taurus)

      const d7_even_p1 = VargaEngine.calculatePositionInVarga(35.0, "D7"); // ~5° in Taurus (part 1)
      expect(d7_even_p1.destinationSignIndex).toBe(8); // Sagittarius
    });
  });

  describe("D9 — Navamsha Chart (Cross-validation against existing implementation)", () => {
    it("should match existing calculateNavamshaSignIndex across all 12 signs and degrees", () => {
      // Test 120 evenly spaced points across the entire zodiac
      for (let lon = 0; lon < 360; lon += 2.5) {
        const legacySign = calculateNavamshaSignIndex(lon);
        const canonicalResult = VargaEngine.calculatePositionInVarga(lon, "D9");
        expect(canonicalResult.destinationSignIndex).toBe(legacySign);
      }
    });

    it("should match boundary conditions at 3°20' (3.333333°) intervals", () => {
      // 0° -> Aries
      expect(VargaEngine.calculatePositionInVarga(0.0001, "D9").destinationSignIndex).toBe(0);
      // Just below 3°20' (3.3333°) -> Aries
      expect(VargaEngine.calculatePositionInVarga(3.333, "D9").destinationSignIndex).toBe(0);
      // Just above 3°20' -> Taurus
      expect(VargaEngine.calculatePositionInVarga(3.334, "D9").destinationSignIndex).toBe(1);
      // Near 30° in Aries -> Sagittarius (8)
      expect(VargaEngine.calculatePositionInVarga(29.99, "D9").destinationSignIndex).toBe(8);
      // 30° roll into Taurus -> Capricorn (9)
      expect(VargaEngine.calculatePositionInVarga(30.01, "D9").destinationSignIndex).toBe(9);
    });
  });

  describe("D10 — Dashamsha Chart (Cross-validation against existing implementation)", () => {
    it("should match existing calculateDashamshaSignIndex across all 12 signs and degrees", () => {
      for (let lon = 0; lon < 360; lon += 2.0) {
        const legacySign = calculateDashamshaSignIndex(lon);
        const canonicalResult = VargaEngine.calculatePositionInVarga(lon, "D10");
        expect(canonicalResult.destinationSignIndex).toBe(legacySign);
      }
    });

    it("should count from sign itself for odd signs and 9th for even signs in 3° bounds", () => {
      // Aries (0, Odd):
      expect(VargaEngine.calculatePositionInVarga(1.0, "D10").destinationSignIndex).toBe(0); // Aries
      expect(VargaEngine.calculatePositionInVarga(4.0, "D10").destinationSignIndex).toBe(1); // Taurus

      // Taurus (1, Even): starts at Capricorn (9)
      expect(VargaEngine.calculatePositionInVarga(31.0, "D10").destinationSignIndex).toBe(9); // Capricorn
      expect(VargaEngine.calculatePositionInVarga(34.0, "D10").destinationSignIndex).toBe(10); // Aquarius
    });
  });

  describe("D12 — Dwadashamsha Chart", () => {
    it("should count continuously from sign itself in 2.5° steps", () => {
      // Aries (0):
      expect(VargaEngine.calculatePositionInVarga(1.0, "D12").destinationSignIndex).toBe(0);
      expect(VargaEngine.calculatePositionInVarga(3.0, "D12").destinationSignIndex).toBe(1);
      expect(VargaEngine.calculatePositionInVarga(28.0, "D12").destinationSignIndex).toBe(11); // Pisces
    });
  });

  describe("D16 — Shodashamsha Chart", () => {
    it("should start from Aries for Chara, Leo for Sthira, Sagittarius for Dvisvabhava", () => {
      // Aries (Movable: 0)
      expect(VargaEngine.calculatePositionInVarga(0.5, "D16").destinationSignIndex).toBe(0); // Aries
      // Taurus (Fixed: 1)
      expect(VargaEngine.calculatePositionInVarga(30.5, "D16").destinationSignIndex).toBe(4); // Leo
      // Gemini (Dual: 2)
      expect(VargaEngine.calculatePositionInVarga(60.5, "D16").destinationSignIndex).toBe(8); // Sagittarius
    });
  });

  describe("D20 — Vimshamsha Chart", () => {
    it("should start from Aries for Chara, Sagittarius for Sthira, Leo for Dvisvabhava", () => {
      // Aries (Movable: 0)
      expect(VargaEngine.calculatePositionInVarga(0.5, "D20").destinationSignIndex).toBe(0); // Aries
      // Taurus (Fixed: 1) -> starts from Sagittarius (8) as per BPHS 6.21
      expect(VargaEngine.calculatePositionInVarga(30.5, "D20").destinationSignIndex).toBe(8); // Sagittarius
      // Gemini (Dual: 2) -> starts from Leo (4)
      expect(VargaEngine.calculatePositionInVarga(60.5, "D20").destinationSignIndex).toBe(4); // Leo
    });
  });

  describe("D24 — Chaturvimshamsha Chart", () => {
    it("should start from Leo for Odd signs and Cancer for Even signs", () => {
      // Aries (Odd: 0)
      expect(VargaEngine.calculatePositionInVarga(0.5, "D24").destinationSignIndex).toBe(4); // Leo
      // Taurus (Even: 1)
      expect(VargaEngine.calculatePositionInVarga(30.5, "D24").destinationSignIndex).toBe(3); // Cancer
    });
  });

  describe("D27 — Saptavimshamsha / Bhamsa Chart", () => {
    it("should start from Aries for Fire, Cancer for Earth, Libra for Air, Capricorn for Water", () => {
      // Fire (Aries: 0)
      expect(VargaEngine.calculatePositionInVarga(0.5, "D27").destinationSignIndex).toBe(0); // Aries
      // Earth (Taurus: 1)
      expect(VargaEngine.calculatePositionInVarga(30.5, "D27").destinationSignIndex).toBe(3); // Cancer
      // Air (Gemini: 2)
      expect(VargaEngine.calculatePositionInVarga(60.5, "D27").destinationSignIndex).toBe(6); // Libra
      // Water (Cancer: 3)
      expect(VargaEngine.calculatePositionInVarga(90.5, "D27").destinationSignIndex).toBe(9); // Capricorn
    });
  });

  describe("D30 — Trimshamsha Chart (Classical Unequal Bounds)", () => {
    it("should follow Parashari bounds in Odd Signs (Mars 0-5, Sat 5-10, Jup 10-18, Merc 18-25, Ven 25-30)", () => {
      // Aries (0, Odd):
      // 0-5° -> Aries (0)
      expect(VargaEngine.calculatePositionInVarga(2.5, "D30").destinationSignIndex).toBe(0);
      expect(VargaEngine.calculatePositionInVarga(4.99, "D30").destinationSignIndex).toBe(0);

      // 5-10° -> Aquarius (10)
      expect(VargaEngine.calculatePositionInVarga(5.01, "D30").destinationSignIndex).toBe(10);
      expect(VargaEngine.calculatePositionInVarga(9.99, "D30").destinationSignIndex).toBe(10);

      // 10-18° -> Sagittarius (8)
      expect(VargaEngine.calculatePositionInVarga(10.01, "D30").destinationSignIndex).toBe(8);
      expect(VargaEngine.calculatePositionInVarga(17.99, "D30").destinationSignIndex).toBe(8);

      // 18-25° -> Gemini (2)
      expect(VargaEngine.calculatePositionInVarga(18.01, "D30").destinationSignIndex).toBe(2);
      expect(VargaEngine.calculatePositionInVarga(24.99, "D30").destinationSignIndex).toBe(2);

      // 25-30° -> Libra (6)
      expect(VargaEngine.calculatePositionInVarga(25.01, "D30").destinationSignIndex).toBe(6);
      expect(VargaEngine.calculatePositionInVarga(29.99, "D30").destinationSignIndex).toBe(6);
    });

    it("should follow Parashari bounds in Even Signs (Ven 0-5, Merc 5-12, Jup 12-20, Sat 20-25, Mars 25-30)", () => {
      // Taurus (1, Even):
      // 0-5° (30-35°) -> Taurus (1)
      expect(VargaEngine.calculatePositionInVarga(32.5, "D30").destinationSignIndex).toBe(1);
      expect(VargaEngine.calculatePositionInVarga(34.99, "D30").destinationSignIndex).toBe(1);

      // 5-12° (35-42°) -> Virgo (5)
      expect(VargaEngine.calculatePositionInVarga(35.01, "D30").destinationSignIndex).toBe(5);
      expect(VargaEngine.calculatePositionInVarga(41.99, "D30").destinationSignIndex).toBe(5);

      // 12-20° (42-50°) -> Pisces (11)
      expect(VargaEngine.calculatePositionInVarga(42.01, "D30").destinationSignIndex).toBe(11);
      expect(VargaEngine.calculatePositionInVarga(49.99, "D30").destinationSignIndex).toBe(11);

      // 20-25° (50-55°) -> Capricorn (9)
      expect(VargaEngine.calculatePositionInVarga(50.01, "D30").destinationSignIndex).toBe(9);
      expect(VargaEngine.calculatePositionInVarga(54.99, "D30").destinationSignIndex).toBe(9);

      // 25-30° (55-60°) -> Scorpio (7)
      expect(VargaEngine.calculatePositionInVarga(55.01, "D30").destinationSignIndex).toBe(7);
      expect(VargaEngine.calculatePositionInVarga(59.99, "D30").destinationSignIndex).toBe(7);
    });
  });

  describe("D40 — Khavedamsha Chart", () => {
    it("should count from Aries in Odd signs and Libra in Even signs", () => {
      // Aries (Odd: 0)
      expect(VargaEngine.calculatePositionInVarga(0.3, "D40").destinationSignIndex).toBe(0); // Aries
      expect(VargaEngine.calculatePositionInVarga(1.0, "D40").destinationSignIndex).toBe(1); // Taurus

      // Taurus (Even: 1)
      expect(VargaEngine.calculatePositionInVarga(30.3, "D40").destinationSignIndex).toBe(6); // Libra
      expect(VargaEngine.calculatePositionInVarga(31.0, "D40").destinationSignIndex).toBe(7); // Scorpio
    });
  });

  describe("D45 — Akshavedamsha Chart", () => {
    it("should start from Aries for Chara, Leo for Sthira, Sagittarius for Dvisvabhava", () => {
      // Aries (Movable: 0)
      expect(VargaEngine.calculatePositionInVarga(0.2, "D45").destinationSignIndex).toBe(0); // Aries
      // Taurus (Fixed: 1)
      expect(VargaEngine.calculatePositionInVarga(30.2, "D45").destinationSignIndex).toBe(4); // Leo
      // Gemini (Dual: 2)
      expect(VargaEngine.calculatePositionInVarga(60.2, "D45").destinationSignIndex).toBe(8); // Sagittarius
    });
  });

  describe("D60 — Shashtiamsha Chart", () => {
    it("should divide into 60 parts of 0.5° each and count from sign itself", () => {
      // Aries (0):
      expect(VargaEngine.calculatePositionInVarga(0.25, "D60").destinationSignIndex).toBe(0); // 1st part -> Aries
      expect(VargaEngine.calculatePositionInVarga(0.75, "D60").destinationSignIndex).toBe(1); // 2nd part -> Taurus
      expect(VargaEngine.calculatePositionInVarga(29.75, "D60").destinationSignIndex).toBe(11); // 60th part -> Pisces (59 % 12 = 11)
    });

    it("should associate valid classical BPHS deity names", () => {
      expect(SHASHTIAMSHA_DEITIES).toHaveLength(60);
      const part0 = VargaEngine.calculatePositionInVarga(0.25, "D60");
      expect(part0.deityName).toBe("Ghora");
      expect(part0.isBeneficDeity).toBe(false);

      const part2 = VargaEngine.calculatePositionInVarga(1.25, "D60");
      expect(part2.deityName).toBe("Deva");
      expect(part2.isBeneficDeity).toBe(true);
    });
  });

  describe("Full Chart Calculation: calculateVarga & calculateShodashavarga", () => {
    const mockLagna = 15.5; // 15°30' Aries
    const mockPlanets: Record<CanonicalBodyId, number> = {
      Sun: 12.0, // Aries
      Moon: 48.0, // Taurus
      Mars: 85.0, // Gemini
      Mercury: 10.0, // Aries
      Jupiter: 105.0, // Cancer
      Venus: 25.0, // Aries
      Saturn: 320.0, // Aquarius
      Rahu: 195.0, // Libra
      Ketu: 15.0, // Aries
      Uranus: 50.0,
      Neptune: 350.0,
      Pluto: 290.0,
    };

    it("should compute a single varga chart with houses mapped from varga lagna", () => {
      const d9Chart = engine.calculateVarga("D9", mockLagna, mockPlanets);
      expect(d9Chart.varga).toBe("D9");
      expect(d9Chart.divisionFactor).toBe(9);
      expect(d9Chart.nameEn).toBe("Navamsha");
      expect(d9Chart.lagnaSignIndex).toBeDefined();

      for (const [bodyId, pos] of Object.entries(d9Chart.planets)) {
        expect(pos.signIndex).toBeGreaterThanOrEqual(0);
        expect(pos.signIndex).toBeLessThan(12);
        expect(pos.degreeInSign).toBeGreaterThanOrEqual(0);
        expect(pos.degreeInSign).toBeLessThan(30);
        expect(pos.houseNumber).toBeGreaterThanOrEqual(1);
        expect(pos.houseNumber).toBeLessThanOrEqual(12);

        // Verification of house counting: house = (planetSign - lagnaSign + 12) % 12 + 1
        const expectedHouse =
          ((pos.signIndex - d9Chart.lagnaSignIndex + 12) % 12) + 1;
        expect(pos.houseNumber).toBe(expectedHouse);
      }
    });

    it("should calculate all 16 Shodashavarga charts simultaneously without repeating astronomy", () => {
      const allVargas = engine.calculateShodashavarga(mockLagna, mockPlanets);
      expect(Object.keys(allVargas)).toHaveLength(16);

      for (const vargaType of ALL_SHODASHAVARGA_TYPES) {
        const chart = allVargas[vargaType];
        expect(chart).toBeDefined();
        expect(chart.varga).toBe(vargaType);
        expect(Object.keys(chart.planets).length).toBe(9); // 9 Classical Navagrahas
      }
    });

    it("should produce deterministic repeated calculations", () => {
      const run1 = engine.calculateShodashavarga(mockLagna, mockPlanets);
      const run2 = engine.calculateShodashavarga(mockLagna, mockPlanets);
      expect(run1).toEqual(run2);
    });
  });
});
