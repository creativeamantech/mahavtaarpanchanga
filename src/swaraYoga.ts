import type {
  SwaraDayRule,
  SwaraYogaData,
  SwaraNadi,
  TattvaElement,
  NakshatraTattvaDetails,
  NakshatraNadiSpan,
  NakshatraNadiDefinition,
  NakshatraSwaraAlignmentResult,
} from "./types";
import type { Language } from "./i18n";

/**
 * Classical Shiva Swarodaya (शिवस्वरोदय) Master Table for all 30 lunar days.
 *
 * Pattern:
 * Shukla Paksha:
 *  - Days 1-3 (Pratipada to Tritiya): Sunrise Ida (Left), Sunset Pingala (Right)
 *  - Days 4-6 (Chaturthi to Shashthi): Sunrise Pingala (Right), Sunset Ida (Left)
 *  - Days 7-9 (Saptami to Navami): Sunrise Ida (Left), Sunset Pingala (Right)
 *  - Days 10-12 (Dashami to Dwadashi): Sunrise Pingala (Right), Sunset Ida (Left)
 *  - Days 13-15 (Trayodashi to Purnima): Sunrise Ida (Left), Sunset Pingala (Right)
 *
 * Krishna Paksha:
 *  - Days 16-18 (Pratipada to Tritiya): Sunrise Pingala (Right), Sunset Ida (Left)
 *  - Days 19-21 (Chaturthi to Shashthi): Sunrise Ida (Left), Sunset Pingala (Right)
 *  - Days 22-24 (Saptami to Navami): Sunrise Pingala (Right), Sunset Ida (Left)
 *  - Days 25-27 (Dashami to Dwadashi): Sunrise Ida (Left), Sunset Pingala (Right)
 *  - Days 28-30 (Trayodashi to Amavasya): Sunrise Pingala (Right), Sunset Ida (Left)
 */
