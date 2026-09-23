import { CanonicalBodyId, CLASSICAL_NAVAGRAHA } from "../astronomy/AstronomicalContext";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";
import {
  IVargaEngine,
  VargaChartResult,
  VargaPlanetPosition,
  VargaType,
} from "../contracts/IVargaEngine";

/**
 * Metadata for the Classical BPHS Shodashavarga Algorithm
 */
export const VARGA_ENGINE_METADATA: RepositoryMetadata = {
  repositoryName: "Mahavtaar Jyotish Core",
  repositoryUrl: "internal://mahavtaar/kundli/varga",
  commitOrVersion: "2.0.0-parashara",
  license: "Proprietary",
  sourceFilePath: "src/kundali/varga/VargaEngine.ts",
  classicalTextReference: "Brihat Parashara Hora Shastra (BPHS)",
  shlokaReference: "Adhyaya 6 (Shodashavargadhyaya), Shlokas 1-42",
  adaptationNotes:
    "Direct algorithmic implementation of classical Parashari Shodashavarga using full internal 64-bit IEEE 754 precision with deterministic boundary resolution.",
};

export interface VargaDefinition {
  type: VargaType;
  divisionFactor: number;
  nameEn: string;
  nameSa: string;
  significanceEn: string;
}

export const VARGA_DEFINITIONS: Record<VargaType, VargaDefinition> = {
  D1: {
    type: "D1",
    divisionFactor: 1,
    nameEn: "Rashi",
    nameSa: "राशि",
    significanceEn: "Physical body, constitution, general vitality and destiny",
  },
  D2: {
    type: "D2",
    divisionFactor: 2,
    nameEn: "Hora",
    nameSa: "होरा",
    significanceEn: "Wealth, treasury, speech, prosperity and family resources",
  },
  D3: {
    type: "D3",
    divisionFactor: 3,
    nameEn: "Drekkana",
    nameSa: "द्रेष्काण",
    significanceEn: "Siblings, vitality, energy, initiative and courage",
  },
  D4: {
    type: "D4",
    divisionFactor: 4,
    nameEn: "Chaturthamsha",
    nameSa: "चतुर्थांश",
    significanceEn: "Fixed assets, home, land, immovable property and fortune",
  },
  D7: {
    type: "D7",
    divisionFactor: 7,
    nameEn: "Saptamsha",
    nameSa: "सप्तांश",
    significanceEn: "Children, progeny, grandchildren, lineage and creative power",
  },
  D9: {
    type: "D9",
    divisionFactor: 9,
    nameEn: "Navamsha",
    nameSa: "नवांश",
    significanceEn: "Dharma, spouse, matrimonial harmony and soul purpose",
  },
  D10: {
    type: "D10",
    divisionFactor: 10,
    nameEn: "Dashamsha",
    nameSa: "दशांश",
    significanceEn: "Career, profession, social status, fame and public achievements",
  },
  D12: {
    type: "D12",
    divisionFactor: 12,
    nameEn: "Dwadashamsha",
    nameSa: "द्वादशांश",
    significanceEn: "Parents, maternal and paternal lineage, ancestral karma",
  },
  D16: {
    type: "D16",
    divisionFactor: 16,
    nameEn: "Shodashamsha",
    nameSa: "षोडशांश",
    significanceEn: "Conveyances, vehicles, comforts, pleasures and mental happiness",
  },
  D20: {
    type: "D20",
    divisionFactor: 20,
    nameEn: "Vimshamsha",
    nameSa: "विंशांश",
    significanceEn: "Spiritual progress, religious devotion, upasana and mantra siddhi",
  },
  D24: {
    type: "D24",
    divisionFactor: 24,
    nameEn: "Chaturvimshamsha",
    nameSa: "चतुर्विंशांश",
    significanceEn: "Higher learning, intellect, academic wisdom and knowledge skills",
  },
  D27: {
    type: "D27",
    divisionFactor: 27,
    nameEn: "Saptavimshamsha",
    nameSa: "सप्तविंशांश",
    significanceEn: "Physical stamina, subconscious strengths and vital endurance",
  },
  D30: {
    type: "D30",
    divisionFactor: 30,
    nameEn: "Trimshamsha",
    nameSa: "त्रिंशांश",
    significanceEn: "Misfortunes, evils, enemies, chronic ailments and moral challenges",
  },
  D40: {
    type: "D40",
    divisionFactor: 40,
    nameEn: "Khavedamsha",
    nameSa: "खवेदांश",
    significanceEn: "Auspicious and inauspicious events, maternal ancestry karma",
  },
  D45: {
    type: "D45",
    divisionFactor: 45,
    nameEn: "Akshavedamsha",
    nameSa: "अक्षवेदांश",
    significanceEn: "Moral integrity, character purity and general auspiciousness",
  },
  D60: {
    type: "D60",
    divisionFactor: 60,
    nameEn: "Shashtiamsha",
    nameSa: "षष्ट्यंश",
    significanceEn: "Minute past-life karma, subtle destiny and root causes of existence",
  },
};

