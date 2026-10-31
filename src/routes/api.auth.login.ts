import { createFileRoute } from "@tanstack/react-router";
import { authenticate, sessionCookie } from "../lib/auth/sheetsUserAuth.server";

export const Route = createFileRoute("/api/auth/login")({
  server: { handlers: {
    POST: async ({ request }) => {
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(request.url).origin) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 });
      }
      let body: unknown;
      try { body = await request.json(); } catch {
        return Response.json({ error: "Invalid JSON body." }, { status: 400 });
      }
      const input = body as { username?: unknown; password?: unknown };
      if (typeof input.username !== "string" || typeof input.password !== "string") {
        return Response.json({ error: "Username and password are required." }, { status: 400 });
      }
      try {
        const result = await authenticate(input.username, input.password);
        return Response.json({ user: result.user }, {
          headers: {
            "Set-Cookie": sessionCookie(result.token),
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication failed.";
        const status = message.includes("configuration missing") || message.includes("directory") || message.includes("temporarily unavailable") ? 503 : 401;
        return Response.json({ error: status === 401 ? message : "Authentication service is not configured." }, {
          status, headers: { "Cache-Control": "no-store" },
        });
      }
    },
  } },
});
