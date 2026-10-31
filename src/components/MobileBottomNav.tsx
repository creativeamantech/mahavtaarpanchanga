import React, { useState } from "react";
import {
  MapPin,
  CalendarDays,
  CalendarSync,
  Menu,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import type { ActiveView } from "./Header";
import type { AppTheme } from "../types";
import { type Language } from "../i18n";
import type { AppUser } from "../services/userAuthService";

interface MobileBottomNavProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onOpenLocation: () => void;
  onOpenCalendarSync: () => void;
  onOpenSettings: () => void;
  onOpenMenu: () => void;
  currentUser?: AppUser | null;
  onLogout?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenAuth?: () => void;
  lang: Language;
  theme: AppTheme;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onViewChange,
  onOpenLocation,
  onOpenCalendarSync,
  onOpenSettings,
  onOpenMenu,
  currentUser,
  onLogout,
  onOpenAdminUsers,
  onOpenAuth,
  lang,
  theme,
}) => {
  const isNight = theme === "nightSky";
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  const handleAccountClick = () => {
    if (currentUser) {
      setShowAccountSheet(true);
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  const navItems = [
    {
      id: "location",
      label: lang === "hi" ? "लोकेशन" : "Location",
      icon: MapPin,
      onClick: onOpenLocation,
      isActive: false,
    },
    {
      id: "sync",
      label: lang === "hi" ? "सिंक" : "Sync",
      icon: CalendarSync,
      onClick: onOpenCalendarSync,
      isActive: false,
    },
    {
      id: "menu",
      label: lang === "hi" ? "मेन्यू" : "Menu",
      icon: Menu,
      onClick: onOpenMenu,
      isActive: false,
      highlight: true,
    },
    {
      id: "settings",
      label: lang === "hi" ? "सेटिंग्स" : "Settings",
      icon: Settings,
      onClick: onOpenSettings,
      isActive: false,
    },
    {
      id: "account",
      label: currentUser
        ? currentUser.role === "admin"
          ? lang === "hi"
            ? "एडमिन"
            : "Admin"
          : lang === "hi"
            ? "खाता"
            : "Account"
        : lang === "hi"
          ? "लॉगिन"
          : "Sign In",
      icon: currentUser?.role === "admin" ? ShieldCheck : User,
      onClick: handleAccountClick,
      isActive: showAccountSheet,
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className={`fixed bottom-0 inset-x-0 z-40 lg:hidden border-t backdrop-blur-xl transition-colors duration-200 ${
          isNight
            ? "bg-[#0b0f19]/95 border-indigo-900/50 text-slate-300 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
            : "bg-[#ffffff]/95 border-amber-200/80 text-stone-700 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]"
        }`}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto items-stretch px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center gap-0.5 transition-all relative py-1 px-0.5 select-none touch-target-min cursor-pointer ${
                  item.isActive
                    ? isNight
                      ? "text-amber-300 font-bold"
                      : "text-amber-800 font-extrabold"
                    : isNight
                      ? "text-slate-400 hover:text-slate-200 active:text-amber-300"
                      : "text-stone-600 hover:text-stone-900 active:text-amber-800"
                }`}
              >
                {item.isActive && (
                  <span
                    className={`absolute top-0 inset-x-2 h-0.5 rounded-full ${
                      isNight ? "bg-amber-400" : "bg-amber-600"
                    }`}
                  />
                )}
                <div
                  className={`p-1 rounded-xl transition-all ${
                    item.highlight
                      ? isNight
                        ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                        : "bg-amber-100 text-amber-800 ring-1 ring-amber-400/60"
                      : item.isActive
                        ? isNight
                          ? "bg-indigo-900/50 text-amber-300 scale-105"
                          : "bg-amber-100 text-amber-800 scale-105"
                        : "bg-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight tracking-tight font-devanagari truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Account Bottom Sheet Modal */}
      {showAccountSheet && currentUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAccountSheet(false)}
          />

          <div
            className={`relative w-full rounded-t-3xl border-t shadow-2xl p-5 ${
              isNight
                ? "bg-[#0d1424] border-indigo-900/60 text-slate-100"
                : "bg-white border-amber-300/80 text-stone-900"
            }`}
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)" }}
          >
            <div className="flex justify-between items-center pb-3 border-b border-inherit/40">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isNight
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {currentUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{currentUser.fullName}</h3>
                  <p
                    className={`text-xs ${
                      isNight ? "text-slate-400" : "text-stone-500"
                    }`}
                  >
                    @{currentUser.username} •{" "}
                    <span className="uppercase font-semibold text-[10px] text-amber-500">
                      {currentUser.role}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountSheet(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="pt-4 space-y-2.5">
              {/* Admin Button (if admin) */}
              {currentUser.role === "admin" && onOpenAdminUsers && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountSheet(false);
                    onOpenAdminUsers();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                    isNight
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20"
                      : "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100/70"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold">
                        {lang === "hi" ? "यूजर एवं एक्सेस प्रबंधन" : "User & Access Management"}
                      </div>
                      <div className="text-[10px] opacity-80">
                        {lang === "hi" ? "गूगल शीट्स आधारित RBAC" : "Google Sheets RBAC"}
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Sign Out Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountSheet(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-600 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{lang === "hi" ? "साइन आउट / लॉगआउट करें" : "Sign Out"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
