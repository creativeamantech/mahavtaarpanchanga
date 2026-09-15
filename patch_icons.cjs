const fs = require('fs');
let code = fs.readFileSync('src/PanchangaApp.tsx', 'utf8');

// The sed command duplicated ListTodo everywhere. Let's fix the imports first.
code = code.replace(/import \{\s*ListTodo,\s*CalendarDays,\s*Hourglass,\s*/g, 'import { ');

// Wait, let's just do a clean replacement of lucide-react imports.
let importMatch = code.match(/import \{[^}]*\}\s*from "lucide-react";/);
if (importMatch) {
  code = code.replace(importMatch[0], `import {
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Clock,
  Wind,
  Calendar,
  LayoutGrid,
  MapPin,
  Flame,
  ArrowRight,
  Activity,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Compass,
  Star,
  ListTodo,
  CalendarDays,
  Hourglass
} from "lucide-react";`);
}

// Now replace NavItem icons
code = code.replace(/icon={LayoutGrid}\s*label={t\.dailyPanchanga}/, 'icon={Sun}\n            label={t.dailyPanchanga}');
code = code.replace(/icon={Calendar}\s*label={lang === "hi" \? "दैनिक समय-सारणी" : "Today Schedule"}/, 'icon={ListTodo}\n            label={lang === "hi" ? "दैनिक समय-सारणी" : "Today Schedule"}');
code = code.replace(/icon={Clock}\s*label={lang === "hi" \? "वैदिक होरा" : "Vedic Horas"}/, 'icon={Hourglass}\n            label={lang === "hi" ? "वैदिक होरा" : "Vedic Horas"}');
code = code.replace(/icon={Calendar}\s*label={t\.monthCalendar}/, 'icon={CalendarDays}\n            label={t.monthCalendar}');
code = code.replace(/icon={Sparkles}\s*label={lang === "hi" \? "पर्व व व्रत" : "Festivals & Vratas"}/, 'icon={Flame}\n            label={lang === "hi" ? "पर्व व व्रत" : "Festivals & Vratas"}');

fs.writeFileSync('src/PanchangaApp.tsx', code);
