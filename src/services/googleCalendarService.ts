/**
 * Google Calendar Integration Service for Mahavtaar Panchanga
 * Connects to Google Calendar REST API v3 to sync daily events, muhurtas, and tithi transitions
 */

import { PanchangaResponse, TimingInterval } from "../types";
import { computeSwaraYoga } from "../swaraYoga";
import { computeDailyHoras } from "../horaEngine";
import { normalizeDailySchedule } from "../lib/dailyScheduleNormalizer";

export interface CalendarEventPayload {
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: "popup" | "email"; minutes: number }>;
  };
  colorId?: string; // 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana, 6: Tangerine, 7: Peacock, 8: Graphite, 9: Blueberry, 10: Basil, 11: Tomato
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export interface SyncedCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  colorId?: string;
  htmlLink?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  eventType?: string;
  dateStr?: string;
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

interface GoogleCalendarApiItem {
  id: string;
  summary?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export interface SyncOptions {
  includeDailySummary: boolean;
  includeBrahmaMuhurta: boolean;
  includeAbhijitMuhurta: boolean;
  includeAmritKala: boolean;
  includeRahuKala: boolean;
  includeYamaganda: boolean;
  includeGulikaKala: boolean;
  includeTithiEvent: boolean;
  // Classical Swara Yoga (शिवस्वरोदय) options
  includeSwaraSunrise: boolean; // Sunrise & Sunset Swara Windows (1-hour Classical Windows)
  includeSwaraCelestialWindows: boolean; // Midday, Moonrise & Moonset Swara Windows
  includeSwaraTransitions: boolean; // Tithi & Nakshatra Swara Transitions (60-min boundary shifts)
  includeSwaraHourlyCycles: boolean; // 24-Hour Alternating Hourly Swara Cycles
  includeSwaraIda: boolean; // Explicit Ida Swara (Left Nostril / Lunar) timing events
  includeSwaraPingala: boolean; // Explicit Pingala Swara (Right Nostril / Solar) timing events
  includeSwaraSushumna?: boolean; // Sushumna events disabled & removed per Vedic requirements
  // Vedic Horas & Hora Nadi (वैदिक होरा चक्र) options
  includeVedicHoras: boolean; // 24 Vedic Horas with Planet, Nadi & Pancha Tattvas (disabled by default)
  includeHoraTattvas: boolean; // Individual Micro Pancha Tattva periods within Horas (120 events)
  maxHoras?: number; // How many hours/Horas to include (1-24, default 24 = full day)
  reminderMinutes: number; // e.g. 15
}

export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  includeDailySummary: true,
  includeBrahmaMuhurta: true,
  includeAbhijitMuhurta: true,
  includeAmritKala: false,
  includeRahuKala: true,
  includeYamaganda: false,
  includeGulikaKala: false,
  includeTithiEvent: true,
  includeSwaraSunrise: true,
  includeSwaraCelestialWindows: true,
  includeSwaraTransitions: true,
  includeSwaraHourlyCycles: false,
  includeSwaraIda: true,
  includeSwaraPingala: true,
  includeSwaraSushumna: false, // Sushumna events completely disabled
  includeVedicHoras: false, // Standalone Hora events disabled by default
  includeHoraTattvas: true, // Individual Tattva events enabled by default
  maxHoras: 24, // Full 24 Horas / Hours by default
  reminderMinutes: 15,
};

/**
 * Safely parses any date string into year, month (1-indexed), and day components without timezone shifts.
 */
export function parseDateComponents(dateStr: string | undefined): {
  year: number;
  month: number;
  day: number;
} {
  if (!dateStr) {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() };
  }
  const clean = dateStr.trim();
  if (clean.includes("-")) {
    const parts = clean.split("-").map(Number);
    if (parts.length === 3 && parts[0] > 1000) {
      return { year: parts[0], month: parts[1], day: parts[2] };
    }
  }
  if (clean.includes("/")) {
    const parts = clean.split("/").map(Number);
    if (parts.length === 3) {
      if (parts[2] > 1000) {
        // DD/MM/YYYY
        return { year: parts[2], month: parts[1], day: parts[0] };
      } else if (parts[0] > 1000) {
        // YYYY/MM/DD
        return { year: parts[0], month: parts[1], day: parts[2] };
      }
    }
  }
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() };
}

/**
 * Normalizes any date string (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) into standard YYYY-MM-DD without UTC shifts.
 */
export function normalizeToIsoDate(dateStr: string | undefined): string {
  const { year, month, day } = parseDateComponents(dateStr);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Safely converts a timestamp in milliseconds to an ISO 8601 string.
 * Strictly validates the timestamp and throws or handles invalid numbers instead of falling back to Date.now().
 */
export function safeIsoString(ms: number | undefined | null, fallbackMs?: number): string {
  if (typeof ms === "number" && !isNaN(ms) && isFinite(ms) && ms > 0) {
    try {
      return new Date(ms).toISOString();
    } catch {
      // ignore
    }
  }
  if (
    typeof fallbackMs === "number" &&
    !isNaN(fallbackMs) &&
    isFinite(fallbackMs) &&
    fallbackMs > 0
  ) {
    try {
      return new Date(fallbackMs).toISOString();
    } catch {
      // ignore
    }
  }
  throw new Error(`Invalid timestamp provided: ${ms}`);
}

/**
 * Accurately parses a time string in the target IANA timezone into UTC milliseconds.
 */
export function parseTimeToUtcMs(dateStr: string, timeStr: string, timezone: string): number {
  const isoDate = normalizeToIsoDate(dateStr);
  if (!timeStr) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  }

  const clean = timeStr.trim();
  const ampmMatch = clean.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!ampmMatch) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  }

  let hours = parseInt(ampmMatch[1], 10);
  const minutes = parseInt(ampmMatch[2], 10);
  const seconds = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
  const ampm = ampmMatch[4]?.toUpperCase();

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  const isoLocal = `${isoDate}T${hh}:${mm}:${ss}`;

  try {
    const utcGuess = new Date(`${isoLocal}Z`);
    if (isNaN(utcGuess.getTime())) {
      return Date.now();
    }
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(utcGuess);
    const p: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== "literal") {
        p[part.type] = parseInt(part.value, 10);
      }
    }
    let h = p.hour;
    if (h === 24) h = 0;
    const asLocalMs = Date.UTC(p.year, p.month - 1, p.day, h, p.minute, p.second);
    const offsetMs = asLocalMs - utcGuess.getTime();
    const result = utcGuess.getTime() - offsetMs;
    return isNaN(result) ? Date.now() : result;
  } catch {
    const fallback = new Date(isoLocal).getTime();
    return isNaN(fallback) ? Date.now() : fallback;
  }
}

/**
 * Timezone-aware 12-hour formatted time (e.g. "06:14 AM") without ever throwing "Invalid time value"
 */
export function formatTimeInZone(ms: number | undefined | null, timezone: string): string {
  if (typeof ms !== "number" || isNaN(ms) || !isFinite(ms)) {
    return "--:--";
  }
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(ms));
  } catch {
    try {
      return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  }
}

/**
 * Converts a time string or timestamp into an ISO string with timezone
 */
function buildDateTimeIso(
  dateStr: string,
  timeStr: string | undefined,
  timestampMs: number | undefined,
  timezone: string,
): string {
  if (typeof timestampMs === "number" && !isNaN(timestampMs) && isFinite(timestampMs)) {
    return safeIsoString(timestampMs);
  }

  const isoDate = normalizeToIsoDate(dateStr);
  if (!timeStr) {
    return `${isoDate}T12:00:00Z`;
  }

  const ms = parseTimeToUtcMs(isoDate, timeStr, timezone);
  return safeIsoString(ms);
}

