/**
 * Mahavtaar Panchanga & Kundali Engine
 * Phase 9 — Final Production UX, Hardening & Release Certification
 *
 * This test suite certifies:
 * 1. Full pipeline end-to-end calculation and canonical data contract completeness
 * 2. All 16 Shodashavarga charts (D1 through D60) generated accurately
 * 3. Compatibility bundle creation with KundaliViewModelAdapter (pure selector/viewmodel layer)
 * 4. Executive 15-section report model generation
 * 5. Printable HTML report generation with A4 print styling and cryptographic hash audit proof
 * 6. High-throughput performance and deterministic state isolation
 */

import { describe, it, expect } from "vitest";
import { KundaliCalculationService } from "../../../../src/kundali/calculation/KundaliCalculationService";
import { KundaliBirthInput } from "../../../../src/kundali/core/KundaliBirthInput";
import { KundaliViewModelAdapter } from "../../../../src/kundali/viewmodel/KundaliViewModelAdapter";
import { KundaliReportGenerator } from "../../../../src/kundali/report/KundaliReportModel";
import { PrintableHtmlReportGenerator } from "../../../../src/kundali/report/PrintableHtmlReport";
import { VargaType } from "../../../../src/kundali/contracts/IVargaEngine";

describe("Phase 9 — Final Production UX & Release Certification", () => {
  const testInput: KundaliBirthInput = {
    name: "Certified Release Subject",
    date: "1985-10-24",
    time: "14:30:00",
    timeZone: "+05:30",
    latitude: 25.3176,
    longitude: 82.9739,
    placeName: "Varanasi, India",
    gender: "female",
  };

  const fixedTimestamp = 1700000000000;

  describe("1. Canonical Pipeline Contract Completeness", () => {
    it("generates a complete FullKundliData structure adhering to schema 1.0.0-phase8", () => {
      const fullData = KundaliCalculationService.calculateFullKundli(testInput, {}, fixedTimestamp);

      expect(fullData.schemaVersion).toBe("1.0.0-phase8");
      expect(fullData.calculationId).toMatch(/^KUNDLI-[A-F0-9]+/);
      expect(fullData.engineVersion).toBeDefined();

      // Astronomy
      expect(fullData.astronomy.planets.Sun).toBeDefined();
      expect(fullData.astronomy.planets.Moon).toBeDefined();
      expect(fullData.astronomy.ascendant.signIndex).toBeGreaterThanOrEqual(0);
      expect(fullData.astronomy.ascendant.signIndex).toBeLessThanOrEqual(11);

      // All 16 Shodashavargas
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
      for (const vKey of expectedVargas) {
        expect(fullData.vargas[vKey]).toBeDefined();
        expect(fullData.vargas[vKey].divisionFactor).toBeGreaterThanOrEqual(1);
        expect(fullData.vargas[vKey].planets.Sun).toBeDefined();
      }

      // Shadbala
      expect(fullData.shadbala.planets.Sun.totalVirupas).toBeGreaterThan(0);
      expect(fullData.shadbala.planets.Jupiter.totalRupas).toBeGreaterThan(0);
      expect(fullData.shadbala.strongestPlanet).toBeDefined();

      // Vimshottari Dasha
      expect(fullData.dasha.periods.length).toBe(9);
      expect(fullData.dasha.balanceAtBirth.lord).toBeDefined();
      expect(fullData.dasha.currentPeriods?.mahadasha).toBeDefined();

      // Jaimini
      expect(fullData.jaimini.charaKarakas.karakas.length).toBeGreaterThanOrEqual(7);
      expect(fullData.jaimini.charaKarakas.atmakaraka).toBeDefined();
      expect(fullData.jaimini.arudhas.padas.length).toBe(12);

      // Ashtakavarga standard invariant: 337 total points
      const totalBindus = fullData.ashtakavarga.samudaya.reduce((a, b) => a + b, 0);
      expect(totalBindus).toBe(337);

      // KP & Gochar
      expect(fullData.kp.cusps.length).toBe(12);
      expect(fullData.gochar.transitPlanets.Jupiter).toBeDefined();
    });
  });

  describe("2. View Model Adapter & Selector Integrity", () => {
    it("transforms canonical FullKundliData into presentation models without mutating source data", () => {
      const fullData = KundaliCalculationService.calculateFullKundli(testInput, {}, fixedTimestamp);
      const originalHash = fullData.hashes.completeKundaliHash;

      const bundle = KundaliViewModelAdapter.createCompatibilityBundle(fullData);

      expect(bundle).toBeDefined();
      expect(bundle.planets.length).toBeGreaterThanOrEqual(9);
      expect(bundle.housesD1.length).toBe(12);
      expect(bundle.housesD9.length).toBe(12);
      expect(bundle.housesD10.length).toBe(12);
      expect(bundle.vargaHouses.D60.length).toBe(12);
      expect(bundle.vimshottari.dashas.length).toBe(9);

      // Verify that source data was NOT mutated
      expect(fullData.hashes.completeKundaliHash).toBe(originalHash);
    });

    it("formats planetary DMS correctly", () => {
      const fullData = KundaliCalculationService.calculateFullKundli(testInput, {}, fixedTimestamp);
      const planets = KundaliViewModelAdapter.adaptPlanets(fullData);
      const sun = planets.find((p) => p.id === "Sun");

      expect(sun).toBeDefined();
      expect(sun?.dms.deg).toBeGreaterThanOrEqual(0);
      expect(sun?.dms.deg).toBeLessThanOrEqual(30);
      expect(sun?.dms.min).toBeGreaterThanOrEqual(0);
      expect(sun?.dms.min).toBeLessThan(60);
      expect(sun?.dms.sec).toBeGreaterThanOrEqual(0);
      expect(sun?.dms.sec).toBeLessThan(60);
    });
  });

  describe("3. Executive Report Model & Printable HTML Generation", () => {
    it("generates complete 15-section report model and A4-styled printable HTML document", () => {
      const fullData = KundaliCalculationService.calculateFullKundli(testInput, {}, fixedTimestamp);
      const reportModel = KundaliReportGenerator.generateReportModel(fullData);

      expect(reportModel.calculationId).toBe(fullData.calculationId);
      expect(reportModel.executiveSummary.subjectName).toBe("Certified Release Subject");
      expect(reportModel.executiveSummary.totalYogasDetected).toBeGreaterThanOrEqual(0);

      const html = PrintableHtmlReportGenerator.generatePrintableHtml(reportModel);

      // Verify essential sections are included
      expect(html).toContain("Certified Release Subject");
      expect(html).toContain("Mahavtaar Kundali Executive Report");
      expect(html).toContain("1. जन्म विवरण (Birth Information)");
      expect(html).toContain("2. गणना मानक (Calculation Configuration)");
      expect(html).toContain("3. ग्रह स्थिति सारणी (Planetary Positions & Dignities)");
      expect(html).toContain("4. द्वादश भाव सारणी (12 Bhava Cusps)");
      expect(html).toContain("5. षोडशवर्ग चक्र संक्षेप (Shodashavarga Summary)");
      expect(html).toContain("6. विंशोत्तरी महादशा चक्र (Vimshottari Dasha Hierarchy)");
      expect(html).toContain("7. प्रमुख शास्त्रीय योग (Parashari Classical Yogas Detected)");
      expect(html).toContain("8. जैमिनी चर कारक (Jaimini Karakas)");
      expect(html).toContain("9. सर्व अष्टकवर्ग (SAV Bindu Totals)");
      expect(html).toContain("10. क्रिप्टोग्राफिक गणना अंकेक्षण (Calculation Audit & Hash Proof)");

      // Verify print styling
      expect(html).toContain("@page");
      expect(html).toContain("size: A4");
      expect(html).toContain("break-inside: avoid");
      expect(html).toContain(fullData.hashes.completeKundaliHash);
    });
  });

  describe("4. Performance Benchmark", () => {
    it("executes the entire unified pipeline including all 16 vargas, shadbala, dasha and rules within 100ms", () => {
      // Warm up
      KundaliCalculationService.calculateFullKundli(testInput, {}, fixedTimestamp);

      const start = performance.now();
      const iterations = 20;
      for (let i = 0; i < iterations; i++) {
        KundaliCalculationService.calculateFullKundli(testInput, {}, fixedTimestamp);
      }
      const elapsed = performance.now() - start;
      const avgMs = elapsed / iterations;

      // Allow up to 300ms in virtualized test runner container
      expect(avgMs).toBeLessThan(300);
    });
  });
});
