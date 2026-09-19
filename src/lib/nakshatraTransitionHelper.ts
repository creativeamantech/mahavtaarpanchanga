// ================================================================================
// NAKSHATRA TRANSITIONS & NAVTARA REPORT HELPER
// Classical Vedic computations for Nakshatra changes, transitions, and native reports
// ================================================================================

import type { PanchangaResponse, Segment, PlanetTransitionEvent } from "../types";
import {
  calculateNavtara,
  generateNavtaraTable,
  type NavtaraResult,
} from "./navtaraEngine";
import {
  generateComprehensiveVedicAnalysis,
  NAKSHATRA_DATA,
} from "./vedicAstrologyEngine";

export interface NakshatraStaticMeta {
  index: number;
  nameEn: string;
  nameHi: string;
  nameSa: string;
  lord: string;
  lordHi: string;
  deity: string;
  deityHi: string;
  tattva: "Prithvi (Earth)" | "Jala (Water)" | "Agni (Fire)" | "Vayu (Air)" | "Akasha (Ether)";
  tattvaHi: string;
  gana: "Deva" | "Manushya" | "Rakshasa";
  ganaHi: string;
  yoni: string;
  yoniHi: string;
  nadi: "Adi" | "Madhya" | "Antya";
  nadiHi: string;
  varna: "Brahmin" | "Kshatriya" | "Vaishya" | "Shudra";
  varnaHi: string;
  symbol: string;
  symbolHi: string;
  nature: string;
  natureHi: string;
}

