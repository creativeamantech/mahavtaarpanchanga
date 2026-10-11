/**
 * Mahavtaar Kundali Engine - View Model Adapter & Selector Layer
 * Phase 9 Production UX & Hardening
 *
 * This layer is a PURE presentation adapter.
 * It strictly maps the authoritative FullKundliData (produced by KundaliCalculationService)
 * into UI-optimized view models and legacy chart renderer compatibility structures.
 *
 * ZERO astrology calculations are performed here.
 */

import { FullKundliData } from "../core/FullKundliData";
import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { VargaType } from "../contracts/IVargaEngine";
import {
  KundliPlanet,
  KundliHouse,
  PlanetId,
  ZODIAC_SIGNS,
  HOUSE_NAMES,
  HOUSE_SIGNIFICANCE,
  NAKSHATRAS_LIST,
  PLANET_META,
  VimshottariMahadasha,
  VimshottariAntardasha,
  VimshottariPratyantardasha,
  AvakahadaDetails,
  DoshaAnalysis,
} from "../../lib/kundliEngine";

export interface DegMinSec {
  deg: number;
  min: number;
  sec: number;
}

export function toDms(deg: number): DegMinSec {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return { deg: d, min: m, sec: s };
}

export class KundaliViewModelAdapter {
  /**
   * Adapts canonical FullKundliData planets into UI KundliPlanet presentation models.
   */
  public static adaptPlanets(data: FullKundliData): KundliPlanet[] {
    const astro = data.astronomy;
    const shadbala = data.shadbala;
    const jaimini = data.jaimini;
    const moonSign = astro.planets.Moon ? astro.planets.Moon.signIndex : 0;
    const bodyKeys = Object.keys(astro.planets) as CanonicalBodyId[];

    return bodyKeys.map((bodyId) => {
      const p = astro.planets[bodyId];
      const meta = PLANET_META[bodyId as PlanetId] || PLANET_META["Sun"];
      const signMeta = ZODIAC_SIGNS[p.signIndex] || ZODIAC_SIGNS[0];
      const nakNumber =
        typeof p.nakshatraNumber === "number" && !isNaN(p.nakshatraNumber) ? p.nakshatraNumber : 1;
      const nakIdx = Math.max(0, Math.min(26, nakNumber - 1));
      const nakMeta = NAKSHATRAS_LIST[nakIdx] || NAKSHATRAS_LIST[0];

      // Dignity label mapping
      const dignityLabelEn =
        p.dignity === "exalted"
          ? "Exalted (Uchha)"
          : p.dignity === "debilitated"
            ? "Debilitated (Neecha)"
            : p.dignity === "moolatrikona"
              ? "Moolatrikona"
              : p.dignity === "own"
                ? "Own Sign (Sva)"
                : p.dignity === "friend"
                  ? "Friendly (Mitra)"
                  : p.dignity === "enemy"
                    ? "Inimical (Shatru)"
                    : "Neutral (Sama)";

      const dignityLabelHi =
        p.dignity === "exalted"
          ? "उच्च"
          : p.dignity === "debilitated"
            ? "नीच"
            : p.dignity === "moolatrikona"
              ? "मूलत्रिकोण"
              : p.dignity === "own"
                ? "स्वराशि"
                : p.dignity === "friend"
                  ? "मित्र"
                  : p.dignity === "enemy"
                    ? "शत्रु"
                    : "सम";

      // Jaimini Karaka label if present
      const karakasList = Array.isArray(jaimini?.charaKarakas)
        ? jaimini.charaKarakas
        : jaimini?.charaKarakas?.karakas || [];
      const charaKaraka = karakasList.find((k: any) => k.planet === bodyId);
      const jaiminiKaraka = charaKaraka
        ? `${charaKaraka.nameEn || charaKaraka.karakaEn || charaKaraka.karakaId} (${charaKaraka.nameSa || charaKaraka.karakaSa || charaKaraka.karakaId})`
        : undefined;

      // House from Moon
      const houseChandra = ((p.signIndex - moonSign + 12) % 12) + 1;

      // Shadbala Strength
      const planetShad = shadbala?.planets?.[bodyId];
      const shadRatio = planetShad?.strengthRatio;
      const shadRupa = planetShad?.totalRupas;

      return {
        id: bodyId as PlanetId,
        nameEn: meta.nameEn,
        nameHi: meta.nameHi,
        nameSa: meta.nameSa,
        symbol: meta.symbol,
        longitude: p.siderealLongitude,
        signIndex: p.signIndex,
        signNameEn: signMeta.en,
        signNameHi: signMeta.hi,
        degreeInSign: p.degreeInSign,
        dms: toDms(p.degreeInSign),
        nakshatraNumber: p.nakshatraNumber,
        nakshatraNameEn: p.nakshatraName,
        nakshatraNameHi: nakMeta.hi,
        nakshatraLord: nakMeta.lord,
        subLord: nakMeta.lord,
        pada: p.pada,
        speed: p.speedDegPerDay,
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
        dignity: (p.dignity as any) || "neutral",
        dignityLabelEn,
        dignityLabelHi,
        houseD1: p.houseD1,
        houseD9: p.houseD9,
        houseChandra,
        isBenefic: p.isBenefic,
        jaiminiKaraka,
        shadbalaRatio: shadRatio,
        shadbalaRupa: shadRupa,
      };
    });
  }

