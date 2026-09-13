// Vedic Astrological Reference Data & Attributes
import type { Language } from './i18n';

export interface TithiAttribute {
  deity: { en: string; hi: string; sa: string };
  category: { en: string; hi: string; sa: string }; // Nanda, Bhadra, Jaya, Rikta, Purna
  nature: { en: string; hi: string; sa: string };
}

export interface NakshatraAttribute {
  deity: { en: string; hi: string; sa: string };
  lord: { en: string; hi: string; sa: string };
  gana: { en: string; hi: string; sa: string }; // Deva, Manushya, Rakshasa
  symbol: string;
}

export interface YogaAttribute {
  nature: 'auspicious' | 'inauspicious';
  meaning: { en: string; hi: string; sa: string };
}

export interface KaranaAttribute {
  type: 'chara' | 'sthira'; // Movable or Fixed
  deity: { en: string; hi: string; sa: string };
}

// 15 Tithi Categories (repeating in Shukla & Krishna)
export const TITHI_ATTRIBUTES: Record<number, TithiAttribute> = {
  1: {
    deity: { en: 'Agni (Fire God)', hi: 'अग्नि देव', sa: 'अग्निदेवः' },
    category: { en: 'Nandā (Delightful)', hi: 'नन्दा (आनन्ददायिनी)', sa: 'नन्दा' },
    nature: { en: 'Favorable for festivals, celebrations, and new enterprises', hi: 'उत्सव व शुभ कार्यों हेतु उत्तम', sa: 'उत्सवकार्यार्थं शुभा' },
  },
  2: {
    deity: { en: 'Brahmā (Creator)', hi: 'ब्रह्मा जी', sa: 'ब्रह्मा' },
    category: { en: 'Bhadrā (Beneficial)', hi: 'भद्रा (कल्याणकारी)', sa: 'भद्रा' },
    nature: { en: 'Auspicious for ceremonies, travels, and investments', hi: 'धार्मिक कार्य व यात्रा हेतु शुभ', sa: 'यात्राविवाहार्थं शुभा' },
  },
  3: {
    deity: { en: 'Gaurī (Mother Goddess)', hi: 'माता गौरी', sa: 'गौरी' },
    category: { en: 'Jayā (Victorious)', hi: 'जया (विजयप्रदा)', sa: 'जया' },
    nature: { en: 'Excellent for victory, competition, arts, and acquisitions', hi: 'विजय, कला एवं विद्या हेतु श्रेष्ठ', sa: 'विजयकार्यार्थं श्रेष्ठा' },
  },
  4: {
    deity: { en: 'Gaṇeśa (Obstacle Remover)', hi: 'भगवान गणेश', sa: 'गणेशः' },
    category: { en: 'Riktā (Destructive/Empty)', hi: 'रिक्ता (त्याज्या)', sa: 'रिक्ता' },
    nature: { en: 'Ideal for spiritual discipline, overcoming barriers, avoiding travel', hi: 'साधना व संकट निवारण हेतु उत्तम', sa: 'संकटनाशाय साधनायोग्या' },
  },
  5: {
    deity: { en: 'Nāgas (Serpent Deities)', hi: 'नाग देव', sa: 'सर्पाः' },
    category: { en: 'Pūrṇā (Complete)', hi: 'पूर्णा (सम्पूर्णफलदा)', sa: 'पूर्णा' },
    nature: { en: 'Very auspicious for health, healing, remedies, and vows', hi: 'आरोग्य, व्रत एवं समृद्धिप्रदा', sa: 'आरोग्यपुष्टिदा' },
  },
  6: {
    deity: { en: 'Kārttikeya / Skanda', hi: 'भगवान कार्तिकेय', sa: 'स्कन्दः' },
    category: { en: 'Nandā (Delightful)', hi: 'नन्दा (आनन्ददायिनी)', sa: 'नन्दा' },
    nature: { en: 'Courage, defense, valor, leadership activities', hi: 'साहस, नेतृत्व व निर्माण कार्य', sa: 'शौर्यतेजोवृद्धिदा' },
  },
  7: {
    deity: { en: 'Sūrya (Sun God)', hi: 'सूर्य नारायण', sa: 'सूर्यः' },
    category: { en: 'Bhadrā (Beneficial)', hi: 'भद्रा (कल्याणकारी)', sa: 'भद्रा' },
    nature: { en: 'Honors, official duties, spiritual illumination', hi: 'मान-सम्मान, पद प्रतिष्ठा एवं ध्यान', sa: 'प्रतिष्ठाप्रदा' },
  },
  8: {
    deity: { en: 'Śiva / Rudra', hi: 'भगवान शिव (रुद्र)', sa: 'रुद्रः' },
    category: { en: 'Jayā (Victorious)', hi: 'जया (विजयप्रदा)', sa: 'जया' },
    nature: { en: 'Meditation, inner strength, fasting (Durgāṣṭamī)', hi: 'व्रत, ध्यान व आत्मबल संवर्धन', sa: 'तपोध्यानार्थं श्रेष्ठा' },
  },
  9: {
    deity: { en: 'Durgā (Divine Mother)', hi: 'माता दुर्गा', sa: 'दुर्गा' },
    category: { en: 'Riktā (Empty/Fierce)', hi: 'रिक्ता (उग्रफला)', sa: 'रिक्ता' },
    nature: { en: 'Elimination of negative tendencies, spiritual purification', hi: 'शत्रुदमन व साधना हेतु उपयोगी', sa: 'दुष्टनिग्रहार्थं युक्ता' },
  },
  10: {
    deity: { en: 'Yama (Dharma Lord)', hi: 'यमराज / धर्मराज', sa: 'यमः' },
    category: { en: 'Pūrṇā (Complete)', hi: 'पूर्णा (सम्पूर्णफलदा)', sa: 'पूर्णा' },
    nature: { en: 'Auspicious for all virtuous deeds, vows, settlements', hi: 'सर्वकल्याणकारी, धार्मिक अनुष्ठान', sa: 'सर्वशुभकार्यसिद्धिदा' },
  },
  11: {
    deity: { en: 'Viśvedevas (Cosmic Guardians)', hi: 'विश्वेदेव', sa: 'विश्वेदेवाः' },
    category: { en: 'Nandā (Supreme Vrata)', hi: 'नन्दा (महाव्रत)', sa: 'नन्दा' },
    nature: { en: 'Supreme day for fasting, Lord Viṣṇu worship (Ekādaśī)', hi: 'श्रीहरि पूजन व महाव्रत एकादशी', sa: 'श्रीविष्णुप्रीतिकरी' },
  },
  12: {
    deity: { en: 'Viṣṇu (Preserver)', hi: 'भगवान विष्णु', sa: 'विष्णुः' },
    category: { en: 'Bhadrā (Beneficial)', hi: 'भद्रा (कल्याणकारी)', sa: 'भद्रा' },
    nature: { en: 'Charity, sacred giving, temple visits, celebrations', hi: 'दान, पुण्य, पारण एवं शुभ अनुष्ठान', sa: 'दानपुण्यार्थं प्रशस्ता' },
  },
  13: {
    deity: { en: 'Kāmadeva (Love & Beauty)', hi: 'कामदेव', sa: 'कामदेवः' },
    category: { en: 'Jayā (Victorious)', hi: 'जया (विजयप्रदा)', sa: 'जया' },
    nature: { en: 'Friendship, artistic pursuits, Pradoṣa worship', hi: 'मित्रता, कला एवं प्रदोष पूजा', sa: 'प्रदोषव्रतयोग्या' },
  },
  14: {
    deity: { en: 'Kālī / Śiva', hi: 'माँ काली / शिव', sa: 'कालिका' },
    category: { en: 'Riktā (Intense)', hi: 'रिक्ता (उग्रफला)', sa: 'रिक्ता' },
    nature: { en: 'Tantric meditation, Śivarātri vigil, boundary setting', hi: 'साधना, जप व शिवरात्रि जागरण', sa: 'शिवरात्रिव्रतयोग्या' },
  },
  15: {
    deity: { en: 'Candra (Moon) / Satyanārāyaṇa', hi: 'चन्द्र देव / सत्यनारायण', sa: 'सोमः' },
    category: { en: 'Pūrṇā (Full Radiant Light)', hi: 'पूर्णा (परम शुभा)', sa: 'पूर्णा' },
    nature: { en: 'Maximum spiritual radiance, Satyanārāyaṇa Pūjā, peace', hi: 'सत्यनारायण पूजा, दान एवं महापुण्य', sa: 'सर्वमनोरथपूर्णा' },
  },
  30: {
    deity: { en: 'Pitṛs (Ancestors)', hi: 'पितृगण', sa: 'पितरः' },
    category: { en: 'Amāvāsyā (Still Dark Void)', hi: 'रिक्ता-पूर्णा (पितृतर्पण)', sa: 'पितृप्रिया' },
    nature: { en: 'Ancestral blessings, Tarpaṇam, inward contemplation', hi: 'पितृ तर्पण, दान व ध्यान', sa: 'श्राद्धतर्पणयोग्या' },
  },
};

