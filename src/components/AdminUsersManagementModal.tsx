import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Plus,
  Save,
  Key,
  ExternalLink,
  Search,
  Check,
  UserPlus,
  Lock,
  Unlock,
  Calendar,
} from "lucide-react";
import { Language } from "../i18n";
import { AppTheme } from "../types";
import {
  AppUser,
  UserRole,
  AccountStatus,
  PermissionKey,
  PERMISSION_LABELS,
  getStoredUsersList,
  saveUsersList,
  syncUsersFromGoogleSheet,
  syncUsersToGoogleSheet,
  getConfiguredUsersSpreadsheetId,
  setConfiguredUsersSpreadsheetId,
  hashPassword,
} from "../services/userAuthService";
import { createUsersRegistrySpreadsheet } from "../services/googleSheetsService";
import { getAccessToken } from "../services/googleCalendarAuth";

interface AdminUsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: AppTheme;
  currentUser: AppUser | null;
  onUsersUpdated?: () => void;
}

export const AdminUsersManagementModal: React.FC<AdminUsersManagementModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
  currentUser,
  onUsersUpdated,
}) => {
  const isNight = theme === "nightSky";

  const [activeTab, setActiveTab] = useState<"users" | "addUser" | "sheetSetup">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [newStatus, setNewStatus] = useState<AccountStatus>("active");
  const [newPermissions, setNewPermissions] = useState<Record<PermissionKey, boolean>>({
    accessPanchanga: true,
    accessNakshatra: true,
    accessHora: true,
    accessSwaraYoga: false,
    accessMuhurta: true,
    accessAdvancedCalculations: false,
  });

  // Load current users and sheet id on modal open
  useEffect(() => {
    if (isOpen) {
      setUsers(getStoredUsersList());
      setSpreadsheetId(getConfiguredUsersSpreadsheetId() || "");
      setStatusMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sync users from Google Sheet
  const handleSyncFromSheet = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await syncUsersFromGoogleSheet(spreadsheetId || undefined);
      setUsers(res.users);
      if (onUsersUpdated) onUsersUpdated();
      setStatusMessage(
        lang === "hi"
          ? `Google Sheet से ${res.users.length} यूजर्स सफलतापूर्वक सिंक किए गए!`
          : `Synced ${res.users.length} users successfully from Google Sheet!`,
      );
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || "Failed to sync users from Google Sheet");
    } finally {
      setIsSyncing(false);
    }
  };

  // Save all modified users back to Google Sheet
  const handleSaveToSheet = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      saveUsersList(users);
      if (spreadsheetId) {
        setConfiguredUsersSpreadsheetId(spreadsheetId);
        await syncUsersToGoogleSheet(users, spreadsheetId);
        setStatusMessage(
          lang === "hi"
            ? "परिवर्तन सफलतापूर्वक Google Sheet में सहेजे गए!"
            : "User permissions successfully updated in Google Sheet!",
        );
      } else {
        setStatusMessage(
          lang === "hi"
            ? "अनुमतियाँ सहेजी गईं (Google Sheet ID कॉन्फ़िगर नहीं है)।"
            : "Permissions saved locally (Connect Google Sheet to sync remotely).",
        );
      }
      if (onUsersUpdated) onUsersUpdated();
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || "Failed to save users to Google Sheet");
    } finally {
      setIsSaving(false);
    }
  };

  // 1-Click creation of User Registry Sheet in Google Drive
  const handleCreateRegistrySheet = async () => {
    setIsCreatingSheet(true);
    setErrorMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Please connect your Google Account first using the Sheets button.");
      }
      const res = await createUsersRegistrySpreadsheet(token);
      setSpreadsheetId(res.spreadsheetId);
      setConfiguredUsersSpreadsheetId(res.spreadsheetId);
      await syncUsersToGoogleSheet(users, res.spreadsheetId);
      setStatusMessage(
        lang === "hi"
          ? `Google Sheet "${res.title}" सफलतापूर्वक निर्मित और कनेक्ट हो गई!`
          : `Created and linked Google Sheet "${res.title}"!`,
      );
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || "Failed to create User Registry Google Sheet");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Toggle user permission
  const handleTogglePermission = (userId: string, key: PermissionKey) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          return { ...u, [key]: !u[key] };
        }
        return u;
      }),
    );
  };

  // Update user role or status
  const handleUpdateRole = (userId: string, newRoleVal: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.userId === userId ? { ...u, role: newRoleVal } : u)));
  };

  const handleUpdateStatus = (userId: string, newStatusVal: AccountStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, accountStatus: newStatusVal } : u)),
    );
  };

  // Add new user
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorMessage("Username and password are required.");
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setErrorMessage("A user with this username already exists.");
      return;
    }

    const hashed = await hashPassword(newPassword.trim());
    const newUserObj: AppUser = {
      userId: `USR_${Math.floor(Math.random() * 9000 + 1000)}`,
      fullName: newFullName.trim() || newUsername.trim(),
      username: newUsername.trim().toLowerCase(),
      passwordHash: hashed,
      role: newRole,
      accountStatus: newStatus,
      accessPanchanga: newPermissions.accessPanchanga,
      accessNakshatra: newPermissions.accessNakshatra,
      accessHora: newPermissions.accessHora,
      accessSwaraYoga: newPermissions.accessSwaraYoga,
      accessMuhurta: newPermissions.accessMuhurta,
      accessAdvancedCalculations: newPermissions.accessAdvancedCalculations,
      validUntil: "2030-12-31",
      createdAt: new Date().toISOString(),
      failedLoginCount: 0,
    };

    const updatedList = [...users, newUserObj];
    setUsers(updatedList);
    saveUsersList(updatedList);

    if (spreadsheetId) {
      syncUsersToGoogleSheet(updatedList, spreadsheetId).catch((err) =>
        console.warn("Background sheet sync error:", err),
      );
    }

    // Reset form
    setNewUsername("");
    setNewFullName("");
    setNewPassword("");
    setActiveTab("users");
    setStatusMessage(
      lang === "hi"
        ? `नया यूजर "@${newUserObj.username}" सफलतापूर्वक जोड़ा गया!`
        : `New user "@${newUserObj.username}" created successfully!`,
    );
    if (onUsersUpdated) onUsersUpdated();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.role.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isNight
            ? "bg-[#0f172a] border-amber-900/60 text-slate-100"
            : "bg-[#fffdf9] border-amber-200/90 text-stone-900"
        }`}
      >
        {/* Header Strip */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isNight
              ? "bg-amber-950/40 border-amber-900/40"
              : "bg-gradient-to-r from-amber-100/90 to-amber-50 border-amber-200/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-devanagari">
                  {lang === "hi" ? "प्रशासक नियंत्रण (User Permissions)" : "Admin User Management"}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {lang === "hi" ? "एडमिन" : "Admin Only"}
                </span>
              </div>
              <p className={`text-xs ${isNight ? "text-amber-300/80" : "text-stone-600"}`}>
                {lang === "hi"
                  ? "गूगल शीट से जुड़े यूजर आईडी, पासवर्ड एवं मॉड्यूल अनुमतियों (RBAC) का नियंत्रण"
                  : "Control Google Sheet users, access flags (Panchanga, Kundli, Horas, Swara) & roles"}
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

        {/* Tab Navigation */}
        <div
          className={`flex items-center border-b px-6 gap-2 ${
            isNight ? "bg-slate-900/50 border-slate-800" : "bg-stone-50 border-stone-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "users"
                ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-slate-400"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === "hi" ? "यूजर व अनुमतियाँ" : "Users & Permissions"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 font-bold">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addUser")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "addUser"
                ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-slate-400"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === "hi" ? "नया यूजर जोड़ें" : "Add New User"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sheetSetup")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "sheetSetup"
                ? "border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:text-slate-400"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{lang === "hi" ? "Google Sheet लिंकेज" : "Google Sheet Link"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 hide-scrollbar">
          {/* Notifications */}
          {statusMessage && (
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: USERS & PERMISSIONS MATRIX */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={lang === "hi" ? "यूजर खोजें..." : "Filter by name or username..."}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncFromSheet}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{lang === "hi" ? "Sheet से सिंक" : "Sync from Sheet"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToSheet}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {isSaving
                        ? "सहेज रहे हैं..."
                        : lang === "hi"
                          ? "Sheet में सहेजें"
                          : "Save to Google Sheet"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Users & Permissions Table */}
              <div className="overflow-x-auto border rounded-2xl shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr
                      className={`border-b ${
                        isNight
                          ? "bg-slate-900/80 text-slate-300"
                          : "bg-stone-100 text-stone-700 font-bold"
                      }`}
                    >
                      <th className="p-3 whitespace-nowrap">User</th>
                      <th className="p-3 whitespace-nowrap">Role</th>
                      <th className="p-3 whitespace-nowrap">Status</th>
                      <th className="p-3 text-center whitespace-nowrap" title="Access_Panchanga">
                        Panchanga
                      </th>
                      <th className="p-3 text-center whitespace-nowrap" title="Access_Nakshatra">
                        Nakshatra
                      </th>
                      <th className="p-3 text-center whitespace-nowrap" title="Access_Hora">
                        Horas & Tattvas
                      </th>
                      <th className="p-3 text-center whitespace-nowrap" title="Access_Swara_Yoga">
                        Swara Yoga
                      </th>
                      <th className="p-3 text-center whitespace-nowrap" title="Access_Muhurta">
                        Muhurtas
                      </th>
                      <th
                        className="p-3 text-center whitespace-nowrap"
                        title="Access_Advanced_Calculations"
                      >
                        Janm Kundli
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-slate-800 font-sans">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.userId}
                        className={`transition-colors hover:bg-amber-500/5 ${
                          isNight ? "bg-slate-900/40" : "bg-white"
                        }`}
                      >
                        {/* User Identity */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.fullName.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="font-bold block text-stone-900 dark:text-white">
                                {u.fullName}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                @{u.username}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.userId, e.target.value as UserRole)}
                            className="px-2 py-1 text-xs rounded-lg border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>

                        {/* Status Selector */}
                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={u.accountStatus}
                            onChange={(e) =>
                              handleUpdateStatus(u.userId, e.target.value as AccountStatus)
                            }
                            className={`px-2 py-1 text-xs rounded-lg border font-semibold ${
                              u.accountStatus === "active"
                                ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                                : u.accountStatus === "suspended"
                                  ? "border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/40"
                                  : "border-stone-300 text-stone-600 bg-stone-50 dark:bg-slate-900"
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>

                        {/* Feature Toggles (Admin can click to grant/revoke) */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={u.role === "admin" || u.accessPanchanga}
                            disabled={u.role === "admin"}
                            onChange={() => handleTogglePermission(u.userId, "accessPanchanga")}
                            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={u.role === "admin" || u.accessNakshatra}
                            disabled={u.role === "admin"}
                            onChange={() => handleTogglePermission(u.userId, "accessNakshatra")}
                            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={u.role === "admin" || u.accessHora}
                            disabled={u.role === "admin"}
                            onChange={() => handleTogglePermission(u.userId, "accessHora")}
                            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={u.role === "admin" || u.accessSwaraYoga}
                            disabled={u.role === "admin"}
                            onChange={() => handleTogglePermission(u.userId, "accessSwaraYoga")}
                            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={u.role === "admin" || u.accessMuhurta}
                            disabled={u.role === "admin"}
                            onChange={() => handleTogglePermission(u.userId, "accessMuhurta")}
                            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={u.role === "admin" || u.accessAdvancedCalculations}
                            disabled={u.role === "admin"}
                            onChange={() =>
                              handleTogglePermission(u.userId, "accessAdvancedCalculations")
                            }
                            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW USER */}
          {activeTab === "addUser" && (
            <form onSubmit={handleCreateNewUser} className="space-y-4 max-w-xl mx-auto py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    {lang === "hi" ? "यूजरनेम (Username)" : "Username *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. sharma_jyotishi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    {lang === "hi" ? "पूरा नाम (Full Name)" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Pt. Ramesh Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    {lang === "hi" ? "पासवर्ड (Password) *" : "Password *"}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    {lang === "hi" ? "भूमिका (Role)" : "Role"}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="user">User (साधक / ज्योतिषी)</option>
                    <option value="viewer">Viewer (दर्शक)</option>
                    <option value="admin">Admin (प्रशासक)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                    {lang === "hi" ? "खाता स्थिति (Status)" : "Account Status"}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="active">Active (सक्रिय)</option>
                    <option value="inactive">Inactive (निष्क्रिय)</option>
                    <option value="suspended">Suspended (निलंबित)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checklist for New User */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-2">
                  {lang === "hi" ? "मॉड्यूल अनुमतियाँ (Access Rights):" : "Feature Permissions:"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(Object.keys(PERMISSION_LABELS) as PermissionKey[]).map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newPermissions[key]}
                        onChange={(e) =>
                          setNewPermissions((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold">
                        {lang === "hi" ? PERMISSION_LABELS[key].hi : PERMISSION_LABELS[key].en}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === "hi" ? "यूजर बनाएं" : "Create User"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GOOGLE SHEET LINKAGE & SETUP */}
          {activeTab === "sheetSetup" && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div
                className={`p-4 rounded-2xl border ${
                  isNight ? "bg-slate-900/60 border-slate-800" : "bg-white border-stone-200"
                }`}
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{lang === "hi" ? "Google Sheet लिंकेज" : "Link Google Spreadsheet"}</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-slate-400 mb-3">
                  {lang === "hi"
                    ? "उपयोगकर्ता सूची जिस Google Sheet में सेव है, उसकी ID दर्ज करें। 'Users' टैब में सभी कॉलम (docs/authentication विनिर्देश) स्वचालित रूप से अपडेट होंगे।"
                    : "Enter the Google Spreadsheet ID storing your user registry. The 'Users' tab will sync credentials, status and access permissions."}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={spreadsheetId}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                        setSpreadsheetId(match ? match[1] : val);
                      }}
                      placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 font-mono"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setConfiguredUsersSpreadsheetId(spreadsheetId);
                        handleSyncFromSheet();
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                    >
                      {lang === "hi" ? "लिंक करें व लोड करें" : "Link & Load"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateRegistrySheet}
                      disabled={isCreatingSheet}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      {isCreatingSheet ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {lang === "hi"
                          ? "Drive में नई User Sheet बनाएं"
                          : "Create New User Registry Sheet in Drive"}
                      </span>
                    </button>

                    {spreadsheetId && (
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === "hi" ? "Google Sheet खोलें" : "Open Google Sheet"}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
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
          <span className="font-mono text-[11px]">
            Admin Session: @{currentUser?.username || "admin"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
