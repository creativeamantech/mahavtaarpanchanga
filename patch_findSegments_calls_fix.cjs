const fs = require("fs");
let code = fs.readFileSync("src/lib/panchangaEngine.server.ts", "utf8");

code = code.replace(
  /const tithiSegments = findSegments\([\s\S]*?30,\n.*?timezone\n  \);/g,
  `const tithiSegments = findSegments(
    getTithiFraction,
    names.tithis,
    tSunrise,
    tNextSunrise,
    localMidnight,
    30,
    location.timezone
  );`,
);

code = code.replace(
  /const nakshatraSegments = findSegments\([\s\S]*?27,\n.*?timezone\n  \);/g,
  `const nakshatraSegments = findSegments(
    (t) => getNakshatraFraction(t, coordinateSelection),
    names.nakshatras,
    tSunrise,
    tNextSunrise,
    localMidnight,
    27,
    location.timezone
  );`,
);

code = code.replace(
  /const yogaSegments = findSegments\([\s\S]*?27,\n.*?timezone\n  \);/g,
  `const yogaSegments = findSegments(
    (t) => getYogaFraction(t, coordinateSelection),
    names.yogas,
    tSunrise,
    tNextSunrise,
    localMidnight,
    27,
    location.timezone
  );`,
);

code = code.replace(
  /const karanaSegments = findSegments\([\s\S]*?60,\n.*?timezone\n  \);/g,
  `const karanaSegments = findSegments(
    getKaranaFraction,
    names.karanas,
    tSunrise,
    tNextSunrise,
    localMidnight,
    60,
    location.timezone
  );`,
);

fs.writeFileSync("src/lib/panchangaEngine.server.ts", code);
