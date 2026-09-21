import { KundliPlanet, ZODIAC_SIGNS } from "./kundliEngine";

export interface KPCusp {
  houseNumber: number; // 1 to 12
  longitude: number; // 0 to 360
  signIndex: number;
  signNameHi: string;
  signNameEn: string;
  degreeInSign: number;
  dmsStr: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
}

export interface KPPlanetSignification {
  planetId: string;
  planetNameHi: string;
  planetNameEn: string;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
  houseOccupied: number;
  housesOwned: number[];
  level1: number[]; // Houses occupied by Star Lord
  level2: number[]; // House occupied by planet
  level3: number[]; // Houses owned by Star Lord
  level4: number[]; // Houses owned by planet
}

const VIMSHOTTARI_PLANETS_ORDER = [
  { planet: "Ketu", nameHi: "केतु", years: 7 },
  { planet: "Venus", nameHi: "शुक्र", years: 20 },
  { planet: "Sun", nameHi: "सूर्य", years: 6 },
  { planet: "Moon", nameHi: "चन्द्र", years: 10 },
  { planet: "Mars", nameHi: "मंगल", years: 7 },
  { planet: "Rahu", nameHi: "राहु", years: 18 },
  { planet: "Jupiter", nameHi: "गुरु", years: 16 },
  { planet: "Saturn", nameHi: "शनि", years: 19 },
  { planet: "Mercury", nameHi: "बुध", years: 17 },
];

export function getKPLords(longitudeDeg: number): {
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
} {
  const norm = ((longitudeDeg % 360) + 360) % 360;
  const signIndex = Math.floor(norm / 30);
  const signLord = ZODIAC_SIGNS[signIndex].lord;

  // Star lord (Nakshatra of 13°20' = 800 minutes)
  const totalMinutes = norm * 60;
  const nakshatraSpanMin = (13 + 20 / 60) * 60; // 800 minutes
  const nakshatraIndex = Math.floor(totalMinutes / nakshatraSpanMin) % 27;
  const starLordIndex = nakshatraIndex % 9;
  const starLord = VIMSHOTTARI_PLANETS_ORDER[starLordIndex].planet;

  // Sub lord inside the 800 minutes nakshatra
  const minWithinNakshatra = totalMinutes % nakshatraSpanMin;
  let accumulatedMin = 0;
  let subLord = starLord;
  let subLordIndex = starLordIndex;

  for (let i = 0; i < 9; i++) {
    const currentIdx = (starLordIndex + i) % 9;
    const subSpanMin = (VIMSHOTTARI_PLANETS_ORDER[currentIdx].years / 120) * nakshatraSpanMin;
    if (minWithinNakshatra < accumulatedMin + subSpanMin) {
      subLord = VIMSHOTTARI_PLANETS_ORDER[currentIdx].planet;
      subLordIndex = currentIdx;
      break;
    }
    accumulatedMin += subSpanMin;
  }

  // Sub-Sub Lord inside the Sub
  const minWithinSub = minWithinNakshatra - accumulatedMin;
  const subTotalSpanMin = (VIMSHOTTARI_PLANETS_ORDER[subLordIndex].years / 120) * nakshatraSpanMin;
  let accumulatedSubMin = 0;
  let subSubLord = subLord;

  for (let j = 0; j < 9; j++) {
    const currentSSIdx = (subLordIndex + j) % 9;
    const subSubSpanMin = (VIMSHOTTARI_PLANETS_ORDER[currentSSIdx].years / 120) * subTotalSpanMin;
    if (minWithinSub < accumulatedSubMin + subSubSpanMin) {
      subSubLord = VIMSHOTTARI_PLANETS_ORDER[currentSSIdx].planet;
      break;
    }
    accumulatedSubMin += subSubSpanMin;
  }

  return {
    signLord,
    starLord,
    subLord,
    subSubLord,
  };
}

function formatDMS(degWithinSign: number): string {
  const d = Math.floor(degWithinSign);
  const remM = (degWithinSign - d) * 60;
  const m = Math.floor(remM);
  const s = Math.round((remM - m) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}' ${s.toString().padStart(2, "0")}"`;
}

