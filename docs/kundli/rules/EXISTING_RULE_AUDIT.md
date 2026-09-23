# Existing Rule & Yoga Audit (Phase 5 Pre-Implementation)

## Overview
This audit maps all astrological combinations, yogas, and doshas currently evaluated in the codebase (primarily in `src/lib/kundliEngine.ts`) prior to the implementation of the declarative Phase 5 Rule Engine.

---

## 1. Inventory of Existing Rules

### Rule 1: Gajakesari Yoga (गजकेसरी योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1350–1365)
- **Current Formula**: `((jupSign - moonSign + 12) % 12) + 1` in `[1, 4, 7, 10]`
- **Classical Source**: Brihat Parashara Hora Shastra (BPHS), Adhyaya 36, Shlokas 3–4; Phaladeepika, Adhyaya 6, Shloka 14.
- **Inputs**: Moon sidereal longitude (sign index), Jupiter sidereal longitude (sign index).
- **Output**: `present: boolean`, `nameEn`, `nameHi`, `descriptionEn`, `descriptionHi`.
- **Exceptions / Cancellations in Legacy**: None implemented (ignores debilitation, combustion, or malefic aspects).
- **Test Coverage**: Tested implicitly via `computeFullKundli` integration tests.
- **Migration Status**: **MIGRATED & ENHANCED**. In the new Rule Engine, Gajakesari evaluates Jupiter in Kendra from Moon, verifies planetary dignity, checks combustion, and scores strength factors.

---

### Rule 2: Budhaditya Yoga (बुधादित्य योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1367–1381)
- **Current Formula**: `sunObj.signIndex === mercObj.signIndex`
- **Classical Source**: Saravali, Adhyaya 31, Shloka 1; Brihat Jataka, Adhyaya 14.
- **Inputs**: Sun sign index, Mercury sign index.
- **Output**: `present: boolean`, description strings.
- **Exceptions / Cancellations in Legacy**: None implemented (combustion within 3°–5° or debilitation in Pisces not factored).
- **Test Coverage**: Implicit integration.
- **Migration Status**: **MIGRATED & ENHANCED**. Evaluates conjunction arc degrees, checks deep combustion (combust within $3^\circ$), and handles sign placement.

---

### Rule 3: Ruchaka Mahapurusha Yoga (रुचक महापुरुष योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1383–1395)
- **Current Formula**: `mars.dignity === 'exalted' || (mars.dignity === 'own' && [1, 4, 7, 10].includes(mars.houseD1))`
- **Classical Source**: BPHS, Adhyaya 75, Shlokas 1–5; Phaladeepika, Adhyaya 6, Shlokas 1–4.
- **Inputs**: Mars dignity (`own`, `exalted`), Mars house from Lagna (`houseD1`).
- **Output**: `present: true`, descriptive text.
- **Exceptions / Cancellations in Legacy**: Partial bug in legacy: if Mars was exalted anywhere (e.g. 8th house), it flagged true without checking if house was Kendra!
- **Test Coverage**: Partial.
- **Migration Status**: **MIGRATED & CORRECTED**. Enforces both Kendra placement (1, 4, 7, 10) AND dignity (Aries/Scorpio/Capricorn) strictly as mandated by BPHS.

---

### Rule 4: Hamsa Mahapurusha Yoga (हंस महापुरुष योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1397–1408)
- **Current Formula**: `jup.dignity === 'exalted' || (jup.dignity === 'own' && [1, 4, 7, 10].includes(jup.houseD1))`
- **Classical Source**: BPHS, Adhyaya 75, Shlokas 6–10; Saravali, Adhyaya 35.
- **Inputs**: Jupiter dignity (`own`, `exalted`), house from Lagna (`houseD1`).
- **Output**: `present: true`, descriptive text.
- **Exceptions / Cancellations in Legacy**: Same as Ruchaka (exalted check skipped Kendra check).
- **Test Coverage**: Partial.
- **Migration Status**: **MIGRATED & CORRECTED**. Strict Kendra (1, 4, 7, 10) + Sagittarius/Pisces/Cancer sign placement.

---

### Rule 5: Malavya Mahapurusha Yoga (मालव्य महापुरुष योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1410–1423)
- **Current Formula**: `venus.dignity === 'exalted' || (venus.dignity === 'own' && [1, 4, 7, 10].includes(venus.houseD1))`
- **Classical Source**: BPHS, Adhyaya 75, Shlokas 11–15; Phaladeepika, Adhyaya 6.
- **Inputs**: Venus dignity, house from Lagna.
- **Output**: `present: true`, descriptive text.
- **Exceptions / Cancellations in Legacy**: Same legacy bug for exalted placement outside Kendra.
- **Test Coverage**: Partial.
- **Migration Status**: **MIGRATED & CORRECTED**. Strict Kendra (1, 4, 7, 10) + Taurus/Libra/Pisces sign placement.

---

### Rule 6: Shasha Mahapurusha Yoga (शश महापुरुष योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1425–1438)
- **Current Formula**: `saturn.dignity === 'exalted' || (saturn.dignity === 'own' && [1, 4, 7, 10].includes(saturn.houseD1))`
- **Classical Source**: BPHS, Adhyaya 75, Shlokas 16–20; Saravali, Adhyaya 35.
- **Inputs**: Saturn dignity, house from Lagna.
- **Output**: `present: true`, descriptive text.
- **Exceptions / Cancellations in Legacy**: Same legacy bug.
- **Test Coverage**: Partial.
- **Migration Status**: **MIGRATED & CORRECTED**. Strict Kendra (1, 4, 7, 10) + Capricorn/Aquarius/Libra sign placement.

