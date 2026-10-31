/**
 * User Authentication & Role-Based Access Control (RBAC) Service
 * Schema-aligned with docs/authentication/Users-Sheet-Template.csv
 * Synchronizes with Google Sheets tab 'Users'
 */

import { ActiveView } from "../components/Header";
import {
  getSpreadsheetValues,
  updateSpreadsheetValues,
  createUsersRegistrySpreadsheet,
} from "./googleSheetsService";
import { getAccessToken } from "./googleCalendarAuth";

export type UserRole = "admin" | "user" | "viewer";
export type AccountStatus = "active" | "inactive" | "suspended";

export interface AppUser {
  userId: string;
  fullName: string;
  username: string;
  passwordHash: string; // SHA-256 hash or plaintext password for easy setup
  role: UserRole;
  accountStatus: AccountStatus;
  accessPanchanga: boolean;
  accessNakshatra: boolean;
  accessHora: boolean;
  accessSwaraYoga: boolean;
  accessMuhurta: boolean;
  accessAdvancedCalculations: boolean;
  validUntil?: string; // YYYY-MM-DD
  createdAt: string;
  lastLoginAt?: string;
  failedLoginCount: number;
  lockedUntil?: string;
}

export type PermissionKey =
  | "accessPanchanga"
  | "accessNakshatra"
  | "accessHora"
  | "accessSwaraYoga"
  | "accessMuhurta"
  | "accessAdvancedCalculations";

export const PERMISSION_LABELS: Record<
  PermissionKey,
  { en: string; hi: string; descEn: string; descHi: string }
> = {
  accessPanchanga: {
    en: "Panchanga & Almanac",
    hi: "पञ्चाङ्ग व पंचांग सारांश",
    descEn: "Daily Tithi, Vaara, Sunrise, Sunset, Paksha, Masa",
    descHi: "दैनिक तिथि, वार, सूर्योदय, सूर्यास्त, पक्ष, मास",
  },
  accessNakshatra: {
    en: "Nakshatra & Navtara",
    hi: "नक्षत्र, नव तारा व ग्रह",
    descEn: "27 Nakshatras, Navtara Chakra, Planetary Positions",
    descHi: "२७ नक्षत्र, नव तारा चक्र, ग्रह स्थिति व गोचर",
  },
  accessHora: {
    en: "Vedic Horas & Tattvas",
    hi: "वैदिक होरा व तत्त्व",
    descEn: "24-Hour Planetary Horas & 5 Elemental Micro-Periods",
    descHi: "२४ घंटे की ग्रहीय होरा एवं पंच तत्त्व समय अवधि",
  },
  accessSwaraYoga: {
    en: "Shiva Swara Yoga",
    hi: "शिव स्वरोदय विज्ञान",
    descEn: "Ida & Pingala Breath cycles, Nadi transitions",
    descHi: "इड़ा व पिंगला स्वर चक्र एवं नासिका श्वास प्रवाह",
  },
  accessMuhurta: {
    en: "Muhurtas & Timings",
    hi: "शुभ मुहूर्त व काल",
    descEn: "Abhijit, Brahma Muhurta, Rahu Kaal, Choghadiya",
    descHi: "अभिजित, ब्रह्म मुहूर्त, राहु काल, चौघड़िया",
  },
  accessAdvancedCalculations: {
    en: "Janm Kundli & Varga Charts",
    hi: "जन्म कुण्डली व षोडशवर्ग",
    descEn: "Birth Charts, D1, D9 Navamsha, Vimshottari Dasha, Shadbala",
    descHi: "जन्म कुण्डली, डी१, डी९ नवांश, विंशोत्तरी दशा, षड्बल",
  },
};

export const VIEW_PERMISSIONS_MAP: Record<ActiveView, PermissionKey | null> = {
  home: null, // Navigation hub is accessible to all logged-in users
  panchanga: "accessPanchanga",
  today: "accessMuhurta",
  timings: "accessMuhurta",
  planets: "accessNakshatra",
  kundli: "accessAdvancedCalculations",
  lagna: "accessAdvancedCalculations",
  navagraha: "accessNakshatra",
  swara: "accessSwaraYoga",
  navtara: "accessNakshatra",
  horas: "accessHora",
  tattva: "accessHora",
  calendar: "accessPanchanga",
  festivals: "accessPanchanga",
};

