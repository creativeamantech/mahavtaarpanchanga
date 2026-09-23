import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { VargaType } from "../contracts/IVargaEngine";
import { CompleteShadbalaResult } from "../shadbala/ShadbalaTypes";
import { DashaTimeline } from "../dasha/types/DashaTypes";

export type YogaCategory =
  | "Raja"
  | "Dhana"
  | "Mahapurusha"
  | "Chandra"
  | "Surya"
  | "Parivartana"
  | "Viparita"
  | "Neechabhanga"
  | "Arishta"
  | "DharmaKarma"
  | "Dosha"
  | "Spiritual"
  | "VargaSpecific"
  | "DashaDependent";

export type RuleEvaluationStatus = "PRESENT" | "ABSENT" | "CANCELLED" | "CONDITIONAL" | "PARTIAL";

export type ClassicalTradition =
  "Parashari" | "Jaimini" | "Varahamihira" | "ClassicalPostVedic" | "TraditionalRegional";

export type DignityState =
  "exalted" | "moolatrikona" | "own" | "friend" | "neutral" | "enemy" | "debilitated";

/**
 * Atomic Condition Types
 */
export type ConditionType =
  | "PlanetInSign"
  | "PlanetInHouse"
  | "PlanetInVarga"
  | "LordOfHouse"
  | "HouseLordPlacement"
  | "PlanetConjunction"
  | "PlanetAspect"
  | "MutualAspect"
  | "ExchangeOfSigns"
  | "DignityCondition"
  | "CombustionCondition"
  | "RetrogressionCondition"
  | "KendraTrikonaRelationship"
  | "StrengthThreshold"
  | "DispositorCondition"
  | "NeechabhangaCondition"
  | "CompoundCondition";

export interface BaseCondition {
  id: string;
  type: ConditionType;
  description: string;
}

export interface PlanetInHouseCondition extends BaseCondition {
  type: "PlanetInHouse";
  planet: CanonicalBodyId;
  houses: number[]; // 1 to 12
  referenceFrame?: "Lagna" | "Moon";
}

export interface PlanetInSignCondition extends BaseCondition {
  type: "PlanetInSign";
  planet: CanonicalBodyId;
  signs: number[]; // 0=Aries .. 11=Pisces
}

export interface DignityCondition extends BaseCondition {
  type: "DignityCondition";
  planet: CanonicalBodyId;
  dignities: DignityState[];
}

export interface HouseLordPlacementCondition extends BaseCondition {
  type: "HouseLordPlacement";
  house: number; // 1 to 12
  placedInHouses: number[]; // 1 to 12
  referenceFrame?: "Lagna" | "Moon";
}

export interface PlanetConjunctionCondition extends BaseCondition {
  type: "PlanetConjunction";
  planets: CanonicalBodyId[];
  maxOrbDeg?: number; // optional tight orb limit
  sameHouse?: boolean; // default true
}

export interface MutualAspectCondition extends BaseCondition {
  type: "MutualAspect";
  planetA: CanonicalBodyId;
  planetB: CanonicalBodyId;
}

export interface ExchangeOfSignsCondition extends BaseCondition {
  type: "ExchangeOfSigns";
  planetA: CanonicalBodyId;
  planetB: CanonicalBodyId;
  houseA?: number;
  houseB?: number;
}

export interface KendraTrikonaRelationshipCondition extends BaseCondition {
  type: "KendraTrikonaRelationship";
  houseTypeA: "Kendra" | "Trikona";
  houseTypeB: "Kendra" | "Trikona";
  relationship: "conjunction" | "mutual_aspect" | "parivartana" | "dharma_karma";
}

export interface NeechabhangaCancellationCondition extends BaseCondition {
  type: "NeechabhangaCondition";
  debilitatedPlanet: CanonicalBodyId;
  ruleVariant:
    | "lord_exalted_in_kendra"
    | "dispositor_in_kendra"
    | "exaltation_lord_in_kendra"
    | "dispositor_aspects"
    | "exalted_planet_conjoined"
    | "moon_kendra_dispositor";
}

export interface CompoundCondition extends BaseCondition {
  type: "CompoundCondition";
  operator: "AND" | "OR" | "NOT" | "XOR";
  conditions: RuleCondition[];
}

