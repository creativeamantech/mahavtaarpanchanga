import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { CompleteShadbalaResult } from "../shadbala/ShadbalaTypes";
import { DashaTimeline } from "../dasha/types/DashaTypes";
import { RuleRegistry } from "./RuleRegistry";
import { RuleEvaluator } from "./RuleEvaluator";
import {
  AstrologyRule,
  DignityState,
  EvaluatedGrahaState,
  EvaluatedHouseState,
  RuleEvaluationContext,
  RuleResult,
  YogaCategory,
} from "./RuleTypes";

export class RuleEngine {
  private readonly registry: RuleRegistry;

  constructor(registry: RuleRegistry = RuleRegistry.getInstance()) {
    this.registry = registry;
  }

  /**
   * Evaluates all registered canonical rules against the evaluation context
   */
  public evaluateAll(context: RuleEvaluationContext): RuleResult[] {
    const rules = this.registry.getAllRules();
    return rules.map((rule) => RuleEvaluator.evaluateRule(rule, context));
  }

  /**
   * Evaluates rules belonging to a specific category
   */
  public evaluateCategory(category: YogaCategory, context: RuleEvaluationContext): RuleResult[] {
    const rules = this.registry.getRulesByCategory(category);
    return rules.map((rule) => RuleEvaluator.evaluateRule(rule, context));
  }

  /**
   * Evaluates a single rule by its unique identifier
   */
  public evaluateRule(ruleId: string, context: RuleEvaluationContext): RuleResult | undefined {
    const rule = this.registry.getRule(ruleId);
    if (!rule) return undefined;
    return RuleEvaluator.evaluateRule(rule, context);
  }

  /**
   * Transforms existing Kundli data objects into the normalized RuleEvaluationContext
   * strictly reusing all upstream calculations (Graha state, Dignity, Shadbala, Dasha).
   */
  public static buildContextFromKundli(
    planets: Array<{
      id: string;
      longitude: number;
      signIndex: number;
      degreeInSign: number;
      houseD1: number;
      houseChandra: number;
      dignity: string;
      isRetrograde: boolean;
      isCombust: boolean;
    }>,
    houses: Array<{
      houseNumber: number;
      signIndex: number;
      lord: string;
      planetsPresent?: string[];
    }>,
    lagnaSignIndex: number,
    moonSignIndex: number,
    shadbala?: CompleteShadbalaResult,
    dashaTimeline?: DashaTimeline,
  ): RuleEvaluationContext {
    const planetMap = new Map<CanonicalBodyId, EvaluatedGrahaState>();

    for (const p of planets) {
      let rupa: number | undefined;
      let ratio: number | undefined;

      if (shadbala?.planetaryShadbala) {
        const bodyId = p.id as CanonicalBodyId;
        const b = shadbala.planetaryShadbala[bodyId];
        if (b) {
          rupa = b.totalShadbalaRupa;
          ratio = b.shadbalaRatio;
        }
      }

      planetMap.set(p.id as CanonicalBodyId, {
        id: p.id as CanonicalBodyId,
        longitude: p.longitude,
        signIndex: p.signIndex,
        degreeInSign: p.degreeInSign,
        houseD1: p.houseD1,
        houseChandra: p.houseChandra,
        dignity: (p.dignity as DignityState) || "neutral",
        isRetrograde: !!p.isRetrograde,
        isCombust: !!p.isCombust,
        totalShadbalaRupa: rupa,
        shadbalaRatio: ratio,
      });
    }

    const houseStates: EvaluatedHouseState[] = houses.map((h) => {
      // Find planets in this house if not populated
      const planetsInHouse = planets
        .filter((pl) => pl.houseD1 === h.houseNumber)
        .map((pl) => pl.id as CanonicalBodyId);

      return {
        houseNumber: h.houseNumber,
        signIndex: h.signIndex,
        lord: h.lord as CanonicalBodyId,
        planetsPresent: planetsInHouse,
        bhavaBalaRupa: shadbala?.bhavaBala?.find((b) => b.houseNumber === h.houseNumber)
          ?.totalBhavaBalaRupa,
      };
    });

    let currentDashaLords:
      | {
          maha?: CanonicalBodyId;
          antar?: CanonicalBodyId;
          prat?: CanonicalBodyId;
        }
      | undefined;

    if (dashaTimeline?.currentPeriods) {
      currentDashaLords = {
        maha: dashaTimeline.currentPeriods.mahadasha?.lord as CanonicalBodyId,
        antar: dashaTimeline.currentPeriods.antardasha?.lord as CanonicalBodyId,
        prat: dashaTimeline.currentPeriods.pratyantardasha?.lord as CanonicalBodyId,
      };
    }

    return {
      planets: planetMap,
      houses: houseStates,
      lagnaSignIndex,
      moonSignIndex,
      shadbala,
      dashaTimeline,
      currentDashaLords,
    };
  }
}
