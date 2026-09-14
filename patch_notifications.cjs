const fs = require("fs");
let code = fs.readFileSync("src/lib/notificationEngine.ts", "utf8");

code = code.replace(
  /const sunriseMs = parseTimeStringToMs\(data\.sunrise, date\);/g,
  `const sunriseMs = data.sunrise_ms;`,
);

code = code.replace(
  /const sunsetMs = parseTimeStringToMs\(data\.sunset, date\);/g,
  `const sunsetMs = data.sunset_ms;`,
);

code = code.replace(
  /const bMs = parseTimeStringToMs\(data\.brahma_muhurta\.start, date\);/g,
  `const bMs = data.brahma_muhurta.startTimeMs;`,
);

code = code.replace(
  /const aMs = parseTimeStringToMs\(data\.abhijit_muhurta\.start, date\);/g,
  `const aMs = data.abhijit_muhurta.startTimeMs;`,
);

code = code.replace(
  /const rMs = parseTimeStringToMs\(data\.rahu_kala\.start, date\);/g,
  `const rMs = data.rahu_kala.startTimeMs;`,
);

fs.writeFileSync("src/lib/notificationEngine.ts", code);
