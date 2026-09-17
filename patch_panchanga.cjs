const fs = require("fs");
let code = fs.readFileSync("src/lib/panchangaEngine.server.ts", "utf8");

const adapter = `

export interface KaranaTattvaBoundary {
  timestampMs: number;
  masaNum: 1 | 7;
  masaName: string;
}

export function getKaranaTattvaBoundingPratipadas(
  targetDateMs: number,
  ayanamsaKey: CoordinateSelection
): { current: KaranaTattvaBoundary; next: KaranaTattvaBoundary } | null {
  const targetDate = new Date(targetDateMs);
  const ayanamsaDeg = calculateAyanamsa(Astronomy.MakeTime(targetDate), ayanamsaKey);

  function getMasaAtNm(nmTime: Astronomy.AstroTime) {
    const sunSidAtNm = getSiderealLon(getTropicalSunLon(nmTime), ayanamsaDeg);
    const solarRasiAtNm = Math.floor(sunSidAtNm / 30);
    return (solarRasiAtNm + 2) % 12 || 12;
  }

  function getPreviousNm(date: Date): Astronomy.AstroTime {
    return Astronomy.SearchMoonPhase(0, new Date(date.getTime() - 32 * 86400000), 33);
  }

  function getNextNm(date: Date): Astronomy.AstroTime {
    return Astronomy.SearchMoonPhase(0, new Date(date.getTime() + 5 * 86400000), 33);
  }

  let currentNmDate = new Date(targetDateMs);
  let boundaryCurrent = null;
  
  for (let i = 0; i < 15; i++) {
    const nm = getPreviousNm(currentNmDate);
    if (!nm) break;
    const masa = getMasaAtNm(nm);
    if (masa === 1 || masa === 7) {
      let earliestNm = nm;
      let checkDate = new Date(nm.date.getTime() - 5 * 86400000);
      for(let j=0; j<2; j++) {
         const prevNm = getPreviousNm(checkDate);
         if(!prevNm) break;
         if(getMasaAtNm(prevNm) === masa) {
            earliestNm = prevNm;
            checkDate = new Date(prevNm.date.getTime() - 5 * 86400000);
         } else {
            break;
         }
      }
      
      boundaryCurrent = {
        timestampMs: earliestNm.date.getTime(),
        masaNum: masa,
        masaName: masa === 1 ? "Caitra" : "Āśvina",
      };
      break;
    }
    currentNmDate = new Date(nm.date.getTime() - 5 * 86400000);
  }

  if (!boundaryCurrent) return null;

  let boundaryNext = null;
  const targetMasa = boundaryCurrent.masaNum === 1 ? 7 : 1;
  let forwardNmDate = new Date(boundaryCurrent.timestampMs + 5 * 86400000);
  
  for (let i = 0; i < 15; i++) {
    const nm = getNextNm(forwardNmDate);
    if (!nm) break;
    const masa = getMasaAtNm(nm);
    if (masa === targetMasa) {
       boundaryNext = {
         timestampMs: nm.date.getTime(),
         masaNum: targetMasa,
         masaName: targetMasa === 1 ? "Caitra" : "Āśvina",
       };
       break;
    }
    forwardNmDate = new Date(nm.date.getTime() + 5 * 86400000);
  }

  if (!boundaryNext) return null;

  return { current: boundaryCurrent, next: boundaryNext };
}
`;

fs.writeFileSync("src/lib/panchangaEngine.server.ts", code + adapter);
