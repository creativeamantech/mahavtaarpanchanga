# Classical Parashari Rule & Yoga Validation Report

## Implemented Rule Inventory

The rule engine evaluates 13 core classical Parashari formations, strictly cited from *Brihat Parashara Hora Shastra* (BPHS), *Saravali*, and *Phaladeepika*:

1. **Ruchaka Mahapurusha Yoga** (BPHS 75.1–5): Mars in Kendra in Aries, Scorpio, or Capricorn. Cancellation: Deep combustion (<3° Sun).
2. **Bhadra Mahapurusha Yoga** (BPHS 75.21–25): Mercury in Kendra in Gemini or Virgo. Cancellation: Deep combustion (<2° Sun).
3. **Hamsa Mahapurusha Yoga** (BPHS 75.6–10): Jupiter in Kendra in Sagittarius, Pisces, or Cancer.
4. **Malavya Mahapurusha Yoga** (BPHS 75.11–15): Venus in Kendra in Taurus, Libra, or Pisces.
5. **Shasha Mahapurusha Yoga** (BPHS 75.16–20): Saturn in Kendra in Capricorn, Aquarius, or Libra.
6. **Gajakesari Yoga** (BPHS 36.3–4): Jupiter in Kendra from Moon. Cancellation: Debilitated Jupiter or Moon.
7. **Budhaditya Yoga** (Saravali 31.1): Sun and Mercury in the same house. Cancellation: Ultra-tight combustion (<3°).
8. **Chandra-Mangala Yoga** (Saravali 15.20): Moon and Mars in conjunction or mutual aspect.
9. **Kendra-Trikona Lord Raja Yoga** (BPHS 34.1–16): Conjunction/Sambandha between Kendra and Trikona lords.
10. **Dhana Yoga Foundations** (BPHS 37.1–15): 2nd and 11th lord connection in auspicious houses; 5th and 9th lord connection.
11. **Viparita Raja Yoga** (Phaladeepika 6.57–66): Harsha (6th lord in 6/8/12), Sarala (8th lord in 6/8/12), Vimala (12th lord in 6/8/12).
12. **Neechabhanga Raja Yoga** (BPHS 40.1–11): Debility cancelled by dispositor in Kendra, exaltation lord in Kendra, or conjunction with exalted planet.
13. **Guru-Chandal Yoga** (Jataka Parijata 6): Jupiter conjoined with Rahu.

## Verification Matrix
Every rule is validated across 4 distinct test conditions:
- **Positive Case**: Meets primary condition $\to$ `PRESENT`.
- **Negative Case**: Fails house or sign conditions $\to$ `ABSENT`.
- **Exception / Cancellation**: Primary condition met, but combustion or debility triggers $\to$ `CANCELLED`.
- **Boundary Case**: Exact degree separation tests (e.g., combustion orb thresholds 2°/3°).
