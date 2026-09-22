import React, { useState } from "react";
import type { PanchangaResponse, AppTheme } from "../types";
import {
  type Language,
  getLocalizedTithi,
  getLocalizedNakshatra,
  getLocalizedVaara,
} from "../i18n";
import type { ActiveView } from "./Header";
import {
  ALL_VIEW_METAS,
  type ViewMeta,
  type NavPreferences,
  moveViewUp,
  moveViewDown,
} from "../lib/navPreferences";
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  RotateCcw,
  LayoutGrid,
  List,
  Compass,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  Calendar,
  Clock,
  Sun,
  Moon,
  Wind,
} from "lucide-react";

interface HomeHubViewProps {
  data?: PanchangaResponse | null;
  lang: Language;
  theme: AppTheme;
  navPreferences: NavPreferences;
  onUpdateNavPreferences: (newPrefs: NavPreferences) => void;
  onSelectView: (view: ActiveView) => void;
  onOpenSettings?: () => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  data,
  lang,
  theme,
  navPreferences,
  onUpdateNavPreferences,
  onSelectView,
}) => {
  const isNight = theme === "nightSky";

  // Local state for editing order before or while saving
  const [currentOrder, setCurrentOrder] = useState<ActiveView[]>(
    navPreferences.orderedViews || ALL_VIEW_METAS.map((m) => m.id)
  );
  const [selectedDefaultView, setSelectedDefaultView] = useState<ActiveView>(
    navPreferences.defaultLandingView || "home"
  );
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">(
    navPreferences.layoutFormat || "grid"
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "core" | "astrology" | "esoteric" | "calendar"
  >("all");
  const [showReorderMode, setShowReorderMode] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Sync if navPreferences changes from outside
  React.useEffect(() => {
    setCurrentOrder(navPreferences.orderedViews);
    setSelectedDefaultView(navPreferences.defaultLandingView);
    setLayoutMode(navPreferences.layoutFormat);
  }, [navPreferences]);

  // Create a fast map of meta objects
  const metaMap = React.useMemo(() => {
    const map = new Map<ActiveView, ViewMeta>();
    ALL_VIEW_METAS.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // Ordered list of meta objects
  const orderedMetas = React.useMemo(() => {
    const list: ViewMeta[] = [];
    currentOrder.forEach((id) => {
      const m = metaMap.get(id);
      if (m) list.push(m);
    });
    // Add any missing
    ALL_VIEW_METAS.forEach((m) => {
      if (!currentOrder.includes(m.id)) list.push(m);
    });
    return list;
  }, [currentOrder, metaMap]);

  // Filtered by category
  const displayedMetas = React.useMemo(() => {
    if (categoryFilter === "all") return orderedMetas;
    return orderedMetas.filter((m) => m.category === categoryFilter);
  }, [orderedMetas, categoryFilter]);

  const handleMoveUp = (id: ActiveView, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = moveViewUp(currentOrder, id);
    setCurrentOrder(updated);
    const newPrefs: NavPreferences = {
      ...navPreferences,
      orderedViews: updated,
      defaultLandingView: selectedDefaultView,
      layoutFormat: layoutMode,
    };
    onUpdateNavPreferences(newPrefs);
  };

  const handleMoveDown = (id: ActiveView, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = moveViewDown(currentOrder, id);
    setCurrentOrder(updated);
    const newPrefs: NavPreferences = {
      ...navPreferences,
      orderedViews: updated,
      defaultLandingView: selectedDefaultView,
      layoutFormat: layoutMode,
    };
    onUpdateNavPreferences(newPrefs);
  };

  const handleSavePreferences = () => {
    const newPrefs: NavPreferences = {
      orderedViews: currentOrder,
      defaultLandingView: selectedDefaultView,
      layoutFormat: layoutMode,
    };
    onUpdateNavPreferences(newPrefs);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaultList = ALL_VIEW_METAS.map((m) => m.id);
    setCurrentOrder(defaultList);
    setSelectedDefaultView("home");
    setLayoutMode("grid");
    const newPrefs: NavPreferences = {
      orderedViews: defaultList,
      defaultLandingView: "home",
      layoutFormat: "grid",
    };
    onUpdateNavPreferences(newPrefs);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSetDefaultView = (id: ActiveView, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDefaultView(id);
    const newPrefs: NavPreferences = {
      orderedViews: currentOrder,
      defaultLandingView: id,
      layoutFormat: layoutMode,
    };
    onUpdateNavPreferences(newPrefs);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* ─── Top Vedic Hero & Cosmic Status Strip ─────────────────── */}
      <div
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-7 border shadow-md transition-colors ${
          isNight
            ? "bg-gradient-to-br from-[#12182d] via-[#0d1224] to-[#070a14] border-indigo-900/60 text-white"
            : "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-100/40 border-amber-200/80 text-stone-900"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {lang === "hi"
                  ? "वैदिक महावतार केन्द्र · कस्टमाइजेबल होम"
                  : "Vedic Cosmic Hub · Personalized Dashboard"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif-vedic tracking-tight">
              {lang === "hi"
                ? "पंचांग, ज्योतिष व स्वरोदय मुख्य पृष्ठ"
                : "Panchanga, Kundli & Cosmic Center"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
              {lang === "hi"
                ? "अपनी आवश्यकता अनुसार सभी मुख्य ऑप्शंस को ऊपर या नीचे (↑/↓) सॉर्ट करें और अपनी प्राथमिकता के अनुसार सहेजें। यहाँ से किसी भी विधा में त्वरित प्रवेश करें।"
                : "Reorder modules Up or Down (↑/↓) according to your daily needs and save preferences. Click any card to launch immediately."}
            </p>
          </div>

          {/* Quick Cosmic Live Glance */}
          {data && (() => {
            const primaryTithi = Array.isArray(data.tithi) && data.tithi.length > 0 ? data.tithi[0] : null;
            const tithiDisplay = primaryTithi
              ? typeof primaryTithi.number === "number"
                ? getLocalizedTithi(primaryTithi.number, lang) || primaryTithi.name
                : primaryTithi.name || `Tithi ${primaryTithi.number}`
              : typeof data.tithi === "string"
              ? data.tithi
              : "—";

            const primaryNak = Array.isArray(data.nakshatra) && data.nakshatra.length > 0 ? data.nakshatra[0] : null;
            const nakshatraDisplay = primaryNak
              ? typeof primaryNak.number === "number"
                ? getLocalizedNakshatra(primaryNak.number, primaryNak.name || "", lang) || primaryNak.name
                : primaryNak.name || `Nakshatra ${primaryNak.number}`
              : typeof data.nakshatra === "string"
              ? data.nakshatra
              : "—";

            const vaaraDisplay = data.vaara
              ? getLocalizedVaara(data.vaara, lang)
              : lang === "hi"
              ? "आज का पञ्चाङ्ग"
              : "Today's Almanac";

            return (
              <div
                className={`flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl border text-xs min-w-[240px] sm:min-w-[280px] shrink-0 backdrop-blur-md ${
                  isNight
                    ? "bg-indigo-950/60 border-indigo-800/60 text-slate-200 shadow-inner"
                    : "bg-white/85 border-amber-300/60 text-stone-800 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-stone-200/60 dark:border-indigo-800/40 font-bold">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                    <Sun className="w-4 h-4" />
                    {vaaraDisplay}
                  </span>
                  <span className="text-[11px] opacity-80">{data.city}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div>
                    <span className="text-stone-400 block text-[10px]">
                      {lang === "hi" ? "तिथि" : "Tithi"}
                    </span>
                    <span className="font-bold truncate block">{tithiDisplay}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">
                      {lang === "hi" ? "नक्षत्र" : "Nakshatra"}
                    </span>
                    <span className="font-bold truncate block">{nakshatraDisplay}</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lang === "hi" ? "सूर्योदय" : "Sunrise"}: {data.sunrise || "—"}
                  </span>
                  <span>
                    {lang === "hi" ? "सूर्यास्त" : "Sunset"}: {data.sunset || "—"}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ─── Preference Control Bar (Sort, Layout, Save, Reset) ──── */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
          isNight
            ? "bg-[#0f1527]/90 border-indigo-900/60"
            : "bg-white border-amber-200/80"
        }`}
      >
        {/* Left: Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {lang === "hi" ? "वर्ग:" : "Filter:"}
          </span>
          {[
            { id: "all", labelHi: "सभी ऑप्शंस (13)", labelEn: "All (13)" },
            { id: "core", labelHi: "पंचांग व काल", labelEn: "Core Panchanga" },
            { id: "astrology", labelHi: "ज्योतिष व कुण्डली", labelEn: "Astrology" },
            { id: "esoteric", labelHi: "स्वरोदय व तत्व", labelEn: "Esoteric" },
            { id: "calendar", labelHi: "कैलेंडर व पर्व", labelEn: "Calendar" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as typeof categoryFilter)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === cat.id
                  ? isNight
                    ? "bg-amber-400 text-indigo-950 shadow-xs"
                    : "bg-amber-600 text-white shadow-xs"
                  : isNight
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {lang === "hi" ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Right: Order Mode Toggle, Layout toggle, and Save Action */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Layout Mode (Grid vs List) */}
          <div className="flex items-center rounded-lg border p-0.5 border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/80">
            <button
              onClick={() => {
                setLayoutMode("grid");
                const newPrefs: NavPreferences = {
                  orderedViews: currentOrder,
                  defaultLandingView: selectedDefaultView,
                  layoutFormat: "grid",
                };
                onUpdateNavPreferences(newPrefs);
              }}
              className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                layoutMode === "grid"
                  ? "bg-white dark:bg-slate-700 shadow-2xs text-amber-700 dark:text-amber-300"
                  : "text-stone-500 hover:text-stone-800 dark:text-slate-400"
              }`}
              title={lang === "hi" ? "ग्रिड कार्ड प्रारूप" : "Grid Format"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setLayoutMode("list");
                const newPrefs: NavPreferences = {
                  orderedViews: currentOrder,
                  defaultLandingView: selectedDefaultView,
                  layoutFormat: "list",
                };
                onUpdateNavPreferences(newPrefs);
              }}
              className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                layoutMode === "list"
                  ? "bg-white dark:bg-slate-700 shadow-2xs text-amber-700 dark:text-amber-300"
                  : "text-stone-500 hover:text-stone-800 dark:text-slate-400"
              }`}
              title={lang === "hi" ? "सूची प्रारूप" : "List Format"}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Reorder Mode Button */}
          <button
            onClick={() => setShowReorderMode(!showReorderMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showReorderMode
                ? "bg-amber-500 text-stone-950 border-amber-600 shadow-xs"
                : isNight
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <ArrowDown className="w-3.5 h-3.5" />
            <span>
              {showReorderMode
                ? lang === "hi"
                  ? "क्रम व्यवस्था पूर्ण"
                  : "Done Sorting"
                : lang === "hi"
                ? "क्रम बदलें (Sort)"
                : "Customize Order"}
            </span>
          </button>

          {/* Reset Order */}
          <button
            onClick={handleResetDefaults}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:text-rose-600 transition-all flex items-center gap-1"
            title={lang === "hi" ? "मूल क्रम में रीसेट करें" : "Reset Order"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {lang === "hi" ? "रीसेट" : "Reset"}
            </span>
          </button>

          {/* Save Preferences Button */}
          <button
            onClick={handleSavePreferences}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5 ring-2 ring-emerald-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {lang === "hi" ? "प्रेफरेंस सहेजें" : "Save Preferences"}
            </span>
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {lang === "hi"
              ? "आपकी नेविगेशन प्राथमिकताएं (Order & Preferences) सफलतापूर्वक सहेज ली गई हैं! मेन मेन्यू में भी यही क्रम लागू हो गया है।"
              : "Navigation preferences and order saved successfully! The top menu reflects your changes."}
          </span>
        </div>
      )}

      {/* Default Landing Page Quick Selector Info */}
      <div
        className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isNight
            ? "bg-slate-900/60 border-indigo-900/40 text-slate-300"
            : "bg-amber-50/50 border-amber-200/60 text-stone-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <strong className="text-stone-900 dark:text-white">
              {lang === "hi" ? "प्रारंभिक पृष्ठ (Landing Page):" : "Default Landing Page:"}
            </strong>{" "}
            <span className="opacity-90">
              {lang === "hi"
                ? `ऐप खुलने पर सबसे पहले "${
                    metaMap.get(selectedDefaultView)?.titleHi || selectedDefaultView
                  }" खुलेगा।`
                : `App will initially open on "${
                    metaMap.get(selectedDefaultView)?.titleEn || selectedDefaultView
                  }".`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 dark:text-slate-400">
            {lang === "hi" ? "बदलें:" : "Change:"}
          </span>
          <select
            value={selectedDefaultView}
            onChange={(e) => handleSetDefaultView(e.target.value as ActiveView)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
              isNight
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-white border-stone-300 text-stone-900"
            }`}
          >
            {ALL_VIEW_METAS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.icon} {lang === "hi" ? m.titleHi : m.titleEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Options Display (Grid or List with Up/Down Reorder) ─── */}
      {layoutMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {displayedMetas.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === displayedMetas.length - 1;
            const isDefault = selectedDefaultView === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`group relative rounded-2xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 ${
                  isDefault
                    ? isNight
                      ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-amber-400/50 shadow-md ring-1 ring-amber-400/30"
                      : "bg-gradient-to-b from-amber-50/90 to-white border-amber-400 shadow-md ring-1 ring-amber-400/30"
                    : isNight
                    ? "bg-[#11172a]/90 border-slate-800 hover:border-indigo-700/80 hover:bg-[#151d36]"
                    : "bg-white border-stone-200/90 hover:border-amber-400/80 hover:bg-amber-50/20"
                }`}
              >
                {/* Header of Card */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs transition-transform group-hover:scale-110 ${
                          isNight
                            ? "bg-slate-800/90 text-amber-300 border border-slate-700"
                            : "bg-amber-100/70 text-amber-900 border border-amber-200/80"
                        }`}
                      >
                        <span>{item.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base font-serif-vedic text-stone-900 dark:text-white leading-tight">
                            {lang === "hi" ? item.titleHi : item.titleEn}
                          </h3>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {lang === "hi" ? item.badge.hi : item.badge.en}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-devanagari text-stone-400 dark:text-slate-500 font-medium">
                          {item.sanskrit}
                        </span>
                      </div>
                    </div>

                    {/* Order Controls (Up / Down) */}
                    <div
                      className="flex items-center gap-1 shrink-0 bg-stone-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-stone-200 dark:border-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleMoveUp(item.id, e)}
                        disabled={isFirst}
                        className="p-1 rounded hover:bg-stone-200 dark:hover:bg-slate-700 disabled:opacity-20 text-stone-600 dark:text-slate-300 transition-colors"
                        title={lang === "hi" ? "ऊपर ले जाएं (Move Up)" : "Move Up"}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold px-1 text-stone-400">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleMoveDown(item.id, e)}
                        disabled={isLast}
                        className="p-1 rounded hover:bg-stone-200 dark:hover:bg-slate-700 disabled:opacity-20 text-stone-600 dark:text-slate-300 transition-colors"
                        title={lang === "hi" ? "नीचे ले जाएं (Move Down)" : "Move Down"}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed min-h-[38px] mb-4">
                    {lang === "hi" ? item.descHi : item.descEn}
                  </p>
                </div>

                {/* Footer Action of Card */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => handleSetDefaultView(item.id, e)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      isDefault
                        ? "bg-amber-500 text-stone-950 font-black"
                        : "text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
                    }`}
                    title={
                      lang === "hi"
                        ? "ऐप खुलने पर यह पेज दिखाएं"
                        : "Set as initial landing page"
                    }
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>
                      {isDefault
                        ? lang === "hi"
                          ? "डिफ़ॉल्ट पेज ✓"
                          : "Default Landing ✓"
                        : lang === "hi"
                        ? "डिफ़ॉल्ट बनाएं"
                        : "Set Default"}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>{lang === "hi" ? "खोलें" : "Open"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode with Direct Up/Down Actions */
        <div className="space-y-2.5">
          {displayedMetas.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === displayedMetas.length - 1;
            const isDefault = selectedDefaultView === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`group rounded-2xl border p-3.5 sm:p-4 transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md ${
                  isDefault
                    ? isNight
                      ? "bg-indigo-950/80 border-amber-400/50"
                      : "bg-amber-50/90 border-amber-400/80"
                    : isNight
                    ? "bg-[#11172a]/90 border-slate-800 hover:border-indigo-700"
                    : "bg-white border-stone-200 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      isNight ? "bg-slate-800 text-amber-300" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 dark:text-white truncate">
                        {lang === "hi" ? item.titleHi : item.titleEn}
                      </span>
                      <span className="text-[11px] text-stone-400 dark:text-slate-500 font-devanagari">
                        ({item.sanskrit})
                      </span>
                      {isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-stone-950">
                          {lang === "hi" ? "डिफ़ॉल्ट" : "Default"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 truncate mt-0.5">
                      {lang === "hi" ? item.descHi : item.descEn}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleSetDefaultView(item.id, e)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      isDefault
                        ? "bg-amber-500 text-stone-950"
                        : "text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isDefault
                      ? lang === "hi"
                        ? "डिफ़ॉल्ट ✓"
                        : "Default ✓"
                      : lang === "hi"
                      ? "डिफ़ॉल्ट चुनें"
                      : "Make Default"}
                  </button>

                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={(e) => handleMoveUp(item.id, e)}
                      disabled={isFirst}
                      className="p-1 rounded hover:bg-stone-200 dark:hover:bg-slate-700 disabled:opacity-20 text-stone-600 dark:text-slate-300"
                      title={lang === "hi" ? "ऊपर ले जाएं" : "Move Up"}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold px-1.5 text-stone-400">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleMoveDown(item.id, e)}
                      disabled={isLast}
                      className="p-1 rounded hover:bg-stone-200 dark:hover:bg-slate-700 disabled:opacity-20 text-stone-600 dark:text-slate-300"
                      title={lang === "hi" ? "नीचे ले जाएं" : "Move Down"}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-1"
                  >
                    <span>{lang === "hi" ? "खोलें" : "Open"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default HomeHubView;
