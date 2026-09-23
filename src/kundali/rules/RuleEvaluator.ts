import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import {
  AstrologyRule,
  RuleCondition,
  RuleEvaluationContext,
  RuleResult,
  RuleEvaluationStatus,
  RuleStrengthFactorResult,
  DashaActivationMetadata,
  KendraTrikonaRelationshipCondition,
} from "./RuleTypes";

export class RuleEvaluator {
  /**
   * Evaluates an individual AstrologyRule against the provided chart context
   */
  public static evaluateRule(rule: AstrologyRule, ctx: RuleEvaluationContext): RuleResult {
    const matchedConditions: string[] = [];
    const failedConditions: string[] = [];

    // 1. Evaluate Primary Condition
    const primaryMet = RuleEvaluator.evaluateCondition(
      rule.primaryCondition,
      ctx,
      matchedConditions,
      failedConditions,
    );

    let status: RuleEvaluationStatus = primaryMet ? "PRESENT" : "ABSENT";

    // 2. Evaluate Exceptions (if primary condition is met)
    const exceptionsTriggered: string[] = [];
    if (primaryMet && rule.exceptions) {
      for (const exc of rule.exceptions) {
        const excMet = RuleEvaluator.evaluateCondition(exc.condition, ctx);
        if (excMet) {
          exceptionsTriggered.push(exc.id);
          status = exc.resultStatusIfTriggered;
        }
      }
    }

    // 3. Evaluate Cancellations (if primary condition is met and not already absent)
    const cancellationsTriggered: string[] = [];
    if (status === "PRESENT" && rule.cancellationRules) {
      for (const canc of rule.cancellationRules) {
        const cancMet = RuleEvaluator.evaluateCondition(canc.condition, ctx);
        if (cancMet) {
          cancellationsTriggered.push(canc.id);
          if (canc.cancellationType === "nullification") {
            status = "CANCELLED";
          } else if (canc.cancellationType === "mitigation") {
            status = "PARTIAL";
          } else if (canc.cancellationType === "transformation") {
            status = "CONDITIONAL";
          }
        }
      }
    }

    // 4. Calculate Strength Factors
    const strengthFactors: RuleStrengthFactorResult[] = [];
    let overallStrengthScore = 0.5;

    if (status === "PRESENT" || status === "PARTIAL" || status === "CONDITIONAL") {
      overallStrengthScore = RuleEvaluator.computeStrengthScore(rule, ctx, strengthFactors);
    }

    // 5. Evaluate Dasha Activation
    const dashaActivation = RuleEvaluator.computeDashaActivation(rule, ctx);

    // Confidence represents computational completeness of verified classical inputs
    const confidence = 1.0;

    return {
      ruleId: rule.id,
      nameEn: rule.nameEn,
      nameHi: rule.nameHi,
      nameSa: rule.nameSa,
      category: rule.category,
      status,
      matchedConditions,
      failedConditions,
      exceptionsTriggered,
      cancellationsTriggered,
      strengthFactors,
      overallStrengthScore,
      source: rule.source,
      sourceReference: rule.sourceReference,
      confidence,
      calculationVersion: rule.version,
      dashaActivation,
      descriptionEn: rule.descriptionEn,
      descriptionHi: rule.descriptionHi,
    };
  }

