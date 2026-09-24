import * as Astronomy from "astronomy-engine";
import { CoordinateSelection } from "../types";
import {
  ALL_SHODASHAVARGA_TYPES,
  VARGA_DEFINITIONS,
  VargaEngine,
} from "../kundali/varga/VargaEngine";
import {
  VargaChartResult,
  VargaType,
} from "../kundali/contracts/IVargaEngine";
import { CanonicalBodyId } from "../kundali/astronomy/AstronomicalContext";
import { ShadbalaEngine } from "../kundali/shadbala/ShadbalaEngine";
import { CompleteShadbalaResult } from "../kundali/shadbala/ShadbalaTypes";
import { VimshottariDashaEngine } from "../kundali/dasha/vimshottari/VimshottariDashaEngine";
import { DashaTimeline } from "../kundali/dasha/types/DashaTypes";
import { RuleEngine } from "../kundali/rules/RuleEngine";
import { RuleResult } from "../kundali/rules/RuleTypes";
import { JaiminiEngine } from "../kundali/jaimini/JaiminiEngine";
import { JaiminiProfile } from "../kundali/jaimini/JaiminiTypes";

export type KundliChartType =
  | "d1"
  | "d2"
  | "d3"
  | "d4"
  | "d7"
  | "d9"
  | "d10"
  | "d12"
  | "d16"
  | "d20"
  | "d24"
  | "d27"
  | "d30"
  | "d40"
  | "d45"
  | "d60"
  | "chandra"
  | "surya"
  | "chalit";
export type KundliChartStyle = "north" | "south";

export type PlanetId =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export interface KundliPlanet {
  id: PlanetId;
  nameEn: string;
  nameHi: string;
  nameSa: string;
  symbol: string;
  longitude: number; // 0-360
  signIndex: number; // 0-11
  signNameEn: string;
  signNameHi: string;
  degreeInSign: number; // 0-30
  dms: { deg: number; min: number; sec: number };
  nakshatraNumber: number; // 1-27
  nakshatraNameEn: string;
  nakshatraNameHi: string;
  nakshatraLord: string;
  subLord: string;
  pada: number; // 1-4
  speed: number;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: "exalted" | "moolatrikona" | "own" | "great_friend" | "friend" | "neutral" | "enemy" | "great_enemy" | "debilitated";
  dignityLabelEn: string;
  dignityLabelHi: string;
  jaiminiKaraka?: string;
  houseD1: number; // 1-12
  houseD9: number; // 1-12
  houseChandra: number; // 1-12
  isBenefic: boolean;
}

export interface KundliHouse {
  houseNumber: number; // 1-12
  signIndex: number; // 0-11
  signNameEn: string;
  signNameHi: string;
  lordEn: string;
  lordHi: string;
  planets: KundliPlanet[];
  aspectingPlanets: KundliPlanet[];
  significanceEn: string;
  significanceHi: string;
  nameSanskrit: string;
}

export interface AvakahadaDetails {
  varna: { en: string; hi: string };
  vashya: { en: string; hi: string };
  yoni: { en: string; hi: string; animal: string };
  gana: { en: string; hi: string };
  nadi: { en: string; hi: string };
  tatva: { en: string; hi: string };
  paya: { en: string; hi: string; quality: string };
  rasiLord: { en: string; hi: string };
  nakshatraLord: { en: string; hi: string };
  friendlyRasis: string[];
  luckyGemstone: { en: string; hi: string };
  luckyColor: { en: string; hi: string };
  luckyNumber: number;
  luckyDeity: { en: string; hi: string };
}

export interface VimshottariPratyantardasha {
  planet: PlanetId;
  planetNameHi: string;
  startDate: string;
  endDate: string;
  startMs: number;
  endMs: number;
  durationDays: number;
  isCurrent: boolean;
}

export interface VimshottariAntardasha {
  planet: PlanetId;
  planetNameHi: string;
  startDate: string;
  endDate: string;
  startMs: number;
  endMs: number;
  durationMonths: number;
  isCurrent: boolean;
  pratyantardashas?: VimshottariPratyantardasha[];
}

export interface VimshottariMahadasha {
  planet: PlanetId;
  planetNameHi: string;
  startDate: string;
  endDate: string;
  startMs: number;
  endMs: number;
  durationYears: number;
  isCurrent: boolean;
  antardashas: VimshottariAntardasha[];
}

export interface YogaCombination {
  nameEn: string;
  nameHi: string;
  present: boolean;
  type: "auspicious" | "inauspicious" | "mixed";
  descriptionEn: string;
  descriptionHi: string;
}

export interface DoshaAnalysis {
  manglik: {
    isManglik: boolean;
    severity: "none" | "mild" | "high";
    fromLagna: boolean;
    fromMoon: boolean;
    marsHouseLagna: number;
    marsHouseMoon: number;
    isCancelled: boolean;
    cancellationReasonEn?: string;
    cancellationReasonHi?: string;
    descriptionEn: string;
    descriptionHi: string;
    remedyEn: string;
    remedyHi: string;
  };
  kalsarpa: {
    present: boolean;
    typeEn?: string;
    typeHi?: string;
    descriptionEn: string;
    descriptionHi: string;
    remedyEn: string;
    remedyHi: string;
  };
  sadeSati: {
    status: "none" | "rising" | "peak" | "setting" | "kantaka" | "ashtama";
    statusLabelEn: string;
    statusLabelHi: string;
    currentSaturnSign: string;
    natalMoonSign: string;
    descriptionEn: string;
    descriptionHi: string;
    remedyEn: string;
    remedyHi: string;
  };
  gandanta: {
    isGandanta: boolean;
    type?: string;
    descriptionEn: string;
    descriptionHi: string;
    remedyEn: string;
    remedyHi: string;
  };
}

export interface FullKundliData {
  profile: {
    name: string;
    gender?: string;
    birthDate: string; // YYYY-MM-DD
    birthTime: string; // HH:mm:ss
    birthTimeMs: number;
    cityName: string;
    latitude: number;
    longitude: number;
    timezone: string;
    ayanamsaKey: CoordinateSelection;
    ayanamsaName: string;
    ayanamsaDeg: number;
  };
  lagna: {
    longitude: number;
    signIndex: number;
    signNameEn: string;
    signNameHi: string;
    degreeInSign: number;
    dms: { deg: number; min: number; sec: number };
    nakshatraNumber: number;
    nakshatraNameEn: string;
    nakshatraNameHi: string;
    pada: number;
    lordEn: string;
    lordHi: string;
  };
  navamshaLagna: {
    signIndex: number;
    signNameEn: string;
    signNameHi: string;
  };
  chandraLagna: {
    signIndex: number;
    signNameEn: string;
    signNameHi: string;
  };
  suryaLagna: {
    signIndex: number;
    signNameEn: string;
    signNameHi: string;
  };
  d10Lagna: {
    signIndex: number;
    signNameEn: string;
    signNameHi: string;
  };
  planets: KundliPlanet[];
  housesD1: KundliHouse[];
  housesD9: KundliHouse[];
  housesChandra: KundliHouse[];
  housesSurya: KundliHouse[];
  housesD10: KundliHouse[];
  housesChalit: KundliHouse[];
  shodashavarga?: Record<VargaType, VargaChartResult>;
  vargaHouses?: Record<VargaType, KundliHouse[]>;
  shadbala?: CompleteShadbalaResult;
  avakahada: AvakahadaDetails;
  vimshottari: {
    balanceAtBirth: {
      lord: string;
      years: number;
      months: number;
      days: number;
    };
    dashas: VimshottariMahadasha[];
    currentMahadasha?: VimshottariMahadasha;
    currentAntardasha?: VimshottariAntardasha;
    canonicalTimeline?: DashaTimeline;
  };
  doshas: DoshaAnalysis;
  yogas: YogaCombination[];
  ruleResults?: RuleResult[];
  jaimini?: JaiminiProfile;
}

export const ZODIAC_SIGNS = [
  { id: "aries", en: "Aries", hi: "मेष", sa: "Meṣa", lord: "Mars", element: "fire" },
  { id: "taurus", en: "Taurus", hi: "वृषभ", sa: "Vṛṣabha", lord: "Venus", element: "earth" },
  { id: "gemini", en: "Gemini", hi: "मिथुन", sa: "Mithuna", lord: "Mercury", element: "air" },
  { id: "cancer", en: "Cancer", hi: "कर्क", sa: "Karka", lord: "Moon", element: "water" },
  { id: "leo", en: "Leo", hi: "सिंह", sa: "Siṁha", lord: "Sun", element: "fire" },
  { id: "virgo", en: "Virgo", hi: "कन्या", sa: "Kanyā", lord: "Mercury", element: "earth" },
  { id: "libra", en: "Libra", hi: "तुला", sa: "Tulā", lord: "Venus", element: "air" },
  { id: "scorpio", en: "Scorpio", hi: "वृश्चिक", sa: "Vṛścika", lord: "Mars", element: "water" },
  { id: "sagittarius", en: "Sagittarius", hi: "धनु", sa: "Dhanu", lord: "Jupiter", element: "fire" },
  { id: "capricorn", en: "Capricorn", hi: "मकर", sa: "Makara", lord: "Saturn", element: "earth" },
  { id: "aquarius", en: "Aquarius", hi: "कुम्भ", sa: "Kumbha", lord: "Saturn", element: "air" },
  { id: "pisces", en: "Pisces", hi: "मीन", sa: "Mīna", lord: "Jupiter", element: "water" },
];

