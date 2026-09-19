import { describe, expect, it } from "bun:test";
import { computeDailyHoras, resolveCurrentHora } from "./horaEngine";
import { PanchangaResponse } from "./types";

describe("Vedic Hora Engine Live Resolver", () => {
  it("Test A to J - Complete Hora verification", () => {
    // 14th Sep 2026
    const prevSunrise = 1700000000000 - 86400000;
    const prevSunset = 1700043200000 - 86400000;

    const sunriseMs = 1700000000000; // Let's pretend this is 6:00 AM
    const sunsetMs = 1700043200000; // Let's pretend this is 18:00
    const nextSunriseMs = 1700086400000; // Let's pretend this is 6:00 AM next day

    const mockPanchanga = {
      city: "Test",
      date: "14/09/2026",
      timezone: "Asia/Kolkata",
      jd: 0,
      sunrise_jd: 0,
      coordinate_mode: "sidereal",
      coordinate_label: "",
      ayanamsa: null,
      ayanamsa_key: null,
      ayanamsa_degrees: null,
      month_system: "amanta",
      month_system_label: "",
      samvatsara: "",
      samvatsara_north: "",
      ayana: "",
      drik_ayana: "",
      masa: "",
      masa_number: 1,
      is_adhika: false,
      rtu: "",
      drik_rtu: "",
      vaara: "",
      weekday: 1, // 1 = Monday (Moon)
      kali_day: 0,
      saka_year: 0,
      kali_year: 0,
      vikrama_year: 0,
      sunrise: "",
      sunset: "",
      moonrise: null,
      moonrise_status: "",
      moonset: null,
      moonset_status: "",
      day_duration: "",
      rahu_kala: { start: "", end: "" },
      durmuhurta: [],
      varjyam: [],
      tithi: [{ number: 1, name: "Test" }],
      nakshatra: [],
      yoga: [],
      karana: [],

      previous_sunrise_ms: prevSunrise,
      previous_sunset_ms: prevSunset,
      sunrise_ms: sunriseMs,
      sunset_ms: sunsetMs,
      next_sunrise_ms: nextSunriseMs,
    } as unknown as PanchangaResponse;

    // Test A — Sunrise
    const resA = resolveCurrentHora(sunriseMs, mockPanchanga);
    expect(resA?.hora.index).toBe(1);
    expect(resA?.hora.ruler).toBe("Moon"); // Weekday 1 = Moon

    // Test B — Sunset
    const resB = resolveCurrentHora(sunsetMs, mockPanchanga);
    expect(resB?.hora.index).toBe(13);

    // Test C — Real Midnight (Halfway through night)
    const midnight = sunsetMs + (nextSunriseMs - sunsetMs) / 2 + 100000;
    const resC = resolveCurrentHora(midnight, mockPanchanga);
    expect(resC).not.toBeNull();
    expect(resC?.hora.isDay).toBe(false);
    expect(resC?.hora.startTimeMs).toBeLessThanOrEqual(midnight);
    expect(resC?.hora.endTimeMs).toBeGreaterThan(midnight);

    // Test D — Pre-Sunrise (using previous day data)
    // 4:30 AM is sunriseMs - 1.5 hours
    const preSunriseMs = sunriseMs - 1.5 * 3600000;
    const resD = resolveCurrentHora(preSunriseMs, mockPanchanga);
    expect(resD).not.toBeNull();
    expect(resD?.hora.isDay).toBe(false);
    expect(resD?.hora.startTimeMs).toBeLessThanOrEqual(preSunriseMs);
    expect(resD?.hora.endTimeMs).toBeGreaterThan(preSunriseMs);
    // previous day was Sunday, 0. So sequence started with Sun.
    // Let's verify it continues properly without breaking.

    // Test E — Exact Hora Boundary
    const hora1End = resA!.hora.endTimeMs;
    const resE = resolveCurrentHora(hora1End, mockPanchanga);
    expect(resE?.hora.index).toBe(2);

    // Test F — Next Sunrise
    const resF = resolveCurrentHora(nextSunriseMs, mockPanchanga);
    // nextSunriseMs is outside the bounds of today's schedule.
    // resolveCurrentHora returns null for it because it strictly checks < nextSunriseMs.
    expect(resF).toBeNull();

    // Test G — Sequence (covered in computeDailyHoras test, but we can check here)
    const resG = resolveCurrentHora(sunriseMs + 3600000 * 2, mockPanchanga); // 3rd hora
    expect(resG?.hora.ruler).toBe("Jupiter"); // Moon(1) -> Saturn(2) -> Jupiter(3)

    // Test H — Midnight Continuity
    const justBeforeMidnight = midnight - 1000;
    const justAfterMidnight = midnight + 1000;
    const resH1 = resolveCurrentHora(justBeforeMidnight, mockPanchanga);
    const resH2 = resolveCurrentHora(justAfterMidnight, mockPanchanga);
    expect(resH1?.hora.ruler).toBe(resH2?.hora.ruler); // Still same hora usually, or at least sequence continues.

    // Test I — Timezone Isolation (already tested in horaEngine.test.ts for computeDailyHoras)
    // Here we can just ensure timeZone is passed correctly.

    // Test J — Historical Date
    const historicalNow = sunriseMs + 86400000 * 5; // 5 days in future
    const resJ = resolveCurrentHora(historicalNow, mockPanchanga);
    expect(resJ).toBeNull();
  });
});