  /**
   * Recursively evaluates any atomic or compound RuleCondition
   */
  public static evaluateCondition(
    condition: RuleCondition,
    ctx: RuleEvaluationContext,
    matched?: string[],
    failed?: string[],
  ): boolean {
    let result = false;

    switch (condition.type) {
      case "PlanetInHouse": {
        const planet = ctx.planets.get(condition.planet);
        if (!planet) break;
        const targetHouse =
          condition.referenceFrame === "Moon" ? planet.houseChandra : planet.houseD1;
        result = condition.houses.includes(targetHouse);
        break;
      }

      case "PlanetInSign": {
        const planet = ctx.planets.get(condition.planet);
        if (!planet) break;
        result = condition.signs.includes(planet.signIndex);
        break;
      }

      case "DignityCondition": {
        const planet = ctx.planets.get(condition.planet);
        if (!planet) break;
        result = condition.dignities.includes(planet.dignity);
        break;
      }

      case "HouseLordPlacement": {
        const houseState = ctx.houses.find((h) => h.houseNumber === condition.house);
        if (!houseState) break;
        const lordPlanet = ctx.planets.get(houseState.lord);
        if (!lordPlanet) break;
        const placement =
          condition.referenceFrame === "Moon" ? lordPlanet.houseChandra : lordPlanet.houseD1;
        result = condition.placedInHouses.includes(placement);
        break;
      }

      case "PlanetConjunction": {
        if (condition.planets.length < 2) break;
        const first = ctx.planets.get(condition.planets[0]);
        if (!first) break;

        result = condition.planets.every((pId) => {
          const p = ctx.planets.get(pId);
          if (!p) return false;
          if (condition.sameHouse !== false && p.houseD1 !== first.houseD1) {
            return false;
          }
          if (condition.maxOrbDeg !== undefined) {
            let diff = Math.abs(p.longitude - first.longitude);
            if (diff > 180) diff = 360 - diff;
            if (diff > condition.maxOrbDeg) return false;
          }
          return true;
        });
        break;
      }

      case "MutualAspect": {
        result = RuleEvaluator.checkMutualAspect(condition.planetA, condition.planetB, ctx);
        break;
      }

      case "ExchangeOfSigns": {
        result = RuleEvaluator.checkExchangeOfSigns(
          condition.planetA,
          condition.planetB,
          condition.houseA,
          condition.houseB,
          ctx,
        );
        break;
      }

      case "KendraTrikonaRelationship": {
        result = RuleEvaluator.checkKendraTrikonaRelationship(condition, ctx);
        break;
      }

      case "NeechabhangaCondition": {
        result = RuleEvaluator.checkNeechabhanga(
          condition.debilitatedPlanet,
          condition.ruleVariant,
          ctx,
        );
        break;
      }

      case "CompoundCondition": {
        if (condition.operator === "AND") {
          result = condition.conditions.every((c) =>
            RuleEvaluator.evaluateCondition(c, ctx, matched, failed),
          );
        } else if (condition.operator === "OR") {
          result = condition.conditions.some((c) =>
            RuleEvaluator.evaluateCondition(c, ctx, matched, failed),
          );
        } else if (condition.operator === "NOT") {
          const childResult = RuleEvaluator.evaluateCondition(
            condition.conditions[0],
            ctx,
            matched,
            failed,
          );
          result = !childResult;
        } else if (condition.operator === "XOR") {
          const count = condition.conditions.filter((c) =>
            RuleEvaluator.evaluateCondition(c, ctx, matched, failed),
          ).length;
          result = count === 1;
        }
        break;
      }

      default:
        result = false;
    }

    if (result) {
      matched?.push(condition.id);
    } else {
      failed?.push(condition.id);
    }

    return result;
  }

  /**
   * Checks whether two planets have mutual Drishti (aspect)
   */
  public static checkMutualAspect(
    aId: CanonicalBodyId,
    bId: CanonicalBodyId,
    ctx: RuleEvaluationContext,
  ): boolean {
    const a = ctx.planets.get(aId);
    const b = ctx.planets.get(bId);
    if (!a || !b) return false;

    // Houses counted from each other (1 to 12)
    const distAtoB = ((b.houseD1 - a.houseD1 + 12) % 12) + 1;
    const distBtoA = ((a.houseD1 - b.houseD1 + 12) % 12) + 1;

    const aAspectsB = RuleEvaluator.doesPlanetAspect(aId, distAtoB);
    const bAspectsA = RuleEvaluator.doesPlanetAspect(bId, distBtoA);

    return aAspectsB && bAspectsA;
  }

