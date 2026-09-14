const fs = require("fs");
let text = fs.readFileSync("src/types.ts", "utf8");

text = text.replace(
  /  previous_sunrise_ms\?: number;\n  previous_sunset_ms\?: number;\n  sunrise_ms\?: number;\n  sunset_ms\?: number;\n  next_previous_sunrise_ms\?: number;\n  previous_sunset_ms\?: number;\n  sunrise_ms\?: number;/g,
  `  previous_sunrise_ms?: number;
  previous_sunset_ms?: number;
  sunrise_ms?: number;
  sunset_ms?: number;
  next_sunrise_ms?: number;`,
);

fs.writeFileSync("src/types.ts", text);
