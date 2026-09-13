export type Language = 'en' | 'hi' | 'sa';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  invocation: string;
  today: string;
  yesterday: string;
  tomorrow: string;
  selectDate: string;
  changeLocation: string;
  settings: string;
  print: string;
  views: {
    panchanga: string;
    timings: string;
    choghadiya: string;
    planets: string;
    calendar: string;
    swara: string;
    transitions?: string;
  };
  vedicAlmanac: string;
  samvatsara: string;
  masa: string;
  paksha: string;
  sukla: string;
  krishna: string;
  vaara: string;
  ayana: string;
  drikAyana: string;
  rtu: string;
  drikRtu: string;
  sunSign: string;
  moonSign: string;
  solarDay: string;
  lunarNight: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  dayLength: string;
  nightLength: string;
  limbsTitle: string;
  limbsSubtitle: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  endsAt: string;
  followedBy: string;
  throughoutDay: string;
  auspiciousTimings: string;
  inauspiciousTimings: string;
  auspiciousSub: string;
  inauspiciousSub: string;
  rahuKala: string;
  rahuKalaDesc: string;
  yamaganda: string;
  yamagandaDesc: string;
  gulikaKala: string;
  gulikaKalaDesc: string;
  durmuhurta: string;
  durmuhurtaDesc: string;
  varjyam: string;
  varjyamDesc: string;
  abhijit: string;
  abhijitDesc: string;
  brahmaMuhurta: string;
  brahmaMuhurtaDesc: string;
  amritaKala: string;
  amritaKalaDesc: string;
  choghadiyaTitle: string;
  choghadiyaSub: string;
  dayChoghadiya: string;
  nightChoghadiya: string;
  currentChoghadiya: string;
  planetsTitle: string;
  planetsSub: string;
  graha: string;
  rasi: string;
  degrees: string;
  pada: string;
  motion: string;
  direct: string;
  retrograde: string;
  planetTransitionsTitle: string;
  planetTransitionsSub: string;
  transitRasi: string;
  transitNakshatra: string;
  nextTransit: string;
  timeline: string;
  todayTransits: string;
  punyaKala: string;
  mahaPunyaKala: string;
  combust: string;
  monthlyTitle: string;
  monthlySub: string;
  printTitle: string;
  printSubtitle: string;
  printAction: string;
  close: string;
  searchCity: string;
  customCoords: string;
  ayanamsaSystem: string;
  monthScheme: string;
  eraDetails: string;
  sakaEra: string;
  vikramaEra: string;
  kaliYear: string;
  ahargana: string;
  popularCities: string;
  detectGps: string;
  useDeviceLocation: string;
  detectingLocation: string;
  locationDetected: string;
  saveAsDefault: string;
  savedSettingsTitle: string;
  savedSettingsDesc: string;
  resetDefaults: string;
  settingsSavedToast: string;
  deviceGps: string;
  theme: string;
  parchment: string;
  nightSky: string;
  parchmentDesc: string;
  nightSkyDesc: string;
  switchToNightSky: string;
  switchToParchment: string;
  apply: string;
  cancel: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Drik Panchanga',
    appSubtitle: 'High-Precision Observational Hindu Lunisolar Almanac',
    invocation: '॥ Śrī Gaṇeśāya Namaḥ ॥ Śrī Sūryāya Namaḥ ॥',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    selectDate: 'Select Date',
    changeLocation: 'Change Location',
    settings: 'Settings',
    print: 'Print / Export',
    views: {
      panchanga: 'Daily Panchanga',
      timings: 'Auspicious Muhūrtas',
      choghadiya: 'Gaurī / Choghadiya',
      planets: 'Graha Sthiti (Planets)',
      calendar: 'Monthly Calendar',
      swara: 'Swara Yoga (Swarodaya)',
    },
    vedicAlmanac: 'Vedic Almanac Hierarchy',
    samvatsara: 'Saṁvatsara',
    masa: 'Māsa',
    paksha: 'Pakṣa',
    sukla: 'Śukla',
    krishna: 'Kṛṣṇa',
    vaara: 'Vāra',
    ayana: 'Ayana',
    drikAyana: 'Drik Ayana',
    rtu: 'Ṛtu (Season)',
    drikRtu: 'Drik Ṛtu',
    sunSign: 'Sūrya Rāśi (Sun Sign)',
    moonSign: 'Candra Rāśi (Moon Sign)',
    solarDay: 'Sūrya (Solar Cycle)',
    lunarNight: 'Candra (Lunar Cycle)',
    sunrise: 'Sunrise (Sūryodaya)',
    sunset: 'Sunset (Sūryāsta)',
    moonrise: 'Moonrise (Candrodaya)',
    moonset: 'Moonset (Candrāsta)',
    dayLength: 'Day Length (Dinamāna)',
    nightLength: 'Night Length (Rātrimāna)',
    limbsTitle: 'Pañca Aṅgāni — The Five Limbs',
    limbsSubtitle: 'Observational coordinates computed using NASA JPL / Drik astronomical models',
    tithi: 'Tithi (Lunar Day)',
    nakshatra: 'Nakṣatra (Lunar Constellation)',
    yoga: 'Yoga (Lunisolar Angular Sum)',
    karana: 'Karaṇa (Half Lunar Day)',
    endsAt: 'up to',
    followedBy: 'followed by',
    throughoutDay: 'throughout the day',
    auspiciousTimings: 'Śubha Muhūrtas (Auspicious)',
    inauspiciousTimings: 'Aśubha Timings (Inauspicious / Avoid)',
    auspiciousSub: 'Ideal windows for beginning new enterprises, rituals, and ceremonies',
    inauspiciousSub: 'Challenging planetary periods to avoid for initiating auspicious work',
    rahuKala: 'Rāhu Kāla',
    rahuKalaDesc: 'Segment of day ruled by North Node Rāhu; avoid travel and beginning works',
    yamaganda: 'Yamagaṇḍa',
    yamagandaDesc: 'Segment ruled by Yama; avoid starting journeys or new investments',
    gulikaKala: 'Gulikā Kāla',
    gulikaKalaDesc: 'Segment ruled by Gulika (son of Saturn); beneficial for lasting possessions',
    durmuhurta: 'Durmuhūrta',
    durmuhurtaDesc: 'Inauspicious Muhūrta segments during the daytime',
    varjyam: 'Varjyam (Tyājya)',
    varjyamDesc: 'Harmful lunar constellation portions to be avoided',
    abhijit: 'Abhijit Muhūrta',
    abhijitDesc: '8th daytime muhūrta, extremely auspicious for removing obstacles',
    brahmaMuhurta: 'Brahma Muhūrta',
    brahmaMuhurtaDesc: '48 minutes before sunrise, ideal for meditation and spiritual practices',
    amritaKala: 'Amṛta Kāla',
    amritaKalaDesc: 'Nectar-filled constellation span for starting important endeavors',
    choghadiyaTitle: 'Choghadiya & Gaurī Timings',
    choghadiyaSub: 'Eightfold planetary divisions of day and night for immediate timing guidance',
    dayChoghadiya: 'Daytime (Dina Choghadiya)',
    nightChoghadiya: 'Nighttime (Rātri Choghadiya)',
    currentChoghadiya: 'Current Active Choghadiya',
    planetsTitle: 'Graha Sthiti — Navagraha Ephemeris',
    planetsSub: 'Observational sidereal coordinates at local sunrise',
    graha: 'Graha (Planet)',
    rasi: 'Rāśi (Sign)',
    degrees: 'Degrees in Sign',
    pada: 'Nakṣatra & Pāda',
    motion: 'Motion',
    direct: 'Direct (Mārgī)',
    retrograde: 'Retrograde (Vakrī)',
    planetTransitionsTitle: 'Graha Gochara — Planetary Transitions',
    planetTransitionsSub: 'Precise ingress timings into Rashis and Nakshatras with sacred Punya Kala',
    transitRasi: 'Rāśi Transition (Saṅkrānti / Ingress)',
    transitNakshatra: 'Nakṣatra Transition',
    nextTransit: 'Next Transition',
    timeline: 'Upcoming Ingress Timeline',
    todayTransits: "Today's Planetary Transitions",
    punyaKala: 'Puṇyakāla (Auspicious Window)',
    mahaPunyaKala: 'Mahāpuṇyakāla',
    combust: 'Combust (Asta)',
    monthlyTitle: 'Māsa Almanac & Calendar',
    monthlySub: 'Day-by-day Tithi, Nakshatra, and timings overview',
    printTitle: 'Drik Panchanga Sheet',
    printSubtitle: 'Observational Vedic Lunisolar Ephemeris',
    printAction: 'Print / Save PDF',
    close: 'Close',
    searchCity: 'Search City',
    customCoords: 'Custom Coordinates',
    ayanamsaSystem: 'Ayanāṁśa System',
    monthScheme: 'Month Scheme (Māna)',
    eraDetails: 'Traditional Eras & Epochs',
    sakaEra: 'Śaka Saṁvat',
    vikramaEra: 'Vikrama Saṁvat',
    kaliYear: 'Kali Yuga Year',
    ahargana: 'Kali Ahargaṇa (Days)',
    popularCities: 'Popular Cities',
    detectGps: 'Detect Device Location (GPS)',
    useDeviceLocation: 'Use Device Location',
    detectingLocation: 'Detecting device GPS...',
    locationDetected: 'Device location detected successfully',
    saveAsDefault: 'Save as Default on this Device',
    savedSettingsTitle: 'Persistent Device Settings',
    savedSettingsDesc: 'Preferences and coordinates are securely stored on this browser',
    resetDefaults: 'Reset to Defaults',
    settingsSavedToast: 'Settings saved to this device',
    deviceGps: 'Device Location (GPS)',
    theme: 'Theme',
    parchment: 'Parchment',
    nightSky: 'Night Sky',
    parchmentDesc: 'Warm cosmic ivory and parchment for bright daytime reading',
    nightSkyDesc: 'Deep indigo and charcoal for comfortable nighttime viewing',
    switchToNightSky: 'Switch to Night Sky (Dark)',
    switchToParchment: 'Switch to Parchment (Light)',
    apply: 'Apply Changes',
    cancel: 'Cancel',
  },
  hi: {
    appName: 'दृग्गणित पञ्चाङ्ग',
    appSubtitle: 'सटीक प्रत्यक्ष वैदिक दृश्य पंचांग (नासा जेपीएल / दृक् प्रणाली आधारित)',
    invocation: '॥ श्री गणेशाय नमः ॥ श्री सूर्यदेवाय नमः ॥',
    today: 'आज',
    yesterday: 'कल (बीता)',
    tomorrow: 'कल (आगामी)',
    selectDate: 'दिनांक चुनें',
    changeLocation: 'स्थान बदलें',
    settings: 'सेटिंग्स व अयनांश',
    print: 'मुद्रण / पीडीएफ',
    views: {
      panchanga: 'दैनिक पञ्चाङ्ग',
      timings: 'शुभ-अशुभ मुहूर्त',
      choghadiya: 'चौघड़िया मुहूर्त',
      planets: 'ग्रह स्थिति',
      calendar: 'मासिक पंचांग',
      swara: 'स्वरोदय (स्वर योग)',
    },
    vedicAlmanac: 'वैदिक पंचांग क्रम',
    samvatsara: 'संवत्सर',
    masa: 'मास',
    paksha: 'पक्ष',
    sukla: 'शुक्ल',
    krishna: 'कृष्ण',
    vaara: 'वार',
    ayana: 'अयन',
    drikAyana: 'दृक् अयन',
    rtu: 'ऋतु',
    drikRtu: 'दृक् ऋतु',
    sunSign: 'सूर्य राशि',
    moonSign: 'चन्द्र राशि',
    solarDay: 'सौर दिवस चक्र',
    lunarNight: 'चन्द्र रात्रि चक्र',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    moonrise: 'चन्द्रोदय',
    moonset: 'चन्द्रास्त',
    dayLength: 'दिनमान',
    nightLength: 'रात्रिमान',
    limbsTitle: 'पञ्चाङ्ग के पाँच अंग',
    limbsSubtitle: 'प्रत्यक्ष खगोलीय गणना पर आधारित प्रामाणिक पंच अंग',
    tithi: 'तिथि',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    endsAt: 'समाप्ति',
    followedBy: 'उपरान्त',
    throughoutDay: 'अहोरात्र (दिन-रात)',
    auspiciousTimings: 'शुभ मुहूर्त (प्रशस्त समय)',
    inauspiciousTimings: 'अशुभ काल (वर्जित समय)',
    auspiciousSub: 'शुभ कार्य, अनुष्ठान व नवीन उद्यम आरम्भ करने हेतु श्रेष्ठ काल',
    inauspiciousSub: 'महत्वपूर्ण व शुभ कार्यों के आरम्भ से बचने हेतु समय',
    rahuKala: 'राहु काल',
    rahuKalaDesc: 'राहु द्वारा अधिपत्य काल; यात्रा व शुभ कार्य वर्जित हैं',
    yamaganda: 'यमगण्ड',
    yamagandaDesc: 'यम काल; शुभ कार्य व यात्रा आरम्भ न करें',
    gulikaKala: 'गुलिक काल',
    gulikaKalaDesc: 'शनि-पुत्र गुलिक का काल; स्थायी कार्यों हेतु विचारणीय',
    durmuhurta: 'दुर्मुहूर्त',
    durmuhurtaDesc: 'दिन के समय आने वाले अशुभ मुहूर्त खंड',
    varjyam: 'वर्ज्यम् (त्याज्य)',
    varjyamDesc: 'नक्षत्र का अशुभ भाग जिसमें शुभ कार्य त्याज्य हैं',
    abhijit: 'अभिजित् मुहूर्त',
    abhijitDesc: 'दिन का आठवाँ मुहूर्त; समस्त दोषों का शमन करने वाला श्रेष्ठ समय',
    brahmaMuhurta: 'ब्रह्म मुहूर्त',
    brahmaMuhurtaDesc: 'सूर्योदय से पूर्व ध्यान, विद्यारम्भ व ईश्वर आराधना हेतु सर्वश्रेष्ठ समय',
    amritaKala: 'अमृत काल',
    amritaKalaDesc: 'अमृत-युक्त समय, शुभ कार्य सिद्धि हेतु उत्तम',
    choghadiyaTitle: 'दैनिक चौघड़िया मुहूर्त',
    choghadiyaSub: 'दिन व रात के आठ-आठ भागों की तात्कालिक शुभ-अशुभ स्थिति',
    dayChoghadiya: 'दिन का चौघड़िया (सूर्योदय से सूर्यास्त)',
    nightChoghadiya: 'रात का चौघड़िया (सूर्यास्त से सूर्योदय)',
    currentChoghadiya: 'वर्तमान सक्रिय चौघड़िया',
    planetsTitle: 'ग्रह स्थिति — नवग्रह गोचर',
    planetsSub: 'स्थानीय सूर्योदय कालीन प्रत्यक्ष निरयण खगोलीय स्थिति',
    graha: 'ग्रह',
    rasi: 'राशि',
    degrees: 'अंश व कला',
    pada: 'नक्षत्र व चरण',
    motion: 'गति',
    direct: 'मार्गी',
    retrograde: 'वक्री',
    planetTransitionsTitle: 'ग्रह गोचर — राशि व नक्षत्र परिवर्तन',
    planetTransitionsSub: 'प्रत्यक्ष दृश्य ग्रहों का राशि व नक्षत्र प्रवेश तथा संक्रांति पुण्यकाल',
    transitRasi: 'राशि परिवर्तन (संक्रांति / गोचर)',
    transitNakshatra: 'नक्षत्र परिवर्तन',
    nextTransit: 'आगामी गोचर',
    timeline: 'आगामी गोचर कालक्रम',
    todayTransits: 'आज के ग्रह गोचर व प्रवेश',
    punyaKala: 'पुण्यकाल',
    mahaPunyaKala: 'महापुण्यकाल',
    combust: 'अस्त',
    monthlyTitle: 'मासिक पञ्चाङ्ग कैलेण्डर',
    monthlySub: 'सम्पूर्ण मास की दैनिक तिथियाँ, नक्षत्र एवं मुहूर्त विवरण',
    printTitle: 'दृग्गणित पञ्चाङ्ग पत्रक',
    printSubtitle: 'प्रत्यक्ष वैदिक पंचांग विवरण',
    printAction: 'प्रिंट / पीडीएफ सहेजें',
    close: 'बंद करें',
    searchCity: 'नगर खोजें',
    customCoords: 'कस्टम अक्षांश-देशांतर',
    ayanamsaSystem: 'अयनांश प्रणाली',
    monthScheme: 'मास पद्धति (अमान्त / पूर्णिमान्त)',
    eraDetails: 'युग व संवत्सर विवरण',
    sakaEra: 'शक संवत्',
    vikramaEra: 'विक्रम संवत्',
    kaliYear: 'कलियुगाब्द',
    ahargana: 'कलि अहर्गण (दिन)',
    popularCities: 'प्रमुख नगर',
    detectGps: 'डिवाइस का सटीक जीपीएस स्थान लें',
    useDeviceLocation: 'डिवाइस स्थान उपयोग करें',
    detectingLocation: 'डिवाइस जीपीएस की खोज जारी...',
    locationDetected: 'डिवाइस स्थान सफलतापूर्वक प्राप्त हुआ',
    saveAsDefault: 'इस डिवाइस पर डिफ़ॉल्ट रूप में सहेजें',
    savedSettingsTitle: 'स्थायी डिवाइस सेटिंग्स',
    savedSettingsDesc: 'आपकी प्राथमिकताएं और अक्षांश इस ब्राउज़र में सुरक्षित हैं',
    resetDefaults: 'मूल सेटिंग्स पर रीसेट करें',
    settingsSavedToast: 'सेटिंग्स डिवाइस में सुरक्षित हो गईं',
    deviceGps: 'डिवाइस स्थान (जीपीएस)',
    theme: 'थीम / स्वरूप',
    parchment: 'पार्चमेंट',
    nightSky: 'रात्रि आकाश',
    parchmentDesc: 'उज्ज्वल दिवस पठन हेतु पारम्परिक स्वर्णिम पाण्डुलिपि पृष्ठ',
    nightSkyDesc: 'रात्रि में नेत्र-शान्ति हेतु गहन नील एवं चारकोल पृष्ठ',
    switchToNightSky: 'रात्रि आकाश थीम चालू करें',
    switchToParchment: 'पार्चमेंट थीम चालू करें',
    apply: 'लागू करें',
    cancel: 'रद्द करें',
  },
  sa: {
    appName: 'दृग्गणितपञ्चाङ्गम्',
    appSubtitle: 'प्रत्यक्षदृक्सिद्धं वैदिकपञ्चाङ्गम् (नासा जेपीएल / दृग्गणितप्रणाली)',
    invocation: '॥ श्री गणेशाय नमः ॥ श्री सूर्यदेवाय नमः ॥',
    today: 'अद्य',
    yesterday: 'ह्यः',
    tomorrow: 'श्वः',
    selectDate: 'दिनाङ्कचयनम्',
    changeLocation: 'स्थानपरिवर्तनम्',
    settings: 'अयनांशव्यवस्था',
    print: 'मुद्रणम् / पत्रकम्',
    views: {
      panchanga: 'दैनिकपञ्चाङ्गम्',
      timings: 'शुभमुहूर्ताः',
      choghadiya: 'गौरीपञ्चाङ्गम्',
      planets: 'ग्रहस्थितिः',
      calendar: 'मासिकपञ्चाङ्गम्',
      swara: 'शिवस्वरोदयः (स्वरयोगः)',
    },
    vedicAlmanac: 'वैदिककालक्रमः',
    samvatsara: 'संवत्सरः',
    masa: 'मासः',
    paksha: 'पक्षः',
    sukla: 'शुक्लपक्षः',
    krishna: 'कृष्णपक्षः',
    vaara: 'वासरः',
    ayana: 'अयनम्',
    drikAyana: 'दृगयनम्',
    rtu: 'ऋतुः',
    drikRtu: 'दृगृतुः',
    sunSign: 'सूर्यराशिः',
    moonSign: 'चन्द्रराशिः',
    solarDay: 'सौरदिनचक्रम्',
    lunarNight: 'चान्द्ररात्रिचक्रम्',
    sunrise: 'सूर्योदयः',
    sunset: 'सूर्यास्तः',
    moonrise: 'चन्द्रोदयः',
    moonset: 'चन्द्रास्तः',
    dayLength: 'दिनमानम्',
    nightLength: 'रात्रिमानम्',
    limbsTitle: 'पञ्चाङ्गानि — पञ्च मुख्य-अङ्गानि',
    limbsSubtitle: 'प्रत्यक्षदृक्सिद्धानि खगोलीय-अङ्गानि',
    tithi: 'तिथिः',
    nakshatra: 'नक्षत्रम्',
    yoga: 'योगः',
    karana: 'करणम्',
    endsAt: 'समाप्तिः',
    followedBy: 'तदनन्तरम्',
    throughoutDay: 'अहोरात्रम्',
    auspiciousTimings: 'शुभमुहूर्ताः (प्रशस्ताः)',
    inauspiciousTimings: 'अशुभकालाः (वर्ज्याः)',
    auspiciousSub: 'कर्मारम्भाय प्रशस्तकालाः',
    inauspiciousSub: 'सर्वकर्मसु त्याज्याः कालाः',
    rahuKala: 'राहुकालः',
    rahuKalaDesc: 'राहुणा अधिपतितः भागः; सर्वकर्मसु वर्ज्यः',
    yamaganda: 'यमगण्डः',
    yamagandaDesc: 'यमस्य कालः; यात्रासु त्याज्यः',
    gulikaKala: 'गुलिककालः',
    gulikaKalaDesc: 'शनिपुत्रस्य गुलिकस्य भागः',
    durmuhurta: 'दुर्मुहूर्तः',
    durmuhurtaDesc: 'दिने वर्ज्याः मुहूर्ताः',
    varjyam: 'वर्ज्यम्',
    varjyamDesc: 'नक्षत्रदोषयुक्तः भागः',
    abhijit: 'अभिजित्मुहूर्तः',
    abhijitDesc: 'मध्याह्ने अष्टमो मुहूर्तः; सर्वदोषप्रशमनः',
    brahmaMuhurta: 'ब्रह्ममुहूर्तः',
    brahmaMuhurtaDesc: 'सूर्योदयात् पूर्वं ज्ञान-ध्यान-साधनाय उत्तमः',
    amritaKala: 'अमृतकालः',
    amritaKalaDesc: 'अमृतयुक्तः प्रशस्तसमयः',
    choghadiyaTitle: 'गौरीपञ्चाङ्गम् (चौघड़िया)',
    choghadiyaSub: 'अष्टधा विभक्ताः दिन-रात्र्योः कालविभागाः',
    dayChoghadiya: 'दिनभागः (दिवा)',
    nightChoghadiya: 'रात्रिभागः (नक्तम्)',
    currentChoghadiya: 'वर्तमानप्रवृत्तः भागः',
    planetsTitle: 'ग्रहस्थितिः (नवग्रहाः)',
    planetsSub: 'सूर्योदयकालिकी निरयणग्रहस्थितिः',
    graha: 'ग्रहः',
    rasi: 'राशिः',
    degrees: 'अंशाः',
    pada: 'नक्षत्रं पादश्च',
    motion: 'गतिः',
    direct: 'मार्गी',
    retrograde: 'वक्री',
    planetTransitionsTitle: 'ग्रहगोचरः — राशिनक्षत्रसंक्रमणम्',
    planetTransitionsSub: 'प्रत्यक्षग्रहसंक्रमणकालाः संक्रान्तिपुण्यकालसहिताः',
    transitRasi: 'राशिपरिवर्तनम् (संक्रान्तिः / गोचरः)',
    transitNakshatra: 'नक्षत्रप्रवेशः',
    nextTransit: 'आगामी गोचरः',
    timeline: 'आगामिसंक्रमणकालक्रमः',
    todayTransits: 'अद्यतनानि ग्रहसंक्रमणानि',
    punyaKala: 'पुण्यकालः',
    mahaPunyaKala: 'महापुण्यकालः',
    combust: 'अस्तङ्गतः',
    monthlyTitle: 'मासिकपञ्चाङ्गम्',
    monthlySub: 'सम्पूर्णमासस्य तिथिनक्षत्रादिविवरणम्',
    printTitle: 'दृग्गणितपञ्चाङ्गपत्रम्',
    printSubtitle: 'प्रत्यक्षवैदिकपञ्चाङ्गविवरणम्',
    printAction: 'मुद्रणं कुर्वन्तु',
    close: 'पिदधातु',
    searchCity: 'नगरान्वेषणम्',
    customCoords: 'स्वाभीष्ट-अक्षांशाः',
    ayanamsaSystem: 'अयनांशपद्धतिः',
    monthScheme: 'मासपद्धतिः',
    eraDetails: 'संवत्सराब्दविवरणम्',
    sakaEra: 'शकसंवत्सरः',
    vikramaEra: 'विक्रमसंवत्सरः',
    kaliYear: 'कलियुगाब्दः',
    ahargana: 'कल्यहर्गणः',
    popularCities: 'प्रमुखाणि नगराणि',
    detectGps: 'उपकरणस्य प्रत्यक्षस्थानं गृह्णातु (GPS)',
    useDeviceLocation: 'उपकरणस्थानं प्रयुज्यताम्',
    detectingLocation: 'उपकरणस्य जीपीएस-अन्वेषणं क्रियते...',
    locationDetected: 'उपकरणस्थानं सफलतया प्राप्तम्',
    saveAsDefault: 'अस्मिन् उपकरणे नित्यस्थानरूपेण संरक्षतु',
    savedSettingsTitle: 'स्थिरोपकरणव्यवस्था',
    savedSettingsDesc: 'प्राथमिकताः अक्षांशाश्च अस्मिन् उपकरणे सुरक्षिताः',
    resetDefaults: 'मूलव्यवस्थां प्रतिगच्छतु',
    settingsSavedToast: 'व्यवस्थाः अस्मिन् उपकरणे संरक्षिताः',
    deviceGps: 'उपकरणस्थानम् (GPS)',
    theme: 'स्वरूपम् (Theme)',
    parchment: 'पत्रपाण्डु (Parchment)',
    nightSky: 'निशीथाकाशः (Night Sky)',
    parchmentDesc: 'दिवसपठनार्थं सौम्यपत्रपृष्ठम्',
    nightSkyDesc: 'रात्रौ नेत्रसौख्यार्थं गहननील-अङ्गारवर्णम्',
    switchToNightSky: 'निशीथाकाश-स्वरूपं स्वीकुरु',
    switchToParchment: 'पत्रपाण्डु-स्वरूपं स्वीकुरु',
    apply: 'स्वीकुरु',
    cancel: 'त्यजतु',
  },
};

