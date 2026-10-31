import React from "react";
import { ShieldAlert, Lock, Home, ArrowLeft, User, KeyRound } from "lucide-react";
import { Language } from "../i18n";
import { AppTheme } from "../types";
import { AppUser, PermissionKey, PERMISSION_LABELS } from "../services/userAuthService";

interface AccessDeniedCardProps {
  user: AppUser | null;
  requiredPermission: PermissionKey;
  onReturnHome: () => void;
  lang: Language;
  theme: AppTheme;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  user,
  requiredPermission,
  onReturnHome,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";
  const permInfo = PERMISSION_LABELS[requiredPermission] || {
    en: "Restricted Feature",
    hi: "प्रतिबंधित सुविधा",
    descEn: "Special permission required",
    descHi: "विशेष अनुमति आवश्यक",
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div
        className={`rounded-3xl border p-8 sm:p-10 text-center shadow-xl relative overflow-hidden ${
          isNight
            ? "bg-[#111827]/90 border-rose-900/40 text-slate-100"
            : "bg-white border-rose-200 text-stone-900 shadow-rose-900/5"
        }`}
      >
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 mb-4 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 mb-2">
            {lang === "hi" ? "पहुंच प्रतिबंधित" : "Access Restricted"}
          </span>

          <h2 className="text-xl sm:text-2xl font-black font-devanagari tracking-tight text-stone-900 dark:text-white">
            {lang === "hi"
              ? "इस विधा हेतु एडमिन अनुमति आवश्यक है"
              : "Permission Required for this Feature"}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 mt-2 max-w-md leading-relaxed font-sans">
            {lang === "hi"
              ? `आपके खाते में "${permInfo.hi}" (${requiredPermission}) का एक्सेस सक्रिय नहीं है। इस सुविधा का अधिकार Google Sheet में प्रशासक (Admin) द्वारा निर्धारित किया जाता है।`
              : `Your account does not currently have permission for "${permInfo.en}" (${requiredPermission}). Access to this section is configured by the Administrator in the user directory.`}
          </p>

          {/* User Status Pill */}
          {user && (
            <div
              className={`mt-6 p-4 rounded-2xl border w-full max-w-sm text-left flex items-center justify-between gap-3 text-xs ${
                isNight ? "bg-slate-900/80 border-slate-800" : "bg-stone-50 border-stone-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.fullName.charAt(0) || "U"}
                </div>
                <div>
                  <span className="font-bold block text-stone-900 dark:text-white">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">@{user.username}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
                  {user.role}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">ID: {user.userId}</span>
              </div>
            </div>
          )}

          {/* Return Home Button */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>{lang === "hi" ? "मुख्य पृष्ठ पर लौटें" : "Return to Home Hub"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
