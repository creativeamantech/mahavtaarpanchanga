# Units & Measurement Systems in Shadbala

## 1. Unit Definitions

In classical Jyotisha, planetary strength is computed in **Virupas (Shashtiamshas)** and **Rupas**:
- **1 Rupa (रूप)** = **60 Virupas (विरूपा / षष्ट्यंश)**.
- **1 Virupa** = 60 Shashtiamshas (sub-virupas), equivalent to fractional floating point parts in modern computation.
- All internal mathematical calculations are performed strictly in **Virupas** using 64-bit IEEE 754 floating-point values without intermediate quantization.
- Final outputs provide both `totalVirupas` and `totalRupas` ($= \text{totalVirupas} / 60.0$).

## 2. Minimum Required Strengths (BPHS Canonical Benchmark)
BPHS specifies minimum thresholds of total strength required for a Graha to be considered fully potent and capable of bestowing its favorable natural and functional results:

| Planet | Sanskrit | Minimum Virupas | Minimum Rupas | Percentage of Standard Base |
|---|---|---|---|---|
| **Sun** (Surya) | सूर्य | 390 | 6.50 | 100% |
| **Moon** (Chandra) | चन्द्र | 360 | 6.00 | 92.3% |
| **Mars** (Mangala) | मंगल | 300 | 5.00 | 76.9% |
| **Mercury** (Budha) | बुध | 420 | 7.00 | 107.7% |
| **Jupiter** (Guru) | गुरु | 390 | 6.50 | 100% |
| **Venus** (Shukra) | शुक्र | 330 | 5.50 | 84.6% |
| **Saturn** (Shani) | शनि | 300 | 5.00 | 76.9% |

### Component-wise Minimum Requirements (BPHS Ch. 27):
In addition to the total minimums, classical authorities assess individual component standards:
- **Sthana Bala Minimum**: Sun (165), Moon (133), Mars (96), Mercury (165), Jupiter (165), Venus (133), Saturn (96) Virupas.
- **Dig Bala Minimum**: 35 Virupas for all 7 planets.
- **Kala Bala Minimum**: Sun (112), Moon (100), Mars (67), Mercury (112), Jupiter (112), Venus (100), Saturn (67) Virupas.
- **Cheshta Bala Minimum**: 50 Virupas (except Sun and Moon).
- **Ayana Bala Minimum**: 30 Virupas for all planets.

## 3. Evaluative Labels
In strict accordance with the project instructions:
The engine provides exact numeric strength values, required benchmarks, and the mathematical ratio:
$$\text{strengthRatio} = \frac{\text{totalRupas}}{\text{requiredRupas}}$$
The engine does **not** introduce arbitrary, non-canonical adjectives.
