import React, { useState, useEffect, useMemo } from "react";
import {
  Printer,
  X,
  Star,
  Compass,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  Download,
  Calendar,
  Sparkles,
  User,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Award,
  PenTool,
  Loader2,
  FileText,
  Check,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { PanchangaResponse, MonthlyPanchangaDay } from "../types";
import { type Language } from "../i18n";
import {
  ALL_27_NAKSHATRAS,
  getActiveNakshatraChangeInfo,
  getUpcomingNakshatraTransitions,
  generateComprehensiveNativeReport,
  PADA_EXPLANATIONS,
  computeMonthlyNavtaraReport,
  loadStoredNavtaraFeedbacks,
  saveDailyNavtaraFeedback,
  DAILY_FEEDBACK_OPTIONS,
  formatSimple12hTime,
  getMonthNameHi,
  getMonthNameEn,
  type DailyUserFeedback,
  type MonthlyNavtaraReportData,
} from "../lib/nakshatraTransitionHelper";

interface PrintableNavtaraReportProps {
  data: PanchangaResponse | null;
  lang: Language;
  initialBirthNakshatra: number;
  initialBirthPada?: number;
  initialPersonName?: string;
  initialYear?: number;
  initialMonth?: number;
  cityName?: string;
  onClose: () => void;
}

const WEEKDAYS_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const PrintableNavtaraReport: React.FC<PrintableNavtaraReportProps> = ({
  data,
  lang: defaultLang,
  initialBirthNakshatra,
  initialBirthPada = 1,
  initialPersonName = "",
  initialYear,
  initialMonth,
  cityName: propCityName,
  onClose,
}) => {
  const [reportLang, setReportLang] = useState<Language>(defaultLang);
  const [reportMode, setReportMode] = useState<"monthly" | "daily">("monthly");
  const [personName, setPersonName] = useState<string>(initialPersonName || "स्वयं (Self)");
  const [selectedNakshatra, setSelectedNakshatra] = useState<number>(initialBirthNakshatra || 1);
  const [selectedPada, setSelectedPada] = useState<number>(initialBirthPada || 1);

  // Month & Year state
  const currentDateParsed = useMemo(() => {
    if (data?.date) {
      if (data.date.includes("/")) {
        const [d, m, y] = data.date.split("/").map(Number);
        return { year: y || new Date().getFullYear(), month: m || new Date().getMonth() + 1 };
      }
      if (data.date.includes("-")) {
        const [y, m] = data.date.split("-").map(Number);
        return { year: y || new Date().getFullYear(), month: m || new Date().getMonth() + 1 };
      }
    }
    return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
  }, [data?.date]);

  const [selectedYear, setSelectedYear] = useState<number>(initialYear || currentDateParsed.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth || currentDateParsed.month);
  const cityName = propCityName || data?.city || "New Delhi, IN";

  // Helper to format Date as YYYY-MM-DD for HTML5 date inputs
  const formatDateForInput = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Date Selection Mode: "month" (पूरा माह) | "custom" (कस्टम दिनांक सीमा: प्रारंभ से अंतिम तिथि)
  const [dateSelectionMode, setDateSelectionMode] = useState<"month" | "custom">("month");

  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const today = new Date();
    return formatDateForInput(today);
  });

  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const end = new Date();
    end.setDate(end.getDate() + 29); // 30-day window by default
    return formatDateForInput(end);
  });

  // Quick Range Preset Handlers
  const applyPreset15Days = () => {
    const today = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    setCustomStartDate(formatDateForInput(today));
    setCustomEndDate(formatDateForInput(end));
  };

  const applyPreset30Days = () => {
    const today = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 29);
    setCustomStartDate(formatDateForInput(today));
    setCustomEndDate(formatDateForInput(end));
  };

  const applyPresetThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setCustomStartDate(formatDateForInput(start));
    setCustomEndDate(formatDateForInput(end));
  };

  const applyPresetNextMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    setCustomStartDate(formatDateForInput(start));
    setCustomEndDate(formatDateForInput(end));
  };

  // Monthly Panchanga days state & loading
  const [monthDays, setMonthDays] = useState<MonthlyPanchangaDay[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // User feedback state loaded from local storage
  const [userFeedbacks, setUserFeedbacks] = useState<Record<string, DailyUserFeedback>>({});
  const [editingDayDate, setEditingDayDate] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackNote, setFeedbackNote] = useState<string>("");

  // Report inclusion options
  const [includePadaGuide, setIncludePadaGuide] = useState<boolean>(true);
  const [includeFeedbackInPrint, setIncludeFeedbackInPrint] = useState<boolean>(true);
  const [printableBlankJournal, setPrintableBlankJournal] = useState<boolean>(false);
  const [includeMonthlyReflection, setIncludeMonthlyReflection] = useState<boolean>(true);

  // Daily snapshot options
  const [includeFullTable, setIncludeFullTable] = useState<boolean>(true);
  const [includeRemedies, setIncludeRemedies] = useState<boolean>(true);
  const [includeTaraDasa, setIncludeTaraDasa] = useState<boolean>(true);

  // Load user feedbacks whenever person or date range changes
  useEffect(() => {
    if (dateSelectionMode === "custom" && customStartDate && customEndDate) {
      const p1 = customStartDate.split("-").map(Number);
      const p2 = customEndDate.split("-").map(Number);
      const y1 = p1[0] || selectedYear;
      const m1 = p1[1] || selectedMonth;
      const y2 = p2[0] || selectedYear;
      const m2 = p2[1] || selectedMonth;
      const fbs1 = loadStoredNavtaraFeedbacks(personName, y1, m1);
      const fbs2 = (y1 !== y2 || m1 !== m2) ? loadStoredNavtaraFeedbacks(personName, y2, m2) : {};
      setUserFeedbacks({ ...fbs1, ...fbs2 });
    } else {
      const fbs = loadStoredNavtaraFeedbacks(personName, selectedYear, selectedMonth);
      setUserFeedbacks(fbs);
    }
  }, [personName, selectedYear, selectedMonth, dateSelectionMode, customStartDate, customEndDate]);

  // Fetch month or custom date range panchanga data
  useEffect(() => {
    let isCancelled = false;
    async function fetchPeriodData() {
      setIsLoadingMonth(true);
      setLoadError(null);
      try {
        const monthSys = data?.month_system || "amanta";
        const ayan = data?.ayanamsa_key || "citra";
        let url = "";
        if (dateSelectionMode === "custom") {
          url = `/api/panchanga/month?from=${customStartDate}&to=${customEndDate}&city=${encodeURIComponent(
            cityName,
          )}&month_system=${monthSys}&ayanamsa=${ayan}`;
        } else {
          url = `/api/panchanga/month?year=${selectedYear}&month=${selectedMonth}&city=${encodeURIComponent(
            cityName,
          )}&month_system=${monthSys}&ayanamsa=${ayan}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load period data");
        const json = await res.json();
        if (!isCancelled && json.days) {
          setMonthDays(json.days);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setLoadError(err?.message || "Could not load data");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMonth(false);
        }
      }
    }

    if (reportMode === "monthly") {
      fetchPeriodData();
    }
  }, [
    selectedYear,
    selectedMonth,
    dateSelectionMode,
    customStartDate,
    customEndDate,
    cityName,
    reportMode,
    data?.month_system,
    data?.ayanamsa_key,
  ]);

  // Daily snapshot data
  const dailyReportData = useMemo(() => {
    return generateComprehensiveNativeReport(
      personName,
      selectedNakshatra,
      selectedPada,
      data,
      Date.now(),
    );
  }, [personName, selectedNakshatra, selectedPada, data]);

  const isHindi = reportLang === "hi";

  // Dynamic Date Range label
  const dateRangeLabel = useMemo(() => {
    if (dateSelectionMode === "custom") {
      if (monthDays.length > 0) {
        const first = monthDays[0].date;
        const last = monthDays[monthDays.length - 1].date;
        return isHindi ? `${first} से ${last}` : `${first} to ${last}`;
      }
      return isHindi ? `${customStartDate} से ${customEndDate}` : `${customStartDate} to ${customEndDate}`;
    }
    return isHindi
      ? `${getMonthNameHi(selectedMonth)} ${selectedYear}`
      : `${getMonthNameEn(selectedMonth)} ${selectedYear}`;
  }, [dateSelectionMode, monthDays, customStartDate, customEndDate, selectedMonth, selectedYear, isHindi]);

  // Monthly or Custom Date Range report data
  const monthlyReportData: MonthlyNavtaraReportData = useMemo(() => {
    return computeMonthlyNavtaraReport(
      personName,
      selectedNakshatra,
      selectedPada,
      selectedYear,
      selectedMonth,
      cityName,
      monthDays,
      userFeedbacks,
      {
        isDateRange: dateSelectionMode === "custom",
        dateRangeLabel,
        fromDate: customStartDate,
        toDate: customEndDate,
      },
    );
  }, [
    personName,
    selectedNakshatra,
    selectedPada,
    selectedYear,
    selectedMonth,
    cityName,
    monthDays,
    userFeedbacks,
    dateSelectionMode,
    dateRangeLabel,
    customStartDate,
    customEndDate,
  ]);

  const upcomingIngresses = useMemo(() => {
    return getUpcomingNakshatraTransitions(data);
  }, [data]);

  // Calendar month / range day-of-week & categorized day groupings
  const firstDayWeekday = useMemo(() => {
    if (dateSelectionMode === "custom" && customStartDate) {
      const parts = customStartDate.split("-").map(Number);
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      }
    }
    return new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  }, [dateSelectionMode, customStartDate, selectedYear, selectedMonth]);

  const categorizedDays = useMemo(() => {
    const auspicious = monthlyReportData.days.filter((d) => d.dayNatureCategory === "auspicious");
    const mixed = monthlyReportData.days.filter((d) => d.dayNatureCategory === "mixed");
    const caution = monthlyReportData.days.filter((d) => d.dayNatureCategory === "caution");
    const neutral = monthlyReportData.days.filter((d) => d.dayNatureCategory === "neutral");
    return { auspicious, mixed, caution, neutral };
  }, [monthlyReportData.days]);

  // PDF & Download State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Generate & Download PDF using html2canvas and jsPDF
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfError(null);
    setDownloadSuccessToast(null);
    setGenerationStatus(reportLang === "hi" ? "दस्तावेज़ तैयार किया जा रहा है..." : "Preparing report document...");

    try {
      const sheet = document.getElementById("navtara-report-sheet");
      if (!sheet) {
        throw new Error(reportLang === "hi" ? "रिपोर्ट शीट नहीं मिली।" : "Report element not found.");
      }

      setGenerationStatus(reportLang === "hi" ? "पेज रेंडर हो रहे हैं..." : "Rendering document pages...");

      // Wait a moment to ensure all styles and fonts are ready
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(sheet, {
        scale: 1.6,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1024,
      });

      setGenerationStatus(reportLang === "hi" ? "PDF फ़ाइल बनाई जा रही है..." : "Building PDF file...");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      // Subsequent pages
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const filePeriod = dateSelectionMode === "custom"
        ? `${customStartDate}_to_${customEndDate}`
        : `${getMonthNameEn(selectedMonth)}_${selectedYear}`;
      const safeName = (personName || "User").replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, "_");
      const filename = `Navtara_Report_${filePeriod}_${safeName}.pdf`;

      pdf.save(filename);

      setDownloadSuccessToast(
        reportLang === "hi"
          ? `PDF सफलतापूर्वक डाउनलोड हो गई: ${filename}`
          : `PDF successfully downloaded: ${filename}`
      );
      setGenerationStatus("");
      setIsGeneratingPdf(false);

      setTimeout(() => {
        setDownloadSuccessToast(null);
      }, 5000);
    } catch (err: any) {
      console.error("PDF download error:", err);
      setPdfError(
        err?.message ||
          (reportLang === "hi"
            ? "PDF बनाने में असमर्थ। कृपया 'HTML सेव करें' का उपयोग करें।"
            : "Could not create PDF. Please try HTML download.")
      );
      setIsGeneratingPdf(false);
      setGenerationStatus("");
    }
  };

  // Instant Standalone HTML file download (works 100% offline in any browser with interactive feedback)
  const handleDownloadHtml = () => {
    try {
      const sheet = document.getElementById("navtara-report-sheet");
      if (!sheet) return;

      // Sync user input values into HTML attributes before cloning
      const inputs = sheet.querySelectorAll("input");
      inputs.forEach((inp) => {
        inp.setAttribute("value", inp.value);
      });

      // Extract inline <style> elements from DOM to retain custom styles
      const inlineStyles = Array.from(document.querySelectorAll("style"))
        .map((el) => el.innerHTML)
        .join("\n");

      // Only preserve absolute stylesheet links (e.g. Google fonts) to prevent 404s when opening offline or publishing
      const externalStyles = Array.from(document.querySelectorAll("link[rel='stylesheet']"))
        .filter((el) => {
          const href = el.getAttribute("href") || "";
          return href.startsWith("http://") || href.startsWith("https://");
        })
        .map((el) => el.outerHTML)
        .join("\n");

      const isHi = reportLang === "hi";
      const sanitizedName = (personName || "native").trim().toLowerCase().replace(/\s+/g, "_");
      const storageKey = dateSelectionMode === "custom"
        ? `navtara_feedback_${sanitizedName}_${customStartDate}_${customEndDate}`
        : `navtara_feedback_${sanitizedName}_${selectedYear}_${selectedMonth}`;
      const preloadedJson = JSON.stringify(userFeedbacks);

      const filePeriod = dateSelectionMode === "custom"
        ? `${customStartDate}_to_${customEndDate}`
        : `${getMonthNameEn(selectedMonth)}_${selectedYear}`;

      const fullHtml = `<!DOCTYPE html>
<html lang="${isHi ? "hi" : "en"}">
<head>
  <meta charset="utf-8">
  <title>Navtara Report - ${dateRangeLabel} - ${personName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  
  <!-- Google Fonts for authentic Vedic typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@500;600;700;800;900&display=swap" rel="stylesheet">
  ${externalStyles}

  <!-- Tailwind CSS standalone CDN engine for published & offline rendering -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
            devanagari: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
            'serif-vedic': ['"Noto Serif Devanagari"', 'Georgia', 'serif'],
            cinzel: ['Cinzel', 'Georgia', 'serif'],
          }
        }
      }
    };
  </script>

  <!-- Complete Standalone Fallback Styles -->
  <style>
    ${inlineStyles}
  </style>
  <style>
    /* Reset & Base Fonts */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 12px;
      background: #fafaf9;
      color: #1c1917;
      font-family: "Noto Sans Devanagari", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
    }
    .font-devanagari { font-family: "Noto Sans Devanagari", system-ui, sans-serif !important; }
    .font-serif-vedic { font-family: "Noto Serif Devanagari", Georgia, serif !important; }
    .font-cinzel { font-family: "Cinzel", Georgia, serif !important; }

    /* Hide elements marked hidden on screen */
    .hidden { display: none !important; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e7e5e4; padding: 6px 8px; }
    th { background: #fef3c7; color: #78350f; font-weight: 700; }

    /* Grid & Flex Fallbacks */
    .grid { display: grid; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .gap-1\.5 { gap: 6px; }
    .gap-2 { gap: 8px; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1 1 0%; }
    .w-full { width: 100%; }

    /* Interactive Feedback Buttons */
    .html-opt-btn {
      border-radius: 8px;
      padding: 8px 4px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      border: 1.5px solid #d6d3d1;
      background: #ffffff;
      color: #44403c;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      user-select: none;
    }
    .html-opt-btn:hover {
      background: #f5f5f4;
    }
    .html-opt-btn.opt-selected[data-feeling="great"],
    .html-opt-btn[data-selected="true"][data-feeling="great"] {
      background: #059669 !important;
      color: #ffffff !important;
      border-color: #047857 !important;
      box-shadow: 0 0 0 2px #6ee7b7 !important;
      font-weight: 700 !important;
    }
    .html-opt-btn.opt-selected[data-feeling="neutral"],
    .html-opt-btn[data-selected="true"][data-feeling="neutral"] {
      background: #d97706 !important;
      color: #ffffff !important;
      border-color: #b45309 !important;
      box-shadow: 0 0 0 2px #fde68a !important;
      font-weight: 700 !important;
    }
    .html-opt-btn.opt-selected[data-feeling="challenging"],
    .html-opt-btn[data-selected="true"][data-feeling="challenging"] {
      background: #dc2626 !important;
      color: #ffffff !important;
      border-color: #b91c1c !important;
      box-shadow: 0 0 0 2px #fca5a5 !important;
      font-weight: 700 !important;
    }
    .html-opt-btn.opt-selected span,
    .html-opt-btn[data-selected="true"] span {
      color: #ffffff !important;
    }

    /* Note Input & Button */
    input[data-note-input] {
      width: 100%;
      padding: 7px 10px;
      font-size: 11px;
      border: 1px solid #d6d3d1;
      border-radius: 8px;
      background: #ffffff;
      color: #1c1917;
      outline: none;
      box-sizing: border-box;
    }
    input[data-note-input]:focus {
      border-color: #d97706;
      background: #fffbeb;
      box-shadow: 0 0 0 2px #fde68a;
    }
    button[data-note-save] {
      background: #b45309;
      color: #ffffff;
      font-weight: bold;
      padding: 7px 14px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 11px;
      white-space: nowrap;
      transition: background 0.15s;
    }
    button[data-note-save]:hover {
      background: #92400e;
    }

    /* Responsive Views */
    @media (max-width: 768px) {
      .desktop-table-view { display: none !important; }
      .mobile-cards-view { display: block !important; }
    }
    @media (min-width: 769px) {
      .desktop-table-view { display: block !important; }
      .mobile-cards-view { display: none !important; }
    }

    /* Print Styles */
    @media print {
      @page { size: A4; margin: 10mm; }
      body { padding: 0 !important; background: #ffffff !important; }
      .screen-only-banner { display: none !important; }
      .print\\:hidden { display: none !important; }
      .print\\:block { display: block !important; }
      .desktop-table-view { display: block !important; }
      .mobile-cards-view { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <!-- Offline Interactive Toolbar -->
  <div class="screen-only-banner" style="max-width: 1000px; margin: 0 auto 16px auto; padding: 14px 18px; background: linear-gradient(to right, #fffbeb, #fef3c7); border: 1.5px solid #f59e0b; border-radius: 14px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);">
    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
      <div>
        <h3 style="margin: 0 0 4px 0; color: #78350f; font-size: 16px; font-weight: bold;">
          🌟 ${isHi ? "मासिक नवतारा ऑफ़लाइन डायरी" : "Offline Navtara & Journal"} (${personName})
        </h3>
        <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.4;">
          📱 ${isHi ? "मोबाइल और कंप्यूटर दोनों पर पूरी तरह इंटरैक्टिव — 3 विकल्प (🟢/🟡/🔴) चुनें और अनुभव नोट लिखें। डेटा इस ब्राउज़र में सुरक्षित रहेगा।" : "Interactive on both mobile & desktop — select options (🟢/🟡/🔴) and write notes. Saves automatically in this browser."}
        </p>
      </div>
      <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
        <button id="toggle-view-btn" onclick="toggleReportView()" style="background:#0284c7;color:#fff;font-weight:bold;padding:9px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <span id="toggle-view-icon">📱</span>
          <span id="toggle-view-text">${isHi ? "व्यू बदलें (Cards / Table)" : "Toggle View"}</span>
        </button>
        <button onclick="window.print()" style="background:#b45309;color:#fff;font-weight:bold;padding:9px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          🖨️ ${isHi ? "प्रिंट / PDF" : "Print / PDF"}
        </button>
        <button onclick="exportJournalData()" style="background:#44403c;color:#fff;font-weight:600;padding:9px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;">
          💾 ${isHi ? "बैकअप (JSON)" : "Backup JSON"}
        </button>
      </div>
    </div>
  </div>

  <div style="max-width: 1000px; margin: 0 auto;">
    ${sheet.outerHTML}
  </div>

  <!-- Client-side Interactive Persistence Script for Standalone File -->
  <script>
    (function() {
      const KEY = "${storageKey}";
      let data = {};

      try {
        const stored = localStorage.getItem(KEY);
        if (stored) {
          data = JSON.parse(stored);
        } else {
          data = ${preloadedJson};
          localStorage.setItem(KEY, JSON.stringify(data));
        }
      } catch(e) {
        data = ${preloadedJson};
      }

      function showToast(msg) {
        let t = document.getElementById("html-toast");
        if (!t) {
          t = document.createElement("div");
          t.id = "html-toast";
          t.style.cssText = "position:fixed;bottom:24px;right:24px;background:#065f46;color:#ffffff;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:bold;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,0.3);transition:opacity 0.25s;";
          document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = "1";
        clearTimeout(window._tTimer);
        window._tTimer = setTimeout(() => { t.style.opacity = "0"; }, 2400);
      }

      window.toggleReportView = function() {
        const mobileEl = document.querySelector('.mobile-cards-view');
        const desktopEl = document.querySelector('.desktop-table-view');
        if (!mobileEl || !desktopEl) return;

        const isMobileHidden = window.getComputedStyle(mobileEl).display === 'none';
        if (isMobileHidden) {
          mobileEl.style.setProperty('display', 'block', 'important');
          desktopEl.style.setProperty('display', 'none', 'important');
          document.getElementById('toggle-view-icon').textContent = '💻';
          document.getElementById('toggle-view-text').textContent = '${isHi ? "टेबल व्यू देखें" : "Switch to Table"}';
          showToast("${isHi ? "📱 मोबाइल कार्ड व्यू सक्रिय" : "Mobile Card View active"}");
        } else {
          mobileEl.style.setProperty('display', 'none', 'important');
          desktopEl.style.setProperty('display', 'block', 'important');
          document.getElementById('toggle-view-icon').textContent = '📱';
          document.getElementById('toggle-view-text').textContent = '${isHi ? "कार्ड व्यू देखें" : "Switch to Cards"}';
          showToast("${isHi ? "💻 टेबल व्यू सक्रिय" : "Table View active"}");
        }
      };

      function syncFeedbackUI() {
        document.querySelectorAll('[data-feedback-container]').forEach(function(container) {
          const dateStr = container.getAttribute('data-date');
          const fb = data[dateStr];
          const rating = (fb && fb.rating !== undefined) ? fb.rating : 0;
          const note = (fb && fb.note) ? fb.note : "";

          // Sync 3 option buttons
          container.querySelectorAll('[data-feedback-opt]').forEach(function(btn) {
            const btnRating = parseInt(btn.getAttribute('data-rating'), 10);
            const isSelected = rating > 0 && rating === btnRating;

            if (isSelected) {
              btn.setAttribute('data-selected', 'true');
              btn.classList.add('opt-selected');
            } else {
              btn.removeAttribute('data-selected');
              btn.classList.remove('opt-selected');
            }
          });

          // Sync note input
          const noteInp = container.querySelector('[data-note-input]');
          if (noteInp && document.activeElement !== noteInp) {
            noteInp.value = note;
          }

          // Sync checkmark status badge
          const statusBadge = container.querySelector('[data-saved-badge]');
          if (statusBadge) {
            statusBadge.style.display = (rating > 0 || note.length > 0) ? 'inline-flex' : 'none';
          }
        });
      }

      // Handle clicking on 3 option buttons
      document.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-feedback-opt]');
        if (!btn) return;
        e.preventDefault();

        const dateStr = btn.getAttribute('data-date');
        const day = parseInt(btn.getAttribute('data-day'), 10);
        const rating = parseInt(btn.getAttribute('data-rating'), 10);
        const feeling = btn.getAttribute('data-feeling') || 'neutral';

        // Preserve existing note or currently typed note in any input matching this date
        let currentNote = (data[dateStr] && data[dateStr].note) ? data[dateStr].note : "";
        const allInputs = document.querySelectorAll('[data-feedback-container][data-date="' + dateStr + '"] [data-note-input]');
        for (let i = 0; i < allInputs.length; i++) {
          if (allInputs[i].value && allInputs[i].value.trim().length > 0) {
            currentNote = allInputs[i].value.trim();
            break;
          }
        }

        data[dateStr] = {
          dateStr: dateStr,
          day: day,
          rating: rating,
          feeling: feeling,
          note: currentNote,
          loggedAtMs: Date.now()
        };

        try {
          localStorage.setItem(KEY, JSON.stringify(data));
        } catch(err) {}

        syncFeedbackUI();
        const label = rating >= 4 ? "🟢 शुभ" : rating === 3 ? "🟡 सामान्य" : "🔴 संभलकर";
        showToast(label + " अनुभव सुरक्षित हुआ! (Saved)");
      });

      // Handle typing notes
      document.addEventListener('input', function(e) {
        const inp = e.target.closest('[data-note-input]');
        if (!inp) return;
        const dateStr = inp.getAttribute('data-date');
        const day = parseInt(inp.getAttribute('data-day'), 10);
        const existing = data[dateStr] || {};

        data[dateStr] = {
          dateStr: dateStr,
          day: day,
          rating: existing.rating !== undefined ? existing.rating : 0,
          feeling: existing.feeling || 'great',
          note: inp.value.trim(),
          loggedAtMs: Date.now()
        };

        try {
          localStorage.setItem(KEY, JSON.stringify(data));
        } catch(err) {}

        // Keep all inputs matching this date synchronized
        const allInps = document.querySelectorAll('[data-feedback-container][data-date="' + dateStr + '"] [data-note-input]');
        allInps.forEach(function(other) {
          if (other !== inp) {
            other.value = inp.value;
          }
        });

        const containers = document.querySelectorAll('[data-feedback-container][data-date="' + dateStr + '"]');
        containers.forEach(function(c) {
          const statusBadge = c.querySelector('[data-saved-badge]');
          if (statusBadge) {
            statusBadge.style.display = (inp.value.trim().length > 0 || (existing.rating && existing.rating > 0)) ? 'inline-flex' : 'none';
          }
        });
      });

      // Handle Explicit Note Save Button
      document.addEventListener('click', function(e) {
        const saveBtn = e.target.closest('[data-note-save]');
        if (!saveBtn) return;
        e.preventDefault();
        const container = saveBtn.closest('[data-feedback-container]');
        const dateStr = saveBtn.getAttribute('data-date');
        const day = parseInt(saveBtn.getAttribute('data-day'), 10);
        const noteInp = container ? container.querySelector('[data-note-input]') : null;
        const noteVal = noteInp ? noteInp.value.trim() : '';
        const existing = data[dateStr] || {};

        data[dateStr] = {
          dateStr: dateStr,
          day: day,
          rating: existing.rating !== undefined ? existing.rating : 0,
          feeling: existing.feeling || 'great',
          note: noteVal,
          loggedAtMs: Date.now()
        };

        try {
          localStorage.setItem(KEY, JSON.stringify(data));
        } catch(err) {}

        syncFeedbackUI();
        showToast("✓ अनुभव नोट सुरक्षित हुआ! (Note Saved)");
      });

      window.exportJournalData = function() {
        try {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const u = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = u;
          a.download = "Navtara_Journal_${filePeriod}_" + "${sanitizedName}" + ".json";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(u);
        } catch(e) {
          alert("Export failed: " + e.message);
        }
      };

      // Initial synchronization on load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncFeedbackUI);
      } else {
        syncFeedbackUI();
      }
      setTimeout(syncFeedbackUI, 100);
    })();
  </script>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Navtara_Report_${filePeriod}_${sanitizedName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccessToast(
        reportLang === "hi"
          ? "HTML रिपोर्ट डाउनलोड हो गई! इसे किसी भी ब्राउज़र में कभी भी खोलें।"
          : "HTML report downloaded! Open anytime in any browser."
      );
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error("HTML download error:", err);
    }
  };

  const handlePrint = () => {
    // Check if in iframe (AI Studio mobile web preview)
    const inIframe = window.self !== window.top;

    try {
      window.print();
    } catch (err) {
      console.warn("Direct window.print() error:", err);
    }

    // In an iframe on mobile, window.print() is often blocked/ignored by the sandbox policy.
    // Trigger PDF download automatically so the user gets their file!
    if (inIframe) {
      handleDownloadPdf();
    }
  };

  const parseYearMonthFromDateStr = (dateStr: string, fallbackYear: number, fallbackMonth: number) => {
    if (dateStr && dateStr.includes("/")) {
      const parts = dateStr.split("/").map(Number);
      if (parts.length === 3 && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return { year: parts[2], month: parts[1] };
      }
    }
    return { year: fallbackYear, month: fallbackMonth };
  };

  // Quick 1-click feedback options (🟢 शुभ, 🟡 सामान्य, 🔴 संभलकर)
  const handleQuickFeedback = (dateStr: string, dayNum: number, rating: number, explicitNote?: string) => {
    const existing = userFeedbacks[dateStr];
    let noteToSave = explicitNote !== undefined ? explicitNote : (existing?.note || "");

    // Read from any matching DOM input if user had typed without blurring
    if (explicitNote === undefined && typeof document !== "undefined") {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        `[data-feedback-container][data-date="${dateStr}"] [data-note-input]`
      );
      for (const inp of Array.from(inputs)) {
        if (inp && inp.value !== undefined && inp.value.trim().length > 0) {
          noteToSave = inp.value.trim();
          break;
        }
      }
    }

    const { year: targetYear, month: targetMonth } = parseYearMonthFromDateStr(dateStr, selectedYear, selectedMonth);
    const updated = saveDailyNavtaraFeedback(personName, targetYear, targetMonth, {
      dateStr,
      day: dayNum,
      rating,
      feeling: rating >= 4 ? "great" : rating === 3 ? "neutral" : "challenging",
      note: noteToSave.trim(),
      loggedAtMs: Date.now(),
    });

    // Synchronize note across all matching input elements in DOM
    if (typeof document !== "undefined") {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        `[data-feedback-container][data-date="${dateStr}"] [data-note-input]`
      );
      inputs.forEach((inp) => {
        inp.value = noteToSave.trim();
      });
    }

    setUserFeedbacks((prev) => ({
      ...prev,
      ...updated,
      [dateStr]: {
        dateStr,
        day: dayNum,
        rating,
        feeling: rating >= 4 ? "great" : rating === 3 ? "neutral" : "challenging",
        note: noteToSave.trim(),
        loggedAtMs: Date.now(),
      },
    }));

    setDownloadSuccessToast(
      isHindi
        ? rating >= 4
          ? "🟢 शुभ अनुभव सुरक्षित हुआ!"
          : rating === 3
          ? "🟡 सामान्य अनुभव सुरक्षित हुआ!"
          : "🔴 संभलकर अनुभव सुरक्षित हुआ!"
        : "Day experience saved!"
    );
    setTimeout(() => setDownloadSuccessToast(null), 2000);
  };

  // Update note on blur, enter key, or explicit save button
  const handleUpdateNote = (dateStr: string, dayNum: number, note: string) => {
    const existing = userFeedbacks[dateStr];
    // Retain chosen rating if present, or set to 0 if not selected yet
    const rating = existing?.rating !== undefined ? existing.rating : 0;
    const feeling = existing?.feeling || (rating >= 4 ? "great" : rating === 3 ? "neutral" : "challenging");
    const { year: targetYear, month: targetMonth } = parseYearMonthFromDateStr(dateStr, selectedYear, selectedMonth);

    const updated = saveDailyNavtaraFeedback(personName, targetYear, targetMonth, {
      dateStr,
      day: dayNum,
      rating,
      feeling,
      note: note.trim(),
      loggedAtMs: Date.now(),
    });

    // Synchronize note across all matching input elements in DOM
    if (typeof document !== "undefined") {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        `[data-feedback-container][data-date="${dateStr}"] [data-note-input]`
      );
      inputs.forEach((inp) => {
        inp.value = note.trim();
      });
    }

    setUserFeedbacks((prev) => ({
      ...prev,
      ...updated,
      [dateStr]: {
        dateStr,
        day: dayNum,
        rating,
        feeling,
        note: note.trim(),
        loggedAtMs: Date.now(),
      },
    }));

    setDownloadSuccessToast(
      isHindi ? "✓ अनुभव नोट सुरक्षित हुआ!" : "✓ Experience note saved!"
    );
    setTimeout(() => setDownloadSuccessToast(null), 2000);
  };

  const handleSaveFeedback = (dateStr: string, dayNum: number) => {
    const { year: targetYear, month: targetMonth } = parseYearMonthFromDateStr(dateStr, selectedYear, selectedMonth);
    const updated = saveDailyNavtaraFeedback(personName, targetYear, targetMonth, {
      dateStr,
      day: dayNum,
      rating: feedbackRating,
      feeling: feedbackRating >= 4 ? "great" : feedbackRating === 3 ? "good" : "challenging",
      note: feedbackNote.trim(),
      loggedAtMs: Date.now(),
    });
    setUserFeedbacks((prev) => ({
      ...prev,
      ...updated,
      [dateStr]: {
        dateStr,
        day: dayNum,
        rating: feedbackRating,
        feeling: feedbackRating >= 4 ? "great" : feedbackRating === 3 ? "good" : "challenging",
        note: feedbackNote.trim(),
        loggedAtMs: Date.now(),
      },
    }));
    setEditingDayDate(null);
    setFeedbackNote("");
  };

  const padaMeta = PADA_EXPLANATIONS[selectedPada] || PADA_EXPLANATIONS[1];

  const getTaraBadgeColor = (nature: string) => {
    if (nature.includes("Highly Auspicious") || nature === "Auspicious") {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (nature.includes("Severely Inauspicious") || nature === "Inauspicious") {
      return "bg-rose-100 text-rose-800 border-rose-300";
    }
    return "bg-stone-100 text-stone-700 border-stone-300";
  };

  return (
    <div
      id="printable-navtara-modal"
      className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center sm:items-center bg-stone-950/85 backdrop-blur-xs overflow-hidden sm:p-4"
    >
      <div
        id="printable-navtara-dialog"
        className="relative w-full h-[100dvh] sm:h-[92vh] sm:max-h-[95vh] sm:max-w-5xl bg-white sm:rounded-2xl sm:border sm:border-stone-300 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Toolbar (hidden during actual browser print) */}
        <div className="border-b border-stone-200 px-3 sm:px-6 py-2.5 sm:py-3 bg-stone-50 print:hidden rounded-t-none sm:rounded-t-2xl shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 shrink-0" />
              <div className="truncate">
                <span className="text-xs sm:text-sm font-bold text-stone-900 font-devanagari block truncate">
                  {isHindi
                    ? "सम्पूर्ण मासिक नवतारा एवं नक्षत्र गोचर रिपोर्ट"
                    : "Complete Monthly Navtara Transit Report"}
                </span>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-sans hidden sm:block">
                  {isHindi
                    ? "पीडीएफ एक्सपोर्ट, नक्षत्र परिवर्तन एवं दैनिक फीडबैक डायरी"
                    : "PDF Export, Star Transitions & Day Experience Tracker"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Report Mode Tabs */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-[11px] sm:text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReportMode("monthly")}
                  className={`px-2 sm:px-3 py-1 rounded-md transition-all cursor-pointer ${
                    reportMode === "monthly"
                      ? "bg-amber-800 text-white shadow-xs font-bold"
                      : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {isHindi ? "मासिक" : "Monthly"}
                </button>
                <button
                  type="button"
                  onClick={() => setReportMode("daily")}
                  className={`px-2 sm:px-3 py-1 rounded-md transition-all cursor-pointer ${
                    reportMode === "daily"
                      ? "bg-amber-800 text-white shadow-xs font-bold"
                      : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {isHindi ? "दैनिक" : "Daily"}
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-[11px] sm:text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReportLang("hi")}
                  className={`px-1.5 sm:px-2 py-1 rounded-md transition-all ${
                    reportLang === "hi"
                      ? "bg-white text-stone-900 shadow-xs font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  हि
                </button>
                <button
                  type="button"
                  onClick={() => setReportLang("en")}
                  className={`px-1.5 sm:px-2 py-1 rounded-md transition-all ${
                    reportLang === "en"
                      ? "bg-white text-stone-900 shadow-xs font-bold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Primary PDF Download Action */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                id="top-download-pdf-navtara-btn"
                className="inline-flex items-center rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-amber-900/60 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                <span>{isGeneratingPdf ? (isHindi ? "PDF बन रही है..." : "Building...") : (isHindi ? "डाउनलोड PDF" : "Download PDF")}</span>
              </button>

              {/* Offline HTML Backup */}
              <button
                type="button"
                onClick={handleDownloadHtml}
                title={isHindi ? "ऑफ़लाइन HTML फ़ाइल डाउनलोड करें" : "Download offline HTML file"}
                className="hidden sm:inline-flex items-center rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <FileText className="mr-1 h-3.5 w-3.5 text-stone-600" />
                <span>HTML</span>
              </button>

              {/* Print Dialog Trigger */}
              <button
                type="button"
                onClick={handlePrint}
                id="confirm-print-navtara-btn"
                className="inline-flex items-center rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-stone-800 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Printer className="mr-1 h-3.5 w-3.5 text-stone-700" />
                <span>{isHindi ? "प्रिंट" : "Print"}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                id="close-print-navtara-btn"
                aria-label="Close modal"
                className="rounded-lg p-1.5 sm:p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Bar inside Modal (hidden during print) */}
        <div className="bg-amber-50/80 border-b border-amber-200/70 px-3 sm:px-6 py-2 print:hidden flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 max-h-32 sm:max-h-none overflow-y-auto">
          <div className="flex items-center flex-wrap gap-3">
            {/* Native Name */}
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-800" />
              <span className="font-bold text-stone-700">{isHindi ? "नाम:" : "Name:"}</span>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="जातक का नाम"
                className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-semibold text-stone-800 outline-none focus:border-amber-600 w-32 sm:w-40"
              />
            </div>

            {/* Birth Nakshatra */}
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-800" />
              <span className="font-bold text-stone-700">
                {isHindi ? "जन्म नक्षत्र:" : "Birth Star:"}
              </span>
              <select
                value={selectedNakshatra}
                onChange={(e) => setSelectedNakshatra(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-semibold text-stone-800 outline-none focus:border-amber-600 cursor-pointer max-w-[150px] sm:max-w-none"
              >
                {ALL_27_NAKSHATRAS.map((nak) => (
                  <option key={nak.index} value={nak.index}>
                    {nak.index}. {isHindi ? nak.nameHi : nak.nameEn} ({nak.lord})
                  </option>
                ))}
              </select>
            </div>

            {/* Pada Selector with Meaning Badge */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-700">{isHindi ? "चरण (पद):" : "Pada:"}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPada(p)}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      selectedPada === p
                        ? "bg-amber-800 text-white shadow-xs"
                        : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded font-medium hidden md:inline">
                {isHindi ? padaMeta.purusharthaHi.split(" ")[0] : padaMeta.purushartha}
              </span>
            </div>

            {/* Period Selection: Month vs Custom Date Range */}
            {reportMode === "monthly" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-amber-100/70 border border-amber-300/80 p-1.5 rounded-xl">
                {/* Mode Toggle Pills */}
                <div className="flex items-center bg-white/80 p-0.5 rounded-lg border border-amber-300/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDateSelectionMode("month")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      dateSelectionMode === "month"
                        ? "bg-amber-800 text-white shadow-xs"
                        : "text-amber-900 hover:text-amber-950"
                    }`}
                  >
                    {isHindi ? "📅 पूरा माह" : "📅 Month"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateSelectionMode("custom")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      dateSelectionMode === "custom"
                        ? "bg-amber-800 text-white shadow-xs"
                        : "text-amber-900 hover:text-amber-950"
                    }`}
                  >
                    {isHindi ? "📆 कस्टम दिनांक सीमा" : "📆 Custom Range"}
                  </button>
                </div>

                {/* Option 1: Month & Year Selectors */}
                {dateSelectionMode === "month" && (
                  <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-stone-300 shadow-xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-800" />
                    <span className="font-bold text-stone-700 text-[11px]">{isHindi ? "माह:" : "Month:"}</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold text-stone-800 outline-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {isHindi ? getMonthNameHi(m) : getMonthNameEn(m)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold text-stone-800 outline-none cursor-pointer"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Option 2: Custom Date Range (From - To) */}
                {dateSelectionMode === "custom" && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-stone-300 shadow-xs">
                      <span className="text-[10px] font-bold text-stone-600">{isHindi ? "से:" : "From:"}</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="text-xs font-bold text-stone-800 bg-transparent outline-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-stone-300 shadow-xs">
                      <span className="text-[10px] font-bold text-stone-600">{isHindi ? "तक:" : "To:"}</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="text-xs font-bold text-stone-800 bg-transparent outline-none cursor-pointer"
                      />
                    </div>

                    {/* Quick Range Presets */}
                    <div className="hidden lg:flex items-center gap-1">
                      <button
                        type="button"
                        onClick={applyPreset15Days}
                        className="px-1.5 py-0.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded text-[10px] font-semibold cursor-pointer"
                      >
                        15d
                      </button>
                      <button
                        type="button"
                        onClick={applyPreset30Days}
                        className="px-1.5 py-0.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded text-[10px] font-semibold cursor-pointer"
                      >
                        30d
                      </button>
                      <button
                        type="button"
                        onClick={applyPresetThisMonth}
                        className="px-1.5 py-0.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded text-[10px] font-semibold cursor-pointer"
                      >
                        {isHindi ? "चालू" : "Current"}
                      </button>
                    </div>

                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded-md">
                      {monthDays.length} {isHindi ? "दिन" : "days"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Customization Checkboxes */}
          <div className="flex items-center flex-wrap gap-2.5 text-[11px] text-stone-600">
            {reportMode === "monthly" ? (
              <>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePadaGuide}
                    onChange={(e) => setIncludePadaGuide(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span>{isHindi ? "पद (चरण) व्याख्या" : "Pada Guide"}</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFeedbackInPrint}
                    onChange={(e) => setIncludeFeedbackInPrint(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span>{isHindi ? "सहेजा गया फीडबैक" : "Saved Feedback"}</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={printableBlankJournal}
                    onChange={(e) => setPrintableBlankJournal(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span>{isHindi ? "हस्तलिखित डायरी फॉर्म" : "Handwritten Lines"}</span>
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFullTable}
                    onChange={(e) => setIncludeFullTable(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span>{isHindi ? "27 चक्र" : "27-Table"}</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRemedies}
                    onChange={(e) => setIncludeRemedies(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span>{isHindi ? "परिहार" : "Remedies"}</span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Mobile Instructions & Quick Download Banner */}
        <div className="bg-amber-100/95 border-b border-amber-300/80 px-3 sm:px-6 py-2.5 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📥</span>
            <span className="font-medium text-[11px] sm:text-xs">
              {isHindi
                ? "मोबाइल पर: नीचे 'डाउनलोड PDF' दबाएं — रिपोर्ट आपके फोन में सीधे सेव हो जाएगी।"
                : "Mobile: Tap 'Download PDF' to save the report file directly to your device."}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              id="banner-download-pdf-btn"
              className="inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-900/60 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? (isHindi ? "PDF बन रही है..." : "Generating...") : (isHindi ? "डाउनलोड PDF" : "Download PDF")}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 text-stone-800 border border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-800" />
              <span>{isHindi ? "HTML फ़ाइल" : "HTML File"}</span>
            </button>
          </div>
        </div>

        {/* Download Success / Error Toast Banners */}
        {downloadSuccessToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 print:hidden shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{downloadSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccessToast(null)}
              className="text-emerald-200 hover:text-white text-xs cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}

        {pdfError && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 print:hidden shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-200 shrink-0" />
              <span>{pdfError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="bg-white text-rose-900 px-2 py-0.5 rounded text-[11px] font-bold"
              >
                {isHindi ? "HTML फ़ाइल सेव करें" : "Save HTML"}
              </button>
              <button
                type="button"
                onClick={() => setPdfError(null)}
                className="text-rose-200 hover:text-white text-xs cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen Overlay during PDF Generation */}
        {isGeneratingPdf && (
          <div className="absolute inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white print:hidden">
            <div className="bg-stone-900 border border-amber-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-base font-bold font-devanagari text-amber-300">
                  {isHindi ? "PDF रिपोर्ट तैयार हो रही है..." : "Generating PDF Report..."}
                </h4>
                <p className="text-xs text-stone-300 font-sans">
                  {generationStatus || (isHindi ? "कृपया कुछ सेकंड प्रतीक्षा करें..." : "Please wait a moment...")}
                </p>
              </div>
              <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
              <p className="text-[10px] text-stone-400">
                {isHindi ? "उच्च गुणवत्ता वाले पेज रेंडर किए जा रहे हैं" : "Rendering high quality document"}
              </p>
            </div>
          </div>
        )}

        {/* Inline Feedback Quick Logger Modal Popup inside view if user clicked a day to edit feedback */}
        {editingDayDate && (
          <div className="bg-amber-100/90 border-b border-amber-300 px-4 sm:px-6 py-3 print:hidden flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-900" />
              <span className="font-bold text-amber-950 font-devanagari">
                {isHindi ? `दिनांक ${editingDayDate} का अनुभव दर्ज करें:` : `Log Feedback for ${editingDayDate}:`}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-1 max-w-xl">
              {/* Star Rating */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-amber-300">
                <span className="text-stone-500">{isHindi ? "रेटिंग:" : "Rating:"}</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= feedbackRating
                          ? "text-amber-500 fill-amber-500"
                          : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {/* Note input */}
              <input
                type="text"
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder={
                  isHindi
                    ? "कैसा रहा दिन? (जैसे: काम सफल रहा, बड़ा लाभ मिला, या तनाव रहा)"
                    : "How was your day? (e.g. Prediction matched, profitable, or stressful)"
                }
                className="px-3 py-1.5 bg-white border border-amber-300 rounded text-xs text-stone-900 flex-1 outline-none focus:ring-2 focus:ring-amber-600 min-w-[200px]"
              />
              <button
                type="button"
                onClick={() => {
                  const dayNum = parseInt(editingDayDate.split("/")[0], 10) || 1;
                  handleSaveFeedback(editingDayDate, dayNum);
                }}
                className="bg-amber-800 text-white px-3 py-1.5 rounded font-bold hover:bg-amber-900 cursor-pointer transition-all"
              >
                {isHindi ? "सहेजें" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditingDayDate(null)}
                className="text-stone-600 hover:text-stone-900 px-2 py-1 cursor-pointer"
              >
                {isHindi ? "रद्द" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-8 font-serif-vedic text-stone-900 bg-white">
          <div id="navtara-report-sheet" className="max-w-4xl mx-auto space-y-6">
            {/* ================================================================= */}
            {/* 1. DOCUMENT SACRED HEADER */}
            {/* ================================================================= */}
            <div className="text-center border-b-2 border-amber-900/40 pb-4">
              <div className="text-xs uppercase tracking-widest text-amber-900 font-bold font-devanagari">
                ॥ ॐ श्री गणेशाय नमः ॥ ॐ सूर्याय नमः ॥ ॐ चन्द्रमसे नमः ॥
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1.5 tracking-tight font-serif-vedic text-amber-950">
                {reportMode === "monthly"
                  ? isHindi
                    ? `सम्पूर्ण नवतारा गोचर एवं दैनिक अनुभव डायरी — ${dateRangeLabel}`
                    : `Complete Navtara Transit & Experience Journal — ${dateRangeLabel}`
                  : isHindi
                    ? "महावतार नवतारा चक्र एवं नक्षत्र गोचर दैनिक रिपोर्ट"
                    : "Mahavtaar Navtara Chakra & Star Transit Daily Report"}
              </h1>
              <p className="text-xs text-stone-600 font-sans mt-1">
                {isHindi
                  ? "महर्षि पाराशर व वराहमिहिर शास्त्रीय नवतारा गणना, नक्षत्र परिवर्तन काल एवं जातक स्व-समीक्षा"
                  : "Maharshi Parashara & Varahamihira Classical Navtara Algorithm with Star Transition Timings & Self-Journal"}
              </p>
              <div className="mt-2 text-xs font-bold font-devanagari text-stone-800 flex flex-wrap items-center justify-center gap-2">
                <span>स्थान: {cityName}</span>
                <span>•</span>
                <span>
                  {reportMode === "monthly"
                    ? dateRangeLabel
                    : data?.date || new Date().toLocaleDateString()}
                </span>
                <span>•</span>
                <span>अयन: {data?.ayana || "Drik"} ({data?.ayanamsa_key || "Lahiri"})</span>
              </div>
            </div>

            {/* ================================================================= */}
            {/* 2. NATIVE PROFILE & SELECTED PADA CARD */}
            {/* ================================================================= */}
            <div className="rounded-xl border border-stone-300 bg-stone-50/70 p-4 print-no-break">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-800" />
                  <span className="text-sm font-bold text-stone-900 font-devanagari">
                    {isHindi ? "जातक विवरण (Native Astral Profile)" : "Native Astral Profile"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full border border-amber-300">
                    {personName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                    {isHindi ? "जन्म नक्षत्र" : "Birth Nakshatra"}
                  </span>
                  <span className="font-bold text-stone-900 font-devanagari text-sm">
                    {monthlyReportData.birthNakshatra.index}.{" "}
                    {isHindi
                      ? monthlyReportData.birthNakshatra.nameHi
                      : monthlyReportData.birthNakshatra.nameEn}
                  </span>
                  <span className="block text-[11px] text-amber-900 font-semibold mt-0.5">
                    {isHindi ? "चरण (पद):" : "Pada:"} {selectedPada} ({padaMeta.nameHi})
                  </span>
                </div>

                <div>
                  <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                    {isHindi ? "नक्षत्र स्वामी (Lord)" : "Ruling Planet"}
                  </span>
                  <span className="font-bold text-stone-900 font-devanagari text-sm">
                    {isHindi
                      ? monthlyReportData.birthNakshatra.lordHi
                      : monthlyReportData.birthNakshatra.lord}
                  </span>
                  <span className="block text-[10px] text-stone-600">
                    {isHindi ? "देवता:" : "Deity:"}{" "}
                    {isHindi
                      ? monthlyReportData.birthNakshatra.deityHi
                      : monthlyReportData.birthNakshatra.deity}
                  </span>
                </div>

                <div>
                  <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                    {isHindi ? "चरण पुरुषार्थ व तत्व" : "Pada Purushartha & Element"}
                  </span>
                  <span className="font-bold text-amber-950 font-devanagari">
                    {isHindi ? padaMeta.purusharthaHi : padaMeta.purusharthaEn}
                  </span>
                  <span className="block text-[10px] text-stone-600">
                    {isHindi ? padaMeta.tattvaHi : padaMeta.tattva}
                  </span>
                </div>

                <div>
                  <span className="block text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                    {isHindi ? "गण एवं नाड़ी" : "Gana & Nadi"}
                  </span>
                  <span className="font-bold text-stone-900 font-devanagari">
                    {isHindi
                      ? monthlyReportData.birthNakshatra.ganaHi
                      : monthlyReportData.birthNakshatra.gana}{" "}
                    •{" "}
                    {isHindi
                      ? monthlyReportData.birthNakshatra.nadiHi
                      : monthlyReportData.birthNakshatra.nadi}
                  </span>
                  <span className="block text-[10px] text-stone-600">
                    {isHindi ? "योनि:" : "Yoni:"}{" "}
                    {isHindi
                      ? monthlyReportData.birthNakshatra.yoniHi
                      : monthlyReportData.birthNakshatra.yoni}
                  </span>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* 3. PADA (चरण / पद 1-4) EXPLANATION & USER CLARITY SECTION */}
            {/* ================================================================= */}
            {includePadaGuide && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 print-no-break">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                    <h2 className="text-sm font-bold text-amber-950 font-devanagari">
                      {isHindi
                        ? "नक्षत्र चरण (पद 1, पद 2, पद 3, पद 4) का सरल अर्थ एवं प्रभाव"
                        : "Understanding Star Padas (Quarters 1-4) & Their Practical Influence"}
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                    {isHindi ? "वैदिक चरण विज्ञान" : "Vedic Pada Science"}
                  </span>
                </div>

                {/* Plain language overview */}
                <p className="text-xs text-stone-800 leading-relaxed font-sans mb-3">
                  {isHindi ? (
                    <>
                      <strong>चरण (पद) क्या होता है?</strong> प्रत्येक नक्षत्र 13° 20' (अंश-कला) का
                      होता है। इसे चार समान भागों में बांटा गया है, जिन्हें <strong>'चरण'</strong> या{" "}
                      <strong>'पद'</strong> (प्रत्येक 3° 20') कहते हैं। कुल 27 नक्षत्र × 4 पद = 108
                      चरण बनते हैं (इसीलिए जप माला में 108 मनके होते हैं)। प्रत्येक पद चार
                      पुरुषार्थों (धर्म, अर्थ, काम, मोक्ष) और चार तत्वों से संचालित होता है:
                    </>
                  ) : (
                    <>
                      <strong>What is a Pada?</strong> Each 13°20' Nakshatra is divided into 4 equal
                      quarters of 3°20' each called Padas. 27 Nakshatras × 4 = 108 Padas across the
                      zodiac. Each Pada corresponds to one of the four human pursuits (Dharma, Artha,
                      Kama, Moksha) and a cosmic element:
                    </>
                  )}
                </p>

                {/* 4 Padas Reference Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                  {[1, 2, 3, 4].map((pNum) => {
                    const p = PADA_EXPLANATIONS[pNum];
                    const isSelected = selectedPada === pNum;
                    return (
                      <div
                        key={pNum}
                        className={`p-2.5 rounded-lg border transition-all ${
                          isSelected
                            ? "border-amber-800 bg-amber-100/70 shadow-xs"
                            : "border-stone-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-950 font-devanagari">
                            {isHindi ? p.nameHi : p.nameEn}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-amber-800 text-white px-1.5 py-0.2 rounded">
                              {isHindi ? "आपका चरण" : "Yours"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-stone-800 mb-0.5">
                          {isHindi ? p.purusharthaHi.split(" ")[0] : p.purushartha} •{" "}
                          {isHindi ? p.tattvaHi.split(" ")[0] : p.tattva.split(" ")[0]}
                        </div>
                        <p className="text-[10px] text-stone-600 font-sans leading-tight">
                          {isHindi ? p.shortSummaryHi : p.shortSummaryEn}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Native's specific Pada analysis */}
                <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold font-devanagari">
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {isHindi
                        ? `जातक का विशिष्ट चरण फल: ${padaMeta.nameHi} — ${padaMeta.purusharthaHi}`
                        : `Your Native Pada Impact: ${padaMeta.nameEn} — ${padaMeta.purusharthaEn}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                    {isHindi ? padaMeta.detailedMeaningHi : padaMeta.detailedMeaningEn}
                  </p>
                  <div className="text-[11px] text-amber-950 font-sans pt-1 border-t border-amber-100">
                    <strong>{isHindi ? "अनुकूल कार्यक्षेत्र:" : "Recommended Activities:"}</strong>{" "}
                    {isHindi ? padaMeta.recommendedActivitiesHi : padaMeta.recommendedActivitiesEn}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* 4. MONTHLY NAVTARA CALENDAR DASHBOARD & OVERVIEW */}
            {/* ================================================================= */}
            {reportMode === "monthly" && (
              <>
                <div className="space-y-3.5 print-no-break">
                {/* Monthly Calendar Header */}
                <div className="flex items-center justify-between border-b border-amber-900/30 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-800" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950 font-devanagari">
                      {isHindi
                        ? `मासिक नवतारा कैलेंडर डैशबोर्ड (${getMonthNameHi(selectedMonth)} ${selectedYear})`
                        : `Monthly Navtara Calendar Dashboard (${getMonthNameEn(selectedMonth)} ${selectedYear})`}
                    </h2>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 font-devanagari">
                    {isHindi
                      ? `कुल ${monthlyReportData.stats.totalDays} दिन | संपूर्ण माह का पंचांग व नवतारा चक्र सारांश`
                      : `Total ${monthlyReportData.stats.totalDays} Days | Date-wise Navtara Summary`}
                  </span>
                </div>

                {/* 4 Categorized Calendar Cards with Exact Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Auspicious Days Card */}
                  <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-emerald-900 font-devanagari flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                          {isHindi ? "अति शुभ दिन" : "Auspicious Days"}
                        </span>
                        <span className="text-base font-black text-emerald-950 font-mono">
                          {categorizedDays.auspicious.length} {isHindi ? "दिन" : "Days"}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-900 font-devanagari line-clamp-2">
                        {isHindi
                          ? "सम्पत्, क्षेम, साधक, मित्र व अति-मित्र — नए कार्य, आर्थिक लाभ व शुभ आरंभ हेतु"
                          : "Best for milestones, prosperity & auspicious ventures"}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-emerald-200/80">
                      <span className="text-[9px] font-bold uppercase text-emerald-800 block">
                        {isHindi ? "कैलेंडर तारीखें:" : "Calendar Dates:"}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-emerald-950 break-words leading-tight mt-0.5">
                        {categorizedDays.auspicious.length > 0
                          ? categorizedDays.auspicious.map((d) => d.day).join(", ")
                          : isHindi
                            ? "कोई नहीं"
                            : "None"}
                      </div>
                    </div>
                  </div>

                  {/* Mixed / Transition Days Card */}
                  <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-amber-900 font-devanagari flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          {isHindi ? "मिश्रित / गोचर दिन" : "Transition Days"}
                        </span>
                        <span className="text-base font-black text-amber-950 font-mono">
                          {categorizedDays.mixed.length} {isHindi ? "दिन" : "Days"}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-900 font-devanagari line-clamp-2">
                        {isHindi
                          ? "नक्षत्र परिवर्तन दिन — परिवर्तन समय के बाद शुभ तारा सक्रिय (समय नीचे देखें)"
                          : "Dual phases: prior Tara operates until transit time, new Tara begins after"}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-amber-200/80">
                      <span className="text-[9px] font-bold uppercase text-amber-800 block">
                        {isHindi ? "कैलेंडर तारीखें:" : "Calendar Dates:"}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-amber-950 break-words leading-tight mt-0.5">
                        {categorizedDays.mixed.length > 0
                          ? categorizedDays.mixed.map((d) => d.day).join(", ")
                          : isHindi
                            ? "कोई नहीं"
                            : "None"}
                      </div>
                    </div>
                  </div>

                  {/* Caution Days Card */}
                  <div className="p-2.5 rounded-xl border border-rose-300 bg-rose-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-rose-900 font-devanagari flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                          {isHindi ? "सावधानी दिन" : "Caution Days"}
                        </span>
                        <span className="text-base font-black text-rose-950 font-mono">
                          {categorizedDays.caution.length} {isHindi ? "दिन" : "Days"}
                        </span>
                      </div>
                      <div className="text-[10px] text-rose-900 font-devanagari line-clamp-2">
                        {isHindi
                          ? "विपत्, प्रत्यरि, वध तारा — जोखिम, विवाद व यात्रा टालें; शांति व मंत्र जप करें"
                          : "Vipat, Pratyari, Vadha — avoid risks & dispute; perform japa & remedies"}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-rose-200/80">
                      <span className="text-[9px] font-bold uppercase text-rose-800 block">
                        {isHindi ? "कैलेंडर तारीखें:" : "Calendar Dates:"}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-rose-950 break-words leading-tight mt-0.5">
                        {categorizedDays.caution.length > 0
                          ? categorizedDays.caution.map((d) => d.day).join(", ")
                          : isHindi
                            ? "कोई नहीं"
                            : "None"}
                      </div>
                    </div>
                  </div>

                  {/* Neutral / Routine Days Card */}
                  <div className="p-2.5 rounded-xl border border-stone-300 bg-stone-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-stone-800 font-devanagari flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-stone-500 inline-block" />
                          {isHindi ? "सामान्य / नित्य दिन" : "Routine Days"}
                        </span>
                        <span className="text-base font-black text-stone-900 font-mono">
                          {categorizedDays.neutral.length} {isHindi ? "दिन" : "Days"}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-700 font-devanagari line-clamp-2">
                        {isHindi
                          ? "जन्म तारा आदि — सामान्य दिनचर्या, अध्ययन, नित्यकर्म व योजनाएं बनाने हेतु"
                          : "Janma & regular routine — standard duties, learning & personal reflections"}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-stone-200">
                      <span className="text-[9px] font-bold uppercase text-stone-600 block">
                        {isHindi ? "कैलेंडर तारीखें:" : "Calendar Dates:"}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-stone-900 break-words leading-tight mt-0.5">
                        {categorizedDays.neutral.length > 0
                          ? categorizedDays.neutral.map((d) => d.day).join(", ")
                          : isHindi
                            ? "कोई नहीं"
                            : "None"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Monthly Calendar Grid (7 Columns) */}
                <div className="rounded-xl border border-stone-300 bg-white p-3 print-no-break shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-800" />
                      <span className="text-xs font-bold text-stone-900 font-devanagari">
                        {isHindi
                          ? `मासिक नवतारा कैलेंडर विहंगावलोकन (${getMonthNameHi(selectedMonth)} ${selectedYear})`
                          : `Monthly Navtara Calendar Matrix (${getMonthNameEn(selectedMonth)} ${selectedYear})`}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-devanagari print:hidden">
                      {isHindi
                        ? "किसी भी तारीख पर क्लिक करें ➔ नीचे उस दिन के संपूर्ण विवरण व फीडबैक पर जाएं"
                        : "Click any date to jump to its row in the journal below"}
                    </span>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-stone-600 border-b border-stone-200 pb-1.5 mb-1.5">
                    {(isHindi ? WEEKDAYS_HI : WEEKDAYS_EN).map((w, idx) => (
                      <div
                        key={idx}
                        className={idx === 0 ? "text-rose-700 font-black" : "text-stone-700"}
                      >
                        {w}
                      </div>
                    ))}
                  </div>

                  {/* Calendar day slots */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Leading empty days */}
                    {Array.from({ length: firstDayWeekday }).map((_, i) => (
                      <div
                        key={`blank-${i}`}
                        className="min-h-[46px] rounded-lg border border-dashed border-stone-200/50 bg-stone-50/20"
                      />
                    ))}

                    {/* Active Month Days */}
                    {monthlyReportData.days.map((d) => {
                      const isTransition =
                        !!d.nextTara &&
                        !!d.nakshatraEnds &&
                        d.nextTara.tara_number !== d.currentTara.tara_number;
                      const cat = d.dayNatureCategory;

                      let badgeClasses =
                        "bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100";
                      let dotColor = "bg-stone-400";
                      let taraLabel = d.currentTara.tara_name;

                      if (cat === "auspicious") {
                        badgeClasses =
                          "bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100";
                        dotColor = "bg-emerald-600";
                      } else if (cat === "caution") {
                        badgeClasses =
                          "bg-rose-50/80 border-rose-300 text-rose-950 hover:bg-rose-100";
                        dotColor = "bg-rose-600";
                      } else if (cat === "mixed") {
                        badgeClasses =
                          "bg-amber-50/90 border-amber-300 text-amber-950 hover:bg-amber-100";
                        dotColor = "bg-amber-500";
                        taraLabel = `${d.currentTara.tara_name.slice(0, 4)}➔${
                          d.nextTara?.tara_name.slice(0, 4) || ""
                        }`;
                      }

                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => {
                            const cardEl = document.getElementById(`day-card-${d.day}`);
                            const rowEl = document.getElementById(`day-row-${d.day}`);
                            const targetEl = (typeof window !== "undefined" && window.innerWidth < 768 && cardEl) ? cardEl : (rowEl || cardEl);
                            if (targetEl) {
                              targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                              targetEl.classList.add("ring-2", "ring-amber-500", "bg-amber-100/70");
                              setTimeout(() => targetEl.classList.remove("ring-2", "ring-amber-500", "bg-amber-100/70"), 2000);
                            }
                          }}
                          className={`p-1 sm:p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer min-h-[46px] sm:min-h-[50px] ${badgeClasses}`}
                          title={`Day ${d.day}: ${d.currentTara.tara_name} Tara (${d.dayNatureCategory})`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono font-black text-xs sm:text-sm">{d.day}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          </div>
                          <div className="text-[9px] font-devanagari font-bold truncate mt-0.5 leading-tight">
                            {taraLabel}
                          </div>
                          {isTransition && d.nakshatraEnds ? (
                            <div className="text-[8px] font-sans text-amber-900 truncate leading-none mt-0.5 font-semibold">
                              ⏱️ {d.nakshatraEnds.split(" ")[0]}
                            </div>
                          ) : (
                            <div className="text-[8px] font-sans text-stone-500 truncate leading-none mt-0.5">
                              {cat === "auspicious" ? "शुभ" : cat === "caution" ? "संभलकर" : "नित्य"}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend Bar */}
                  <div className="mt-2.5 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-devanagari">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-400" />
                        {isHindi ? "अति शुभ दिन" : "Auspicious"}
                      </span>
                      <span className="flex items-center gap-1 font-devanagari">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-400" />
                        {isHindi ? "मिश्रित / गोचर (समय बाद शुभ)" : "Transition (Auspicious after)"}
                      </span>
                      <span className="flex items-center gap-1 font-devanagari">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-400" />
                        {isHindi ? "सावधानी दिन" : "Caution"}
                      </span>
                      <span className="flex items-center gap-1 font-devanagari">
                        <span className="w-2.5 h-2.5 rounded-sm bg-stone-100 border border-stone-300" />
                        {isHindi ? "सामान्य दिन" : "Routine"}
                      </span>
                    </div>
                    <span className="text-[9px] text-stone-500 font-devanagari">
                      {isHindi
                        ? "💡 दिन-वार तिथि, नक्षत्र मान व अनुभव दर्ज करने हेतु नीचे दी गई सारणी देखें।"
                        : "Full date-by-date details and personal journal below."}
                    </span>
                  </div>
                </div>
              </div>

                {/* ================================================================= */}
                {/* 5. FULL MONTHLY DAY-BY-DAY NAVTARA & FEEDBACK JOURNAL TABLE */}
                {/* ================================================================= */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-900/30 pb-1.5">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-800" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950 font-devanagari">
                        {isHindi
                          ? `मासिक नवतारा कैलेंडर एवं दैनिक अनुभव डायरी (${getMonthNameHi(selectedMonth)} ${selectedYear})`
                          : `Monthly Navtara Calendar & Daily Experience Journal (${getMonthNameEn(selectedMonth)} ${selectedYear})`}
                      </h2>
                    </div>
                    <span className="text-[10px] text-stone-600 font-devanagari print:hidden">
                      {isHindi
                        ? "3 त्वरित विकल्प (🟢 शुभ / 🟡 सामान्य / 🔴 संभलकर) चुनें या अनुभव लिखें"
                        : "Choose 3 quick options (🟢/🟡/🔴) or type your note"}
                    </span>
                  </div>

                  {isLoadingMonth ? (
                    <div className="p-8 text-center text-stone-500 text-xs">
                      {isHindi ? "मासिक पंचांग व नवतारा चक्र लोड हो रहा है..." : "Computing monthly Navtara transits..."}
                    </div>
                  ) : loadError ? (
                    <div className="p-4 text-center text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-lg">
                      {loadError}
                    </div>
                  ) : (
                    <>
                      {/* ================================================================= */}
                      {/* MOBILE DAY CARDS VIEW (md:hidden print:hidden) */}
                      {/* Makes Feedback & Journal prominently visible for each day on mobile */}
                      {/* ================================================================= */}
                      <div className="mobile-cards-view block md:hidden print:hidden space-y-3">
                        {monthlyReportData.days.map((item) => {
                          const hasFeedback = !!item.userFeedback;
                          const isTransitionDay =
                            !!item.nextTara &&
                            !!item.nakshatraEnds &&
                            item.nextTara.tara_number !== item.currentTara.tara_number;

                          return (
                            <div
                              key={`mobile-card-${item.day}`}
                              id={`day-card-${item.day}`}
                              className={`border rounded-xl p-3 bg-white transition-all shadow-xs ${
                                item.dayNatureCategory === "caution"
                                  ? "border-rose-200 bg-rose-50/20"
                                  : item.dayNatureCategory === "mixed"
                                  ? "border-amber-200 bg-amber-50/20"
                                  : "border-stone-200"
                              }`}
                            >
                              {/* Top Header: Day, Vaara, Tithi */}
                              <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-300 font-mono font-bold flex flex-col items-center justify-center text-sm shadow-xs">
                                    <span>{item.day}</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-stone-900 text-xs">
                                      {item.vaara} ({item.date})
                                    </div>
                                    <div className="text-[11px] text-stone-700 font-devanagari">
                                      {item.tithi} {item.tithiEnds && <span className="text-stone-500 font-sans">⏱️ {item.tithiEnds} तक</span>}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                    item.dayNatureCategory === "auspicious"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : item.dayNatureCategory === "caution"
                                      ? "bg-rose-100 text-rose-800 border-rose-300"
                                      : item.dayNatureCategory === "mixed"
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : "bg-stone-100 text-stone-700 border-stone-300"
                                  }`}
                                >
                                  {item.dayNatureCategory === "auspicious"
                                    ? "🟢 अति शुभ"
                                    : item.dayNatureCategory === "caution"
                                    ? "🔴 सावधानी"
                                    : item.dayNatureCategory === "mixed"
                                    ? "🟡 गोचर/मिश्रित"
                                    : "⚪ सामान्य"}
                                </span>
                              </div>

                              {/* Nakshatra & Tara Badges */}
                              <div className="py-2 space-y-1.5 border-b border-stone-100 text-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-stone-500 font-medium">{isHindi ? "नक्षत्र:" : "Nakshatra:"}</span>
                                  <span className="font-bold text-stone-900">
                                    {item.nakshatraNumber}. {item.nakshatraName}
                                    {item.nakshatraEnds && (
                                      <span className="text-amber-800 font-sans ml-1 text-[10px]">
                                        (⏱️ {item.nakshatraEnds} तक)
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {/* Tara Display */}
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className="text-stone-500 text-[11px] font-medium">{isHindi ? "जातक नवतारा:" : "Tara:"}</span>
                                  {isTransitionDay && item.nextTara ? (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${getTaraBadgeColor(item.currentTara.nature)}`}>
                                        {item.nakshatraEnds} तक: {item.currentTara.tara_number}. {item.currentTara.tara_name} (
                                        {item.currentTara.nature.includes("Auspicious") ? "शुभ" : item.currentTara.nature.includes("Inauspicious") ? "सावधानी" : "मध्यम"})
                                      </span>
                                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${getTaraBadgeColor(item.nextTara.nature)}`}>
                                        {item.nakshatraEnds} बाद: {item.nextTara.tara_number}. {item.nextTara.tara_name} (
                                        {item.nextTara.nature.includes("Auspicious") ? "शुभ" : item.nextTara.nature.includes("Inauspicious") ? "सावधानी" : "मध्यम"})
                                      </span>
                                    </div>
                                  ) : (
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getTaraBadgeColor(item.currentTara.nature)}`}>
                                      {item.currentTara.tara_number}. {item.currentTara.tara_name} Tara (
                                      {item.currentTara.nature.includes("Auspicious") ? "शुभ" : item.currentTara.nature.includes("Inauspicious") ? "सावधानी" : "मध्यम"})
                                    </span>
                                  )}
                                </div>

                                {/* Vedic Guidance */}
                                <div className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200/80 leading-relaxed mt-1">
                                  <span className="font-bold text-amber-900 mr-1">📜 {isHindi ? "मार्गदर्शन:" : "Advice:"}</span>
                                  {isHindi ? item.recommendationHi : item.recommendationEn}
                                </div>
                              </div>

                              {/* FEEDBACK & JOURNAL SECTION (Prominently displayed on mobile) */}
                              <div
                                data-feedback-container="true"
                                data-date={item.date}
                                data-day={item.day}
                                className="pt-2.5 space-y-2 bg-amber-50/40 -mx-3 -mb-3 p-3 rounded-b-xl border-t border-amber-200/60"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5 font-devanagari">
                                    <span>✍️</span>
                                    <span>{isHindi ? "कैसा रहा दिन? (3 विकल्प चुनें या नोट लिखें):" : "How was the day? Choose or note:"}</span>
                                  </span>
                                  <span
                                    data-saved-badge="true"
                                    style={{ display: hasFeedback ? "inline-flex" : "none" }}
                                    className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded items-center gap-1"
                                  >
                                    ✓ {isHindi ? "सुरक्षित" : "Saved"}
                                  </span>
                                </div>

                                {/* 3 Large Touch-Friendly Buttons */}
                                <div className="grid grid-cols-3 gap-1.5">
                                  {DAILY_FEEDBACK_OPTIONS.map((opt) => {
                                    const isSelected = item.userFeedback?.rating === opt.rating;
                                    return (
                                      <button
                                        key={`m-opt-${item.day}-${opt.id}`}
                                        type="button"
                                        data-feedback-opt="true"
                                        data-date={item.date}
                                        data-day={item.day}
                                        data-rating={opt.rating}
                                        data-feeling={opt.id}
                                        onClick={() => handleQuickFeedback(item.date, item.day, opt.rating)}
                                        className={`py-2 px-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 html-opt-btn ${
                                          isSelected
                                            ? opt.id === "great"
                                              ? "bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300 font-bold"
                                              : opt.id === "neutral"
                                              ? "bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-200 font-bold"
                                              : "bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-300 font-bold"
                                            : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                                        }`}
                                      >
                                        <span className="text-base leading-none">{opt.icon}</span>
                                        <span className="font-devanagari text-[10px] leading-tight text-center">
                                          {isHindi ? opt.labelHi : opt.labelEn}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Note Input Field + Save Button */}
                                <div className="flex items-center gap-1.5 mt-1">
                                  <input
                                    type="text"
                                    data-note-input="true"
                                    data-date={item.date}
                                    data-day={item.day}
                                    key={`m-note-${item.date}-${item.userFeedback?.note || ""}`}
                                    defaultValue={item.userFeedback?.note || ""}
                                    placeholder={isHindi ? "दिन का अनुभव / मुख्य घटना लिखें..." : "Write day observations / note..."}
                                    onBlur={(e) => handleUpdateNote(item.date, item.day, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleUpdateNote(item.date, item.day, (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).blur();
                                      }
                                    }}
                                    className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:bg-amber-50/50 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                                  />
                                  <button
                                    type="button"
                                    data-note-save="true"
                                    data-date={item.date}
                                    data-day={item.day}
                                    onClick={(e) => {
                                      const parent = (e.currentTarget as HTMLElement).closest('[data-feedback-container]');
                                      const inp = parent?.querySelector('input[data-note-input]') as HTMLInputElement | null;
                                      handleUpdateNote(item.date, item.day, inp ? inp.value : "");
                                    }}
                                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-xs"
                                  >
                                    {isHindi ? "सेव" : "Save"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* ================================================================= */}
                      {/* DESKTOP TABLE VIEW (hidden md:block print:block) */}
                      {/* ================================================================= */}
                      <div className="desktop-table-view hidden md:block print:block border border-stone-300 rounded-xl overflow-x-auto bg-white shadow-xs">
                        <table className="w-full text-left text-xs border-collapse min-w-[780px]">
                          <thead className="bg-stone-100 text-stone-800 uppercase font-bold text-[10px] border-b border-stone-300">
                            <tr>
                              <th className="p-2 border-r border-stone-200 w-16 text-center">
                                {isHindi ? "तारीख / वार" : "Date / Day"}
                              </th>
                              <th className="p-2 border-r border-stone-200 w-24">
                                {isHindi ? "तिथि" : "Tithi"}
                              </th>
                              <th className="p-2 border-r border-stone-200 w-36">
                                {isHindi ? "नक्षत्र एवं परिवर्तन" : "Star & Transition"}
                              </th>
                              <th className="p-2 border-r border-stone-200 w-32">
                                {isHindi ? "जातक का नवतारा" : "Native's Tara"}
                              </th>
                              <th className="p-2 border-r border-stone-200">
                                {isHindi ? "शास्त्रोक्त दैनिक मार्गदर्शन" : "Vedic Guidance"}
                              </th>
                              <th className="p-2 w-64 bg-amber-100/70 text-amber-950 font-bold">
                                {isHindi ? "दैनिक अनुभव (3 विकल्प व नोट)" : "Daily Feedback & Note"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 font-sans text-[11px]">
                            {monthlyReportData.days.map((item) => {
                              const hasFeedback = !!item.userFeedback;
                              const isTransitionDay =
                                !!item.nextTara &&
                                !!item.nakshatraEnds &&
                                item.nextTara.tara_number !== item.currentTara.tara_number;

                              return (
                                <tr
                                  key={item.day}
                                  id={`day-row-${item.day}`}
                                  className={`hover:bg-amber-50/30 transition-colors ${
                                    item.dayNatureCategory === "caution"
                                      ? "bg-rose-50/20"
                                      : item.dayNatureCategory === "mixed"
                                      ? "bg-amber-50/25"
                                      : ""
                                  }`}
                                >
                                  {/* Date & Day */}
                                  <td className="p-2 border-r border-stone-200 text-center font-bold">
                                    <div className="text-sm font-mono text-stone-900">{item.day}</div>
                                    <div className="text-[10px] text-stone-500 font-devanagari">
                                      {item.vaara.split(" ")[0] || item.date.split("/")[0]}
                                    </div>
                                  </td>

                                  {/* Tithi */}
                                  <td className="p-2 border-r border-stone-200 font-devanagari text-stone-800">
                                    <div className="font-semibold">{item.tithi}</div>
                                    {item.tithiEnds && (
                                      <div className="text-[10px] text-stone-600 font-sans mt-0.5">
                                        ⏱️ {item.tithiEnds} तक
                                      </div>
                                    )}
                                  </td>

                                  {/* Nakshatra & Change Time */}
                                  <td className="p-2 border-r border-stone-200 font-devanagari">
                                    <div className="font-bold text-stone-900">
                                      {item.nakshatraNumber}. {item.nakshatraName}
                                    </div>
                                    {item.nakshatraEnds && item.nextNakshatraName ? (
                                      <div className="text-[10px] text-amber-900 bg-amber-100/80 border border-amber-200 rounded px-1.5 py-0.5 font-sans mt-0.5 inline-block">
                                        ⏱️ {item.nakshatraEnds} तक ➔ <strong>{item.nextNakshatraName}</strong>
                                      </div>
                                    ) : (
                                      <div className="text-[9px] text-stone-500 font-sans mt-0.5">
                                        {isHindi ? "दिनभर प्रभावी (अगले सूर्योदय तक)" : "Active whole day"}
                                      </div>
                                    )}
                                  </td>

                                  {/* Native's Tara Status */}
                                  <td className="p-2 border-r border-stone-200">
                                    {isTransitionDay && item.nextTara ? (
                                      <div className="space-y-1.5">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[9px] text-stone-500 font-sans font-medium">
                                            {item.nakshatraEnds} तक:
                                          </span>
                                          <span
                                            className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded border ${getTaraBadgeColor(
                                              item.currentTara.nature,
                                            )}`}
                                          >
                                            {item.currentTara.tara_number}. {item.currentTara.tara_name} (
                                            {item.currentTara.nature.includes("Auspicious")
                                              ? "शुभ"
                                              : item.currentTara.nature.includes("Inauspicious")
                                              ? "सावधानी"
                                              : "मध्यम"}
                                            )
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 pt-0.5 border-t border-stone-100">
                                          <span className="text-[9px] text-amber-800 font-sans font-bold">
                                            {item.nakshatraEnds} के बाद:
                                          </span>
                                          <span
                                            className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded border ${getTaraBadgeColor(
                                              item.nextTara.nature,
                                            )}`}
                                          >
                                            {item.nextTara.tara_number}. {item.nextTara.tara_name} (
                                            {item.nextTara.nature.includes("Auspicious")
                                              ? "शुभ"
                                              : item.nextTara.nature.includes("Inauspicious")
                                              ? "सावधानी"
                                              : "मध्यम"}
                                            )
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <span
                                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${getTaraBadgeColor(
                                            item.currentTara.nature,
                                          )}`}
                                        >
                                          {item.currentTara.tara_number}. {item.currentTara.tara_name} Tara
                                        </span>
                                        <span className="block text-[9px] text-stone-500 mt-0.5">
                                          {item.currentTara.nature.includes("Auspicious")
                                            ? "शुभ तारा"
                                            : item.currentTara.nature.includes("Inauspicious")
                                            ? "सावधानी तारा"
                                            : "मध्यम तारा"}
                                        </span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Daily Recommendation */}
                                  <td className="p-2 border-r border-stone-200 text-stone-700 leading-tight">
                                    {isHindi ? item.recommendationHi : item.recommendationEn}
                                  </td>

                                  {/* USER FEEDBACK & DAY EXPERIENCE JOURNAL COLUMN */}
                                  <td
                                    data-feedback-container="true"
                                    data-date={item.date}
                                    data-day={item.day}
                                    className="p-2 bg-amber-50/20"
                                  >
                                    {/* SCREEN VIEW (Interactive 3 Options + Text Note) */}
                                    <div className="print:hidden space-y-1.5 min-w-[210px]">
                                      {/* 3 Quick Buttons: 🟢 शुभ (5★) | 🟡 सामान्य (3★) | 🔴 संभलकर (1★) */}
                                      <div className="flex items-center gap-1">
                                        {DAILY_FEEDBACK_OPTIONS.map((opt) => {
                                          const isSelected = item.userFeedback?.rating === opt.rating;
                                          return (
                                            <button
                                              key={opt.id}
                                              type="button"
                                              data-feedback-opt="true"
                                              data-date={item.date}
                                              data-day={item.day}
                                              data-rating={opt.rating}
                                              data-feeling={opt.id}
                                              onClick={() => handleQuickFeedback(item.date, item.day, opt.rating)}
                                              title={isHindi ? `${opt.labelHi} (क्लिक करें)` : `${opt.labelEn} (Click to set)`}
                                              className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 html-opt-btn ${
                                                isSelected
                                                  ? opt.id === "great"
                                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs ring-1 ring-emerald-400 scale-102 font-bold"
                                                    : opt.id === "neutral"
                                                    ? "bg-amber-500 text-white border-amber-600 shadow-xs ring-1 ring-amber-300 scale-102 font-bold"
                                                    : "bg-rose-600 text-white border-rose-700 shadow-xs ring-1 ring-rose-400 scale-102 font-bold"
                                                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                                              }`}
                                            >
                                              <span>{opt.icon}</span>
                                              <span className="font-devanagari text-[9px] leading-none">
                                                {isHindi ? opt.labelHi.split("/")[0].trim() : opt.labelEn}
                                              </span>
                                            </button>
                                          );
                                        })}
                                        <span
                                          data-saved-badge="true"
                                          style={{ display: hasFeedback ? "inline-flex" : "none" }}
                                          className="ml-auto text-emerald-700 font-bold text-[10px]"
                                          title="सुरक्षित"
                                        >
                                          ✓
                                        </span>
                                      </div>

                                      {/* Text input note field + Save button */}
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="text"
                                          data-note-input="true"
                                          data-date={item.date}
                                          data-day={item.day}
                                          key={`note-${item.date}-${item.userFeedback?.note || ""}`}
                                          defaultValue={item.userFeedback?.note || ""}
                                          placeholder={isHindi ? "कैसा रहा दिन? अनुभव लिखें..." : "How was the day? Note..."}
                                          onBlur={(e) => handleUpdateNote(item.date, item.day, e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              handleUpdateNote(item.date, item.day, (e.target as HTMLInputElement).value);
                                              (e.target as HTMLInputElement).blur();
                                            }
                                          }}
                                          className="flex-1 text-[10px] px-2 py-1 bg-white border border-stone-300 rounded text-stone-900 placeholder:text-stone-400 focus:bg-amber-50/50 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                                        />
                                        <button
                                          type="button"
                                          data-note-save="true"
                                          data-date={item.date}
                                          data-day={item.day}
                                          onClick={(e) => {
                                            const parent = (e.currentTarget as HTMLElement).closest('[data-feedback-container]');
                                            const inp = parent?.querySelector('input[data-note-input]') as HTMLInputElement | null;
                                            handleUpdateNote(item.date, item.day, inp ? inp.value : "");
                                          }}
                                          className="px-2 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] rounded transition-all cursor-pointer whitespace-nowrap shadow-xs"
                                        >
                                          {isHindi ? "सेव" : "Save"}
                                        </button>
                                      </div>
                                    </div>

                                    {/* PRINT VIEW (Rendered on paper / PDF export) */}
                                    <div className="hidden print:block">
                                      {hasFeedback && includeFeedbackInPrint && !printableBlankJournal ? (
                                        <div className="space-y-0.5 text-[10px]">
                                          <div className="font-bold flex items-center gap-1">
                                            {item.userFeedback!.rating >= 4 ? (
                                              <span className="text-emerald-800">🟢 शुभ / अति उत्तम ({item.userFeedback!.rating}/5)</span>
                                            ) : item.userFeedback!.rating === 3 ? (
                                              <span className="text-amber-800">🟡 सामान्य / मध्यम (3/5)</span>
                                            ) : (
                                              <span className="text-rose-800">🔴 संभलकर / चुनौतीपूर्ण (1/5)</span>
                                            )}
                                          </div>
                                          {item.userFeedback!.note ? (
                                            <div className="text-[10px] text-stone-800 italic leading-tight bg-stone-50 p-1 rounded border border-stone-200">
                                              "{item.userFeedback!.note}"
                                            </div>
                                          ) : (
                                            <div className="border-b border-dashed border-stone-300 h-2.5 w-full" />
                                          )}
                                        </div>
                                      ) : (
                                        /* Printable Blank Journal Box for Handwriting */
                                        <div className="space-y-1">
                                          <div className="text-[9px] text-stone-400 font-mono flex items-center justify-between">
                                            <span>[ ] 🟢 शुभ</span>
                                            <span>[ ] 🟡 सामान्य</span>
                                            <span>[ ] 🔴 संभलकर</span>
                                          </div>
                                          <div className="border-b border-dashed border-stone-300 h-3 w-full" />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

                {/* ================================================================= */}
                {/* 6. MONTHLY REFLECTION & FEEDBACK JOURNALING SUMMARY */}
                {/* ================================================================= */}
                {includeMonthlyReflection && (
                  <div className="rounded-xl border border-amber-900/40 bg-amber-50/50 p-4 space-y-3 print-no-break">
                    <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                      <MessageSquare className="w-4 h-4 text-amber-900" />
                      <h3 className="text-sm font-bold text-amber-950 font-devanagari">
                        {isHindi
                          ? "मासिक आत्म-समीक्षा एवं अनुभव सारांश (Monthly Feedback & Reflection Journal)"
                          : "Monthly Experience Reflection & Accuracy Review"}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1.5">
                        <span className="font-bold text-stone-900 block font-devanagari">
                          1. {isHindi ? "फलकथन व अनुभव की तुलना:" : "Astrological Prediction Match:"}
                        </span>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {isHindi
                            ? "क्या सम्पत्, क्षेम व साधक तारा वाले दिन वास्तव में अनुकूल रहे? क्या विपत् अथवा वध तारा के दिन कोई बाधा आई? नीचे अपने अनुभव लिखें:"
                            : "Did favorable Tara days align with positive outcomes? Note your reflections on prediction accuracy below:"}
                        </p>
                        <div className="border-b border-dashed border-stone-300 h-5 w-full mt-2" />
                        <div className="border-b border-dashed border-stone-300 h-5 w-full" />
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1.5">
                        <span className="font-bold text-stone-900 block font-devanagari">
                          2. {isHindi ? "किए गए प्रमुख उपाय व सीख:" : "Remedies Practiced & Learnings:"}
                        </span>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {isHindi
                            ? "कठिन दिनों में कौन-से वैदिक मंत्र या दान किए गए? अगले माह के लिए क्या सावधानी रखनी है?"
                            : "Which mantras or charities were performed during sensitive days? Key takeaways for next month:"}
                        </p>
                        <div className="border-b border-dashed border-stone-300 h-5 w-full mt-2" />
                        <div className="border-b border-dashed border-stone-300 h-5 w-full" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ================================================================= */}
            {/* DAILY SNAPSHOT CONTENT (When Daily mode selected) */}
            {/* ================================================================= */}
            {reportMode === "daily" && (
              <>
                {/* Real-time nakshatra change card */}
                {dailyReportData.activeTransit && (
                  <div className="rounded-xl border-2 border-amber-800/30 bg-amber-50/40 p-4 print-no-break">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-800" />
                        <span className="text-sm font-bold text-amber-950 font-devanagari">
                          {isHindi
                            ? "आज का नक्षत्र गोचर एवं परिवर्तन समय"
                            : "Today's Active Star & Change Timings"}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider bg-amber-200/70 px-2 py-0.5 rounded">
                        {isHindi ? "सक्रिय गोचर" : "Active In Sky"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                        <div className="text-[10px] uppercase font-bold text-stone-500">
                          {isHindi ? "अभी चल रहा नक्षत्र" : "Currently Active"}
                        </div>
                        <div className="text-base font-bold font-devanagari text-stone-900 mt-0.5">
                          {dailyReportData.activeTransit.currentNakshatra.index}.{" "}
                          {isHindi
                            ? dailyReportData.activeTransit.currentNakshatra.nameHi
                            : dailyReportData.activeTransit.currentNakshatra.nameEn}
                        </div>
                        <div className="mt-2 text-xs text-stone-700 font-sans space-y-1">
                          <div className="flex justify-between">
                            <span className="text-stone-500">
                              {isHindi ? "परिवर्तन समय:" : "Ends at:"}
                            </span>
                            <span className="font-bold text-amber-900">
                              {data?.nakshatra?.[0]?.ends || "दिनभर"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-stone-200">
                            <span className="text-stone-500">
                              {isHindi ? "जातक हेतु तारा:" : "Native's Tara:"}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-bold rounded border ${getTaraBadgeColor(
                                dailyReportData.activeTransit.currentTara.nature,
                              )}`}
                            >
                              {dailyReportData.activeTransit.currentTara.tara_name} Tara
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                        <div className="text-[10px] uppercase font-bold text-stone-500">
                          {isHindi ? "आगामी नक्षत्र" : "Upcoming Next Star"}
                        </div>
                        <div className="text-base font-bold font-devanagari text-stone-900 mt-0.5">
                          {dailyReportData.activeTransit.nextNakshatra.index}.{" "}
                          {isHindi
                            ? dailyReportData.activeTransit.nextNakshatra.nameHi
                            : dailyReportData.activeTransit.nextNakshatra.nameEn}
                        </div>
                        <div className="mt-2 text-xs text-stone-700 font-sans space-y-1">
                          <div className="flex justify-between">
                            <span className="text-stone-500">
                              {isHindi ? "प्रारंभ समय:" : "Starts at:"}
                            </span>
                            <span className="font-bold text-amber-900">
                              {data?.nakshatra?.[0]?.ends || "आगामी सूर्योदय"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-stone-200">
                            <span className="text-stone-500">
                              {isHindi ? "आगामी तारा:" : "Next Tara:"}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-bold rounded border ${getTaraBadgeColor(
                                dailyReportData.activeTransit.nextTara.nature,
                              )}`}
                            >
                              {dailyReportData.activeTransit.nextTara.tara_name} Tara
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full 27 Table */}
                {includeFullTable && (
                  <div className="space-y-4 print-no-break">
                    <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-800" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-950 font-devanagari">
                          {isHindi ? "त्रिपर्याय नवतारा चक्र (सम्पूर्ण 27 नक्षत्र)" : "Tri-Paryaya Navtara Table (27 Stars)"}
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-stone-300 overflow-hidden bg-white">
                        <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-300 flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 font-devanagari">
                            {isHindi ? "प्रथम पर्याय (जन्म चक्र)" : "1st Paryaya (Janma)"}
                          </span>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                            100% {isHindi ? "प्रभाव" : "Power"}
                          </span>
                        </div>
                        <div className="divide-y divide-stone-200 text-xs">
                          {dailyReportData.paryaya1.map((t, idx) => (
                            <div key={idx} className="p-2 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-stone-900 font-devanagari block">
                                  {t.target_nakshatra.index}.{" "}
                                  {isHindi
                                    ? ALL_27_NAKSHATRAS[t.target_nakshatra.index - 1]?.nameHi
                                    : t.target_nakshatra.name}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  {t.tara_number}. {t.tara_name} Tara
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getTaraBadgeColor(
                                  t.nature,
                                )}`}
                              >
                                {t.tara_score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-stone-300 overflow-hidden bg-white">
                        <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-300 flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 font-devanagari">
                            {isHindi ? "द्वितीय पर्याय (कर्म चक्र)" : "2nd Paryaya (Karma)"}
                          </span>
                          <span className="text-[10px] font-bold text-stone-700 bg-stone-200 px-1.5 py-0.5 rounded">
                            50% {isHindi ? "प्रभाव" : "Power"}
                          </span>
                        </div>
                        <div className="divide-y divide-stone-200 text-xs">
                          {dailyReportData.paryaya2.map((t, idx) => (
                            <div key={idx} className="p-2 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-stone-900 font-devanagari block">
                                  {t.target_nakshatra.index}.{" "}
                                  {isHindi
                                    ? ALL_27_NAKSHATRAS[t.target_nakshatra.index - 1]?.nameHi
                                    : t.target_nakshatra.name}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  {t.tara_number}. {t.tara_name} Tara
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getTaraBadgeColor(
                                  t.nature,
                                )}`}
                              >
                                {t.tara_score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-stone-300 overflow-hidden bg-white">
                        <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-300 flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 font-devanagari">
                            {isHindi ? "तृतीय पर्याय (आधान चक्र)" : "3rd Paryaya (Adhana)"}
                          </span>
                          <span className="text-[10px] font-bold text-stone-700 bg-stone-200 px-1.5 py-0.5 rounded">
                            25-75%
                          </span>
                        </div>
                        <div className="divide-y divide-stone-200 text-xs">
                          {dailyReportData.paryaya3.map((t, idx) => (
                            <div key={idx} className="p-2 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-stone-900 font-devanagari block">
                                  {t.target_nakshatra.index}.{" "}
                                  {isHindi
                                    ? ALL_27_NAKSHATRAS[t.target_nakshatra.index - 1]?.nameHi
                                    : t.target_nakshatra.name}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  {t.tara_number}. {t.tara_name} Tara
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getTaraBadgeColor(
                                  t.nature,
                                )}`}
                              >
                                {t.tara_score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ================================================================= */}
            {/* 7. DOCUMENT AUTHENTIC FOOTER */}
            {/* ================================================================= */}
            <div className="pt-6 border-t-2 border-amber-900/30 text-center text-[11px] text-stone-500 font-sans space-y-1">
              <p>
                {isHindi
                  ? "यह रिपोर्ट महर्षि पाराशर एवं वराहमिहिर के शास्त्रीय सिद्धांतों तथा उच्च-परिशुद्ध नासा जेपीएल दृक गणित पर आधारित है।"
                  : "Computed strictly under Maharshi Parashara & Varahamihira classical Jyotisha principles with NASA JPL high-precision ephemeris."}
              </p>
              <div className="text-[10px] text-stone-400">
                महावतार पंचांग • जनरेटेड: {new Date().toLocaleString()} • Authorized Vedic Document
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* STICKY BOTTOM ACTION BAR (MOBILE & DESKTOP - ALWAYS VISIBLE) */}
        {/* ================================================================= */}
        <div className="sticky bottom-0 z-40 shrink-0 bg-stone-900 text-white px-2.5 sm:px-6 py-2 sm:py-3 border-t border-stone-700 flex flex-wrap items-center justify-between gap-2 shadow-2xl print:hidden">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 hidden sm:inline" />
            <div className="text-[11px] leading-tight text-stone-300">
              <span className="font-bold text-amber-300 font-devanagari block sm:inline mr-1">
                {isHindi ? "मासिक नवतारा रिपोर्ट" : "Monthly Report"}
              </span>
              <span className="hidden sm:inline">
                {isHindi ? "• फोन में सीधे सेव करें" : "• Save direct to device"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Primary Action: Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              id="sticky-bottom-download-pdf-btn"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 disabled:opacity-60 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/40 active:scale-95 cursor-pointer transition-all border border-amber-500/30"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isGeneratingPdf
                  ? isHindi
                    ? "PDF बन रही है..."
                    : "Building..."
                  : isHindi
                  ? "📥 डाउनलोड PDF"
                  : "📥 Download PDF"}
              </span>
            </button>

            {/* Offline Standalone HTML File */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              title={isHindi ? "ऑफ़लाइन HTML फ़ाइल डाउनलोड करें" : "Download offline HTML"}
              className="inline-flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-stone-700 active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isHindi ? "HTML सेव करें" : "Save HTML"}</span>
              <span className="sm:hidden">HTML</span>
            </button>

            {/* Browser Print Dialog */}
            <button
              type="button"
              onClick={handlePrint}
              id="sticky-bottom-print-navtara-btn"
              title={isHindi ? "प्रिंटर डायलॉग खोलें" : "Open browser print"}
              className="inline-flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-300 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-stone-700 active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? "प्रिंट" : "Print"}</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              id="sticky-bottom-close-navtara-btn"
              className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold cursor-pointer border border-stone-700 active:scale-95 transition-all"
            >
              {isHindi ? "✕ बंद" : "✕ Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
