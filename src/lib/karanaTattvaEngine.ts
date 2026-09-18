import * as Astronomy from "astronomy-engine";
import { getKaranaTattvaBoundingPratipadas, calculateAyanamsa } from "./panchangaEngine.server";
import type { CoordinateSelection } from "../types";
import rawSanskritNames from "../data/sanskrit_names.json";

export type KaranaTattvaName = "Akasha" | "Vayu" | "Agni" | "Prithvi" | "Jala";
export type KaranaCycleType = "CHAITRA_TO_SHARAD" | "SHARAD_TO_CHAITRA";

export interface KaranaTattvaPeriod {
  element: KaranaTattvaName;
  startTime: number;
  endTime: number;
  durationMs: number;
  weight: number;
  percentage: number;
  cycleType: KaranaCycleType;
  cycleStartTime: number;
  cycleEndTime: number;
}

export interface KaranaTattvaCycle {
  id: string;
  type: KaranaCycleType;
  startTime: number;
  endTime: number;
  durationMs: number;
  periods: KaranaTattvaPeriod[];
}

export interface KaranaTattvaMaasOverlap {
  element: KaranaTattvaName;
  maasName: string;
  maasType?: string;
  overlapStart: number;
  overlapEnd: number;
  overlapDurationMs: number;
  overlapPercentageOfElement: number;
}

const ELEMENTS: KaranaTattvaName[] = ["Akasha", "Vayu", "Agni", "Prithvi", "Jala"];
const WEIGHTS = [1, 2, 3, 5, 4];
const TOTAL_WEIGHT = 15;

export function getKaranaTattvaCycle(
  targetDateMs: number,
  ayanamsaKey: CoordinateSelection,
): KaranaTattvaCycle | null {
  const boundaries = getKaranaTattvaBoundingPratipadas(targetDateMs, ayanamsaKey);
  if (!boundaries) return null;

  const { current, next } = boundaries;
  const cycleType: KaranaCycleType =
    current.masaNum === 1 ? "CHAITRA_TO_SHARAD" : "SHARAD_TO_CHAITRA";
  const durationMs = next.timestampMs - current.timestampMs;

  const periods: KaranaTattvaPeriod[] = [];
  let currentStart = current.timestampMs;

  for (let i = 0; i < 5; i++) {
    const weight = WEIGHTS[i];
    let periodDuration = Math.floor(durationMs * (weight / TOTAL_WEIGHT));

    // The final element absorbs any rounding remainder
    if (i === 4) {
      periodDuration = next.timestampMs - currentStart;
    }

    const endTime = currentStart + periodDuration;
    periods.push({
      element: ELEMENTS[i],
      startTime: currentStart,
      endTime,
      durationMs: periodDuration,
      weight,
      percentage: (weight / TOTAL_WEIGHT) * 100,
      cycleType,
      cycleStartTime: current.timestampMs,
      cycleEndTime: next.timestampMs,
    });

    currentStart = endTime;
  }

  return {
    id: `${cycleType}_${current.timestampMs}`,
    type: cycleType,
    startTime: current.timestampMs,
    endTime: next.timestampMs,
    durationMs,
    periods,
  };
}

export function getActiveKaranaTattva(
  targetDateMs: number,
  cycle: KaranaTattvaCycle,
): KaranaTattvaPeriod | null {
  if (targetDateMs < cycle.startTime || targetDateMs >= cycle.endTime) return null;
  return cycle.periods.find((p) => targetDateMs >= p.startTime && targetDateMs < p.endTime) || null;
}

// A helper to compute Sidereal Sun Longitude inside this file (or we could export it from panchangaEngine)
// Let's just recreate the small helper for Maas overlap since we need it independent

function getSiderealLon(tropicalLon: number, ayanamsaDeg: number): number {
  let sidereal = tropicalLon - ayanamsaDeg;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

function getMasaSegmentAtNm(nmTime: Astronomy.AstroTime, ayanamsaDeg: number) {
  const tropical = Astronomy.SunPosition(nmTime).elon;
  const sidereal = getSiderealLon(tropical, ayanamsaDeg);
  const rasi = Math.floor(sidereal / 30);
  const amantaMasaNum = (rasi + 2) % 12 || 12;
  const baseName = (rawSanskritNames.masas as any)[amantaMasaNum.toString()] || "Unknown";

  return { masaNum: amantaMasaNum, masaName: baseName };
}

export function getKaranaTattvaMaasOverlaps(
  period: KaranaTattvaPeriod,
  ayanamsaKey: CoordinateSelection,
): KaranaTattvaMaasOverlap[] {
  const overlaps: KaranaTattvaMaasOverlap[] = [];
  const midDate = new Date((period.startTime + period.endTime) / 2);
  const ayanamsaDeg = calculateAyanamsa(Astronomy.MakeTime(midDate), ayanamsaKey);

  // 1. Find the new moon immediately preceding or exactly at period.startTime
  let currentNm = Astronomy.SearchMoonPhase(0, new Date(period.startTime - 32 * 86400000), 33);
  if (!currentNm) return [];

  // 2. Walk forward NM by NM until we pass period.endTime
  let currentNmTime = currentNm.date.getTime();
  let searchStart = new Date(currentNmTime + 5 * 86400000);

  while (currentNmTime < period.endTime) {
    const nextNm = Astronomy.SearchMoonPhase(0, searchStart, 33);
    if (!nextNm) break;
    const nextNmTime = nextNm.date.getTime();

    // The segment is [currentNmTime, nextNmTime)
    const overlapStart = Math.max(period.startTime, currentNmTime);
    const overlapEnd = Math.min(period.endTime, nextNmTime);

    if (overlapStart < overlapEnd) {
      const masaData = getMasaSegmentAtNm(currentNm, ayanamsaDeg);

      // Determine if it's Adhika. If the next NM gives the same masaNum, this one is Adhika.
      const nextMasaData = getMasaSegmentAtNm(nextNm, ayanamsaDeg);
      const isAdhika = masaData.masaNum === nextMasaData.masaNum;

      const overlapDurationMs = overlapEnd - overlapStart;
      overlaps.push({
        element: period.element,
        maasName: isAdhika ? `Adhika ${masaData.masaName}` : masaData.masaName,
        maasType: isAdhika ? "Adhika" : "Nija",
        overlapStart,
        overlapEnd,
        overlapDurationMs,
        overlapPercentageOfElement: (overlapDurationMs / period.durationMs) * 100,
      });
    }

    currentNm = nextNm;
    currentNmTime = nextNmTime;
    searchStart = new Date(currentNmTime + 5 * 86400000);
  }

  return overlaps;
}
