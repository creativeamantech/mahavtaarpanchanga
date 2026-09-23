import {
  RuleEvaluationContext,
  EvaluatedGrahaState,
  EvaluatedHouseState,
  DignityState,
} from "../../src/kundali/rules/RuleTypes";
import { CanonicalBodyId } from "../../src/kundali/astronomy/AstronomicalContext";

export interface GoldenRuleTestCase {
  id: string;
  name: string;
  description: string;
  context: RuleEvaluationContext;
  expectedRuleResults: Record<
    string,
    {
      status: "PRESENT" | "ABSENT" | "CANCELLED" | "CONDITIONAL" | "PARTIAL";
      cancellationsTriggered?: string[];
    }
  >;
}

/**
 * Creates a mock RuleEvaluationContext with standard defaults
 */
export function createMockContext(params: {
  lagnaSign: number; // 0=Aries .. 11=Pisces
  moonSign: number;
  planets: Array<{
    id: CanonicalBodyId;
    sign: number;
    house: number;
    deg?: number;
    dignity?: DignityState;
    isRetro?: boolean;
    isCombust?: boolean;
    shadbalaRupa?: number;
  }>;
  currentDasha?: { maha?: CanonicalBodyId; antar?: CanonicalBodyId };
}): RuleEvaluationContext {
  const planetMap = new Map<CanonicalBodyId, EvaluatedGrahaState>();

  // Classical zodiac sign lords:
  const signLords: CanonicalBodyId[] = [
    "Mars", // 0: Aries
    "Venus", // 1: Taurus
    "Mercury", // 2: Gemini
    "Moon", // 3: Cancer
    "Sun", // 4: Leo
    "Mercury", // 5: Virgo
    "Venus", // 6: Libra
    "Mars", // 7: Scorpio
    "Jupiter", // 8: Sagittarius
    "Saturn", // 9: Capricorn
    "Saturn", // 10: Aquarius
    "Jupiter", // 11: Pisces
  ];

  for (const p of params.planets) {
    const deg = p.deg ?? 15.0;
    const houseFromMoon = ((p.sign - params.moonSign + 12) % 12) + 1;
    planetMap.set(p.id, {
      id: p.id,
      longitude: p.sign * 30 + deg,
      signIndex: p.sign,
      degreeInSign: deg,
      houseD1: p.house,
      houseChandra: houseFromMoon,
      dignity: p.dignity ?? "neutral",
      isRetrograde: !!p.isRetro,
      isCombust: !!p.isCombust,
      totalShadbalaRupa: p.shadbalaRupa ?? 6.5,
      shadbalaRatio: (p.shadbalaRupa ?? 6.5) / 6.0,
    });
  }

  // Generate 12 houses from Lagna
  const houses: EvaluatedHouseState[] = [];
  for (let h = 1; h <= 12; h++) {
    const signIndex = (params.lagnaSign + (h - 1)) % 12;
    const lord = signLords[signIndex];
    const planetsInHouse = params.planets.filter((p) => p.house === h).map((p) => p.id);

    houses.push({
      houseNumber: h,
      signIndex,
      lord,
      planetsPresent: planetsInHouse,
    });
  }

  return {
    planets: planetMap,
    houses,
    lagnaSignIndex: params.lagnaSign,
    moonSignIndex: params.moonSign,
    currentDashaLords: params.currentDasha,
  };
}

/**
 * Controlled Golden Corpus for Vedic Rule Verification
 */
