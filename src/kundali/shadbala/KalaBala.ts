import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { KalaBalaBreakdown } from "./ShadbalaTypes";

export interface KalaBalaTemporalContext {
  birthDate: Date;
  sunriseDate: Date;
  sunsetDate: Date;
  sunLonDeg: number;
  moonLonDeg: number;
  planetDeclinationsDeg: Record<CanonicalBodyId, number>; // Kranti (-23.5 to +23.5)
  weekdayLord: CanonicalBodyId; // Ruler of Vedic day (Sun to Sat)
  horaLord: CanonicalBodyId; // Ruler of birth hora
  masaLord?: CanonicalBodyId; // Ruler of month
  varshaLord?: CanonicalBodyId; // Ruler of year
}

/**
 * 1. Calculate Natonnata Bala (Diurnal / Nocturnal Strength)
 * BPHS Ch. 27, v. 15-16
 */
export function calculateNatonnataBala(
  planet: CanonicalBodyId,
  birthDate: Date,
  sunriseDate: Date,
  sunsetDate: Date,
): number {
  if (planet === "Mercury") {
    // Mercury always receives 60 Virupas due to dual diurnal/nocturnal rulership
    return 60.0;
  }

  const birthMs = birthDate.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();
  const noonMs = (sunriseMs + sunsetMs) / 2.0;

  // Approximate midnight as sunset + 1/2 of night (approx 6h after sunset or before sunrise)
  const isDay = birthMs >= sunriseMs && birthMs <= sunsetMs;

  // Angular distance from noon (0 at noon, 180° at midnight)
  let fractionFromNoon = 0;
  if (isDay) {
    const halfDay = (sunsetMs - sunriseMs) / 2.0;
    fractionFromNoon = halfDay > 0 ? Math.abs(birthMs - noonMs) / halfDay : 0; // 0 at noon, 1 at sunrise/sunset
  } else {
    // Night
    const halfDay = (sunsetMs - sunriseMs) / 2.0;
    const diffFromSunset = birthMs > sunsetMs ? birthMs - sunsetMs : sunriseMs - birthMs;
    fractionFromNoon = 1.0 + (halfDay > 0 ? Math.min(1.0, diffFromSunset / halfDay) : 0);
  }

  // Clamped ratio from noon (0.0) to midnight (1.0)
  const nightRatio = Math.min(1.0, Math.max(0.0, fractionFromNoon / 2.0));

  // Moon, Mars, Saturn are strong at midnight (60 Virupas)
  if (planet === "Moon" || planet === "Mars" || planet === "Saturn") {
    return nightRatio * 60.0;
  }

  // Sun, Jupiter, Venus are strong at noon (60 Virupas)
  if (planet === "Sun" || planet === "Jupiter" || planet === "Venus") {
    return (1.0 - nightRatio) * 60.0;
  }

  return 30.0;
}

/**
 * 2. Calculate Paksha Bala (Lunar Fortnight Strength)
 * BPHS Ch. 27, v. 17-18
 */
export function calculatePakshaBala(
  planet: CanonicalBodyId,
  sunLonDeg: number,
  moonLonDeg: number,
): number {
  const diff = (moonLonDeg - sunLonDeg + 360.0) % 360.0;
  // Shukla Paksha: 0 to 180 (waxing). Krishna Paksha: 180 to 360 (waning).
  const elongation = diff <= 180.0 ? diff : 360.0 - diff;
  const beneficScore = (elongation / 180.0) * 60.0; // 0 at New Moon, 60 at Full Moon

  if (planet === "Moon") {
    // Moon's Paksha Bala is doubled according to BPHS Ch. 27 v. 18
    return beneficScore * 2.0;
  }

  // Benefics: Jupiter, Venus, Mercury (when well associated)
  if (planet === "Jupiter" || planet === "Venus" || planet === "Mercury") {
    return beneficScore;
  }

  // Malefics: Sun, Mars, Saturn get the reverse
  return 60.0 - beneficScore;
}

/**
 * 3. Calculate Tribhaga Bala (Three parts of day and night)
 * BPHS Ch. 27, v. 19
 */
