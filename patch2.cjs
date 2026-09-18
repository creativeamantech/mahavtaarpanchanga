const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const hookTarget = `  const isNight = theme === "nightSky";`;
const hookReplace = `  const isNight = theme === "nightSky";

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);`;
content = content.replace(hookTarget, hookReplace);

const alertTarget = `{ev.relativeText}`;
const alertReplace = `{getRealtimeRelativeText(new Date(ev.timestamp).getTime(), now, lang)}`;
content = content.replaceAll(alertTarget, alertReplace);

fs.writeFileSync(file, content);
console.log('Hooks and simple text replaced');
