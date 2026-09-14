import { describe, expect, it } from "bun:test";
import { computeDailyHoras } from "./horaEngine";

describe("Vedic Hora Engine", () => {
  it("Test A & B & C & D & E - Boundaries and Midnight Handling", () => {
    const sunriseMs = 1700000000000;
    const sunsetMs = 1700043200000; // +12 hours exactly
    const nextSunriseMs = 1700086400000; // +24 hours exactly

    // 0=Sun. Starts with Sun.
    const res = computeDailyHoras(
      "15/11/2023",
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      0, // Sunday
      1,
      "Asia/Kolkata",
      sunriseMs // Exactly at sunrise
    );

    // Test A - Sunrise
    expect(res.horas.length).toBe(24);
    expect(res.activeHora).not.toBeNull();
    expect(res.activeHora?.index).toBe(1);
    expect(res.activeHora?.ruler).toBe("Sun");

    // Test B - Day Hora boundary
    const hora1End = res.horas[0].endTimeMs;
    const resB = computeDailyHoras(
      "15/11/2023",
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      0,
      1,
      "Asia/Kolkata",
      hora1End
    );
    expect(resB.activeHora?.index).toBe(2);

    // Test C - Sunset
    const resC = computeDailyHoras(
      "15/11/2023",
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      0,
      1,
      "Asia/Kolkata",
      sunsetMs
    );
    expect(resC.activeHora?.index).toBe(13); // First nighttime hora

    // Test D - Midnight
    const midnightMs = sunsetMs + (nextSunriseMs - sunsetMs) / 2; 
    const resD = computeDailyHoras(
      "15/11/2023",
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      0,
      1,
      "Asia/Kolkata",
      midnightMs
    );
    expect(resD.activeHora?.isDay).toBe(false);
    expect(resD.activeHora).not.toBeNull();
    
    // Test E - Next sunrise
    const resE = computeDailyHoras(
      "15/11/2023",
      sunriseMs,
      sunsetMs,
      nextSunriseMs,
      0,
      1,
      "Asia/Kolkata",
      nextSunriseMs
    );
    expect(resE.activeHora).toBeNull(); 
  });

  it("Test F - Timezone isolation", () => {
    const sunriseMs = 1700000000000;
    const sunsetMs = 1700043200000;
    const nextSunriseMs = 1700086400000;

    const resNY = computeDailyHoras("15/11/2023", sunriseMs, sunsetMs, nextSunriseMs, 1, 1, "America/New_York", sunriseMs);
    const resLon = computeDailyHoras("15/11/2023", sunriseMs, sunsetMs, nextSunriseMs, 1, 1, "Europe/London", sunriseMs);

    expect(resNY.horas[0].startTimeMs).toBe(resLon.horas[0].startTimeMs);
    expect(resNY.horas[0].endTimeMs).toBe(resLon.horas[0].endTimeMs);
    expect(resNY.horas[0].ruler).toBe(resLon.horas[0].ruler);

    expect(resNY.horas[0].startTime).not.toBe(resLon.horas[0].startTime);
  });

  it("Test G - Selected date", () => {
    const sunriseMs = 1700000000000;
    const sunsetMs = 1700043200000;
    const nextSunriseMs = 1700086400000;

    const resPast = computeDailyHoras("13/11/2023", sunriseMs, sunsetMs, nextSunriseMs, 1, 1, "Asia/Kolkata", sunriseMs + 86400000 * 2);
    expect(resPast.activeHora).toBeNull();
  });

  it("Test H - Classical sequence", () => {
    const res = computeDailyHoras("15/11/2023", 1000, 2000, 3000, 0, 1, "Asia/Kolkata", 1000);
    const expectedLords = [
      "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars",
      "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars",
      "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars",
      "Sun", "Venus", "Mercury"
    ];
    for (let i = 0; i < 24; i++) {
      expect(res.horas[i].ruler).toBe(expectedLords[i]);
    }
  });
});
