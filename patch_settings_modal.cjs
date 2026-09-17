const fs = require("fs");
let code = fs.readFileSync("src/components/SettingsModal.tsx", "utf8");

// Add birthNakshatra prop
code = code.replace(
  /theme: AppTheme;\n  onThemeChange\?: \(theme: AppTheme\) => void;\n/,
  `theme: AppTheme;
  birthNakshatra: number;
  onThemeChange?: (theme: AppTheme) => void;\n`,
);

// Add birthNakshatra to onUpdateSettings
code = code.replace(
  /onUpdateSettings: \(\n    ayanamsa: CoordinateSelection,\n    monthSystem: MonthSystem,\n    theme: AppTheme\n  \) => void;/,
  `onUpdateSettings: (
    ayanamsa: CoordinateSelection,
    monthSystem: MonthSystem,
    theme: AppTheme,
    birthNakshatra: number
  ) => void;`,
);

// Update functional component props
code = code.replace(
  /theme,\n  onThemeChange,/,
  `theme,
  birthNakshatra,
  onThemeChange,`,
);

// Add selectedBirthNakshatra state
code = code.replace(
  /const \[selectedTheme, setSelectedTheme\] = useState<AppTheme>\(theme\);/,
  `const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme);
  const [selectedBirthNakshatra, setSelectedBirthNakshatra] = useState<number>(birthNakshatra);`,
);

// Update save handler
code = code.replace(
  /onUpdateSettings\(selectedAyanamsa, selectedMonthSystem, selectedTheme\);/,
  `onUpdateSettings(selectedAyanamsa, selectedMonthSystem, selectedTheme, selectedBirthNakshatra);`,
);

// Add import for NAKSHATRA_NAMES and Star icon
code = code.replace(
  /import { type Language, translations } from "\.\.\/i18n";/,
  `import { type Language, translations } from "../i18n";\nimport { NAKSHATRA_NAMES } from "../lib/navtaraEngine";\nimport { Star } from "lucide-react";`,
);

// Find the location to insert the new setting section. After "Application Theme" section
const themeSectionMatch = code.match(
  /<div className="mb-6">\s*<h4 className="text-xs font-bold uppercase tracking-widest.*?Application Theme.*?<\/div>\s*<\/div>/s,
);
if (themeSectionMatch) {
  const nakshatraSection = `
          {/* Birth Nakshatra Setting */}
          <div className="mb-6">
            <h4 className={\`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 \${isNight ? "text-slate-400" : "text-stone-500"}\`}>
              <Star className="w-3.5 h-3.5" />
              {lang === "hi" ? "जन्म नक्षत्र" : "Birth Nakshatra (Janma)"}
            </h4>
            <div className="relative">
              <select
                value={selectedBirthNakshatra}
                onChange={(e) => setSelectedBirthNakshatra(parseInt(e.target.value, 10))}
                className={\`w-full appearance-none rounded-xl border p-3 pr-10 text-sm font-bold font-devanagari transition-all focus:ring-2 focus:outline-none \${
                  isNight
                    ? "bg-[#131b2f] border-indigo-900/60 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20"
                    : "bg-white border-stone-200 text-stone-800 focus:border-amber-500 focus:ring-amber-500/20 shadow-sm"
                }\`}
              >
                {NAKSHATRA_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}. {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                <Star className={\`h-4 w-4 \${isNight ? "text-slate-400" : "text-stone-400"}\`} />
              </div>
            </div>
            <p className={\`mt-2 text-xs \${isNight ? "text-slate-500" : "text-stone-500"}\`}>
              {lang === "hi"
                ? "नव तारा चक्र के स्वचालित मूल्यांकन के लिए अपना जन्म नक्षत्र सेट करें।"
                : "Set your birth star for automatic Navtara Chakra evaluation."}
            </p>
          </div>
`;
  code = code.replace(themeSectionMatch[0], themeSectionMatch[0] + nakshatraSection);
}

fs.writeFileSync("src/components/SettingsModal.tsx", code);
