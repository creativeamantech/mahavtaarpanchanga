const fs = require('fs');
let code = fs.readFileSync('src/components/NavtaraView.tsx', 'utf8');

// Also need to import Heart or another icon for Parihara. I'll just use what's available or add some.
code = code.replace(/import \{ Star, Compass, ArrowRight, ShieldCheck, AlertTriangle \} from "lucide-react";/, 'import { Star, Compass, ArrowRight, ShieldCheck, AlertTriangle, Info, HeartHandshake } from "lucide-react";');

const pariharaBlock = `
              {currentTara.parihara && (
                <div className={\`mt-4 p-3 rounded-lg border text-left \${
                  theme === "nightSky" ? "bg-rose-950/20 border-rose-900/50" : "bg-rose-50 border-rose-100"
                }\`}>
                  <h4 className={\`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2 \${
                    theme === "nightSky" ? "text-rose-400" : "text-rose-700"
                  }\`}>
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Parihara (Remedies)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex gap-2">
                      <span className={\`font-semibold shrink-0 \${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}\`}>Deity:</span>
                      <span className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}>{currentTara.parihara.deity_to_worship}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={\`font-semibold shrink-0 \${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}\`}>Mantra:</span>
                      <span className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}>{currentTara.parihara.recommended_mantra}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={\`font-semibold shrink-0 \${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}\`}>Donate:</span>
                      <span className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}>{currentTara.parihara.recommended_donation}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={\`font-semibold shrink-0 \${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}\`}>Avoid:</span>
                      <span className={theme === "nightSky" ? "text-slate-200" : "text-stone-800"}>{currentTara.parihara.avoid_activities.join(", ")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>`;

code = code.replace(/              <\/p>\n            <\/div>/, `              </p>${pariharaBlock}`);

fs.writeFileSync('src/components/NavtaraView.tsx', code);
