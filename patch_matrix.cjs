const fs = require('fs');
const file = 'src/components/PlanetTransitionsCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `              <div
                key={planet.planetId}
                id={\`transit-card-\${planet.planetId}\`}
                className={\`group relative rounded-2xl border p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3 \${
                  isNight
                    ? "bg-[#12182b] border-indigo-900/40 hover:border-indigo-600"
                    : "bg-white/80 border-stone-200/70 hover:border-amber-300"
                }\`}
              >`;

const repStr = `              <div
                key={planet.planetId}
                id={\`transit-card-\${planet.planetId}\`}
                className={\`group relative rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 \${
                  isNight
                    ? "bg-transparent border-indigo-900/40 hover:border-indigo-600"
                    : "bg-transparent border-stone-200 hover:border-stone-400"
                }\`}
              >`;

content = content.replace(targetStr, repStr);
fs.writeFileSync(file, content);
console.log('patched matrix cards');
