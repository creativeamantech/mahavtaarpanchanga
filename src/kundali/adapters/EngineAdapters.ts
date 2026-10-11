/**
 * Mahavtaar Kundali Engine - Unified Engine Adapters
 * Phase 8 Production System Architecture
 */

import * as Astronomy from "astronomy-engine";
import { AstronomicalCore } from "../astronomy/AstronomicalCore";
import { AyanamshaRegistry } from "../astronomy/AyanamshaProvider";
import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { VargaEngine } from "../varga/VargaEngine";
import { VargaChartResult, VargaType } from "../contracts/IVargaEngine";
import { ShadbalaEngine } from "../shadbala/ShadbalaEngine";
import { CompleteShadbalaResult } from "../shadbala/ShadbalaTypes";
import { VimshottariDashaEngine } from "../dasha/vimshottari/VimshottariDashaEngine";
import { DashaTimeline } from "../dasha/types/DashaTypes";
import { RuleEngine } from "../rules/RuleEngine";
import { RuleResult, RuleEvaluationContext } from "../rules/RuleTypes";
import { JaiminiEngine } from "../jaimini/JaiminiEngine";
import { JaiminiProfile } from "../jaimini/JaiminiTypes";
import { computeAshtakavarga } from "../../lib/ashtakavargaEngine";
import {
  AstronomyData,
  HouseData,
  HouseCuspInfo,
  AshtakavargaData,
  KpData,
  KpCuspInfo,
  KpPlanetInfo,
  GocharData,
  GocharTransitPlanet,
} from "../core/FullKundliData";
import { KundaliCalculationContext } from "../core/KundaliCalculationContext";
import { KundliPlanet } from "../../lib/kundliEngine";

const SIGN_NAMES_EN = [
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
const SIGN_NAMES_HI = [
  "मेष",
  "वृषभ",
  "मिथुन",
  "कर्क",
  "सिंह",
  "कन्या",
  "तुला",
  "वृश्चिक",
  "धनु",
  "मकर",
  "कुम्भ",
  "मीन",
];

const SIGN_LORDS: Record<number, CanonicalBodyId> = {
  0: "Mars",
  1: "Venus",
  2: "Mercury",
  3: "Moon",
  4: "Sun",
  5: "Mercury",
  6: "Venus",
  7: "Mars",
  8: "Jupiter",
  9: "Saturn",
  10: "Saturn",
  11: "Jupiter",
};

const NAKSHATRA_LORDS: CanonicalBodyId[] = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
];

export class EngineAdapters {
  private static vargaEngine = new VargaEngine();
  private static shadbalaEngine = new ShadbalaEngine();
  private static dashaEngine = new VimshottariDashaEngine();
  private static ruleEngine = new RuleEngine();
  private static jaiminiEngine = new JaiminiEngine();

  /**
   * Calculates Astronomy Data
   */
  public static calculateAstronomy(ctx: KundaliCalculationContext): AstronomyData {
    const time = Astronomy.MakeTime(new Date(ctx.utcTimestampMs));
    const ayanamsha = AyanamshaRegistry.calculate(ctx.calculationProfile.ayanamsha, time);

    const bodies: CanonicalBodyId[] = [
      "Sun",
      "Moon",
      "Mars",
      "Mercury",
      "Jupiter",
      "Venus",
      "Saturn",
      "Rahu",
      "Ketu",
    ];

    const planetPositions: Record<string, any> = {};

    bodies.forEach((body) => {
      const pos = AstronomicalCore.calculatePlanetaryPosition(body, time);
      const siderealLon = (pos.tropicalLongitude - ayanamsha + 360) % 360;
      const signIndex = Math.floor(siderealLon / 30);
      const degInSign = siderealLon % 30;

      const nakSpan = 360 / 27; // 13° 20' = 13.333333333333334
      const nakIdx = Math.max(0, Math.min(26, Math.floor(siderealLon / nakSpan)));
      const nakshatraNumber = nakIdx + 1;
      const nakshatraName = NAKSHATRA_NAMES[nakIdx] || "Ashwini";
      const padaSpan = nakSpan / 4; // 3° 20' = 3.3333333333333335
      const pada = Math.max(1, Math.min(4, Math.floor((siderealLon % nakSpan) / padaSpan) + 1));

      planetPositions[body] = {
        body,
        tropicalLongitude: pos.tropicalLongitude,
        siderealLongitude: siderealLon,
        signIndex,
        degreeInSign: degInSign,
        speedDegPerDay: pos.speedDegPerDay,
        isRetrograde: pos.isRetrograde,
        nakshatraNumber,
        nakshatraName,
        pada,
        houseD1: 1, // Updated after ascendant calculation
        houseD9: 1,
        dignity: "neutral",
        isCombust: false,
        isBenefic: body === "Jupiter" || body === "Venus" || body === "Moon" || body === "Mercury",
      };
    });

    const ascendant = AstronomicalCore.calculateLagna(
      time,
      ctx.birthInput.latitude,
      ctx.birthInput.longitude,
      ayanamsha,
    );

    const ascSign = ascendant.signIndex;

    // Update house numbers relative to Ascendant (Whole Sign)
    bodies.forEach((body) => {
      const p = planetPositions[body];
      p.houseD1 = ((p.signIndex - ascSign + 12) % 12) + 1;
    });

    return {
      ayanamshaDeg: ayanamsha,
      utcTimestampMs: ctx.utcTimestampMs,
      planets: planetPositions as AstronomyData["planets"],
      ascendant: {
        signIndex: ascendant.signIndex,
        degreeInSign: ascendant.degreeInSign,
        tropicalLongitude: ascendant.tropicalAscendant,
        siderealLongitude: ascendant.siderealAscendant,
        nakshatraNumber: ascendant.nakshatraIndex,
        nakshatraName: NAKSHATRA_NAMES[ascendant.nakshatraIndex - 1],
        pada: ascendant.pada,
      },
    };
  }

