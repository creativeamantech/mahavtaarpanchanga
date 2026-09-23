# Known Conventions & Computational Divergences

## 1. Year Length Divergences in Astrological Software

Astrological computational systems exhibit minor date discrepancies across different software packages due to divergence in year length conventions:

| Convention | Year Length (Days) | Annual Difference vs Gregorian | 120-Year Cycle Total Days |
| :--- | :--- | :--- | :--- |
| **Gregorian Solar** (Mahavtaar Default) | **365.2425** | $\pm 0.0$ | **43,829.1 days** |
| **Julian Year** (365.25d) | **365.2500** | $+0.0075$ days (+10.8 mins) | **43,830.0 days** (+0.9d) |
| **Savana Year** (360 civil days) | **360.0000** | $-5.2425$ days | **43,200.0 days** (-629.1d) |
| **Sidereal Solar Year** | **365.256363** | $+0.01386$ days (+20 mins) | **43,830.76 days** (+1.66d) |

### Mahavtaar Stance:
- **Default**: `gregorian_solar` ($365.2425$ mean solar days). This matches modern civil calendars, existing Kundli engine baseline vectors, and NASA JPL ephemeris date conversion.
- **Configurable**: When high-purity classical Savana reckoning is desired, caller passes `yearConvention: "savana"` in `DashaContext`.

---

## 2. Month and Day Allocation Conventions

In traditional chart outputs, balance of Dasha is expressed as:
- **Years**: Integer portion of remaining duration.
- **Months**: $1/12\text{th}$ of a year.
- **Days**: $1/30\text{th}$ of a month.

Some modern systems calculate days based on the exact day counts of elapsed calendar months (e.g. 28, 30, or 31 days). The Mahavtaar Engine stores the exact millisecond timestamps on the timeline and formats human-readable months/days using the classical 30-day standard for display balance.
