export type AppTheme = "parchment" | "nightSky";

export type CoordinateSelection =
  | "citra"
  | "revati"
  | "rohini"
  | "pushya"
  | "mula"
  | "krishnamurti"
  | "raman"
  | "tropical";

export type MonthSystem = "amanta" | "purnimanta";

export type TransitType = "rasi" | "nakshatra" | "retrograde" | "direct" | "combust";

export type SwaraNadi = "ida" | "pingala" | "sushumna";

export type Nadi = "ida" | "pingala";

export type TattvaElement = "prithvi" | "jala" | "tejas" | "vayu" | "akash";

export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface UserSettings {
  lang: "en" | "hi";
  ayanamsa: CoordinateSelection;
  monthSystem: MonthSystem;
  currentCity: string;
  theme: AppTheme;
  birthNakshatra: number;
  customCoords: any;
  savedAt?: any;
}

export interface TimingInterval {
  start: string;
  end: string;
  startTimeMs?: number;
  endTimeMs?: number;
  name?: string;
  type?: string;
  lord?: string;
}

export interface Segment {
  name: string;
  name_sa?: string;
  number: number;
  start?: string;
  end?: string;
  starts?: string;
  ends?: string | null;
  startTimeMs?: number;
  endTimeMs?: number;
  percentage?: number;
  nakshatraSwara?: any;
  tithiSwara?: any;
}

export interface PlanetPosition {
  id: string;
  name: string;
  name_sa?: string;
  sanskritName?: string;
  longitude: number;
  siderealLongitude?: number;
  rasi: string;
  rasi_number?: number;
  rasiNumber?: number;
  degrees_in_rasi?: string;
  degreesInRasi?: string;
  nakshatra: string;
  nakshatra_number?: number;
  nakshatraNumber?: number;
  pada: number;
  is_retrograde?: boolean;
  isRetrograde?: boolean;
  speed?: number;
  house?: number;
  combust?: boolean;
}

export interface PlanetTransitionEvent {
  id: string;
  planetId: string;
  planetName: string;
  sanskritName: string;
  symbol: string;
  type: TransitType;
  timestamp: string;
  dateStr: string;
  timeStr: string;
  dayOfWeek: string;
  relativeText: string;
  isToday: boolean;
  fromValue: string;
  toValue: string;
  fromName: string;
  toName: string;
  specialName?: string;
  punyaKala?: TimingInterval;
  mahaPunyaKala?: TimingInterval;
  description: {
    en: string;
    hi: string;
    sa: string;
  };
}

export interface PlanetTransitStatus {
  planetId: string;
  planetName: string;
  sanskritName: string;
  symbol: string;
  currentRasi: string;
  currentRasiNumber: number;
  degreesInRasi: string;
  degreesInRasiNum: number;
  progressPercent: number;
  currentNakshatra: string;
  currentNakshatraNumber: number;
  currentPada: number;
  isRetrograde: boolean;
  isCombust: boolean;
  combustDistanceDeg?: number | null;
  nextRasiTransit?: PlanetTransitionEvent;
  nextNakshatraTransit?: PlanetTransitionEvent;
  followingNakshatraTransit?: PlanetTransitionEvent;
  subsequentNakshatraTransit?: PlanetTransitionEvent;
}

export interface PlanetTransitionsData {
  planets: PlanetTransitStatus[];
  upcomingEvents: PlanetTransitionEvent[];
  todayEvents: PlanetTransitionEvent[];
}

export interface SwaraDayRule {
  dayNumber: number;
  tithiName: string;
  paksha: string;
  sunriseSwara: SwaraNadi;
  sunsetSwara: SwaraNadi;
  sunriseNostril: "Left" | "Right";
  sunsetNostril: "Left" | "Right";
  moonriseSwara?: SwaraNadi;
  moonsetSwara?: SwaraNadi;
  moonriseNostril?: "Left" | "Right";
  moonsetNostril?: "Left" | "Right";
  sunriseWindow?: {
    start: string;
    end: string;
    windowFormatted: string;
    ruleDescription: { en: string; hi: string; sa: string };
  };
  sunsetWindow?: {
    start: string;
    end: string;
    windowFormatted: string;
    ruleDescription: { en: string; hi: string; sa: string };
  };
  moonriseWindow?: {
    start: string;
    end: string;
    windowFormatted: string;
    ruleDescription: { en: string; hi: string; sa: string };
  } | null;
  moonsetWindow?: {
    start: string;
    end: string;
    windowFormatted: string;
    ruleDescription: { en: string; hi: string; sa: string };
  } | null;
}

