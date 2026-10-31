import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Info } from "lucide-react";
import { type Language } from "../i18n";

export const VEDIC_TERM_GLOSSARY: Record<
  string,
  { en: { title: string; desc: string }; hi: { title: string; desc: string } }
> = {
  tithi: {
    en: {
      title: "Tithi (Lunar Day)",
      desc: "Angular distance of 12° between the Moon and Sun. Crucial for determining auspicious times, festivals, and vows.",
    },
    hi: {
      title: "तिथि (चन्द्र दिवस)",
      desc: "सूर्य और चन्द्रमा के मध्य १२ अंश (12°) की कोणीय दूरी। व्रत, पर्व एवं मुहूर्त निर्धारण का मुख्य आधार।",
    },
  },
  nakshatra: {
    en: {
      title: "Nakshatra (Lunar Mansion)",
      desc: "One of the 27 sidereal stellar constellations through which the Moon travels. Represents the cosmic mental wave and consciousness.",
    },
    hi: {
      title: "नक्षत्र (तारा मंडल)",
      desc: "२७ नक्षत्र मण्डलों में से चन्द्रमा का वर्तमान निवास। मन, स्वभाव एवं ऊर्जा का संवाहक।",
    },
  },
  yoga: {
    en: {
      title: "Yoga (Solar-Lunar Union)",
      desc: "The sum of Sun's and Moon's sidereal longitudes divided into 27 segments of 13°20'. Governs physical health and spiritual vitality.",
    },
    hi: {
      title: "योग (सूर्य-चन्द्र योग)",
      desc: "सूर्य एवं चन्द्र के भोगांशों का योग (१३°२०' के २७ भाग)। स्वास्थ्य, प्राणशक्ति एवं शुभता का सूचक।",
    },
  },
  karana: {
    en: {
      title: "Karana (Half Tithi)",
      desc: "Half of a tithi (6° elongation). Indicates the outcome and execution capability of actions and endeavors.",
    },
    hi: {
      title: "करण (अर्ध तिथि)",
      desc: "एक तिथि का आधा भाग (६ अंश)। कार्य सिद्धि, क्रियात्मक क्षमता एवं दैनिक गतिविधियों के फल का निर्देशक।",
    },
  },
  vaara: {
    en: {
      title: "Vāsara / Vaara (Solar Day)",
      desc: "Solar day from sunrise to sunrise ruled by a primary planetary divinity.",
    },
    hi: {
      title: "वार (दिन)",
      desc: "एक सूर्योदय से अगले सूर्योदय तक का दिन, जिसके अधिष्ठाता मुख्य ग्रह देव होते हैं।",
    },
  },
  rahu_kala: {
    en: {
      title: "Rāhu Kāla (Inauspicious Period)",
      desc: "A daily 90-minute window governed by Rahu. Inauspicious for initiating new ventures, travel, or agreements.",
    },
    hi: {
      title: "राहु काल (अशुभ वेला)",
      desc: "दिन का लगभग १.५ घण्टे का राहु-शासित समय, जिसमें नवीन कार्य, यात्रा एवं शुभ अनुष्ठान वर्जित माने जाते हैं।",
    },
  },
  abhijit: {
    en: {
      title: "Abhijit Muhūrta (Most Auspicious Midday)",
      desc: "The 8th muhurta of the day occurring around solar noon. Neutralizes planetary afflictions and grants success in all righteous actions.",
    },
    hi: {
      title: "अभिजित मुहूर्त (सर्वश्रेष्ठ मध्याह्न वेला)",
      desc: "मध्याह्न काल का ८वां मुहूर्त। यह समस्त दोषों को शान्त कर सर्वकार्य सिद्धि प्रदान करने वाला माना गया है।",
    },
  },
  yamaganda: {
    en: {
      title: "Yamagaṇḍa (Yama's Hour)",
      desc: "Inauspicious period ruled by Yama, God of Death. Traditional guidance avoids starting auspicious work.",
    },
    hi: {
      title: "यमगण्ड (यम वेला)",
      desc: "यमराज द्वारा शासित कालखण्ड। शुभ कर्मों के प्रारम्भ हेतु त्याज्य।",
    },
  },
  amrit_kalam: {
    en: {
      title: "Amṛta Kāla (Nectar Period)",
      desc: "An exceptionally auspicious window within the Nakshatra span, ideal for worship, healing, and celebrations.",
    },
    hi: {
      title: "अमृत काल",
      desc: "नक्षत्र काल में आने वाला अमृतमय मुहूर्त, जो पूजन, आरोग्य एवं उत्सवों हेतु अति उत्तम है।",
    },
  },
};

interface VedicTermTooltipProps {
  term: keyof typeof VEDIC_TERM_GLOSSARY;
  lang: Language;
  children?: React.ReactNode;
}

export const VedicTermTooltip: React.FC<VedicTermTooltipProps> = ({
  term,
  lang,
  children,
}) => {
  const item = VEDIC_TERM_GLOSSARY[term];
  if (!item) return <>{children}</>;

  const content = lang === "hi" ? item.hi : item.en;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help group">
            {children}
            <Info className="w-3 h-3 text-stone-400 group-hover:text-amber-600 transition-colors shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 rounded-xl bg-stone-900/95 text-stone-100 border border-amber-500/30 shadow-xl backdrop-blur-md text-xs font-sans z-50"
        >
          <div className="font-bold text-amber-300 font-devanagari mb-1">
            {content.title}
          </div>
          <div className="text-stone-300 leading-relaxed font-devanagari">
            {content.desc}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