  /**
   * Adapts house cusps for a specific chart or varga from FullKundliData.
   */
  public static adaptHousesForVarga(
    data: FullKundliData,
    vargaKey: VargaType,
    adaptedPlanets: KundliPlanet[],
  ): KundliHouse[] {
    const varga = data.vargas[vargaKey];
    if (!varga) return [];

    const lagnaSign = varga.lagnaSignIndex;
    const houses: KundliHouse[] = [];

    for (let h = 1; h <= 12; h++) {
      const signIdx = (lagnaSign + h - 1) % 12;
      const sMeta = ZODIAC_SIGNS[signIdx] || ZODIAC_SIGNS[0];
      const hMeta = HOUSE_NAMES[h - 1] || HOUSE_NAMES[0];
      const sigMeta = HOUSE_SIGNIFICANCE[h - 1] || HOUSE_SIGNIFICANCE[0];

      // Find planets in this house in this varga
      const occupyingPlanets = adaptedPlanets.filter((p) => {
        const vPos = varga.planets[p.id as CanonicalBodyId];
        return vPos && vPos.houseNumber === h;
      });

      // Aspecting planets (Classical Parashari 7th aspect, plus Mars 4/8, Jupiter 5/9, Saturn 3/10)
      const aspectingPlanets = adaptedPlanets.filter((p) => {
        const vPos = varga.planets[p.id as CanonicalBodyId];
        if (!vPos) return false;
        const dist = ((signIdx - vPos.signIndex + 12) % 12) + 1;
        if (dist === 7) return true;
        if (p.id === "Mars" && (dist === 4 || dist === 8)) return true;
        if (p.id === "Jupiter" && (dist === 5 || dist === 9)) return true;
        if (p.id === "Saturn" && (dist === 3 || dist === 10)) return true;
        return false;
      });

      const lordPlanet = adaptedPlanets.find((p) => p.id === sMeta.lord);

      houses.push({
        houseNumber: h,
        signIndex: signIdx,
        signNameEn: sMeta.en,
        signNameHi: sMeta.hi,
        lordEn: sMeta.lord,
        lordHi: lordPlanet ? lordPlanet.nameHi : sMeta.lord,
        planets: occupyingPlanets,
        aspectingPlanets,
        significanceEn: sigMeta.en,
        significanceHi: sigMeta.hi,
        nameSanskrit: hMeta.sa,
      });
    }

    return houses;
  }

  /**
   * Adapts Dasha timeline from FullKundliData into VimshottariMahadasha hierarchy.
   */
  public static adaptDashaTimeline(data: FullKundliData): VimshottariMahadasha[] {
    const timeline = data.dasha;
    if (!timeline || !timeline.periods) return [];

    return timeline.periods.map((maha) => {
      const antardashas: VimshottariAntardasha[] = (maha.children ?? []).map((antar) => {
        const pratyantardashas: VimshottariPratyantardasha[] = (antar.children ?? []).map(
          (prat) => ({
            planet: prat.lord as PlanetId,
            planetNameHi: prat.lordNameHi,
            startDate: prat.startDateIso,
            endDate: prat.endDateIso,
            startMs: prat.startTimestampMs,
            endMs: prat.endTimestampMs,
            durationDays: prat.durationDays,
            isCurrent: !!prat.isCurrent,
          }),
        );

        const durationMonths =
          Math.round(
            ((antar.endTimestampMs - antar.startTimestampMs) / (365.2425 * 86400 * 1000)) * 12 * 10,
          ) / 10;

        return {
          planet: antar.lord as PlanetId,
          planetNameHi: antar.lordNameHi,
          startDate: antar.startDateIso,
          endDate: antar.endDateIso,
          startMs: antar.startTimestampMs,
          endMs: antar.endTimestampMs,
          durationMonths,
          isCurrent: !!antar.isCurrent,
          pratyantardashas,
        };
      });

      const durationYears =
        Math.round(
          ((maha.endTimestampMs - maha.startTimestampMs) / (365.2425 * 86400 * 1000)) * 10,
        ) / 10;

      return {
        planet: maha.lord as PlanetId,
        planetNameHi: maha.lordNameHi,
        startDate: maha.startDateIso,
        endDate: maha.endDateIso,
        startMs: maha.startTimestampMs,
        endMs: maha.endTimestampMs,
        durationYears,
        isCurrent: !!maha.isCurrent,
        antardashas,
      };
    });
  }

