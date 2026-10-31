import { createHmac, createSign, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SESSION_COOKIE = "mahavtaar_panchanga_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type ServiceAccount = { client_email: string; private_key: string };
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
  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(requiredEnv("GOOGLE_SERVICE_ACCOUNT_JSON")) as ServiceAccount;
  } catch {
    throw new Error("Authentication configuration missing or invalid: GOOGLE_SERVICE_ACCOUNT_JSON");
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error("Authentication configuration missing or invalid: GOOGLE_SERVICE_ACCOUNT_JSON");
  }
  return {
    spreadsheetId: requiredEnv("PANCHANGA_AUTH_SPREADSHEET_ID"),
    serviceAccount: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
    },
    sessionSecret: requiredEnv("PANCHANGA_SESSION_SECRET"),
  };
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

let cachedAccessToken: { token: string; expiresAt: number } | undefined;

async function getGoogleAccessToken(): Promise<string> {
  const c = config();
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: c.serviceAccount.client_email,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(c.serviceAccount.private_key).toString("base64url")}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Google OAuth token request failed", response.status, (await response.text()).slice(0, 300));
    throw new Error("Google Sheets authentication is temporarily unavailable.");
  }
  const tokenData = await response.json() as { access_token?: string; expires_in?: number };
  if (!tokenData.access_token) throw new Error("Google OAuth response did not include an access token.");
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in ?? 3600) * 1000,
  };
  return tokenData.access_token;
}

async function sheetsRequest(range: string, init?: RequestInit): Promise<any> {
  const c = config();
  const accessToken = await getGoogleAccessToken();
  const url = `${GOOGLE_SHEETS_API}/spreadsheets/${encodeURIComponent(c.spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const response = await fetch(
    init?.method === "PUT" ? `${url}?valueInputOption=RAW` : url,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    console.error("Google Sheets API request failed", response.status, (await response.text()).slice(0, 300));
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
  const result = await sheetsRequest("Users!A2:Q1000");
  const rows: string[][] = result.values ?? [];
  return rows.map(parseUser).find((user) => user.username === username);
}

async function updateUserCells(rowNumber: number, range: string, values: unknown[][]): Promise<void> {
  await sheetsRequest(`Users!${range}`, {
    method: "PUT",
    body: JSON.stringify({ range: `Users!${range}`, majorDimension: "ROWS", values }),
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
  if (!user) {
    await scrypt(password, randomBytes(16), 32);
    throw new Error("Invalid username or password.");
  }
  if (user.status !== "active") throw new Error("This account is inactive. Contact the administrator.");
  if (user.validUntil && Number.isNaN(Date.parse(user.validUntil))) throw new Error("Account expiry date is invalid. Contact the administrator.");
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