export const ALL_SHODASHAVARGA_TYPES: VargaType[] = [
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

export const SHASHTIAMSHA_DEITIES: { name: string; isBenefic: boolean }[] = [
  { name: "Ghora", isBenefic: false },
  { name: "Rakshasa", isBenefic: false },
  { name: "Deva", isBenefic: true },
  { name: "Kubera", isBenefic: true },
  { name: "Yaksha", isBenefic: true },
  { name: "Kinnara", isBenefic: true },
  { name: "Bhrashta", isBenefic: false },
  { name: "Kulaghna", isBenefic: false },
  { name: "Garala", isBenefic: false },
  { name: "Vahni", isBenefic: false },
  { name: "Maya", isBenefic: false },
  { name: "Purishaka", isBenefic: false },
  { name: "Apampati", isBenefic: true },
  { name: "Marutvana", isBenefic: true },
  { name: "Kala", isBenefic: false },
  { name: "Sarpa", isBenefic: false },
  { name: "Amrita", isBenefic: true },
  { name: "Indu", isBenefic: true },
  { name: "Mridu", isBenefic: true },
  { name: "Komala", isBenefic: true },
  { name: "Heramba", isBenefic: true },
  { name: "Brahma", isBenefic: true },
  { name: "Vishnu", isBenefic: true },
  { name: "Maheshwara", isBenefic: true },
  { name: "Deva", isBenefic: true },
  { name: "Ardra", isBenefic: true },
  { name: "Kalinasa", isBenefic: true },
  { name: "Kshiteesha", isBenefic: true },
  { name: "Kamalakar", isBenefic: true },
  { name: "Gulika", isBenefic: false },
  { name: "Mrityu", isBenefic: false },
  { name: "Kala", isBenefic: false },
  { name: "Davagni", isBenefic: false },
  { name: "Ghora", isBenefic: false },
  { name: "Yama", isBenefic: false },
  { name: "Kantaka", isBenefic: false },
  { name: "Sudha", isBenefic: true },
  { name: "Amrita", isBenefic: true },
  { name: "Poornachandra", isBenefic: true },
  { name: "Vishadagdha", isBenefic: false },
  { name: "Kulanasa", isBenefic: false },
  { name: "Vamshakshaya", isBenefic: false },
  { name: "Utpata", isBenefic: false },
  { name: "Kala", isBenefic: false },
  { name: "Saumya", isBenefic: true },
  { name: "Komala", isBenefic: true },
  { name: "Sheetala", isBenefic: true },
  { name: "Karaladamshtra", isBenefic: false },
  { name: "Chandramukhi", isBenefic: true },
  { name: "Praveena", isBenefic: true },
  { name: "Kalapavaka", isBenefic: false },
  { name: "Dandayudha", isBenefic: false },
  { name: "Nirmala", isBenefic: true },
  { name: "Saumya", isBenefic: true },
  { name: "Krura", isBenefic: false },
  { name: "Atisheetala", isBenefic: true },
  { name: "Amrita", isBenefic: true },
  { name: "Payodhi", isBenefic: true },
  { name: "Bhramana", isBenefic: false },
  { name: "Chandrarekha", isBenefic: true },
];

/**
 * Result of calculating a single planetary position in a specific Varga
 */
export interface SingleVargaCalculationResult {
  varga: VargaType;
  longitude: number;
  sourceSignIndex: number;
  sourceDegInSign: number;
  destinationSignIndex: number;
  degreeInVarga: number;
  partIndex: number;
  deityName?: string;
  isBeneficDeity?: boolean;
}

/**
 * Normalizes longitude to [0, 360) with extreme numerical stability
 */
export function normalize360(deg: number): number {
  let val = deg % 360;
  if (val < 0) val += 360;
  // Handle edge case where 359.99999999999994 rounds up to 360
  if (val >= 360) val = 0;
  return val;
}

/**
 * Canonical Shodashavarga Calculation Engine
 */
export class VargaEngine implements IVargaEngine {
  public readonly metadata: RepositoryMetadata = VARGA_ENGINE_METADATA;

  /**
   * Computes position of a single celestial body or cusp in any of the 16 Shodashavargas
   */
  public static calculatePositionInVarga(
    longitude: number,
    varga: VargaType,
  ): SingleVargaCalculationResult {
    const norm = normalize360(longitude);
    const sourceSignIndex = Math.floor(norm / 30) % 12;
    const sourceDegInSign = norm - sourceSignIndex * 30;

    // Numerical safeguard against float precision edge boundary
    const degInSign = Math.max(0, Math.min(29.99999999999999, sourceDegInSign));
    const isOddSign = sourceSignIndex % 2 === 0; // 0=Aries (odd sign)
    const modality = sourceSignIndex % 3; // 0=Movable (Chara), 1=Fixed (Sthira), 2=Dual (Dvisvabhava)
    const triplicity = sourceSignIndex % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water

    let destinationSignIndex = 0;
    let degreeInVarga = 0;
    let partIndex = 0;
    let deityName: string | undefined;
    let isBeneficDeity: boolean | undefined;

    switch (varga) {
      case "D1": {
        destinationSignIndex = sourceSignIndex;
        degreeInVarga = degInSign;
        partIndex = 0;
        break;
      }

      case "D2": {
        // Hora: 15° each. Odd: Leo (4), Cancer (3). Even: Cancer (3), Leo (4)
        partIndex = degInSign < 15 ? 0 : 1;
        if (isOddSign) {
          destinationSignIndex = partIndex === 0 ? 4 : 3;
        } else {
          destinationSignIndex = partIndex === 0 ? 3 : 4;
        }
        degreeInVarga = ((degInSign - partIndex * 15) / 15) * 30;
        deityName = destinationSignIndex === 4 ? "Surya (Sun/Pitrus)" : "Chandra (Moon/Devas)";
        isBeneficDeity = true;
        break;
      }

      case "D3": {
        // Drekkana: 10° each. 1st, 5th, 9th
        partIndex = Math.min(2, Math.floor(degInSign / 10));
        const shift = partIndex === 0 ? 0 : partIndex === 1 ? 4 : 8;
        destinationSignIndex = (sourceSignIndex + shift) % 12;
        degreeInVarga = ((degInSign - partIndex * 10) / 10) * 30;
        const drekkanaDeities = ["Narada (Deva)", "Agastya (Manushya)", "Durvasa (Rakshasa)"];
        deityName = drekkanaDeities[partIndex];
        isBeneficDeity = partIndex !== 2;
        break;
      }

      case "D4": {
        // Chaturthamsha: 7.5° each. Kendras (1st, 4th, 7th, 10th from sign)
        const arcSpan = 7.5;
        partIndex = Math.min(3, Math.floor(degInSign / arcSpan));
        const shift = partIndex * 3;
        destinationSignIndex = (sourceSignIndex + shift) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const kumaras = ["Sanaka", "Sanandana", "Sanatkumara", "Sanatana"];
        deityName = kumaras[partIndex];
        isBeneficDeity = true;
        break;
      }

      case "D7": {
        // Saptamsha: 30/7° each. Odd: from sign itself. Even: from 7th sign (+6)
        const arcSpan = 30 / 7;
        partIndex = Math.min(6, Math.floor(degInSign / arcSpan));
        const startOffset = isOddSign ? 0 : 6;
        destinationSignIndex = (sourceSignIndex + startOffset + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const oceans = [
          "Kshara (Salt)",
          "Ksheera (Milk)",
          "Dadhi (Curd)",
          "Ghrita (Ghee)",
          "Ikshu-rasa (Cane)",
          "Madhu (Honey)",
          "Shuddha-jala (Pure)",
        ];
        deityName = oceans[partIndex];
        isBeneficDeity = true;
        break;
      }

      case "D9": {
        // Navamsha: 3°20' each. Movable from self, Fixed from 9th (+8), Dual from 5th (+4)
        const arcSpan = 30 / 9;
        partIndex = Math.min(8, Math.floor(degInSign / arcSpan));
        let startNavamsha = 0;
        if (triplicity === 0)
          startNavamsha = 0; // Fire -> Aries (0)
        else if (triplicity === 1)
          startNavamsha = 9; // Earth -> Capricorn (9)
        else if (triplicity === 2)
          startNavamsha = 6; // Air -> Libra (6)
        else startNavamsha = 3; // Water -> Cancer (3)

        destinationSignIndex = (startNavamsha + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const navamshaGanas = ["Deva", "Nara (Manushya)", "Rakshasa"];
        deityName = navamshaGanas[partIndex % 3];
        isBeneficDeity = partIndex % 3 !== 2;
        break;
      }

      case "D10": {
        // Dashamsha: 3° each. Odd: from self (+0). Even: from 9th (+8)
        const arcSpan = 3.0;
        partIndex = Math.min(9, Math.floor(degInSign / arcSpan));
        const startOffset = isOddSign ? 0 : 8;
        destinationSignIndex = (sourceSignIndex + startOffset + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const digpalas = [
          "Indra",
          "Agni",
          "Yama",
          "Nirriti",
          "Varuna",
          "Vayu",
          "Kubera",
          "Ishana",
          "Brahma",
          "Ananta",
        ];
        deityName = digpalas[partIndex];
        isBeneficDeity = !["Yama", "Nirriti"].includes(digpalas[partIndex]);
        break;
      }

      case "D12": {
        // Dwadashamsha: 2.5° each. Continuous counting from sign itself (+0)
        const arcSpan = 2.5;
        partIndex = Math.min(11, Math.floor(degInSign / arcSpan));
        destinationSignIndex = (sourceSignIndex + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const d12Deities = ["Ganesha", "Ashwini Kumaras", "Yama", "Sarpa"];
        deityName = d12Deities[partIndex % 4];
        isBeneficDeity = partIndex % 4 === 0 || partIndex % 4 === 1;
        break;
      }

      case "D16": {
        // Shodashamsha: 1.875° each. Chara -> Aries (0), Sthira -> Leo (4), Dvisvabhava -> Sag (8)
        const arcSpan = 30 / 16;
        partIndex = Math.min(15, Math.floor(degInSign / arcSpan));
        let startSign = 0;
        if (modality === 0) startSign = 0;
        else if (modality === 1) startSign = 4;
        else startSign = 8;

        destinationSignIndex = (startSign + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const d16Deities = ["Brahma", "Vishnu", "Shiva", "Surya"];
        deityName = d16Deities[partIndex % 4];
        isBeneficDeity = true;
        break;
      }

      case "D20": {
        // Vimshamsha: 1.5° each. Chara -> Aries (0), Sthira -> Sag (8), Dvisvabhava -> Leo (4)
        const arcSpan = 1.5;
        partIndex = Math.min(19, Math.floor(degInSign / arcSpan));
        let startSign = 0;
        if (modality === 0) startSign = 0;
        else if (modality === 1) startSign = 8;
        else startSign = 4;

        destinationSignIndex = (startSign + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const d20Deities = [
          "Kali",
          "Gauri",
          "Jaya",
          "Vijaya",
          "Vimala",
          "Mangala",
          "Jwalamukhi",
          "Tara",
          "Bhadrakali",
          "Shulini",
          "Shubha",
          "Dooti",
          "Karali",
          "Kampini",
          "Bhairavi",
          "Vasudha",
          "Padma",
          "Jwala",
          "Mohini",
          "Shripa",
        ];
        deityName = d20Deities[partIndex];
        isBeneficDeity = true;
        break;
      }

      case "D24": {
        // Chaturvimshamsha: 1.25° each. Odd -> Leo (4), Even -> Cancer (3)
        const arcSpan = 1.25;
        partIndex = Math.min(23, Math.floor(degInSign / arcSpan));
        const startSign = isOddSign ? 4 : 3;
        destinationSignIndex = (startSign + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const d24Deities = ["Skanda", "Parashudhara", "Anala", "Vishwakarma"];
        deityName = d24Deities[partIndex % 4];
        isBeneficDeity = true;
        break;
      }

      case "D27": {
        // Saptavimshamsha / Bhamsa: 30/27° each. Fire -> Aries (0), Earth -> Cancer (3), Air -> Libra (6), Water -> Cap (9)
        const arcSpan = 30 / 27;
        partIndex = Math.min(26, Math.floor(degInSign / arcSpan));
        let startSign = 0;
        if (triplicity === 0)
          startSign = 0; // Aries
        else if (triplicity === 1)
          startSign = 3; // Cancer
        else if (triplicity === 2)
          startSign = 6; // Libra
        else startSign = 9; // Capricorn

        destinationSignIndex = (startSign + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        deityName = `Bhamsha-${partIndex + 1}`;
        isBeneficDeity = true;
        break;
      }

      case "D30": {
        // Trimshamsha: 5 unequal planetary bounds
        // Odd: Mars (0-5°: Aries 0), Sat (5-10°: Aqu 10), Jup (10-18°: Sag 8), Merc (18-25°: Gem 2), Ven (25-30°: Lib 6)
        // Even: Ven (0-5°: Tau 1), Merc (5-12°: Vir 5), Jup (12-20°: Pis 11), Sat (20-25°: Cap 9), Mars (25-30°: Sco 7)
        let boundStart = 0;
        let boundSpan = 5;

        if (isOddSign) {
          if (degInSign < 5) {
            destinationSignIndex = 0; // Aries (Mars)
            boundStart = 0;
            boundSpan = 5;
            partIndex = 0;
            deityName = "Agni (Mars)";
            isBeneficDeity = false;
          } else if (degInSign < 10) {
            destinationSignIndex = 10; // Aquarius (Saturn)
            boundStart = 5;
            boundSpan = 5;
            partIndex = 1;
            deityName = "Vayu (Saturn)";
            isBeneficDeity = false;
          } else if (degInSign < 18) {
            destinationSignIndex = 8; // Sagittarius (Jupiter)
            boundStart = 10;
            boundSpan = 8;
            partIndex = 2;
            deityName = "Indra (Jupiter)";
            isBeneficDeity = true;
          } else if (degInSign < 25) {
            destinationSignIndex = 2; // Gemini (Mercury)
            boundStart = 18;
            boundSpan = 7;
            partIndex = 3;
            deityName = "Prithvi (Mercury)";
            isBeneficDeity = true;
          } else {
            destinationSignIndex = 6; // Libra (Venus)
            boundStart = 25;
            boundSpan = 5;
            partIndex = 4;
            deityName = "Varuna (Venus)";
            isBeneficDeity = true;
          }
        } else {
          if (degInSign < 5) {
            destinationSignIndex = 1; // Taurus (Venus)
            boundStart = 0;
            boundSpan = 5;
            partIndex = 0;
            deityName = "Varuna (Venus)";
            isBeneficDeity = true;
          } else if (degInSign < 12) {
            destinationSignIndex = 5; // Virgo (Mercury)
            boundStart = 5;
            boundSpan = 7;
            partIndex = 1;
            deityName = "Prithvi (Mercury)";
            isBeneficDeity = true;
          } else if (degInSign < 20) {
            destinationSignIndex = 11; // Pisces (Jupiter)
            boundStart = 12;
            boundSpan = 8;
            partIndex = 2;
            deityName = "Indra (Jupiter)";
            isBeneficDeity = true;
          } else if (degInSign < 25) {
            destinationSignIndex = 9; // Capricorn (Saturn)
            boundStart = 20;
            boundSpan = 5;
            partIndex = 3;
            deityName = "Vayu (Saturn)";
            isBeneficDeity = false;
          } else {
            destinationSignIndex = 7; // Scorpio (Mars)
            boundStart = 25;
            boundSpan = 5;
            partIndex = 4;
            deityName = "Agni (Mars)";
            isBeneficDeity = false;
          }
        }
        degreeInVarga = ((degInSign - boundStart) / boundSpan) * 30;
        break;
      }

      case "D40": {
        // Khavedamsha: 0.75° each. Odd -> Aries (0), Even -> Libra (6)
        const arcSpan = 0.75;
        partIndex = Math.min(39, Math.floor(degInSign / arcSpan));
        const startSign = isOddSign ? 0 : 6;
        destinationSignIndex = (startSign + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const d40Deities = ["Vishnu", "Chandra", "Marichi", "Tvashita"];
        deityName = d40Deities[partIndex % 4];
        isBeneficDeity = true;
        break;
      }

      case "D45": {
        // Akshavedamsha: 30/45° (40 arcmin) each. Chara -> Aries (0), Sthira -> Leo (4), Dvisvabhava -> Sag (8)
        const arcSpan = 30 / 45;
        partIndex = Math.min(44, Math.floor(degInSign / arcSpan));
        let startSign = 0;
        if (modality === 0) startSign = 0;
        else if (modality === 1) startSign = 4;
        else startSign = 8;

        destinationSignIndex = (startSign + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;
        const trinity = ["Brahma", "Shiva", "Vishnu"];
        deityName = trinity[partIndex % 3];
        isBeneficDeity = true;
        break;
      }

      case "D60": {
        // Shashtiamsha: 0.5° (30 arcmin) each. Continuous counting from sign itself (+0)
        const arcSpan = 0.5;
        partIndex = Math.min(59, Math.floor(degInSign / arcSpan));
        destinationSignIndex = (sourceSignIndex + partIndex) % 12;
        degreeInVarga = ((degInSign - partIndex * arcSpan) / arcSpan) * 30;

        // Classical BPHS deity lookup (odd sign direct 0-59, even sign reverse 59-0)
        const deityIndex = isOddSign ? partIndex : 59 - partIndex;
        const d60 = SHASHTIAMSHA_DEITIES[deityIndex] || SHASHTIAMSHA_DEITIES[0];
        deityName = d60.name;
        isBeneficDeity = d60.isBenefic;
        break;
      }
    }

    // Ensure degree in varga is strictly within [0, 30)
    degreeInVarga = Math.max(0, Math.min(29.99999999999999, degreeInVarga));

    return {
      varga,
      longitude: norm,
      sourceSignIndex,
      sourceDegInSign,
      destinationSignIndex,
      degreeInVarga,
      partIndex,
      deityName,
      isBeneficDeity,
    };
  }

  /**
   * Calculates a full VargaChartResult for a given VargaType
   */
  public calculateVarga(
    varga: VargaType,
    lagnaSiderealLon: number,
    planetSiderealLons: Record<CanonicalBodyId, number>,
  ): VargaChartResult {
    const def = VARGA_DEFINITIONS[varga];
    const lagnaPos = VargaEngine.calculatePositionInVarga(lagnaSiderealLon, varga);
    const lagnaSignIndex = lagnaPos.destinationSignIndex;

    const planets = {} as Record<CanonicalBodyId, VargaPlanetPosition>;
    const vargaLordNames: Record<CanonicalBodyId, string> = {};

    for (const bodyId of CLASSICAL_NAVAGRAHA) {
      const lon = planetSiderealLons[bodyId];
      if (typeof lon === "number" && !isNaN(lon)) {
        const pos = VargaEngine.calculatePositionInVarga(lon, varga);
        const houseNumber = ((pos.destinationSignIndex - lagnaSignIndex + 12) % 12) + 1;

        planets[bodyId] = {
          planet: bodyId,
          signIndex: pos.destinationSignIndex,
          degreeInSign: pos.degreeInVarga,
          houseNumber,
        };

        if (pos.deityName) {
          vargaLordNames[bodyId] = pos.deityName;
        }
      }
    }

    return {
      varga,
      divisionFactor: def.divisionFactor,
      nameEn: def.nameEn,
      nameSa: def.nameSa,
      lagnaSignIndex,
      planets,
      vargaLordNames: Object.keys(vargaLordNames).length > 0 ? vargaLordNames : undefined,
    };
  }

  /**
   * Computes all 16 Shodashavarga charts simultaneously from canonical positions
   */
  public calculateShodashavarga(
    lagnaSiderealLon: number,
    planetSiderealLons: Record<CanonicalBodyId, number>,
  ): Record<VargaType, VargaChartResult> {
    const results = {} as Record<VargaType, VargaChartResult>;

    for (const varga of ALL_SHODASHAVARGA_TYPES) {
      results[varga] = this.calculateVarga(varga, lagnaSiderealLon, planetSiderealLons);
    }

    return results;
  }
}