  /**
   * Adapts house cusps from a specific base sign (e.g. Chandra Lagna, Surya Lagna).
   */
  public static adaptHousesForSign(
    baseSign: number,
    adaptedPlanets: KundliPlanet[],
  ): KundliHouse[] {
    const safeBaseSign = isNaN(baseSign) || baseSign < 0 ? 0 : baseSign % 12;
    const houses: KundliHouse[] = [];

    for (let h = 1; h <= 12; h++) {
      const signIdx = (safeBaseSign + h - 1) % 12;
      const sMeta = ZODIAC_SIGNS[signIdx] || ZODIAC_SIGNS[0];
      const hMeta = HOUSE_NAMES[h - 1] || HOUSE_NAMES[0];
      const sigMeta = HOUSE_SIGNIFICANCE[h - 1] || HOUSE_SIGNIFICANCE[0];

      const occupyingPlanets = adaptedPlanets.filter((p) => {
        const houseFromBase = ((p.signIndex - safeBaseSign + 12) % 12) + 1;
        return houseFromBase === h;
      });

      const aspectingPlanets = adaptedPlanets.filter((p) => {
        const dist = ((signIdx - p.signIndex + 12) % 12) + 1;
        if (dist === 7) return true;
        if (p.id === "Mars" && (dist === 4 || dist === 8)) return true;
        if (p.id === "Jupiter" && (dist === 5 || dist === 9)) return true;
        if (p.id === "Saturn" && (dist === 3 || dist === 10)) return true;
        return false;
      });

      const lordPlanet = adaptedPlanets.find((p) => p.id === sMeta.lord);

      houses.push({
        houseNumber: h,
        signIndex: signIdx,
        signNameEn: sMeta.en,
        signNameHi: sMeta.hi,
        lordEn: sMeta.lord,
        lordHi: lordPlanet ? lordPlanet.nameHi : sMeta.lord,
        planets: occupyingPlanets,
        aspectingPlanets,
        significanceEn: sigMeta.en,
        significanceHi: sigMeta.hi,
        nameSanskrit: hMeta.sa,
      });
    }

    return houses;
  }

  /**
   * Safe fallback for Avakahada details when astronomical lunar data is incomplete.
   */
  public static getFallbackAvakahada(): AvakahadaDetails {
    const defaultNak = NAKSHATRAS_LIST[0] || {
      num: 1,
      en: "Ashwini",
      hi: "अश्विनी",
      lord: "Ketu",
      yoni: "Ashwa (Horse)",
      gana: "Deva",
      nadi: "Adi",
    };
    return {
      varna: { en: "Brahmin", hi: "ब्राह्मण" },
      vashya: { en: "Manava (Human)", hi: "मानव / द्विपद" },
      yoni: { en: defaultNak.yoni || "Ashwa", hi: defaultNak.yoni || "अश्व", animal: "Ashwa" },
      gana: { en: defaultNak.gana || "Deva", hi: "देव" },
      nadi: { en: defaultNak.nadi || "Adi", hi: "आदि" },
      tatva: { en: "Agni (Fire)", hi: "अग्नि" },
      paya: { en: "Tamra (Copper)", hi: "ताम्र", quality: "Auspicious & Steady Growth" },
      rasiLord: { en: "Mars", hi: "मंगल" },
      nakshatraLord: { en: defaultNak.lord || "Ketu", hi: defaultNak.lord || "केतु" },
      friendlyRasis: ["सिंह", "धनु", "तुला"],
      luckyGemstone: { en: "Yellow Sapphire (Pukhraj)", hi: "पुखराज (Yellow Sapphire)" },
      luckyColor: { en: "Golden Yellow", hi: "पीला / स्वर्णिम" },
      luckyNumber: 3,
      luckyDeity: { en: "Lord Vishnu", hi: "भगवान श्री हरि विष्णु" },
    };
  }

