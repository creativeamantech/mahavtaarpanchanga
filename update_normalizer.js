const fs = require("fs");

let content = fs.readFileSync("src/lib/dailyScheduleNormalizer.ts", "utf8");

// Example replacement for sunrise subtitle
content = content.replace(
  "subtitle: `${formatTimeInZone(sunriseMs, timeZone)} · Beginning of Vedic Day`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(sunriseMs, timeZone)} · वैदिक दिवस का आरम्भ` : `${formatTimeInZone(sunriseMs, timeZone)} · Beginning of Vedic Day`,',
);

content = content.replace(
  "subtitle: `${formatTimeInZone(sunsetMs, timeZone)} · Beginning of Vedic Night`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(sunsetMs, timeZone)} · वैदिक रात्रि का आरम्भ` : `${formatTimeInZone(sunsetMs, timeZone)} · Beginning of Vedic Night`,',
);

content = content.replace(
  "subtitle: `${formatTimeInZone(moonriseMs, timeZone)} · Chandra Udaya`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(moonriseMs, timeZone)} · चंद्र उदय` : `${formatTimeInZone(moonriseMs, timeZone)} · Chandra Udaya`,',
);

content = content.replace(
  "subtitle: `${formatTimeInZone(moonsetMs, timeZone)} · Chandra Asta`,",
  'subtitle: lang === "hi" ? `${formatTimeInZone(moonsetMs, timeZone)} · चंद्र अस्त` : `${formatTimeInZone(moonsetMs, timeZone)} · Chandra Asta`,',
);

// We need to just write a script to patch some of the most obvious ones
fs.writeFileSync("src/lib/dailyScheduleNormalizer.ts", content);
