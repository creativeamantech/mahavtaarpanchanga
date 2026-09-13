import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/nearest-city")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { initPanchangaEngine, findNearestCity } = await import(
          "@/lib/panchangaEngine.server"
        );
        initPanchangaEngine();
        const url = new URL(request.url);
        const lat = parseFloat(url.searchParams.get("lat") || "");
        const lon = parseFloat(url.searchParams.get("lon") || "");
        if (Number.isNaN(lat) || Number.isNaN(lon)) {
          return Response.json(
            { error: "Valid lat and lon query parameters are required" },
            { status: 400 },
          );
        }
        try {
          const match = findNearestCity(lat, lon);
          return Response.json(match || { city: null, distanceKm: null });
        } catch (err: any) {
          return Response.json(
            { error: err?.message || "Failed to find nearest city" },
            { status: 500 },
          );
        }
      },
    },
  },
});