// Devanagari mappings for Tithi names
export const TITHI_DEVANAGARI: Record<number, { sa: string; hi: string; en: string }> = {
  1: { sa: 'शुक्ल प्रतिपदा', hi: 'शुक्ल प्रतिपदा', en: 'Śukla Pratipadā' },
  2: { sa: 'शुक्ल द्वितीया', hi: 'शुक्ल द्वितीया', en: 'Śukla Dvitīyā' },
  3: { sa: 'शुक्ल तृतीया', hi: 'शुक्ल तृतीया', en: 'Śukla Tṛtīyā' },
  4: { sa: 'शुक्ल चतुर्थी', hi: 'शुक्ल चतुर्थी', en: 'Śukla Caturthī' },
  5: { sa: 'शुक्ल पञ्चमी', hi: 'शुक्ल पंचमी', en: 'Śukla Pañcamī' },
  6: { sa: 'शुक्ल षष्ठी', hi: 'शुक्ल षष्ठी', en: 'Śukla Ṣaṣṭhī' },
  7: { sa: 'शुक्ल सप्तमी', hi: 'शुक्ल सप्तमी', en: 'Śukla Saptamī' },
  8: { sa: 'शुक्ल अष्टमी', hi: 'शुक्ल अष्टमी', en: 'Śukla Aṣṭamī' },
  9: { sa: 'शुक्ल नवमी', hi: 'शुक्ल नवमी', en: 'Śukla Navamī' },
  10: { sa: 'शुक्ल दशमी', hi: 'शुक्ल दशमी', en: 'Śukla Daśamī' },
  11: { sa: 'शुक्ल एकादशी', hi: 'शुक्ल एकादशी', en: 'Śukla Ekādaśī' },
  12: { sa: 'शुक्ल द्वादशी', hi: 'शुक्ल द्वादशी', en: 'Śukla Dvādaśī' },
  13: { sa: 'शुक्ल त्रयोदशी', hi: 'शुक्ल त्रयोदशी', en: 'Śukla Trayodaśī' },
  14: { sa: 'शुक्ल चतुर्दशी', hi: 'शुक्ल चतुर्दशी', en: 'Śukla Caturdaśī' },
  15: { sa: 'पूर्णिमा', hi: 'पूर्णिमा', en: 'Pūrṇimā' },
  16: { sa: 'कृष्ण प्रतिपदा', hi: 'कृष्ण प्रतिपदा', en: 'Kṛṣṇa Pratipadā' },
  17: { sa: 'कृष्ण द्वितीया', hi: 'कृष्ण द्वितीया', en: 'Kṛṣṇa Dvitīyā' },
  18: { sa: 'कृष्ण तृतीया', hi: 'कृष्ण तृतीया', en: 'Kṛṣṇa Tṛtīyā' },
  19: { sa: 'कृष्ण चतुर्थी', hi: 'कृष्ण चतुर्थी', en: 'Kṛṣṇa Caturthī' },
  20: { sa: 'कृष्ण पञ्चमी', hi: 'कृष्ण पंचमी', en: 'Kṛṣṇa Pañcamī' },
  21: { sa: 'कृष्ण षष्ठी', hi: 'कृष्ण षष्ठी', en: 'Kṛṣṇa Ṣaṣṭhī' },
  22: { sa: 'कृष्ण सप्तमी', hi: 'कृष्ण सप्तमी', en: 'Kṛṣṇa Saptamī' },
  23: { sa: 'कृष्ण अष्टमी', hi: 'कृष्ण अष्टमी', en: 'Kṛṣṇa Aṣṭamī' },
  24: { sa: 'कृष्ण नवमी', hi: 'कृष्ण नवमी', en: 'Kṛṣṇa Navamī' },
  25: { sa: 'कृष्ण दशमी', hi: 'कृष्ण दशमी', en: 'Kṛṣṇa Daśamī' },
  26: { sa: 'कृष्ण एकादशी', hi: 'कृष्ण एकादशी', en: 'Kṛṣṇa Ekādaśī' },
  27: { sa: 'कृष्ण द्वादशी', hi: 'कृष्ण द्वादशी', en: 'Kṛṣṇa Dvādaśī' },
  28: { sa: 'कृष्ण त्रयोदशी', hi: 'कृष्ण त्रयोदशी', en: 'Kṛṣṇa Trayodaśī' },
  29: { sa: 'कृष्ण चतुर्दशी', hi: 'कृष्ण चतुर्दशी', en: 'Kṛṣṇa Caturdaśī' },
  30: { sa: 'अमावास्या', hi: 'अमावस्या', en: 'Amāvāsyā' },
};

