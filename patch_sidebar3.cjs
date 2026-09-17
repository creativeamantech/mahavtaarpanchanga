const fs = require("fs");
let code = fs.readFileSync("src/PanchangaApp.tsx", "utf8");

// Just fixing the JSX errors (missing closing tags) from my previous bad sed

const originalNavItemsBlockRegex =
  /<div className="flex-1 overflow-y-auto px-4 py-6 space-y-1\.5 hide-scrollbar">[\s\S]*?<div\s*className={\`p-5 border-t/m;
const sidebarBlock = `<div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 hide-scrollbar">
          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 ml-2 font-sans">
            Spiritual Navigation
          </div>
          <NavItem
            icon={Sun}
            label={t.dailyPanchanga}
            isActive={activeView === "panchanga"}
            onClick={() => setActiveView("panchanga")}
            theme={theme}
          />
          <NavItem
            icon={ListTodo}
            label={lang === "hi" ? "दैनिक समय-सारणी" : "Schedule"}
            isActive={activeView === "today"}
            onClick={() => setActiveView("today")}
            theme={theme}
          />
          <NavItem
            icon={Clock}
            label={t.muhurtasAndTimings}
            isActive={activeView === "timings"}
            onClick={() => setActiveView("timings")}
            theme={theme}
          />
          <NavItem
            icon={Moon}
            label={t.grahaSthiti}
            isActive={activeView === "planets"}
            onClick={() => setActiveView("planets")}
            theme={theme}
          />
          <NavItem
            icon={Wind}
            label={t.views.swara}
            isActive={activeView === "swara"}
            onClick={() => setActiveView("swara")}
            theme={theme}
          />
          <NavItem
            icon={Star}
            label={lang === "hi" ? "नव तारा" : "Navtara"}
            isActive={activeView === "navtara"}
            onClick={() => setActiveView("navtara")}
            theme={theme}
          />
          <NavItem
            icon={Hourglass}
            label={lang === "hi" ? "वैदिक होरा" : "Horas"}
            isActive={activeView === "horas"}
            onClick={() => setActiveView("horas")}
            theme={theme}
          />
          <NavItem
            icon={CalendarDays}
            label={t.monthCalendar}
            isActive={activeView === "calendar"}
            onClick={() => setActiveView("calendar")}
            theme={theme}
          />
          <NavItem
            icon={Compass}
            label={lang === "hi" ? "लग्न कुण्डली" : "Lagna"}
            isActive={activeView === "lagna"}
            onClick={() => setActiveView("lagna")}
            theme={theme}
          />
          <NavItem
            icon={Flame}
            label={lang === "hi" ? "पर्व व व्रत" : "Festivals"}
            isActive={activeView === "festivals"}
            onClick={() => setActiveView("festivals")}
            theme={theme}
          />
        </div>
        <div
          className={\`p-5 border-t`;

code = code.replace(originalNavItemsBlockRegex, sidebarBlock);
fs.writeFileSync("src/PanchangaApp.tsx", code);
