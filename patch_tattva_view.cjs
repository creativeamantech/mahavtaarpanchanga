const fs = require("fs");
let code = fs.readFileSync("src/components/TattvaView.tsx", "utf8");

// 1. Add imports
const imports = `import { computeTithiTattvaPeriods, getCanonicalNadiAtTime, TithiTattvaPeriod } from "../lib/tithiTattvaEngine";
import { computeSwaraYoga } from "../swaraYoga";`;
code = code.replace(
  'import { resolveCurrentHora } from "../horaEngine";',
  imports + '\nimport { resolveCurrentHora } from "../horaEngine";',
);

// 2. Inside TattvaView
const calculateTithiTattva = `
  const tithiTattvaPeriods = useMemo(() => {
    if (!panchangaData) return [];
    return computeTithiTattvaPeriods(panchangaData);
  }, [panchangaData]);

  const currentTithiTattva = useMemo(() => {
    return tithiTattvaPeriods.find(p => p.startTime <= now && now < p.endTime) || tithiTattvaPeriods[0];
  }, [tithiTattvaPeriods, now]);

  const currentNadi = useMemo(() => {
    if (!panchangaData) return "ida";
    const primaryTithiNum = panchangaData.tithi?.[0]?.number || 1;
    return getCanonicalNadiAtTime(
      now,
      primaryTithiNum,
      panchangaData.sunrise,
      panchangaData.sunset,
      panchangaData.moonrise,
      panchangaData.moonset,
      panchangaData.timezone
    );
  }, [now, panchangaData]);
`;

code = code.replace(
  "const overlaps = useMemo(() => {",
  calculateTithiTattva + "\n  const overlaps = useMemo(() => {",
);

// 3. Add the UI blocks
const uiBlocks = `

      {/* CURRENT TATTVA (LIVE STATE) */}
      <div
        className={\`p-5 rounded-2xl border \${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}\`}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          {lang === "hi" ? "वर्तमान तत्त्व" : "Current Tattva"}
        </h3>
        
        {currentTithiTattva ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                {lang === "hi" ? "वर्तमान तिथि" : "Current Tithi"}
              </div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {currentTithiTattva.paksha} {currentTithiTattva.tithi}
              </div>
            </div>
            
            <div className="flex gap-8">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  {lang === "hi" ? "तत्व" : "Element"}
                </div>
                <div className="text-lg font-bold flex items-center gap-2">
                  {currentTithiTattva.startElement === "jala" && <Droplets className="w-4 h-4 text-cyan-500" />}
                  {currentTithiTattva.startElement === "prithvi" && <Mountain className="w-4 h-4 text-amber-500" />}
                  {currentTithiTattva.startElement === "vayu" && <Wind className="w-4 h-4 text-sky-500" />}
                  {currentTithiTattva.startElement === "tejas" && <Flame className="w-4 h-4 text-rose-500" />}
                  {currentTithiTattva.startElement === "akash" && <CircleDot className="w-4 h-4 text-indigo-500" />}
                  
                  <span className="capitalize">{currentTithiTattva.startElement}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  {lang === "hi" ? "वर्तमान नाड़ी" : "Current Nadi"}
                </div>
                <div className="text-lg font-bold capitalize">
                  {currentNadi}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm opacity-70">
            {lang === "hi" ? "जानकारी लोड हो रही है..." : "Loading data..."}
          </div>
        )}
      </div>

      {/* TITHI TATTVA & NADI */}
      <div
        className={\`p-5 rounded-2xl border \${theme === "nightSky" ? "bg-[#0b101e]/80 border-indigo-900/50 text-slate-300" : "bg-white border-stone-200 text-stone-700 shadow-sm"}\`}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-fuchsia-500" />
          {lang === "hi" ? "तिथि तत्व एवं नाड़ी" : "Tithi Tattva & Nadi"}
        </h3>
        
        {currentTithiTattva && (
          <div className="flex gap-4">
            {/* Start Panel */}
            <div className="flex-1 p-4 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-2">
                {lang === "hi" ? "आरंभ" : "Start"}
              </div>
              <div className="font-mono text-sm font-bold mb-3">{formatTime(currentTithiTattva.startTime)}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "तत्व" : "Start Element"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.startElement}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "नाड़ी" : "Start Nadi"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.startNadi}</span>
                </div>
              </div>
            </div>

            {/* End Panel */}
            <div className="flex-1 p-4 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-2">
                {lang === "hi" ? "समापन" : "End"}
              </div>
              <div className="font-mono text-sm font-bold mb-3">{formatTime(currentTithiTattva.endTime)}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "तत्व" : "End Element"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.endElement}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">{lang === "hi" ? "नाड़ी" : "End Nadi"}</span>
                  <span className="font-bold capitalize">{currentTithiTattva.endNadi}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tithi Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-stone-200 dark:border-white/10">
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">Paksha</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">Tithi</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">Start Time</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">Start Element</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">Start Nadi</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">End Time</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">End Element</th>
                <th className="py-2 px-3 text-[10px] uppercase font-bold tracking-wider opacity-70">End Nadi</th>
              </tr>
            </thead>
            <tbody>
              {tithiTattvaPeriods.map((t, idx) => {
                const isActive = t === currentTithiTattva;
                return (
                  <tr key={idx} className={\`border-b last:border-0 border-stone-100 dark:border-white/5 \${isActive ? (theme === "nightSky" ? "bg-fuchsia-900/20" : "bg-fuchsia-50") : ""}\`}>
                    <td className="py-2.5 px-3 text-xs font-medium">{t.paksha}</td>
                    <td className="py-2.5 px-3 text-xs font-bold">{t.tithi}</td>
                    <td className="py-2.5 px-3 text-xs font-mono">{formatTime(t.startTime)}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.startElement}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.startNadi}</td>
                    <td className="py-2.5 px-3 text-xs font-mono">{formatTime(t.endTime)}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.endElement}</td>
                    <td className="py-2.5 px-3 text-xs capitalize">{t.endNadi}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
`;

code = code.replace("{/* HORA TATTVA */}", uiBlocks + "\n      {/* HORA TATTVA */}");

fs.writeFileSync("src/components/TattvaView.tsx", code);