// 27 Nakshatras
export const NAKSHATRA_TRANSLATIONS: Record<number, { sa: string; hi: string; en: string }> = {
  1: { sa: 'अश्विनी', hi: 'अश्विनी', en: 'Aśvinī' },
  2: { sa: 'भरणी', hi: 'भरणी', en: 'Bharaṇī' },
  3: { sa: 'कृत्तिका', hi: 'कृत्तिका', en: 'Kṛttikā' },
  4: { sa: 'रोहिणी', hi: 'रोहिणी', en: 'Rohiṇī' },
  5: { sa: 'मृगशीर्षा', hi: 'मृगशिरा', en: 'Mṛgaśīrṣā' },
  6: { sa: 'आर्द्रा', hi: 'आर्द्रा', en: 'Ārdrā' },
  7: { sa: 'पुनर्वसुः', hi: 'पुनर्वसु', en: 'Punarvasū' },
  8: { sa: 'पुष्यः', hi: 'पुष्य', en: 'Puṣya' },
  9: { sa: 'अश्लेषा', hi: 'अश्लेषा', en: 'Āśleṣā' },
  10: { sa: 'मघा', hi: 'मघा', en: 'Maghā' },
  11: { sa: 'पूर्वफाल्गुनी', hi: 'पूर्वाफाल्गुनी', en: 'Pūrvaphalgunī' },
  12: { sa: 'उत्तरफाल्गुनी', hi: 'उत्तराफाल्गुनी', en: 'Uttaraphalgunī' },
  13: { sa: 'हस्तः', hi: 'हस्त', en: 'Hasta' },
  14: { sa: 'चित्रा', hi: 'चित्रा', en: 'Citrā' },
  15: { sa: 'स्वाती', hi: 'स्वाति', en: 'Svātī' },
  16: { sa: 'विशाखा', hi: 'विशाखा', en: 'Viśākhā' },
  17: { sa: 'अनुराधा', hi: 'अनुराधा', en: 'Anurādhā' },
  18: { sa: 'ज्येष्ठा', hi: 'ज्येष्ठा', en: 'Jyeṣṭhā' },
  19: { sa: 'मूलम्', hi: 'मूल', en: 'Mūla' },
  20: { sa: 'पूर्वाषाढा', hi: 'पूर्वाषाढ़ा', en: 'Pūrvāṣāḍhā' },
  21: { sa: 'उत्तराषाढा', hi: 'उत्तराषाढ़ा', en: 'Uttarāṣāḍhā' },
  22: { sa: 'श्रवणम्', hi: 'श्रवण', en: 'Śravaṇa' },
  23: { sa: 'धनिष्ठा', hi: 'धनिष्ठा', en: 'Dhaniṣṭhā' },
  24: { sa: 'शतभिषा', hi: 'शतभिषा', en: 'Śatabhiṣā' },
  25: { sa: 'पूर्वभाद्रपदा', hi: 'पूर्वाभाद्रपद', en: 'Pūrvabhādrapadā' },
  26: { sa: 'उत्तरभाद्रपदा', hi: 'उत्तराभाद्रपद', en: 'Uttarabhādrapadā' },
  27: { sa: 'रेवती', hi: 'रेवती', en: 'Revatī' },
};

