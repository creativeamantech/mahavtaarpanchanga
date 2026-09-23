import { AstrologyRule, YogaCategory } from "./RuleTypes";
import { CANONICAL_ASTROLOGY_RULES } from "./RuleMetadata";

export class RuleRegistry {
  private static instance: RuleRegistry;
  private readonly rulesMap: Map<string, AstrologyRule> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): RuleRegistry {
    if (!RuleRegistry.instance) {
      RuleRegistry.instance = new RuleRegistry();
    }
    return RuleRegistry.instance;
  }

  private registerDefaults(): void {
    for (const rule of CANONICAL_ASTROLOGY_RULES) {
      this.registerRule(rule);
    }
  }

  public registerRule(rule: AstrologyRule): void {
    this.rulesMap.set(rule.id, rule);
  }

  public getRule(id: string): AstrologyRule | undefined {
    return this.rulesMap.get(id);
  }

  public getAllRules(): AstrologyRule[] {
    return Array.from(this.rulesMap.values()).sort((a, b) => b.priority - a.priority);
  }

  public getRulesByCategory(category: YogaCategory): AstrologyRule[] {
    return this.getAllRules().filter((r) => r.category.includes(category));
  }

  public clear(): void {
    this.rulesMap.clear();
  }

  public resetToDefaults(): void {
    this.clear();
    this.registerDefaults();
  }
}
