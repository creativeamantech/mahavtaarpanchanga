import { defineMcp } from "@lovable.dev/mcp-js";
import getPanchanga from "./tools/getPanchanga";
import getMuhurtas from "./tools/getMuhurtas";
import getPlanetaryPositions from "./tools/getPlanetaryPositions";

export default defineMcp({
  name: "panchanga-power",
  title: "Panchanga Power",
  version: "1.0.0",
  instructions:
    "Tools for the Mahavtaar Panchanga Vedic almanac. " +
    "All tools require an `api_key` parameter — obtain yours from the app owner via the Panchanga Power Users Google Sheet. " +
    "Available tools: `get_panchanga` (full daily almanac), `get_muhurtas` (auspicious timings), `get_planetary_positions` (sidereal planet positions). " +
    "Dates must be in DD/MM/YYYY format. Latitude/longitude are decimal degrees. Timezone offset is decimal hours (IST = 5.5).",
  tools: [getPanchanga, getMuhurtas, getPlanetaryPositions],
});
