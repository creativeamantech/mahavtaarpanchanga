const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `              return (
                <div
                  key={ev.id}
                  id={\`timeline-event-\${ev.id}\`}
                  className={\`rounded-2xl border p-4 transition-all \${
                    ev.isToday
                      ? isNight
                        ? "border-amber-700/50 bg-amber-900/20 shadow-xs ring-1 ring-amber-700/30"
                        : "border-amber-300 bg-amber-50/40 shadow-xs ring-1 ring-amber-300/40"
                      : isNight
                        ? "border-indigo-900/40 bg-[#12182b] hover:border-indigo-600"
                        : "border-stone-200/70 bg-white hover:border-amber-200"
                  }\`}
                >`;

const repStr = `              return (
                <div
                  key={ev.id}
                  id={\`timeline-event-\${ev.id}\`}
                  className={\`rounded-xl border p-4 transition-all \${
                    ev.isToday
                      ? isNight
                        ? "border-amber-700/50 bg-amber-900/10 shadow-xs"
                        : "border-amber-300 bg-amber-50/20 shadow-xs"
                      : isNight
                        ? "border-indigo-900/40 bg-transparent hover:border-indigo-600"
                        : "border-stone-200 bg-transparent hover:border-stone-300"
                  }\`}
                >`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('patched timeline cards');