  /**
   * Calculates House Data
   */
  public static calculateHouses(astronomy: AstronomyData): HouseData {
    const ascSign = astronomy.ascendant.signIndex;
    const cusps: HouseCuspInfo[] = [];

    for (let h = 1; h <= 12; h++) {
      const signIdx = (ascSign + h - 1) % 12;
      const lord = SIGN_LORDS[signIdx];

      const occupants = (Object.keys(astronomy.planets) as CanonicalBodyId[]).filter(
        (b) => astronomy.planets[b].houseD1 === h,
      );

      cusps.push({
        houseNumber: h,
        signIndex: signIdx,
        signNameEn: SIGN_NAMES_EN[signIdx],
        signNameHi: SIGN_NAMES_HI[signIdx],
        lord,
        cuspLongitudeDeg: signIdx * 30.0,
        occupants,
        aspectingPlanets: [],
      });
    }

    return {
      houseSystem: "whole_sign",
      cusps,
    };
  }

  /**
   * Calculates all Shodashavargas
   */
  public static calculateVargas(astronomy: AstronomyData): Record<VargaType, VargaChartResult> {
    const siderealLons: Record<CanonicalBodyId, number> = {} as any;
    (Object.keys(astronomy.planets) as CanonicalBodyId[]).forEach((b) => {
      siderealLons[b] = astronomy.planets[b].siderealLongitude;
    });

    return this.vargaEngine.calculateShodashavarga(
      astronomy.ascendant.siderealLongitude,
      siderealLons,
    );
  }

  /**
   * Calculates Shadbala
   */
  public static calculateShadbala(
    astronomy: AstronomyData,
    ctx: KundaliCalculationContext,
  ): CompleteShadbalaResult {
    const siderealLons: Record<CanonicalBodyId, number> = {} as any;
    (Object.keys(astronomy.planets) as CanonicalBodyId[]).forEach((b) => {
      siderealLons[b] = astronomy.planets[b].siderealLongitude;
    });

    return this.shadbalaEngine.calculateDetailedShadbala(
      siderealLons,
      astronomy.ascendant.siderealLongitude,
      ctx.utcTimestampMs,
      ctx.birthInput.latitude,
      ctx.birthInput.longitude,
    );
  }

  /**
   * Calculates Vimshottari Dasha
   */
  public static calculateDasha(
    astronomy: AstronomyData,
    ctx: KundaliCalculationContext,
  ): DashaTimeline {
    const moonLon = astronomy.planets.Moon.siderealLongitude;
    const convention =
      ctx.calculationProfile.dashaYearConvention === "360_savana"
        ? "savana"
        : ctx.calculationProfile.dashaYearConvention === "365_solar"
          ? "sidereal"
          : "gregorian_solar";

    return this.dashaEngine.calculateTimeline({
      moonSiderealLonDeg: moonLon,
      birthTimestampMs: ctx.utcTimestampMs,
      targetTimestampMs: ctx.utcTimestampMs,
      convention,
      depthLevels: 3,
    });
  }

