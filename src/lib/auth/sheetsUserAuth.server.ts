import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SESSION_COOKIE = "mahavtaar_panchanga_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type UserRow = {
  userId: string; fullName: string; username: string; passwordHash: string;
  role: "admin" | "user" | "viewer"; status: string;
  permissions: Record<string, boolean>; validUntil: string;
  failedLoginCount: number; lockedUntil: string;
  rowNumber: number;
};

export type PublicUser = Pick<UserRow, "userId" | "fullName" | "username" | "role" | "permissions">;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Authentication configuration missing: ${name}`);
  return value;
}

function config() {
  return {
    spreadsheetId: requiredEnv("PANCHANGA_AUTH_SPREADSHEET_ID"),
    lovableApiKey: requiredEnv("LOVABLE_API_KEY"),
    sheetsApiKey: requiredEnv("GOOGLE_SHEETS_API_KEY"),
    sessionSecret: requiredEnv("PANCHANGA_SESSION_SECRET"),
  };
}

async function sheetsRequest(path: string, init?: RequestInit): Promise<any> {
  const c = config();
  const response = await fetch(`${GATEWAY}/spreadsheets/${c.spreadsheetId}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${c.lovableApiKey}`,
      "X-Connection-Api-Key": c.sheetsApiKey,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Google Sheets auth gateway error", response.status, detail.slice(0, 300));
    throw new Error("User directory is temporarily unavailable.");
  }
  return response.status === 204 ? null : response.json();
}

function parseUser(row: string[], index: number): UserRow {
  const bool = (value: string | undefined) => String(value ?? "").toUpperCase() === "TRUE";
  return {
    userId: row[0] ?? "", fullName: row[1] ?? "", username: (row[2] ?? "").trim().toLowerCase(),
    passwordHash: row[3] ?? "", role: (row[4] || "viewer") as UserRow["role"],
    status: (row[5] || "inactive").toLowerCase(),
    permissions: {
      panchanga: bool(row[6]), nakshatra: bool(row[7]), hora: bool(row[8]),
      swaraYoga: bool(row[9]), muhurta: bool(row[10]), advancedCalculations: bool(row[11]),
    },
    validUntil: row[12] ?? "", failedLoginCount: Number(row[15] || 0),
    lockedUntil: row[16] ?? "", rowNumber: index + 2,
  };
}

async function findUser(username: string): Promise<UserRow | undefined> {
  const result = await sheetsRequest("values/Users!A2:Q1000");
  const rows: string[][] = result.values ?? [];
  return rows.map(parseUser).find((user) => user.username === username);
}

async function updateUserCells(rowNumber: number, range: string, values: unknown[][]): Promise<void> {
  const encodedRange = encodeURIComponent(`Users!${range}`);
  await sheetsRequest(`values/${encodedRange}?valueInputOption=RAW`, {
    method: "PUT", body: JSON.stringify({ range: `Users!${range}`, majorDimension: "ROWS", values }),
  });
}

function sign(payload: string): string {
  return createHmac("sha256", config().sessionSecret).update(payload).digest("base64url");
}

function createSession(user: UserRow): string {
  const payload = Buffer.from(JSON.stringify({
    sub: user.userId, username: user.username, role: user.role,
    permissions: user.permissions, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(request: Request): PublicUser | null {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const token = cookie.split(";").map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.sub || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return {
      userId: session.sub, fullName: "", username: session.username,
      role: session.role, permissions: session.permissions,
    };
  } catch { return null; }
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Format: scrypt$<salt-base64url>$<derived-key-base64url>
  const [scheme, salt, digest] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !digest) return false;
  const expected = Buffer.from(digest, "base64url");
  const actual = (await scrypt(password, Buffer.from(salt, "base64url"), expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function authenticate(usernameInput: string, password: string): Promise<{ user: PublicUser; token: string }> {
  const username = usernameInput.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,64}$/.test(username) || password.length < 1 || password.length > 256) {
    throw new Error("Invalid username or password.");
  }
  const user = await findUser(username);
  // Perform a dummy scrypt on missing users to reduce username timing leaks.
  if (!user) {
    await scrypt(password, randomBytes(16), 32);
    throw new Error("Invalid username or password.");
  }
  if (user.status !== "active") throw new Error("This account is inactive. Contact the administrator.");
  if (user.validUntil && Date.parse(user.validUntil) < Date.now()) throw new Error("This account has expired.");
  if (user.lockedUntil && Date.parse(user.lockedUntil) > Date.now()) throw new Error("Account temporarily locked. Try again later.");
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failures = user.failedLoginCount + 1;
    const lockUntil = failures >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : "";
    await updateUserCells(user.rowNumber, `P${user.rowNumber}:Q${user.rowNumber}`, [[lockUntil ? 0 : failures, lockUntil]]);
    throw new Error("Invalid username or password.");
  }
  await updateUserCells(user.rowNumber, `O${user.rowNumber}:Q${user.rowNumber}`, [[new Date().toISOString(), 0, ""]]);
  const publicUser: PublicUser = {
    userId: user.userId, fullName: user.fullName, username: user.username,
    role: user.role, permissions: user.permissions,
  };
  return { user: publicUser, token: createSession(user) };
}