---

### Rule 7: Bhadra Mahapurusha Yoga (भद्र महापुरुष योग)
- **Current File**: None (omitted in legacy code).
- **Current Formula**: Missing in legacy inline engine.
- **Classical Source**: BPHS, Adhyaya 75, Shlokas 21–25.
- **Inputs**: Mercury dignity (Gemini/Virgo) + Kendra (1, 4, 7, 10).
- **Output**: Canonical Pancha Mahapurusha evaluation.
- **Migration Status**: **NEW IMPLEMENTATION**. Added to complete the classical 5 Mahapurusha set.

---

### Rule 8: Chandra-Mangala Yoga (चन्द्र-मंगल योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1440–1451)
- **Current Formula**: `moon.signIndex === mars.signIndex`
- **Classical Source**: Saravali, Adhyaya 15, Shloka 20; BPHS, Adhyaya 36.
- **Inputs**: Moon sign index, Mars sign index.
- **Output**: `present: true`.
- **Exceptions / Cancellations in Legacy**: None.
- **Migration Status**: **MIGRATED**. Checks sign conjunction or mutual 7th aspect, evaluated with dignity.

---

### Rule 9: Guru-Chandal Yoga (गुरु-चांडाल योग)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1453–1464)
- **Current Formula**: `jup.signIndex === rahu.signIndex`
- **Classical Source**: Classical Parashari commentators / Jataka Parijata.
- **Inputs**: Jupiter sign index, Rahu sign index.
- **Output**: `type: "inauspicious"`, descriptive text.
- **Exceptions / Cancellations in Legacy**: None (ignores sign lords, Jupiter strength, or benefic aspects).
- **Migration Status**: **MIGRATED**. Evaluates exact conjunction degrees, Jupiter Shadbala mitigation, and dispositor strength.

---

### Rule 10: Manglik / Kuja Dosha (मांगलिक दोष)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1155–1200, 1285–1308)
- **Current Formula**: Mars in 1, 2, 4, 7, 8, 12 from Lagna or Moon.
- **Exceptions**: Mars in Aries 1st, Scorpio 4th, Capricorn 7th, or exalted anywhere.
- **Classical Source**: Brihat Parashara Hora Shastra, Muhurta Chintamani, Brihat Daivajna Ranjana.
- **Inputs**: Mars house from Lagna and Moon, Mars sign index, Mars dignity.
- **Output**: `isManglik`, `severity`, `fromLagna`, `fromMoon`, `isCancelled`, `cancellationReasonEn`, `cancellationReasonHi`.
- **Test Coverage**: Tested in `computeFullKundli`.
- **Migration Status**: **PRESERVED & AUDITED**. Retained in `kundliEngine.ts` output structure to protect UI contracts, while represented declaratively in Rule Engine.

---

### Rule 11: Kalsarpa Dosha (कालसर्प योग / दोष)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1191–1231, 1309–1321)
- **Current Formula**: All 7 classical planets between Rahu and Ketu or Ketu and Rahu.
- **Classical Source**: Post-classical tradition (omitted in Brihat Jataka and original BPHS manuscripts, codified in later regional traditions like Agni Purana commentary and modern 20th-century compendiums).
- **Inputs**: Planetary longitudes, Rahu longitude, Ketu longitude.
- **Output**: `present`, `typeEn`, `typeHi` (12 types: Anant, Kulik, Vasuki, etc.).
- **Test Coverage**: Covered in integration tests.
- **Migration Status**: **PRESERVED & CLASSIFIED**. Explicitly documented as a traditional/regional construct with exact provenance.

---

### Rule 12: Sade Sati (शनि साढ़े साती)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1232–1265, 1322–1332)
- **Current Formula**: Transiting Saturn in 12th, 1st, 2nd, 4th (Kantaka), or 8th (Ashtama) from Natal Moon.
- **Classical Source**: Gochara Phala in Phaladeepika, Adhyaya 26; Varahamihira's Brihat Samhita.
- **Inputs**: Transiting Saturn sidereal position, Natal Moon sign.
- **Output**: `status` ("rising", "peak", "setting", "kantaka", "ashtama", "none").
- **Test Coverage**: Tested in `computeFullKundli`.
- **Migration Status**: **PRESERVED & CLASSIFIED**. Gochara transit state isolated from natal yogas.

---

### Rule 13: Gandanta (गंडान्त दोष)
- **Current File**: `src/lib/kundliEngine.ts` (lines 1266–1284, 1333–1344)
- **Current Formula**: Moon at water-fire junctions ($0^\circ, 120^\circ, 240^\circ, 360^\circ \pm 0.4444^\circ$) and Abhukta Moola ($240^\circ - 1.3333^\circ$ to $240^\circ + 1.7777^\circ$).
- **Classical Source**: BPHS, Adhyaya 9 (गण्डान्तदोषः); Narada Samhita.
- **Inputs**: Moon sidereal longitude.
- **Output**: `isGandanta`, `type`, descriptions.
- **Test Coverage**: Tested in `computeFullKundli`.
- **Migration Status**: **PRESERVED & INTEGRATED**.
