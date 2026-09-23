# Future Dasha Systems Blueprint (Phase 4 Extensibility)

The Mahavtaar Dasha architecture was engineered from Day 1 to support diverse conditional, nakshatra, and rashi-based Dasha systems without requiring structural changes to consumers or the domain model.

## 1. Candidate Systems for Future Phases

### 1. Ashtottari Dasha (अष्टोत्तरी दशा — 108 Years)
- **Condition for Applicability**: Rahu must be in a Kendra or Trikona from Lagna Lord, or birth during Shukla Paksha night / Krishna Paksha day.
- **Planets (8 only)**: Sun (6y), Moon (15y), Mars (8y), Mercury (17y), Saturn (10y), Jupiter (19y), Rahu (12y), Venus (21y). Total = 108 years.
- **Ketu is omitted**; 28 Nakshatras (including Abhijit) are partitioned into spans of 3 or 4 Nakshatras.

### 2. Yogini Dasha (योगिनी दशा — 36 Years)
- **Applicability**: Highly popular in North India for fast mundane and transit-verification timing.
- **8 Yoginis**:
  1. Mangala (Moon, 1y)
  2. Pingala (Sun, 2y)
  3. Dhanya (Jupiter, 3y)
  4. Bhramari (Mars, 4y)
  5. Bhadrika (Mercury, 5y)
  6. Ulka (Saturn, 6y)
  7. Siddha (Venus, 7y)
  8. Sankata (Rahu, 8y)
- **Calculation**: $(\text{Nakshatra Number} + 3) \pmod 8$.

### 3. Jaimini Chara Dasha (चर दशा)
- **Category**: Rashi Dasha (sign-based, not planet-based).
- **Cycle**: 12 Zodiac signs starting from Lagna or 9th house, ordered direct (Savya) or reverse (Apasavya) depending on odd/even nature of signs.
- **Duration**: Determined by counting from sign to its lord's location according to classical Jaimini principles.

### 4. Kaalchakra Dasha (कालचक्र दशा)
- **Category**: Nakshatra-Pada based Rashi Dasha.
- **Calculations**: Derived from Deha and Jeeva rashis across Savya and Apasavya cycles.

---

## 2. Implementing a New Adapter

To add any of the above systems:
1. Create `src/kundali/dasha/adapters/MyNewDashaEngine.ts` implementing `IDashaSystemAdapter`.
2. Register the adapter in `DashaEngine`:
   ```typescript
   DashaEngine.registerAdapter(new MyNewDashaEngine());
   ```
3. Query the timeline via `new DashaEngine("ashtottari").calculateCanonicalTimeline(context)`.
