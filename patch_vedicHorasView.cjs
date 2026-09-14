const fs = require('fs');
let code = fs.readFileSync('src/components/VedicHorasView.tsx', 'utf8');

code = code.replace(
  /import { DailyHoras, Hora, TattvaPeriod, computeDailyHoras } from "\.\.\/horaEngine";/,
  'import { DailyHoras, Hora, TattvaPeriod, computeDailyHoras, resolveCurrentHora, CurrentHoraData } from "../horaEngine";'
);

code = code.replace(
  /const { activeHora, activeTattva } = dailyHoras;/g,
  `// Current Hora resolution
  const currentLiveHoraData = resolveCurrentHora(now, panchangaData);
  const activeHora = currentLiveHoraData?.hora || null;
  const activeTattva = currentLiveHoraData?.tattva || null;
  `
);

fs.writeFileSync('src/components/VedicHorasView.tsx', code);
