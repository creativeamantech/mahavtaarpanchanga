import { computeTithiTattvaPeriods } from "./src/lib/tithiTattvaEngine";

const mockPanchanga = {
  tithi: [
    { number: 1, name: "Shukla Pratipada", startTimeMs: 1000, endTimeMs: 2000 },
    { number: 16, name: "Krishna Pratipada", startTimeMs: 2000, endTimeMs: 3000 }
  ]
};

console.log(JSON.stringify(computeTithiTattvaPeriods(mockPanchanga as any), null, 2));