export interface SwaraYogaData {
  dayNumber?: number;
  tithiName?: string;
  paksha?: string;
  sunriseSwara?: SwaraNadi;
  sunsetSwara?: SwaraNadi;
  sunriseNostril?: "Left" | "Right";
  sunsetNostril?: "Left" | "Right";
  moonriseSwara?: SwaraNadi;
  moonsetSwara?: SwaraNadi;
  moonriseNostril?: "Left" | "Right";
  moonsetNostril?: "Left" | "Right";
  sunriseWindow?: any;
  middayWindow?: any;
  sunsetWindow?: any;
  moonriseWindow?: any;
  moonsetWindow?: any;
  activeCelestialWindow?: any;
  currentActiveSwara?: SwaraNadi;
  activeSwara?: SwaraNadi;
  activeNostril?: "Left" | "Right" | "Both";
  activeTattva?: TattvaElement;
  tithiRule?: SwaraDayRule;
  tattvaPercentage?: number;
  elementDescription?: string;
}

export interface NakshatraTattvaDetails {
  element?: string;
  name: { en: string; hi: string; sa: string };
  symbol?: string;
  quality: { en: string; hi: string; sa: string };
  tattva?: TattvaElement;
  description?: { en: string; hi: string; sa: string };
  favorableActivities?: { en: string; hi: string; sa: string };
  warning?: { en: string; hi: string; sa: string };
  application?: any;
  color?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeText?: string;
}

export interface NakshatraNadiSpan {
  padas: number[];
  rashiName: string;
  rashiNumber: number;
  nadi: "ida" | "pingala";
  nostril: "Left" | "Right";
  sanskritName?: string;
  padaDescription?: string;
}

export interface NakshatraNadiDefinition {
  nakshatraNumber: number;
  nakshatraName: string;
  sanskritName: string;
  tattva: TattvaElement;
  defaultNadi: "ida" | "pingala" | "mixed";
  primaryNostril: "Left" | "Right" | "Mixed";
  spans: NakshatraNadiSpan[];
}

export interface NakshatraSwaraAlignmentResult {
  tithiNumber: number;
  tithiName: string;
  paksha: string;
  requiredNadi: "ida" | "pingala";
  requiredNostril: "Left" | "Right" | "Both";
  starNadi: "ida" | "pingala" | "mixed";
  starNostril: "Left" | "Right" | "Mixed";
  nakshatraNumber?: number;
  nakshatraName: string;
  sanskritName: string;
  pada?: number;
  selectedPada?: number;
  activeRashiName?: string;
  activeRashiSanskrit?: string;
  activeRashiNumber?: number;
  tattva: TattvaElement;
  tattvaDetails: NakshatraTattvaDetails;
  alignmentRating: "Perfect" | "Neutral" | "Incompatible";
  alignmentIcon: "✅" | "⚠️" | "❌";
  alignmentStatus: { en: string; hi: string; sa: string };
  advice: { en: string; hi: string; sa: string };
  elementWarning: { en: string; hi: string; sa: string };
}

export interface NakshatraSwaraRule {
  nakshatraNumber: number;
  nakshatraName: string;
  sanskritName: string;
  rashiName: string;
  rashiNumber: number;
  startNadi: "ida" | "pingala";
  endNadi: "ida" | "pingala";
  startNostril: "Left" | "Right";
  endNostril: "Left" | "Right";
}