export const ALL_27_NAKSHATRAS: NakshatraStaticMeta[] = [
  {
    index: 1,
    nameEn: "Ashwini",
    nameHi: "अश्विनी",
    nameSa: "अश्विनी",
    lord: "Ketu",
    lordHi: "केतु",
    deity: "Ashwini Kumaras (Physicians of Gods)",
    deityHi: "अश्विनी कुमार",
    tattva: "Prithvi (Earth)",
    tattvaHi: "पृथ्वी तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Horse (Ashwa)",
    yoniHi: "अश्व (घोड़ा)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Vaishya",
    varnaHi: "वैश्य",
    symbol: "Horse's Head",
    symbolHi: "अश्व का मुख",
    nature: "Light & Swift (Kshipra/Laghu)",
    natureHi: "लघु एवं क्षिप्र",
  },
  {
    index: 2,
    nameEn: "Bharani",
    nameHi: "भरणी",
    nameSa: "भरणी",
    lord: "Venus",
    lordHi: "शुक्र",
    deity: "Yama (God of Justice & Death)",
    deityHi: "यमराज",
    tattva: "Prithvi (Earth)",
    tattvaHi: "पृथ्वी तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Elephant (Gaja)",
    yoniHi: "गज (हाथी)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Mleccha / Outcaste",
    varnaHi: "म्लेच्छ",
    symbol: "Yoni (Vessel of Creation)",
    symbolHi: "योनि / सृजन पात्र",
    nature: "Fierce & Severe (Ugra)",
    natureHi: "उग्र एवं क्रूर",
  },
  {
    index: 3,
    nameEn: "Krittika",
    nameHi: "कृत्तिका",
    nameSa: "कृत्तिका",
    lord: "Sun",
    lordHi: "सूर्य",
    deity: "Agni (God of Fire)",
    deityHi: "अग्नि देव",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Sheep / Ram (Mesh)",
    yoniHi: "मेष (भेड़)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Brahmin",
    varnaHi: "ब्राह्मण",
    symbol: "Knife / Flame / Razor",
    symbolHi: "अग्नि शिखा / छुरिका",
    nature: "Mixed / Ordinary (Mishra)",
    natureHi: "मिश्र एवं साधारण",
  },
  {
    index: 4,
    nameEn: "Rohini",
    nameHi: "रोहिणी",
    nameSa: "रोहिणी",
    lord: "Moon",
    lordHi: "चन्द्र",
    deity: "Brahma / Prajapati (Creator)",
    deityHi: "ब्रह्मा / प्रजापति",
    tattva: "Prithvi (Earth)",
    tattvaHi: "पृथ्वी तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Serpent (Sarpa)",
    yoniHi: "सर्प",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Cart / Chariot / Temple",
    symbolHi: "रथ / शकट",
    nature: "Fixed & Permanent (Dhruva/Sthira)",
    natureHi: "ध्रुव एवं स्थिर",
  },
  {
    index: 5,
    nameEn: "Mrigashirsha",
    nameHi: "मृगशिरा",
    nameSa: "मृगशीर्षा",
    lord: "Mars",
    lordHi: "मंगल",
    deity: "Soma / Chandra (Nectar of Immortality)",
    deityHi: "सोम (चन्द्र देव)",
    tattva: "Prithvi (Earth)",
    tattvaHi: "पृथ्वी तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Serpent (Sarpa)",
    yoniHi: "सर्प",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Vaishya",
    varnaHi: "वैश्य",
    symbol: "Deer's Head",
    symbolHi: "मृग (हिरण) का सिर",
    nature: "Soft & Tender (Mridu)",
    natureHi: "मृदु एवं कोमल",
  },
  {
    index: 6,
    nameEn: "Ardra",
    nameHi: "आर्द्रा",
    nameSa: "आर्द्रा",
    lord: "Rahu",
    lordHi: "राहु",
    deity: "Rudra (Storm & Transformation)",
    deityHi: "रुद्र (भगवान शिव)",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Dog (Shvana)",
    yoniHi: "श्वान (कुत्ता)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Chandal / Outcaste",
    varnaHi: "चाण्डाल",
    symbol: "Teardrop / Diamond",
    symbolHi: "अश्रु बिन्दु / मणिरत्न",
    nature: "Sharp & Dreadful (Tikshna/Daruna)",
    natureHi: "तीक्ष्ण एवं दारुण",
  },
  {
    index: 7,
    nameEn: "Punarvasu",
    nameHi: "पुनर्वसु",
    nameSa: "पुनर्वसुः",
    lord: "Jupiter",
    lordHi: "बृहस्पति (गुरु)",
    deity: "Aditi (Mother of Gods & Cosmic Light)",
    deityHi: "अदिति (देवमाता)",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Cat (Marjara)",
    yoniHi: "मार्जार (बिल्ली)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Vaishya",
    varnaHi: "वैश्य",
    symbol: "Bow & Quiver of Arrows",
    symbolHi: "धनुष एवं तूणीर",
    nature: "Movable & Ephemeral (Chara)",
    natureHi: "चर एवं गतिशील",
  },
  {
    index: 8,
    nameEn: "Pushya",
    nameHi: "पुष्य",
    nameSa: "पुष्यः",
    lord: "Saturn",
    lordHi: "शनि",
    deity: "Brihaspati (Priest & Guru of Gods)",
    deityHi: "बृहस्पति",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Goat / Sheep (Aja)",
    yoniHi: "छाग (बकरा)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Kshatriya",
    varnaHi: "क्षत्रिय",
    symbol: "Udder of Cow / Lotus / Wheel",
    symbolHi: "गाय का थन / कमल पुष्प",
    nature: "Light & Swift (Kshipra/Laghu)",
    natureHi: "लघु एवं क्षिप्र (सर्वश्रेष्ठ)",
  },
  {
    index: 9,
    nameEn: "Ashlesha",
    nameHi: "अश्लेषा",
    nameSa: "अश्लेषा",
    lord: "Mercury",
    lordHi: "बुध",
    deity: "Sarpas / Nagas (Serpent Kings)",
    deityHi: "सर्प / नागराज",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Cat (Marjara)",
    yoniHi: "मार्जार (बिल्ली)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Coiled Serpent",
    symbolHi: "कुण्डलित सर्प",
    nature: "Sharp & Dreadful (Tikshna)",
    natureHi: "तीक्ष्ण एवं दारुण",
  },
  {
    index: 10,
    nameEn: "Magha",
    nameHi: "मघा",
    nameSa: "मघा",
    lord: "Ketu",
    lordHi: "केतु",
    deity: "Pitris (Ancestral Spirits)",
    deityHi: "पितृगण",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Rat (Mushaka)",
    yoniHi: "मूषक (चूहा)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Royal Throne / Palanquin",
    symbolHi: "राज सिंहासन / पालकी",
    nature: "Fierce & Severe (Ugra)",
    natureHi: "उग्र एवं क्रूर",
  },
  {
    index: 11,
    nameEn: "Purva Phalguni",
    nameHi: "पूर्वाफाल्गुनी",
    nameSa: "पूर्वफाल्गुनी",
    lord: "Venus",
    lordHi: "शुक्र",
    deity: "Bhaga (God of Fortune & Prosperity)",
    deityHi: "भग देव",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Rat (Mushaka)",
    yoniHi: "मूषक (चूहा)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Brahmin",
    varnaHi: "ब्राह्मण",
    symbol: "Front Legs of Couch / Hammock",
    symbolHi: "मंच के अग्र पाद",
    nature: "Fierce & Severe (Ugra)",
    natureHi: "उग्र एवं क्रूर",
  },
  {
    index: 12,
    nameEn: "Uttara Phalguni",
    nameHi: "उत्तराफाल्गुनी",
    nameSa: "उत्तरफाल्गुनी",
    lord: "Sun",
    lordHi: "सूर्य",
    deity: "Aryaman (God of Patronage & Truth)",
    deityHi: "अर्यमा",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Cow / Bull (Gau)",
    yoniHi: "गौ (गाय)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Kshatriya",
    varnaHi: "क्षत्रिय",
    symbol: "Back Legs of Couch / Bed",
    symbolHi: "शैया के पिछले पाद",
    nature: "Fixed & Permanent (Dhruva)",
    natureHi: "ध्रुव एवं स्थिर",
  },
  {
    index: 13,
    nameEn: "Hasta",
    nameHi: "हस्त",
    nameSa: "हस्तः",
    lord: "Moon",
    lordHi: "चन्द्र",
    deity: "Savitar (Sun of Awakening Rays)",
    deityHi: "सविता (सूर्य)",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Buffalo (Mahisha)",
    yoniHi: "महिष (भैंस)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Vaishya",
    varnaHi: "वैश्य",
    symbol: "Open Hand / Clenched Fist",
    symbolHi: "खुली हथेली / मुट्ठी",
    nature: "Light & Swift (Kshipra/Laghu)",
    natureHi: "लघु एवं क्षिप्र",
  },
  {
    index: 14,
    nameEn: "Chitra",
    nameHi: "चित्रा",
    nameSa: "चित्रा",
    lord: "Mars",
    lordHi: "मंगल",
    deity: "Tvashtar / Vishvakarma (Divine Architect)",
    deityHi: "त्वष्टा / विश्वकर्मा",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Tiger (Vyaghra)",
    yoniHi: "व्याघ्र (बाघ)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Bright Jewel / Pearl",
    symbolHi: "चमकदार मणि / रत्न",
    nature: "Soft & Tender (Mridu)",
    natureHi: "मृदु एवं कोमल",
  },
  {
    index: 15,
    nameEn: "Swati",
    nameHi: "स्वाति",
    nameSa: "स्वाती",
    lord: "Rahu",
    lordHi: "राहु",
    deity: "Vayu (God of Wind & Prana)",
    deityHi: "वायु देव",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Buffalo (Mahisha)",
    yoniHi: "महिष (भैंसा)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Chandal / Butcher",
    varnaHi: "चाण्डाल",
    symbol: "Young Shoot / Coral / Sword",
    symbolHi: "पवन-कम्पित अंकुर",
    nature: "Movable & Dynamic (Chara)",
    natureHi: "चर एवं गतिशील",
  },
  {
    index: 16,
    nameEn: "Vishakha",
    nameHi: "विशाखा",
    nameSa: "विशाखा",
    lord: "Jupiter",
    lordHi: "बृहस्पति (गुरु)",
    deity: "Indragni (Indra & Agni joint forces)",
    deityHi: "इन्द्राग्नि",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Tiger (Vyaghra)",
    yoniHi: "व्याघ्र (बाघ)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Mleccha",
    varnaHi: "म्लेच्छ",
    symbol: "Triumphal Arch / Potter's Wheel",
    symbolHi: "विजय तोरण द्वार",
    nature: "Mixed / Ordinary (Mishra)",
    natureHi: "मिश्र एवं साधारण",
  },
  {
    index: 17,
    nameEn: "Anuradha",
    nameHi: "अनुराधा",
    nameSa: "अनुराधा",
    lord: "Saturn",
    lordHi: "शनि",
    deity: "Mitra (God of Divine Friendship & Light)",
    deityHi: "मित्र देव",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Deer / Hare (Mriga)",
    yoniHi: "मृग (हिरण)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Lotus Flower / Triumphal Staff",
    symbolHi: "कमल पुष्प / दण्ड",
    nature: "Soft & Tender (Mridu)",
    natureHi: "मृदु एवं मैत्रीपूर्ण",
  },
  {
    index: 18,
    nameEn: "Jyeshtha",
    nameHi: "ज्येष्ठा",
    nameSa: "ज्येष्ठा",
    lord: "Mercury",
    lordHi: "बुध",
    deity: "Indra (King of the Gods)",
    deityHi: "इन्द्र देव",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Deer (Mriga)",
    yoniHi: "मृग (हिरण)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Farmer / Shudra",
    varnaHi: "शूद्र",
    symbol: "Circular Amulet / Earring / Umbrella",
    symbolHi: "कुण्डल / छत्र / ताबीज",
    nature: "Sharp & Dreadful (Tikshna)",
    natureHi: "तीक्ष्ण एवं दारुण",
  },
  {
    index: 19,
    nameEn: "Mula",
    nameHi: "मूल",
    nameSa: "मूलम्",
    lord: "Ketu",
    lordHi: "केतु",
    deity: "Nirriti (Goddess of Dissolution & Roots)",
    deityHi: "निर्ऋति",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Dog (Shvana)",
    yoniHi: "श्वान (कुत्ता)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Butcher / Outcaste",
    varnaHi: "चाण्डाल",
    symbol: "Tied Bunch of Roots / Elephant Goad",
    symbolHi: "जड़ों का गुच्छा / अंकुश",
    nature: "Sharp & Dreadful (Tikshna)",
    natureHi: "तीक्ष्ण एवं दारुण",
  },
  {
    index: 20,
    nameEn: "Purva Ashadha",
    nameHi: "पूर्वाषाढ़ा",
    nameSa: "पूर्वाषाढा",
    lord: "Venus",
    lordHi: "शुक्र",
    deity: "Apas (Cosmic Waters of Invincibility)",
    deityHi: "आपः (जल देवी)",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Monkey (Vanara)",
    yoniHi: "वानर (बंदर)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Brahmin",
    varnaHi: "ब्राह्मण",
    symbol: "Winnowing Basket / Fan",
    symbolHi: "सूप / पंखा",
    nature: "Fierce & Severe (Ugra)",
    natureHi: "उग्र एवं अपराजेय",
  },
  {
    index: 21,
    nameEn: "Uttara Ashadha",
    nameHi: "उत्तराषाढ़ा",
    nameSa: "उत्तराषाढा",
    lord: "Sun",
    lordHi: "सूर्य",
    deity: "Vishvadevas (Universal Virtues & Gods)",
    deityHi: "विश्वेदेवाः",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Mongoose (Nakula)",
    yoniHi: "नकुल (नेवला)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Kshatriya",
    varnaHi: "क्षत्रिय",
    symbol: "Elephant Tusk / Small Bed",
    symbolHi: "हाथी का दांत / मंच",
    nature: "Fixed & Permanent (Dhruva)",
    natureHi: "ध्रुव एवं स्थिर (विजयी)",
  },
  {
    index: 22,
    nameEn: "Shravana",
    nameHi: "श्रवण",
    nameSa: "श्रवणम्",
    lord: "Moon",
    lordHi: "चन्द्र",
    deity: "Vishnu (Preserver of the Universe)",
    deityHi: "भगवान विष्णु",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Monkey (Vanara)",
    yoniHi: "वानर (बंदर)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Mleccha",
    varnaHi: "म्लेच्छ",
    symbol: "Three Footprints / Ear",
    symbolHi: "कर्ण (कान) / तीन पदचिह्न",
    nature: "Movable & Ephemeral (Chara)",
    natureHi: "चर एवं श्रवण-युक्त",
  },
  {
    index: 23,
    nameEn: "Dhanishta",
    nameHi: "धनिष्ठा",
    nameSa: "धनिष्ठा",
    lord: "Mars",
    lordHi: "मंगल",
    deity: "Ashta Vasus (Eight Gods of Abundance)",
    deityHi: "अष्ट वसु",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Lion (Simha)",
    yoniHi: "सिंह (शेर)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Musical Drum (Mridanga) / Flute",
    symbolHi: "मृदंग / बाँसुरी",
    nature: "Movable & Ephemeral (Chara)",
    natureHi: "चर एवं संगीतमय",
  },
  {
    index: 24,
    nameEn: "Shatabhisha",
    nameHi: "शतभिषा",
    nameSa: "शतभिषा",
    lord: "Rahu",
    lordHi: "राहु",
    deity: "Varuna (God of Cosmic Oceans & Truth)",
    deityHi: "वरुण देव",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व",
    gana: "Rakshasa",
    ganaHi: "राक्षस गण",
    yoni: "Horse (Ashwa)",
    yoniHi: "अश्व (घोड़ा)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Empty Circle / 100 Physicians / Flowers",
    symbolHi: "शून्य वृत्त / सौ वैद्य",
    nature: "Movable & Dynamic (Chara)",
    natureHi: "चर एवं रहस्यमयी",
  },
  {
    index: 25,
    nameEn: "Purva Bhadrapada",
    nameHi: "पूर्वाभाद्रपद",
    nameSa: "पूर्वभाद्रपदा",
    lord: "Jupiter",
    lordHi: "बृहस्पति (गुरु)",
    deity: "Aja Ekapada (One-Footed Cosmic Fire/Goat)",
    deityHi: "अजैकपाद",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Lion (Simha)",
    yoniHi: "सिंह (शेर)",
    nadi: "Adi",
    nadiHi: "आदि नाड़ी",
    varna: "Brahmin",
    varnaHi: "ब्राह्मण",
    symbol: "Swords / Two-Faced Man / Front of Funeral Bed",
    symbolHi: "खड्ग / द्विमुखी पुरुष",
    nature: "Fierce & Severe (Ugra)",
    natureHi: "उग्र एवं तपस्वी",
  },
  {
    index: 26,
    nameEn: "Uttara Bhadrapada",
    nameHi: "उत्तराभाद्रपद",
    nameSa: "उत्तरभाद्रपदा",
    lord: "Saturn",
    lordHi: "शनि",
    deity: "Ahirbudhnya (Serpent of the Deep Waters)",
    deityHi: "अहिर्बुध्न्य",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Manushya",
    ganaHi: "मनुष्य गण",
    yoni: "Cow (Gau)",
    yoniHi: "गौ (गाय)",
    nadi: "Madhya",
    nadiHi: "मध्य नाड़ी",
    varna: "Kshatriya",
    varnaHi: "क्षत्रिय",
    symbol: "Back of Funeral Bed / Snake in the Waters",
    symbolHi: "शैया के पिछले पाद",
    nature: "Fixed & Permanent (Dhruva)",
    natureHi: "ध्रुव एवं स्थिर (ज्ञानप्रद)",
  },
  {
    index: 27,
    nameEn: "Revati",
    nameHi: "रेवती",
    nameSa: "रेवती",
    lord: "Mercury",
    lordHi: "बुध",
    deity: "Pushan (Nourisher & Guide of Travelers)",
    deityHi: "पूषा (पोषणकर्ता)",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व",
    gana: "Deva",
    ganaHi: "देव गण",
    yoni: "Elephant (Gaja)",
    yoniHi: "गज (हाथी)",
    nadi: "Antya",
    nadiHi: "अन्त्य नाड़ी",
    varna: "Shudra",
    varnaHi: "शूद्र",
    symbol: "Pair of Fish / Drum / Journey Staff",
    symbolHi: "मत्स्य युगल (मछलियां)",
    nature: "Soft & Tender (Mridu)",
    natureHi: "मृदु एवं मोक्षप्रद",
  },
];

