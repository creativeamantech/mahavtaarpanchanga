/**
 * TITHI START/END — SWARA (NADI) EVENT INTEGRATION
 *
 * Implements the classical Swarodaya Nadi layer on top of astronomical Tithi boundaries.
 *
 * Rules:
 * - Astronomical Tithi calculation is the single source of truth for Tithi boundaries.
 * - Start Swara Event: Tithi Start Time -> Tithi Start + 1 hour (duration: 60 minutes)
 * - End Swara Event: Tithi End - 1 hour -> Tithi End (duration: 60 minutes)
 * - Start Nadi follows the classical 30-Tithi mapping.
 * - End Nadi is ALWAYS oppositeNadi(startNadi) (Ida <-> Pingala).
 * - Calculations strictly use absolute Unix milliseconds (timezone-safe, cross-midnight safe).
 */

export type Nadi = "ida" | "pingala";
export type Paksha = "shukla" | "krishna";

export interface TithiSwaraRule {
  paksha: Paksha;
  tithiNumber: number; // 1 to 15
  tithiCycleNumber: number; // 1 to 30
  startNadi: Nadi;
  endNadi: Nadi;
}

export interface TithiSwaraEvent {
  type: "start" | "end";
  nadi: Nadi;
  nadiLabel: string; // e.g. "Pingala (Right Nostril)"
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number; // exactly 3,600,000 ms (1 hour)
  durationMinutes: number; // exactly 60
  formattedStart?: string;
  formattedEnd?: string;
  formattedRange?: string;
  hasOverlap: boolean;
  isActive?: boolean;
}

export interface TithiSwaraInfo {
  paksha: Paksha;
  tithiNumber: number; // 1..15
  tithiCycleNumber: number; // 1..30
  startNadi: Nadi;
  endNadi: Nadi;
  startEvent: TithiSwaraEvent | null;
  endEvent: TithiSwaraEvent | null;
  hasOverlap: boolean;
}

export const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Derives the opposing Nadi.
 * Ida -> Pingala, Pingala -> Ida
 */
export function oppositeNadi(nadi: Nadi): Nadi {
  return nadi === "ida" ? "pingala" : "ida";
}

export const getOppositeNadi = oppositeNadi;

/**
 * Exact 30-Tithi canonical mapping table.
 */
