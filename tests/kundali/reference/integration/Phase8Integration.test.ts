import { describe, it, expect } from "vitest";
import { KundaliCalculationService } from "../../../../src/kundali/calculation/KundaliCalculationService";
import { KundaliBirthInput } from "../../../../src/kundali/core/KundaliBirthInput";
import { createCalculationProfile } from "../../../../src/kundali/core/CalculationProfile";
import { KundaliExporter } from "../../../../src/kundali/export/KundaliExporter";
import { KundaliReportGenerator } from "../../../../src/kundali/report/KundaliReportModel";
import { PrintableHtmlReportGenerator } from "../../../../src/kundali/report/PrintableHtmlReport";

describe("Phase 8 - Production Integration & Unified Kundali Verification", () => {
  const sampleInput: KundaliBirthInput = {
    name: "India Independence",
    date: "1947-08-15",
    time: "00:00:00",
    timeZone: "+05:30",
    latitude: 28.6139,
    longitude: 77.209,
    placeName: "New Delhi",
  };

  describe("A. Determinism and State Isolation", () => {
    it("produces identical result hashes and calculation IDs across repeated executions", () => {
      const run1 = KundaliCalculationService.calculateFullKundli(sampleInput, {}, 1700000000000);
      const run2 = KundaliCalculationService.calculateFullKundli(sampleInput, {}, 1700000000000);

      expect(run1.calculationId).toBe(run2.calculationId);
      expect(run1.hashes.completeKundaliHash).toBe(run2.hashes.completeKundaliHash);
      expect(run1.hashes.astronomyHash).toBe(run2.hashes.astronomyHash);
      expect(run1.hashes.vargasHash).toBe(run2.hashes.vargasHash);
      expect(run1.hashes.shadbalaHash).toBe(run2.hashes.shadbalaHash);
      expect(run1.hashes.dashaHash).toBe(run2.hashes.dashaHash);
      expect(run1.hashes.jaiminiHash).toBe(run2.hashes.jaiminiHash);
    });

    it("verifies different inputs produce different deterministic calculation IDs", () => {
      const input2 = { ...sampleInput, date: "1947-08-16" };
      const run1 = KundaliCalculationService.calculateFullKundli(sampleInput);
      const run2 = KundaliCalculationService.calculateFullKundli(input2);

      expect(run1.calculationId).not.toBe(run2.calculationId);
    });
  });

  describe("B. Exporter/Importer Serialization Symmetry", () => {
    it("guarantees a perfect serialize -> deserialize -> serialize invariant", () => {
      const original = KundaliCalculationService.calculateFullKundli(
        sampleInput,
        {},
        1700000000000,
      );
      const json = KundaliExporter.exportToJson(original);
      const imported = KundaliExporter.importFromJson(json);
      const exportedAgain = KundaliExporter.exportToJson(imported);

      expect(imported.calculationId).toBe(original.calculationId);
      expect(imported.hashes.completeKundaliHash).toBe(original.hashes.completeKundaliHash);
      expect(exportedAgain).toBe(json);
    });
  });

  describe("C. Report Generation and Printable HTML Validation", () => {
    it("creates standard executive reports and printable safe styling", () => {
      const fullData = KundaliCalculationService.calculateFullKundli(
        sampleInput,
        {},
        1700000000000,
      );
      const report = KundaliReportGenerator.generateReportModel(fullData);

      expect(report.calculationId).toBe(fullData.calculationId);
      expect(report.executiveSummary.subjectName).toBe("India Independence");
      expect(report.executiveSummary.lagnaSign).toBe("Taurus");
      expect(report.executiveSummary.moonSign).toBe("Cancer");

      const html = PrintableHtmlReportGenerator.generatePrintableHtml(report);
      expect(html).toContain("India Independence");
      expect(html).toContain("Mahavtaar Kundali Executive Report");
      expect(html).toContain("Taurus");
    });
  });

  describe("D. Validation Fault Tolerance", () => {
    it("rejects impossible dates and coordinate ranges", () => {
      const invalidDateInput = { ...sampleInput, date: "1947-02-31" };
      expect(() => KundaliCalculationService.calculateFullKundli(invalidDateInput)).toThrow();

      const invalidLatInput = { ...sampleInput, latitude: 120.0 };
      expect(() => KundaliCalculationService.calculateFullKundli(invalidLatInput)).toThrow();
    });
  });
});
