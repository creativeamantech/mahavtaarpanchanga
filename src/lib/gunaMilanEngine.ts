import { NAKSHATRAS_LIST, ZODIAC_SIGNS } from "./kundliEngine";

export interface GunaMilanKoota {
  nameEn: string;
  nameHi: string;
  maxScore: number;
  obtainedScore: number;
  descriptionHi: string;
  descriptionEn: string;
  isDosha: boolean;
  isCancelled: boolean;
  cancellationReasonHi?: string;
}

export interface GunaMilanResult {
  boyProfile: {
    name: string;
    nakshatraNum: number;
    nakshatraNameHi: string;
    pada: number;
    rasiIndex: number;
    rasiNameHi: string;
    rasiLord: string;
    isManglik: boolean;
  };
  girlProfile: {
    name: string;
    nakshatraNum: number;
    nakshatraNameHi: string;
    pada: number;
    rasiIndex: number;
    rasiNameHi: string;
    rasiLord: string;
    isManglik: boolean;
  };
  kootas: {
    varna: GunaMilanKoota;
    vashya: GunaMilanKoota;
    tara: GunaMilanKoota;
    yoni: GunaMilanKoota;
    grahaMaitri: GunaMilanKoota;
    gana: GunaMilanKoota;
    bhakoot: GunaMilanKoota;
    nadi: GunaMilanKoota;
  };
  totalObtainedScore: number;
  maxPossibleScore: number; // 36
  percentage: number;
  verdict: "excellent" | "good" | "average" | "not_recommended";
  verdictLabelHi: string;
  manglikMatch: {
    isCompatible: boolean;
    descriptionHi: string;
  };
  remedyAdviceHi: string;
}

// 1. Varna Matrix: Cancer, Scorpio, Pisces (Brahmin=4); Aries, Leo, Sagittarius (Kshatriya=3); Taurus, Virgo, Capricorn (Vaishya=2); Gemini, Libra, Aquarius (Shudra=1)
const RASI_VARNA_SCORE: Record<number, number> = {
  3: 4, 7: 4, 11: 4, // Water
  0: 3, 4: 3, 8: 3,  // Fire
  1: 2, 5: 2, 9: 2,  // Earth
  2: 1, 6: 1, 10: 1, // Air
};

// 2. Vashya Groups
function getVashyaGroup(rasiIndex: number): string {
  if ([0, 1, 8, 9].includes(rasiIndex)) return "Chatushpada (चतुष्पद)";
  if ([2, 5, 6, 10].includes(rasiIndex)) return "Manava (द्विपद/मानव)";
  if ([3, 11].includes(rasiIndex)) return "Jalachara (जलचर)";
  if (rasiIndex === 4) return "Vanchara/Simha (वनचर)";
  if (rasiIndex === 7) return "Keeta (कीट)";
  return "Manava";
}

// 4. Yoni Animal Mapping for 27 Nakshatras
const NAKSHATRA_YONI_MAP: number[] = [
  0, // 1. Ashwini: Horse
  1, // 2. Bharani: Elephant
  2, // 3. Krittika: Sheep
  3, // 4. Rohini: Serpent
  3, // 5. Mrigashira: Serpent
  4, // 6. Ardra: Dog
  5, // 7. Punarvasu: Cat
  2, // 8. Pushya: Sheep
  5, // 9. Ashlesha: Cat
  6, // 10. Magha: Rat
  6, // 11. Purva Phalguni: Rat
  7, // 12. Uttara Phalguni: Cow
  8, // 13. Hasta: Buffalo
  9, // 14. Chitra: Tiger
  8, // 15. Swati: Buffalo
  9, // 16. Vishakha: Tiger
  10, // 17. Anuradha: Deer
  10, // 18. Jyeshtha: Deer
  4, // 19. Moola: Dog
  11, // 20. Purva Ashadha: Monkey
  12, // 21. Uttara Ashadha: Mongoose
  11, // 22. Shravana: Monkey
  13, // 23. Dhanishta: Lion
  0, // 24. Shatabhisha: Horse
  13, // 25. Purva Bhadrapada: Lion
  7, // 26. Uttara Bhadrapada: Cow
  1, // 27. Revati: Elephant
];

