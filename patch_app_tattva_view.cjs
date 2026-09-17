const fs = require("fs");

let code = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

code = code.replace(
  `import { KaranaTattvaView } from "./components/KaranaTattvaView";`,
  `import { TattvaView } from "./components/TattvaView";`,
);

code = code.replace(
  `<KaranaTattvaView panchangaData={panchangaData} theme={theme} lang={lang} />`,
  `<TattvaView panchangaData={panchangaData} theme={theme} lang={lang} />`,
);

fs.writeFileSync("src/PanchangaApp.tsx", code);
