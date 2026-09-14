/**
 * UNIFIED DAILY SCHEDULE MODEL
 *
 * Defines the canonical normalized event model for Mahavtaar Panchanga:
 * - Astronomical, Panchanga, Hora, Hora-Tattva, Swara, Swara-Tattva, Nadi,
 *   Tithi-Swara, Muhurta, Planetary transitions, Festivals and Vratas.
 *
 * Rules:
 * - All calculations and ordering operate strictly on Unix milliseconds.
 * - Deterministic half-open intervals: startTimeMs <= nowMs && nowMs < endTimeMs.
 * - Stable unique event IDs.
 * - Every event has an explicit source attribute.
 */

export type DailyScheduleEventType =
  | "sunrise"
  | "sunset"
  | "moonrise"
  | "moonset"
  | "tithi"
  | "nakshatra"
  | "yoga"
  | "karana"
  | "hora"
  | "hora-tattva"
  | "swara"
  | "swara-tattva"
  | "nadi"
  | "tithi-swara-start"
  | "tithi-swara-end"
  | "muhurta"
  | "planetary-transit"
  | "planetary-retrograde"
  | "planetary-direct"
  | "planetary-combustion"
  | "festival"
  | "vrata"
  | "other";

export type EventCategory =
  "all" | "hora" | "swara" | "panchanga" | "muhurta" | "astronomical" | "planetary" | "calendar";

export interface DailyScheduleEvent {
  /** Stable unique ID for keys and notification deduping */
  id: string;

  /** Strict typed event category */
  type: DailyScheduleEventType;

  /** Human-readable engine source label */
  source:
    | "Hora Engine"
    | "Swara Engine"
    | "Panchanga Engine"
    | "Astronomical Engine"
    | "Planetary Engine"
    | "Tithi-Swara Engine"
    | "Muhurta Engine"
    | "Calendar Engine"
    | string;

  /** Category for UI grouping and filtering */
  category: EventCategory;

  /** Absolute start time in Unix milliseconds */
  startTimeMs: number;

  /** Absolute end time in Unix milliseconds (null for instantaneous events) */
  endTimeMs: number | null;

  /** Primary display title */
  title: string;

  /** Secondary display subtitle (e.g. ruler, element, details) */
  subtitle?: string;

  /** Localized titles if available */
  localizedTitle?: {
    en: string;
    hi?: string;
    sa?: string;
  };

  /** Localized subtitles if available */
  localizedSubtitle?: {
    en: string;
    hi?: string;
    sa?: string;
  };

  /** Formatted time representations in the target timezone (for display only) */
  formattedStart?: string;
  formattedEnd?: string;
  formattedRange?: string;

  /** Duration in milliseconds */
  durationMs?: number;

  /** Structured engine-specific metadata */
  metadata?: Record<string, unknown>;

  /** Deterministic secondary sort order for simultaneous events (lower = earlier) */
  priority?: number;

  /** Computed live status flags against nowMs */
  isCurrent?: boolean;
  isUpcoming?: boolean;
  isCompleted?: boolean;

  /** Flag if event duration has an overlap condition (e.g. short Tithi) */
  hasOverlap?: boolean;

  /** Auspiciousness level for Muhurtas and Horas */
  auspiciousness?: "auspicious" | "inauspicious" | "neutral";

  /** Accent styling color tokens */
  colorTheme?: {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    barColor: string;
    iconColor: string;
  };
}

/** Visual grouping of events sharing the exact same startTimeMs */
export interface DailyScheduleTimeSlot {
  key: string;
  startTimeMs: number;
  formattedTime: string;
  events: DailyScheduleEvent[];
}

/** Full daily normalized schedule object */
export interface UnifiedDailySchedule {
  dateStr: string; // dd/mm/yyyy
  city: string;
  timeZone: string;
  isToday: boolean;
  computedAtMs: number;
  events: DailyScheduleEvent[];
  timeSlots: DailyScheduleTimeSlot[];
  counts: {
    total: number;
    hora: number;
    swara: number;
    panchanga: number;
    muhurta: number;
    astronomical: number;
    planetary: number;
    calendar: number;
  };
}
