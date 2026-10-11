/**
 * Mahavtaar Kundali Engine - JSON Exporter & Importer
 * Phase 8 Production System Architecture
 */

import { FullKundliData } from "../core/FullKundliData";
import { KundaliError } from "../core/ErrorModel";

export class KundaliExporter {
  /**
   * Exports machine-readable FullKundliData to JSON string.
   */
  public static exportToJson(data: FullKundliData): string {
    if (!data || !data.calculationId) {
      throw new KundaliError("Invalid FullKundliData provided for export", "EXPORT_FAILED");
    }
    return JSON.stringify(data, null, 2);
  }

  /**
   * Imports FullKundliData from JSON string with strict schema validation.
   */
  public static importFromJson(jsonString: string): FullKundliData {
    if (!jsonString || typeof jsonString !== "string") {
      throw new KundaliError("Invalid JSON string for import", "IMPORT_FAILED");
    }

    try {
      const parsed = JSON.parse(jsonString) as FullKundliData;

      if (!parsed.schemaVersion) {
        throw new KundaliError("Missing schemaVersion in imported Kundali JSON", "INVALID_SCHEMA");
      }
      if (parsed.schemaVersion !== "1.0.0-phase8") {
        throw new KundaliError(
          `Unsupported schema version: ${parsed.schemaVersion}. Expected 1.0.0-phase8`,
          "SCHEMA_VERSION_MISMATCH",
        );
      }
      if (!parsed.calculationId) {
        throw new KundaliError("Missing calculationId in imported Kundali JSON", "CORRUPTED_DATA");
      }
      if (!parsed.birthInput || !parsed.profile || !parsed.astronomy) {
        throw new KundaliError(
          "Missing mandatory sections in imported Kundali JSON",
          "CORRUPTED_DATA",
        );
      }

      return parsed;
    } catch (err) {
      if (err instanceof KundaliError) throw err;
      throw new KundaliError(
        `Failed to parse Kundali JSON: ${err instanceof Error ? err.message : String(err)}`,
        "JSON_PARSE_ERROR",
      );
    }
  }
}
