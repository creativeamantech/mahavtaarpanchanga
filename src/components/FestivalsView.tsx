import React, { useState } from "react";
import type { PanchangaResponse, AppTheme } from "../types";
import type { Language } from "../i18n";
import { FestivalCard } from "./FestivalCard";
import { Search, Sparkles, Moon, Sun, Calendar } from "lucide-react";

interface FestivalsViewProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

interface MajorFestival {
  id: string;
  name: { en: string; hi: string; sa: string };
  dateApprox: string;
  lunarDate: { en: string; hi: string; sa: string };
  category: "major" | "vrata" | "jayanti" | "snana";
  description: { en: string; hi: string; sa: string };
}

const ANNUAL_FESTIVALS: MajorFestival[] = [
  {
    id: "makar-sankranti",
    name: { en: "Makar Sankranti / Pongal", hi: "मकर संक्रान्ति / पोंगल", sa: "मकरसंक्रान्तिः" },
    dateApprox: "14-15 January",
    lunarDate: {
      en: "Sun enters Makara (Capricorn)",
      hi: "सूर्य का मकर राशि में प्रवेश",
      sa: "सूर्यस्य मकरराशिप्रवेशः",
    },
    category: "major",
    description: {
      en: "The beginning of Uttarāyana (Sun's northward journey). Sacred day for holy river bath, sesame donation, and harvest celebration.",
      hi: "सूर्य के उत्तरायण होने का पावन पर्व। गंगा स्नान, तिल-गुड़ दान एवं पतंगोत्सव।",
      sa: "उत्तरायणप्रारम्भः। पुण्यतीर्थस्नानं तिलदानं च महापुण्यप्रदम्।",
    },
  },
  {
    id: "vasant-panchami",
    name: {
      en: "Vasant Panchami (Saraswati Puja)",
      hi: "वसन्त पञ्चमी (सरस्वती पूजन)",
      sa: "वसन्तपञ्चमी",
    },
    dateApprox: "Late Jan / Early Feb",
    lunarDate: { en: "Magha Shukla Panchami", hi: "माघ शुक्ल पञ्चमी", sa: "माघ-शुक्ल-पञ्चमी" },
    category: "jayanti",
    description: {
      en: "Celebration of Mother Saraswati, embodiment of wisdom, music, and learning. Onset of spring.",
      hi: "विद्या एवं बुद्धि की अधिष्ठात्री माँ सरस्वती की आराधना। वसन्त ऋतु का आगमन।",
      sa: "विद्यादेव्याः सरस्वत्याः प्राकट्योत्सवः। ज्ञानसाधनायाः पावनदिनम्।",
    },
  },
  {
    id: "maha-shivaratri",
    name: { en: "Maha Shivaratri", hi: "महाशिवरात्रि", sa: "महाशिवरात्रिः" },
    dateApprox: "February / March",
    lunarDate: {
      en: "Phalguna Krishna Chaturdashi",
      hi: "फाल्गुन कृष्ण चतुर्दशी",
      sa: "फाल्गुन-कृष्ण-चतुर्दशी",
    },
    category: "vrata",
    description: {
      en: "The Great Night of Lord Shiva. Devotees observe all-night vigil, Shiva Linga Abhishekam with Bilva leaves, and continuous chanting.",
      hi: "भगवान सदाशिव की परम पावन महारात्रि। चार प्रहर की पूजा, रुद्राभिषेक एवं अखण्ड जागरण।",
      sa: "परमशिवस्य लिङ्गोद्भवरात्रिः। बिल्वपत्रैरभिषेकः अहोरात्रजागरणम् उपवासश्च।",
    },
  },
  {
    id: "holi",
    name: { en: "Holi (Holika Dahan)", hi: "होली (होलिका दहन)", sa: "होलिकोत्सवः" },
    dateApprox: "March",
    lunarDate: { en: "Phalguna Purnima", hi: "फाल्गुन पूर्णिमा", sa: "फाल्गुन-पूर्णिमा" },
    category: "major",
    description: {
      en: "Festival of colors signifying the triumph of devotion (Bhakta Prahlada) over evil and the joy of Radha-Krishna leela.",
      hi: "रंगों और उल्लास का महापर्व। बुराई पर अच्छाई की विजय और राधा-कृष्ण की दिव्य लीला।",
      sa: "आनन्दस्य रङ्गोत्सवः। भक्तप्रह्लादस्य रक्षया अधर्मोपरि धर्मस्य विजयः।",
    },
  },
  {
    id: "chaitra-navaratri",
    name: {
      en: "Chaitra Navaratri & Hindu New Year",
      hi: "चैत्र नवरात्र एवं नव संवत्सर",
      sa: "चैत्रनवरात्रम् नवसंवत्सरः",
    },
    dateApprox: "March / April",
    lunarDate: {
      en: "Chaitra Shukla Pratipat to Navami",
      hi: "चैत्र शुक्ल प्रतिपदा से नवमी",
      sa: "चैत्र-शुक्ल-प्रतिपद् तः नवमी",
    },
    category: "major",
    description: {
      en: "The inception of the Vedic Vikram New Year and nine sacred nights worshipping Mother Durga's nine forms.",
      hi: "वैदिक नव संवत्सर का शुभारंभ एवं माँ जगदम्बा के नौ स्वरूपों की दिव्य साधना।",
      sa: "नवसंवत्सरारम्भः। दुर्गायाः नवस्वरूपाणाम् अनुष्ठानम्।",
    },
  },
  {
    id: "rama-navami",
    name: { en: "Sri Rama Navami", hi: "श्रीराम नवमी", sa: "श्रीरामनवमी" },
    dateApprox: "April",
    lunarDate: { en: "Chaitra Shukla Navami", hi: "चैत्र शुक्ल नवमी", sa: "चैत्र-शुक्ल-नवमी" },
    category: "jayanti",
    description: {
      en: "The divine appearance of Maryada Purushottama Bhagavan Sri Ramachandra at noon.",
      hi: "मर्यादा पुरुषोत्तम प्रभु श्रीराम का मध्याह्न कालीन पावन जन्मोत्सव।",
      sa: "मर्यादापुरुषोत्तमस्य श्रीरामचन्द्रस्य प्राकट्यमहोत्सवः।",
    },
  },
  {
    id: "guru-purnima",
    name: {
      en: "Guru Purnima (Vyasa Purnima)",
      hi: "गुरु पूर्णिमा (व्यास पूर्णिमा)",
      sa: "गुरुपूर्णिमा",
    },
    dateApprox: "July",
    lunarDate: { en: "Ashadha Purnima", hi: "आषाढ़ पूर्णिमा", sa: "आषाढ-पूर्णिमा" },
    category: "vrata",
    description: {
      en: "Honoring spiritual masters and Maharshi Veda Vyasa who codified the Vedas and wrote the Mahabharata.",
      hi: "सद्गुरु चरणों में कृतज्ञता ज्ञापन एवं वेदव्यास जी की पावन स्मृति।",
      sa: "सद्गुरूणां महर्षेः व्यासस्य च चरणपूजनदिवसः।",
    },
  },
  {
    id: "raksha-bandhan",
    name: { en: "Raksha Bandhan", hi: "रक्षा बन्धन", sa: "रक्षाबन्धनम्" },
    dateApprox: "August",
    lunarDate: { en: "Shravana Purnima", hi: "श्रावण पूर्णिमा", sa: "श्रावण-पूर्णिमा" },
    category: "major",
    description: {
      en: "Sacred thread binding brothers and sisters in mutual protection, and Upakarma thread renewal for scholars.",
      hi: "भाई-बहन के स्नेह और रक्षा का पावन सूत्र पर्व, तथा उपाकर्म यज्ञापवीत संस्कार।",
      sa: "भ्रातृ-भगिनी-स्नेहबन्धनम् उपाकर्म-यज्ञोपवीत-धारणं च।",
    },
  },
  {
    id: "krishna-janmashtami",
    name: { en: "Sri Krishna Janmashtami", hi: "श्रीकृष्ण जन्माष्टमी", sa: "श्रीकृष्णजन्माष्टमी" },
    dateApprox: "August / September",
    lunarDate: {
      en: "Bhadrapada Krishna Ashtami",
      hi: "भाद्रपद कृष्ण अष्टमी (रोहिणी)",
      sa: "भाद्रपद-कृष्ण-अष्टमी",
    },
    category: "jayanti",
    description: {
      en: "Midnight celebration of Lord Sri Krishna's avatar. Devotees fast until midnight Rohini nakshatra.",
      hi: "भगवान श्रीगोविन्द का आधी रात को दिव्य प्राकट्य। मध्यरात्रि तक उपवास एवं भजन-कीर्तन।",
      sa: "लीलापुरुषोत्तमस्य श्रीकृष्णस्य प्राकट्योत्सवः। निशीथवेलायां जन्माभिषेकः।",
    },
  },
  {
    id: "ganesh-chaturthi",
    name: {
      en: "Ganesh Chaturthi (Vinayaka Chavithi)",
      hi: "गणेश चतुर्थी (विनायक चतुर्थी)",
      sa: "विनायकचतुर्थी",
    },
    dateApprox: "September",
    lunarDate: {
      en: "Bhadrapada Shukla Chaturthi",
      hi: "भाद्रपद शुक्ल चतुर्थी",
      sa: "भाद्रपद-शुक्ल-चतुर्थी",
    },
    category: "major",
    description: {
      en: "Arrival of Lord Ganesha, remover of obstacles and patron of arts, celebrated over 10 sacred days.",
      hi: "विघ्नहर्ता भगवान गणपति बाप्पा की स्थापना एवं दस दिवसीय महापर्व।",
      sa: "विघ्नविनाशकस्य गणपतेः आगमनमहोत्सवः। मोदकप्रसादेन अर्चनम्।",
    },
  },
  {
    id: "sharad-navaratri",
    name: {
      en: "Sharad Navaratri & Durga Puja",
      hi: "शारदीय नवरात्र एवं दुर्गा पूजा",
      sa: "शारदीयनवरात्रम्",
    },
    dateApprox: "October",
    lunarDate: {
      en: "Ashwina Shukla Pratipat to Navami",
      hi: "आश्विन शुक्ल प्रतिपदा से नवमी",
      sa: "आश्विन-शुक्ल-प्रतिपत्",
    },
    category: "major",
    description: {
      en: "Nine sacred nights worshipping Adi Shakti Mahishasuramardini Durga with Garba, fasting, and Chandi Paath.",
      hi: "शक्ति की अधिष्ठात्री माँ दुर्गा की नौ रात्रियों की साधना, गरबा एवं चंडी पाठ।",
      sa: "आदिशक्तेः महिषासुरमर्दिन्याः नवरात्रानुष्ठानम्।",
    },
  },
  {
    id: "diwali",
    name: {
      en: "Diwali (Deepavali & Lakshmi Puja)",
      hi: "दीपावली (महालक्ष्मी पूजन)",
      sa: "दीपावली",
    },
    dateApprox: "October / November",
    lunarDate: { en: "Kartika Amavasya", hi: "कार्तिक अमावस्या", sa: "कार्तिक-अमावास्या" },
    category: "major",
    description: {
      en: "Festival of lights celebrating Lord Rama's triumphant return to Ayodhya and worship of Goddess Lakshmi.",
      hi: "प्रकाश का महापर्व। दीप प्रज्वलन, महालक्ष्मी-गणेश पूजन एवं प्रभु श्रीराम का अयोध्या आगमन।",
      sa: "दीपानाम् उत्सवः। महालक्ष्म्याः अर्चनम् अयोध्यानगरीं प्रति श्रीरामस्य आगमनम्।",
    },
  },
  {
    id: "kartika-purnima",
    name: {
      en: "Kartika Purnima (Dev Deepavali)",
      hi: "कार्तिक पूर्णिमा (देव दीपावली)",
      sa: "देवदीपावली",
    },
    dateApprox: "November",
    lunarDate: { en: "Kartika Purnima", hi: "कार्तिक पूर्णिमा", sa: "कार्तिक-पूर्णिमा" },
    category: "snana",
    description: {
      en: "The gods descend to celebrate Deepavali on the ghats of Varanasi. Sacred snana and lamp floating.",
      hi: "काशी के घाटों पर देवताओं की दीपावली। त्रिपुरारी शिव की आराधना एवं महास्नान।",
      sa: "त्रिपुरारिजयोत्सवः। गङ्गास्नानं कोटिदीपदानं च।",
    },
  },
];

