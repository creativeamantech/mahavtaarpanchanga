/**
 * LIVE NOTIFICATION SYSTEM
 *
 * Built directly on top of the Normalized Daily Event Layer to ensure exact 1:1
 * synchronization between UI timestamps and notification trigger alerts.
 *
 * Rules:
 * - Uses exact startTimeMs and endTimeMs.
 * - Supports advance notice (at event, 5m before, 10m before, 30m before).
 * - Deterministic unique notification IDs prevent duplication.
 * - Fixes the bug where hora.tattvas[0] was incorrectly assumed for all notifications.
 */

import type { PanchangaResponse } from "../types";
import { normalizeDailySchedule } from "./dailyScheduleNormalizer";
import type { DailyScheduleEvent, UnifiedDailySchedule } from "./dailyScheduleModel";

export interface NotificationPreferences {
  enabled: boolean;

  /** Advance alert notice in minutes: 0 (at event), 5, 10, or 30 */
  advanceMinutes: number;

  /** Event category toggles */
  horaStarts: boolean;
  horaEnds: boolean;
  horaTattvaStarts: boolean;
  swaraChanges: boolean;
  nadiChanges: boolean;
  swaraTattvaChanges: boolean;
  tithiChanges: boolean;
  nakshatraChanges: boolean;
  yogaChanges: boolean;
  karanaChanges: boolean;
  astronomical: boolean; // sunrise, sunset, moonrise, moonset
  muhurtas: boolean;
  planetaryTransits: boolean;
  tithiSwara: boolean;

  /** Filter by Planetary Hora ruler */
  horaPlanets: Record<string, boolean>;

  // Backwards compatibility properties
  sunriseSunset?: boolean;
  horas?: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: false,
  advanceMinutes: 0,
  horaStarts: true,
  horaEnds: false,
  horaTattvaStarts: true,
  swaraChanges: true,
  nadiChanges: true,
  swaraTattvaChanges: false,
  tithiChanges: true,
  nakshatraChanges: true,
  yogaChanges: false,
  karanaChanges: false,
  astronomical: true,
  muhurtas: true,
  planetaryTransits: true,
  tithiSwara: true,
  horaPlanets: {
    Sun: true,
    Moon: true,
    Mars: true,
    Mercury: true,
    Jupiter: true,
    Venus: true,
    Saturn: true,
  },
  sunriseSunset: true,
  horas: true,
};

const NOTIF_PREF_KEY = "mahavtaar_notif_prefs";

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return defaultNotificationPreferences;
  try {
    const val = localStorage.getItem(NOTIF_PREF_KEY);
    if (val) {
      const parsed = JSON.parse(val);
      return {
        ...defaultNotificationPreferences,
        ...parsed,
        horaPlanets: {
          ...defaultNotificationPreferences.horaPlanets,
          ...(parsed.horaPlanets || {}),
        },
      };
    }
  } catch (e) {
    console.error("Failed to parse notification prefs", e);
  }
  return defaultNotificationPreferences;
}

export function saveNotificationPreferences(prefs: NotificationPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_PREF_KEY, JSON.stringify(prefs));
}

// Keep track of active timeouts so we can clear them when data or settings change
let activeTimeouts: NodeJS.Timeout[] = [];
const scheduledIds = new Set<string>();

export function clearScheduledNotifications() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  scheduledIds.clear();
}

/**
 * Dispatches browser / PWA notification.
 */
