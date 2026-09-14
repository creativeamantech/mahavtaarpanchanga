const fs = require("fs");
let code = fs.readFileSync("src/lib/panchangaEngine.server.ts", "utf8");

// Insert previous sunrise and sunset computation
code = code.replace(
  /\/\/ Sunset\n  let tSunset: Astronomy\.AstroTime;/g,
  `// Previous sunrise
  let tPrevSunrise: Astronomy.AstroTime;
  try {
    tPrevSunrise = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, new Date(localMidnightMs - 24 * 3600000), 1.0, 0.0)!;
  } catch {
    tPrevSunrise = Astronomy.MakeTime(new Date(localMidnightMs - 18 * 3600000));
  }

  // Previous sunset
  let tPrevSunset: Astronomy.AstroTime;
  try {
    tPrevSunset = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, tPrevSunrise.date, 1.0, 0.0)!;
  } catch {
    tPrevSunset = Astronomy.MakeTime(new Date(tPrevSunrise.date.getTime() + 12 * 3600000));
  }

  // Sunset
  let tSunset: Astronomy.AstroTime;`,
);

// Populate them in the response
code = code.replace(
  /sunrise_ms: tSunrise\.date\.getTime\(\),/g,
  `previous_sunrise_ms: tPrevSunrise.date.getTime(),
    previous_sunset_ms: tPrevSunset.date.getTime(),
    sunrise_ms: tSunrise.date.getTime(),`,
);

fs.writeFileSync("src/lib/panchangaEngine.server.ts", code);
