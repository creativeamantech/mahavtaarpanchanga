# Kala Bala (Temporal Strength) — Mathematical Specification

## 1. Scope & Definition
Kala Bala (कालबल) evaluates the temporal potency bestowed upon Grahas based on diurnal rhythm, lunar phase, planetary periods, declinations, and planetary war:
1. **Natonnata Bala (Diurnal / Nocturnal Strength)**
2. **Paksha Bala (Lunar Fortnight Strength)**
3. **Tribhaga Bala (Three-part division of Day and Night)**
4. **Varsha, Masa, Dina, Hora Balas (Periodic Rulers)**
5. **Ayana Bala (Declination Strength)**
6. **Yuddha Bala (Planetary War Adjustment)**

Total Kala Bala:
$$\text{KalaBala} = \text{Natonnata} + \text{Paksha} + \text{Tribhaga} + \text{Varsha} + \text{Masa} + \text{Dina} + \text{Hora} + \text{Ayana} + \text{Yuddha}$$

---

## 2. Natonnata Bala (Diva-Ratri Bala)
- **Midday & Midnight Reference**:
  Based on local apparent time relative to local noon and local midnight.
- **Nata Arc**: The angular distance of the Sun from the meridian (noon).
- **Moon, Mars, Saturn**: Strong at midnight ($Nata = 30^\circ \implies 60$ Virupas).
- **Sun, Jupiter, Venus**: Strong at noon ($60 - Nata$).
- **Mercury**: Gets 60 Virupas continuously (or diurnal/nocturnal neutral).

---

## 3. Paksha Bala (Lunar Fortnight Strength)
Calculated from the angular elongation between the Moon and the Sun:
$$\Delta = (\lambda_{\text{Moon}} - \lambda_{\text{Sun}} + 360^\circ) \pmod{360^\circ}$$
If $\Delta > 180^\circ$, then $\text{Elongation} = 360^\circ - \Delta$, else $\text{Elongation} = \Delta$.

- **Benefics** (Jupiter, Venus, and waxing Moon):
  $$\text{PakshaBala} = \frac{\Delta}{180^\circ} \times 60.0 \text{ (during Shukla Paksha)}$$
  $$\text{PakshaBala} = \frac{360^\circ - \Delta}{180^\circ} \times 60.0 \text{ (during Krishna Paksha)}$$
- **Malefics** (Sun, Mars, Saturn, waning Moon):
  $$\text{PakshaBala} = 60.0 - \text{PakshaBala}_{\text{benefic}}$$
- **Moon's Special Rule**: The Moon's Paksha Bala is multiplied by 2 according to BPHS Ch. 27.

---

## 4. Tribhaga Bala
Divide daytime (sunrise to sunset) into 3 equal parts, and nighttime (sunset to next sunrise) into 3 equal parts:
- Part 1 of Day: **Mercury** (60 Virupas)
- Part 2 of Day: **Sun** (60 Virupas)
- Part 3 of Day: **Saturn** (60 Virupas)
- Part 1 of Night: **Moon** (60 Virupas)
- Part 2 of Night: **Venus** (60 Virupas)
- Part 3 of Night: **Mars** (60 Virupas)
- **Jupiter**: Always receives 60 Virupas regardless of time.

---

## 5. Varsha, Masa, Dina, Hora Balas
- **Varsha Bala (Year Lord)**: 15 Virupas (awarded to the lord of the solar year / Chaitra Shukla Pratipada or annual cycle).
- **Masa Bala (Month Lord)**: 30 Virupas (awarded to the lord of the solar month / Sankranti).
- **Dina Bala (Weekday Lord)**: 45 Virupas (awarded to the ruler of the Vedic weekday from sunrise).
- **Hora Bala (Hour Lord)**: 60 Virupas (awarded to the ruler of the active planetary hour at the moment of birth).

---

## 6. Ayana Bala (Declination Strength)
Based on the celestial declination ($\delta$) of the planet relative to maximum ecliptic obliquity ($\epsilon \approx 23.44^\circ$):
- Sun, Mars, Jupiter, Venus: Strong in northern declination ($+ \delta$).
- Moon, Saturn: Strong in southern declination ($-\delta$).
- Mercury: Always gains strength with northern declination.
Formula:
$$\text{Ayana Bala} = \frac{23.44^\circ \pm \delta}{46.88^\circ} \times 60.0$$
(For Sun, Ayana Bala is doubled according to BPHS Ch. 27 v. 21).

---

## 7. Yuddha Bala (Planetary War)
When two of the five Tara Grahas (Mars, Mercury, Jupiter, Venus, Saturn) are within $1.0^\circ$ of each other in sidereal longitude, Graha Yuddha occurs. The planet with higher latitude or northern position is declared the victor, gaining the difference between their preliminary Shadbala scores, while the defeated planet loses that exact quantity.