  /**
   * Evaluates Parashari Rules & Yogas
   */
  public static evaluateRules(
    astronomy: AstronomyData,
    houses: HouseData,
    vargas: Record<VargaType, VargaChartResult>,
    shadbala?: CompleteShadbalaResult,
    dasha?: DashaTimeline,
  ): RuleResult[] {
    const moonSign = astronomy.planets.Moon ? astronomy.planets.Moon.signIndex : 0;
    const planetList = (Object.keys(astronomy.planets) as CanonicalBodyId[]).map((b) => {
      const p = astronomy.planets[b];
      const houseChandra = ((p.signIndex - moonSign + 12) % 12) + 1;
      return {
        id: b,
        longitude: p.siderealLongitude,
        signIndex: p.signIndex,
        degreeInSign: p.degreeInSign,
        houseD1: p.houseD1,
        houseChandra,
        dignity: p.dignity || "neutral",
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
      };
    });

    const houseList = houses.cusps.map((c) => ({
      houseNumber: c.houseNumber,
      signIndex: c.signIndex,
      lord: c.lord,
      planetsPresent: c.occupants,
    }));

    const ruleCtx = RuleEngine.buildContextFromKundli(
      planetList,
      houseList,
      astronomy.ascendant.signIndex,
      moonSign,
      shadbala,
      dasha,
    );

    return this.ruleEngine.evaluateAll(ruleCtx);
  }

  /**
   * Calculates Jaimini Profile
   */
  public static calculateJaimini(
    astronomy: AstronomyData,
    vargas: Record<VargaType, VargaChartResult>,
    ctx: KundaliCalculationContext,
  ): JaiminiProfile {
    const planetsD1 = (Object.keys(astronomy.planets) as CanonicalBodyId[]).map((b) => ({
      id: b,
      longitude: astronomy.planets[b].siderealLongitude,
      signIndex: astronomy.planets[b].signIndex,
      degreeInSign: astronomy.planets[b].degreeInSign,
      speed: astronomy.planets[b].speedDegPerDay,
      dignity: astronomy.planets[b].dignity,
    }));

    const housesD1 = Array.from({ length: 12 }, (_, i) => {
      const houseNum = i + 1;
      const signIdx = (astronomy.ascendant.signIndex + i) % 12;
      const lord = SIGN_LORDS[signIdx];
      const lordSign = astronomy.planets[lord] ? astronomy.planets[lord].signIndex : signIdx;

      return {
        houseNumber: houseNum,
        signIndex: signIdx,
        lord,
        lordSignIndex: lordSign,
      };
    });

    const d9Chart = vargas.D9;
    const lagnaD9Sign = d9Chart ? d9Chart.lagnaSignIndex : 0;
    const planetsD9 = d9Chart
      ? (Object.keys(d9Chart.planets) as CanonicalBodyId[]).map((b) => ({
          id: b,
          signIndex: d9Chart.planets[b].signIndex,
        }))
      : [];

    return this.jaiminiEngine.calculateJaiminiProfile(
      planetsD1,
      housesD1,
      astronomy.ascendant.signIndex,
      lagnaD9Sign,
      planetsD9,
      ctx.utcTimestampMs,
    );
  }

  /**
   * Calculates Ashtakavarga
   */
  public static calculateAshtakavarga(astronomy: AstronomyData): AshtakavargaData {
    // Map astronomy planets to KundliPlanet mock format needed by computeAshtakavarga
    const mappedPlanets: KundliPlanet[] = (Object.keys(astronomy.planets) as CanonicalBodyId[]).map(
      (b) => {
        const p = astronomy.planets[b];
        return {
          id: b as any,
          nameEn: b,
          nameHi: b,
          nameSa: b,
          symbol: b[0],
          longitude: p.siderealLongitude,
          signIndex: p.signIndex,
          signNameEn: SIGN_NAMES_EN[p.signIndex],
          signNameHi: SIGN_NAMES_HI[p.signIndex],
          degreeInSign: p.degreeInSign,
          dms: { deg: Math.floor(p.degreeInSign), min: 0, sec: 0 },
          nakshatraNumber: p.nakshatraNumber,
          nakshatraNameEn: p.nakshatraName,
          nakshatraNameHi: p.nakshatraName,
          nakshatraLord: "Sun",
          subLord: "Sun",
          pada: p.pada,
          speed: p.speedDegPerDay,
          isRetrograde: p.isRetrograde,
          isCombust: p.isCombust,
          dignity: "neutral",
          dignityLabelEn: "Neutral",
          dignityLabelHi: "सम",
          houseD1: p.houseD1,
          houseD9: p.houseD9,
          houseChandra: 1,
          isBenefic: p.isBenefic,
        };
      },
    );

    const rawSAV = computeAshtakavarga(mappedPlanets, astronomy.ascendant.signIndex);

    const bhinna: Record<CanonicalBodyId, number[]> = {} as any;
    rawSAV.bavByPlanet.forEach((bav) => {
      const canonicalId =
        bav.planetId === "Surya"
          ? "Sun"
          : bav.planetId === "Chandra"
            ? "Moon"
            : bav.planetId === "Mangal"
              ? "Mars"
              : bav.planetId === "Budh"
                ? "Mercury"
                : bav.planetId === "Guru"
                  ? "Jupiter"
                  : bav.planetId === "Shukra"
                    ? "Venus"
                    : bav.planetId === "Shani"
                      ? "Saturn"
                      : (bav.planetId as CanonicalBodyId);

      bhinna[canonicalId] = bav.bindus;
    });

    const houses = rawSAV.savByHouse.map((h) => ({
      houseNumber: h.houseNumber,
      signIndex: h.signIndex,
      totalPoints: h.bindus,
      planetContributions: {} as Record<CanonicalBodyId, number>,
    }));

    return {
      bhinna,
      samudaya: rawSAV.savBySign,
      houses,
    };
  }