// Yoni Friendship Points Matrix (0-13)
// 4 = Same, 3 = Friend, 2 = Neutral, 1 = Enemy, 0 = Sworn Enemy
const YONI_ENMITY_PAIRS = [
  [0, 8], // Horse vs Buffalo
  [1, 13], // Elephant vs Lion
  [2, 11], // Sheep vs Monkey
  [3, 12], // Serpent vs Mongoose
  [4, 10], // Dog vs Deer
  [5, 6], // Cat vs Rat
  [7, 9], // Cow vs Tiger
];

function getYoniScore(y1: number, y2: number): number {
  if (y1 === y2) return 4;
  for (const [a, b] of YONI_ENMITY_PAIRS) {
    if ((y1 === a && y2 === b) || (y1 === b && y2 === a)) return 0;
  }
  return 2.5; // neutral average
}

// 5. Planetary Relationship (Graha Maitri) Matrix
const PLANETARY_FRIENDSHIP: Record<string, Record<string, "friend" | "neutral" | "enemy">> = {
  Sun: { Sun: "friend", Moon: "friend", Mars: "friend", Mercury: "neutral", Jupiter: "friend", Venus: "enemy", Saturn: "enemy" },
  Moon: { Sun: "friend", Moon: "friend", Mars: "neutral", Mercury: "friend", Jupiter: "neutral", Venus: "neutral", Saturn: "neutral" },
  Mars: { Sun: "friend", Moon: "friend", Mars: "friend", Mercury: "enemy", Jupiter: "friend", Venus: "neutral", Saturn: "neutral" },
  Mercury: { Sun: "friend", Moon: "enemy", Mars: "neutral", Mercury: "friend", Jupiter: "neutral", Venus: "friend", Saturn: "neutral" },
  Jupiter: { Sun: "friend", Moon: "friend", Mars: "friend", Mercury: "enemy", Jupiter: "friend", Venus: "enemy", Saturn: "neutral" },
  Venus: { Sun: "enemy", Moon: "enemy", Mars: "neutral", Mercury: "friend", Jupiter: "neutral", Venus: "friend", Saturn: "friend" },
  Saturn: { Sun: "enemy", Moon: "enemy", Mars: "enemy", Mercury: "friend", Jupiter: "neutral", Venus: "friend", Saturn: "friend" },
};

function getGrahaMaitriScore(lord1: string, lord2: string): number {
  if (lord1 === lord2) return 5;
  const rel1 = PLANETARY_FRIENDSHIP[lord1]?.[lord2] || "neutral";
  const rel2 = PLANETARY_FRIENDSHIP[lord2]?.[lord1] || "neutral";

  if (rel1 === "friend" && rel2 === "friend") return 5;
  if ((rel1 === "friend" && rel2 === "neutral") || (rel1 === "neutral" && rel2 === "friend")) return 4;
  if (rel1 === "neutral" && rel2 === "neutral") return 3;
  if ((rel1 === "friend" && rel2 === "enemy") || (rel1 === "enemy" && rel2 === "friend")) return 1;
  if ((rel1 === "neutral" && rel2 === "enemy") || (rel1 === "enemy" && rel2 === "neutral")) return 0.5;
  return 0;
}

// 6. Gana Mapping (Deva=0, Manushya=1, Rakshasa=2)
const GANA_MAP: number[] = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, // 1-9
  2, 1, 1, 0, 2, 0, 2, 0, 2, // 10-18
  2, 1, 1, 0, 2, 2, 1, 1, 0, // 19-27
];

function getGanaScore(boyGana: number, girlGana: number): number {
  if (boyGana === girlGana) return 6;
  if (boyGana === 0 && girlGana === 1) return 5; // Deva Boy, Manushya Girl
  if (boyGana === 1 && girlGana === 0) return 6; // Manushya Boy, Deva Girl
  if (boyGana === 0 && girlGana === 2) return 1; // Deva Boy, Rakshasa Girl
  if (boyGana === 2 && girlGana === 0) return 0; // Rakshasa Boy, Deva Girl
  if (boyGana === 1 && girlGana === 2) return 0.5;
  if (boyGana === 2 && girlGana === 1) return 0;
  return 3;
}

