import { RepositoryMetadata } from "../../adapters/RepositoryMetadata";
import {
  DashaSystem,
  DashaPeriod,
  DashaTimeline,
  DashaLevel,
  DashaContext,
  BirthDashaBalance,
  DashaYearConvention,
  CurrentDashaSnapshot,
} from "../types/DashaTypes";
import { IDashaSystemAdapter } from "../contracts/IDashaSystemAdapter";
import {
  VIMSHOTTARI_LORDS,
  TOTAL_VIMSHOTTARI_YEARS,
  getNakshatraInfo,
  getLordIndex,
  getMsPerYear,
} from "./VimshottariSequence";
import { validateTimeline } from "./VimshottariValidation";

export class VimshottariDashaEngine implements IDashaSystemAdapter {
  public readonly metadata: RepositoryMetadata = {
    key: "parashara-vimshottari-v1",
    nameEn: "Brihat Parashara Vimshottari Dasha Engine",
    nameSa: "बृहत्पाराशर विंशोत्तरी महादशा साधन",
    author: "Mahavtaar Jyotish Computational Core",
    version: "1.0.0",
    description:
      "Canonical 120-year Parashari Vimshottari Dasha Engine with 5-tier nested hierarchy (Mahadasha to Prana)",
    sourceText: "Brihat Parashara Hora Shastra, Adhyaya 46, Shlokas 12-50",
    accuracyLevel: "Canonical",
  };

  public readonly systemType: DashaSystem = "vimshottari";
  public readonly totalCycleYears: number = TOTAL_VIMSHOTTARI_YEARS;

  /**
   * Calculates the birth dasha balance (भोग्य दशा) from Moon's sidereal longitude
   */
  public calculateBirthBalance(moonSiderealLonDeg: number): BirthDashaBalance {
    const nakInfo = getNakshatraInfo(moonSiderealLonDeg);
    const startLordDef =
      VIMSHOTTARI_LORDS.find((l) => l.planet === nakInfo.nakshatra.lord) ?? VIMSHOTTARI_LORDS[0];

    const remainingYearsTotal = startLordDef.years * nakInfo.remainingFraction;
    let years = Math.floor(remainingYearsTotal);
    const remMonthsFrac = (remainingYearsTotal - years) * 12.0;
    let months = Math.floor(remMonthsFrac);
    let days = Math.round((remMonthsFrac - months) * 30.0);

    // Normalize date rollover if days === 30 or months === 12
    if (days >= 30) {
      days = 0;
      months += 1;
    }
    if (months >= 12) {
      months = 0;
      years += 1;
    }

    return {
      lord: startLordDef.planet,
      lordNameHi: startLordDef.nameHi,
      lordNameSa: startLordDef.nameSa,
      nakshatraIndex: nakInfo.nakshatra.index,
      nakshatraNameEn: nakInfo.nakshatra.nameEn,
      nakshatraNameHi: nakInfo.nakshatra.nameHi,
      pada: nakInfo.pada,
      passedArcDeg: nakInfo.passedArcDeg,
      remainingArcDeg: nakInfo.remainingArcDeg,
      elapsedFraction: nakInfo.elapsedFraction,
      remainingFraction: nakInfo.remainingFraction,
      remainingYearsTotal,
      years,
      months,
      days,
    };
  }

