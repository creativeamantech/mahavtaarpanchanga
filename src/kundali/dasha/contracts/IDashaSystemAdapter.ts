import { RepositoryMetadata } from "../../adapters/RepositoryMetadata";
import {
  DashaSystem,
  DashaPeriod,
  DashaTimeline,
  DashaLevel,
  DashaContext,
  BirthDashaBalance,
  DashaYearConvention,
} from "../types/DashaTypes";

/**
 * Universal System Adapter Contract for Vedic Dasha Systems (Parashari & Jaimini)
 */
export interface IDashaSystemAdapter {
  /** Unique metadata tracking classical source, chapter/verse, and provenance */
  readonly metadata: RepositoryMetadata;

  /** Identified dasha system (e.g. vimshottari, ashtottari, chara, etc.) */
  readonly systemType: DashaSystem;

  /** Total standard cycle length in years (e.g. 120 for Vimshottari, 36 for Yogini, 108 for Ashtottari) */
  readonly totalCycleYears: number;

  /**
   * Calculates the primary timeline up to requested depthLevels (1 to 5)
   */
  calculateTimeline(context: DashaContext): DashaTimeline;

  /**
   * Calculates the birth balance (भोग्य दशा) for a given sidereal Moon longitude
   */
  calculateBirthBalance(moonSiderealLonDeg: number): BirthDashaBalance;

  /**
   * Deterministically generates nested children for a given parent period
   * (e.g. Mahadasha -> Antardashas, or Antardasha -> Pratyantardashas)
   */
  getNestedPeriods(
    parentPeriod: DashaPeriod,
    targetDepth: DashaLevel,
    convention?: DashaYearConvention,
  ): DashaPeriod[];
}