function scheduleAlert(id: string, title: string, body: string, triggerTimeMs: number) {
  if (scheduledIds.has(id)) return; // Prevent duplicates
  scheduledIds.add(id);

  const now = Date.now();
  const delay = triggerTimeMs - now;

  // Only schedule if it's in the future and within the next 24 hours
  if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
    const timeout = setTimeout(() => {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          if (navigator?.serviceWorker?.ready) {
            navigator.serviceWorker.ready
              .then((registration) => {
                registration
                  .showNotification(title, {
                    body,
                    icon: "/pwa-192x192.png",
                    badge: "/pwa-192x192.png",
                    // @ts-expect-error vibrate is present on mobile browsers
                    vibrate: [200, 100, 200],
                    tag: id,
                  })
                  .catch(() => {
                    new Notification(title, { body, icon: "/pwa-192x192.png" });
                  });
              })
              .catch(() => {
                new Notification(title, { body, icon: "/pwa-192x192.png" });
              });
          } else {
            new Notification(title, { body, icon: "/pwa-192x192.png" });
          }
        } catch {
          try {
            new Notification(title, { body, icon: "/pwa-192x192.png" });
          } catch {
            // Notifications not supported in this environment
          }
        }
      }
    }, delay);
    activeTimeouts.push(timeout);
  }
}

/**
 * Primary Scheduler: builds notifications directly from the Normalized Daily Schedule.
 */
