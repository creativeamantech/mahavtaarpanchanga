/**
 * Mahavtaar Kundali Engine - Immutable Calculation Context
 * Phase 8 Production System Architecture
 */

import { CalculationProfile, createCalculationProfile } from "./CalculationProfile";
import {
  KundaliBirthInput,
  parseBirthInputToUtcMs,
  validateKundaliBirthInput,
} from "./KundaliBirthInput";

export interface KundaliCalculationContext {
  readonly birthInput: KundaliBirthInput;
  readonly calculationProfile: CalculationProfile;
  readonly utcTimestampMs: number;
  readonly engineVersion: string;
  readonly calculationTimestampMs: number;
  readonly precisionPolicy: string;
}

/**
 * Constructs an immutable KundaliCalculationContext from birth input and optional calculation profile.
 */
export function createCalculationContext(
  input: KundaliBirthInput,
  profileOverrides?: Partial<CalculationProfile>,
  forcedCalculationTimeMs?: number,
): KundaliCalculationContext {
  validateKundaliBirthInput(input);
  const profile = createCalculationProfile(profileOverrides);
  const utcMs = parseBirthInputToUtcMs(input);

  const context: KundaliCalculationContext = Object.freeze({
    birthInput: Object.freeze({ ...input }),
    calculationProfile: Object.freeze({ ...profile }),
    utcTimestampMs: utcMs,
    engineVersion: profile.engineVersion,
    calculationTimestampMs: forcedCalculationTimeMs ?? Date.now(),
    precisionPolicy: profile.precisionPolicy,
  });

  return context;
}
