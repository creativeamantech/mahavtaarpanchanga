import { createFileRoute } from "@tanstack/react-router";
import type { CoordinateSelection, MonthSystem } from "../../types";

export const Route = createFileRoute("/api/panchanga/month")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { initPanchangaEngine, computePanchanga } =
          await import("../../lib/panchangaEngine.server");
        initPanchangaEngine();
        const url = new URL(request.url);
        const q = url.searchParams;
        try {
          const city = q.get("city") || "Bengaluru, IN";
          const year = parseInt(q.get("year") || "", 10) || new Date().getFullYear();
          const month = parseInt(q.get("month") || "", 10) || new Date().getMonth() + 1;
          const monthSystem = (q.get("month_system") || "amanta") as MonthSystem;
          const ayanamsa = (q.get("ayanamsa") || "citra") as CoordinateSelection;

          const daysInMonth = new Date(year, month, 0).getDate();
          const days: any[] = [];

          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${String(d).padStart(2, "0")}/${String(month).padStart(
              2,
              "0",
            )}/${year}`;
            try {
              const p = computePanchanga(city, dateStr, monthSystem, ayanamsa);
              days.push({
                day: d,
                date: dateStr,
                vaara: p.vaara,
                tithi: p.tithi[0]?.name || "",
                nakshatra: p.nakshatra[0]?.name || "",
                yoga: p.yoga[0]?.name || "",
                karana: p.karana[0]?.name || "",
                sunrise: p.sunrise,
                sunset: p.sunset,
                masa: p.masa,
                paksha: p.paksha,
                rahu_kala: p.rahu_kala,
                swara_yoga: p.swara_yoga,
              });
            } catch {
              // skip invalid day
            }
          }

          return Response.json({ year, month, days });
        } catch (err: any) {
          return Response.json(
            { error: err?.message || "Failed to compute monthly panchanga" },
            { status: 500 },
          );
        }
      },
    },
  },
});