export interface ActiveNakshatraChangeInfo {
  currentSegment: Segment;
  currentNumber: number;
  currentNameEn: string;
  currentNameHi: string;
  startsFormatted: string;
  endsFormatted: string | null;
  startTimeMs: number;
  endTimeMs: number | null;
  timeRemainingMs: number | null;
  timeRemainingFormatted: string;
  progressPercentage: number;
  isChangingToday: boolean;
  nextSegment: Segment | null;
  nextNumber: number;
  nextNameEn: string;
  nextNameHi: string;
  nextStartsFormatted: string | null;
}

export function getActiveNakshatraChangeInfo(
  data: PanchangaResponse | null,
  nowMs: number = Date.now(),
): ActiveNakshatraChangeInfo | null {
  if (!data?.nakshatra || data.nakshatra.length === 0) return null;

  // Identify active segment based on time window
  const activeIdx = data.nakshatra.findIndex((seg) => {
    const start = seg.startTimeMs || 0;
    const end = seg.endTimeMs || Infinity;
    return nowMs >= start && nowMs < end;
  });

  const activeSegment = activeIdx !== -1 ? data.nakshatra[activeIdx] : data.nakshatra[0];
  const nextSegment =
    activeIdx !== -1 && activeIdx + 1 < data.nakshatra.length
      ? data.nakshatra[activeIdx + 1]
      : data.nakshatra.length > 1
        ? data.nakshatra[1]
        : null;

  const currentNumber = activeSegment.number || 1;
  const currentMeta =
    ALL_27_NAKSHATRAS.find((n) => n.index === currentNumber) || ALL_27_NAKSHATRAS[0];

  const nextNumber = nextSegment?.number || ((currentNumber % 27) + 1);
  const nextMeta =
    ALL_27_NAKSHATRAS.find((n) => n.index === nextNumber) || ALL_27_NAKSHATRAS[nextNumber - 1];

  const startTimeMs = activeSegment.startTimeMs || nowMs;
  const endTimeMs = activeSegment.endTimeMs || null;

  let timeRemainingMs: number | null = null;
  let timeRemainingFormatted = "";
  let progressPercentage = 50;

  if (endTimeMs && endTimeMs > nowMs) {
    timeRemainingMs = endTimeMs - nowMs;
    const totalDuration = endTimeMs - startTimeMs;
    if (totalDuration > 0) {
      const elapsed = nowMs - startTimeMs;
      progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }
    const hours = Math.floor(timeRemainingMs / 3600000);
    const minutes = Math.floor((timeRemainingMs % 3600000) / 60000);
    if (hours > 0) {
      timeRemainingFormatted = `${hours}h ${minutes}m (${hours} घंटे ${minutes} मिनट)`;
    } else {
      timeRemainingFormatted = `${minutes}m (${minutes} मिनट)`;
    }
  } else if (endTimeMs && endTimeMs <= nowMs) {
    timeRemainingFormatted = "Transitioned just now (अभी-अभी परिवर्तित हुआ)";
    progressPercentage = 100;
  } else {
    timeRemainingFormatted = "Runs past next sunrise (अगले सूर्योदय तक निरंतर)";
  }

  return {
    currentSegment: activeSegment,
    currentNumber,
    currentNameEn: currentMeta.nameEn,
    currentNameHi: currentMeta.nameHi,
    startsFormatted: activeSegment.starts ? formatSimple12hTime(activeSegment.starts, true) : "सूर्योदय से",
    endsFormatted: activeSegment.ends ? formatSimple12hTime(activeSegment.ends, true) : null,
    startTimeMs,
    endTimeMs,
    timeRemainingMs,
    timeRemainingFormatted,
    progressPercentage,
    isChangingToday: Boolean(activeSegment.ends),
    nextSegment,
    nextNumber,
    nextNameEn: nextMeta.nameEn,
    nextNameHi: nextMeta.nameHi,
    nextStartsFormatted: activeSegment.ends
      ? formatSimple12hTime(activeSegment.ends, true)
      : nextSegment?.starts
        ? formatSimple12hTime(nextSegment.starts, true)
        : null,
  };
}

