import { RepositoryMetadata } from "../adapters/RepositoryMetadata";
import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import {
  IDashaEngine,
  DashaSystemType,
  DashaTimelineResult,
  MahadashaSpan,
  AntardashaSpan,
  PratyantardashaSpan,
} from "../contracts/IDashaEngine";
import { IDashaSystemAdapter } from "./contracts/IDashaSystemAdapter";
import {
  DashaSystem,
  DashaTimeline,
  DashaContext,
  DashaPeriod,
  DashaLevel,
} from "./types/DashaTypes";
import { VimshottariDashaEngine } from "./vimshottari/VimshottariDashaEngine";

/**
 * Universal Dasha Engine Registry & Manager
 * Provides centralized registry for Parashari and Jaimini Dasha systems
 */
export class DashaEngine implements IDashaEngine {
  private static adapters: Map<DashaSystem, IDashaSystemAdapter> = new Map();

  static {
    // Register canonical Vimshottari engine by default
    const vimshottari = new VimshottariDashaEngine();
    DashaEngine.registerAdapter(vimshottari);
  }

  public readonly metadata: RepositoryMetadata;
  public readonly systemType: DashaSystemType;
  private readonly defaultAdapter: IDashaSystemAdapter;

  constructor(system: DashaSystem = "vimshottari") {
    const adapter = DashaEngine.getAdapter(system);
    if (!adapter) {
      throw new Error(`Dasha system '${system}' is not currently registered.`);
    }
    this.defaultAdapter = adapter;
    this.systemType = system as DashaSystemType;
    this.metadata = adapter.metadata;
  }

  /**
   * Registers a new Dasha system adapter
   */
  public static registerAdapter(adapter: IDashaSystemAdapter): void {
    DashaEngine.adapters.set(adapter.systemType, adapter);
  }

  /**
   * Retrieves an adapter by system key
   */
  public static getAdapter(system: DashaSystem): IDashaSystemAdapter | undefined {
    return DashaEngine.adapters.get(system);
  }

  /**
   * Lists all currently registered Dasha systems
   */
  public static getRegisteredSystems(): DashaSystem[] {
    return Array.from(DashaEngine.adapters.keys());
  }

  /**
   * Computes canonical DashaTimeline using the active system adapter
   */
  public calculateCanonicalTimeline(context: DashaContext): DashaTimeline {
    return this.defaultAdapter.calculateTimeline(context);
  }

  /**
   * Implementation satisfying IDashaEngine interface contract
   */
  public calculateTimeline(
    moonSiderealLon: number,
    birthTimestampMs: number,
    depthLevels: 1 | 2 | 3 = 2,
    maxYears?: number,
  ): DashaTimelineResult {
    const timeline = this.defaultAdapter.calculateTimeline({
      moonSiderealLonDeg: moonSiderealLon,
      birthTimestampMs,
      depthLevels: depthLevels as DashaLevel,
      maxYears,
    });

    const mappedTimeline: MahadashaSpan[] = timeline.periods.map((maha) => {
      const antarSpans: AntardashaSpan[] | undefined = maha.children?.map((antar) => {
        const pratSpans: PratyantardashaSpan[] | undefined = antar.children?.map((prat) => ({
          lord: prat.lord,
          startDateIso: prat.startDateIso,
          endDateIso: prat.endDateIso,
          startTimestampMs: prat.startTimestampMs,
          endTimestampMs: prat.endTimestampMs,
          durationYears: prat.durationYears,
          level: 3 as const,
        }));

        return {
          lord: antar.lord,
          startDateIso: antar.startDateIso,
          endDateIso: antar.endDateIso,
          startTimestampMs: antar.startTimestampMs,
          endTimestampMs: antar.endTimestampMs,
          durationYears: antar.durationYears,
          level: 2 as const,
          pratyantardashas: pratSpans,
        };
      });

      return {
        lord: maha.lord,
        startDateIso: maha.startDateIso,
        endDateIso: maha.endDateIso,
        startTimestampMs: maha.startTimestampMs,
        endTimestampMs: maha.endTimestampMs,
        durationYears: maha.durationYears,
        level: 1 as const,
        antardashas: antarSpans,
      };
    });

    return {
      system: this.systemType,
      totalCycleYears: timeline.totalCycleYears,
      currentMahadasha: (timeline.currentPeriods.mahadasha?.lord as CanonicalBodyId) || "Jupiter",
      currentAntardasha: (timeline.currentPeriods.antardasha?.lord as CanonicalBodyId) || "Jupiter",
      currentPratyantardasha: timeline.currentPeriods.pratyantardasha?.lord as CanonicalBodyId,
      balanceAtBirthYears: timeline.balanceAtBirth.remainingYearsTotal,
      timeline: mappedTimeline,
    };
  }
}