const RAW_SWARA_CYCLE_RULES: Array<{
  dayNumber: number;
  tithiName: string;
  paksha: "Shukla Paksha" | "Krishna Paksha" | "Full moon" | "No Moon";
  sunriseSwara: SwaraNadi;
  sunsetSwara: SwaraNadi;
  sunriseNostril: "Left" | "Right";
  sunsetNostril: "Left" | "Right";
}> = [
  {
    dayNumber: 1,
    tithiName: "Pratipada",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 2,
    tithiName: "Dwitiya",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 3,
    tithiName: "Tritiya",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 4,
    tithiName: "Chaturthi",
    paksha: "Shukla Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 5,
    tithiName: "Panchami",
    paksha: "Shukla Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 6,
    tithiName: "Shashthi",
    paksha: "Shukla Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 7,
    tithiName: "Saptami",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 8,
    tithiName: "Ashtami",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 9,
    tithiName: "Navami",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 10,
    tithiName: "Dashami",
    paksha: "Shukla Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 11,
    tithiName: "Ekadasi",
    paksha: "Shukla Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 12,
    tithiName: "Dwadashi",
    paksha: "Shukla Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 13,
    tithiName: "Trayodashi",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 14,
    tithiName: "Chaturdashi",
    paksha: "Shukla Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 15,
    tithiName: "Purnima",
    paksha: "Full moon",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 16,
    tithiName: "Pratipada",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 17,
    tithiName: "Dwitiya",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 18,
    tithiName: "Tritiya",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 19,
    tithiName: "Chaturthi",
    paksha: "Krishna Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 20,
    tithiName: "Panchami",
    paksha: "Krishna Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 21,
    tithiName: "Shashthi",
    paksha: "Krishna Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 22,
    tithiName: "Saptami",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 23,
    tithiName: "Ashtami",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 24,
    tithiName: "Navami",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 25,
    tithiName: "Dashami",
    paksha: "Krishna Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 26,
    tithiName: "Ekadasi",
    paksha: "Krishna Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 27,
    tithiName: "Dwadashi",
    paksha: "Krishna Paksha",
    sunriseSwara: "ida",
    sunsetSwara: "pingala",
    sunriseNostril: "Left",
    sunsetNostril: "Right",
  },
  {
    dayNumber: 28,
    tithiName: "Trayodashi",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 29,
    tithiName: "Chaturdashi",
    paksha: "Krishna Paksha",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
  {
    dayNumber: 30,
    tithiName: "Amawashya",
    paksha: "No Moon",
    sunriseSwara: "pingala",
    sunsetSwara: "ida",
    sunriseNostril: "Right",
    sunsetNostril: "Left",
  },
];

export const SWARA_CYCLE_RULES: SwaraDayRule[] = RAW_SWARA_CYCLE_RULES.map((r) => ({
  ...r,
  // Moonrise nadi is opposite of sunrise and moonset nadi is opposite of sunset
  moonriseSwara: (r.sunriseSwara === "ida" ? "pingala" : "ida") as SwaraNadi,
  moonsetSwara: (r.sunsetSwara === "ida" ? "pingala" : "ida") as SwaraNadi,
  moonriseNostril: (r.sunriseNostril === "Left" ? "Right" : "Left") as "Left" | "Right",
  moonsetNostril: (r.sunsetNostril === "Left" ? "Right" : "Left") as "Left" | "Right",
}));

export interface SwaraDetails {
  nadi: SwaraNadi;
  sanskritName: string;
  nostril: { en: string; hi: string; sa: string };
  energy: { en: string; hi: string; sa: string };
  element: { en: string; hi: string; sa: string };
  temperament: { en: string; hi: string; sa: string };
  rulingDeities: { en: string; hi: string; sa: string };
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  auspiciousWorks: { en: string[]; hi: string[]; sa: string[] };
  inauspiciousWorks: { en: string[]; hi: string[]; sa: string[] };
}

export const SWARA_DETAILS: Record<SwaraNadi, SwaraDetails> = {
  ida: {
    nadi: "ida",
    sanskritName: "इड़ा नाड़ी (चन्द्र स्वर)",
    nostril: {
      en: "Left Nostril (Chandra / Lunar)",
      hi: "वाम नासिका (चन्द्र स्वर)",
      sa: "वाम-नासिकापुटम् (चन्द्रस्वरः)",
    },
    energy: {
      en: "Cooling, Calming, Magnetic, Receptive (Somya)",
      hi: "शीतल, शान्त, अमृतमयी, आकर्षण शक्ति (सौम्य)",
      sa: "शीतल-सौम्य-अमृतप्रद-शक्तिः",
    },
    element: {
      en: "Water & Earth (Kapha / Nourishing)",
      hi: "जल व पृथ्वी तत्त्व प्रधान (पोषक)",
      sa: "जल-भूमि-तत्त्वप्रधानम्",
    },
    temperament: {
      en: "Feminine, introverted, introspective",
      hi: "स्त्री-प्रकृति, अन्तर्मुखी, स्थिर",
      sa: "स्त्रीस्वभावः, अन्तर्मुखः",
    },
    rulingDeities: {
      en: "Moon (Candra), Bṛhaspati, Śukra, Budha",
      hi: "चन्द्रमा, बृहस्पति, शुक्र, बुध देव",
      sa: "चन्द्र-बृहस्पति-शुक्र-बुध-ग्रहाः",
    },
    color: "#0284c7",
    badgeBg: "bg-sky-50",
    badgeBorder: "border-sky-300",
    badgeText: "text-sky-950",
    auspiciousWorks: {
      en: [
        "Starting journeys or long travel",
        "Housewarming (Gṛhapraveśa) and construction",
        "Buying clothes, jewelry, or vehicles",
        "Marriage, engagement, and peaceful ceremonies",
        "Learning arts, music, meditation, literature",
        "Taking medicine or initiating medical treatment",
        "Planting seeds, farming, digging wells",
        "Meeting elders, preceptors, and royalty",
      ],
      hi: [
        "दीर्घ यात्रा व प्रस्थान",
        "गृहप्रवेश व नवीन निर्माण कार्य",
        "वस्त्र, आभूषण व वाहन क्रय",
        "विवाह, सगाई व मांगलिक अनुष्ठान",
        "विद्यारम्भ, संगीत, साहित्य व ध्यान",
        "औषध सेवन व चिकित्सा आरम्भ",
        "बीजारोपण, कृषि व वृक्षारोपण",
        "गुरुजनों, विद्वानों व मित्रों से मिलन",
      ],
      sa: [
        "दूरयात्रा-प्रस्थानम्",
        "गृहप्रवेशः निर्माणकार्यं च",
        "वस्त्राभूषण-क्रयणम्",
        "विवाह-मङ्गलकार्याणि",
        "विद्याभ्यासः सङ्गीतं ध्यानं च",
        "औषधसेवनम् चिकित्सा च",
        "कृषिकार्यं वृक्षारोपणं च",
        "गुरु-दर्शनं मैत्री च",
      ],
    },
    inauspiciousWorks: {
      en: [
        "Heavy digestion or eating heavy meals (weaker digestive fire)",
        "Fierce combat, athletic exertion, aggression",
        "Entering risky legal debates or conflicts",
      ],
      hi: [
        "गरिष्ठ भोजन (जठराग्नि मन्द रहती है)",
        "युद्ध, अति-श्रम व विवाद",
        "कठोर दण्ड व आक्रामक कार्य",
      ],
      sa: ["गुरुभोजनम् मन्दाग्निहेतोः", "युद्ध-कलह-अतिश्रमाः", "उग्रकार्याणि विग्रहाश्च"],
    },
  },
  pingala: {
    nadi: "pingala",
    sanskritName: "पिङ्गला नाड़ी (सूर्य स्वर)",
    nostril: {
      en: "Right Nostril (Sūrya / Solar)",
      hi: "दक्षिण नासिका (सूर्य स्वर)",
      sa: "दक्षिण-नासिकापुटम् (सूर्यस्वरः)",
    },
    energy: {
      en: "Heating, Energizing, Active, Electric (Raudra/Agni)",
      hi: "उष्ण, ओजस्वी, प्राणवान, पाचक शक्ति (रौद्र/अग्नि)",
      sa: "उष्ण-तेजस्वी-पाचक-शक्तिः",
    },
    element: {
      en: "Fire & Air (Pitta / Transformative)",
      hi: "अग्नि व वायु तत्त्व प्रधान (रूपांतरण)",
      sa: "अग्नि-वायु-तत्त्वप्रधानम्",
    },
    temperament: {
      en: "Masculine, extroverted, dynamic",
      hi: "पुरुष-प्रकृति, बहिर्मुखी, पराक्रमी",
      sa: "पुरुषस्वभावः, बहिर्मुखः",
    },
    rulingDeities: {
      en: "Sun (Sūrya), Maṅgala (Mars), Śani, Rāhu",
      hi: "सूर्य देव, मंगल देव, शनि, राहु",
      sa: "सूर्य-मङ्गल-शनि-राहु-ग्रहाः",
    },
    color: "#ea580c",
    badgeBg: "bg-orange-50",
    badgeBorder: "border-orange-300",
    badgeText: "text-orange-950",
    auspiciousWorks: {
      en: [
        "Eating meals and digesting food (strong Jatharāgni)",
        "Physical exercise, athletics, yoga asana practice",
        "Debates, intellectual contests, exams, negotiations",
        "Courageous deeds, warfare, challenges, hard labor",
        "Bathing, crossing water bodies, driving vehicles",
        "Sleeping on left side (activates right nostril for health)",
        "Purchasing weapons, tools, metals, or machinery",
      ],
      hi: [
        "भोजन ग्रहण व पाचन (जठराग्नि प्रदीप्त)",
        "व्यायाम, कुश्ती, योग-आसन व खेलकूद",
        "वाद-विवाद, शास्त्रार्थ, साक्षात्कार व परीक्षाएं",
        "साहसिक कार्य, उद्योग व पुरुषार्थ",
        "स्नान, नदी पार करना व वाहन चालन",
        "वाम करवट शयन (जिससे सूर्य स्वर चले)",
        "शस्त्र, धातु व मशीनरी का क्रय",
      ],
      sa: [
        "भोजनपाचनम् (जठराग्निदीप्तौ)",
        "व्यायामः शरीराभ्यासः च",
        "शास्त्रार्थः परीक्षा जयश्च",
        "साहस-पराक्रम-कार्याणि",
        "स्नानं नदीतरणं च",
        "वामपार्श्वशयनम्",
        "शस्त्र-यन्त्र-धातुक्रयः",
      ],
    },
    inauspiciousWorks: {
      en: [
        "Long peaceful travel or house entry",
        "Taking long-term delicate oaths or gentle peace accords",
        "Drinking large amounts of cooling liquids",
      ],
      hi: [
        "शान्त मांगलिक यात्रा व गृहप्रवेश",
        "कोमल, सौम्य व शान्तिकर्म",
        "विवाह व दीर्घकालीन सन्धि",
      ],
      sa: ["शान्तमङ्गल-यात्रा गृहप्रवेशश्च", "कोमल-सौम्यकर्माणि", "विवाहः शान्तिविधानं च"],
    },
  },
  sushumna: {
    nadi: "sushumna",
    sanskritName: "सुषुम्णा नाड़ी (मध्य / ब्रह्म स्वर)",
    nostril: {
      en: "Both Nostrils Flowing Simultaneously",
      hi: "दोनों नासिका समान (उभय प्रवाह)",
      sa: "उभय-नासिकापुट-साम्यम्",
    },
    energy: {
      en: "Neutralizing, Transcendent, Yogic, Non-dual",
      hi: "निस्त्रैगुण्य, योगयुक्त, समाधिस्थ, दिव्य",
      sa: "समाधियुक्तम्, दिव्य-कैवल्यप्रदम्",
    },
    element: {
      en: "Ether (Ākāśa / Space)",
      hi: "आकाश तत्त्व (शून्य)",
      sa: "आकाश-तत्त्वम् (शून्यम्)",
    },
    temperament: {
      en: "Transcendental, detached from worldly fruit",
      hi: "सांसारिक फलों से विरक्त, आत्मलीन",
      sa: "परमशान्तम्, आत्मलीनम्",
    },
    rulingDeities: {
      en: "Lord Shiva & Parāśakti (Brahman)",
      hi: "परमशिव एवं पराशक्ति",
      sa: "परब्रह्म-परमशिवः",
    },
    color: "#9333ea",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-300",
    badgeText: "text-purple-950",
    auspiciousWorks: {
      en: [
        "Dhyāna (Meditation) and contemplation",
        "Prāṇāyāma and Kuṇḍalinī awakening",
        "Mantra Japa and scriptural study",
        "Samādhi and prayer for liberation",
      ],
      hi: [
        "ध्यान, धारणा व समाधि",
        "प्राणायाम व कुण्डलिनी जागरण",
        "गायत्री व इष्ट मन्त्र जप",
        "मोक्ष चिन्तन व ईश-प्रार्थना",
      ],
      sa: [
        "ध्यान-धारणा-समाधिः",
        "प्राणायामः कुण्डलिनी-जागरणम्",
        "मन्त्रजपः भगवच्चिन्तनम्",
        "मोक्षसाधनम्",
      ],
    },
    inauspiciousWorks: {
      en: [
        "All worldly and commercial undertakings (result in futility or loss)",
        "Travel, buying, selling, litigation",
      ],
      hi: [
        "समस्त सांसारिक, व्यापारिक व लौकिक कार्य (निष्फल होते हैं)",
        "यात्रा, क्रय-विक्रय व लेन-देन",
      ],
      sa: ["सर्वे लौकिकाः व्यवहाराः (निष्फलाः भवन्ति)", "यात्रा वाणिज्यं च"],
    },
  },
};

/**
 * Classical Shiva Swarodaya (शिवस्वरोदय) Graha-Nadi Correspondence:
 * - Saumya (Gentle / Lunar) Grahas: Moon, Mercury, Jupiter, Venus -> Ida Nadi (Chandra Swara / Left Nostril)
 * - Krura/Agni (Fiery / Solar) Grahas: Sun, Mars, Saturn -> Pingala Nadi (Surya Swara / Right Nostril)
 */
export const PLANET_TO_SWARA_NADI: Record<string, "ida" | "pingala"> = {
  Sun: "pingala",
  Moon: "ida",
  Mars: "pingala",
  Mercury: "ida",
  Jupiter: "ida",
  Venus: "ida",
  Saturn: "pingala",
};

export function getPlanetSwaraNadi(ruler: string): "ida" | "pingala" {
  return PLANET_TO_SWARA_NADI[ruler] ?? "ida";
}

/**
 * Classical Shiva Swarodaya Graha/Vara Sunrise rule:
 * Sunday (Sun), Tuesday (Mars), Saturday (Saturn) -> Pingala (Surya Nadi)
 * Monday (Moon), Wednesday (Mercury), Thursday (Jupiter), Friday (Venus) -> Ida (Chandra Nadi)
 */
export function getWeekdayPlanetSwara(weekday: number): {
  planet: string;
  nadi: "ida" | "pingala";
  sanskritName: string;
} {
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const p = planets[weekday % 7] || "Sun";
  const nadi: "ida" | "pingala" = p === "Sun" || p === "Mars" || p === "Saturn" ? "pingala" : "ida";
  return {
    planet: p,
    nadi,
    sanskritName: nadi === "ida" ? "इड़ा नाड़ी (चन्द्र स्वर)" : "पिङ्गला नाड़ी (सूर्य स्वर)",
  };
}

/**
 * Evaluates whether the currently active Swara breath matches the ruling planetary Hora.
 */
export function checkPlanetSwaraHarmony(planetRuler: string, currentSwara: SwaraNadi) {
  const expectedNadi = getPlanetSwaraNadi(planetRuler);
  const isMatched = expectedNadi === currentSwara;
  return {
    isMatched,
    expectedNadi,
    planetRuler,
    currentSwara,
  };
}

/**
 * Given a Tithi number (1 to 30) or Tithi name and Paksha, returns the exact Swara rule.
 */
export function getSwaraForTithiNumber(tithiNumber: number): SwaraDayRule {
  const normalized = Math.max(1, Math.min(30, Math.floor(tithiNumber)));
  return SWARA_CYCLE_RULES[normalized - 1] || SWARA_CYCLE_RULES[0];
}

/**
 * Computes the full Swara Yoga details for a given sunrise, sunset, and local current time.
 */
/**
 * Helper to parse a time string "HH:MM[:SS]" to total minutes from midnight.
 */
export function parseTimeToMinutes(tStr?: string | null): number | null {
  if (!tStr || tStr === "None" || tStr === "unavailable" || tStr.trim() === "") return null;
  const parts = tStr
    .trim()
    .split(":")
    .map((v) => parseInt(v, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
  }
  return null;
}

/**
 * Formats total minutes from midnight into "HH:MM" 24-hour string.
 */
export function formatMinutesToTime(minutes: number): string {
  const norm = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = Math.floor(norm % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Checks if a given time (in minutes) falls inside [startMins, endMins], handling midnight boundary.
 */
export function isTimeInsideWindow(
  currentMins: number,
  startMins: number,
  endMins: number,
): boolean {
  const cur = ((currentMins % 1440) + 1440) % 1440;
  const s = ((startMins % 1440) + 1440) % 1440;
  const e = ((endMins % 1440) + 1440) % 1440;
  if (s <= e) {
    return cur >= s && cur <= e;
  } else {
    return cur >= s || cur <= e;
  }
}

/**
 * Computes the full Swara Yoga details for a given sunrise, sunset, moonrise, moonset, and local current time.
 * Timing Axioms:
 * 1. Sunrise Swara: Starts at Sunrise and runs for 1 hour [sunrise, sunrise + 60m].
 * 2. Sunset Swara: Starts 1 hour before Sunset and runs until Sunset [sunset - 60m, sunset].
 * 3. Moonrise Swara: Starts at Moonrise and runs for 1 hour [moonrise, moonrise + 60m] (Opposite of Sunrise).
 * 4. Moonset Swara: Starts 1 hour before Moonset and runs until Moonset [moonset - 60m, moonset] (Opposite of Sunset).
 */
export function computeSwaraYoga(
  tithiNumber: number,
  sunriseStr: string,
  sunsetStr: string,
  cityCurrentTime?: { hours: number; minutes: number; seconds: number },
  moonriseStr?: string | null,
  moonsetStr?: string | null,
): SwaraYogaData {
  const rule = getSwaraForTithiNumber(tithiNumber);

  const sunriseMins = parseTimeToMinutes(sunriseStr) ?? 6 * 60; // 06:00 default
  const sunsetMins = parseTimeToMinutes(sunsetStr) ?? 18 * 60; // 18:00 default
  const moonriseMins = parseTimeToMinutes(moonriseStr);
  const moonsetMins = parseTimeToMinutes(moonsetStr);

  const currentMins = cityCurrentTime
    ? cityCurrentTime.hours * 60 + cityCurrentTime.minutes + cityCurrentTime.seconds / 60
    : null;

  // 1. Sunrise Swara Window: Starts at Sunrise and runs for 1 hour
  const sunriseWindowStart = sunriseMins;
  const sunriseWindowEnd = sunriseMins + 60;
  const isSunriseActive =
    currentMins !== null
      ? isTimeInsideWindow(currentMins, sunriseWindowStart, sunriseWindowEnd)
      : false;
  const sunriseWindow = {
    start: formatMinutesToTime(sunriseWindowStart),
    end: formatMinutesToTime(sunriseWindowEnd),
    windowFormatted: `${formatMinutesToTime(sunriseWindowStart)} – ${formatMinutesToTime(sunriseWindowEnd)}`,
    ruleDescription: {
      en: "Starts at Sunrise, runs for 1 hour",
      hi: "सूर्योदय से 1 घंटे तक प्रवहमान रहता है",
      sa: "सूर्योदयात् आरभ्य १ होरापर्यन्तं प्रवहति",
    },
    isActive: isSunriseActive,
  };

  // 1.5. Midday Swara Window: Starts at Midday, runs for 1 hour (Same as Sunrise)
  let daytimeMins = sunsetMins - sunriseMins;
  if (daytimeMins < 0) daytimeMins += 1440;
  const middayMins = (sunriseMins + daytimeMins / 2) % 1440;

  const middayWindowStart = middayMins;
  const middayWindowEnd = middayMins + 60;
  const isMiddayActive =
    currentMins !== null
      ? isTimeInsideWindow(currentMins, middayWindowStart, middayWindowEnd)
      : false;
  const middayWindow = {
    start: formatMinutesToTime(middayWindowStart),
    end: formatMinutesToTime(middayWindowEnd),
    windowFormatted: `${formatMinutesToTime(middayWindowStart)} – ${formatMinutesToTime(middayWindowEnd)}`,
    ruleDescription: {
      en: "Starts at Midday, runs for 1 hour (Same as Sunrise)",
      hi: "मध्याह्न (दोपहर) से 1 घंटे तक प्रवहमान रहता है (सूर्योदय के समान)",
      sa: "मध्याह्नात् आरभ्य १ होरापर्यन्तं प्रवहति (सूर्योदयसमानम्)",
    },
    isActive: isMiddayActive,
  };

  // 2. Sunset Swara Window: Starts 1 hour before Sunset, runs until Sunset
  const sunsetWindowStart = sunsetMins - 60;
  const sunsetWindowEnd = sunsetMins;
  const isSunsetActive =
    currentMins !== null
      ? isTimeInsideWindow(currentMins, sunsetWindowStart, sunsetWindowEnd)
      : false;
  const sunsetWindow = {
    start: formatMinutesToTime(sunsetWindowStart),
    end: formatMinutesToTime(sunsetWindowEnd),
    windowFormatted: `${formatMinutesToTime(sunsetWindowStart)} – ${formatMinutesToTime(sunsetWindowEnd)}`,
    ruleDescription: {
      en: "Starts 1 hour before Sunset, runs until Sunset",
      hi: "सूर्यास्त से 1 घंटा पहले प्रारंभ होता है",
      sa: "सूर्यास्तात् १ होरा पूर्वम् आरभ्य सूर्यास्तपर्यन्तं प्रवहति",
    },
    isActive: isSunsetActive,
  };

  // 3. Moonrise Swara Window: Starts at Moonrise and runs for 1 hour (Opposite of Sunrise)
  let moonriseWindow: SwaraYogaData["moonriseWindow"] = null;
  let isMoonriseActive = false;
  if (moonriseMins !== null) {
    const mrStart = moonriseMins;
    const mrEnd = moonriseMins + 60;
    isMoonriseActive =
      currentMins !== null ? isTimeInsideWindow(currentMins, mrStart, mrEnd) : false;
    moonriseWindow = {
      start: formatMinutesToTime(mrStart),
      end: formatMinutesToTime(mrEnd),
      windowFormatted: `${formatMinutesToTime(mrStart)} – ${formatMinutesToTime(mrEnd)}`,
      ruleDescription: {
        en: "Starts at Moonrise, runs for 1 hour (Opposite of Sunrise)",
        hi: "चन्द्रोदय से 1 घंटे तक प्रवहमान रहता है (सूर्योदय का विपरीत)",
        sa: "चन्द्रोदयात् आरभ्य १ होरापर्यन्तं प्रवहति (सूर्योदयविपरीतम्)",
      },
      isActive: isMoonriseActive,
    };
  }

  // 4. Moonset Swara Window: Starts 1 hour before Moonset, runs until Moonset (Opposite of Sunset)
  let moonsetWindow: SwaraYogaData["moonsetWindow"] = null;
  let isMoonsetActive = false;
  if (moonsetMins !== null) {
    const msStart = moonsetMins - 60;
    const msEnd = moonsetMins;
    isMoonsetActive =
      currentMins !== null ? isTimeInsideWindow(currentMins, msStart, msEnd) : false;
    moonsetWindow = {
      start: formatMinutesToTime(msStart),
      end: formatMinutesToTime(msEnd),
      windowFormatted: `${formatMinutesToTime(msStart)} – ${formatMinutesToTime(msEnd)}`,
      ruleDescription: {
        en: "Starts 1 hour before Moonset, runs until Moonset (Opposite of Sunset)",
        hi: "चन्द्रास्त से 1 घंटा पहले प्रारंभ होता है (सूर्यास्त का विपरीत)",
        sa: "चन्द्रास्तात् १ होरा पूर्वम् आरभ्य चन्द्रास्तपर्यन्तं प्रवहति (सूर्यास्तविपरीतम्)",
      },
      isActive: isMoonsetActive,
    };
  }

  // Active Celestial Window Identification
  let activeCelestialWindow: SwaraYogaData["activeCelestialWindow"] = null;
  if (isSunriseActive) {
    activeCelestialWindow = "sunrise";
  } else if (isMiddayActive) {
    activeCelestialWindow = "midday";
  } else if (isSunsetActive) {
    activeCelestialWindow = "sunset";
  } else if (isMoonriseActive) {
    activeCelestialWindow = "moonrise";
  } else if (isMoonsetActive) {
    activeCelestialWindow = "moonset";
  }

  let currentActiveSwara: SwaraNadi = rule.sunriseSwara;
  let activeNostril: "Left" | "Right" | "Both" = rule.sunriseNostril;

  // Active celestial sandhya window takes precedence, otherwise Tithi's sunrise swara
  if (isSunriseActive) {
    currentActiveSwara = rule.sunriseSwara;
    activeNostril = rule.sunriseNostril;
  } else if (isMiddayActive) {
    currentActiveSwara = rule.sunriseSwara;
    activeNostril = rule.sunriseNostril;
  } else if (isSunsetActive) {
    currentActiveSwara = rule.sunsetSwara;
    activeNostril = rule.sunsetNostril;
  } else if (isMoonriseActive) {
    currentActiveSwara = rule.moonriseSwara;
    activeNostril = rule.moonriseNostril;
  } else if (isMoonsetActive) {
    currentActiveSwara = rule.moonsetSwara;
    activeNostril = rule.moonsetNostril;
  }

  return {
    dayNumber: rule.dayNumber,
    tithiName: rule.tithiName,
    paksha: rule.paksha,
    sunriseSwara: rule.sunriseSwara,
    sunsetSwara: rule.sunsetSwara,
    sunriseNostril: rule.sunriseNostril,
    sunsetNostril: rule.sunsetNostril,
    moonriseSwara: rule.moonriseSwara,
    moonsetSwara: rule.moonsetSwara,
    moonriseNostril: rule.moonriseNostril,
    moonsetNostril: rule.moonsetNostril,
    sunriseWindow,
    middayWindow,
    sunsetWindow,
    moonriseWindow,
    moonsetWindow,
    activeCelestialWindow,
    currentActiveSwara,
    activeNostril,
  };
}

/**
 * ============================================================================
 * NAKSHATRA-TATTVA & NAKSHATRA-NADI (SHIVA SWARODAYA VERSES 73–74)
 * ============================================================================
 */

export const TATTVA_MASTER_TABLE: Record<TattvaElement, NakshatraTattvaDetails> = {
  prithvi: {
    element: "prithvi",
    name: { en: "Earth (Pṛthvī)", hi: "पृथ्वी तत्त्व", sa: "पृथ्वीतत्त्वम्" },
    symbol: "🌍",
    quality: {
      en: "Steady Success",
      hi: "स्थिर कार्यसिद्धि",
      sa: "स्थिरसिद्धिः",
    },
    application: {
      en: "Good for construction, farming, stability, investments, foundation stones, and permanent works.",
      hi: "भवन निर्माण, कृषि, स्थिरता, दीर्घकालिक अनुबंध व स्थायी कार्यों हेतु उत्तम।",
      sa: "गृहनिर्माण-कृषि-स्थिरकार्येषु प्रशस्तम्।",
    },
    warning: {
      en: "Slow mobility; not recommended for urgent travel or rapid escapes.",
      hi: "गति मन्द रहती है; त्वरित यात्रा व शीघ्रगामी कार्यों हेतु उचित नहीं।",
      sa: "मन्दगतिः, शीघ्रप्रस्थानाय न योग्यम्।",
    },
    color: "#b45309",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeBorder: "border-amber-300 dark:border-amber-800",
    badgeText: "text-amber-950 dark:text-amber-200",
  },
  jala: {
    element: "jala",
    name: { en: "Water (Jala)", hi: "जल तत्त्व", sa: "जलतत्त्वम्" },
    symbol: "💧",
    quality: {
      en: "Fluid Gain",
      hi: "द्रव लाभ एवं समृद्धि",
      sa: "द्रवलाभः",
    },
    application: {
      en: "Good for travel, liquid works, relationships, trade, healing, and peace treaties.",
      hi: "यात्रा, जलीय कार्य, संबंध विस्तार, व्यापार, शांति एवं सौम्य कार्यों हेतु शुभ।",
      sa: "यात्रा-जलीयकार्य-मैत्री-व्यापारेषु उत्तमम्।",
    },
    warning: {
      en: "Excess emotional sensitivity; avoid intense physical combat or fiery conflicts.",
      hi: "अत्यधिक भावुकता संभव; कठोर संघर्ष व वाद-विवाद से बचें।",
      sa: "सौम्यता, विग्रहेषु वर्ज्यम्।",
    },
    color: "#0284c7",
    badgeBg: "bg-sky-50 dark:bg-sky-950/40",
    badgeBorder: "border-sky-300 dark:border-sky-800",
    badgeText: "text-sky-950 dark:text-sky-200",
  },
  tejas: {
    element: "tejas",
    name: { en: "Fire (Tejas / Agni)", hi: "अग्नि तत्त्व", sa: "अग्नितत्त्वम्" },
    symbol: "🔥",
    quality: {
      en: "Aggression / Loss (High Energy)",
      hi: "उग्रता, संघर्ष व ऊर्जा क्षय",
      sa: "उग्रता-हानिः",
    },
    application: {
      en: "Good for conflict, athletics, debate, surgery, and digestion. Bad for mild, peaceful, or delicate works.",
      hi: "वाद-विवाद, युद्ध, खेल, शल्यक्रिया, जठराग्नि प्रदीपन हेतु उपयुक्त; सौम्य कार्यों में त्याज्य।",
      sa: "विग्रह-शौर्य-युद्ध-पाचनेषु प्रशस्तम्, सौम्यकर्मसु वर्ज्यम्।",
    },
    warning: {
      en: "Caution: Risk of injury, hostility, high heat, and exhaustion.",
      hi: "सावधानी: चोट, विवाद, शारीरिक ताप व अत्यधिक ऊर्जा व्यय की संभावना।",
      sa: "सावधानता: उपद्रव-क्रोध-परिताप-भयम्।",
    },
    color: "#dc2626",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeBorder: "border-rose-300 dark:border-rose-800",
    badgeText: "text-rose-950 dark:text-rose-200",
  },
  vayu: {
    element: "vayu",
    name: { en: "Air (Vāyu)", hi: "वायु तत्त्व", sa: "वायुतत्त्वम्" },
    symbol: "🌬️",
    quality: {
      en: "Movement / Instability",
      hi: "गतिशीलता एवं अस्थिरता",
      sa: "चञ्चलत्वम्",
    },
    application: {
      en: "Good for travel, running away, swift changes, and communications. Bad for permanent stability.",
      hi: "शीघ्र यात्रा, पलायन, परिवर्तन, संचार हेतु अनुकूल; स्थायी कार्यों में प्रतिकूल।",
      sa: "शीघ्रयात्रा-पलायन-चञ्चलकार्येषु हितम्, स्थिरकर्मसु अनिष्टम्।",
    },
    warning: {
      en: "Restlessness and volatility; avoid signing permanent contracts or constructing foundations.",
      hi: "अस्थिरता व अनिश्चितता; स्थायी अनुबंध व निर्माण कार्य टालें।",
      sa: "अस्थिरभावः, चिरस्थायिकार्येषु न प्रशस्तम्।",
    },
    color: "#475569",
    badgeBg: "bg-slate-50 dark:bg-slate-900/50",
    badgeBorder: "border-slate-300 dark:border-slate-700",
    badgeText: "text-slate-900 dark:text-slate-200",
  },
  akash: {
    element: "akash",
    name: { en: "Ether (Ākāśa)", hi: "आकाश तत्त्व", sa: "आकाशतत्त्वम्" },
    symbol: "🌌",
    quality: {
      en: "Null (Void / Spiritual Only)",
      hi: "शून्य (केवल आध्यात्मिक सिद्धि)",
      sa: "शून्यम् (केवलाध्यात्मिकम्)",
    },
    application: {
      en: "No material success. Supreme for Dhyana, Mantra Japa, detachment, and spiritual contemplation.",
      hi: "भौतिक कार्यों में निष्फल; केवल ध्यान, मन्त्र जप, समाधि एवं मोक्ष साधना हेतु श्रेष्ठ।",
      sa: "लौकिककार्येषु निष्फलम्, केवलं ध्यानाभ्यास-मन्त्रजप-मुक्तिसाधनासु फलप्रदम्।",
    },
    warning: {
      en: "Material failure; worldly business and contracts yield void results.",
      hi: "भौतिक कार्यों का परिणाम शून्य रहता है, सांसारिक लेन-देन टालें।",
      sa: "लौकिकसिद्धिरहितम्।",
    },
    color: "#7c3aed",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    badgeBorder: "border-purple-300 dark:border-purple-800",
    badgeText: "text-purple-950 dark:text-purple-200",
  },
};

/**
 * Scriptural Zodiac Nadi Mapping (Shiva Swarodaya Verses 73–74)
 * Right Nostril (Pingala): Aries, Gemini, Leo, Libra, Sagittarius, Aquarius (Odd signs)
 * Left Nostril (Ida): Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces (Even signs)
 */
export interface ZodiacNadiRule {
  rashiNumber: number;
  rashiName: string;
  sanskritName: string;
  nadi: "ida" | "pingala";
  nostril: "Left" | "Right";
  polarity: "odd" | "even";
  starsIncluded: {
    en: string;
    hi: string;
    sa: string;
  };
}

export const ZODIAC_NADI_MASTER_TABLE: ZodiacNadiRule[] = [
  {
    rashiNumber: 1,
    rashiName: "Aries",
    sanskritName: "मेष (Meṣa)",
    nadi: "pingala",
    nostril: "Right",
    polarity: "odd",
    starsIncluded: {
      en: "Ashwini, Bharani, Krittika (1st part)",
      hi: "अश्विनी, भरणी, कृत्तिका (प्रथम चरण)",
      sa: "अश्विनी, भरणी, कृत्तिका (प्रथमचरणम्)",
    },
  },
  {
    rashiNumber: 2,
    rashiName: "Taurus",
    sanskritName: "वृषभ (Vṛṣabha)",
    nadi: "ida",
    nostril: "Left",
    polarity: "even",
    starsIncluded: {
      en: "Krittika (last 3 parts), Rohini, Mrigashira (1st half)",
      hi: "कृत्तिका (अंतिम ३ चरण), रोहिणी, मृगशिरा (प्रथम २ चरण)",
      sa: "कृत्तिका (अन्तिम ३ चरणाः), रोहिणी, मृगशिरा (पूर्वार्धम्)",
    },
  },
  {
    rashiNumber: 3,
    rashiName: "Gemini",
    sanskritName: "मिथुन (Mithuna)",
    nadi: "pingala",
    nostril: "Right",
    polarity: "odd",
    starsIncluded: {
      en: "Mrigashira (2nd half), Ardra, Punarvasu (1st 3 parts)",
      hi: "मृगशिरा (उत्तरार्ध), आर्द्रा, पुनर्वसु (प्रथम ३ चरण)",
      sa: "मृगशिरा (उत्तरार्धम्), आर्द्रा, पुनर्वसु (प्रथम ३ चरणाः)",
    },
  },
  {
    rashiNumber: 4,
    rashiName: "Cancer",
    sanskritName: "कर्क (Karka)",
    nadi: "ida",
    nostril: "Left",
    polarity: "even",
    starsIncluded: {
      en: "Punarvasu (last part), Pushya, Ashlesha",
      hi: "पुनर्वसु (अंतिम चरण), पुष्य, आश्लेषा",
      sa: "पुनर्वसु (अन्तिमचरणम्), पुष्य, आश्लेषा",
    },
  },
  {
    rashiNumber: 5,
    rashiName: "Leo",
    sanskritName: "सिंह (Simha)",
    nadi: "pingala",
    nostril: "Right",
    polarity: "odd",
    starsIncluded: {
      en: "Magha, Purva Phalguni, Uttara Phalguni (1st part)",
      hi: "मघा, पूर्वाफाल्गुनी, उत्तराफाल्गुनी (प्रथम चरण)",
      sa: "मघा, पूर्वाफाल्गुनी, उत्तराफाल्गुनी (प्रथमचरणम्)",
    },
  },
  {
    rashiNumber: 6,
    rashiName: "Virgo",
    sanskritName: "कन्या (Kanyā)",
    nadi: "ida",
    nostril: "Left",
    polarity: "even",
    starsIncluded: {
      en: "Uttara Phalguni (last 3 parts), Hasta, Chitra (1st half)",
      hi: "उत्तराफाल्गुनी (अंतिम ३ चरण), हस्त, चित्रा (प्रथम २ चरण)",
      sa: "उत्तराफाल्गुनी (अन्तिम ३ चरणाः), हस्त, चित्रा (पूर्वार्धम्)",
    },
  },
  {
    rashiNumber: 7,
    rashiName: "Libra",
    sanskritName: "तुला (Tulā)",
    nadi: "pingala",
    nostril: "Right",
    polarity: "odd",
    starsIncluded: {
      en: "Chitra (2nd half), Swati, Vishakha (1st 3 parts)",
      hi: "चित्रा (उत्तरार्ध), स्वाति, विशाखा (प्रथम ३ चरण)",
      sa: "चित्रा (उत्तरार्धम्), स्वाति, विशाखा (प्रथम ३ चरणाः)",
    },
  },
  {
    rashiNumber: 8,
    rashiName: "Scorpio",
    sanskritName: "वृश्चिक (Vṛścika)",
    nadi: "ida",
    nostril: "Left",
    polarity: "even",
    starsIncluded: {
      en: "Vishakha (last part), Anuradha, Jyeshtha",
      hi: "विशाखा (अंतिम चरण), अनुराधा, ज्येष्ठा",
      sa: "विशाखा (अन्तिमचरणम्), अनुराधा, ज्येष्ठा",
    },
  },
  {
    rashiNumber: 9,
    rashiName: "Sagittarius",
    sanskritName: "धनु (Dhanu)",
    nadi: "pingala",
    nostril: "Right",
    polarity: "odd",
    starsIncluded: {
      en: "Mula, Purvashada, Uttarashada (1st part)",
      hi: "मूल, पूर्वाषाढा, उत्तराषाढा (प्रथम चरण)",
      sa: "मूल, पूर्वाषाढा, उत्तराषाढा (प्रथमचरणम्)",
    },
  },
  {
    rashiNumber: 10,
    rashiName: "Capricorn",
    sanskritName: "मकर (Makara)",
    nadi: "ida",
    nostril: "Left",
    polarity: "even",
    starsIncluded: {
      en: "Uttarashada (last 3 parts), Shravana, Dhanishta (1st half)",
      hi: "उत्तराषाढा (अंतिम ३ चरण), श्रवण, धनिष्ठा (प्रथम २ चरण)",
      sa: "उत्तराषाढा (अन्तिम ३ चरणाः), श्रवण, धनिष्ठा (पूर्वार्धम्)",
    },
  },
  {
    rashiNumber: 11,
    rashiName: "Aquarius",
    sanskritName: "कुम्भ (Kumbha)",
    nadi: "pingala",
    nostril: "Right",
    polarity: "odd",
    starsIncluded: {
      en: "Dhanishta (2nd half), Shatabhisha, Purva Bhadrapada (1st 3 parts)",
      hi: "धनिष्ठा (उत्तरार्ध), शतभिषा, पूर्वाभाद्रपदा (प्रथम ३ चरण)",
      sa: "धनिष्ठा (उत्तरार्धम्), शतभिषा, पूर्वाभाद्रपदा (प्रथम ३ चरणाः)",
    },
  },
  {
    rashiNumber: 12,
    rashiName: "Pisces",
    sanskritName: "मीन (Mīna)",
    nadi: "ida",
    nostril: "Left",
    polarity: "even",
    starsIncluded: {
      en: "Purva Bhadrapada (last part), Uttara Bhadrapada, Revati",
      hi: "पूर्वाभाद्रपदा (अंतिम चरण), उत्तराभाद्रपदा, रेवती",
      sa: "पूर्वाभाद्रपदा (अन्तिमचरणम्), उत्तराभाद्रपदा, रेवती",
    },
  },
];

/**
 * Classical 27 Nakshatras Master Definition
 * Mapping each Star to its Element (Tattva) and Parent Rashi Nadi (Verses 73–74)
 */
export const NAKSHATRA_NADI_DEFINITIONS: Record<number, NakshatraNadiDefinition> = {
  1: {
    nakshatraNumber: 1,
    nakshatraName: "Ashwini",
    sanskritName: "अश्विनी (Aśvinī)",
    tattva: "vayu",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 1,
        rashiName: "Aries",
        sanskritName: "मेष (Meṣa)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Aries (Mesha)",
      },
    ],
  },
  2: {
    nakshatraNumber: 2,
    nakshatraName: "Bharani",
    sanskritName: "भरणी (Bharaṇī)",
    tattva: "tejas",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 1,
        rashiName: "Aries",
        sanskritName: "मेष (Meṣa)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Aries (Mesha)",
      },
    ],
  },
  3: {
    nakshatraNumber: 3,
    nakshatraName: "Krittika",
    sanskritName: "कृत्तिका (Kṛttikā)",
    tattva: "tejas",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 1,
        rashiName: "Aries",
        sanskritName: "मेष (Meṣa)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1],
        padaDescription: "Pada 1 in Aries (Mesha - Right)",
      },
      {
        rashiNumber: 2,
        rashiName: "Taurus",
        sanskritName: "वृषभ (Vṛṣabha)",
        nadi: "ida",
        nostril: "Left",
        padas: [2, 3, 4],
        padaDescription: "Padas 2, 3, 4 in Taurus (Vrishabha - Left)",
      },
    ],
  },
  4: {
    nakshatraNumber: 4,
    nakshatraName: "Rohini",
    sanskritName: "रोहिणी (Rohiṇī)",
    tattva: "prithvi",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 2,
        rashiName: "Taurus",
        sanskritName: "वृषभ (Vṛṣabha)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Taurus (Vrishabha)",
      },
    ],
  },
  5: {
    nakshatraNumber: 5,
    nakshatraName: "Mrigashira",
    sanskritName: "मृगशिरा (Mṛgaśirā)",
    tattva: "vayu",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 2,
        rashiName: "Taurus",
        sanskritName: "वृषभ (Vṛṣabha)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2],
        padaDescription: "Padas 1, 2 (1st half) in Taurus (Vrishabha - Left)",
      },
      {
        rashiNumber: 3,
        rashiName: "Gemini",
        sanskritName: "मिथुन (Mithuna)",
        nadi: "pingala",
        nostril: "Right",
        padas: [3, 4],
        padaDescription: "Padas 3, 4 (2nd half) in Gemini (Mithuna - Right)",
      },
    ],
  },
  6: {
    nakshatraNumber: 6,
    nakshatraName: "Ardra",
    sanskritName: "आर्द्रा (Ārdrā)",
    tattva: "jala",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 3,
        rashiName: "Gemini",
        sanskritName: "मिथुन (Mithuna)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Gemini (Mithuna)",
      },
    ],
  },
  7: {
    nakshatraNumber: 7,
    nakshatraName: "Punarvasu",
    sanskritName: "पुनर्वसु (Punarvasū)",
    tattva: "vayu",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 3,
        rashiName: "Gemini",
        sanskritName: "मिथुन (Mithuna)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3],
        padaDescription: "Padas 1, 2, 3 (1st 3 parts) in Gemini (Mithuna - Right)",
      },
      {
        rashiNumber: 4,
        rashiName: "Cancer",
        sanskritName: "कर्क (Karka)",
        nadi: "ida",
        nostril: "Left",
        padas: [4],
        padaDescription: "Pada 4 (last part) in Cancer (Karka - Left)",
      },
    ],
  },
  8: {
    nakshatraNumber: 8,
    nakshatraName: "Pushya",
    sanskritName: "पुष्य (Puṣya)",
    tattva: "tejas",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 4,
        rashiName: "Cancer",
        sanskritName: "कर्क (Karka)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Cancer (Karka)",
      },
    ],
  },
  9: {
    nakshatraNumber: 9,
    nakshatraName: "Ashlesha",
    sanskritName: "आश्लेषा (Āśleṣā)",
    tattva: "jala",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 4,
        rashiName: "Cancer",
        sanskritName: "कर्क (Karka)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Cancer (Karka)",
      },
    ],
  },
  10: {
    nakshatraNumber: 10,
    nakshatraName: "Magha",
    sanskritName: "मघा (Maghā)",
    tattva: "tejas",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 5,
        rashiName: "Leo",
        sanskritName: "सिंह (Simha)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Leo (Simha)",
      },
    ],
  },
  11: {
    nakshatraNumber: 11,
    nakshatraName: "Purva Phalguni",
    sanskritName: "पूर्वाफाल्गुनी (Pūrvaphalgunī)",
    tattva: "tejas",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 5,
        rashiName: "Leo",
        sanskritName: "सिंह (Simha)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Leo (Simha)",
      },
    ],
  },
  12: {
    nakshatraNumber: 12,
    nakshatraName: "Uttara Phalguni",
    sanskritName: "उत्तराफाल्गुनी (Uttaraphalgunī)",
    tattva: "vayu",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 5,
        rashiName: "Leo",
        sanskritName: "सिंह (Simha)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1],
        padaDescription: "Pada 1 in Leo (Simha - Right)",
      },
      {
        rashiNumber: 6,
        rashiName: "Virgo",
        sanskritName: "कन्या (Kanyā)",
        nadi: "ida",
        nostril: "Left",
        padas: [2, 3, 4],
        padaDescription: "Padas 2, 3, 4 in Virgo (Kanya - Left)",
      },
    ],
  },
  13: {
    nakshatraNumber: 13,
    nakshatraName: "Hasta",
    sanskritName: "हस्त (Hasta)",
    tattva: "vayu",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 6,
        rashiName: "Virgo",
        sanskritName: "कन्या (Kanyā)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Virgo (Kanya)",
      },
    ],
  },
  14: {
    nakshatraNumber: 14,
    nakshatraName: "Chitra",
    sanskritName: "चित्रा (Citrā)",
    tattva: "vayu",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 6,
        rashiName: "Virgo",
        sanskritName: "कन्या (Kanyā)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2],
        padaDescription: "Padas 1, 2 (1st half) in Virgo (Kanya - Left)",
      },
      {
        rashiNumber: 7,
        rashiName: "Libra",
        sanskritName: "तुला (Tulā)",
        nadi: "pingala",
        nostril: "Right",
        padas: [3, 4],
        padaDescription: "Padas 3, 4 (2nd half) in Libra (Tula - Right)",
      },
    ],
  },
  15: {
    nakshatraNumber: 15,
    nakshatraName: "Swati",
    sanskritName: "स्वाति (Svāti)",
    tattva: "tejas",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 7,
        rashiName: "Libra",
        sanskritName: "तुला (Tulā)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Libra (Tula)",
      },
    ],
  },
  16: {
    nakshatraNumber: 16,
    nakshatraName: "Vishakha",
    sanskritName: "विशाखा (Viśākhā)",
    tattva: "vayu",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 7,
        rashiName: "Libra",
        sanskritName: "तुला (Tulā)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3],
        padaDescription: "Padas 1, 2, 3 in Libra (Tula - Right)",
      },
      {
        rashiNumber: 8,
        rashiName: "Scorpio",
        sanskritName: "वृश्चिक (Vṛścika)",
        nadi: "ida",
        nostril: "Left",
        padas: [4],
        padaDescription: "Pada 4 in Scorpio (Vrishchika - Left)",
      },
    ],
  },
  17: {
    nakshatraNumber: 17,
    nakshatraName: "Anuradha",
    sanskritName: "अनुराधा (Anurādhā)",
    tattva: "prithvi",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 8,
        rashiName: "Scorpio",
        sanskritName: "वृश्चिक (Vṛścika)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Scorpio (Vrishchika)",
      },
    ],
  },
  18: {
    nakshatraNumber: 18,
    nakshatraName: "Jyeshtha",
    sanskritName: "ज्येष्ठा (Jyeṣṭhā)",
    tattva: "prithvi",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 8,
        rashiName: "Scorpio",
        sanskritName: "वृश्चिक (Vṛścika)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Scorpio (Vrishchika)",
      },
    ],
  },
  19: {
    nakshatraNumber: 19,
    nakshatraName: "Mula",
    sanskritName: "मूल (Mūlā)",
    tattva: "jala",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 9,
        rashiName: "Sagittarius",
        sanskritName: "धनु (Dhanu)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Sagittarius (Dhanu)",
      },
    ],
  },
  20: {
    nakshatraNumber: 20,
    nakshatraName: "Purvashada",
    sanskritName: "पूर्वाषाढा (Pūrvāṣāḍhā)",
    tattva: "jala",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 9,
        rashiName: "Sagittarius",
        sanskritName: "धनु (Dhanu)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Sagittarius (Dhanu)",
      },
    ],
  },
  21: {
    nakshatraNumber: 21,
    nakshatraName: "Uttarashada",
    sanskritName: "उत्तराषाढा (Uttarāṣāḍhā)",
    tattva: "prithvi",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 9,
        rashiName: "Sagittarius",
        sanskritName: "धनु (Dhanu)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1],
        padaDescription: "Pada 1 in Sagittarius (Dhanu - Right)",
      },
      {
        rashiNumber: 10,
        rashiName: "Capricorn",
        sanskritName: "मकर (Makara)",
        nadi: "ida",
        nostril: "Left",
        padas: [2, 3, 4],
        padaDescription: "Padas 2, 3, 4 in Capricorn (Makara - Left)",
      },
    ],
  },
  22: {
    nakshatraNumber: 22,
    nakshatraName: "Shravana",
    sanskritName: "श्रवण (Śravaṇā)",
    tattva: "prithvi",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 10,
        rashiName: "Capricorn",
        sanskritName: "मकर (Makara)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Capricorn (Makara)",
      },
    ],
  },
  23: {
    nakshatraNumber: 23,
    nakshatraName: "Dhanishta",
    sanskritName: "धनिष्ठा (Dhaniṣṭhā)",
    tattva: "prithvi",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 10,
        rashiName: "Capricorn",
        sanskritName: "मकर (Makara)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2],
        padaDescription: "Padas 1, 2 (1st half) in Capricorn (Makara - Left)",
      },
      {
        rashiNumber: 11,
        rashiName: "Aquarius",
        sanskritName: "कुम्भ (Kumbha)",
        nadi: "pingala",
        nostril: "Right",
        padas: [3, 4],
        padaDescription: "Padas 3, 4 (2nd half) in Aquarius (Kumbha - Right)",
      },
    ],
  },
  24: {
    nakshatraNumber: 24,
    nakshatraName: "Shatabhisha",
    sanskritName: "शतभिषा (Śatabhiṣā)",
    tattva: "jala",
    defaultNadi: "pingala",
    primaryNostril: "Right",
    spans: [
      {
        rashiNumber: 11,
        rashiName: "Aquarius",
        sanskritName: "कुम्भ (Kumbha)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Aquarius (Kumbha)",
      },
    ],
  },
  25: {
    nakshatraNumber: 25,
    nakshatraName: "Purva Bhadrapada",
    sanskritName: "पूर्वाभाद्रपदा (Pūrvābhādrā)",
    tattva: "tejas",
    defaultNadi: "mixed",
    primaryNostril: "Mixed",
    spans: [
      {
        rashiNumber: 11,
        rashiName: "Aquarius",
        sanskritName: "कुम्भ (Kumbha)",
        nadi: "pingala",
        nostril: "Right",
        padas: [1, 2, 3],
        padaDescription: "Padas 1, 2, 3 in Aquarius (Kumbha - Right)",
      },
      {
        rashiNumber: 12,
        rashiName: "Pisces",
        sanskritName: "मीन (Mīna)",
        nadi: "ida",
        nostril: "Left",
        padas: [4],
        padaDescription: "Pada 4 in Pisces (Meena - Left)",
      },
    ],
  },
  26: {
    nakshatraNumber: 26,
    nakshatraName: "Uttara Bhadrapada",
    sanskritName: "उत्तराभाद्रपदा (Uttarābhādrā)",
    tattva: "jala",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 12,
        rashiName: "Pisces",
        sanskritName: "मीन (Mīna)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Pisces (Meena)",
      },
    ],
  },
  27: {
    nakshatraNumber: 27,
    nakshatraName: "Revati",
    sanskritName: "रेवती (Revatī)",
    tattva: "jala",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 12,
        rashiName: "Pisces",
        sanskritName: "मीन (Mīna)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "All 4 Padas in Pisces (Meena)",
      },
    ],
  },
  28: {
    nakshatraNumber: 28,
    nakshatraName: "Abhijit",
    sanskritName: "अभिजित् (Abhijit)",
    tattva: "prithvi",
    defaultNadi: "ida",
    primaryNostril: "Left",
    spans: [
      {
        rashiNumber: 10,
        rashiName: "Capricorn",
        sanskritName: "मकर (Makara)",
        nadi: "ida",
        nostril: "Left",
        padas: [1, 2, 3, 4],
        padaDescription: "Intercalary Star in Capricorn (Makara)",
      },
    ],
  },
};