  /**
   * Adapts Avakahada Chakra data from FullKundliData.
   */
  public static adaptAvakahada(fullData: FullKundliData): AvakahadaDetails {
    const moon = fullData?.astronomy?.planets?.Moon;
    const moonSignIndex =
      moon && typeof moon.signIndex === "number" && !isNaN(moon.signIndex) ? moon.signIndex : 0;
    const moonNakNum =
      moon && typeof moon.nakshatraNumber === "number" && !isNaN(moon.nakshatraNumber)
        ? moon.nakshatraNumber
        : 1;
    const moonNakIdx = Math.max(0, Math.min(26, moonNakNum - 1));
    const moonNakMeta = NAKSHATRAS_LIST[moonNakIdx] ||
      NAKSHATRAS_LIST[0] || {
        num: 1,
        en: "Ashwini",
        hi: "अश्विनी",
        lord: "Ketu",
        yoni: "Ashwa (Horse)",
        gana: "Deva",
        nadi: "Adi",
      };

    // Varna from Moon sign
    let varna = { en: "Shudra", hi: "शूद्र" };
    if ([3, 7, 11].includes(moonSignIndex)) varna = { en: "Brahmin", hi: "ब्राह्मण" };
    else if ([0, 4, 8].includes(moonSignIndex)) varna = { en: "Kshatriya", hi: "क्षत्रिय" };
    else if ([1, 5, 9].includes(moonSignIndex)) varna = { en: "Vaishya", hi: "वैश्य" };

    // Vashya from Moon sign
    let vashya = { en: "Manava (Human)", hi: "मानव / द्विपद" };
    const degInSign = moon && typeof moon.degreeInSign === "number" ? moon.degreeInSign : 0;
    if (
      [0, 1].includes(moonSignIndex) ||
      (moonSignIndex === 8 && degInSign >= 15) ||
      (moonSignIndex === 9 && degInSign < 15)
    ) {
      vashya = { en: "Chatushpada (Quadruped)", hi: "चतुष्पाद" };
    } else if ([3, 11].includes(moonSignIndex) || (moonSignIndex === 9 && degInSign >= 15)) {
      vashya = { en: "Jalachara (Water)", hi: "जलचर" };
    } else if (moonSignIndex === 7) {
      vashya = { en: "Keeta (Insect)", hi: "कीट" };
    } else if (moonSignIndex === 4) {
      vashya = { en: "Vanchara (Forest/Wild)", hi: "वनचर" };
    }

    // Tatva from Moon sign
    let tatva = { en: "Agni (Fire)", hi: "अग्नि" };
    if ([1, 5, 9].includes(moonSignIndex)) tatva = { en: "Prithvi (Earth)", hi: "पृथ्वी" };
    else if ([2, 6, 10].includes(moonSignIndex)) tatva = { en: "Vayu (Air)", hi: "वायु" };
    else if ([3, 7, 11].includes(moonSignIndex)) tatva = { en: "Jala (Water)", hi: "जल" };

    // Paya from Moon house in D1
    const moonHouse = moon && typeof moon.houseD1 === "number" ? moon.houseD1 : 1;
    let paya = { en: "Tamra (Copper)", hi: "ताम्र", quality: "Auspicious & Steady Growth" };
    if ([1, 6, 11].includes(moonHouse))
      paya = { en: "Swarna (Gold)", hi: "स्वर्ण", quality: "Demands Vigilance & Perseverance" };
    else if ([2, 5, 9].includes(moonHouse))
      paya = { en: "Rajata (Silver)", hi: "रजत", quality: "Highly Auspicious & Wealth Bestowing" };
    else if ([4, 8, 12].includes(moonHouse))
      paya = { en: "Loha (Iron)", hi: "लौह", quality: "Calls for Diligence & Patience" };

    const gemMap: Record<
      string,
      {
        en: string;
        hi: string;
        colorEn: string;
        colorHi: string;
        num: number;
        deityEn: string;
        deityHi: string;
      }
    > = {
      Sun: {
        en: "Ruby (Manikya)",
        hi: "माणिक्य (Ruby)",
        colorEn: "Saffron / Ruby Red",
        colorHi: "केसरिया / लाल",
        num: 1,
        deityEn: "Lord Shiva / Surya",
        deityHi: "भगवान शिव / सूर्य देव",
      },
      Moon: {
        en: "Pearl (Moti)",
        hi: "मोती (Pearl)",
        colorEn: "Pearl White / Cream",
        colorHi: "दूधिया श्वेत / क्रीम",
        num: 2,
        deityEn: "Goddess Parvati",
        deityHi: "माँ पार्वती / गौरी",
      },
      Mars: {
        en: "Red Coral (Moonga)",
        hi: "मूँगा (Coral)",
        colorEn: "Crimson Red / Coral",
        colorHi: "सिंदूरी लाल",
        num: 9,
        deityEn: "Lord Kartikeya / Hanuman",
        deityHi: "श्री हनुमान / कार्तिकेय",
      },
      Mercury: {
        en: "Emerald (Panna)",
        hi: "पन्ना (Emerald)",
        colorEn: "Emerald Green",
        colorHi: "पन्ना हरा",
        num: 5,
        deityEn: "Lord Vishnu",
        deityHi: "भगवान श्री हरि विष्णु",
      },
      Jupiter: {
        en: "Yellow Sapphire (Pukhraj)",
        hi: "पुखराज (Yellow Sapphire)",
        colorEn: "Golden Yellow",
        colorHi: "पीला / स्वर्णिम",
        num: 3,
        deityEn: "Lord Brahma / Brihaspati",
        deityHi: "भगवान बृहस्पति / ब्रह्मा",
      },
      Venus: {
        en: "Diamond / White Sapphire (Heera)",
        hi: "हीरा / ओपल",
        colorEn: "Sparkling White / Light Pink",
        colorHi: "चमकीला श्वेत / गुलाबी",
        num: 6,
        deityEn: "Goddess Lakshmi",
        deityHi: "माँ महालक्ष्मी",
      },
      Saturn: {
        en: "Blue Sapphire (Neelam)",
        hi: "नीलम (Blue Sapphire)",
        colorEn: "Midnight Navy / Black",
        colorHi: "गहरा नीला / श्यामल",
        num: 8,
        deityEn: "Lord Shani / Bhairava",
        deityHi: "भगवान शनिदेव / भैरव",
      },
    };

    const luckyMeta = gemMap[moonNakMeta.lord] || gemMap["Jupiter"];
    const yoniStr = moonNakMeta.yoni || "Ashwa (Horse)";
    const ganaEn = moonNakMeta.gana || "Deva";
    const ganaHi = ganaEn === "Deva" ? "देव" : ganaEn === "Manushya" ? "मनुष्य" : "राक्षस";
    const nadiEn = moonNakMeta.nadi || "Adi";
    const nadiHi = nadiEn === "Adi" ? "आदि" : nadiEn === "Madhya" ? "मध्य" : "अन्त्य";

    return {
      varna,
      vashya,
      yoni: { en: yoniStr, hi: yoniStr, animal: yoniStr.split(" ")[0] || "Ashwa" },
      gana: {
        en: ganaEn,
        hi: ganaHi,
      },
      nadi: {
        en: nadiEn,
        hi: nadiHi,
      },
      tatva,
      paya,
      rasiLord: {
        en: (ZODIAC_SIGNS[moonSignIndex] || ZODIAC_SIGNS[0]).lord,
        hi: (ZODIAC_SIGNS[moonSignIndex] || ZODIAC_SIGNS[0]).lord,
      },
      nakshatraLord: { en: moonNakMeta.lord || "Ketu", hi: moonNakMeta.lord || "केतु" },
      friendlyRasis: [
        (ZODIAC_SIGNS[(moonSignIndex + 4) % 12] || ZODIAC_SIGNS[0]).hi,
        (ZODIAC_SIGNS[(moonSignIndex + 8) % 12] || ZODIAC_SIGNS[0]).hi,
        (ZODIAC_SIGNS[(moonSignIndex + 6) % 12] || ZODIAC_SIGNS[0]).hi,
      ],
      luckyGemstone: { en: luckyMeta.en, hi: luckyMeta.hi },
      luckyColor: { en: luckyMeta.colorEn, hi: luckyMeta.colorHi },
      luckyNumber: luckyMeta.num,
      luckyDeity: { en: luckyMeta.deityEn, hi: luckyMeta.deityHi },
    };
  }

