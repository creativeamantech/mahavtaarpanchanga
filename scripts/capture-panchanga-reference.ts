import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { computePanchangaCustom } from "../src/lib/panchangaEngine.server";
import type { CoordinateSelection, MonthSystem } from "../src/types";

const SOURCE_REPOSITORY = "creativeamantech/mahavtaarpanchanga";
const ENGINE_PATH = "src/lib/panchangaEngine.server.ts";
const ASTRONOMY_ENGINE_VERSION = "2.1.19";
const OUT_DIR = resolve(process.env.REFERENCE_OUT_DIR ?? "reference/panchanga/v1");

type Scenario = {
  id: string;
  description: string;
  date: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  monthSystem: MonthSystem;
  coordinateSelection: CoordinateSelection;
};

const cities = [
  { id: "bhopal", name: "Bhopal", latitude: 23.2599, longitude: 77.4126, timezone: "Asia/Kolkata" },
  { id: "indore", name: "Indore", latitude: 22.7196, longitude: 75.8577, timezone: "Asia/Kolkata" },
  { id: "ujjain", name: "Ujjain", latitude: 23.1765, longitude: 75.7885, timezone: "Asia/Kolkata" },
  { id: "varanasi", name: "Varanasi", latitude: 25.3176, longitude: 82.9739, timezone: "Asia/Kolkata" },
  { id: "delhi", name: "Delhi", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
  { id: "chennai", name: "Chennai", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  { id: "london", name: "London", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  { id: "new-york", name: "New York", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { id: "singapore", name: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  { id: "sydney", name: "Sydney", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
] as const;

const scenarios: Scenario[] = [];
const baselineDates = [
  { date: "2026-03-20", label: "March equinox season" },
  { date: "2026-06-21", label: "June solstice season" },
  { date: "2026-11-19", label: "November baseline" },
];

for (const city of cities) {
  for (const sample of baselineDates) {
    scenarios.push({
      id: `${city.id}-${sample.date}`,
      description: `${city.name}: ${sample.label}; baseline Amanta and Chitrapaksha`,
      date: sample.date,
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      monthSystem: "amanta",
      coordinateSelection: "citra",
    });
  }
}

const bhopal = cities[0];
for (const sample of baselineDates) {
  scenarios.push({
    id: `bhopal-${sample.date}-purnimanta`,
    description: "Bhopal month-system comparison probe",
    date: sample.date,
    city: bhopal.name,
    latitude: bhopal.latitude,
    longitude: bhopal.longitude,
    timezone: bhopal.timezone,
    monthSystem: "purnimanta",
    coordinateSelection: "citra",
  });
}

const coordinateModes: CoordinateSelection[] = [
  "revati", "rohini", "pushya", "mula", "krishnamurti", "raman", "tropical",
];
for (const mode of coordinateModes) {
  scenarios.push({
    id: `bhopal-2026-11-19-${mode}`,
    description: `Bhopal ayanamsha/coordinate-selection coverage: ${mode}`,
    date: "2026-11-19",
    city: bhopal.name,
    latitude: bhopal.latitude,
    longitude: bhopal.longitude,
    timezone: bhopal.timezone,
    monthSystem: "amanta",
    coordinateSelection: mode,
  });
}

scenarios.push({
  id: "bhopal-2023-07-18-lunar-month-probe",
  description: "Historical lunar-month probe; record source output without assuming Adhika Masa status",
  date: "2023-07-18",
  city: bhopal.name,
  latitude: bhopal.latitude,
  longitude: bhopal.longitude,
  timezone: bhopal.timezone,
  monthSystem: "amanta",
  coordinateSelection: "citra",
});

async function sourceCommit(): Promise<string> {
  if (process.env.SOURCE_COMMIT) return process.env.SOURCE_COMMIT;
  const result = Bun.spawnSync(["git", "rev-parse", "HEAD"], { stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) {
    throw new Error("Cannot determine source commit. Set SOURCE_COMMIT explicitly.");
  }
  return new TextDecoder().decode(result.stdout).trim();
}

await mkdir(OUT_DIR, { recursive: true });
const commit = await sourceCommit();
const capturedAt = new Date().toISOString();
const manifest = {
  schemaVersion: 1,
  source: {
    repository: SOURCE_REPOSITORY,
    commit,
    enginePath: ENGINE_PATH,
    astronomyEngineVersion: ASTRONOMY_ENGINE_VERSION,
    generatedAtUtc: capturedAt,
  },
  fixtureCount: scenarios.length,
  fixtures: [] as { id: string; file: string; city: string; date: string; monthSystem: MonthSystem; coordinateSelection: CoordinateSelection }[],
};

for (const scenario of scenarios) {
  const expected = computePanchangaCustom(
    scenario.latitude,
    scenario.longitude,
    scenario.timezone,
    scenario.date,
    scenario.monthSystem,
    scenario.coordinateSelection,
    scenario.city,
  );
  const fixture = {
    schemaVersion: 1,
    source: manifest.source,
    scenario,
    expected,
  };
  const file = `${scenario.id}.json`;
  await Bun.write(resolve(OUT_DIR, file), JSON.stringify(fixture, null, 2) + "\n");
  manifest.fixtures.push({
    id: scenario.id,
    file,
    city: scenario.city,
    date: scenario.date,
    monthSystem: scenario.monthSystem,
    coordinateSelection: scenario.coordinateSelection,
  });
  console.log(`Captured ${scenario.id}`);
}

await Bun.write(resolve(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Captured ${manifest.fixtureCount} reference fixtures from ${commit}`);
console.log(`Output: ${OUT_DIR}`);