// 27 Yogas
export const YOGA_TRANSLATIONS: Record<number, { sa: string; hi: string; en: string }> = {
  1: { sa: 'विष्कम्भः', hi: 'विष्कम्भ', en: 'Viṣkambha' },
  2: { sa: 'प्रीतिः', hi: 'प्रीति', en: 'Prīti' },
  3: { sa: 'आयुष्मान्', hi: 'आयुष्मान', en: 'Āyuṣmān' },
  4: { sa: 'सौभाग्यः', hi: 'सौभाग्य', en: 'Saubhāgya' },
  5: { sa: 'शोभनः', hi: 'शोभन', en: 'Śobhana' },
  6: { sa: 'अतिगण्डः', hi: 'अतिगण्ड', en: 'Atigaṇḍa' },
  7: { sa: 'सुकर्मा', hi: 'सुकर्मा', en: 'Sukarmā' },
  8: { sa: 'धृतिः', hi: 'धृति', en: 'Dhṛti' },
  9: { sa: 'शूलः', hi: 'शूल', en: 'Śūla' },
  10: { sa: 'गण्डः', hi: 'गण्ड', en: 'Gaṇḍa' },
  11: { sa: 'वृद्धिः', hi: 'वृद्धि', en: 'Vṛddhi' },
  12: { sa: 'ध्रुवः', hi: 'ध्रुव', en: 'Dhruva' },
  13: { sa: 'व्याघातः', hi: 'व्याघात', en: 'Vyāghāta' },
  14: { sa: 'हर्षणः', hi: 'हर्षण', en: 'Harṣaṇa' },
  15: { sa: 'वज्रः', hi: 'वज्र', en: 'Vajra' },
  16: { sa: 'सिद्धिः', hi: 'सिद्धि', en: 'Siddhi' },
  17: { sa: 'व्यतीपातः', hi: 'व्यतीपात', en: 'Vyatīpāta' },
  18: { sa: 'वरीयान्', hi: 'वरीयान', en: 'Varīyān' },
  19: { sa: 'परिघः', hi: 'परिघ', en: 'Parigha' },
  20: { sa: 'शिवः', hi: 'शिव', en: 'Śiva' },
  21: { sa: 'सिद्धः', hi: 'सिद्ध', en: 'Siddha' },
  22: { sa: 'साध्यः', hi: 'साध्य', en: 'Sādhya' },
  23: { sa: 'शुभः', hi: 'शुभ', en: 'Śubha' },
  24: { sa: 'शुक्लः', hi: 'शुक्ल', en: 'Śukla' },
  25: { sa: 'ब्रह्म', hi: 'ब्रह्म', en: 'Brahma' },
  26: { sa: 'ऐन्द्रः', hi: 'इन्द्र', en: 'Aindra' },
  27: { sa: 'वैधृतिः', hi: 'वैधृति', en: 'Vaidhṛti' },
};

