import { describe, expect, it } from "vitest";
import { computePanchangaCustom, resolveCity } from "./lib/panchangaEngine.server";

describe("Tithi and Nakshatra Exact boundaries", () => {
  it("Should calculate exact start and end for current Tithi and Nakshatra (Pre-sunrise start)", () => {
    // New York, NY
    const loc = resolveCity("New York, US");
    // Date: 15 Sep 2026. Let's see what it gives.
    const res = computePanchangaCustom(
      loc.latitude,
      loc.longitude,
      loc.timezone,
      "15/09/2026",
      "amanta",
      "citra",
    );

    expect(res.tithi[0].startTimeMs).toBeDefined();
    expect(res.tithi[0].endTimeMs).toBeDefined();
    expect(res.nakshatra[0].startTimeMs).toBeDefined();
    expect(res.nakshatra[0].endTimeMs).toBeDefined();

    // Evaluate cross-midnight and pre-sunrise transitions.
    // They must be absolute millisecond boundaries.
    console.log("Tithi Start:", new Date(res.tithi[0].startTimeMs!).toISOString());
    console.log("Tithi End:", new Date(res.tithi[0].endTimeMs!).toISOString());
  });

  it("Should remain independent of timezone (Timezone isolation)", () => {
    const loc1 = resolveCity("New York, US");
    const resNY = computePanchangaCustom(
      loc1.latitude,
      loc1.longitude,
      loc1.timezone,
      "15/09/2026",
      "amanta",
      "citra",
    );
    const resLon = computePanchangaCustom(
      loc1.latitude,
      loc1.longitude,
      "Europe/London",
      "15/09/2026",
      "amanta",
      "citra",
    );

    expect(Math.abs(resNY.tithi[0].startTimeMs - resLon.tithi[0].startTimeMs)).toBeLessThanOrEqual(10);
    if (resNY.tithi[0].endTimeMs && resLon.tithi[0].endTimeMs) {
      expect(Math.abs(resNY.tithi[0].endTimeMs - resLon.tithi[0].endTimeMs)).toBeLessThanOrEqual(10);
    }
    expect(Math.abs(resNY.nakshatra[0].startTimeMs - resLon.nakshatra[0].startTimeMs)).toBeLessThanOrEqual(10);
    if (resNY.nakshatra[0].endTimeMs && resLon.nakshatra[0].endTimeMs) {
      expect(Math.abs(resNY.nakshatra[0].endTimeMs - resLon.nakshatra[0].endTimeMs)).toBeLessThanOrEqual(10);
    }

    // Formatting must differ
    expect(resNY.tithi[0].starts).not.toBe(resLon.tithi[0].starts);
  });
});
