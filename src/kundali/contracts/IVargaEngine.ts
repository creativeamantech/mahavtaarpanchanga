import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { RepositoryMetadata } from "../adapters/RepositoryMetadata";

/**
 * Standard Varga (Divisional Chart) Identifier
 * Based on BPHS Shodashavarga (16 divisional charts) & Shadvarga (6), Saptavarga (7), Dashavarga (10), Shashtiamsha (D60)
 */
export type VargaType =
  | "D1"   // Rashi (Physical body, overall destiny)
  | "D2"   // Hora (Wealth, treasury)
  | "D3"   // Drekkana (Siblings, courage, vitality)
  | "D4"   // Chaturthamsha (Fortune, immovable property)
  | "D7"   // Saptamsha (Children, progeny, lineage)
  | "D9"   // Navamsha (Dharma, spouse, inner potential, soul purpose)
  | "D10"  // Dashamsha (Career, profession, social status, karma)
  | "D12"  // Dvadamshamsha (Parents, lineage, past lives)
  | "D16"  // Shodashamsha (Vehicles, conveyances, mental happiness)
  | "D20"  // Vimshamsha (Spiritual progress, worship, upasana)
  | "D24"  // Chaturvimshamsha (Higher learning, education, intellect)
  | "D27"  // Saptavimshamsha / Bhamsha (Strengths, weaknesses, subconscious)
  | "D30"  // Trimshamsha (Evils, misfortunes, health afflictions, arishta)
  | "D40"  // Khavedamsha (Auspicious and inauspicious results)
  | "D45"  // Akshavedamsha (General well-being, character purity)
  | "D60"; // Shashtiamsha (All karma, past-life debts, deep destiny)

export interface VargaPlanetPosition {
  planet: CanonicalBodyId;
  signIndex: number; // 0 to 11
  degreeInSign: number; // 0 to 30
  houseNumber: number; // 1 to 12 from Varga Lagna
}

export interface VargaChartResult {
  varga: VargaType;
  divisionFactor: number; // e.g. 9 for D9, 60 for D60
  nameEn: string;
  nameSa: string;
  lagnaSignIndex: number;
  planets: Record<CanonicalBodyId, VargaPlanetPosition>;
  vargaLordNames?: Record<CanonicalBodyId, string>; // Special deity/sub-ruler (e.g., Deva, Manushya, Rakshasa in D3, Ghoramsha in D60)
}

/**
 * Contract for Divisional Chart Engine
 */
export interface IVargaEngine {
  readonly metadata: RepositoryMetadata;
  /**
   * Computes a specific divisional chart given sidereal longitudes and sidereal lagna
   */
  calculateVarga(
    varga: VargaType,
    lagnaSiderealLon: number,
    planetSiderealLons: Record<CanonicalBodyId, number>,
  ): VargaChartResult;

  /**
   * Computes all Shodashavarga (16 classical charts)
   */
  calculateShodashavarga(
    lagnaSiderealLon: number,
    planetSiderealLons: Record<CanonicalBodyId, number>,
  ): Record<VargaType, VargaChartResult>;
}
