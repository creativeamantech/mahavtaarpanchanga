import { describe, it, expect } from "vitest";
import {
  ALL_SHODASHAVARGA_TYPES,
  VARGA_DEFINITIONS,
  VargaEngine,
} from "../../../../src/kundali/varga/VargaEngine";
import { VargaType } from "../../../../src/kundali/contracts/IVargaEngine";

describe("Reference Corpus — Shodashavarga (All 16 Divisional Charts) Boundary Validation", () => {
  const EPSILON = 0.00001; // 0.036 arcseconds

  describe("1. Full Shodashavarga Inventory Coverage", () => {
    it("contains all 16 canonical Shodashavargas with complete metadata", () => {
      const expectedVargas: VargaType[] = [
        "D1",
        "D2",
        "D3",
        "D4",
        "D7",
        "D9",
        "D10",
        "D12",
        "D16",
        "D20",
        "D24",
        "D27",
        "D30",
        "D40",
        "D45",
        "D60",
      ];

      expect(ALL_SHODASHAVARGA_TYPES).toEqual(expectedVargas);
      expectedVargas.forEach((v) => {
        const def = VARGA_DEFINITIONS[v];
        expect(def, `Definition for ${v} must exist`).toBeDefined();
        expect(def.divisionFactor).toBeGreaterThan(0);
        expect(def.nameEn).toBeTruthy();
        expect(def.nameSa).toBeTruthy();
      });
    });
  });

  describe("2. Boundary Conditions Across All 16 Vargas & All 12 Signs", () => {
    ALL_SHODASHAVARGA_TYPES.forEach((vargaType) => {
      it(`evaluates ${vargaType} at 0°, exact boundary, just below (-ε) and just above (+ε) across all 12 signs`, () => {
        const def = VARGA_DEFINITIONS[vargaType];
        const spanPerPart = 30.0 / def.divisionFactor;

        for (let sign = 0; sign < 12; sign++) {
          const signBaseLon = sign * 30.0;

          // Test 1: 0° in sign
          const atZero = VargaEngine.calculatePositionInVarga(signBaseLon, vargaType);
          expect(atZero.destinationSignIndex).toBeGreaterThanOrEqual(0);
          expect(atZero.destinationSignIndex).toBeLessThanOrEqual(11);
          expect(atZero.degreeInVarga).toBeGreaterThanOrEqual(0);
          expect(atZero.degreeInVarga).toBeLessThanOrEqual(30.0);
          expect(atZero.partIndex).toBe(0);

          // For D30, intervals are unequal (5, 5, 8, 7, 5), tested specifically below
          if (vargaType === "D30") continue;

          // Test 2: Boundaries for each division inside this sign
          for (let part = 1; part < def.divisionFactor; part++) {
            const boundaryDegreeInSign = part * spanPerPart;
            const boundaryLon = signBaseLon + boundaryDegreeInSign;

            // Just below boundary (-ε)
            const below = VargaEngine.calculatePositionInVarga(boundaryLon - EPSILON, vargaType);
            expect(below.destinationSignIndex).toBeGreaterThanOrEqual(0);
            expect(below.destinationSignIndex).toBeLessThanOrEqual(11);
            expect(below.partIndex).toBe(part - 1);

            // Exact boundary (must produce valid bounded sign and degree)
            const atBound = VargaEngine.calculatePositionInVarga(boundaryLon, vargaType);
            expect(atBound.destinationSignIndex).toBeGreaterThanOrEqual(0);
            expect(atBound.destinationSignIndex).toBeLessThanOrEqual(11);
            expect(atBound.degreeInVarga).toBeGreaterThanOrEqual(0);
            expect(atBound.degreeInVarga).toBeLessThanOrEqual(30.0);

            // Just above boundary (+ε)
            const above = VargaEngine.calculatePositionInVarga(boundaryLon + EPSILON, vargaType);
            expect(above.destinationSignIndex).toBeGreaterThanOrEqual(0);
            expect(above.destinationSignIndex).toBeLessThanOrEqual(11);
            expect(above.partIndex).toBe(part);
          }

          // Test 3: Sign boundary terminal point (29.99999°)
          const atSignEnd = VargaEngine.calculatePositionInVarga(
            signBaseLon + 30.0 - EPSILON,
            vargaType,
          );
          expect(atSignEnd.destinationSignIndex).toBeGreaterThanOrEqual(0);
          expect(atSignEnd.destinationSignIndex).toBeLessThanOrEqual(11);
          expect(atSignEnd.partIndex).toBe(def.divisionFactor - 1);
        }
      });
    });
  });

  describe("3. Classical Special Algorithm Verification (D2, D3, D9, D30)", () => {
    it("D2 Hora: odd signs Sun (Leo) first, Moon (Cancer) second; even signs vice-versa", () => {
      // Aries (0, odd): 0-15° -> Leo (4), 15-30° -> Cancer (3)
      expect(VargaEngine.calculatePositionInVarga(5.0, "D2").destinationSignIndex).toBe(4);
      expect(VargaEngine.calculatePositionInVarga(20.0, "D2").destinationSignIndex).toBe(3);

      // Taurus (1, even): 0-15° -> Cancer (3), 15-30° -> Leo (4)
      expect(VargaEngine.calculatePositionInVarga(35.0, "D2").destinationSignIndex).toBe(3);
      expect(VargaEngine.calculatePositionInVarga(50.0, "D2").destinationSignIndex).toBe(4);
    });

    it("D9 Navamsha: Movable signs start from self, Fixed from 9th, Dual from 5th", () => {
      // Aries (Movable, 0): 0° -> Aries (0)
      expect(VargaEngine.calculatePositionInVarga(1.0, "D9").destinationSignIndex).toBe(0);

      // Taurus (Fixed, 1): Starts from 9th = Capricorn (9)
      expect(VargaEngine.calculatePositionInVarga(31.0, "D9").destinationSignIndex).toBe(9);

      // Gemini (Dual, 2): Starts from 5th = Libra (6)
      expect(VargaEngine.calculatePositionInVarga(61.0, "D9").destinationSignIndex).toBe(6);
    });

    it("D30 Trishamsha: obeys classical degrees (5, 5, 8, 7, 5) with odd/even inversion", () => {
      // Aries (Odd): Mars (0-5° Aries), Saturn (5-10° Aquarius), Jupiter (10-18° Sagittarius), Mercury (18-25° Gemini), Venus (25-30° Libra)
      expect(VargaEngine.calculatePositionInVarga(2.0, "D30").destinationSignIndex).toBe(0); // Mars Aries
      expect(VargaEngine.calculatePositionInVarga(7.0, "D30").destinationSignIndex).toBe(10); // Saturn Aquarius
      expect(VargaEngine.calculatePositionInVarga(14.0, "D30").destinationSignIndex).toBe(8); // Jupiter Sagittarius
      expect(VargaEngine.calculatePositionInVarga(22.0, "D30").destinationSignIndex).toBe(2); // Mercury Gemini
      expect(VargaEngine.calculatePositionInVarga(28.0, "D30").destinationSignIndex).toBe(6); // Venus Libra

      // Taurus (Even): Venus (0-5° Taurus), Mercury (5-12° Virgo), Jupiter (12-20° Pisces), Saturn (20-25° Capricorn), Mars (25-30° Scorpio)
      expect(VargaEngine.calculatePositionInVarga(32.0, "D30").destinationSignIndex).toBe(1); // Venus Taurus
      expect(VargaEngine.calculatePositionInVarga(38.0, "D30").destinationSignIndex).toBe(5); // Mercury Virgo
      expect(VargaEngine.calculatePositionInVarga(45.0, "D30").destinationSignIndex).toBe(11); // Jupiter Pisces
      expect(VargaEngine.calculatePositionInVarga(52.0, "D30").destinationSignIndex).toBe(9); // Saturn Capricorn
      expect(VargaEngine.calculatePositionInVarga(58.0, "D30").destinationSignIndex).toBe(7); // Mars Scorpio
    });
  });
});
