import { createFileRoute } from "@tanstack/react-router";
import type { CoordinateSelection, MonthSystem } from "@/types";

export const Route = createFileRoute("/api/panchanga")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { initPanchangaEngine, computePanchanga, computePanchangaCustom } = await import(
          "@/lib/panchangaEngine.server"
        );
        initPanchangaEngine();
        const url = new URL(request.url);
        const q = url.searchParams;
        try {
          const city = q.get("city") || "";
          const monthSystem = (q.get("month_system") || "amanta") as MonthSystem;
          const ayanamsa = (q.get("ayanamsa") || "citra") as CoordinateSelection;
          const latRaw = q.get("lat");
          const lonRaw = q.get("lon");
          const tz = q.get("tz");

          let targetDateStr = q.get("date") || "";
          if (!targetDateStr) {
            const now = new Date();
            targetDateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
              now.getMonth() + 1,
            ).padStart(2, "0")}/${now.getFullYear()}`;
          }

          const lat = latRaw ? parseFloat(latRaw) : null;
          const lon = lonRaw ? parseFloat(lonRaw) : null;

          const result =
            lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon) && tz
              ? computePanchangaCustom(
                  lat,
                  lon,
                  tz,
                  targetDateStr,
                  monthSystem,
                  ayanamsa,
                  city || "Custom Location",
                )
              : computePanchanga(city || "Bengaluru, IN", targetDateStr, monthSystem, ayanamsa);

          return Response.json(result);
        } catch (err: any) {
          return Response.json(
            { error: err?.message || "Failed to compute panchanga" },
            { status: 400 },
          );
        }
      },
    },
  },
});
