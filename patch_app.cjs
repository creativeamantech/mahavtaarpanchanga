const fs = require("fs");
let code = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

// 1. Add Import
code = code.replace(
  `import { VedicHorasView } from "./components/VedicHorasView";`,
  `import { VedicHorasView } from "./components/VedicHorasView";\nimport { KaranaTattvaView } from "./components/KaranaTattvaView";`,
);

// 2. Add Active View type
code = code.replace(
  `type ActiveView = "panchanga" | "today" | "timings" | "planets" | "swara" | "navtara" | "horas" | "calendar" | "lagna" | "festivals";`,
  `type ActiveView = "panchanga" | "today" | "timings" | "planets" | "swara" | "navtara" | "horas" | "tattva" | "calendar" | "lagna" | "festivals";`,
);

// 3. Add NavItem
const navItemTarget = `<NavItem
            icon={Hourglass}
            label={lang === "hi" ? "वैदिक होरा" : "Horas"}
            isActive={activeView === "horas"}
            onClick={() => setActiveView("horas")}
            theme={theme}
          />`;
const newNavItem =
  navItemTarget +
  `\n          <NavItem
            icon={Sparkles}
            label={lang === "hi" ? "कारण तत्व" : "Karana Tattva"}
            isActive={activeView === "tattva"}
            onClick={() => setActiveView("tattva")}
            theme={theme}
          />`;
code = code.replace(navItemTarget, newNavItem);
if (!code.includes("Sparkles")) {
  // fallback
  code = code.replace(`import { Sun, Moon, MapPin`, `import { Sun, Moon, MapPin, Sparkles`);
}

// 4. Add View section
const viewSectionTarget = `{activeView === "horas" && (`;
const newViewSection =
  `{activeView === "tattva" && (
                  <div
                    id="view-karana-tattva"
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-amber-800 flex items-center gap-2 px-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        {lang === "hi" ? "कारण तत्व विश्लेषक" : "Karana Tattva Engine"}
                      </h2>
                      <div className="h-px bg-gradient-to-l from-transparent to-amber-200/80 flex-1"></div>
                    </div>

                    <section className="space-y-6">
                      <KaranaTattvaView panchangaData={panchangaData} theme={theme} lang={lang} />
                    </section>
                  </div>
                )}

                ` + viewSectionTarget;
code = code.replace(viewSectionTarget, newViewSection);

fs.writeFileSync("src/PanchangaApp.tsx", code);