// 11 Karanas
export const KARANA_TRANSLATIONS: Record<number, { sa: string; hi: string; en: string }> = {
  1: { sa: 'बवः', hi: 'बव', en: 'Bava' },
  2: { sa: 'बालवः', hi: 'बालव', en: 'Bālava' },
  3: { sa: 'कौलवः', hi: 'कौलव', en: 'Kaulava' },
  4: { sa: 'तैतिलः', hi: 'तैतिल', en: 'Taitila' },
  5: { sa: 'गरः', hi: 'गर', en: 'Gara' },
  6: { sa: 'वणिजः', hi: 'वणिज', en: 'Vaṇija' },
  7: { sa: 'विष्टिः (भद्रा)', hi: 'विष्टि (भद्रा)', en: 'Viṣṭi (Bhadrā)' },
  8: { sa: 'शकुनिः', hi: 'शकुनि', en: 'Śakuni' },
  9: { sa: 'चतुष्पात्', hi: 'चतुष्पद', en: 'Catuṣpāda' },
  10: { sa: 'नागः', hi: 'नाग', en: 'Nāga' },
  11: { sa: 'किंस्तुघ्नः', hi: 'किंस्तुघ्न', en: 'Kiṁstughna' },
};

// 7 Vaaras
export const VAARA_TRANSLATIONS: Record<string, { sa: string; hi: string; en: string }> = {
  Ravivāra: { sa: 'रविवासरः', hi: 'रविवार', en: 'Ravivāra (Sunday)' },
  Somavāra: { sa: 'सोमवासरः', hi: 'सोमवार', en: 'Somavāra (Monday)' },
  Maṅgalavāra: { sa: 'मङ्गलवासरः', hi: 'मंगलवार', en: 'Maṅgalavāra (Tuesday)' },
  Budhavāra: { sa: 'बुधवासरः', hi: 'बुधवार', en: 'Budhavāra (Wednesday)' },
  Guruvāra: { sa: 'गुरुवासरः', hi: 'गुरुवार', en: 'Guruvāra (Thursday)' },
  Śukravāra: { sa: 'शुक्रवासरः', hi: 'शुक्रवार', en: 'Śukravāra (Friday)' },
  Śanivāra: { sa: 'शनिवासरः', hi: 'शनिवार', en: 'Śanivāra (Saturday)' },
};

