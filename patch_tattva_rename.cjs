const fs = require("fs");

// 1. Patch SpiritualTabs.tsx
let tabsCode = fs.readFileSync("src/components/SpiritualTabs.tsx", "utf8");
tabsCode = tabsCode
  .replace(
    `label: lang === "hi" ? "कारण तत्व" : "Karana Tattva"`,
    `label: lang === "hi" ? "तत्व" : "Tattva"`,
  )
  .replace(`subLabel: "कारण तत्व"`, `subLabel: "तत्व"`);
fs.writeFileSync("src/components/SpiritualTabs.tsx", tabsCode);

// 2. Patch PanchangaApp.tsx
let appCode = fs.readFileSync("src/PanchangaApp.tsx", "utf8");
appCode = appCode
  .replace(
    `label={lang === "hi" ? "कारण तत्व" : "Karana Tattva"}`,
    `label={lang === "hi" ? "तत्व" : "Tattva"}`,
  )
  .replace(
    `{lang === "hi" ? "कारण तत्व विश्लेषक" : "Karana Tattva Engine"}`,
    `{lang === "hi" ? "तत्व दर्शन" : "Tattva System"}`,
  )
  .replace(`id="view-karana-tattva"`, `id="view-tattva"`);
fs.writeFileSync("src/PanchangaApp.tsx", appCode);