export type RuleCondition =
  | PlanetInHouseCondition
  | PlanetInSignCondition
  | DignityCondition
  | HouseLordPlacementCondition
  | PlanetConjunctionCondition
  | MutualAspectCondition
  | ExchangeOfSignsCondition
  | KendraTrikonaRelationshipCondition
  | NeechabhangaCancellationCondition
  | CompoundCondition;

export interface RuleException {
  id: string;
  descriptionEn: string;
  descriptionHi: string;
  condition: RuleCondition;
  resultStatusIfTriggered: RuleEvaluationStatus;
}

export interface RuleCancellation {
  id: string;
  descriptionEn: string;
  descriptionHi: string;
  condition: RuleCondition;
  cancellationType: "nullification" | "mitigation" | "transformation";
}

export interface StrengthFactorRule {
  id: string;
  factorName: string;
  description: string;
  weight: number;
}

export interface AstrologyRule {
  readonly id: string;
  readonly nameEn: string;
  readonly nameHi: string;
  readonly nameSa: string;
  readonly category: YogaCategory[];
  readonly tradition: ClassicalTradition;
  readonly source: string;
  readonly sourceReference: string;
  readonly descriptionEn: string;
  readonly descriptionHi: string;
  readonly primaryCondition: RuleCondition;
  readonly exceptions?: RuleException[];
  readonly cancellationRules?: RuleCancellation[];
  readonly strengthFactors?: StrengthFactorRule[];
  readonly requiredInputs: string[];
  readonly requiredVarga?: VargaType;
  readonly priority: number;
  readonly version: string;
  readonly validationStatus: "VERIFIED" | "CANONICAL" | "EXPERIMENTAL";
}

export interface DashaActivationMetadata {
  readonly isActivatedByCurrentMaha: boolean;
  readonly isActivatedByCurrentAntar: boolean;
  readonly activatingGrahas: CanonicalBodyId[];
  readonly activeMahadashaLord?: CanonicalBodyId;
  readonly activeAntardashaLord?: CanonicalBodyId;
  readonly notes: string;
}

export interface RuleStrengthFactorResult {
  readonly factor: string;
  readonly score: number;
  readonly description: string;
}

export interface RuleResult {
  readonly ruleId: string;
  readonly nameEn: string;
  readonly nameHi: string;
  readonly nameSa: string;
  readonly category: YogaCategory[];
  readonly status: RuleEvaluationStatus;
  readonly matchedConditions: string[];
  readonly failedConditions: string[];
  readonly exceptionsTriggered: string[];
  readonly cancellationsTriggered: string[];
  readonly strengthFactors: RuleStrengthFactorResult[];
  readonly overallStrengthScore: number;
  readonly source: string;
  readonly sourceReference: string;
  readonly confidence: number;
  readonly calculationVersion: string;
  readonly dashaActivation?: DashaActivationMetadata;
  readonly descriptionEn: string;
  readonly descriptionHi: string;
}

export interface EvaluatedGrahaState {
  readonly id: CanonicalBodyId;
  readonly longitude: number;
  readonly signIndex: number;
  readonly degreeInSign: number;
  readonly houseD1: number;
  readonly houseChandra: number;
  readonly dignity: DignityState;
  readonly isRetrograde: boolean;
  readonly isCombust: boolean;
  readonly totalShadbalaRupa?: number;
  readonly shadbalaRatio?: number;
}

export interface EvaluatedHouseState {
  readonly houseNumber: number; // 1 to 12
  readonly signIndex: number;
  readonly lord: CanonicalBodyId;
  readonly planetsPresent: CanonicalBodyId[];
  readonly bhavaBalaRupa?: number;
}

export interface RuleEvaluationContext {
  readonly planets: Map<CanonicalBodyId, EvaluatedGrahaState>;
  readonly houses: EvaluatedHouseState[];
  readonly lagnaSignIndex: number;
  readonly moonSignIndex: number;
  readonly shadbala?: CompleteShadbalaResult;
  readonly shodashavarga?: Record<VargaType, unknown>;
  readonly dashaTimeline?: DashaTimeline;
  readonly currentDashaLords?: {
    maha?: CanonicalBodyId;
    antar?: CanonicalBodyId;
    prat?: CanonicalBodyId;
  };
}
