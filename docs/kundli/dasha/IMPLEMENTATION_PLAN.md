# Pre-Implementation Audit & Phase 4 Implementation Plan: Advanced Dasha Engine & Multi-Tier Timeline Architecture

## 1. Executive Summary & Audit of Existing Implementation

### 1.1 Existing Architecture
Currently, the codebase contains:
- **Legacy Inline Implementation (`src/lib/kundliEngine.ts`, lines 1089–1168)**:
  - Computes Vimshottari Mahadashas and Antardashas inline inside `computeFullKundli()`.
  - Uses `VIMSHOTTARI_LORDS` mapping 9 grahas to their classical planetary periods:
    - Ketu (7y), Venus (20y), Sun (6y), Moon (10y), Mars (7y), Rahu (18y), Jupiter (16y), Saturn (19y), Mercury (17y). Total = 120 years.
  - Calculates birth balance via:
    $$\text{arcPerNak} = 360^\circ / 27 = 13^\circ 20' = 13.33333333^\circ$$
    $$\text{passedInNak} = \lambda_{\text{Moon}} \pmod{\text{arcPerNak}}$$
    $$\text{remInNak} = \text{arcPerNak} - \text{passedInNak}$$
    $$\text{remFraction} = \frac{\text{remInNak}}{\text{arcPerNak}}$$
    $$\text{balanceYearsTotal} = \text{startLord.years} \times \text{remFraction}$$
  - Converts years to integer years, months (floor of remainder $\times 12$), days (round of remainder $\times 30$).
  - Year duration convention: $365.2425 \times 86400 \times 1000 = 31,556,952,000\text{ ms}$ (mean Gregorian/tropical solar year).
  - Calculates Level 1 (Mahadasha, 9 periods) and Level 2 (Antardasha, 9 sub-periods per Mahadasha).
  - Emits:
    ```ts
    vimshottari: {
      balanceAtBirth: { lord: string; years: number; months: number; days: number };
      dashas: VimshottariMahadasha[];
      currentMahadasha?: VimshottariMahadasha;
      currentAntardasha?: VimshottariAntardasha;
    }
    ```
- **Existing Draft Contract (`src/kundali/contracts/IDashaEngine.ts`)**:
  - Outlines `DashaSystemType`, `DashaSpan`, `PratyantardashaSpan`, `AntardashaSpan`, `MahadashaSpan`, `DashaTimelineResult`, `IDashaEngine`.
  - Level was capped at level 3 without formal Level 4 (Sookshma) and Level 5 (Prana).

### 1.2 Identified Architectural Gaps & Targets for Phase 4
1. **Multi-Tier Depth**: The legacy system only reaches Level 2 (Antardasha). Phase 4 must support 5 full tiers:
   - Level 1: Mahadasha (महादशा)
   - Level 2: Antardasha / Bhukti (अन्तर्दशा / भुक्ति)
   - Level 3: Pratyantardasha (प्रत्यन्तर्दशा)
   - Level 4: Sookshma Dasha (सूक्ष्मदशा)
   - Level 5: Prana Dasha (प्राणदशा)
2. **Deterministic Timestamp Invariant**:
   - $\sum_{j=1}^9 \Delta t_{\text{child}, j} = \Delta t_{\text{parent}}$ must hold strictly at every level with zero floating point drift.
3. **Pluggable Architecture (`IDashaSystemAdapter`)**:
   - Establish clean separation between Parashari Nakshatra Dashas (Vimshottari, Ashtottari, Yogini, etc.) and Jaimini Rashi Dashas (Chara, Narayana, Shoola, etc.).
4. **Timezone & Temporal Safety**:
   - Canonical UTC millisecond timestamps for all interval points.
   - Separate astronomical time from ISO/display representations.
5. **Exact Backward Compatibility**:
   - `computeFullKundli().vimshottari` must maintain 100% binary/structural compatibility with existing UI components (`KundliView.tsx`).

---

## 2. Plan of Execution

1. **Canonical Domain Types (`src/kundali/dasha/types/DashaTypes.ts`)**:
   - `DashaSystem`, `DashaLevel` (1 | 2 | 3 | 4 | 5), `DashaPeriod`, `DashaTimeline`, `DashaLord`, `DashaContext`, `DashaYearConvention`.
2. **Extensible System Adapter Contract (`src/kundali/dasha/contracts/IDashaSystemAdapter.ts`)**:
   - Defines methods: `calculateTimeline()`, `calculateBirthBalance()`, `getNestedPeriods()`.
3. **Vimshottari Engine Implementation (`src/kundali/dasha/vimshottari/`)**:
   - `VimshottariSequence.ts`: Canonical sequence of 9 Grahas, periods, Hindi/Sanskrit nomenclature, sub-lord order.
   - `VimshottariValidation.ts`: Invariant checkers verifying exact Nakshatra boundaries, duration sums, and order.
   - `VimshottariDashaEngine.ts`: Full implementation supporting 5 tiers, birth balance, deterministic millisecond preservation.
4. **Integration with `kundliEngine.ts`**:
   - Seamlessly delegate to `VimshottariDashaEngine` while preserving the exact `vimshottari` object structure in `KundliData`.
   - Provide extended 5-tier accessor for UI and downstream APIs.
5. **Verification & Testing**:
   - Unit tests covering 0°, 13°20', 359°->0° wraparound, exact boundaries, all 9 grahas, leap years, timezones.
   - Invariant tests for 5 tiers ($\sum \text{children} == \text{parent}$).
   - Performance benchmarks for 100, 1,000, and 5,000 charts.
6. **Documentation**:
   - Complete technical documentation in `docs/kundli/dasha/`.
