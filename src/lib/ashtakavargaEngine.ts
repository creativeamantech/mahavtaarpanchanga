import { KundliPlanet, ZODIAC_SIGNS } from "./kundliEngine";

export interface PlanetBAV {
  planetId: string;
  planetNameHi: string;
  planetNameEn: string;
  bindus: number[]; // 12 signs (0 = Aries, 11 = Pisces)
  totalBindus: number;
}

export interface AshtakavargaData {
  savBySign: number[]; // 12 signs (index 0 = Aries, 11 = Pisces)
  savByHouse: { houseNumber: number; signIndex: number; signNameHi: string; bindus: number; strength: "high" | "good" | "medium" | "low" }[];
  bavByPlanet: PlanetBAV[];
  totalSAV: number;
  trikonaShodhitaSAV: number[];
  ekadhipatyaShodhitaSAV: number[];
  kakshyaTable: { signIndex: number; signNameHi: string; kakshyas: { planet: string; lordHi: string; startDeg: number; endDeg: number; hasBindu: boolean }[] }[];
}

// Benefic house positions for each planet from 8 contributors (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Ascendant)
// Based on classical Brihat Parashara Hora Shastra (BPHS)
const ASHTAKAVARGA_RULES: Record<
  string, // Target planet
  Record<string, number[]> // Contributor -> benefic houses (1-indexed)
> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Ascendant: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Ascendant: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Ascendant: [1, 3, 4, 6, 10, 11],
  },
};

const PLANET_NAMES_HI: Record<string, string> = {
  Sun: "सूर्य (Sun)",
  Moon: "चन्द्र (Moon)",
  Mars: "मंगल (Mars)",
  Mercury: "बुध (Mercury)",
  Jupiter: "गुरु (Jupiter)",
  Venus: "शुक्र (Venus)",
  Saturn: "शनि (Saturn)",
};

export function computeAshtakavarga(
  planets: KundliPlanet[],
  lagnaSignIndex: number
): AshtakavargaData {
  // Map planet sign indices
  const donorSignMap: Record<string, number> = {
    Ascendant: lagnaSignIndex,
  };

  planets.forEach((p) => {
    donorSignMap[p.id] = p.signIndex;
  });

  const targetPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const bavByPlanet: PlanetBAV[] = [];
  const savBySign = new Array(12).fill(0);

  targetPlanets.forEach((target) => {
    const rules = ASHTAKAVARGA_RULES[target];
    const bindus = new Array(12).fill(0);

    if (rules) {
      Object.entries(rules).forEach(([donor, beneficHouses]) => {
        const donorSign = donorSignMap[donor];
        if (typeof donorSign === "number") {
          beneficHouses.forEach((houseOffset) => {
            const targetSign = (donorSign + (houseOffset - 1)) % 12;
            bindus[targetSign] += 1;
          });
        }
      });
    }

    const totalBindus = bindus.reduce((a, b) => a + b, 0);
    bavByPlanet.push({
      planetId: target,
      planetNameHi: PLANET_NAMES_HI[target] || target,
      planetNameEn: target,
      bindus,
      totalBindus,
    });

    for (let i = 0; i < 12; i++) {
      savBySign[i] += bindus[i];
    }
  });

  const totalSAV = savBySign.reduce((a, b) => a + b, 0);

  // Map to 12 Bhavas from Lagna
  const savByHouse = [];
  for (let h = 1; h <= 12; h++) {
    const signIndex = (lagnaSignIndex + (h - 1)) % 12;
    const bindus = savBySign[signIndex];
    let strength: "high" | "good" | "medium" | "low" = "medium";
    if (bindus >= 32) strength = "high";
    else if (bindus >= 28) strength = "good";
    else if (bindus >= 25) strength = "medium";
    else strength = "low";

    savByHouse.push({
      houseNumber: h,
      signIndex,
      signNameHi: ZODIAC_SIGNS[signIndex].hi,
      bindus,
      strength,
    });
  }

  // Trikona Shodhana (Reduction by Trines: 1-5-9, 2-6-10, 3-7-11, 4-8-12)
  const trikonaShodhitaSAV = [...savBySign];
  for (let t = 0; t < 4; t++) {
    const s1 = t;
    const s2 = t + 4;
    const s3 = t + 8;
    const minVal = Math.min(trikonaShodhitaSAV[s1], trikonaShodhitaSAV[s2], trikonaShodhitaSAV[s3]);
    trikonaShodhitaSAV[s1] -= minVal;
    trikonaShodhitaSAV[s2] -= minVal;
    trikonaShodhitaSAV[s3] -= minVal;
  }

  // Ekadhipatya Shodhana (Dual sign lord reduction)
  const ekadhipatyaShodhitaSAV = [...trikonaShodhitaSAV];
  // Pair signs with same lord: Mars (0,7), Venus (1,6), Mercury (2,5), Jupiter (8,11), Saturn (9,10)
  const dualPairs = [
    [0, 7],
    [1, 6],
    [2, 5],
    [8, 11],
    [9, 10],
  ];

  dualPairs.forEach(([a, b]) => {
    if (ekadhipatyaShodhitaSAV[a] === 0 || ekadhipatyaShodhitaSAV[b] === 0) {
      // no reduction if either is already 0
    } else if (ekadhipatyaShodhitaSAV[a] === ekadhipatyaShodhitaSAV[b]) {
      ekadhipatyaShodhitaSAV[a] = 0;
      ekadhipatyaShodhitaSAV[b] = 0;
    } else if (ekadhipatyaShodhitaSAV[a] > ekadhipatyaShodhitaSAV[b]) {
      ekadhipatyaShodhitaSAV[a] = ekadhipatyaShodhitaSAV[b];
    } else {
      ekadhipatyaShodhitaSAV[b] = ekadhipatyaShodhitaSAV[a];
    }
  });

  // 8 Kakshya Table (Each sign divided into 8 divisions of 3°45' ruled by Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, Ascendant)
  const kakshyaLords = [
    { planet: "Saturn", lordHi: "शनि" },
    { planet: "Jupiter", lordHi: "गुरु" },
    { planet: "Mars", lordHi: "मंगल" },
    { planet: "Sun", lordHi: "सूर्य" },
    { planet: "Venus", lordHi: "शुक्र" },
    { planet: "Mercury", lordHi: "बुध" },
    { planet: "Moon", lordHi: "चन्द्र" },
    { planet: "Ascendant", lordHi: "लग्न" },
  ];

  const kakshyaTable = [];
  for (let s = 0; s < 12; s++) {
    const kakshyas = kakshyaLords.map((k, idx) => ({
      planet: k.planet,
      lordHi: k.lordHi,
      startDeg: idx * 3.75,
      endDeg: (idx + 1) * 3.75,
      hasBindu: savBySign[s] > idx * 4,
    }));

    kakshyaTable.push({
      signIndex: s,
      signNameHi: ZODIAC_SIGNS[s].hi,
      kakshyas,
    });
  }

  return {
    savBySign,
    savByHouse,
    bavByPlanet,
    totalSAV,
    trikonaShodhitaSAV,
    ekadhipatyaShodhitaSAV,
    kakshyaTable,
  };
}
