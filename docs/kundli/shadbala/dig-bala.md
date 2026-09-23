# Dig Bala (Directional Strength) — Mathematical Specification

## 1. Classical Basis
BPHS Adhyaya 27, Shlokas 12–14 states that planets possess directional potency associated with cardinal quadrants:
- **East (Prachi / 1st House Cusp / Lagna)**: Jupiter and Mercury reach maximum strength (60 Virupas).
- **South (Dakshina / 10th House Cusp / MC)**: Sun and Mars reach maximum strength (60 Virupas).
- **West (Pratichi / 7th House Cusp / Descendant)**: Saturn reaches maximum strength (60 Virupas).
- **North (Uttara / 4th House Cusp / Nadir)**: Moon and Venus reach maximum strength (60 Virupas).

## 2. Zero-Strength (Nirbaleeyata) Points
Each planet has zero directional strength at the point opposite ($180^\circ$ away) from its peak direction:
- Jupiter & Mercury: 7th House Cusp ($Lagna + 180^\circ$)
- Sun & Mars: 4th House Cusp ($Lagna + 90^\circ$ / 4th Cusp)
- Saturn: 1st House Cusp (Lagna)
- Moon & Venus: 10th House Cusp ($Lagna + 270^\circ$ / 10th Cusp)

## 3. Mathematical Formula
Let $\lambda_p$ be the sidereal longitude of the planet, and $\lambda_0$ be the zero-strength longitude for that planet.
The angular separation $\Delta$ is:
$$\Delta = |(\lambda_p - \lambda_0 + 360^\circ) \pmod{360^\circ}|$$
If $\Delta > 180^\circ$, then $\Delta = 360^\circ - \Delta$.

Then:
$$\text{Dig Bala (Virupas)} = \frac{\Delta}{3} = \frac{\Delta}{180^\circ} \times 60.0$$

At the point of peak direction, $\Delta = 180^\circ \implies \text{Dig Bala} = 60.0$ Virupas.
At the point of zero direction, $\Delta = 0^\circ \implies \text{Dig Bala} = 0.0$ Virupas.

Unit: Virupas (max 60.0).
Formula Version: BPHS-27.12-Continuous.
Validation Status: Golden vectors verified across all quadrants.