  /**
   * Primary timeline calculation method supporting multi-tier depth (Levels 1 to 5)
   */
  public calculateTimeline(context: DashaContext): DashaTimeline {
    const convention = context.convention ?? "gregorian_solar";
    const depthLevels = context.depthLevels ?? 2;
    const targetTimestampMs = context.targetTimestampMs ?? Date.now();
    const msPerYear = getMsPerYear(convention);

    const balance = this.calculateBirthBalance(context.moonSiderealLonDeg);
    const startLordIdx = getLordIndex(balance.lord);

    const periods: DashaPeriod[] = [];
    let currentPointerMs = context.birthTimestampMs;

    for (let i = 0; i < 9; i++) {
      const lordDef = VIMSHOTTARI_LORDS[(startLordIdx + i) % 9];
      const durationYears = i === 0 ? balance.remainingYearsTotal : lordDef.years;
      const durationMs = Math.round(durationYears * msPerYear);

      const dashaStartMs = currentPointerMs;
      const dashaEndMs = currentPointerMs + durationMs;
      const isCurrentMaha = targetTimestampMs >= dashaStartMs && targetTimestampMs < dashaEndMs;

      const mahaPeriod: DashaPeriod = {
        system: "vimshottari",
        level: 1,
        lord: lordDef.planet,
        lordNameHi: lordDef.nameHi,
        lordNameSa: lordDef.nameSa,
        startTimestampMs: dashaStartMs,
        endTimestampMs: dashaEndMs,
        startDateIso: new Date(dashaStartMs).toISOString().split("T")[0],
        endDateIso: new Date(dashaEndMs).toISOString().split("T")[0],
        durationYears: Math.round(durationYears * 10000) / 10000,
        durationDays: Math.round((durationMs / 86400000) * 10) / 10,
        periodId: `vimshottari-L1-${lordDef.planet}-${i + 1}`,
        sequence: i + 1,
        source: "BPHS Ch. 46, v. 12-15",
        calculationConvention: convention,
        formulaVersion: "1.0.0",
        validationStatus: "valid",
        isCurrent: isCurrentMaha,
      };

      // Generate nested sub-periods if depthLevels > 1
      if (depthLevels > 1) {
        // If depthLevels >= 4, generate deep sub-periods for active Mahadasha or up to level 3 for all
        const targetSubDepth: DashaLevel = depthLevels >= 4 && !isCurrentMaha ? 2 : depthLevels;
        mahaPeriod.children = this.getNestedPeriods(
          mahaPeriod,
          targetSubDepth,
          convention,
          targetTimestampMs,
        );
      }

      periods.push(mahaPeriod);
      currentPointerMs = dashaEndMs;
    }

    // Identify current active periods hierarchy
    const currentPeriods = this.findActivePeriodsHierarchy(periods, targetTimestampMs);

    const timeline: DashaTimeline = {
      system: "vimshottari",
      systemNameEn: "Vimshottari Dasha",
      systemNameSa: "विंशोत्तरी महादशा",
      totalCycleYears: TOTAL_VIMSHOTTARI_YEARS,
      birthTimestampMs: context.birthTimestampMs,
      targetTimestampMs,
      balanceAtBirth: balance,
      periods,
      currentPeriods,
      convention,
      depthLevels,
    };

    // Run invariant validation
    validateTimeline(timeline);

    return timeline;
  }