export const NAKSHATRAS_LIST = [
  { num: 1, en: "Ashwini", hi: "अश्विनी", lord: "Ketu", yoni: "Ashwa (Horse)", gana: "Deva", nadi: "Adi" },
  { num: 2, en: "Bharani", hi: "भरणी", lord: "Venus", yoni: "Gaja (Elephant)", gana: "Manushya", nadi: "Madhya" },
  { num: 3, en: "Krittika", hi: "कृत्तिका", lord: "Sun", yoni: "Mesha (Sheep)", gana: "Rakshasa", nadi: "Antya" },
  { num: 4, en: "Rohini", hi: "रोहिणी", lord: "Moon", yoni: "Sarpa (Serpent)", gana: "Manushya", nadi: "Antya" },
  { num: 5, en: "Mrigashirsha", hi: "मृगशिरा", lord: "Mars", yoni: "Sarpa (Serpent)", gana: "Deva", nadi: "Madhya" },
  { num: 6, en: "Ardra", hi: "आर्द्रा", lord: "Rahu", yoni: "Shwan (Dog)", gana: "Manushya", nadi: "Adi" },
  { num: 7, en: "Punarvasu", hi: "पुनर्वसु", lord: "Jupiter", yoni: "Marjara (Cat)", gana: "Deva", nadi: "Adi" },
  { num: 8, en: "Pushya", hi: "पुष्य", lord: "Saturn", yoni: "Mesha (Goat)", gana: "Deva", nadi: "Madhya" },
  { num: 9, en: "Ashlesha", hi: "आश्लेषा", lord: "Mercury", yoni: "Marjara (Cat)", gana: "Rakshasa", nadi: "Antya" },
  { num: 10, en: "Magha", hi: "मघा", lord: "Ketu", yoni: "Mushaka (Rat)", gana: "Rakshasa", nadi: "Antya" },
  { num: 11, en: "Purva Phalguni", hi: "पूर्वाफाल्गुनी", lord: "Venus", yoni: "Mushaka (Rat)", gana: "Manushya", nadi: "Madhya" },
  { num: 12, en: "Uttara Phalguni", hi: "उत्तराफाल्गुनी", lord: "Sun", yoni: "Gau (Cow)", gana: "Manushya", nadi: "Adi" },
  { num: 13, en: "Hasta", hi: "हस्त", lord: "Moon", yoni: "Mahisha (Buffalo)", gana: "Deva", nadi: "Adi" },
  { num: 14, en: "Chitra", hi: "चित्रा", lord: "Mars", yoni: "Vyaghra (Tiger)", gana: "Rakshasa", nadi: "Madhya" },
  { num: 15, en: "Swati", hi: "स्वाति", lord: "Rahu", yoni: "Mahisha (Buffalo)", gana: "Deva", nadi: "Antya" },
  { num: 16, en: "Vishakha", hi: "विशाखा", lord: "Jupiter", yoni: "Vyaghra (Tiger)", gana: "Rakshasa", nadi: "Antya" },
  { num: 17, en: "Anuradha", hi: "अनुराधा", lord: "Saturn", yoni: "Mriga (Deer)", gana: "Deva", nadi: "Madhya" },
  { num: 18, en: "Jyeshtha", hi: "ज्येष्ठा", lord: "Mercury", yoni: "Mriga (Deer)", gana: "Rakshasa", nadi: "Adi" },
  { num: 19, en: "Moola", hi: "मूल", lord: "Ketu", yoni: "Shwan (Dog)", gana: "Rakshasa", nadi: "Adi" },
  { num: 20, en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", lord: "Venus", yoni: "Vanara (Monkey)", gana: "Manushya", nadi: "Madhya" },
  { num: 21, en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", lord: "Sun", yoni: "Nakula (Mongoose)", gana: "Manushya", nadi: "Antya" },
  { num: 22, en: "Shravana", hi: "श्रवण", lord: "Moon", yoni: "Vanara (Monkey)", gana: "Deva", nadi: "Antya" },
  { num: 23, en: "Dhanishta", hi: "धनिष्ठा", lord: "Mars", yoni: "Simha (Lion)", gana: "Rakshasa", nadi: "Madhya" },
  { num: 24, en: "Shatabhisha", hi: "शतभिषा", lord: "Rahu", yoni: "Ashwa (Horse)", gana: "Rakshasa", nadi: "Adi" },
  { num: 25, en: "Purva Bhadrapada", hi: "पूर्वभाद्रपद", lord: "Jupiter", yoni: "Simha (Lion)", gana: "Manushya", nadi: "Adi" },
  { num: 26, en: "Uttara Bhadrapada", hi: "उत्तरभाद्रपद", lord: "Saturn", yoni: "Gau (Cow)", gana: "Manushya", nadi: "Madhya" },
  { num: 27, en: "Revati", hi: "रेवती", lord: "Mercury", yoni: "Gaja (Elephant)", gana: "Deva", nadi: "Antya" },
];

export const VIMSHOTTARI_LORDS: { planet: PlanetId; years: number; nameHi: string }[] = [
  { planet: "Ketu", years: 7, nameHi: "केतु" },
  { planet: "Venus", years: 20, nameHi: "शुक्र" },
  { planet: "Sun", years: 6, nameHi: "सूर्य" },
  { planet: "Moon", years: 10, nameHi: "चन्द्र" },
  { planet: "Mars", years: 7, nameHi: "मंगल" },
  { planet: "Rahu", years: 18, nameHi: "राहु" },
  { planet: "Jupiter", years: 16, nameHi: "गुरु" },
  { planet: "Saturn", years: 19, nameHi: "शनि" },
  { planet: "Mercury", years: 17, nameHi: "बुध" },
];

const PLANET_META: Record<
  PlanetId,
  { nameEn: string; nameHi: string; nameSa: string; symbol: string; isBenefic: boolean; astroId?: string }
> = {
  Sun: { nameEn: "Sun", nameHi: "सूर्य", nameSa: "Sūrya", symbol: "☉", isBenefic: false, astroId: "sun" },
  Moon: { nameEn: "Moon", nameHi: "चन्द्र", nameSa: "Candra", symbol: "☽", isBenefic: true, astroId: "moon" },
  Mars: { nameEn: "Mars", nameHi: "मंगल", nameSa: "Maṅgala", symbol: "♂", isBenefic: false, astroId: "mars" },
  Mercury: { nameEn: "Mercury", nameHi: "बुध", nameSa: "Budha", symbol: "☿", isBenefic: true, astroId: "mercury" },
  Jupiter: { nameEn: "Jupiter", nameHi: "गुरु", nameSa: "Guru", symbol: "♃", isBenefic: true, astroId: "jupiter" },
  Venus: { nameEn: "Venus", nameHi: "शुक्र", nameSa: "Śukra", symbol: "♀", isBenefic: true, astroId: "venus" },
  Saturn: { nameEn: "Saturn", nameHi: "शनि", nameSa: "Śani", symbol: "♄", isBenefic: false, astroId: "saturn" },
  Rahu: { nameEn: "Rahu", nameHi: "राहु", nameSa: "Rāhu", symbol: "☊", isBenefic: false, astroId: "rahu" },
  Ketu: { nameEn: "Ketu", nameHi: "केतु", nameSa: "Ketu", symbol: "☋", isBenefic: false, astroId: "ketu" },
  Uranus: { nameEn: "Uranus", nameHi: "अरुण", nameSa: "Harṣala", symbol: "♅", isBenefic: false, astroId: "uranus" },
  Neptune: { nameEn: "Neptune", nameHi: "वरुण", nameSa: "Varuṇa", symbol: "♆", isBenefic: true, astroId: "neptune" },
  Pluto: { nameEn: "Pluto", nameHi: "यम", nameSa: "Yama", symbol: "♇", isBenefic: false, astroId: "pluto" },
};

export const HOUSE_NAMES: {
  en: string;
  hi: string;
  sa: string;
}[] = [
  { en: "1st House (Lagna / Tanu)", hi: "प्रथम भाव (लग्न / तनु भाव)", sa: "Tanu Bhāva" },
  { en: "2nd House (Dhana / Kutumba)", hi: "द्वितीय भाव (धन / कुटुम्ब भाव)", sa: "Dhana Bhāva" },
  { en: "3rd House (Sahaja / Bhratru)", hi: "तृतीय भाव (सहज / भ्रातृ भाव)", sa: "Bhrātṛ Bhāva" },
  { en: "4th House (Sukha / Matru)", hi: "चतुर्थ भाव (सुख / मातृ भाव)", sa: "Mātṛ Bhāva" },
  { en: "5th House (Putra / Vidya)", hi: "पंचम भाव (पुत्र / विद्या भाव)", sa: "Putra Bhāva" },
  { en: "6th House (Ripu / Roga)", hi: "षष्ठ भाव (रिपु / रोग / शत्रु भाव)", sa: "Ripu Bhāva" },
  { en: "7th House (Kalatra / Jaya)", hi: "सप्तम भाव (कलत्र / जाया भाव)", sa: "Jāyā Bhāva" },
  { en: "8th House (Ayu / Randhra)", hi: "अष्टम भाव (आयु / रन्ध्र भाव)", sa: "Randhra Bhāva" },
  { en: "9th House (Bhagya / Dharma)", hi: "नवम भाव (भाग्य / धर्म भाव)", sa: "Bhāgya Bhāva" },
  { en: "10th House (Karma / Rajya)", hi: "दशम भाव (कर्म / राज्य / पिता भाव)", sa: "Karma Bhāva" },
  { en: "11th House (Labha / Aya)", hi: "एकादश भाव (लाभ / आय भाव)", sa: "Lābha Bhāva" },
  { en: "12th House (Vyaya / Moksha)", hi: "द्वादश भाव (व्यय / मोक्ष भाव)", sa: "Vyaya Bhāva" },
];

export const HOUSE_SIGNIFICANCE: {
  en: string;
  hi: string;
}[] = [
  { en: "Self, Physical Body, Personality, Vitality, Outlook", hi: "आत्म, शारीरिक गठन, स्वभाव, आरोग्य, जीवन-दृष्टिकोण" },
  { en: "Wealth, Accumulated Assets, Speech, Family, Food Habits", hi: "धन, पैतृक संपत्ति, वाणी, कुटुम्ब, भोजन की आदतें" },
  { en: "Courage, Siblings, Short Travels, Communication, Hobbies", hi: "पराक्रम, छोटे भाई-बहन, लघु यात्राएं, सम्प्रेषण, कला-कौशल" },
  { en: "Mother, Vehicles, Real Estate, Domestic Peace, Happiness", hi: "माता, वाहन, भूमि-भवन, मानसिक शांति, गृह-सुख" },
  { en: "Intellect, Children, Creativity, Past Karma, Higher Learning", hi: "बुद्धि, संतान, रचनात्मकता, पूर्वजन्म पुण्य, उच्च ज्ञान" },
  { en: "Health, Debts, Enemies, Daily Work, Obstacles, Litigation", hi: "रोग, ऋण, शत्रु, दैनिक श्रम, बाधाएं, प्रतिस्पर्धा" },
  { en: "Spouse, Marriage, Business Partnerships, Public Relations", hi: "जीवनसाथी, विवाह, व्यावसायिक साझेदारी, जनसम्पर्क" },
  { en: "Longevity, Transformation, Occult, Sudden Gains/Losses, Research", hi: "दीर्घायु, गुप्त ज्ञान, आकस्मिक घटनाएं, पैतृक धन, शोध" },
  { en: "Fortune, Dharma, Father, Guru, Long Pilgrimages, Higher Faith", hi: "भाग्य, धर्म, पिता, गुरु कृपा, तीर्थ यात्राएं, सद्बुद्धि" },
  { en: "Career, Profession, Social Status, Authority, Achievements", hi: "आजीविका, व्यवसाय, मान-प्रतिष्ठा, सत्ता, कीर्ति" },
  { en: "Gains, Income, Elder Siblings, Desires Fulfillment, Friends", hi: "समृद्धि, आय के स्रोत, बड़े भाई-बहन, मनोकामना सिद्धि, मित्र" },
  { en: "Expenditures, Foreign Travel, Isolation, Spiritual Liberation", hi: "व्यय, विदेश यात्रा, एकांतवास, निद्रा सुख, मोक्ष" },
];

function normalize360(deg: number): number {
  if (deg === null || deg === undefined || isNaN(deg)) return 0;
  let val = deg % 360;
  if (val < 0) val += 360;
  return ((val % 360) + 360) % 360;
}

function degToDMS(deg: number): { deg: number; min: number; sec: number } {
  if (deg === null || deg === undefined || isNaN(deg)) {
    return { deg: 0, min: 0, sec: 0 };
  }
  const norm = normalize360(deg);
  const d = Math.floor(norm);
  const remMin = (norm - d) * 60;
  const m = Math.floor(remMin);
  const s = Math.round((remMin - m) * 60);
  return { deg: d, min: m, sec: s >= 60 ? 59 : s };
}

export function calculateAyanamsaDegrees(t: Astronomy.AstroTime, key: CoordinateSelection): number {
  if (key === "tropical") return 0.0;
  const ut = t && typeof t.ut === "number" && !isNaN(t.ut) ? t.ut : 0;
  const T = ut / 36525.0;
  const lahiri = 23.857092 + 1.3969713 * T + 0.0003086 * T * T;
  switch (key) {
    case "citra":
      return lahiri;
    case "revati":
      return lahiri - 0.25;
    case "rohini":
      return lahiri + 1.25;
    case "pushya":
      return lahiri - 0.5;
    case "mula":
      return lahiri + 0.75;
    case "krishnamurti":
      return lahiri - 0.0980556;
    case "raman":
      return lahiri - 1.4666667;
    default:
      return lahiri;
  }
}

function calculateMeanObliquity(t: Astronomy.AstroTime): number {
  const ut = t && typeof t.ut === "number" && !isNaN(t.ut) ? t.ut : 0;
  const T = ut / 36525.0;
  return 23.43929111 - ((46.815 + (0.00059 - 0.001813 * T) * T) * T) / 3600.0;
}

function calculateTropicalAscendant(t: Astronomy.AstroTime, lat: number, lon: number): number {
  const safeLat = typeof lat === "number" && !isNaN(lat) ? lat : 28.6139;
  const safeLon = typeof lon === "number" && !isNaN(lon) ? lon : 77.209;
  const gmst = Astronomy.SiderealTime(t);
  const lstHours = (gmst + safeLon / 15.0) % 24;
  const lstRad = lstHours * 15.0 * (Math.PI / 180.0);
  const epsDeg = calculateMeanObliquity(t);
  const epsRad = (epsDeg * Math.PI) / 180.0;
  const latRad = (safeLat * Math.PI) / 180.0;

  const num = Math.cos(lstRad);
  const den = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));

  let ascRad = Math.atan2(num, den);
  if (ascRad < 0) ascRad += 2 * Math.PI;
  return normalize360((ascRad * 180.0) / Math.PI);
}

