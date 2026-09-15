const fs = require("fs");
let content = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

const fixed = content.replace(/<NavItem\s*<NavItem\s*icon={Star}.*?theme={theme}\s*\/>\s*theme={theme}\s*\/>/s, 
`
          <NavItem
            icon={Star}
            label={lang === "hi" ? "नव तारा चक्र" : "Navtara Chakra"}
            isActive={activeView === "navtara"}
            onClick={() => setActiveView("navtara")}
            theme={theme}
          />
          <NavItem
            icon={Clock}
            label={lang === "hi" ? "वैदिक होरा" : "Vedic Horas"}
            isActive={activeView === "horas"}
            onClick={() => setActiveView("horas")}
            theme={theme}
          />`);

fs.writeFileSync("src/PanchangaApp.tsx", fixed);
console.log("Done");
