import * as Astronomy from "astronomy-engine";
import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { AstronomicalCore } from "../astronomy/AstronomicalCore";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";
import {
  IShadbalaEngine,
  ShadbalaResult,
  GrahaShadbala,
  BhavaBala,
} from "../contracts/IShadbalaEngine";
import { CompleteShadbalaResult, GrahaShadbalaDetailed, BhavaBalaDetailed } from "./ShadbalaTypes";
import { calculateSthanaBala } from "./SthanaBala";
import { calculateDigBala } from "./DigBala";
import { calculateKalaBala, KalaBalaTemporalContext } from "./KalaBala";
import { calculateCheshtaBala } from "./CheshtaBala";
import { calculateNaisargikaBala } from "./NaisargikaBala";
import { calculateDrikBala } from "./DrikBala";
import { calculateIshtaKashtaPhala } from "./IshtaKashtaPhala";
import { calculateAllBhavaBalas } from "./BhavaBalaEngine";
import { BPHS_REQUIRED_RUPAS, validateShadbalaResult } from "./ShadbalaValidation";

/**
 * Vedic Weekday Lords from Sunday (0) to Saturday (6)
 */
const VEDIC_WEEKDAY_LORDS: CanonicalBodyId[] = [
  "Sun", // 0: Sunday (Ravivara)
  "Moon", // 1: Monday (Somavara)
  "Mars", // 2: Tuesday (Mangalavara)
  "Mercury", // 3: Wednesday (Budhavara)
  "Jupiter", // 4: Thursday (Guruvara)
  "Venus", // 5: Friday (Shukravara)
  "Saturn", // 6: Saturday (Shanivara)
];

/**
 * Standard 24-Hora planetary lord sequence (Chaldean descending order)
 */
const HORA_SEQUENCE: CanonicalBodyId[] = [
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
  "Saturn",
  "Jupiter",
  "Mars",
];

export class ShadbalaEngine implements IShadbalaEngine {
  public readonly metadata: RepositoryMetadata = {
    key: "parashara-shadbala-v1",
    nameEn: "Brihat Parashara Shadbala & Bhava Bala Engine",
    nameSa: "बृहत्पाराशर षड्बल एवं भावबल साधन",
    author: "Mahavtaar Jyotish Computational Core",
    version: "1.0.0",
    description:
      "BPHS-traceable six-fold planetary strength and house strength engine with full floating point precision",
    sourceText: "Brihat Parashara Hora Shastra, Adhyaya 27 & 28",
    accuracyLevel: "Canonical",
  };

  /**
   * Primary contract method satisfying IShadbalaEngine
   */
  public calculateShadbala(
    siderealLons: Record<CanonicalBodyId, number>,
    lagnaSiderealLon: number,
    utcTimestampMs: number,
    latitude: number,
    longitude: number,
  ): ShadbalaResult {
    const detailed = this.calculateDetailedShadbala(
      siderealLons,
      lagnaSiderealLon,
      utcTimestampMs,
      latitude,
      longitude,
    );

    // Map detailed results to IShadbalaEngine contract structures
    const planets = {} as Record<CanonicalBodyId, GrahaShadbala>;
    for (const [key, p] of Object.entries(detailed.planets) as [
      CanonicalBodyId,
      GrahaShadbalaDetailed,
    ][]) {
      planets[key] = {
        planet: p.planet,
        sthanaBala: {
          uchchaBala: p.sthanaBala.uchchaBala,
          saptavargajaBala: p.sthanaBala.saptavargajaBala,
          ojayugmarashiBala: p.sthanaBala.ojayugmarashiBala,
          kendradiBala: p.sthanaBala.kendradiBala,
          drekkanaBala: p.sthanaBala.drekkanaBala,
          totalVirupas: p.sthanaBala.totalVirupas,
          totalRupas: p.sthanaBala.totalRupas,
        },
        digBala: {
          directionalDistanceDeg: p.digBala.angularDistanceDeg,
          totalVirupas: p.digBala.totalVirupas,
          totalRupas: p.digBala.totalRupas,
        },
        kalaBala: {
          natonnataBala: p.kalaBala.natonnataBala,
          pakshaBala: p.kalaBala.pakshaBala,
          tribhagaBala: p.kalaBala.tribhagaBala,
          varshaBala: p.kalaBala.varshaBala,
          masaBala: p.kalaBala.masaBala,
          dinaBala: p.kalaBala.dinaBala,
          horaBala: p.kalaBala.horaBala,
          ayanaBala: p.kalaBala.ayanaBala,
          yuddhaBala: p.kalaBala.yuddhaBala,
          totalVirupas: p.kalaBala.totalVirupas,
          totalRupas: p.kalaBala.totalRupas,
        },
        cheshtaBala: {
          motionState: p.cheshtaBala.motionState,
          totalVirupas: p.cheshtaBala.totalVirupas,
          totalRupas: p.cheshtaBala.totalRupas,
        },
        naisargikaBala: {
          totalVirupas: p.naisargikaBala.totalVirupas,
          totalRupas: p.naisargikaBala.totalRupas,
        },
        drikBala: {
          beneficAspects: p.drikBala.beneficDrishti,
          maleficAspects: p.drikBala.maleficDrishti,
          totalVirupas: p.drikBala.totalVirupas,
          totalRupas: p.drikBala.totalRupas,
        },
        totalVirupas: p.totalVirupas,
        totalRupas: p.totalRupas,
        requiredRupas: p.requiredRupas,
        strengthRatio: p.strengthRatio,
        rank: p.rank,
      };
    }

    const bhavas: BhavaBala[] = detailed.bhavas.map((b) => ({
      houseNumber: b.houseNumber,
      bhavadhipatiBala: b.bhavadhipatiBala,
      bhavaDigBala: b.bhavaDigBala,
      bhavaDrishtiBala: b.bhavaDrishtiBala,
      totalVirupas: b.totalVirupas,
      totalRupas: b.totalRupas,
      rank: b.rank,
    }));

    return {
      planets,
      bhavas,
      mostPowerfulPlanet: detailed.strongestPlanet,
      weakestPlanet: detailed.weakestPlanet,
    };
  }

