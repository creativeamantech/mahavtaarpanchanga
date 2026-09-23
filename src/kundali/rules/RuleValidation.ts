import { AstrologyRule, RuleCondition } from "./RuleTypes";

export class RuleValidation {
  /**
   * Validates an AstrologyRule schema definition for computational correctness
   */
  public static validateRule(rule: AstrologyRule): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.id || rule.id.trim().length === 0) {
      errors.push("Rule must have a non-empty unique id.");
    }

    if (!rule.nameEn || !rule.nameHi) {
      errors.push("Rule must define both English and Hindi names.");
    }

    if (!rule.source || !rule.sourceReference) {
      errors.push(`Rule ${rule.id} lacks required classical source or sourceReference citation.`);
    }

    if (!rule.category || rule.category.length === 0) {
      errors.push(`Rule ${rule.id} must belong to at least one YogaCategory.`);
    }

    if (!rule.primaryCondition) {
      errors.push(`Rule ${rule.id} must define a primaryCondition.`);
    } else {
      RuleValidation.validateCondition(rule.primaryCondition, `${rule.id}.primary`, errors);
    }

    if (rule.exceptions) {
      rule.exceptions.forEach((exc, idx) => {
        RuleValidation.validateCondition(exc.condition, `${rule.id}.exception[${idx}]`, errors);
      });
    }

    if (rule.cancellationRules) {
      rule.cancellationRules.forEach((canc, idx) => {
        RuleValidation.validateCondition(canc.condition, `${rule.id}.cancellation[${idx}]`, errors);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateCondition(condition: RuleCondition, path: string, errors: string[]): void {
    if (!condition.id || !condition.type) {
      errors.push(`Condition at ${path} is missing id or type.`);
      return;
    }

    if (condition.type === "CompoundCondition") {
      if (!condition.conditions || condition.conditions.length === 0) {
        errors.push(`CompoundCondition at ${path} has no nested conditions.`);
      } else {
        condition.conditions.forEach((child, i) =>
          RuleValidation.validateCondition(child, `${path}.conditions[${i}]`, errors),
        );
      }
    }
  }
}