  /**
   * Classical Parashari full aspects:
   * All planets aspect 7th house.
   * Mars also aspects 4th and 8th.
   * Jupiter also aspects 5th and 9th.
   * Saturn also aspects 3rd and 10th.
   */
  public static doesPlanetAspect(planet: CanonicalBodyId, houseDist: number): boolean {
    if (houseDist === 7) return true;
    if (planet === "Mars" && (houseDist === 4 || houseDist === 8)) return true;
    if (planet === "Jupiter" && (houseDist === 5 || houseDist === 9)) return true;
    if (planet === "Saturn" && (houseDist === 3 || houseDist === 10)) return true;
    return false;
  }

  /**
   * Checks Parivartana Yoga (Exchange of Signs / House lords)
   */
  public static checkExchangeOfSigns(
    aId: CanonicalBodyId,
    bId: CanonicalBodyId,
    houseA: number | undefined,
    houseB: number | undefined,
    ctx: RuleEvaluationContext,
  ): boolean {
    const pA = ctx.planets.get(aId);
    const pB = ctx.planets.get(bId);
    if (!pA || !pB) return false;

    // Dispositor of A must be B, and Dispositor of B must be A
    const lordOfSignA = RuleEvaluator.getSignLord(pA.signIndex);
    const lordOfSignB = RuleEvaluator.getSignLord(pB.signIndex);

    const isSignExchange = lordOfSignA === bId && lordOfSignB === aId;
    if (!isSignExchange) return false;

    if (houseA !== undefined && pA.houseD1 !== houseA) return false;
    if (houseB !== undefined && pB.houseD1 !== houseB) return false;

    return true;
  }

  /**
   * Returns traditional sign lord for 0..11
   */
  public static getSignLord(signIndex: number): CanonicalBodyId {
    const lords: CanonicalBodyId[] = [
      "Mars", // 0: Aries
      "Venus", // 1: Taurus
      "Mercury", // 2: Gemini
      "Moon", // 3: Cancer
      "Sun", // 4: Leo
      "Mercury", // 5: Virgo
      "Venus", // 6: Libra
      "Mars", // 7: Scorpio
      "Jupiter", // 8: Sagittarius
      "Saturn", // 9: Capricorn
      "Saturn", // 10: Aquarius
      "Jupiter", // 11: Pisces
    ];
    return lords[signIndex % 12];
  }

  /**
   * Exaltation signs for classical planets
   */
  public static getExaltationSign(planet: CanonicalBodyId): number {
    switch (planet) {
      case "Sun":
        return 0; // Aries
      case "Moon":
        return 1; // Taurus
      case "Mars":
        return 9; // Capricorn
      case "Mercury":
        return 5; // Virgo
      case "Jupiter":
        return 3; // Cancer
      case "Venus":
        return 11; // Pisces
      case "Saturn":
        return 6; // Libra
      case "Rahu":
        return 1; // Taurus / Gemini
      case "Ketu":
        return 7; // Scorpio / Sagittarius
      default:
        return 0;
    }
  }

  /**
   * Debilitation signs for classical planets
   */
  public static getDebilitationSign(planet: CanonicalBodyId): number {
    return (RuleEvaluator.getExaltationSign(planet) + 6) % 12;
  }

  /**
   * Checks Kendra-Trikona lord relationship (Raja Yoga foundation)
   */
  public static checkKendraTrikonaRelationship(
    condition: KendraTrikonaRelationshipCondition,
    ctx: RuleEvaluationContext,
  ): boolean {
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];

