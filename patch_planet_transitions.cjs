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
  helpers + '\\nexport const PlanetTransitionsCard'
);

// 3. Add now state inside component
const hookTarget = '  const isNight = theme === "nightSky";';
const hookReplace = \`  const isNight = theme === "nightSky";

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);\`;

content = content.replace(hookTarget, hookReplace);

// 4. Update the "Today's Ingress Alert Banner" ev.relativeText usage
const alertTarget = \`                        <span className="text-amber-800 font-sans font-semibold">
                          ({ev.relativeText})
                        </span>\`;
const alertReplace = \`                        <span className="text-amber-800 font-sans font-semibold">
                          ({getRealtimeRelativeText(new Date(ev.timestamp).getTime(), now, lang)})
                        </span>\`;
content = content.replace(alertTarget, alertReplace);

// 5. Update the Timeline list rendering for "Completed", "Ongoing", "Upcoming" and the relative text
const listTarget = \`                    <div
                      className={\\\`flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0 \${
                        isNight ? "border-indigo-900/40" : "border-stone-100"
                      }\\\`}
                    >
                      <span
                        className={\\\`rounded-full px-2.5 py-0.5 text-xs font-bold font-sans border \${
                          isNight
                            ? "bg-amber-900/40 text-amber-300 border-amber-900/60"
                            : "bg-amber-100/80 text-amber-900 border-amber-200"
                        }\\\`}
                      >
                        {ev.relativeText}
                      </span>\`;

const listReplace = \`                    <div
                      className={\\\`flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0 \${
                        isNight ? "border-indigo-900/40" : "border-stone-100"
                      }\\\`}
                    >
                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5">
                        <span
                          className={\\\`rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider font-sans border \${getStatusBadgeStyle(getEventStatus(new Date(ev.timestamp).getTime(), now, lang).status, isNight)}\\\`}
                        >
                          {getEventStatus(new Date(ev.timestamp).getTime(), now, lang).label}
                        </span>
                        <span
                          className={\\\`rounded-full px-2.5 py-0.5 text-[11px] font-bold font-sans border \${
                            isNight
                              ? "bg-amber-900/30 text-amber-300/80 border-amber-900/40"
                              : "bg-amber-50 text-amber-800 border-amber-200/50"
                          }\\\`}
                        >
                          {getRealtimeRelativeText(new Date(ev.timestamp).getTime(), now, lang)}
                        </span>
                      </div>\`;

content = content.replace(listTarget, listReplace);

fs.writeFileSync(file, content);
console.log('patched card');