// 27 Nakshatra Attributes
export const NAKSHATRA_ATTRIBUTES: Record<number, NakshatraAttribute> = {
  1: { deity: { en: 'Aśvinī Kumāras', hi: 'अश्विनी कुमार', sa: 'अश्विनौ' }, lord: { en: 'Ketu', hi: 'केतु', sa: 'केतुः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Horse Head 🐴' },
  2: { deity: { en: 'Yama', hi: 'यमराज', sa: 'यमः' }, lord: { en: 'Venus', hi: 'शुक्र', sa: 'शुक्रः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Yoni / Triangle 🔺' },
  3: { deity: { en: 'Agni', hi: 'अग्नि देव', sa: 'अग्निः' }, lord: { en: 'Sun', hi: 'सूर्य', sa: 'सूर्यः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Knife / Flame 🔥' },
  4: { deity: { en: 'Brahmā / Prajāpati', hi: 'ब्रह्मा जी', sa: 'प्रजापतिः' }, lord: { en: 'Moon', hi: 'चन्द्र', sa: 'चन्द्रः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Chariot / Cart 🛒' },
  5: { deity: { en: 'Soma (Moon)', hi: 'सोम देव', sa: 'सोमः' }, lord: { en: 'Mars', hi: 'मंगल', sa: 'मंगलः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Deer Head 🦌' },
  6: { deity: { en: 'Rudra', hi: 'भगवान रुद्र', sa: 'रुद्रः' }, lord: { en: 'Rahu', hi: 'राहु', sa: 'राहुः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Teardrop / Diamond 💎' },
  7: { deity: { en: 'Aditi (Cosmic Mother)', hi: 'अदिति माता', sa: 'अदितिः' }, lord: { en: 'Jupiter', hi: 'बृहस्पति', sa: 'गुरुः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Bow & Quiver 🏹' },
  8: { deity: { en: 'Bṛhaspati', hi: 'बृहस्पति देव', sa: 'बृहस्पतिः' }, lord: { en: 'Saturn', hi: 'शनि', sa: 'शनिः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Flower / Cow Udder 🌸' },
  9: { deity: { en: 'Sarpas (Serpents)', hi: 'नाग देव', sa: 'सर्पाः' }, lord: { en: 'Mercury', hi: 'बुध', sa: 'बुधः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Coiled Snake 🐍' },
  10: { deity: { en: 'Pitṛs (Ancestors)', hi: 'पितृगण', sa: 'पितरः' }, lord: { en: 'Ketu', hi: 'केतु', sa: 'केतुः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Royal Throne 👑' },
  11: { deity: { en: 'Bhaga (Prosperity)', hi: 'भग देव', sa: 'भगः' }, lord: { en: 'Venus', hi: 'शुक्र', sa: 'शुक्रः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Front Couch Legs 🛋️' },
  12: { deity: { en: 'Aryaman (Friendship)', hi: 'अर्यमा', sa: 'अर्यमा' }, lord: { en: 'Sun', hi: 'सूर्य', sa: 'सूर्यः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Back Couch Legs 🛏️' },
  13: { deity: { en: 'Savitṛ (Sun of Dawn)', hi: 'सविता देव', sa: 'सविता' }, lord: { en: 'Moon', hi: 'चन्द्र', sa: 'चन्द्रः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Open Hand ✋' },
  14: { deity: { en: 'Tvaṣṭṛ / Viśvakarmā', hi: 'विश्वकर्मा जी', sa: 'त्वष्टा' }, lord: { en: 'Mars', hi: 'मंगल', sa: 'मंगलः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Shining Jewel ✨' },
  15: { deity: { en: 'Vāyu (Wind God)', hi: 'वायु देव', sa: 'वायुः' }, lord: { en: 'Rahu', hi: 'राहु', sa: 'राहुः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Coral / Young Shoot 🌱' },
  16: { deity: { en: 'Indrāgni (Indra & Agni)', hi: 'इंद्राग्नि', sa: 'इन्द्राग्नी' }, lord: { en: 'Jupiter', hi: 'बृहस्पति', sa: 'गुरुः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Triumphal Archway ⛩️' },
  17: { deity: { en: 'Mitra (Divine Friend)', hi: 'मित्र देव', sa: 'मित्रः' }, lord: { en: 'Saturn', hi: 'शनि', sa: 'शनिः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Lotus Flower 🪷' },
  18: { deity: { en: 'Indra (King of Gods)', hi: 'इंद्र देव', sa: 'इन्द्रः' }, lord: { en: 'Mercury', hi: 'बुध', sa: 'बुधः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Earring / Umbrella ☂️' },
  19: { deity: { en: 'Nirṛti (Goddess of Roots)', hi: 'निरृति', sa: 'निरृतिः' }, lord: { en: 'Ketu', hi: 'केतु', sa: 'केतुः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Tied Bundle of Roots 🌿' },
  20: { deity: { en: 'Āpas (Cosmic Waters)', hi: 'जल देव', sa: 'आपः' }, lord: { en: 'Venus', hi: 'शुक्र', sa: 'शुक्रः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Winnowing Fan 🌾' },
  21: { deity: { en: 'Viśvedevas', hi: 'विश्वेदेव', sa: 'विश्वेदेवाः' }, lord: { en: 'Sun', hi: 'सूर्य', sa: 'सूर्यः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Elephant Tusk 🐘' },
  22: { deity: { en: 'Viṣṇu (Preserver)', hi: 'भगवान विष्णु', sa: 'विष्णुः' }, lord: { en: 'Moon', hi: 'चन्द्र', sa: 'चन्द्रः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Ear / Three Footprints 👣' },
  23: { deity: { en: 'Aṣṭa Vasus', hi: 'अष्ट वसु', sa: 'वसवः' }, lord: { en: 'Mars', hi: 'मंगल', sa: 'मंगलः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Drum / Flute 🥁' },
  24: { deity: { en: 'Varuṇa (Cosmic Order)', hi: 'वरुण देव', sa: 'वरुणः' }, lord: { en: 'Rahu', hi: 'राहु', sa: 'राहुः' }, gana: { en: 'Rakshasa', hi: 'राक्षस', sa: 'राक्षसगणः' }, symbol: 'Hundred Flowers / Circle ⭕' },
  25: { deity: { en: 'Aja Ekapāda', hi: 'अज एकपाद', sa: 'अजैकपात्' }, lord: { en: 'Jupiter', hi: 'बृहस्पति', sa: 'गुरुः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Front Legs of Bed 🪜' },
  26: { deity: { en: 'Ahirbudhnya', hi: 'अहिर्बुध्न्य', sa: 'अहिर्बुध्न्यः' }, lord: { en: 'Saturn', hi: 'शनि', sa: 'शनिः' }, gana: { en: 'Manushya', hi: 'मनुष्य', sa: 'मनुष्यगणः' }, symbol: 'Snake in the Deep 🌊' },
  27: { deity: { en: 'Pūṣan (Protector of Paths)', hi: 'पूषा देव', sa: 'पूषा' }, lord: { en: 'Mercury', hi: 'बुध', sa: 'बुधः' }, gana: { en: 'Deva', hi: 'देव', sa: 'देवगणः' }, symbol: 'Fish / Pair of Fish 🐟' },
};

// 27 Yoga Natures
export const YOGA_ATTRIBUTES: Record<number, YogaAttribute> = {
  1: { nature: 'inauspicious', meaning: { en: 'Obstacle / Entrapment', hi: 'विष्कम्भ (बाधाकारक)', sa: 'अशुभयोगः' } },
  2: { nature: 'auspicious', meaning: { en: 'Delightful Love & Bond', hi: 'प्रीति (परम सुखद)', sa: 'शुभयोगः' } },
  3: { nature: 'auspicious', meaning: { en: 'Long-lasting Longevity', hi: 'आयुष्मान (दीर्घायुप्रद)', sa: 'शुभयोगः' } },
  4: { nature: 'auspicious', meaning: { en: 'Good Fortune & Prosperity', hi: 'सौभाग्य (सौभाग्यवृद्धि)', sa: 'शुभयोगः' } },
  5: { nature: 'auspicious', meaning: { en: 'Rich Abundance & Food', hi: 'शोभन (मनोरथपूर्ण)', sa: 'शुभयोगः' } },
  6: { nature: 'inauspicious', meaning: { en: 'Negative Blow / Calamity', hi: 'अतिगण्ड (अशुभप्रद)', sa: 'अशुभयोगः' } },
  7: { nature: 'auspicious', meaning: { en: 'Accomplished Skill', hi: 'सुकर्मा (उत्तम कर्मप्रद)', sa: 'शुभयोगः' } },
  8: { nature: 'auspicious', meaning: { en: 'Immense Wealth & Sustenance', hi: 'धृति (धैर्य एवं समृद्धि)', sa: 'शुभयोगः' } },
  9: { nature: 'inauspicious', meaning: { en: 'Obstacles & Thorny Path', hi: 'शूल (दुःख-कष्टकारक)', sa: 'अशुभयोगः' } },
  10: { nature: 'inauspicious', meaning: { en: 'Deception & Discord', hi: 'गण्ड (विघ्नकारक)', sa: 'अशुभयोगः' } },
  11: { nature: 'auspicious', meaning: { en: 'High Growth & Progress', hi: 'वृद्धि (उन्नतिप्रद)', sa: 'शुभयोगः' } },
  12: { nature: 'auspicious', meaning: { en: 'Supreme Constant Auspiciousness', hi: 'ध्रुव (स्थिर कार्यसिद्धि)', sa: 'शुभयोगः' } },
  13: { nature: 'inauspicious', meaning: { en: 'Injury & Conflict', hi: 'व्याघात (घातक-त्याज्य)', sa: 'अशुभयोगः' } },
  14: { nature: 'auspicious', meaning: { en: 'Universal Joy & Ecstasy', hi: 'हर्षण (हर्षोल्लासप्रद)', sa: 'शुभयोगः' } },
  15: { nature: 'inauspicious', meaning: { en: 'Lightning Bolt Strike', hi: 'वज्र (कठोर-अशुभ)', sa: 'अशुभयोगः' } },
  16: { nature: 'auspicious', meaning: { en: 'Attainment of Siddhis', hi: 'सिद्धि (सफलताप्रद)', sa: 'शुभयोगः' } },
  17: { nature: 'inauspicious', meaning: { en: 'Fall / Calamity', hi: 'व्यतीपात (महादोष-त्याज्य)', sa: 'अशुभयोगः' } },
  18: { nature: 'auspicious', meaning: { en: 'Purity & Divine Variation', hi: 'वरीयान (श्रेयस्कर)', sa: 'शुभयोगः' } },
  19: { nature: 'inauspicious', meaning: { en: 'Severe Adversity', hi: 'परिघ (प्रतिरोधक)', sa: 'अशुभयोगः' } },
  20: { nature: 'auspicious', meaning: { en: 'Divine Grace & Shiva Shakti', hi: 'शिव (परम कल्याणकारी)', sa: 'शुभयोगः' } },
  21: { nature: 'auspicious', meaning: { en: 'Auspicious & Clean Radiance', hi: 'सिद्ध (सर्वसिद्धिदायक)', sa: 'शुभयोगः' } },
  22: { nature: 'auspicious', meaning: { en: 'Supreme Sacred Blessing', hi: 'साध्य (इष्टफलप्रद)', sa: 'शुभयोगः' } },
  23: { nature: 'auspicious', meaning: { en: 'Beneficial & Auspicious', hi: 'शुभ (उत्तमफलप्रद)', sa: 'शुभयोगः' } },
  24: { nature: 'auspicious', meaning: { en: 'Radiant White Radiance', hi: 'शुक्ल (निर्मल-पवित्र)', sa: 'शुभयोगः' } },
  25: { nature: 'auspicious', meaning: { en: 'Sacred Brahmin Power', hi: 'ब्रह्म (ज्ञान एवं साधना)', sa: 'शुभयोगः' } },
  26: { nature: 'auspicious', meaning: { en: 'Great Dignity & Indra Radiance', hi: 'ऐन्द्र (राजसम्मानप्रद)', sa: 'शुभयोगः' } },
  27: { nature: 'inauspicious', meaning: { en: 'Fierce Storm & Uprooting', hi: 'वैधृति (महादोष-त्याज्य)', sa: 'अशुभयोगः' } },
};

// 11 Karanas
export const KARANA_ATTRIBUTES: Record<number, KaranaAttribute> = {
  1: { type: 'chara', deity: { en: 'Indra (King of Devas)', hi: 'इंद्र देव', sa: 'इन्द्रः' } },
  2: { type: 'chara', deity: { en: 'Mitra (Light & Sun)', hi: 'मित्र देव', sa: 'मित्रः' } },
  3: { type: 'chara', deity: { en: 'Aryaman (Order & Nobility)', hi: 'अर्यमा', sa: 'अर्यमा' } },
  4: { type: 'chara', deity: { en: 'Bhaga (Good Fortune)', hi: 'भग देव', sa: 'भगः' } },
  5: { type: 'chara', deity: { en: 'Viṣṇu (Preserver)', hi: 'भगवान विष्णु', sa: 'विष्णुः' } },
  6: { type: 'chara', deity: { en: 'Yama (God of Justice)', hi: 'यमराज', sa: 'यमः' } },
  7: { type: 'chara', deity: { en: 'Vāyu (Bhadra - Avoid New Beginnings)', hi: 'भद्रा (विष्टि - शुभकार्य त्याज्य)', sa: 'विष्टिः (भद्रा)' } },
  8: { type: 'sthira', deity: { en: 'Kālī (Goddess of Time)', hi: 'माता काली (शकुनि)', sa: 'शकुनिः' } },
  9: { type: 'sthira', deity: { en: 'Vṛṣabha (Dharma Bull)', hi: 'धर्म वृषभ (चतुष्पाद)', sa: 'चतुष्पात्' } },
  10: { type: 'sthira', deity: { en: 'Ananta Śeṣa (Infinite Serpent)', hi: 'अनन्त शेषनाग (नाग)', sa: 'नागः' } },
  11: { type: 'sthira', deity: { en: 'Kubera (God of Treasures)', hi: 'कुबेर देव (किंस्तुघ्न)', sa: 'किंस्तुघ्नः' } },
};

// Ekadashi Names lookup table for all 12 Masas (Shukla and Krishna)
export const EKADASHI_NAMES: Record<string, { shukla: string; krishna: string }> = {
  Caitra: { shukla: 'Kāmadā Ekādaśī', krishna: 'Pāpamocanī Ekādaśī' },
  Vaiśākha: { shukla: 'Mohinī Ekādaśī', krishna: 'Varūthinī Ekādaśī' },
  Jyeṣṭha: { shukla: 'Nirjalā Ekādaśī', krishna: 'Aparā Ekādaśī' },
  Āṣāḍha: { shukla: 'Śayanī (Devaśayanī) Ekādaśī', krishna: 'Yoginī Ekādaśī' },
  Śrāvaṇa: { shukla: 'Pavitropana (Putradā) Ekādaśī', krishna: 'Kāmikā Ekādaśī' },
  Bhādrapada: { shukla: 'Parivartinī (Vāmana) Ekādaśī', krishna: 'Ajā (Annadā) Ekādaśī' },
  Āśvina: { shukla: 'Pāpāṅkuśā Ekādaśī', krishna: 'Indirā Ekādaśī' },
  Kārttika: { shukla: 'Prabodhinī (Devotthānī) Ekādaśī', krishna: 'Ramā Ekādaśī' },
  Mārgaśīrṣa: { shukla: 'Mokṣadā (Gītā Jayantī) Ekādaśī', krishna: 'Utpannā Ekādaśī' },
  Pauṣa: { shukla: 'Putradā Ekādaśī', krishna: 'Saphalā Ekādaśī' },
  Māgha: { shukla: 'Jayā (Bhaimī) Ekādaśī', krishna: 'Ṣaṭ-tilā Ekādaśī' },
  Phālguna: { shukla: 'Āmalakī Ekādaśī', krishna: 'Vijayā Ekādaśī' },
};
