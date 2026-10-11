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
  htmlLink?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  eventType?: string;
  dateStr?: string;
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
  includeSwaraSushumna: boolean; // Explicit Sushumna Swara (Both Nostrils / Sandhi Yogic) timing events
  // Vedic Horas & Hora Nadi (वैदिक होरा चक्र) options
  includeVedicHoras: boolean; // 24 Vedic Horas with Planet, Nadi & Pancha Tattvas
  includeHoraTattvas: boolean; // Individual Micro Pancha Tattva periods within Horas
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
  includeSwaraHourlyCycles: true,
  includeSwaraIda: true,
  includeSwaraPingala: true,
  includeSwaraSushumna: true,
  includeVedicHoras: true,
  includeHoraTattvas: false,
  reminderMinutes: 15,
};

/**
 * Normalizes any date string (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, ISO string) into standard YYYY-MM-DD.
 */
export function normalizeToIsoDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  const clean = dateStr.trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const ymd = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY (Standard Indian / Panchanga format)
  const dmy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Safely converts a timestamp in milliseconds to an ISO 8601 string without ever throwing "Invalid time value".
 */
export function safeIsoString(
  ms: number | undefined | null,
  fallbackMs: number = Date.now(),
): string {
  if (typeof ms === "number" && !isNaN(ms) && isFinite(ms)) {
    try {
      return new Date(ms).toISOString();
    } catch {
      // ignore
    }
  }
  return new Date(fallbackMs).toISOString();
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

/**
 * List events created by Mahavtaar Panchanga within a time window
 */
export async function listPanchangaEvents(
  token: string,
  startDateStr: string,
  endDateStr?: string,
): Promise<SyncedCalendarEvent[]> {
  const isoStart = normalizeToIsoDate(startDateStr);
  const isoEnd = normalizeToIsoDate(endDateStr || startDateStr);
  const timeMin = safeIsoString(new Date(`${isoStart}T00:00:00Z`).getTime());
  const timeMax = safeIsoString(new Date(`${isoEnd}T23:59:59Z`).getTime());

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("maxResults", "100");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch events from Google Calendar (${res.status})`,
    );
  }

  const data = await res.json();
  const items = data.items || [];

  return (items as GoogleCalendarApiItem[])
    .filter(
      (item: GoogleCalendarApiItem) =>
        item.extendedProperties?.private?.source === "mahavtaar_panchanga" ||
        item.summary?.includes("पंचांग") ||
        item.summary?.includes("Mahavtaar Panchanga") ||
        item.summary?.includes("स्वर") ||
        item.summary?.includes("Swara") ||
        item.summary?.includes("इड़ा") ||
        item.summary?.includes("Ida") ||
        item.summary?.includes("पिंगला") ||
        item.summary?.includes("Pingala") ||
        item.summary?.includes("सुषुम्ना") ||
        item.summary?.includes("Sushumna"),
    )
    .map((item: GoogleCalendarApiItem) => ({
      id: item.id,
      summary: item.summary || "",
      htmlLink: item.htmlLink,
      start: { dateTime: item.start?.dateTime, date: item.start?.date },
      end: { dateTime: item.end?.dateTime, date: item.end?.date },
      eventType: item.extendedProperties?.private?.eventType,
      dateStr: item.extendedProperties?.private?.date,
    }));
}

/**
 * Create a single event in user's Primary Google Calendar
 */
export async function createCalendarEvent(
  token: string,
  payload: CalendarEventPayload,
): Promise<SyncedCalendarEvent> {
  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

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
    htmlLink: item.htmlLink,
    start: item.start,
    end: item.end,
    eventType: item.extendedProperties?.private?.eventType,
    dateStr: item.extendedProperties?.private?.date,
  };
}

/**
 * Delete a single event by ID (Requires explicit user confirmation before calling!)
 */
export async function deleteCalendarEvent(token: string, eventId: string): Promise<boolean> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;

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

        // 12.1.3 Explicit Sushumna Sandhi Timing Event (Both Nostrils / Neutral Yogic)
        if (includeSushumna) {
          payloads.push({
            summary: `🧘 सुषुम्ना संधिकाल (Sushumna Sandhi) · ध्यान व योग [प्रहर #${i + 1}] (${sushumnaStartFormatted} – ${sushumnaEndFormatted})`,
            description: [
              `🧘 शिवस्वरोदय सुषुम्ना नाड़ी संधिकाल (Sushumna Sandhi · Neutral Yogic Breath)`,
              `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
              `• समय अवधि: ${sushumnaStartFormatted} से ${sushumnaEndFormatted} (प्रहर #${i + 1} स्वर संधिकाल - ८ मिनट)`,
              `• सक्रिय नाड़ी: सुषुम्ना नाड़ी (मध्य / शून्य / ब्रह्म स्वर)`,
              `• श्वास प्रवाह: दोनों नासिकाओं में सम प्रवाह (Both Nostrils Equal Flow)`,
              `• शास्त्रीय नियम: इस संधि-काल में भौतिक, सांसारिक एवं आर्थिक कर्म निष्फल होते हैं (Worldly affairs prohibited)।`,
              `• अनुशंसित साधना: केवल ध्यान (Meditation), प्राणायाम, मंत्र जप, कुण्डलिनी जागरण एवं ईश्वर आराधना हेतु सर्वोत्तम काल।`,
              ``,
              `📍 स्थान: ${city}`,
              `स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
            ].join("\n"),
            location: city,
            start: { dateTime: safeIsoString(sushumnaStartMs), timeZone: tz },
            end: { dateTime: safeIsoString(sushumnaEndMs), timeZone: tz },
            colorId: "3", // Grape / Purple (Spiritual / Yogic)
            reminders: {
              useDefault: false,
              overrides: [{ method: "popup", minutes: options.reminderMinutes }],
            },
            extendedProperties: {
              private: {
                source: "mahavtaar_panchanga",
                eventType: `swara_sushumna_cycle_${i + 1}`,
                nadi: "sushumna",
                nostril: "Both",
                cycle: String(i + 1),
                date: isoDate,
              },
            },
          });
        }
      }
    }

    // 12.2 Major Cardinal Sandhya Sushumna Timing Windows (त्रिसंध्या सुषुम्ना काल)
    if (options.includeSwaraSushumna !== false) {
      // 12.2.1 Dawn Sandhya Sushumna (Sunrise junction - 20 mins)
      const dawnStartMs = sunriseMs - 10 * 60000;
      const dawnEndMs = sunriseMs + 10 * 60000;
      const dawnStartFormatted = formatTimeInZone(dawnStartMs, tz);
      const dawnEndFormatted = formatTimeInZone(dawnEndMs, tz);

      payloads.push({
        summary: `🧘 प्रातः महा-संध्या सुषुम्ना काल (${dawnStartFormatted} – ${dawnEndFormatted})`,
        description: [
          `🧘 शिवस्वरोदय प्रातः महा-संधिकाल सुषुम्ना (Dawn Sandhya Sushumna Window)`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `• समय अवधि: ${dawnStartFormatted} से ${dawnEndFormatted} (सूर्योदय संधि - २० मिनट)`,
          `• सक्रिय नाड़ी: सुषुम्ना नाड़ी (उभय नासिका प्रवाह)`,
          `• शास्त्रीय महत्व: सूर्योदय का संधिकाल जहाँ प्राण सुषुम्ना में प्रवेश करता है।`,
          `• अनुशंसित कर्म: गायत्री मंत्र, ध्यान, प्राणायाम, सूर्य नमस्कार एवं शिव साधना।`,
          ``,
          `📍 स्थान: ${city}`,
          `स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
        ].join("\n"),
        location: city,
        start: { dateTime: safeIsoString(dawnStartMs), timeZone: tz },
        end: { dateTime: safeIsoString(dawnEndMs), timeZone: tz },
        colorId: "3", // Grape / Purple
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "swara_sushumna_dawn",
            nadi: "sushumna",
            nostril: "Both",
            date: isoDate,
          },
        },
      });

      // 12.2.2 Midday Vishuvat Sandhya Sushumna (Solar Noon junction - 20 mins)
      const noonStartMs = middayMs - 10 * 60000;
      const noonEndMs = middayMs + 10 * 60000;
      const noonStartFormatted = formatTimeInZone(noonStartMs, tz);
      const noonEndFormatted = formatTimeInZone(noonEndMs, tz);

      payloads.push({
        summary: `🧘 मध्याह्न विषुवत् सुषुम्ना काल (${noonStartFormatted} – ${noonEndFormatted})`,
        description: [
          `🧘 शिवस्वरोदय मध्याह्न विषुवत् सुषुम्ना (Midday Solar Noon Sushumna Window)`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `• समय अवधि: ${noonStartFormatted} से ${noonEndFormatted} (मध्याह्न संधि - २० मिनट)`,
          `• सक्रिय नाड़ी: सुषुम्ना नाड़ी (उभय नासिका प्रवाह)`,
          `• शास्त्रीय महत्व: विषुवत् काल में प्राण का मध्य में स्थिर होना।`,
          `• अनुशंसित कर्म: मौन, ध्यान, शांति चिंतन एवं आध्यात्मिक स्थिरता।`,
          ``,
          `📍 स्थान: ${city}`,
          `स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
        ].join("\n"),
        location: city,
        start: { dateTime: safeIsoString(noonStartMs), timeZone: tz },
        end: { dateTime: safeIsoString(noonEndMs), timeZone: tz },
        colorId: "3", // Grape / Purple
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "swara_sushumna_midday",
            nadi: "sushumna",
            nostril: "Both",
            date: isoDate,
          },
        },
      });

      // 12.2.3 Dusk Sandhya Sushumna (Sunset junction - 20 mins)
      const duskStartMs = sunsetMs - 10 * 60000;
      const duskEndMs = sunsetMs + 10 * 60000;
      const duskStartFormatted = formatTimeInZone(duskStartMs, tz);
      const duskEndFormatted = formatTimeInZone(duskEndMs, tz);

      payloads.push({
        summary: `🧘 सायं महा-संध्या सुषुम्ना काल (${duskStartFormatted} – ${duskEndFormatted})`,
        description: [
          `🧘 शिवस्वरोदय सायं महा-संधिकाल सुषुम्ना (Dusk Sandhya Sushumna Window)`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `• समय अवधि: ${duskStartFormatted} से ${duskEndFormatted} (सूर्यास्त संधि - २० मिनट)`,
          `• सक्रिय नाड़ी: सुषुम्ना नाड़ी (उभय नासिका प्रवाह)`,
          `• शास्त्रीय महत्व: दिन और रात्रि का मिलन संधि-बिंदु।`,
          `• अनुशंसित कर्म: सांध्य वंदन, आरती, ॐ जप, दीप प्रज्वलन एवं ध्यान।`,
          ``,
          `📍 स्थान: ${city}`,
          `स्रोत: Mahavtaar Panchanga (Shiva Swarodaya Engine)`,
        ].join("\n"),
        location: city,
        start: { dateTime: safeIsoString(duskStartMs), timeZone: tz },
        end: { dateTime: safeIsoString(duskEndMs), timeZone: tz },
        colorId: "3", // Grape / Purple
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: options.reminderMinutes }],
        },
        extendedProperties: {
          private: {
            source: "mahavtaar_panchanga",
            eventType: "swara_sushumna_dusk",
            nadi: "sushumna",
            nostril: "Both",
            date: isoDate,
          },
        },
      });
    }
    // =========================================================================
    // 13. VEDIC HORAS & HORA NADI (वैदिक होरा चक्र - Exact Hora Nadi Page Alignment)
    // =========================================================================
    if (options.includeVedicHoras !== false) {
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

        const rulerMapHi: Record<string, string> = {
          Sun: "सूर्य",
          Moon: "चन्द्र",
          Mars: "मंगल",
          Mercury: "बुध",
          Jupiter: "गुरु",
          Venus: "शुक्र",
          Saturn: "शनि",
        };

        const adviceMapHi = {
          Sun: "नेतृत्व, स्वास्थ्य, आध्यात्मिक कार्य, सरकारी कार्य।",
          Moon: "जनसंपर्क, भावनाएं, माता, भोजन, बदलाव।",
          Mars: "साहस, तकनीकी कार्य, शारीरिक गतिविधि, शल्य चिकित्सा।",
          Mercury: "संचार, व्यापार, लेखन, बौद्धिक कार्य।",
          Jupiter: "ज्ञान, धन, शिक्षा, धार्मिक कार्य।",
          Venus: "कला, प्रेम, विलासिता, कूटनीति, सौंदर्य।",
          Saturn: "अनुशासन, कड़ी मेहनत, वृद्ध लोगों से व्यवहार, विलंब।",
        };

        const getTattvaNameHi = (name: string) => {
          switch (name) {
            case "Prithvi":
              return "पृथ्वी";
            case "Jala":
              return "जल";
            case "Agni":
              return "अग्नि";
            case "Vayu":
              return "वायु";
            case "Akasha":
              return "आकाश";
            default:
              return name;
          }
        };

        dailyHoras.horas.forEach((h) => {
          const planetHi = rulerMapHi[h.ruler] || h.ruler;
          const nadiHi =
            h.nadi === "ida"
              ? "इड़ा (चन्द्र नाड़ी)"
              : h.nadi === "pingala"
                ? "पिंगला (सूर्य नाड़ी)"
                : "सुषुम्ना नाड़ी";
          const nadiSymbol = h.nadi === "ida" ? "🔵" : h.nadi === "pingala" ? "🔴" : "🟣";

          const tattvaNamesHi = h.tattvas.map((t) => getTattvaNameHi(t.name)).join(", ");

          // Title me planet, nadi, tatwa
          const summary = `${planetHi} होरा (#${h.index}) · नाड़ी: ${nadiHi} ${nadiSymbol} · तत्त्व: ${tattvaNamesHi}`;

          // Detail me start to end time and proper app timings
          const tattvaBreakdownLines = h.tattvas
            .map((t) => {
              const tNameHi = getTattvaNameHi(t.name);
              return `  • ${t.sanskrit} (${tNameHi}): ${t.startTime} से ${t.endTime}`;
            })
            .join("\n");

          const advice = adviceMapHi[h.ruler as keyof typeof adviceMapHi] || "";

          const description = [
            `🌟 वैदिक होरा #${h.index} (${h.isDay ? "दिन होरा" : "रात्रि होरा"})`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `• समय अवधि: ${h.startTime} से ${h.endTime}`,
            `• ग्रह स्वामी (Planet): ${planetHi} (${h.ruler})`,
            `• स्वर नाड़ी (Nadi): ${nadiHi} ${nadiSymbol}`,
            `• नाड़ी स्वभाव: ${
              h.nadi === "ida"
                ? "शीतल व सौम्य · बायाँ नासिका छिद्र (Left Nostril)"
                : h.nadi === "pingala"
                  ? "उष्ण व तेजस्वी · दायाँ नासिका छिद्र (Right Nostril)"
                  : "ध्यान व समाधि योग (Both Nostrils)"
            }`,
            ``,
            `🔮 सूक्ष्म पंच तत्त्व विवरण (Pancha Tattva Timings):`,
            tattvaBreakdownLines,
            ``,
            `✨ शुभ कार्य सलाह: "${advice}"`,
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

          // Individual Hora Tattva micro periods
          if (options.includeHoraTattvas) {
            h.tattvas.forEach((tp, tIdx) => {
              const tpNameHi = getTattvaNameHi(tp.name);
              const tpSummary = `${planetHi} होरा · ${nadiHi} · ${tp.sanskrit} (${tpNameHi}) तत्त्व`;

              const tpDescription = [
                `🔮 वैदिक होरा सूक्ष्म तत्त्वकाल: ${tp.sanskrit} (${tpNameHi})`,
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                `• समय अवधि: ${tp.startTime} से ${tp.endTime}`,
                `• मुख्य होरा: ${planetHi} होरा (#${h.index})`,
                `• सक्रिय नाड़ी: ${nadiHi} ${nadiSymbol}`,
                ``,
                `📍 स्थान: ${city}`,
                `गणना स्रोत: Mahavtaar Panchanga (Drik Vedic Hora Engine)`,
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
                    eventType: `vedic_hora_tattva_${h.index}_${tIdx}`,
                    horaIndex: String(h.index),
                    tattva: tp.sanskrit,
                    date: isoDate,
                  },
                },
              });
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

/**
 * Synchronize daily Panchanga events to Google Calendar
 */
export async function syncDailyPanchangaEvents(
  token: string,
  data: PanchangaResponse,
  options: SyncOptions = DEFAULT_SYNC_OPTIONS,
): Promise<{
  created: SyncedCalendarEvent[];
  skipped: number;
  total: number;
}> {
  // 1. Fetch existing synced events for this day to avoid duplication
  const existing = await listPanchangaEvents(token, data.date);
  const existingTypes = new Set(existing.map((e) => e.eventType).filter(Boolean));

  // 2. Build desired payloads
  const payloads = buildPanchangaEventPayloads(data, options);

  const created: SyncedCalendarEvent[] = [];
  let skipped = 0;

  for (const payload of payloads) {
    const eventType = payload.extendedProperties?.private?.eventType;
    if (eventType && existingTypes.has(eventType)) {
      skipped++;
      continue;
    }

    try {
      const result = await createCalendarEvent(token, payload);
      created.push(result);
    } catch (err) {
      console.error(`Error creating calendar event "${payload.summary}":`, err);
    }
  }

  return {
    created,
    skipped,
    total: payloads.length,
  };
}
