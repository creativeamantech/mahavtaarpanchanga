import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { validateApiKey } from "../sheetsAuth.server";

export default defineTool({
  name: "get_planetary_positions",
  title: "Get Planetary Positions",
  description:
    "Fetch Vedic (sidereal) planetary positions for a given date and location: longitude, rashi (sign), nakshatra, degree, and whether each planet is combust, retrograde, or exalted.",
  inputSchema: {
    api_key: z.string().min(1).describe("Your API key from the Panchanga Power Users sheet."),
    date: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/)
      .describe("Date in DD/MM/YYYY format, e.g. '14/10/2026'."),
    latitude: z.number().min(-90).max(90).describe("Location latitude."),
    longitude: z.number().min(-180).max(180).describe("Location longitude."),
    timezone_offset: z.number().describe("UTC offset in decimal hours, e.g. 5.5 for IST."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key, date, latitude, longitude, timezone_offset }) => {
    try {
      await validateApiKey(api_key);
    } catch (err) {
      throw new ToolError(String(err instanceof Error ? err.message : err));
    }

    const parts = date.split("/");
    if (parts.length !== 3) throw new ToolError("date must be in DD/MM/YYYY format.");
    const [dd, mm, yyyy] = parts;

    let data: Record<string, unknown>;
    try {
      const { initPanchangaEngine, computePanchangaCustom } = await import("../../panchangaEngine.server");
      initPanchangaEngine();
      const result = computePanchangaCustom(
        latitude,
        longitude,
        String(timezone_offset),
        `${dd}/${mm}/${yyyy}`,
        "amanta",
        "citra",
        `Coordinates (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`
      );
      data = result as unknown as Record<string, unknown>;
    } catch {
      const baseUrl = process.env["VITE_APP_URL"] ?? "http://localhost:3000";
      const url = `${baseUrl}/api/panchanga?date=${yyyy}-${mm}-${dd}&lat=${latitude}&lon=${longitude}&tz=${timezone_offset}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new ToolError(`API call failed [${res.status}]`);
        data = (await res.json()) as Record<string, unknown>;
      } catch (err) {
        if (err instanceof ToolError) throw err;
        throw new ToolError(`Failed to fetch positions: ${String(err instanceof Error ? err.message : err)}`);
      }
    }

    const planets = data.planets as Array<Record<string, unknown>> | undefined;

    const lines: string[] = [
      `🪐 Vedic Planetary Positions for ${date}`,
      `   (Sidereal / Lahiri Ayanamsha)`,
      ``,
      `Planet         Rashi        Degree    Nakshatra`,
      `─────────────────────────────────────────────────`,
    ];

    if (Array.isArray(planets) && planets.length > 0) {
      for (const p of planets) {
        const name = String(p.name ?? p.planet ?? "?").padEnd(14);
        const rashi = String(p.rasi ?? p.rashi ?? p.sign ?? "?").padEnd(12);
        const deg = String(
          p.degrees_in_rasi ??
            p.degreesInRasi ??
            (typeof p.degree === "number" ? p.degree.toFixed(2) + "°" : p.longitude ?? "?")
        ).padEnd(9);
        const nak = String(p.nakshatra ?? "?");
        const flags: string[] = [];
        if (p.is_retrograde || p.isRetrograde || p.retrograde) flags.push("℞");
        if (p.combust) flags.push("combust");
        if (p.exalted) flags.push("exalted");
        if (p.debilitated) flags.push("debilitated");
        lines.push(`${name} ${rashi} ${deg} ${nak}${flags.length ? `  [${flags.join(", ")}]` : ""}`);
      }
    } else {
      lines.push("Planetary data not available for this date.");
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
      structuredContent: { planets: (planets ?? []) as any },
    };
  },
});
