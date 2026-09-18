const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  return (
    <div
      id="planet-transitions-card"
      className={\`rounded-[1.5rem] p-6 sm:p-8 space-y-6 animate-in fade-in duration-500 transition-colors \${
        isNight
          ? "bg-[#0e1424]/90 border border-indigo-800/50 text-slate-100 shadow-xl"
          : "glass-card"
      }\`}
    >`;

const repStr = `  return (
    <div
      id="planet-transitions-card"
      className={\`space-y-8 animate-in fade-in duration-500 transition-colors \${
        isNight ? "text-slate-100" : "text-stone-900"
      }\`}
    >`;

if (content.includes("rounded-[1.5rem] p-6")) {
  content = content.replace(targetStr, repStr);
  fs.writeFileSync(file, content);
  console.log('patched card wrapper');
} else {
  console.log('could not find wrapper');
}
