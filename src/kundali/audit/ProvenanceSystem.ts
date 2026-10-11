/**
 * Mahavtaar Kundali Engine - Provenance & Audit System
 * Phase 8 Production System Architecture
 */

export type SourceVerificationStatus = "VERIFIED" | "UNVERIFIED";

export interface SectionProvenance {
  engine: string;
  engineVersion: string;
  algorithmId: string;
  conventionId: string;
  sourceReference: string;
  sourceStatus: SourceVerificationStatus;
}

export interface CalculationProvenance {
  engine: string;
  engineVersion: string;
  profileVersion: string;
  inputsHash: string;
  resultHash: string;
  sectionProvenances: {
    astronomy: SectionProvenance;
    houses: SectionProvenance;
    vargas: SectionProvenance;
    shadbala: SectionProvenance;
    dasha: SectionProvenance;
    rules: SectionProvenance;
    jaimini: SectionProvenance;
    ashtakavarga: SectionProvenance;
    kp: SectionProvenance;
    gochar: SectionProvenance;
  };
}

export function createCanonicalProvenance(
  engineVersion: string,
  profileVersion: string,
  inputsHash: string,
  resultHash: string,
): CalculationProvenance {
  return {
    engine: "Mahavtaar Kundali Engine",
    engineVersion,
    profileVersion,
    inputsHash,
    resultHash,
    sectionProvenances: {
      astronomy: {
        engine: "AstronomicalCore",
        engineVersion: "2.1.19",
        algorithmId: "Moshier / Astronomy-Engine VSOP87",
        conventionId: "Geocentric Sidereal Lahiri",
        sourceReference: "Swiss Ephemeris / VSOP87 / IAU 1980",
        sourceStatus: "VERIFIED",
      },
      houses: {
        engine: "BhavaEngine",
        engineVersion: "1.0.0",
        algorithmId: "WholeSign / Sripati Cusp Calculation",
        conventionId: "Traditional Whole Sign Bhava",
        sourceReference: "Brihat Parashara Hora Shastra, Ch. 4",
        sourceStatus: "VERIFIED",
      },
      vargas: {
        engine: "VargaEngine",
        engineVersion: "2.0.0-parashara",
        algorithmId: "Shodashavarga Divisional Math",
        conventionId: "Parashari Standard Varga Divisions (D1-D60)",
        sourceReference: "Brihat Parashara Hora Shastra, Ch. 6",
        sourceStatus: "VERIFIED",
      },
      shadbala: {
        engine: "ShadbalaEngine",
        engineVersion: "1.0.0-parashara",
        algorithmId: "6-Fold Shadbala & Bhava Bala Math",
        conventionId: "Parashari Shadbala (Sthana, Dig, Kala, Cheshta, Naisargika, Drik)",
        sourceReference: "Brihat Parashara Hora Shastra, Ch. 27-28",
        sourceStatus: "VERIFIED",
      },
      dasha: {
        engine: "VimshottariDashaEngine",
        engineVersion: "1.0.0-parashara",
        algorithmId: "Vimshottari 120-Year Proportional Cycles",
        conventionId: "365.2425 Solar Year Precision",
        sourceReference: "Brihat Parashara Hora Shastra, Ch. 46",
        sourceStatus: "VERIFIED",
      },
      rules: {
        engine: "RuleEngine",
        engineVersion: "1.0.0-parashara",
        algorithmId: "Parashari Yoga & Combination Evaluator",
        conventionId: "5 Core Mahapurusha + Solar/Lunar/Raja/Viparita Yogas",
        sourceReference: "Brihat Parashara Hora Shastra, Ch. 34-42",
        sourceStatus: "VERIFIED",
      },
      jaimini: {
        engine: "JaiminiEngine",
        engineVersion: "1.0.0-jaimini",
        algorithmId: "Jaimini Upadesha Sutra Calculation Pipeline",
        conventionId: "7/8-Karaka, Arudha Padas, Karakamsha, Rashi Drishti, Chara Dasha",
        sourceReference: "Jaimini Upadesha Sutras, Adhyaya 1-2",
        sourceStatus: "VERIFIED",
      },
      ashtakavarga: {
        engine: "AshtakavargaEngine",
        engineVersion: "1.0.0",
        algorithmId: "Parashari Ashtakavarga Reductions",
        conventionId: "Bhinna & Samudaya Ashtakavarga Points",
        sourceReference: "Brihat Parashara Hora Shastra, Ch. 66-72",
        sourceStatus: "VERIFIED",
      },
      kp: {
        engine: "KpAstrologyEngine",
        engineVersion: "1.0.0-kp",
        algorithmId: "Krishnamurti Paddhati Sub-Lord Calculator",
        conventionId: "Placidus House Cusps + KP Ayanamsha Star/Sub Lords",
        sourceReference: "KP Readers Vol. 1-6",
        sourceStatus: "VERIFIED",
      },
      gochar: {
        engine: "GocharEngine",
        engineVersion: "1.0.0-transit",
        algorithmId: "Real-time Transit Calculator",
        conventionId: "Geocentric Sidereal Natal Moon/Lagna Transit Relative Positions",
        sourceReference: "Phaladeepika, Ch. 26",
        sourceStatus: "VERIFIED",
      },
    },
  };
}
