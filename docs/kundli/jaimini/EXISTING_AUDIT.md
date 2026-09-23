# Jaimini Classical Astrology: Pre-Implementation Audit

**Date:** September 2026  
**Auditor:** Principal Jyotisha Software Architect & Computational Astrology Engineer  
**Status:** Audit Completed  

---

## 1. Executive Summary

This audit evaluates the codebase for prior Jaimini astrology calculations prior to implementing Phase 6 ("Jaimini Classical Astrology Engine"). The codebase primarily focuses on Parashari principles (Brihat Parashara Hora Shastra) across Shodashavarga, Shadbala, Bhava Bala, and Vimshottari Dasha.

Only a superficial 7-planet degree sort existed in `src/lib/kundliEngine.ts` (lines 868–885). Crucial Jaimini subsystems (Arudha Padas, Upapada, Karakamsha, Rashi Drishti, 7 vs 8 Karaka schemes, Tie handling, Chara Dasha) were absent or unformalized.

---

## 2. Inventory of Existing Code & Status

| Jaimini Component | Existing Location | Implementation Quality | Classical Fidelity | Migration / Action Needed |
| :--- | :--- | :--- | :--- | :--- |
| **7 Chara Karakas** | `src/lib/kundliEngine.ts` (868–885) | Naive `sort((a,b) => b.degreeInSign - a.degreeInSign)` on 7 planets | Incomplete: No tie-breaking, no arcsecond precision, hardcoded to 7 planets | Replace with canonical `CharaKarakaEngine` supporting both 7-Karaka and 8-Karaka models with tie-resolution. |
| **8 Chara Karakas** | None | Absent | N/A | Implement 8-karaka scheme with Rahu reverse degree calculation ($30^\circ - \text{deg}$). |
| **Arudha Lagna (AL)** | None | Absent | N/A | Implement universal `calculateArudhaPada` with classical 1st/7th house exception rules. |
| **Bhava Padas (A2–A12)**| None | Absent | N/A | Implement all 12 Arudha Padas. |
| **Upapada Lagna (UL)** | None | Absent | N/A | Implement Upapada (A12 / Gauna Pada) with lord, dispositor, and aspect metadata. |
| **Karakamsha** | None | Absent | N/A | Implement Karakamsha Lagna (Navamsha sign of Atmakaraka) vs D1 Karaka placement. |
| **Jaimini Rashi Drishti**| None | Absent | N/A | Implement dedicated `JaiminiRashiDrishtiEngine` (Movable, Fixed, Dual sign aspects). |
| **Jaimini Dasha (Chara)**| Enum in `IDashaEngine.ts` | Type definition only | N/A | Implement canonical `CharaDashaEngine` implementing `IJaiminiDashaAdapter`. |
| **Jaimini Yogas** | Enum in `RuleTypes.ts` | Enum definition only (`tradition: "Jaimini"`) | N/A | Register canonical Jaimini Yogas in separate Jaimini registry. |

---

## 3. Discrepancies & Architectural Gaps in Prior Code

1. **Precision & Arcsecond Resolution:**
   The legacy code compared `degreeInSign` as floating-point values without handling exact degree ties, arcminutes, or arcseconds.
2. **Karakas Missing:**
   Pitrikaraka (PiK) in the 8-karaka tradition was unrepresented.
3. **No Separation of Traditions:**
   Jaimini strings were injected directly onto Parashari planet objects without distinct domain types or provenance.
4. **Zero Arudha Logic:**
   Neither Arudha Lagna nor Upapada existed anywhere in the engine.
5. **No Sign Aspects (Rashi Drishti):**
   Existing aspect checks were strictly Parashari graha drishti (7th, special Mars/Jupiter/Saturn aspects). Jaimini Rashi Drishti was missing entirely.

---

## 4. Phase 6 Plan of Action

- Establish `src/kundali/jaimini/` domain directory.
- Model `JaiminiTypes.ts` strictly independent from Parashari structures.
- Implement `CharaKarakaEngine.ts` with configurable 7/8 karaka schemes, arcsecond tie handling, and Rahu reverse-longitude accounting.
- Implement `ArudhaEngine.ts` with classical exceptions (1st house $\to$ 10th house, 7th house $\to$ 4th house per Jaimini Sutra 1.1.30–31).
- Implement `UpapadaEngine.ts` and `KarakamshaEngine.ts`.
- Implement `JaiminiRashiDrishtiEngine.ts` covering all 12 signs with full unit test coverage.
- Implement `CharaDashaEngine.ts` with validated starting signs, direct/indirect order, and duration algorithms.
- Establish comprehensive documentation and golden test corpus.
