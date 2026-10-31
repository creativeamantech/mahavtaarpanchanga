import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie } from "../lib/auth/sheetsUserAuth.server";

export const Route = createFileRoute("/api/auth/logout")({
  server: { handlers: {
    POST: async ({ request }) => {
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(request.url).origin) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 });
      }
      return Response.json({ ok: true }, {
        headers: {
          "Set-Cookie": clearSessionCookie(),
          "Cache-Control": "no-store",
        },
      });
    },
  } },
});