export interface UpcomingPlanetaryNakshatraIngress {
  planet: string;
  planetHi: string;
  fromNakshatra: string;
  toNakshatra: string;
  exactDate: string;
  exactTime: string;
  timestamp: number;
  relativeFormatted: string;
}

export function getUpcomingNakshatraTransitions(
  data: PanchangaResponse | null,
): UpcomingPlanetaryNakshatraIngress[] {
  if (!data?.planet_transitions?.upcomingEvents) return [];

  const PLANET_HI_MAP: Record<string, string> = {
    Sun: "सूर्य",
    Moon: "चन्द्र",
    Mars: "मंगल",
    Mercury: "बुध",
    Jupiter: "बृहस्पति (गुरु)",
    Venus: "शुक्र",
    Saturn: "शनि",
    Rahu: "राहु",
    Ketu: "केतु",
  };

  return data.planet_transitions.upcomingEvents
    .filter((e) => e.type === "nakshatra")
    .map((e) => {
      const p = e.planet;
      return {
        planet: p,
        planetHi: PLANET_HI_MAP[p] || p,
        fromNakshatra: e.from,
        toNakshatra: e.to,
        exactDate: e.date,
        exactTime: e.time ? formatSimple12hTime(e.time, true) : e.time,
        timestamp: e.timestamp,
        relativeFormatted: e.isToday ? "Today (आज)" : e.date,
      };
    });
}

export interface ComprehensiveNativeReport {
  personName: string;
  birthNakshatra: NakshatraStaticMeta;
  birthPada: number;
  activeTransit: {
    currentNakshatra: NakshatraStaticMeta;
    nextNakshatra: NakshatraStaticMeta;
    changeTimingText: string;
    currentTara: NavtaraResult;
    nextTara: NavtaraResult;
    timeRemainingFormatted: string;
    isChangingToday: boolean;
  } | null;
  paryaya1: NavtaraResult[];
  paryaya2: NavtaraResult[];
  paryaya3: NavtaraResult[];
  sensitiveRemedies: NavtaraResult[];
  gandantaDetails: {
    isGandanta: boolean;
    gandantaType: string | null;
  };
  vedicAnalysis: ReturnType<typeof generateComprehensiveVedicAnalysis>;
}

export function generateComprehensiveNativeReport(
  personName: string = "जातक (Native)",
  birthNakshatraIndex: number,
  birthPada: number = 1,
  data: PanchangaResponse | null,
  nowMs: number = Date.now(),
): ComprehensiveNativeReport {
  const meta =
    ALL_27_NAKSHATRAS.find((n) => n.index === birthNakshatraIndex) || ALL_27_NAKSHATRAS[0];

  const fullTable = generateNavtaraTable(birthNakshatraIndex);
  const paryaya1 = fullTable.filter((t) => t.paryaya === 1);
  const paryaya2 = fullTable.filter((t) => t.paryaya === 2);
  const paryaya3 = fullTable.filter((t) => t.paryaya === 3);
  const sensitiveRemedies = fullTable.filter((t) => t.paryaya === 1 && t.parihara);

  const changeInfo = getActiveNakshatraChangeInfo(data, nowMs);

  let activeTransit: ComprehensiveNativeReport["activeTransit"] = null;
  if (changeInfo) {
    const currMeta =
      ALL_27_NAKSHATRAS.find((n) => n.index === changeInfo.currentNumber) || ALL_27_NAKSHATRAS[0];
    const nxtMeta =
      ALL_27_NAKSHATRAS.find((n) => n.index === changeInfo.nextNumber) || ALL_27_NAKSHATRAS[0];

    const currentTara = calculateNavtara(birthNakshatraIndex, changeInfo.currentNumber);
    const nextTara = calculateNavtara(birthNakshatraIndex, changeInfo.nextNumber);

    activeTransit = {
      currentNakshatra: currMeta,
      nextNakshatra: nxtMeta,
      changeTimingText: changeInfo.endsFormatted
        ? `Ends at ${changeInfo.endsFormatted} (${changeInfo.timeRemainingFormatted})`
        : "Continues throughout the cycle",
      currentTara,
      nextTara,
      timeRemainingFormatted: changeInfo.timeRemainingFormatted,
      isChangingToday: changeInfo.isChangingToday,
    };
  }

  const approxMoonLong = (birthNakshatraIndex - 1) * 13.3333333 + (birthPada - 0.5) * 3.3333333;
  const vedicAnalysis = generateComprehensiveVedicAnalysis(
    approxMoonLong,
    "Jupiter",
    changeInfo
      ? {
          target_nakshatra_num: changeInfo.currentNumber,
          planet: "Moon",
          ashtakavarga_rekhas: 5,
        }
      : undefined,
  );

  return {
    personName: personName.trim() || "जातक (Native)",
    birthNakshatra: meta,
    birthPada,
    activeTransit,
    paryaya1,
    paryaya2,
    paryaya3,
    sensitiveRemedies,
    gandantaDetails: {
      isGandanta: vedicAnalysis.natal_nakshatra_info.is_gandanta,
      gandantaType: vedicAnalysis.natal_nakshatra_info.gandanta_type,
    },
    vedicAnalysis,
  };
}

