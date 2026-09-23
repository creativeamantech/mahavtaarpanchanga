# Validation & Testing Strategy for Shadbala

## 1. Unit Testing Strategy
Every individual Bala sub-component is isolated into its own file with dedicated pure functions and test vectors:
- `NaisargikaBala`: Fixed array sum = 240.0 Virupas, 4.0 Rupas. Individual values match exact 7th multiples.
- `SthanaBala`: Exaltation at Aries 10° gives 60.0 Virupas for Sun; Debilitation at Libra 10° gives 0.0 Virupas.
- `DigBala`: Jupiter at Lagna gives 60.0 Virupas; at 7th cusp gives 0.0 Virupas.
- `KalaBala`: Day noon gives maximum Diurnal strength to Sun/Jupiter/Venus; Midnight gives maximum to Moon/Mars/Saturn.
- `CheshtaBala`: Retrograde planets receive 60.0 Virupas; Stationary receive 15.0 Virupas. Sun inherits Ayana Bala. Moon inherits Paksha Bala.
- `DrikBala`: 7th aspect ($180^\circ$) gives 60 Virupas raw drishti; $0^\circ$ gives 0 Virupas.
- `IshtaKashtaPhala`: Exact geometric root formulas verified against classical example charts.
- `BhavaBala`: 12 houses evaluated with Bhavadhipati, Dig, and Drishti contributions.

## 2. Invariance & Boundary Conditions
- Continuous angles normalized to $[0, 360^\circ)$.
- Extreme boundaries: $0^\circ, 30^\circ, 60^\circ, 90^\circ, 120^\circ, 150^\circ, 180^\circ, 210^\circ, 240^\circ, 270^\circ, 300^\circ$.
- Full Moon vs. New Moon elongation boundaries ($0^\circ$ vs $180^\circ$).
- Retrograde speed sign inversion boundary ($v < 0$ vs $v > 0$).
- Deterministic calculation invariance: Calculating twice for the same birth context produces bit-identical floating-point output.
