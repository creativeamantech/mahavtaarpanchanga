import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  Bell,
  Sun,
  Sparkles,
  Flame,
  Clock,
  ShieldAlert,
  X,
  CalendarCheck,
  Wind,
} from "lucide-react";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
  signInWithGsi,
  logoutGoogleCalendar,
  getAccessToken,
  getCurrentUser,
} from "../services/googleCalendarAuth";
import {
  syncDailyPanchangaEvents,
  syncMultiDayPanchangaEvents,
  getAutoContinuousSyncPref,
  setAutoContinuousSyncPref,
  listPanchangaEvents,
  deleteCalendarEvent,
  deletePanchangaEventsForDate,
  downloadPanchangaIcsFile,
  openDirectGoogleCalendarUrl,
  buildPanchangaEventPayloads,
  SyncedCalendarEvent,
  SyncOptions,
  DEFAULT_SYNC_OPTIONS,
} from "../services/googleCalendarService";
import { PanchangaResponse, AppTheme } from "../types";
import { Language } from "../i18n";
import { computeSwaraYoga } from "../swaraYoga";
import { normalizeDailySchedule } from "../lib/dailyScheduleNormalizer";

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchangaData: PanchangaResponse | null;
  lang: Language;
  theme: AppTheme;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  panchangaData,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";

  // Auth State
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync Options
  const [options, setOptions] = useState<SyncOptions>(DEFAULT_SYNC_OPTIONS);

  // Synced Events State
  const [syncedEvents, setSyncedEvents] = useState<SyncedCalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Destructive Action Confirmation Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Continuous Sync & Multi-Day Range State
  const [syncRangeDays, setSyncRangeDays] = useState<number>(30); // 1, 7, 30
  const [autoContinuousSync, setAutoContinuousSync] = useState<boolean>(
    getAutoContinuousSyncPref(),
  );
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        setAuthError(null);
      },
      () => {
        // User logged out or token absent
        setUser(null);
        setToken(null);
      },
    );

    // Initial check for in-memory token
    getAccessToken().then((t) => {
      if (t) setToken(t);
      const curr = getCurrentUser();
      if (curr) setUser(curr);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Fetch already-synced events when modal opens or user logs in
  const fetchExistingEvents = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken || !panchangaData?.date) return;

    setIsLoadingEvents(true);
    setActionError(null);
    try {
      const events = await listPanchangaEvents(activeToken, panchangaData.date);
      setSyncedEvents(events);
    } catch (err: any) {
      console.warn("Could not list Google Calendar events:", err);
      if (err?.message?.includes("401") || err?.message?.includes("Invalid Credentials")) {
        setToken(null);
      } else {
        setActionError(err?.message || "Failed to read calendar events");
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchExistingEvents(token);
    }
  }, [isOpen, token, panchangaData?.date]);

  if (!isOpen) return null;

  // Handle Google Login (Attempts Firebase Auth then falls back to Direct GIS Token Client)
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    setActionError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        fetchExistingEvents(res.accessToken);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      let msg = err?.message || "Google Calendar connection failed.";
      if (msg.includes("unauthorized-domain")) {
        msg =
          lang === "hi"
            ? "प्रारंभिक फ़ायरबेस डोमेन सीमा। नीचे 'डायरेक्ट Google OAuth कनेक्ट' बटन का उपयोग करें।"
            : "Preview domain restriction. Use the 'Direct Google OAuth Connect' option below.";
      }
      setAuthError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDirectGsiLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    setActionError(null);
    try {
      const res = await signInWithGsi();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        fetchExistingEvents(res.accessToken);
      }
    } catch (err: any) {
      console.error("Direct GIS Login failed:", err);
      setAuthError(err?.message || "Google Calendar connection failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutGoogleCalendar();
      setUser(null);
      setToken(null);
      setSyncedEvents([]);
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  const toggleAutoContinuousSync = (val: boolean) => {
    setAutoContinuousSync(val);
    setAutoContinuousSyncPref(val);
  };

  // Handle Sync with Multi-Day Range into Panchang Calendar
  const handleSyncRange = async () => {
    if (!token || !panchangaData) return;

    setIsSyncing(true);
    setActionError(null);
    setSyncSuccessMsg(null);
    setSyncProgress({ current: 1, total: syncRangeDays });

    try {
      if (syncRangeDays === 1) {
        const result = await syncDailyPanchangaEvents(token, panchangaData, options);

        if (result.created.length > 0) {
          const msg =
            lang === "hi"
              ? `सफलतापूर्वक ${result.created.length} पंचांग कार्यक्रम 'Panchang Calendar' में सिंक किए गए!`
              : `Successfully synced ${result.created.length} Panchanga event(s) to 'Panchang Calendar'!`;
          setSyncSuccessMsg(msg);
        } else {
          const msg =
            lang === "hi"
              ? `आज के कार्यक्रम पहले से ही 'Panchang Calendar' में उपस्थित हैं।`
              : `Events for today are already present in 'Panchang Calendar'.`;
          setSyncSuccessMsg(msg);
        }
      } else {
        const result = await syncMultiDayPanchangaEvents(
          token,
          panchangaData,
          syncRangeDays,
          options,
          (cur, total) => {
            setSyncProgress({ current: cur, total });
          },
        );

        const msg =
          lang === "hi"
            ? `सफलतापूर्वक ${syncRangeDays} दिनों के कार्यक्रम (कुल ${result.totalCreated} नए) 'Panchang Calendar' में सिंक किए गए!`
            : `Successfully synced ${syncRangeDays} days of events (${result.totalCreated} new) to 'Panchang Calendar'!`;
        setSyncSuccessMsg(msg);
      }

      await fetchExistingEvents(token);
    } catch (err: any) {
      console.error("Sync failed:", err);
      setActionError(err?.message || "Failed to sync events to Panchang Calendar");
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  // Handle Destructive Deletion with User Confirmation
  const executeDeleteSingle = async (eventId: string) => {
    if (!token) return;
    setIsDeleting(true);
    try {
      await deleteCalendarEvent(token, eventId);
      setSyncedEvents((prev) => prev.filter((e) => e.id !== eventId));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const executeDeleteAll = async () => {
    if (!token || !panchangaData?.date) return;
    setIsDeleting(true);
    try {
      await deletePanchangaEventsForDate(token, panchangaData.date);
      setSyncedEvents([]);
      setConfirmDeleteAll(false);
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete events");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isNight
            ? "bg-[#0f172a] border-indigo-900/60 text-slate-100"
            : "bg-[#fffdf8] border-amber-200/80 text-stone-900"
        }`}
      >
        {/* Header Strip */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isNight
              ? "bg-indigo-950/60 border-indigo-900/40"
              : "bg-gradient-to-r from-amber-100/90 to-amber-50 border-amber-200/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-devanagari flex items-center gap-2">
                {lang === "hi" ? "गूगल कैलेंडर दैनिक सिंक" : "Google Calendar Daily Sync"}
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  {lang === "hi" ? "प्रत्यक्ष" : "Direct"}
                </span>
              </h2>
              <p className={`text-xs ${isNight ? "text-indigo-300/80" : "text-stone-600"}`}>
                {lang === "hi"
                  ? "दैनिक तिथि, शुभ मुहूर्त एवं राहु काल को अपने Google Calendar में स्वचालित सिंक करें"
                  : "Sync daily Tithi, auspicious Muhurtas & Rahu Kalam directly to Google Calendar"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isNight
                ? "hover:bg-indigo-900/60 text-slate-400 hover:text-white"
                : "hover:bg-amber-200/60 text-stone-500 hover:text-stone-900"
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 hide-scrollbar">
          {/* Section 0: Instant 1-Click .ICS & Direct Google Calendar Add (NO LOGIN REQUIRED) */}
          {panchangaData && (
            <div
              className={`p-4.5 rounded-2xl border shadow-sm transition-all ${
                isNight
                  ? "bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border-amber-500/30 text-amber-100"
                  : "bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50/40 border-amber-300/80 text-amber-950"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                      {lang === "hi"
                        ? "त्वरित सिंक • बिना लॉगिन"
                        : "Instant Sync • No Login Needed"}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold font-devanagari mt-1 text-amber-950 dark:text-amber-200">
                    {lang === "hi"
                      ? "डायरेक्ट पंचांग फाइल (.ICS) डाउनलोड करें"
                      : "Direct 1-Click Calendar File (.ICS) Export"}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-slate-300 mt-0.5">
                    {lang === "hi"
                      ? "Google, Apple अथवा Outlook Calendar में सीधे तिथि, मुहूर्त एवं राहु काल इम्पोर्ट करें।"
                      : "Directly import Tithi, Muhurta & Rahu Kalam into Google, Outlook, or Apple Calendar on phone or PC."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadPanchangaIcsFile(panchangaData, options)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>{lang === "hi" ? "📥 डाउनलोड .ICS फाइल" : "📥 Download .ICS File"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const payloads = buildPanchangaEventPayloads(panchangaData, options);
                      if (payloads.length > 0) {
                        openDirectGoogleCalendarUrl(payloads[0]);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-300/80 dark:border-stone-600 text-amber-900 dark:text-amber-200 font-bold text-xs transition-all hover:bg-amber-100 dark:hover:bg-stone-700 shadow-xs cursor-pointer"
                    title="Open Google Calendar Direct Add in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === "hi" ? "Google Web में खोलें" : "Open GCal Web"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Authentication Connection Status */}
          <div
            className={`p-4 rounded-2xl border ${
              isNight
                ? "bg-slate-900/80 border-indigo-950/60"
                : "bg-white border-amber-200/70 shadow-xs"
            }`}
          >
            {user && token ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Google User"}
                      className="w-10 h-10 rounded-full border-2 border-amber-500/40 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-sm">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {user.displayName || "Google Account"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />{" "}
                        {lang === "hi" ? "कनेक्टेड" : "Connected"}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block truncate max-w-[240px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchExistingEvents(token)}
                    disabled={isLoadingEvents}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      isNight
                        ? "border-indigo-800/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-slate-300"
                        : "border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700"
                    }`}
                    title="Refresh calendar events"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? "animate-spin" : ""}`} />
                    {lang === "hi" ? "ताज़ा करें" : "Refresh"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-300/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {lang === "hi" ? "लॉगआउट" : "Disconnect"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold font-devanagari flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {lang === "hi"
                      ? "Google Account से कनेक्ट करें"
                      : "Connect your Google Account"}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                    {lang === "hi"
                      ? "अपने प्राथमिक Google Calendar में दैनिक पंचांग और मुहूर्त जोड़ने की अनुमति दें।"
                      : "Grant permission to create and view Vedic Panchanga events on your calendar."}
                  </p>
                </div>

                {/* Official Google Material Style Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-white font-medium text-xs shadow-sm transition-all shrink-0 hover:shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  ) : (
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-4 h-4"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  )}
                  <span>
                    {isLoggingIn
                      ? lang === "hi"
                        ? "प्रमाणीकरण हो रहा है..."
                        : "Connecting..."
                      : lang === "hi"
                        ? "Sign in with Google"
                        : "Sign in with Google"}
                  </span>
                </button>
              </div>
            )}

            {authError && (
              <div className="mt-3 p-3 rounded-xl border border-rose-300/80 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{authError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDirectGsiLogin}
                  disabled={isLoggingIn}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === "hi" ? "डायरेक्ट गूगल सिंक" : "Direct Google Connect"}
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Panchanga Events To Sync for Current Date */}
          {panchangaData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-indigo-300 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-amber-500" />
                  {lang === "hi"
                    ? `सिंक हेतु चयनित कार्यक्रम (${panchangaData.date})`
                    : `Events to Sync for ${panchangaData.date}`}
                </h3>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {panchangaData.city}
                </span>
              </div>

              {/* Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* 1. Daily Overview */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeDailySummary
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeDailySummary}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeDailySummary: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "hi" ? "दैनिक पंचांग सारांश" : "Daily Panchanga Overview"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {lang === "hi"
                        ? "तिथि, नक्षत्र, योग, करण, सूर्योदय एवं सूर्यास्त युक्त ऑल-डे इवेंट"
                        : "All-day event containing complete Tithi, Nakshatra, Yoga & Karana"}
                    </span>
                  </div>
                </label>

                {/* 2. Brahma Muhurta */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeBrahmaMuhurta
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeBrahmaMuhurta}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeBrahmaMuhurta: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {lang === "hi" ? "ब्रह्म मुहूर्त" : "Brahma Muhurta"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {panchangaData.brahma_muhurta?.start || "--"} से{" "}
                      {panchangaData.brahma_muhurta?.end || "--"} (ध्यान व साधना)
                    </span>
                  </div>
                </label>

                {/* 3. Abhijit Muhurta */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeAbhijitMuhurta
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeAbhijitMuhurta}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeAbhijitMuhurta: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "hi" ? "अभिजित मुहूर्त (विजय काल)" : "Abhijit Muhurta"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {panchangaData.abhijit_muhurta?.start || "--"} से{" "}
                      {panchangaData.abhijit_muhurta?.end || "--"} (सर्वकार्य सिद्धि)
                    </span>
                  </div>
                </label>

                {/* 4. Rahu Kalam */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeRahuKala
                      ? isNight
                        ? "bg-rose-950/30 border-rose-700/50 text-rose-200"
                        : "bg-rose-50/80 border-rose-300/80 text-rose-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeRahuKala}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeRahuKala: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {lang === "hi" ? "राहु काल (अशुभ काल)" : "Rahu Kalam (Warning)"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {panchangaData.rahu_kala?.start || "--"} से{" "}
                      {panchangaData.rahu_kala?.end || "--"} (शुभ कार्य वर्जित)
                    </span>
                  </div>
                </label>

                {/* 5. Tithi Transition */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeTithiEvent
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeTithiEvent}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeTithiEvent: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-violet-400" />
                      {lang === "hi" ? "तिथि परिवर्तन काल" : "Tithi Transition"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {panchangaData.tithi?.[0]?.name || "Tithi"} समाप्ति समय
                    </span>
                  </div>
                </label>

                {/* 6. Sunrise & Sunset Swara Windows */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeSwaraSunrise
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeSwaraSunrise}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeSwaraSunrise: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-cyan-500" />
                      {lang === "hi"
                        ? "सूर्योदय व सूर्यास्त स्वर (१ घंटा काल)"
                        : "Sunrise & Sunset Swara"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {lang === "hi"
                        ? "प्राण नाड़ी (इड़ा/चन्द्र अथवा पिंगला/सूर्य) का शास्त्रीय निर्धारण"
                        : "Classical 1-hour solar & twilight breath dominances"}
                    </span>
                  </div>
                </label>

                {/* 7. Midday & Moon Swara Windows */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeSwaraCelestialWindows
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeSwaraCelestialWindows}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeSwaraCelestialWindows: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "hi"
                        ? "मध्याह्न, चन्द्रोदय व चन्द्रास्त स्वर"
                        : "Midday & Moon Swara Windows"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {lang === "hi"
                        ? "दोपहर, चन्द्रोदय व चन्द्रास्त के शास्त्रीय स्वर संधि काल"
                        : "Key celestial transition breath alignment periods"}
                    </span>
                  </div>
                </label>

                {/* 8. Tithi & Nakshatra Swara Transitions */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeSwaraTransitions
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeSwaraTransitions}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeSwaraTransitions: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      {lang === "hi"
                        ? "तिथि व नक्षत्र स्वर परिवर्तन काल"
                        : "Tithi & Nakshatra Swara Shifts"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {lang === "hi"
                        ? "तिथि व नक्षत्रों के आरंभ व समापन का ६०-मिनट स्वर काल"
                        : "60-min opening & closing nadi transitions"}
                    </span>
                  </div>
                </label>


                {/* 10. Vedic Horas & Hora Nadi (24 Horas with Planet, Nadi & Tattva) */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    options.includeVedicHoras !== false
                      ? isNight
                        ? "bg-indigo-950/40 border-amber-500/40 text-amber-200"
                        : "bg-amber-50/70 border-amber-300/80 text-amber-950 font-medium"
                      : isNight
                        ? "bg-slate-900/40 border-slate-800 text-slate-400"
                        : "bg-white border-stone-200 text-stone-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeVedicHoras !== false}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeVedicHoras: e.target.checked,
                      }))
                    }
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold block text-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "hi"
                        ? "२४ वैदिक होरा व होरा नाड़ी (ग्रह, नाड़ी व तत्त्व)"
                        : "24 Vedic Horas & Hora Nadi (Planet, Nadi & Tattva)"}
                    </span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      {lang === "hi"
                        ? "शीर्षक में ग्रह स्वामी, स्वर नाड़ी व तत्त्व; विवरण में प्रारंभ-समाप्ति समय व पंच तत्त्व काल"
                        : "Title with Planet, Nadi & Tattva; detail with exact start-end times & micro Tattvas"}
                    </span>
                  </div>
                </label>

                {/* 11. Notification reminder popup */}
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isNight
                      ? "bg-slate-900/40 border-slate-800 text-slate-300"
                      : "bg-white border-stone-200 text-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold block text-xs">
                        {lang === "hi" ? "कैलेंडर रिमाइंडर" : "Event Reminder"}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-slate-400">
                        {lang === "hi" ? "शुरू होने से पूर्व" : "Before start"}
                      </span>
                    </div>
                  </div>
                  <select
                    value={options.reminderMinutes}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        reminderMinutes: parseInt(e.target.value, 10),
                      }))
                    }
                    className="bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-xs rounded-lg px-2.5 py-1 font-semibold"
                  >
                    <option value={0}>
                      {lang === "hi" ? "सटीक समय पर (Exact Time / 0 min)" : "Exact time (0 min)"}
                    </option>
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
                {/* 12. Sync Duration Range Selector */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    isNight
                      ? "bg-slate-900/40 border-slate-800 text-slate-300"
                      : "bg-white border-stone-200 text-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-amber-500" />
                      {lang === "hi" ? "सिंक समयावधि (Sync Duration Range)" : "Sync Duration Range"}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Panchang Calendar
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSyncRangeDays(1)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        syncRangeDays === 1
                          ? "bg-amber-500 text-stone-950 border-amber-600 shadow-xs"
                          : isNight
                            ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {lang === "hi" ? "1 दिन (आज)" : "1 Day (Today)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncRangeDays(7)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        syncRangeDays === 7
                          ? "bg-amber-500 text-stone-950 border-amber-600 shadow-xs"
                          : isNight
                            ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {lang === "hi" ? "7 दिन (1 सप्ताह)" : "7 Days (1 Wk)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncRangeDays(30)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        syncRangeDays === 30
                          ? "bg-amber-500 text-stone-950 border-amber-600 shadow-xs"
                          : isNight
                            ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {lang === "hi" ? "30 दिन (1 माह निरंतर)" : "30 Days (Continuous)"}
                    </button>
                  </div>
                </div>

                {/* 13. Continuous Auto-Sync Toggle */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isNight
                      ? "bg-indigo-950/30 border-indigo-900/60 text-slate-200"
                      : "bg-amber-50/60 border-amber-200/80 text-amber-950"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "hi"
                        ? "निरंतर कनेक्टेड रखें (Auto Continuous Sync)"
                        : "Keep App in Touch (Auto Continuous Sync)"}
                    </span>
                    <span className="text-[10px] text-stone-600 dark:text-slate-400 block mt-0.5">
                      {lang === "hi"
                        ? "ऐप खोलने पर पंचमहीना कैलेंडर स्वतः अप-टू-डेट रहेगा ताकि एक भी इवेंट न छूटे।"
                        : "Auto-updates Panchang Calendar in background so no single event is ever missed."}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoContinuousSync}
                      onChange={(e) => toggleAutoContinuousSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Progress Feedback during Multi-Day Sync */}
              {syncProgress && (
                <div className="p-3.5 rounded-xl border border-amber-300/80 bg-amber-50 dark:bg-slate-900 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      {lang === "hi"
                        ? `Panchang Calendar सिंक हो रहा है (${syncProgress.current}/${syncProgress.total} दिन)...`
                        : `Syncing Panchang Calendar (Day ${syncProgress.current} of ${syncProgress.total})...`}
                    </span>
                    <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-amber-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${(syncProgress.current / syncProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Error / Success feedback */}
              {actionError && (
                <div className="p-3 rounded-xl border border-rose-300/80 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              {syncSuccessMsg && (
                <div className="p-3 rounded-xl border border-emerald-300/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{syncSuccessMsg}</span>
                  </div>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-950 dark:hover:text-white"
                  >
                    {lang === "hi" ? "Panchang Calendar खोलें" : "Open Panchang Calendar"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Primary Sync Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (user && token) {
                      handleSyncRange();
                    } else if (panchangaData) {
                      downloadPanchangaIcsFile(panchangaData, options);
                    }
                  }}
                  disabled={isSyncing}
                  className={`w-full sm:flex-1 py-3 px-5 rounded-2xl font-bold font-devanagari text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] ${
                    user && token
                      ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white shadow-amber-600/20"
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 shadow-amber-500/20"
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {lang === "hi"
                          ? `'Panchang Calendar' में सिंक हो रहा है...`
                          : "Syncing to 'Panchang Calendar'..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {user && token
                          ? lang === "hi"
                            ? `${syncRangeDays} दिनों के कार्यक्रम 'Panchang Calendar' में सिंक करें`
                            : `Sync ${syncRangeDays} Days of Events to 'Panchang Calendar'`
                          : lang === "hi"
                            ? "📥 बिना लॉगिन - पंचांग .ICS फाइल डाउनलोड करें"
                            : "📥 Instant 1-Click .ICS Calendar Export"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Synced Events List on Date */}
          {user && token && (
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-indigo-950/60">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-indigo-300 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                  {lang === "hi"
                    ? `सिंक किए गए कार्यक्रम (${syncedEvents.length})`
                    : `Active Synced Events (${syncedEvents.length})`}
                </h4>

                {syncedEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(true)}
                    disabled={isDeleting}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {lang === "hi" ? "सभी हटाएं" : "Remove All"}
                  </button>
                )}
              </div>

              {isLoadingEvents ? (
                <div className="py-6 text-center text-xs text-stone-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>{lang === "hi" ? "कार्यक्रम लोड हो रहे हैं..." : "Loading events..."}</span>
                </div>
              ) : syncedEvents.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 hide-scrollbar">
                  {syncedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isNight
                          ? "bg-slate-900/60 border-indigo-900/40 text-slate-200"
                          : "bg-white border-stone-200/90 text-stone-800 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold truncate block">{ev.summary}</span>
                          <span className="text-[10px] text-stone-500 dark:text-slate-400">
                            {ev.start.dateTime
                              ? (() => {
                                  try {
                                    const d = new Date(ev.start.dateTime);
                                    return isNaN(d.getTime())
                                      ? "All-Day"
                                      : d.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        });
                                  } catch {
                                    return "All-Day";
                                  }
                                })()
                              : "All-Day"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 dark:text-slate-400 hover:text-amber-500 transition-colors"
                            title="View in Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(ev.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-700 transition-colors"
                          title="Delete event from calendar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-stone-400 dark:text-slate-500">
                  {lang === "hi"
                    ? "आज के लिए Google Calendar में कोई सिंक किया गया कार्यक्रम नहीं है।"
                    : "No Mahavtaar Panchanga events synced for today yet."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div
          className={`px-6 py-3.5 border-t text-[11px] flex items-center justify-between ${
            isNight
              ? "bg-indigo-950/40 border-indigo-900/40 text-slate-400"
              : "bg-stone-50 border-amber-200/50 text-stone-500"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Google Calendar API v3 • Client-side OAuth
          </span>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400"
          >
            calendar.google.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ================= USER CONFIRMATION MODAL FOR DESTRUCTIVE ACTIONS (MANDATORY) ================= */}
      {(confirmDeleteId || confirmDeleteAll) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
              isNight
                ? "bg-slate-900 border-rose-900/60 text-slate-100"
                : "bg-white border-rose-200 text-stone-900"
            }`}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {confirmDeleteAll
                    ? lang === "hi"
                      ? "क्या आप सभी सिंक किए गए कार्यक्रम हटाना चाहते हैं?"
                      : "Remove All Synced Events?"
                    : lang === "hi"
                      ? "क्या आप इस कार्यक्रम को हटाना चाहते हैं?"
                      : "Remove Calendar Event?"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                  {confirmDeleteAll
                    ? lang === "hi"
                      ? `यह आज (${panchangaData?.date}) के सभी सिंक किए गए ${syncedEvents.length} कार्यक्रमों को आपके Google Calendar से स्थायी रूप से हटा देगा।`
                      : `This will permanently delete all ${syncedEvents.length} Panchanga events for ${panchangaData?.date} from your Google Calendar.`
                    : lang === "hi"
                      ? "यह कार्यक्रम आपके Google Calendar से हटा दिया जाएगा।"
                      : "This event will be deleted from your primary Google Calendar."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteId(null);
                  setConfirmDeleteAll(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              >
                {lang === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDeleteAll) executeDeleteAll();
                  else if (confirmDeleteId) executeDeleteSingle(confirmDeleteId);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {confirmDeleteAll
                  ? lang === "hi"
                    ? "हाँ, सभी हटाएं"
                    : "Delete All"
                  : lang === "hi"
                    ? "हटाएं"
                    : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
