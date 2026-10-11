import { describe, it, expect } from "vitest";
import { normalizeDailySchedule } from "../src/lib/dailyScheduleNormalizer";
import {
  buildPanchangaEventPayloads,
  DEFAULT_SYNC_OPTIONS,
} from "../src/services/googleCalendarService";
import type { PanchangaResponse } from "../src/types";

describe("Comprehensive Swara Events Integration", () => {
  const mockPanchanga: PanchangaResponse = {
    date: "2026-10-03",
    city: "New Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "Asia/Kolkata",
    sunrise: "06:15 AM",
    sunset: "06:05 PM",
    sunriseMs: new Date("2026-10-03T06:15:00+05:30").getTime(),
    sunsetMs: new Date("2026-10-03T18:05:00+05:30").getTime(),
    moonrise: "11:20 PM",
    moonset: "12:40 PM",
    tithi: [
      {
        number: 8,
        name: "Ashtami",
        start: "04:30 AM",
        end: "05:10 AM",
        startTimeMs: new Date("2026-10-03T04:30:00+05:30").getTime(),
        endTimeMs: new Date("2026-10-04T05:10:00+05:30").getTime(),
      },
    ],
    paksha: "Shukla",
    nakshatra: [
      {
        number: 19,
        name: "Mula",
        start: "08:00 AM",
        end: "09:30 AM",
        startTimeMs: new Date("2026-10-03T08:00:00+05:30").getTime(),
        endTimeMs: new Date("2026-10-04T09:30:00+05:30").getTime(),
      },
    ],
    yoga: [{ number: 1, name: "Vishkambha" }],
    karana: [{ number: 1, name: "Bava" }],
    vaara: "Shanivara",
    samvatsara: "Krodhi",
    ayanamsha: "Lahiri",
  };

  it("normalizes all swara events into the daily schedule timeline", () => {
    const schedule = normalizeDailySchedule(mockPanchanga, "hi", Date.now());

    // Swara events should be populated
    expect(schedule.counts.swara).toBeGreaterThan(20);

    const swaraEvents = schedule.events.filter((e) => e.category === "swara");
    const sunriseSwara = swaraEvents.find((e) => e.metadata?.window === "sunrise");
    const middaySwara = swaraEvents.find((e) => e.metadata?.window === "midday");
    const sunsetSwara = swaraEvents.find((e) => e.metadata?.window === "sunset");
    const moonriseSwara = swaraEvents.find((e) => e.metadata?.window === "moonrise");
    const moonsetSwara = swaraEvents.find((e) => e.metadata?.window === "moonset");
    const hourlyCycles = swaraEvents.filter((e) => e.metadata?.window === "hourly-cycle");

    expect(sunriseSwara).toBeDefined();
    expect(middaySwara).toBeDefined();
    expect(sunsetSwara).toBeDefined();
    expect(moonriseSwara).toBeDefined();
    expect(moonsetSwara).toBeDefined();
    expect(hourlyCycles.length).toBe(24);

    // Verify 24-hour alternating prahars alternate Ida and Pingala
    for (let i = 0; i < hourlyCycles.length - 1; i++) {
      expect(hourlyCycles[i].metadata?.nadi).not.toBe(hourlyCycles[i + 1].metadata?.nadi);
    }
  });

  it("generates Google Calendar payloads for all swara events", () => {
    const payloads = buildPanchangaEventPayloads(
      mockPanchanga,
      {
        ...DEFAULT_SYNC_OPTIONS,
        includeSwaraSunrise: true,
        includeSwaraCelestialWindows: true,
        includeSwaraTransitions: true,
        includeSwaraHourlyCycles: true,
      },
      "Asia/Kolkata",
    );

    const swaraPayloads = payloads.filter(
      (p) =>
        p.extendedProperties?.private?.eventType?.startsWith("swara_") ||
        p.extendedProperties?.private?.eventType?.includes("swara"),
    );

    expect(swaraPayloads.length).toBeGreaterThanOrEqual(28);

    const sunrisePayload = swaraPayloads.find(
      (p) => p.extendedProperties?.private?.eventType === "swara_sunrise",
    );
    const sunsetPayload = swaraPayloads.find(
      (p) => p.extendedProperties?.private?.eventType === "swara_sunset",
    );
    const middayPayload = swaraPayloads.find(
      (p) => p.extendedProperties?.private?.eventType === "swara_midday",
    );
    const moonrisePayload = swaraPayloads.find(
      (p) => p.extendedProperties?.private?.eventType === "swara_moonrise",
    );
    const moonsetPayload = swaraPayloads.find(
      (p) => p.extendedProperties?.private?.eventType === "swara_moonset",
    );
    const idaPayloads = swaraPayloads.filter((p) => p.extendedProperties?.private?.nadi === "ida");
    const pingalaPayloads = swaraPayloads.filter(
      (p) => p.extendedProperties?.private?.nadi === "pingala",
    );
    const sushumnaPayloads = swaraPayloads.filter(
      (p) => p.extendedProperties?.private?.nadi === "sushumna",
    );

    expect(sunrisePayload).toBeDefined();
    expect(sunsetPayload).toBeDefined();
    expect(middayPayload).toBeDefined();
    expect(moonrisePayload).toBeDefined();
    expect(moonsetPayload).toBeDefined();

    // Explicit Ida, Pingala, and Sushumna events must exist
    expect(idaPayloads.length).toBeGreaterThan(0);
    expect(pingalaPayloads.length).toBeGreaterThan(0);
    expect(sushumnaPayloads.length).toBeGreaterThan(0);

    // Verify all Ida, Pingala, Sushumna events have calculated valid start & end timestamps
    for (const p of [...idaPayloads, ...pingalaPayloads, ...sushumnaPayloads]) {
      expect(p.start.dateTime).toBeDefined();
      expect(p.end.dateTime).toBeDefined();
      expect(new Date(p.start.dateTime!).getTime()).toBeLessThan(
        new Date(p.end.dateTime!).getTime(),
      );
    }
  });

  it("handles Indian date format (DD/MM/YYYY) without throwing Invalid time value", () => {
    const indianPanchanga: PanchangaResponse = {
      ...mockPanchanga,
      date: "03/10/2026", // Indian format returned by PanchangaEngine server
    };

    expect(() => {
      const payloads = buildPanchangaEventPayloads(indianPanchanga, DEFAULT_SYNC_OPTIONS);
      expect(payloads.length).toBeGreaterThan(0);
      for (const p of payloads) {
        if (p.start.dateTime) {
          expect(isNaN(new Date(p.start.dateTime).getTime())).toBe(false);
        }
        if (p.start.date) {
          expect(p.start.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    }).not.toThrow();
  });

  it("generates 24 Vedic Hora calendar payloads with planet, nadi, tattvas in title and start-end times in detail", () => {
    const payloads = buildPanchangaEventPayloads(mockPanchanga, {
      ...DEFAULT_SYNC_OPTIONS,
      includeVedicHoras: true,
    });

    const horaPayloads = payloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("vedic_hora_"),
    );

    expect(horaPayloads.length).toBe(24);

    const firstHora = horaPayloads[0];
    // Title must contain planet, nadi, tatwa
    expect(firstHora.summary).toMatch(/होरा/);
    expect(firstHora.summary).toMatch(/नाड़ी/);
    expect(firstHora.summary).toMatch(/तत्त्व/);

    // Detail must contain start-to-end time breakdown
    expect(firstHora.description).toMatch(/समय अवधि/);
    expect(firstHora.description).toMatch(/ग्रह स्वामी/);
    expect(firstHora.description).toMatch(/स्वर नाड़ी/);
    expect(firstHora.description).toMatch(/सूक्ष्म पंच तत्त्व विवरण/);

    // Start and end timestamps must be valid numbers
    expect(firstHora.start.dateTime).toBeDefined();
    expect(firstHora.end.dateTime).toBeDefined();
    expect(new Date(firstHora.start.dateTime!).getTime()).toBeLessThan(
      new Date(firstHora.end.dateTime!).getTime(),
    );
  });
});
