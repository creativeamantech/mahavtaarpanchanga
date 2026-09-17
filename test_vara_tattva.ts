import { VARA_TATTVA_MAPPING, getVaraTattva } from "./src/lib/varaTattvaEngine";

console.log("Running Vara Tattva Mapping Tests...");

const tests = [
  { day: 1, expectedElement: "Jala", expectedNadi: "Ida" }, // Monday
  { day: 2, expectedElement: "Agni", expectedNadi: "Ida" }, // Tuesday
  { day: 3, expectedElement: "Prithvi", expectedNadi: "Ida" }, // Wednesday
  { day: 4, expectedElement: "Space_than_Air", expectedNadi: "Sushmana" }, // Thursday
  { day: 5, expectedElement: "Agni", expectedNadi: "Pingala" }, // Friday
  { day: 6, expectedElement: "Jala", expectedNadi: "Pingala" }, // Saturday
  { day: 0, expectedElement: "Prithvi", expectedNadi: "Pingala" }, // Sunday
];

let failed = 0;
for (const t of tests) {
  const result = getVaraTattva(t.day);
  if (result.element !== t.expectedElement || result.nadi !== t.expectedNadi) {
    console.error(
      `Failed on day ${t.day}: expected ${t.expectedElement}/${t.expectedNadi}, got ${result.element}/${result.nadi}`,
    );
    failed++;
  }
}

if (failed === 0) {
  console.log("All Vara Tattva mapping tests passed.");
} else {
  console.error(`${failed} tests failed.`);
  process.exit(1);
}
