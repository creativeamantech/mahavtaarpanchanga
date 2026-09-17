import * as Astronomy from "astronomy-engine";

function getSiderealLon(tropicalLon: number, ayanamsaDeg: number): number {
  let sidereal = tropicalLon - ayanamsaDeg;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

function getTropicalSunLon(t: Astronomy.AstroTime): number {
  return Astronomy.SunPosition(t).EclipticCoords().lon;
}

const ayanamsaDeg = 24.1; // roughly lahiri

function getMasaAtNm(nmTime: Astronomy.AstroTime) {
  const sunSidAtNm = getSiderealLon(getTropicalSunLon(nmTime), ayanamsaDeg);
  const solarRasiAtNm = Math.floor(sunSidAtNm / 30);
  return (solarRasiAtNm + 2) % 12 || 12;
}

function getPreviousNm(date: Date): Astronomy.AstroTime {
  return Astronomy.SearchMoonPhase(0, new Date(date.getTime() - 32 * 86400000), 33)!;
}

function getNextNm(date: Date): Astronomy.AstroTime {
  return Astronomy.SearchMoonPhase(0, new Date(date.getTime() + 5 * 86400000), 33)!;
}

let currentNmDate = new Date();
for (let i = 0; i < 15; i++) {
  const nm = getPreviousNm(currentNmDate);
  console.log("NM backward:", nm.date.toISOString(), "Masa:", getMasaAtNm(nm));
  currentNmDate = new Date(nm.date.getTime() - 5 * 86400000);
}
