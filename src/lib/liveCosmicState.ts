/**
 * LIVE COSMIC STATE RESOLVER
 *
 * Resolves real-time active cosmic states (Hora, Hora-Tattva, Swara, Nadi,
 * Panchanga Angas, Muhurta, and Next Upcoming Event) from precomputed timestamps.
 *
 * Runs every second without triggering heavy astronomical recalculations.
 */

import type { PanchangaResponse } from "../types";
import { resolveCurrentHora, type CurrentHoraState } from "./horaEngine";
import type { DailyScheduleEvent, UnifiedDailySchedule } from "./dailyScheduleModel";

export interface LiveCosmicState {
  isToday: boolean;
  nowMs: number;

  /** Planetary Hora & 5-Tattva State */
  horaState: CurrentHoraState | null;

  /** Active simultaneous events at nowMs */
  activeEvents: DailyScheduleEvent[];

  /** Primary Panchanga Elements active now */
  currentTithi: DailyScheduleEvent | null;
  currentNakshatra: DailyScheduleEvent | null;
  currentYoga: DailyScheduleEvent | null;
  currentKarana: DailyScheduleEvent | null;

  /** Active Swara & Nadi breathing currents */
  currentSwara: DailyScheduleEvent | null;
  currentNadi: DailyScheduleEvent | null;
  currentSwaraTattva: DailyScheduleEvent | null;

  /** Active Tithi-Swara window if currently active */
  currentTithiSwara: DailyScheduleEvent | null;

  /** Active Muhurtas (e.g. Abhijit, Rahu Kala, Choghadiya) */
  activeMuhurtas: DailyScheduleEvent[];

  /** Next upcoming chronological event with countdown */
  nextUpcomingEvent: DailyScheduleEvent | null;
  nextEventRemainingMs: number | null;
}

/**
 * Formats milliseconds into human-readable MM:SS or HH:MM:SS.
 */
export function formatCountdown(ms: number | null | undefined): string {
  if (ms == null || isNaN(ms) || ms < 0) return "00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Pure resolver: computes live state against existing schedule and engines.
 */
export function resolveLiveCosmicState(
  nowMs: number,
  schedule: UnifiedDailySchedule,
  panchanga: PanchangaResponse,
): LiveCosmicState {
  // If viewing a historical or future date, do not display a fake "LIVE" state or active countdowns
  if (!schedule.isToday) {
    return {
      isToday: false,
      nowMs,
      horaState: null,
      activeEvents: [],
      currentTithi: null,
      currentNakshatra: null,
      currentYoga: null,
      currentKarana: null,
      currentSwara: null,
      currentNadi: null,
      currentSwaraTattva: null,
      currentTithiSwara: null,
      activeMuhurtas: [],
      nextUpcomingEvent: null,
      nextEventRemainingMs: null,
    };
  }

  // 1. Resolve canonical Hora state
  const horaState = resolveCurrentHora(nowMs, panchanga);

  // 2. Resolve all active events in the unified schedule using half-open intervals [start, end)
  const activeEvents = schedule.events.filter((e) => {
    if (e.endTimeMs === null) {
      return nowMs >= e.startTimeMs && nowMs - e.startTimeMs < 60000;
    }
    return nowMs >= e.startTimeMs && nowMs < e.endTimeMs;
  });

  // 3. Extract specific active forces
  const currentTithi = activeEvents.find((e) => e.type === "tithi") || null;
  const currentNakshatra = activeEvents.find((e) => e.type === "nakshatra") || null;
  const currentYoga = activeEvents.find((e) => e.type === "yoga") || null;
  const currentKarana = activeEvents.find((e) => e.type === "karana") || null;

  const currentSwara = activeEvents.find((e) => e.type === "swara") || null;
  const currentNadi = activeEvents.find((e) => e.type === "nadi") || null;
  const currentSwaraTattva = activeEvents.find((e) => e.type === "swara-tattva") || null;

  const currentTithiSwara =
    activeEvents.find((e) => e.type === "tithi-swara-start" || e.type === "tithi-swara-end") ||
    null;

  const activeMuhurtas = activeEvents.filter((e) => e.type === "muhurta");

  // 4. Find the immediate next upcoming event
  const upcomingEvents = schedule.events.filter((e) => e.startTimeMs > nowMs);
  const nextUpcomingEvent = upcomingEvents[0] || null;
  const nextEventRemainingMs = nextUpcomingEvent
    ? Math.max(0, nextUpcomingEvent.startTimeMs - nowMs)
    : null;

  return {
    isToday: true,
    nowMs,
    horaState,
    activeEvents,
    currentTithi,
    currentNakshatra,
    currentYoga,
    currentKarana,
    currentSwara,
    currentNadi,
    currentSwaraTattva,
    currentTithiSwara,
    activeMuhurtas,
    nextUpcomingEvent,
    nextEventRemainingMs,
  };
}
