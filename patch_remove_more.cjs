const fs = require("fs");

let code = fs.readFileSync("src/components/TattvaView.tsx", "utf8");

code = code.replace(
  /<div className="text-right">\s*<div className="text-\[10px\] uppercase tracking-wider opacity-70">\s*Remaining\s*<\/div>\s*<div className="text-sm font-medium font-mono">\s*\{activeHoraTattva \? formatTimeRemaining\(getHoraTattvaRemaining\(\) \|\| 0\) : "-"\}\s*<\/div>\s*<\/div>/g,
  ``,
);

code = code.replace(
  /<div className="text-right">\s*<div className="text-\[10px\] uppercase tracking-wider opacity-70">Remaining<\/div>\s*<div className="text-sm font-medium font-mono">\s*\{activeHoraTattva \? formatTimeRemaining\(getHoraTattvaRemaining\(\) \|\| 0\) : "-"\}\s*<\/div>\s*<\/div>/g,
  ``,
);

code = code.replace(/Remaining/g, `Active Tattva`);

code = code.replace(
  /\{activeHoraTattva \? formatTimeActiveTattva\(getHoraTattvaActiveTattva\(\) \|\| 0\) : "-"\}/g,
  `{activeHoraTattva ? activeHoraTattva.sanskrit : "-"}`,
);

fs.writeFileSync("src/components/TattvaView.tsx", code);
