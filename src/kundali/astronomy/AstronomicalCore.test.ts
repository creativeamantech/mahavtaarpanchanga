import { describe, expect, it } from "vitest";
import * as Astronomy from "astronomy-engine";
import { AyanamshaRegistry } from "./AyanamshaProvider";
import { AstronomicalCore } from "./AstronomicalCore";
import { KundliInputValidator } from "../validation/KundliInputValidator";

describe("Phase 1 Canonical Architecture & Astronomical Core", () => {
  it("AyanamshaRegistry provides standard Lahiri value within official arcsecond bounds", () => {
    // Standard J2000.0 epoch: 2000-01-01 12:00:00 UT
    const j2000 = Astronomy.MakeTime(new Date(Date.UTC(2000, 0, 1, 12, 0, 0)));
    const lahiriVal = AyanamshaRegistry.calculate("lahiri", j2000);
    // Official J2000.0 Lahiri ayanamsha = 23° 51' 25.53" ≈ 23.857092°
    expect(lahiriVal).toBeCloseTo(23.857092, 4);

    // Raman should be offset by ~1.466°
    const ramanVal = AyanamshaRegistry.calculate("raman", j2000);
    expect(ramanVal).toBeCloseTo(23.857092 - 1.466667, 3);

    // Sayana must be identically 0
    const sayanaVal = AyanamshaRegistry.calculate("sayana", j2000);
    expect(sayanaVal).toBe(0.0);
  });

  it("AstronomicalCore builds valid AstronomicalContext with exact ecliptic vectors", () => {
    const time = AstronomicalCore.createTimeContext(2026, 9, 22, 12, 0, 0, "Asia/Kolkata");
    const loc = AstronomicalCore.createLocationContext(28.6139, 77.209, 0, "New Delhi", "Asia/Kolkata");
    const context = AstronomicalCore.buildContext(time, loc, "lahiri");

    expect(context).toBeDefined();
    expect(context.positions.Sun.tropicalLongitude).toBeGreaterThanOrEqual(0);
    expect(context.positions.Sun.tropicalLongitude).toBeLessThan(360);
    expect(context.siderealPositions.Sun.siderealLongitude).toBeGreaterThanOrEqual(0);
    expect(context.siderealPositions.Sun.siderealLongitude).toBeLessThan(360);

    // Verify Lagna properties
    expect(context.lagna.siderealAscendant).toBeGreaterThanOrEqual(0);
    expect(context.lagna.siderealAscendant).toBeLessThan(360);
    expect(context.lagna.signIndex).toBeGreaterThanOrEqual(0);
    expect(context.lagna.signIndex).toBeLessThanOrEqual(11);
    expect(context.lagna.nakshatraIndex).toBeGreaterThanOrEqual(1);
    expect(context.lagna.nakshatraIndex).toBeLessThanOrEqual(27);

    // Rahu & Ketu should be exactly 180 degrees apart
    const rahuSid = context.siderealPositions.Rahu.siderealLongitude;
    const ketuSid = context.siderealPositions.Ketu.siderealLongitude;
    const diff = Math.abs(rahuSid - ketuSid);
    expect(Math.round(diff === 180 ? 180 : Math.abs(diff - 360))).toBe(180);
  });

  it("KundliInputValidator catches out-of-range dates and coordinates cleanly", () => {
    const invalidResult = KundliInputValidator.validate({
      year: 2026,
      month: 13, // invalid month
      day: 32,   // invalid day
      hour: 25,  // invalid hour
      minute: 70,// invalid minute
      latitude: 105, // invalid latitude
      longitude: 200, // invalid longitude
    });

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThanOrEqual(6);

    const validResult = KundliInputValidator.validate({
      year: 2026,
      month: 9,
      day: 22,
      hour: 14,
      minute: 30,
      latitude: 28.6139,
      longitude: 77.209,
    });

    expect(validResult.isValid).toBe(true);
    expect(validResult.errors.length).toBe(0);
    expect(validResult.normalizedInput?.timezone).toBe("Asia/Kolkata");
  });
});
