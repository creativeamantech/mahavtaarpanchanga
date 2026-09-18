const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const { days, hours, minutes, isPast } = getCountdownParts(new Date(nextMajorIngress.timestamp).getTime(), now);`;

const repStr = `  // Calculate against the real-time clock, but allow negative values for past events
  const targetDateMs = new Date(nextMajorIngress.timestamp).getTime();
  const { days, hours, minutes, isPast } = getCountdownParts(targetDateMs, now);`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('patched countdown parameters');