  /**
   * Deterministically generates nested children for any parent period
   * (Mahadasha -> Antardashas -> Pratyantardashas -> Sookshmas -> Pranas)
   */
  public getNestedPeriods(
    parentPeriod: DashaPeriod,
    targetDepth: DashaLevel,
    convention: DashaYearConvention = "gregorian_solar",
    targetTimestampMs?: number,
  ): DashaPeriod[] {
    if (parentPeriod.level >= targetDepth || parentPeriod.level >= 5) {
      return [];
    }

    const childLevel = (parentPeriod.level + 1) as DashaLevel;
    const parentDurationMs = parentPeriod.endTimestampMs - parentPeriod.startTimestampMs;
    const parentLordIdx = getLordIndex(parentPeriod.lord);

    // Compute exact integer millisecond allocations to prevent any rounding drift
    const childDurationsMs: number[] = [];
    let allocatedMs = 0;

    for (let j = 0; j < 9; j++) {
      const subLordDef = VIMSHOTTARI_LORDS[(parentLordIdx + j) % 9];
      if (j === 8) {
        // Last child absorbs the integer remainder to preserve exact sum invariant
        childDurationsMs.push(parentDurationMs - allocatedMs);
      } else {
        const portion = subLordDef.years / 120.0;
        const dur = Math.round(parentDurationMs * portion);
        childDurationsMs.push(dur);
        allocatedMs += dur;
      }
    }

    const children: DashaPeriod[] = [];
    let subPointerMs = parentPeriod.startTimestampMs;
    const queryTime = targetTimestampMs ?? Date.now();

    for (let j = 0; j < 9; j++) {
      const subLordDef = VIMSHOTTARI_LORDS[(parentLordIdx + j) % 9];
      const durMs = childDurationsMs[j];
      const subStartMs = subPointerMs;
      const subEndMs = j === 8 ? parentPeriod.endTimestampMs : subPointerMs + durMs;
      const isCurrentChild = queryTime >= subStartMs && queryTime < subEndMs;

      const subDurationYears = (parentPeriod.durationYears * subLordDef.years) / 120.0;

      const childPeriod: DashaPeriod = {
        system: "vimshottari",
        level: childLevel,
        lord: subLordDef.planet,
        lordNameHi: subLordDef.nameHi,
        lordNameSa: subLordDef.nameSa,
        startTimestampMs: subStartMs,
        endTimestampMs: subEndMs,
        startDateIso: new Date(subStartMs).toISOString().split("T")[0],
        endDateIso: new Date(subEndMs).toISOString().split("T")[0],
        durationYears: Math.round(subDurationYears * 100000) / 100000,
        durationDays: Math.round((durMs / 86400000) * 100) / 100,
        periodId: `${parentPeriod.periodId}-L${childLevel}-${subLordDef.planet}-${j + 1}`,
        parentPeriodId: parentPeriod.periodId,
        sequence: j + 1,
        source: "BPHS Ch. 46, v. 16-25",
        calculationConvention: convention,
        formulaVersion: "1.0.0",
        validationStatus: "valid",
        isCurrent: isCurrentChild,
      };

      // Recursively nest further children if deeper level requested
      if (childLevel < targetDepth) {
        // For deep tiers (4, 5), prioritize active child to avoid combinatorial explosion
        const shouldNest = targetDepth <= 3 || isCurrentChild;
        if (shouldNest) {
          childPeriod.children = this.getNestedPeriods(
            childPeriod,
            targetDepth,
            convention,
            queryTime,
          );
        }
      }

      children.push(childPeriod);
      subPointerMs = subEndMs;
    }

    return children;
  }

  /**
   * Helper to locate active periods at all 5 tiers
   */
  private findActivePeriodsHierarchy(
    periods: DashaPeriod[],
    targetMs: number,
  ): CurrentDashaSnapshot {
    const snapshot: CurrentDashaSnapshot = {};

    const activeMaha = periods.find(
      (p) => targetMs >= p.startTimestampMs && targetMs < p.endTimestampMs,
    );
    if (!activeMaha) return snapshot;
    snapshot.mahadasha = activeMaha;

    if (activeMaha.children) {
      const activeAntar = activeMaha.children.find(
        (p) => targetMs >= p.startTimestampMs && targetMs < p.endTimestampMs,
      );
      if (activeAntar) {
        snapshot.antardasha = activeAntar;

        if (activeAntar.children) {
          const activePrat = activeAntar.children.find(
            (p) => targetMs >= p.startTimestampMs && targetMs < p.endTimestampMs,
          );
          if (activePrat) {
            snapshot.pratyantardasha = activePrat;

            if (activePrat.children) {
              const activeSook = activePrat.children.find(
                (p) => targetMs >= p.startTimestampMs && targetMs < p.endTimestampMs,
              );
              if (activeSook) {
                snapshot.sookshma = activeSook;

                if (activeSook.children) {
                  const activePran = activeSook.children.find(
                    (p) => targetMs >= p.startTimestampMs && targetMs < p.endTimestampMs,
                  );
                  if (activePran) {
                    snapshot.prana = activePran;
                  }
                }
              }
            }
          }
        }
      }
    }

    return snapshot;
  }
}
