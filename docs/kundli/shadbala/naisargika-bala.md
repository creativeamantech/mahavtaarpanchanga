# Naisargika Bala (Natural Inherent Strength) — Specification

## 1. Classical Basis
BPHS Adhyaya 27, Shlokas 28–29 establishes Naisargika Bala (नैसर्गिकबल) as the fixed, permanent natural luminosity and potency of the planets. It does not vary with time, zodiacal sign, or planetary aspect.

## 2. Mathematical Definition
The seven Grahas are assigned descending values in proportions of $\frac{k}{7} \times 60.0$ Virupas for $k = 7, 6, 5, 4, 3, 2, 1$:

$$\text{Naisargika Bala} = \frac{k}{7} \times 60.0 \text{ Virupas} = \frac{k}{7} \text{ Rupas}$$

### Canonical Values Table:

| Planet | Sanskrit | Proportion | Virupas (Exact) | Virupas (Decimal) | Rupas |
|---|---|---|---|---|---|
| **Sun** | सूर्य | $7/7$ | $60$ | $60.0000$ | $1.0000$ |
| **Moon** | चन्द्र | $6/7$ | $360/7$ | $51.4286$ | $0.8571$ |
| **Venus** | शुक्र | $5/7$ | $300/7$ | $42.8571$ | $0.7143$ |
| **Jupiter** | गुरु | $4/7$ | $240/7$ | $34.2857$ | $0.5714$ |
| **Mercury** | बुध | $3/7$ | $180/7$ | $25.7143$ | $0.4286$ |
| **Mars** | मंगल | $2/7$ | $120/7$ | $17.1429$ | $0.2857$ |
| **Saturn** | शनि | $1/7$ | $60/7$ | $8.5714$ | $0.1429$ |

### Invariant Properties:
- **Sum of all 7 Grahas**:
  $$\sum \text{NaisargikaBala} = \frac{7+6+5+4+3+2+1}{7} \times 60 = \frac{28}{7} \times 60 = 4 \times 60 = 240.0 \text{ Virupas} = 4.0 \text{ Rupas}$$
- Stored as immutable constant data in `NaisargikaBala.ts`.