export function schedulePanchangaNotifications(
  data: PanchangaResponse,
  prefs: NotificationPreferences,
  precomputedSchedule?: UnifiedDailySchedule,
) {
  clearScheduledNotifications();

  if (!prefs.enabled) return;
  if (typeof Notification !== "undefined" && Notification.permission !== "granted") return;

  const schedule = precomputedSchedule || normalizeDailySchedule(data);
  const advanceOffsetMs = (prefs.advanceMinutes || 0) * 60 * 1000;
  const advancePrefix = prefs.advanceMinutes > 0 ? `[In ${prefs.advanceMinutes}m] ` : "";

  schedule.events.forEach((event: DailyScheduleEvent) => {
    // 1. Astronomical Events
    if (
      prefs.astronomical ||
      prefs.sunriseSunset // fallback compatibility
    ) {
      if (event.type === "sunrise") {
        const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
        scheduleAlert(
          `${event.id}_start_${triggerTimeMs}`,
          `${advancePrefix}🌅 Sunrise (सूर्योदय)`,
          `Sunrise begins in ${data.city}. Auspicious start of the Vedic day.`,
          triggerTimeMs,
        );
      } else if (event.type === "sunset") {
        const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
        scheduleAlert(
          `${event.id}_start_${triggerTimeMs}`,
          `${advancePrefix}🌇 Sunset (सूर्यास्त)`,
          `Sunset in ${data.city}. Sandhya transition begins.`,
          triggerTimeMs,
        );
      } else if (event.type === "moonrise") {
        const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
        scheduleAlert(
          `${event.id}_start_${triggerTimeMs}`,
          `${advancePrefix}🌙 Moonrise (चन्द्रोदय)`,
          `Moonrise in ${data.city}.`,
          triggerTimeMs,
        );
      } else if (event.type === "moonset") {
        const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
        scheduleAlert(
          `${event.id}_start_${triggerTimeMs}`,
          `${advancePrefix}🌘 Moonset (चन्द्रास्त)`,
          `Moonset in ${data.city}.`,
          triggerTimeMs,
        );
      }
    }

    // 2. Hora Events
    if (event.type === "hora") {
      const ruler = String(event.metadata?.ruler || "");
      const isPlanetEnabled = prefs.horaPlanets[ruler] ?? true;

      if ((prefs.horaStarts || prefs.horas) && isPlanetEnabled) {
        const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
        scheduleAlert(
          `${event.id}_start_${triggerTimeMs}`,
          `${advancePrefix}🪐 ${ruler} Hora Started`,
          `Planetary Hora of ${ruler} is active until ${event.formattedEnd || "next Hora"}. Dominant Nadi: ${String(event.metadata?.nadi || "").toUpperCase()}.`,
          triggerTimeMs,
        );
      }

      if (prefs.horaEnds && event.endTimeMs && isPlanetEnabled) {
        const triggerTimeMs = event.endTimeMs - advanceOffsetMs;
        scheduleAlert(
          `${event.id}_end_${triggerTimeMs}`,
          `${advancePrefix}⌛ ${ruler} Hora Ending`,
          `Hora of ${ruler} is completing. Next planetary period begins.`,
          triggerTimeMs,
        );
      }
    }

    // 3. Hora-Tattva Micro-Period Events (FIX: Identifies exact Tattva whose period begins)
    if (event.type === "hora-tattva" && prefs.horaTattvaStarts) {
      const parentRuler = String(event.metadata?.parentHoraRuler || "");
      const isPlanetEnabled = prefs.horaPlanets[parentRuler] ?? true;

      if (isPlanetEnabled) {
        const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
        const sanskrit = String(event.metadata?.sanskrit || "Tattva");
        const name = String(event.metadata?.name || "");

        scheduleAlert(
          `${event.id}_start_${triggerTimeMs}`,
          `${advancePrefix}✨ ${sanskrit} Tattva (${name}) in ${parentRuler} Hora`,
          `Micro-period active until ${event.formattedEnd}. Element: ${name}.`,
          triggerTimeMs,
        );
      }
    }

    // 4. Swara / Nadi Events
    if (event.type === "swara" && prefs.swaraChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}🌬️ ${event.title}`,
        `${event.subtitle || "Classical Swarodaya window active."}`,
        triggerTimeMs,
      );
    } else if (event.type === "nadi" && prefs.nadiChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}💨 ${event.title}`,
        `${event.subtitle || "Breathing current shift."}`,
        triggerTimeMs,
      );
    } else if (event.type === "swara-tattva" && prefs.swaraTattvaChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}🧘 ${event.title}`,
        `${event.subtitle || "Swarodaya elemental sub-period."}`,
        triggerTimeMs,
      );
    }

    // 5. Tithi-Swara Events
    if (
      (event.type === "tithi-swara-start" || event.type === "tithi-swara-end") &&
      prefs.tithiSwara
    ) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      const overlapNote = event.hasOverlap ? " (Overlapping Tithi Event)" : "";
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}🌀 ${event.title}${overlapNote}`,
        `${event.subtitle || "60-minute classical Tithi-Swara transition."}`,
        triggerTimeMs,
      );
    }

    // 6. Panchanga Angas (Tithi, Nakshatra, Yoga, Karana)
    if (event.type === "tithi" && prefs.tithiChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}🌕 Tithi Begun: ${event.title}`,
        `Duration until ${event.formattedEnd || "completion"}.`,
        triggerTimeMs,
      );
    } else if (event.type === "nakshatra" && prefs.nakshatraChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}⭐ Nakshatra: ${event.title}`,
        `Active until ${event.formattedEnd || "transition"}.`,
        triggerTimeMs,
      );
    } else if (event.type === "yoga" && prefs.yogaChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}🔯 Yoga: ${event.title}`,
        `Active until ${event.formattedEnd}.`,
        triggerTimeMs,
      );
    } else if (event.type === "karana" && prefs.karanaChanges) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}⚡ Karana: ${event.title}`,
        `Active until ${event.formattedEnd}.`,
        triggerTimeMs,
      );
    }

    // 7. Muhurtas
    if (event.type === "muhurta" && prefs.muhurtas) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      const isGood = event.auspiciousness === "auspicious";
      const icon = isGood ? "🟢" : "🔴";
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}${icon} ${event.title}`,
        `${event.subtitle || (isGood ? "Auspicious timing begins." : "Inauspicious period active. Avoid new initiatives.")}`,
        triggerTimeMs,
      );
    }

    // 8. Planetary Transits
    if (
      (event.type === "planetary-transit" ||
        event.type === "planetary-retrograde" ||
        event.type === "planetary-direct" ||
        event.type === "planetary-combustion") &&
      prefs.planetaryTransits
    ) {
      const triggerTimeMs = event.startTimeMs - advanceOffsetMs;
      scheduleAlert(
        `${event.id}_start_${triggerTimeMs}`,
        `${advancePrefix}🪐 Planetary Transit: ${event.title}`,
        `${event.subtitle || "Astronomical planetary transition event."}`,
        triggerTimeMs,
      );
    }
  });
}