function getPlanetTropicalLon(body: string, t: Astronomy.AstroTime): number {
  try {
    if (body === "sun") {
      const sunPos = Astronomy.SunPosition(t);
      return sunPos ? normalize360((sunPos as unknown as { elong?: number }).elong ?? 0) : 0;
    }
    if (body === "moon") {
      const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, t, false);
      const moonSph = Astronomy.SphereFromVector(moonGeo);
      return moonSph ? normalize360(moonSph.lon) : 0;
    }
    if (body === "rahu" || body === "ketu") {
      // Mean node of Moon
      const ut = t && typeof t.ut === "number" && !isNaN(t.ut) ? t.ut : 0;
      const T = ut / 36525.0;
      let node = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
      node = normalize360(node);
      return body === "rahu" ? node : normalize360(node + 180);
    }

    const map: Record<string, Astronomy.Body> = {
      mars: Astronomy.Body.Mars,
      mercury: Astronomy.Body.Mercury,
      jupiter: Astronomy.Body.Jupiter,
      venus: Astronomy.Body.Venus,
      saturn: Astronomy.Body.Saturn,
      uranus: Astronomy.Body.Uranus,
      neptune: Astronomy.Body.Neptune,
      pluto: Astronomy.Body.Pluto,
    };

    const astroBody = map[body];
    if (!astroBody) return 0;
    const vec = Astronomy.GeoVector(astroBody, t, false);
    const sph = Astronomy.SphereFromVector(vec);
    return sph ? normalize360(sph.lon) : 0;
  } catch {
    return 0;
  }
}

export function calculateNakshatraInfo(longitude: number): {
  nakshatraNumber: number;
  nakshatraNameEn: string;
  nakshatraNameHi: string;
  nakshatraLord: string;
  pada: number;
  subLord: string;
} {
  const norm = normalize360(longitude);
  const arcPerNak = 360 / 27; // 13.33333333°
  const exactNak = norm / arcPerNak;
  let nakIndex = Math.floor(exactNak);
  if (isNaN(nakIndex) || nakIndex < 0) nakIndex = 0;
  if (nakIndex >= 27) nakIndex = 26;
  const nakMeta = NAKSHATRAS_LIST[nakIndex] || NAKSHATRAS_LIST[0];

  const padaArc = arcPerNak / 4; // 3.33333333°
  let pada = Math.floor((norm % arcPerNak) / padaArc) + 1;
  if (isNaN(pada) || pada < 1) pada = 1;
  if (pada > 4) pada = 4;

  // KP Sublord calculation (Sub-division based on Vimshottari proportion)
  const passedInNak = norm % arcPerNak;
  const fractionInNak = passedInNak / arcPerNak; // 0 to 1
  let accum = 0;
  const rawStartIndex = VIMSHOTTARI_LORDS.findIndex((l) => l.planet === nakMeta.lord);
  const startIndex = rawStartIndex >= 0 ? rawStartIndex : 0;
  let subLord = nakMeta.lord;
  for (let i = 0; i < 9; i++) {
    const lordObj = VIMSHOTTARI_LORDS[(startIndex + i) % 9] || VIMSHOTTARI_LORDS[0];
    const portion = lordObj.years / 120;
    accum += portion;
    if (fractionInNak <= accum) {
      subLord = lordObj.planet;
      break;
    }
  }

  return {
    nakshatraNumber: nakMeta.num,
    nakshatraNameEn: nakMeta.en,
    nakshatraNameHi: nakMeta.hi,
    nakshatraLord: nakMeta.lord,
    pada,
    subLord,
  };
}

export function calculateNavamshaSignIndex(longitude: number): number {
  return VargaEngine.calculatePositionInVarga(longitude, "D9").destinationSignIndex;
}

export function calculateDashamshaSignIndex(longitude: number): number {
  return VargaEngine.calculatePositionInVarga(longitude, "D10").destinationSignIndex;
}

