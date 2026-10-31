import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import PanchangaApp from "../PanchangaApp";

const description =
  "High-precision observational Hindu lunisolar calendar (Drik Panchanga) with accurate Tithi, Nakshatra, Yoga, Karana, auspicious timings, planetary positions and transits.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mahavtaar Panchanga — Drik Panchanga Calendar" },
      { name: "description", content: description },
      { property: "og:title", content: "Mahavtaar Panchanga — Drik Panchanga Calendar" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-[#0b0f19]" />}>
      <PanchangaApp />
    </ClientOnly>
  );
}
