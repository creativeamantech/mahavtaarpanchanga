import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { validateApiKey } from "../sheetsAuth.server";

export default defineTool({
  name: "get_muhurtas",
  title: "Get Auspicious Timings",
  description:
    "Fetch auspicious and inauspicious timings (Muhurtas) for a given date and location: Brahma Muhurta, Abhijit Muhurta, Amrita Kala, Choghadiya, and Hora breakdown.",
  inputSchema: {
    api_key: z.string().min(1).describe("Your API key from the Panchanga Power Users sheet."),
    date: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/)
      .describe("Date in DD/MM/YYYY format, e.g. '14/10/2026'."),
    latitude: z.number().min(-90).max(90).describe("Location latitude."),
    longitude: z.number().min(-180).max(180).describe("Location longitude."),
    timezone_offset: z.number().describe("UTC offset in decimal hours, e.g. 5.5 for IST."),
    city: z.string().optional().describe("City name for display purposes."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key, date, latitude, longitude, timezone_offset, city }) => {
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
        city || `Custom (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`
      );
      data = result as unknown as Record<string, unknown>;
    } catch {
      const baseUrl = process.env["VITE_APP_URL"] ?? "http://localhost:3000";
      const url = `${baseUrl}/api/panchanga?date=${yyyy}-${mm}-${dd}&lat=${latitude}&lon=${longitude}&tz=${timezone_offset}&city=${encodeURIComponent(city ?? "")}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new ToolError(`API call failed [${res.status}]`);
        data = (await res.json()) as Record<string, unknown>;
      } catch (err) {
        if (err instanceof ToolError) throw err;
        throw new ToolError(`Failed to fetch timings: ${String(err instanceof Error ? err.message : err)}`);
      }
    }

    const lines: string[] = [
      `🕐 Auspicious Timings for ${date}${city ? ` — ${city}` : ""}`,
      ``,
      `SPECIAL MUHURTAS`,
    ];

    if (data.brahma_muhurta) {
      const b = data.brahma_muhurta as Record<string, unknown>;
      lines.push(`• Brahma Muhurta: ${b.start ?? "—"} – ${b.end ?? "—"} (most auspicious for meditation)`);
    }
    if (data.abhijit_muhurta) {
      const a = data.abhijit_muhurta as Record<string, unknown>;
      lines.push(`• Abhijit Muhurta: ${a.start ?? "—"} – ${a.end ?? "—"} (auspicious midday period)`);
    }
    if (Array.isArray(data.amrita_kala) && (data.amrita_kala as unknown[]).length > 0) {
      lines.push(
        `• Amrita Kala: ${(data.amrita_kala as Array<Record<string, unknown>>).map((k) => `${k.start}–${k.end}`).join(", ")}`
      );
    }

    lines.push("", "CHOGHADIYA (Day & Night Segments)");
    const dayChoghadiya = (data.gauri_choghadiya_day || data.choghadiya) as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(dayChoghadiya) && dayChoghadiya.length > 0) {
      lines.push("Day Choghadiya:");
      for (const c of dayChoghadiya) {
        lines.push(`  • ${c.start ?? "—"} – ${c.end ?? "—"}: ${c.name ?? "—"}`);
      }
    }
    const nightChoghadiya = data.gauri_choghadiya_night as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(nightChoghadiya) && nightChoghadiya.length > 0) {
      lines.push("Night Choghadiya:");
      for (const c of nightChoghadiya) {
        lines.push(`  • ${c.start ?? "—"} – ${c.end ?? "—"}: ${c.name ?? "—"}`);
      }
    }

    lines.push("", "INAUSPICIOUS PERIODS (AVOID)");
    if (data.rahu_kala) {
      const r = data.rahu_kala as Record<string, unknown>;
      lines.push(`• Rahu Kala: ${r.start ?? "—"} – ${r.end ?? "—"}`);
    }
    if (data.yamaganda) {
      const y = data.yamaganda as Record<string, unknown>;
      lines.push(`• Yamaganda: ${y.start ?? "—"} – ${y.end ?? "—"}`);
    }
    if (data.gulika_kala) {
      const g = data.gulika_kala as Record<string, unknown>;
      lines.push(`• Gulika Kala: ${g.start ?? "—"} – ${g.end ?? "—"}`);
    }

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
      structuredContent: {
        brahma_muhurta: data.brahma_muhurta,
        abhijit_muhurta: data.abhijit_muhurta,
        amrita_kala: data.amrita_kala,
        gauri_choghadiya_day: data.gauri_choghadiya_day,
        gauri_choghadiya_night: data.gauri_choghadiya_night,
        rahu_kala: data.rahu_kala,
        yamaganda: data.yamaganda,
        gulika_kala: data.gulika_kala,
      } as any,
    };
  },
});
