# Mahavtaar Kundali: Shadbala & Bhava Bala Implementation Plan

## 1. Architectural Overview & Objective
This document outlines the design, mathematical foundations, and implementation steps for **Shadbala (षड्बल - Six-fold Planetary Strength)** and **Bhava Bala (भावबल - House Strength)** in the Mahavtaar Panchanga & Kundali ecosystem.

The system adheres strictly to the classical guidelines of the *Brihat Parashara Hora Shastra* (BPHS Adhyaya 27: Shadbaladhyaya) with full floating-point precision, explicit unit tagging, non-duplication of astronomical calculations, and verifiable test vectors.

---

## 2. Input Pipeline & Dependencies
Shadbala and Bhava Bala are pure analytical consumers of existing astronomical and sidereal calculations. In accordance with the single-source-of-truth directive, the engine **never recalculates**:
1. Planetary tropical coordinates, speeds, distances, and declinations (provided by `AstronomicalCore`).
2. Ayanamsha (provided by `AyanamshaProvider`).
3. Sidereal Ascendant (Lagna) and 12 Bhava madhyas (provided by `AstronomicalCore` / `kundliEngine`).
4. Divisional sign positions across Saptavargas (provided by `VargaEngine`).
5. Sunrise, sunset, day/night division, and weekday (Vara) / planetary hour (Hora) (provided by `AstronomicalCore` / `horaEngine`).

### Dependency Graph
```
Birth Input (Date, Time, Lat, Lon, Timezone)
    │
    ▼
AstronomicalCore (Astronomy-engine / VSOP87 / ELP2000)
    │
    ├── Planetary Positions (Longitude, Declination, Speed, Retrograde)
    ├── Sunrise, Sunset, Local Midnight
    └── Topocentric Lagna
    │
    ▼
AyanamshaProvider (Lahiri / Chitra Paksha)
    │
    ▼
Sidereal Positions (Grahas + Lagna + Bhava Madhyas)
    │
    ├── VargaEngine (D1, D2, D3, D7, D9, D12, D30 for Saptavarga)
    └── Dignity & Panchadha Maitri Calculator
    │
    ▼
ShadbalaEngine (6 Major Balas + Ishta/Kashta Phala)
    ├── Sthana Bala
    ├── Dig Bala
    ├── Kala Bala
    ├── Cheshta Bala
    ├── Naisargika Bala
    └── Drik Bala
    │
    ▼
BhavaBalaEngine (12 Bhavas)
    ├── Bhavadhipati Bala
    ├── Bhava Dig Bala
    └── Bhava Drishti Bala
```

---

## 3. Sub-Module Breakdown in `src/kundali/shadbala/`

| Module | File | Purpose |
|---|---|---|
| **Types & Metadata** | `ShadbalaTypes.ts` | Complete TypeScript contracts, interfaces, and unit enums |
| **Sthana Bala** | `SthanaBala.ts` | Uchcha, Saptavargaja, Ojayugmarashi, Kendradi, Drekkana Bala |
| **Dig Bala** | `DigBala.ts` | Directional strength of planets based on angular distance from zero point |
| **Kala Bala** | `KalaBala.ts` | Natonnata, Paksha, Tribhaga, Varsha/Masa/Dina/Hora, Ayana, Yuddha Bala |
| **Cheshta Bala** | `CheshtaBala.ts` | Planetary motion & speed evaluation; Ayana/Paksha fallback for Sun & Moon |
| **Naisargika Bala** | `NaisargikaBala.ts` | Fixed classical immutable values for 7 Grahas |
| **Drik Bala** | `DrikBala.ts` | Aspectual strength based on classical piecewise linear Drishti rules |
| **Ishta / Kashta** | `IshtaKashtaPhala.ts` | Geometric mean calculations of Uchcha and Cheshta Balas |
| **Bhava Bala** | `BhavaBalaEngine.ts` | 12 Houses strength (Bhavadhipati, Bhava Dig, Bhava Drishti) |
| **Orchestrator** | `ShadbalaEngine.ts` | Main calculation engine assembling all components |
| **Validation** | `ShadbalaValidation.ts` | Boundary and assertion checks |
| **Unit Tests** | `ShadbalaEngine.test.ts` | Comprehensive Vitest suite covering all components |

---

## 4. Execution Phases
1. **Types & Contracts (`ShadbalaTypes.ts`)**: Define all sub-scores, units (Virupas vs Rupas), required benchmarks, and Bhava Bala types.
2. **Component Implementations**:
   - `NaisargikaBala.ts` (constants)
   - `SthanaBala.ts` (geometric exaltation arc, Panchadha Maitri, Saptavarga evaluation)
   - `DigBala.ts` (angular distance from zero points)
   - `KalaBala.ts` (time-of-day, Moon phase, Hora lord, Ayana declination)
   - `CheshtaBala.ts` (speeds, retrograde states, 8-fold planetary motion states)
   - `DrikBala.ts` (Vedic drishti aspect angles)
   - `IshtaKashtaPhala.ts`
   - `BhavaBalaEngine.ts`
3. **Master Engine (`ShadbalaEngine.ts`)**: Combine all 6 Balas, compute totals, ranks, and relative ratios.
4. **Testing & Benchmark**:
   - Component unit tests
   - Boundary tests (Aries 0°, exaltation boundaries, retrograde boundaries)
   - 100, 1,000, 5,000 run benchmark
5. **Integration & Documentation**:
   - Expose in `calculateKundli`
   - Create all 12 markdown documents in `docs/kundli/shadbala/`
