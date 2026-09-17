const fs = require("fs");

let code = fs.readFileSync("src/components/TattvaView.tsx", "utf8");

const horaSectionJSX = `
      {/* HORA TATTVA */}
      {activeHora && (
        <div className={\`p-5 rounded-2xl border \${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}\`}>
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            {lang === "hi" ? "होरा तत्व (वर्तमान)" : "Hora Tattva (Current Hora)"}
          </h3>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-black/20">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">Current Hora</div>
              <div className="text-lg font-bold font-serif-vedic">{activeHora.planet}</div>
            </div>
            <div className="flex gap-6">
               <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">Start</div>
                  <div className="text-sm font-bold">{activeHora.startTime}</div>
               </div>
               <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">End</div>
                  <div className="text-sm font-bold">{activeHora.endTime}</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">Duration</div>
                  <div className="text-sm font-bold">{Math.floor(activeHora.durationMs / 60000)} mins</div>
               </div>
            </div>
          </div>

          <div className="space-y-2">
             <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Five Tattvas Sequence (15/15)</div>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
               {activeHora.tattvas.map((t, idx) => {
                 const isTattvaActive = activeHoraTattva?.sanskrit === t.sanskrit;
                 return (
                   <div key={idx} className={\`p-3 rounded-xl border \${isTattvaActive ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-stone-100 dark:border-white/5"}\`}>
                     <div className="flex justify-between items-center mb-2">
                        <span className={\`text-sm font-bold \${isTattvaActive ? "text-emerald-700 dark:text-emerald-300" : ""}\`}>{t.sanskrit}</span>
                        {isTattvaActive && <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>}
                     </div>
                     <div className="text-[10px] opacity-70">{t.name}</div>
                     <div className="text-xs font-mono mt-1">{t.startTime} - {t.endTime}</div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  `{/* KARANA TATTVA CYCLE */}`,
  horaSectionJSX + `\n\n      {/* KARANA TATTVA CYCLE */}`,
);

fs.writeFileSync("src/components/TattvaView.tsx", code);
