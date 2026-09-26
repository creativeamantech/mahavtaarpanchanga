# Classical Jaimini Upadesha Sutra Validation Report

## Scope
Validation of Sage Jaimini's computational core as preserved in the *Jaimini Upadesha Sutras*:
- 7-Karaka and 8-Karaka schemes
- Rahu inclusion and retrograde degree inversion
- Arudha Padas (A1..A12) with Bhavapada exceptions
- Upapada Lagna (UL)
- Karakamsha and Swamsha
- Rashi Drishti (sign aspects)
- Chara Dasha

## 1. Chara Karaka System
- **7-Karaka Scheme**: Uses 7 classical planets (Sun to Saturn) ranked by traversed longitude in sign ($0^\circ$ to $30^\circ$):
  - Atmakaraka (AK) $\to$ Amatyakaraka (AmK) $\to$ Bhratrikaraka (BK) $\to$ Matrikaraka (MK) $\to$ Putrakaraka (PK) $\to$ Gnatikaraka (GK) $\to$ Darakaraka (DK).
- **8-Karaka Scheme**: Includes Rahu. Because Rahu moves in retrograde, its effective traversed degree is inverted:
  $$\theta_{\text{eff, Rahu}} = 30^\circ - \theta_{\text{Rahu in sign}}$$
  Pitrikaraka (PiK) is added to the 8-fold hierarchy.

## 2. Arudha Padas & Bhavapada Exception Rules
- **Standard Formula**: Count $n$ houses from House $H$ to its lord $L$; Arudha is $n$ houses from $L$.
- **Classical Exception**: If the resulting Pada falls in the house itself ($n=1$) or in the 7th from it ($n=7$), the Pada jumps to the 10th house from the projection:
  $$\text{If } \text{Arudha} \equiv H \text{ or } \text{Arudha} \equiv (H+6) \pmod{12} \implies \text{Final} = (\text{Arudha} + 9) \pmod{12}$$
- **Upapada Lagna (UL)**: Defined as Arudha of the 12th house (A12).

## 3. Karakamsha & Swamsha
- **Karakamsha**: The sign occupied by the Atmakaraka (AK) in the Navamsha (D9) chart.
- **Swamsha**: The Navamsha Ascendant.

## 4. Jaimini Rashi Drishti
- **Movable Signs** (Aries, Cancer, Libra, Capricorn): Aspect all Fixed signs except the adjacent one.
- **Fixed Signs** (Taurus, Leo, Scorpio, Aquarius): Aspect all Movable signs except the adjacent one.
- **Dual Signs** (Gemini, Virgo, Sagittarius, Pisces): Aspect all other Dual signs.

## 5. Chara Dasha
- 12 periods corresponding to the 12 signs.
- Direction (direct vs indirect) determined by whether the sign is odd (Aries, Gemini, etc.) or even (Taurus, Cancer, etc.).
- Duration: 1 to 12 years based on distance to the sign lord.
