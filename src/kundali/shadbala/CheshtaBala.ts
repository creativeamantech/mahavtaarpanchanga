import { CanonicalBodyId } from "../astronomy/AstronomicalContext";
import { CheshtaBalaBreakdown, PlanetaryMotionState } from "./ShadbalaTypes";

/**
 * Classical Mean Daily Velocities (Degrees / Day)
 */
export const MEAN_DAILY_SPEEDS: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.1764,
  Mars: 0.524,
  Mercury: 1.3833,
  Jupiter: 0.0831,
  Venus: 1.2,
  Saturn: 0.0335,
  Rahu: 0.0529,
  Ketu: 0.0529,
};

/**
 * Calculates Cheshta Bala (Motional Strength) for a planet
 * BPHS Ch. 27, v. 23-27
 *
 * @param planet Canonical Graha identifier
 * @param dailySpeedDeg Daily motion in degrees per day (positive = direct, negative = retrograde)
 * @param isRetrograde Boolean flag
 * @param sunAyanaBala For Sun: Cheshta Bala = Ayana Bala
 * @param moonPakshaBala For Moon: Cheshta Bala = Paksha Bala
 */
export function calculateCheshtaBala(
  planet: CanonicalBodyId,
  dailySpeedDeg: number,
  isRetrograde: boolean,
  sunAyanaBala: number = 0,
  moonPakshaBala: number = 0,
): CheshtaBalaBreakdown {
  // 1. Sun's Cheshta Bala is Sun's Ayana Bala (BPHS Ch. 27 v. 27)
  if (planet === "Sun") {
    return {
      motionState: "sama",
      dailySpeedDeg,
      meanDailySpeedDeg: MEAN_DAILY_SPEEDS.Sun,
      isRetrograde: false,
      totalVirupas: sunAyanaBala,
      totalRupas: sunAyanaBala / 60.0,
      formulaVersion: "BPHS-27.27-Sun-Ayana",
      source: "Brihat Parashara Hora Shastra, Ch. 27, v. 27 (Sun inherits Ayana Bala)",
    };
  }

  // 2. Moon's Cheshta Bala is Moon's Paksha Bala (BPHS Ch. 27 v. 27)
  if (planet === "Moon") {
    return {
      motionState: "sama",
      dailySpeedDeg,
      meanDailySpeedDeg: MEAN_DAILY_SPEEDS.Moon,
      isRetrograde: false,
      totalVirupas: moonPakshaBala,
      totalRupas: moonPakshaBala / 60.0,
      formulaVersion: "BPHS-27.27-Moon-Paksha",
      source: "Brihat Parashara Hora Shastra, Ch. 27, v. 27 (Moon inherits Paksha Bala)",
    };
  }

  // 3. For the 5 Tara Grahas (Mars, Mercury, Jupiter, Venus, Saturn)
  const meanSpeed = MEAN_DAILY_SPEEDS[planet] ?? 1.0;
  let motionState: PlanetaryMotionState = "sama";
  let totalVirupas = 7.5;

  if (isRetrograde || dailySpeedDeg < -0.005) {
    motionState = "vakra";
    totalVirupas = 60.0;
  } else if (dailySpeedDeg >= -0.005 && dailySpeedDeg < 0.05 * meanSpeed) {
    motionState = "vikala"; // Stationary / turning direct
    totalVirupas = 15.0;
  } else if (dailySpeedDeg < 0.4 * meanSpeed) {
    motionState = "anuvakra"; // Resumed direct, slow
    totalVirupas = 30.0;
  } else if (dailySpeedDeg < 0.7 * meanSpeed) {
    motionState = "manda"; // Slow
    totalVirupas = 30.0;
  } else if (dailySpeedDeg < 0.85 * meanSpeed) {
    motionState = "mandatara"; // Very slow
    totalVirupas = 15.0;
  } else if (dailySpeedDeg <= 1.2 * meanSpeed) {
    motionState = "sama"; // Mean speed
    totalVirupas = 7.5;
  } else if (dailySpeedDeg <= 1.5 * meanSpeed) {
    motionState = "chara"; // Fast
    totalVirupas = 45.0;
  } else {
    motionState = "atichara"; // Super accelerated
    totalVirupas = 30.0;
  }

  return {
    motionState,
    dailySpeedDeg,
    meanDailySpeedDeg: meanSpeed,
    isRetrograde,
    totalVirupas,
    totalRupas: totalVirupas / 60.0,
    formulaVersion: "BPHS-27.23-26-8Gatis",
    source: "Brihat Parashara Hora Shastra, Ch. 27, v. 23-26 (Ashta Gati)",
  };
}
