import { getKaranaTattvaCycle, getActiveKaranaTattva } from "./src/lib/karanaTattvaEngine";

console.log("Running Karana Tattva Boundary Tests...");

const date2024 = new Date("2024-05-10T00:00:00Z").getTime();
const cycle2024 = getKaranaTattvaCycle(date2024, "LAHI");

if (!cycle2024) {
  console.error("Failed to generate Karana Tattva Cycle");
  process.exit(1);
}

let failed = 0;

if (cycle2024.periods.length !== 5) {
  console.error(`Expected 5 periods, got ${cycle2024.periods.length}`);
  failed++;
}

// Check standard elements sequence
const expectedSequence = ["Akasha", "Vayu", "Agni", "Prithvi", "Jala"];
cycle2024.periods.forEach((p, i) => {
  if (p.element !== expectedSequence[i]) {
    console.error(`Period ${i} expected ${expectedSequence[i]}, got ${p.element}`);
    failed++;
  }
});

if (failed === 0) {
  console.log("All Karana Tattva boundary tests passed.");
} else {
  console.error(`${failed} tests failed.`);
  process.exit(1);
}
