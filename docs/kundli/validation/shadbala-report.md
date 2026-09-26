# Shadbala & Bhava Bala Numerical Verification Report

## Units & Conversion Discipline
Classical Vedic astrology measures planetary and house strengths in **Virupas** (also called Shashtiamshas) and **Rupas**:
$$1 \text{ Rupa} = 60 \text{ Virupas}$$
Under no circumstances are Virupa and Rupa values compared directly without applying the 60.0 normalization factor.

## Verified Invariants

### 1. Naisargika Bala (Natural Inherent Strength) Conservation
By classical injunction (BPHS Adhyaya 27, Shloka 15), the natural inherent strength is constant and defined as:
- Sun: 60.0 Virupas (1.0 Rupa)
- Moon: 51.42857 Virupas ($\frac{6}{7} \times 60$)
- Venus: 42.85714 Virupas ($\frac{5}{7} \times 60$)
- Jupiter: 34.28571 Virupas ($\frac{4}{7} \times 60$)
- Mercury: 25.71428 Virupas ($\frac{3}{7} \times 60$)
- Mars: 17.14285 Virupas ($\frac{2}{7} \times 60$)
- Saturn: 8.57142 Virupas ($\frac{1}{7} \times 60$)

**Total Invariant**:
$$\sum_{i=1}^7 \text{Naisargika}(i) = 240.00000 \text{ Virupas} = 4.00000 \text{ Rupas}$$
*Test Status*: Verified to 5 decimal places.

### 2. Six-Fold Planetary Bala Bounds
1. **Sthana Bala** (Positional): Uchcha, Saptavargaja, Ojayugmarashi, Kendradi, Drekkana. All components $\ge 0$.
2. **Dig Bala** (Directional): Angular distance from point of zero strength. Range: $[0, 60]$ Virupas.
3. **Kala Bala** (Temporal): Natonnatha, Paksha, Tribhaga, Varsha, Masa, Dina, Hora, Ayana, Yuddha. Range: $[0, 300+]$ Virupas.
4. **Cheshta Bala** (Motional): Orbital speed relative to mean speed. Range: $[0, 60]$ Virupas.
5. **Naisargika Bala** (Natural): Invariant values $[8.57, 60.0]$ Virupas.
6. **Drik Bala** (Aspectual): Aspectual influence of all other grahas. Can be positive (benefic aspect) or negative (malefic aspect).

### 3. Ishta Phala & Kashta Phala Bounds
$$\text{Ishta Phala} = \sqrt{\text{Uchcha Bala} \times \text{Cheshta Bala}}$$
$$\text{Kashta Phala} = \sqrt{(60 - \text{Uchcha Bala}) \times (60 - \text{Cheshta Bala})}$$
Both quantities strictly satisfy $[0, 60]$ Virupas.

### 4. Bhava Bala
Evaluated across all 12 houses combining:
- Bhava Adhipati Bala (Lord strength)
- Bhava Digbala
- Bhava Drishti Bala (Aspects on house)
All 12 house strengths are strictly positive.
