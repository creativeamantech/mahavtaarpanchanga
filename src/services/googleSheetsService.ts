/**
 * Google Sheets Service for Mahavtaar Panchanga
 * Integrates Google Sheets API v4 & Google Drive API v3
 * Client-Side OAuth Token Driven (with in-memory auth)
 */

import { PanchangaResponse, MonthlyPanchangaDay } from "../types";
import { calculateDailyHoras } from "../horaEngine";

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetMetadata {
  sheetId: number;
  title: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

export interface SpreadsheetDetails {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: SheetMetadata[];
}

export interface ExportPanchangaOptions {
  includeHoras?: boolean;
  includePlanets?: boolean;
  includeChoghadiya?: boolean;
  customTitle?: string;
}

/**
 * List existing Google Sheets files from the user's Google Drive
 */
export async function listUserSpreadsheets(token: string): Promise<DriveSpreadsheetFile[]> {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
  );
  const fields = encodeURIComponent("files(id, name, createdTime, modifiedTime, webViewLink)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=30`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list Google Sheets: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as { files?: DriveSpreadsheetFile[] };
  return (data.files || []).map((f) => ({
    id: f.id,
    name: f.name,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}`,
  }));
}

/**
 * Get detailed metadata of a specific Google Spreadsheet
 */
export async function getSpreadsheetDetails(
  token: string,
  spreadsheetId: string,
): Promise<SpreadsheetDetails> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets(properties(sheetId,title,index,gridProperties))`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch spreadsheet details: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as {
    spreadsheetId: string;
    properties?: { title?: string };
    spreadsheetUrl?: string;
    sheets?: Array<{
      properties?: {
        sheetId?: number;
        title?: string;
        index?: number;
        gridProperties?: { rowCount?: number; columnCount?: number };
      };
    }>;
  };
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || "Untitled Spreadsheet",
    spreadsheetUrl:
      data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    sheets: (data.sheets || []).map((s) => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title || "Sheet",
      index: s.properties?.index ?? 0,
      rowCount: s.properties?.gridProperties?.rowCount ?? 0,
      columnCount: s.properties?.gridProperties?.columnCount ?? 0,
    })),
  };
}

/**
 * Read matrix values from a specific spreadsheet and range
 */
