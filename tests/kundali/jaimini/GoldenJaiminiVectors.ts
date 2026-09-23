import { CanonicalBodyId } from "../../src/kundali/astronomy/AstronomicalContext";
import { CharaKarakaScheme, ArudhaExceptionRule } from "../../src/kundali/jaimini/JaiminiTypes";

export interface GoldenJaiminiTestCase {
  id: string;
  name: string;
  description: string;
  scheme?: CharaKarakaScheme;
  arudhaRule?: ArudhaExceptionRule;
  lagnaD1Sign: number;
  lagnaD9Sign: number;
  planetsD1: Array<{
    id: CanonicalBodyId;
    longitude: number;
    signIndex: number;
    degreeInSign: number;
    speed?: number;
    dignity?: string;
  }>;
  housesD1: Array<{
    houseNumber: number;
    signIndex: number;
    lord: CanonicalBodyId;
    lordSignIndex: number;
  }>;
  planetsD9: Array<{
    id: CanonicalBodyId;
    signIndex: number;
  }>;
  expectedKarakas?: Record<string, { planet: CanonicalBodyId; rank: number }>;
  expectedArudhas?: Record<string, { finalSign: number; isException: boolean }>;
  expectedKarakamshaSign?: number;
}

export const GOLDEN_JAIMINI_VECTORS: GoldenJaiminiTestCase[] = [
  {
    id: "vector_7_karaka_standard",
    name: "Standard 7-Chara Karaka Hierarchy",
    description: "Evaluates 7 Chara Karakas descending strictly from Sun to Moon.",
    scheme: "7_karaka",
    lagnaD1Sign: 0, // Aries
    lagnaD9Sign: 8, // Sagittarius
    planetsD1: [
      { id: "Sun", longitude: 28.5, signIndex: 0, degreeInSign: 28.5 },
      { id: "Jupiter", longitude: 54.2, signIndex: 1, degreeInSign: 24.2 },
      { id: "Saturn", longitude: 80.1, signIndex: 2, degreeInSign: 20.1 },
      { id: "Mars", longitude: 105.8, signIndex: 3, degreeInSign: 15.8 },
      { id: "Venus", longitude: 132.4, signIndex: 4, degreeInSign: 12.4 },
      { id: "Mercury", longitude: 159.0, signIndex: 5, degreeInSign: 9.0 },
      { id: "Moon", longitude: 184.6, signIndex: 6, degreeInSign: 4.6 },
      { id: "Rahu", longitude: 70.0, signIndex: 2, degreeInSign: 10.0 },
      { id: "Ketu", longitude: 250.0, signIndex: 8, degreeInSign: 10.0 },
    ],
    housesD1: [
      { houseNumber: 1, signIndex: 0, lord: "Mars", lordSignIndex: 3 },
      { houseNumber: 2, signIndex: 1, lord: "Venus", lordSignIndex: 4 },
      { houseNumber: 3, signIndex: 2, lord: "Mercury", lordSignIndex: 5 },
      { houseNumber: 4, signIndex: 3, lord: "Moon", lordSignIndex: 6 },
      { houseNumber: 5, signIndex: 4, lord: "Sun", lordSignIndex: 0 },
      { houseNumber: 6, signIndex: 5, lord: "Mercury", lordSignIndex: 5 },
      { houseNumber: 7, signIndex: 6, lord: "Venus", lordSignIndex: 4 },
      { houseNumber: 8, signIndex: 7, lord: "Mars", lordSignIndex: 3 },
      { houseNumber: 9, signIndex: 8, lord: "Jupiter", lordSignIndex: 1 },
      { houseNumber: 10, signIndex: 9, lord: "Saturn", lordSignIndex: 2 },
      { houseNumber: 11, signIndex: 10, lord: "Saturn", lordSignIndex: 2 },
      { houseNumber: 12, signIndex: 11, lord: "Jupiter", lordSignIndex: 1 },
    ],
    planetsD9: [
      { id: "Sun", signIndex: 4 }, // Karakamsha = Leo (4)
      { id: "Jupiter", signIndex: 8 },
      { id: "Saturn", signIndex: 10 },
      { id: "Mars", signIndex: 1 },
      { id: "Venus", signIndex: 11 },
      { id: "Mercury", signIndex: 5 },
      { id: "Moon", signIndex: 3 },
    ],
    expectedKarakas: {
      AK: { planet: "Sun", rank: 1 },
      AmK: { planet: "Jupiter", rank: 2 },
      BK: { planet: "Saturn", rank: 3 },
      MK: { planet: "Mars", rank: 4 },
      PK: { planet: "Venus", rank: 5 },
      GK: { planet: "Mercury", rank: 6 },
      DK: { planet: "Moon", rank: 7 },
    },
    expectedKarakamshaSign: 4, // Leo
  },

  {
    id: "vector_8_karaka_rahu_reverse",
    name: "8-Chara Karaka Scheme with Retrograde Rahu",
    description: "Evaluates Rahu in 8-karaka scheme with 30 - deg effective traversed degree.",
    scheme: "8_karaka",
    lagnaD1Sign: 0,
    lagnaD9Sign: 0,
    planetsD1: [
      { id: "Sun", longitude: 28.5, signIndex: 0, degreeInSign: 28.5 },
      // Rahu at 7° in Gemini -> effective traversed degree = 30 - 7 = 23° -> Rank 2 (AmK)
      { id: "Rahu", longitude: 67.0, signIndex: 2, degreeInSign: 7.0 },
      { id: "Jupiter", longitude: 50.1, signIndex: 1, degreeInSign: 20.1 },
      { id: "Saturn", longitude: 77.0, signIndex: 2, degreeInSign: 17.0 },
      { id: "Mars", longitude: 105.8, signIndex: 3, degreeInSign: 15.8 },
      { id: "Venus", longitude: 132.4, signIndex: 4, degreeInSign: 12.4 },
      { id: "Mercury", longitude: 159.0, signIndex: 5, degreeInSign: 9.0 },
      { id: "Moon", longitude: 184.6, signIndex: 6, degreeInSign: 4.6 },
    ],
    housesD1: [],
    planetsD9: [],
    expectedKarakas: {
      AK: { planet: "Sun", rank: 1 },
      AmK: { planet: "Rahu", rank: 2 },
      BK: { planet: "Jupiter", rank: 3 },
      MK: { planet: "Saturn", rank: 4 },
      PiK: { planet: "Mars", rank: 5 },
      PK: { planet: "Venus", rank: 6 },
      GK: { planet: "Mercury", rank: 7 },
      DK: { planet: "Moon", rank: 8 },
    },
  },

  {
    id: "vector_arudha_exceptions",
    name: "Arudha Pada Classical Exceptions (Jaimini Sutra 1.1.30–31)",
    description:
      "Verifies 1st house exception (lord in 1st -> falls into 10th) and 7th house exception.",
    arudhaRule: "StandardNeelakantha",
    lagnaD1Sign: 0, // Aries
    lagnaD9Sign: 0,
    planetsD1: [],
    housesD1: [
      // House 1 (Aries): Lord Mars in Aries (0) -> raw pada = 0 -> Exception 1 -> 10th = Capricorn (9)
      { houseNumber: 1, signIndex: 0, lord: "Mars", lordSignIndex: 0 },
      // House 2 (Taurus): Lord Venus in Gemini (2) -> distance = 2 -> raw pada = Cancer (3)
      { houseNumber: 2, signIndex: 1, lord: "Venus", lordSignIndex: 2 },
      // House 3 (Gemini): Lord Mercury in Leo (4) -> distance = 3 -> raw pada = Libra (6)
      { houseNumber: 3, signIndex: 2, lord: "Mercury", lordSignIndex: 4 },
      // House 4 (Cancer): Lord Moon in Libra (6) -> distance = 4 -> raw pada = Capricorn (9, 7th from Cancer) -> Exception 2 -> 4th from raw = Aries (0)
      { houseNumber: 4, signIndex: 3, lord: "Moon", lordSignIndex: 6 },
      // House 5 (Leo): Lord Sun in Sagittarius (8) -> distance = 5 -> raw pada = Aries (0)
      { houseNumber: 5, signIndex: 4, lord: "Sun", lordSignIndex: 8 },
      // House 6 (Virgo): Lord Mercury in Scorpio (7) -> distance = 3 -> raw pada = Capricorn (9)
      { houseNumber: 6, signIndex: 5, lord: "Mercury", lordSignIndex: 7 },
      // House 7 (Libra): Lord Venus in Aries (0) -> distance = 7 -> raw pada = Libra (6) -> Exception 1 -> Cancer (3)
      { houseNumber: 7, signIndex: 6, lord: "Venus", lordSignIndex: 0 },
      // House 8 (Scorpio): Lord Mars in Pisces (11) -> distance = 5 -> raw pada = Taurus (1)
      { houseNumber: 8, signIndex: 7, lord: "Mars", lordSignIndex: 11 },
      // House 9 (Sagittarius): Lord Jupiter in Aquarius (10) -> distance = 3 -> raw pada = Aries (0)
      { houseNumber: 9, signIndex: 8, lord: "Jupiter", lordSignIndex: 10 },
      // House 10 (Capricorn): Lord Saturn in Taurus (1) -> distance = 5 -> raw pada = Virgo (5)
      { houseNumber: 10, signIndex: 9, lord: "Saturn", lordSignIndex: 1 },
      // House 11 (Aquarius): Lord Saturn in Cancer (3) -> distance = 6 -> raw pada = Sagittarius (8)
      { houseNumber: 11, signIndex: 10, lord: "Saturn", lordSignIndex: 3 },
      // House 12 (Pisces): Lord Jupiter in Taurus (1) -> distance = 3 -> raw pada = Cancer (3)
      { houseNumber: 12, signIndex: 11, lord: "Jupiter", lordSignIndex: 1 },
    ],
    planetsD9: [],
    expectedArudhas: {
      AL: { finalSign: 9, isException: true }, // Capricorn
      A7: { finalSign: 3, isException: true }, // Cancer
      A4: { finalSign: 0, isException: true }, // Aries
    },
  },
];