export const FestivalsView: React.FC<FestivalsViewProps> = ({ data, lang, theme }) => {
  const isNight = theme === "nightSky";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "major" | "vrata" | "jayanti" | "snana"
  >("all");

  const filteredFestivals = ANNUAL_FESTIVALS.filter((f) => {
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const textEn = f.name.en.toLowerCase();
    const textHi = f.name.hi.toLowerCase();
    const textDesc = f.description.en.toLowerCase();
    return (
      matchesCategory &&
      (textEn.includes(query) || textHi.includes(query) || textDesc.includes(query))
    );
  });

  return (
    <div id="festivals-view" className="space-y-6">
      {/* 1. Today's Observance Card */}
      <div className="mb-6">
        <FestivalCard data={data} lang={lang} theme={theme} />
      </div>

      {/* 2. Annual Major Hindu Vratas & Festivals Header */}
      <div
        className={`vedic-card p-5 sm:p-6 transition-all ${
          isNight ? "bg-[#12182B] border-indigo-900/40 text-slate-100" : "bg-white border-[#E4E2DD]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-stone-200/60 dark:border-indigo-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <h3 className="font-serif-vedic font-bold text-lg sm:text-xl text-[#D4680A] dark:text-[#F0C96A]">
                {lang === "hi"
                  ? "प्रमुख वार्षिक पर्व एवं महाव्रत"
                  : "Annual Vedic Festivals & Mahavratas"}
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
              {lang === "hi"
                ? "सनातन धर्म के प्रमुख उत्सव, तिथियाँ एवं धार्मिक महत्व"
                : "Sacred observances, lunar tithi alignments, and spiritual practices"}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "hi" ? "पर्व खोजें..." : "Search festival..."}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border transition-colors outline-hidden ${
                isNight
                  ? "bg-slate-900/80 border-indigo-900 text-slate-100 focus:border-indigo-500"
                  : "bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500"
              }`}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto cat-nav-scroll py-3 border-b border-stone-200/40 dark:border-indigo-900/30">
          {(
            [
              { id: "all", label: lang === "hi" ? "सभी पर्व" : "All" },
              { id: "major", label: lang === "hi" ? "महापर्व" : "Major Festivals" },
              { id: "vrata", label: lang === "hi" ? "व्रत व उपवास" : "Fasting & Vratas" },
              { id: "jayanti", label: lang === "hi" ? "जयन्ती" : "Avatars & Jayantis" },
              { id: "snana", label: lang === "hi" ? "पवित्र स्नान" : "Holy Baths" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? isNight
                    ? "bg-[#F0C96A] text-[#12182B]"
                    : "bg-[#D4680A] text-white"
                  : isNight
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Festival Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredFestivals.map((fest) => (
            <div
              key={fest.id}
              className={`p-4 rounded-xl border transition-all ${
                isNight
                  ? "bg-[#0E1322] border-indigo-950/80 hover:border-indigo-800"
                  : "bg-[#FAFAF7] border-[#E4E2DD] hover:border-amber-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h4 className="font-serif-vedic font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                    {fest.name[lang] || fest.name.en}
                  </h4>
                  <div className="text-[11px] font-devanagari text-[#D4680A] dark:text-[#F0A44A] mt-0.5">
                    {fest.lunarDate[lang] || fest.lunarDate.en}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
                  {fest.dateApprox}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed mt-2">
                {fest.description[lang] || fest.description.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