  /**
   * Calculates KP Data
   */
  public static calculateKP(astronomy: AstronomyData, ctx: KundaliCalculationContext): KpData {
    const cusps: KpCuspInfo[] = [];
    for (let h = 1; h <= 12; h++) {
      const signIdx = (astronomy.ascendant.signIndex + h - 1) % 12;
      const lon = (astronomy.ascendant.siderealLongitude + (h - 1) * 30) % 360;
      const nakIdx = Math.floor(lon / (360 / 27));

      cusps.push({
        houseNumber: h,
        longitudeDeg: lon,
        signIndex: signIdx,
        signLord: SIGN_LORDS[signIdx],
        starLord: NAKSHATRA_LORDS[nakIdx],
        subLord: NAKSHATRA_LORDS[(nakIdx + 3) % 9],
        subSubLord: NAKSHATRA_LORDS[(nakIdx + 5) % 9],
      });
    }

    const kpPlanets: KpPlanetInfo[] = (Object.keys(astronomy.planets) as CanonicalBodyId[]).map(
      (b) => {
        const p = astronomy.planets[b];
        const nakIdx = Math.floor(p.siderealLongitude / (360 / 27));
        return {
          planet: b,
          longitudeDeg: p.siderealLongitude,
          signIndex: p.signIndex,
          signLord: SIGN_LORDS[p.signIndex],
          starLord: NAKSHATRA_LORDS[nakIdx],
          subLord: NAKSHATRA_LORDS[(nakIdx + 2) % 9],
          subSubLord: NAKSHATRA_LORDS[(nakIdx + 4) % 9],
        };
      },
    );

    return {
      ayanamsaKey: ctx.calculationProfile.ayanamsha,
      ayanamsaDeg: astronomy.ayanamshaDeg,
      cusps,
      planets: kpPlanets,
    };
  }

  /**
   * Calculates Gochar (Transits) Data
   */
  public static calculateGochar(
    astronomy: AstronomyData,
    ctx: KundaliCalculationContext,
  ): GocharData {
    const natalMoonSign = astronomy.planets.Moon.signIndex;
    const natalLagnaSign = astronomy.ascendant.signIndex;

    const transitPlanets: Record<CanonicalBodyId, GocharTransitPlanet> = {} as any;

    (Object.keys(astronomy.planets) as CanonicalBodyId[]).forEach((b) => {
      const p = astronomy.planets[b];
      const houseFromMoon = ((p.signIndex - natalMoonSign + 12) % 12) + 1;
      const houseFromLagna = ((p.signIndex - natalLagnaSign + 12) % 12) + 1;

      const isAuspicious = [3, 6, 10, 11].includes(houseFromMoon);

      transitPlanets[b] = {
        planet: b,
        transitLongitudeDeg: p.siderealLongitude,
        transitSignIndex: p.signIndex,
        houseFromNatalMoon: houseFromMoon,
        houseFromNatalLagna: houseFromLagna,
        isBeneficTransit: isAuspicious,
        transitNature: isAuspicious ? "Auspicious" : "Neutral",
      };
    });

    return {
      transitTimestampMs: ctx.utcTimestampMs,
      transitPlanets,
    };
  }
}
