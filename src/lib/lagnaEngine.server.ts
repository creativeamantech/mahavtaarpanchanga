import * as Astronomy from "astronomy-engine";
import { calculateAyanamsa, getBodySiderealLongitude } from "./panchangaEngine.server";
import { CoordinateSelection } from "../types";

export type PlanetId =
  "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

export interface BirthChartPlanet {
  id: PlanetId;
  longitude: number;
  signIndex: number; // 0-11
  degreeInSign: number; // 0-30
  retrograde: boolean;
  nakshatra: string;
  pada: number;
}

export interface BirthChartHouse {
  houseIndex: number; // 1 to 12
  signIndex: number; // 0-11
}

export interface BirthChart {
  birthTimestampMs: number;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa: {
    name: string;
    degrees: number;
  };
  lagna: {
    longitude: number;
    signIndex: number;
    degreeInSign: number;
    degree: number; // same as longitude
    nakshatra: string;
    pada: number;
  };
  planets: BirthChartPlanet[];
  houses: BirthChartHouse[];
}

const NAKSHATRA_NAMES = [
  "Aśvinī",
  "Bharaṇī",
  "Kṛttikā",
  "Rohiṇī",
  "Mṛgaśirā",
  "Ārdrā",
  "Punarvasū",
  "Puṣya",
  "Āśleṣā",
  "Maghā",
  "Pūrvaphalgunī",
  "Uttaraphalgunī",
  "Hasta",
  "Cittā",
  "Svāti",
  "Viśākhā",
  "Anurādhā",
  "Jyeṣṭhā",
  "Mūlā",
  "Pūrvāṣāḍhā",
  "Uttarāṣāḍhā",
  "Śravaṇā",
  "Dhaniṣṭhā",
  "Śatabhiṣā",
  "Pūrvābhādrā",
  "Uttarābhādrā",
  "Revatī",
];

function getMeanObliquity(t: Astronomy.AstroTime): number {
  const T = t.ut / 36525.0;
  return 23.43929111 - ((46.815 + (0.00059 - 0.001813 * T) * T) * T) / 3600.0;
}

function calculateTropicalAscendant(time: Astronomy.AstroTime, lat: number, lon: number): number {
  const gmst = Astronomy.SiderealTime(time);
  const lstHours = (gmst + lon / 15.0) % 24;
  const lstRad = lstHours * 15.0 * (Math.PI / 180.0);

  const epsDeg = getMeanObliquity(time);
  const epsRad = (epsDeg * Math.PI) / 180.0;
  const latRad = (lat * Math.PI) / 180.0;

  const num = Math.cos(lstRad);
  const den = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));

  let ascRad = Math.atan2(num, den);
  if (ascRad < 0) ascRad += 2 * Math.PI;

  return (ascRad * 180.0) / Math.PI;
}

function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function calculateNakshatra(longitude: number): { nakshatra: string; pada: number } {
  const exactNakshatra = longitude / (360 / 27);
  const nakIdx = Math.floor(exactNakshatra);
  const pada = Math.floor((exactNakshatra - nakIdx) * 4) + 1;
  return {
    nakshatra: NAKSHATRA_NAMES[nakIdx % 27],
    pada,
  };
}

export function computeBirthChart(
  birthTimestampMs: number,
  lat: number,
  lon: number,
  timeZone: string,
  ayanamsaKey: CoordinateSelection = "citra",
): BirthChart {
  const t = Astronomy.MakeTime(new Date(birthTimestampMs));
  const ayanamsaDeg = calculateAyanamsa(t, ayanamsaKey);

  // Calculate Lagna
  const tropAsc = calculateTropicalAscendant(t, lat, lon);
  const siderealAsc = normalize360(tropAsc - ayanamsaDeg);
  const lagnaSignIndex = Math.floor(siderealAsc / 30);
  const lagnaDegreeInSign = siderealAsc % 30;
  const lagnaNak = calculateNakshatra(siderealAsc);

  const lagna = {
    longitude: siderealAsc,
    signIndex: lagnaSignIndex,
    degreeInSign: lagnaDegreeInSign,
    degree: siderealAsc,
    nakshatra: lagnaNak.nakshatra,
    pada: lagnaNak.pada,
  };

  // Calculate Houses (Whole Sign)
  const houses: BirthChartHouse[] = [];
  for (let i = 0; i < 12; i++) {
    houses.push({
      houseIndex: i + 1,
      signIndex: (lagnaSignIndex + i) % 12,
    });
  }

  // Calculate Planets
  const planetIds: Array<{ id: PlanetId; astroId: string }> = [
    { id: "Sun", astroId: "sun" },
    { id: "Moon", astroId: "moon" },
    { id: "Mars", astroId: "mars" },
    { id: "Mercury", astroId: "mercury" },
    { id: "Jupiter", astroId: "jupiter" },
    { id: "Venus", astroId: "venus" },
    { id: "Saturn", astroId: "saturn" },
    { id: "Rahu", astroId: "rahu" },
    { id: "Ketu", astroId: "ketu" },
  ];

  const planets: BirthChartPlanet[] = [];

  for (const p of planetIds) {
    const longitude = getBodySiderealLongitude(p.astroId, t, ayanamsaKey);
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;
    const pNak = calculateNakshatra(longitude);

    // Calculate retrograde status
    let retrograde = false;
    if (["mars", "mercury", "jupiter", "venus", "saturn"].includes(p.astroId)) {
      // Check if longitude is decreasing
      const tPrev = Astronomy.MakeTime(new Date(birthTimestampMs - 1000 * 60 * 60)); // 1 hour ago
      const lonPrev = getBodySiderealLongitude(p.astroId, tPrev, ayanamsaKey);
      let diff = longitude - lonPrev;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      retrograde = diff < 0;
    } else if (p.astroId === "rahu" || p.astroId === "ketu") {
      retrograde = true; // Mean nodes are always retrograde.
    }

    planets.push({
      id: p.id,
      longitude,
      signIndex,
      degreeInSign,
      retrograde,
      nakshatra: pNak.nakshatra,
      pada: pNak.pada,
    });
  }

  return {
    birthTimestampMs,
    latitude: lat,
    longitude: lon,
    timezone: timeZone,
    ayanamsa: {
      name: ayanamsaKey,
      degrees: ayanamsaDeg,
    },
    lagna,
    planets,
    houses,
  };
}
