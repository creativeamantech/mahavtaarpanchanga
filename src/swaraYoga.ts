import type { SwaraDayRule, SwaraYogaData, SwaraNadi } from './types';
import type { Language } from './i18n';

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
  paksha: 'Shukla Paksha' | 'Krishna Paksha' | 'Full moon' | 'No Moon';
  sunriseSwara: SwaraNadi;
  sunsetSwara: SwaraNadi;
  sunriseNostril: 'Left' | 'Right';
  sunsetNostril: 'Left' | 'Right';
}> = [
  { dayNumber: 1, tithiName: 'Pratipada', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 2, tithiName: 'Dwitiya', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 3, tithiName: 'Tritiya', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 4, tithiName: 'Chaturthi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 5, tithiName: 'Panchami', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 6, tithiName: 'Shashthi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 7, tithiName: 'Saptami', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 8, tithiName: 'Ashtami', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 9, tithiName: 'Navami', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 10, tithiName: 'Dashami', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 11, tithiName: 'Ekadasi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 12, tithiName: 'Dwadashi', paksha: 'Shukla Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 13, tithiName: 'Trayodashi', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 14, tithiName: 'Chaturdashi', paksha: 'Shukla Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 15, tithiName: 'Purnima', paksha: 'Full moon', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 16, tithiName: 'Pratipada', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 17, tithiName: 'Dwitiya', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 18, tithiName: 'Tritiya', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 19, tithiName: 'Chaturthi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 20, tithiName: 'Panchami', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 21, tithiName: 'Shashthi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 22, tithiName: 'Saptami', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 23, tithiName: 'Ashtami', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 24, tithiName: 'Navami', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 25, tithiName: 'Dashami', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 26, tithiName: 'Ekadasi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 27, tithiName: 'Dwadashi', paksha: 'Krishna Paksha', sunriseSwara: 'ida', sunsetSwara: 'pingala', sunriseNostril: 'Left', sunsetNostril: 'Right' },
  { dayNumber: 28, tithiName: 'Trayodashi', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 29, tithiName: 'Chaturdashi', paksha: 'Krishna Paksha', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
  { dayNumber: 30, tithiName: 'Amawashya', paksha: 'No Moon', sunriseSwara: 'pingala', sunsetSwara: 'ida', sunriseNostril: 'Right', sunsetNostril: 'Left' },
];

export const SWARA_CYCLE_RULES: SwaraDayRule[] = RAW_SWARA_CYCLE_RULES.map((r) => ({
  ...r,
  // Moonrise nadi is opposite of sunrise and moonset nadi is opposite of sunset
  moonriseSwara: (r.sunriseSwara === 'ida' ? 'pingala' : 'ida') as SwaraNadi,
  moonsetSwara: (r.sunsetSwara === 'ida' ? 'pingala' : 'ida') as SwaraNadi,
  moonriseNostril: (r.sunriseNostril === 'Left' ? 'Right' : 'Left') as 'Left' | 'Right',
  moonsetNostril: (r.sunsetNostril === 'Left' ? 'Right' : 'Left') as 'Left' | 'Right',
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
    nadi: 'ida',
    sanskritName: 'इड़ा नाड़ी (चन्द्र स्वर)',
    nostril: {
      en: 'Left Nostril (Chandra / Lunar)',
      hi: 'वाम नासिका (चन्द्र स्वर)',
      sa: 'वाम-नासिकापुटम् (चन्द्रस्वरः)',
    },
    energy: {
      en: 'Cooling, Calming, Magnetic, Receptive (Somya)',
      hi: 'शीतल, शान्त, अमृतमयी, आकर्षण शक्ति (सौम्य)',
      sa: 'शीतल-सौम्य-अमृतप्रद-शक्तिः',
    },
    element: {
      en: 'Water & Earth (Kapha / Nourishing)',
      hi: 'जल व पृथ्वी तत्त्व प्रधान (पोषक)',
      sa: 'जल-भूमि-तत्त्वप्रधानम्',
    },
    temperament: {
      en: 'Feminine, introverted, introspective',
      hi: 'स्त्री-प्रकृति, अन्तर्मुखी, स्थिर',
      sa: 'स्त्रीस्वभावः, अन्तर्मुखः',
    },
    rulingDeities: {
      en: 'Moon (Candra), Bṛhaspati, Śukra, Budha',
      hi: 'चन्द्रमा, बृहस्पति, शुक्र, बुध देव',
      sa: 'चन्द्र-बृहस्पति-शुक्र-बुध-ग्रहाः',
    },
    color: '#0284c7',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-300',
    badgeText: 'text-sky-950',
    auspiciousWorks: {
      en: [
        'Starting journeys or long travel',
        'Housewarming (Gṛhapraveśa) and construction',
        'Buying clothes, jewelry, or vehicles',
        'Marriage, engagement, and peaceful ceremonies',
        'Learning arts, music, meditation, literature',
        'Taking medicine or initiating medical treatment',
        'Planting seeds, farming, digging wells',
        'Meeting elders, preceptors, and royalty',
      ],
      hi: [
        'दीर्घ यात्रा व प्रस्थान',
        'गृहप्रवेश व नवीन निर्माण कार्य',
        'वस्त्र, आभूषण व वाहन क्रय',
        'विवाह, सगाई व मांगलिक अनुष्ठान',
        'विद्यारम्भ, संगीत, साहित्य व ध्यान',
        'औषध सेवन व चिकित्सा आरम्भ',
        'बीजारोपण, कृषि व वृक्षारोपण',
        'गुरुजनों, विद्वानों व मित्रों से मिलन',
      ],
      sa: [
        'दूरयात्रा-प्रस्थानम्',
        'गृहप्रवेशः निर्माणकार्यं च',
        'वस्त्राभूषण-क्रयणम्',
        'विवाह-मङ्गलकार्याणि',
        'विद्याभ्यासः सङ्गीतं ध्यानं च',
        'औषधसेवनम् चिकित्सा च',
        'कृषिकार्यं वृक्षारोपणं च',
        'गुरु-दर्शनं मैत्री च',
      ],
    },
    inauspiciousWorks: {
      en: [
        'Heavy digestion or eating heavy meals (weaker digestive fire)',
        'Fierce combat, athletic exertion, aggression',
        'Entering risky legal debates or conflicts',
      ],
      hi: [
        'गरिष्ठ भोजन (जठराग्नि मन्द रहती है)',
        'युद्ध, अति-श्रम व विवाद',
        'कठोर दण्ड व आक्रामक कार्य',
      ],
      sa: [
        'गुरुभोजनम् मन्दाग्निहेतोः',
        'युद्ध-कलह-अतिश्रमाः',
        'उग्रकार्याणि विग्रहाश्च',
      ],
    },
  },
  pingala: {
    nadi: 'pingala',
    sanskritName: 'पिङ्गला नाड़ी (सूर्य स्वर)',
    nostril: {
      en: 'Right Nostril (Sūrya / Solar)',
      hi: 'दक्षिण नासिका (सूर्य स्वर)',
      sa: 'दक्षिण-नासिकापुटम् (सूर्यस्वरः)',
    },
    energy: {
      en: 'Heating, Energizing, Active, Electric (Raudra/Agni)',
      hi: 'उष्ण, ओजस्वी, प्राणवान, पाचक शक्ति (रौद्र/अग्नि)',
      sa: 'उष्ण-तेजस्वी-पाचक-शक्तिः',
    },
    element: {
      en: 'Fire & Air (Pitta / Transformative)',
      hi: 'अग्नि व वायु तत्त्व प्रधान (रूपांतरण)',
      sa: 'अग्नि-वायु-तत्त्वप्रधानम्',
    },
    temperament: {
      en: 'Masculine, extroverted, dynamic',
      hi: 'पुरुष-प्रकृति, बहिर्मुखी, पराक्रमी',
      sa: 'पुरुषस्वभावः, बहिर्मुखः',
    },
    rulingDeities: {
      en: 'Sun (Sūrya), Maṅgala (Mars), Śani, Rāhu',
      hi: 'सूर्य देव, मंगल देव, शनि, राहु',
      sa: 'सूर्य-मङ्गल-शनि-राहु-ग्रहाः',
    },
    color: '#ea580c',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-300',
    badgeText: 'text-orange-950',
    auspiciousWorks: {
      en: [
        'Eating meals and digesting food (strong Jatharāgni)',
        'Physical exercise, athletics, yoga asana practice',
        'Debates, intellectual contests, exams, negotiations',
        'Courageous deeds, warfare, challenges, hard labor',
        'Bathing, crossing water bodies, driving vehicles',
        'Sleeping on left side (activates right nostril for health)',
        'Purchasing weapons, tools, metals, or machinery',
      ],
      hi: [
        'भोजन ग्रहण व पाचन (जठराग्नि प्रदीप्त)',
        'व्यायाम, कुश्ती, योग-आसन व खेलकूद',
        'वाद-विवाद, शास्त्रार्थ, साक्षात्कार व परीक्षाएं',
        'साहसिक कार्य, उद्योग व पुरुषार्थ',
        'स्नान, नदी पार करना व वाहन चालन',
        'वाम करवट शयन (जिससे सूर्य स्वर चले)',
        'शस्त्र, धातु व मशीनरी का क्रय',
      ],
      sa: [
        'भोजनपाचनम् (जठराग्निदीप्तौ)',
        'व्यायामः शरीराभ्यासः च',
        'शास्त्रार्थः परीक्षा जयश्च',
        'साहस-पराक्रम-कार्याणि',
        'स्नानं नदीतरणं च',
        'वामपार्श्वशयनम्',
        'शस्त्र-यन्त्र-धातुक्रयः',
      ],
    },
    inauspiciousWorks: {
      en: [
        'Long peaceful travel or house entry',
        'Taking long-term delicate oaths or gentle peace accords',
        'Drinking large amounts of cooling liquids',
      ],
      hi: [
        'शान्त मांगलिक यात्रा व गृहप्रवेश',
        'कोमल, सौम्य व शान्तिकर्म',
        'विवाह व दीर्घकालीन सन्धि',
      ],
      sa: [
        'शान्तमङ्गल-यात्रा गृहप्रवेशश्च',
        'कोमल-सौम्यकर्माणि',
        'विवाहः शान्तिविधानं च',
      ],
    },
  },
  sushumna: {
    nadi: 'sushumna',
    sanskritName: 'सुषुम्णा नाड़ी (मध्य / ब्रह्म स्वर)',
    nostril: {
      en: 'Both Nostrils Flowing Simultaneously',
      hi: 'दोनों नासिका समान (उभय प्रवाह)',
      sa: 'उभय-नासिकापुट-साम्यम्',
    },
    energy: {
      en: 'Neutralizing, Transcendent, Yogic, Non-dual',
      hi: 'निस्त्रैगुण्य, योगयुक्त, समाधिस्थ, दिव्य',
      sa: 'समाधियुक्तम्, दिव्य-कैवल्यप्रदम्',
    },
    element: {
      en: 'Ether (Ākāśa / Space)',
      hi: 'आकाश तत्त्व (शून्य)',
      sa: 'आकाश-तत्त्वम् (शून्यम्)',
    },
    temperament: {
      en: 'Transcendental, detached from worldly fruit',
      hi: 'सांसारिक फलों से विरक्त, आत्मलीन',
      sa: 'परमशान्तम्, आत्मलीनम्',
    },
    rulingDeities: {
      en: 'Lord Shiva & Parāśakti (Brahman)',
      hi: 'परमशिव एवं पराशक्ति',
      sa: 'परब्रह्म-परमशिवः',
    },
    color: '#9333ea',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-300',
    badgeText: 'text-purple-950',
    auspiciousWorks: {
      en: [
        'Dhyāna (Meditation) and contemplation',
        'Prāṇāyāma and Kuṇḍalinī awakening',
        'Mantra Japa and scriptural study',
        'Samādhi and prayer for liberation',
      ],
      hi: [
        'ध्यान, धारणा व समाधि',
        'प्राणायाम व कुण्डलिनी जागरण',
        'गायत्री व इष्ट मन्त्र जप',
        'मोक्ष चिन्तन व ईश-प्रार्थना',
      ],
      sa: [
        'ध्यान-धारणा-समाधिः',
        'प्राणायामः कुण्डलिनी-जागरणम्',
        'मन्त्रजपः भगवच्चिन्तनम्',
        'मोक्षसाधनम्',
      ],
    },
    inauspiciousWorks: {
      en: [
        'All worldly and commercial undertakings (result in futility or loss)',
        'Travel, buying, selling, litigation',
      ],
      hi: [
        'समस्त सांसारिक, व्यापारिक व लौकिक कार्य (निष्फल होते हैं)',
        'यात्रा, क्रय-विक्रय व लेन-देन',
      ],
      sa: [
        'सर्वे लौकिकाः व्यवहाराः (निष्फलाः भवन्ति)',
        'यात्रा वाणिज्यं च',
      ],
    },
  },
};

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
  if (!tStr || tStr === 'None' || tStr === 'unavailable' || tStr.trim() === '') return null;
  const parts = tStr.trim().split(':').map((v) => parseInt(v, 10));
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
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Checks if a given time (in minutes) falls inside [startMins, endMins], handling midnight boundary.
 */
export function isTimeInsideWindow(currentMins: number, startMins: number, endMins: number): boolean {
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
  moonsetStr?: string | null
): SwaraYogaData {
  const rule = getSwaraForTithiNumber(tithiNumber);

  const sunriseMins = parseTimeToMinutes(sunriseStr) ?? 6 * 60; // 06:00 default
  const sunsetMins = parseTimeToMinutes(sunsetStr) ?? 18 * 60;  // 18:00 default
  const moonriseMins = parseTimeToMinutes(moonriseStr);
  const moonsetMins = parseTimeToMinutes(moonsetStr);

  const currentMins = cityCurrentTime
    ? cityCurrentTime.hours * 60 + cityCurrentTime.minutes + cityCurrentTime.seconds / 60
    : null;

  // 1. Sunrise Swara Window: Starts at Sunrise and runs for 1 hour
  const sunriseWindowStart = sunriseMins;
  const sunriseWindowEnd = sunriseMins + 60;
  const isSunriseActive = currentMins !== null ? isTimeInsideWindow(currentMins, sunriseWindowStart, sunriseWindowEnd) : false;
  const sunriseWindow = {
    start: formatMinutesToTime(sunriseWindowStart),
    end: formatMinutesToTime(sunriseWindowEnd),
    windowFormatted: `${formatMinutesToTime(sunriseWindowStart)} – ${formatMinutesToTime(sunriseWindowEnd)}`,
    ruleDescription: {
      en: 'Starts at Sunrise, runs for 1 hour',
      hi: 'सूर्योदय से 1 घंटे तक प्रवहमान रहता है',
      sa: 'सूर्योदयात् आरभ्य १ होरापर्यन्तं प्रवहति',
    },
    isActive: isSunriseActive,
  };

  // 2. Sunset Swara Window: Starts 1 hour before Sunset, runs until Sunset
  const sunsetWindowStart = sunsetMins - 60;
  const sunsetWindowEnd = sunsetMins;
  const isSunsetActive = currentMins !== null ? isTimeInsideWindow(currentMins, sunsetWindowStart, sunsetWindowEnd) : false;
  const sunsetWindow = {
    start: formatMinutesToTime(sunsetWindowStart),
    end: formatMinutesToTime(sunsetWindowEnd),
    windowFormatted: `${formatMinutesToTime(sunsetWindowStart)} – ${formatMinutesToTime(sunsetWindowEnd)}`,
    ruleDescription: {
      en: 'Starts 1 hour before Sunset, runs until Sunset',
      hi: 'सूर्यास्त से 1 घंटा पहले प्रारंभ होता है',
      sa: 'सूर्यास्तात् १ होरा पूर्वम् आरभ्य सूर्यास्तपर्यन्तं प्रवहति',
    },
    isActive: isSunsetActive,
  };

  // 3. Moonrise Swara Window: Starts at Moonrise and runs for 1 hour (Opposite of Sunrise)
  let moonriseWindow: SwaraYogaData['moonriseWindow'] = null;
  let isMoonriseActive = false;
  if (moonriseMins !== null) {
    const mrStart = moonriseMins;
    const mrEnd = moonriseMins + 60;
    isMoonriseActive = currentMins !== null ? isTimeInsideWindow(currentMins, mrStart, mrEnd) : false;
    moonriseWindow = {
      start: formatMinutesToTime(mrStart),
      end: formatMinutesToTime(mrEnd),
      windowFormatted: `${formatMinutesToTime(mrStart)} – ${formatMinutesToTime(mrEnd)}`,
      ruleDescription: {
        en: 'Starts at Moonrise, runs for 1 hour (Opposite of Sunrise)',
        hi: 'चन्द्रोदय से 1 घंटे तक प्रवहमान रहता है (सूर्योदय का विपरीत)',
        sa: 'चन्द्रोदयात् आरभ्य १ होरापर्यन्तं प्रवहति (सूर्योदयविपरीतम्)',
      },
      isActive: isMoonriseActive,
    };
  }

  // 4. Moonset Swara Window: Starts 1 hour before Moonset, runs until Moonset (Opposite of Sunset)
  let moonsetWindow: SwaraYogaData['moonsetWindow'] = null;
  let isMoonsetActive = false;
  if (moonsetMins !== null) {
    const msStart = moonsetMins - 60;
    const msEnd = moonsetMins;
    isMoonsetActive = currentMins !== null ? isTimeInsideWindow(currentMins, msStart, msEnd) : false;
    moonsetWindow = {
      start: formatMinutesToTime(msStart),
      end: formatMinutesToTime(msEnd),
      windowFormatted: `${formatMinutesToTime(msStart)} – ${formatMinutesToTime(msEnd)}`,
      ruleDescription: {
        en: 'Starts 1 hour before Moonset, runs until Moonset (Opposite of Sunset)',
        hi: 'चन्द्रास्त से 1 घंटा पहले प्रारंभ होता है (सूर्यास्त का विपरीत)',
        sa: 'चन्द्रास्तात् १ होरा पूर्वम् आरभ्य चन्द्रास्तपर्यन्तं प्रवहति (सूर्यास्तविपरीतम्)',
      },
      isActive: isMoonsetActive,
    };
  }

  // Active Celestial Window Identification
  let activeCelestialWindow: SwaraYogaData['activeCelestialWindow'] = null;
  if (isSunriseActive) {
    activeCelestialWindow = 'sunrise';
  } else if (isSunsetActive) {
    activeCelestialWindow = 'sunset';
  } else if (isMoonriseActive) {
    activeCelestialWindow = 'moonrise';
  } else if (isMoonsetActive) {
    activeCelestialWindow = 'moonset';
  }

  let currentActiveSwara: SwaraNadi = rule.sunriseSwara;
  let activeNostril: 'Left' | 'Right' | 'Both' = rule.sunriseNostril;
  let minutesIntoCycle = 0;
  let minutesRemainingInCycle = 60;
  let cycleNumberToday = 1;

  if (currentMins !== null) {
    // Elapsed minutes since local sunrise (wrap across 24h if before sunrise)
    let elapsedSinceSunrise = currentMins - sunriseMins;
    if (elapsedSinceSunrise < 0) {
      elapsedSinceSunrise += 1440;
    }

    // Each Swara conventionally alternates every 60 minutes (approx 2.5 Ghati = 60 mins = 1 hour)
    const cycleDurationMins = 60;
    const cyclesElapsed = Math.floor(elapsedSinceSunrise / cycleDurationMins);
    cycleNumberToday = (cyclesElapsed % 24) + 1;

    minutesIntoCycle = Math.floor(elapsedSinceSunrise % cycleDurationMins);
    minutesRemainingInCycle = cycleDurationMins - minutesIntoCycle;

    // Check celestial window overrides or regular cyclic alternation
    if (isSunriseActive) {
      currentActiveSwara = rule.sunriseSwara;
      activeNostril = rule.sunriseNostril;
    } else if (isSunsetActive) {
      currentActiveSwara = rule.sunsetSwara;
      activeNostril = rule.sunsetNostril;
    } else if (minutesIntoCycle <= 2 || minutesIntoCycle >= 58) {
      // Sushumna operates for ~2-3 minutes during the crossover transition
      currentActiveSwara = 'sushumna';
      activeNostril = 'Both';
    } else if (cyclesElapsed % 2 === 0) {
      // Even cycle index: Same as Sunrise Swara
      currentActiveSwara = rule.sunriseSwara;
      activeNostril = rule.sunriseNostril;
    } else {
      // Odd cycle index: Opposite of Sunrise Swara
      currentActiveSwara = rule.sunriseSwara === 'ida' ? 'pingala' : 'ida';
      activeNostril = rule.sunriseNostril === 'Left' ? 'Right' : 'Left';
    }
  }

  // Determine active Mahābhūta Tattva inside the 60-minute cycle:
  // 1. Prithvi (Earth) - 20 mins (0-20)
  // 2. Jala (Water) - 16 mins (20-36)
  // 3. Tejas (Fire) - 12 mins (36-48)
  // 4. Vayu (Air) - 8 mins (48-56)
  // 5. Akasha (Ether) - 4 mins (56-60)
  let activeTattva: SwaraYogaData['activeTattva'];
  if (minutesIntoCycle < 20) {
    activeTattva = {
      name: 'Prithvi',
      sanskrit: 'पृथ्वी तत्त्वम् (भू)',
      element: 'Earth / Grounding',
      color: '#eab308',
      durationMins: 20,
      karya: 'Stable, permanent, construction, financial security works',
    };
  } else if (minutesIntoCycle < 36) {
    activeTattva = {
      name: 'Jala',
      sanskrit: 'जल तत्त्वम् (आपः)',
      element: 'Water / Flow & Nourishment',
      color: '#0ea5e9',
      durationMins: 16,
      karya: 'Peaceful, growth, trade, friendship, healing, and arts',
    };
  } else if (minutesIntoCycle < 48) {
    activeTattva = {
      name: 'Tejas',
      sanskrit: 'तेजस् तत्त्वम् (अग्निः)',
      element: 'Fire / Energy & Digestion',
      color: '#ef4444',
      durationMins: 12,
      karya: 'Action, exercise, digestion, courageous decisions, bold ventures',
    };
  } else if (minutesIntoCycle < 56) {
    activeTattva = {
      name: 'Vayu',
      sanskrit: 'वायु तत्त्वम् (पवनः)',
      element: 'Air / Motion & Speed',
      color: '#64748b',
      durationMins: 8,
      karya: 'Motion, travel, quick communications, changes, agile work',
    };
  } else {
    activeTattva = {
      name: 'Akasha',
      sanskrit: 'आकाश तत्त्वम् (शून्यम्)',
      element: 'Ether / Transcendence',
      color: '#a855f7',
      durationMins: 4,
      karya: 'Meditation, prayer, japa, detachment, yoga dhyana',
    };
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
    sunsetWindow,
    moonriseWindow,
    moonsetWindow,
    activeCelestialWindow,
    currentActiveSwara,
    activeNostril,
    minutesIntoCycle,
    minutesRemainingInCycle,
    cycleNumberToday,
    activeTattva,
  };
}
