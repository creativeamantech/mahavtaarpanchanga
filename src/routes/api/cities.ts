import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cities")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { initPanchangaEngine, searchCities, getPopularCities } =
          await import("../../lib/panchangaEngine.server");
        initPanchangaEngine();
        const url = new URL(request.url);
        const query = (url.searchParams.get("q") || "").trim();
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        try {
          if (!query) return Response.json({ cities: getPopularCities() });
          return Response.json({ cities: searchCities(query, limit) });
        } catch (err: any) {
          return Response.json(
            { error: err?.message || "Failed to search cities" },
            { status: 500 },
          );
        }
      },
    },
  },
});
