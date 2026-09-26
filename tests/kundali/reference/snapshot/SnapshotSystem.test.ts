import { describe, it, expect } from "vitest";
import referenceV1 from "./reference-v1.json";
import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../../../../src/kundali/astronomy/AstronomicalCore";
import { AyanamshaRegistry } from "../../../../src/kundali/astronomy/AyanamshaProvider";

describe("Reference Corpus — Versioned Snapshot (reference-v1) Certification", () => {
  it("verifies reference-v1 metadata schema", () => {
    expect(referenceV1.snapshotId).toBe("reference-v1");
    expect(referenceV1.engineVersion).toBe("1.0.0-phase7");
    expect(referenceV1.sourceVersions.astronomyEngine).toBe("2.1.19");
    expect(referenceV1.ayanamsha).toBe("lahiri");
    expect(referenceV1.convention).toBeTruthy();
    expect(referenceV1.goldenAnchors.length).toBeGreaterThanOrEqual(3);
  });

  it("re-evaluates golden anchor J2000 against current codebase", () => {
    const anchor = referenceV1.goldenAnchors[0];
    const t = Astronomy.MakeTime(new Date(anchor.date));

    const ayanamsa = AyanamshaRegistry.calculate("lahiri", t);
    expect(ayanamsa).toBeCloseTo(anchor.ayanamsaDeg, 4);

    const sun = AstronomicalCore.calculatePlanetaryPosition("Sun", t);
    expect(sun.tropicalLongitude).toBeCloseTo(anchor.sunTropicalLon, 3);

    const siderealLon = (sun.tropicalLongitude - ayanamsa + 360) % 360;
    expect(siderealLon).toBeCloseTo(anchor.sunSiderealLon, 3);
  });
});
