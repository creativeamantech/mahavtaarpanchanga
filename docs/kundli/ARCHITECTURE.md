# Mahavtaar Kundali Engine Architecture (Phase 1)

## 1. Executive Architecture Summary
Mahavtaar Kundali introduces a high-precision, classical Jyotisha computation engine designed to provide sub-arcsecond accuracy anchored on true celestial mechanics and Brihat Parashara Hora Shastra (BPHS) principles.

Prior to Phase 1, disparate modules across the codebase utilized varying ayanamsha approximations and distinct vector projections. Phase 1 establishes a single canonical astronomical core, an extensible Ayanamsha provider registry, a unified domain model, and clean engine boundary contracts for all upcoming classical calculations.

---

## 2. Directory Structure & Modular Boundaries

```
src/kundali/
├── astronomy/
│   ├── AstronomicalContext.ts     # Canonical astronomical coordinate definitions
│   ├── AstronomicalCore.ts        # Unified calculator (VSOP87/ELP2000 geocentric ecliptic vectors)
│   ├── AstronomicalCore.test.ts   # Vitest unit tests verifying accuracy
│   └── AyanamshaProvider.ts       # Extensible registry for Lahiri, Raman, KP, Sayana, True Chitra
├── core/
│   └── KundliDomainModel.ts       # Unified domain types (KundliInput, KundliContext, KundliState)
├── adapters/
│   └── RepositoryMetadata.ts      # Lineage, license, and shloka traceability for external algorithms
├── contracts/
│   ├── IVargaEngine.ts            # Contract for D1 through D60 divisional charts
│   ├── IShadbalaEngine.ts         # Contract for Sthana, Dig, Kala, Cheshta, Naisargika, Drik & Bhava Bala
│   ├── IDashaEngine.ts            # Contract for multi-tier Dasha timelines (Vimshottari, etc.)
│   └── IRuleEngine.ts             # Contract & registry for Yogas, Doshas, and Arishta evaluations
└── validation/
    └── KundliInputValidator.ts    # Rigorous date/coordinate/timezone bounds validation
```

---

## 3. The Canonical Astronomical Core (`AstronomicalCore`)

All astrological features in Mahavtaar Panchanga & Kundali share a single mathematical source of truth:

1. **Planetary Positions**:
   - Geocentric vectors are obtained via `Astronomy.GeoVector(body, t, true)` and transformed into true Ecliptic Longitude via `Astronomy.Ecliptic(geoVector).elon`.
   - Speeds are computed via 1-hour differential velocity vectors ($d\lambda/dt$) to accurately determine retrograde states (`isRetrograde`).
2. **Mean Lunar Nodes (Rahu & Ketu)**:
   - Evaluated via standard IAU polynomial for Mean Ascending Node:
     $$\Omega = 125.04452 - 1934.136261 \cdot T + 0.0020708 \cdot T^2 + \frac{T^3}{450000} \pmod{360}$$
   - Ketu is computed exactly as $\Omega + 180^\circ \pmod{360}$.
3. **Ascendant (Lagna)**:
   - Evaluated from Greenwich Sidereal Time (`gmstHours`), geographic longitude, and local obliquity ($\varepsilon$) to produce topocentric Nirayana Lagna degree, sign, nakshatra, and pada.

---

## 4. Ayanamsha Provider Pattern (`AyanamshaRegistry`)

The `AyanamshaRegistry` supports dynamic, pluggable ayanamsha computation. All systems implement `IAyanamshaProvider`:

- **Lahiri (Chitrapaksha)**: Standard Indian Calendar Reform Committee polynomial:
  $$\text{Ayanamsha} = 23.857092 + 1.3969713 \cdot T + 0.0003086 \cdot T^2 \quad (T = \text{centuries from J2000})$$
- **B.V. Raman**: Traditional sidereal baseline based on zero point at 397 CE ($\text{Lahiri} - 1.466667^\circ$).
- **Krishnamurti (KP)**: Krishnamurti Padhdhati standard offset ($\text{Lahiri} - 0.0980556^\circ$).
- **Sayana**: Tropical baseline ($0.0^\circ$).
- **True Chitra**: Ecliptic opposite of Alpha Virginis (Spica) at $180^\circ$.

---

## 5. Architectural Contracts (Upcoming Phases)

Phase 1 establishes rigorous TypeScript interfaces without pre-emptively implementing unverified logic:

- **`IVargaEngine`**: Defines standard transformations for all 16 Shodashavarga charts (D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60).
- **`IShadbalaEngine`**: Defines the six-fold planetary strength calculation (Positional, Directional, Temporal, Motional, Natural, Aspectual) and Bhava Bala.
- **`IDashaEngine`**: Defines hierarchical Dasha progression (Mahadasha, Antardasha, Pratyantardasha).
- **`IRuleEngine`**: Defines declarative rule registration for Raja Yogas, Dhana Yogas, Maha Purusha Yogas, and Doshas with shloka citations.

---

## 6. Backward Compatibility & Test Guarantees

- All existing tests (`tithiSwaraEngine.test.ts`, `panchangaTithiNakshatra.test.ts`, `horaEngine.test.ts`, `lagnaEngine.test.ts`) pass with zero regressions.
- No existing production engine was modified or broken during Phase 1.
- All new Phase 1 modules are 100% typed, validated, and covered by unit tests.
