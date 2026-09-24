import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { CompleteShadbalaResult, GrahaShadbalaDetailed } from "./ShadbalaTypes";

/**
 * Standard BPHS Required Strengths
 */
export const BPHS_REQUIRED_RUPAS: Record<string, number> = {
  Sun: 6.5, // 390 Virupas
  Moon: 6.0, // 360 Virupas
  Mars: 5.0, // 300 Virupas
  Mercury: 7.0, // 420 Virupas
  Jupiter: 6.5, // 390 Virupas
  Venus: 5.5, // 330 Virupas
  Saturn: 5.0, // 300 Virupas
  Rahu: 5.0,
  Ketu: 5.0,
};

export interface ShadbalaValidationIssue {
  planet?: CanonicalBodyId;
  house?: number;
  component: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Validates a calculated Shadbala and Bhava Bala result against physical & classical invariants
 */
export function validateShadbalaResult(result: CompleteShadbalaResult): ShadbalaValidationIssue[] {
  const issues: ShadbalaValidationIssue[] = [];

  const planets: CanonicalBodyId[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
  ];

  // 1. Check Naisargika Bala Sum Invariant: exactly 240.0 Virupas (4.0 Rupas)
  let naisargikaSum = 0;
  for (const p of planets) {
    const pData = result.planets[p];
    if (!pData) {
      issues.push({
        planet: p,
        component: "PlanetData",
        message: `Missing Shadbala data for required planet ${p}`,
        severity: "error",
      });
      continue;
    }
    naisargikaSum += pData.naisargikaBala.totalVirupas;

    // Boundary checks
    if (pData.sthanaBala.uchchaBala < 0 || pData.sthanaBala.uchchaBala > 60.0001) {
      issues.push({
        planet: p,
        component: "UchchaBala",
        message: `Uchcha Bala ${pData.sthanaBala.uchchaBala} out of bounds [0, 60]`,
        severity: "error",
      });
    }

    if (pData.digBala.totalVirupas < 0 || pData.digBala.totalVirupas > 60.0001) {
      issues.push({
        planet: p,
        component: "DigBala",
        message: `Dig Bala ${pData.digBala.totalVirupas} out of bounds [0, 60]`,
        severity: "error",
      });
    }

    if (pData.ishtaKashta.ishtaPhala < 0 || pData.ishtaKashta.ishtaPhala > 60.0001) {
      issues.push({
        planet: p,
        component: "IshtaPhala",
        message: `Ishta Phala ${pData.ishtaKashta.ishtaPhala} out of bounds [0, 60]`,
        severity: "error",
      });
    }

    if (pData.ishtaKashta.kashtaPhala < 0 || pData.ishtaKashta.kashtaPhala > 60.0001) {
      issues.push({
        planet: p,
        component: "KashtaPhala",
        message: `Kashta Phala ${pData.ishtaKashta.kashtaPhala} out of bounds [0, 60]`,
        severity: "error",
      });
    }
  }

  // Naisargika sum check
  if (Math.abs(naisargikaSum - 240.0) > 0.01) {
    issues.push({
      component: "NaisargikaBala",
      message: `Naisargika Bala sum is ${naisargikaSum}, expected 240.0 Virupas`,
      severity: "error",
    });
  }

  // 2. Validate Bhava Bala count and completeness
  if (result.bhavas.length !== 12) {
    issues.push({
      component: "BhavaBala",
      message: `Expected 12 houses in Bhava Bala, found ${result.bhavas.length}`,
      severity: "error",
    });
  }

  return issues;
}
