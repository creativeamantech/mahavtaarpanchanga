import * as XLSX from "xlsx";
import { DailyHoras, HORA_PLANET_NADI_TABLE } from "../horaEngine";
import { PanchangaResponse } from "../types";
import { Language } from "../i18n";

/**
 * Service to generate and trigger download of Excel (.xlsx) workbooks for Vedic calculations.
 */

export function exportHorasToExcel(dailyHoras: DailyHoras, dateStr: string, lang: Language = "en") {
  const wb = XLSX.utils.book_new();

  // 1. Master Table Sheet
  const masterData = [
    [
      lang === "hi" ? "ग्रह (Planet)" : "Planet (Graha)",
      lang === "hi" ? "नाड़ी (Swara Nadi)" : "Nadi (Swara)",
      lang === "hi" ? "नासिका प्रवाह" : "Nostril Flow",
      lang === "hi" ? "मुख्य तत्त्व" : "Primary Tattva",
      lang === "hi" ? "अवधि (६० मि में)" : "Duration (in 60 mins)",
      lang === "hi" ? "प्रकृति एवं कार्य" : "Nature & Activities",
    ],
    [
      "Sun (सूर्य)",
      "Pingala (सूर्य नाड़ी)",
      "Right (दायाँ)",
      "Agni (अग्नि)",
      "12 mins",
      "Leadership, authority, health & vitality",
    ],
    [
      "Moon (चन्द्र)",
      "Ida (चन्द्र नाड़ी)",
      "Left (बायाँ)",
      "Jala (जल)",
      "16 mins",
      "Public relations, calm works, mother & emotions",
    ],
    [
      "Mars (मंगल)",
      "Pingala (सूर्य नाड़ी)",
      "Right (दायाँ)",
      "Agni (अग्नि)",
      "12 mins",
      "Courage, technical work, exercise & physical vigor",
    ],
    [
      "Mercury (बुध)",
      "Ida (चन्द्र नाड़ी)",
      "Left (बायाँ)",
      "Jala / Prithvi",
      "20 mins",
      "Commerce, writing, analytics & communication",
    ],
    [
      "Jupiter (गुरु)",
      "Ida (चन्द्र नाड़ी)",
      "Left (बायाँ)",
      "Akasha (आकाश)",
      "4 mins",
      "Wisdom, education, wealth & spiritual growth",
    ],
    [
      "Venus (शुक्र)",
      "Ida (चन्द्र नाड़ी)",
      "Left (बायाँ)",
      "Jala (जल)",
      "16 mins",
      "Arts, romance, luxury, diplomatic agreements",
    ],
    [
      "Saturn (शनि)",
      "Pingala (सूर्य नाड़ी)",
      "Right (दायाँ)",
      "Vayu (वायु)",
      "8 mins",
      "Discipline, physical labor, dealing with elders",
    ],
    [
      "Rahu / Ketu",
      "Sushumna (सुषुम्ना)",
      "Both (उभय)",
      "Ether / Sandhi",
      "Transition",
      "Meditation, Mantra Japa & Spiritual Liberation",
    ],
  ];

  const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, wsMaster, "Hora_Nadi_Tattva_Master");

  // 2. 24 Horas Daily Schedule Sheet
  const scheduleRows = dailyHoras.horas.map((h) => {
    const tattvaTimelineStr = h.tattvas
      .map((t) => `${t.sanskrit} (${t.name}): ${t.startTime}-${t.endTime} [${t.durationMins}m]`)
      .join(" | ");

    return {
      "Hora #": h.index,
      "Day/Night": h.isDay ? (lang === "hi" ? "दिन" : "Day") : lang === "hi" ? "रात्रि" : "Night",
      "Start Time": h.startTime,
      "End Time": h.endTime,
      "Duration (Mins)": Math.round(h.durationMs / 60000),
      "Planetary Ruler": h.ruler,
      "Swara Nadi":
        h.nadi === "ida"
          ? "Ida (Lunar - Left Nostril)"
          : h.nadi === "pingala"
            ? "Pingala (Solar - Right Nostril)"
            : "Sushumna",
      "Sub-Tattva Timeline (5 Elements)": tattvaTimelineStr,
    };
  });

  const wsSchedule = XLSX.utils.json_to_sheet(scheduleRows);
  XLSX.utils.book_append_sheet(wb, wsSchedule, "Daily_24_Horas_Schedule");

  // Write file
  XLSX.writeFile(wb, `Vedic_Horas_HoraNadiTattva_${dateStr}.xlsx`);
}

export function exportDailyPanchangaToExcel(data: PanchangaResponse, lang: Language = "en") {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    { Parameter: "Date", Value: data.date },
    { Parameter: "Day", Value: data.day || data.weekday },
    { Parameter: "Location", Value: `${data.city || ""}, ${data.country || ""}` },
    { Parameter: "Timezone", Value: data.timezone },
    { Parameter: "Sunrise", Value: data.sunrise },
    { Parameter: "Sunset", Value: data.sunset },
    { Parameter: "Moonrise", Value: data.moonrise },
    { Parameter: "Moonset", Value: data.moonset },
    { Parameter: "Sun Sign", Value: data.sun_sign },
    { Parameter: "Moon Sign", Value: data.moon_sign },
    {
      Parameter: "Tithi",
      Value: data.tithi
        .map((t) => `${t.name} (Paksha: ${t.paksha}) until ${t.end_time || "Full Day"}`)
        .join("; "),
    },
    {
      Parameter: "Nakshatra",
      Value: data.nakshatra
        .map((n) => `${n.name} (Pada ${n.pada || 1}) until ${n.end_time || "Full Day"}`)
        .join("; "),
    },
    {
      Parameter: "Yoga",
      Value: data.yoga.map((y) => `${y.name} until ${y.end_time || "Full Day"}`).join("; "),
    },
    {
      Parameter: "Karana",
      Value: data.karana.map((k) => `${k.name} until ${k.end_time || "Full Day"}`).join("; "),
    },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Daily_Panchanga_Overview");

  XLSX.writeFile(wb, `Daily_Panchanga_${data.date}.xlsx`);
}
