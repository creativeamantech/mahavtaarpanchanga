import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";

export type DashaSystemType =
  | "vimshottari"  // 120-year cycle based on Moon's nakshatra (Universal standard)
  | "ashtottari"   // 108-year cycle (Ardra to Revati conditional)
  | "yogini"       // 36-year cycle (Mangala, Pingala, Dhanya, etc.)
  | "chara"        // Jaimini sign-based progression
  | "kaalchakra";  // Navamsha Pada based progression

export interface DashaSpan {
  lord: CanonicalBodyId | string;
  startDateIso: string;
  endDateIso: string;
  startTimestampMs: number;
  endTimestampMs: number;
  durationYears: number;
}

export interface PratyantardashaSpan extends DashaSpan {
  level: 3;
}

export interface AntardashaSpan extends DashaSpan {
  level: 2;
  pratyantardashas?: PratyantardashaSpan[];
}

export interface MahadashaSpan extends DashaSpan {
  level: 1;
  antardashas?: AntardashaSpan[];
}

export interface DashaTimelineResult {
  system: DashaSystemType;
  totalCycleYears: number;
  currentMahadasha: CanonicalBodyId | string;
  currentAntardasha: CanonicalBodyId | string;
  currentPratyantardasha?: CanonicalBodyId | string;
  balanceAtBirthYears: number;
  timeline: MahadashaSpan[];
}

/**
 * Extensible Dasha Engine Interface
 */
export interface IDashaEngine {
  readonly metadata: RepositoryMetadata;
  readonly systemType: DashaSystemType;

  /**
   * Calculates the multi-tier dasha timeline starting from birth
   */
  calculateTimeline(
    moonSiderealLon: number,
    birthTimestampMs: number,
    depthLevels: 1 | 2 | 3,
    maxYears?: number,
  ): DashaTimelineResult;
}
