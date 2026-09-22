import type { ActiveView } from "../components/Header";

export interface ViewMeta {
  id: ActiveView;
  titleEn: string;
  titleHi: string;
  sanskrit: string;
  descEn: string;
  descHi: string;
  icon: string;
  category: "core" | "astrology" | "esoteric" | "calendar";
  badge?: { en: string; hi: string };
}

export const ALL_VIEW_METAS: ViewMeta[] = [
  {
    id: "home",
    titleEn: "Home Hub",
    titleHi: "मुख्य पृष्ठ (होम)",
    sanskrit: "मुख्य-केन्द्रम्",
    descEn: "Customizable central dashboard for all Vedic tools and personal preferences",
    descHi: "सभी पंचांग, ज्योतिष व साधना साधनों का एकीकृत डैशबोर्ड व अनुकूलन",
    icon: "🏠",
    category: "core",
    badge: { en: "Hub", hi: "केन्द्र" },
  },
  {
    id: "panchanga",
    titleEn: "Daily Panchanga",
    titleHi: "दैनिक पंचांग",
    sanskrit: "दैनिक पञ्चाङ्गम्",
    descEn: "Five Limbs of Time: Tithi, Vaara, Nakshatra, Yoga, and Karana with precision Drik calculations",
    descHi: "पञ्चाङ्ग के पाँच अंग: तिथि, वार, नक्षत्र, योग और करण की शुद्ध दृग्गणित गणना",
    icon: "☀️",
    category: "core",
  },
  {
    id: "today",
    titleEn: "Today Schedule",
    titleHi: "दैनिक समय-सारणी",
    sanskrit: "दैनंदिनी कार्यतालिका",
    descEn: "Minute-by-minute timeline integrating Muhurtas, 24 Horas, Nadi and Tattva micro-periods",
    descHi: "प्रातः से रात्रि तक मुहूर्त, 24 होरा, नाड़ी व पंच-तत्त्व की समयबद्ध सारणी",
    icon: "📋",
    category: "core",
    badge: { en: "Live", hi: "सजीव" },
  },
  {
    id: "timings",
    titleEn: "Muhurtas & Timings",
    titleHi: "शुभ-अशुभ मुहूर्त",
    sanskrit: "शुभ-अशुभ मुहूर्ताः",
    descEn: "Abhijit, Brahma, Godhuli, Amrit, Rahu Kalam, Yamaganda, Gauri & Day-Night Choghadiya",
    descHi: "अभिजीत, ब्रह्म, गोधूलि, अमृत, राहु काल, यमगण्ड, गौरी व दिन-रात चौघड़िया",
    icon: "⏰",
    category: "core",
  },
  {
    id: "planets",
    titleEn: "Planetary Ephemeris",
    titleHi: "ग्रह स्थिति व गोचर",
    sanskrit: "नवग्रह स्पष्ट स्थितिः",
    descEn: "High-precision planetary degrees, zodiac ingress, combustion, retrogression and lunar phase",
    descHi: "नवग्रहों के स्पष्ट भोगांश, राशि गोचर, अस्त-उदय, वक्री स्थिति व चंद्र कला",
    icon: "🪐",
    category: "astrology",
  },
  {
    id: "kundli",
    titleEn: "Janm Kundli & Charts",
    titleHi: "जन्म कुण्डली व अष्टकवर्ग",
    sanskrit: "जन्म कुण्डली विधा",
    descEn: "Lagna, Navamsha, Vimshottari Mahadasha, KP Astrology, Ashtakavarga and Bhava Chalit",
    descHi: "लग्न, नवांश, विंशोत्तरी महादशा, केपी ज्योतिष, अष्टकवर्ग व भाव चलित चक्र",
    icon: "☸️",
    category: "astrology",
    badge: { en: "11 Charts", hi: "11 विधाएं" },
  },
  {
    id: "navagraha",
    titleEn: "Navagraha Mantras & Remedies",
    titleHi: "नवग्रह मन्त्र व उपाय",
    sanskrit: "नवग्रह स्तोत्र मन्त्राः",
    descEn: "Vedic seed mantras, tantric chants, planetary Gayatri, gemstones, herbs and sacred remedies",
    descHi: "वैदिक बीज मन्त्र, तान्त्रिक मन्त्र, ग्रह गायत्री, रत्न, दान व शांति उपाय",
    icon: "🕉️",
    category: "astrology",
  },
  {
    id: "swara",
    titleEn: "Swara Yoga & Nadi",
    titleHi: "स्वर योग व नाड़ी विज्ञान",
    sanskrit: "शिव स्वरोदय विज्ञानम्",
    descEn: "Breath flow wisdom from Shiva Swarodaya: Ida (Lunar), Pingala (Solar) & Sushumna active nostril",
    descHi: "शिव स्वरोदय अनुसार इड़ा (वाम), पिंगला (दायाँ) व सुषुम्ना नाड़ी और शुभ कार्य परामर्श",
    icon: "🌬️",
    category: "esoteric",
  },
  {
    id: "navtara",
    titleEn: "Navtara Chakra",
    titleHi: "नवतारा चक्र साधन",
    sanskrit: "नवतारा चक्रम्",
    descEn: "9 Tara alignments from Birth Star (Janma) to Sampat, Vipat, Kshema, Pratyari & Sadhaka",
    descHi: "जन्म नक्षत्र से सम्पद, विपत, क्षेम, प्रत्यरि, साधक व अति-मित्र तारा की गणना",
    icon: "⭐",
    category: "esoteric",
  },
  {
    id: "horas",
    titleEn: "24 Vedic Horas",
    titleHi: "वैदिक 24 होरा चक्र",
    sanskrit: "अहोरात्र होरा चक्रम्",
    descEn: "24 Hourly planetary rulers from local sunrise with integrated Nadi (Lunar/Solar) and 5 Tattvas",
    descHi: "सूर्योदय से 24 घंटों का ग्रह होरा चक्र, सम्बद्ध नाड़ी (इड़ा/पिंगला) व पंच-तत्त्व क्रम",
    icon: "🕐",
    category: "esoteric",
  },
  {
    id: "tattva",
    titleEn: "Pancha Tattva Sadhana",
    titleHi: "पंच तत्त्व साधन",
    sanskrit: "पंच महाभूत तत्त्वम्",
    descEn: "Akasha, Vayu, Agni, Prithvi & Jala elemental cycles, directions, colors and meditation guides",
    descHi: "आकाश, वायु, अग्नि, पृथ्वी व जल तत्त्व की समय अवधि, दिशा, वर्ण व ध्यान विधि",
    icon: "✨",
    category: "esoteric",
  },
  {
    id: "calendar",
    titleEn: "Monthly Calendar",
    titleHi: "मासिक पंचांग",
    sanskrit: "मासिक पञ्चाङ्ग पत्रकम्",
    descEn: "Complete month-at-a-glance grid with Shukla/Krishna Pakshas, Sankrantis and moon phases",
    descHi: "मासिक पंचांग ग्रिड, शुक्ल व कृष्ण पक्ष, संक्रांति, एकादशी व चंद्र कलाएं",
    icon: "📅",
    category: "calendar",
  },
  {
    id: "festivals",
    titleEn: "Festivals & Vratas",
    titleHi: "पर्व, व्रत व त्यौहार",
    sanskrit: "व्रत-उत्सव विवरणम्",
    descEn: "Ekadashi, Pradosha, Purnima, Amavasya, Jayantis, Vratas and regional Sanatana celebrations",
    descHi: "एकादशी, प्रदोष, पूर्णिमा, अमावस्या, संक्रांति, जयंती व मुख्य हिंदू पर्व",
    icon: "🪔",
    category: "calendar",
    badge: { en: "Vrats", hi: "पर्व" },
  },
];

