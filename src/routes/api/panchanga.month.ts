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

          const fromParam = q.get("from") || q.get("start_date");
          const toParam = q.get("to") || q.get("end_date");

          const parseParamDate = (str: string | null): Date | null => {
            if (!str) return null;
            if (str.includes("-")) {
              const parts = str.split("-").map(Number);
              if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                return new Date(parts[0], parts[1] - 1, parts[2]);
              }
            } else if (str.includes("/")) {
              const parts = str.split("/").map(Number);
              if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
              }
            }
            return null;
          };

          const startDate = parseParamDate(fromParam);
          const endDate = parseParamDate(toParam);

          const days: any[] = [];

          if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            // Ensure start <= end
            const start = startDate <= endDate ? startDate : endDate;
            const end = startDate <= endDate ? endDate : startDate;
            const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const stop = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            let count = 0;
            // Cap at 92 days to prevent excessive computation
            while (cur <= stop && count < 92) {
              const d = cur.getDate();
              const m = cur.getMonth() + 1;
              const y = cur.getFullYear();
              const dateStr = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;

              try {
                const p = computePanchanga(city, dateStr, monthSystem, ayanamsa);
                days.push({
                  day: d,
                  month: m,
                  year: y,
                  date: dateStr,
                  vaara: p.vaara,
                  tithi: p.tithi[0]?.name || "",
                  tithi_ends: p.tithi[0]?.ends || null,
                  tithis: p.tithi || [],
                  nakshatra: p.nakshatra[0]?.name || "",
                  nakshatra_number: p.nakshatra[0]?.number || 1,
                  nakshatra_ends: p.nakshatra[0]?.ends || null,
                  nakshatras: p.nakshatra || [],
                  next_nakshatra: p.nakshatra[1]?.name || null,
                  next_nakshatra_number: p.nakshatra[1]?.number || null,
                  moon_rasi: p.moon_rasi || "",
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
                // skip day error
              }

              cur.setDate(cur.getDate() + 1);
              count++;
            }

            return Response.json({
              year,
              month,
              isDateRange: true,
              fromDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
              toDate: `${stop.getFullYear()}-${String(stop.getMonth() + 1).padStart(2, "0")}-${String(stop.getDate()).padStart(2, "0")}`,
              days,
            });
          }

          // Default full month mode
          const daysInMonth = new Date(year, month, 0).getDate();

          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${String(d).padStart(2, "0")}/${String(month).padStart(
              2,
              "0",
            )}/${year}`;
            try {
              const p = computePanchanga(city, dateStr, monthSystem, ayanamsa);
              days.push({
                day: d,
                month,
                year,
                date: dateStr,
                vaara: p.vaara,
                tithi: p.tithi[0]?.name || "",
                tithi_ends: p.tithi[0]?.ends || null,
                tithis: p.tithi || [],
                nakshatra: p.nakshatra[0]?.name || "",
                nakshatra_number: p.nakshatra[0]?.number || 1,
                nakshatra_ends: p.nakshatra[0]?.ends || null,
                nakshatras: p.nakshatra || [],
                next_nakshatra: p.nakshatra[1]?.name || null,
                next_nakshatra_number: p.nakshatra[1]?.number || null,
                moon_rasi: p.moon_rasi || "",
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

          return Response.json({ year, month, isDateRange: false, days });
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
