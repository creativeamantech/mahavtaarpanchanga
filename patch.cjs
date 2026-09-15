const fs = require("fs");
let content = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

// let's just find the broken nav item and fix it
let lines = content.split("\n");
let start = -1;
let end = -1;

for(let i=0; i<lines.length; i++) {
  if(lines[i].includes('label={lang === "hi" ? "वैदिक होरा" : "Vedic Horas"}')) {
    if (lines[i+1].includes('<NavItem')) {
       start = i - 1; // <NavItem
       end = i + 10;
       break;
    }
  }
}

if (start !== -1) {
  const replacement = `          <NavItem
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
          />`;
  lines.splice(start, end - start + 1, replacement);
  fs.writeFileSync("src/PanchangaApp.tsx", lines.join("\n"));
  console.log("Patched successfully");
} else {
  console.log("Could not find the block");
}
