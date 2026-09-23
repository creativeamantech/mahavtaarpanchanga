import { describe, it, expect } from "vitest";
import { DashaEngine } from "./DashaEngine";
import { VimshottariDashaEngine } from "./vimshottari/VimshottariDashaEngine";
import { computeFullKundli } from "../../lib/kundliEngine";

describe("DashaEngine Architecture & Legacy Cross-Validation", () => {
  const dashaEngine = new DashaEngine("vimshottari");

  it("conforms to IDashaEngine contract", () => {
    expect(dashaEngine.systemType).toBe("vimshottari");
    expect(dashaEngine.metadata.key).toBe("parashara-vimshottari-v1");
    expect(dashaEngine.metadata.sourceText).toContain("Brihat Parashara Hora Shastra");

    const birthMs = Date.UTC(1990, 0, 15, 6, 30, 0);
    const result = dashaEngine.calculateTimeline(141.2967, birthMs, 2);

    expect(result.system).toBe("vimshottari");
    expect(result.totalCycleYears).toBe(120);
    expect(result.timeline).toHaveLength(9);
    expect(result.timeline[0].antardashas).toHaveLength(9);
    expect(result.balanceAtBirthYears).toBeGreaterThan(0);
  });

  it("supports adapter registry for future systems (e.g. Ashtottari, Yogini, Chara)", () => {
    const registered = DashaEngine.getRegisteredSystems();
    expect(registered).toContain("vimshottari");

    const vimAdapter = DashaEngine.getAdapter("vimshottari");
    expect(vimAdapter).toBeInstanceOf(VimshottariDashaEngine);
  });

  it("exact cross-validation against legacy computeFullKundli baseline", () => {
    const kundli = computeFullKundli(
      "1990-01-15",
      "12:00:00",
      28.6139,
      77.209,
      "Asia/Kolkata",
      "lahiri",
    );

    const moonObj = kundli.planets.find((p) => p.id === "Moon")!;
    expect(moonObj).toBeDefined();

    const birthDate = new Date("1990-01-15T12:00:00+05:30");
    const birthMs = birthDate.getTime();

    const vEngine = new VimshottariDashaEngine();
    const balance = vEngine.calculateBirthBalance(moonObj.longitude);

    // Verify balance matches legacy
    expect(balance.lord).toBe(kundli.vimshottari.balanceAtBirth.lord);
    expect(balance.years).toBe(kundli.vimshottari.balanceAtBirth.years);
    expect(balance.months).toBe(kundli.vimshottari.balanceAtBirth.months);
    expect(balance.days).toBe(kundli.vimshottari.balanceAtBirth.days);

    // Verify timeline matches legacy
    const timeline = vEngine.calculateTimeline({
      moonSiderealLonDeg: moonObj.longitude,
      birthTimestampMs: birthMs,
      depthLevels: 2,
    });

    expect(timeline.periods).toHaveLength(kundli.vimshottari.dashas.length);

    for (let i = 0; i < 9; i++) {
      const canonicalMaha = timeline.periods[i];
      const legacyMaha = kundli.vimshottari.dashas[i];

      expect(canonicalMaha.lord).toBe(legacyMaha.planet);
      expect(canonicalMaha.startDateIso).toBe(legacyMaha.startDate);
      expect(canonicalMaha.endDateIso).toBe(legacyMaha.endDate);
      expect(canonicalMaha.startTimestampMs).toBe(legacyMaha.startMs);
      expect(canonicalMaha.endTimestampMs).toBe(legacyMaha.endMs);

      // Verify all 9 Antardashas
      expect(canonicalMaha.children).toHaveLength(legacyMaha.antardashas.length);
      for (let j = 0; j < 9; j++) {
        const canonicalAntar = canonicalMaha.children![j];
        const legacyAntar = legacyMaha.antardashas[j];

        expect(canonicalAntar.lord).toBe(legacyAntar.planet);
        expect(canonicalAntar.startDateIso).toBe(legacyAntar.startDate);
        expect(canonicalAntar.endDateIso).toBe(legacyAntar.endDate);
        expect(canonicalAntar.startTimestampMs).toBe(legacyAntar.startMs);
        expect(canonicalAntar.endTimestampMs).toBe(legacyAntar.endMs);
      }
    }
  });
});
