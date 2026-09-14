const fs = require('fs');
let code = fs.readFileSync('src/horaEngine.ts', 'utf8');

code += `\nimport { PanchangaResponse } from "./types";

export interface CurrentHoraData {
  hora: Hora;
  tattva: TattvaPeriod | null;
}

export function resolveCurrentHora(
  nowMs: number,
  data: PanchangaResponse
): CurrentHoraData | null {
  const sunrise = data.sunrise_ms;
  const sunset = data.sunset_ms;
  const nextSunrise = data.next_sunrise_ms;
  
  if (!sunrise || !sunset || !nextSunrise) return null;

  // If before today's sunrise, use previous day's data
  if (nowMs < sunrise) {
    const prevSunrise = data.previous_sunrise_ms;
    const prevSunset = data.previous_sunset_ms;
    
    if (prevSunrise && prevSunset) {
      const prevWeekday = (data.weekday - 1 + 7) % 7;
      const prevHoras = computeDailyHoras(
        data.date,
        prevSunrise,
        prevSunset,
        sunrise,
        prevWeekday,
        data.tithi[0]?.number || 1,
        data.timezone,
        nowMs
      );
      if (prevHoras.activeHora) {
        return { hora: prevHoras.activeHora, tattva: prevHoras.activeTattva };
      }
    }
  } 
  // If between today's sunrise and tomorrow's sunrise
  else if (nowMs >= sunrise && nowMs < nextSunrise) {
    const todayHoras = computeDailyHoras(
      data.date,
      sunrise,
      sunset,
      nextSunrise,
      data.weekday,
      data.tithi[0]?.number || 1,
      data.timezone,
      nowMs
    );
    if (todayHoras.activeHora) {
      return { hora: todayHoras.activeHora, tattva: todayHoras.activeTattva };
    }
  }

  return null;
}
`;

fs.writeFileSync('src/horaEngine.ts', code);
