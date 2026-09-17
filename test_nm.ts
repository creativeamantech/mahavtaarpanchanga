import { Astronomy } from "astronomy-engine";
const d = new Date();
const nm1 = Astronomy.SearchMoonPhase(0, new Date(d.getTime() - 32 * 86400000), 33);
console.log(nm1.date);
