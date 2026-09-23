# Mahavtaar Kundali — Dasha Engine & Multi-Tier Timeline Architecture (Phase 4)

## Overview
Phase 4 of the Mahavtaar Kundali core introduces a canonical, high-precision, multi-tier Dasha calculation engine. Rooted in classical **Brihat Parashara Hora Shastra (BPHS Adhyayas 46–50)**, this subsystem establishes a unified temporal framework supporting up to 5 nested tiers of planetary periods:

1. **Level 1 — Mahadasha (महादशा)**
2. **Level 2 — Antardasha / Bhukti (अन्तर्दशा / भुक्ति)**
3. **Level 3 — Pratyantardasha (प्रत्यन्तर्दशा)**
4. **Level 4 — Sookshma Dasha (सूक्ष्मदशा)**
5. **Level 5 — Prana Dasha (प्राणदशा)**

---

## Key Capabilities & Invariants

- **Zero-Drift Millisecond Arithmetic**: Eliminates recursive floating-point drift across nested tiers by enforcing integer-millisecond conservation ($\sum \Delta t_{\text{children}} \equiv \Delta t_{\text{parent}}$).
- **Exact Nakshatra Boundary Handling**: Supports exact $0^\circ$ Ashwini, $13^\circ 20'$ boundaries, 4-pada segmentation ($3^\circ 20'$ per pada), and $359.99^\circ \rightarrow 0^\circ$ Revati-to-Ashwini zodiac wraparound.
- **Pluggable Adapter Model**: Implements `IDashaSystemAdapter` allowing seamless future additions of Ashtottari, Yogini, Chara, Kaalchakra, and Narayana Dashas without touching core interfaces.
- **100% Backward Compatibility**: Directly integrates into existing Kundli generation pipelines without breaking legacy fields (`balanceAtBirth`, `dashas`, `currentMahadasha`, `currentAntardasha`).
- **High Throughput**: Capable of computing over 1,000 multi-tier charts in less than $350\text{ ms}$ (~$0.3\text{ ms}$ per chart).

---

## Directory Structure

```
docs/kundli/dasha/
├── README.md                 # System overview and entry point
├── architecture.md           # Architectural layers, contracts, and lifecycle
├── timeline-model.md         # Canonical temporal hierarchy & domain entities
├── vimshottari.md            # Parashari Vimshottari 120-year cycle specification
├── nested-periods.md         # Mathematical derivation of Levels 1–5
├── date-arithmetic.md        # Timezone safety, solar/savana conventions, leap years
├── sources.md                # Classical scriptural citations (BPHS, Phaladeepika)
├── validation.md             # Invariants, validation suites, and verification
├── future-dasha-systems.md   # Adapter blueprints (Ashtottari, Yogini, Chara, etc.)
├── known-conventions.md      # Year length conventions (Savana vs Gregorian solar)
└── IMPLEMENTATION_PLAN.md    # Pre-implementation audit and execution roadmap
```

---

## Verification Summary
- **Total Test Suite**: 88 unit and integration tests passing.
- **Dasha Specific Tests**: 21 tests covering exact boundary values, sequence invariants, 5-tier nested conservation, and high-throughput benchmarks.
- **Zero Lint / Type Errors**: 100% strict TypeScript and ESLint compliance.