export function calculateTribhagaBala(
  planet: CanonicalBodyId,
  birthDate: Date,
  sunriseDate: Date,
  sunsetDate: Date,
): number {
  // Jupiter always gets 60 Virupas in Tribhaga
  if (planet === "Jupiter") return 60.0;

  const birthMs = birthDate.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();
  const isDay = birthMs >= sunriseMs && birthMs <= sunsetMs;

  if (isDay) {
    const dayDuration = sunsetMs - sunriseMs;
    const partMs = dayDuration / 3.0;
    const elapsed = birthMs - sunriseMs;
    const partIndex = Math.min(2, Math.floor(elapsed / partMs)); // 0, 1, or 2

    if (partIndex === 0 && planet === "Mercury") return 60.0;
    if (partIndex === 1 && planet === "Sun") return 60.0;
    if (partIndex === 2 && planet === "Saturn") return 60.0;
  } else {
    // Night
    const nextSunriseMs = sunriseMs + 24 * 3600000;
    const nightDuration = nextSunriseMs - sunsetMs;
    const partMs = nightDuration / 3.0;
    const elapsed = birthMs >= sunsetMs ? birthMs - sunsetMs : birthMs + 24 * 3600000 - sunsetMs;
    const partIndex = Math.min(2, Math.max(0, Math.floor(elapsed / partMs)));

    if (partIndex === 0 && planet === "Moon") return 60.0;
    if (partIndex === 1 && planet === "Venus") return 60.0;
    if (partIndex === 2 && planet === "Mars") return 60.0;
  }

  return 0.0;
}

/**
 * 4. Calculate Ayana Bala (Declination Strength)
 * BPHS Ch. 27, v. 21
 * Max obliquity epsilon ~ 23.44°
 */
export function calculateAyanaBala(planet: CanonicalBodyId, declinationDeg: number): number {
  const maxObliquity = 23.44;
  const clampedDecl = Math.max(-maxObliquity, Math.min(maxObliquity, declinationDeg));

  let score = 0;
  if (
    planet === "Sun" ||
    planet === "Mars" ||
    planet === "Jupiter" ||
    planet === "Venus" ||
    planet === "Mercury"
  ) {
    // Northern declination favored
    score = ((maxObliquity + clampedDecl) / (2.0 * maxObliquity)) * 60.0;
  } else {
    // Moon and Saturn: Southern declination favored
    score = ((maxObliquity - clampedDecl) / (2.0 * maxObliquity)) * 60.0;
  }

  // For Sun, BPHS Ch. 27 v. 21 doubles Ayana Bala
  if (planet === "Sun") {
    score = score * 2.0;
  }

  return score;
}

/**
 * Complete Kala Bala calculation for a single planet
 */
export function calculateKalaBala(
  planet: CanonicalBodyId,
  context: KalaBalaTemporalContext,
): KalaBalaBreakdown {
  const natonnata = calculateNatonnataBala(
    planet,
    context.birthDate,
    context.sunriseDate,
    context.sunsetDate,
  );
  const paksha = calculatePakshaBala(planet, context.sunLonDeg, context.moonLonDeg);
  const tribhaga = calculateTribhagaBala(
    planet,
    context.birthDate,
    context.sunriseDate,
    context.sunsetDate,
  );

  // Period Rulers
  const varsha = context.varshaLord === planet ? 15.0 : 0.0;
  const masa = context.masaLord === planet ? 30.0 : 0.0;
  const dina = context.weekdayLord === planet ? 45.0 : 0.0;
  const hora = context.horaLord === planet ? 60.0 : 0.0;

  const declination = context.planetDeclinationsDeg[planet] ?? 0.0;
  const ayana = calculateAyanaBala(planet, declination);
  const yuddha = 0.0; // Standard 0 unless in planetary war

  const totalVirupas = natonnata + paksha + tribhaga + varsha + masa + dina + hora + ayana + yuddha;

  return {
    natonnataBala: natonnata,
    pakshaBala: paksha,
    tribhagaBala: tribhaga,
    varshaBala: varsha,
    masaBala: masa,
    dinaBala: dina,
    horaBala: hora,
    ayanaBala: ayana,
    yuddhaBala: yuddha,
    totalVirupas,
    totalRupas: totalVirupas / 60.0,
    formulaVersion: "BPHS-27.15-22",
    source: "Brihat Parashara Hora Shastra, Ch. 27, v. 15-22",
  };
}