export function getPlanetDignity(
  planetId: PlanetId,
  signIndex: number,
  degInSign: number,
): { dignity: KundliPlanet["dignity"]; labelEn: string; labelHi: string } {
  // Planetary exaltation and debilitation signs:
  // Sun: Exalted Aries (0), Debilitated Libra (6)
  // Moon: Exalted Taurus (1), Debilitated Scorpio (7)
  // Mars: Exalted Capricorn (9), Debilitated Cancer (3)
  // Mercury: Exalted Virgo (5), Debilitated Pisces (11)
  // Jupiter: Exalted Cancer (3), Debilitated Capricorn (9)
  // Venus: Exalted Pisces (11), Debilitated Virgo (5)
  // Saturn: Exalted Libra (6), Debilitated Aries (0)
  // Rahu: Exalted Taurus (1) / Gemini (2), Debilitated Scorpio (7) / Sag (8)
  // Ketu: Exalted Scorpio (7) / Sag (8), Debilitated Taurus (1) / Gemini (2)

  if (planetId === "Sun") {
    if (signIndex === 0) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 6) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 4 && degInSign <= 20) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if (signIndex === 4) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([0, 3, 8, 11].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    if ([2, 5].includes(signIndex)) return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
    return { dignity: "enemy", labelEn: "Inimical (Shatru)", labelHi: "शत्रु" };
  }

  if (planetId === "Moon") {
    if (signIndex === 1 && degInSign <= 3) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 7) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 1) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if (signIndex === 3) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([0, 4].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
  }

  if (planetId === "Mars") {
    if (signIndex === 9) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 3) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 0 && degInSign <= 12) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if ([0, 7].includes(signIndex)) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([3, 4, 8, 11].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    if ([1, 6, 9, 10].includes(signIndex)) return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
    return { dignity: "enemy", labelEn: "Inimical (Shatru)", labelHi: "शत्रु" };
  }

  if (planetId === "Mercury") {
    if (signIndex === 5 && degInSign <= 15) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 11) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 5 && degInSign <= 20) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if ([2, 5].includes(signIndex)) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([4, 6].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    if ([0, 7, 8, 9, 10].includes(signIndex)) return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
    return { dignity: "enemy", labelEn: "Inimical (Shatru)", labelHi: "शत्रु" };
  }

  if (planetId === "Jupiter") {
    if (signIndex === 3) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 9) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 8 && degInSign <= 10) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if ([8, 11].includes(signIndex)) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([0, 4, 7].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    if ([9, 10].includes(signIndex)) return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
    return { dignity: "enemy", labelEn: "Inimical (Shatru)", labelHi: "शत्रु" };
  }

  if (planetId === "Venus") {
    if (signIndex === 11) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 5) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 6 && degInSign <= 15) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if ([1, 6].includes(signIndex)) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([2, 9, 10].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    if ([7, 8, 11].includes(signIndex)) return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
    return { dignity: "enemy", labelEn: "Inimical (Shatru)", labelHi: "शत्रु" };
  }

  if (planetId === "Saturn") {
    if (signIndex === 6) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if (signIndex === 0) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 10 && degInSign <= 20) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if ([9, 10].includes(signIndex)) return { dignity: "own", labelEn: "Own Sign (Sva)", labelHi: "स्वराशि" };
    if ([2, 5, 6].includes(signIndex)) return { dignity: "friend", labelEn: "Friendly (Mitra)", labelHi: "मित्र" };
    if ([8, 11].includes(signIndex)) return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
    return { dignity: "enemy", labelEn: "Inimical (Shatru)", labelHi: "शत्रु" };
  }

  if (planetId === "Rahu") {
    if ([1, 2].includes(signIndex)) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if ([7, 8].includes(signIndex)) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 10) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if (signIndex === 5) return { dignity: "own", labelEn: "Own (Sva)", labelHi: "स्वराशि" };
    return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
  }

  if (planetId === "Ketu") {
    if ([7, 8].includes(signIndex)) return { dignity: "exalted", labelEn: "Exalted (Uchha)", labelHi: "उच्च" };
    if ([1, 2].includes(signIndex)) return { dignity: "debilitated", labelEn: "Debilitated (Neecha)", labelHi: "नीच" };
    if (signIndex === 8) return { dignity: "moolatrikona", labelEn: "Moolatrikona", labelHi: "मूलत्रिकोण" };
    if (signIndex === 11) return { dignity: "own", labelEn: "Own (Sva)", labelHi: "स्वराशि" };
    return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
  }

  return { dignity: "neutral", labelEn: "Neutral (Sama)", labelHi: "सम" };
}

