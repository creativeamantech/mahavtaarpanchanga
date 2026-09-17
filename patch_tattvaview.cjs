const fs = require("fs");

let code = fs.readFileSync("src/components/TattvaView.tsx", "utf8");
code = code.replace(`export function KaranaTattvaView`, `export function TattvaView`);

// Add imports
code = code.replace(
  `import { Clock, Droplets, Wind, Mountain, Flame, CircleDot, Activity, CalendarDays } from "lucide-react";`,
  `import { Clock, Droplets, Wind, Mountain, Flame, CircleDot, Activity, CalendarDays, Hourglass, Layers } from "lucide-react";\nimport { getVaraTattva, ELEMENT_UI_DATA, NADI_UI_DATA, VARA_TATTVA_MAPPING } from "../lib/varaTattvaEngine";\nimport { resolveCurrentHora } from "../horaEngine";`,
);

// We need to fetch current Hora Tattva, Vara, etc.
// Look for `const activePeriod = getActiveKaranaTattva(now, cycle);`
code = code.replace(
  `const activePeriod = getActiveKaranaTattva(now, cycle);`,
  `const activePeriod = getActiveKaranaTattva(now, cycle);

  const varaTattva = panchangaData ? getVaraTattva(panchangaData.weekday) : null;
  const currentLiveHoraData = panchangaData ? resolveCurrentHora(now, panchangaData) : null;
  const activeHora = currentLiveHoraData?.hora || null;
  const activeHoraTattva = currentLiveHoraData?.tattva || null;
  
  const getHoraTattvaRemaining = () => {
    if (!activeHoraTattva) return null;
    return Math.max(0, activeHoraTattva.endTimeMs - now);
  };
`,
);

// We need to insert the Current State section at the top of the space-y-6 container
// Look for `<div className="space-y-6">`
const currentStateJSX = `
      {/* CURRENT STATE OVERVIEW */}
      <div className={\`p-5 rounded-2xl border \${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}\`}>
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-500" />
          {lang === "hi" ? "वर्तमान तत्व स्थिति" : "Current State"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">Vara (Weekday)</div>
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {varaTattva ? (lang === "hi" ? NADI_UI_DATA[varaTattva.nadi].hi : varaTattva.weekdayName) : "-"}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Element</div>
                <div className="text-sm font-medium">{varaTattva ? ELEMENT_UI_DATA[varaTattva.element][lang as "en" | "hi"] : "-"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider opacity-70">Nadi</div>
                <div className="text-sm font-medium">{varaTattva ? NADI_UI_DATA[varaTattva.nadi][lang as "en" | "hi"] : "-"}</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">Hora Tattva</div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {activeHoraTattva ? activeHoraTattva.sanskrit : "-"}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Hora</div>
                <div className="text-sm font-medium">{activeHora ? activeHora.planet : "-"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider opacity-70">Remaining</div>
                <div className="text-sm font-medium font-mono">{activeHoraTattva ? formatTimeRemaining(getHoraTattvaRemaining() || 0) : "-"}</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
            <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">Karana Tattva</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {activePeriod ? activePeriod.element : "-"}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Start</div>
                <div className="text-sm font-medium">{activePeriod ? formatDate(activePeriod.startTime) : "-"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider opacity-70">End</div>
                <div className="text-sm font-medium">{activePeriod ? formatDate(activePeriod.endTime) : "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* VARA ELEMENT & NADI */}
      <div className={\`p-5 rounded-2xl border \${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}\`}>
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-sky-500" />
          {lang === "hi" ? "वार तत्व एवं नाड़ी" : "Vara Element & Nadi"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="border-b border-stone-200 dark:border-white/10">
                <th className="py-2 px-3 text-xs uppercase tracking-wider opacity-70">Vara</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider opacity-70">Element</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider opacity-70">Nadi</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(VARA_TATTVA_MAPPING).sort((a,b) => a.weekday === 0 ? 7 : (b.weekday === 0 ? -7 : a.weekday - b.weekday)).map(v => (
                <tr key={v.weekday} className={\`border-b last:border-0 border-stone-100 dark:border-white/5 \${varaTattva?.weekday === v.weekday ? (theme === "nightSky" ? "bg-indigo-900/30" : "bg-indigo-50/50") : ""}\`}>
                  <td className="py-2.5 px-3 text-sm font-medium">{v.weekdayName} {v.weekday === 4 && "(Thu)"}</td>
                  <td className="py-2.5 px-3 text-sm">{ELEMENT_UI_DATA[v.element][lang as "en" | "hi"]}</td>
                  <td className="py-2.5 px-3 text-sm">{NADI_UI_DATA[v.nadi][lang as "en" | "hi"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

`;

code = code.replace(`<div className="space-y-6">`, `<div className="space-y-6">` + currentStateJSX);

// Helper function for time remaining
code = code.replace(
  `function formatTime(ms: number) {`,
  `function formatTimeRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return \`\${m}m \${s}s\`;
}

function formatTime(ms: number) {`,
);

// Rename 'Header Info' to 'Karana Tattva Cycle'
code = code.replace(
  `{/* Header Info */}`,
  `{/* KARANA TATTVA CYCLE */}
      <h3 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2 mt-8 mb-2">
         <Activity className="w-4 h-4 text-amber-600" />
         {lang === "hi" ? "कारण तत्व चक्र" : "Karana Tattva Cycle"}
      </h3>`,
);

fs.writeFileSync("src/components/TattvaView.tsx", code);
