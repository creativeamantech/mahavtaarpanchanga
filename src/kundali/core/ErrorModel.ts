/**
 * Mahavtaar Kundali Engine - Structured Error Model
 * Phase 8 Production System Architecture
 */

export class KundaliError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidBirthInputError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "INVALID_BIRTH_INPUT", details);
  }
}

export class InvalidCalculationProfileError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "INVALID_CALCULATION_PROFILE", details);
  }
}

export class AstronomicalCalculationError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "ASTRONOMICAL_CALCULATION_ERROR", details);
  }
}

export class VargaCalculationError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VARGA_CALCULATION_ERROR", details);
  }
}

export class DashaCalculationError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "DASHA_CALCULATION_ERROR", details);
  }
}

export class RuleEvaluationError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "RULE_EVALUATION_ERROR", details);
  }
}

export class JaiminiCalculationError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "JAIMINI_CALCULATION_ERROR", details);
  }
}

export class ReportGenerationError extends KundaliError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "REPORT_GENERATION_ERROR", details);
  }
}
