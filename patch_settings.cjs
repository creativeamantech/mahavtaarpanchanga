const fs = require("fs");
let code = fs.readFileSync("src/components/SettingsModal.tsx", "utf8");

// Fix signature
code = code.replace(
  `  onUpdateSettings: (
    ayanamsa: CoordinateSelection,
    monthSystem: MonthSystem,
    saveToDevice?: boolean,
    theme?: AppTheme,
  ) => void;`,
  `  onUpdateSettings: (
    ayanamsa: CoordinateSelection,
    monthSystem: MonthSystem,
    theme?: AppTheme,
    birthNakshatra?: number,
  ) => void;`,
);

// Fix handleSave
code = code.replace(
  `  const handleSave = () => {
    onUpdateSettings(selectedAyanamsa, selectedMonthSystem, saveToLocalStorage, selectedTheme);`,
  `  const handleSave = () => {
    onUpdateSettings(selectedAyanamsa, selectedMonthSystem, selectedTheme, selectedBirthNakshatra);`,
);

// Add UI for Birth Nakshatra right before "Alert Categories" or right after the "Theme" section.
// Let's find a good hook in the JSX.
const themeEndHook = `                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                  {t.nightSkyDesc}
                </p>
              </button>
            </div>
          </div>`;

const birthNakshatraUI = `                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                  {t.nightSkyDesc}
                </p>
              </button>
            </div>
          </div>

          {/* Birth Nakshatra Section */}
          <div className="rounded-2xl border border-stone-200/60 bg-white/60 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-900 font-devanagari">
                  {lang === "hi" ? "जन्म नक्षत्र (Janma Nakshatra)" : "Birth Nakshatra (Janma Nakshatra)"}
                </span>
                <p className="text-[10px] text-stone-500 mt-0.5 font-sans">
                  {lang === "hi" ? "नवतारा और तारा दशा की गणना के लिए" : "For Navtara and Tara Dasa calculations"}
                </p>
              </div>
              <Star className="h-4 w-4 text-amber-600/50" />
            </div>
            
            <select
              value={selectedBirthNakshatra}
              onChange={(e) => setSelectedBirthNakshatra(Number(e.target.value))}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-sm font-medium text-stone-700 outline-none hover:bg-stone-50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value={0} disabled>
                {lang === "hi" ? "-- जन्म नक्षत्र चुनें --" : "-- Select Birth Nakshatra --"}
              </option>
              {NAKSHATRA_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}. {name}
                </option>
              ))}
            </select>
          </div>`;

code = code.replace(themeEndHook, birthNakshatraUI);

fs.writeFileSync("src/components/SettingsModal.tsx", code);
