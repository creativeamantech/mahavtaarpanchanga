import { AstrologyRule } from "./RuleTypes";

export const CANONICAL_ASTROLOGY_RULES: AstrologyRule[] = [
  // ==========================================
  // A. PANCHA MAHAPURUSHA YOGAS (BPHS 75.1–25)
  // ==========================================
  {
    id: "ruchaka_mahapurusha",
    nameEn: "Ruchaka Mahapurusha Yoga",
    nameHi: "रुचक महापुरुष योग",
    nameSa: "रुचक-महापुरुष-योगः",
    category: ["Mahapurusha", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 75, Shlokas 1–5",
    descriptionEn:
      "Mars is placed in a Kendra house (1, 4, 7, 10) while occupying its own sign (Aries, Scorpio) or exaltation sign (Capricorn). Bestows courage, leadership, martial command, and valor.",
    descriptionHi:
      "मंगल केंद्र भाव (१, ४, ७, १०) में अपनी स्वराशि (मेष, वृश्चिक) अथवा उच्च राशि (मकर) में स्थित हो। यह योग अदम्य पराक्रम, नेतृत्व क्षमता, एवं विजयश्री प्रदान करता है।",
    primaryCondition: {
      id: "cond_ruchaka_primary",
      type: "CompoundCondition",
      operator: "AND",
      description: "Mars in Kendra AND in Aries, Scorpio, or Capricorn",
      conditions: [
        {
          id: "mars_in_kendra",
          type: "PlanetInHouse",
          planet: "Mars",
          houses: [1, 4, 7, 10],
          description: "Mars in Kendra (1, 4, 7, 10)",
        },
        {
          id: "mars_own_or_exalted_sign",
          type: "PlanetInSign",
          planet: "Mars",
          signs: [0, 7, 9], // Aries, Scorpio, Capricorn
          description: "Mars in Aries, Scorpio, or Capricorn",
        },
      ],
    },
    cancellationRules: [
      {
        id: "canc_ruchaka_combustion",
        descriptionEn: "Mars is deeply combust within 3° of the Sun",
        descriptionHi: "मंगल सूर्य के अत्यंत निकट ३° में अस्त है",
        cancellationType: "mitigation",
        condition: {
          id: "mars_combust_tight",
          type: "PlanetConjunction",
          planets: ["Mars", "Sun"],
          maxOrbDeg: 3.0,
          description: "Mars conjoined Sun within 3°",
        },
      },
    ],
    requiredInputs: ["planets.Mars.houseD1", "planets.Mars.signIndex"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "bhadra_mahapurusha",
    nameEn: "Bhadra Mahapurusha Yoga",
    nameHi: "भद्र महापुरुष योग",
    nameSa: "भद्र-महापुरुष-योगः",
    category: ["Mahapurusha", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 75, Shlokas 21–25",
    descriptionEn:
      "Mercury occupies a Kendra house (1, 4, 7, 10) in Gemini or Virgo (own or exaltation sign). Grants formidable intellect, mathematical aptitude, eloquence, and scholastic distinction.",
    descriptionHi:
      "बुध केंद्र भाव (१, ४, ७, १०) में अपनी स्वराशि मिथुन अथवा उच्च राशि कन्या में स्थित हो। यह प्रखर मेधा, वाक्चातुर्य, विद्वता एवं व्यापारिक कुशलता प्रदान करता है।",
    primaryCondition: {
      id: "cond_bhadra_primary",
      type: "CompoundCondition",
      operator: "AND",
      description: "Mercury in Kendra AND in Gemini or Virgo",
      conditions: [
        {
          id: "mercury_in_kendra",
          type: "PlanetInHouse",
          planet: "Mercury",
          houses: [1, 4, 7, 10],
          description: "Mercury in Kendra (1, 4, 7, 10)",
        },
        {
          id: "mercury_gemini_virgo",
          type: "PlanetInSign",
          planet: "Mercury",
          signs: [2, 5], // Gemini, Virgo
          description: "Mercury in Gemini or Virgo",
        },
      ],
    },
    cancellationRules: [
      {
        id: "canc_bhadra_combustion",
        descriptionEn: "Mercury is deeply combust within 2° of the Sun",
        descriptionHi: "बुध सूर्य के अत्यंत समीप २° में अस्त है",
        cancellationType: "mitigation",
        condition: {
          id: "mercury_combust_tight",
          type: "PlanetConjunction",
          planets: ["Mercury", "Sun"],
          maxOrbDeg: 2.0,
          description: "Mercury conjoined Sun within 2°",
        },
      },
    ],
    requiredInputs: ["planets.Mercury.houseD1", "planets.Mercury.signIndex"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "hamsa_mahapurusha",
    nameEn: "Hamsa Mahapurusha Yoga",
    nameHi: "हंस महापुरुष योग",
    nameSa: "हंस-महापुरुष-योगः",
    category: ["Mahapurusha", "Raja", "Spiritual"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 75, Shlokas 6–10",
    descriptionEn:
      "Jupiter occupies a Kendra house (1, 4, 7, 10) in Sagittarius, Pisces, or Cancer (own or exaltation sign). Confers spiritual nobility, wisdom, societal reverence, and righteous conduct.",
    descriptionHi:
      "बृहस्पति केंद्र भाव (१, ४, ७, १०) में धनु, मीन अथवा उच्च राशि कर्क में स्थित हो। यह धर्मपरायणता, सात्विक बुद्धि, समाज में पूजनीय प्रतिष्ठा एवं दीर्घायु प्रदान करता है।",
    primaryCondition: {
      id: "cond_hamsa_primary",
      type: "CompoundCondition",
      operator: "AND",
      description: "Jupiter in Kendra AND in Sagittarius, Pisces, or Cancer",
      conditions: [
        {
          id: "jupiter_in_kendra",
          type: "PlanetInHouse",
          planet: "Jupiter",
          houses: [1, 4, 7, 10],
          description: "Jupiter in Kendra",
        },
        {
          id: "jupiter_sag_pis_can",
          type: "PlanetInSign",
          planet: "Jupiter",
          signs: [3, 8, 11], // Cancer, Sagittarius, Pisces
          description: "Jupiter in Cancer, Sagittarius, or Pisces",
        },
      ],
    },
    requiredInputs: ["planets.Jupiter.houseD1", "planets.Jupiter.signIndex"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "malavya_mahapurusha",
    nameEn: "Malavya Mahapurusha Yoga",
    nameHi: "मालव्य महापुरुष योग",
    nameSa: "मालव्य-महापुरुष-योगः",
    category: ["Mahapurusha", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 75, Shlokas 11–15",
    descriptionEn:
      "Venus occupies a Kendra house (1, 4, 7, 10) in Taurus, Libra, or Pisces (own or exaltation sign). Endows aesthetic mastery, material luxury, charm, and blissful conjugal harmony.",
    descriptionHi:
      "शुक्र केंद्र भाव (१, ४, ७, १०) में वृषभ, तुला अथवा उच्च राशि मीन में स्थित हो। यह वैभव, कलात्मक प्रतिभा, सुख-समृद्धि एवं वैवाहिक सुख प्रदान करता है।",
    primaryCondition: {
      id: "cond_malavya_primary",
      type: "CompoundCondition",
      operator: "AND",
      description: "Venus in Kendra AND in Taurus, Libra, or Pisces",
      conditions: [
        {
          id: "venus_in_kendra",
          type: "PlanetInHouse",
          planet: "Venus",
          houses: [1, 4, 7, 10],
          description: "Venus in Kendra",
        },
        {
          id: "venus_tau_lib_pis",
          type: "PlanetInSign",
          planet: "Venus",
          signs: [1, 6, 11], // Taurus, Libra, Pisces
          description: "Venus in Taurus, Libra, or Pisces",
        },
      ],
    },
    requiredInputs: ["planets.Venus.houseD1", "planets.Venus.signIndex"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "shasha_mahapurusha",
    nameEn: "Shasha Mahapurusha Yoga",
    nameHi: "शश महापुरुष योग",
    nameSa: "शश-महापुरुष-योगः",
    category: ["Mahapurusha", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 75, Shlokas 16–20",
    descriptionEn:
      "Saturn occupies a Kendra house (1, 4, 7, 10) in Capricorn, Aquarius, or Libra (own or exaltation sign). Bestows enduring organizational authority, mass influence, resilience, and command.",
    descriptionHi:
      "शनि केंद्र भाव (१, ४, ७, १०) में मकर, कुम्भ अथवा उच्च राशि तुला में स्थित हो। यह जनसमर्थन, संगठन क्षमता, अनुशासन एवं दीर्घकालीन प्रभुत्व प्रदान करता है।",
    primaryCondition: {
      id: "cond_shasha_primary",
      type: "CompoundCondition",
      operator: "AND",
      description: "Saturn in Kendra AND in Capricorn, Aquarius, or Libra",
      conditions: [
        {
          id: "saturn_in_kendra",
          type: "PlanetInHouse",
          planet: "Saturn",
          houses: [1, 4, 7, 10],
          description: "Saturn in Kendra",
        },
        {
          id: "saturn_cap_aqu_lib",
          type: "PlanetInSign",
          planet: "Saturn",
          signs: [6, 9, 10], // Libra, Capricorn, Aquarius
          description: "Saturn in Libra, Capricorn, or Aquarius",
        },
      ],
    },
    requiredInputs: ["planets.Saturn.houseD1", "planets.Saturn.signIndex"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },

  // ==========================================
  // B. MAJOR SOLAR / LUNAR YOGAS
  // ==========================================
  {
    id: "gajakesari_yoga",
    nameEn: "Gajakesari Yoga",
    nameHi: "गजकेसरी योग",
    nameSa: "गजकेसरी-योगः",
    category: ["Chandra", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra & Phaladeepika",
    sourceReference: "BPHS Adhyaya 36, Shlokas 3–4; Phaladeepika Adhyaya 6, Shloka 14",
    descriptionEn:
      "Jupiter is placed in a quadrant (Kendra: 1, 4, 7, 10) from the Moon. Bestows eminent reputation, virtue, moral victory, and enduring prosperity.",
    descriptionHi:
      "गुरु चन्द्रमा से केंद्र (१, ४, ७, १०वें भाव) में स्थित हो। यह योग समाज में अक्षुण्ण यश, उच्च पद, साधुता एवं निर्भयता प्रदान करता है।",
    primaryCondition: {
      id: "cond_gajakesari_kendra_from_moon",
      type: "PlanetInHouse",
      planet: "Jupiter",
      referenceFrame: "Moon",
      houses: [1, 4, 7, 10],
      description: "Jupiter in Kendra (1, 4, 7, 10) from Moon",
    },
    cancellationRules: [
      {
        id: "canc_gajakesari_debility",
        descriptionEn: "Jupiter or Moon is in debilitation",
        descriptionHi: "बृहस्पति अथवा चन्द्रमा नीच राशि में स्थित है",
        cancellationType: "mitigation",
        condition: {
          id: "jup_or_moon_debilitated",
          type: "CompoundCondition",
          operator: "OR",
          description: "Jupiter or Moon debilitated",
          conditions: [
            {
              id: "jup_debilitated",
              type: "DignityCondition",
              planet: "Jupiter",
              dignities: ["debilitated"],
              description: "Jupiter debilitated in Capricorn",
            },
            {
              id: "moon_debilitated",
              type: "DignityCondition",
              planet: "Moon",
              dignities: ["debilitated"],
              description: "Moon debilitated in Scorpio",
            },
          ],
        },
      },
    ],
    requiredInputs: ["planets.Jupiter.houseChandra"],
    priority: 8,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "budhaditya_yoga",
    nameEn: "Budhaditya Yoga",
    nameHi: "बुधादित्य योग",
    nameSa: "बुधादित्य-योगः",
    category: ["Surya"],
    tradition: "Parashari",
    source: "Saravali",
    sourceReference: "Saravali Adhyaya 31, Shloka 1",
    descriptionEn:
      "Sun and Mercury occupy the same sign/house, forming Nipuna/Budhaditya Yoga. Endows sharp intellect, administrative competence, and eloquence.",
    descriptionHi:
      "सूर्य और बुध एक साथ एक ही राशि या भाव में स्थित हों। यह तीक्ष्ण बुद्धि, प्रशासनिक कौशल, वाक्पटुता एवं प्रतिष्ठा प्रदान करता है।",
    primaryCondition: {
      id: "cond_budhaditya_conjunction",
      type: "PlanetConjunction",
      planets: ["Sun", "Mercury"],
      sameHouse: true,
      description: "Sun and Mercury in the same house",
    },
    cancellationRules: [
      {
        id: "canc_budhaditya_combust",
        descriptionEn: "Mercury is within deep combustion (under 3°)",
        descriptionHi: "बुध सूर्य के ३° के भीतर अत्यंत अस्त है",
        cancellationType: "mitigation",
        condition: {
          id: "merc_deep_combust",
          type: "PlanetConjunction",
          planets: ["Sun", "Mercury"],
          maxOrbDeg: 3.0,
          description: "Sun and Mercury within 3°",
        },
      },
    ],
    requiredInputs: ["planets.Sun.houseD1", "planets.Mercury.houseD1"],
    priority: 7,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "chandra_mangala_yoga",
    nameEn: "Chandra-Mangala Yoga",
    nameHi: "चन्द्र-मंगल योग",
    nameSa: "चन्द्र-मङ्गल-योगः",
    category: ["Chandra", "Dhana"],
    tradition: "Parashari",
    source: "Saravali & Brihat Jataka",
    sourceReference: "Saravali Adhyaya 15, Shloka 20",
    descriptionEn:
      "Moon and Mars are in conjunction or mutual aspect, fostering financial acumen, energetic enterprise, and quick wealth acquisition.",
    descriptionHi:
      "चन्द्रमा और मंगल एक साथ स्थित हों अथवा परस्पर पूर्ण दृष्टि रखते हों। यह योग धनार्जन, व्यापारिक दक्षता एवं त्वरित निर्णय क्षमता को जागृत करता है।",
    primaryCondition: {
      id: "cond_chandra_mangala",
      type: "CompoundCondition",
      operator: "OR",
      description: "Moon-Mars conjunction or mutual aspect",
      conditions: [
        {
          id: "moon_mars_conjoined",
          type: "PlanetConjunction",
          planets: ["Moon", "Mars"],
          sameHouse: true,
          description: "Moon and Mars in same house",
        },
        {
          id: "moon_mars_mutual_aspect",
          type: "MutualAspect",
          planetA: "Moon",
          planetB: "Mars",
          description: "Moon and Mars mutually aspecting",
        },
      ],
    },
    requiredInputs: ["planets.Moon.houseD1", "planets.Mars.houseD1"],
    priority: 7,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },

  // ==========================================
  // C. RAJA YOGA FOUNDATIONS
  // ==========================================
  {
    id: "kendra_trikona_raja_yoga",
    nameEn: "Kendra-Trikona Lord Raja Yoga",
    nameHi: "केन्द्र-त्रिकोण राजयोग",
    nameSa: "केन्द्र-त्रिकोण-अधिपति-राजयोगः",
    category: ["Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 34, Shlokas 1–16",
    descriptionEn:
      "The lord of a Kendra (1, 4, 7, 10) and the lord of a Trikona (1, 5, 9) form an associative relationship by conjunction, granting high social status, power, and renown.",
    descriptionHi:
      "केंद्र भाव (१, ४, ७, १०) के स्वामी तथा त्रिकोण भाव (१, ५, ९) के स्वामी की परस्पर युति हो। यह व्यक्ति को उच्च सामाजिक स्तर, अधिकार एवं ख्याति प्रदान करता है।",
    primaryCondition: {
      id: "cond_kendra_trikona_conjunction",
      type: "KendraTrikonaRelationship",
      houseTypeA: "Kendra",
      houseTypeB: "Trikona",
      relationship: "conjunction",
      description: "Conjunction between Kendra lord and Trikona lord",
    },
    requiredInputs: ["houses.lord", "planets.houseD1"],
    priority: 9,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "dharma_karmadhipati_yoga",
    nameEn: "Dharma-Karmadhipati Raja Yoga",
    nameHi: "धर्म-कर्माधिपति राजयोग",
    nameSa: "धर्म-कर्माधिपति-योगः",
    category: ["Raja", "DharmaKarma"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 34, Shlokas 17–20",
    descriptionEn:
      "The 9th lord (Dharmadhipati) and 10th lord (Karmadhipati) are conjoined, mutually aspecting, or in mutual sign exchange (Parivartana). Foremost Raja Yoga conferring leadership, civic eminence, and righteous action.",
    descriptionHi:
      "नवमेश (धर्म) और दशमेश (कर्म) की युति, दृष्टि अथवा राशि परिवर्तन हो। यह पराशर मत का सर्वोत्कृष्ट राजयोग है जो जीवन में महान अधिकार, यश एवं धर्मसम्मत कार्यक्षेत्र देता है।",
    primaryCondition: {
      id: "cond_dharma_karma",
      type: "KendraTrikonaRelationship",
      houseTypeA: "Trikona",
      houseTypeB: "Kendra",
      relationship: "dharma_karma",
      description: "9th and 10th lord conjunction, aspect, or parivartana",
    },
    requiredInputs: ["houses.9.lord", "houses.10.lord"],
    priority: 10,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },

  // ==========================================
  // D. DHANA YOGA FOUNDATIONS
  // ==========================================
  {
    id: "dhana_yoga_2_11",
    nameEn: "Dhana Yoga (2nd & 11th Lords)",
    nameHi: "धन योग (द्वितीय व एकादशेश युति)",
    nameSa: "धन-योगः (द्वितीयैकादशाधिप)",
    category: ["Dhana"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 37, Shlokas 1–10",
    descriptionEn:
      "The 2nd lord (accumulated wealth) and 11th lord (gains and profits) are placed together in an auspicious house, ensuring significant wealth accumulation.",
    descriptionHi:
      "द्वितीय भाव के स्वामी (धन) तथा एकादश भाव के स्वामी (लाभ) की शुभ भाव में युति हो। यह प्रचुर धन-संपत्ति एवं नियमित लाभ सुनिश्चित करता है।",
    primaryCondition: {
      id: "cond_dhana_2_11",
      type: "CompoundCondition",
      operator: "AND",
      description: "2nd and 11th lords conjoined in non-dusthana",
      conditions: [
        {
          id: "lord2_in_good_house",
          type: "HouseLordPlacement",
          house: 2,
          placedInHouses: [1, 2, 4, 5, 7, 9, 10, 11],
          description: "2nd lord in non-dusthana house",
        },
        {
          id: "lord11_in_good_house",
          type: "HouseLordPlacement",
          house: 11,
          placedInHouses: [1, 2, 4, 5, 7, 9, 10, 11],
          description: "11th lord in non-dusthana house",
        },
      ],
    },
    requiredInputs: ["houses.2.lord", "houses.11.lord"],
    priority: 8,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "dhana_yoga_5_9",
    nameEn: "Dhana Yoga (5th & 9th Lords)",
    nameHi: "लक्ष्मी धन योग (पंचम व नवमेश सम्बन्ध)",
    nameSa: "लक्ष्मी-धन-योगः",
    category: ["Dhana", "Spiritual"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 37, Shlokas 11–15",
    descriptionEn:
      "The 5th lord (poorvapunya / intellect) and 9th lord (bhagya / divine grace) form a relationship, granting fortune through wisdom and divine blessing.",
    descriptionHi:
      "पंचमेश (पूर्वपुण्य) और नवमेश (भाग्य) की शुभ भाव में स्थिति अथवा परस्पर दृष्टि। यह पूर्वार्जित पुण्य से सहज भाग्यवृद्धि व धन प्रदान करता है।",
    primaryCondition: {
      id: "cond_dhana_5_9",
      type: "CompoundCondition",
      operator: "AND",
      description: "5th and 9th lords placed in Kendra or Trikona",
      conditions: [
        {
          id: "lord5_in_kendra_trikona",
          type: "HouseLordPlacement",
          house: 5,
          placedInHouses: [1, 4, 5, 7, 9, 10],
          description: "5th lord in Kendra or Trikona",
        },
        {
          id: "lord9_in_kendra_trikona",
          type: "HouseLordPlacement",
          house: 9,
          placedInHouses: [1, 4, 5, 7, 9, 10],
          description: "9th lord in Kendra or Trikona",
        },
      ],
    },
    requiredInputs: ["houses.5.lord", "houses.9.lord"],
    priority: 8,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },

  // ==========================================
  // E. VIPARITA RAJA YOGA (Phaladeepika 6.57–66)
  // ==========================================
  {
    id: "harsha_viparita_yoga",
    nameEn: "Harsha Viparita Raja Yoga",
    nameHi: "हर्ष विपरीत राजयोग",
    nameSa: "हर्ष-विपरीत-राजयोगः",
    category: ["Viparita", "Raja"],
    tradition: "Varahamihira",
    source: "Phaladeepika",
    sourceReference: "Phaladeepika Adhyaya 6, Shloka 57",
    descriptionEn:
      "The 6th lord is placed in the 6th, 8th, or 12th house (Trika/Dusthana). Grants triumph over adversaries, immune resilience, financial recovery, and unexpected success through challenges.",
    descriptionHi:
      "षष्ठेश ६, ८ अथवा १२वें भाव (त्रिक भाव) में स्थित हो। यह शत्रुओं पर विजय, रोगों से मुक्ति तथा विषम परिस्थितियों में अप्रत्याशित सफलता देता है।",
    primaryCondition: {
      id: "cond_harsha_placement",
      type: "HouseLordPlacement",
      house: 6,
      placedInHouses: [6, 8, 12],
      description: "6th lord placed in 6th, 8th, or 12th house",
    },
    requiredInputs: ["houses.6.lord"],
    priority: 8,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "sarala_viparita_yoga",
    nameEn: "Sarala Viparita Raja Yoga",
    nameHi: "सरल विपरीत राजयोग",
    nameSa: "सरल-विपरीत-राजयोगः",
    category: ["Viparita", "Raja"],
    tradition: "Varahamihira",
    source: "Phaladeepika",
    sourceReference: "Phaladeepika Adhyaya 6, Shloka 61",
    descriptionEn:
      "The 8th lord is placed in the 6th, 8th, or 12th house. Bestows fearless resolve, long life, secret resourcefulness, and unyielding stamina.",
    descriptionHi:
      "अष्टमेश ६, ८ अथवा १२वें भाव में स्थित हो। यह दीर्घायु, निर्भयता, संकट प्रबंधन क्षमता तथा छिपे साधनों से लाभ दिलाता है।",
    primaryCondition: {
      id: "cond_sarala_placement",
      type: "HouseLordPlacement",
      house: 8,
      placedInHouses: [6, 8, 12],
      description: "8th lord placed in 6th, 8th, or 12th house",
    },
    requiredInputs: ["houses.8.lord"],
    priority: 8,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "vimala_viparita_yoga",
    nameEn: "Vimala Viparita Raja Yoga",
    nameHi: "विमल विपरीत राजयोग",
    nameSa: "विमल-विपरीत-राजयोगः",
    category: ["Viparita", "Raja"],
    tradition: "Varahamihira",
    source: "Phaladeepika",
    sourceReference: "Phaladeepika Adhyaya 6, Shloka 65",
    descriptionEn:
      "The 12th lord is placed in the 6th, 8th, or 12th house. Confers independent nature, prudent expense management, noble character, and peace.",
    descriptionHi:
      "द्वादशेश ६, ८ अथवा १२वें भाव में स्थित हो। यह मितव्ययिता, स्वतंत्र जीवनशैली, आध्यात्मिक झुकाव तथा संकटों से रक्षा प्रदान करता है।",
    primaryCondition: {
      id: "cond_vimala_placement",
      type: "HouseLordPlacement",
      house: 12,
      placedInHouses: [6, 8, 12],
      description: "12th lord placed in 6th, 8th, or 12th house",
    },
    requiredInputs: ["houses.12.lord"],
    priority: 8,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },

  // ==========================================
  // F. NEECHABHANGA CANCELLED DEBILITY (BPHS 40)
  // ==========================================
  {
    id: "neechabhanga_dispositor_kendra",
    nameEn: "Neechabhanga (Dispositor in Kendra)",
    nameHi: "नीचभंग राजयोग (नीच राशि स्वामी केंद्र में)",
    nameSa: "नीचभङ्ग-राजयोगः (नीचेश्वर-केन्द्र)",
    category: ["Neechabhanga", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra & Phaladeepika",
    sourceReference: "BPHS Adhyaya 40, Shlokas 1–5; Phaladeepika Adhyaya 6, Shloka 26",
    descriptionEn:
      "The planetary dispositor of the debilitated planet occupies a Kendra quadrant from Lagna or the Moon, cancelling the debility and establishing Raja Yoga.",
    descriptionHi:
      "नीच ग्रह जिस राशि में बैठा है, उस राशि का स्वामी (नीचेश्वर) लग्न अथवा चन्द्र से केंद्र में स्थित हो। इससे नीचत्व समाप्त होकर राजयोग बनता है।",
    primaryCondition: {
      id: "cond_nb_any_disp_kendra",
      type: "CompoundCondition",
      operator: "OR",
      description: "Any debilitated planet has dispositor in Kendra",
      conditions: [
        {
          id: "nb_sun_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Sun",
          ruleVariant: "dispositor_in_kendra",
          description: "Sun debilitated with Venus in Kendra",
        },
        {
          id: "nb_moon_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Moon",
          ruleVariant: "dispositor_in_kendra",
          description: "Moon debilitated with Mars in Kendra",
        },
        {
          id: "nb_mars_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Mars",
          ruleVariant: "dispositor_in_kendra",
          description: "Mars debilitated with Moon in Kendra",
        },
        {
          id: "nb_merc_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Mercury",
          ruleVariant: "dispositor_in_kendra",
          description: "Mercury debilitated with Jupiter in Kendra",
        },
        {
          id: "nb_jup_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Jupiter",
          ruleVariant: "dispositor_in_kendra",
          description: "Jupiter debilitated with Saturn in Kendra",
        },
        {
          id: "nb_venus_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Venus",
          ruleVariant: "dispositor_in_kendra",
          description: "Venus debilitated with Mercury in Kendra",
        },
        {
          id: "nb_sat_disp_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Saturn",
          ruleVariant: "dispositor_in_kendra",
          description: "Saturn debilitated with Mars in Kendra",
        },
      ],
    },
    requiredInputs: ["planets.dignity", "planets.houseD1", "planets.houseChandra"],
    priority: 9,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "neechabhanga_exalt_lord_kendra",
    nameEn: "Neechabhanga (Exaltation Lord in Kendra)",
    nameHi: "नीचभंग राजयोग (उच्चेश केंद्र में)",
    nameSa: "नीचभङ्ग-राजयोगः (उच्चेश-केन्द्र)",
    category: ["Neechabhanga", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 40, Shlokas 6–10",
    descriptionEn:
      "The lord of the exaltation sign of the debilitated planet occupies a Kendra quadrant from Lagna or the Moon, cancelling the debility.",
    descriptionHi:
      "नीच ग्रह जिस राशि में उच्च का होता है, उस उच्च राशि का स्वामी लग्न या चन्द्रमा से केंद्र में हो। यह नीचता को भंग कर राजयोग फल देता है।",
    primaryCondition: {
      id: "cond_nb_any_exalt_kendra",
      type: "CompoundCondition",
      operator: "OR",
      description: "Any debilitated planet has exaltation lord in Kendra",
      conditions: [
        {
          id: "nb_sun_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Sun",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Sun debilitated with Mars in Kendra",
        },
        {
          id: "nb_moon_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Moon",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Moon debilitated with Venus in Kendra",
        },
        {
          id: "nb_mars_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Mars",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Mars debilitated with Saturn in Kendra",
        },
        {
          id: "nb_merc_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Mercury",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Mercury debilitated with Mercury in Kendra",
        },
        {
          id: "nb_jup_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Jupiter",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Jupiter debilitated with Moon in Kendra",
        },
        {
          id: "nb_venus_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Venus",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Venus debilitated with Jupiter in Kendra",
        },
        {
          id: "nb_sat_exalt_kendra",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Saturn",
          ruleVariant: "exaltation_lord_in_kendra",
          description: "Saturn debilitated with Venus in Kendra",
        },
      ],
    },
    requiredInputs: ["planets.dignity", "planets.houseD1", "planets.houseChandra"],
    priority: 9,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
  {
    id: "neechabhanga_conjoined_exalted",
    nameEn: "Neechabhanga (Conjoined with Exalted Planet)",
    nameHi: "नीचभंग राजयोग (उच्च ग्रह युति)",
    nameSa: "नीचभङ्ग-राजयोगः (उच्चग्रह-युति)",
    category: ["Neechabhanga", "Raja"],
    tradition: "Parashari",
    source: "Brihat Parashara Hora Shastra",
    sourceReference: "BPHS Adhyaya 40, Shloka 11",
    descriptionEn:
      "A debilitated planet is conjoined in the same house with a planet that attains exaltation in that sign (e.g. debilitated Venus with exalted Mercury in Virgo).",
    descriptionHi:
      "नीच ग्रह उसी राशि में स्थित हो जहाँ कोई दूसरा ग्रह उच्च का होकर उसके साथ युति कर रहा हो (जैसे कन्या में नीच शुक्र के साथ उच्च बुध)।",
    primaryCondition: {
      id: "cond_nb_conjoined_exalted",
      type: "CompoundCondition",
      operator: "OR",
      description: "Any debilitated planet conjoined with an exalted planet",
      conditions: [
        {
          id: "nb_sun_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Sun",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Sun conjoined with exalted planet",
        },
        {
          id: "nb_moon_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Moon",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Moon conjoined with exalted planet",
        },
        {
          id: "nb_mars_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Mars",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Mars conjoined with exalted planet",
        },
        {
          id: "nb_merc_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Mercury",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Mercury conjoined with exalted planet",
        },
        {
          id: "nb_jup_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Jupiter",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Jupiter conjoined with exalted planet",
        },
        {
          id: "nb_venus_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Venus",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Venus conjoined with exalted planet",
        },
        {
          id: "nb_sat_conj_exalt",
          type: "NeechabhangaCondition",
          debilitatedPlanet: "Saturn",
          ruleVariant: "exalted_planet_conjoined",
          description: "Debilitated Saturn conjoined with exalted planet",
        },
      ],
    },
    requiredInputs: ["planets.dignity", "planets.houseD1"],
    priority: 9,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },

  // ==========================================
  // G. INAUSPICIOUS & DOSHA COMBINATIONS
  // ==========================================
  {
    id: "guru_chandal_yoga",
    nameEn: "Guru-Chandal Yoga",
    nameHi: "गुरु-चांडाल योग",
    nameSa: "गुरु-चाण्डाल-योगः",
    category: ["Dosha", "Arishta"],
    tradition: "Parashari",
    source: "Jataka Parijata & Classical Compendiums",
    sourceReference: "Jataka Parijata Adhyaya 6",
    descriptionEn:
      "Jupiter and Rahu are placed in the same sign/house. Advises discernment in spiritual choices, honoring teachers, and rectifying unorthodoxy.",
    descriptionHi:
      "बृहस्पति और राहु एक ही राशि या भाव में युत हों। यह गुरुजनों के प्रति निष्ठा, वैचारिक सतर्कता एवं सात्विक आचरण की आवश्यकता दर्शाता है।",
    primaryCondition: {
      id: "cond_guru_chandal_conjunction",
      type: "PlanetConjunction",
      planets: ["Jupiter", "Rahu"],
      sameHouse: true,
      description: "Jupiter and Rahu in the same house",
    },
    cancellationRules: [
      {
        id: "canc_guru_chandal_dignity",
        descriptionEn: "Jupiter is exalted in Cancer or in own sign Sagittarius/Pisces",
        descriptionHi: "बृहस्पति अपनी स्वराशि अथवा उच्च राशि कर्क में स्थित है",
        cancellationType: "mitigation",
        condition: {
          id: "jup_strong_in_chandal",
          type: "DignityCondition",
          planet: "Jupiter",
          dignities: ["exalted", "own"],
          description: "Jupiter in exalted or own dignity",
        },
      },
    ],
    requiredInputs: ["planets.Jupiter.houseD1", "planets.Rahu.houseD1"],
    priority: 5,
    version: "1.0.0",
    validationStatus: "VERIFIED",
  },
];