export const TITHI_SWARA_RULES: readonly TithiSwaraRule[] = [
  // Shukla Paksha (1 - 15)
  { paksha: "shukla", tithiNumber: 1, tithiCycleNumber: 1, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 2, tithiCycleNumber: 2, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 3, tithiCycleNumber: 3, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 4, tithiCycleNumber: 4, startNadi: "pingala", endNadi: "ida" },
  { paksha: "shukla", tithiNumber: 5, tithiCycleNumber: 5, startNadi: "pingala", endNadi: "ida" },
  { paksha: "shukla", tithiNumber: 6, tithiCycleNumber: 6, startNadi: "pingala", endNadi: "ida" },
  { paksha: "shukla", tithiNumber: 7, tithiCycleNumber: 7, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 8, tithiCycleNumber: 8, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 9, tithiCycleNumber: 9, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 10, tithiCycleNumber: 10, startNadi: "pingala", endNadi: "ida" },
  { paksha: "shukla", tithiNumber: 11, tithiCycleNumber: 11, startNadi: "pingala", endNadi: "ida" },
  { paksha: "shukla", tithiNumber: 12, tithiCycleNumber: 12, startNadi: "pingala", endNadi: "ida" },
  { paksha: "shukla", tithiNumber: 13, tithiCycleNumber: 13, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 14, tithiCycleNumber: 14, startNadi: "ida", endNadi: "pingala" },
  { paksha: "shukla", tithiNumber: 15, tithiCycleNumber: 15, startNadi: "ida", endNadi: "pingala" },

  // Krishna Paksha (16 - 30)
  { paksha: "krishna", tithiNumber: 1, tithiCycleNumber: 16, startNadi: "pingala", endNadi: "ida" },
  { paksha: "krishna", tithiNumber: 2, tithiCycleNumber: 17, startNadi: "pingala", endNadi: "ida" },
  { paksha: "krishna", tithiNumber: 3, tithiCycleNumber: 18, startNadi: "pingala", endNadi: "ida" },
  { paksha: "krishna", tithiNumber: 4, tithiCycleNumber: 19, startNadi: "ida", endNadi: "pingala" },
  { paksha: "krishna", tithiNumber: 5, tithiCycleNumber: 20, startNadi: "ida", endNadi: "pingala" },
  { paksha: "krishna", tithiNumber: 6, tithiCycleNumber: 21, startNadi: "ida", endNadi: "pingala" },
  { paksha: "krishna", tithiNumber: 7, tithiCycleNumber: 22, startNadi: "pingala", endNadi: "ida" },
  { paksha: "krishna", tithiNumber: 8, tithiCycleNumber: 23, startNadi: "pingala", endNadi: "ida" },
  { paksha: "krishna", tithiNumber: 9, tithiCycleNumber: 24, startNadi: "pingala", endNadi: "ida" },
  {
    paksha: "krishna",
    tithiNumber: 10,
    tithiCycleNumber: 25,
    startNadi: "ida",
    endNadi: "pingala",
  },
  {
    paksha: "krishna",
    tithiNumber: 11,
    tithiCycleNumber: 26,
    startNadi: "ida",
    endNadi: "pingala",
  },
  {
    paksha: "krishna",
    tithiNumber: 12,
    tithiCycleNumber: 27,
    startNadi: "ida",
    endNadi: "pingala",
  },
  {
    paksha: "krishna",
    tithiNumber: 13,
    tithiCycleNumber: 28,
    startNadi: "pingala",
    endNadi: "ida",
  },
  {
    paksha: "krishna",
    tithiNumber: 14,
    tithiCycleNumber: 29,
    startNadi: "pingala",
    endNadi: "ida",
  },
  {
    paksha: "krishna",
    tithiNumber: 15,
    tithiCycleNumber: 30,
    startNadi: "pingala",
    endNadi: "ida",
  },
];

/**
 * Normalizes input paksha string into canonical "shukla" | "krishna".
 */
export function normalizePaksha(paksha: string): Paksha {
  const p = (paksha || "").toLowerCase().trim();
  if (
    p.startsWith("k") ||
    p.includes("krish") ||
    p.includes("kṛṣ") ||
    p.includes("dark") ||
    p.includes("badi") ||
    p.includes("vad")
  ) {
    return "krishna";
  }
  return "shukla";
}

/**
 * Look up the canonical TithiSwaraRule.
 * Accepts paksha and tithiNumber (1..15 or 1..30).
 * Guaranteed to be language-independent and deterministic.
 */
export function getTithiSwaraRule(
  pakshaOrTithiNum: Paksha | string | number,
  tithiNumber?: number,
): TithiSwaraRule {
  let normalizedPaksha: Paksha = "shukla";
  let normalizedNum = 1;

  if (typeof pakshaOrTithiNum === "number") {
    const cycleNum = Math.floor(pakshaOrTithiNum);
    if (cycleNum > 15 && cycleNum <= 30) {
      normalizedPaksha = "krishna";
      normalizedNum = cycleNum - 15;
    } else if (cycleNum > 30) {
      const wrapped = ((cycleNum - 1) % 30) + 1;
      normalizedPaksha = wrapped > 15 ? "krishna" : "shukla";
      normalizedNum = wrapped > 15 ? wrapped - 15 : wrapped;
    } else {
      normalizedPaksha = "shukla";
      normalizedNum = Math.max(1, cycleNum);
    }
  } else {
    normalizedPaksha = normalizePaksha(pakshaOrTithiNum);
    normalizedNum = Math.floor(tithiNumber ?? 1);

    // If tithiNumber is given as 1..30 (panchanga cycle index)
    if (normalizedNum > 15 && normalizedNum <= 30) {
      normalizedPaksha = "krishna";
      normalizedNum -= 15;
    } else if (normalizedNum <= 0) {
      normalizedNum = 1;
    } else if (normalizedNum > 15) {
      normalizedNum = ((normalizedNum - 1) % 15) + 1;
    }
  }

  const rule = TITHI_SWARA_RULES.find(
    (r) => r.paksha === normalizedPaksha && r.tithiNumber === normalizedNum,
  );

  if (rule) {
    return rule;
  }

  // Fallback formula matching exact Swarodaya triad pattern
  const startNadi: Nadi =
    normalizedPaksha === "shukla"
      ? Math.floor((normalizedNum - 1) / 3) % 2 === 0
        ? "ida"
        : "pingala"
      : Math.floor((normalizedNum - 1) / 3) % 2 === 0
        ? "pingala"
        : "ida";

  return {
    paksha: normalizedPaksha,
    tithiNumber: normalizedNum,
    tithiCycleNumber: normalizedPaksha === "krishna" ? normalizedNum + 15 : normalizedNum,
    startNadi,
    endNadi: oppositeNadi(startNadi),
  };
}

