// ================================================================================
// VEDIC ASTROLOGY COMPUTATIONAL ENGINE (Jyotisha)
// Modules: Nakshatra, Navtara, Tara Dasa, Gandanta, Vedha, Parihara
// ================================================================================

export interface PlanetDetails {
  name: string;
  dasa_years: number;
  remedy_food: string;
  remedy_donation: string;
}

export const PLANETS: Record<string, PlanetDetails> = {
  Sun: { name: "Sun", dasa_years: 6, remedy_food: "Rice cooked with jaggery", remedy_donation: "Cow with calf" },
  Moon: { name: "Moon", dasa_years: 10, remedy_food: "Rice cooked in milk", remedy_donation: "Conch or white cow" },
  Mars: { name: "Mars", dasa_years: 7, remedy_food: "Havishya", remedy_donation: "Bullock or bull" },
  Rahu: { name: "Rahu", dasa_years: 18, remedy_food: "Rice cooked with mustard", remedy_donation: "Iron weapons or goat" },
  Jupiter: { name: "Jupiter", dasa_years: 16, remedy_food: "Curd and rice", remedy_donation: "Yellow clothes or gold" },
  Saturn: { name: "Saturn", dasa_years: 19, remedy_food: "Rice cooked with sesame seeds", remedy_donation: "Black cow or she-buffalo" },
  Mercury: { name: "Mercury", dasa_years: 17, remedy_food: "Paddy cooked in milk", remedy_donation: "Gold or silver idol" },
  Ketu: { name: "Ketu", dasa_years: 7, remedy_food: "Rice cooked with cereals", remedy_donation: "Goat" },
  Venus: { name: "Venus", dasa_years: 20, remedy_food: "Rice with ghee", remedy_donation: "Horse, white cow, or silver" }
};

export const VIMSHOTTARI_SEQUENCE = ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"];

export interface NakshatraDetails {
  index: number;
  name: string;
  lord: string;
  deity: string;
}

export const NAKSHATRA_DATA: NakshatraDetails[] = [
  { index: 1, name: "Aswini", lord: "Ketu", deity: "Aswini Kumara" },
  { index: 2, name: "Bharani", lord: "Venus", deity: "Yama" },
  { index: 3, name: "Krittika", lord: "Sun", deity: "Agni" },
  { index: 4, name: "Rohini", lord: "Moon", deity: "Brahma" },
  { index: 5, name: "Mrigasira", lord: "Mars", deity: "Moon (Chandra)" },
  { index: 6, name: "Arudra", lord: "Rahu", deity: "Siva (Isa)" },
  { index: 7, name: "Punarvasu", lord: "Jupiter", deity: "Aditi" },
  { index: 8, name: "Pushyami", lord: "Saturn", deity: "Jupiter (Brihaspati)" },
  { index: 9, name: "Aslesha", lord: "Mercury", deity: "Rahu / Sarpa" },
  { index: 10, name: "Makha", lord: "Ketu", deity: "Sun (Pitris)" },
  { index: 11, name: "Poorvaphalguni", lord: "Venus", deity: "Aryama" },
  { index: 12, name: "Uttaraphalguni", lord: "Sun", deity: "Sun (Bhaga)" },
  { index: 13, name: "Hasta", lord: "Moon", deity: "Viswa Karma" },
  { index: 14, name: "Chitta", lord: "Mars", deity: "Vayu (Tvashta)" },
  { index: 15, name: "Swati", lord: "Rahu", deity: "Indra (Vayu)" },
  { index: 16, name: "Visakha", lord: "Jupiter", deity: "Mitra (Indragni)" },
  { index: 17, name: "Anuradha", lord: "Saturn", deity: "Indra (Mitra)" },
  { index: 18, name: "Jyeshtha", lord: "Mercury", deity: "Niruti (Indra)" },
  { index: 19, name: "Moola", lord: "Ketu", deity: "Varuna (Nirriti)" },
  { index: 20, name: "Poorvashada", lord: "Venus", deity: "Viswadeva (Apah)" },
  { index: 21, name: "Uttarashada", lord: "Sun", deity: "Brahma (Viswadevas)" },
  { index: 22, name: "Sravana", lord: "Moon", deity: "Vishnu" },
  { index: 23, name: "Dhanishta", lord: "Mars", deity: "Vasu" },
  { index: 24, name: "Satabhisha", lord: "Rahu", deity: "Varuna" },
  { index: 25, name: "Poorvabhadra", lord: "Jupiter", deity: "Ajacharana (Aja Ekapada)" },
  { index: 26, name: "Uttarabhadra", lord: "Saturn", deity: "Ahirbudhanya" },
  { index: 27, name: "Revati", lord: "Mercury", deity: "Poosha" }
];