export async function getSpreadsheetValues(
  token: string,
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to read spreadsheet values: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Write a 2D matrix of values into a specific sheet tab range
 */
export async function updateSpreadsheetValues(
  token: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][],
): Promise<unknown> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update sheet values: ${response.status} ${errText}`);
  }

  return await response.json();
}

/**
 * Batch format sheets with Vedic saffron header styling and frozen header rows
 */
async function applyVedicStyling(
  token: string,
  spreadsheetId: string,
  sheetConfigs: { sheetId: number; columnCount: number }[],
) {
  const requests: Record<string, unknown>[] = [];

  for (const cfg of sheetConfigs) {
    // 1. Freeze top row
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId: cfg.sheetId,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        fields: "gridProperties.frozenRowCount",
      },
    });

    // 2. Format Header Row (Warm Vedic Amber/Saffron fill, white bold text)
    requests.push({
      repeatCell: {
        range: {
          sheetId: cfg.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: cfg.columnCount,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: {
              red: 0.83,
              green: 0.41,
              blue: 0.04, // #D4680A Vedic Saffron
            },
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontSize: 11,
            },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
          },
        },
        fields:
          "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    });

    // 3. Auto-resize columns
    requests.push({
      autoResizeDimensions: {
        dimensions: {
          sheetId: cfg.sheetId,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: cfg.columnCount,
        },
      },
    });
  }

  if (requests.length === 0) return;

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    });
  } catch (err) {
    console.warn("Notice: Batch format styling could not be fully applied:", err);
  }
}

/**
 * Create a comprehensive Daily Panchanga Google Spreadsheet with tabs:
 * 1. Panchanga Overview
 * 2. 24 Vedic Horas & Tattvas
 * 3. Planetary Positions (Graha Sthiti)
 * 4. Choghadiya Muhurtas
 */
export async function createPanchangaSpreadsheet(
  token: string,
  data: PanchangaResponse,
  options: ExportPanchangaOptions = {},
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const {
    includeHoras = true,
    includePlanets = true,
    includeChoghadiya = true,
    customTitle,
  } = options;

  const title =
    customTitle ||
    `Mahavtaar Panchanga - ${data.city || "Almanac"} - ${data.date || new Date().toLocaleDateString()}`;

  // Define sheet tabs
  const sheetsPayload = [{ properties: { title: "Panchanga Overview", sheetId: 0 } }];

  const horasSheetId = 1;
  const planetsSheetId = 2;
  const choghadiyaSheetId = 3;

  if (includeHoras) {
    sheetsPayload.push({
      properties: { title: "24 Vedic Horas & Tattvas", sheetId: horasSheetId },
    });
  }
  if (includePlanets) {
    sheetsPayload.push({
      properties: { title: "Planetary Positions (Grahas)", sheetId: planetsSheetId },
    });
  }
  if (includeChoghadiya) {
    sheetsPayload.push({
      properties: { title: "Choghadiya Muhurtas", sheetId: choghadiyaSheetId },
    });
  }

  // 1. Create Spreadsheet
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheetsPayload,
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${createRes.status} ${errText}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Prepare Data for Panchanga Overview
  const tithiStr = (data.tithi || [])
    .map((t) => `${t.name} (${t.paksha} Paksha) until ${t.end_time || "Full Day"}`)
    .join("; ");
  const nakshatraStr = (data.nakshatra || [])
    .map((n) => `${n.name} (Pada ${n.pada || 1}) until ${n.end_time || "Full Day"}`)
    .join("; ");
  const yogaStr = (data.yoga || [])
    .map((y) => `${y.name} until ${y.end_time || "Full Day"}`)
    .join("; ");
  const karanaStr = (data.karana || [])
    .map((k) => `${k.name} until ${k.end_time || "Full Day"}`)
    .join("; ");

  const overviewRows: (string | number)[][] = [
    ["Parameter", "Value", "Vedic Category / Notes"],
    ["Date", data.date, "Gregorian Calendar"],
    ["Vaara (Day)", data.day || data.weekday || "", "Vedic Solar Day"],
    ["Location", `${data.city || ""}, ${data.country || ""}`, `Timezone: ${data.timezone || ""}`],
    ["Sunrise", data.sunrise || "--", "Pratah Kala / Surya Udaya"],
    ["Sunset", data.sunset || "--", "Sayam Kala / Surya Astha"],
    ["Moonrise", data.moonrise || "--", "Chandra Udaya"],
    ["Moonset", data.moonset || "--", "Chandra Astha"],
    ["Sun Sign (Surya Rashi)", data.sun_sign || "--", "Sidereal Zodiac"],
    ["Moon Sign (Chandra Rashi)", data.moon_sign || "--", "Janma / Gochara Rashi"],
    ["Vedic Month (Masa)", data.masa || "--", "Lunar Month"],
    ["Paksha (Fortnight)", data.paksha || "--", "Shukla (Waxing) / Krishna (Waning)"],
    ["Ritu (Season)", data.ritu || "--", "Vedic Season"],
    ["Ayana", data.ayana || "--", "Uttarayana / Dakshinayana"],
    ["Samvatsara (Vikram)", data.vikram_samvat || "--", "Vikrami Lunar Year"],
    ["Shaka Samvat", data.shaka_samvat || "--", "National Civil Samvat"],
    [
      "Ayanamsha System",
      data.ayanamsha_name || "Chitra Paksha / Lahiri",
      "Sidereal Zero Reference",
    ],
    ["Tithi", tithiStr || "--", "1/30th Synodic Lunar Month"],
    ["Nakshatra", nakshatraStr || "--", "Lunar Mansion (13°20')"],
    ["Yoga", yogaStr || "--", "Sun-Moon Angular Combination"],
    ["Karana", karanaStr || "--", "Half Tithi (6°)"],
    [
      "Brahma Muhurta",
      `${data.brahma_muhurta?.start || "--"} - ${data.brahma_muhurta?.end || "--"}`,
      "Auspicious ( ध्यान व साधना )",
    ],
    [
      "Abhijit Muhurta",
      `${data.abhijit_muhurta?.start || "--"} - ${data.abhijit_muhurta?.end || "--"}`,
      "Most Auspicious ( विजय काल )",
    ],
    [
      "Godhuli Muhurta",
      `${data.godhuli_muhurta?.start || "--"} - ${data.godhuli_muhurta?.end || "--"}`,
      "Twilight Auspicious Time",
    ],
    [
      "Vijaya Muhurta",
      `${data.vijaya_muhurta?.start || "--"} - ${data.vijaya_muhurta?.end || "--"}`,
      "Victory Time",
    ],
    [
      "Amrit Kaal",
      `${data.amrit_kaal?.start || "--"} - ${data.amrit_kaal?.end || "--"}`,
      "Elixir / Pure Auspiciousness",
    ],
    [
      "Rahu Kaal",
      `${data.rahu_kala?.start || "--"} - ${data.rahu_kala?.end || "--"}`,
      "Inauspicious (Avoid new starts)",
    ],
    [
      "Yamaganda Kaal",
      `${data.yamaganda?.start || "--"} - ${data.yamaganda?.end || "--"}`,
      "Inauspicious Period",
    ],
    [
      "Gulika Kaal",
      `${data.gulika_kala?.start || "--"} - ${data.gulika_kala?.end || "--"}`,
      "Saturn's Sub-period",
    ],
    [
      "Dur Muhurtam",
      `${data.dur_muhurta?.start || "--"} - ${data.dur_muhurta?.end || "--"}`,
      "Inauspicious Window",
    ],
    [
      "Varjyam",
      `${data.varjyam?.start || "--"} - ${data.varjyam?.end || "--"}`,
      "Restricted Planetary Time",
    ],
  ];

  await updateSpreadsheetValues(token, spreadsheetId, "'Panchanga Overview'!A1", overviewRows);

  const styleConfigs: { sheetId: number; columnCount: number }[] = [{ sheetId: 0, columnCount: 3 }];

  // 3. Populate 24 Horas Sheet
  if (includeHoras) {
    try {
      const dailyHoras = calculateDailyHoras(data);
      const horaRows: (string | number)[][] = [
        [
          "Hora #",
          "Day/Night",
          "Start Time",
          "End Time",
          "Duration (mins)",
          "Planetary Ruler",
          "Swara Nadi",
          "Nostril Dominance",
          "5 Sub-Tattvas (Timeline)",
        ],
      ];

      dailyHoras.horas.forEach((h) => {
        const tattvaSummary = h.tattvas
          .map((t) => `${t.sanskrit} (${t.startTime}-${t.endTime})`)
          .join(" | ");

        horaRows.push([
          h.index,
          h.isDay ? "Day (दिन)" : "Night (रात्रि)",
          h.startTime,
          h.endTime,
          Math.round(h.durationMs / 60000),
          h.ruler,
          h.nadi === "ida"
            ? "Ida (Chandra)"
            : h.nadi === "pingala"
              ? "Pingala (Surya)"
              : "Sushumna",
          h.nadi === "ida" ? "Left (बायाँ)" : h.nadi === "pingala" ? "Right (दायाँ)" : "Both (उभय)",
          tattvaSummary,
        ]);
      });

      await updateSpreadsheetValues(
        token,
        spreadsheetId,
        "'24 Vedic Horas & Tattvas'!A1",
        horaRows,
      );
      styleConfigs.push({ sheetId: horasSheetId, columnCount: 9 });
    } catch (e) {
      console.warn("Could not compute 24 horas for sheet:", e);
    }
  }

  // 4. Populate Planetary Positions Sheet
  if (includePlanets && data.planets && data.planets.length > 0) {
    const planetRows: (string | number)[][] = [
      [
        "Planet (Graha)",
        "Sanskrit Name",
        "Zodiac Sign (Rashi)",
        "Degree in Sign",
        "Total Sidereal Longitude",
        "Nakshatra",
        "Pada",
        "Motion / State",
        "Combust (Astha)",
      ],
    ];

    data.planets.forEach((p) => {
      planetRows.push([
        p.name,
        p.name_sa || p.sanskritName || p.name,
        p.rasi,
        p.degrees_in_rasi || p.degreesInRasi || "--",
        p.siderealLongitude ? `${p.siderealLongitude.toFixed(3)}°` : `${p.longitude.toFixed(3)}°`,
        p.nakshatra,
        p.pada || 1,
        p.is_retrograde || p.isRetrograde ? "Vakri (Retrograde)" : "Marga (Direct)",
        p.combust ? "Yes (Combust)" : "No",
      ]);
    });

    await updateSpreadsheetValues(
      token,
      spreadsheetId,
      "'Planetary Positions (Grahas)'!A1",
      planetRows,
    );
    styleConfigs.push({ sheetId: planetsSheetId, columnCount: 9 });
  }

  // 5. Populate Choghadiya Sheet
  if (includeChoghadiya) {
    const choghadiyaRows: (string | number)[][] = [
      [
        "Period",
        "Choghadiya Name",
        "Classification",
        "Start Time",
        "End Time",
        "Vedic Significance",
      ],
    ];

    (data.gauri_choghadiya_day || []).forEach((c) => {
      choghadiyaRows.push([
        "Day",
        c.name,
        c.type || "neutral",
        c.start,
        c.end,
        c.type === "auspicious"
          ? "Shubh / Labh / Amrit (Benefic)"
          : c.type === "inauspicious"
            ? "Rog / Kaal / Udveg (Malefic)"
            : "Char (Neutral)",
      ]);
    });

    (data.gauri_choghadiya_night || []).forEach((c) => {
      choghadiyaRows.push([
        "Night",
        c.name,
        c.type || "neutral",
        c.start,
        c.end,
        c.type === "auspicious"
          ? "Shubh / Labh / Amrit (Benefic)"
          : c.type === "inauspicious"
            ? "Rog / Kaal / Udveg (Malefic)"
            : "Char (Neutral)",
      ]);
    });

    await updateSpreadsheetValues(token, spreadsheetId, "'Choghadiya Muhurtas'!A1", choghadiyaRows);
    styleConfigs.push({ sheetId: choghadiyaSheetId, columnCount: 6 });
  }

  // 6. Apply Vedic Header Formatting & Freezes
  await applyVedicStyling(token, spreadsheetId, styleConfigs);

  return { spreadsheetId, spreadsheetUrl, title };
}

/**
 * Create a Monthly Almanac Google Spreadsheet
 */
export async function createMonthlyPanchangaSpreadsheet(
  token: string,
  days: MonthlyPanchangaDay[],
  monthName: string,
  year: number,
  city: string,
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = `Mahavtaar Panchanga - Monthly Almanac - ${monthName} ${year} (${city})`;

  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: `${monthName} ${year} Almanac`,
            sheetId: 0,
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Monthly Google Spreadsheet: ${createRes.status} ${errText}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  const header = [
    "Date",
    "Day of Week",
    "Tithi",
    "Paksha",
    "Nakshatra",
    "Pada",
    "Yoga",
    "Karana",
    "Sunrise",
    "Sunset",
    "Rahu Kaal",
    "Abhijit Muhurta",
    "Special Festivals / Vratas",
  ];

  const rows: (string | number)[][] = [header];

  days.forEach((day) => {
    const festivalStr = (day.festivals || []).map((f) => f.name).join(", ");
    rows.push([
      day.date,
      day.day || day.weekday || "",
      day.tithi?.[0]?.name || "--",
      day.tithi?.[0]?.paksha || day.paksha || "--",
      day.nakshatra?.[0]?.name || "--",
      day.nakshatra?.[0]?.pada || 1,
      day.yoga?.[0]?.name || "--",
      day.karana?.[0]?.name || "--",
      day.sunrise || "--",
      day.sunset || "--",
      day.rahu_kala ? `${day.rahu_kala.start} - ${day.rahu_kala.end}` : "--",
      day.abhijit_muhurta ? `${day.abhijit_muhurta.start} - ${day.abhijit_muhurta.end}` : "--",
      festivalStr || "--",
    ]);
  });

  await updateSpreadsheetValues(token, spreadsheetId, `'${monthName} ${year} Almanac'!A1`, rows);

  await applyVedicStyling(token, spreadsheetId, [{ sheetId: 0, columnCount: header.length }]);

  return { spreadsheetId, spreadsheetUrl, title };
}

/**
 * Create the User Registry Spreadsheet based on docs/authentication/Users-Sheet-Template.csv
 */
export async function createUsersRegistrySpreadsheet(
  token: string,
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = "Mahavtaar Panchanga — User Access";

  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: "Users",
            sheetId: 0,
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Users Registry Spreadsheet: ${createRes.status} ${errText}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  const headers = [
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

  const nowIso = new Date().toISOString();

  // Template sample rows for admin and standard user
  const sampleRows: (string | number | boolean)[][] = [
    headers,
    [
      "USR_001",
      "Mahavtaar Administrator",
      "admin",
      "$argon2id$v=19$m=65536,t=3,p=4$example_salt_hash",
      "admin",
      "active",
      true,
      true,
      true,
      true,
      true,
      true,
      "2030-12-31",
      nowIso,
      nowIso,
      0,
      "",
    ],
    [
      "USR_002",
      "Astrology Practitioner",
      "jyotishi_user",
      "$argon2id$v=19$m=65536,t=3,p=4$example_salt_hash",
      "user",
      "active",
      true,
      true,
      true,
      true,
      true,
      false,
      "2028-12-31",
      nowIso,
      "",
      0,
      "",
    ],
  ];

  await updateSpreadsheetValues(token, spreadsheetId, "'Users'!A1", sampleRows);

  await applyVedicStyling(token, spreadsheetId, [{ sheetId: 0, columnCount: headers.length }]);

  return { spreadsheetId, spreadsheetUrl, title };
}

/**
 * Append Today's Panchanga Record to an existing Google Spreadsheet
 */
export async function appendDailyPanchangaRow(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  data: PanchangaResponse,
): Promise<{ updatedRange: string }> {
  const tithiStr = (data.tithi || []).map((t) => t.name).join("; ");
  const nakshatraStr = (data.nakshatra || []).map((n) => `${n.name} (P${n.pada || 1})`).join("; ");

  const row = [
    data.date,
    data.day || data.weekday || "",
    data.city || "",
    tithiStr,
    nakshatraStr,
    data.yoga?.[0]?.name || "--",
    data.karana?.[0]?.name || "--",
    data.sunrise || "--",
    data.sunset || "--",
    data.brahma_muhurta?.start ? `${data.brahma_muhurta.start} - ${data.brahma_muhurta.end}` : "--",
    data.abhijit_muhurta?.start
      ? `${data.abhijit_muhurta.start} - ${data.abhijit_muhurta.end}`
      : "--",
    data.rahu_kala?.start ? `${data.rahu_kala.start} - ${data.rahu_kala.end}` : "--",
  ];

  const encodedSheet = encodeURIComponent(sheetName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range: sheetName,
      majorDimension: "ROWS",
      values: [row],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append row to Google Sheet: ${response.status} ${errText}`);
  }

  const result = await response.json();
  return { updatedRange: result.updates?.updatedRange || sheetName };
}
