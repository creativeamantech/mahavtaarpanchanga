# Vimshottari Dasha Engine (विंशोत्तरी दशा)

## 1. Foundation & Classical Definition

Vimshottari is the foremost Nakshatra Dasha system propounded by Maharishi Parashara in the **Brihat Parashara Hora Shastra (BPHS Adhyaya 46, Shlokas 12–15)**:

> "दशा विंशोत्तरी ज्ञेया कलौ सर्वाधिका शुभा।  
> नक्षत्राणां तु सर्वेषां गणनावशतो द्विज॥"  
> *(In the Kaliyuga, Vimshottari is considered the supreme and most efficacious of all Dasha systems, calculated according to the placement of planets across the 27 Nakshatras.)*

The total duration of the human lifespan allocated across all nine Grahas is **120 solar years** (विंशोत्तर शत = 120):

| Planet (Graha) | Sanskrit | Hindi | Cycle Years | Nakshatras Ruled |
| :--- | :--- | :--- | :--- | :--- |
| **Ketu** (South Node) | केतुः | केतु | 7 | Ashwini (1), Magha (10), Mula (19) |
| **Venus** (Shukra) | शुक्रः | शुक्र | 20 | Bharani (2), Purva Phalguni (11), Purva Ashadha (20) |
| **Sun** (Surya) | सूर्यः | सूर्य | 6 | Krittika (3), Uttara Phalguni (12), Uttara Ashadha (21) |
| **Moon** (Chandra) | चन्द्रः | चन्द्र | 10 | Rohini (4), Hasta (13), Shravana (22) |
| **Mars** (Mangala) | मङ्गलः | मंगल | 7 | Mrigashira (5), Chitra (14), Dhanishta (23) |
| **Rahu** (North Node) | राहुः | राहु | 18 | Ardra (6), Swati (15), Shatabhisha (24) |
| **Jupiter** (Guru) | गुरुः | गुरु | 16 | Punarvasu (7), Vishakha (16), Purva Bhadrapada (25) |
| **Saturn** (Shani) | शनिः | शनि | 19 | Pushya (8), Anuradha (17), Uttara Bhadrapada (26) |
| **Mercury** (Budha) | बुधः | बुध | 17 | Ashlesha (9), Jyeshtha (18), Revati (27) |
| **Total** | | | **120** | **27 Nakshatras (3 cycles of 9)** |

---

## 2. Calculation of Balance of Dasha at Birth (दशा भुक्त / भोग्य विचार)

### Arc Allocation
Each of the 27 Nakshatras spans an arc of:
$$\theta_{\text{nak}} = \frac{360^\circ}{27} = 13^\circ 20' = 13.333333333^\circ$$

Let $\lambda_{\text{Moon}}$ be the tropical or sidereal longitude of the Moon in degrees normalized to $[0^\circ, 360^\circ)$.
The zero-based index of the Nakshatra $N \in [0, 26]$ is:
$$N = \lfloor \frac{\lambda_{\text{Moon}}}{\theta_{\text{nak}}} \rfloor$$

The passed arc within the Nakshatra ($\theta_{\text{passed}}$) is:
$$\theta_{\text{passed}} = \lambda_{\text{Moon}} - N \times \theta_{\text{nak}}$$

The remaining unelapsed arc ($\theta_{\text{remaining}}$) is:
$$\theta_{\text{remaining}} = \theta_{\text{nak}} - \theta_{\text{passed}}$$

### Fractional Balance
The fraction of the birth Mahadasha remaining to be experienced (भोग्य भाग) is:
$$F_{\text{remaining}} = \frac{\theta_{\text{remaining}}}{\theta_{\text{nak}}}$$

Let $Y_{\text{lord}}$ be the total allotted years of the planetary ruler of Nakshatra $N$.
The remaining balance in years is:
$$Y_{\text{balance}} = Y_{\text{lord}} \times F_{\text{remaining}}$$

This is decomposed into integer years, months (solar or civil months = 1/12 year), and days (30 days/month) for classical astrological display:
$$Y = \lfloor Y_{\text{balance}} \rfloor$$
$$M = \lfloor (Y_{\text{balance}} - Y) \times 12 \rfloor$$
$$D = \text{round}(((Y_{\text{balance}} - Y) \times 12 - M) \times 30)$$

---

## 3. Mahadasha Sequence
The native begins life inside the Mahadasha of the ruler of their Moon's birth Nakshatra for a duration of $Y_{\text{balance}}$. The remaining 8 Mahadashas follow cyclically according to the immutable Parashari planetary order, each operating for its full quota of years:

$$\text{Ketu} \rightarrow \text{Venus} \rightarrow \text{Sun} \rightarrow \text{Moon} \rightarrow \text{Mars} \rightarrow \text{Rahu} \rightarrow \text{Jupiter} \rightarrow \text{Saturn} \rightarrow \text{Mercury} \rightarrow \dots$$
