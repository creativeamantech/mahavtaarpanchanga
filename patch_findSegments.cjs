const fs = require("fs");

function formatPanchangaTime(dateMs, tz) {
  if (!dateMs) return "";
  const d = new Date(dateMs);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

let code = fs.readFileSync("src/lib/panchangaEngine.server.ts", "utf8");

const replacement = `
function formatPanchangaTime(dateMs: number, tz: string): string {
  const d = new Date(dateMs);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function findSegments(
  fn: (t: Astronomy.AstroTime) => number,
  namesMap: Record<string, string>,
  tSunrise: Astronomy.AstroTime,
  tNextSunrise: Astronomy.AstroTime,
  localMidnight: Date,
  totalItems: number = 30,
  tz: string = "UTC"
): Segment[] {
  const vSunrise = fn(tSunrise);
  const currentNum = (Math.floor(vSunrise) % totalItems) + 1;
  const segments: Segment[] = [];
  const name = namesMap[currentNum.toString()] || \`Item \${currentNum}\`;
  const target = Math.floor(vSunrise) + 1;
  
  // Find End
  const crossing = findBoundaryCrossing(fn, target, tSunrise, tNextSunrise);
  
  // Find Start (look back up to 36h, forward up to 12h)
  const tSearchStart = Astronomy.MakeTime(new Date(tSunrise.date.getTime() - 36 * 3600000));
  const tSearchEnd = Astronomy.MakeTime(new Date(tSunrise.date.getTime() + 12 * 3600000));
  const startCrossing = findBoundaryCrossing(fn, Math.floor(vSunrise), tSearchStart, tSearchEnd);
  
  const startTimeMs = startCrossing ? startCrossing.date.getTime() : undefined;
  const starts = startTimeMs ? formatPanchangaTime(startTimeMs, tz) : undefined;

  if (crossing && crossing.date.getTime() <= tNextSunrise.date.getTime()) {
    const localHours = (crossing.date.getTime() - localMidnight.getTime()) / 3600000;
    const endsStr = formatTimeHMS(localHours);
    const endTimeMs = crossing.date.getTime();
    
    segments.push({
      number: currentNum,
      name,
      ends: endsStr,
      startTimeMs,
      endTimeMs,
      starts,
    });

    const nextNum = (currentNum % totalItems) + 1;
    const nextName = namesMap[nextNum.toString()] || \`Item \${nextNum}\`;
    const target2 = target + 1;
    const crossing2 = findBoundaryCrossing(fn, target2, crossing, tNextSunrise);
    
    if (crossing2 && crossing2.date.getTime() <= tNextSunrise.date.getTime()) {
      const localHours2 = (crossing2.date.getTime() - localMidnight.getTime()) / 3600000;
      segments.push({
        number: nextNum,
        name: nextName,
        ends: formatTimeHMS(localHours2),
        startTimeMs: endTimeMs,
        endTimeMs: crossing2.date.getTime(),
        starts: formatPanchangaTime(endTimeMs, tz),
      });
    } else {
      segments.push({
        number: nextNum,
        name: nextName,
        ends: null,
        startTimeMs: endTimeMs,
        starts: formatPanchangaTime(endTimeMs, tz),
      });
    }
  } else {
    segments.push({
      number: currentNum,
      name,
      ends: null,
      startTimeMs,
      starts,
    });
  }
  return segments;
}
`;

const originalFunction = code.substring(
  code.indexOf("function findSegments("),
  code.indexOf("const VARJYAM_START_GHATIS"),
);

code = code.replace(originalFunction, replacement);
fs.writeFileSync("src/lib/panchangaEngine.server.ts", code);
