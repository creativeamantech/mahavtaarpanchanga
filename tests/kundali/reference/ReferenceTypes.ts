export type DiscrepancyClassification =
  | "EPHEMERIS_DIFFERENCE"
  | "COORDINATE_FRAME_DIFFERENCE"
  | "AYANAMSHA_DIFFERENCE"
  | "TIME_SCALE_DIFFERENCE"
  | "TIMEZONE_DIFFERENCE"
  | "HOUSE_SYSTEM_DIFFERENCE"
  | "VARGA_CONVENTION"
  | "DASHA_CONVENTION"
  | "CLASSICAL_SOURCE_DIFFERENCE"
  | "ROUNDING"
  | "FLOATING_POINT_EFFECT"
  | "IMPLEMENTATION_BUG"
  | "UNKNOWN";

export type ValidationStatus =
  | "MATCH"
  | "WITHIN_TOLERANCE"
  | "CONVENTION_DIFFERENCE"
  | "REFERENCE_REQUIRED"
  | "UNRESOLVED";

export interface PrecisionBudgetEntry {
  subsystem: string;
  inputPrecision: string;
  internalPrecision: string;
  outputPrecision: string;
  acceptableError: string;
  referenceError: string;
  notes: string;
}

export interface EngineComparisonRecord {
  engine: string;
  engineVersion: string;
  license: string;
  method: string;
  coordinateFrame: string;
  ayanamsha: string;
  input: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
  actualOutput: Record<string, unknown>;
  difference: number | string;
  tolerance: number | string;
  classification: DiscrepancyClassification;
  status: ValidationStatus;
  notes: string;
}

export interface ReferenceTolerance {
  degrees?: number;
  arcseconds?: number;
  virupas?: number;
  rupas?: number;
  milliseconds?: number;
  percentage?: number;
}

export interface ReferenceCase<TExpected = unknown> {
  id: string;
  category: string;
  subCategory?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm:ss
  timezone: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  ayanamsha: string;
  houseSystem: "whole_sign" | "sripati" | "placidus" | "equal";
  expected: TExpected;
  source: string;
  sourceVersion: string;
  convention: string;
  tolerance: ReferenceTolerance;
  notes: string;
}
