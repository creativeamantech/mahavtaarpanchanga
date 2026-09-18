const fs = require('fs');
const file = 'src/components/PlanetaryPositionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('getRealtimeRelativeText')) {
  // 1. imports
  content = content.replace(
    'import React, { useState } from "react";',
    'import React, { useState, useEffect } from "react";'
  );

  // 2. Add helpers
  const helpers = `
function getRealtimeRelativeText(targetDateMs: number, nowMs: number, lang: string): string {
  const diffMs = targetDateMs - nowMs;
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);
  
  const totalMinutes = Math.floor(absMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const remMins = totalMinutes % 60;
  
  if (days === 0) {
    if (totalHours === 0) {
      if (lang === "hi") return isPast ? \`\${remMins} मिनट पहले\` : \`\${remMins} मिनट में\`;
      return isPast ? \`\${remMins}m ago\` : \`in \${remMins}m\`;
    }
    if (lang === "hi") return isPast ? \`\${totalHours} घंटे \${remMins} मिनट पहले\` : \`\${totalHours} घंटे \${remMins} मिनट में\`;
    return isPast ? \`\${totalHours}h \${remMins}m ago\` : \`in \${totalHours}h \${remMins}m\`;
  }
  if (days === 1) {
    if (lang === "hi") return isPast ? \`कल\` : \`कल (\${remHours} घंटे शेष)\`;
    return isPast ? \`yesterday\` : \`in 1d \${remHours}h\`;
  }
  if (lang === "hi") return isPast ? \`\${days} दिन पहले\` : \`\${days} दिन \${remHours} घंटे में\`;
  return isPast ? \`\${days}d ago\` : \`in \${days}d \${remHours}h\`;
}
`;

  content = content.replace(
    'export const PlanetaryPositionsCard',
    helpers + '\nexport const PlanetaryPositionsCard'
  );
  
  // 3. Add hook inside component
  const hookTarget = `  const isNight = theme === "nightSky";`;
  const hookReplace = `  const isNight = theme === "nightSky";

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);`;
  content = content.replace(hookTarget, hookReplace);

  // 4. Replace text
  content = content.replace(
    '{nextRasi.relativeText}',
    '{getRealtimeRelativeText(new Date(nextRasi.timestamp).getTime(), now, lang)}'
  );

  fs.writeFileSync(file, content);
  console.log('patched table');
} else {
  console.log('already patched?');
}
