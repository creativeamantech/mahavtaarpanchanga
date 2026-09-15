const fs = require('fs');
let code = fs.readFileSync('src/PanchangaApp.tsx', 'utf8');

// The sidebar items match the SpiritualTabs exactly now, except we want to make sure the icons are distinct.
// Let's do a strict replacement for the sidebar block to make sure it matches the 10 tabs perfectly in order and icon semantics.

const sidebarBlock = `<div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 hide-scrollbar">
          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 ml-2 font-sans">
            Spiritual Navigation
          </div>
          <NavItem
            icon={Sun}
            label={lang === "hi" ? "दैनिक पंचांग" : "Panchanga"}
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
            label={lang === "hi" ? "मुहूर्त" : "Timings"}
            isActive={activeView === "timings"}
            onClick={() => setActiveView("timings")}
            theme={theme}
          />
          <NavItem
            icon={Moon}
            label={lang === "hi" ? "ग्रह स्थिति" : "Planets"}
            isActive={activeView === "planets"}
            onClick={() => setActiveView("planets")}
            theme={theme}
          />
          <NavItem
            icon={Wind}
            label={lang === "hi" ? "स्वर विज्ञान" : "Swara Yoga"}
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
            label={lang === "hi" ? "मासिक पंचांग" : "Calendar"}
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
        </div>`;

code = code.replace(/<div className="flex-1 overflow-y-auto px-4 py-6 space-y-1\.5 hide-scrollbar">[\s\S]*?<\/div>/, sidebarBlock);

fs.writeFileSync('src/PanchangaApp.tsx', code);
