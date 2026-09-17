const fs = require("fs");

let code = fs.readFileSync("src/components/TattvaView.tsx", "utf8");

// The instructions are to remove calculation information from the Tattva page.
// We removed most of it before, but there is still some left.
// Let's remove the "Total Duration" block from Karana Tattva Cycle header.
code = code.replace(
  /<div className="md:text-right">[\s\S]*?<div className="text-\[10px\] uppercase font-bold tracking-widest opacity-70 mb-1">[\s\S]*?Total Duration[\s\S]*?<\/div>[\s\S]*?<div className="text-sm font-bold font-mono">\{formatDuration\(cycle.durationMs\)\}<\/div>[\s\S]*?<\/div>/,
  ``,
);

// We can also remove `({formatDuration(p.durationMs)})` from the Full Sequence & Maas Correlation list
code = code.replace(/\{formatDuration\(p.durationMs\)\}\)/g, `)`);

code = code.replace(/— \{formatDate\(p.endTime\)\} \(\n\s*\)/g, `— {formatDate(p.endTime)}`);

// We can remove the `Five Tattvas Sequence (15/15)` to just `Five Tattvas Sequence`
code = code.replace(`Five Tattvas Sequence (15/15)`, `Five Tattvas Sequence`);

// Remove the `durationMs` calculations in Hora Tattva summary section
code = code.replace(
  /<div className="text-right">\s*<div className="text-\[10px\] uppercase font-bold tracking-wider opacity-70 mb-1">Duration<\/div>\s*<div className="text-sm font-bold">\{Math.floor\(activeHora.durationMs \/ 60000\)\} mins<\/div>\s*<\/div>/g,
  ``,
);

fs.writeFileSync("src/components/TattvaView.tsx", code);
