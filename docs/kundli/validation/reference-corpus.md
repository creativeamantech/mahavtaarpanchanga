# Reference Corpus Architecture & Inventory

## Directory Hierarchy
The Mahavtaar reference corpus is housed in `tests/kundali/reference/`:

```
tests/kundali/reference/
├── README.md
├── ReferenceTypes.ts
├── RegressionGate.test.ts
├── birth-inputs/
│   ├── standardIndianCases.json
│   ├── boundaryCases.json
│   ├── solarTransitionCases.json
│   ├── calendarEdgeCases.json
│   ├── temporalCases.json
│   ├── extremeLatitudeCases.json
│   └── orbitalPhenomenaCases.json
├── astronomy/
│   ├── EphemerisComparisonTable.ts
│   └── AstronomicalValidation.test.ts
├── ayanamsha/
│   └── AyanamshaValidation.test.ts
├── graha/
│   └── GrahaValidation.test.ts
├── lagna/
│   └── LagnaValidation.test.ts
├── bhava/
│   └── BhavaValidation.test.ts
├── varga/
│   └── VargaValidation.test.ts
├── shadbala/
│   └── ShadbalaValidation.test.ts
├── dasha/
│   └── DashaValidation.test.ts
├── rules/
│   └── RulesValidation.test.ts
├── jaimini/
│   └── JaiminiValidation.test.ts
├── timezone/
│   └── TimezoneValidation.test.ts
├── historical/
│   └── HistoricalValidation.test.ts
├── edge-cases/
│   └── EdgeCaseValidation.test.ts
├── determinism/
│   └── DeterminismEngine.test.ts
├── snapshot/
│   ├── reference-v1.json
│   └── SnapshotSystem.test.ts
└── benchmark/
    └── PipelineBenchmark.test.ts
```

## Inventory of 20 Test Categories (A through T)

| Code | Category | Reference File | Key Test Cases |
|---|---|---|---|
| **A** | Ordinary Indian birth charts | `standardIndianCases.json` | Delhi, Ujjain, Chennai, Mumbai, Varanasi |
| **B** | Exact Nakshatra boundaries | `boundaryCases.json` | Ashwini/Bharani (13°20'), Bharani/Krittika (26°40') |
| **C** | Exact Pada boundaries | `boundaryCases.json` | 3°20' increments in all signs |
| **D** | Exact Rashi boundaries | `boundaryCases.json` | 0°00' Aries, 30°00' Taurus transition |
| **E** | Varga boundaries | `boundaryCases.json` | Navamsha 3°20', Shashtiamsha 0°30' |
| **F** | Sunrise boundary | `solarTransitionCases.json` | Equinox sunrise at Ujjain (House 1 Sun) |
| **G** | Sunset boundary | `solarTransitionCases.json` | Solstice sunset at Delhi (House 7 Sun) |
| **H** | Midnight | `solarTransitionCases.json` | 00:00:00 LST nadir (House 4 Sun) |
| **I** | Noon | `solarTransitionCases.json` | Local solar culmination (House 10 Sun) |
| **J** | Leap years | `calendarEdgeCases.json` | Feb 29 2000 (century leap), Feb 29 2024 |
| **K** | Historical dates | `calendarEdgeCases.json` | India Independence 1947, Vivekananda 1863 |
| **L** | DST transitions | `temporalCases.json` | America/New_York EDT/EST transitions |
| **M** | Timezone transitions | `temporalCases.json` | Nepal +5:45, Chatham +12:45, IST +5:30 |
| **N** | High latitude | `extremeLatitudeCases.json` | Trondheim (63.4° N), Fairbanks (64.8° N) |
| **O** | Near-polar conditions | `extremeLatitudeCases.json` | Tromsø (69.6° N) midnight sun |
| **P** | Retrograde stations | `orbitalPhenomenaCases.json` | Mercury stationary point |
| **Q** | Planetary conjunctions | `orbitalPhenomenaCases.json` | Great Conjunction 2020 (Jupiter-Saturn < 0.1°) |
| **R** | Planetary war | `orbitalPhenomenaCases.json` | Mars-Venus Graha Yuddha (< 1° separation) |
| **S** | Rahu/Ketu boundaries | `orbitalPhenomenaCases.json` | Mean node 180° anti-podal invariant |
| **T** | Very old dates | `calendarEdgeCases.json` | 1800 CE epoch boundary |
