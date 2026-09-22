# PHASE 1 VERIFICATION & AUDIT RECONCILIATION
**Project:** Mahavtaar Panchanga  
**Role:** Principal Software Architect, Computational Astronomy Engineer & Code Archaeologist  
**Timestamp:** 2026-09-22  
**Purpose:** Re-verify all findings, claims, and assumptions from Phase 0 against actual production source code before implementing Phase 1 architectural foundations.

---

### Claim 1: Ayanamsha Implementation in Codebase
- **Claim from Phase 0:** Codebase exclusively uses linear approximation $23.85 + \Delta Y \times 0.013969$ in `kundliEngine.ts`.
- **Source Files:** `/src/lib/kundliEngine.ts` (lines 388–402) vs `/src/lib/panchangaEngine.server.ts` (lines 665–692).
- **Actual Implementation:**
  - `kundliEngine.ts` defines `calculateAyanamsaDegrees` using $23.85 + \text{deltaYears} \times 0.013969$.
  - In contrast, `panchangaEngine.server.ts` defines `calculateAyanamsa(t, key)` using the standard IAU/IAE polynomial:
    $$23.857092 + 1.3969713 \cdot T + 0.0003086 \cdot T^2 \quad (T = t.ut / 36525.0)$$
    which matches the official Indian Calendar Reform Committee / Lahiri polynomial!
  - `gocharaEngine.ts` defines yet another local linear ayanamsa ($23.85 + (year - 2000) \times 0.01397$).
- **Status:** **DISCREPANCY CONFIRMED (MULTIPLE CONFLICTING SOURCES OF AYANAMSHA)**
- **Correction Required:** Establish a single unified `AyanamshaProvider` abstraction that unifies all calculations, providing exact polynomial and historical models with zero divergence between Panchanga, Kundali, and Gochar.

---

### Claim 2: Planetary Longitude Calculation (Ecliptic vs Equatorial Vector)
- **Claim from Phase 0:** `kundliEngine.ts` uses `Astronomy.GeoVector` and ecliptic longitude for planetary positions.
- **Source Files:** `/src/lib/kundliEngine.ts` (lines 420–448), `/src/lib/panchangaEngine.server.ts` (lines 1056–1076).
- **Actual Implementation:**
  - In `panchangaEngine.server.ts`, planets are calculated via `Astronomy.Ecliptic(Astronomy.GeoVector(body, t, true)).elon`. This correctly transforms the J2000 equatorial rectangular vector into ecliptic longitude.
  - In `kundliEngine.ts`, lines 421 and 447 use `Astronomy.SphereFromVector(vec).lon`. Because `GeoVector` outputs an equatorial vector, `SphereFromVector(vec).lon` represents **Right Ascension (RA)**, not Ecliptic Longitude! There is a $1^\circ \text{ to } 2^\circ$ difference between RA and Ecliptic Longitude depending on obliquity and latitude.
  - Furthermore, Sun in `kundliEngine.ts` uses `sunPos.elong`, whereas in `panchangaEngine.server.ts` it uses `Astronomy.SunPosition(t).elon`.
- **Status:** **CRITICAL ARCHITECTURAL DEFECT DISCOVERED IN KUNDLIENGINE**
- **Correction Required:** The canonical astronomical core must use `Astronomy.Ecliptic(Astronomy.GeoVector(body, t, true)).elon` for true geocentric ecliptic longitude. In Phase 1, the new `AstronomicalContext` will provide the single source of truth for both celestial coordinates (Ecliptic Longitude, Latitude, Distance, Speed) and equatorial coordinates (RA, Dec).

---

### Claim 3: Rahu & Ketu Calculation (Osculating vs Mean Node)
- **Claim from Phase 0:** Codebase uses `Astronomy.MoonNode` for mean lunar node.
- **Source Files:** `/src/lib/kundliEngine.ts` (lines 427–430), `/src/lib/panchangaEngine.server.ts` (lines 1072–1075), `/src/lib/gocharaEngine.ts` (line 114).
- **Actual Implementation:**
  - `kundliEngine.ts` and `panchangaEngine.server.ts` calculate Rahu using the standard IAU polynomial for Mean Ascending Node:
    $$125.04452 - 1934.136261 \cdot T + 0.0020708 \cdot T^2 + \frac{T^3}{450000} \pmod{360}$$
  - `gocharaEngine.ts` calls `Astronomy.MoonNode(transitDate)`.
  - Both compute the mean node, but via two different methods.
- **Status:** **DISCREPANCY DOCUMENTED**
- **Correction Required:** Standardize on canonical Mean Node and provide True Node option in the unified Astronomical Core.

---

### Claim 4: Ascendant (Lagna) Calculation
- **Claim from Phase 0:** Lagna is computed via spherical trigonometry from LAST and geographic coordinates.
- **Source Files:** `/src/lib/kundliEngine.ts` (lines 404–411), `/src/lib/lagnaEngine.server.ts` (lines 66–98).
- **Actual Implementation:**
  - Both compute RAMC from Greenwich Sidereal Time (`Astronomy.SiderealTime(t) * 15 + lon`).
  - Both apply: $\tan(\lambda) = \frac{\cos(\text{RAMC})}{-\sin(\varepsilon)\tan(\phi) - \cos(\varepsilon)\sin(\text{RAMC})}$.
  - The implementation is mathematically sound and consistent across files.
- **Status:** **VERIFIED**
- **Correction Required:** Centralize into canonical `LagnaCalculator` to prevent duplicated math.

---

### Claim 5: Test Suite State
- **Claim from Phase 0:** Tests exist and are runnable.
- **Source Files:** `/src/horaEngine.test.ts`, `/src/lagnaEngine.test.ts`, `/src/panchangaTithiNakshatra.test.ts`, `/tests/tithiSwaraEngine.test.ts`.
- **Actual Implementation:**
  - `npm test` script was missing from `package.json`.
  - Existing tests in `src/*.test.ts` imported from `"bun:test"` which failed under Node/Vitest.
  - `vitest` is installed in `devDependencies`.
- **Status:** **NEEDS BASELINE FIX**
- **Correction Required:** Add standard `"test": "vitest run"` script and ensure cross-runner compatibility so continuous automated regression testing functions smoothly.

---

### Summary of Audit Re-Verification
The Phase 0 discovery correctly identified the modules, but direct source code verification revealed **three parallel implementations of Ayanamsha** and **a vector coordinate projection discrepancy in `kundliEngine.ts`**. Phase 1's mandate—establishing ONE canonical astronomical core and ONE ayanamsha abstraction—is not just good architecture; it directly resolves core computational divergence across the app.