export interface NakshatraSwaraEvent {
  id?: string;
  nakshatraNumber?: number;
  nakshatraName?: string;
  sanskritName?: string;
  eventType?: "start" | "end";
  type?: any;
  targetNadi?: "ida" | "pingala";
  targetNostril?: "Left" | "Right";
  nadi?: any;
  nadiLabel?: any;
  windowStartMs?: number;
  windowEndMs?: number;
  startTimeMs?: number;
  endTimeMs?: number;
  durationMinutes?: number;
  formattedStart?: string;
  formattedEnd?: string;
  formattedRange?: string;
  hasOverlap?: boolean;
  isActive?: boolean;
  windowFormatted?: string;
  label?: { en: string; hi: string; sa: string };
  description?: { en: string; hi: string; sa: string };
}

export interface NakshatraSwaraInfo {
  nakshatraNumber?: number;
  nakshatraName?: string;
  startNadi?: any;
  endNadi?: any;
  startNostril?: any;
  endNostril?: any;
  hasOverlap?: boolean;
  startEvent?: any;
  endEvent?: any;
  activeEvents?: NakshatraSwaraEvent[];
  upcomingEvents?: NakshatraSwaraEvent[];
}

export interface MonthlyPanchangaDay {
  day: number;
  date: string;
  vaara: string;
  tithi: string;
  tithi_ends?: string | null;
  tithis?: Segment[];
  nakshatra: string;
  nakshatra_number?: number;
  nakshatra_ends?: string | null;
  nakshatras?: Segment[];
  next_nakshatra?: string | null;
  next_nakshatra_number?: number | null;
  moon_rasi?: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  masa: string;
  paksha: string;
  rahu_kala?: TimingInterval;
  swara_yoga?: any;
}

export interface PanchangaResponse {
  city: string;
  date: string;
  timezone: string;
  jd: number;
  sunrise_jd: number;
  coordinate_mode: "tropical" | "sidereal";
  coordinate_label: string;
  ayanamsa: string | null;
  ayanamsa_key: CoordinateSelection | null;
  ayanamsa_degrees: number | null;
  month_system: MonthSystem;
  month_system_label: string;
  samvatsara: string;
  samvatsara_north?: string;
  ayana: string;
  drik_ayana?: string;
  masa: string;
  masa_number: number;
  is_adhika: boolean;
  rtu: string;
  drik_rtu?: string;
  vaara: string;
  weekday: any;
  kali_day: number;
  saka_year: number;
  kali_year: number;
  vikrama_year: number;
  sunrise: string;
  sunset: string;
  next_sunrise: string;
  sunrise_hours: number;
  sunset_hours: number;
  next_sunrise_hours: number;
  previous_sunrise_ms?: number;
  previous_sunset_ms?: number;
  sunrise_ms?: number;
  sunset_ms?: number;
  next_sunrise_ms?: number;
  moonrise: string | null;
  moonrise_status: string;
  moonset: string | null;
  moonset_status: string;
  day_duration: string;
  night_duration: string;
  paksha: "Śukla" | "Kṛṣṇa";
  rahu_kala: TimingInterval;
  yamaganda: TimingInterval;
  gulika_kala: TimingInterval;
  abhijit_muhurta: TimingInterval;
  brahma_muhurta: TimingInterval;
  amrita_kala: TimingInterval[];
  durmuhurta: TimingInterval[];
  varjyam: TimingInterval[];
  gauri_choghadiya_day: TimingInterval[];
  gauri_choghadiya_night: TimingInterval[];
  tithi: Segment[];
  nakshatra: Segment[];
  yoga: Segment[];
  karana: Segment[];
  planets: PlanetPosition[];
  sun_rasi: string;
  moon_rasi: string;
  swara_yoga: SwaraDayRule;
  planet_transitions?: PlanetTransitionsData;
}

export interface Planet {
  id: string;
  name: string;
  englishName: string;
  deity: string;
  dhyanMantra: string;
  gayatriMantra: string;
  vedoktaMantra: string;
  beejMantra: string;
  japCount: string;
  samidha: string;
  gemstone: string;
  direction: string;
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    lightBg: string;
  };
}
