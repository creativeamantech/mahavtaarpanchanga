const fs = require("fs");

let code = fs.readFileSync("src/components/TattvaView.tsx", "utf8");

// 1. Fix the Current State "Vara (Weekday)" Hindi translation
code = code.replace(
  /\{varaTattva\s*\?\s*lang === "hi"\s*\?\s*NADI_UI_DATA\[varaTattva\.nadi\]\.hi\s*:\s*varaTattva\.weekdayName\s*:\s*"-"\}/g,
  `{varaTattva ? (lang === "hi" ? ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][varaTattva.weekday] : varaTattva.weekdayName) : "-"}`,
);

// 2. Replace the table with a card
const tableRegex = /<div className="overflow-x-auto">[\s\S]*?<\/table>\s*<\/div>/;

const newCard = `{varaTattva ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                {lang === "hi" ? "आज का वार" : "Current Vara"}
              </div>
              <div className="text-xl font-bold text-sky-700 dark:text-sky-300">
                {lang === "hi" ? ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"][varaTattva.weekday] : varaTattva.weekdayName} {varaTattva.weekday === 4 && !lang.includes("hi") ? "(Thu)" : ""}
              </div>
            </div>
            
            <div className="flex gap-8">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  {lang === "hi" ? "तत्व" : "Element"}
                </div>
                <div className="text-lg font-bold">
                  {ELEMENT_UI_DATA[varaTattva.element][lang as "en" | "hi"]}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1">
                  {lang === "hi" ? "नाड़ी" : "Nadi"}
                </div>
                <div className="text-lg font-bold">
                  {NADI_UI_DATA[varaTattva.nadi][lang as "en" | "hi"]}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm opacity-70">
            {lang === "hi" ? "जानकारी लोड हो रही है..." : "Loading data..."}
          </div>
        )}`;

code = code.replace(tableRegex, newCard);

fs.writeFileSync("src/components/TattvaView.tsx", code);
