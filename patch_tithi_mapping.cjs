const fs = require('fs');
const file = 'src/lib/tithiTattvaEngine.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
`export const TITHI_ELEMENT_MAPPING: Record<number, TattvaElement> = {
  1: "prithvi",
  2: "prithvi",
  3: "prithvi",
  4: "jala",
  5: "jala",
  6: "jala",
  7: "jala",
  8: "akash",
  9: "vayu",
  10: "vayu",
  11: "tejas", // Agni mapping to tejas
  12: "tejas",
  13: "tejas",
  14: "prithvi",
  15: "prithvi",
};`,
`// Nanda (1, 6, 11) -> Agni (tejas)
// Bhadra (2, 7, 12) -> Prithvi (prithvi)
// Jaya (3, 8, 13) -> Akasha (akash)
// Rikta (4, 9, 14) -> Jala (jala)
// Purna (5, 10, 15) -> Vayu (vayu)
export const TITHI_ELEMENT_MAPPING: Record<number, TattvaElement> = {
  1: "tejas",
  2: "prithvi",
  3: "akash",
  4: "jala",
  5: "vayu",
  6: "tejas",
  7: "prithvi",
  8: "akash",
  9: "jala",
  10: "vayu",
  11: "tejas",
  12: "prithvi",
  13: "akash",
  14: "jala",
  15: "vayu",
};`
);
fs.writeFileSync(file, content);
console.log('patched Tithi mapping');
