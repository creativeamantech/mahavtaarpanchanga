const fs = require("fs");
let code = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

// Add state for birthNakshatra
code = code.replace(
  /const \[theme, setTheme\] = useState<AppTheme>\(savedSettings\.theme \|\| "parchment"\);/,
  `const [theme, setTheme] = useState<AppTheme>(savedSettings.theme || "parchment");
  const [birthNakshatra, setBirthNakshatra] = useState<number>(savedSettings.birthNakshatra || 1);`,
);

// Update persistSettings signature and usage
code = code.replace(
  /newTheme: AppTheme = theme,/,
  `newTheme: AppTheme = theme,
      newBirthNakshatra: number = birthNakshatra,`,
);
code = code.replace(
  /theme: newTheme,\n\s*}\);/s,
  `theme: newTheme,
        birthNakshatra: newBirthNakshatra,
      });`,
);

// Update handleUpdateSettings
code = code.replace(
  /const handleUpdateSettings = \(\n    newAyanamsa: CoordinateSelection,\n    newMonthSystem: MonthSystem,\n    saveToDevice: boolean = true,\n    newTheme\?: AppTheme,\n  \) => {/s,
  `const handleUpdateSettings = (
    newAyanamsa: CoordinateSelection,
    newMonthSystem: MonthSystem,
    newTheme?: AppTheme,
    newBirthNakshatra?: number
  ) => {
    const saveToDevice = true; // simplifying, as SettingsModal doesn't pass boolean anymore`,
);

code = code.replace(
  /if \(saveToDevice\) {\n      persistSettings\(lang, newAyanamsa, newMonthSystem, currentCity, customCoords, activeTheme\);\n    }/s,
  `if (newBirthNakshatra) {
      setBirthNakshatra(newBirthNakshatra);
    }
    if (saveToDevice) {
      persistSettings(lang, newAyanamsa, newMonthSystem, currentCity, customCoords, activeTheme, newBirthNakshatra || birthNakshatra);
    }`,
);

// Pass birthNakshatra down to SettingsModal
code = code.replace(
  /<SettingsModal\s*isOpen={isSettingsOpen}/s,
  `<SettingsModal
        birthNakshatra={birthNakshatra}
        isOpen={isSettingsOpen}`,
);

code = code.replace(
  /persistSettings\(lang, ayanamsa, monthSystem, currentCity, customCoords, newTheme\);/s,
  `persistSettings(lang, ayanamsa, monthSystem, currentCity, customCoords, newTheme, birthNakshatra);`,
);

fs.writeFileSync("src/PanchangaApp.tsx", code);
