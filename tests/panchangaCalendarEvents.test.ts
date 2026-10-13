import { describe, it, expect } from "vitest";
import {
  buildPanchangaEventPayloads,
  generatePanchangaIcsContent,
  DEFAULT_SYNC_OPTIONS,
  parseDateComponents,
  safeIsoString,
  syncMultiDayPanchangaEvents,
  listPanchangaEvents,
  deletePanchangaEventsForDate,
  syncDailyPanchangaEvents,
  escapeIcsText,
  foldIcsLine,
  clearCalendarCache,
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

  it("Critical Fix: parseDateComponents correctly parses dates without local-time zone shifts", () => {
    const p1 = parseDateComponents("2026-10-14");
    expect(p1).toEqual({ year: 2026, month: 10, day: 14 });

    const p2 = parseDateComponents("14/10/2026");
    expect(p2).toEqual({ year: 2026, month: 10, day: 14 });

    const p3 = parseDateComponents("28/02/2026");
    expect(p3).toEqual({ year: 2026, month: 2, day: 28 });
  });

  it("Critical Fix: safeIsoString throws strict error on invalid timestamps instead of returning current time", () => {
    expect(() => safeIsoString(NaN)).toThrow("Invalid timestamp provided");
    expect(() => safeIsoString(null)).toThrow("Invalid timestamp provided");
    expect(() => safeIsoString(undefined)).toThrow("Invalid timestamp provided");

    const validIso = safeIsoString(1791937320000);
    expect(validIso).toBe("2026-10-14T00:22:00.000Z");
  });

  it("Critical Fix: syncMultiDayPanchangaEvents calculates each requested date independently", async () => {
    const datesRequested: string[] = [];

    // Custom provider that records fetched dates and returns distinct astronomical values per day
    const customFetch = async (dateStr: string): Promise<PanchangaResponse> => {
      datesRequested.push(dateStr);
      const parts = dateStr.split("-").map(Number);
      const dayNum = parts[2];
      // Vary sunrise and sunset realistically for each day rather than adding fixed 24h
      const dayOffset = dayNum - 14;
      return {
        ...mockPanchanga,
        date: dateStr,
        sunrise_ms: 1791937320000 + dayOffset * 86400000 + dayOffset * 60000,
        sunset_ms: 1791979320000 + dayOffset * 86400000 + dayOffset * 120000,
        next_sunrise_ms: 1792023720000 + dayOffset * 86400000 + dayOffset * 60000,
      };
    };

    const dummyToken = "mock_token";
    // Mock global fetch for getOrCreatePanchangCalendarId and listPanchangaEvents
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL) => {
      const urlStr = String(url);
      if (urlStr.includes("calendarList")) {
        return {
          ok: true,
          json: async () => ({ items: [{ id: "panchang_cal_123", summary: "Panchang Calendar" }] }),
        } as Response;
      }
      if (urlStr.includes("/events")) {
        return {
          ok: true,
          json: async () => ({ items: [] }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    }) as any;

    try {
      const result = await syncMultiDayPanchangaEvents(
        dummyToken,
        mockPanchanga,
        3, // 3 days ahead
        DEFAULT_SYNC_OPTIONS,
        undefined,
        customFetch,
      );

      // Prove day 1 (index 0) uses base date, and days 2 & 3 call customFetch with distinct independent dates
      expect(datesRequested).toEqual(["2026-10-15", "2026-10-16"]);
      expect(result.failedDays.length).toBe(0);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("Critical Fix: syncMultiDayPanchangaEvents tracks failed calculation dates cleanly without generating fake events", async () => {
    const customFailingFetch = async (_dateStr: string): Promise<PanchangaResponse | null> => {
      return null; // calculation failed for date
    };

    const dummyToken = "mock_token";
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL) => {
      const urlStr = String(url);
      if (urlStr.includes("calendarList")) {
        return {
          ok: true,
          json: async () => ({ items: [{ id: "panchang_cal_123", summary: "Panchang Calendar" }] }),
        } as Response;
      }
      if (urlStr.includes("/events")) {
        return {
          ok: true,
          json: async () => ({ items: [] }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    }) as any;

    try {
      const result = await syncMultiDayPanchangaEvents(
        dummyToken,
        mockPanchanga,
        3,
        DEFAULT_SYNC_OPTIONS,
        undefined,
        customFailingFetch,
      );

      // Days 2 and 3 failed to calculate, so they are cleanly tracked in failedDays and skipped
      expect(result.failedDays).toEqual(["2026-10-15", "2026-10-16"]);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("Deletion Safety: Never lists or deletes user events matching title strings unless owned by mahavtaar_panchanga", async () => {
    const deletedEventIds: string[] = [];
    const origFetch = globalThis.fetch;

    globalThis.fetch = (async (url: string | URL, opts?: any) => {
      const urlStr = String(url);
      const method = opts?.method || "GET";

      if (urlStr.includes("calendarList")) {
        return {
          ok: true,
          json: async () => ({ items: [{ id: "panchang_cal_123", summary: "Panchang Calendar" }] }),
        } as Response;
      }

      if (urlStr.includes("/events") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            items: [
              // 1. App-owned event (source === mahavtaar_panchanga)
              {
                id: "app_event_1",
                summary: "🪐 सूर्य · 🔮 आकाश · 💨 पिंगला",
                extendedProperties: {
                  private: { source: "mahavtaar_panchanga", eventType: "hora_tattva_1_0" },
                },
              },
              // 2. Unrelated USER event titled "Hora Meeting with Client"
              {
                id: "user_event_hora",
                summary: "Hora Meeting with Client",
              },
              // 3. Unrelated USER event titled "Tattva Meditation Class"
              {
                id: "user_event_tattva",
                summary: "Tattva Meditation Class",
              },
              // 4. Unrelated USER event titled "Sunrise Fitness Run"
              {
                id: "user_event_sunrise",
                summary: "Sunrise Fitness Run",
              },
              // 5. Unrelated USER event titled "Sunset Dinner at Taj"
              {
                id: "user_event_sunset",
                summary: "Sunset Dinner at Taj",
              },
            ],
          }),
        } as Response;
      }

      if (method === "DELETE") {
        const id = urlStr.split("/").pop();
        if (id) deletedEventIds.push(id);
        return { ok: true, status: 204 } as Response;
      }

      return { ok: true, json: async () => ({}) } as Response;
    }) as any;

    try {
      clearCalendarCache();
      const events = await listPanchangaEvents("mock_token", "2026-10-14");

      // Verify listPanchangaEvents ONLY returned the app-owned event
      expect(events.length).toBe(1);
      expect(events[0].id).toBe("app_event_1");

      // Execute bulk delete for the date
      await deletePanchangaEventsForDate("mock_token", "2026-10-14");

      // Prove ONLY app_event_1 was deleted, and NO user events were touched
      expect(deletedEventIds).toEqual(["app_event_1"]);
      expect(deletedEventIds).not.toContain("user_event_hora");
      expect(deletedEventIds).not.toContain("user_event_tattva");
      expect(deletedEventIds).not.toContain("user_event_sunrise");
      expect(deletedEventIds).not.toContain("user_event_sunset");
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("Idempotent Synchronization & Reconciliation: Identical re-sync performs 0 writes and marks all as unchanged", async () => {
    let postCount = 0;
    let putCount = 0;
    const origFetch = globalThis.fetch;

    // Generate payloads for mockPanchanga
    const payloads = buildPanchangaEventPayloads(mockPanchanga, DEFAULT_SYNC_OPTIONS);
    const existingItems = payloads.map((p, i) => ({
      id: `existing_${i}`,
      summary: p.summary,
      description: p.description,
      location: p.location,
      start: p.start,
      end: p.end,
      extendedProperties: p.extendedProperties,
    }));

    globalThis.fetch = (async (url: string | URL, opts?: any) => {
      const urlStr = String(url);
      const method = opts?.method || "GET";

      if (urlStr.includes("calendarList")) {
        return {
          ok: true,
          json: async () => ({ items: [{ id: "panchang_cal_123", summary: "Panchang Calendar" }] }),
        } as Response;
      }

      if (urlStr.includes("/events") && method === "GET") {
        return {
          ok: true,
          json: async () => ({ items: existingItems }),
        } as Response;
      }

      if (method === "POST") {
        postCount++;
        return { ok: true, json: async () => ({ id: `new_${postCount}` }) } as Response;
      }

      if (method === "PUT") {
        putCount++;
        return { ok: true, json: async () => ({ id: "updated" }) } as Response;
      }

      return { ok: true, json: async () => ({}) } as Response;
    }) as any;

    try {
      clearCalendarCache();
      const res = await syncDailyPanchangaEvents("mock_token", mockPanchanga, DEFAULT_SYNC_OPTIONS);

      // Prove 100% idempotency: all payloads matched and were unchanged, 0 POSTs, 0 PUTs
      expect(res.unchanged).toBe(payloads.length);
      expect(res.created.length).toBe(0);
      expect(res.updated.length).toBe(0);
      expect(postCount).toBe(0);
      expect(putCount).toBe(0);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it("RFC 5545 Compliance: Correct text escaping, line folding, and all-day DTEND exclusive date math", () => {
    // 1. Text Escaping
    const escaped = escapeIcsText("Line 1\nLine 2; with, backslash\\");
    expect(escaped).toBe("Line 1\\nLine 2\\; with\\, backslash\\\\");

    // 2. Line Folding (UTF-8 octets without splitting multibyte Hindi/Emoji characters)
    const longLine =
      "SUMMARY:This is a very long summary line that exceeds 75 characters in total length for RFC 5545 compliance testing";
    const folded = foldIcsLine(longLine);
    expect(folded).toContain("\r\n ");

    const hindiEmojiLine =
      "SUMMARY:🪐 सूर्य · 🌍 पृथ्वी · 💨 पिंगला (वैदिक होरा एवं सूक्ष्म पंच तत्त्व विवरण)";
    const hindiFolded = foldIcsLine(hindiEmojiLine);
    expect(hindiFolded).toContain("\r\n ");
    expect(hindiFolded).not.toContain("\uFFFD");

    // 3. All-Day Event DTEND
    const allDayPanchanga: PanchangaResponse = {
      ...mockPanchanga,
    };
    const optionsWithSummary: SyncOptions = {
      ...DEFAULT_SYNC_OPTIONS,
      includeDailySummary: true,
      includeHoraTattvas: false,
    };

    const icsContent = generatePanchangaIcsContent(allDayPanchanga, optionsWithSummary);
    expect(icsContent).toContain("DTSTART;VALUE=DATE:20261014");
    expect(icsContent).toContain("DTEND;VALUE=DATE:20261015"); // Exclusive start + 1 day
  });

  it("Auth Failure: Throws actionable error when Google Calendar API returns 401 or 403", async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL) => {
      const urlStr = String(url);
      if (urlStr.includes("calendarList")) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: { message: "Invalid Credentials" } }),
        } as Response;
      }
      return { ok: false, status: 401 } as Response;
    }) as any;

    try {
      clearCalendarCache();
      await expect(listPanchangaEvents("expired_token", "2026-10-14")).rejects.toThrow(
        "Authentication expired or permission revoked",
      );
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});
