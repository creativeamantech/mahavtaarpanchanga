# Sthana Bala (Positional Strength) — Mathematical Specification

## 1. Scope & Definition
Sthana Bala (स्थानबल) evaluates the strength acquired by a planet due to its zodiacal position across rashi, vargas, and kendras. It comprises five independent subdivisions:
1. **Uchcha Bala (Exaltation Strength)**
2. **Saptavargaja Bala (Divisional Dignity Strength)**
3. **Ojayugmarashi Bala (Odd-Even Sign Strength)**
4. **Kendradi Bala (Angular House Strength)**
5. **Drekkana Bala (Decanate Gender Strength)**

Total Sthana Bala:
$$\text{SthanaBala} = \text{Uchcha} + \text{Saptavargaja} + \text{Ojayugma} + \text{Kendradi} + \text{Drekkana}$$

---

## 2. Uchcha Bala (Exaltation Strength)
### Formula:
$$\text{Uchcha Bala (Virupas)} = \frac{\Delta}{3} = \frac{\Delta}{180^\circ} \times 60$$
where $\Delta = |\lambda - \lambda_{\text{deb}}|$, adjusted such that if $\Delta > 180^\circ$, then $\Delta = 360^\circ - \Delta$.

### Deep Exaltation ($\lambda_{\text{ex}}$) & Debilitation ($\lambda_{\text{deb}}$) Points:
- **Sun**: Exaltation = Aries $10^\circ$ ($10.0^\circ$), Debilitation = Libra $10^\circ$ ($190.0^\circ$)
- **Moon**: Exaltation = Taurus $3^\circ$ ($33.0^\circ$), Debilitation = Scorpio $3^\circ$ ($213.0^\circ$)
- **Mars**: Exaltation = Capricorn $28^\circ$ ($298.0^\circ$), Debilitation = Cancer $28^\circ$ ($118.0^\circ$)
- **Mercury**: Exaltation = Virgo $15^\circ$ ($165.0^\circ$), Debilitation = Pisces $15^\circ$ ($345.0^\circ$)
- **Jupiter**: Exaltation = Cancer $5^\circ$ ($95.0^\circ$), Debilitation = Capricorn $5^\circ$ ($275.0^\circ$)
- **Venus**: Exaltation = Pisces $27^\circ$ ($357.0^\circ$), Debilitation = Virgo $27^\circ$ ($177.0^\circ$)
- **Saturn**: Exaltation = Libra $20^\circ$ ($200.0^\circ$), Debilitation = Aries $20^\circ$ ($20.0^\circ$)

Max: 60 Virupas (at exact exaltation). Min: 0 Virupas (at exact debilitation).

---

## 3. Saptavargaja Bala
Evaluates the planet's placement in seven key divisional charts:
1. D1 (Rashi)
2. D2 (Hora)
3. D3 (Drekkana)
4. D7 (Saptamsha)
5. D9 (Navamsha)
6. D12 (Dwadashamsha)
7. D30 (Trimshamsha)

### Scoring per Varga (BPHS 27.4–7):
- **Moolatrikona**: 45.0 Virupas (applied only if within natal Moolatrikona range in D1, otherwise Swakshetra)
- **Swakshetra (Own Sign)**: 30.0 Virupas
- **Adhi-Mitra (Great Friend)**: 20.0 Virupas (or 22.5 in Raman convention; engine default: 20.0 BPHS standard)
- **Mitra (Friend)**: 15.0 Virupas
- **Sama (Neutral)**: 10.0 Virupas
- **Shatru (Enemy)**: 5.0 Virupas
- **Adhi-Shatru (Great Enemy)**: 2.5 Virupas

### Compound Relationship (Panchadha Maitri):
Calculated from the synthesis of Natural Relationship (Naisargika) + Temporary Relationship (Tatkalika in D1):
- Tatkalika Mitra: Occupying 2nd, 3rd, 4th, 10th, 11th, 12th from the planet in D1.
- Tatkalika Shatru: Occupying 1st, 5th, 6th, 7th, 8th, 9th from the planet in D1.
Synthesis:
- Friend + Friend $\to$ Adhi-Mitra
- Friend + Neutral $\to$ Mitra
- Friend + Enemy / Neutral + Neutral $\to$ Sama
- Enemy + Neutral $\to$ Shatru
- Enemy + Enemy $\to$ Adhi-Shatru

---

## 4. Ojayugmarashi Bala (Odd-Even Sign Strength)
- **Female Planets** (Moon, Venus):
  - Receive 15 Virupas in an Even Sign (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces) in D1.
  - Receive 15 Virupas in an Even Sign in D9.
- **Male / Neutral Planets** (Sun, Mars, Jupiter, Mercury, Saturn):
  - Receive 15 Virupas in an Odd Sign (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius) in D1.
  - Receive 15 Virupas in an Odd Sign in D9.
Max per planet: 30 Virupas.

---

## 5. Kendradi Bala
Based on the house occupied in the natal chart (D1):
- **Kendra Houses** (1, 4, 7, 10): 60.0 Virupas
- **Panaphara Houses** (2, 5, 8, 11): 30.0 Virupas
- **Apoklima Houses** (3, 6, 9, 12): 15.0 Virupas

---

## 6. Drekkana Bala
Based on the decanate ($10^\circ$ slice) occupied by the planet:
- **1st Drekkana ($0^\circ - 10^\circ$)**: Male planets (Sun, Mars, Jupiter) get 15 Virupas.
- **2nd Drekkana ($10^\circ - 20^\circ$)**: Neutral planets (Mercury, Saturn) get 15 Virupas.
- **3rd Drekkana ($20^\circ - 30^\circ$)**: Female planets (Moon, Venus) get 15 Virupas.
Otherwise: 0 Virupas.
