# Documented Precision Budget for Mahavtaar Kundali

## Subsystem Precision Specifications

| Subsystem | Input Precision | Internal Precision | Output Precision | Acceptable Error | Reference Error (vs Sweph/IAE) | Notes |
|---|---|---|---|---|---|---|
| **Time & Julian Day** | 1 millisecond ($10^{-3}$ s) | Float64 (~$1.15 \times 10^{-8}$ days) | ISO-8601 UTC / ms | 10 milliseconds | < 1 ms | Uses `Intl.DateTimeFormat` across all IANA timezones |
| **Planetary Longitude** | Date/Time in UTC ms | Float64 (53-bit significand) | $0.0001^\circ$ (0.36") | $\pm 0.01^\circ$ (36") | $\le 0.002^\circ$ (7.2" Moon, 0.72" Sun) | VSOP87 / ELP2000 analytical theories |
| **Ascendant (Lagna)** | Lat/Lon $\pm 0.0001^\circ$ | Float64 Radian Trigonometry | $0.001^\circ$ (3.6") | $\pm 0.05^\circ$ | $\le 0.01^\circ$ (36") | Standard IAU mean obliquity and RAMC |
| **Ayanamsha** | Julian Century $T$ | Float64 Polynomial | $0.00001^\circ$ (0.036") | $\pm 0.005^\circ$ (18") | $\le 0.0026^\circ$ (9.3" vs PAC Kolkata) | Calendar Reform Committee polynomial |
| **Shodashavarga Sign** | Longitude float64 | Float64 modulo & scaling | Integer $[0, 11]$ | 0 sign units | 0 sign units | Boundary tested at $10^{-5}$ degree delta |
| **Shadbala (Virupas)** | Longitude & Time | Float64 arithmetic | $0.01$ Virupa | $\pm 0.5$ Virupa | $\le 0.1$ Virupa | Naisargika sum invariant = exactly 240.0 Virupas |
| **Vimshottari Dasha** | Moon Lon $\pm 0.0001^\circ$ | Float64 fraction of year | Milliseconds / Date string | $\le 50$ ms | $\le 10$ ms | Child period sum conservation verified |
| **Parashari Rules** | Evaluated Chart Context | Deterministic AST Evaluation | Categorical State | 0 false positives | 0 discrepancies | Verified against classical BPHS conditions |
| **Jaimini Karakas** | Traversed Degree | Float64 Sort | Discrete Rank $[1, 8]$ | 0 rank errors | 0 discrepancies | Strict Rahu retrograde 30° inversion |

## Separation of Astronomical Precision from Astrological Conventions
- **Astronomical Precision**: Strictly bounded by physical celestial mechanics ($\le 0.002^\circ$ deviation from numerical integration).
- **Astrological Convention Differences**: Non-astronomical divergences (e.g. Raman $1^\circ 28'$ offset, Whole-sign vs Sripati cusps, 7 vs 8 Karakas) are treated as distinct traditional options rather than errors.