// 12 Zodiac signs
export const RASI_TRANSLATIONS: Record<string, { sa: string; hi: string; en: string }> = {
  meṣa: { sa: 'मेषः', hi: 'मेष', en: 'Meṣa (Aries)' },
  vṛṣabha: { sa: 'वृषभः', hi: 'वृषभ', en: 'Vṛṣabha (Taurus)' },
  mithuna: { sa: 'मिथुनम्', hi: 'मिथुन', en: 'Mithuna (Gemini)' },
  karka: { sa: 'कर्कः', hi: 'कर्क', en: 'Karka (Cancer)' },
  karkāṭaka: { sa: 'कर्कः', hi: 'कर्क', en: 'Karkāṭaka (Cancer)' },
  siṃha: { sa: 'सिंहः', hi: 'सिंह', en: 'Siṁha (Leo)' },
  kanyā: { sa: 'कन्या', hi: 'कन्या', en: 'Kanyā (Virgo)' },
  tulā: { sa: 'तुला', hi: 'तुला', en: 'Tulā (Libra)' },
  vṛścika: { sa: 'वृश्चिकः', hi: 'वृश्चिक', en: 'Vṛścika (Scorpio)' },
  dhanu: { sa: 'धनुः', hi: 'धनु', en: 'Dhanu (Sagittarius)' },
  makara: { sa: 'मकरः', hi: 'मकर', en: 'Makara (Capricorn)' },
  kumbha: { sa: 'कुम्भः', hi: 'कुम्भ', en: 'Kumbha (Aquarius)' },
  mīna: { sa: 'मीनः', hi: 'मीन', en: 'Mīna (Pisces)' },
};