/**
 * Normalizes and resolves a Nakshatra definition by number (1..28) or name.
 */
export function getNakshatraDefinition(nakInput: number | string): NakshatraNadiDefinition {
  if (typeof nakInput === "number" && NAKSHATRA_NADI_DEFINITIONS[nakInput]) {
    return NAKSHATRA_NADI_DEFINITIONS[nakInput];
  }

  const str = String(nakInput)
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  for (const def of Object.values(NAKSHATRA_NADI_DEFINITIONS)) {
    const dName = def.nakshatraName.toLowerCase().replace(/[^a-z]/g, "");
    if (dName.includes(str) || str.includes(dName)) {
      return def;
    }
  }

  // Default fallback to Ashwini
  return NAKSHATRA_NADI_DEFINITIONS[1];
}

/**
 * Evaluates the precise alignment between the active Tithi Cycle (Swarodaya Sunrise/Day Breath)
 * and the Star Channel (Nakshatra-Nadi / Parent Rashi) along with the Star's Element (Tattva).
 *
 * Implements the Classical Shiva Swarodaya Algorithm:
 * 1. Check Tithi Rule: Required nostril (Left for Shukla 1-3, etc.)
 * 2. Check Star Rule: Nostril supported by the star's parent zodiac sign (Odd = Pingala, Even = Ida)
 * 3. Check Star Element: Earth, Water, Fire, Air, Ether
 * 4. App Output:
 *    - Nostril Alignment: Perfect / Neutral / Incompatible
 *    - Element Warning: Quality & specific caution (e.g. Fire = Aggression/Heat)
 *    - Actionable Vedic Advice synthesis
 */
