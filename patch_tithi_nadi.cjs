const fs = require('fs');
const file = 'src/lib/tithiTattvaEngine.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { getTithiSwaraRule }')) {
  content = content.replace(
    'import { computeSwaraYoga } from "../swaraYoga";',
    'import { computeSwaraYoga } from "../swaraYoga";\nimport { getTithiSwaraRule } from "./tithiSwaraEngine";'
  );
}

const targetStr = `    const startNadi = getCanonicalNadiAtTime(
      seg.startTimeMs,
      seg.number,
      panchangaData.sunrise,
      panchangaData.sunset,
      panchangaData.moonrise,
      panchangaData.moonset,
      panchangaData.timezone,
    );

    const endNadi = getCanonicalNadiAtTime(
      seg.endTimeMs,
      seg.number, // The Swara logic for the *end* of a Tithi should still technically use the day's base Tithi, but the boundary logic requires exact evaluation.
      panchangaData.sunrise,
      panchangaData.sunset,
      panchangaData.moonrise,
      panchangaData.moonset,
      panchangaData.timezone,
    );`;

const repStr = `    const tithiSwaraRule = getTithiSwaraRule(seg.number);
    const startNadi = tithiSwaraRule.startNadi;
    const endNadi = tithiSwaraRule.endNadi;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, repStr);
  fs.writeFileSync(file, content);
  console.log('patched tithi start/end nadi');
} else {
  console.log('could not find target string in tithiTattvaEngine.ts');
}
