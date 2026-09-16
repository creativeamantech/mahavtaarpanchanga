const fs = require('fs');
let code = fs.readFileSync('src/components/NavtaraView.tsx', 'utf8');

const targetStr = `{/* Tara Dasa Sequence Section */}`;

const newSection = `
      {/* Dedicated Remedial Measures Section */}
      <div className={\`p-6 rounded-2xl border mt-8 \${
        theme === "nightSky" 
          ? "bg-[#0b101e]/80 border-indigo-900/50" 
          : "bg-white border-stone-200 shadow-sm"
      }\`}>
        <div className="mb-6">
          <h3 className={\`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2 \${
            theme === "nightSky" ? "text-rose-400" : "text-rose-700"
          }\`}>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Navtara Remedial Measures (Parihara)
          </h3>
          <p className={\`text-sm max-w-2xl \${theme === "nightSky" ? "text-slate-400" : "text-stone-500"}\`}>
            Classical Vedic remedies for the naturally sensitive or inauspicious Taras. Following these guidelines helps neutralize malefic effects during adverse planetary transits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {table.filter(t => t.paryaya === 1 && t.parihara).map((tara, idx) => (
            <div key={idx} className={\`p-5 rounded-xl border flex flex-col gap-4 \${
              theme === "nightSky" ? "bg-rose-950/10 border-rose-900/30" : "bg-rose-50/50 border-rose-100"
            }\`}>
              <div className="flex items-center gap-3 border-b pb-3 border-black/5 dark:border-white/5">
                <span className={\`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md \${
                  tara.tara_number === 7 ? "bg-rose-600 text-white" : 
                  tara.tara_number === 3 || tara.tara_number === 5 ? "bg-orange-500 text-white" :
                  "bg-stone-500 text-white"
                }\`}>
                  {tara.tara_number}. {tara.tara_name} Tara
                </span>
                <span className={\`text-xs font-bold \${theme === "nightSky" ? "text-slate-300" : "text-stone-600"}\`}>
                  {tara.nature.replace(/ \\/ Mixed|Severely |Highly /g, '')}
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className={\`font-bold shrink-0 w-16 \${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}\`}>Deity</span>
                  <span className={\`font-medium \${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}\`}>{tara.parihara.deity_to_worship}</span>
                </div>
                <div className="flex gap-3">
                  <span className={\`font-bold shrink-0 w-16 \${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}\`}>Mantra</span>
                  <span className={\`font-medium \${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}\`}>{tara.parihara.recommended_mantra}</span>
                </div>
                <div className="flex gap-3">
                  <span className={\`font-bold shrink-0 w-16 \${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}\`}>Donate</span>
                  <span className={\`font-medium \${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}\`}>{tara.parihara.recommended_donation}</span>
                </div>
                <div className="flex gap-3">
                  <span className={\`font-bold shrink-0 w-16 \${theme === "nightSky" ? "text-rose-300/80" : "text-rose-800/70"}\`}>Avoid</span>
                  <span className={\`font-medium \${theme === "nightSky" ? "text-slate-200" : "text-stone-800"}\`}>{tara.parihara.avoid_activities.join(", ")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      `;

code = code.replace(targetStr, newSection + targetStr);
fs.writeFileSync('src/components/NavtaraView.tsx', code);