// 9 Grahas
export const GRAHA_TRANSLATIONS: Record<string, { sa: string; hi: string; en: string; symbol: string }> = {
  sun: { sa: 'सूर्यः', hi: 'सूर्य', en: 'Sun (Sūrya)', symbol: '☉' },
  moon: { sa: 'चन्द्रः', hi: 'चन्द्र', en: 'Moon (Candra)', symbol: '☽' },
  mars: { sa: 'मङ्गलः', hi: 'मंगल', en: 'Mars (Maṅgala)', symbol: '♂' },
  mercury: { sa: 'बुधः', hi: 'बुध', en: 'Mercury (Budha)', symbol: '☿' },
  jupiter: { sa: 'गुरुः', hi: 'बृहस्पति (गुरु)', en: 'Jupiter (Guru)', symbol: '♃' },
  venus: { sa: 'शुक्रः', hi: 'शुक्र', en: 'Venus (Śukra)', symbol: '♀' },
  saturn: { sa: 'शनैश्चरः', hi: 'शनि', en: 'Saturn (Śani)', symbol: '♄' },
  rahu: { sa: 'राहुः', hi: 'राहु', en: 'North Node (Rāhu)', symbol: '☊' },
  ketu: { sa: 'केतुः', hi: 'केतु', en: 'South Node (Ketu)', symbol: '☋' },
};