    // Check all combinations of Kendra lords and Trikona lords
    for (const kH of kendraHouses) {
      const kLord = ctx.houses.find((h) => h.houseNumber === kH)?.lord;
      if (!kLord) continue;

      for (const tH of trikonaHouses) {
        if (kH === tH) continue; // Same house (Lagna is both)
        const tLord = ctx.houses.find((h) => h.houseNumber === tH)?.lord;
        if (!tLord || kLord === tLord) continue; // Single planet ruling both (e.g., Yogakaraka)

        const pK = ctx.planets.get(kLord);
        const pT = ctx.planets.get(tLord);
        if (!pK || !pT) continue;

        if (condition.relationship === "dharma_karma") {
          // Specific 9th and 10th lord relationship
          if (!((kH === 10 && tH === 9) || (kH === 9 && tH === 10))) continue;
          if (
            pK.houseD1 === pT.houseD1 ||
            RuleEvaluator.checkMutualAspect(kLord, tLord, ctx) ||
            RuleEvaluator.checkExchangeOfSigns(kLord, tLord, undefined, undefined, ctx)
          ) {
            return true;
          }
        } else if (condition.relationship === "conjunction") {
          if (pK.houseD1 === pT.houseD1) return true;
        } else if (condition.relationship === "mutual_aspect") {
          if (RuleEvaluator.checkMutualAspect(kLord, tLord, ctx)) return true;
        } else if (condition.relationship === "parivartana") {
          if (RuleEvaluator.checkExchangeOfSigns(kLord, tLord, undefined, undefined, ctx)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Checks Neechabhanga cancellation variants
   */
  public static checkNeechabhanga(
    debilitatedPlanet: CanonicalBodyId,
    variant: string,
    ctx: RuleEvaluationContext,
  ): boolean {
    const p = ctx.planets.get(debilitatedPlanet);
    if (!p) return false;
    if (p.dignity !== "debilitated") return false;

    const kendraHouses = [1, 4, 7, 10];
    const debSign = p.signIndex;
    const dispositor = RuleEvaluator.getSignLord(debSign);
    const dispPlanet = ctx.planets.get(dispositor);

    const exaltSign = RuleEvaluator.getExaltationSign(debilitatedPlanet);
    const exaltLord = RuleEvaluator.getSignLord(exaltSign);
    const exaltLordPlanet = ctx.planets.get(exaltLord);

    switch (variant) {
      case "dispositor_in_kendra":
        // 1. Lord of the debilitation sign is in Kendra from Lagna or Moon
        if (!dispPlanet) return false;
        return (
          kendraHouses.includes(dispPlanet.houseD1) ||
          kendraHouses.includes(dispPlanet.houseChandra)
        );

      case "exaltation_lord_in_kendra":
        // 2. Lord of the planet's exaltation sign is in Kendra from Lagna or Moon
        if (!exaltLordPlanet) return false;
        return (
          kendraHouses.includes(exaltLordPlanet.houseD1) ||
          kendraHouses.includes(exaltLordPlanet.houseChandra)
        );

      case "lord_exalted_in_kendra":
        // 3. Dispositor is itself exalted and in Kendra
        if (!dispPlanet) return false;
        return (
          dispPlanet.dignity === "exalted" &&
          (kendraHouses.includes(dispPlanet.houseD1) ||
            kendraHouses.includes(dispPlanet.houseChandra))
        );

      case "dispositor_aspects": {
        // 4. Dispositor aspects the debilitated planet
        if (!dispPlanet) return false;
        const dist = ((p.houseD1 - dispPlanet.houseD1 + 12) % 12) + 1;
        return RuleEvaluator.doesPlanetAspect(dispositor, dist);
      }

      case "exalted_planet_conjoined": {
        // 5. A planet that gets exalted in the sign is conjoined with it
        for (const [id, pl] of ctx.planets) {
          if (id === debilitatedPlanet) continue;
          if (pl.houseD1 === p.houseD1 && pl.dignity === "exalted") {
            return true;
          }
        }
        return false;
      }

      case "moon_kendra_dispositor":
        // 6. Debilitated planet itself occupies Kendra from Moon
        return kendraHouses.includes(p.houseChandra);

      default:
        return false;
    }
  }

  /**
   * Computes objective strength factors
   */
  private static computeStrengthScore(
    rule: AstrologyRule,
    ctx: RuleEvaluationContext,
    factors: RuleStrengthFactorResult[],
  ): number {
    let score = 0.5;

    // Check relevant graha shadbalas if available
    const primaryGrahas = RuleEvaluator.extractGrahasFromRule(rule);
    let totalRupa = 0;
    let grahaCount = 0;

    for (const gId of primaryGrahas) {
      const p = ctx.planets.get(gId);
      if (p) {
        if (p.isCombust) {
          score -= 0.15;
          factors.push({
            factor: `${gId} Combustion`,
            score: -0.15,
            description: `${gId} is combust by solar proximity (अस्त), reducing expression.`,
          });
        }
        if (p.dignity === "exalted" || p.dignity === "own" || p.dignity === "moolatrikona") {
          score += 0.2;
          factors.push({
            factor: `${gId} Sthana Dignity`,
            score: +0.2,
            description: `${gId} is well placed in ${p.dignity} dignity.`,
          });
        }
        if (p.totalShadbalaRupa) {
          totalRupa += p.totalShadbalaRupa;
          grahaCount++;
        }
      }
    }

    if (grahaCount > 0) {
      const avgRupa = totalRupa / grahaCount;
      const shadbalaBonus = Math.min(0.25, Math.max(-0.25, (avgRupa - 6.0) / 10.0));
      score += shadbalaBonus;
      factors.push({
        factor: "Graha Shadbala Strength",
        score: Math.round(shadbalaBonus * 100) / 100,
        description: `Average Shadbala of participating Grahas is ${avgRupa.toFixed(2)} Rupas.`,
      });
    }

    return Math.min(1.0, Math.max(0.0, Math.round(score * 100) / 100));
  }

  /**
   * Determines if a Dasha lord participates in the rule
   */
  private static computeDashaActivation(
    rule: AstrologyRule,
    ctx: RuleEvaluationContext,
  ): DashaActivationMetadata | undefined {
    const activeGrahas = RuleEvaluator.extractGrahasFromRule(rule);
    const mahaLord = ctx.currentDashaLords?.maha;
    const antarLord = ctx.currentDashaLords?.antar;

    const isActivatedByCurrentMaha = !!(mahaLord && activeGrahas.includes(mahaLord));
    const isActivatedByCurrentAntar = !!(antarLord && activeGrahas.includes(antarLord));

    let notes = "Not activated by current Dasha periods.";
    if (isActivatedByCurrentMaha && isActivatedByCurrentAntar) {
      notes = `Fully activated by both current Mahadasha (${mahaLord}) and Antardasha (${antarLord}).`;
    } else if (isActivatedByCurrentMaha) {
      notes = `Activated by current Mahadasha lord (${mahaLord}).`;
    } else if (isActivatedByCurrentAntar) {
      notes = `Activated by current Antardasha lord (${antarLord}).`;
    }

    return {
      isActivatedByCurrentMaha,
      isActivatedByCurrentAntar,
      activatingGrahas: activeGrahas,
      activeMahadashaLord: mahaLord,
      activeAntardashaLord: antarLord,
      notes,
    };
  }

  /**
   * Extracts participating Grahas from a rule definition
   */
  public static extractGrahasFromRule(rule: AstrologyRule): CanonicalBodyId[] {
    const set = new Set<CanonicalBodyId>();

    function inspect(cond: RuleCondition) {
      if ("planet" in cond && cond.planet) set.add(cond.planet);
      if ("planets" in cond && Array.isArray(cond.planets)) {
        cond.planets.forEach((p) => set.add(p));
      }
      if ("planetA" in cond && cond.planetA) set.add(cond.planetA);
      if ("planetB" in cond && cond.planetB) set.add(cond.planetB);
      if ("debilitatedPlanet" in cond && cond.debilitatedPlanet) set.add(cond.debilitatedPlanet);
      if ("conditions" in cond && Array.isArray(cond.conditions)) {
        cond.conditions.forEach(inspect);
      }
    }

    inspect(rule.primaryCondition);
    return Array.from(set);
  }
}
