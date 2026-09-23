# Canonical Timeline Model & Domain Entities

## 1. Domain Entities

Located in `src/kundali/dasha/types/DashaTypes.ts`:

### `DashaPeriod`
The fundamental atomic representation of a temporal planetary span:
```typescript
export interface DashaPeriod {
  readonly id: string;               // e.g., "Jupiter-Saturn-Mercury"
  readonly level: DashaLevel;        // 1=Mahadasha .. 5=Prana
  readonly lord: string;             // Canonical planet or rashi name
  readonly lordNameHi: string;       // Devanagari Hindi designation
  readonly lordNameSa: string;       // Classical Sanskrit designation
  readonly startTimestampMs: number; // Absolute UTC epoch millisecond
  readonly endTimestampMs: number;   // Absolute UTC epoch millisecond
  readonly startDateIso: string;     // YYYY-MM-DD UTC
  readonly endDateIso: string;       // YYYY-MM-DD UTC
  readonly durationYears: number;    // Proportional fractional years
  readonly durationDays: number;     // Approximate calendar days
  readonly isCurrent?: boolean;      // True if evaluation timestamp is in span
  readonly children?: DashaPeriod[]; // Sub-periods (e.g. Antardashas)
}
```

### `BirthDashaBalance` (दशा भुक्त / भोग्य शेष)
Details the exact fractional state of the birth nakshatra:
```typescript
export interface BirthDashaBalance {
  readonly lord: string;
  readonly lordNameHi: string;
  readonly lordNameSa: string;
  readonly nakshatraIndex: number;     // 0 to 26
  readonly nakshatraNameEn: string;
  readonly nakshatraNameHi: string;
  readonly pada: number;              // 1 to 4
  readonly passedArcDeg: number;      // Degrees traversed in Nakshatra
  readonly remainingArcDeg: number;   // Degrees remaining to traverse
  readonly elapsedFraction: number;   // Passed / 13°20'
  readonly remainingFraction: number; // Remaining / 13°20'
  readonly remainingYearsTotal: number;
  readonly years: number;
  readonly months: number;
  readonly days: number;
}
```

### `DashaTimeline`
The comprehensive container returned by an engine calculation:
```typescript
export interface DashaTimeline {
  readonly system: DashaSystem;
  readonly convention: YearLengthConvention;
  readonly totalCycleYears: number;
  readonly birthTimestampMs: number;
  readonly evaluationTimestampMs: number;
  readonly balanceAtBirth: BirthDashaBalance;
  readonly periods: DashaPeriod[];
  readonly currentPeriods: ActiveDashaPeriods;
}
```

---

## 2. Invariant Requirements on `DashaPeriod`

1. **Temporal Order**: For any period $P$, $P.\text{startTimestampMs} < P.\text{endTimestampMs}$.
2. **Contiguity**: For sequential sibling periods $P_i$ and $P_{i+1}$, $P_i.\text{endTimestampMs} \equiv P_{i+1}.\text{startTimestampMs}$.
3. **Hierarchy Bounds**: For parent $P$ and child array $C_1 \dots C_k$:
   - $C_1.\text{startTimestampMs} \equiv P.\text{startTimestampMs}$
   - $C_k.\text{endTimestampMs} \equiv P.\text{endTimestampMs}$
   - $\sum_{j=1}^k (C_j.\text{endTimestampMs} - C_j.\text{startTimestampMs}) \equiv P.\text{endTimestampMs} - P.\text{startTimestampMs}$.
