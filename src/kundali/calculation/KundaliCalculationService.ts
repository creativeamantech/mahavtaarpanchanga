/**
 * Mahavtaar Kundali Engine - Single Canonical Calculation Service
 * Phase 8 Production System Architecture
 */

import { KundaliBirthInput, validateKundaliBirthInput } from "../core/KundaliBirthInput";
import { CalculationProfile, createCalculationProfile } from "../core/CalculationProfile";
import { createCalculationContext } from "../core/KundaliCalculationContext";
import { FullKundliData, ResultHashes } from "../core/FullKundliData";
import { EngineAdapters } from "../adapters/EngineAdapters";
import {
  canonicalJsonStringify,
  generateCalculationId,
  generateResultHash,
} from "../audit/DeterministicHash";
import { createCanonicalProvenance } from "../audit/ProvenanceSystem";

export class KundaliCalculationService {
  /**
   * Primary canonical calculation entry point.
   * Produces a reproducible, auditable, immutable FullKundliData object.
   */
  public static calculateFullKundli(
    input: KundaliBirthInput,
    profileOverrides?: Partial<CalculationProfile>,
    forcedCalculationTimeMs?: number,
  ): FullKundliData {
    // 1. Validate Input
    validateKundaliBirthInput(input);

    // 2. Create Profile & Context
    const profile = createCalculationProfile(profileOverrides);
    const ctx = createCalculationContext(input, profile, forcedCalculationTimeMs);

    // 3. Orchestrate Engines
    const astronomy = EngineAdapters.calculateAstronomy(ctx);
    const houses = EngineAdapters.calculateHouses(astronomy);
    const vargas = EngineAdapters.calculateVargas(astronomy);
    const shadbala = EngineAdapters.calculateShadbala(astronomy, ctx);
    const dasha = EngineAdapters.calculateDasha(astronomy, ctx);
    const rules = EngineAdapters.evaluateRules(astronomy, houses, vargas, shadbala, dasha);
    const jaimini = EngineAdapters.calculateJaimini(astronomy, vargas, ctx);
    const ashtakavarga = EngineAdapters.calculateAshtakavarga(astronomy);
    const kp = EngineAdapters.calculateKP(astronomy, ctx);
    const gochar = EngineAdapters.calculateGochar(astronomy, ctx);

    // 4. Generate Section Result Hashes
    const astronomyHash = generateResultHash(astronomy);
    const vargasHash = generateResultHash(vargas);
    const shadbalaHash = generateResultHash(shadbala);
    const dashaHash = generateResultHash(dasha);
    const rulesHash = generateResultHash(rules);
    const jaiminiHash = generateResultHash(jaimini);
    const ashtakavargaHash = generateResultHash(ashtakavarga);
    const kpHash = generateResultHash(kp);
    const gocharHash = generateResultHash(gochar);

    const inputsHash = generateResultHash({ input, profile });

    const partialData = {
      astronomy,
      houses,
      vargas,
      shadbala,
      dasha,
      rules,
      jaimini,
      ashtakavarga,
      kp,
      gochar,
    };
    const completeKundaliHash = generateResultHash(partialData);

    const hashes: ResultHashes = {
      astronomyHash,
      vargasHash,
      shadbalaHash,
      dashaHash,
      rulesHash,
      jaiminiHash,
      ashtakavargaHash,
      kpHash,
      gocharHash,
      completeKundaliHash,
    };

    // 5. Generate Deterministic Calculation ID & Provenance
    const calculationId = generateCalculationId(input, profile, profile.engineVersion);
    const provenance = createCanonicalProvenance(
      profile.engineVersion,
      profile.calculationProfileVersion,
      inputsHash,
      completeKundaliHash,
    );

    // 6. Assemble FullKundliData
    const fullData: FullKundliData = Object.freeze({
      schemaVersion: "1.0.0-phase8",
      calculationId,
      birthInput: Object.freeze({ ...input }),
      profile: Object.freeze({ ...profile }),
      engineVersion: profile.engineVersion,
      provenance: Object.freeze(provenance),
      hashes: Object.freeze(hashes),
      astronomy: Object.freeze(astronomy),
      houses: Object.freeze(houses),
      vargas: Object.freeze(vargas),
      shadbala: Object.freeze(shadbala),
      dasha: Object.freeze(dasha),
      rules: Object.freeze(rules),
      jaimini: Object.freeze(jaimini),
      ashtakavarga: Object.freeze(ashtakavarga),
      kp: Object.freeze(kp),
      gochar: Object.freeze(gochar),
    });

    return fullData;
  }
}