export function computeKPAstrology(
  lagnaLongitude: number,
  planets: KundliPlanet[]
): {
  cusps: KPCusp[];
  planetSignifications: KPPlanetSignification[];
  rulingPlanets: { factor: string; factorHi: string; planet: string; planetHi: string }[];
} {
  // 12 House Cusps (Placidus / Equal House Sidereal from Lagna)
  const cusps: KPCusp[] = [];
  for (let h = 1; h <= 12; h++) {
    const cuspLong = (lagnaLongitude + (h - 1) * 30) % 360;
    const signIndex = Math.floor(cuspLong / 30);
    const degreeInSign = cuspLong % 30;
    const lords = getKPLords(cuspLong);

    cusps.push({
      houseNumber: h,
      longitude: cuspLong,
      signIndex,
      signNameHi: ZODIAC_SIGNS[signIndex].hi,
      signNameEn: ZODIAC_SIGNS[signIndex].en,
      degreeInSign,
      dmsStr: formatDMS(degreeInSign),
      signLord: lords.signLord,
      starLord: lords.starLord,
      subLord: lords.subLord,
      subSubLord: lords.subSubLord,
    });
  }

  // Planet ownership of houses
  const planetHouseOwnership: Record<string, number[]> = {};
  cusps.forEach((c) => {
    if (!planetHouseOwnership[c.signLord]) {
      planetHouseOwnership[c.signLord] = [];
    }
    planetHouseOwnership[c.signLord].push(c.houseNumber);
  });

  // Map planet house placements
  const planetHousePlacement: Record<string, number> = {};
  planets.forEach((p) => {
    planetHousePlacement[p.id] = p.houseD1;
  });

  const planetSignifications: KPPlanetSignification[] = planets.map((p) => {
    const lords = getKPLords(p.longitude);
    const starLord = lords.starLord;
    const houseOccupied = p.houseD1;
    const housesOwned = planetHouseOwnership[p.id] || [];

    const starLordHouseOccupied = planetHousePlacement[starLord] ? [planetHousePlacement[starLord]] : [];
    const starLordHousesOwned = planetHouseOwnership[starLord] || [];

    return {
      planetId: p.id,
      planetNameHi: p.nameHi,
      planetNameEn: p.nameEn,
      signLord: lords.signLord,
      starLord: lords.starLord,
      subLord: lords.subLord,
      subSubLord: lords.subSubLord,
      houseOccupied,
      housesOwned,
      level1: starLordHouseOccupied,
      level2: [houseOccupied],
      level3: starLordHousesOwned,
      level4: housesOwned,
    };
  });

  // Ruling Planets for Lagna and Moon
  const lagnaLords = getKPLords(lagnaLongitude);
  const moonObj = planets.find((p) => p.id === "Moon");
  const moonLords = moonObj ? getKPLords(moonObj.longitude) : lagnaLords;

  const rulingPlanets = [
    { factor: "Lagna Sign Lord", factorHi: "लग्न राशि स्वामी", planet: lagnaLords.signLord, planetHi: lagnaLords.signLord },
    { factor: "Lagna Star Lord", factorHi: "लग्न नक्षत्र स्वामी", planet: lagnaLords.starLord, planetHi: lagnaLords.starLord },
    { factor: "Lagna Sub Lord", factorHi: "लग्न उप-स्वामी (Sub-Lord)", planet: lagnaLords.subLord, planetHi: lagnaLords.subLord },
    { factor: "Moon Sign Lord", factorHi: "चन्द्र राशि स्वामी", planet: moonLords.signLord, planetHi: moonLords.signLord },
    { factor: "Moon Star Lord", factorHi: "चन्द्र नक्षत्र स्वामी", planet: moonLords.starLord, planetHi: moonLords.starLord },
    { factor: "Moon Sub Lord", factorHi: "चन्द्र उप-स्वामी (Sub-Lord)", planet: moonLords.subLord, planetHi: moonLords.subLord },
  ];

  return {
    cusps,
    planetSignifications,
    rulingPlanets,
  };
}