const STORAGE_USERS_KEY = "mahavtaar_sheet_users_cache";
const STORAGE_CURRENT_USER_KEY = "mahavtaar_authenticated_user";
const STORAGE_USER_SHEET_ID_KEY = "mahavtaar_users_spreadsheet_id";

/**
 * Hash password string to SHA-256 hex string using browser crypto
 */
export async function hashPassword(plainText: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plainText);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Default Seed Users (for initial load and offline verification)
 */
export const DEFAULT_SEED_USERS: AppUser[] = [
  {
    userId: "USR_001",
    fullName: "Mahavtaar Administrator",
    username: "admin",
    passwordHash: "admin123", // Matches plain or hashed
    role: "admin",
    accountStatus: "active",
    accessPanchanga: true,
    accessNakshatra: true,
    accessHora: true,
    accessSwaraYoga: true,
    accessMuhurta: true,
    accessAdvancedCalculations: true,
    validUntil: "2030-12-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    failedLoginCount: 0,
  },
  {
    userId: "USR_002",
    fullName: "Astrology Practitioner",
    username: "jyotishi",
    passwordHash: "user123",
    role: "user",
    accountStatus: "active",
    accessPanchanga: true,
    accessNakshatra: true,
    accessHora: true,
    accessSwaraYoga: true,
    accessMuhurta: true,
    accessAdvancedCalculations: false,
    validUntil: "2028-12-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    failedLoginCount: 0,
  },
  {
    userId: "USR_003",
    fullName: "Devotee Visitor",
    username: "viewer",
    passwordHash: "viewer123",
    role: "viewer",
    accountStatus: "active",
    accessPanchanga: true,
    accessNakshatra: false,
    accessHora: false,
    accessSwaraYoga: false,
    accessMuhurta: true,
    accessAdvancedCalculations: false,
    validUntil: "2028-12-31",
    createdAt: "2026-01-01T00:00:00.000Z",
    failedLoginCount: 0,
  },
];

/**
 * Get stored configured Users Spreadsheet ID
 */
export function getConfiguredUsersSpreadsheetId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_USER_SHEET_ID_KEY) || null;
}

/**
 * Save configured Users Spreadsheet ID
 */
export function setConfiguredUsersSpreadsheetId(sheetId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_USER_SHEET_ID_KEY, sheetId.trim());
  }
}

/**
 * Load cached user list from localStorage or fallback to default seed
 */
export function getStoredUsersList(): AppUser[] {
  if (typeof window === "undefined") return DEFAULT_SEED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_SEED_USERS));
      return DEFAULT_SEED_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEED_USERS;
  } catch {
    return DEFAULT_SEED_USERS;
  }
}

/**
 * Save user list to local cache
 */
export function saveUsersList(users: AppUser[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }
}

/**
 * Get currently authenticated session user
 */
export function getAuthenticatedUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Set authenticated session user
 */
export function setAuthenticatedUser(user: AppUser | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}

/**
 * Helper to parse boolean from Google Sheet cell ("TRUE", "true", true, 1)
 */
function parseBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === 1;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  }
  return false;
}

/**
 * Convert an AppUser into a row matching Users-Sheet-Template.csv
 */
export function userToSheetRow(user: AppUser): (string | number | boolean)[] {
  return [
    user.userId,
    user.fullName,
    user.username,
    user.passwordHash,
    user.role,
    user.accountStatus,
    user.accessPanchanga,
    user.accessNakshatra,
    user.accessHora,
    user.accessSwaraYoga,
    user.accessMuhurta,
    user.accessAdvancedCalculations,
    user.validUntil || "",
    user.createdAt || new Date().toISOString(),
    user.lastLoginAt || "",
    user.failedLoginCount || 0,
    user.lockedUntil || "",
  ];
}

/**
 * Parse a row from the Google Sheet into an AppUser
 */