  /**
   * Detailed computational engine exposing all classical sub-components
   */
  public calculateDetailedShadbala(
    siderealLons: Record<CanonicalBodyId, number>,
    lagnaSiderealLon: number,
    utcTimestampMs: number,
    latitude: number,
    longitude: number,
  ): CompleteShadbalaResult {
    const birthDate = new Date(utcTimestampMs);
    const astroTime = Astronomy.MakeTime(birthDate);

    // 1. Calculate Astronomical Positions (Declination, Speed, Retrograde) via AstronomicalCore
    const targetBodies: CanonicalBodyId[] = [
      "Sun",
      "Moon",
      "Mars",
      "Mercury",
      "Jupiter",
      "Venus",
      "Saturn",
    ];
    const declinations = {} as Record<CanonicalBodyId, number>;
    const speeds = {} as Record<CanonicalBodyId, number>;
    const retrogrades = {} as Record<CanonicalBodyId, boolean>;

    for (const b of targetBodies) {
      const pPos = AstronomicalCore.calculatePlanetaryPosition(b, astroTime);
      declinations[b] = pPos.declinationDeg;
      speeds[b] = pPos.speedDegPerDay;
      retrogrades[b] = pPos.isRetrograde;
    }

    // 2. Sunrise, Sunset & Day/Night Division
    const sunTimes = AstronomicalCore.calculateSunriseSunset(birthDate, latitude, longitude);
    const sunriseDate = sunTimes.sunrise;
    const sunsetDate = sunTimes.sunset;

    // 3. Vedic Weekday (Vara) based on sunrise
    // If birth is before sunrise, the Vedic day belongs to previous solar day
    let effectiveDateForVara = new Date(birthDate);
    if (birthDate.getTime() < sunriseDate.getTime()) {
      effectiveDateForVara = new Date(birthDate.getTime() - 24 * 3600000);
    }
    const weekdayIndex = effectiveDateForVara.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const weekdayLord = VEDIC_WEEKDAY_LORDS[weekdayIndex];

    // 4. Planetary Hour (Hora) Lord
    const sunriseMs = sunriseDate.getTime();
    const sunsetMs = sunsetDate.getTime();
    const birthMs = birthDate.getTime();
    let horaIndex = 0;

    if (birthMs >= sunriseMs && birthMs <= sunsetMs) {
      // Day horas (12 horas)
      const dayHoraDuration = (sunsetMs - sunriseMs) / 12.0;
      horaIndex = Math.min(11, Math.max(0, Math.floor((birthMs - sunriseMs) / dayHoraDuration)));
    } else {
      // Night horas (12 horas)
      const nextSunriseMs = sunriseMs + 24 * 3600000;
      const nightHoraDuration = (nextSunriseMs - sunsetMs) / 12.0;
      const elapsed = birthMs >= sunsetMs ? birthMs - sunsetMs : birthMs + 24 * 3600000 - sunsetMs;
      horaIndex = 12 + Math.min(11, Math.max(0, Math.floor(elapsed / nightHoraDuration)));
    }

    const weekdayLordIndexInChaldean = HORA_SEQUENCE.indexOf(weekdayLord);
    const horaLord = HORA_SEQUENCE[(weekdayLordIndexInChaldean + horaIndex) % 7];

    // 5. 12 House Cusps / Bhava Madhyas (Equal house from Lagna)
    const houseCusps: number[] = [];
    for (let h = 0; h < 12; h++) {
      houseCusps.push((((lagnaSiderealLon + h * 30.0) % 360.0) + 360.0) % 360.0);
    }

    // 6. Moon phase (waxing / waning)
    const sunLon = siderealLons.Sun ?? 0;
    const moonLon = siderealLons.Moon ?? 0;
    const moonSunDiff = (moonLon - sunLon + 360.0) % 360.0;
    const isMoonWaxing = moonSunDiff <= 180.0;

    // 7. Temporal Context
    const temporalContext: KalaBalaTemporalContext = {
      birthDate,
      sunriseDate,
      sunsetDate,
      sunLonDeg: sunLon,
      moonLonDeg: moonLon,
      planetDeclinationsDeg: declinations,
      weekdayLord,
      horaLord,
      masaLord: undefined,
      varshaLord: undefined,
    };

    // 8. Compute Individual Balas for all 7 Grahas
    const planetResults = {} as Record<CanonicalBodyId, GrahaShadbalaDetailed>;

    for (const p of targetBodies) {
      const lon = siderealLons[p] ?? 0;
      // Find occupied house relative to Lagna (1 to 12)
      const houseNumber = Math.floor(((lon - lagnaSiderealLon + 360.0) % 360.0) / 30.0) + 1;

      // Sthana Bala
      const sthanaBala = calculateSthanaBala(p, lon, houseNumber, siderealLons);

      // Dig Bala
      const digBala = calculateDigBala(p, lon, houseCusps);

      // Kala Bala
      const kalaBala = calculateKalaBala(p, temporalContext);

      // Cheshta Bala (Sun inherits Ayana Bala, Moon inherits Paksha Bala)
      const cheshtaBala = calculateCheshtaBala(
        p,
        speeds[p] ?? 1.0,
        retrogrades[p] ?? false,
        kalaBala.ayanaBala,
        kalaBala.pakshaBala,
      );

      // Naisargika Bala
      const naisargikaBala = calculateNaisargikaBala(p);

      // Drik Bala
      const drikBala = calculateDrikBala(p, siderealLons, isMoonWaxing);

      // Ishta / Kashta Phala
      const ishtaKashta = calculateIshtaKashtaPhala(
        sthanaBala.uchchaBala,
        cheshtaBala.totalVirupas,
      );

      // Total Shadbala
      const totalVirupas =
        sthanaBala.totalVirupas +
        digBala.totalVirupas +
        kalaBala.totalVirupas +
        cheshtaBala.totalVirupas +
        naisargikaBala.totalVirupas +
        drikBala.totalVirupas;

      const totalRupas = totalVirupas / 60.0;
      const reqRupas = BPHS_REQUIRED_RUPAS[p] ?? 5.0;
      const reqVirupas = reqRupas * 60.0;
      const strengthRatio = totalRupas / reqRupas;

      planetResults[p] = {
        planet: p,
        sthanaBala,
        digBala,
        kalaBala,
        cheshtaBala,
        naisargikaBala,
        drikBala,
        ishtaKashta,
        totalVirupas,
        totalRupas,
        requiredRupas: reqRupas,
        requiredVirupas: reqVirupas,
        strengthRatio,
        isAdequate: totalVirupas >= reqVirupas,
        rank: 1, // populated below
      };
    }

    // Rank planets by totalVirupas descending
    const sortedPlanets = Object.values(planetResults).sort(
      (a, b) => b.totalVirupas - a.totalVirupas,
    );
    sortedPlanets.forEach((p, index) => {
      planetResults[p.planet].rank = index + 1;
    });

    const strongestPlanet = sortedPlanets[0].planet;
    const weakestPlanet = sortedPlanets[sortedPlanets.length - 1].planet;

    // 9. Bhava Bala
    const planetShadbalasVirupas = {} as Record<CanonicalBodyId, number>;
    for (const p of targetBodies) {
      planetShadbalasVirupas[p] = planetResults[p].totalVirupas;
    }

    const bhavas = calculateAllBhavaBalas(
      houseCusps,
      planetShadbalasVirupas,
      siderealLons,
      isMoonWaxing,
    );

    const strongestHouse = [...bhavas].sort((a, b) => b.totalVirupas - a.totalVirupas)[0]
      .houseNumber;
    const weakestHouse = [...bhavas].sort((a, b) => a.totalVirupas - b.totalVirupas)[0].houseNumber;

    const completeResult: CompleteShadbalaResult = {
      metadata: this.metadata,
      planets: planetResults,
      bhavas,
      strongestPlanet,
      weakestPlanet,
      strongestHouse,
      weakestHouse,
      calculationTimestamp: utcTimestampMs,
    };

    // Run verification / invariants check
    validateShadbalaResult(completeResult);

    return completeResult;
  }
}
