/**
 * NAKSHATRA START/END — SWARA (NADI) EVENT INTEGRATION
 *
 * Implements the Shiva Swarodaya (Verses 73–74) Nadi layer on top of astronomical Nakshatra boundaries.
 *
 * Classical Rules:
 * - Astronomical Nakshatra calculation provides exact start and end boundaries.
 * - Starting Nadi (आरंभिक नाड़ी): Active from Nakshatra Start Time to Nakshatra Start + 1 hour (duration: 60 minutes).
 *   - Aligned with the Nakshatra's parent zodiac sign:
 *     - Odd Signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius) -> Pingala (Right Nostril / Solar).
 *     - Even Signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces) -> Ida (Left Nostril / Lunar).
 * - Ending Nadi (समापन नाड़ी): Active from 1 hour before Nakshatra End Time until Nakshatra End (duration: 60 minutes).
 *   - Strictly the OPPOSITE of the starting Nadi (Ida <-> Pingala).
 * - Calculations strictly use absolute Unix milliseconds (timezone-safe, cross-midnight safe).
 */

import type {
  Nadi,
  NakshatraSwaraRule,
  NakshatraSwaraEvent,
  NakshatraSwaraInfo,
  Segment,
} from "../types";

export const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Derives the opposing Nadi.
 * Ida -> Pingala, Pingala -> Ida
 */
export function oppositeNadi(nadi: Nadi): Nadi {
  return nadi === "ida" ? "pingala" : "ida";
}

/**
 * Canonical 28-Nakshatra Swara Alignment Rules
 * Based on parent Rashi at starting point (Shiva Swarodaya Verses 73–74)
 */
