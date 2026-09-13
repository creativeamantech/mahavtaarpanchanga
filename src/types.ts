export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface Segment {
  number: number;
  name: string;
  ends?: string | null;
}

export interface TimingInterval {
  start: string;
  end: string;
  name?: string;
  description?: string;
}

export interface PlanetPosition {
  id: string;
  name: string;
  sanskritName: string;
  longitude: number;
  siderealLongitude: number;
  rasi: string;
  rasiNumber: number;
  degreesInRasi: string;
  nakshatra: string;
  nakshatraNumber: number;
  pada: number;
  isRetrograde?: boolean;
}

export type TransitType = 'rasi' | 'nakshatra' | 'retrograde' | 'direct' | 'combust' | 'rise';

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
  isCombust?: boolean;
  combustDistanceDeg?: number;
  nextRasiTransit?: PlanetTransitionEvent;
  nextNakshatraTransit?: PlanetTransitionEvent;
  nextMotionTransit?: PlanetTransitionEvent;
}

export interface PlanetTransitionsData {
  planets: PlanetTransitStatus[];
  upcomingEvents: PlanetTransitionEvent[];
  todayEvents: PlanetTransitionEvent[];
}

export type SwaraNadi = 'ida' | 'pingala' | 'sushumna';

export interface SwaraDayRule {
  dayNumber: number; // 1 to 30
  tithiName: string;
  paksha: 'Shukla Paksha' | 'Krishna Paksha' | 'Full moon' | 'No Moon';
  sunriseSwara: SwaraNadi;
  sunsetSwara: SwaraNadi;
  sunriseNostril: 'Left' | 'Right';
  sunsetNostril: 'Left' | 'Right';
  moonriseSwara: SwaraNadi;
  moonsetSwara: SwaraNadi;
  moonriseNostril: 'Left' | 'Right';
  moonsetNostril: 'Left' | 'Right';
}

export interface SwaraTimingWindow {
  start: string;
  end: string;
  windowFormatted: string;
  ruleDescription: {
    en: string;
    hi: string;
    sa: string;
  };
  isActive?: boolean;
}

export interface SwaraYogaData {
  dayNumber: number;
  tithiName: string;
  paksha: string;
  sunriseSwara: SwaraNadi;
  sunsetSwara: SwaraNadi;
  sunriseNostril: 'Left' | 'Right';
  sunsetNostril: 'Left' | 'Right';
  moonriseSwara: SwaraNadi;
  moonsetSwara: SwaraNadi;
  moonriseNostril: 'Left' | 'Right';
  moonsetNostril: 'Left' | 'Right';
  sunriseWindow?: SwaraTimingWindow;
  sunsetWindow?: SwaraTimingWindow;
  moonriseWindow?: SwaraTimingWindow | null;
  moonsetWindow?: SwaraTimingWindow | null;
  activeCelestialWindow?: 'sunrise' | 'sunset' | 'moonrise' | 'moonset' | null;
  currentActiveSwara?: SwaraNadi;
  activeNostril?: 'Left' | 'Right' | 'Both';
  minutesIntoCycle?: number;
  minutesRemainingInCycle?: number;
  cycleNumberToday?: number;
  activeTattva?: {
    name: 'Prithvi' | 'Jala' | 'Tejas' | 'Vayu' | 'Akasha';
    sanskrit: string;
    element: string;
    color: string;
    durationMins: number;
    karya: string;
  };
}

export interface PanchangaResponse {
  city: string;
  date: string;
  timezone: string;
  jd: number;
  sunrise_jd: number;
  coordinate_mode: 'sidereal' | 'tropical';
  coordinate_label: string;
  ayanamsa: string | null;
  ayanamsa_key: string | null;
  ayanamsa_degrees: number | null;
  month_system: 'amanta' | 'purnimanta';
  month_system_label: string;
  samvatsara: string;
  samvatsara_north: string;
  ayana: string;
  drik_ayana: string;
  masa: string;
  masa_number: number;
  is_adhika: boolean;
  rtu: string;
  drik_rtu: string;
  vaara: string;
  kali_day: number;
  saka_year: number;
  kali_year: number;
  vikrama_year: number;
  sunrise: string;
  sunset: string;
  next_sunrise?: string;
  sunrise_hours?: number;
  sunset_hours?: number;
  next_sunrise_hours?: number;
  moonrise: string | null;
  moonrise_status: string;
  moonset: string | null;
  moonset_status: string;
  day_duration: string;
  night_duration?: string;
  paksha?: 'Śukla' | 'Kṛṣṇa';
  rahu_kala: TimingInterval;
  yamaganda?: TimingInterval;
  gulika_kala?: TimingInterval;
  abhijit_muhurta?: TimingInterval;
  brahma_muhurta?: TimingInterval;
  amrita_kala?: TimingInterval[];
  durmuhurta: TimingInterval[];
  varjyam: TimingInterval[];
  gauri_choghadiya_day?: TimingInterval[];
  gauri_choghadiya_night?: TimingInterval[];
  tithi: Segment[];
  nakshatra: Segment[];
  yoga: Segment[];
  karana: Segment[];
  planets?: PlanetPosition[];
  sun_rasi?: string;
  moon_rasi?: string;
  swara_yoga?: SwaraYogaData;
  planet_transitions?: PlanetTransitionsData;
}

export type CoordinateSelection =
  | 'citra'
  | 'revati'
  | 'rohini'
  | 'pushya'
  | 'mula'
  | 'krishnamurti'
  | 'raman'
  | 'tropical';

export type MonthSystem = 'amanta' | 'purnimanta';

export interface MonthlyPanchangaDay {
  day: number;
  date: string;
  vaara: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  masa: string;
  paksha?: 'Śukla' | 'Kṛṣṇa';
  rahu_kala?: TimingInterval;
  swara_yoga?: SwaraYogaData;
}

export type AppTheme = 'parchment' | 'nightSky';

export interface UserSettings {
  lang: 'en' | 'hi' | 'sa';
  ayanamsa: CoordinateSelection;
  monthSystem: MonthSystem;
  currentCity: string;
  theme?: AppTheme;
  customCoords: {
    lat: number;
    lon: number;
    tz: string;
    name: string;
    isDeviceLocation?: boolean;
    accuracyMeters?: number;
  } | null;
  savedAt?: string;
}

