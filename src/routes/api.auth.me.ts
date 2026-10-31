import { createFileRoute } from "@tanstack/react-router";
import { readSession } from "../lib/auth/sheetsUserAuth.server";

export const Route = createFileRoute("/api/auth/me")({
  server: { handlers: {
    GET: async ({ request }) => {
      const user = readSession(request);
      return Response.json({ user }, {
        status: user ? 200 : 401,
        headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
      });
    },
  } },
});
