const fs = require('fs');
let code = fs.readFileSync('src/components/NavtaraView.tsx', 'utf8');

// Render net intensity and Vedha Assessment if it exists
const vedhaBlock = `
              {currentTara.vedha_assessment?.is_neutralized && (
                <div className={\`mt-4 p-3 rounded-lg border text-left \${
                  theme === "nightSky" ? "bg-indigo-950/40 border-indigo-500/30" : "bg-emerald-50 border-emerald-200"
                }\`}>
                  <h4 className={\`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1 \${
                    theme === "nightSky" ? "text-indigo-300" : "text-emerald-700"
                  }\`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Tara-Gochara Vedha Active (Neutralized)
                  </h4>
                  <p className={\`text-xs \${theme === "nightSky" ? "text-slate-300" : "text-stone-600"}\`}>
                    {currentTara.vedha_assessment.neutralization_reason}
                  </p>
                  <div className="mt-2 text-[10px] uppercase font-bold tracking-wider">
                    <span className={\`px-2 py-1 rounded-md \${theme === "nightSky" ? "bg-black/40 text-slate-300" : "bg-white text-stone-600"}\`}>
                      Net Malefic Intensity: {currentTara.net_intensity_percentage}%
                    </span>
                  </div>
                </div>
              )}
`;

code = code.replace(/\{currentTara\.parihara && \(/, vedhaBlock + `\n              {currentTara.parihara && (`);

fs.writeFileSync('src/components/NavtaraView.tsx', code);
