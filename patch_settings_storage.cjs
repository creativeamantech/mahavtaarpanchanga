const fs = require("fs");
let code = fs.readFileSync("src/settingsStorage.ts", "utf8");

code = code.replace(
  /theme: \(\["parchment", "nightSky"\]\.includes\(parsed\.theme\)\n\s*\? parsed\.theme\n\s*: DEFAULT_USER_SETTINGS\.theme\) as AppTheme,/,
  `theme: (["parchment", "nightSky"].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_USER_SETTINGS.theme) as AppTheme,
      birthNakshatra: typeof parsed.birthNakshatra === "number" 
        ? parsed.birthNakshatra 
        : DEFAULT_USER_SETTINGS.birthNakshatra,`,
);

fs.writeFileSync("src/settingsStorage.ts", code);
