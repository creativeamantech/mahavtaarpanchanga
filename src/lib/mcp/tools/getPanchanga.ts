import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { validateApiKey } from "../sheetsAuth.server";

export default defineTool({
  name: "get_panchanga",
  title: "Get Daily Panchanga",
  description:
    "Fetch the complete Vedic Panchanga (almanac) for a given date and location, including Tithi, Nakshatra, Yoga, Karana, Vara, Masa, Paksha, sunrise/sunset, Rahu Kala, Yamaganda, and Gulika Kala.",
  inputSchema: {
    api_key: z.string().min(1).describe("Your API key from the Panchanga Power Users sheet."),
    date: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/)
      .describe("Date in DD/MM/YYYY format, e.g. '14/10/2026'."),
    latitude: z.number().min(-90).max(90).describe("Location latitude, e.g. 28.6139 for New Delhi."),
    longitude: z.number().min(-180).max(180).describe("Location longitude, e.g. 77.209 for New Delhi."),
    timezone_offset: z
      .number()
      .describe("UTC offset in decimal hours, e.g. 5.5 for IST (UTC+5:30)."),
    city: z.string().optional().describe("City name for display purposes."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ api_key, date, latitude, longitude, timezone_offset, city }) => {
    try {
      await validateApiKey(api_key);
    } catch (err) {
      throw new ToolError(String(err instanceof Error ? err.message : err));
    }

    // Parse date
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
      // Fallback to internal HTTP route
      const baseUrl = process.env["VITE_APP_URL"] ?? "http://localhost:3000";
      const url = `${baseUrl}/api/panchanga?date=${yyyy}-${mm}-${dd}&lat=${latitude}&lon=${longitude}&tz=${timezone_offset}&city=${encodeURIComponent(city ?? "")}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.text();
          throw new ToolError(`Panchanga calculation failed [${res.status}]: ${body}`);
        }
        data = (await res.json()) as Record<string, unknown>;
      } catch (err) {
        if (err instanceof ToolError) throw err;
        throw new ToolError(`Failed to fetch Panchanga: ${String(err instanceof Error ? err.message : err)}`);
      }
    }

    const formatSegment = (val: unknown): string => {
      if (Array.isArray(val)) {
        return val.map((s: any) => s?.name || s?.name_sa || String(s)).join(" / ");
      }
      if (val && typeof val === "object") {
        return (val as any).name || (val as any).name_sa || JSON.stringify(val);
      }
      return val ? String(val) : "—";
    };

    const summary = [
      `📅 Panchanga for ${date}${city ? ` — ${city}` : ""}`,
      ``,
      `🌅 Sunrise: ${data.sunrise ?? "—"}   Sunset: ${data.sunset ?? "—"}`,
      ``,
      `PANCHA ANGAS`,
      `• Tithi:    ${formatSegment(data.tithi)}`,
      `• Nakshatra: ${formatSegment(data.nakshatra)}`,
      `• Yoga:     ${formatSegment(data.yoga)}`,
      `• Karana:   ${formatSegment(data.karana)}`,
      `• Vaara:    ${data.vaara ?? "—"}`,
      ``,
      `VEDIC CALENDAR`,
      `• Masa (Month): ${data.masa ?? "—"}`,
      `• Paksha:       ${data.paksha ?? "—"}`,
      `• Samvatsara:   ${data.samvatsara ?? "—"}`,
      ``,
      `INAUSPICIOUS PERIODS`,
      `• Rahu Kala:    ${data.rahu_kala ? `${(data.rahu_kala as Record<string, unknown>).start ?? "—"} – ${(data.rahu_kala as Record<string, unknown>).end ?? "—"}` : "—"}`,
      `• Yamaganda:    ${data.yamaganda ? `${(data.yamaganda as Record<string, unknown>).start ?? "—"} – ${(data.yamaganda as Record<string, unknown>).end ?? "—"}` : "—"}`,
      `• Gulika Kala:  ${data.gulika_kala ? `${(data.gulika_kala as Record<string, unknown>).start ?? "—"} – ${(data.gulika_kala as Record<string, unknown>).end ?? "—"}` : "—"}`,
    ].join("\n");

    return {
      content: [{ type: "text" as const, text: summary }],
      structuredContent: { panchanga: data as any },
    };
  },
});