// 7 Choghadiya names
export const CHOGHADIYA_TRANSLATIONS: Record<string, { sa: string; hi: string; en: string; nature: string; natureType: 'auspicious' | 'neutral' | 'inauspicious' }> = {
  amrita: { sa: 'अमृतम्', hi: 'अमृत', en: 'Amṛta', nature: 'Best (सर्वश्रेष्ठ)', natureType: 'auspicious' },
  shubha: { sa: 'शुभम्', hi: 'शुभ', en: 'Śubha', nature: 'Good (मङ्गलकारी)', natureType: 'auspicious' },
  labha: { sa: 'लाभः', hi: 'लाभ', en: 'Lābha', nature: 'Gain (उन्नतिदायक)', natureType: 'auspicious' },
  chara: { sa: 'चलम् (चरम्)', hi: 'चर (चल)', en: 'Chara', nature: 'Neutral (चल-गतिशील)', natureType: 'neutral' },
  udvega: { sa: 'उद्वेगः', hi: 'उद्वेग', en: 'Udvega', nature: 'Bad (कष्टप्रद)', natureType: 'inauspicious' },
  kala: { sa: 'कालः', hi: 'काल', en: 'Kāla', nature: 'Loss (हानिकारक)', natureType: 'inauspicious' },
  roga: { sa: 'रोगः', hi: 'रोग', en: 'Roga', nature: 'Harm (अशुभ)', natureType: 'inauspicious' },
};

// 12 Masas
export const MASA_TRANSLATIONS: Record<string, { sa: string; hi: string; en: string }> = {
  Caitra: { sa: 'चैत्रः', hi: 'चैत्र', en: 'Caitra' },
  Vaiśākha: { sa: 'वैशाखः', hi: 'वैशाख', en: 'Vaiśākha' },
  Jyeṣṭha: { sa: 'ज्येष्ठः', hi: 'ज्येष्ठ', en: 'Jyeṣṭha' },
  Āṣāḍha: { sa: 'आषाढः', hi: 'आषाढ़', en: 'Āṣāḍha' },
  Śrāvaṇa: { sa: 'श्रावणः', hi: 'श्रावण', en: 'Śrāvaṇa' },
  Bhādrapada: { sa: 'भाद्रपदः', hi: 'भाद्रपद', en: 'Bhādrapada' },
  Āśvina: { sa: 'आश्विनः', hi: 'आश्विन', en: 'Āśvina' },
  Kārtika: { sa: 'कार्तिकः', hi: 'कार्तिक', en: 'Kārtika' },
  Mārgaśīrṣa: { sa: 'मार्गशीर्षः', hi: 'मार्गशीर्ष (अगहन)', en: 'Mārgaśīrṣa' },
  Puṣya: { sa: 'पौषः', hi: 'पौष', en: 'Pauṣa / Puṣya' },
  Māgha: { sa: 'माघः', hi: 'माघ', en: 'Māgha' },
  Phālguṇa: { sa: 'फाल्गुनः', hi: 'फाल्गुन', en: 'Phālguṇa' },
};

// Translation helper functions
export function getLocalizedTithi(tithiNum: number, lang: Language): string {
  const item = TITHI_DEVANAGARI[tithiNum];
  if (!item) return `Tithi ${tithiNum}`;
  return item[lang] || item.en;
}

export function getLocalizedNakshatra(nakNum: number, fallback: string, lang: Language): string {
  const item = NAKSHATRA_TRANSLATIONS[nakNum];
  if (!item) return fallback;
  return item[lang] || fallback;
}

export function getLocalizedYoga(yogaNum: number, fallback: string, lang: Language): string {
  const item = YOGA_TRANSLATIONS[yogaNum];
  if (!item) return fallback;
  return item[lang] || fallback;
}

export function getLocalizedKarana(karNum: number, fallback: string, lang: Language): string {
  const modNum = ((karNum - 1) % 11) + 1;
  const item = KARANA_TRANSLATIONS[modNum] || KARANA_TRANSLATIONS[karNum];
  if (!item) return fallback;
  return item[lang] || fallback;
}

export function getLocalizedVaara(vaaraName: string, lang: Language): string {
  const item = VAARA_TRANSLATIONS[vaaraName];
  if (!item) return vaaraName;
  return item[lang] || vaaraName;
}

export function getLocalizedRasi(rasiKey: string, lang: Language): string {
  const cleanKey = (rasiKey || '').toLowerCase().trim();
  const item = RASI_TRANSLATIONS[cleanKey];
  if (!item) return rasiKey;
  return item[lang] || rasiKey;
}

export function getLocalizedMasa(masaName: string, lang: Language): string {
  const item = MASA_TRANSLATIONS[masaName];
  if (!item) return masaName;
  return item[lang] || masaName;
}

export function getLocalizedChoghadiya(name: string, lang: Language): { name: string; nature: string; natureType: 'auspicious' | 'neutral' | 'inauspicious' } {
  const clean = (name || '').toLowerCase().trim();
  const item = CHOGHADIYA_TRANSLATIONS[clean];
  if (!item) {
    return { name, nature: '', natureType: 'neutral' };
  }
  return {
    name: item[lang] || item.en,
    nature: item.nature,
    natureType: item.natureType,
  };
}
