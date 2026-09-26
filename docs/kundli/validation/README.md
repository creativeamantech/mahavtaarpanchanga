# Mahavtaar Kundali — Reference Corpus & Verification Documentation
**Phase 7: Precision, Determinism & Regression Certification**

## Executive Summary
This directory contains the formal certification, cross-engine validation matrix, discrepancy analysis, and precision budget for Mahavtaar Kundali.

Mahavtaar Kundali is grounded in Drik Ganita (observational spherical astronomy) unified with classical Maharishi Parashara and Sage Jaimini principles. The purpose of this phase is not to proclaim infallibility or declare any single external software "the only truth", but to rigorously establish:
1. Exact areas of agreement with Swiss Ephemeris, Astronomy Engine, and the Calendar Reform Committee.
2. Identifiable sources of variation (ephemeris, coordinate frames, ayanamsha, algorithms, rounding).
3. Measurable tolerances and error budgets.
4. Absolute numerical and representation-level determinism.

## Documentation Index
- [Reference Corpus Architecture](reference-corpus.md): 20 test case categories (A to T), schemas, and machine-readable corpora.
- [Precision Budget](precision-budget.md): Input, internal, and output precision definitions across all 6 core engines.
- [Astronomical Validation Report](astronomy-report.md): Multi-engine ephemeris comparison for Navagrahas.
- [Ayanamsha Validation Report](ayanamsha-report.md): Lahiri, Raman, KP, Sayana, and True Chitra evaluations.
- [Lagna & Cusps Report](lagna-report.md): Ascendant trigonometry, 1° parametric latitude sweep, whole-sign and Sripati houses.
- [Shodashavarga Report](varga-report.md): Boundary testing for all 16 divisional charts (D1..D60).
- [Shadbala & Bhava Bala Report](shadbala-report.md): Six-fold planetary strength, Naisargika invariant, Ishta/Kashta bounds.
- [Vimshottari Dasha Report](dasha-report.md): 5-tier nested timeline (Maha to Prana) and sum conservation.
- [Parashari Rules Report](rules-report.md): Pancha Mahapurusha, Raja, Dhana, and Viparita Yogas.
- [Jaimini Upadesha Report](jaimini-report.md): 7/8 Chara Karakas, Rahu inversion, Arudha exceptions, and Rashi Drishti.
- [Timezone & DST Report](timezone-report.md): Fractional timezones (+5:30, +5:45, +12:45) and daylight saving shifts.
- [Historical Charts Report](historical-report.md): Verification of 1947 Indian Independence, Swami Vivekananda, and Dr. B.V. Raman.
- [Discrepancy Taxonomy & Classification](discrepancies.md): 13-category root-cause taxonomy.

## Certification Language Standard
In compliance with strict engineering integrity, Mahavtaar Kundali avoids marketing superlatives ("100% accurate", "astronomically perfect"). All comparisons are classified strictly as:
- `MATCH`: Differences below machine epsilon or identical integer mappings.
- `WITHIN_TOLERANCE`: Deviations within the established precision budget.
- `CONVENTION_DIFFERENCE`: Well-documented divergence due to classical school/tradition.
- `REFERENCE_REQUIRED`: Calculation lacking authoritative public ephemeris benchmark.
- `UNRESOLVED`: Discrepancy under ongoing investigation.
