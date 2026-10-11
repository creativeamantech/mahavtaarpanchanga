/**
 * Mahavtaar Kundali Engine - Executive Report Model Generator
 * Phase 8 Production System Architecture
 */

import { FullKundliData } from "../core/FullKundliData";

export interface ReportExecutiveSummary {
  subjectName: string;
  birthDateTimeStr: string;
  locationStr: string;
  lagnaSign: string;
  moonSign: string;
  sunSign: string;
  currentMahadasha: string;
  currentAntardasha: string;
  totalYogasDetected: number;
  topStrengths: string[];
}

export interface KundaliReportModel {
  calculationId: string;
  schemaVersion: string;
  engineVersion: string;
  generatedAt: string;
  executiveSummary: ReportExecutiveSummary;
  fullData: FullKundliData;
}

export class KundaliReportGenerator {
  public static generateReportModel(data: FullKundliData): KundaliReportModel {
    const input = data.birthInput;
    const astro = data.astronomy;
    const dasha = data.dasha;
    const rules = data.rules;
    const shadbala = data.shadbala;

    const sunSign = astro.planets.Sun ? astro.planets.Sun.signIndex : 0;
    const moonSign = astro.planets.Moon ? astro.planets.Moon.signIndex : 0;
    const lagnaSign = astro.ascendant.signIndex;

    const signNames = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];

    const presentYogas = rules.filter((r) => r.status === "PRESENT");

    // Find active Mahadasha and Antardasha
    const activeMaha =
      dasha.currentPeriods?.mahadasha ??
      (dasha.periods.find((p) => p.isCurrent) || dasha.periods[0]);
    const activeAnter =
      dasha.currentPeriods?.antardasha ??
      (activeMaha?.children?.find((sp) => sp.isCurrent) || activeMaha?.children?.[0]);

    const executiveSummary: ReportExecutiveSummary = {
      subjectName: input.name || "Subject Chart",
      birthDateTimeStr: `${input.date} ${input.time} (${input.timeZone})`,
      locationStr: `${input.placeName || "Coordinates"}: Lat ${input.latitude.toFixed(4)}, Lon ${input.longitude.toFixed(4)}`,
      lagnaSign: signNames[lagnaSign] || "Aries",
      moonSign: signNames[moonSign] || "Aries",
      sunSign: signNames[sunSign] || "Aries",
      currentMahadasha: activeMaha ? String(activeMaha.lord) : "Unknown",
      currentAntardasha: activeAnter ? String(activeAnter.lord) : "Unknown",
      totalYogasDetected: presentYogas.length,
      topStrengths: [
        `Strongest Planet: ${shadbala.mostPowerfulPlanet}`,
        `Weakest Planet: ${shadbala.weakestPlanet}`,
        `Ayana Ayanamsha: ${astro.ayanamshaDeg.toFixed(4)}° (${data.profile.ayanamsha})`,
      ],
    };

    return {
      calculationId: data.calculationId,
      schemaVersion: data.schemaVersion,
      engineVersion: data.engineVersion,
      generatedAt: new Date().toISOString(),
      executiveSummary,
      fullData: data,
    };
  }
}
