# Date Arithmetic, Year Lengths & Timezone Safety

## 1. Timezone Independence & UTC Canonical Epochs

In computational astrology, dates are frequently corrupted when developers apply local calendar date objects without normalizing to UTC. Daylight saving time (DST) shifts and local timezone offsets can introduce arbitrary 1-hour or 30-minute shifts that break Dasha boundary continuity.

### The Canonical Rule:
**All temporal boundaries in the Mahavtaar Kundali Engine are stored and compared as UTC epoch milliseconds (`number`).**

- `birthTimestampMs`: Derived from the native's birth date, time, and longitude/timezone offset.
- `startDateIso` / `endDateIso`: Formatted strictly using UTC ISO dates (`new Date(ms).toISOString().slice(0, 10)`).
- Timezone conversions occur only at the view presentation layer when displaying local dates to the user.

---

## 2. Year Length Conventions

The length of a "year" in Dasha calculations has been debated among classical commentators. The Mahavtaar Engine explicitly declares and parameterizes this convention:

### 1. Gregorian Solar Year (`gregorian_solar`) — Default
- **Definition**: 1 mean tropical/civil year on the modern Gregorian calendar.
- **Duration**: $365.2425$ days $= 31,556,952,000$ milliseconds.
- **Application**: Standard across modern Ephemeris-driven Panchangas and matching the verified baseline in `kundliEngine.ts`.

### 2. Savana Year (`savana`) — Classical Purva Parashari
- **Definition**: 360 civil solar days (12 months of 30 days each).
- **Duration**: $360.0$ days $= 31,104,000,000$ milliseconds.
- **Scripture**: Discussed in Surya Siddhanta and some commentaries on BPHS.

### 3. Sidereal Solar Year (`sidereal_solar`)
- **Definition**: Exact duration of the Earth's sidereal orbit around the Sun.
- **Duration**: $365.256363$ days $= 31,558,149,763$ milliseconds.

### 4. Lunar Year (`chandra`)
- **Definition**: 12 Tithis $\times$ 30 lunar days $\approx 354.367$ days.

---

## 3. Leap Year & Calendar Math

Because the Mahavtaar timeline engine computes elapsed intervals in milliseconds from the birth epoch, leap years in the calendar are handled naturally and deterministically:
$$\text{TargetDate} = \text{new Date}(\text{BirthTimestampMs} + \Delta t)$$
No manual adding of February 29th leap days is needed, and calendar dates remain astronomically true to the calendar grid.
