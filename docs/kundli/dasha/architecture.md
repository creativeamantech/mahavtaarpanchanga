# Mahavtaar Dasha Engine — Architecture & Contracts

## 1. Architectural Philosophy

The Mahavtaar Dasha computational subsystem is built around four guiding principles:

1. **Separation of Astronomy and Chronology**:
   Astronomical positions (sidereal longitudes, ayanamsha, lagna) are calculated upstream by `AstronomicalCore`. The Dasha Engine receives pristine domain numbers (such as Moon's sidereal longitude and UTC birth epoch in milliseconds) and executes chronological mechanics independently.

2. **Hierarchical Period Tree with On-Demand Expansion**:
   A full 5-tier nested tree produces $9 \times 9 \times 9 \times 9 \times 9 = 59,049$ nodes if fully instantiated eagerly. The Mahavtaar engine computes Levels 1, 2, and 3 by default, and exposes `getNestedPeriods(parent, targetLevel)` to dynamically unfold Levels 4 (Sookshma) and 5 (Prana) on demand in $O(1)$ time.

3. **Pluggable Adapter Model**:
   Vedic astrology comprises both Nakshatra-based systems (Vimshottari, Ashtottari, Shodashottari, Dvadashottari, Panchottari, Shatabdika, Chaturashiti Sama, Dwisaptati Sama, Shashtihayani, Shat-trimshat Sama / Yogini) and Rashi-based systems (Jaimini Chara, Sthira, Narayana, Manduka, Trikona, Kaalchakra). All engines implement `IDashaSystemAdapter` and register with `DashaEngine`.

4. **Zero-Drift Millisecond Conservation**:
   All interval bounds are converted to absolute integer epoch timestamps (`startTimestampMs`, `endTimestampMs`). Floating-point year calculations are strictly normalized such that the sum of child durations equals the parent duration to the exact millisecond.

---

## 2. Core Contracts & Types

### `IDashaSystemAdapter`
Located in `src/kundali/dasha/contracts/IDashaSystemAdapter.ts`:
```typescript
export interface IDashaSystemAdapter {
  readonly systemType: DashaSystem;
  readonly metadata: RepositoryMetadata;
  readonly totalCycleYears: number;

  calculateBirthBalance(longitudeDeg: number): BirthDashaBalance;
  calculateTimeline(context: DashaContext): DashaTimeline;
  getNestedPeriods(parent: DashaPeriod, targetLevel: DashaLevel): DashaPeriod[];
  getActivePeriodsAt(timeline: DashaTimeline, targetTimestampMs: number): ActiveDashaPeriods;
}
```

### `DashaEngine` Registry
Located in `src/kundali/dasha/DashaEngine.ts`:
- Acts as a unified facade for multi-system registration and retrieval.
- Implements legacy `IDashaEngine` contract for backward compatibility.
- Exposes `DashaEngine.registerAdapter()` for adding non-Vimshottari systems without touching legacy consumers.

---

## 3. Data Flow Diagram

```
Moon Sidereal Longitude (°), Birth UTC Epoch (ms)
                      │
                      ▼
        ┌───────────────────────────┐
        │  VimshottariDashaEngine   │
        └─────────────┬─────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌─────────────────────────┐
│ Calculate Birth  │      │ Determine 9 Mahadasha   │
│ Balance (भोग्य)  │      │ Windows (120y Cycle)    │
└──────────────────┘      └────────────┬────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │ Recursive Sub-Period    │
                          │ Allocation (Levels 2–5) │
                          │ Integer Milliseconds    │
                          └────────────┬────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │ Active Period Locator   │
                          │ (Mahadasha, Antar,      │
                          │  Pratyantar, Sookshma)  │
                          └────────────┬────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │ Full DashaTimeline DTO  │
                          └─────────────────────────┘
```
