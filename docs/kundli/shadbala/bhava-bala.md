# Bhava Bala (House Strength) — Mathematical Specification

## 1. Classical Basis
BPHS Adhyaya 27, Shlokas 38–42 defines Bhava Bala (भावबल) as the composite strength of each of the 12 astrological houses. While Shadbala measures planetary potency, Bhava Bala measures the strength of life departments (health, wealth, siblings, home, children, etc.).

## 2. Core Components of Bhava Bala
The engine models three primary classical constituents:
1. **Bhavadhipati Bala (Lord's Strength)**
2. **Bhava Dig Bala (Directional Strength of the House Sign)**
3. **Bhava Drishti Bala (Aspectual Strength on House Midpoint)**

$$\text{Bhava Bala} = \text{Bhavadhipati Bala} + \text{Bhava Dig Bala} + \text{Bhava Drishti Bala}$$

---

## 3. Bhavadhipati Bala (House Lord Strength)
The lord of each house is determined by the zodiac sign residing on that house cusp/midpoint. The total Shadbala of that planetary ruler (in Virupas) is transferred directly as the foundational strength of that Bhava.

---

## 4. Bhava Dig Bala (Directional House Strength)
Signs possess innate directional affinities based on their morphological classification:
- **Nara (Human / Biped) Signs**: Gemini, Virgo, Libra, first $15^\circ$ of Sagittarius, Aquarius.
  - Peak direction: **1st House** (East) $\to 60.0$ Virupas.
- **Jala (Watery) Signs**: Cancer, Pisces, Capricorn ($15^\circ - 30^\circ$).
  - Peak direction: **4th House** (North) $\to 60.0$ Virupas.
- **Chatushpada (Quadruped) Signs**: Aries, Taurus, Leo, Sagittarius ($15^\circ - 30^\circ$), Capricorn ($0^\circ - 15^\circ$).
  - Peak direction: **10th House** (South) $\to 60.0$ Virupas.
- **Keeta (Insect) Signs**: Scorpio.
  - Peak direction: **7th House** (West) $\to 60.0$ Virupas.

Angular distance between the house position and its peak direction yields the Bhava Dig Bala ($0 \dots 60$ Virupas).

---

## 5. Bhava Drishti Bala (House Aspect Strength)
Evaluates the planetary aspects cast directly upon the Bhava Madhya (midpoint of the house):
- Benefics (Jupiter, Venus, Mercury, waxing Moon) casting aspects onto the house add strength ($+ \text{Drishti} / 4$).
- Malefics (Sun, Mars, Saturn, waning Moon) casting aspects reduce strength ($- \text{Drishti} / 4$).

---

## 6. Output & Ranking
For each of the 12 Bhavas, the engine outputs:
- `houseNumber` (1 to 12)
- `bhavadhipatiBala`
- `bhavaDigBala`
- `bhavaDrishtiBala`
- `totalVirupas`
- `totalRupas`
- `rank` (1 = strongest house, 12 = weakest house)