export function computeFullKundli(
  birthDateStr: string, // YYYY-MM-DD
  birthTimeStr: string, // HH:mm or HH:mm:ss
  latitude: number,
  longitude: number,
  timezone: string,
  cityName: string = "Custom Location",
  ayanamsaKey: CoordinateSelection = "citra",
  personName: string = "Jātaka (जातक)",
  gender?: string,
): FullKundliData {
  const safeDateStr = birthDateStr && birthDateStr.includes("-") ? birthDateStr : new Date().toISOString().split("T")[0];
  const dateParts = safeDateStr.split("-").map((n) => parseInt(n, 10));
  const year = isNaN(dateParts[0]) ? 2000 : dateParts[0];
  const month = isNaN(dateParts[1]) || dateParts[1] < 1 || dateParts[1] > 12 ? 1 : dateParts[1];
  const day = isNaN(dateParts[2]) || dateParts[2] < 1 || dateParts[2] > 31 ? 1 : dateParts[2];

  const safeTimeStr = birthTimeStr && birthTimeStr.includes(":") ? birthTimeStr : "12:00:00";
  const timeParts = safeTimeStr.split(":").map((n) => parseInt(n, 10));
  const hour = isNaN(timeParts[0]) || timeParts[0] < 0 || timeParts[0] > 23 ? 12 : timeParts[0];
  const minute = isNaN(timeParts[1]) || timeParts[1] < 0 || timeParts[1] > 59 ? 0 : timeParts[1];
  const second = isNaN(timeParts[2]) || timeParts[2] < 0 || timeParts[2] > 59 ? 0 : timeParts[2];

  const safeLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 28.6139;
  const safeLon = typeof longitude === "number" && !isNaN(longitude) ? longitude : 77.209;
  let safeTz = timezone || "Asia/Kolkata";

  // Convert local wall clock time in timezone to UTC milliseconds safely
  let ms = Date.UTC(year, month - 1, day, hour, minute, second);
  try {
    let formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: safeTz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    for (let i = 0; i < 3; i++) {
      const parts = formatter.formatToParts(new Date(ms));
      const p: Record<string, string> = {};
      parts.forEach((part) => {
        p[part.type] = part.value;
      });
      const fYear = parseInt(p.year, 10);
      const fMonth = parseInt(p.month, 10);
      const fDay = parseInt(p.day, 10);
      let fHour = parseInt(p.hour, 10);
      if (fHour === 24) fHour = 0;
      const fMinute = parseInt(p.minute, 10);
      const fSecond = parseInt(p.second, 10);

      const diff =
        Date.UTC(year, month - 1, day, hour, minute, second) -
        Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute, fSecond);
      if (diff === 0 || isNaN(diff)) break;
      ms += diff;
    }
  } catch {
    safeTz = "Asia/Kolkata";
  }

  const astroTime = Astronomy.MakeTime(new Date(ms));
  const ayanamsaDeg = calculateAyanamsaDegrees(astroTime, ayanamsaKey);

  // 1. Calculate Lagna (Ascendant)
  const tropAsc = calculateTropicalAscendant(astroTime, safeLat, safeLon);
  const siderealAsc = normalize360(tropAsc - ayanamsaDeg);
  let lagnaSignIndex = Math.floor(siderealAsc / 30);
  if (isNaN(lagnaSignIndex) || lagnaSignIndex < 0) lagnaSignIndex = 0;
  lagnaSignIndex = lagnaSignIndex % 12;
  const lagnaDegreeInSign = siderealAsc % 30;
  const lagnaNak = calculateNakshatraInfo(siderealAsc);
  const lagnaSignMeta = ZODIAC_SIGNS[lagnaSignIndex] || ZODIAC_SIGNS[0];

  const lagnaNavamshaSignIndex = calculateNavamshaSignIndex(siderealAsc);

  // 2. Calculate Planets
  const planetDefs: { id: PlanetId; astroKey: string }[] = [
    { id: "Sun", astroKey: "sun" },
    { id: "Moon", astroKey: "moon" },
    { id: "Mars", astroKey: "mars" },
    { id: "Mercury", astroKey: "mercury" },
    { id: "Jupiter", astroKey: "jupiter" },
    { id: "Venus", astroKey: "venus" },
    { id: "Saturn", astroKey: "saturn" },
    { id: "Rahu", astroKey: "rahu" },
    { id: "Ketu", astroKey: "ketu" },
    { id: "Uranus", astroKey: "uranus" },
    { id: "Neptune", astroKey: "neptune" },
    { id: "Pluto", astroKey: "pluto" },
  ];

  const planets: KundliPlanet[] = [];
  let sunLon = 0;

  planetDefs.forEach((pDef) => {
    const tropLon = getPlanetTropicalLon(pDef.astroKey, astroTime);
    const siderealLon = normalize360(tropLon - ayanamsaDeg);
    let signIndex = Math.floor(siderealLon / 30);
    if (isNaN(signIndex) || signIndex < 0) signIndex = 0;
    signIndex = signIndex % 12;
    const degInSign = siderealLon % 30;
    const nakInfo = calculateNakshatraInfo(siderealLon);
    const meta = PLANET_META[pDef.id] || PLANET_META["Sun"];
    const signMeta = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];

    if (pDef.id === "Sun") {
      sunLon = siderealLon;
    }

    // Retrograde detection
    let isRetrograde = false;
    let speed = 1.0;
    if (["Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Uranus", "Neptune", "Pluto"].includes(pDef.id)) {
      const prevAstroTime = Astronomy.MakeTime(new Date(ms - 1000 * 60 * 60 * 2)); // 2 hrs ago
      const prevTrop = getPlanetTropicalLon(pDef.astroKey, prevAstroTime);
      let diff = tropLon - prevTrop;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      speed = diff * 12; // deg per day approx
      isRetrograde = diff < 0;
    } else if (pDef.id === "Rahu" || pDef.id === "Ketu") {
      isRetrograde = true;
      speed = -0.053;
    }

    const { dignity, labelEn: dignityLabelEn, labelHi: dignityLabelHi } = getPlanetDignity(
      pDef.id,
      signIndex,
      degInSign,
    );

    // Calculate Houses
    const houseD1 = ((signIndex - lagnaSignIndex + 12) % 12) + 1;
    const navamshaSign = calculateNavamshaSignIndex(siderealLon);
    const houseD9 = ((navamshaSign - lagnaNavamshaSignIndex + 12) % 12) + 1;

    planets.push({
      id: pDef.id,
      nameEn: meta.nameEn,
      nameHi: meta.nameHi,
      nameSa: meta.nameSa,
      symbol: meta.symbol,
      longitude: siderealLon,
      signIndex,
      signNameEn: signMeta.en,
      signNameHi: signMeta.hi,
      degreeInSign: degInSign,
      dms: degToDMS(degInSign),
      nakshatraNumber: nakInfo.nakshatraNumber,
      nakshatraNameEn: nakInfo.nakshatraNameEn,
      nakshatraNameHi: nakInfo.nakshatraNameHi,
      nakshatraLord: nakInfo.nakshatraLord,
      subLord: nakInfo.subLord,
      pada: nakInfo.pada,
      speed,
      isRetrograde,
      isCombust: false, // Calculated after sunLon is known
      dignity,
      dignityLabelEn,
      dignityLabelHi,
      houseD1,
      houseD9,
      houseChandra: 1, // Will be set after moon is processed
      isBenefic: meta.isBenefic,
    });
  });

  // Calculate Combustion with Sun
  const sunObj = planets.find((p) => p.id === "Sun");
  if (sunObj) {
    planets.forEach((p) => {
      if (p.id !== "Sun" && p.id !== "Rahu" && p.id !== "Ketu") {
        let diff = Math.abs(p.longitude - sunObj.longitude);
        if (diff > 180) diff = 360 - diff;
        const limits: Record<string, number> = {
          Moon: 12,
          Mars: 17,
          Mercury: p.isRetrograde ? 12 : 14,
          Jupiter: 11,
          Venus: p.isRetrograde ? 8 : 10,
          Saturn: 15,
        };
        const limit = limits[p.id] || 0;
        p.isCombust = diff <= limit;
      }
    });
  }

  // Chandra Lagna (Moon sign) and Surya Lagna
  const moonObj = planets.find((p) => p.id === "Moon")!;
  const moonSignIndex = moonObj.signIndex;
  const sunSignIndex = sunObj ? sunObj.signIndex : 0;

  planets.forEach((p) => {
    p.houseChandra = ((p.signIndex - moonSignIndex + 12) % 12) + 1;
  });

  // Calculate Jaimini 7 Karakas (excluding Rahu/Ketu/Outer)
  const classical7 = planets.filter((p) =>
    ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(p.id),
  );
  classical7.sort((a, b) => b.degreeInSign - a.degreeInSign);
  const karakaNames = [
    "Atmakaraka (AK)",
    "Amatyakaraka (AmK)",
    "Bhratrukaraka (BK)",
    "Matrukaraka (MK)",
    "Putrakaraka (PK)",
    "Gnatikaraka (GK)",
    "Darakaraka (DK)",
  ];
  classical7.forEach((p, idx) => {
    p.jaiminiKaraka = karakaNames[idx];
  });

  // 3. Construct 12 Houses for D1, D9, Chandra, Surya, D10, Chalit
  const lagnaD10SignIndex = calculateDashamshaSignIndex(siderealAsc);

  function buildHouses(
    baseSignIndex: number,
    chartType: "d1" | "d9" | "chandra" | "surya" | "d10" | "chalit",
  ): KundliHouse[] {
    const safeBaseSign = isNaN(baseSignIndex) || baseSignIndex < 0 ? 0 : baseSignIndex % 12;
    const houses: KundliHouse[] = [];
    for (let h = 1; h <= 12; h++) {
      const sIndex = (safeBaseSign + h - 1) % 12;
      const sMeta = ZODIAC_SIGNS[sIndex] || ZODIAC_SIGNS[0];
      const hMeta = HOUSE_NAMES[h - 1] || HOUSE_NAMES[0];
      const sigMeta = HOUSE_SIGNIFICANCE[h - 1] || HOUSE_SIGNIFICANCE[0];

      let occupyingPlanets: KundliPlanet[] = [];
      if (chartType === "d1") {
        occupyingPlanets = planets.filter((p) => p.houseD1 === h);
      } else if (chartType === "d9") {
        occupyingPlanets = planets.filter((p) => p.houseD9 === h);
      } else if (chartType === "chandra") {
        occupyingPlanets = planets.filter((p) => p.houseChandra === h);
      } else if (chartType === "surya") {
        occupyingPlanets = planets.filter((p) => ((p.signIndex - sunSignIndex + 12) % 12) + 1 === h);
      } else if (chartType === "d10") {
        occupyingPlanets = planets.filter((p) => {
          const d10Sign = calculateDashamshaSignIndex(p.longitude);
          return ((d10Sign - lagnaD10SignIndex + 12) % 12) + 1 === h;
        });
      } else if (chartType === "chalit") {
        occupyingPlanets = planets.filter((p) => {
          const chalitHouse = (Math.floor(normalize360(p.longitude - siderealAsc + 15) / 30) % 12) + 1;
          return chalitHouse === h;
        });
      }

      // Aspect calculation (Vedic Drishti)
      const aspectingPlanets: KundliPlanet[] = [];
      planets.forEach((p) => {
        const pSign =
          chartType === "d9"
            ? calculateNavamshaSignIndex(p.longitude)
            : chartType === "d10"
              ? calculateDashamshaSignIndex(p.longitude)
              : p.signIndex;
        const distFromPlanet = ((sIndex - pSign + 12) % 12) + 1;

        let hasAspect = false;
        // 7th aspect for all planets
        if (distFromPlanet === 7) hasAspect = true;
        // Mars 4th and 8th
        if (p.id === "Mars" && (distFromPlanet === 4 || distFromPlanet === 8)) hasAspect = true;
        // Jupiter & Rahu/Ketu 5th and 9th
        if (["Jupiter", "Rahu", "Ketu"].includes(p.id) && (distFromPlanet === 5 || distFromPlanet === 9))
          hasAspect = true;
        // Saturn 3rd and 10th
        if (p.id === "Saturn" && (distFromPlanet === 3 || distFromPlanet === 10)) hasAspect = true;

        if (hasAspect && !occupyingPlanets.some((op) => op.id === p.id)) {
          aspectingPlanets.push(p);
        }
      });

      const lordPlanet = planets.find((p) => p.nameEn === sMeta.lord);

      houses.push({
        houseNumber: h,
        signIndex: sIndex,
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

  const housesD1 = buildHouses(lagnaSignIndex, "d1");
  const housesD9 = buildHouses(lagnaNavamshaSignIndex, "d9");
  const housesChandra = buildHouses(moonSignIndex, "chandra");
  const housesSurya = buildHouses(sunSignIndex, "surya");
  const housesD10 = buildHouses(lagnaD10SignIndex, "d10");
  const housesChalit = buildHouses(lagnaSignIndex, "chalit");

  // Canonical Shodashavarga Calculation
  const vargaEngine = new VargaEngine();
  const planetSiderealLons = {} as Record<CanonicalBodyId, number>;
  planets.forEach((p) => {
    planetSiderealLons[p.id as CanonicalBodyId] = p.longitude;
  });
  const shodashavarga = vargaEngine.calculateShodashavarga(siderealAsc, planetSiderealLons);

  // Construct houses for each of the 16 Shodashavarga charts
  const vargaHouses = {} as Record<VargaType, KundliHouse[]>;
  for (const varga of ALL_SHODASHAVARGA_TYPES) {
    const vResult = shodashavarga[varga];
    const vH: KundliHouse[] = [];
    for (let h = 1; h <= 12; h++) {
      const sIndex = (vResult.lagnaSignIndex + h - 1) % 12;
      const sMeta = ZODIAC_SIGNS[sIndex] || ZODIAC_SIGNS[0];
      const hMeta = HOUSE_NAMES[h - 1] || HOUSE_NAMES[0];
      const sigMeta = HOUSE_SIGNIFICANCE[h - 1] || HOUSE_SIGNIFICANCE[0];

      const occupyingPlanets = planets.filter((p) => {
        const vPos = vResult.planets[p.id as CanonicalBodyId];
        return vPos && vPos.houseNumber === h;
      });

      const aspectingPlanets: KundliPlanet[] = [];
      planets.forEach((p) => {
        const vPos = vResult.planets[p.id as CanonicalBodyId];
        if (!vPos) return;
        const distFromPlanet = ((sIndex - vPos.signIndex + 12) % 12) + 1;
        let hasAspect = false;
        if (distFromPlanet === 7) hasAspect = true;
        if (p.id === "Mars" && (distFromPlanet === 4 || distFromPlanet === 8)) hasAspect = true;
        if (["Jupiter", "Rahu", "Ketu"].includes(p.id) && (distFromPlanet === 5 || distFromPlanet === 9))
          hasAspect = true;
        if (p.id === "Saturn" && (distFromPlanet === 3 || distFromPlanet === 10)) hasAspect = true;
        if (hasAspect && !occupyingPlanets.some((op) => op.id === p.id)) {
          aspectingPlanets.push(p);
        }
      });

      const lordPlanet = planets.find((p) => p.nameEn === sMeta.lord);
      vH.push({
        houseNumber: h,
        signIndex: sIndex,
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
    vargaHouses[varga] = vH;
  }

  // 4. Avakahada Chakra Calculation
  const moonNakInfo = calculateNakshatraInfo(moonObj.longitude);
  const moonNakIdx = Math.max(0, Math.min(26, (moonNakInfo.nakshatraNumber || 1) - 1));
  const moonNakMeta = NAKSHATRAS_LIST[moonNakIdx] || NAKSHATRAS_LIST[0];

  // Varna from Moon sign: Cancer, Scorpio, Pisces (Brahmin); Aries, Leo, Sag (Kshatriya); Taurus, Virgo, Cap (Vaishya); Gemini, Libra, Aqu (Shudra)
  let varna = { en: "Shudra", hi: "शूद्र" };
  if ([3, 7, 11].includes(moonSignIndex)) varna = { en: "Brahmin", hi: "ब्राह्मण" };
  else if ([0, 4, 8].includes(moonSignIndex)) varna = { en: "Kshatriya", hi: "क्षत्रिय" };
  else if ([1, 5, 9].includes(moonSignIndex)) varna = { en: "Vaishya", hi: "वैश्य" };

  // Vashya from Moon sign
  let vashya = { en: "Manava (Human)", hi: "मानव / द्विपद" };
  if ([0, 1].includes(moonSignIndex) || (moonSignIndex === 8 && moonObj.degreeInSign >= 15) || (moonSignIndex === 9 && moonObj.degreeInSign < 15)) {
    vashya = { en: "Chatushpada (Quadruped)", hi: "चतुष्पाद" };
  } else if ([3, 11].includes(moonSignIndex) || (moonSignIndex === 9 && moonObj.degreeInSign >= 15)) {
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

  // Paya (Moon House from Lagna)
  // 1, 6, 11 -> Swarna (Gold - Struggle)
  // 2, 5, 9 -> Rajata (Silver - Highly Auspicious)
  // 3, 7, 10 -> Tamra (Copper - Auspicious/Prosperous)
  // 4, 8, 12 -> Loha (Iron - Hard work)
  const moonHouse = moonObj.houseD1;
  let paya = { en: "Tamra (Copper)", hi: "ताम्र", quality: "Auspicious & Steady Growth" };
  if ([1, 6, 11].includes(moonHouse)) paya = { en: "Swarna (Gold)", hi: "स्वर्ण", quality: "Demands Vigilance & Perseverance" };
  else if ([2, 5, 9].includes(moonHouse)) paya = { en: "Rajata (Silver)", hi: "रजत", quality: "Highly Auspicious & Wealth Bestowing" };
  else if ([4, 8, 12].includes(moonHouse)) paya = { en: "Loha (Iron)", hi: "लौह", quality: "Calls for Diligence & Patience" };

  // Lucky Stones & Colors based on Moon Lord and Lagna Lord
  const gemMap: Record<string, { en: string; hi: string; colorEn: string; colorHi: string; num: number; deityEn: string; deityHi: string }> = {
    Sun: { en: "Ruby (Manikya)", hi: "माणिक्य (Ruby)", colorEn: "Saffron / Ruby Red", colorHi: "केसरिया / लाल", num: 1, deityEn: "Lord Shiva / Surya", deityHi: "भगवान शिव / सूर्य देव" },
    Moon: { en: "Pearl (Moti)", hi: "मोती (Pearl)", colorEn: "Pearl White / Cream", colorHi: "दूधिया श्वेत / क्रीम", num: 2, deityEn: "Goddess Parvati", deityHi: "माँ पार्वती / गौरी" },
    Mars: { en: "Red Coral (Moonga)", hi: "मूँगा (Coral)", colorEn: "Crimson Red / Coral", colorHi: "सिंदूरी लाल", num: 9, deityEn: "Lord Kartikeya / Hanuman", deityHi: "श्री हनुमान / कार्तिकेय" },
    Mercury: { en: "Emerald (Panna)", hi: "पन्ना (Emerald)", colorEn: "Emerald Green", colorHi: "पन्ना हरा", num: 5, deityEn: "Lord Vishnu", deityHi: "भगवान श्री हरि विष्णु" },
    Jupiter: { en: "Yellow Sapphire (Pukhraj)", hi: "पुखराज (Yellow Sapphire)", colorEn: "Golden Yellow", colorHi: "पीला / स्वर्णिम", num: 3, deityEn: "Lord Brahma / Brihaspati", deityHi: "भगवान बृहस्पति / ब्रह्मा" },
    Venus: { en: "Diamond / White Sapphire (Heera)", hi: "हीरा / ओपल", colorEn: "Sparkling White / Light Pink", colorHi: "चमकीला श्वेत / गुलाबी", num: 6, deityEn: "Goddess Lakshmi", deityHi: "माँ महालक्ष्मी" },
    Saturn: { en: "Blue Sapphire (Neelam)", hi: "नीलम (Blue Sapphire)", colorEn: "Midnight Navy / Black", colorHi: "गहरा नीला / श्यामल", num: 8, deityEn: "Lord Shani / Bhairava", deityHi: "भगवान शनिदेव / भैरव" },
  };

  const luckyMeta = gemMap[moonNakMeta.lord] || gemMap["Jupiter"];

  const avakahada: AvakahadaDetails = {
    varna,
    vashya,
    yoni: { en: moonNakMeta.yoni, hi: moonNakMeta.yoni, animal: moonNakMeta.yoni.split(" ")[0] },
    gana: { en: moonNakMeta.gana, hi: moonNakMeta.gana === "Deva" ? "देव" : moonNakMeta.gana === "Manushya" ? "मनुष्य" : "राक्षस" },
    nadi: { en: moonNakMeta.nadi, hi: moonNakMeta.nadi === "Adi" ? "आदि" : moonNakMeta.nadi === "Madhya" ? "मध्य" : "अन्त्य" },
    tatva,
    paya,
    rasiLord: { en: (ZODIAC_SIGNS[moonSignIndex] || ZODIAC_SIGNS[0]).lord, hi: (ZODIAC_SIGNS[moonSignIndex] || ZODIAC_SIGNS[0]).lord },
    nakshatraLord: { en: moonNakMeta.lord, hi: moonNakMeta.lord },
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

  // 5. Canonical Vimshottari Dasha Engine (Phase 4)
  const vEngine = new VimshottariDashaEngine();
  const canonicalTimeline = vEngine.calculateTimeline({
    moonSiderealLonDeg: moonObj.longitude,
    birthTimestampMs: ms,
    depthLevels: 3,
  });

  const dashas: VimshottariMahadasha[] = canonicalTimeline.periods.map((maha) => {
    const antardashas: VimshottariAntardasha[] = (maha.children ?? []).map((antar) => {
      const pratyantardashas: VimshottariPratyantardasha[] = (antar.children ?? []).map((prat) => ({
        planet: prat.lord as PlanetId,
        planetNameHi: prat.lordNameHi,
        startDate: prat.startDateIso,
        endDate: prat.endDateIso,
        startMs: prat.startTimestampMs,
        endMs: prat.endTimestampMs,
        durationDays: prat.durationDays,
        isCurrent: !!prat.isCurrent,
      }));

      return {
        planet: antar.lord as PlanetId,
        planetNameHi: antar.lordNameHi,
        startDate: antar.startDateIso,
        endDate: antar.endDateIso,
        startMs: antar.startTimestampMs,
        endMs: antar.endTimestampMs,
        durationMonths: Math.round(((antar.endTimestampMs - antar.startTimestampMs) / (365.2425 * 86400 * 1000) * 12) * 10) / 10,
        isCurrent: !!antar.isCurrent,
        pratyantardashas,
      };
    });

    return {
      planet: maha.lord as PlanetId,
      planetNameHi: maha.lordNameHi,
      startDate: maha.startDateIso,
      endDate: maha.endDateIso,
      startMs: maha.startTimestampMs,
      endMs: maha.endTimestampMs,
      durationYears: Math.round(((maha.endTimestampMs - maha.startTimestampMs) / (365.2425 * 86400 * 1000)) * 10) / 10,
      isCurrent: !!maha.isCurrent,
      antardashas,
    };
  });

  const activeMahadasha = dashas.find((m) => m.isCurrent);
  const activeAntardasha = activeMahadasha?.antardashas.find((a) => a.isCurrent);

  // 6. Dosha Calculations
  // Manglik Dosha: Mars in 1, 2, 4, 7, 8, 12 from Lagna or Moon
  const marsObj = planets.find((p) => p.id === "Mars")!;
  const marsHouseLagna = marsObj.houseD1;
  const marsHouseMoon = marsObj.houseChandra;
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const fromLagna = manglikHouses.includes(marsHouseLagna);
  const fromMoon = manglikHouses.includes(marsHouseMoon);

  // Cancellation rules:
  // Mars in Aries 1st, Scorpio 4th, Capricorn 7th, Leo 8th, Sagittarius 12th
  let isManglikCancelled = false;
  let cancellationReasonEn = "";
  let cancellationReasonHi = "";

  if (fromLagna || fromMoon) {
    if (marsObj.signIndex === 0 && marsHouseLagna === 1) {
      isManglikCancelled = true;
      cancellationReasonEn = "Mars is in own sign Aries in the 1st House (Ruchaka / Sva-rasi cancellation)";
      cancellationReasonHi = "मंगल प्रथम भाव में अपनी स्वराशि मेष में स्थित है (रुचक / स्वराशि अपवाद)";
    } else if (marsObj.signIndex === 7 && marsHouseLagna === 4) {
      isManglikCancelled = true;
      cancellationReasonEn = "Mars is in own sign Scorpio in the 4th House";
      cancellationReasonHi = "मंगल चतुर्थ भाव में अपनी स्वराशि वृश्चिक में स्थित है";
    } else if (marsObj.signIndex === 9 && marsHouseLagna === 7) {
      isManglikCancelled = true;
      cancellationReasonEn = "Mars is exalted in Capricorn in the 7th House";
      cancellationReasonHi = "मंगल सप्तम भाव में अपनी उच्च राशि मकर में स्थित है (उच्च भंग योग)";
    } else if (marsObj.dignity === "exalted") {
      isManglikCancelled = true;
      cancellationReasonEn = "Mars is exalted in the chart";
      cancellationReasonHi = "मंगल कुंडली में उच्च का है, जिससे भौम दोष निष्प्रभावी हो जाता है";
    }
  }

  const isManglik = (fromLagna || fromMoon) && !isManglikCancelled;

  // Kalsarpa Dosha: Check if all 7 planets are contained between Rahu and Ketu
  const rahuObj = planets.find((p) => p.id === "Rahu")!;
  const ketuObj = planets.find((p) => p.id === "Ketu")!;
  const rahuLon = rahuObj.longitude;
  const ketuLon = ketuObj.longitude;

  let allBetweenRahuKetu = true;
  let allBetweenKetuRahu = true;

  classical7.forEach((p) => {
    // Check if planet is in arc from Rahu to Ketu
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
  const kalsarpaNames: { en: string; hi: string }[] = [
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

  const rahuHouse = rahuObj.houseD1;
  const kalsarpaType = kalsarpaNames[(rahuHouse - 1) % 12];

  // Sade Sati Status: Current transit Saturn relative to Natal Moon
  // Current Saturn longitude using nowMs
  const nowAstro = Astronomy.MakeTime(new Date());
  const nowSaturnTrop = getPlanetTropicalLon("saturn", nowAstro);
  const nowSaturnSid = normalize360(nowSaturnTrop - calculateAyanamsaDegrees(nowAstro, ayanamsaKey));
  const nowSaturnSign = Math.floor(nowSaturnSid / 30);

  const saturnHouseFromMoon = ((nowSaturnSign - moonSignIndex + 12) % 12) + 1;
  let sadeSatiStatus: DoshaAnalysis["sadeSati"]["status"] = "none";
  let sadeSatiLabelEn = "No Sade Sati currently active";
  let sadeSatiLabelHi = "वर्तमान में साढ़े साती सक्रिय नहीं है";

  if (saturnHouseFromMoon === 12) {
    sadeSatiStatus = "rising";
    sadeSatiLabelEn = "Sade Sati 1st Phase (Rising Phase - Expenses & Travel)";
    sadeSatiLabelHi = "साढ़े साती प्रथम चरण (उदय चरण - व्यय व मानसिक श्रम)";
  } else if (saturnHouseFromMoon === 1) {
    sadeSatiStatus = "peak";
    sadeSatiLabelEn = "Sade Sati 2nd Phase (Peak Phase / Janma Shani)";
    sadeSatiLabelHi = "साढ़े साती द्वितीय चरण (शिखर चरण - आत्म-परीक्षण व दायित्व)";
  } else if (saturnHouseFromMoon === 2) {
    sadeSatiStatus = "setting";
    sadeSatiLabelEn = "Sade Sati 3rd Phase (Setting Phase / Financial Stabilization)";
    sadeSatiLabelHi = "साढ़े साती तृतीय चरण (अस्त चरण - फल प्राप्ति व स्थायित्व)";
  } else if (saturnHouseFromMoon === 4) {
    sadeSatiStatus = "kantaka";
    sadeSatiLabelEn = "Kantaka Shani / Small Dhaiya (4th from Moon)";
    sadeSatiLabelHi = "कंटक शनि / चतुर्थ ढैय्या";
  } else if (saturnHouseFromMoon === 8) {
    sadeSatiStatus = "ashtama";
    sadeSatiLabelEn = "Ashtama Shani / 8th House Dhaiya";
    sadeSatiLabelHi = "अष्टम शनि / अष्टम ढैय्या";
  }

  // Gandanta Check
  let isGandanta = false;
  let gandantaType = "";
  // Junctions between Water and Fire signs (Revati-Ashwini 360/0, Ashlesha-Magha 120, Jyeshtha-Moola 240)
  const junctions = [0, 120, 240, 360];
  for (const j of junctions) {
    let diff = Math.abs(moonObj.longitude - j);
    if (diff > 180) diff = 360 - diff;
    if (diff <= 0.4444) {
      isGandanta = true;
      gandantaType = "Nakshatra Gandanta";
      break;
    }
  }
  if (moonObj.longitude >= 240 - 1.3333 && moonObj.longitude <= 240 + 1.7777) {
    isGandanta = true;
    gandantaType = "Abhukta Moola (Jyeshtha-Moola Junction)";
  }

  const doshas: DoshaAnalysis = {
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
        ? `Mars is situated in House ${marsHouseLagna} from Lagna and House ${marsHouseMoon} from Moon, indicating Kuja Dosha.`
        : isManglikCancelled
        ? `Kuja Dosha formed by Mars placement is cancelled by classical Vedic rules: ${cancellationReasonEn}.`
        : "Mars is favorably placed in non-Manglik houses.",
      descriptionHi: isManglik
        ? `मंगल लग्न से ${marsHouseLagna}वें भाव एवं चन्द्र से ${marsHouseMoon}वें भाव में स्थित है, जिससे मांगलिक प्रभाव बनता है।`
        : isManglikCancelled
        ? `मांगलिक स्थिति शास्त्रोक्त नियम के अनुसार निष्प्रभावी है: ${cancellationReasonHi}।`
        : "मंगल शुभ व अनुकूल भाव में स्थित है (मांगलिक दोष नहीं है)।",
      remedyEn: "Chanting Hanuman Chalisa, offering red flowers on Tuesday, and practicing mutual patience.",
      remedyHi: "मंगलवार को श्री हनुमान चालीसा का पाठ, लाल चंदन का तिलक, एवं मंगल गायत्री मन्त्र का जप शुभ फलदायी है।",
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
      remedyEn: "Maha Mrityunjaya Japa, Shiva Abhishek with water & milk on Mondays, worship of Lord Subramanya/Naga Devata.",
      remedyHi: "महामृत्युंजय मन्त्र का नित्य जप, सोमवार को शिवलिंग पर जल-दूध का अभिषेक, व नाग पंचमी पर शांति पूजा।",
    },
    sadeSati: {
      status: sadeSatiStatus,
      statusLabelEn: sadeSatiLabelEn,
      statusLabelHi: sadeSatiLabelHi,
      currentSaturnSign: ZODIAC_SIGNS[nowSaturnSign].hi,
      natalMoonSign: ZODIAC_SIGNS[moonSignIndex].hi,
      descriptionEn: `Transiting Saturn is currently in ${ZODIAC_SIGNS[nowSaturnSign].en} (${saturnHouseFromMoon}th from Natal Moon in ${ZODIAC_SIGNS[moonSignIndex].en}).`,
      descriptionHi: `गोचर शनिदेव वर्तमान में ${ZODIAC_SIGNS[nowSaturnSign].hi} राशि में संचरण कर रहे हैं (जन्म चन्द्र ${ZODIAC_SIGNS[moonSignIndex].hi} से ${saturnHouseFromMoon}वें भाव में)।`,
      remedyEn: "Chanting Shani Gayatri or Hanuman Chalisa, lighting mustard oil lamp under Peepal tree on Saturdays, serving the needy.",
      remedyHi: "शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक, दशरथकृत शनि स्तोत्र का पाठ, एवं असहायों की सेवा।",
    },
    gandanta: {
      isGandanta,
      type: gandantaType,
      descriptionEn: isGandanta
        ? `Moon is located at the critical junction of Water and Fire signs (${gandantaType}).`
        : "Moon is safely placed away from Gandanta sandhi points.",
      descriptionHi: isGandanta
        ? `चन्द्रमा जल व अग्नि राशि के संधिकाल पर स्थित है (${gandantaType})।`
        : "चन्द्रमा गंडान्त संधि से मुक्त शुभ क्षेत्र में स्थित है।",
      remedyEn: "Mula Shanti Havana on birth nakshatra day with 27 tree leaves & donation to Brahmins.",
      remedyHi: "जन्म नक्षत्र की आवृति पर मूल शांति पूजा, पंचपल्लव कलश स्नान एवं गौ-दान।",
    },
  };

  // 7. Auspicious Yogas
  const yogas: YogaCombination[] = [];

  // Gajakesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
  const jupObj = planets.find((p) => p.id === "Jupiter")!;
  const jupFromMoon = ((jupObj.signIndex - moonSignIndex + 12) % 12) + 1;
  const isGajakesari = [1, 4, 7, 10].includes(jupFromMoon);
  yogas.push({
    nameEn: "Gajakesari Yoga",
    nameHi: "गजकेसरी योग",
    present: isGajakesari,
    type: "auspicious",
    descriptionEn: isGajakesari
      ? "Jupiter occupies a quadrant (Kendra) from the Moon, blessing the native with wisdom, high respect, moral integrity, and enduring wealth."
      : "Jupiter is not in Kendra from Moon.",
    descriptionHi: isGajakesari
      ? "बृहस्पति चन्द्रमा से केंद्र (१, ४, ७, १०वें भाव) में स्थित है, जो उच्च यश, विद्या, सद्बुद्धि और समाज में प्रतिष्ठा प्रदान करता है।"
      : "बृहस्पति चन्द्र से केंद्र में स्थित नहीं है।",
  });

  // Budhaditya Yoga: Sun and Mercury in the same house
  const mercObj = planets.find((p) => p.id === "Mercury")!;
  const isBudhaditya = sunObj && mercObj && sunObj.signIndex === mercObj.signIndex;
  yogas.push({
    nameEn: "Budhaditya Yoga",
    nameHi: "बुधादित्य योग",
    present: !!isBudhaditya,
    type: "auspicious",
    descriptionEn: isBudhaditya
      ? `Sun and Mercury are conjoined in ${ZODIAC_SIGNS[sunObj.signIndex].en}, conferring sharp intellect, eloquence, analytical prowess, and administrative acumen.`
      : "Sun and Mercury are in separate signs.",
    descriptionHi: isBudhaditya
      ? `सूर्य और बुध एक साथ ${ZODIAC_SIGNS[sunObj.signIndex].hi} राशि में स्थित हैं, जो प्रखर बुद्धि, वाकपटुता एवं प्रशासनिक कुशलता प्रदान करता है।`
      : "सूर्य और बुध भिन्न राशियों में स्थित हैं।",
  });

  // Ruchaka / Pancha Mahapurusha Yogas
  const isRuchaka =
    marsObj.dignity === "exalted" || (marsObj.dignity === "own" && [1, 4, 7, 10].includes(marsObj.houseD1));
  if (isRuchaka) {
    yogas.push({
      nameEn: "Ruchaka Mahapurusha Yoga",
      nameHi: "रुचक महापुरुष योग",
      present: true,
      type: "auspicious",
      descriptionEn: "Mars is in own/exalted sign in a Kendra house, bestowing courage, leadership, victory, and commanding presence.",
      descriptionHi: "मंगल केंद्र भाव में स्वराशि/उच्च का होकर स्थित है, जो अदम्य साहस, नेतृत्व शक्ति एवं विजय प्रदान करता है।",
    });
  }

  const isHamsa =
    jupObj.dignity === "exalted" || (jupObj.dignity === "own" && [1, 4, 7, 10].includes(jupObj.houseD1));
  if (isHamsa) {
    yogas.push({
      nameEn: "Hamsa Mahapurusha Yoga",
      nameHi: "हंस महापुरुष योग",
      present: true,
      type: "auspicious",
      descriptionEn: "Jupiter is exalted or in own sign in Kendra, bestowing righteousness, spiritual nobility, and universal veneration.",
      descriptionHi: "गुरु केंद्र भाव में स्वराशि/उच्च का होकर स्थित है, जो साधु स्वभाव, धर्मपरायणता एवं पूज्यनीय स्थान प्रदान करता है।",
    });
  }

  const isMalavya =
    planets.find((p) => p.id === "Venus")?.dignity === "exalted" ||
    (planets.find((p) => p.id === "Venus")?.dignity === "own" &&
      [1, 4, 7, 10].includes(planets.find((p) => p.id === "Venus")!.houseD1));
  if (isMalavya) {
    yogas.push({
      nameEn: "Malavya Mahapurusha Yoga",
      nameHi: "मालव्य महापुरुष योग",
      present: true,
      type: "auspicious",
      descriptionEn: "Venus is exalted/own sign in Kendra, conferring aesthetic brilliance, material luxuries, attractive persona, and conjugal bliss.",
      descriptionHi: "शुक्र केंद्र भाव में स्वराशि/उच्च का है, जो ऐश्वर्य, कलात्मक प्रतिभा एवं वैवाहिक सुख प्रदान करता है।",
    });
  }

  const isShasha =
    planets.find((p) => p.id === "Saturn")?.dignity === "exalted" ||
    (planets.find((p) => p.id === "Saturn")?.dignity === "own" &&
      [1, 4, 7, 10].includes(planets.find((p) => p.id === "Saturn")!.houseD1));
  if (isShasha) {
    yogas.push({
      nameEn: "Shasha Mahapurusha Yoga",
      nameHi: "शश महापुरुष योग",
      present: true,
      type: "auspicious",
      descriptionEn: "Saturn is exalted/own sign in Kendra, granting perseverance, organizational mastery, mass popularity, and authority.",
      descriptionHi: "शनि केंद्र में उच्च/स्वराशि होकर स्थित है, जो अनुशासन, जनप्रियता एवं दीर्घकालीन अधिकार प्रदान करता है।",
    });
  }

  // Chandra-Mangala Yoga
  const isChandraMangala = moonObj.signIndex === marsObj.signIndex;
  if (isChandraMangala) {
    yogas.push({
      nameEn: "Chandra-Mangala Yoga",
      nameHi: "चन्द्र-मंगल योग",
      present: true,
      type: "auspicious",
      descriptionEn: "Moon and Mars are conjoined, indicating financial enterprise, quick thinking, and resourcefulness.",
      descriptionHi: "चन्द्रमा और मंगल की युति धन उपार्जन, उद्यमशीलता एवं त्वरित निर्णय क्षमता को दर्शाती है।",
    });
  }

  // Guru-Chandal (Inauspicious)
  const isGuruChandal = jupObj.signIndex === rahuObj.signIndex;
  if (isGuruChandal) {
    yogas.push({
      nameEn: "Guru-Chandal Yoga",
      nameHi: "गुरु-चांडाल योग",
      present: true,
      type: "inauspicious",
      descriptionEn: "Jupiter and Rahu are in the same sign, advising caution in spiritual choices and guidance from authentic gurus.",
      descriptionHi: "बृहस्पति और राहु की युति है; गुरुजनों के प्रति निष्ठा एवं विष्णु सहस्रनाम पाठ हितकर है।",
    });
  }

  // 8. Calculate Shadbala and Bhava Bala via ShadbalaEngine
  let shadbala: CompleteShadbalaResult | undefined;
  try {
    const shadbalaEngine = new ShadbalaEngine();
    const siderealLonsMap: Record<CanonicalBodyId, number> = {} as any;
    planets.forEach((p) => {
      siderealLonsMap[p.id as CanonicalBodyId] = p.longitude;
    });
    shadbala = shadbalaEngine.calculateDetailedShadbala(
      siderealLonsMap,
      siderealAsc,
      ms,
      safeLat,
      safeLon,
    );
  } catch (err) {
    console.warn("Shadbala calculation warning:", err);
  }

  // 9. Classical Vedic Rule & Yoga Engine (Phase 5)
  let ruleResults: RuleResult[] = [];
  try {
    const ruleContext = RuleEngine.buildContextFromKundli(
      planets,
      housesD1 as { houseNumber: number; signIndex: number; lord: string; planetsPresent?: string[] }[],
      lagnaSignIndex,
      moonSignIndex,
      shadbala,
      canonicalTimeline,
    );
    const ruleEngine = new RuleEngine();
    ruleResults = ruleEngine.evaluateAll(ruleContext);

    // Merge newly validated classical yogas into yogas list if not already present
    for (const r of ruleResults) {
      if (r.status === "PRESENT" || r.status === "PARTIAL") {
        const alreadyExists = yogas.some(
          (y) =>
            y.nameEn.toLowerCase() === r.nameEn.toLowerCase() ||
            y.nameHi === r.nameHi,
        );
        if (!alreadyExists) {
          yogas.push({
            nameEn: r.nameEn,
            nameHi: r.nameHi,
            present: true,
            type:
              r.category.includes("Arishta") || r.category.includes("Dosha")
                ? "inauspicious"
                : "auspicious",
            descriptionEn: r.descriptionEn,
            descriptionHi: r.descriptionHi,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Rule engine evaluation warning:", err);
  }

  // 9. Classical Jaimini System Profile Calculation
  let jaimini: JaiminiProfile | undefined;
  try {
    const jaiminiEngine = new JaiminiEngine();
    jaimini = jaiminiEngine.calculateJaiminiProfile(
      planets.map((p) => ({
        id: p.id as CanonicalBodyId,
        longitude: p.longitude,
        signIndex: p.signIndex,
        degreeInSign: p.degreeInSign,
        speed: p.speed,
        dignity: p.dignity,
      })),
      housesD1.map((h) => ({
        houseNumber: h.houseNumber,
        signIndex: h.signIndex,
        lord: h.lordEn as CanonicalBodyId,
        lordSignIndex: planets.find((p) => p.id === h.lordEn)?.signIndex ?? h.signIndex,
      })),
      lagnaSignIndex,
      lagnaNavamshaSignIndex,
      planets.map((p) => ({
        id: p.id as CanonicalBodyId,
        signIndex: (p as unknown as { signD9Index?: number }).signD9Index ?? p.signIndex,
      })),
      ms,
    );
  } catch (err) {
    console.warn("Jaimini engine evaluation warning:", err);
  }

  return {
    profile: {
      name: personName,
      gender,
      birthDate: birthDateStr,
      birthTime: birthTimeStr,
      birthTimeMs: ms,
      cityName,
      latitude,
      longitude,
      timezone,
      ayanamsaKey,
      ayanamsaName: ayanamsaKey === "citra" ? "Lahiri (Chitrapaksha)" : ayanamsaKey,
      ayanamsaDeg,
    },
    lagna: {
      longitude: siderealAsc,
      signIndex: lagnaSignIndex,
      signNameEn: lagnaSignMeta.en,
      signNameHi: lagnaSignMeta.hi,
      degreeInSign: lagnaDegreeInSign,
      dms: degToDMS(lagnaDegreeInSign),
      nakshatraNumber: lagnaNak.nakshatraNumber,
      nakshatraNameEn: lagnaNak.nakshatraNameEn,
      nakshatraNameHi: lagnaNak.nakshatraNameHi,
      pada: lagnaNak.pada,
      lordEn: lagnaSignMeta.lord,
      lordHi: lagnaSignMeta.lord,
    },
    navamshaLagna: {
      signIndex: lagnaNavamshaSignIndex,
      signNameEn: ZODIAC_SIGNS[lagnaNavamshaSignIndex].en,
      signNameHi: ZODIAC_SIGNS[lagnaNavamshaSignIndex].hi,
    },
    chandraLagna: {
      signIndex: moonSignIndex,
      signNameEn: ZODIAC_SIGNS[moonSignIndex].en,
      signNameHi: ZODIAC_SIGNS[moonSignIndex].hi,
    },
    suryaLagna: {
      signIndex: sunSignIndex,
      signNameEn: ZODIAC_SIGNS[sunSignIndex].en,
      signNameHi: ZODIAC_SIGNS[sunSignIndex].hi,
    },
    d10Lagna: {
      signIndex: lagnaD10SignIndex,
      signNameEn: ZODIAC_SIGNS[lagnaD10SignIndex].en,
      signNameHi: ZODIAC_SIGNS[lagnaD10SignIndex].hi,
    },
    planets,
    housesD1,
    housesD9,
    housesChandra,
    housesSurya,
    housesD10,
    housesChalit,
    shodashavarga,
    vargaHouses,
    shadbala,
    avakahada,
    vimshottari: {
      balanceAtBirth: {
        lord: canonicalTimeline.balanceAtBirth.lord,
        years: canonicalTimeline.balanceAtBirth.years,
        months: canonicalTimeline.balanceAtBirth.months,
        days: canonicalTimeline.balanceAtBirth.days,
      },
      dashas,
      currentMahadasha: activeMahadasha,
      currentAntardasha: activeAntardasha,
      canonicalTimeline,
    },
    doshas,
    yogas,
    ruleResults,
    jaimini,
  };
}
