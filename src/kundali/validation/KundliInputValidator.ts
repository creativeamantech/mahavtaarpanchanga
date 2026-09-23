import { KundliInput } from "../core/KundliDomainModel";

export interface ValidationError {
  field: string;
  message: string;
  code: "OUT_OF_RANGE" | "INVALID_FORMAT" | "UNSUPPORTED_VALUE" | "MISSING_REQUIRED";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  normalizedInput?: KundliInput;
}

export class KundliInputValidator {
  public static validate(input: KundliInput): ValidationResult {
    const errors: ValidationError[] = [];

    // 1. Year Validation (-3000 to +3000 for VSOP87 astronomical bounds)
    if (typeof input.year !== "number" || isNaN(input.year)) {
      errors.push({
        field: "year",
        message: "Year must be a valid number",
        code: "INVALID_FORMAT",
      });
    } else if (input.year < -3000 || input.year > 3000) {
      errors.push({
        field: "year",
        message: "Year must be between -3000 and +3000",
        code: "OUT_OF_RANGE",
      });
    }

    // 2. Month Validation (1 to 12)
    if (typeof input.month !== "number" || isNaN(input.month)) {
      errors.push({
        field: "month",
        message: "Month must be a valid number",
        code: "INVALID_FORMAT",
      });
    } else if (input.month < 1 || input.month > 12) {
      errors.push({
        field: "month",
        message: "Month must be between 1 and 12",
        code: "OUT_OF_RANGE",
      });
    }

    // 3. Day Validation (1 to 31 depending on month/year)
    if (typeof input.day !== "number" || isNaN(input.day)) {
      errors.push({ field: "day", message: "Day must be a valid number", code: "INVALID_FORMAT" });
    } else {
      const daysInMonth = new Date(Date.UTC(input.year, input.month, 0)).getUTCDate();
      if (input.day < 1 || input.day > daysInMonth) {
        errors.push({
          field: "day",
          message: `Day must be between 1 and ${daysInMonth} for month ${input.month}`,
          code: "OUT_OF_RANGE",
        });
      }
    }

    // 4. Hour Validation (0 to 23)
    if (typeof input.hour !== "number" || isNaN(input.hour)) {
      errors.push({
        field: "hour",
        message: "Hour must be a valid number",
        code: "INVALID_FORMAT",
      });
    } else if (input.hour < 0 || input.hour > 23) {
      errors.push({
        field: "hour",
        message: "Hour must be between 0 and 23",
        code: "OUT_OF_RANGE",
      });
    }

    // 5. Minute Validation (0 to 59)
    if (typeof input.minute !== "number" || isNaN(input.minute)) {
      errors.push({
        field: "minute",
        message: "Minute must be a valid number",
        code: "INVALID_FORMAT",
      });
    } else if (input.minute < 0 || input.minute > 59) {
      errors.push({
        field: "minute",
        message: "Minute must be between 0 and 59",
        code: "OUT_OF_RANGE",
      });
    }

    // 6. Second Validation (0 to 59, optional)
    const second = typeof input.second === "number" && !isNaN(input.second) ? input.second : 0;
    if (second < 0 || second > 59) {
      errors.push({
        field: "second",
        message: "Second must be between 0 and 59",
        code: "OUT_OF_RANGE",
      });
    }

    // 7. Geographic Latitude (-90 to +90)
    if (typeof input.latitude !== "number" || isNaN(input.latitude)) {
      errors.push({
        field: "latitude",
        message: "Latitude must be a valid number",
        code: "INVALID_FORMAT",
      });
    } else if (input.latitude < -90 || input.latitude > 90) {
      errors.push({
        field: "latitude",
        message: "Latitude must be between -90 and +90",
        code: "OUT_OF_RANGE",
      });
    }

    // 8. Geographic Longitude (-180 to +180)
    if (typeof input.longitude !== "number" || isNaN(input.longitude)) {
      errors.push({
        field: "longitude",
        message: "Longitude must be a valid number",
        code: "INVALID_FORMAT",
      });
    } else if (input.longitude < -180 || input.longitude > 180) {
      errors.push({
        field: "longitude",
        message: "Longitude must be between -180 and +180",
        code: "OUT_OF_RANGE",
      });
    }

    const isValid = errors.length === 0;
    return {
      isValid,
      errors,
      normalizedInput: isValid
        ? {
            ...input,
            second,
            timezone: input.timezone || "Asia/Kolkata",
            altitudeMeters: input.altitudeMeters || 0,
            ayanamsaKey: input.ayanamsaKey || "lahiri",
            chartStyle: input.chartStyle || "north",
          }
        : undefined,
    };
  }
}
