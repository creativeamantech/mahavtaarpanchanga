const fs = require('fs');
const file = 'src/components/NextMajorIngressWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

const helper = `
function getRelativeTime(targetDateMs: number, nowMs: number, lang: string): string {
  const diffMs = targetDateMs - nowMs;
  if (diffMs < 0) return lang === "hi" ? "हो चुका है" : "Already passed";
  
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const remMins = totalMinutes % 60;
  
  if (days === 0) {
    if (totalHours === 0) {
      return lang === "hi" ? \`\${remMins} मिनट में\` : \`in \${remMins}m\`;
    }
    return lang === "hi" ? \`\${totalHours} घंटे \${remMins} मिनट में\` : \`in \${totalHours}h \${remMins}m\`;
  }
  if (days === 1) {
    return lang === "hi" ? \`कल (\${remHours} घंटे शेष)\` : \`in 1d \${remHours}h\`;
  }
  return lang === "hi" ? \`\${days} दिन \${remHours} घंटे में\` : \`in \${days}d \${remHours}h\`;
}
`;

// insert helper before the component
content = content.replace(
  'export const NextMajorIngressWidget',
  helper + '\nexport const NextMajorIngressWidget'
);

// replace usage of relativeText
content = content.replace(
  '{nextMajorIngress.relativeText}',
  '{getRelativeTime(new Date(nextMajorIngress.timestamp).getTime(), now, lang)}'
);

fs.writeFileSync(file, content);
console.log('patched relative text');
