import { JaiminiRashiDrishtiEngine } from "./JaiminiRashiDrishtiEngine";
import { CharaKarakaReport, ArudhaReport, JaiminiProfile } from "./JaiminiTypes";

export class JaiminiValidation {
  /**
   * Validates Chara Karaka invariant rules:
   * 1. All karakas must have unique planetary assignees.
   * 2. AK must have the highest effective degree.
   * 3. DK must have the lowest effective degree.
   */
  public static validateCharaKarakas(report: CharaKarakaReport): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const expectedCount = report.scheme === "7_karaka" ? 7 : 8;

    if (report.karakas.length !== expectedCount) {
      errors.push(
        `Expected ${expectedCount} karakas for ${report.scheme}, found ${report.karakas.length}`,
      );
    }

    const assignedPlanets = new Set(report.karakas.map((k) => k.planet));
    if (assignedPlanets.size !== report.karakas.length) {
      errors.push("Duplicate planetary assignment detected across Chara Karakas.");
    }

    for (let i = 0; i < report.karakas.length - 1; i++) {
      const cur = report.karakas[i].effectiveDegree;
      const next = report.karakas[i + 1].effectiveDegree;
      if (cur < next - 1e-6) {
        errors.push(
          `Degressive order violated: Karaka ${report.karakas[i].karakaId} (${cur}°) < ${report.karakas[i + 1].karakaId} (${next}°)`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates Arudha Pada invariant rules:
   * 1. Exactly 12 Padas generated (A1 to A12).
   * 2. All final pada sign indices are between 0 and 11.
   * 3. If exception rules are applied, no final pada can equal house or 7th from house.
   */
  public static validateArudhas(report: ArudhaReport): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (report.padas.length !== 12) {
      errors.push(`Expected 12 Arudha Padas, found ${report.padas.length}`);
    }

    for (const pada of report.padas) {
      if (pada.finalPadaSignIndex < 0 || pada.finalPadaSignIndex > 11) {
        errors.push(
          `Invalid final sign index ${pada.finalPadaSignIndex} for Pada ${pada.padaCode}`,
        );
      }

      if (report.exceptionConvention === "StandardNeelakantha") {
        const sH = pada.houseSignIndex;
        if (pada.finalPadaSignIndex === sH) {
          errors.push(
            `Exception violation: Pada ${pada.padaCode} falls in the house itself under StandardNeelakantha`,
          );
        }
        if (pada.finalPadaSignIndex === (sH + 6) % 12) {
          errors.push(
            `Exception violation: Pada ${pada.padaCode} falls in 7th from house under StandardNeelakantha`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates Jaimini Rashi Drishti mathematical symmetries across all 12 signs:
   * 1. Every sign must aspect exactly 3 signs.
   * 2. Aspect symmetry: if A aspects B, B must aspect A.
   */
  public static validateRashiDrishtiSymmetries(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (let s = 0; s < 12; s++) {
      const aspected = JaiminiRashiDrishtiEngine.getAspectedSigns(s);
      if (aspected.length !== 3) {
        errors.push(`Sign ${s} aspects ${aspected.length} signs (expected 3)`);
      }
      if (aspected.includes(s)) {
        errors.push(`Sign ${s} aspects itself`);
      }

      for (const target of aspected) {
        const reverseAspects = JaiminiRashiDrishtiEngine.getAspectedSigns(target);
        if (!reverseAspects.includes(s)) {
          errors.push(
            `Asymmetric Rashi Drishti: Sign ${s} aspects ${target}, but ${target} does not aspect ${s}`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a complete Jaimini profile
   */
  public static validateProfile(profile: JaiminiProfile): {
    isValid: boolean;
    errors: string[];
  } {
    const karakaVal = JaiminiValidation.validateCharaKarakas(profile.charaKarakas);
    const arudhaVal = JaiminiValidation.validateArudhas(profile.arudhas);
    const drishtiVal = JaiminiValidation.validateRashiDrishtiSymmetries();

    const allErrors = [...karakaVal.errors, ...arudhaVal.errors, ...drishtiVal.errors];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}
