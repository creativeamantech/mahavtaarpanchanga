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

    // Explicit Ida and Pingala events must exist, Sushumna events must be completely disabled & 0
    expect(idaPayloads.length).toBeGreaterThan(0);
    expect(pingalaPayloads.length).toBeGreaterThan(0);
    expect(sushumnaPayloads.length).toBe(0);

    // Verify all Ida and Pingala events have calculated valid start & end timestamps
    for (const p of [...idaPayloads, ...pingalaPayloads]) {
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

  it("verifies 120 independent Tattva events per full Panchanga day with single Tattva info and exact boundaries", () => {
    // 1. By default, standalone Hora events are disabled and Tattva events are enabled
    expect(DEFAULT_SYNC_OPTIONS.includeVedicHoras).toBe(false);
    expect(DEFAULT_SYNC_OPTIONS.includeHoraTattvas).toBe(true);

    const payloads = buildPanchangaEventPayloads(mockPanchanga, DEFAULT_SYNC_OPTIONS);

    const tattvaPayloads = payloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("hora_tattva_"),
    );

    // Requirement 1: Exactly 120 independent Tattva events (24 Horas * 5 Tattvas)
    expect(tattvaPayloads.length).toBe(120);

    // Requirement 4 & 5: No standalone Hora and No Sushumna events by default
    const standaloneHoras = payloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("vedic_hora_"),
    );
    expect(standaloneHoras.length).toBe(0);

    const sushumnaEvents = payloads.filter(
      (p) =>
        p.extendedProperties?.private?.eventType?.includes("sushumna") ||
        p.summary.includes("सुषुम्ना") ||
        p.description.includes("सुषुम्ना"),
    );
    expect(sushumnaEvents.length).toBe(0);

    // Requirement 2 & 3: Check every single Tattva event
    for (let i = 0; i < tattvaPayloads.length; i++) {
      const tp = tattvaPayloads[i];
      const horaIdx = Math.floor(i / 5) + 1;
      const tIdx = i % 5;

      // Check eventType
      expect(tp.extendedProperties?.private?.eventType).toBe(`hora_tattva_${horaIdx}_${tIdx}`);

      // Check boundaries
      expect(tp.start.dateTime).toBeDefined();
      expect(tp.end.dateTime).toBeDefined();
      const startMs = new Date(tp.start.dateTime!).getTime();
      const endMs = new Date(tp.end.dateTime!).getTime();
      expect(startMs).toBeLessThan(endMs);

      // Check Title format: 🪐 [Planet] · [Icon] [Tattva] · 💨 [Nadi]
      expect(tp.summary).toMatch(/^🪐\s+\S+\s+·\s+[\S\s]+\s+·\s+💨\s+\S+$/);

      // Check Description: contains only current Tattva and NOT others
      expect(tp.description).toContain("Tattva:");
      expect(tp.description).toContain("Planet:");
      expect(tp.description).toContain("Nadi:");
      expect(tp.description).toContain("Tattva Time:");
      expect(tp.description).toContain(`Hora Reference:`);
      expect(tp.description).toContain(`(होरा #${horaIdx})`);

      // Verify it does NOT list all five Tattvas
      const tattvaKeywords = ["पृथ्वी", "जल", "अग्नि", "वायु", "आकाश"];
      const mentionedTattvas = tattvaKeywords.filter((tk) => tp.description.includes(tk));
      // Only the single active Tattva should be described
      expect(mentionedTattvas.length).toBe(1);
    }
  });

  it("verifies Google Calendar sync and ICS export produce 1:1 consistent results with deterministic UIDs", () => {
    import("../src/services/googleCalendarService").then(({ generatePanchangaIcsContent }) => {
      const gcalPayloads = buildPanchangaEventPayloads(mockPanchanga, DEFAULT_SYNC_OPTIONS);
      const icsString = generatePanchangaIcsContent(mockPanchanga, DEFAULT_SYNC_OPTIONS);

      // Verify VEVENT count matches payload count
      const veventMatches = icsString.match(/BEGIN:VEVENT/g);
      expect(veventMatches?.length).toBe(gcalPayloads.length);

      // Verify deterministic UIDs (repeat export produces identical UIDs)
      const icsStringRepeat = generatePanchangaIcsContent(mockPanchanga, DEFAULT_SYNC_OPTIONS);
      expect(icsString).toBe(icsStringRepeat);

      // Verify UIDs are formatted deterministically: mahavtaar-YYYYMMDD-[eventType]@panchanga
      const uids = [...icsString.matchAll(/UID:([^\r\n]+)/g)].map((m) => m[1]);
      expect(uids.length).toBe(gcalPayloads.length);
      for (let i = 0; i < uids.length; i++) {
        const expectedType = gcalPayloads[i].extendedProperties?.private?.eventType;
        expect(uids[i]).toBe(`mahavtaar-20261003-${expectedType}@panchanga`);
      }

      // Verify no Sushumna events in ICS
      expect(icsString).not.toContain("सुषुम्ना");
      expect(icsString).not.toContain("Sushumna");
    });
  });
});