export const TARA_NAMES = [
  "Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhak", "Vadha", "Maitra", "Atimaitra"
];

// Calculate Moon's Nakshatra properties based on longitude (0-360)
export function getMoonNakshatraInfo(moonLongitude: number) {
  // Fix normalize
  moonLongitude = ((moonLongitude % 360) + 360) % 360;
  
  const NAKSHATRA_ARC = 13.33333333; // 13 degrees 20 minutes
  const PADA_ARC = 3.33333333;       // 3 degrees 20 minutes
  
  const exactNakshatra = moonLongitude / NAKSHATRA_ARC;
  const nakshatraIndex = Math.floor(exactNakshatra) + 1;
  const remainderArc = moonLongitude % NAKSHATRA_ARC;
  const pada = Math.floor(remainderArc / PADA_ARC) + 1;
  
  const bhabhogPalas = 3600; // Average 60 ghatikas * 60 palas (simplified for pure math model)
  const passedFraction = remainderArc / NAKSHATRA_ARC;
  const bhayatPalas = Math.round(passedFraction * bhabhogPalas);
  
  // Gandanta Detection
  let isGandanta = false;
  let gandantaType = "";
  
  const ONE_GHATIKA_DEG = 360 / (27 * 60); // Moon travels roughly 1 nakshatra (13.33 deg) in 60 ghatikas. So 1 ghatika = 0.2222 deg
  
  // Abhukta Moola: Last 6 ghatikas (1.33 deg) of Jyeshtha & First 8 (1.77 deg) of Moola
  // Jyeshtha ends at 240 deg.
  if (moonLongitude >= (240 - 1.3333) && moonLongitude <= (240 + 1.7777)) {
    isGandanta = true;
    gandantaType = "Abhukta Moola";
  } else {
    // General Nakshatra Gandanta: 
    // Revati/Aswini (360/0), Ashlesha/Makha (120), Jyeshtha/Moola (240)
    // Last 2 ghatikas (0.444 deg) and First 2 ghatikas (0.444 deg)
    const junctions = [0, 120, 240, 360];
    for (const j of junctions) {
      // wrap around for 0/360
      let diff = Math.abs(moonLongitude - j);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 0.4444) {
        isGandanta = true;
        gandantaType = "Nakshatra Gandanta";
        break;
      }
    }
  }

  const nakshatraData = NAKSHATRA_DATA[nakshatraIndex - 1];

  return {
    moon_longitude: parseFloat(moonLongitude.toFixed(6)),
    nakshatra_name: nakshatraData.name,
    nakshatra_number: nakshatraIndex,
    pada,
    bhayat_palas: bhayatPalas,
    bhabhog_palas: bhabhogPalas,
    is_gandanta: isGandanta,
    gandanta_type: gandantaType || null,
    lord: nakshatraData.lord
  };
}

