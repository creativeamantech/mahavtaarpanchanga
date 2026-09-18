const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update imports
content = content.replace(
  'import React, { useState, useMemo } from "react";',
  'import React, { useState, useMemo, useEffect } from "react";'
);

// 2. Insert helpers
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

function getEventStatus(targetDateMs: number, nowMs: number, lang: string) {
  const diffHours = (targetDateMs - nowMs) / 3600000;
  if (diffHours < -2) return { status: 'completed', label: lang === 'hi' ? 'संपन्न (Completed)' : 'Completed' };
  if (diffHours >= -2 && diffHours <= 2) return { status: 'ongoing', label: lang === 'hi' ? 'चल रहा है (Ongoing)' : 'Ongoing' };
  return { status: 'upcoming', label: lang === 'hi' ? 'आगामी (Upcoming)' : 'Upcoming' };
}

function getStatusBadgeStyle(status: string, isNight: boolean) {
  if (status === 'completed') {
    return isNight 
      ? 'bg-stone-800/80 text-stone-300 border-stone-700/60' 
      : 'bg-stone-100 text-stone-600 border-stone-200';
  }
  if (status === 'ongoing') {
    return isNight 
      ? 'bg-emerald-900/80 text-emerald-300 border-emerald-800' 
      : 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-200/50';
  }
  return isNight 
    ? 'bg-indigo-900/80 text-indigo-300 border-indigo-800' 
    : 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm shadow-indigo-200/50';
}
`;

content = content.replace(
  'export const PlanetTransitionsCard',
  helpers + '\nexport const PlanetTransitionsCard'
);
fs.writeFileSync(file, content);
console.log('Helpers injected');