// ================================================================================
// PADA (चरण / पद 1-4) COMPREHENSIVE EXPLANATIONS
// Classical Vedic breakdown explaining what Padas mean for ordinary users
// ================================================================================

export interface PadaInfo {
  pada: number;
  nameHi: string;
  nameEn: string;
  purushartha: "Dharma" | "Artha" | "Kama" | "Moksha";
  purusharthaHi: string;
  purusharthaEn: string;
  tattva: string;
  tattvaHi: string;
  navamshaSignGroup: string;
  navamshaSignGroupHi: string;
  shortSummaryHi: string;
  shortSummaryEn: string;
  detailedMeaningHi: string;
  detailedMeaningEn: string;
  keyStrengthsHi: string[];
  keyStrengthsEn: string[];
  recommendedActivitiesHi: string;
  recommendedActivitiesEn: string;
}

export const PADA_EXPLANATIONS: Record<number, PadaInfo> = {
  1: {
    pada: 1,
    nameHi: "प्रथम चरण (पद 1)",
    nameEn: "1st Pada (Quarter 1)",
    purushartha: "Dharma",
    purusharthaHi: "धर्म चरण (नवचेतना, कर्तव्य एवं शुरुआत)",
    purusharthaEn: "Dharma Pada (Initiation, Duty & Purpose)",
    tattva: "Agni (Fire)",
    tattvaHi: "अग्नि तत्व (ऊर्जावान व तेजस्वी)",
    navamshaSignGroup: "Aries, Leo, Sagittarius Navamsha",
    navamshaSignGroupHi: "मेष, सिंह, धनु नवांश (अग्नि त्रिकोण)",
    shortSummaryHi: "नई शुरुआत, साहस, नेतृत्व और स्वतंत्र संकल्प का प्रतीक।",
    shortSummaryEn: "Represents pioneering drive, courage, leadership, and bold new beginnings.",
    detailedMeaningHi:
      "प्रत्येक नक्षत्र का पहला पद 'धर्म' पुरुषार्थ और 'अग्नि तत्व' से संचालित होता है। यह जातक के भीतर नई ऊर्जा, संकल्प शक्ति, नेतृत्व क्षमता और किसी भी कार्य को अपने दम पर शुरू करने का साहस भरता है। ऐसे जातक अग्रणी और आत्मनिर्भर होते हैं।",
    detailedMeaningEn:
      "The first quarter represents Dharma and the Fire element. It bestows an enterprising, pioneering mindset with natural leadership, courage, and the capacity to initiate breakthrough projects independently.",
    keyStrengthsHi: ["प्रबल नेतृत्व क्षमता", "साहसी एवं स्पष्टवादी", "नवाचार व नई पहल"],
    keyStrengthsEn: ["Natural Leadership", "Bold & Decisive", "Pioneering Spirit"],
    recommendedActivitiesHi: "नई परियोजनाएं प्रारंभ करना, महत्वपूर्ण अनुबंध, नेतृत्व संभालना एवं स्वतंत्र निर्णय।",
    recommendedActivitiesEn: "Launching new initiatives, leadership responsibilities, and decisive strategic starts.",
  },
  2: {
    pada: 2,
    nameHi: "द्वितीय चरण (पद 2)",
    nameEn: "2nd Pada (Quarter 2)",
    purushartha: "Artha",
    purusharthaHi: "अर्थ चरण (स्थिरता, धन संचय व व्यावहारिकता)",
    purusharthaEn: "Artha Pada (Stability, Wealth & Practicality)",
    tattva: "Prithvi (Earth)",
    tattvaHi: "पृथ्वी तत्व (स्थिर, गंभीर व यथार्थवादी)",
    navamshaSignGroup: "Taurus, Virgo, Capricorn Navamsha",
    navamshaSignGroupHi: "वृषभ, कन्या, मकर नवांश (पृथ्वी त्रिकोण)",
    shortSummaryHi: "व्यावहारिक सोच, वित्तीय मजबूती, धैर्य और ठोस परिणाम।",
    shortSummaryEn: "Represents material grounding, tangible progress, financial prudence, and patient growth.",
    detailedMeaningHi:
      "प्रत्येक नक्षत्र का दूसरा पद 'अर्थ' पुरुषार्थ और 'पृथ्वी तत्व' से संचालित होता है। यह जातक को व्यावहारिक, यथार्थवादी, योजनाबद्ध और धन संचय में कुशल बनाता है। यह विचारों को ठोस जमीन पर उतारकर वास्तविक परिणाम देता है।",
    detailedMeaningEn:
      "The second quarter represents Artha and the Earth element. It grounds abstract aspirations into physical manifestations, ensuring practical execution, disciplined wealth preservation, and methodical growth.",
    keyStrengthsHi: ["योजनाबद्ध कार्यशैली", "वित्तीय विवेक व बचत", "धैर्यवान एवं भरोसेमंद"],
    keyStrengthsEn: ["Methodical Execution", "Financial Prudence", "Patient & Reliable"],
    recommendedActivitiesHi: "दीर्घकालिक निवेश, वित्तीय योजना, संपत्ति खरीद-बिक्री एवं ठोस व्यावहारिक कार्य।",
    recommendedActivitiesEn: "Long-term investments, budgeting, property matters, and systematic asset creation.",
  },
  3: {
    pada: 3,
    nameHi: "तृतीय चरण (पद 3)",
    nameEn: "3rd Pada (Quarter 3)",
    purushartha: "Kama",
    purusharthaHi: "काम चरण (संवाद, बौद्धिकता व सामाजिक संबंध)",
    purusharthaEn: "Kama Pada (Communication, Intellect & Relationships)",
    tattva: "Vayu (Air)",
    tattvaHi: "वायु तत्व (गतिशील, विचारशील व मिलनसार)",
    navamshaSignGroup: "Gemini, Libra, Aquarius Navamsha",
    navamshaSignGroupHi: "मिथुन, तुला, कुंभ नवांश (वायु त्रिकोण)",
    shortSummaryHi: "बौद्धिक संवाद, कलात्मक रुचि, मित्रता और सामाजिक संबंध।",
    shortSummaryEn: "Represents intellectual exchange, artistic aesthetics, networking, and social harmony.",
    detailedMeaningHi:
      "प्रत्येक नक्षत्र का तीसरा पद 'काम' पुरुषार्थ और 'वायु तत्व' से संचालित होता है। यह जातक को प्रभावशाली वक्ता, कलाप्रेमी, मिलनसार और सामाजिक रूप से जागरूक बनाता है। ऐसे जातक ज्ञान के आदान-प्रदान और लोगों से जुड़ने में निपुण होते हैं।",
    detailedMeaningEn:
      "The third quarter represents Kama and the Air element. It awakens intellectual curiosity, aesthetic expression, diplomacy, networking, and cooperative endeavors across society.",
    keyStrengthsHi: ["प्रभावशाली संवाद", "सृजनात्मक एवं कलात्मक", "सामाजिक संबंध निर्माण"],
    keyStrengthsEn: ["Expressive Communication", "Artistic Sensitivity", "Diplomatic Networking"],
    recommendedActivitiesHi: "साझेदारी, व्यापारिक बातचीत, जनसंपर्क, कला, मीडिया, अध्ययन व लेखन कार्य।",
    recommendedActivitiesEn: "Partnership negotiations, creative writing, public relations, and intellectual pursuits.",
  },
  4: {
    pada: 4,
    nameHi: "चतुर्थ चरण (पद 4)",
    nameEn: "4th Pada (Quarter 4)",
    purushartha: "Moksha",
    purusharthaHi: "मोक्ष चरण (अंतर्दृष्टि, शांति व कार्य समापन)",
    purusharthaEn: "Moksha Pada (Insight, Peace & Ultimate Completion)",
    tattva: "Jala (Water)",
    tattvaHi: "जल तत्व (भावुक, संवेदनशील व आध्यात्मिक)",
    navamshaSignGroup: "Cancer, Scorpio, Pisces Navamsha",
    navamshaSignGroupHi: "कर्क, वृश्चिक, मीन नवांश (जल त्रिकोण)",
    shortSummaryHi: "आध्यात्मिक शांति, अंतर्मन का ज्ञान, करुणा और कार्यों की पूर्णाहुति।",
    shortSummaryEn: "Represents spiritual wisdom, compassionate healing, introspection, and peaceful closure.",
    detailedMeaningHi:
      "प्रत्येक नक्षत्र का चौथा पद 'मोक्ष' पुरुषार्थ और 'जल तत्व' से संचालित होता है। यह जातक को संवेदनशील, दयालु, रहस्यवादी और गहरे आध्यात्मिक ज्ञान का धनी बनाता है। यह कार्यों के संपूर्ण समापन, शांति और मुक्ति का कारक है।",
    detailedMeaningEn:
      "The fourth quarter represents Moksha and the Water element. It provides emotional depth, spiritual intuition, healing capability, and the serene capacity to bring complicated cycles to full harmonious completion.",
    keyStrengthsHi: ["गहरी अंतर्दृष्टि", "दया एवं परोपकार", "आध्यात्मिक शांति"],
    keyStrengthsEn: ["Spiritual Intuition", "Compassionate Empathy", "Inner Peace & Closure"],
    recommendedActivitiesHi: "ध्यान, योग, आत्ममंथन, पुराने कार्यों का समापन, दान-पुण्य एवं आध्यात्मिक साधना।",
    recommendedActivitiesEn: "Meditation, charitable giving, concluding open projects, and inner spiritual rejuvenation.",
  },
};

