const fs = require("fs");

// Patch Header.tsx
let header = fs.readFileSync("src/components/Header.tsx", "utf8");
header = header.replace(
  `  | "horas"
  | "calendar"`,
  `  | "horas"
  | "tattva"
  | "calendar"`,
);
fs.writeFileSync("src/components/Header.tsx", header);

// Patch SpiritualTabs.tsx
let tabsCode = fs.readFileSync("src/components/SpiritualTabs.tsx", "utf8");
const horasTab = `{
      id: "horas",
      label: lang === "hi" ? "वैदिक होरा" : "Horas",
      icon: "🕐",
      subLabel: "होरा",
    },`;
const newTattvaTab = `{
      id: "tattva",
      label: lang === "hi" ? "कारण तत्व" : "Karana Tattva",
      icon: "✨",
      subLabel: "कारण तत्व",
    },`;
tabsCode = tabsCode.replace(horasTab, horasTab + "\n    " + newTattvaTab);
fs.writeFileSync("src/components/SpiritualTabs.tsx", tabsCode);
