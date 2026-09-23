# Drik Bala (Aspectual Strength) — Mathematical Specification

## 1. Classical Basis
BPHS Adhyaya 27, Shlokas 30–33 defines Drik Bala (दृग्बल) as the net strength an aspected planet receives from other aspecting planets. Benefic aspects enhance a planet's strength ($+ \text{Drishti} / 4$), while malefic aspects diminish it ($- \text{Drishti} / 4$).

## 2. Classical Piecewise Linear Drishti Kendra Formula
Let $\theta = (\lambda_{\text{aspected}} - \lambda_{\text{aspecting}} + 360^\circ) \pmod{360^\circ}$ be the forward angular distance between the two bodies.

The raw Drishti value (in Virupas, max 60) is calculated as:
1. $0^\circ \le \theta < 30^\circ$:
   $$\text{Drishti} = 0$$
2. $30^\circ \le \theta < 60^\circ$:
   $$\text{Drishti} = \frac{\theta - 30^\circ}{2}$$
3. $60^\circ \le \theta < 90^\circ$:
   $$\text{Drishti} = 15.0 + (\theta - 60^\circ)$$
4. $90^\circ \le \theta < 120^\circ$:
   $$\text{Drishti} = 45.0 - \frac{\theta - 90^\circ}{2}$$
5. $120^\circ \le \theta < 150^\circ$:
   $$\text{Drishti} = 30.0 - (\theta - 120^\circ)$$
6. $150^\circ \le \theta < 180^\circ$:
   $$\text{Drishti} = (\theta - 150^\circ) \times 2$$
7. $180^\circ \le \theta < 300^\circ$:
   $$\text{Drishti} = \frac{300^\circ - \theta}{2}$$
8. $300^\circ \le \theta < 360^\circ$:
   $$\text{Drishti} = 0$$

## 3. Special Aspects (Vishesha Drishti)
- **Mars**: Special 4th ($90^\circ$) and 8th ($210^\circ$) aspects add $+15.0$ Virupas to the base drishti.
- **Jupiter**: Special 5th ($120^\circ$) and 9th ($240^\circ$) aspects add $+30.0$ Virupas to the base drishti.
- **Saturn**: Special 3rd ($60^\circ$) and 10th ($270^\circ$) aspects add $+45.0$ Virupas (or adjust to full 60).

## 4. Benefic vs. Malefic Multipliers
- **Benefics**: Jupiter, Venus, waxing Moon, Mercury (when not associated with malefics).
  Each benefic contributes $+ \frac{\text{Drishti}}{4}$ Virupas.
- **Malefics**: Sun, Mars, Saturn, waning Moon, afflicted Mercury.
  Each malefic contributes $- \frac{\text{Drishti}}{4}$ Virupas.

$$\text{Net Drik Bala} = \sum \text{Benefic Drishti} - \sum \text{Malefic Drishti}$$
Drik Bala can be positive or negative, directly affecting the final Shadbala sum.