// ================================================================================
// TIME FORMATTING UTILITIES (12-HOUR AM/PM WITH VEDIC/HINDI NATURAL PERIODS)
// ================================================================================

/**
 * Formats 24-hour time or Panchanga HMS times into an easy, intuitive 12-hour AM/PM format.
 * Includes natural period prefix (सुबह / दोपहर / शाम / रात) in Hindi mode.
 * Example inputs:
 *  - "14:23:45" -> "दोपहर 02:23 PM" (or "02:23 PM")
 *  - "08:15:00" -> "सुबह 08:15 AM"
 *  - "20:45:10" -> "रात 08:45 PM"
 *  - "26:15:00" -> "अगली सुबह 02:15 AM" (astronomical panchang time past midnight)
 */
export function formatSimple12hTime(
  timeStr: string | null | undefined,
  isHindi: boolean = true,
  includeDayPart: boolean = true
): string {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  if (!str) return "";

  // If already formatted with AM/PM
  if (/\b(AM|PM)\b/i.test(str)) {
    return str;
  }

  // Handle standard HH:MM(:SS)?
  const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    let rawH = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    let isNextDay = false;
    if (rawH >= 24) {
      rawH = rawH % 24;
      isNextDay = true;
    }

    const isPM = rawH >= 12;
    let h12 = rawH % 12;
    if (h12 === 0) h12 = 12;

    const mm = m.toString().padStart(2, "0");
    const hh = h12.toString().padStart(2, "0");
    const ampm = isPM ? "PM" : "AM";

    if (!includeDayPart) {
      return isNextDay 
        ? (isHindi ? `${hh}:${mm} ${ampm} (अगले दिन)` : `${hh}:${mm} ${ampm} (Next day)`)
        : `${hh}:${mm} ${ampm}`;
    }

    let period = "";
    if (isHindi) {
      if (isNextDay || rawH < 4) period = "रात";
      else if (rawH < 12) period = "सुबह";
      else if (rawH < 16) period = "दोपहर";
      else if (rawH < 20) period = "शाम";
      else period = "रात";

      return isNextDay
        ? `अगली सुबह ${hh}:${mm} ${ampm}`
        : `${period} ${hh}:${mm} ${ampm}`;
    } else {
      return isNextDay
        ? `${hh}:${mm} ${ampm} (Next day)`
        : `${hh}:${mm} ${ampm}`;
    }
  }

  // Try ISO date
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const isPM = hours >= 12;
    let h12 = hours % 12;
    if (h12 === 0) h12 = 12;
    const hh = h12.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    const ampm = isPM ? "PM" : "AM";

    if (!includeDayPart) {
      return `${hh}:${mm} ${ampm}`;
    }

    let period = "";
    if (isHindi) {
      if (hours < 4) period = "रात";
      else if (hours < 12) period = "सुबह";
      else if (hours < 16) period = "दोपहर";
      else if (hours < 20) period = "शाम";
      else period = "रात";
      return `${period} ${hh}:${mm} ${ampm}`;
    } else {
      return `${hh}:${mm} ${ampm}`;
    }
  }

  return str;
}