export const GOLDEN_RULE_VECTORS: GoldenRuleTestCase[] = [
  {
    id: "vector_sri_rama_avatar",
    name: "Classical Hamsa & Ruchaka Vector (Cancer Ascendant)",
    description:
      "Jupiter exalted in 1st (Hamsa), Mars exalted in 7th (Ruchaka), Moon in 1st (Gajakesari).",
    context: createMockContext({
      lagnaSign: 3, // Cancer
      moonSign: 3, // Cancer
      planets: [
        { id: "Jupiter", sign: 3, house: 1, dignity: "exalted", deg: 5.0, shadbalaRupa: 8.5 },
        { id: "Moon", sign: 3, house: 1, dignity: "own", deg: 3.0, shadbalaRupa: 7.2 },
        { id: "Mars", sign: 9, house: 7, dignity: "exalted", deg: 28.0, shadbalaRupa: 7.8 },
        { id: "Sun", sign: 0, house: 10, dignity: "exalted", deg: 10.0, shadbalaRupa: 8.0 },
        { id: "Saturn", sign: 6, house: 4, dignity: "exalted", deg: 20.0, shadbalaRupa: 7.5 },
        { id: "Venus", sign: 11, house: 9, dignity: "exalted", deg: 27.0 },
        { id: "Mercury", sign: 11, house: 9, dignity: "debilitated" },
        { id: "Rahu", sign: 2, house: 12 },
        { id: "Ketu", sign: 8, house: 6 },
      ],
      currentDasha: { maha: "Jupiter", antar: "Mars" },
    }),
    expectedRuleResults: {
      hamsa_mahapurusha: { status: "PRESENT" },
      ruchaka_mahapurusha: { status: "PRESENT" },
      shasha_mahapurusha: { status: "PRESENT" },
      gajakesari_yoga: { status: "PRESENT" },
      bhadra_mahapurusha: { status: "ABSENT" },
      harsha_viparita_yoga: { status: "ABSENT" },
    },
  },

  {
    id: "vector_malavya_bhadra",
    name: "Malavya & Bhadra Vector (Gemini Ascendant)",
    description: "Mercury in 1st house Gemini (Bhadra), Venus in 10th house Pisces (Malavya).",
    context: createMockContext({
      lagnaSign: 2, // Gemini
      moonSign: 11, // Pisces
      planets: [
        { id: "Mercury", sign: 2, house: 1, dignity: "own", deg: 18.0 },
        { id: "Venus", sign: 11, house: 10, dignity: "exalted", deg: 12.0 },
        { id: "Sun", sign: 3, house: 2 },
        { id: "Moon", sign: 11, house: 10 },
        { id: "Mars", sign: 4, house: 3 },
        { id: "Jupiter", sign: 5, house: 4 },
        { id: "Saturn", sign: 7, house: 6 },
        { id: "Rahu", sign: 8, house: 7 },
        { id: "Ketu", sign: 2, house: 1 },
      ],
    }),
    expectedRuleResults: {
      bhadra_mahapurusha: { status: "PRESENT" },
      malavya_mahapurusha: { status: "PRESENT" },
      ruchaka_mahapurusha: { status: "ABSENT" },
      hamsa_mahapurusha: { status: "ABSENT" },
    },
  },

  {
    id: "vector_neechabhanga_raja_yoga",
    name: "Neechabhanga Raja Yoga Vector",
    description:
      "Saturn debilitated in Aries 1st house, Mars (dispositor) in Kendra 10th house Capricorn.",
    context: createMockContext({
      lagnaSign: 0, // Aries
      moonSign: 6, // Libra
      planets: [
        { id: "Saturn", sign: 0, house: 1, dignity: "debilitated", deg: 20.0 },
        { id: "Mars", sign: 9, house: 10, dignity: "exalted", deg: 15.0 }, // Dispositor in 10th (Kendra)
        { id: "Sun", sign: 1, house: 2 },
        { id: "Moon", sign: 6, house: 7 },
        { id: "Mercury", sign: 1, house: 2 },
        { id: "Jupiter", sign: 3, house: 4, dignity: "exalted" },
        { id: "Venus", sign: 11, house: 12, dignity: "exalted" },
        { id: "Rahu", sign: 5, house: 6 },
        { id: "Ketu", sign: 11, house: 12 },
      ],
    }),
    expectedRuleResults: {
      neechabhanga_dispositor_kendra: { status: "PRESENT" },
      ruchaka_mahapurusha: { status: "PRESENT" },
    },
  },

  {
    id: "vector_viparita_raja_yoga",
    name: "Viparita Raja Yoga Vector (Harsha & Sarala)",
    description: "6th lord in 8th house (Harsha), 8th lord in 6th house (Sarala).",
    context: createMockContext({
      lagnaSign: 0, // Aries: 6th lord is Mercury (Virgo), 8th lord is Mars (Scorpio)
      moonSign: 0,
      planets: [
        { id: "Mercury", sign: 7, house: 8 }, // 6th lord Mercury in 8th house -> Harsha!
        { id: "Mars", sign: 5, house: 6 }, // 8th lord Mars in 6th house -> Sarala!
        { id: "Sun", sign: 0, house: 1, dignity: "exalted" },
        { id: "Moon", sign: 0, house: 1 },
        { id: "Jupiter", sign: 8, house: 9, dignity: "own" },
        { id: "Venus", sign: 1, house: 2, dignity: "own" },
        { id: "Saturn", sign: 2, house: 3 },
        { id: "Rahu", sign: 3, house: 4 },
        { id: "Ketu", sign: 9, house: 10 },
      ],
    }),
    expectedRuleResults: {
      harsha_viparita_yoga: { status: "PRESENT" },
      sarala_viparita_yoga: { status: "PRESENT" },
      ruchaka_mahapurusha: { status: "ABSENT" }, // Mars is in 6th, not Kendra
    },
  },

  {
    id: "vector_combustion_cancellation",
    name: "Combustion Mitigation Vector",
    description: "Ruchaka condition met but Mars is within 1.5° of Sun (mitigated/cancelled).",
    context: createMockContext({
      lagnaSign: 0, // Aries
      moonSign: 6,
      planets: [
        { id: "Mars", sign: 0, house: 1, dignity: "own", deg: 10.0, isCombust: true },
        { id: "Sun", sign: 0, house: 1, dignity: "exalted", deg: 11.2 }, // 1.2° separation -> deeply combust
        { id: "Mercury", sign: 0, house: 1, deg: 12.0 },
        { id: "Moon", sign: 6, house: 7 },
        { id: "Jupiter", sign: 8, house: 9 },
        { id: "Venus", sign: 1, house: 2 },
        { id: "Saturn", sign: 10, house: 11 },
        { id: "Rahu", sign: 4, house: 5 },
        { id: "Ketu", sign: 10, house: 11 },
      ],
    }),
    expectedRuleResults: {
      ruchaka_mahapurusha: { status: "PARTIAL" }, // Mitigated by tight combustion
      budhaditya_yoga: { status: "PARTIAL" }, // Sun-Mercury within 0.8° -> mitigated
    },
  },
];
