const fs = require("fs");
let code = fs.readFileSync("src/lib/navtaraEngine.ts", "utf8");

// 1. Add PariharaInfo interface and update NavtaraResult
const interfaceReplacement = `export interface PariharaInfo {
  deity_to_worship: string;
  recommended_mantra: string;
  recommended_donation: string;
  avoid_activities: string[];
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
  paryaya: number; // 1, 2, or 3
  tara_number: number; // 1 to 9
  tara_name: string;
  nature: "Auspicious" | "Inauspicious" | "Neutral" | "Highly Auspicious" | "Severely Inauspicious" | "Neutral / Mixed";
  tara_score: number;
  result_description: string;
  intensity_level?: string;
  parihara?: PariharaInfo;
}`;

code = code.replace(
  /export interface NavtaraResult \{[\s\S]*?result_description: string;\n\}/,
  interfaceReplacement,
);

// 2. Update calculateNavtara logic
const logicReplacement = `  const taraDef = TARA_DEFINITIONS[taraNumber];

  let score = taraDef.score;
  let description = taraDef.description;
  let intensityLevel = "Low";
  let parihara: PariharaInfo | undefined = undefined;

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
    parihara
  };`;

code = code.replace(
  /  const taraDef = TARA_DEFINITIONS\[taraNumber\];[\s\S]*?result_description: description\n  };/,
  logicReplacement,
);

fs.writeFileSync("src/lib/navtaraEngine.ts", code);