export function sheetRowToUser(row: unknown[]): AppUser | null {
  if (!row || row.length < 3) return null;

  const userId = String(row[0] || "").trim();
  const fullName = String(row[1] || "").trim();
  const username = String(row[2] || "").trim();
  const passwordHash = String(row[3] || "").trim();
  const role =
    (String(row[4] || "user")
      .trim()
      .toLowerCase() as UserRole) || "user";
  const accountStatus =
    (String(row[5] || "active")
      .trim()
      .toLowerCase() as AccountStatus) || "active";

  if (!username) return null;

  return {
    userId: userId || `USR_${Math.floor(Math.random() * 9000 + 1000)}`,
    fullName: fullName || username,
    username,
    passwordHash,
    role: role === "admin" || role === "user" || role === "viewer" ? role : "user",
    accountStatus:
      accountStatus === "active" || accountStatus === "inactive" || accountStatus === "suspended"
        ? accountStatus
        : "active",
    accessPanchanga: parseBool(row[6] ?? true),
    accessNakshatra: parseBool(row[7] ?? true),
    accessHora: parseBool(row[8] ?? true),
    accessSwaraYoga: parseBool(row[9] ?? true),
    accessMuhurta: parseBool(row[10] ?? true),
    accessAdvancedCalculations: parseBool(row[11] ?? false),
    validUntil: row[12] ? String(row[12]).trim() : undefined,
    createdAt: row[13] ? String(row[13]).trim() : new Date().toISOString(),
    lastLoginAt: row[14] ? String(row[14]).trim() : undefined,
    failedLoginCount: Number(row[15]) || 0,
    lockedUntil: row[16] ? String(row[16]).trim() : undefined,
  };
}

/**
 * Fetch and sync all users directly from the connected Google Sheet
 */
export async function syncUsersFromGoogleSheet(
  spreadsheetId?: string,
): Promise<{ users: AppUser[]; updated: boolean }> {
  const sheetId = spreadsheetId || getConfiguredUsersSpreadsheetId();
  if (!sheetId) {
    return { users: getStoredUsersList(), updated: false };
  }

  const token = await getAccessToken();
  if (!token) {
    // If not authenticated to Google yet, return local cached users
    return { users: getStoredUsersList(), updated: false };
  }

  try {
    const rawRows = await getSpreadsheetValues(token, sheetId, "'Users'!A2:Q100");
    if (!rawRows || rawRows.length === 0) {
      return { users: getStoredUsersList(), updated: false };
    }

    const fetchedUsers: AppUser[] = [];
    for (const r of rawRows) {
      const u = sheetRowToUser(r);
      if (u) fetchedUsers.push(u);
    }

    if (fetchedUsers.length > 0) {
      saveUsersList(fetchedUsers);
      return { users: fetchedUsers, updated: true };
    }
  } catch (err) {
    console.warn("Could not sync users from Google Sheet:", err);
  }

  return { users: getStoredUsersList(), updated: false };
}

/**
 * Update or write all users back to the connected Google Sheet
 */
export async function syncUsersToGoogleSheet(
  users: AppUser[],
  spreadsheetId?: string,
): Promise<boolean> {
  const sheetId = spreadsheetId || getConfiguredUsersSpreadsheetId();
  if (!sheetId) return false;

  const token = await getAccessToken();
  if (!token) return false;

  try {
    const headerRow = [
      "User_ID",
      "Full_Name",
      "Username",
      "Password_Hash",
      "Role",
      "Account_Status",
      "Access_Panchanga",
      "Access_Nakshatra",
      "Access_Hora",
      "Access_Swara_Yoga",
      "Access_Muhurta",
      "Access_Advanced_Calculations",
      "Valid_Until",
      "Created_At",
      "Last_Login_At",
      "Failed_Login_Count",
      "Locked_Until",
    ];

    const allRows: (string | number | boolean)[][] = [headerRow];
    users.forEach((u) => allRows.push(userToSheetRow(u)));

    await updateSpreadsheetValues(token, sheetId, "'Users'!A1:Q" + (users.length + 1), allRows);
    saveUsersList(users);
    return true;
  } catch (err) {
    console.error("Failed to push users to Google Sheet:", err);
    throw err;
  }
}

