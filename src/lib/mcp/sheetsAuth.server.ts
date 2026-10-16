/**
 * Google Sheets-based API key validation for MCP tools.
 * Reads the "Users" tab of the Panchanga Power MCP Users spreadsheet.
 * Columns: A=Name, B=API Key, C=Active (YES/NO), D=Notes
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";
// Cache entries for 60 seconds to avoid hammering the Sheets API on every tool call
let cachedKeys: Set<string> | null = null;
let cacheExpiry = 0;

async function fetchAuthorizedKeys(): Promise<Set<string>> {
  const now = Date.now();
  if (cachedKeys && now < cacheExpiry) return cachedKeys;

  const spreadsheetId = process.env["PANCHANGA_USERS_SPREADSHEET_ID"];
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const sheetsApiKey = process.env["GOOGLE_SHEETS_API_KEY"];

  if (!spreadsheetId || !lovableApiKey || !sheetsApiKey) {
    throw new Error("MCP auth configuration missing — check PANCHANGA_USERS_SPREADSHEET_ID, LOVABLE_API_KEY, GOOGLE_SHEETS_API_KEY");
  }

  const res = await fetch(
    `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/Users!A2:C200`,
    {
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": sheetsApiKey,
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to read Users sheet [${res.status}]: ${body}`);
  }

  const json = (await res.json()) as { values?: string[][] };
  const rows = json.values ?? [];

  const keys = new Set<string>();
  for (const row of rows) {
    const apiKey = (row[1] ?? "").trim();
    const active = (row[2] ?? "").trim().toUpperCase();
    if (apiKey && active === "YES") {
      keys.add(apiKey);
    }
  }

  cachedKeys = keys;
  cacheExpiry = now + 60_000; // 60-second cache
  return keys;
}

/**
 * Validate an API key against the Users sheet.
 * Returns the authorized key set entry or throws a descriptive error.
 */
export async function validateApiKey(apiKey: string | undefined): Promise<void> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Missing api_key. Add your API key from the Panchanga Power Users sheet.");
  }
  const authorized = await fetchAuthorizedKeys();
  if (!authorized.has(apiKey.trim())) {
    throw new Error("Invalid or inactive API key. Contact the app owner to get access.");
  }
}

/** Invalidate the cache (e.g. after a Users sheet change) */
export function invalidateAuthCache(): void {
  cachedKeys = null;
  cacheExpiry = 0;
}
