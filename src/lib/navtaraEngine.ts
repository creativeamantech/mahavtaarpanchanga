export interface PariharaInfo {
  deity_to_worship: string;
  recommended_mantra: string;
  recommended_donation: string;
  avoid_activities: string[];
}

export interface VedhaAssessment {
  is_vedha_active: boolean;
  vedha_causing_planet?: string;
  ashtakavarga_rekhas?: number;
  samudaya_bindus?: number;
  is_neutralized: boolean;
  neutralization_reason?: string;
}

export interface NavtaraResult {
  birth_nakshatra: {
    index: number;
    name: string;
  };
  target_nakshatra: {
    index: number;
    name: string;
  };
  distance: number;
  paryaya: number;
  tara_number: number;
  tara_name: string;
  nature:
    | "Auspicious"
    | "Inauspicious"
    | "Neutral"
    | "Highly Auspicious"
    | "Severely Inauspicious"
    | "Neutral / Mixed";
  tara_score: number;
  result_description: string;
  intensity_level?: string;
  net_intensity_percentage?: number;
  parihara?: PariharaInfo;
  vedha_assessment?: VedhaAssessment;
}

export const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashirsha",
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

const TARA_DEFINITIONS: Record<
  number,
  { name: string; nature: NavtaraResult["nature"]; score: number; description: string }
> = {
  1: {
    name: "Janma",
    nature: "Neutral / Mixed",
    score: 50,
    description: "Influences physical health, body, and self. Needs care during malefic transits.",
  },
  2: {
    name: "Sampat",
    nature: "Highly Auspicious",
    score: 90,
    description: "Brings financial gains, wealth, prosperity, and material comforts.",
  },
  3: {
    name: "Vipat",
    nature: "Inauspicious",
    score: 20,
    description: "Causes unexpected troubles, financial losses, and setbacks.",
  },
  4: {
    name: "Kshema",
    nature: "Auspicious",
    score: 80,
    description: "Grants safety, protection, general well-being, and peace of mind.",
  },
  5: {
    name: "Pratyak",
    nature: "Inauspicious",
    score: 30,
    description: "Creates obstacles, delays, disputes, and resistance in endeavors.",
  },
  6: {
    name: "Sadhak",
    nature: "Highly Auspicious",
    score: 100,
    description: "Ensures accomplishment of goals, success, and spiritual/material progress.",
  },
  7: {
    name: "Vadha / Naidhana",
    nature: "Severely Inauspicious",
    score: 0,
    description: "Indicates danger, critical illness, severe distress, or extreme obstruction.",
  },
  8: {
    name: "Mitra",
    nature: "Auspicious",
    score: 75,
    description: "Brings friendly support, happiness, harmony, and favorable conditions.",
  },
  9: {
    name: "Parama Mitra",
    nature: "Highly Auspicious",
    score: 95,
    description: "Bestows deep alliances, major successes, and great fulfillment of desires.",
  },
};

export interface TransitContext {
  planet: string;
  transit_house_from_moon: number;
  vedha_house_occupied_by?: string; // name of planet if occupied
  ashtakavarga_rekhas?: number;
  samudaya_bindus?: number;
  is_exalted_or_own_sign?: boolean;
  benefic_aspect?: boolean;
}

/**
 * Calculates the Navtara (Tara Bala) based on classical Vedic principles, including Gochara Vedha neutralization.
 * @param birthNakshatraIndex Integer (1 to 27, where Ashwini = 1)
 * @param targetNakshatraIndex Integer (1 to 27)
 * @param transitContext Optional transit data for Vedha calculation
 */
