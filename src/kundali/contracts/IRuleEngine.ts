import { KundliContext } from "../core/KundliDomainModel";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";

export type RuleCategory =
  | "maha_purusha_yoga" // Ruchaka, Bhadra, Hamsa, Malavya, Sasa
  | "raja_yoga" // Kendra-Trikona lord associations
  | "dhana_yoga" // 2nd, 5th, 9th, 11th lord wealth formations
  | "arishta_yoga" // Afflictions, Kemadruma, Daridra, Balarishta
  | "dosha" // Manglik, Kalsarpa, Pitra Dosha, Gandanta
  | "nabhasa_yoga" // Ashraya, Dala, Akriti, Sankhya yogas
  | "lunar_yoga" // Sunapha, Anapha, Durdhara, Gajakesari, Amala
  | "solar_yoga"; // Veshi, Vashi, Ubhayachari

export interface RuleEvaluationResult {
  ruleId: string;
  nameEn: string;
  nameHi: string;
  nameSa: string;
  category: RuleCategory;
  isTriggered: boolean;
  intensity: "low" | "medium" | "high" | "exceptional";
  nature: "benefic" | "malefic" | "neutral" | "mixed";
  descriptionEn: string;
  descriptionHi: string;
  shlokaSource?: string;
  involvedPlanets: string[];
  involvedHouses: number[];
  cancellationFactors?: {
    isCancelled: boolean;
    reasonEn?: string;
    reasonHi?: string;
  };
}

export interface IJyotishaRule {
  readonly id: string;
  readonly metadata: RepositoryMetadata;
  readonly category: RuleCategory;
  evaluate(context: KundliContext): RuleEvaluationResult;
}

export class JyotishaRuleRegistry {
  private static rules: Map<string, IJyotishaRule> = new Map();

  public static register(rule: IJyotishaRule): void {
    this.rules.set(rule.id, rule);
  }

  public static get(id: string): IJyotishaRule | undefined {
    return this.rules.get(id);
  }

  public static evaluateAll(context: KundliContext): RuleEvaluationResult[] {
    const results: RuleEvaluationResult[] = [];
    for (const rule of this.rules.values()) {
      try {
        const res = rule.evaluate(context);
        if (res.isTriggered) {
          results.push(res);
        }
      } catch (err) {
        console.error(`Rule evaluation error for ${rule.id}:`, err);
      }
    }
    return results;
  }

  public static getCount(): number {
    return this.rules.size;
  }
}