let cachedPanchangCalendarId: string | null = null;

/**
 * Resets cached calendar ID on logout or account switch
 */
export function clearCalendarCache(): void {
  cachedPanchangCalendarId = null;
}

/**
 * Retrieves or creates a dedicated secondary Google Calendar named "Panchang Calendar".
 */
export async function getOrCreatePanchangCalendarId(token: string): Promise<string> {
  if (cachedPanchangCalendarId) return cachedPanchangCalendarId;

  try {
    const listRes = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (listRes.status === 401 || listRes.status === 403) {
      throw new Error(
        "Authentication expired or permission revoked. Please reconnect Google Calendar.",
      );
    }

    if (listRes.ok) {
      const listData = await listRes.json();
      const items = listData.items || [];
      const found = items.find(
        (c: { summary?: string; id?: string }) =>
          c.summary === "Panchang Calendar" ||
          c.summary === "Panchanga Calendar" ||
          c.summary === "Mahavtaar Panchang Calendar" ||
          c.summary === "पंचांग कैलेंडर",
      );

      if (found && found.id) {
        cachedPanchangCalendarId = found.id;
        return found.id;
      }
    }

    // Create secondary calendar named "Panchang Calendar"
    const createRes = await fetch("https://www.googleapis.com/calendar/v3/calendars", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        summary: "Panchang Calendar",
        description:
          "Continuous Panchanga, Swara Yoga, Nadi, Tattva & Planetary Horas by Mahavtaar Panchanga",
        timeZone: "Asia/Kolkata",
      }),
    });

    if (createRes.status === 401 || createRes.status === 403) {
      throw new Error(
        "Authentication expired or permission revoked. Please reconnect Google Calendar.",
      );
    }

    if (createRes.ok) {
      const createdData = await createRes.json();
      if (createdData.id) {
        cachedPanchangCalendarId = createdData.id;
        return createdData.id;
      }
    }
  } catch (err: unknown) {
    if ((err as Error)?.message?.includes("Authentication expired")) throw err;
    console.warn("Could not retrieve/create Panchang Calendar, using primary:", err);
  }

  return "primary";
}

/**
 * List events created by Mahavtaar Panchanga in Panchang Calendar.
 * Strictly verifies application ownership via extendedProperties.private.source === "mahavtaar_panchanga".
 * Never returns or deletes unrelated user events matching title strings.
 */
export async function listPanchangaEvents(
  token: string,
  startDateStr: string,
  endDateStr?: string,
  customCalendarId?: string,
): Promise<SyncedCalendarEvent[]> {
  const calId = customCalendarId || (await getOrCreatePanchangCalendarId(token));
  const isoStart = normalizeToIsoDate(startDateStr);
  const isoEnd = normalizeToIsoDate(endDateStr || startDateStr);
  const timeMin = safeIsoString(new Date(`${isoStart}T00:00:00Z`).getTime());
  const timeMax = safeIsoString(new Date(`${isoEnd}T23:59:59Z`).getTime());

  const items: GoogleCalendarApiItem[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`,
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("maxResults", "2500");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Authentication expired or permission revoked. Please reconnect Google Calendar.",
      );
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || `Failed to fetch events from Google Calendar (${res.status})`,
      );
    }

    const data = await res.json();
    if (Array.isArray(data.items)) {
      items.push(...data.items);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Strict ownership verification: MUST match extendedProperties.private.source === "mahavtaar_panchanga"
  return items
    .filter(
      (item: GoogleCalendarApiItem) =>
        item.extendedProperties?.private?.source === "mahavtaar_panchanga",
    )
    .map((item: GoogleCalendarApiItem) => ({
      id: item.id,
      summary: item.summary || "",
      description: (item as any).description || "",
      location: (item as any).location || "",
      colorId: (item as any).colorId,
      htmlLink: item.htmlLink,
      start: { dateTime: item.start?.dateTime, date: item.start?.date },
      end: { dateTime: item.end?.dateTime, date: item.end?.date },
      eventType: item.extendedProperties?.private?.eventType,
      dateStr: item.extendedProperties?.private?.date,
      extendedProperties: item.extendedProperties,
    }));
}

/**
 * Create a single event in user's Panchang Calendar
 */
export async function createCalendarEvent(
  token: string,
  payload: CalendarEventPayload,
  customCalendarId?: string,
): Promise<SyncedCalendarEvent> {
  const calId = customCalendarId || (await getOrCreatePanchangCalendarId(token));
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Authentication expired or permission revoked. Please reconnect Google Calendar.",
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Failed to create Google Calendar event (${res.status})`,
    );
  }

  const item = await res.json();
  return {
    id: item.id,
    summary: item.summary,
    description: item.description,
    location: item.location,
    htmlLink: item.htmlLink,
    start: item.start,
    end: item.end,
    eventType: item.extendedProperties?.private?.eventType,
    dateStr: item.extendedProperties?.private?.date,
  };
}

/**
 * Update an existing event in user's Panchang Calendar (PUT reconciliation)
 */
export async function updateCalendarEvent(
  token: string,
  eventId: string,
  payload: CalendarEventPayload,
  customCalendarId?: string,
): Promise<SyncedCalendarEvent> {
  const calId = customCalendarId || (await getOrCreatePanchangCalendarId(token));
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(eventId)}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Authentication expired or permission revoked. Please reconnect Google Calendar.",
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Failed to update Google Calendar event (${res.status})`,
    );
  }

  const item = await res.json();
  return {
    id: item.id,
    summary: item.summary,
    description: item.description,
    location: item.location,
    htmlLink: item.htmlLink,
    start: item.start,
    end: item.end,
    eventType: item.extendedProperties?.private?.eventType,
    dateStr: item.extendedProperties?.private?.date,
  };
}

/**
 * Delete a single event by ID from Panchang Calendar
 */
export async function deleteCalendarEvent(
  token: string,
  eventId: string,
  customCalendarId?: string,
): Promise<boolean> {
  const calId = customCalendarId || (await getOrCreatePanchangCalendarId(token));
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(eventId)}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Failed to delete Google Calendar event (${res.status})`,
    );
  }

  return true;
}

/**
 * Deletes all events previously synced by Mahavtaar Panchanga for a date
 */
export async function deletePanchangaEventsForDate(
  token: string,
  dateStr: string,
): Promise<number> {
  const events = await listPanchangaEvents(token, dateStr);
  let count = 0;
  for (const ev of events) {
    await deleteCalendarEvent(token, ev.id);
    count++;
  }
  return count;
}

/**
 * Generate event payloads from PanchangaResponse
 */
