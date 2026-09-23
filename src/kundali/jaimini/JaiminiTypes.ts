import { CanonicalBodyId } from "../astronomy/AstronomicalContext";

// ==========================================
// 1. CHARA KARAKA SYSTEM
// ==========================================

export type CharaKarakaScheme = "7_karaka" | "8_karaka";

export type CharaKarakaId =
  | "AK" // Atmakaraka (Soul / Self)
  | "AmK" // Amatyakaraka (Minister / Career / Mind)
  | "BK" // Bhratrikaraka (Brothers / Guru / Father in 7-system)
  | "MK" // Matrikaraka (Mother)
  | "PiK" // Pitrikaraka (Father - 8-karaka scheme only)
  | "PK" // Putrakaraka (Children / Intellect)
  | "GK" // Gnatikaraka (Kinsmen / Obstacles / Disease)
  | "DK"; // Darakaraka (Spouse / Partner)

export interface CharaKarakaResult {
  readonly karakaId: CharaKarakaId;
  readonly nameEn: string;
  readonly nameHi: string;
  readonly nameSa: string;
  readonly planet: CanonicalBodyId;
  readonly signIndex: number;
  readonly longitude: number;
  readonly degreeInSign: number;
  readonly effectiveDegree: number; // For Rahu in 8-karaka: 30 - degree
  readonly rank: number; // 1 = highest degree (AK) .. 7 or 8 = lowest (DK)
  readonly isTieResolved: boolean;
  readonly tieResolutionMethod?: string;
}

export interface CharaKarakaReport {
  readonly scheme: CharaKarakaScheme;
  readonly karakas: CharaKarakaResult[];
  readonly atmakaraka: CharaKarakaResult;
  readonly amatyakaraka: CharaKarakaResult;
  readonly darakaraka: CharaKarakaResult;
  readonly tieOccurred: boolean;
}

// ==========================================
// 2. ARUDHA PADA SYSTEM
// ==========================================

export type ArudhaExceptionRule =
  | "StandardNeelakantha" // 1st -> 10th, 7th -> 4th
  | "RathException" // 1st -> 10th, 7th -> 10th
  | "NoExceptions"; // Pure reflection without 1/7 displacement

export interface ArudhaPadaResult {
  readonly houseNumber: number; // 1 to 12
  readonly padaCode: string; // AL, A2, A3, ..., A12 (UL)
  readonly nameEn: string;
  readonly nameHi: string;
  readonly nameSa: string;
  readonly houseSignIndex: number;
  readonly lord: CanonicalBodyId;
  readonly lordSignIndex: number;
  readonly rawPadaSignIndex: number;
  readonly finalPadaSignIndex: number;
  readonly finalPadaHouseNumber: number; // House from Lagna (1-12)
  readonly isExceptionApplied: boolean;
  readonly exceptionReason?: string;
}

export interface ArudhaReport {
  readonly exceptionConvention: ArudhaExceptionRule;
  readonly padas: ArudhaPadaResult[];
  readonly arudhaLagna: ArudhaPadaResult;
  readonly upapadaLagna: ArudhaPadaResult;
}

// ==========================================
// 3. UPAPADA (UL) DETAILED MODEL
// ==========================================

export interface UpapadaDetails {
  readonly pada: ArudhaPadaResult;
  readonly signIndex: number;
  readonly signNameEn: string;
  readonly signNameHi: string;
  readonly houseFromLagna: number;
  readonly lord: CanonicalBodyId;
  readonly lordHouseFromLagna: number;
  readonly planetsInUpapada: CanonicalBodyId[];
  readonly planetsAspectingUpapada: CanonicalBodyId[]; // Via Jaimini Rashi Drishti
  readonly secondFromUpapadaSignIndex: number;
  readonly planetsInSecondFromUpapada: CanonicalBodyId[];
}

// ==========================================
// 4. KARAKAMSHA MODEL
// ==========================================

export interface KarakamshaReport {
  readonly atmakarakaPlanet: CanonicalBodyId;
  readonly atmakarakaD1SignIndex: number;
  readonly karakamshaSignIndex: number; // Navamsha sign of Atmakaraka (D9)
  readonly karakamshaHouseInD1: number; // Which D1 house holds the Karakamsha sign
  readonly swamshaSignIndex: number; // Navamsha Lagna sign
  readonly planetsInKarakamshaD9: CanonicalBodyId[];
  readonly planetsAspectingKarakamshaD9: CanonicalBodyId[]; // Via Jaimini Rashi Drishti
}

// ==========================================
// 5. JAIMINI RASHI DRISHTI (SIGN ASPECTS)
// ==========================================

export type SignMobility = "Chara" | "Sthira" | "Dvisvabhava";

export interface RashiDrishtiResult {
  readonly signIndex: number; // 0 to 11
  readonly signNameEn: string;
  readonly mobility: SignMobility;
  readonly aspectedSignIndices: number[]; // Exactly 3 signs
  readonly aspectedSignNamesEn: string[];
  readonly aspectingPlanets: CanonicalBodyId[];
  readonly aspectedPlanets: CanonicalBodyId[];
}

// ==========================================
// 6. JAIMINI CHARA DASHA MODEL
// ==========================================

export type DashaCountingDirection = "direct" | "indirect";

export interface JaiminiDashaPeriod {
  readonly signIndex: number;
  readonly signNameEn: string;
  readonly signNameHi: string;
  readonly durationYears: number;
  readonly startDateMs: number;
  readonly endDateMs: number;
  readonly direction: DashaCountingDirection;
  readonly subPeriods?: JaiminiDashaSubPeriod[];
}

export interface JaiminiDashaSubPeriod {
  readonly signIndex: number;
  readonly signNameEn: string;
  readonly signNameHi: string;
  readonly durationMonths: number;
  readonly startDateMs: number;
  readonly endDateMs: number;
}

export interface CharaDashaReport {
  readonly tradition: "Jaimini_KN_Rao" | "Jaimini_Neelakantha" | "Jaimini_Rath";
  readonly startingSignIndex: number;
  readonly periods: JaiminiDashaPeriod[];
  readonly currentPeriod?: JaiminiDashaPeriod;
}

// ==========================================
// 7. COMPREHENSIVE JAIMINI PROFILE
// ==========================================

export interface JaiminiProfile {
  readonly charaKarakas: CharaKarakaReport;
  readonly arudhas: ArudhaReport;
  readonly upapada: UpapadaDetails;
  readonly karakamsha: KarakamshaReport;
  readonly rashiDrishti: RashiDrishtiResult[];
  readonly charaDasha?: CharaDashaReport;
}