/**
 * Localized human display labels for Nadi.
 */
export function getNadiDisplayLabel(nadi: Nadi, lang: "en" | "hi" | "sa" = "en"): string {
  if (lang === "hi") {
    return nadi === "ida" ? "इड़ा (बायां स्वर)" : "पिंगला (दायां स्वर)";
  }
  return nadi === "ida" ? "Ida (Left Nostril)" : "Pingala (Right Nostril)";
}

/**
 * Formats a Unix timestamp into time string in the Panchanga's location timezone.
 */
export function formatTimeInTz(
  ms: number,
  timeZone: string = "UTC",
  locale: string = "en-US",
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(ms));
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(ms));
  }
}

/**
 * Formats a time range string in the specified timezone.
 */
export function formatEventRange(
  startMs: number,
  endMs: number,
  timeZone: string = "UTC",
  locale: string = "en-US",
): string {
  const startStr = formatTimeInTz(startMs, timeZone, locale);
  const endStr = formatTimeInTz(endMs, timeZone, locale);
  return `${startStr} → ${endStr}`;
}

/**
 * Determines whether a Swara event is active at a specific Unix millisecond timestamp.
 * Enforces half-open interval [startTimeMs, endTimeMs).
 * At exactly endTimeMs, the event is no longer active.
 */
export function isTithiSwaraEventActive(
  event: { startTimeMs: number; endTimeMs: number },
  nowMs: number,
): boolean {
  return event.startTimeMs <= nowMs && nowMs < event.endTimeMs;
}

/**
 * Computes Swara Start and End events for a given Tithi segment.
 *
 * - Start Event: [startTimeMs, startTimeMs + 1 hour)
 * - End Event: [endTimeMs - 1 hour, endTimeMs)
 * - If tithi duration < 2 hours, marks hasOverlap: true deterministically.
 * - Respects timezone for formatting while keeping timestamps absolute.
 */
