# Discrepancy Classification & Root-Cause Taxonomy

Every numerical divergence or variation encountered across external engines, published tables, or classical texts is categorized according to this 13-class taxonomy:

```
┌─────────────────────────────────────────────────────────────┐
│              DISCREPANCY TAXONOMY (13 CLASSES)              │
├──────────────────────────────┬──────────────────────────────┤
│ 1. EPHEMERIS_DIFFERENCE      │ 8. DASHA_CONVENTION          │
│ 2. COORDINATE_FRAME_DIFF     │ 9. CLASSICAL_SOURCE_DIFF     │
│ 3. AYANAMSHA_DIFFERENCE      │ 10. ROUNDING                 │
│ 4. TIME_SCALE_DIFFERENCE     │ 11. FLOATING_POINT_EFFECT    │
│ 5. TIMEZONE_DIFFERENCE       │ 12. IMPLEMENTATION_BUG       │
│ 6. HOUSE_SYSTEM_DIFFERENCE   │ 13. UNKNOWN                  │
│ 7. VARGA_CONVENTION          │                              │
└──────────────────────────────┴──────────────────────────────┘
```

## Detailed Classification Definitions

### 1. EPHEMERIS_DIFFERENCE
Divergence in celestial coordinates arising from underlying ephemeris models:
- JPL DE431/440 (numerical integration) vs VSOP87 / ELP2000-82B (analytical theories) vs Surya Siddhantic mean motions.
- *Magnitude*: Planetary coordinates differ by $0.1''$ to $2''$; Lunar coordinates by up to $7''$.
- *Status*: Expected and within astronomical error budgets.

### 2. COORDINATE_FRAME_DIFFERENCE
Differences between Geocentric Ecliptic of Date, J2000.0, Equatorial (RA/Dec), and Topocentric observer-centered coordinates.

### 3. AYANAMSHA_DIFFERENCE
Precessional reference variations (Lahiri vs Raman vs KP vs True Chitra).
- *Magnitude*: Up to $1^\circ 28'$ between Raman and Lahiri; ~6' between KP and Lahiri.

### 4. TIME_SCALE_DIFFERENCE
Variations arising from $\Delta T = \text{TT} - \text{UT1}$ corrections vs raw UTC.

### 5. TIMEZONE_DIFFERENCE
Discrepancies in historical local mean time (LMT), daylight saving rules, or fractional offsets.

### 6. HOUSE_SYSTEM_DIFFERENCE
Whole-sign (Vedic default) vs Sripati (midpoint cusps) vs Placidus / Porphyry.

### 7. VARGA_CONVENTION
Divergent classical schools for divisional charts (e.g. Parashari Hora vs Traditional Kalyanavarma Hora; Parashari Drekkana vs Jaimini Somnath Drekkana).

### 8. DASHA_CONVENTION
Solar year (365.2422 days) vs Savana year (360 tithis / 360 days) vs calendar year.

### 9. CLASSICAL_SOURCE_DIFFERENCE
Variations between *Brihat Parashara Hora Shastra*, *Brihat Jataka*, *Saravali*, and *Phaladeepika*.

### 10. ROUNDING
Display truncation (e.g. arcseconds rounded to arcminutes).

### 11. FLOATING_POINT_EFFECT
IEEE 754 float64 sub-micro-arcsecond representation limits ($\sim 10^{-15}$ degrees).

### 12. IMPLEMENTATION_BUG
Unintended algorithmic defect. Must be flagged immediately for correction.

### 13. UNKNOWN
Unresolved discrepancy lacking sufficient documentation or source attribution.