export const NAKSHATRA_SWARA_RULES: readonly NakshatraSwaraRule[] = [
  {
    nakshatraNumber: 1,
    nakshatraName: "Ashwini",
    sanskritName: "अश्विनी",
    rashiName: "Aries",
    rashiNumber: 1,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 2,
    nakshatraName: "Bharani",
    sanskritName: "भरणी",
    rashiName: "Aries",
    rashiNumber: 1,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 3,
    nakshatraName: "Krittika",
    sanskritName: "कृत्तिका",
    rashiName: "Aries",
    rashiNumber: 1,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 4,
    nakshatraName: "Rohini",
    sanskritName: "रोहिणी",
    rashiName: "Taurus",
    rashiNumber: 2,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 5,
    nakshatraName: "Mrigashira",
    sanskritName: "मृगशिरा",
    rashiName: "Taurus",
    rashiNumber: 2,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 6,
    nakshatraName: "Ardra",
    sanskritName: "आर्द्रा",
    rashiName: "Gemini",
    rashiNumber: 3,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 7,
    nakshatraName: "Punarvasu",
    sanskritName: "पुनर्वसु",
    rashiName: "Gemini",
    rashiNumber: 3,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 8,
    nakshatraName: "Pushya",
    sanskritName: "पुष्य",
    rashiName: "Cancer",
    rashiNumber: 4,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 9,
    nakshatraName: "Ashlesha",
    sanskritName: "आश्लेषा",
    rashiName: "Cancer",
    rashiNumber: 4,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 10,
    nakshatraName: "Magha",
    sanskritName: "मघा",
    rashiName: "Leo",
    rashiNumber: 5,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 11,
    nakshatraName: "Purva Phalguni",
    sanskritName: "पूर्वाफाल्गुनी",
    rashiName: "Leo",
    rashiNumber: 5,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 12,
    nakshatraName: "Uttara Phalguni",
    sanskritName: "उत्तराफाल्गुनी",
    rashiName: "Leo",
    rashiNumber: 5,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 13,
    nakshatraName: "Hasta",
    sanskritName: "हस्त",
    rashiName: "Virgo",
    rashiNumber: 6,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 14,
    nakshatraName: "Chitra",
    sanskritName: "चित्रा",
    rashiName: "Virgo",
    rashiNumber: 6,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 15,
    nakshatraName: "Swati",
    sanskritName: "स्वाती",
    rashiName: "Libra",
    rashiNumber: 7,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 16,
    nakshatraName: "Vishakha",
    sanskritName: "विशाखा",
    rashiName: "Libra",
    rashiNumber: 7,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 17,
    nakshatraName: "Anuradha",
    sanskritName: "अनुराधा",
    rashiName: "Scorpio",
    rashiNumber: 8,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 18,
    nakshatraName: "Jyeshtha",
    sanskritName: "ज्येष्ठा",
    rashiName: "Scorpio",
    rashiNumber: 8,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 19,
    nakshatraName: "Mula",
    sanskritName: "मूल",
    rashiName: "Sagittarius",
    rashiNumber: 9,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 20,
    nakshatraName: "Purvashada",
    sanskritName: "पूर्वाषाढ़ा",
    rashiName: "Sagittarius",
    rashiNumber: 9,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 21,
    nakshatraName: "Uttarashada",
    sanskritName: "उत्तराषाढ़ा",
    rashiName: "Sagittarius",
    rashiNumber: 9,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 22,
    nakshatraName: "Shravana",
    sanskritName: "श्रवण",
    rashiName: "Capricorn",
    rashiNumber: 10,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 23,
    nakshatraName: "Dhanishta",
    sanskritName: "धनिष्ठा",
    rashiName: "Capricorn",
    rashiNumber: 10,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 24,
    nakshatraName: "Shatabhisha",
    sanskritName: "शतभिषा",
    rashiName: "Aquarius",
    rashiNumber: 11,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 25,
    nakshatraName: "Purva Bhadrapada",
    sanskritName: "पूर्वभाद्रपदा",
    rashiName: "Aquarius",
    rashiNumber: 11,
    startNadi: "pingala",
    endNadi: "ida",
    startNostril: "Right",
    endNostril: "Left",
  },
  {
    nakshatraNumber: 26,
    nakshatraName: "Uttara Bhadrapada",
    sanskritName: "उत्तरभाद्रपदा",
    rashiName: "Pisces",
    rashiNumber: 12,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 27,
    nakshatraName: "Revati",
    sanskritName: "रेवती",
    rashiName: "Pisces",
    rashiNumber: 12,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
  {
    nakshatraNumber: 28,
    nakshatraName: "Abhijit",
    sanskritName: "अभिजित्",
    rashiName: "Capricorn",
    rashiNumber: 10,
    startNadi: "ida",
    endNadi: "pingala",
    startNostril: "Left",
    endNostril: "Right",
  },
];

/**
 * Normalizes input nakshatra identifier (number 1..28 or string name) into canonical NakshatraSwaraRule.
 */
export function getNakshatraSwaraRule(nakshatraInput: number | string): NakshatraSwaraRule {
  if (typeof nakshatraInput === "number") {
    const num = Math.floor(nakshatraInput);
    const rule = NAKSHATRA_SWARA_RULES.find((r) => r.nakshatraNumber === num);
    if (rule) return rule;
  }

  const str = String(nakshatraInput || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  for (const rule of NAKSHATRA_SWARA_RULES) {
    const rName = rule.nakshatraName.toLowerCase().replace(/[^a-z]/g, "");
    if (rName.includes(str) || str.includes(rName)) {
      return rule;
    }
  }

  // Fallback to Ashwini (1)
  return NAKSHATRA_SWARA_RULES[0];
}

/**
 * Localized human display labels for Nadi.
 */
export function getNadiDisplayLabel(nadi: Nadi, lang: "en" | "hi" | "sa" = "en"): string {
  if (lang === "hi") {
    return nadi === "ida" ? "इड़ा (बायां स्वर / चन्द्र)" : "पिंगला (दायां स्वर / सूर्य)";
  }
  return nadi === "ida" ? "Ida (Left Nostril / Lunar)" : "Pingala (Right Nostril / Solar)";
}

/**
 * Formats a Unix timestamp into time string in the location timezone.
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
 * Determines whether a Swara event is active at a specific Unix millisecond timestamp.
 * Enforces half-open interval [startTimeMs, endTimeMs).
 */
export function isNakshatraSwaraEventActive(
  event: { startTimeMs: number; endTimeMs: number },
  nowMs: number,
): boolean {
  return event.startTimeMs <= nowMs && nowMs < event.endTimeMs;
}

/**
 * Computes Swara Start and End events for a given Nakshatra segment.
 *
 * Requirements:
 * 1. Starting Nadi: Starts at Nakshatra Start Time and runs for 1 hour [startTimeMs, startTimeMs + 1 hour).
 * 2. Ending Nadi: Starts 1 hour before Nakshatra End Time and runs until Nakshatra End [endTimeMs - 1 hour, endTimeMs).
 * 3. Ending Nadi is strictly the OPPOSITE of Starting Nadi.
 * 4. Overlap flag is set if total Nakshatra duration is under 2 hours.
 */
export function computeNakshatraSwaraEvents(
  segment: {
    number: number;
    name?: string;
    startTimeMs?: number;
    endTimeMs?: number;
  },
  timeZone: string = "Asia/Kolkata",
  nowMs?: number,
  lang: "en" | "hi" | "sa" = "en",
): NakshatraSwaraInfo {
  const rule = getNakshatraSwaraRule(segment.number || segment.name || 1);
  const startNadi = rule.startNadi;
  const endNadi = rule.endNadi; // Guaranteed opposite: oppositeNadi(startNadi)

  let hasOverlap = false;
  if (segment.startTimeMs != null && segment.endTimeMs != null) {
    hasOverlap = segment.endTimeMs - segment.startTimeMs < 2 * ONE_HOUR_MS;
  }

  let startEvent: NakshatraSwaraEvent | null = null;
  if (segment.startTimeMs != null) {
    const sStart = segment.startTimeMs;
    const sEnd = segment.startTimeMs + ONE_HOUR_MS;
    startEvent = {
      type: "start",
      nadi: startNadi,
      nadiLabel: getNadiDisplayLabel(startNadi, lang),
      startTimeMs: sStart,
      endTimeMs: sEnd,
      durationMinutes: 60,
      formattedStart: formatTimeInTz(sStart, timeZone),
      formattedEnd: formatTimeInTz(sEnd, timeZone),
      formattedRange: `${formatTimeInTz(sStart, timeZone)} → ${formatTimeInTz(sEnd, timeZone)}`,
      hasOverlap,
      isActive:
        nowMs != null
          ? isNakshatraSwaraEventActive({ startTimeMs: sStart, endTimeMs: sEnd }, nowMs)
          : false,
    };
  }

  let endEvent: NakshatraSwaraEvent | null = null;
  if (segment.endTimeMs != null) {
    const eStart = segment.endTimeMs - ONE_HOUR_MS;
    const eEnd = segment.endTimeMs;
    endEvent = {
      type: "end",
      nadi: endNadi,
      nadiLabel: getNadiDisplayLabel(endNadi, lang),
      startTimeMs: eStart,
      endTimeMs: eEnd,
      durationMinutes: 60,
      formattedStart: formatTimeInTz(eStart, timeZone),
      formattedEnd: formatTimeInTz(eEnd, timeZone),
      formattedRange: `${formatTimeInTz(eStart, timeZone)} → ${formatTimeInTz(eEnd, timeZone)}`,
      hasOverlap,
      isActive:
        nowMs != null
          ? isNakshatraSwaraEventActive({ startTimeMs: eStart, endTimeMs: eEnd }, nowMs)
          : false,
    };
  }

  return {
    nakshatraNumber: rule.nakshatraNumber,
    nakshatraName: rule.nakshatraName,
    startNadi,
    endNadi,
    startNostril: rule.startNostril,
    endNostril: rule.endNostril,
    startEvent,
    endEvent,
    hasOverlap,
  };
}

/**
 * Standalone calculation helper for direct use with timestamps.
 */
export function calculateNakshatraSwaraInfo(
  nakshatraInput: number | string,
  startTimeMs?: number | null,
  endTimeMs?: number | null,
  timeZone: string = "Asia/Kolkata",
  nowMs?: number,
  lang: "en" | "hi" | "sa" = "en",
): NakshatraSwaraInfo {
  const segment: Segment = {
    number: typeof nakshatraInput === "number" ? nakshatraInput : 1,
    name: typeof nakshatraInput === "string" ? nakshatraInput : "",
    startTimeMs: startTimeMs ?? undefined,
    endTimeMs: endTimeMs ?? undefined,
  };
  return computeNakshatraSwaraEvents(segment, timeZone, nowMs, lang);
}
