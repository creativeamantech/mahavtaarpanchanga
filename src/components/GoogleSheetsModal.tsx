import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  LogOut,
  X,
  PlusCircle,
  Table,
  Calendar,
  Users,
  Sun,
  Moon,
  Sparkles,
  Search,
  Check,
  Copy,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
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
  listUserSpreadsheets,
  getSpreadsheetDetails,
  getSpreadsheetValues,
  createPanchangaSpreadsheet,
  createMonthlyPanchangaSpreadsheet,
  createUsersRegistrySpreadsheet,
  appendDailyPanchangaRow,
  DriveSpreadsheetFile,
  SpreadsheetDetails,
} from "../services/googleSheetsService";
import { PanchangaResponse, AppTheme } from "../types";
import { Language } from "../i18n";

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchangaData: PanchangaResponse | null;
  lang: Language;
  theme: AppTheme;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
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

  // Active Tab: 'export' | 'browse' | 'inspect'
  const [activeTab, setActiveTab] = useState<"export" | "browse" | "inspect">("export");

  // Export Daily Panchanga Options
  const [includeHoras, setIncludeHoras] = useState(true);
  const [includePlanets, setIncludePlanets] = useState(true);
  const [includeChoghadiya, setIncludeChoghadiya] = useState(true);
  const [customSheetTitle, setCustomSheetTitle] = useState("");

  // Operation States
  const [isCreatingDaily, setIsCreatingDaily] = useState(false);
  const [isCreatingMonthly, setIsCreatingMonthly] = useState(false);
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);
  const [lastCreatedTitle, setLastCreatedTitle] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Browse Sheets State
  const [driveSheets, setDriveSheets] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Inspect / Append State
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>("");
  const [customSpreadsheetIdInput, setCustomSpreadsheetIdInput] = useState<string>("");
  const [sheetDetails, setSheetDetails] = useState<SpreadsheetDetails | null>(null);
  const [selectedSheetTab, setSelectedSheetTab] = useState<string>("");
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [isAppending, setIsAppending] = useState(false);

  // Mandatory Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    onConfirm: async () => {},
  });

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setToken(null);
      },
    );

    getAccessToken().then((t) => {
      if (t) setToken(t);
      const curr = getCurrentUser();
      if (curr) setUser(curr);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Fetch Drive Sheets when tab is 'browse'
  const loadDriveSheets = React.useCallback(
    async (authToken?: string) => {
      const activeToken = authToken || token;
      if (!activeToken) return;
      setIsLoadingSheets(true);
      setActionError(null);
      try {
        const files = await listUserSpreadsheets(activeToken);
        setDriveSheets(files);
      } catch (err: unknown) {
        console.warn("Could not list Google Drive sheets:", err);
        setActionError((err as Error)?.message || "Failed to load Google Sheets list");
      } finally {
        setIsLoadingSheets(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (isOpen && token && activeTab === "browse") {
      loadDriveSheets(token);
    }
  }, [isOpen, token, activeTab, loadDriveSheets]);

  if (!isOpen) return null;

  // Google Login handlers
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    setActionError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        if (activeTab === "browse") {
          loadDriveSheets(res.accessToken);
        }
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setAuthError((err as Error)?.message || "Google Sheets connection failed.");
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
        if (activeTab === "browse") {
          loadDriveSheets(res.accessToken);
        }
      }
    } catch (err: unknown) {
      console.error("Direct GIS Login failed:", err);
      setAuthError((err as Error)?.message || "Google Sheets connection failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogleCalendar();
      setUser(null);
      setToken(null);
      setDriveSheets([]);
      setSheetDetails(null);
      setSheetRows([]);
    } catch (err: unknown) {
      console.error("Logout error:", err);
    }
  };

  // 1. Export Daily Panchanga to Google Sheets (with User Confirmation)
  const triggerCreateDaily = () => {
    if (!token || !panchangaData) return;

    const titleToUse =
      customSheetTitle.trim() ||
      `Mahavtaar Panchanga - ${panchangaData.city || "Almanac"} - ${panchangaData.date}`;

    setConfirmDialog({
      isOpen: true,
      title:
        lang === "hi" ? "गूगल स्प्रेडशीट निर्माण की पुष्टि" : "Confirm Google Spreadsheet Creation",
      description:
        lang === "hi"
          ? `क्या आप अपने Google Drive में "${titleToUse}" नाम से नई Google Spreadsheet बनाना चाहते हैं? इसमें पंचांग सारांश, ${includeHoras ? "24 होरा, " : ""}${includePlanets ? "ग्रह स्थिति, " : ""}${includeChoghadiya ? "चौघड़िया" : ""} सम्मिलित होंगे।`
          : `Create a new Google Spreadsheet "${titleToUse}" in your Google Drive? It will include tabs for Panchanga Overview, ${includeHoras ? "24 Horas & Tattvas, " : ""}${includePlanets ? "Planetary Positions, " : ""}${includeChoghadiya ? "Choghadiya Muhurtas" : ""}.`,
      confirmText: lang === "hi" ? "स्प्रेडशीट बनाएं" : "Create Spreadsheet",
      onConfirm: async () => {
        setIsCreatingDaily(true);
        setActionError(null);
        setActionSuccess(null);
        try {
          const res = await createPanchangaSpreadsheet(token, panchangaData, {
            includeHoras,
            includePlanets,
            includeChoghadiya,
            customTitle: titleToUse,
          });
          setLastCreatedUrl(res.spreadsheetUrl);
          setLastCreatedTitle(res.title);
          setActionSuccess(
            lang === "hi"
              ? `गूगल स्प्रेडशीट सफलतापूर्वक निर्मित: "${res.title}"`
              : `Successfully created Google Spreadsheet: "${res.title}"`,
          );
        } catch (err: unknown) {
          console.error("Failed to create spreadsheet:", err);
          setActionError((err as Error)?.message || "Failed to create Google Spreadsheet");
        } finally {
          setIsCreatingDaily(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 2. Export Monthly Almanac to Google Sheets (with User Confirmation)
  const triggerCreateMonthly = () => {
    if (!token || !panchangaData) return;

    setConfirmDialog({
      isOpen: true,
      title:
        lang === "hi" ? "मासिक पंचांग स्प्रेडशीट निर्माण" : "Create Monthly Almanac Spreadsheet",
      description:
        lang === "hi"
          ? `क्या आप वर्तमान माह के सम्पूर्ण 30-दिवसीय पंचांग, तिथियों, नक्षत्रों, योगों व पर्वों की Google Sheet बनाना चाहते हैं?`
          : `Generate a full monthly almanac spreadsheet for ${panchangaData.city} in your Google Drive with day-by-day Tithis, Nakshatras, Yogas, and Auspicious timings?`,
      confirmText: lang === "hi" ? "मासिक शीट बनाएं" : "Generate Monthly Sheet",
      onConfirm: async () => {
        setIsCreatingMonthly(true);
        setActionError(null);
        setActionSuccess(null);
        try {
          // Fetch month data
          const [d, m, y] = panchangaData.date.split("/").map(Number);
          const monthRes = await fetch(
            `/api/panchanga/month?city=${encodeURIComponent(panchangaData.city || "Bengaluru, IN")}&year=${y}&month=${m}`,
          );
          if (!monthRes.ok) throw new Error("Failed to fetch monthly data");
          const monthDays = await monthRes.json();

          const monthName = new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long" });
          const res = await createMonthlyPanchangaSpreadsheet(
            token,
            monthDays,
            monthName,
            y,
            panchangaData.city || "India",
          );

          setLastCreatedUrl(res.spreadsheetUrl);
          setLastCreatedTitle(res.title);
          setActionSuccess(
            lang === "hi"
              ? `मासिक पंचांग स्प्रेडशीट सफलतापूर्वक निर्मित!`
              : `Monthly Almanac Spreadsheet successfully created!`,
          );
        } catch (err: unknown) {
          console.error("Monthly sheet error:", err);
          setActionError((err as Error)?.message || "Failed to create Monthly Sheet");
        } finally {
          setIsCreatingMonthly(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 3. Setup User Registry Sheet (with User Confirmation)
  const triggerCreateUsersRegistry = () => {
    if (!token) return;

    setConfirmDialog({
      isOpen: true,
      title:
        lang === "hi"
          ? "यूजर एक्सेस रजिस्ट्री शीट निर्माण"
          : "Setup User Access Directory Spreadsheet",
      description:
        lang === "hi"
          ? `क्या आप 'Mahavtaar Panchanga — User Access' नाम से Google Sheet बनाना चाहते हैं? इसमें Role-Based Permissions, Feature Flags और Account Status कॉलम कॉन्फ़िगर होंगे।`
          : `Create the official "Mahavtaar Panchanga — User Access" Google Spreadsheet in your Google Drive matching the documentation schema with pre-configured access control columns and initial template records?`,
      confirmText: lang === "hi" ? "रजिस्ट्री शीट बनाएं" : "Create User Registry Sheet",
      onConfirm: async () => {
        setIsCreatingUsers(true);
        setActionError(null);
        setActionSuccess(null);
        try {
          const res = await createUsersRegistrySpreadsheet(token);
          setLastCreatedUrl(res.spreadsheetUrl);
          setLastCreatedTitle(res.title);
          setActionSuccess(
            lang === "hi"
              ? `यूजर एक्सेस रजिस्ट्री शीट निर्मित: "${res.title}"`
              : `User Access Registry Spreadsheet created: "${res.title}"`,
          );
        } catch (err: unknown) {
          console.error("Users registry error:", err);
          setActionError((err as Error)?.message || "Failed to create user registry sheet");
        } finally {
          setIsCreatingUsers(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Inspect specific spreadsheet
  const handleInspectSpreadsheet = async (id: string) => {
    if (!token || !id) return;
    setIsLoadingRows(true);
    setSelectedSpreadsheetId(id);
    setActionError(null);
    try {
      const details = await getSpreadsheetDetails(token, id);
      setSheetDetails(details);
      const firstTab = details.sheets[0]?.title || "Sheet1";
      setSelectedSheetTab(firstTab);

      const rows = await getSpreadsheetValues(token, id, `'${firstTab}'!A1:Z50`);
      setSheetRows(rows);
      setActiveTab("inspect");
    } catch (err: unknown) {
      setActionError((err as Error)?.message || "Failed to load spreadsheet details");
    } finally {
      setIsLoadingRows(false);
    }
  };

  // Change tab inside inspected sheet
  const handleSelectTab = async (tabName: string) => {
    if (!token || !selectedSpreadsheetId) return;
    setSelectedSheetTab(tabName);
    setIsLoadingRows(true);
    try {
      const rows = await getSpreadsheetValues(token, selectedSpreadsheetId, `'${tabName}'!A1:Z50`);
      setSheetRows(rows);
    } catch (err: unknown) {
      setActionError((err as Error)?.message || "Failed to read tab values");
    } finally {
      setIsLoadingRows(false);
    }
  };

  // Append Today's Panchanga to inspected sheet (with User Confirmation)
  const triggerAppendRow = () => {
    if (!token || !selectedSpreadsheetId || !panchangaData || !selectedSheetTab) return;

    setConfirmDialog({
      isOpen: true,
      title: lang === "hi" ? "डेटा जोड़ने की पुष्टि" : "Confirm Append Row to Google Sheet",
      description:
        lang === "hi"
          ? `क्या आप चयनित शीट "${selectedSheetTab}" के अंत में आज (${panchangaData.date}) का दैनिक पंचांग रिकॉर्ड जोड़ना चाहते हैं?`
          : `Append today's (${panchangaData.date}) Panchanga record as a new row to the "${selectedSheetTab}" tab in this Google Spreadsheet?`,
      confirmText: lang === "hi" ? "पंक्ति जोड़ें" : "Append Row",
      onConfirm: async () => {
        setIsAppending(true);
        setActionError(null);
        try {
          const res = await appendDailyPanchangaRow(
            token,
            selectedSpreadsheetId,
            selectedSheetTab,
            panchangaData,
          );
          setActionSuccess(
            lang === "hi"
              ? `दैनिक पंचांग पंक्ति सफलतापूर्वक जोड़ी गई (${res.updatedRange})`
              : `Panchanga row successfully appended (${res.updatedRange})`,
          );
          // Reload tab values
          handleSelectTab(selectedSheetTab);
        } catch (err: unknown) {
          setActionError((err as Error)?.message || "Failed to append row");
        } finally {
          setIsAppending(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredDriveSheets = driveSheets.filter((f) =>
    f.name.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isNight
            ? "bg-[#0f172a] border-emerald-900/60 text-slate-100"
            : "bg-[#fffdfa] border-emerald-200/80 text-stone-900"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isNight
              ? "bg-emerald-950/40 border-emerald-900/50"
              : "bg-gradient-to-r from-emerald-50 to-teal-50/60 border-emerald-200/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-devanagari">
                  {lang === "hi" ? "गूगल शीट्स एकीकरण" : "Google Sheets Integration"}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {lang === "hi" ? "लाइव सिंक" : "Live API v4"}
                </span>
              </div>
              <p className={`text-xs ${isNight ? "text-emerald-300/80" : "text-stone-600"}`}>
                {lang === "hi"
                  ? "पंचांग, होरा, ग्रह स्थिति एवं मासिक सारणी को सीधे Google Sheets में निर्यात व सिंक करें"
                  : "Export and sync Panchanga, Horas, Graha positions & Almanacs directly to Google Sheets"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isNight
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-stone-200 text-stone-500 hover:text-stone-900"
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex items-center border-b px-6 gap-2 ${
            isNight ? "bg-slate-900/50 border-slate-800" : "bg-stone-50 border-stone-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "export"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-slate-400"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === "hi" ? "स्प्रेडशीट निर्यात" : "Export & Create"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "browse"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-slate-400"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>{lang === "hi" ? "ड्राइव स्प्रेडशीट्स" : "Drive Sheets"}</span>
            {driveSheets.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                {driveSheets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inspect")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "inspect"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-slate-400"
            }`}
          >
            <Table className="w-4 h-4" />
            <span>{lang === "hi" ? "डेटा पूर्वावलोकन व सिंक" : "Viewer & Append"}</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 hide-scrollbar">
          {/* Section: Authentication Banner */}
          <div
            className={`p-4 rounded-2xl border ${
              isNight
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white border-stone-200/80 shadow-xs"
            }`}
          >
            {user && token ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Google User"}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500/40 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-sm">
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
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block truncate max-w-[260px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "browse") loadDriveSheets(token);
                      if (activeTab === "inspect" && selectedSpreadsheetId)
                        handleInspectSpreadsheet(selectedSpreadsheetId);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      isNight
                        ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700"
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {lang === "hi" ? "रिफ्रेश" : "Refresh"}
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
                  <h3 className="text-sm font-bold font-devanagari flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    {lang === "hi"
                      ? "Google Account से कनेक्ट करें"
                      : "Connect your Google Account"}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                    {lang === "hi"
                      ? "Google Sheets और Google Drive में पंचांग डेटा निर्यात करने हेतु अनुमति दें।"
                      : "Grant permission to create and manage spreadsheets in your Google Drive."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-white font-medium text-xs shadow-sm transition-all shrink-0 hover:shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
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
                  <span>Sign in with Google</span>
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
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === "hi" ? "डायरेक्ट Google Connect" : "Direct Google Connect"}
                </button>
              </div>
            )}
          </div>

          {/* Alert / Feedback Messages */}
          {actionError && (
            <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{actionSuccess}</span>
                </div>
              </div>

              {lastCreatedUrl && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={lastCreatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>
                      {lang === "hi" ? "Google Sheets में खोलें" : "Open in Google Sheets"}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(lastCreatedUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedLink
                        ? lang === "hi"
                          ? "कॉपी हो गया!"
                          : "Copied!"
                        : lang === "hi"
                          ? "लिंक कॉपी करें"
                          : "Copy Link"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: EXPORT & CREATE SPREADSHEETS */}
          {activeTab === "export" && (
            <div className="space-y-6">
              {/* Option 1: Daily Panchanga Master Spreadsheet */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isNight
                    ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/30"
                    : "bg-white border-stone-200 hover:border-emerald-400/50 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {lang === "hi" ? "मुख्य पंचांग" : "Master Sheet"}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 dark:text-slate-400">
                        {panchangaData?.date} • {panchangaData?.city}
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-devanagari mt-1 text-stone-900 dark:text-slate-100">
                      {lang === "hi"
                        ? "दैनिक पंचांग Google Spreadsheet बनाएं"
                        : "Create Daily Panchanga Spreadsheet"}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                      {lang === "hi"
                        ? "तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त, मुहूर्त, 24 होरा एवं ग्रह स्थिति युक्त बहु-टैब स्प्रेडशीट।"
                        : "Generates multi-tab formatted spreadsheet with Panchanga Overview, 24 Vedic Horas & Tattvas, Grahas, and Choghadiya."}
                    </p>
                  </div>
                </div>

                {/* Sub-sheet toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHoras}
                      onChange={(e) => setIncludeHoras(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold">
                      {lang === "hi" ? "24 वैदिक होरा व तत्व" : "24 Horas & Tattvas"}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePlanets}
                      onChange={(e) => setIncludePlanets(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold">
                      {lang === "hi" ? "ग्रह स्थिति (Grahas)" : "Planetary Positions"}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeChoghadiya}
                      onChange={(e) => setIncludeChoghadiya(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold">
                      {lang === "hi" ? "गौरी चौघड़िया" : "Choghadiya Muhurtas"}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <input
                    type="text"
                    value={customSheetTitle}
                    onChange={(e) => setCustomSheetTitle(e.target.value)}
                    placeholder={
                      lang === "hi"
                        ? "वैकल्पिक कस्टम शीर्षक (Default: Mahavtaar Panchanga - City - Date)"
                        : "Custom title (optional)"
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />

                  <button
                    type="button"
                    onClick={triggerCreateDaily}
                    disabled={!token || isCreatingDaily}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isCreatingDaily ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span>
                      {isCreatingDaily
                        ? lang === "hi"
                          ? "शीट बन रही है..."
                          : "Creating Sheet..."
                        : lang === "hi"
                          ? "📊 Google Sheet में एक्सपोर्ट करें"
                          : "📊 Export to Google Sheet"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Option 2: Monthly Almanac Spreadsheet */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isNight
                    ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/30"
                    : "bg-white border-stone-200 hover:border-emerald-400/50 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                        {lang === "hi" ? "मासिक पंचांग" : "Monthly Almanac"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-devanagari mt-1 text-stone-900 dark:text-slate-100">
                      {lang === "hi"
                        ? "सम्पूर्ण माह की 30-दिवसीय पंचांग शीट बनाएं"
                        : "Create Full Month Almanac Spreadsheet"}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                      {lang === "hi"
                        ? "महीने के प्रत्येक दिन की तिथि, नक्षत्र, योग, करण, सूर्योदय, सूर्यास्त व पर्व तालिका एक साथ एक शीट में।"
                        : "Generates an entire month row-by-row almanac table with Tithi, Nakshatras, Muhurtas, and Vratas."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={triggerCreateMonthly}
                    disabled={!token || isCreatingMonthly}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isCreatingMonthly ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    <span>
                      {isCreatingMonthly
                        ? lang === "hi"
                          ? "मासिक शीट बन रही है..."
                          : "Generating Monthly..."
                        : lang === "hi"
                          ? "📅 मासिक शीट बनाएं"
                          : "📅 Create Monthly Sheet"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Option 3: User Access Registry Spreadsheet (Docs spec template) */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isNight
                    ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/30"
                    : "bg-white border-stone-200 hover:border-emerald-400/50 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
                        {lang === "hi" ? "यूजर रजिस्ट्री" : "User Access Directory"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold font-devanagari mt-1 text-stone-900 dark:text-slate-100">
                      {lang === "hi"
                        ? "Mahavtaar Panchanga — User Access शीट तैयार करें"
                        : "Setup User Access Directory Sheet"}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5">
                      {lang === "hi"
                        ? "दस्तावेज़ विनिर्देश (docs/authentication) के अनुसार Users टैब, Role-Based Access एवं सुरक्षा कॉलम युक्त शीट बनाएं।"
                        : "Creates the official user directory sheet based on docs/authentication/Users-Sheet-Template.csv with RBAC flags."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={triggerCreateUsersRegistry}
                    disabled={!token || isCreatingUsers}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isCreatingUsers ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    <span>
                      {isCreatingUsers
                        ? lang === "hi"
                          ? "रजिस्ट्री तैयार हो रही है..."
                          : "Setting Up..."
                        : lang === "hi"
                          ? "👥 यूजर शीट बनाएं"
                          : "👥 Setup Users Sheet"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROWSE DRIVE SPREADSHEETS */}
          {activeTab === "browse" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={
                      lang === "hi"
                        ? "Google Drive में शीट्स खोजें..."
                        : "Search spreadsheets in your Google Drive..."
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => loadDriveSheets(token || undefined)}
                  disabled={isLoadingSheets || !token}
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheets ? "animate-spin" : ""}`} />
                  <span>{lang === "hi" ? "ताज़ा करें" : "Refresh"}</span>
                </button>
              </div>

              {isLoadingSheets ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-stone-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
                  <span className="text-xs">
                    {lang === "hi"
                      ? "Google Drive से स्प्रेडशीट्स लोड हो रही हैं..."
                      : "Loading spreadsheets from Google Drive..."}
                  </span>
                </div>
              ) : filteredDriveSheets.length === 0 ? (
                <div className="py-12 text-center text-stone-500 dark:text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">
                    {!token
                      ? lang === "hi"
                        ? "Google Sheets देखने हेतु ऊपर लॉगिन करें।"
                        : "Connect Google Account above to browse your spreadsheets."
                      : lang === "hi"
                        ? "कोई स्प्रेडशीट नहीं मिली।"
                        : "No spreadsheets found in your Google Drive."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDriveSheets.map((file) => (
                    <div
                      key={file.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isNight
                          ? "bg-slate-900/50 border-slate-800 hover:border-emerald-600/50"
                          : "bg-white border-stone-200 hover:border-emerald-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold truncate text-stone-900 dark:text-slate-100">
                            {file.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 dark:text-slate-400 block mt-0.5">
                            {file.modifiedTime
                              ? `Modified: ${new Date(file.modifiedTime).toLocaleDateString()}`
                              : `ID: ${file.id}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleInspectSpreadsheet(file.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-xs border border-stone-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                        >
                          <Table className="w-3.5 h-3.5" />
                          <span>{lang === "hi" ? "देखें / सिंक" : "Inspect / Append"}</span>
                        </button>

                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-stone-600 hover:text-emerald-600 dark:text-slate-400 transition-colors"
                          title="Open in Google Sheets"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHEET INSPECTOR & APPEND PANCHANGA */}
          {activeTab === "inspect" && (
            <div className="space-y-4">
              {/* Manual ID Input or Current Selection */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-2 ${
                  isNight ? "bg-slate-900/60 border-slate-800" : "bg-white border-stone-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    {lang === "hi"
                      ? "स्प्रेडशीट आईडी या लिंक"
                      : "Spreadsheet ID or Select from Drive"}
                  </label>
                  <input
                    type="text"
                    value={customSpreadsheetIdInput || selectedSpreadsheetId}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      // Extract ID if user pasted full URL
                      const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                      const id = match ? match[1] : val;
                      setCustomSpreadsheetIdInput(id);
                    }}
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleInspectSpreadsheet(customSpreadsheetIdInput || selectedSpreadsheetId)
                  }
                  disabled={!token || (!customSpreadsheetIdInput && !selectedSpreadsheetId)}
                  className="px-4 py-2 mt-4 sm:mt-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors self-end shrink-0"
                >
                  {isLoadingRows ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{lang === "hi" ? "डेटा लोड करें" : "Load Sheet"}</span>
                  )}
                </button>
              </div>

              {/* Inspected Sheet Header & Tabs */}
              {sheetDetails && (
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isNight ? "bg-slate-900/40 border-slate-800" : "bg-white border-stone-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-1.5 text-stone-900 dark:text-slate-100">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>{sheetDetails.title}</span>
                      </h4>
                      <span className="text-[10px] text-stone-500">
                        ID: {sheetDetails.spreadsheetId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={triggerAppendRow}
                        disabled={isAppending || !panchangaData}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        {isAppending ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <PlusCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {lang === "hi" ? "आज का पंचांग जोड़ें" : "Append Today's Record"}
                        </span>
                      </button>

                      <a
                        href={sheetDetails.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === "hi" ? "खोलें" : "Open"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Sheet Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {sheetDetails.sheets.map((s) => (
                      <button
                        key={s.sheetId}
                        type="button"
                        onClick={() => handleSelectTab(s.title)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                          selectedSheetTab === s.title
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200"
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>

                  {/* Matrix Preview Table */}
                  <div className="overflow-x-auto max-h-[300px] border rounded-xl">
                    {sheetRows.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-500">
                        {isLoadingRows
                          ? lang === "hi"
                            ? "डेटा लोड हो रहा है..."
                            : "Reading cell values..."
                          : lang === "hi"
                            ? "इस टैब में कोई डेटा उपलब्ध नहीं है।"
                            : "No data available in this sheet tab."}
                      </div>
                    ) : (
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-100 dark:bg-slate-800/80 sticky top-0 border-b">
                            {sheetRows[0]?.map((col, idx) => (
                              <th
                                key={idx}
                                className="px-3 py-2 font-bold text-stone-700 dark:text-slate-300 border-r last:border-r-0 whitespace-nowrap"
                              >
                                {col || `Col ${idx + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sheetRows.slice(1, 26).map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b last:border-b-0 hover:bg-stone-50 dark:hover:bg-slate-850 transition-colors"
                            >
                              {sheetRows[0]?.map((_, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="px-3 py-1.5 border-r last:border-r-0 text-stone-600 dark:text-slate-300 whitespace-nowrap"
                                >
                                  {row[cIdx] !== undefined ? String(row[cIdx]) : ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {sheetRows.length > 25 && (
                    <span className="text-[10px] text-stone-500 block text-right">
                      {lang === "hi"
                        ? `प्रथम 25 पंक्तियाँ प्रदर्शित (${sheetRows.length} कुल)`
                        : `Showing first 25 rows (${sheetRows.length} total rows in range)`}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-t text-xs ${
            isNight
              ? "bg-slate-900 border-slate-800 text-slate-400"
              : "bg-stone-50 border-stone-200 text-stone-500"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {lang === "hi"
                ? "सुरक्षित Google OAuth टोकन • इन-मेमोरी प्रमाणीकरण"
                : "Protected Google OAuth Client • In-Memory Auth"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog before Creating/Updating Sheets */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
              isNight
                ? "bg-slate-900 border-emerald-800 text-slate-100"
                : "bg-white border-emerald-300 text-stone-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-devanagari">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              >
                {lang === "hi" ? "रद्द करें" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
