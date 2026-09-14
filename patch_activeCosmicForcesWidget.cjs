const fs = require("fs");
let code = fs.readFileSync("src/components/ActiveCosmicForcesWidget.tsx", "utf8");

code = code.replace(
  /import { computeDailyHoras } from "\.\.\/horaEngine";/,
  'import { computeDailyHoras, resolveCurrentHora } from "../horaEngine";',
);

code = code.replace(
  /const horas = computeDailyHoras\([\s\S]*?\);\n  const activeHora = horas\.activeHora;/m,
  `const currentLiveHoraData = resolveCurrentHora(now.getTime(), data);
  const activeHora = currentLiveHoraData?.hora || null;`,
);

fs.writeFileSync("src/components/ActiveCosmicForcesWidget.tsx", code);
