# Mahavtaar Kundali: Shodashavarga (Divisional Charts) Implementation Architecture

## 1. Executive Summary & Purpose

In classical Vedic astrology (Parashari Jyotisha), divisional charts (Vargas or Shodashavargas) provide high-resolution insights into specific dimensions of human karma and destiny. Brihat Parashara Hora Shastra (BPHS, Chapter 6: *Shodashavargadhyaya*) defines 16 core divisional charts.

This document details the architectural specification, classical sources, algorithmic formulations, boundary condition handling, and migration strategy for the **Mahavtaar Kundali Shodashavarga Engine** (`VargaEngine.ts`).

---

## 2. Pre-Implementation Audit & Existing State

### 2.1 Current Implementation Audit
- **Files Audited**:
  - `src/kundali/contracts/IVargaEngine.ts`: Defines `VargaType` ("D1" | "D2" | ... | "D60"), `VargaPlanetPosition`, `VargaChartResult`, and the `IVargaEngine` interface.
  - `src/kundali/core/KundliDomainModel.ts`: Canonical domain models (`KundliInput`, `KundliContext`, `GrahaState`, `BhavaInfo`, `RashiInfo`).
  - `src/kundali/astronomy/AstronomicalCore.ts`: Single source of astronomical calculations generating tropical and sidereal longitudes.
  - `src/kundali/astronomy/AyanamshaProvider.ts`: Exact Lahiri (Chitra Paksha), Raman, KP, etc. ayanamsha formulations.
  - `src/lib/kundliEngine.ts`: The legacy Kundali engine containing hardcoded calculations for:
    - `D1`: standard whole-sign bhava calculation.
    - `calculateNavamshaSignIndex(longitude: number)` (D9): Fire/Earth/Air/Water quadruplicity grouping.
    - `calculateDashamshaSignIndex(longitude: number)` (D10): Odd sign (sign itself + part), Even sign (sign + 8 + part).
  - `src/components/KundliChartRenderer.tsx`: SVG renderer for North and South Indian chart layouts, rendering `housesD1`, `housesD9`, `housesD10`, `housesChandra`, `housesSurya`, `housesChalit`.

### 2.2 Compatibility Requirements
1. **Zero Downtime / Zero Breakage**: The existing UI and legacy calls to `calculateNavamshaSignIndex` and `calculateDashamshaSignIndex` in `src/lib/kundliEngine.ts` must remain 100% functional.
2. **Canonical Data Pipeline**: The new engine must strictly consume `SiderealPosition` from `AstronomicalCore` and never duplicate astronomy calculations.
3. **Equivalence Verification**: The output of the new canonical engine for D1, D9, and D10 must be mathematically verified against the legacy engine to guarantee consistency.

---

## 3. Classical Source Verification & Algorithms Table

All formulas are based on **Brihat Parashara Hora Shastra (BPHS)** Chapter 6 (*Shodashavarga Adhyaya*):