export const DEFAULT_ORDERED_VIEWS: ActiveView[] = ALL_VIEW_METAS.map((m) => m.id);

export interface NavPreferences {
  orderedViews: ActiveView[];
  defaultLandingView: ActiveView;
  layoutFormat: "grid" | "list";
}

export const DEFAULT_NAV_PREFERENCES: NavPreferences = {
  orderedViews: DEFAULT_ORDERED_VIEWS,
  defaultLandingView: "home",
  layoutFormat: "grid",
};

const NAV_STORAGE_KEY = "mahavtaar_nav_preferences_v2";

/**
 * Load navigation preferences from localStorage
 */
export function getStoredNavPreferences(): NavPreferences {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_NAV_PREFERENCES;
  }
  try {
    const raw = window.localStorage.getItem(NAV_STORAGE_KEY);
    if (!raw) return DEFAULT_NAV_PREFERENCES;
    const parsed = JSON.parse(raw);

    // Validate and sanitize orderedViews
    const validViews = new Set(ALL_VIEW_METAS.map((m) => m.id));
    let views: ActiveView[] = Array.isArray(parsed.orderedViews)
      ? parsed.orderedViews.filter((v: ActiveView) => validViews.has(v))
      : [];

    // Append any missing views
    ALL_VIEW_METAS.forEach((m) => {
      if (!views.includes(m.id)) {
        views.push(m.id);
      }
    });

    if (views.length === 0) {
      views = [...DEFAULT_ORDERED_VIEWS];
    }

    const defaultLandingView = validViews.has(parsed.defaultLandingView)
      ? parsed.defaultLandingView
      : "home";

    const layoutFormat =
      parsed.layoutFormat === "list" || parsed.layoutFormat === "grid"
        ? parsed.layoutFormat
        : "grid";

    return {
      orderedViews: views,
      defaultLandingView,
      layoutFormat,
    };
  } catch (err) {
    console.warn("Failed to load nav preferences:", err);
    return DEFAULT_NAV_PREFERENCES;
  }
}

/**
 * Save navigation preferences to localStorage
 */
export function saveNavPreferences(prefs: NavPreferences): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch (err) {
    console.error("Failed to save nav preferences:", err);
    return false;
  }
}

/**
 * Reorder view by moving it up (towards the beginning)
 */
export function moveViewUp(list: ActiveView[], id: ActiveView): ActiveView[] {
  const index = list.indexOf(id);
  if (index <= 0) return list;
  const next = [...list];
  const temp = next[index - 1];
  next[index - 1] = next[index];
  next[index] = temp;
  return next;
}

/**
 * Reorder view by moving it down (towards the end)
 */
export function moveViewDown(list: ActiveView[], id: ActiveView): ActiveView[] {
  const index = list.indexOf(id);
  if (index < 0 || index >= list.length - 1) return list;
  const next = [...list];
  const temp = next[index + 1];
  next[index + 1] = next[index];
  next[index] = temp;
  return next;
}