export function computeTithiSwaraEvents(
  segment: {
    number: number;
    name?: string;
    startTimeMs?: number;
    endTimeMs?: number;
  },
  timeZone: string = "Asia/Kolkata",
  nowMs?: number,
  lang: "en" | "hi" | "sa" = "en",
): TithiSwaraInfo {
  let paksha: Paksha = "shukla";
  let tithiNumber = 1;
  let cycleNum = 1;

  if (segment.number > 15 && segment.number <= 30) {
    paksha = "krishna";
    tithiNumber = segment.number - 15;
    cycleNum = segment.number;
  } else {
    const nameLower = (segment.name || "").toLowerCase();
    if (
      nameLower.includes("krish") ||
      nameLower.includes("kṛṣ") ||
      nameLower.includes("dark") ||
      nameLower.includes("badi") ||
      nameLower.includes("vad")
    ) {
      paksha = "krishna";
      tithiNumber = Math.max(1, Math.min(15, segment.number));
      cycleNum = tithiNumber + 15;
    } else {
      paksha = "shukla";
      tithiNumber = Math.max(1, Math.min(15, segment.number));
      cycleNum = tithiNumber;
    }
  }

  const rule = getTithiSwaraRule(paksha, tithiNumber);
  const startNadi = rule.startNadi;
  const endNadi = oppositeNadi(startNadi);

  let hasOverlap = false;
  if (segment.startTimeMs != null && segment.endTimeMs != null) {
    hasOverlap = segment.endTimeMs - segment.startTimeMs < 2 * ONE_HOUR_MS;
  }

  let startEvent: TithiSwaraEvent | null = null;
  if (segment.startTimeMs != null) {
    const sStart = segment.startTimeMs;
    const sEnd = segment.startTimeMs + ONE_HOUR_MS;
    startEvent = {
      type: "start",
      nadi: startNadi,
      nadiLabel: getNadiDisplayLabel(startNadi, lang),
      startTimeMs: sStart,
      endTimeMs: sEnd,
      formattedStart: formatTimeInTz(sStart, timeZone),
      formattedEnd: formatTimeInTz(sEnd, timeZone),
      formattedRange: formatEventRange(sStart, sEnd, timeZone),
      durationMs: ONE_HOUR_MS,
      durationMinutes: 60,
      hasOverlap,
      isActive:
        nowMs != null
          ? isTithiSwaraEventActive({ startTimeMs: sStart, endTimeMs: sEnd }, nowMs)
          : undefined,
    };
  }

  let endEvent: TithiSwaraEvent | null = null;
  if (segment.endTimeMs != null) {
    const eStart = segment.endTimeMs - ONE_HOUR_MS;
    const eEnd = segment.endTimeMs;
    endEvent = {
      type: "end",
      nadi: endNadi,
      nadiLabel: getNadiDisplayLabel(endNadi, lang),
      startTimeMs: eStart,
      endTimeMs: eEnd,
      formattedStart: formatTimeInTz(eStart, timeZone),
      formattedEnd: formatTimeInTz(eEnd, timeZone),
      formattedRange: formatEventRange(eStart, eEnd, timeZone),
      durationMs: ONE_HOUR_MS,
      durationMinutes: 60,
      hasOverlap,
      isActive:
        nowMs != null
          ? isTithiSwaraEventActive({ startTimeMs: eStart, endTimeMs: eEnd }, nowMs)
          : undefined,
    };
  }

  return {
    paksha,
    tithiNumber,
    tithiCycleNumber: cycleNum,
    startNadi,
    endNadi,
    startEvent,
    endEvent,
    hasOverlap,
  };
}

/**
 * Returns any currently active Tithi Swara event from an array of Tithi segments.
 */
export function getActiveTithiSwaraEvent(
  tithiSegments: Array<{
    number: number;
    name?: string;
    startTimeMs?: number;
    endTimeMs?: number;
  }>,
  nowMs: number,
  timeZone: string = "Asia/Kolkata",
  lang: "en" | "hi" | "sa" = "en",
): { event: TithiSwaraEvent; tithiInfo: TithiSwaraInfo } | null {
  for (const seg of tithiSegments) {
    const info = computeTithiSwaraEvents(seg, timeZone, nowMs, lang);
    if (info.startEvent && isTithiSwaraEventActive(info.startEvent, nowMs)) {
      return { event: info.startEvent, tithiInfo: info };
    }
    if (info.endEvent && isTithiSwaraEventActive(info.endEvent, nowMs)) {
      return { event: info.endEvent, tithiInfo: info };
    }
  }
  return null;
}

/**
 * Convenience helper for computing Tithi Swara info from tithiNumber, paksha, and timestamps.
 */
export function calculateTithiSwaraInfo(
  tithiNumber: number,
  paksha: Paksha | string,
  startTimeMs?: number,
  endTimeMs?: number,
  timeZone: string = "Asia/Kolkata",
  lang: "en" | "hi" | "sa" = "en",
): TithiSwaraInfo {
  const isKrishna = String(paksha).toLowerCase().includes("krishna");
  const cycleNumber = isKrishna ? tithiNumber + 15 : tithiNumber;
  return computeTithiSwaraEvents(
    {
      number: cycleNumber,
      startTimeMs,
      endTimeMs,
    },
    timeZone,
    Date.now(),
    lang,
  );
}
