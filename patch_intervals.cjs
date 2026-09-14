const fs = require("fs");
let code = fs.readFileSync("src/lib/panchangaEngine.server.ts", "utf8");

// Function to replace start/end with startTimeMs/endTimeMs
function replaceInterval(name, startVar, endVar) {
  code = code.replace(
    new RegExp(
      `${name}: \\{\\s*start: formatTimeHMS\\(${startVar}\\),\\s*end: formatTimeHMS\\(${endVar}\\)`,
    ),
    `${name}: { start: formatTimeHMS(${startVar}), end: formatTimeHMS(${endVar}), startTimeMs: localMidnightMs + ${startVar} * 3600000, endTimeMs: localMidnightMs + ${endVar} * 3600000`,
  );
  code = code.replace(
    new RegExp(
      `${name}: \\{\\s*start: formatTimeHMS\\(${startVar}\\),\\s*end: formatTimeHMS\\(${endVar}\\),\\s*name:`,
    ),
    `${name}: { start: formatTimeHMS(${startVar}), end: formatTimeHMS(${endVar}), startTimeMs: localMidnightMs + ${startVar} * 3600000, endTimeMs: localMidnightMs + ${endVar} * 3600000, name:`,
  );
}

replaceInterval("rahu_kala", "rahuStart", "rahuEnd");
replaceInterval("yamaganda", "yamaStart", "yamaEnd");
replaceInterval("gulika_kala", "gulikaStart", "gulikaEnd");
replaceInterval("abhijit_muhurta", "abhijitStart", "abhijitEnd");
replaceInterval("brahma_muhurta", "brahmaStart", "brahmaEnd");

// For arrays like durmuhurta
code = code.replace(
  /start: formatTimeHMS\(dm\.start\), end: formatTimeHMS\(dm\.end\)/g,
  `start: formatTimeHMS(dm.start), end: formatTimeHMS(dm.end), startTimeMs: localMidnightMs + dm.start * 3600000, endTimeMs: localMidnightMs + dm.end * 3600000`,
);

code = code.replace(
  /start: formatTimeHMS\(vk\.start\), end: formatTimeHMS\(vk\.end\)/g,
  `start: formatTimeHMS(vk.start), end: formatTimeHMS(vk.end), startTimeMs: localMidnightMs + vk.start * 3600000, endTimeMs: localMidnightMs + vk.end * 3600000`,
);

fs.writeFileSync("src/lib/panchangaEngine.server.ts", code);