| Varga | Traditional Name | Division ($N$) | Arc Span | Starting Sign Formula | Classical Reference | Primary Astrological Significance |
|---|---|---|---|---|---|---|
| **D1** | Rashi (राशि) | 1 | $30^\circ$ | Sign itself | BPHS 6.3-4 | Physical body, health, vitality, general destiny |
| **D2** | Hora (होरा) | 2 | $15^\circ$ | Odd: $0^\circ\text{-}15^\circ \rightarrow$ Sun (Leo), $15^\circ\text{-}30^\circ \rightarrow$ Moon (Cancer)<br>Even: $0^\circ\text{-}15^\circ \rightarrow$ Moon (Cancer), $15^\circ\text{-}30^\circ \rightarrow$ Sun (Leo) | BPHS 6.5-6 | Wealth, treasury, family prosperity, speech |
| **D3** | Drekkana (द्रेष्काण) | 3 | $10^\circ$ | Part 0: Sign itself ($+0$)<br>Part 1: 5th from it ($+4$)<br>Part 2: 9th from it ($+8$) | BPHS 6.7-8 | Siblings, courage, vitality, enterprise, co-borns |
| **D4** | Chaturthamsha (चतुर्थांश) | 4 | $7^\circ 30'$ | Kendra counting from sign: $+0, +3, +6, +9$ | BPHS 6.9-10 | Fixed assets, vehicles, land, property, fortune |
| **D7** | Saptamsha (सप्तांश) | 7 | $4^\circ 17' 08.57''$ | Odd signs: Count from sign itself ($+0$)<br>Even signs: Count from 7th sign ($+6$) | BPHS 6.11-12 | Children, grand-children, lineage, creative progeny |
| **D9** | Navamsha (नवांश) | 9 | $3^\circ 20'$ | Movable: From sign itself<br>Fixed: 9th from it ($+8$)<br>Dual: 5th from it ($+4$)<br>*(Equiv: Fire $\to$ Aries, Earth $\to$ Cap, Air $\to$ Libra, Water $\to$ Cancer)* | BPHS 6.13-14 | Dharma, spouse, inner potential, soul destiny |
| **D10** | Dashamsha (दशांश) | 10 | $3^\circ$ | Odd signs: Count from sign itself ($+0$)<br>Even signs: Count from 9th sign ($+8$) | BPHS 6.15-16 | Career, profession, status, honors, karma, achievements |
| **D12** | Dwadashamsha (द्वादशांश) | 12 | $2^\circ 30'$ | Count cyclically from sign itself ($+0, +1, \dots, +11$) | BPHS 6.17-18 | Parents, ancestral heritage, past-life lineage |
| **D16** | Shodashamsha (षोडशांश) | 16 | $1^\circ 52' 30''$ | Movable: Aries ($0$)<br>Fixed: Leo ($4$)<br>Dual: Sagittarius ($8$) | BPHS 6.19-20 | Conveyances, vehicles, mental ease, accidents, luxuries |
| **D20** | Vimshamsha (विंशांश) | 20 | $1^\circ 30'$ | Movable: Aries ($0$)<br>Fixed: Sagittarius ($8$)<br>Dual: Leo ($4$) | BPHS 6.21-22 | Spiritual progress, upasana, devotion, occult knowledge |
| **D24** | Chaturvimshamsha (चतुर्विंशांश) | 24 | $1^\circ 15'$ | Odd signs: Leo ($4$)<br>Even signs: Cancer ($3$) | BPHS 6.23-24 | Higher education, intellect, wisdom, skills, learning |
| **D27** | Saptavimshamsha (सप्तविंशांश) | 27 | $1^\circ 06' 40''$ | Fire: Aries ($0$)<br>Earth: Cancer ($3$)<br>Air: Libra ($6$)<br>Water: Capricorn ($9$) | BPHS 6.25-26 | Physical stamina, subconscious strength, vulnerabilities |
| **D30** | Trimshamsha (त्रिंशांश) | 30 (Unequal) | 5 Unequal Bounds | **Odd**: $0\text{-}5^\circ \to$ Mars (Aries: 0), $5\text{-}10^\circ \to$ Sat (Aquarius: 10), $10\text{-}18^\circ \to$ Jup (Sag: 8), $18\text{-}25^\circ \to$ Merc (Gemini: 2), $25\text{-}30^\circ \to$ Ven (Libra: 6)<br>**Even**: $0\text{-}5^\circ \to$ Ven (Taurus: 1), $5\text{-}12^\circ \to$ Merc (Virgo: 5), $12\text{-}20^\circ \to$ Jup (Pisces: 11), $20\text{-}25^\circ \to$ Sat (Cap: 9), $25\text{-}30^\circ \to$ Mars (Scorpio: 7) | BPHS 6.27-28 | Misfortunes, evils, enemies, chronic ailments, arishta |
| **D40** | Khavedamsha (खवेदांश) | 40 | $0^\circ 45'$ | Odd signs: Aries ($0$)<br>Even signs: Libra ($6$) | BPHS 6.29-30 | Auspicious & inauspicious events, maternal lineage |
| **D45** | Akshavedamsha (अक्षवेदांश) | 45 | $0^\circ 40'$ | Movable: Aries ($0$)<br>Fixed: Leo ($4$)<br>Dual: Sagittarius ($8$) | BPHS 6.31-32 | Character purity, moral conduct, general auspiciousness |
| **D60** | Shashtiamsha (षष्ट्यंश) | 60 | $0^\circ 30'$ | Count cyclically from sign itself ($+0, \dots, +59 \pmod{12}$). In addition, each part has a specific classical deity and benefic/malefic disposition. | BPHS 6.33-41 | Entire life, subtle karmic debts, past-life karma |

---

## 4. Boundary Condition Specifications

Floating point calculations at division borders must be handled deterministically:
1. **Modulo Normalization**: $\text{lon} \in [0, 360)$.
2. **Degree in Sign**: $\text{degInSign} = \text{lon} \pmod{30}$.
3. **Partition Index**:
   - For uniform divisions: $\text{part} = \lfloor \text{degInSign} / (30 / N) \rfloor$.
   - Bound clamping: $\text{part} = \min(\max(0, \text{part}), N - 1)$ to prevent edge anomalies at $29.999999999^\circ$.
4. **Degree Within Varga**:
   - $\text{arcSpan} = 30 / N$.
   - $\text{degWithinPart} = \text{degInSign} - \text{part} \times \text{arcSpan}$.
   - Rescaled to full sign: $\text{degreeInSign} = \frac{\text{degWithinPart}}{\text{arcSpan}} \times 30^\circ$.
5. **Exact Boundary Values**:
   - $0.0^\circ$: Belongs to part 0.
   - $30.0^\circ$: Roll-over to $0.0^\circ$ of the subsequent sign.

---

## 5. Architectural Pipeline

```
AstronomicalCore (astronomy-engine)
       │
       ▼
SiderealPosition (Nirayana Longitudes + Sidereal Lagna)
       │
       ▼
VargaEngine (Single Source of Truth for Divisional Calculations)
       │
       ├─ calculateVarga(varga, lagnaSiderealLon, planetSiderealLons)
       └─ calculateShodashavarga(lagnaSiderealLon, planetSiderealLons)
              │
              ▼
       Record<VargaType, VargaChartResult>
```

---

## 6. Migration & Verification Strategy

1. **Unit Testing**: 100% test coverage across all 16 charts with boundary test vectors ($0^\circ$, $15^\circ$, $29.999^\circ$, sign changes).
2. **Golden Vector Cross-Validation**: Compare against BPHS canonical examples and existing `calculateNavamshaSignIndex` and `calculateDashamshaSignIndex`.
3. **Backward Compatibility**: Existing functions in `kundliEngine.ts` can internally delegate to or cross-check with `VargaEngine`.