export function calculateNavtara(
  birthNakshatraIndex: number,
  targetNakshatraIndex: number,
  transitContext?: TransitContext,
): NavtaraResult {
  // Distance = ((Target_Nakshatra_Index - Birth_Nakshatra_Index) + 27) % 27 + 1
  const distance = ((targetNakshatraIndex - birthNakshatraIndex + 27) % 27) + 1;

  let taraNumber = distance % 9;
  if (taraNumber === 0) {
    taraNumber = 9;
  }

  let paryaya = 1;
  if (distance >= 10 && distance <= 18) {
    paryaya = 2;
  } else if (distance >= 19 && distance <= 27) {
    paryaya = 3;
  }

  const taraDef = TARA_DEFINITIONS[taraNumber];

  let score = taraDef.score;
  let description = taraDef.description;
  let intensityLevel = "Low";
  let parihara: PariharaInfo | undefined = undefined;
  let netIntensityPercentage = 100;
  let vedhaAssessment: VedhaAssessment | undefined = undefined;

  // 1. Base intensity based on Paryaya (Cycle)
  let paryayaMultiplier = 1.0;
  if (paryaya === 1) {
    paryayaMultiplier = 1.0;
  } else if (paryaya === 2) {
    paryayaMultiplier = 0.5;
  } else if (paryaya === 3) {
    paryayaMultiplier = taraNumber === 7 ? 0.75 : 0.25;
  }

  netIntensityPercentage = 100 * paryayaMultiplier;

  // 2. Tara specific adjustments
  if (paryaya === 1) {
    if (taraNumber === 3) {
      description += " (Paryaya 1: Maximum malefic intensity).";
      score = Math.max(0, score - 10);
    } else if (taraNumber === 7) {
      description += " (Paryaya 1: Maximum malefic intensity).";
    }
  } else if (paryaya === 2 || paryaya === 3) {
    if (taraNumber === 3 || taraNumber === 5 || taraNumber === 7) {
      description += ` (Paryaya ${paryaya}: Malefic intensity is relatively reduced).`;
      score = Math.min(100, score + 15);
    }
  }

  // 3. Vedha Neutralization Logic (if it's an inauspicious Tara and context is provided)
  if ((taraNumber === 3 || taraNumber === 5 || taraNumber === 7) && transitContext) {
    let isNeutralized = false;
    let neutralizationReason = "";
    let isVedhaActive = false;

    // Rule 1: Classical Gochara Vedha (House Pair Obstruction)
    // Favorable transit houses: 3, 6, 11, 10. (But Navtara is independent of house, however if house is malefic, vedha blocks it)
    // For simplicity based on prompt: "Check if Vedha planet exists in paired house"
    if (transitContext.vedha_house_occupied_by) {
      // Exceptions: Sun & Saturn, Moon & Mercury
      const isSunSaturn =
        (transitContext.planet === "Sun" && transitContext.vedha_house_occupied_by === "Saturn") ||
        (transitContext.planet === "Saturn" && transitContext.vedha_house_occupied_by === "Sun");
      const isMoonMercury =
        (transitContext.planet === "Moon" &&
          transitContext.vedha_house_occupied_by === "Mercury") ||
        (transitContext.planet === "Mercury" && transitContext.vedha_house_occupied_by === "Moon");

      if (!isSunSaturn && !isMoonMercury) {
        isVedhaActive = true;
        isNeutralized = true;
        neutralizationReason += `Vedha intervention by ${transitContext.vedha_house_occupied_by}. `;
      }
    }

    // Rule 2: Ashtakavarga Point Override
    if (
      transitContext.ashtakavarga_rekhas !== undefined &&
      transitContext.ashtakavarga_rekhas >= 5
    ) {
      isNeutralized = true;
      neutralizationReason += `High Ashtakavarga score (${transitContext.ashtakavarga_rekhas} Rekhas). `;
    }
    if (transitContext.samudaya_bindus !== undefined && transitContext.samudaya_bindus >= 30) {
      isNeutralized = true;
      neutralizationReason += `High Samudaya Bindus (${transitContext.samudaya_bindus}). `;
    }

    // Rule 3: Planetary Dignity & Benefic Aspect
    if (transitContext.is_exalted_or_own_sign) {
      isNeutralized = true;
      neutralizationReason += "Planet is in strong dignity (Exalted/Own Sign). ";
    }
    if (transitContext.benefic_aspect) {
      isNeutralized = true;
      neutralizationReason += "Benefic aspect (Jupiter/Venus) provides relief. ";
    }

    if (isNeutralized) {
      netIntensityPercentage = netIntensityPercentage * 0.2; // 80% neutralized
      description = `Neutralized / Low Risk: ${neutralizationReason.trim()} ` + description;
    }

    vedhaAssessment = {
      is_vedha_active: isVedhaActive,
      vedha_causing_planet: transitContext.vedha_house_occupied_by,
      ashtakavarga_rekhas: transitContext.ashtakavarga_rekhas,
      samudaya_bindus: transitContext.samudaya_bindus,
      is_neutralized: isNeutralized,
      neutralization_reason: neutralizationReason.trim() || undefined,
    };
  }

  // 4. Parihara Allocation
  if (taraNumber === 1 || taraNumber === 3 || taraNumber === 5 || taraNumber === 7) {
    if (paryaya === 1) {
      intensityLevel = "High";
    } else if (paryaya === 2) {
      intensityLevel = "Moderate";
    } else if (paryaya === 3) {
      intensityLevel = taraNumber === 7 ? "High" : "Mild";
    }

    if (taraNumber === 1) {
      parihara = {
        deity_to_worship: "Lord Vishnu",
        recommended_mantra: "Vishnu Sahasranama",
        recommended_donation: "Vegetables, Green Gram (Moong), or Ghee",
        avoid_activities: ["Unnecessary physical strain"],
      };
    } else if (taraNumber === 3) {
      parihara = {
        deity_to_worship: "Lord Ganesha",
        recommended_mantra: "Ganapati Atharvashirsha or Gayatri Mantra",
        recommended_donation: "Jaggery (Gud), Gold, or Copper",
        avoid_activities: ["New financial investments", "High-value contracts", "Agreements"],
      };
    } else if (taraNumber === 5) {
      parihara = {
        deity_to_worship: "Goddess Durga",
        recommended_mantra: "Durga Saptashati or Chandi Patha",
        recommended_donation: "Salt (Namak), Grain/Wheat, or Sesame seeds (Til)",
        avoid_activities: ["Confrontations", "Litigation", "Critical negotiations"],
      };
    } else if (taraNumber === 7) {
      parihara = {
        deity_to_worship: "Lord Shiva",
        recommended_mantra: "Mahamrityunjaya Mantra or Rudra Abhisheka",
        recommended_donation: "Sesame Oil, Til, Black Clothes, or Iron items",
        avoid_activities: ["Dangerous driving", "Optional medical/surgical procedures"],
      };
    }
  }

  return {
    birth_nakshatra: {
      index: birthNakshatraIndex,
      name: NAKSHATRA_NAMES[birthNakshatraIndex - 1],
    },
    target_nakshatra: {
      index: targetNakshatraIndex,
      name: NAKSHATRA_NAMES[targetNakshatraIndex - 1],
    },
    distance,
    paryaya,
    tara_number: taraNumber,
    tara_name: taraDef.name,
    nature: taraDef.nature,
    tara_score: score,
    result_description: description,
    intensity_level: intensityLevel,
    net_intensity_percentage: netIntensityPercentage,
    parihara,
    vedha_assessment: vedhaAssessment,
  };
}

/**
 * Generates the complete 27-Nakshatra Navtara mapping table for a given birth nakshatra.
 * @param birthNakshatraIndex Integer (1 to 27)
 */
export function generateNavtaraTable(birthNakshatraIndex: number): NavtaraResult[] {
  const table: NavtaraResult[] = [];
  for (let targetIndex = 1; targetIndex <= 27; targetIndex++) {
    table.push(calculateNavtara(birthNakshatraIndex, targetIndex));
  }
  return table;
}
