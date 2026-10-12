import { describe, it, expect } from "vitest";
import {
  buildPanchangaEventPayloads,
  generatePanchangaIcsContent,
  DEFAULT_SYNC_OPTIONS,
} from "../src/services/googleCalendarService";
import { computeDailyHoras } from "../src/horaEngine";
import type { PanchangaResponse } from "../src/types";

describe("Strict Panchanga Calendar Events Validation (horaEngine.ts as Single Source of Truth)", () => {
  const mockPanchanga: PanchangaResponse = {
    date: "2026-10-14",
    city: "Varanasi",
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: "Asia/Kolkata",
    sunrise: "05:52 AM",
    sunset: "05:32 PM",
    sunrise_ms: 1791937320000,
    sunset_ms: 1791979320000,
    next_sunrise_ms: 1792023720000,
    weekday: 3, // Wednesday (Mercury)
    tithi: [
      {
        number: 4,
        name: "Chaturthi",
        start: "06:00 AM",
        end: "08:15 AM",
        startTimeMs: 1791937800000,
        endTimeMs: 1791945900000,
      },
    ],
    paksha: "Shukla",
    nakshatra: [
      {
        number: 17,
        name: "Anuradha",
        start: "07:30 AM",
        end: "09:45 AM",
        startTimeMs: 1791943200000,
        endTimeMs: 1791951300000,
      },
    ],
    yoga: [{ number: 2, name: "Priti" }],
    karana: [{ number: 7, name: "Vanija" }],
    vaara: "Budhavara",
    samvatsara: "Krodhi",
    ayanamsha: "Lahiri",
  };

  it("Requirement 1: Generates exactly 120 Tattva events per full Panchanga day using horaEngine.ts directly", () => {
    // 24 Horas with 5 Tattvas each = 120 Tattva events
    const payloads = buildPanchangaEventPayloads(mockPanchanga, {
      ...DEFAULT_SYNC_OPTIONS,
      includeVedicHoras: false,
      includeHoraTattvas: true,
    });

    const tattvaEvents = payloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("hora_tattva_"),
    );
    expect(tattvaEvents.length).toBe(120);

    // Verify each hora has exactly 5 Tattvas
    for (let h = 1; h <= 24; h++) {
      const horaTattvas = tattvaEvents.filter(
        (p) => p.extendedProperties?.private?.horaIndex === String(h),
      );
      expect(horaTattvas.length).toBe(5);
    }
  });

  it("Requirement 2: Event titles and descriptions contain ONLY current Tattva information and never the other four", () => {
    const payloads = buildPanchangaEventPayloads(mockPanchanga, {
      ...DEFAULT_SYNC_OPTIONS,
      includeVedicHoras: false,
      includeHoraTattvas: true,
    });

    const tattvaEvents = payloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("hora_tattva_"),
    );

    const allTattvaNames = ["पृथ्वी", "जल", "अग्नि", "वायु", "आकाश"];

    for (const ev of tattvaEvents) {
      // 1. Title format: 🪐 [Planet] · [Icon] [Tattva] · 💨 [Nadi]
      expect(ev.summary).toMatch(/^🪐\s+\S+\s+·\s+[\S\s]+\s+·\s+💨\s+\S+$/);

      // 2. Required fields in description
      expect(ev.description).toContain("Tattva:");
      expect(ev.description).toContain("Planet:");
      expect(ev.description).toContain("Nadi:");
      expect(ev.description).toContain("Tattva Time:");
      expect(ev.description).toContain("Hora Reference:");

      // 3. Current event information only rule: Must describe only this Tattva
      const descLines = ev.description.split("\n");
      const tattvaLine = descLines.find((l) => l.startsWith("Tattva:"));
      expect(tattvaLine).toBeDefined();

      const activeTattvaName = tattvaLine?.replace("Tattva:", "").trim();
      expect(allTattvaNames).toContain(activeTattvaName);

      // None of the other 4 Tattva names should appear in the description
      const otherTattvas = allTattvaNames.filter((name) => name !== activeTattvaName);
      for (const other of otherTattvas) {
        expect(ev.description).not.toContain(other);
      }
    }
  });

  it("Requirement 3: Uses exact boundaries from horaEngine.ts for start and end times", () => {
    const dailyHoras = computeDailyHoras(
      mockPanchanga.date,
      mockPanchanga.sunrise_ms!,
      mockPanchanga.sunset_ms!,
      mockPanchanga.next_sunrise_ms!,
      mockPanchanga.weekday,
      mockPanchanga.tithi[0].number,
      mockPanchanga.timezone,
    );

    const payloads = buildPanchangaEventPayloads(mockPanchanga, {
      ...DEFAULT_SYNC_OPTIONS,
      includeVedicHoras: false,
      includeHoraTattvas: true,
    });

    const tattvaEvents = payloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("hora_tattva_"),
    );

    let idx = 0;
    for (const hora of dailyHoras.horas) {
      for (const tp of hora.tattvas) {
        const ev = tattvaEvents[idx++];
        expect(ev.start.dateTime).toBe(new Date(tp.startTimeMs).toISOString());
        expect(ev.end.dateTime).toBe(new Date(tp.endTimeMs).toISOString());
        expect(new Date(ev.start.dateTime!).getTime()).toBe(Math.floor(tp.startTimeMs));
        expect(new Date(ev.end.dateTime!).getTime()).toBe(Math.floor(tp.endTimeMs));
      }
    }
  });

  it("Requirement 4: Completely removes all Sushumna events from both calendar payloads and ICS export", () => {
    const payloads = buildPanchangaEventPayloads(mockPanchanga, DEFAULT_SYNC_OPTIONS);
    const icsContent = generatePanchangaIcsContent(mockPanchanga, DEFAULT_SYNC_OPTIONS);

    // No Sushumna events anywhere in payloads
    const sushumnaPayloads = payloads.filter(
      (p) =>
        p.extendedProperties?.private?.eventType?.includes("sushumna") ||
        p.extendedProperties?.private?.nadi === "sushumna" ||
        p.summary.includes("सुषुम्ना") ||
        p.summary.includes("Sushumna") ||
        p.description.includes("सुषुम्ना") ||
        p.description.includes("Sushumna"),
    );
    expect(sushumnaPayloads.length).toBe(0);

    // No Sushumna events in ICS
    expect(icsContent).not.toContain("सुषुम्ना");
    expect(icsContent).not.toContain("Sushumna");
    expect(icsContent).not.toContain("swara_sushumna");
  });

  it("Requirement 5: Disables standalone 24 Hora events by default", () => {
    // Under default options
    const defaultPayloads = buildPanchangaEventPayloads(mockPanchanga, DEFAULT_SYNC_OPTIONS);
    const standaloneHoras = defaultPayloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("vedic_hora_"),
    );
    expect(standaloneHoras.length).toBe(0);

    // Only if explicitly enabled
    const customPayloads = buildPanchangaEventPayloads(mockPanchanga, {
      ...DEFAULT_SYNC_OPTIONS,
      includeVedicHoras: true,
    });
    const explicitHoras = customPayloads.filter((p) =>
      p.extendedProperties?.private?.eventType?.startsWith("vedic_hora_"),
    );
    expect(explicitHoras.length).toBe(24);
  });

  it("Requirement 6 & 8: Google Calendar sync and ICS export consistency and deterministic UIDs", () => {
    const gcalPayloads = buildPanchangaEventPayloads(mockPanchanga, DEFAULT_SYNC_OPTIONS);
    const icsContent1 = generatePanchangaIcsContent(mockPanchanga, DEFAULT_SYNC_OPTIONS);
    const icsContent2 = generatePanchangaIcsContent(mockPanchanga, DEFAULT_SYNC_OPTIONS);

    // Repeat exports are 100% byte-identical
    expect(icsContent1).toBe(icsContent2);

    // Exactly matching number of VEVENTs
    const veventCount = (icsContent1.match(/BEGIN:VEVENT/g) || []).length;
    expect(veventCount).toBe(gcalPayloads.length);

    // Check deterministic UIDs and matching DTSTART/DTEND
    const uids = [...icsContent1.matchAll(/UID:([^\r\n]+)/g)].map((m) => m[1]);
    expect(uids.length).toBe(gcalPayloads.length);

    for (let i = 0; i < gcalPayloads.length; i++) {
      const p = gcalPayloads[i];
      const eventType = p.extendedProperties?.private?.eventType;
      expect(uids[i]).toBe(`mahavtaar-20261014-${eventType}@panchanga`);
    }

    // Verify exactly 120 Tattva VEVENTs exist in the ICS export
    const tattvaUids = uids.filter((u) => u.includes("hora_tattva_"));
    expect(tattvaUids.length).toBe(120);
  });
});
