import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { NaisargikaBalaBreakdown } from "./ShadbalaTypes";

/**
 * Classical BPHS Fixed Naisargika Bala Constants
 * BPHS Adhyaya 27, Shlokas 28-29
 *
 * Sun (60), Moon (51.42857), Venus (42.85714), Jupiter (34.28571),
 * Mercury (25.71428), Mars (17.14285), Saturn (8.57142) Virupas.
 */
export const NAISARGIKA_BALA_TABLE: Record<
  string,
  {
    rankIndex: number;
    fractionalValue: string;
    virupas: number;
  }
> = {
  Sun: {
    rankIndex: 7,
    fractionalValue: "60/1",
    virupas: 60.0,
  },
  Moon: {
    rankIndex: 6,
    fractionalValue: "360/7",
    virupas: 360.0 / 7.0, // 51.42857142857143
  },
  Venus: {
    rankIndex: 5,
    fractionalValue: "300/7",
    virupas: 300.0 / 7.0, // 42.857142857142854
  },
  Jupiter: {
    rankIndex: 4,
    fractionalValue: "240/7",
    virupas: 240.0 / 7.0, // 34.285714285714285
  },
  Mercury: {
    rankIndex: 3,
    fractionalValue: "180/7",
    virupas: 180.0 / 7.0, // 25.714285714285715
  },
  Mars: {
    rankIndex: 2,
    fractionalValue: "120/7",
    virupas: 120.0 / 7.0, // 17.142857142857142
  },
  Saturn: {
    rankIndex: 1,
    fractionalValue: "60/7",
    virupas: 60.0 / 7.0, // 8.571428571428571
  },
  Rahu: {
    rankIndex: 0,
    fractionalValue: "0",
    virupas: 0.0,
  },
  Ketu: {
    rankIndex: 0,
    fractionalValue: "0",
    virupas: 0.0,
  },
};

/**
 * Computes Naisargika Bala for a given planet
 */
export function calculateNaisargikaBala(planet: CanonicalBodyId): NaisargikaBalaBreakdown {
  const data = NAISARGIKA_BALA_TABLE[planet] || {
    rankIndex: 0,
    fractionalValue: "0",
    virupas: 0.0,
  };

  return {
    rankIndex: data.rankIndex,
    fractionalValue: data.fractionalValue,
    totalVirupas: data.virupas,
    totalRupas: data.virupas / 60.0,
    source: "Brihat Parashara Hora Shastra, Ch. 27, v. 28-29",
  };
}
