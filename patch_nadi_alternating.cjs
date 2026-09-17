const fs = require('fs');
const file = 'src/lib/tithiTattvaEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const targetFunc = `export function getCanonicalNadiAtTime(
  timestampMs: number,
  tithiNumber: number,
  sunriseStr: string,
  sunsetStr: string,
  moonriseStr?: string | null,
  moonsetStr?: string | null,
  timeZone: string = "Asia/Kolkata",
): SwaraNadi {
  // Extract local time components from the timestamp using the provided timezone
  const dateStr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).format(new Date(timestampMs));

  // Format returns "HH:MM:SS", parse it
  const [hh, mm, ss] = dateStr.split(":").map(Number);

  const swaraData = computeSwaraYoga(
    tithiNumber,
    sunriseStr,
    sunsetStr,
    { hours: hh, minutes: mm, seconds: ss },
    moonriseStr,
    moonsetStr,
  );

  return swaraData.currentActiveSwara ?? swaraData.sunriseSwara;
}`;

const replacementFunc = `export function getCanonicalNadiAtTime(
  timestampMs: number,
  tithiNumber: number,
  sunriseStr: string,
  sunsetStr: string,
  moonriseStr?: string | null,
  moonsetStr?: string | null,
  timeZone: string = "Asia/Kolkata",
): SwaraNadi {
  // Extract local time components from the timestamp using the provided timezone
  const dateStr = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).format(new Date(timestampMs));

  // Format returns "HH:MM:SS", parse it
  const [hh, mm, ss] = dateStr.split(":").map(Number);

  const swaraData = computeSwaraYoga(
    tithiNumber,
    sunriseStr,
    sunsetStr,
    { hours: hh, minutes: mm, seconds: ss },
    moonriseStr,
    moonsetStr,
  );

  // Default to sunrise Swara if not in specific celestial windows
  let activeSwara = swaraData.currentActiveSwara ?? swaraData.sunriseSwara;

  // Implement the 1-hour (60 min) alternating logic from sunrise.
  const currentMins = hh * 60 + mm + ss / 60;
  const sunriseMins = parseTimeToMinutes(sunriseStr) ?? 6 * 60;

  // Swara alternates every 60 minutes.
  if (currentMins >= sunriseMins) {
    const minutesElapsed = currentMins - sunriseMins;
    const hoursElapsed = Math.floor(minutesElapsed / 60);
    if (hoursElapsed % 2 === 1) {
       // Toggle the Swara
       activeSwara = swaraData.sunriseSwara === "ida" ? "pingala" : "ida";
    } else {
       activeSwara = swaraData.sunriseSwara;
    }
  } else {
    // If before sunrise, it belongs to the previous day's alternating cycle.
    // For simplicity, we calculate backward from today's sunrise.
    const minutesBefore = sunriseMins - currentMins;
    const hoursBefore = Math.floor(minutesBefore / 60);
    // If 1 hr before (0-59 mins), it's the opposite Swara.
    // Wait, if it's 0-59 mins before, hour index is 0, which means 1 hour ago.
    if (hoursBefore % 2 === 0) {
      activeSwara = swaraData.sunriseSwara === "ida" ? "pingala" : "ida";
    } else {
      activeSwara = swaraData.sunriseSwara;
    }
  }

  return activeSwara;
}`;

content = content.replace(targetFunc, replacementFunc);
fs.writeFileSync(file, content);
console.log('patched Nadi alternating logic');