// 8. Nadi Mapping (Adi=0, Madhya=1, Antya=2)
const NADI_MAP: number[] = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, // 1-9
  0, 1, 2, 2, 1, 0, 0, 1, 2, // 10-18
  0, 1, 2, 2, 1, 0, 0, 1, 2, // 19-27
];

export function computeGunaMilan(
  boy: { name?: string; nakshatraNum: number; pada?: number; rasiIndex: number; isManglik?: boolean },
  girl: { name?: string; nakshatraNum: number; pada?: number; rasiIndex: number; isManglik?: boolean }
): GunaMilanResult {
  const boyName = boy.name || "वर (Groom)";
  const girlName = girl.name || "कन्या (Bride)";
  const boyNakNum = Math.max(1, Math.min(27, boy.nakshatraNum));
  const girlNakNum = Math.max(1, Math.min(27, girl.nakshatraNum));
  const boyPada = boy.pada || 1;
  const girlPada = girl.pada || 1;
  const boyRasi = boy.rasiIndex % 12;
  const girlRasi = girl.rasiIndex % 12;

  const boyNakMeta = NAKSHATRAS_LIST[boyNakNum - 1];
  const girlNakMeta = NAKSHATRAS_LIST[girlNakNum - 1];
  const boyRasiMeta = ZODIAC_SIGNS[boyRasi];
  const girlRasiMeta = ZODIAC_SIGNS[girlRasi];

  // 1. Varna (1 pt)
  const boyVarna = RASI_VARNA_SCORE[boyRasi] || 1;
  const girlVarna = RASI_VARNA_SCORE[girlRasi] || 1;
  let varnaScore = 0;
  if (boyVarna >= girlVarna) varnaScore = 1;

  const varnaKoota: GunaMilanKoota = {
    nameEn: "Varna",
    nameHi: "वर्ण",
    maxScore: 1,
    obtainedScore: varnaScore,
    isDosha: varnaScore === 0,
    isCancelled: false,
    descriptionHi:
      varnaScore === 1
        ? "वर का वर्ण कन्या के वर्ण के अनुकूल है। कार्यशैली व अहंकार में संतुलन रहेगा।"
        : "कन्या का वर्ण उच्च है; आपसी समझ एवं सम्मान आवश्यक है।",
    descriptionEn: "Work temperament and spiritual alignment.",
  };

  // 2. Vashya (2 pts)
  const boyVashya = getVashyaGroup(boyRasi);
  const girlVashya = getVashyaGroup(girlRasi);
  let vashyaScore = 1;
  if (boyVashya === girlVashya) vashyaScore = 2;
  else if (boyRasi === girlRasi) vashyaScore = 2;

  const vashyaKoota: GunaMilanKoota = {
    nameEn: "Vashya",
    nameHi: "वश्य",
    maxScore: 2,
    obtainedScore: vashyaScore,
    isDosha: vashyaScore === 0,
    isCancelled: false,
    descriptionHi:
      vashyaScore === 2
        ? "परस्पर आकर्षण, नियंत्रण व समर्पण का पूर्ण सामंजस्य है।"
        : "सामान्य वश्य मिलान। परस्पर सामंजस्य उत्तम रहेगा।",
    descriptionEn: "Mutual dominance and affection control.",
  };

  // 3. Tara / Dina (3 pts)
  const taraBoyToGirl = ((girlNakNum - boyNakNum + 27) % 9) + 1;
  const taraGirlToBoy = ((boyNakNum - girlNakNum + 27) % 9) + 1;
  const isAuspiciousTara = (t: number) => ![3, 5, 7].includes(t);
  let taraScore = 0;
  if (isAuspiciousTara(taraBoyToGirl)) taraScore += 1.5;
  if (isAuspiciousTara(taraGirlToBoy)) taraScore += 1.5;

  const taraKoota: GunaMilanKoota = {
    nameEn: "Tara",
    nameHi: "तारा (दिन)",
    maxScore: 3,
    obtainedScore: taraScore,
    isDosha: taraScore < 1.5,
    isCancelled: false,
    descriptionHi:
      taraScore >= 3
        ? "तारा मिलान पूर्णतः शुभ है। आरोग्य, दीर्घायु एवं भाग्य में वृद्धि होगी।"
        : taraScore >= 1.5
        ? "मध्यम तारा मिलान। एक पक्ष के लिए अत्यधिक शुभ है।"
        : "तारा दोष उपस्थित। महामृत्युंजय जप श्रेयस्कर रहेगा।",
    descriptionEn: "Health, longevity and destiny alignment.",
  };

  // 4. Yoni (4 pts)
  const boyYoni = NAKSHATRA_YONI_MAP[boyNakNum - 1];
  const girlYoni = NAKSHATRA_YONI_MAP[girlNakNum - 1];
  const yoniScore = getYoniScore(boyYoni, girlYoni);

  const yoniKoota: GunaMilanKoota = {
    nameEn: "Yoni",
    nameHi: "योनि",
    maxScore: 4,
    obtainedScore: yoniScore,
    isDosha: yoniScore === 0,
    isCancelled: false,
    descriptionHi:
      yoniScore >= 3
        ? "शारीरिक व मानसिक अनुकूलता तथा वैवाहिक सुख उत्तम है।"
        : yoniScore >= 1
        ? "सामान्य योनि सामंजस्य।"
        : "परस्पर शत्रु योनि है; वैवाहिक समझ में धैर्य रखें।",
    descriptionEn: "Physical and psychological compatibility.",
  };

  // 5. Graha Maitri (5 pts)
  const boyLord = boyRasiMeta.lord;
  const girlLord = girlRasiMeta.lord;
  const grahaMaitriScore = getGrahaMaitriScore(boyLord, girlLord);

  const grahaMaitriKoota: GunaMilanKoota = {
    nameEn: "Graha Maitri",
    nameHi: "ग्रह मैत्री",
    maxScore: 5,
    obtainedScore: grahaMaitriScore,
    isDosha: grahaMaitriScore <= 1,
    isCancelled: false,
    descriptionHi:
      grahaMaitriScore >= 4
        ? "राशि स्वामियों में मित्रता है। विचारों में मधुरता व सहयोग बना रहेगा।"
        : grahaMaitriScore >= 2.5
        ? "मध्यम राशि मित्रता।"
        : "राशि स्वामियों में वैमनस्यता है। नियमित संवाद आवश्यक है।",
    descriptionEn: "Mental compatibility and friendship of Moon lords.",
  };

  // 6. Gana (6 pts)
  const boyGana = GANA_MAP[boyNakNum - 1];
  const girlGana = GANA_MAP[girlNakNum - 1];
  const ganaScore = getGanaScore(boyGana, girlGana);

  const ganaKoota: GunaMilanKoota = {
    nameEn: "Gana",
    nameHi: "गण",
    maxScore: 6,
    obtainedScore: ganaScore,
    isDosha: ganaScore === 0,
    isCancelled: false,
    descriptionHi:
      ganaScore >= 5
        ? "दोनों के स्वभाव व दृष्टिकोण में उत्तम मेल है।"
        : ganaScore >= 3
        ? "मध्यम गण मिलान।"
        : "गण दोष उपस्थित। स्वभाव में भिन्नता रहेगी।",
    descriptionEn: "Temperament, behavior and attitude.",
  };

  // 7. Bhakoot (7 pts)
  const rasiDiff = ((girlRasi - boyRasi + 12) % 12) + 1;
  let bhakootScore = 7;
  let bhakootDosha = false;
  let bhakootCancelled = false;
  let bhakootCancelReason = "";

  // Inauspicious relations: 2-12 (Dwirdwadasha), 6-8 (Shadashtaka), 9-5 (Navapanchama)
  if ([2, 12, 6, 8, 5, 9].includes(rasiDiff)) {
    bhakootDosha = true;
    // Cancellation rules: Same Lord or Friends
    if (boyLord === girlLord || PLANETARY_FRIENDSHIP[boyLord]?.[girlLord] === "friend") {
      bhakootCancelled = true;
      bhakootScore = 7;
      bhakootCancelReason = "राशि स्वामी एक ही अथवा परस्पर मित्र होने के कारण भकूट दोष निष्प्रभावी (निरस्त) है।";
    } else {
      bhakootScore = 0;
    }
  }

  const bhakootKoota: GunaMilanKoota = {
    nameEn: "Bhakoot",
    nameHi: "भकूट",
    maxScore: 7,
    obtainedScore: bhakootScore,
    isDosha: bhakootDosha && !bhakootCancelled,
    isCancelled: bhakootCancelled,
    cancellationReasonHi: bhakootCancelReason,
    descriptionHi:
      bhakootScore === 7
        ? bhakootCancelled
          ? `भकूट दोष परिहार: ${bhakootCancelReason}`
          : "भकूट स्थिति अत्यंत शुभ है। वंश वृद्धि, समृद्धि एवं प्रेम का संचार होगा।"
        : "भकूट दोष (२-१२/६-८) उपस्थित। आर्थिक व स्वास्थ्य संबंधी विषयों में सावधानी रखें।",
    descriptionEn: "Financial prosperity, family happiness and longevity.",
  };

  // 8. Nadi (8 pts)
  const boyNadi = NADI_MAP[boyNakNum - 1];
  const girlNadi = NADI_MAP[girlNakNum - 1];
  let nadiScore = 8;
  let nadiDosha = false;
  let nadiCancelled = false;
  let nadiCancelReason = "";

  if (boyNadi === girlNadi) {
    nadiDosha = true;
    // Cancellation rules:
    // 1. Same Nakshatra but different Charanas/Padas
    // 2. Different Nakshatras in same Rasi
    // 3. Same Nakshatra in different Rasis (e.g. Krittika in Mesha & Vrishabha)
    if (boyNakNum === girlNakNum && boyPada !== girlPada) {
      nadiCancelled = true;
      nadiScore = 8;
      nadiCancelReason = "एक ही नक्षत्र में भिन्न चरण (पाद) होने से नाड़ी दोष निरस्त हो गया है।";
    } else if (boyRasi === girlRasi && boyNakNum !== girlNakNum) {
      nadiCancelled = true;
      nadiScore = 8;
      nadiCancelReason = "एक ही राशि में भिन्न नक्षत्र होने से नाड़ी दोष निरस्त हो गया है।";
    } else {
      nadiScore = 0;
    }
  }

  const nadiKoota: GunaMilanKoota = {
    nameEn: "Nadi",
    nameHi: "नाड़ी",
    maxScore: 8,
    obtainedScore: nadiScore,
    isDosha: nadiDosha && !nadiCancelled,
    isCancelled: nadiCancelled,
    cancellationReasonHi: nadiCancelReason,
    descriptionHi:
      nadiScore === 8
        ? nadiCancelled
          ? `नाड़ी दोष परिहार: ${nadiCancelReason}`
          : "नाड़ी मिलान निर्दोष है। संतान सुख, शारीरिक स्वास्थ्य एवं ओज उत्तम रहेगा।"
        : "नाड़ी दोष उपस्थित (समान नाड़ी)। महामृत्युंजय जप व स्वर्ण दान अनुशंसित है।",
    descriptionEn: "Physiological, genetic and progeny compatibility.",
  };

  const totalObtainedScore =
    varnaKoota.obtainedScore +
    vashyaKoota.obtainedScore +
    taraKoota.obtainedScore +
    yoniKoota.obtainedScore +
    grahaMaitriKoota.obtainedScore +
    ganaKoota.obtainedScore +
    bhakootKoota.obtainedScore +
    nadiKoota.obtainedScore;

  const percentage = Math.round((totalObtainedScore / 36) * 100);

  let verdict: "excellent" | "good" | "average" | "not_recommended" = "average";
  let verdictLabelHi = "मध्यम मिलान (विचारणीय)";

  if (totalObtainedScore >= 28) {
    verdict = "excellent";
    verdictLabelHi = "उत्कृष्ट एवं अति शुभ मिलान (सर्वोत्तम)";
  } else if (totalObtainedScore >= 21) {
    verdict = "good";
    verdictLabelHi = "उत्तम मिलान (विवाह योग्य)";
  } else if (totalObtainedScore >= 18) {
    verdict = "average";
    verdictLabelHi = "मध्यम मिलान (दोष परिहार उपरांत विवाह संभव)";
  } else {
    verdict = "not_recommended";
    verdictLabelHi = "अस्वीकार्य / अल्प गुण (विद्वान ज्योतिषी से परामर्श आवश्यक)";
  }

  // Manglik Match Check
  const boyManglik = !!boy.isManglik;
  const girlManglik = !!girl.isManglik;
  let manglikCompatible = true;
  let manglikDescHi = "दोनों में मांगलिक सामंजस्य अनुकूल है।";

  if (boyManglik && !girlManglik) {
    manglikCompatible = false;
    manglikDescHi = "वर मांगलिक है जबकि कन्या मांगलिक नहीं है; मांगलिक दोष निवारण कुंभ विवाह या मंगल शांति आवश्यक है।";
  } else if (!boyManglik && girlManglik) {
    manglikCompatible = false;
    manglikDescHi = "कन्या मांगलिक है जबकि वर मांगलिक नहीं है; मंगल शांति विधान आवश्यक है।";
  } else if (boyManglik && girlManglik) {
    manglikCompatible = true;
    manglikDescHi = "दोनों मांगलिक होने से मांगलिक दोष स्वतः निरस्त हो जाता है।";
  } else {
    manglikCompatible = true;
    manglikDescHi = "दोनों ही मांगलिक दोष से मुक्त हैं।";
  }

  let remedyAdviceHi = "दाम्पत्य जीवन में सुख-शांति हेतु गौरी-शंकर रुद्राक्ष धारण करना व शिव-पार्वती की आराधना करना शुभकारी है।";
  if (nadiDosha && !nadiCancelled) {
    remedyAdviceHi = "नाड़ी दोष शांति हेतु महामृत्युंजय मंत्र का सवा लाख जप अथवा विधिपूर्वक स्वर्ण-दान व रुद्राभिषेक कराएं।";
  } else if (bhakootDosha && !bhakootCancelled) {
    remedyAdviceHi = "भकूट दोष शांति हेतु विष्णु सहस्रनाम का पाठ व गुरुवार को चने की दाल-गुड़ का दान करें।";
  }

  return {
    boyProfile: {
      name: boyName,
      nakshatraNum: boyNakNum,
      nakshatraNameHi: boyNakMeta.hi,
      pada: boyPada,
      rasiIndex: boyRasi,
      rasiNameHi: boyRasiMeta.hi,
      rasiLord: boyLord,
      isManglik: boyManglik,
    },
    girlProfile: {
      name: girlName,
      nakshatraNum: girlNakNum,
      nakshatraNameHi: girlNakMeta.hi,
      pada: girlPada,
      rasiIndex: girlRasi,
      rasiNameHi: girlRasiMeta.hi,
      rasiLord: girlLord,
      isManglik: girlManglik,
    },
    kootas: {
      varna: varnaKoota,
      vashya: vashyaKoota,
      tara: taraKoota,
      yoni: yoniKoota,
      grahaMaitri: grahaMaitriKoota,
      gana: ganaKoota,
      bhakoot: bhakootKoota,
      nadi: nadiKoota,
    },
    totalObtainedScore,
    maxPossibleScore: 36,
    percentage,
    verdict,
    verdictLabelHi,
    manglikMatch: {
      isCompatible: manglikCompatible,
      descriptionHi: manglikDescHi,
    },
    remedyAdviceHi,
  };
}
