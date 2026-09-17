const fs = require("fs");
let content = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

// I'll just look for the SpiritualTabs block and replace the whole thing or specifically the NavItem block
const newContent = content.replace(
  /<NavItem\s*icon={Clock}\s*label={lang === "hi" \? "वैदिक होरा" : "Vedic Horas"}\s*<NavItem\s*icon={Star}.*?<\/NavItem>/s,
  `<NavItem
            icon={Clock}
            label={lang === "hi" ? "वैदिक होरा" : "Vedic Horas"}
            isActive={activeView === "horas"}
            onClick={() => setActiveView("horas")}
            theme={theme}
          />
          <NavItem
            icon={Star}
            label={lang === "hi" ? "नव तारा चक्र" : "Navtara Chakra"}
            isActive={activeView === "navtara"}
            onClick={() => setActiveView("navtara")}
            theme={theme}
          />`,
);
fs.writeFileSync("src/PanchangaApp.tsx", newContent);
