# Lagna (Ascendant) & House Cusp Validation Report

## Spherical Trigonometric Formulation
The Ascendant ($\lambda_{\text{Asc}}$) is the eastern intersection of the local horizon and the ecliptic:
$$\tan(\alpha_{\text{Asc}}) = \frac{-\cos(\theta_{\text{RAMC}})}{\sin(\theta_{\text{RAMC}})\cos(\varepsilon) + \tan(\phi)\sin(\varepsilon)}$$
where:
- $\theta_{\text{RAMC}}$: Right Ascension of the Midheaven (Sidereal Time in degrees).
- $\varepsilon$: True obliquity of the ecliptic (IAU 2000 polynomial).
- $\phi$: Observer geographic latitude.

## Latitude Parametric Sweep (0° to 65° N and Southern Hemispheres)
A continuous 1-degree step validation was executed from $0^\circ$ (Equator) to $65^\circ$ (Sub-Arctic) across four cardinal longitudes (Greenwich, Delhi, Tokyo, New York) and southern latitudes (Sydney, Santiago).

### Findings:
1. **Mathematical Continuity**: No division-by-zero singularities encountered up to $65^\circ$ latitude.
2. **Boundary Safety**: Sign index strictly $\in [0, 11]$, degree $\in [0, 30)$, Nakshatra $\in [1, 27]$, Pada $\in [1, 4]$.
3. **Circumpolar Threshold ($>66.5^\circ$)**: Near polar circle (e.g. Tromsø $69.6^\circ$), where ecliptic does not intersect horizon during polar night or midnight sun, standard tangent formulation is bounded and handled gracefully without uncaught exceptions.

## House System Conventions
- **Whole-Sign Houses (Default Classical Jyotisha)**: The entire 30° span of the sign containing the Ascendant is designated House 1. House $H = ((\text{Sign} - \text{LagnaSign} + 12) \pmod{12}) + 1$.
- **Sripati / Cusp Framework**: Ascendant serves as the midpoint (Madhya) of the 1st Bhava, with cusp calculations demarcating house sandhis.
- **Classification**: Any cusp variation vs western systems (Placidus/Koch) is classified as `HOUSE_SYSTEM_DIFFERENCE`.