export function buildPanchangaEventPayloads(
  data: PanchangaResponse,
  options: SyncOptions,
): CalendarEventPayload[] {
  const payloads: CalendarEventPayload[] = [];
  const isoDate = normalizeToIsoDate(data.date);
  const dateStr = isoDate;
  const tz = data.timezone || "Asia/Kolkata";
  const city = data.city || "India";

  const tithiStr = data.tithi?.map((t) => t.name).join(" / ") || "Tithi";
  const nakshatraStr = data.nakshatra?.map((n) => n.name).join(" / ") || "Nakshatra";
  const yogaStr = data.yoga?.map((y) => y.name).join(" / ") || "Yoga";
  const karanaStr = data.karana?.map((k) => k.name).join(" / ") || "Karana";

  // 1. All-Day Daily Panchanga Overview
  if (options.includeDailySummary) {
    const descriptionLines = [
      `🗓️ दैनिक वैदिक पंचांग (Drik Panchanga) — ${city}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• तिथि (Tithi): ${tithiStr} (${data.paksha} पक्ष)`,
      `• नक्षत्र (Nakshatra): ${nakshatraStr}`,
      `• योग (Yoga): ${yogaStr}`,
      `• करण (Karana): ${karanaStr}`,
      `• वार (Vaara): ${data.vaara}`,
      `• मास (Masa): ${data.masa} (संवत्सर: ${data.samvatsara})`,
      `• सूर्योदय (Sunrise): ${data.sunrise} | सूर्यास्त (Sunset): ${data.sunset}`,
      `• चन्द्र राशि (Moon Sign): ${data.moon_rasi} | सूर्य राशि (Sun Sign): ${data.sun_rasi}`,
      ``,
      `✨ शुभ मुहूर्त (Auspicious):`,
      `• अभिजित मुहूर्त (Abhijit): ${data.abhijit_muhurta?.start || "--"} से ${data.abhijit_muhurta?.end || "--"}`,
      `• ब्रह्म मुहूर्त (Brahma): ${data.brahma_muhurta?.start || "--"} से ${data.brahma_muhurta?.end || "--"}`,
      ``,
      `⚠️ अशुभ काल (Inauspicious):`,
      `• राहु काल (Rahu Kalam): ${data.rahu_kala?.start || "--"} से ${data.rahu_kala?.end || "--"}`,
      `• यमघण्ट (Yamaganda): ${data.yamaganda?.start || "--"} से ${data.yamaganda?.end || "--"}`,
      `• गुलिक काल (Gulika): ${data.gulika_kala?.start || "--"} से ${data.gulika_kala?.end || "--"}`,
      ``,
      `📍 स्थान (Location): ${city}`,
      `गणना स्रोत: Mahavtaar Panchanga (High-Precision Drik Observational Engine)`,
    ];

    payloads.push({
      summary: `पंचांग: ${tithiStr} • ${nakshatraStr}`,
      description: descriptionLines.join("\n"),
      location: city,
      start: { date: isoDate },
      end: { date: isoDate },
      colorId: "5", // Yellow / Golden
      extendedProperties: {
        private: {
          source: "mahavtaar_panchanga",
          eventType: "panchanga_summary",
          date: isoDate,
        },
      },
    });
  }

  // Helper for timed muhurta event
  const addTimedInterval = (
    interval: TimingInterval | undefined,
    baseTitle: string,
    desc: string,
    eventType: string,
    colorId: string,
  ) => {
    if (!interval || !interval.start || !interval.end) return;
    const startIso = buildDateTimeIso(isoDate, interval.start, interval.startTimeMs, tz);
    const endIso = buildDateTimeIso(isoDate, interval.end, interval.endTimeMs, tz);
    const timeRangeStr = `${interval.start} – ${interval.end}`;
    const summary = `${baseTitle} (${timeRangeStr})`;

    payloads.push({
      summary,
      description: `${desc}\n\n⏰ समय अवधि: ${timeRangeStr}\n📍 स्थान: ${city}\nस्रोत: Mahavtaar Panchanga`,
      location: city,
      start: { dateTime: startIso, timeZone: tz },
      end: { dateTime: endIso, timeZone: tz },
      colorId,
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: options.reminderMinutes }],
      },
      extendedProperties: {
        private: {
          source: "mahavtaar_panchanga",
          eventType,
          date: isoDate,
        },
      },
    });
  };

  // 2. Brahma Muhurta
  if (options.includeBrahmaMuhurta && data.brahma_muhurta) {
    addTimedInterval(
      data.brahma_muhurta,
      `🌅 ब्रह्म मुहूर्त`,
      `सर्वश्रेष्ठ ध्यान, प्राणायाम, मंत्र साधना एवं आत्मचिंतन का काल।`,
      "brahma_muhurta",
      "7", // Peacock blue
    );
  }

  // 3. Abhijit Muhurta
  if (options.includeAbhijitMuhurta && data.abhijit_muhurta) {
    addTimedInterval(
      data.abhijit_muhurta,
      `✨ अभिजित मुहूर्त`,
      `दिन का सर्वाधिक शुभ विजय मुहूर्त। सभी मांगलिक कार्यों एवं नवीन शुभारंभ के लिए प्रशस्त।`,
      "abhijit_muhurta",
      "6", // Tangerine / Orange
    );
  }

  // 4. Amrit Kalam
  if (options.includeAmritKala && Array.isArray(data.amrita_kala) && data.amrita_kala.length > 0) {
    data.amrita_kala.forEach((ak, idx) => {
      addTimedInterval(
        ak,
        `🌟 अमृत काल${data.amrita_kala.length > 1 ? ` #${idx + 1}` : ""}`,
        `अमृत सिद्धि प्रदायक शुभ समय।`,
        `amrita_kala_${idx}`,
        "10", // Basil / Green
      );
    });
  }

  // 5. Rahu Kalam (Inauspicious Warning)
  if (options.includeRahuKala && data.rahu_kala) {
    addTimedInterval(
      data.rahu_kala,
      `⚠️ राहु काल`,
      `अशुभ काल: इस समय में कोई भी नया कार्य, यात्रा अथवा शुभ कार्य प्रारंभ न करें।`,
      "rahu_kala",
      "11", // Tomato / Red
    );
  }

  // 6. Yamaganda
  if (options.includeYamaganda && data.yamaganda) {
    addTimedInterval(
      data.yamaganda,
      `⚠️ यमघण्ट काल`,
      `अशुभ काल: महत्वपूर्ण कार्यों से बचें।`,
      "yamaganda",
      "8", // Graphite / Grey
    );
  }

  // 7. Gulika Kalam
  if (options.includeGulikaKala && data.gulika_kala) {
    addTimedInterval(
      data.gulika_kala,
      `⚡ गुलिक काल`,
      `गुलिक काल: शनि पुत्र गुलिक का समय।`,
      "gulika_kala",
      "8",
    );
  }

  // 8. Primary Tithi Event (if ends during day)
  if (options.includeTithiEvent && data.tithi && data.tithi.length > 0) {
    const primaryTithi = data.tithi[0];
    const endsStr = primaryTithi.ends || primaryTithi.end;
    if (endsStr) {
      const tithiEndMs =
        typeof primaryTithi.endTimeMs === "number" && !isNaN(primaryTithi.endTimeMs)
          ? primaryTithi.endTimeMs
          : parseTimeToUtcMs(isoDate, endsStr, tz);
      const startMs = tithiEndMs - 30 * 60 * 1000;
      const startIso = safeIsoString(startMs);
      const endIso = safeIsoString(tithiEndMs);
      const startFormatted = formatTimeInZone(startMs, tz);
      const endFormatted = formatTimeInZone(tithiEndMs, tz);

      payloads.push({
        summary: `🌙 ${primaryTithi.name} तिथि (समाप्ति: ${endsStr})`,
        description: `${primaryTithi.name} (${data.paksha} पक्ष)\n\n⏰ समाप्ति समय: ${endsStr}\n⏱️ संधिकाल: ${startFormatted} – ${endFormatted}\n📍 स्थान: ${city}\nस्रोत: Mahavtaar Panchanga`,
        location: city,
        start: {
          dateTime: startIso,
          timeZone: tz,
        },
        end: {
          dateTime: endIso,
          timeZone: tz,
        },
        colorId: "3", // Grape / Violet
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "tithi_transition",
            date: isoDate,
          },
        },
      });
    }
  }

  // =========================================================================
  // SWARA YOGA (शिवस्वरोदय शास्त्रीय स्वर काल) EVENTS
  // =========================================================================
  try {
    const primaryTithiNum = data.tithi?.[0]?.number || 1;
    const swaraYoga = computeSwaraYoga(
      primaryTithiNum,
      data.sunrise,
      data.sunset,
      undefined,
      data.moonrise,
      data.moonset,
    );

    let sunriseMs = data.sunrise_ms || data.sunriseMs;
    if (!sunriseMs || isNaN(sunriseMs)) {
      sunriseMs = parseTimeToUtcMs(isoDate, data.sunrise, tz);
    }
    if (!sunriseMs || isNaN(sunriseMs)) {
      sunriseMs = new Date(`${isoDate}T06:00:00Z`).getTime();
    }

    let sunsetMs = data.sunset_ms || data.sunsetMs;
    if (!sunsetMs || isNaN(sunsetMs)) {
      sunsetMs = parseTimeToUtcMs(isoDate, data.sunset, tz);
    }
    if (!sunsetMs || isNaN(sunsetMs)) {
      sunsetMs = sunriseMs + 12 * 3600000;
    }

    const sunriseStartIso = safeIsoString(sunriseMs);
    const sunriseEndIso = safeIsoString(sunriseMs + 3600000);
    const sunriseStartFormatted = formatTimeInZone(sunriseMs, tz);
    const sunriseEndFormatted = formatTimeInZone(sunriseMs + 3600000, tz);

    const sunsetStartIso = safeIsoString(sunsetMs - 3600000);
    const sunsetEndIso = safeIsoString(sunsetMs);
    const sunsetStartFormatted = formatTimeInZone(sunsetMs - 3600000, tz);
    const sunsetEndFormatted = formatTimeInZone(sunsetMs, tz);

    let daytimeMs = sunsetMs - sunriseMs;
    if (daytimeMs <= 0 || isNaN(daytimeMs)) daytimeMs = 12 * 3600000;
    const middayMs = sunriseMs + Math.floor(daytimeMs / 2);
    const middayStartIso = safeIsoString(middayMs);
    const middayEndIso = safeIsoString(middayMs + 3600000);
    const middayStartFormatted = formatTimeInZone(middayMs, tz);
    const middayEndFormatted = formatTimeInZone(middayMs + 3600000, tz);

    // 9. Sunrise & Sunset Swara Windows (Classical 1-Hour Windows)
    if (options.includeSwaraSunrise) {
      // 9.1 Sunrise Swara (Starts at Sunrise, runs for 60 mins)
      const isSunriseIda = swaraYoga.sunriseSwara === "ida";
      const sunriseNadiTitle = isSunriseIda ? "इड़ा (चन्द्र / वाम)" : "पिंगला (सूर्य / दायाँ)";

      payloads.push({
        summary: `🌬️ सूर्योदय स्वर (${sunriseStartFormatted} – ${sunriseEndFormatted}): ${sunriseNadiTitle}`,
        description: [
          `🌬️ शिवस्वरोदय सूर्योदय स्वर काल (Classical Sunrise Swara Window)`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `• समय अवधि: ${sunriseStartFormatted} से ${sunriseEndFormatted} (${data.sunrise} से 1 घंटा)`,
          `• सक्रिय नाड़ी: ${isSunriseIda ? "इड़ा (चन्द्र नाड़ी / बायाँ नथुना)" : "पिंगला (सूर्य नाड़ी / दायाँ नथुना)"}`,
          `• शास्त्रीय प्रकृति: ${isSunriseIda ? "शीतल, सौम्य, अमृतमय एवं शुभप्रद" : "उष्ण, तेजस्वी, क्रियाशील एवं शौर्यवर्धक"}`,
          `• श्रेष्ठ कार्य: ${isSunriseIda ? "शुभ संकल्प, नवीन विद्या, शांति कर्म, जलपान, ध्यान एवं साधना।" : "भोजन, व्यायाम, वाद-विवाद, यात्रा आरंभ, कठिन कर्म एवं पराक्रम।"}`,
          ``,
          `📍 स्थान: ${city}`,
          `गणना स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
        ].join("\n"),
        location: city,
        start: { dateTime: sunriseStartIso, timeZone: tz },
        end: { dateTime: sunriseEndIso, timeZone: tz },
        colorId: isSunriseIda ? "7" : "6",
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "swara_sunrise",
            date: isoDate,
          },
        },
      });

      // 9.2 Sunset Swara (Starts 60 mins before Sunset, runs until Sunset)
      const isSunsetIda = swaraYoga.sunsetSwara === "ida";
      const sunsetNadiTitle = isSunsetIda ? "इड़ा (चन्द्र / वाम)" : "पिंगला (सूर्य / दायाँ)";

      payloads.push({
        summary: `🌅 सूर्यास्त स्वर (${sunsetStartFormatted} – ${sunsetEndFormatted}): ${sunsetNadiTitle}`,
        description: [
          `🌅 शिवस्वरोदय सूर्यास्त संधिकाल स्वर (Sunset Transition Swara Window)`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `• समय अवधि: ${sunsetStartFormatted} से ${sunsetEndFormatted} (${data.sunset} से 1 घंटा पूर्व)`,
          `• सक्रिय नाड़ी: ${isSunsetIda ? "इड़ा (चन्द्र नाड़ी / बायाँ नथुना)" : "पिंगला (सूर्य नाड़ी / दायाँ नथुना)"}`,
          `• शास्त्रीय महत्व: सांध्य संधिकाल में प्राण का संतुलन, प्राणायाम एवं संध्या वंदन।`,
          ``,
          `📍 स्थान: ${city}`,
          `गणना स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
        ].join("\n"),
        location: city,
        start: { dateTime: sunsetStartIso, timeZone: tz },
        end: { dateTime: sunsetEndIso, timeZone: tz },
        colorId: isSunsetIda ? "7" : "6",
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "swara_sunset",
            date: isoDate,
          },
        },
      });
    }

    // 10. Celestial Sandhya Windows (Midday, Moonrise, Moonset)
    if (options.includeSwaraCelestialWindows) {
      // 10.1 Midday Swara Window (Runs for 60 mins from Midday)
      const isMiddayIda = swaraYoga.sunriseSwara === "ida";
      const middayNadiTitle = isMiddayIda ? "इड़ा (चन्द्र / वाम)" : "पिंगला (सूर्य / दायाँ)";

      payloads.push({
        summary: `☀️ मध्याह्न स्वर (${middayStartFormatted} – ${middayEndFormatted}): ${middayNadiTitle}`,
        description: [
          `☀️ शिवस्वरोदय मध्याह्न स्वर काल (Midday Swara Window)`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `• समय अवधि: ${middayStartFormatted} से ${middayEndFormatted} (दोपहर से 1 घंटा)`,
          `• सक्रिय नाड़ी: ${isMiddayIda ? "इड़ा नाड़ी (चन्द्र / वाम)" : "पिंगला नाड़ी (सूर्य / दायाँ)"}`,
          `• प्रकृति: सूर्योदय स्वर के समान प्रवहमान`,
          ``,
          `📍 स्थान: ${city}`,
          `गणना स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
        ].join("\n"),
        location: city,
        start: { dateTime: middayStartIso, timeZone: tz },
        end: { dateTime: middayEndIso, timeZone: tz },
        colorId: "5",
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "swara_midday",
            date: isoDate,
          },
        },
      });

      // 10.2 Moonrise Swara Window
      if (data.moonrise && data.moonrise !== "--" && swaraYoga.moonriseWindow) {
        const moonriseMs = parseTimeToUtcMs(isoDate, data.moonrise, tz);
        if (moonriseMs && !isNaN(moonriseMs)) {
          const mrStartIso = safeIsoString(moonriseMs);
          const mrEndIso = safeIsoString(moonriseMs + 3600000);
          const mrStartFormatted = formatTimeInZone(moonriseMs, tz);
          const mrEndFormatted = formatTimeInZone(moonriseMs + 3600000, tz);
          const isMrIda = swaraYoga.moonriseSwara === "ida";
          const mrNadiTitle = isMrIda ? "इड़ा (बायाँ)" : "पिंगला (दायाँ)";

          payloads.push({
            summary: `🌙 चन्द्रोदय स्वर (${mrStartFormatted} – ${mrEndFormatted}): ${mrNadiTitle}`,
            description: [
              `🌙 शिवस्वरोदय चन्द्रोदय स्वर काल (Moonrise Swara Window)`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${mrStartFormatted} से ${mrEndFormatted} (${data.moonrise} से 1 घंटा)`,
              `• सक्रिय नाड़ी: ${isMrIda ? "इड़ा नाड़ी (चन्द्र / बायाँ)" : "पिंगला नाड़ी (सूर्य / दायाँ)"}`,
              ``,
              `📍 स्थान: ${city}`,
              `गणना स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
            ].join("\n"),
            location: city,
            start: { dateTime: mrStartIso, timeZone: tz },
            end: { dateTime: mrEndIso, timeZone: tz },
            colorId: "1",
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: options.reminderMinutes }],
            },
            extendedProperties: {
              private: {
                source: "mahavtaar_panchanga",
                eventType: "swara_moonrise",
                date: isoDate,
              },
            },
          });
        }
      }

      // 10.3 Moonset Swara Window
      if (data.moonset && data.moonset !== "--" && swaraYoga.moonsetWindow) {
        const moonsetMs = parseTimeToUtcMs(isoDate, data.moonset, tz);
        if (moonsetMs && !isNaN(moonsetMs)) {
          const msStartIso = safeIsoString(moonsetMs - 3600000);
          const msEndIso = safeIsoString(moonsetMs);
          const msStartFormatted = formatTimeInZone(moonsetMs - 3600000, tz);
          const msEndFormatted = formatTimeInZone(moonsetMs, tz);
          const isMsIda = swaraYoga.moonsetSwara === "ida";
          const msNadiTitle = isMsIda ? "इड़ा (बायाँ)" : "पिंगला (दायाँ)";

          payloads.push({
            summary: `🌘 चन्द्रास्त स्वर (${msStartFormatted} – ${msEndFormatted}): ${msNadiTitle}`,
            description: [
              `🌘 शिवस्वरोदय चन्द्रास्त स्वर काल (Moonset Swara Window)`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${msStartFormatted} से ${msEndFormatted} (${data.moonset} से 1 घंटा पूर्व)`,
              `• सक्रिय नाड़ी: ${isMsIda ? "इड़ा नाड़ी (चन्द्र / वाम)" : "पिंगला नाड़ी (सूर्य / दायाँ)"}`,
              ``,
              `📍 स्थान: ${city}`,
              `गणना स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
            ].join("\n"),
            location: city,
            start: { dateTime: msStartIso, timeZone: tz },
            end: { dateTime: msEndIso, timeZone: tz },
            colorId: "8",
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: options.reminderMinutes }],
            },
            extendedProperties: {
              private: {
                source: "mahavtaar_panchanga",
                eventType: "swara_moonset",
                date: isoDate,
              },
            },
          });
        }
      }
    }

    // 11. Tithi & Nakshatra Swara Transitions
    if (options.includeSwaraTransitions) {
      try {
        const normSchedule = normalizeDailySchedule(data, "hi", Date.now());
        const transitionEvents = normSchedule.events.filter(
          (e) =>
            e.type === "tithi-swara-start" ||
            e.type === "tithi-swara-end" ||
            e.type === "nakshatra-swara-start" ||
            e.type === "nakshatra-swara-end",
        );

        for (const te of transitionEvents) {
          if (!te.startTimeMs || isNaN(te.startTimeMs) || !te.endTimeMs || isNaN(te.endTimeMs)) {
            continue;
          }
          const teStartFormatted = formatTimeInZone(te.startTimeMs, tz);
          const teEndFormatted = formatTimeInZone(te.endTimeMs, tz);

          payloads.push({
            summary: `🌀 ${te.title} (${teStartFormatted} – ${teEndFormatted})`,
            description: [
              `🌀 ${te.title}`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${teStartFormatted} से ${teEndFormatted} (60 मिनट संधिकाल)`,
              `• विवरण: ${te.subtitle}`,
              ``,
              `📍 स्थान: ${city}`,
              `गणना स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
            ].join("\n"),
            location: city,
            start: { dateTime: safeIsoString(te.startTimeMs), timeZone: tz },
            end: { dateTime: safeIsoString(te.endTimeMs), timeZone: tz },
            colorId: te.metadata?.nadi === "ida" ? "7" : "6",
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: options.reminderMinutes }],
            },
            extendedProperties: {
              private: {
                source: "mahavtaar_panchanga",
                eventType: te.type,
                date: isoDate,
              },
            },
          });
        }
      } catch (err) {
        console.warn("Error building transition swara payloads:", err);
      }
    }

    // 12. SWARA YOGA TIMING EVENTS: IDA, PINGALA & SUSHUMNA (Classical Shiva Swarodaya)
    // 12.1 Hourly Cycles: Explicit Ida, Pingala, and Sushumna Sandhi Timing Events
    if (options.includeSwaraHourlyCycles) {
      const initialIsIda = swaraYoga.sunriseSwara === "ida";
      const includeIda = options.includeSwaraIda !== false;
      const includePingala = options.includeSwaraPingala !== false;
      const includeSushumna = options.includeSwaraSushumna !== false;

      for (let i = 0; i < 24; i++) {
        const cycleStartMs = sunriseMs + i * 3600000;
        const cycleEndMs = cycleStartMs + 3600000;
        const isIda = i % 2 === 0 ? initialIsIda : !initialIsIda;

        // In classical Shiva Swarodaya, dominant nadi flows for ~52 minutes,
        // followed by ~8 minutes of Sushumna Sandhi before reversing to the other nostril
        const dominantEndMs = cycleStartMs + 52 * 60000;
        const dominantStartFormatted = formatTimeInZone(cycleStartMs, tz);
        const dominantEndFormatted = formatTimeInZone(dominantEndMs, tz);
        const sushumnaStartMs = dominantEndMs;
        const sushumnaEndMs = cycleEndMs;
        const sushumnaStartFormatted = formatTimeInZone(sushumnaStartMs, tz);
        const sushumnaEndFormatted = formatTimeInZone(sushumnaEndMs, tz);

        // 12.1.1 Explicit Ida Swara Timing Event (Left Nostril / Lunar)
        if (isIda && includeIda) {
          payloads.push({
            summary: `🌙 इड़ा स्वर · चन्द्र नाड़ी (बायाँ नथुना) [प्रहर #${i + 1}] (${dominantStartFormatted} – ${dominantEndFormatted})`,
            description: [
              `🌙 शिवस्वरोदय इड़ा स्वर काल (Ida / Chandra Nadi · Left Nostril)`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${dominantStartFormatted} से ${dominantEndFormatted} (प्रहर #${i + 1} - ५२ मिनट)`,
              `• सक्रिय नाड़ी: इड़ा नाड़ी (चन्द्र / बायाँ नथुना)`,
              `• शास्त्रीय प्रकृति: शीतल, सौम्य, स्थिर, अमृतमयी (Cooling, Peaceful & Auspicious)`,
              `• श्रेष्ठ कार्य: विद्यारंभ, मित्रता, शांति कर्म, जलपान, नवीन गृह प्रवेश, यात्रा, व्यापार एवं शुभ संकल्प।`,
              ``,
              `📍 स्थान: ${city}`,
              `स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
            ].join("\n"),
            location: city,
            start: { dateTime: safeIsoString(cycleStartMs), timeZone: tz },
            end: { dateTime: safeIsoString(dominantEndMs), timeZone: tz },
            colorId: "7", // Peacock / Cyan-Blue
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: options.reminderMinutes }],
            },
            extendedProperties: {
              private: {
                source: "mahavtaar_panchanga",
                eventType: `swara_ida_cycle_${i + 1}`,
                nadi: "ida",
                nostril: "Left",
                cycle: String(i + 1),
                date: isoDate,
              },
            },
          });
        }

        // 12.1.2 Explicit Pingala Swara Timing Event (Right Nostril / Solar)
        if (!isIda && includePingala) {
          payloads.push({
            summary: `☀️ पिंगला स्वर · सूर्य नाड़ी (दायाँ नथुना) [प्रहर #${i + 1}] (${dominantStartFormatted} – ${dominantEndFormatted})`,
            description: [
              `☀️ शिवस्वरोदय पिंगला स्वर काल (Pingala / Surya Nadi · Right Nostril)`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${dominantStartFormatted} से ${dominantEndFormatted} (प्रहर #${i + 1} - ५२ मिनट)`,
              `• सक्रिय नाड़ी: पिंगला नाड़ी (सूर्य / दायाँ नथुना)`,
              `• शास्त्रीय प्रकृति: उष्ण, तेजस्वी, क्रियाशील, पराक्रमी (Heating, Dynamic & Solar)`,
              `• श्रेष्ठ कार्य: भोजन, व्यायाम, कठिन श्रम, वाद-विवाद, व्यापार, शिल्प एवं शारीरिक सक्रियता।`,
              ``,
              `📍 स्थान: ${city}`,
              `स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
            ].join("\n"),
            location: city,
            start: { dateTime: safeIsoString(cycleStartMs), timeZone: tz },
            end: { dateTime: safeIsoString(dominantEndMs), timeZone: tz },
            colorId: "6", // Tangerine / Solar Orange
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: options.reminderMinutes }],
            },
            extendedProperties: {
              private: {
                source: "mahavtaar_panchanga",
                eventType: `swara_pingala_cycle_${i + 1}`,
                nadi: "pingala",
                nostril: "Right",
                cycle: String(i + 1),
                date: isoDate,
              },
            },
          });
        }
      }
    }

    // =========================================================================
    // 13. VEDIC HORAS & INDIVIDUAL TATTVA EVENTS (हर Hora के अंदर आने वाला हर Tattva अपना अलग Event)
    // =========================================================================
    if (options.includeHoraTattvas !== false || options.includeVedicHoras === true) {
      try {
        let sunriseMs = data.sunrise_ms || data.sunriseMs;
        if (!sunriseMs || isNaN(sunriseMs)) {
          sunriseMs = parseTimeToUtcMs(isoDate, data.sunrise, tz);
        }
        let sunsetMs = data.sunset_ms || data.sunsetMs;
        if (!sunsetMs || isNaN(sunsetMs)) {
          sunsetMs = parseTimeToUtcMs(isoDate, data.sunset, tz);
        }
        let nextSunriseMs = data.next_sunrise_ms || data.nextSunriseMs;
        if (!nextSunriseMs || isNaN(nextSunriseMs)) {
          nextSunriseMs = sunriseMs + 24 * 3600000;
        }

        const weekday =
          typeof data.weekday === "number" ? data.weekday : new Date(isoDate).getDay();
        const tithiNum = data.tithi?.[0]?.number || 1;

        const dailyHoras = computeDailyHoras(
          isoDate,
          sunriseMs,
          sunsetMs,
          nextSunriseMs,
          weekday,
          tithiNum,
          tz,
        );

        const maxHoras =
          typeof options.maxHoras === "number" && options.maxHoras > 0 ? options.maxHoras : 24;
        const horasToProcess = dailyHoras.horas.slice(0, maxHoras);

        const rulerMapHi: Record<string, string> = {
          Sun: "सूर्य",
          Moon: "चन्द्र",
          Mars: "मंगल",
          Mercury: "बुध",
          Jupiter: "गुरु",
          Venus: "शुक्र",
          Saturn: "शनि",
        };

        const getTattvaNameHi = (sanskritOrName: string) => {
          switch (sanskritOrName) {
            case "Prithvi":
            case "Earth":
              return "पृथ्वी";
            case "Jala":
            case "Water":
              return "जल";
            case "Agni":
            case "Fire":
              return "अग्नि";
            case "Vayu":
            case "Air":
              return "वायु";
            case "Akasha":
            case "Space":
              return "आकाश";
            default:
              return sanskritOrName;
          }
        };

        const tattvaIconMap: Record<string, string> = {
          Akasha: "🔮",
          Space: "🔮",
          Vayu: "🔮",
          Air: "🔮",
          Agni: "🔥",
          Fire: "🔥",
          Prithvi: "🌍",
          Earth: "🌍",
          Jala: "💧",
          Water: "💧",
        };

        horasToProcess.forEach((h) => {
          const planetHi = rulerMapHi[h.ruler] || h.ruler;
          const nadiText = h.nadi === "ida" ? "इड़ा" : h.nadi === "pingala" ? "पिंगला" : "सुषुम्ना";
          const nadiDetailed =
            h.nadi === "ida"
              ? "इड़ा (चन्द्र नाड़ी / बायाँ नथुना)"
              : h.nadi === "pingala"
                ? "पिंगला (सूर्य नाड़ी / दायाँ नथुना)"
                : "सुषुम्ना (मध्य नाड़ी)";

          // 13.1 Individual Independent Tattva Events (Enabled by default: 24 Horas x 5 Tattvas = 120 Events)
          if (options.includeHoraTattvas !== false) {
            h.tattvas.forEach((tp, tIdx) => {
              const tattvaHi = getTattvaNameHi(tp.sanskrit || tp.name);
              const tattvaIcon = tattvaIconMap[tp.sanskrit] || tattvaIconMap[tp.name] || "🔮";

              // Exact requested format: 🪐 सूर्य · 🌍 पृथ्वी · 💨 पिंगला
              const tpSummary = `🪐 ${planetHi} · ${tattvaIcon} ${tattvaHi} · 💨 ${nadiText}`;

              // Exact description containing CURRENT Tattva information only (Never list the other four Tattvas)
              const tpDescription = [
                `Tattva: ${tattvaHi}`,
                `Planet: ${planetHi}`,
                `Nadi: ${nadiText}`,
                `Tattva Time: ${tp.startTime} – ${tp.endTime}`,
                `Hora Reference: ${h.startTime} – ${h.endTime} (होरा #${h.index})`,
                ``,
                `📍 स्थान: ${city}`,
                `स्रोत: Mahavtaar Panchanga (horaEngine.ts)`,
              ].join("\n");

              payloads.push({
                summary: tpSummary,
                description: tpDescription,
                location: city,
                start: { dateTime: safeIsoString(tp.startTimeMs), timeZone: tz },
                end: { dateTime: safeIsoString(tp.endTimeMs), timeZone: tz },
                colorId: h.nadi === "ida" ? "7" : h.nadi === "pingala" ? "6" : "3",
                reminders: {
                  useDefault: false,
                  overrides: [{ method: "popup", minutes: options.reminderMinutes }],
                },
                extendedProperties: {
                  private: {
                    source: "mahavtaar_panchanga",
                    eventType: `hora_tattva_${h.index}_${tIdx}`,
                    horaIndex: String(h.index),
                    tattvaIndex: String(tIdx),
                    tattva: tp.sanskrit,
                    planet: h.ruler,
                    nadi: h.nadi,
                    date: isoDate,
                  },
                },
              });
            });
          }

          // 13.2 Optional Combined Hora event (DISABLED by default per strict requirements)
          if (options.includeVedicHoras === true) {
            const tattvaNamesHi = h.tattvas.map((t) => getTattvaNameHi(t.sanskrit)).join(", ");
            const tattvaBreakdown = h.tattvas
              .map(
                (t) =>
                  `  • ${getTattvaNameHi(t.sanskrit)} (${t.name}): ${t.startTime} – ${t.endTime}`,
              )
              .join("\n");
            const summary = `🪐 ${planetHi} होरा (#${h.index}) · 💨 नाड़ी: ${nadiText} · 🟡 तत्त्व: ${tattvaNamesHi}`;
            const description = [
              `🌟 वैदिक होरा #${h.index} (${h.isDay ? "दिन होरा" : "रात्रि होरा"})`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${h.startTime} से ${h.endTime}`,
              `• 🪐 ग्रह स्वामी (Planet Ruler): ${planetHi} (${h.ruler})`,
              `• 💨 स्वर नाड़ी (Nadi): ${nadiDetailed}`,
              `• 🟡 सूक्ष्म पंच तत्त्व विवरण (Micro Tattvas):`,
              tattvaBreakdown,
              ``,
              `📍 स्थान: ${city}`,
              `गणना स्रोत: Mahavtaar Panchanga (Drik Vedic Hora Engine)`,
            ].join("\n");

            payloads.push({
              summary,
              description,
              location: city,
              start: { dateTime: safeIsoString(h.startTimeMs), timeZone: tz },
              end: { dateTime: safeIsoString(h.endTimeMs), timeZone: tz },
              colorId: h.nadi === "ida" ? "7" : h.nadi === "pingala" ? "6" : "3",
              reminders: {
                useDefault: false,
                overrides: [{ method: "popup", minutes: options.reminderMinutes }],
              },
              extendedProperties: {
                private: {
                  source: "mahavtaar_panchanga",
                  eventType: `vedic_hora_${h.index}`,
                  horaIndex: String(h.index),
                  ruler: h.ruler,
                  nadi: h.nadi,
                  date: isoDate,
                },
              },
            });
          }
        });
      } catch (err) {
        console.warn("Error calculating vedic hora payloads for calendar sync:", err);
      }
    }
  } catch (err) {
    console.warn("Error calculating swara calendar payloads:", err);
  }

  return payloads;
}

export interface DailySyncResult {
  created: SyncedCalendarEvent[];
  updated: SyncedCalendarEvent[];
  unchanged: number;
  deleted: number;
  failed: number;
  total: number;
  skipped: number; // backward compatibility alias for unchanged
}

/**
 * Synchronize daily Panchanga events to Google Calendar with full create/update/unchanged/delete reconciliation
 */
export async function syncDailyPanchangaEvents(
  token: string,
  data: PanchangaResponse,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
): Promise<DailySyncResult> {
  const calId = await getOrCreatePanchangCalendarId(token);

  // 1. Fetch existing app-owned events for this day
  const existing = await listPanchangaEvents(token, data.date, undefined, calId);

  // Map existing app-owned events by eventType
  const existingMap = new Map<string, SyncedCalendarEvent>();
  for (const ev of existing) {
    if (ev.eventType) {
      existingMap.set(ev.eventType, ev);
    }
  }

  // 2. Build desired payloads for this date
  const payloads = buildPanchangaEventPayloads(data, options);
  const desiredTypes = new Set<string>();

  const created: SyncedCalendarEvent[] = [];
  const updated: SyncedCalendarEvent[] = [];
  let unchanged = 0;
  let deleted = 0;
  let failed = 0;

  for (const payload of payloads) {
    const eventType = payload.extendedProperties?.private?.eventType;
    if (eventType) desiredTypes.add(eventType);

    const existingEv = eventType ? existingMap.get(eventType) : undefined;

    if (existingEv) {
      // Check if event payload has changed
      const isSummarySame = existingEv.summary === payload.summary;
      const isStartSame =
        (existingEv.start.dateTime || existingEv.start.date) ===
        (payload.start.dateTime || payload.start.date);
      const isEndSame =
        (existingEv.end.dateTime || existingEv.end.date) ===
        (payload.end.dateTime || payload.end.date);
      const isLocationSame = (existingEv.location || "") === (payload.location || "");
      const isDescriptionSame = (existingEv.description || "") === (payload.description || "");

      if (isSummarySame && isStartSame && isEndSame && isLocationSame && isDescriptionSame) {
        unchanged++;
      } else {
        try {
          const res = await updateCalendarEvent(token, existingEv.id, payload, calId);
          updated.push(res);
        } catch (err) {
          console.error(`Error updating event "${payload.summary}":`, err);
          failed++;
        }
      }
    } else {
      try {
        const res = await createCalendarEvent(token, payload, calId);
        created.push(res);
      } catch (err) {
        console.error(`Error creating event "${payload.summary}":`, err);
        failed++;
      }
    }
  }

  // 3. Delete obsolete app-owned events for this day that are no longer in desired payloads
  for (const ev of existing) {
    if (ev.eventType && !desiredTypes.has(ev.eventType)) {
      try {
        await deleteCalendarEvent(token, ev.id, calId);
        deleted++;
      } catch (err) {
        console.warn(`Could not delete obsolete event ${ev.id}:`, err);
      }
    }
  }

  return {
    created,
    updated,
    unchanged,
    deleted,
    failed,
    total: payloads.length,
    skipped: unchanged,
  };
}

const AUTO_SYNC_KEY = "mahavtaar_auto_continuous_sync";

export function getAutoContinuousSyncPref(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTO_SYNC_KEY) === "true";
}

export function setAutoContinuousSyncPref(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTO_SYNC_KEY, enabled ? "true" : "false");
}

/**
 * Fetches independent Panchanga data for a specific target date via the server API endpoint /api/panchanga
 */
export async function fetchPanchangaForDate(
  dateStr: string,
  baseData: PanchangaResponse,
): Promise<PanchangaResponse | null> {
  const params = new URLSearchParams();
  params.set("date", dateStr);
  if (baseData.month_system) params.set("month_system", baseData.month_system);
  if (baseData.ayanamsha || baseData.ayanamsa) {
    params.set("ayanamsa", baseData.ayanamsha || baseData.ayanamsa || "citra");
  }
  if (baseData.latitude != null && baseData.longitude != null) {
    params.set("lat", String(baseData.latitude));
    params.set("lon", String(baseData.longitude));
    if (baseData.timezone) params.set("tz", baseData.timezone);
    if (baseData.city) params.set("city", baseData.city);
  } else if (baseData.city) {
    params.set("city", baseData.city);
  }

  let baseUrl = "";
  if (typeof window !== "undefined" && window.location?.origin) {
    baseUrl = window.location.origin;
  }

  const endpoint = `${baseUrl}/api/panchanga?${params.toString()}`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      console.warn(`Panchanga API returned status ${res.status} for date ${dateStr}`);
      return null;
    }
    const data: PanchangaResponse = await res.json();
    if (data && typeof data.sunrise_ms === "number" && typeof data.sunset_ms === "number") {
      return data;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to fetch independent Panchanga data for date ${dateStr}:`, err);
    return null;
  }
}

/**
 * Multi-day continuous synchronization (e.g. 7 days or 30 days ahead) into Panchang Calendar.
 * Calculates every date independently using the Panchanga engine without reusing shifted values.
 */
export async function syncMultiDayPanchangaEvents(
  token: string,
  baseData: PanchangaResponse,
  daysAhead: number = 30,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
  onProgress?: (currentDay: number, totalDays: number) => void,
  customFetchPanchanga?: (dateStr: string) => Promise<PanchangaResponse | null>,
): Promise<{
  totalCreated: number;
  totalUpdated: number;
  totalUnchanged: number;
  totalDeleted: number;
  totalFailed: number;
  totalSkipped: number;
  failedDays: string[];
}> {
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalUnchanged = 0;
  let totalDeleted = 0;
  let totalFailed = 0;
  const failedDays: string[] = [];

  // Reset calendar cache on multi-day sync run to ensure correct account calendar ID resolution
  await getOrCreatePanchangCalendarId(token);

  const { year: baseYear, month: baseMonth, day: baseDay } = parseDateComponents(baseData.date);

  for (let i = 0; i < daysAhead; i++) {
    const target = new Date(baseYear, baseMonth - 1, baseDay + i);
    const targetYear = target.getFullYear();
    const targetMonth = target.getMonth() + 1;
    const targetDay = target.getDate();

    const dateIso = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
    const dateDdMmYyyy = `${String(targetDay).padStart(2, "0")}/${String(targetMonth).padStart(2, "0")}/${targetYear}`;

    if (onProgress) onProgress(i + 1, daysAhead);

    let dayData: PanchangaResponse | null = null;
    if (i === 0) {
      dayData = { ...baseData, date: dateIso };
    } else if (customFetchPanchanga) {
      dayData = await customFetchPanchanga(dateIso);
    } else {
      dayData = await fetchPanchangaForDate(dateDdMmYyyy, baseData);
      if (!dayData) {
        dayData = await fetchPanchangaForDate(dateIso, baseData);
      }
    }

    if (!dayData) {
      console.warn(`Could not calculate independent Panchanga for date ${dateIso}. Skipping.`);
      failedDays.push(dateIso);
      continue;
    }

    try {
      const res = await syncDailyPanchangaEvents(token, dayData, options);
      totalCreated += res.created.length;
      totalUpdated += res.updated.length;
      totalUnchanged += res.unchanged;
      totalDeleted += res.deleted;
      totalFailed += res.failed;
    } catch (err) {
      console.warn(`Continuous sync notice for date ${dateIso}:`, err);
      failedDays.push(dateIso);
    }
  }

  return {
    totalCreated,
    totalUpdated,
    totalUnchanged,
    totalDeleted,
    totalFailed,
    totalSkipped: totalUnchanged,
    failedDays,
  };
}

/**
 * RFC 5545 text escaping for ICS fields (escapes backslashes, semicolons, commas, and newlines)
 */
export function escapeIcsText(str: string | undefined): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * RFC 5545 line folding (folds lines longer than 75 octets with CRLF + space).
 * Measures exact UTF-8 byte length and iterates by code point to avoid splitting multibyte characters or emojis.
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  let result = "";
  let currentBytes = 0;
  let currentSegment = "";

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (currentBytes + charBytes > 75) {
      result += currentSegment + "\r\n ";
      currentSegment = char;
      currentBytes = charBytes;
    } else {
      currentSegment += char;
      currentBytes += charBytes;
    }
  }
  result += currentSegment;
  return result;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) content for Panchanga events
 */
export function generatePanchangaIcsContent(
  data: PanchangaResponse,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
): string {
  const payloads = buildPanchangaEventPayloads(data, options);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mahavtaar Panchanga//NONSGML Drik Almanac//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Mahavtaar Panchanga",
  ];

  const formatIcsTime = (isoStr: string | undefined): string => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const isoDate = normalizeToIsoDate(data.date);
  const cleanIso = isoDate.replace(/-/g, "");

  for (let idx = 0; idx < payloads.length; idx++) {
    const payload = payloads[idx];
    const eventType = payload.extendedProperties?.private?.eventType || `event_${idx}`;
    const uid = `mahavtaar-${cleanIso}-${eventType}@panchanga`;

    lines.push("BEGIN:VEVENT");
    lines.push(foldIcsLine(`UID:${uid}`));
    lines.push(foldIcsLine(`SUMMARY:${escapeIcsText(payload.summary)}`));
    lines.push(foldIcsLine(`DESCRIPTION:${escapeIcsText(payload.description)}`));
    if (payload.location) {
      lines.push(foldIcsLine(`LOCATION:${escapeIcsText(payload.location)}`));
    }

    if (payload.start.dateTime) {
      lines.push(foldIcsLine(`DTSTART:${formatIcsTime(payload.start.dateTime)}`));
    } else if (payload.start.date) {
      const startDateClean = payload.start.date.replace(/-/g, "");
      lines.push(foldIcsLine(`DTSTART;VALUE=DATE:${startDateClean}`));
    }

    if (payload.end.dateTime) {
      lines.push(foldIcsLine(`DTEND:${formatIcsTime(payload.end.dateTime)}`));
    } else if (payload.end.date) {
      let endDateClean = payload.end.date.replace(/-/g, "");
      // RFC 5545 requires DTEND for all-day events to be the exclusive end date (start date + 1 day for 1-day events)
      if (payload.start.date && endDateClean <= payload.start.date.replace(/-/g, "")) {
        const { year, month, day } = parseDateComponents(payload.start.date);
        const nextDay = new Date(year, month - 1, day + 1);
        const ny = nextDay.getFullYear();
        const nm = String(nextDay.getMonth() + 1).padStart(2, "0");
        const nd = String(nextDay.getDate()).padStart(2, "0");
        endDateClean = `${ny}${nm}${nd}`;
      }
      lines.push(foldIcsLine(`DTEND;VALUE=DATE:${endDateClean}`));
    }

    // Add explicit VALARM audio/popup alarm block so native calendar apps show alerts
    const reminderMins = options.reminderMinutes !== undefined ? options.reminderMinutes : 0;
    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push(foldIcsLine(`DESCRIPTION:🔔 ${escapeIcsText(payload.summary)}`));
    lines.push(foldIcsLine(`TRIGGER:-PT${reminderMins}M`));
    lines.push("END:VALARM");

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Download .ics file directly to user device for instant import into Google Calendar / Apple Calendar
 */
export function downloadPanchangaIcsFile(
  data: PanchangaResponse,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
): void {
  const icsString = generatePanchangaIcsContent(data, options);
  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const filename = `Mahavtaar_Panchanga_${normalizeToIsoDate(data.date)}.ics`;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open Google Calendar direct TEMPLATE link in new tab for an event
 */
export function openDirectGoogleCalendarUrl(payload: CalendarEventPayload): void {
  const title = encodeURIComponent(payload.summary);
  const details = encodeURIComponent(payload.description);
  const location = encodeURIComponent(payload.location || "");

  const formatGCalTime = (isoStr: string | undefined): string => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  let datesParam = "";
  if (payload.start.dateTime && payload.end.dateTime) {
    datesParam = `${formatGCalTime(payload.start.dateTime)}/${formatGCalTime(payload.end.dateTime)}`;
  } else if (payload.start.date) {
    const cleanDate = payload.start.date.replace(/-/g, "");
    datesParam = `${cleanDate}/${cleanDate}`;
  }

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${datesParam}`;
  window.open(gcalUrl, "_blank", "noopener,noreferrer");
}
