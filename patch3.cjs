const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                      <span
                        className={\`rounded-full px-2.5 py-0.5 text-xs font-bold font-sans border \${
                          isNight
                            ? "bg-amber-900/40 text-amber-300 border-amber-900/60"
                            : "bg-amber-100/80 text-amber-900 border-amber-200"
                        }\`}
                      >
                        {getRealtimeRelativeText(new Date(ev.timestamp).getTime(), now, lang)}
                      </span>`;

const repStr = `                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5">
                        <span
                          className={\`rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider font-sans border \${getStatusBadgeStyle(getEventStatus(new Date(ev.timestamp).getTime(), now, lang).status, isNight)}\`}
                        >
                          {getEventStatus(new Date(ev.timestamp).getTime(), now, lang).label}
                        </span>
                        <span
                          className={\`rounded-full px-2.5 py-0.5 text-[11px] font-bold font-sans border \${
                            isNight
                              ? "bg-amber-900/30 text-amber-300/80 border-amber-900/40"
                              : "bg-amber-50 text-amber-800 border-amber-200/50"
                          }\`}
                        >
                          {getRealtimeRelativeText(new Date(ev.timestamp).getTime(), now, lang)}
                        </span>
                      </div>`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('Badge injected');