// ================================================================================
// 3 QUICK FEEDBACK OPTIONS DEFINITIONS
// ================================================================================
export const DAILY_FEEDBACK_OPTIONS = [
  {
    id: "great",
    rating: 5,
    feeling: "great" as const,
    icon: "🟢",
    labelHi: "शुभ / उत्तम",
    labelEn: "Auspicious",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    id: "neutral",
    rating: 3,
    feeling: "neutral" as const,
    icon: "🟡",
    labelHi: "सामान्य / ठीक",
    labelEn: "Average",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    buttonBg: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  {
    id: "challenging",
    rating: 1,
    feeling: "challenging" as const,
    icon: "🔴",
    labelHi: "चुनौतीपूर्ण / संभलकर",
    labelEn: "Challenging",
    badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
    buttonBg: "bg-rose-600 hover:bg-rose-700 text-white",
  },
];

// ================================================================================
// USER FEEDBACK & DAY EXPERIENCE TRACKER
// Persists user ratings, daily experiences, and journal entries to compare with predictions
// ================================================================================

export interface DailyUserFeedback {
  dateStr: string; // e.g. "01/09/2026"
  day: number;
  rating: number; // 1 to 5 stars
  feeling: "great" | "good" | "neutral" | "challenging" | "difficult";
  note: string;
  loggedAtMs: number;
}

export function getFeedbackStorageKey(personName: string, year: number, month: number): string {
  const sanitizedName = (personName || "self").trim().toLowerCase().replace(/\s+/g, "_");
  return `navtara_feedback_${sanitizedName}_${year}_${month}`;
}

export function loadStoredNavtaraFeedbacks(
  personName: string,
  year: number,
  month: number,
): Record<string, DailyUserFeedback> {
  if (typeof window === "undefined") return {};
  try {
    const key = getFeedbackStorageKey(personName, year, month);
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveDailyNavtaraFeedback(
  personName: string,
  year: number,
  month: number,
  feedback: DailyUserFeedback,
): Record<string, DailyUserFeedback> {
  if (typeof window === "undefined") return {};
  try {
    const key = getFeedbackStorageKey(personName, year, month);
    const current = loadStoredNavtaraFeedbacks(personName, year, month);
    current[feedback.dateStr] = feedback;
    localStorage.setItem(key, JSON.stringify(current));
    return current;
  } catch {
    return {};
  }
}

// ================================================================================
// MONTHLY NAVTARA & NAKSHATRA TRANSITIONS REPORT
// Generates full calendar month transitions with Navtara ratings and user feedback
// ================================================================================

export interface MonthlyNavtaraDayItem {
  day: number;
  date: string;
  vaara: string;
  tithi: string;
  tithiEnds: string | null;
  nakshatraName: string;
  nakshatraNumber: number;
  nakshatraEnds: string | null;
  nextNakshatraName: string | null;
  nextNakshatraNumber: number | null;
  moonRasi: string;
  currentTara: NavtaraResult;
  nextTara: NavtaraResult | null;
  dayNatureCategory: "auspicious" | "neutral" | "caution" | "mixed";
  recommendationHi: string;
  recommendationEn: string;
  userFeedback?: DailyUserFeedback;
}

export interface MonthlyNavtaraReportData {
  personName: string;
  birthNakshatra: NakshatraStaticMeta;
  birthPada: number;
  padaInfo: PadaInfo;
  year: number;
  month: number;
  cityName: string;
  days: MonthlyNavtaraDayItem[];
  stats: {
    totalDays: number;
    auspiciousCount: number;
    neutralCount: number;
    cautionCount: number;
    mixedCount: number;
    feedbackCount: number;
    averageFeedbackRating: number;
    matchedAuspiciousCount: number;
  };
  keyTransitions: Array<{
    date: string;
    day: number;
    fromNakshatra: string;
    toNakshatra: string;
    transitionTime: string;
    fromTaraName: string;
    fromTaraNature: string;
    toTaraName: string;
    toTaraNature: string;
    resultingTara: string;
  }>;
}

const MONTH_NAMES_HI = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getMonthNameHi(monthNum: number): string {
  return MONTH_NAMES_HI[(monthNum - 1) % 12] || `माह ${monthNum}`;
}

export function getMonthNameEn(monthNum: number): string {
  return MONTH_NAMES_EN[(monthNum - 1) % 12] || `Month ${monthNum}`;
}

export function computeMonthlyNavtaraReport(
  personName: string = "जातक (Native)",
  birthNakshatraIndex: number = 1,
  birthPada: number = 1,
  year: number,
  month: number,
  cityName: string = "New Delhi, IN",
  monthDays: any[] = [],
  userFeedbacks: Record<string, DailyUserFeedback> = {},
): MonthlyNavtaraReportData {
  const birthMeta =
    ALL_27_NAKSHATRAS.find((n) => n.index === birthNakshatraIndex) || ALL_27_NAKSHATRAS[0];
  const padaInfo = PADA_EXPLANATIONS[birthPada] || PADA_EXPLANATIONS[1];

  let auspiciousCount = 0;
  let neutralCount = 0;
  let cautionCount = 0;
  let mixedCount = 0;
  let feedbackSum = 0;
  let feedbackCount = 0;
  let matchedAuspiciousCount = 0;

  const keyTransitions: MonthlyNavtaraReportData["keyTransitions"] = [];

  const processedDays: MonthlyNavtaraDayItem[] = monthDays.map((d: any) => {
    // Determine active nakshatra number
    let nakNum = d.nakshatra_number;
    if (!nakNum || nakNum < 1 || nakNum > 27) {
      const match = ALL_27_NAKSHATRAS.find(
        (n) => n.nameEn.toLowerCase() === (d.nakshatra || "").toLowerCase() ||
               n.nameSa.toLowerCase() === (d.nakshatra || "").toLowerCase() ||
               n.nameHi === d.nakshatra
      );
      nakNum = match ? match.index : 1;
    }

    const currentTara = calculateNavtara(birthNakshatraIndex, nakNum);

    let nextTara: NavtaraResult | null = null;
    let nextNum = d.next_nakshatra_number;
    if (!nextNum && d.next_nakshatra) {
      const nMatch = ALL_27_NAKSHATRAS.find(
        (n) => n.nameEn.toLowerCase() === (d.next_nakshatra || "").toLowerCase() ||
               n.nameSa.toLowerCase() === (d.next_nakshatra || "").toLowerCase() ||
               n.nameHi === d.next_nakshatra
      );
      nextNum = nMatch ? nMatch.index : (nakNum % 27) + 1;
    }
    if (nextNum) {
      nextTara = calculateNavtara(birthNakshatraIndex, nextNum);
    }

    const formattedNakEnds = d.nakshatra_ends ? formatSimple12hTime(d.nakshatra_ends, true) : null;
    const formattedTithiEnds = d.tithi_ends ? formatSimple12hTime(d.tithi_ends, true) : null;

    const hasDistinctTaraChange =
      !!nextTara &&
      !!formattedNakEnds &&
      nextTara.tara_number !== currentTara.tara_number;

    const currentIsAuspicious =
      currentTara.nature.includes("Auspicious") || currentTara.tara_score >= 80;
    const currentIsCaution =
      currentTara.nature.includes("Inauspicious") || currentTara.tara_score <= 40;

    const nextIsAuspicious =
      nextTara ? (nextTara.nature.includes("Auspicious") || nextTara.tara_score >= 80) : false;
    const nextIsCaution =
      nextTara ? (nextTara.nature.includes("Inauspicious") || nextTara.tara_score <= 40) : false;

    // Determine category
    let category: MonthlyNavtaraDayItem["dayNatureCategory"] = "neutral";
    if (hasDistinctTaraChange && ((currentIsCaution && nextIsAuspicious) || (currentIsAuspicious && nextIsCaution))) {
      category = "mixed";
      mixedCount++;
    } else if (currentIsAuspicious) {
      category = "auspicious";
      auspiciousCount++;
    } else if (currentIsCaution) {
      category = "caution";
      cautionCount++;
    } else {
      category = "neutral";
      neutralCount++;
    }

    // Craft recommendations based on classical Tara
    const getTaraBriefAdvice = (t: NavtaraResult, isHi: boolean): string => {
      switch (t.tara_number) {
        case 1:
          return isHi ? "जन्म तारा (स्वास्थ्य व शांति पर ध्यान दें, जोखिम टालें)" : "Janma Tara (Focus on health, avoid risks)";
        case 2:
          return isHi ? "सम्पत् तारा (अति शुभ, धन लाभ व निवेश हेतु श्रेष्ठ)" : "Sampat Tara (Highly Auspicious for wealth & deals)";
        case 3:
          return isHi ? "विपत् तारा (सतर्कता, विवाद व यात्रा से बचें)" : "Vipat Tara (Caution, avoid disputes & risky travels)";
        case 4:
          return isHi ? "क्षेम तारा (शुभ, सुख-समृद्धि व मांगलिक कार्य)" : "Kshema Tara (Auspicious for family wellbeing & peace)";
        case 5:
          return isHi ? "प्रत्यरि तारा (बाधा की संभावना, धैर्य रखें)" : "Pratyari Tara (Obstacles possible, maintain patience)";
        case 6:
          return isHi ? "साधक तारा (अति शुभ, कार्य सिद्धि व पदोन्नति)" : "Sadhaka Tara (Highly Auspicious for success & goals)";
        case 7:
          return isHi ? "वध तारा (कठिन समय, नए व जोखिम भरे कार्य टालें)" : "Vadha Tara (Severe caution, postpone vital tasks)";
        case 8:
          return isHi ? "मित्र तारा (शुभ, सहयोग व आनंददायक परिणाम)" : "Mitra Tara (Auspicious for cooperation & joy)";
        case 9:
          return isHi ? "अति-मित्र तारा (परम शुभ, बड़े अनुबंध व विजय)" : "Ati-Mitra Tara (Supreme Auspicious, breakthroughs)";
        default:
          return isHi ? "सामान्य दिनचर्या" : "Standard routine";
      }
    };

    let recHi = "";
    let recEn = "";

    if (hasDistinctTaraChange && formattedNakEnds && nextTara) {
      recHi = `${formattedNakEnds} तक: ${getTaraBriefAdvice(currentTara, true)}। इसके बाद: ${getTaraBriefAdvice(nextTara, true)}।`;
      recEn = `Until ${formattedNakEnds}: ${getTaraBriefAdvice(currentTara, false)}. After ${formattedNakEnds}: ${getTaraBriefAdvice(nextTara, false)}.`;
    } else {
      switch (currentTara.tara_number) {
        case 1: // Janma
          recHi = "जन्म तारा: स्वास्थ्य एवं मानसिक शांति पर ध्यान दें, जोखिम भरे व नए कार्य टालें।";
          recEn = "Janma Tara: Focus on health, well-being, and internal harmony; avoid high risks.";
          break;
        case 2: // Sampat
          recHi = "सम्पत् तारा (अति शुभ): धन लाभ, व्यापारिक सौदे, निवेश एवं खरीदारी के लिए श्रेष्ठ दिन।";
          recEn = "Sampat Tara (Highly Auspicious): Best for financial gains, purchases, and investments.";
          break;
        case 3: // Vipat
          recHi = "विपत् तारा (सावधानी): अनचाहे विवाद, यात्रा व कानूनी कार्यों में सतर्क रहें। गायत्री मंत्र जपें।";
          recEn = "Vipat Tara (Caution): Avoid disputes, hazardous travels, and conflicts. Chant Gayatri mantra.";
          break;
        case 4: // Kshema
          recHi = "क्षेम तारा (अति शुभ): सुख-समृद्धि, पारिवारिक मांगलिक कार्य, यात्रा एवं आरोग्य लाभ।";
          recEn = "Kshema Tara (Auspicious): Favorable for family celebrations, pleasant travels, and health.";
          break;
        case 5: // Pratyari
          recHi = "प्रत्यरि तारा (बाधा): कार्य में विलंब या विरोध की संभावना; धैर्य रखें व वाद-विवाद से बचें।";
          recEn = "Pratyari Tara (Obstacles): Potential hurdles or opposition; maintain patience and diplomacy.";
          break;
        case 6: // Sadhaka
          recHi = "साधक तारा (अति शुभ): संकल्प सिद्धि, परीक्षा, साक्षात्कार, पदोन्नति एवं सफलता के अवसर।";
          recEn = "Sadhaka Tara (Highly Auspicious): Excellent for achievements, exams, interviews, and goal realization.";
          break;
        case 7: // Naidhana / Vadha
          recHi = "वध / निधन तारा (कष्टप्रद): नए अनुबंध व साहसिक कार्य न करें। महामृत्युंजय मंत्र का जप श्रेयस्कर है।";
          recEn = "Vadha Tara (Severe Caution): Postpone vital commitments; perform spiritual shanti or japa.";
          break;
        case 8: // Mitra
          recHi = "मित्र तारा (शुभ): मित्रों व सहयोगियों का सहयोग, व्यापार विस्तार, सुखद बैठकें व आनंद।";
          recEn = "Mitra Tara (Auspicious): Cooperative ventures, friendship, pleasant meetings, and joyous outcomes.";
          break;
        case 9: // Ati-Mitra
          recHi = "अति-मित्र तारा (परम शुभ): बड़े लाभ, सम्मान, दीर्घकालिक अनुबंध व महत्वपूर्ण कार्य निर्विघ्न संपन्न होंगे।";
          recEn = "Ati-Mitra Tara (Supreme Auspicious): Major breakthroughs, prestige, long-term deals, and triumph.";
          break;
        default:
          recHi = "सामान्य दिनचर्या का पालन करें।";
          recEn = "Follow standard routine with calm focus.";
      }
    }

    // Attach user feedback if present
    const fb = userFeedbacks[d.date];
    if (fb) {
      feedbackCount++;
      feedbackSum += fb.rating;
      if (category === "auspicious" && fb.rating >= 4) {
        matchedAuspiciousCount++;
      }
    }

    // Record key transitions during the day
    if (d.nakshatra_ends && d.next_nakshatra) {
      const fromTaraName = currentTara.tara_name;
      const fromTaraNature = currentTara.nature;
      const toTaraName = nextTara ? nextTara.tara_name : "";
      const toTaraNature = nextTara ? nextTara.nature : "";

      const transitionSummary = nextTara
        ? `${fromTaraName} (${fromTaraNature.includes("Auspicious") ? "शुभ" : fromTaraNature.includes("Inauspicious") ? "अशुभ" : "मध्यम"}) ➔ ${toTaraName} (${toTaraNature.includes("Auspicious") ? "शुभ" : toTaraNature.includes("Inauspicious") ? "अशुभ" : "मध्यम"})`
        : fromTaraName;

      keyTransitions.push({
        date: d.date,
        day: d.day,
        fromNakshatra: d.nakshatra,
        toNakshatra: d.next_nakshatra,
        transitionTime: formattedNakEnds || d.nakshatra_ends,
        fromTaraName,
        fromTaraNature,
        toTaraName,
        toTaraNature,
        resultingTara: transitionSummary,
      });
    }

    return {
      day: d.day,
      date: d.date,
      vaara: d.vaara || "",
      tithi: d.tithi || "",
      tithiEnds: formattedTithiEnds,
      nakshatraName: d.nakshatra || "",
      nakshatraNumber: nakNum,
      nakshatraEnds: formattedNakEnds,
      nextNakshatraName: d.next_nakshatra || null,
      nextNakshatraNumber: nextNum || null,
      moonRasi: d.moon_rasi || "",
      currentTara,
      nextTara,
      dayNatureCategory: category,
      recommendationHi: recHi,
      recommendationEn: recEn,
      userFeedback: fb,
    };
  });

  return {
    personName: personName.trim() || "जातक (Native)",
    birthNakshatra: birthMeta,
    birthPada,
    padaInfo,
    year,
    month,
    cityName,
    days: processedDays,
    stats: {
      totalDays: processedDays.length,
      auspiciousCount,
      neutralCount,
      cautionCount,
      mixedCount,
      feedbackCount,
      averageFeedbackRating: feedbackCount > 0 ? parseFloat((feedbackSum / feedbackCount).toFixed(1)) : 0,
      matchedAuspiciousCount,
    },
    keyTransitions,
  };
}
