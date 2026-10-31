import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { type Language } from "../i18n";
import type { AppTheme } from "../types";
import { authenticateCredentials, AppUser } from "../services/userAuthService";

interface LoginPortalViewProps {
  onLoginSuccess: (user: AppUser) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  onLoginSuccess,
  lang,
  onLangChange,
  theme,
  onToggleTheme,
}) => {
  const isNight = theme === "nightSky";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authenticateCredentials(username, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(
          result.error ||
            (lang === "hi" ? "यूजरनेम या पासवर्ड अमान्य है।" : "Invalid username or password."),
        );
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || "Authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${
        isNight
          ? "bg-[#0b0f19] text-slate-100"
          : "bg-gradient-to-br from-[#fcfbf7] via-[#f7f3ea] to-[#f4eee1] text-stone-900"
      }`}
    >
      {/* Background Decorative Cosmic Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Utility Bar (Language & Theme Switcher) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          type="button"
          onClick={() => onLangChange(lang === "hi" ? "en" : "hi")}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isNight
              ? "bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800"
              : "bg-white/80 border-stone-300 text-stone-800 hover:bg-stone-100"
          }`}
        >
          {lang === "hi" ? "English" : "हिन्दी"}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border text-xs transition-all ${
            isNight
              ? "bg-slate-900/80 border-slate-700 text-amber-300 hover:bg-slate-800"
              : "bg-white/80 border-stone-300 text-amber-700 hover:bg-stone-100"
          }`}
          title={isNight ? "Switch to Parchment" : "Switch to Night Sky"}
        >
          {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-7 sm:p-9 relative z-10 backdrop-blur-md transition-all ${
          isNight
            ? "bg-[#111827]/90 border-indigo-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            : "bg-white/95 border-amber-200/90 shadow-[0_20px_50px_rgba(212,104,10,0.12)]"
        }`}
      >
        {/* Emblem & Branding Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 shadow-lg shadow-amber-500/25 ring-4 ring-amber-400/20">
              <span className="text-3xl font-serif">ॐ</span>
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-2xl font-black font-serif-vedic tracking-tight text-stone-900 dark:text-white">
            {lang === "hi" ? "महावतार पञ्चाङ्ग" : "Mahavtaar Panchanga"}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mt-1.5">
            <ShieldCheck className="w-3 h-3" />
            <span>
              {lang === "hi" ? "Google Sheet प्रमाणीकृत पोर्टल" : "Google Sheets Protected Portal"}
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-slate-400 mt-2 max-w-xs">
            {lang === "hi"
              ? "कृपया अपने अधिकृत यूजरनेम और पासवर्ड से लॉगिन करें। अनुमतियाँ Google Sheet में एडमिन द्वारा नियंत्रित हैं।"
              : "Sign in with your authorized credentials. Feature permissions are managed in Google Sheets by the administrator."}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1.5 font-sans">
              {lang === "hi" ? "यूजरनेम (Username)" : "Username"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  lang === "hi" ? "अपना यूजरनेम दर्ज करें" : "Enter username (e.g. admin)"
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-900 text-stone-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1.5 font-sans">
              {lang === "hi" ? "पासवर्ड (Password)" : "Password"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-900 text-stone-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold text-xs tracking-wide shadow-md shadow-amber-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <span>{lang === "hi" ? "सुरक्षित लॉगिन करें" : "Sign In to Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Box */}
        <div
          className={`mt-6 pt-5 border-t ${
            isNight ? "border-slate-800 text-slate-300" : "border-stone-200 text-stone-600"
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              {lang === "hi"
                ? "परीक्षण लॉगिन क्रेडेंशियल्स:"
                : "Test Accounts (From Google Sheet):"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleFillDemo("admin", "admin123")}
              className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                username === "admin"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                  : isNight
                    ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                    : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
              }`}
            >
              <span className="font-bold block text-xs">Admin</span>
              <span className="text-[9px] opacity-75">admin / admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo("jyotishi", "user123")}
              className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                username === "jyotishi"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                  : isNight
                    ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                    : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
              }`}
            >
              <span className="font-bold block text-xs">User</span>
              <span className="text-[9px] opacity-75">jyotishi / user123</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo("viewer", "viewer123")}
              className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                username === "viewer"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                  : isNight
                    ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                    : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
              }`}
            >
              <span className="font-bold block text-xs">Viewer</span>
              <span className="text-[9px] opacity-75">viewer / viewer123</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-6 text-center text-xs text-stone-400 dark:text-slate-500">
        <p>Mahavtaar Panchanga • Drik Ganita Astronomy & Classical Shiva Swarodaya</p>
      </footer>
    </div>
  );
};