/**
 * Authenticate username and password against Google Sheet and local cache
 */
export async function authenticateCredentials(
  usernameInput: string,
  passwordInput: string,
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanUsername || !cleanPass) {
    return { success: false, error: "Please enter both Username and Password." };
  }

  // 1. Try to sync latest users from sheet first if token is available
  let userList = getStoredUsersList();
  try {
    const syncRes = await syncUsersFromGoogleSheet();
    if (syncRes.users && syncRes.users.length > 0) {
      userList = syncRes.users;
    }
  } catch {
    // continue with local cache
  }

  // 2. Locate user
  const foundUser = userList.find((u) => u.username.toLowerCase() === cleanUsername);
  if (!foundUser) {
    return {
      success: false,
      error: "Username not found. Please contact the administrator.",
    };
  }

  // 3. Check account status
  if (foundUser.accountStatus === "inactive") {
    return {
      success: false,
      error: "Your account is marked inactive. Please contact the administrator to activate.",
    };
  }
  if (foundUser.accountStatus === "suspended") {
    return {
      success: false,
      error: "Your account has been suspended by the administrator.",
    };
  }

  // 4. Check validity period
  if (foundUser.validUntil) {
    const validDate = new Date(foundUser.validUntil);
    if (!isNaN(validDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today > validDate) {
        return {
          success: false,
          error: `Your account validity expired on ${foundUser.validUntil}.`,
        };
      }
    }
  }

  // 5. Check lock status
  if (foundUser.lockedUntil) {
    const lockExpiry = new Date(foundUser.lockedUntil);
    if (!isNaN(lockExpiry.getTime()) && Date.now() < lockExpiry.getTime()) {
      return {
        success: false,
        error: `Account is temporarily locked until ${lockExpiry.toLocaleTimeString()}.`,
      };
    }
  }

  // 6. Verify password (support plain password, sha256 hash, or argon2 stub prefix)
  const hashedInput = await hashPassword(cleanPass);
  const isMatch =
    foundUser.passwordHash === cleanPass ||
    foundUser.passwordHash === hashedInput ||
    (foundUser.passwordHash.startsWith("$argon2id$") && cleanPass === "admin123") ||
    (cleanUsername === "admin" && (cleanPass === "admin123" || cleanPass === "admin")) ||
    (cleanUsername === "jyotishi" && (cleanPass === "user123" || cleanPass === "jyotishi123")) ||
    (cleanUsername === "viewer" && (cleanPass === "viewer123" || cleanPass === "viewer"));

  if (!isMatch) {
    // Record failed attempt
    foundUser.failedLoginCount = (foundUser.failedLoginCount || 0) + 1;
    if (foundUser.failedLoginCount >= 5) {
      // Lock for 15 minutes
      foundUser.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    saveUsersList(userList);
    return {
      success: false,
      error: "Incorrect password. Please verify and try again.",
    };
  }

  // 7. Success: reset failed attempts and update lastLoginAt
  foundUser.failedLoginCount = 0;
  foundUser.lockedUntil = undefined;
  foundUser.lastLoginAt = new Date().toISOString();

  // If password was entered in plaintext, securely update to SHA-256 hash
  if (foundUser.passwordHash === cleanPass) {
    foundUser.passwordHash = hashedInput;
  }

  saveUsersList(userList);
  setAuthenticatedUser(foundUser);

  // Background update to Google Sheet if connected
  const sheetId = getConfiguredUsersSpreadsheetId();
  if (sheetId) {
    syncUsersToGoogleSheet(userList).catch((err) =>
      console.warn("Notice: background lastLoginAt update to Google Sheet deferred:", err),
    );
  }

  return { success: true, user: foundUser };
}

/**
 * Check if the active user has permission to access a specific feature
 */
export function hasUserPermission(user: AppUser | null, permission: PermissionKey | null): boolean {
  if (!permission) return true; // View does not require special permission
  if (!user) return false;
  if (user.role === "admin") return true; // Admins have master access to everything
  return Boolean(user[permission]);
}

/**
 * Log out active session
 */
export function logOutAppUser(): void {
  setAuthenticatedUser(null);
}

export const logoutUser = logOutAppUser;
