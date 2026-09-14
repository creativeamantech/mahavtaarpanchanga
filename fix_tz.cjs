const fs = require("fs");
let code = fs.readFileSync("src/lib/panchangaEngine.server.ts", "utf8");

code = code.replace(
  /const tzHours = getTimezoneOffsetHours\([\s\S]*?\);/,
  `const tzHours = getTimezoneOffsetHours(
    location.timezone,
    new Date(Date.UTC(y, m - 1, d, 12, 0, 0)),
  );`,
);

code = code.replace(
  /Intl.DateTimeFormat\("en-US", { timezone, weekday: "long" }\)/,
  `Intl.DateTimeFormat("en-US", { timeZone: location.timezone, weekday: "long" })`,
);

code = code.replace(
  /return new Intl.DateTimeFormat\("en-US", { timezone, weekday: "long" }\).format\(d\);/,
  `return new Intl.DateTimeFormat("en-US", { timeZone: location.timezone, weekday: "long" }).format(d);`,
);

fs.writeFileSync("src/lib/panchangaEngine.server.ts", code);