export function evaluateNakshatraSwaraAlignment(
  tithiNumber: number,
  nakshatraInput: number | string,
  pada?: number,
  rashiNumber?: number,
): NakshatraSwaraAlignmentResult {
  const normalizedTithi = Math.max(1, Math.min(30, Math.floor(tithiNumber || 1)));
  const tithiRule = getSwaraForTithiNumber(normalizedTithi);
  const requiredNadi = tithiRule.sunriseSwara;
  const requiredNostril = tithiRule.sunriseNostril;

  const nakDef = getNakshatraDefinition(nakshatraInput);
  const tattvaDetails = TATTVA_MASTER_TABLE[nakDef.tattva];

  let starNadi: "ida" | "pingala" | "mixed" = nakDef.defaultNadi;
  let starNostril: "Left" | "Right" | "Mixed" = nakDef.primaryNostril;
  let activeSpan: NakshatraNadiSpan = nakDef.spans[0];

  if (pada && pada >= 1 && pada <= 4) {
    const matching = nakDef.spans.find((s) => s.padas.includes(pada));
    if (matching) {
      activeSpan = matching;
      starNadi = matching.nadi;
      starNostril = matching.nostril;
    }
  } else if (rashiNumber && rashiNumber >= 1 && rashiNumber <= 12) {
    const matching = nakDef.spans.find((s) => s.rashiNumber === rashiNumber);
    if (matching) {
      activeSpan = matching;
      starNadi = matching.nadi;
      starNostril = matching.nostril;
    }
  } else if (nakDef.spans.length === 1) {
    starNadi = nakDef.spans[0].nadi;
    starNostril = nakDef.spans[0].nostril;
  }

  // Evaluate Alignment Score
  let alignmentRating: "Perfect" | "Neutral" | "Incompatible" = "Neutral";
  let alignmentIcon: "✅" | "⚠️" | "❌" = "⚠️";
  let alignmentStatus = {
    en: "Neutral / Transitional",
    hi: "तटस्थ / संधिकाल",
    sa: "मध्यमम्",
  };

  if (starNadi === "mixed") {
    alignmentRating = "Neutral";
    alignmentIcon = "⚠️";
    alignmentStatus = {
      en: `Neutral / Transitional (${nakDef.nakshatraName} spans both Ida & Pingala signs)`,
      hi: `तटस्थ / संधिकाल (${nakDef.nakshatraName} दोनों राशियों में विस्तृत है)`,
      sa: `मध्यमम् (उभयराशिगतम्)`,
    };
  } else if (starNadi === requiredNadi) {
    alignmentRating = "Perfect";
    alignmentIcon = "✅";
    alignmentStatus = {
      en: `Perfect (Day requires ${requiredNostril}, Star supports ${starNostril})`,
      hi: `उत्तम संरेखण (तिथि अनुसार ${requiredNostril === "Left" ? "वाम (इड़ा)" : "दक्षिण (पिङ्गला)"} आवश्यक, नक्षत्र ${starNostril === "Left" ? "वाम (इड़ा)" : "दक्षिण (पिङ्गला)"} का समर्थक)`,
      sa: `परमोत्कृष्टम् (${requiredNostril === "Left" ? "वामस्वरानुकूलम्" : "दक्षिणस्वरानुकूलम्"})`,
    };
  } else {
    alignmentRating = "Incompatible";
    alignmentIcon = "❌";
    alignmentStatus = {
      en: `Conflict (Day requires ${requiredNostril}, but Star supports ${starNostril})`,
      hi: `विपरीत / विरोध (तिथि अनुसार ${requiredNostril === "Left" ? "वाम" : "दक्षिण"} अपेक्षित, परन्तु नक्षत्र ${starNostril === "Left" ? "वाम" : "दक्षिण"} का पोषक)`,
      sa: `प्रतिकूलम् (स्वर-नक्षत्र-विरोधः)`,
    };
  }

  // Actionable Advice Generation
  let advice = {
    en: "",
    hi: "",
    sa: "",
  };

  if (alignmentRating === "Perfect") {
    if (nakDef.tattva === "tejas") {
      advice = {
        en: `The cosmic flow is aligned with your breath (${requiredNostril}), but the nature of the star is Fiery. Success is likely, but expect heat, aggression, or high energy consumption.`,
        hi: `ब्रह्माण्डीय प्राण प्रवाह आपकी श्वास (${requiredNostril === "Left" ? "वाम" : "दक्षिण"}) के पूर्णतः अनुकूल है, किन्तु नक्षत्र की प्रकृति आग्नेयी (तेजस्वी) है। कार्यसिद्धि की पूर्ण संभावना है, परन्तु उष्णता, आक्रामकता अथवा उच्च ऊर्जा व्यय की अपेक्षा रखें।`,
        sa: `प्राणप्रवाहः भवदीयश्वासस्य (${requiredNostril === "Left" ? "वामनासायाः" : "दक्षिणनासायाः"}) अनुकूलः अस्ति, किन्तु नक्षत्रस्वभावः आग्नेयः। कार्यसिद्धिः सम्भवा, परं तीक्ष्णता-परितापाभ्यां सावधानता विधेया।`,
      };
    } else if (nakDef.tattva === "prithvi") {
      advice = {
        en: `The cosmic flow is aligned with your breath (${requiredNostril}) and deeply anchored in the Earth element. Superb for construction, farming, contracts, and steady enduring success.`,
        hi: `प्राण प्रवाह आपकी श्वास (${requiredNostril === "Left" ? "वाम" : "दक्षिण"}) के अनुकूल है तथा पृथ्वी तत्त्व में प्रतिष्ठित है। भवन निर्माण, कृषि, स्थायी अनुबंध एवं सुदृढ़ सफलता हेतु परम कल्याणकारी।`,
        sa: `प्राणप्रवाहः श्वासानुकूलः पृथ्वीतत्त्वप्रतिष्ठितश्च। स्थिरकार्यार्थं गृहनिर्माणार्थं च परमश्रेष्ठम्।`,
      };
    } else if (nakDef.tattva === "jala") {
      advice = {
        en: `The cosmic flow is aligned with your breath (${requiredNostril}) and nourished by the Water element. Auspicious for peaceful negotiations, travel, liquid works, and harmonious relationships.`,
        hi: `प्राण प्रवाह श्वास (${requiredNostril === "Left" ? "वाम" : "दक्षिण"}) के अनुकूल है एवं जल तत्त्व से समृद्ध है। यात्रा, शांति वार्ता, जल कार्य, व्यापार एवं संबंधों में सौहार्द हेतु अति शुभ।`,
        sa: `प्राणप्रवाहः श्वासानुकूलः जलतत्त्वसमृद्धश्च। यात्रा-मैत्री-शान्तिकर्मसु शुभप्रदम्।`,
      };
    } else if (nakDef.tattva === "vayu") {
      advice = {
        en: `The cosmic flow is aligned with your breath (${requiredNostril}), but the star is Airy. Favorable for swift movements, communications, and travel, but unstable for permanent commitments.`,
        hi: `प्राण प्रवाह श्वास (${requiredNostril === "Left" ? "वाम" : "दक्षिण"}) के अनुकूल है, किन्तु नक्षत्र वायु तत्त्व प्रधान (चंचल) है। त्वरित यात्रा व संचार हेतु उत्तम; स्थायी निर्माण में सावधानी रखें।`,
        sa: `प्राणप्रवाहः अनुकूलः किन्तु वायुतत्त्वचञ्चलम्। शीघ्रगमनाय उत्तमम्, स्थिरकर्मसु सावधानता युक्ता।`,
      };
    } else {
      advice = {
        en: `The cosmic flow is aligned with your breath (${requiredNostril}) in the spiritual Ether realm. Favorable exclusively for meditation, silence, and mantra japa; void for material endeavors.`,
        hi: `प्राण प्रवाह श्वास के अनुकूल है तथा आकाश तत्त्व में स्थित है। केवल ध्यान, मौन एवं मन्त्र साधना हेतु उत्तम; सांसारिक कार्यों का फल शून्य रहेगा।`,
        sa: `प्राणप्रवाहः आकाशतत्त्वे स्थितः। केवलं ध्यानजपार्थं हितम्, लौकिककार्याणि निष्फलानि।`,
      };
    }
  } else if (alignmentRating === "Incompatible") {
    advice = {
      en: `Caution: Pranic breath requirement (${requiredNostril}) conflicts with the star channel (${starNostril}). The star's nature is ${tattvaDetails.name.en}. Postpone volatile or critical undertakings, or practice pranayama to balance your breath.`,
      hi: `सावधानी: तिथि अनुसार अपेक्षित श्वास (${requiredNostril === "Left" ? "वाम" : "दक्षिण"}) और नक्षत्र चैनल (${starNostril === "Left" ? "वाम" : "दक्षिण"}) में विरोध है। नक्षत्र ${tattvaDetails.name.hi} है। अति महत्वपूर्ण कार्यों को टालें अथवा प्राणायाम द्वारा स्वर को अनुकूल करें।`,
      sa: `सावधानता: स्वरनक्षत्रयोः विरोधः वर्तते। नक्षत्रं ${tattvaDetails.name.sa}। महत्त्वपूर्णकार्यं स्थगयन्तु, प्राणायामेन स्वरं नियमयन्तु।`,
    };
  } else {
    advice = {
      en: `Transitional cosmic flow: ${nakDef.nakshatraName} spans both solar and lunar zodiac signs. Verify your currently active nostril and pada before vital endeavors.`,
      hi: `संधिकाल प्रवाह: ${nakDef.nakshatraName} सूर्य एवं चन्द्र दोनों राशियों में विस्तृत है। किसी भी महत्वपूर्ण कार्य से पूर्व अपने वर्तमान सक्रिय स्वर एवं चरण की स्थिति अवश्य जांचें।`,
      sa: `उभयराशिगतः प्रवाहः। स्वरस्य चरणस्य च परीक्षणं कृत्वा एव कार्यं साधयन्तु।`,
    };
  }

  const elementWarning = tattvaDetails.warning || {
    en: "Standard elemental flow.",
    hi: "सामान्य तत्त्व प्रवाह।",
    sa: "सामान्यतत्त्वप्रवाहः।",
  };

  return {
    tithiNumber: normalizedTithi,
    tithiName: tithiRule.tithiName,
    paksha: tithiRule.paksha,
    requiredNadi: requiredNadi as "ida" | "pingala",
    requiredNostril,
    nakshatraNumber: nakDef.nakshatraNumber,
    nakshatraName: nakDef.nakshatraName,
    sanskritName: nakDef.sanskritName,
    selectedPada: pada,
    activeRashiNumber: activeSpan.rashiNumber,
    activeRashiName: activeSpan.rashiName,
    activeRashiSanskrit: activeSpan.sanskritName,
    starNadi,
    starNostril,
    alignmentRating,
    alignmentIcon,
    alignmentStatus,
    tattva: nakDef.tattva,
    tattvaDetails,
    elementWarning,
    advice,
  };
}
