import React from 'react';
import type { PanchangaResponse } from '../types';
import type { Language } from '../i18n';
import { EKADASHI_NAMES } from '../vedicData';
import { Sparkles, Flame, Moon, Sun, HeartHandshake } from 'lucide-react';

import type { AppTheme } from "../types";

interface FestivalCardProps {
  theme?: AppTheme;
  data: PanchangaResponse;
  lang: Language;
}

interface ObservanceInfo {
  title: { en: string; hi: string; sa: string };
  subtitle: { en: string; hi: string; sa: string };
  deity: string;
  significance: { en: string; hi: string; sa: string };
  practices: { en: string; hi: string; sa: string }[];
  type: 'ekadashi' | 'purnima' | 'amavasya' | 'pradosham' | 'chaturthi' | 'shivaratri' | 'general';
}

export const FestivalCard: React.FC<FestivalCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === "nightSky";
  const primaryTithiNum = data.tithi[0]?.number || 1;
  const isSukla = data.paksha === 'Śukla' || primaryTithiNum <= 15;

  // Detect observances
  let observance: ObservanceInfo | null = null;

  // 1. Check Ekadashi (Tithi 11 or 26)
  if (primaryTithiNum === 11 || primaryTithiNum === 26) {
    const rawMasa = (data.masa || '').split(' ')[0];
    const ekadashiEntry = EKADASHI_NAMES[rawMasa];
    let specificName = 'Ekādaśī Mahāvrata';
    if (ekadashiEntry) {
      specificName = isSukla ? ekadashiEntry.shukla : ekadashiEntry.krishna;
    }

    observance = {
      title: {
        en: `Śrī Hari ${specificName}`,
        hi: `श्रीहरि ${specificName}`,
        sa: `श्रीहरि-${specificName}`,
      },
      subtitle: {
        en: 'Supreme Fasting Day Dedicated to Lord Mahāviṣṇu',
        hi: 'भगवान श्रीहरि विष्णु को समर्पित परम पावन महाव्रत',
        sa: 'भगवते महाविष्णवे समर्पितं परमं महाव्रतम्',
      },
      deity: 'Lord Viṣṇu / Kṛṣṇa',
      significance: {
        en: 'Ekādaśī is celebrated as the mother of devotion (Bhakti-jananī). Fasting today cleanses lifetimes of sins and elevates spiritual consciousness.',
        hi: 'एकादशी को भक्ति की जननी कहा गया है। इस दिन उपवास व श्रीहरि के नाम-जप से चित्त निर्मल होता है और अक्षय पुण्य प्राप्त होता है।',
        sa: 'एकादशी सर्वपापप्रशमनी पुण्यप्रदा च। अस्यां तिथौ हरिकीर्तनम् उपवासश्च परमफलप्रदः।',
      },
      practices: [
        { en: 'Observe fasting (Upavāsa) or consume fruits & milk', hi: 'फलाहार अथवा निर्जला/सजला उपवास रखें', sa: 'उपवासं फलाहारं वा कुर्यात्' },
        { en: 'Chant Viṣṇu Sahasranāma or Hare Kṛṣṇa Mahāmantra', hi: 'विष्णु सहस्रनाम अथवा ॐ नमो भगवते वासुदेवाय जप', sa: 'विष्णुसहस्रनामस्तोत्रपाठः' },
        { en: 'Avoid grains, lentils, and negative associations', hi: 'अन्न व तामसिक भोजन का त्याग', sa: 'अन्नत्यागः शुद्धाचरणं च' },
      ],
      type: 'ekadashi',
    };
  } else if (primaryTithiNum === 15) {
    // 2. Purnima
    observance = {
      title: {
        en: 'Pūrṇimā (Satyanārāyaṇa Vrata & Holy Snāna)',
        hi: 'पूर्णिमा महाव्रत एवं श्री सत्यनारायण पूजन',
        sa: 'पूर्णिमा (सत्यनारायणव्रतं पवित्रस्नानम्)',
      },
      subtitle: {
        en: 'Auspicious Full Moon Day for Satyanārāyaṇa Kathā, Holy River Bathing, and Charity',
        hi: 'सत्यनारायण भगवान की कथा, नदी स्नान एवं महादान का पावन दिवस',
        sa: 'सर्वमनोरथपूर्तिकरः सत्यनारायणव्रतदिवसः',
      },
      deity: 'Śrī Satyanārāyaṇa / Candra Deva',
      significance: {
        en: 'The Full Moon represents complete illumination of spiritual consciousness. Perfect for family peace, charity, and fulfilling righteous vows.',
        hi: 'पूर्णिमा पर मन के कारक चन्द्रमा पूर्ण प्रकाशवान रहते हैं। सत्यनारायण कथा एवं दीपदान से गृह में सुख-शान्ति और समृद्धि वास करती है।',
        sa: 'सोमस्य परिपूर्णतेजसा युक्तोऽयं दिवसः शान्ति-समृद्धिदायकः।',
      },
      practices: [
        { en: 'Perform or listen to Śrī Satyanārāyaṇa Kathā', hi: 'श्री सत्यनारायण भगवान की कथा व पूजन', sa: 'सत्यनारायणकथाश्रवणम्' },
        { en: 'Offer Arghya to the Full Moon at moonrise', hi: 'चन्द्रोदय के समय चन्द्रदेव को अर्घ्य दें', sa: 'चन्द्राय अर्घ्यप्रदानम्' },
        { en: 'Engage in charity (Dāna) of food, clothes, and lamps', hi: 'दीपदान, अन्नदान एवं गोसेवा', sa: 'दीपदानं गोसेवा च' },
      ],
      type: 'purnima',
    };
  } else if (primaryTithiNum === 30 || primaryTithiNum === 0) {
    // 3. Amavasya
    observance = {
      title: {
        en: 'Amāvāsyā (Pitṛ Tarpaṇam & Śrāddha)',
        hi: 'अमावस्या (पितृ तर्पण एवं दान)',
        sa: 'दर्शः / अमावास्या (पितृऋणमुक्तिः)',
      },
      subtitle: {
        en: 'Sacred Day for Honoring Ancestors, Pitṛ Tarpana, and Inward Contemplation',
        hi: 'पितरों की तृप्ति, तर्पण एवं आत्म-चिन्तन का विशेष दिवस',
        sa: 'पितृभ्यः जलाञ्जलिप्रदानं दानं च',
      },
      deity: 'Pitṛs (Ancestors) & Lord Sūrya',
      significance: {
        en: 'Amāvāsyā offers a direct spiritual connection with our ancestors. Offering water and sesame seeds brings peace and blessings to the lineage.',
        hi: 'अमावस्या पर पितृगण अपने वंशजों से श्रद्धा की कामना करते हैं। तिल-जल से तर्पण करने से पितृदोष शांत होता है और कुलवृद्धि होती है।',
        sa: 'पितॄणां तृप्त्यर्थं तिलाञ्जलिप्रदानेन सन्तोषः कुलवृद्धिः च भवति।',
      },
      practices: [
        { en: 'Perform Pitṛ Tarpaṇam with water and black sesame seeds', hi: 'काले तिल और कुशा से पितरों को तर्पण करें', sa: 'तिलोदकेन तर्पणं कुर्यात्' },
        { en: 'Feed cows, crows, and needy persons', hi: 'गाय, कौवे एवं जरूरतमंदों को भोजन कराएं', sa: 'गो-वायस-दरिद्रभोजनम्' },
        { en: 'Refrain from starting materialistic business enterprises', hi: 'नूतन सांसारिक कार्यों की शुरुआत से बचें', sa: 'सांसारिकारम्भं परिहरेत्' },
      ],
      type: 'amavasya',
    };
  } else if (primaryTithiNum === 13 || primaryTithiNum === 28) {
    // 4. Pradosha Vrata
    observance = {
      title: {
        en: 'Pradoṣa Vrata (Lord Śiva Twilight Pūjā)',
        hi: 'प्रदोष व्रत (शिव-सन्ध्या आराधना)',
        sa: 'प्रदोषव्रतम् (श्रीशङ्करार्चनम्)',
      },
      subtitle: {
        en: 'Sacred Trayodaśī Vrata during Sunset Twilight for Liberation from Debts and Troubles',
        hi: 'ऋणमुक्ति, संकट निवारण एवं शिवकृपा हेतु त्रयोदशी प्रदोष व्रत',
        sa: 'सर्वपापविमुक्तिहेतोः प्रदोषकाले शिवपूजनम्',
      },
      deity: 'Bhagavān Sadāśiva & Mātā Pārvatī',
      significance: {
        en: 'During the sunset twilight on Trayodaśī, Lord Śiva performs the cosmic dance of joy (Ānanda Tāṇḍava) on Mount Kailāsa. Worshiping Him now dissolves hardships.',
        hi: 'प्रदोष काल में भगवान शिव नंदी पर विराजकर आनंद तांडव करते हैं। इस समय शिवजी का अभिषेक करने से सभी कष्टों का शमन होता है।',
        sa: 'प्रदोषसमये शम्भुः नर्त्यते कैलासपर्वते। तस्मिन् काले कृता पूजा सर्वकामफलप्रदा।',
      },
      practices: [
        { en: 'Perform Śiva Abhiṣeka with milk, honey, and Bilva leaves', hi: 'कच्चे दूध, जल एवं बेलपत्र से शिवलिंग का अभिषेक', sa: 'बिल्वपत्रैः दुग्धेन च रुद्राभिषेकः' },
        { en: 'Chant Mahāmṛtyuñjaya Mantra or Oṁ Namaḥ Śivāya', hi: 'महामृत्युंजय मंत्र अथवा ॐ नमः शिवाय जप', sa: 'महामृत्युञ्जयमन्त्रजपः' },
        { en: 'Observe fasting until evening pūjā concludes', hi: 'सायंकाल पूजनोपरांत सात्विक पारण', sa: 'सन्ध्याकालं यावत् उपवासः' },
      ],
      type: 'pradosham',
    };
  } else if (primaryTithiNum === 4 || primaryTithiNum === 19) {
    // 5. Chaturthi (Vinayaka / Sankashti)
    const isSankashti = !isSukla;
    observance = {
      title: {
        en: isSankashti ? 'Saṅkaṣṭī Caturthī Vrata' : 'Vināyaka Caturthī',
        hi: isSankashti ? 'संकष्टी चतुर्थी (संकटनाशन गणेश व्रत)' : 'विनायक चतुर्थी',
        sa: isSankashti ? 'संकष्टी चतुर्थी (गणेशव्रतम्)' : 'विनायकचतुर्थी',
      },
      subtitle: {
        en: isSankashti
          ? 'Obstacle-Removing Vrata with Moon Sighting at Night'
          : 'Auspicious Waxing Chaturthi Dedicated to Lord Ganesha',
        hi: isSankashti
          ? 'चन्द्र दर्शन एवं अर्घ्य सहित विघ्नहर्ता गणेश पूजन'
          : 'श्री गणेश की कृपा प्राप्ति हेतु शुक्ल पक्षीय चतुर्थी',
        sa: 'विघ्नविनाशकाय श्रीगणेशाय समर्पितं पावनव्रतम्',
      },
      deity: 'Lord Gaṇeśa (Vighnahartā)',
      significance: {
        en: 'Worship of Lord Gaṇeśa on Caturthī removes all impediments from one’s career, family, and spiritual endeavors.',
        hi: 'भगवान गणेश प्रथम पूज्य हैं। चतुर्थी के दिन दूर्वा व मोदक अर्पण करने से हर प्रकार के संकट दूर होते हैं।',
        sa: 'गणेशपूजनेन सर्वविघ्नाः शाम्यन्ति, कार्यसिद्धिः च सम्पद्यते।',
      },
      practices: [
        { en: 'Offer 21 Dūrvā grass blades and Modakas to Ganesha', hi: 'गणेश जी को २१ दूर्वा दल व मोदक अर्पित करें', sa: 'एकविंशतिदूर्वादलैः गणेशार्चनम्' },
        { en: 'Recite Saṅkaṭanāśana Gaṇeśa Stotram', hi: 'संकटनाशन गणेश स्तोत्र का पाठ करें', sa: 'संकटनाशनस्तोत्रपठनम्' },
      ],
      type: 'chaturthi',
    };
  } else if (primaryTithiNum === 29) {
    // 6. Masa Shivaratri
    observance = {
      title: {
        en: 'Māsa Śivarātri (Monthly Night of Lord Śiva)',
        hi: 'मासिक शिवरात्रि (शिव-आराधना पर्व)',
        sa: 'मासशिवरात्रिः (शिवार्चनमहापर्व)',
      },
      subtitle: {
        en: 'Penultimate Lunar Day Dedicated to Supreme Transcendental Consciousness',
        hi: 'मन को साधने एवं शिव चेतना में लीन होने का पावन दिवस',
        sa: 'कैलासनाथस्य परमपावनं मासिकव्रतम्',
      },
      deity: 'Bhagavān Śiva',
      significance: {
        en: 'Before the New Moon, the mind (represented by the waning moon) is easiest to transcend. Meditating on Lord Shiva on Chaturdashi brings mastery over mind.',
        hi: 'कृष्ण चतुर्दशी की रात्रि में भगवान शिव के लिंग रूप का स्मरण करने से काम, क्रोध व मोह शांत होते हैं।',
        sa: 'चतुर्दश्यां कृतं शिवार्चनं मोक्षपदं भवति।',
      },
      practices: [
        { en: 'Light an oil lamp and offer water & Bilva patra to Shiva', hi: 'शिवलिंग पर जल, अक्षत व बेलपत्र अर्पण', sa: 'शिवलिंगे जलाभिषेकः' },
        { en: 'Maintain night meditation or chanting', hi: 'रात्रि में ध्यान एवं ॐ नमः शिवाय जप', sa: 'निशि ध्यानं जपानुष्ठानं च' },
      ],
      type: 'shivaratri',
    };
  }

  // If no specific festival today, display daily Vedic contemplation
  if (!observance) {
    return (
      <div
        id="vedic-contemplation-card"
        className={`rounded-[1.5rem] p-5 sm:p-6 flex items-center justify-between gap-4 ${isNight ? 'bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl' : 'glass-card'}`}
      >
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-300 text-amber-800 shadow-sm border border-amber-400/50">
            <HeartHandshake className="h-5 w-5 text-amber-900" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900/60 mb-1">
              {lang === 'sa' ? 'दैनिक-सुभाषितम्' : lang === 'hi' ? 'दैनिक सुभाषित एवं शान्ति मन्त्र' : 'Daily Vedic Wisdom'}
            </div>
            <div className="text-sm font-extrabold text-stone-800 font-serif-vedic">
              ॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥
            </div>
            <div className="text-xs text-stone-500 font-sans mt-1">
              {lang === 'sa'
                ? 'सर्वे जनाः सुखिनः आरुग्णाश्च सन्तु, शुभं पश्यन्तु।'
                : lang === 'hi'
                ? 'सभी सुखी हों, सभी रोगमुक्त हों, सबका कल्याण हो और किसी को भी दुःख न हो।'
                : 'May all beings be peaceful, healthy, and see auspiciousness everywhere.'}
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-xs text-amber-900 font-semibold bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-200/80 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>{data.masa} • {data.paksha} Pakṣa</span>
        </div>
      </div>
    );
  }

  // Custom styling based on observance type
  const borderBgStyles =
    observance.type === 'ekadashi'
      ? 'border-amber-400/50 from-amber-500/10 via-orange-50/30 to-amber-500/10'
      : observance.type === 'purnima'
      ? 'border-amber-300/50 from-amber-50/50 via-yellow-50/30 to-stone-50/50'
      : observance.type === 'amavasya'
      ? 'border-stone-400/50 from-stone-100/50 via-stone-50/50 to-stone-100/50'
      : 'border-rose-300/50 from-rose-50/50 via-amber-50/30 to-stone-50/50';

  return (
    <div
      id="festival-observance-card"
      className={`glass-card rounded-[1.5rem] p-6 shadow-sm bg-gradient-to-r ${borderBgStyles}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
            {observance.type === 'ekadashi' ? (
              <Sparkles className="h-5 w-5" />
            ) : observance.type === 'purnima' ? (
              <Sun className="h-5 w-5" />
            ) : observance.type === 'amavasya' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Flame className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-950 font-sans">
                {lang === 'sa' ? 'विशेष-पर्व / महाव्रतम्' : lang === 'hi' ? 'विशेष पर्व एवं महाव्रत' : 'Special Vrata / Festival'}
              </span>
              <span className="text-xs text-stone-500 font-sans">• Deity: {observance.deity}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-950 font-serif-vedic tracking-wide mt-0.5">
              {observance.title[lang]}
            </h3>
            <p className="text-xs text-stone-600 font-sans">
              {observance.subtitle[lang]}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-7 text-xs text-stone-700 leading-relaxed font-sans">
          <p className="bg-white/80 p-3 rounded-xl border border-stone-200/70 shadow-2xs">
            {observance.significance[lang]}
          </p>
        </div>

        <div className="md:col-span-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block font-sans">
            {lang === 'sa' ? 'अनुष्ठेयाः नियमाः :' : lang === 'hi' ? 'शुभ अनुष्ठान व नियम :' : 'Recommended Observances:'}
          </span>
          {observance.practices.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2 text-xs text-stone-800 bg-white/90 px-3 py-1.5 rounded-lg border border-stone-200/80 shadow-2xs font-sans"
            >
              <span className="text-amber-700 font-bold">•</span>
              <span>{p[lang]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
