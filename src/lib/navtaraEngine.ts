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
  paryaya: number; // 1, 2, or 3
  tara_number: number; // 1 to 9
  tara_name: string;
  nature: "Auspicious" | "Inauspicious" | "Neutral" | "Highly Auspicious" | "Severely Inauspicious" | "Neutral / Mixed";
  tara_score: number;
  result_description: string;
}

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const TARA_DEFINITIONS: Record<number, { name: string; nature: NavtaraResult["nature"]; score: number; description: string }> = {
  1: {
    name: "Janma",
    nature: "Neutral / Mixed",
    score: 50,
    description: "Influences physical health, body, and self. Needs care during malefic transits."
  },
  2: {
    name: "Sampat",
    nature: "Highly Auspicious",
    score: 90,
    description: "Brings financial gains, wealth, prosperity, and material comforts."
  },
  3: {
    name: "Vipat",
    nature: "Inauspicious",
    score: 20,
    description: "Causes unexpected troubles, financial losses, and setbacks."
  },
  4: {
    name: "Kshema",
    nature: "Auspicious",
    score: 80,
    description: "Grants safety, protection, general well-being, and peace of mind."
  },
  5: {
    name: "Pratyak",
    nature: "Inauspicious",
    score: 30,
    description: "Creates obstacles, delays, disputes, and resistance in endeavors."
  },
  6: {
    name: "Sadhak",
    nature: "Highly Auspicious",
    score: 100,
    description: "Ensures accomplishment of goals, success, and spiritual/material progress."
  },
  7: {
    name: "Vadha / Naidhana",
    nature: "Severely Inauspicious",
    score: 0,
    description: "Indicates danger, critical illness, severe distress, or extreme obstruction."
  },
  8: {
    name: "Mitra",
    nature: "Auspicious",
    score: 75,
    description: "Brings friendly support, happiness, harmony, and favorable conditions."
  },
  9: {
    name: "Parama Mitra",
    nature: "Highly Auspicious",
    score: 95,
    description: "Bestows deep alliances, major successes, and great fulfillment of desires."
  }
};

/**
 * Calculates the Navtara (Tara Bala) based on classical Vedic principles.
 * @param birthNakshatraIndex Integer (1 to 27, where Ashwini = 1)
 * @param targetNakshatraIndex Integer (1 to 27)
 */
export function calculateNavtara(birthNakshatraIndex: number, targetNakshatraIndex: number): NavtaraResult {
  // Distance = ((Target_Nakshatra_Index - Birth_Nakshatra_Index) + 27) % 27 + 1
  const distance = ((targetNakshatraIndex - birthNakshatraIndex) + 27) % 27 + 1;
  
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
  
  // Assess Special Exceptions:
  // In Paryaya 1 (1st Cycle), Vadha (7th) and Vipat (3rd) Taras carry maximum malefic intensity.
  // In Paryaya 2 & 3, the intensity of malefic Taras is relatively reduced unless afflicted by transiting malefics.
  let score = taraDef.score;
  let description = taraDef.description;
  
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
    result_description: description
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
