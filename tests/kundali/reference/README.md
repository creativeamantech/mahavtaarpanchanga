# Mahavtaar Kundali — Reference Corpus & Verification Suite

## Architecture Overview

The Mahavtaar Kundali Reference Corpus is a permanent, version-controlled testing and validation infrastructure. It establishes reproducible benchmarks across all computational layers of Vedic and astronomical Jyotisha.

```
tests/kundali/reference/
├── README.md
├── ReferenceTypes.ts                <- Machine-readable canonical schema & types
├── RegressionGate.test.ts          <- Master validation gate (0 regression rule)
├── birth-inputs/                   <- Categorized test inputs (Categories A through T)
│   ├── standardIndianCases.json    <- Cat A: Ordinary Indian birth charts
│   ├── boundaryCases.json          <- Cat B, C, D, E: Nakshatra, Pada, Rashi, Varga boundaries
│   ├── solarTransitionCases.json   <- Cat F, G, H, I: Sunrise, Sunset, Midnight, Noon
│   ├── calendarEdgeCases.json      <- Cat J, K, T: Leap years, historical dates, ancient ephemeris
│   ├── temporalCases.json          <- Cat L, M: DST transitions, fractional timezones (+5:30, +5:45, +12:45)
│   ├── extremeLatitudeCases.json   <- Cat N, O: High-latitude (63°-65°) & Arctic boundary conditions
│   └── orbitalPhenomenaCases.json  <- Cat P, Q, R, S: Retrograde stations, conjunctions, planetary war, nodal axis
├── astronomy/                      <- Geocentric coordinate validation & cross-engine comparison
├── graha/                          <- Planetary positions, speeds, combustions, dignities
├── lagna/                          <- Ascendant, RAMC, GMST, obliquity, 1° latitude sweep
├── bhava/                          <- House systems, occupants, aspect verification
├── varga/                          <- All 16 Shodashavargas (D1..D60) boundary tests
├── shadbala/                       <- 6-fold strength, Bhava Bala, Virupa vs Rupa invariants
├── dasha/                          <- 5-tier Vimshottari timelines, sum conservation
├── rules/                          <- 13 core Parashari rule sets with positive/negative/exception cases
├── jaimini/                        <- 7 & 8 Chara Karakas, Arudhas, Karakamsha, Rashi Drishti, Chara Dasha
├── timezone/                       <- Comprehensive timezone & DST transition suite
├── historical/                     <- Canonical historical charts (Independence of India, Vivekananda, etc.)
├── edge-cases/                     <- High-stress boundary floats, polar transitions, 0°/360° wraps
├── determinism/                    <- 100, 1,000, 5,000 run bit-level reproducibility certification
├── snapshot/                       <- Versioned snapshots (reference-v1)
└── benchmark/                      <- Throughput & performance stress testing (100, 1k, 5k charts)
```

## Canonical Machine-Readable Format

Every test case adheres strictly to `ReferenceCase<T>`:
```typescript
interface ReferenceCase<T> {
  id: string;
  category: string;
  subCategory?: string;
  birthDate: string;    // YYYY-MM-DD
  birthTime: string;    // HH:mm:ss
  timezone: string;     // IANA timezone identifier
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  ayanamsha: string;    // lahiri | raman | krishnamurti | sayana | true_chitra
  houseSystem: "whole_sign" | "sripati" | "placidus" | "equal";
  expected: T;
  source: string;
  sourceVersion: string;
  convention: string;
  tolerance: ReferenceTolerance;
  notes: string;
}
```

## Discrepancy Classification Taxonomy

All engine differences are categorized under one of 13 official classes:
1. `EPHEMERIS_DIFFERENCE`
2. `COORDINATE_FRAME_DIFFERENCE`
3. `AYANAMSHA_DIFFERENCE`
4. `TIME_SCALE_DIFFERENCE`
5. `TIMEZONE_DIFFERENCE`
6. `HOUSE_SYSTEM_DIFFERENCE`
7. `VARGA_CONVENTION`
8. `DASHA_CONVENTION`
9. `CLASSICAL_SOURCE_DIFFERENCE`
10. `ROUNDING`
11. `FLOATING_POINT_EFFECT`
12. `IMPLEMENTATION_BUG`
13. `UNKNOWN`

## Precision Budget Summary

- **Planetary Longitude**: Output 0.0001° (0.36"), acceptable error ±0.01° (vs Swiss Ephemeris / JPL DE431).
- **Ascendant / Cusps**: Output 0.001° (3.6"), acceptable error ±0.05°.
- **Ayanamsha**: Output 0.00001° (0.036"), acceptable error ±0.001°.
- **Shadbala**: Sthana/Dig/Kala/Cheshta/Drik in Virupas. Output 0.01 Virupa (0.000167 Rupa). Naisargika total = exactly 240.0 Virupas.
- **Vimshottari Dasha**: Millisecond timestamps, sum-of-children = parent period within 1ms.
