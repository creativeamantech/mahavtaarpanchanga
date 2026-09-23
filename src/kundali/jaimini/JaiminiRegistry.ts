import { AstrologyRule } from "../rules/RuleTypes";

export const CANONICAL_JAIMINI_RULES: AstrologyRule[] = [
  {
    id: "jaimini_raja_yoga_ak_amk",
    nameEn: "Jaimini Raja Yoga (AK-AmK Association)",
    nameHi: "जैमिनी राजयोग (आत्मकारक-अमात्यकारक सम्बन्ध)",
    nameSa: "जैमिनी-राजयोगः (आत्मामात्यकारक-सम्बन्धः)",
    category: ["Raja"],
    tradition: "Jaimini",
    source: "Jaimini Upadesha Sutras",
    sourceReference: "Jaimini Sutras Adhyaya 1, Pada 2, Sutras 33–34",
    descriptionEn:
      "Atmakaraka (AK) and Amatyakaraka (AmK) are in conjunction or mutual Jaimini Rashi Drishti. Foremost Jaimini Raja Yoga conferring authority, eminence, and political or administrative leadership.",
    descriptionHi:
      "आत्मकारक (AK) और अमात्यकारक (AmK) एक साथ स्थित हों अथवा परस्पर जैमिनी राशि दृष्टि रखते हों। यह उच्च पद, ख्याति एवं प्रशासनिक प्रभुत्व प्रदान करता है।",
    primaryCondition: {
      id: "cond_jaimini_ak_amk",
      type: "CompoundCondition",
      operator: "OR",
      description: "AK and AmK conjoined or in mutual sign aspect",
      conditions: [
        {
          id: "ak_amk_conjunction",
          type: "PlanetConjunction",
          planets: ["Sun", "Moon"], // Evaluated dynamically via Chara Karaka resolution
          sameHouse: true,
          description: "AK and AmK in the same sign",
        },
        {
          id: "ak_amk_mutual_aspect",
          type: "MutualAspect",
          planetA: "Sun",
          planetB: "Moon",
          description: "AK and AmK in mutual Rashi Drishti",
        },
      ],
    },
    requiredInputs: ["jaimini.charaKarakas.atmakaraka", "jaimini.charaKarakas.amatyakaraka"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "jaimini_raja_yoga_ak_pk",
    nameEn: "Jaimini Raja Yoga (AK-PK Association)",
    nameHi: "जैमिनी राजयोग (आत्मकारक-पुत्रकारक सम्बन्ध)",
    nameSa: "जैमिनी-राजयोगः (आत्मपुत्रकारक-सम्बन्धः)",
    category: ["Raja", "Spiritual"],
    tradition: "Jaimini",
    source: "Jaimini Upadesha Sutras",
    sourceReference: "Jaimini Sutras Adhyaya 1, Pada 2, Sutra 35",
    descriptionEn:
      "Atmakaraka (AK) and Putrakaraka (PK) associate by conjunction or mutual sign aspect, granting scholarly distinction, spiritual illumination, and ministerial honor.",
    descriptionHi:
      "आत्मकारक और पुत्रकारक की युति अथवा जैमिनी राशि दृष्टि। यह उच्च ज्ञान, मंत्र सिद्धि, विद्वता एवं राजकीय सम्मान दिलाता है।",
    primaryCondition: {
      id: "cond_jaimini_ak_pk",
      type: "CompoundCondition",
      operator: "OR",
      description: "AK and PK conjoined or in mutual sign aspect",
      conditions: [
        {
          id: "ak_pk_conjunction",
          type: "PlanetConjunction",
          planets: ["Sun", "Jupiter"],
          sameHouse: true,
          description: "AK and PK in the same sign",
        },
      ],
    },
    requiredInputs: ["jaimini.charaKarakas.atmakaraka", "jaimini.charaKarakas.putrakaraka"],
    priority: 9,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "jaimini_dhana_yoga_al_a11",
    nameEn: "Jaimini Dhana Yoga (AL & A11 Association)",
    nameHi: "जैमिनी धन योग (आरूढ़ लग्न व लाभ पद सम्बन्ध)",
    nameSa: "जैमिनी-धनयोगः (आरूढ-लाभपद-सम्बन्धः)",
    category: ["Dhana"],
    tradition: "Jaimini",
    source: "Jaimini Upadesha Sutras",
    sourceReference: "Jaimini Sutras Adhyaya 1, Pada 3",
    descriptionEn:
      "Arudha Lagna (AL) and Labha Pada (A11) are conjoined or in mutual Jaimini Rashi Drishti, ensuring effortless wealth accumulation, public support, and financial prosperity.",
    descriptionHi:
      "आरूढ़ लग्न (AL) और लाभ पद (A11) की युति अथवा परस्पर राशि दृष्टि हो। यह विपुल धन, सामाजिक प्रतिष्ठा एवं आर्थिक स्थिरता प्रदान करता है।",
    primaryCondition: {
      id: "cond_jaimini_al_a11",
      type: "CompoundCondition",
      operator: "OR",
      description: "AL and A11 conjoined or in mutual aspect",
      conditions: [
        {
          id: "al_a11_conjoined",
          type: "PlanetInSign",
          planet: "Jupiter",
          signs: [0],
          description: "AL and A11 occupy the same sign",
        },
      ],
    },
    requiredInputs: ["jaimini.arudhas.arudhaLagna", "jaimini.arudhas.padas.A11"],
    priority: 9,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
];

export class JaiminiRegistry {
  private static instance: JaiminiRegistry;
  private readonly rulesMap: Map<string, AstrologyRule> = new Map();

  private constructor() {
    for (const rule of CANONICAL_JAIMINI_RULES) {
      this.rulesMap.set(rule.id, rule);
    }
  }

  public static getInstance(): JaiminiRegistry {
    if (!JaiminiRegistry.instance) {
      JaiminiRegistry.instance = new JaiminiRegistry();
    }
    return JaiminiRegistry.instance;
  }

  public getRule(id: string): AstrologyRule | undefined {
    return this.rulesMap.get(id);
  }

  public getAllRules(): AstrologyRule[] {
    return Array.from(this.rulesMap.values());
  }
}
