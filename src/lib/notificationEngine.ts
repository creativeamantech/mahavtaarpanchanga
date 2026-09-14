import { PanchangaResponse } from "../types";
import { computeDailyHoras } from "../horaEngine";

export interface NotificationPreferences {
  enabled: boolean;
  sunriseSunset: boolean;
  muhurtas: boolean;
  horas: boolean;
  horaPlanets: Record<string, boolean>;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: false,
  sunriseSunset: true,
  muhurtas: true,
  horas: true,
  horaPlanets: {
    Sun: true,
    Moon: true,
    Mars: true,
    Mercury: true,
    Jupiter: true,
    Venus: true,
    Saturn: true,
  },
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

// Keep track of active timeouts so we can clear them when data changes
let activeTimeouts: NodeJS.Timeout[] = [];

export function clearScheduledNotifications() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
}

function parseTimeStringToMs(timeStr: string, dateStr: string): number {
  if (!timeStr || !dateStr) return 0;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts;
  const base = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

  const match = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
  if (!match) return 0;

  const [, h, m, s, ampm] = match;
  let hours = parseInt(h, 10);
  if (ampm) {
    if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
  }

  return base.getTime() + (hours * 3600 + parseInt(m, 10) * 60 + parseInt(s || "0", 10)) * 1000;
}

function scheduleAlert(title: string, body: string, timeMs: number) {
  const now = Date.now();
  const delay = timeMs - now;

  // Only schedule if it's in the future and within the next 24 hours
  if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
    const timeout = setTimeout(() => {
      if (Notification.permission === "granted") {
        try {
          // Attempt to use service worker if available for better background support
          navigator.serviceWorker.ready
            .then((registration) => {
              registration
                .showNotification(title, {
                  body,
                  icon: "/pwa-192x192.png",
                  badge: "/pwa-192x192.png",
                  // @ts-expect-error - TS lib DOM doesn't always have vibrate
                  vibrate: [200, 100, 200],
                })
                .catch(() => {
                  new Notification(title, { body, icon: "/pwa-192x192.png" });
                });
            })
            .catch(() => {
              new Notification(title, { body, icon: "/pwa-192x192.png" });
            });
        } catch (e) {
          new Notification(title, { body, icon: "/pwa-192x192.png" });
        }
      }
    }, delay);
    activeTimeouts.push(timeout);
  }
}

export function schedulePanchangaNotifications(
  data: PanchangaResponse,
  prefs: NotificationPreferences,
) {
  clearScheduledNotifications();

  if (!prefs.enabled || Notification.permission !== "granted") {
    return;
  }

  const { date } = data;

  // 1. Sunrise & Sunset
  if (prefs.sunriseSunset) {
    const sunriseMs = parseTimeStringToMs(data.sunrise, date);
    if (sunriseMs) scheduleAlert("Sunrise", `It is sunrise in ${data.city}.`, sunriseMs);

    const sunsetMs = parseTimeStringToMs(data.sunset, date);
    if (sunsetMs) scheduleAlert("Sunset", `It is sunset in ${data.city}.`, sunsetMs);
  }

  // 2. Muhurtas
  if (prefs.muhurtas) {
    if (data.brahma_muhurta?.start) {
      const bMs = parseTimeStringToMs(data.brahma_muhurta.start, date);
      if (bMs)
        scheduleAlert(
          "Brahma Muhurta Starts",
          `The highly auspicious Brahma Muhurta has begun.`,
          bMs,
        );
    }
    if (data.abhijit_muhurta?.start) {
      const aMs = parseTimeStringToMs(data.abhijit_muhurta.start, date);
      if (aMs)
        scheduleAlert("Abhijit Muhurta Starts", `The auspicious Abhijit Muhurta has begun.`, aMs);
    }
    if (data.rahu_kala?.start) {
      const rMs = parseTimeStringToMs(data.rahu_kala.start, date);
      if (rMs)
        scheduleAlert(
          "Rahu Kala Starts",
          `The inauspicious Rahu Kala has begun. Avoid new beginnings.`,
          rMs,
        );
    }
  }

  // 3. Horas
  if (prefs.horas && data.sunrise_ms && data.sunset_ms && data.next_sunrise_ms) {
    const weekday = data.weekday;

    // Tithi number estimation (rough is okay for swara in horas, but we have data.tithi)
    const primaryTithiNum = data.tithi && data.tithi.length > 0 ? data.tithi[0].number : 1;

    const horasData = computeDailyHoras(
      date,
      data.sunrise_ms,
      data.sunset_ms,
      data.next_sunrise_ms,
      weekday,
      primaryTithiNum,
      data.timezone,
      Date.now(),
    );

    horasData.horas.forEach((hora) => {
      // Notify at the start of each hora if enabled for that planet
      if (prefs.horaPlanets && prefs.horaPlanets[hora.ruler]) {
        const title = `Hora of ${hora.ruler}`;
        const element = hora.tattvas.length > 0 ? hora.tattvas[0].name : "Unknown Element";
        const body = `Started. First element: ${element}. Dominant Nadi: ${hora.nadi}.`;
        scheduleAlert(title, body, hora.startTimeMs);
      }
    });
  }
}
