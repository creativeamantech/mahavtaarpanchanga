const fs = require('fs');
const file = 'src/components/TattvaView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `const activeTithiNum = currentTithiTattva ? currentTithiTattva.tithi : (panchangaData.tithi?.[0]?.number || 1);`;

const repStr = `const activeTithiNum = currentTithiTattva ? (currentTithiTattva.paksha === "Krishna" ? currentTithiTattva.tithi + 15 : currentTithiTattva.tithi) : (panchangaData.tithi?.[0]?.number || 1);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, repStr);
  fs.writeFileSync(file, content);
  console.log('patched activeTithiNum back to 1-30');
} else {
  console.log('could not find target string in TattvaView.tsx');
}
