// @ts-expect-error - bun test is not in tsconfig types
import { test, expect, describe } from "bun:test";
import { computeDailyHoras } from "./horaEngine";

describe("Hora Engine", () => {
  test("Test A — Equal day/night", () => {
    const sunrise = new Date("2023-03-21T06:00:00Z").getTime();
    const sunset = new Date("2023-03-21T18:00:00Z").getTime();
    const nextSunrise = new Date("2023-03-22T06:00:00Z").getTime();

    const result = computeDailyHoras(
      "21/03/2023",
      sunrise,
      sunset,
      nextSunrise,
      2 /* Tuesday */,
      1,
      "UTC",
      sunrise,
    );

    expect(result.horas.length).toBe(24);
    for (const hora of result.horas) {
      expect(hora.durationMs).toBe(60 * 60 * 1000); // 60 minutes
    }
  });

  test("Test B — Unequal day/night", () => {
    const sunrise = new Date("2023-06-21T05:45:00Z").getTime();
    const sunset = new Date("2023-06-21T18:30:00Z").getTime();
    const nextSunrise = new Date("2023-06-22T05:46:00Z").getTime();

    const result = computeDailyHoras(
      "21/06/2023",
      sunrise,
      sunset,
      nextSunrise,
      3 /* Wednesday */,
      1,
      "UTC",
      sunrise,
    );

    const dayDuration = sunset - sunrise;
    const nightDuration = nextSunrise - sunset;

    for (const hora of result.horas) {
      if (hora.isDay) {
        expect(hora.durationMs).toBe(dayDuration / 12);
      } else {
        expect(hora.durationMs).toBe(nightDuration / 12);
      }
    }

    // 12 daytime Horas end exactly at sunset
    expect(result.horas[11].endTimeMs).toBe(sunset);
    // 12 nighttime Horas end exactly at next sunrise
    expect(result.horas[23].endTimeMs).toBe(nextSunrise);
  });

  test("Test C & D — Planetary sequence & Weekday first Hora", () => {
    const HORA_LORDS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
    // Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
    // Expected first lords: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
    const EXPECTED_FIRST = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

    const sunrise = new Date("2023-01-01T06:00:00Z").getTime();
    const sunset = new Date("2023-01-01T18:00:00Z").getTime();
    const nextSunrise = new Date("2023-01-02T06:00:00Z").getTime();

    for (let w = 0; w < 7; w++) {
      const result = computeDailyHoras(
        "01/01/2023",
        sunrise,
        sunset,
        nextSunrise,
        w,
        1,
        "UTC",
        sunrise,
      );
      expect(result.horas[0].ruler).toBe(EXPECTED_FIRST[w]);

      // Verify sequence (cyclical over the week array)
      const firstIndex = HORA_LORDS.indexOf(EXPECTED_FIRST[w]);
      for (let i = 0; i < 24; i++) {
        expect(result.horas[i].ruler).toBe(HORA_LORDS[(firstIndex + i) % 7]);
      }
    }
  });

  test("Test E & G — Midnight crossing and Exact boundaries", () => {
    const sunrise = new Date("2023-01-01T07:00:00Z").getTime();
    const sunset = new Date("2023-01-01T17:00:00Z").getTime();
    const nextSunrise = new Date("2023-01-02T07:15:00Z").getTime();

    const result = computeDailyHoras(
      "01/01/2023",
      sunrise,
      sunset,
      nextSunrise,
      0,
      1,
      "UTC",
      sunrise,
    );

    expect(result.horas[0].startTimeMs).toBe(sunrise);
    expect(result.horas[11].endTimeMs).toBe(sunset);
    expect(result.horas[12].startTimeMs).toBe(sunset);
    expect(result.horas[23].endTimeMs).toBe(nextSunrise);

    // Check contiguous boundaries
    for (let i = 1; i < 24; i++) {
      expect(result.horas[i].startTimeMs).toBe(result.horas[i - 1].endTimeMs);
    }
  });

  test("Test H — Active Hora", () => {
    const sunrise = new Date("2023-01-01T06:00:00Z").getTime();
    const sunset = new Date("2023-01-01T18:00:00Z").getTime();
    const nextSunrise = new Date("2023-01-02T06:00:00Z").getTime();

    // Exactly at Hora 1 start
    let result = computeDailyHoras(
      "01/01/2023",
      sunrise,
      sunset,
      nextSunrise,
      0,
      1,
      "UTC",
      sunrise,
    );
    expect(result.activeHora?.index).toBe(1);

    // Inside Hora 1
    result = computeDailyHoras(
      "01/01/2023",
      sunrise,
      sunset,
      nextSunrise,
      0,
      1,
      "UTC",
      sunrise + 30 * 60 * 1000,
    );
    expect(result.activeHora?.index).toBe(1);

    // Exactly at Hora 1 end (which is Hora 2 start)
    result = computeDailyHoras(
      "01/01/2023",
      sunrise,
      sunset,
      nextSunrise,
      0,
      1,
      "UTC",
      sunrise + 60 * 60 * 1000,
    );
    expect(result.activeHora?.index).toBe(2);
  });

  test("Test I - Timezone Display Isolation", () => {
    const sunrise = new Date("2023-01-01T06:00:00Z").getTime();
    const sunset = new Date("2023-01-01T18:00:00Z").getTime();
    const nextSunrise = new Date("2023-01-02T06:00:00Z").getTime();

    const timeZones = [
      { tz: "UTC", expectedStart: "06:00:00 AM" },
      { tz: "Asia/Kolkata", expectedStart: "11:30:00 AM" },
      { tz: "America/New_York", expectedStart: "01:00:00 AM" }, // UTC-5
      { tz: "Europe/London", expectedStart: "06:00:00 AM" }, // UTC+0 in Jan
    ];

    const results = timeZones.map((tzInfo) => ({
      ...tzInfo,
      result: computeDailyHoras(
        "01/01/2023",
        sunrise,
        sunset,
        nextSunrise,
        0,
        1,
        tzInfo.tz,
        sunrise,
      ),
    }));

    const baseResult = results[0].result;

    for (let i = 1; i < results.length; i++) {
      const curResult = results[i].result;

      // Core numerical invariants must be strictly identical regardless of timezone
      expect(baseResult.horas[0].startTimeMs).toBe(curResult.horas[0].startTimeMs);
      expect(baseResult.horas[0].endTimeMs).toBe(curResult.horas[0].endTimeMs);
      expect(baseResult.horas[0].durationMs).toBe(curResult.horas[0].durationMs);
      expect(baseResult.horas[0].ruler).toBe(curResult.horas[0].ruler);
    }

    // Formatting must correctly reflect the offset
    for (const res of results) {
      expect(res.result.horas[0].startTime).toBe(res.expectedStart);
    }
  });
});