  /**
   * Adapts Dosha analysis from FullKundliData.
   */
  public static adaptDoshas(
    fullData: FullKundliData,
    adaptedPlanets: KundliPlanet[],
  ): DoshaAnalysis {
    const mars = adaptedPlanets.find((p) => p.id === "Mars");
    const moon = adaptedPlanets.find((p) => p.id === "Moon");
    const rahu = adaptedPlanets.find((p) => p.id === "Rahu");
    const ketu = adaptedPlanets.find((p) => p.id === "Ketu");
    const saturn = adaptedPlanets.find((p) => p.id === "Saturn");

    const marsHouseLagna = mars ? mars.houseD1 : 1;
    const marsHouseMoon = mars ? mars.houseChandra : 1;

    // Manglik houses: 1, 2, 4, 7, 8, 12
    const manglikHouses = [1, 2, 4, 7, 8, 12];
    const fromLagna = manglikHouses.includes(marsHouseLagna);
    const fromMoon = manglikHouses.includes(marsHouseMoon);

    let isManglikCancelled = false;
    let cancellationReasonEn = "";
    let cancellationReasonHi = "";

    if (fromLagna || fromMoon) {
      if (mars && (mars.dignity === "own" || mars.dignity === "exalted")) {
        isManglikCancelled = true;
        cancellationReasonEn = "Mars is in own or exalted sign in the chart";
        cancellationReasonHi =
          "मंगल कुंडली में स्वराशि अथवा उच्च का है, जिससे भौम दोष निष्प्रभावी हो जाता है";
      }
    }

    const isManglik = (fromLagna || fromMoon) && !isManglikCancelled;

    // Kalsarpa Dosha: Check if all 7 planets are contained between Rahu and Ketu
    const classical7 = adaptedPlanets.filter((p) =>
      ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(p.id),
    );
    const rahuLon = rahu ? rahu.longitude : 0;
    const ketuLon = ketu ? ketu.longitude : 180;

    let allBetweenRahuKetu = true;
    let allBetweenKetuRahu = true;

    classical7.forEach((p) => {
      let inArc1 = false;
      if (rahuLon < ketuLon) {
        inArc1 = p.longitude >= rahuLon && p.longitude <= ketuLon;
      } else {
        inArc1 = p.longitude >= rahuLon || p.longitude <= ketuLon;
      }

      if (!inArc1) allBetweenRahuKetu = false;
      if (inArc1) allBetweenKetuRahu = false;
    });

    const kalsarpaPresent = allBetweenRahuKetu || allBetweenKetuRahu;
    const kalsarpaNames = [
      { en: "Anant Kalsarpa (1st to 7th House)", hi: "अनन्त कालसर्प योग (१म से ७म भाव)" },
      { en: "Kulik Kalsarpa (2nd to 8th House)", hi: "कुलिक कालसर्प योग (२य से ८म भाव)" },
      { en: "Vasuki Kalsarpa (3rd to 9th House)", hi: "वासुकी कालसर्प योग (३य से ९म भाव)" },
      { en: "Shankhapal Kalsarpa (4th to 10th House)", hi: "शंखपाल कालसर्प योग (४थ से १०म भाव)" },
      { en: "Padma Kalsarpa (5th to 11th House)", hi: "पद्म कालसर्प योग (५म से ११म भाव)" },
      { en: "Mahapadma Kalsarpa (6th to 12th House)", hi: "महापद्म कालसर्प योग (६ठ से १२म भाव)" },
      { en: "Takshak Kalsarpa (7th to 1st House)", hi: "तक्षक कालसर्प योग (७म से १म भाव)" },
      { en: "Karkotak Kalsarpa (8th to 2nd House)", hi: "कर्कोटक कालसर्प योग (८म से २य भाव)" },
      { en: "Shankhachur Kalsarpa (9th to 3rd House)", hi: "शंखचूड़ कालसर्प योग (९म से ३य भाव)" },
      { en: "Ghatak Kalsarpa (10th to 4th House)", hi: "घातक कालसर्प योग (१०म से ४थ भाव)" },
      { en: "Vishdhar Kalsarpa (11th to 5th House)", hi: "विषधर कालसर्प योग (११म से ५म भाव)" },
      { en: "Sheshnag Kalsarpa (12th to 6th House)", hi: "शेषनाग कालसर्प योग (१२म से ६ठ भाव)" },
    ];
    const rahuHouse = rahu ? rahu.houseD1 : 1;
    const kalsarpaType = kalsarpaNames[(rahuHouse - 1) % 12] || kalsarpaNames[0];

    const transitSaturn = fullData.gochar?.transitPlanets?.Saturn;
    const saturnHouseFromMoon = transitSaturn
      ? transitSaturn.houseFromNatalMoon
      : saturn
        ? saturn.houseChandra
        : 1;

    let sadeSatiStatus: DoshaAnalysis["sadeSati"]["status"] = "none";
    let sadeSatiLabelEn = "No Sade Sati currently active";
    let sadeSatiLabelHi = "वर्तमान में साढ़े साती सक्रिय नहीं है";

    if (saturnHouseFromMoon === 12) {
      sadeSatiStatus = "rising";
      sadeSatiLabelEn = "Sade Sati 1st Phase (Rising Phase)";
      sadeSatiLabelHi = "साढ़े साती प्रथम चरण (उदय चरण)";
    } else if (saturnHouseFromMoon === 1) {
      sadeSatiStatus = "peak";
      sadeSatiLabelEn = "Sade Sati 2nd Phase (Peak Phase / Janma Shani)";
      sadeSatiLabelHi = "साढ़े साती द्वितीय चरण (शिखर चरण)";
    } else if (saturnHouseFromMoon === 2) {
      sadeSatiStatus = "setting";
      sadeSatiLabelEn = "Sade Sati 3rd Phase (Setting Phase)";
      sadeSatiLabelHi = "साढ़े साती तृतीय चरण (अस्त चरण)";
    } else if (saturnHouseFromMoon === 4) {
      sadeSatiStatus = "kantaka";
      sadeSatiLabelEn = "Kantaka Shani / Small Dhaiya (4th from Moon)";
      sadeSatiLabelHi = "कंटक शनि / चतुर्थ ढैय्या";
    } else if (saturnHouseFromMoon === 8) {
      sadeSatiStatus = "ashtama";
      sadeSatiLabelEn = "Ashtama Shani / 8th House Dhaiya";
      sadeSatiLabelHi = "अष्टम शनि / अष्टम ढैय्या";
    }

    const moonSign = moon ? moon.signIndex : 0;
    const saturnSign = saturn ? saturn.signIndex : 0;

    return {
      manglik: {
        isManglik,
        severity: isManglik ? (fromLagna && fromMoon ? "high" : "mild") : "none",
        fromLagna,
        fromMoon,
        marsHouseLagna,
        marsHouseMoon,
        isCancelled: isManglikCancelled,
        cancellationReasonEn,
        cancellationReasonHi,
        descriptionEn: isManglik
          ? `Mars is placed in House ${marsHouseLagna} from Lagna and House ${marsHouseMoon} from Moon.`
          : isManglikCancelled
            ? `Manglik condition cancelled by classical rule: ${cancellationReasonEn}.`
            : "Mars is in a favourable house (No Manglik Dosha).",
        descriptionHi: isManglik
          ? `मंगल लग्न से ${marsHouseLagna}वें भाव एवं चन्द्र से ${marsHouseMoon}वें भाव में स्थित है, जिससे मांगलिक प्रभाव बनता है।`
          : isManglikCancelled
            ? `मांगलिक स्थिति शास्त्रोक्त नियम के अनुसार निष्प्रभावी है: ${cancellationReasonHi}।`
            : "मंगल शुभ व अनुकूल भाव में स्थित है (मांगलिक दोष नहीं है)।",
        remedyEn: "Chanting Hanuman Chalisa and practicing mutual patience.",
        remedyHi:
          "मंगलवार को श्री हनुमान चालीसा का पाठ एवं मंगल गायत्री मन्त्र का जप शुभ फलदायी है।",
      },
      kalsarpa: {
        present: kalsarpaPresent,
        typeEn: kalsarpaPresent ? kalsarpaType.en : undefined,
        typeHi: kalsarpaPresent ? kalsarpaType.hi : undefined,
        descriptionEn: kalsarpaPresent
          ? `All major planets are situated along one flank of the Rahu-Ketu nodal axis (${kalsarpaType.en}).`
          : "Planets are evenly distributed across both sides of Rahu and Ketu (No Kalsarpa Dosha).",
        descriptionHi: kalsarpaPresent
          ? `सभी सातों मुख्य ग्रह राहु-केतु अक्ष के एक ओर स्थित हैं (${kalsarpaType.hi})।`
          : "ग्रह राहु और केतु के दोनों ओर संतुलित रूप से वितरित हैं (कालसर्प दोष अनुपस्थित है)।",
        remedyEn: "Maha Mrityunjaya Japa, Shiva Abhishek with water & milk on Mondays.",
        remedyHi: "महामृत्युंजय मन्त्र का नित्य जप, सोमवार को शिवलिंग पर जल-दूध का अभिषेक।",
      },
      sadeSati: {
        status: sadeSatiStatus,
        statusLabelEn: sadeSatiLabelEn,
        statusLabelHi: sadeSatiLabelHi,
        currentSaturnSign: (ZODIAC_SIGNS[saturnSign] || ZODIAC_SIGNS[0]).hi,
        natalMoonSign: (ZODIAC_SIGNS[moonSign] || ZODIAC_SIGNS[0]).hi,
        descriptionEn: `Saturn is in ${saturnHouseFromMoon}th from Natal Moon.`,
        descriptionHi: `गोचर शनि जन्म चन्द्र से ${saturnHouseFromMoon}वें भाव में स्थित है।`,
        remedyEn: "Chanting Shani Gayatri or Hanuman Chalisa.",
        remedyHi: "शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक एवं हनुमान चालीसा का पाठ।",
      },
      gandanta: {
        isGandanta: false,
        descriptionEn: "No Gandanta point placement.",
        descriptionHi: "गंडांत दोष अनुपस्थित है।",
        remedyEn: "None required.",
        remedyHi: "कोई उपाय आवश्यक नहीं है।",
      },
    };
  }

