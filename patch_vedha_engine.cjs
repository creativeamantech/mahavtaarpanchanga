const fs = require('fs');
let code = fs.readFileSync('src/lib/navtaraEngine.ts', 'utf8');

// 1. Add VedhaAssessment interface
const interfaceReplacement = `export interface PariharaInfo {
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
  nature: "Auspicious" | "Inauspicious" | "Neutral" | "Highly Auspicious" | "Severely Inauspicious" | "Neutral / Mixed";
  tara_score: number;
  result_description: string;
  intensity_level?: string;
  net_intensity_percentage?: number;
  parihara?: PariharaInfo;
  vedha_assessment?: VedhaAssessment;
}`;

code = code.replace(/export interface PariharaInfo \{[\s\S]*?parihara\?: PariharaInfo;\n\}/, interfaceReplacement);

// 2. Add mock data parameters (since we don't have full ephemeris/ashtakavarga data in this engine yet, 
// we will simulate the vedha logic based on the requested rules if optional mock data is provided, or just add the logic structure).
// I will update calculateNavtara to accept optional transit context.

const calculateSignatureReplacement = `export interface TransitContext {
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
  transitContext?: TransitContext
): NavtaraResult {`;

code = code.replace(/\/\*\*[\s\S]*?export function calculateNavtara\(birthNakshatraIndex: number, targetNakshatraIndex: number\): NavtaraResult \{/, calculateSignatureReplacement);

// 3. Add Vedha logic inside calculateNavtara
const logicReplacement = `
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
      description += \` (Paryaya \${paryaya}: Malefic intensity is relatively reduced).\`;
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
      const isSunSaturn = (transitContext.planet === "Sun" && transitContext.vedha_house_occupied_by === "Saturn") || 
                          (transitContext.planet === "Saturn" && transitContext.vedha_house_occupied_by === "Sun");
      const isMoonMercury = (transitContext.planet === "Moon" && transitContext.vedha_house_occupied_by === "Mercury") || 
                            (transitContext.planet === "Mercury" && transitContext.vedha_house_occupied_by === "Moon");
      
      if (!isSunSaturn && !isMoonMercury) {
        isVedhaActive = true;
        isNeutralized = true;
        neutralizationReason += \`Vedha intervention by \${transitContext.vedha_house_occupied_by}. \`;
      }
    }

    // Rule 2: Ashtakavarga Point Override
    if (transitContext.ashtakavarga_rekhas !== undefined && transitContext.ashtakavarga_rekhas >= 5) {
      isNeutralized = true;
      neutralizationReason += \`High Ashtakavarga score (\${transitContext.ashtakavarga_rekhas} Rekhas). \`;
    }
    if (transitContext.samudaya_bindus !== undefined && transitContext.samudaya_bindus >= 30) {
      isNeutralized = true;
      neutralizationReason += \`High Samudaya Bindus (\${transitContext.samudaya_bindus}). \`;
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
      description = \`Neutralized / Low Risk: \${neutralizationReason.trim()} \` + description;
    }

    vedhaAssessment = {
      is_vedha_active: isVedhaActive,
      vedha_causing_planet: transitContext.vedha_house_occupied_by,
      ashtakavarga_rekhas: transitContext.ashtakavarga_rekhas,
      samudaya_bindus: transitContext.samudaya_bindus,
      is_neutralized: isNeutralized,
      neutralization_reason: neutralizationReason.trim() || undefined
    };
  }

  // 4. Parihara Allocation
  if (taraNumber === 1 || taraNumber === 3 || taraNumber === 5 || taraNumber === 7) {`;

code = code.replace(/  let score = taraDef\.score;\n  let description = taraDef\.description;\n  let intensityLevel = "Low";\n  let parihara: PariharaInfo \| undefined = undefined;\n\n  if \(paryaya === 1\) \{[\s\S]*?if \(taraNumber === 1 \|\| taraNumber === 3 \|\| taraNumber === 5 \|\| taraNumber === 7\) \{/, logicReplacement);

const returnReplacement = `
  return {
    birth_nakshatra: {
      index: birthNakshatraIndex,
      name: NAKSHATRA_NAMES[birthNakshatraIndex - 1]
    },
    target_nakshatra: {
      index: targetNakshatraIndex,
      name: NAKSHATRA_NAMES[targetNakshatraIndex - 1]
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
    vedha_assessment: vedhaAssessment
  };`;

code = code.replace(/  return \{[\s\S]*?parihara\n  \};/, returnReplacement);

fs.writeFileSync('src/lib/navtaraEngine.ts', code);
