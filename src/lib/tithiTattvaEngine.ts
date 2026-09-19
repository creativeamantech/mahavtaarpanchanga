import { TattvaElement, SwaraNadi, PanchangaResponse, Segment } from "../types";
import { computeSwaraYoga } from "../swaraYoga";
import { getTithiSwaraRule } from "./tithiSwaraEngine";
import { parseTimeToMinutes } from "../swaraYoga";

export type Paksha = "Shukla" | "Krishna";

export interface TithiTattvaPeriod {
  paksha: Paksha;
  tithi: number;
  startTime: number; // Unix MS
  endTime: number; // Unix MS
  startElement: TattvaElement;
  endElement: TattvaElement;
  startNadi: SwaraNadi;
  endNadi: SwaraNadi;
}

// 1-3 -> Prithvi
// 4-7 -> Jala
// 8 -> Akasha
// 9-10 -> Vayu
// 11-13 -> Agni
// 14-15 -> Prithvi
// 1-3 -> Prithvi
// 4-7 -> Jala
// 8 -> Akasha
// 9-10 -> Vayu
// 11-13 -> Agni
// 14-15 -> Prithvi
export const TITHI_ELEMENT_MAPPING: Record<number, TattvaElement> = {
  1: "prithvi",
  2: "prithvi",
  3: "prithvi",
  4: "jala",
  5: "jala",
  6: "jala",
  7: "jala",
  8: "akash",
  9: "vayu",
  10: "vayu",
  11: "tejas",
  12: "tejas",
  13: "tejas",
  14: "prithvi",
  15: "prithvi",
};

/**
 * Returns the Canonical Swara Nadi at an exact timestamp
 */
export function getCanonicalNadiAtTime(
  timestampMs: number,
  tithiNumber: number,
  sunriseStr: string,
  sunsetStr: string,
  moonriseStr?: string | null,
  moonsetStr?: string | null,
  timeZone: string = "Asia/Kolkata",
): SwaraNadi {
  // Extract local time components from the timestamp using the provided timezone
  const dateStr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).format(new Date(timestampMs));

  // Format returns "HH:MM:SS", parse it
  const [hh, mm, ss] = dateStr.split(":").map(Number);

  const swaraData = computeSwaraYoga(
    tithiNumber,
    sunriseStr,
    sunsetStr,
    { hours: hh, minutes: mm, seconds: ss },
    moonriseStr,
    moonsetStr,
  );

  // Default to sunrise Swara if not in specific celestial windows
  let activeSwara = swaraData.currentActiveSwara ?? swaraData.sunriseSwara;

  // Implement the 1-hour (60 min) alternating logic from sunrise.
  const currentMins = hh * 60 + mm + ss / 60;
  const sunriseMins = parseTimeToMinutes(sunriseStr) ?? 6 * 60;

  // Swara alternates every 60 minutes.
  if (currentMins >= sunriseMins) {
    const minutesElapsed = currentMins - sunriseMins;
    const hoursElapsed = Math.floor(minutesElapsed / 60);
    if (hoursElapsed % 2 === 1) {
       // Toggle the Swara
       activeSwara = swaraData.sunriseSwara === "ida" ? "pingala" : "ida";
    } else {
       activeSwara = swaraData.sunriseSwara;
    }
  } else {
    // If before sunrise, it belongs to the previous day's alternating cycle.
    // For simplicity, we calculate backward from today's sunrise.
    const minutesBefore = sunriseMins - currentMins;
    const hoursBefore = Math.floor(minutesBefore / 60);
    // If 1 hr before (0-59 mins), it's the opposite Swara.
    // Wait, if it's 0-59 mins before, hour index is 0, which means 1 hour ago.
    if (hoursBefore % 2 === 0) {
      activeSwara = swaraData.sunriseSwara === "ida" ? "pingala" : "ida";
    } else {
      activeSwara = swaraData.sunriseSwara;
    }
  }

  return activeSwara || "ida";
}

export function computeTithiTattvaPeriods(panchangaData: PanchangaResponse): TithiTattvaPeriod[] {
  const periods: TithiTattvaPeriod[] = [];

  for (const seg of panchangaData.tithi) {
    if (!seg.startTimeMs || !seg.endTimeMs) continue;

    // Determine Tithi number 1..15 and Paksha
    let paksha: Paksha = "Shukla";
    let tithiNum = seg.number;

    if (seg.number > 15) {
      paksha = "Krishna";
      tithiNum = seg.number - 15;
    } else {
      // Fallback check by name
      const nameLower = (seg.name || "").toLowerCase();
      if (
        nameLower.includes("krish") ||
        nameLower.includes("kṛṣ") ||
        nameLower.includes("dark") ||
        nameLower.includes("badi") ||
        nameLower.includes("vad")
      ) {
        paksha = "Krishna";
      } else {
        paksha = "Shukla";
      }
      tithiNum = Math.max(1, Math.min(15, seg.number));
    }

    const element = TITHI_ELEMENT_MAPPING[tithiNum] || "prithvi";

    const tithiSwaraRule = getTithiSwaraRule(seg.number);
    const startNadi = tithiSwaraRule.startNadi;
    const endNadi = tithiSwaraRule.endNadi;

    periods.push({
      paksha,
      tithi: tithiNum,
      startTime: seg.startTimeMs,
      endTime: seg.endTimeMs,
      startElement: element,
      endElement: element,
      startNadi,
      endNadi,
    });
  }

  return periods;
}