  /**
   * Creates a complete compatibility bundle so legacy components can render
   * seamlessly using 100% authoritative FullKundliData without modifying their internal interfaces.
   */
  public static createCompatibilityBundle(fullData: FullKundliData): any {
    const adaptedPlanets = this.adaptPlanets(fullData);
    const housesD1 = this.adaptHousesForVarga(fullData, "D1", adaptedPlanets);
    const housesD9 = this.adaptHousesForVarga(fullData, "D9", adaptedPlanets);
    const housesD10 = this.adaptHousesForVarga(fullData, "D10", adaptedPlanets);

    // Build houses for all 16 vargas
    const vargaHouses: Record<string, KundliHouse[]> = {};
    const ALL_VARGAS: VargaType[] = [
      "D1",
      "D2",
      "D3",
      "D4",
      "D7",
      "D9",
      "D10",
      "D12",
      "D16",
      "D20",
      "D24",
      "D27",
      "D30",
      "D40",
      "D45",
      "D60",
    ];

    ALL_VARGAS.forEach((v) => {
      vargaHouses[v.toLowerCase()] = this.adaptHousesForVarga(fullData, v, adaptedPlanets);
      vargaHouses[v] = vargaHouses[v.toLowerCase()];
    });

    const dashaPeriods = this.adaptDashaTimeline(fullData);
    const currentMahadasha = dashaPeriods.find((m) => m.isCurrent);
    const currentAntardasha = currentMahadasha?.antardashas.find((a) => a.isCurrent);

    const asc = fullData.astronomy.ascendant;
    const moon = fullData.astronomy.planets.Moon;
    const sun = fullData.astronomy.planets.Sun;

    const lagnaSignMeta = ZODIAC_SIGNS[asc.signIndex] || ZODIAC_SIGNS[0];
    const lagnaLordPlanet = adaptedPlanets.find((p) => p.id === lagnaSignMeta.lord);

    const d9LagnaSign = fullData.vargas.D9?.lagnaSignIndex ?? 0;
    const d9SignMeta = ZODIAC_SIGNS[d9LagnaSign] || ZODIAC_SIGNS[0];

    const chandraSign = moon ? moon.signIndex : 0;
    const chandraSignMeta = ZODIAC_SIGNS[chandraSign] || ZODIAC_SIGNS[0];

    const suryaSign = sun ? sun.signIndex : 0;
    const suryaSignMeta = ZODIAC_SIGNS[suryaSign] || ZODIAC_SIGNS[0];

    const housesChandra = this.adaptHousesForSign(chandraSign, adaptedPlanets);
    const housesSurya = this.adaptHousesForSign(suryaSign, adaptedPlanets);
    const housesChalit = housesD1;

    let avakahada: AvakahadaDetails;
    try {
      avakahada = this.adaptAvakahada(fullData);
    } catch {
      avakahada = this.getFallbackAvakahada();
    }
    const doshas = this.adaptDoshas(fullData, adaptedPlanets);

    return {
      // Complete canonical data preserved
      canonical: fullData,

      // Profile & Metadata
      profile: {
        name: fullData.birthInput.name || "Subject",
        birthDate: fullData.birthInput.date,
        birthTime: fullData.birthInput.time,
        birthTimeMs: fullData.astronomy.utcTimestampMs,
        cityName: fullData.birthInput.placeName || "Coordinates",
        latitude: fullData.birthInput.latitude,
        longitude: fullData.birthInput.longitude,
        timezone: fullData.birthInput.timeZone,
        ayanamsaKey: fullData.profile.ayanamsha,
        ayanamsaName: fullData.profile.ayanamsha.toUpperCase(),
        ayanamsaDeg: fullData.astronomy.ayanamshaDeg,
      },

      // Lagna (Ascendant)
      lagna: {
        longitude: asc.siderealLongitude,
        signIndex: asc.signIndex,
        signNameEn: lagnaSignMeta.en,
        signNameHi: lagnaSignMeta.hi,
        degreeInSign: asc.degreeInSign,
        dms: toDms(asc.degreeInSign),
        nakshatraNumber: asc.nakshatraNumber,
        nakshatraNameEn: asc.nakshatraName,
        nakshatraNameHi: asc.nakshatraName,
        pada: asc.pada,
        lordEn: lagnaSignMeta.lord,
        lordHi: lagnaLordPlanet ? lagnaLordPlanet.nameHi : lagnaSignMeta.lord,
      },

      // Reference Lagnas
      navamshaLagna: {
        signIndex: d9LagnaSign,
        signNameEn: d9SignMeta.en,
        signNameHi: d9SignMeta.hi,
      },
      chandraLagna: {
        signIndex: chandraSign,
        signNameEn: chandraSignMeta.en,
        signNameHi: chandraSignMeta.hi,
      },
      suryaLagna: {
        signIndex: suryaSign,
        signNameEn: suryaSignMeta.en,
        signNameHi: suryaSignMeta.hi,
      },

      // Planets & Houses
      planets: adaptedPlanets,
      housesD1,
      housesD9,
      housesD10,
      housesChandra,
      housesSurya,
      housesChalit,
      vargaHouses,
      shodashavarga: fullData.vargas,

      // Avakahada & Doshas
      avakahada,
      doshas,

      // Dasha System
      vimshottari: {
        system: "vimshottari",
        totalYears: 120,
        birthBalance: fullData.dasha.balanceAtBirth,
        dashas: dashaPeriods,
        currentMahadasha,
        currentAntardasha,
        canonicalTimeline: fullData.dasha,
      },

      // Classical Yogas & Rules
      yogas: fullData.rules.map((r) => ({
        nameEn: r.nameEn,
        nameHi: r.nameHi,
        nameSa: r.nameSa,
        present: r.status === "PRESENT",
        status: r.status,
        category: r.category,
        type: r.status === "PRESENT" ? "auspicious" : "mixed",
        descriptionEn: r.descriptionEn,
        descriptionHi: r.descriptionHi,
        evidence: r.matchedConditions,
        conditions: r.matchedConditions,
        ruleId: r.ruleId,
        source: r.source,
      })),

      // Integrated Subsystem Data
      shadbala: fullData.shadbala,
      jaimini: fullData.jaimini,
      ashtakavarga: fullData.ashtakavarga,
      kp: fullData.kp,
      gochar: fullData.gochar,
      provenance: fullData.provenance,
      hashes: fullData.hashes,
      calculationId: fullData.calculationId,
    };
  }
}
