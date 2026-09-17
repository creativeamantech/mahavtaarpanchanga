const fs = require("fs");
let code = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

code = code.replace(
  /<NavtaraView data=\{panchangaData\} lang=\{lang\} theme=\{theme\} \/>/g,
  `<NavtaraView 
                      data={panchangaData} 
                      lang={lang} 
                      theme={theme}
                      birthNakshatra={birthNakshatra}
                      onBirthNakshatraChange={(n) => {
                        setBirthNakshatra(n);
                        persistSettings(lang, ayanamsa, monthSystem, currentCity, customCoords, theme, n);
                      }} 
                    />`,
);

fs.writeFileSync("src/PanchangaApp.tsx", code);
