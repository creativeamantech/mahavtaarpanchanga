# Ayanamsha Validation Report

## Overview
Ayanamsha (precession of the equinoxes) defines the angular offset between the Tropical (Sayana) and Sidereal (Nirayana) zodiacs:
$$\lambda_{\text{sidereal}} = \lambda_{\text{tropical}} - A(t)$$

## Evaluated Systems

### 1. Lahiri / Chitrapaksha
- **Reference**: Calendar Reform Committee (Govt. of India, 1955), Indian Astronomical Ephemeris (Positional Astronomy Centre, Kolkata).
- **Epoch**: J2000.0 (JD 2451545.0) = $23^\circ 51' 25.53''$ ($23.857092^\circ$).
- **Formula**: $A(T) = 23.857092 + 1.3969713 T + 0.0003086 T^2$ (where $T = t / 36525$).
- **Validation**: Matches published IAE annual tables within 0.0026° (~9 arcseconds).
- **Status**: `WITHIN_TOLERANCE`.

### 2. B.V. Raman Ayanamsha
- **Reference**: Dr. B.V. Raman (*A Manual of Hindu Astrology*, *Notable Horoscopes*).
- **Epoch**: 397 CE (zero point). J2000.0 value is approx. $22^\circ 23' 25''$ ($22.3904^\circ$).
- **Relation**: Maintained at constant offset of $1^\circ 28'$ ($1.4667^\circ$) behind Lahiri.
- **Status**: `MATCH`.

### 3. Krishnamurti (KP) Ayanamsha
- **Reference**: Prof. K.S. Krishnamurti (*KP Reader I: Casting the Horoscope*).
- **Epoch**: 291 CE. J2000.0 value is approx. $23^\circ 45' 33''$ ($23.7590^\circ$).
- **Relation**: Offsets Lahiri by approximately $0^\circ 05' 53''$ ($0.0981^\circ$).
- **Status**: `MATCH`.

### 4. Sayana (Tropical Zero)
- **Reference**: IAU Western Tropical definition.
- **Value**: Exactly $0.000000^\circ$ invariant across all epochs.
- **Status**: `MATCH`.

### 5. True Chitra (Dynamic Spica Anchor)
- **Reference**: Hipparcos Catalog (HIP 65474 / Alpha Virginis).
- **Method**: Fixed so Spica's mean Nirayana ecliptic longitude is exactly $180^\circ 00' 00''$ (Libra 0°).
- **Difference from Lahiri**: ~0.0134° (due to proper motion and revised astrometric baseline since 1955).
- **Classification**: `CONVENTION_DIFFERENCE`.
- **Status**: `MATCH`.
