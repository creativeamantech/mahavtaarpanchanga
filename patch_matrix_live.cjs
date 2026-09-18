const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr1 = `                          <span
                            className={\`font-mono font-bold rounded px-1.5 py-0.5 \${
                              isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100/60 text-amber-900"
                            }\`}
                          >
                            {nextRasi.relativeText}
                          </span>`;

const repStr1 = `                          <span
                            className={\`font-mono font-bold rounded px-1.5 py-0.5 \${
                              isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100/60 text-amber-900"
                            }\`}
                          >
                            {getRealtimeRelativeText(new Date(nextRasi.timestamp).getTime(), now, lang)}
                          </span>`;

content = content.replace(targetStr1, repStr1);

const targetStr2 = `                      <div className="flex items-center justify-between text-[11px] font-sans">
                        <span className={isNight ? "text-slate-500" : "text-stone-400"}>
                          {lang === "hi" ? "नक्षत्र प्रवेश:" : "Nak. Ingress:"}
                        </span>
                        <div className="text-right space-x-1">
                          <span
                            className={\`font-bold font-devanagari \${isNight ? "text-slate-300" : "text-stone-700"}\`}
                          >
                            {nextNak.toName || nextNak.toValue}
                          </span>
                          <span className={isNight ? "text-slate-500" : "text-stone-500"}>
                            ({nextNak.relativeText})
                          </span>
                        </div>
                      </div>`;

const repStr2 = `                      <div className="flex items-center justify-between text-[11px] font-sans">
                        <span className={isNight ? "text-slate-500" : "text-stone-400"}>
                          {lang === "hi" ? "नक्षत्र प्रवेश:" : "Nak. Ingress:"}
                        </span>
                        <div className="text-right space-x-1">
                          <span
                            className={\`font-bold font-devanagari \${isNight ? "text-slate-300" : "text-stone-700"}\`}
                          >
                            {nextNak.toName || nextNak.toValue}
                          </span>
                          <span className={isNight ? "text-slate-500" : "text-stone-500"}>
                            ({getRealtimeRelativeText(new Date(nextNak.timestamp).getTime(), now, lang)})
                          </span>
                        </div>
                      </div>`;

content = content.replace(targetStr2, repStr2);

fs.writeFileSync(file, content);
console.log('patched live countdown in matrix view');