export function generateComprehensiveVedicAnalysis(
  moonLongitude: number, 
  strongestKendraPlanet?: string,
  transitContext?: { target_nakshatra_num: number; planet: string; ashtakavarga_rekhas: number }
) {
  const natalInfo = getMoonNakshatraInfo(moonLongitude);
  
  // 1. Navtara Mapping Table
  const navtaraMapping = [];
  for (let i = 1; i <= 27; i++) {
    const distance = ((i - natalInfo.nakshatra_number) + 27) % 27 + 1;
    let taraNum = distance % 9;
    if (taraNum === 0) taraNum = 9;
    
    let paryaya = 1;
    if (distance >= 10 && distance <= 18) paryaya = 2;
    if (distance >= 19 && distance <= 27) paryaya = 3;
    
    let multiplier = 1.0;
    if (paryaya === 2) multiplier = 0.5;
    if (paryaya === 3) multiplier = taraNum === 7 ? 0.75 : 0.25;
    
    navtaraMapping.push({
      nakshatra_number: i,
      nakshatra_name: NAKSHATRA_DATA[i - 1].name,
      distance,
      paryaya,
      tara_number: taraNum,
      tara_name: TARA_NAMES[taraNum - 1],
      nature: [3, 5, 7].includes(taraNum) ? "Inauspicious" : "Neutral/Auspicious",
      intensity_multiplier: multiplier
    });
  }

  // 2. Tara Dasa Analysis
  let taraDasaAnalysis = { applicable: false, strongest_kendra_planet: null, dasa_sequence: [] as any[] };
  
  if (strongestKendraPlanet && PLANETS[strongestKendraPlanet]) {
    taraDasaAnalysis.applicable = true;
    taraDasaAnalysis.strongest_kendra_planet = strongestKendraPlanet as any;
    
    const startIndex = VIMSHOTTARI_SEQUENCE.indexOf(strongestKendraPlanet);
    for (let i = 0; i < 9; i++) {
      const planetName = VIMSHOTTARI_SEQUENCE[(startIndex + i) % 9];
      taraDasaAnalysis.dasa_sequence.push({
        tara_name: TARA_NAMES[i],
        planet: planetName,
        years: PLANETS[planetName].dasa_years
      });
    }
  }

  // 3. Transit Vedha Override (Example)
  let transitVedha = null;
  if (transitContext) {
    const targetMap = navtaraMapping.find(n => n.nakshatra_number === transitContext.target_nakshatra_num);
    if (targetMap && [3, 5, 7].includes(targetMap.tara_number)) {
      const isNeutralized = transitContext.ashtakavarga_rekhas >= 5;
      transitVedha = {
        target_nakshatra: targetMap.nakshatra_name,
        base_tara: targetMap.tara_name,
        is_vedha_blocked: isNeutralized,
        ashtakavarga_rekhas: transitContext.ashtakavarga_rekhas,
        net_malefic_intensity_percentage: isNeutralized ? 20 : targetMap.intensity_multiplier * 100,
        status: isNeutralized ? "Neutralized" : "Active"
      };
    }
  }

  // 4. Remedial Measures
  const remedialMeasures: any = {};
  
  if (transitVedha && transitVedha.status === "Active") {
    let deity = "", mantra = "", donation = "";
    if (transitVedha.base_tara === "Vipat") { deity = "Lord Ganesha"; mantra = "Om Gan Ganapataye Namah"; donation = "Jaggery (Gud) or Yellow Sweets"; }
    if (transitVedha.base_tara === "Pratyak") { deity = "Goddess Durga"; mantra = "Durga Saptashati"; donation = "Salt, Wheat, or Sesame"; }
    if (transitVedha.base_tara === "Vadha") { deity = "Lord Shiva"; mantra = "Mahamrityunjaya Mantra"; donation = "Sesame oil, Black clothes"; }
    
    remedialMeasures.tara_parihara = { deity, mantra, donation };
  }

  if (natalInfo.is_gandanta) {
    remedialMeasures.gandanta_parihara = {
      ritual: "Kalasha Puja with 5 tree leaves (Goolar, Vata, Pipal, Mango, Neem)",
      donation: "Cow with calf and gold",
      havana: "Sesame seeds and ghee oblations (108 times)"
    };
  }

  return {
    natal_nakshatra_info: natalInfo,
    navtara_mapping_table: navtaraMapping,
    tara_dasa_analysis: taraDasaAnalysis,
    transit_vedha_and_override: transitVedha,
    remedial_measures: remedialMeasures
  };
}
