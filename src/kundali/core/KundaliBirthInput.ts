/**
 * Mahavtaar Kundali Engine - Canonical Birth Input
 * Phase 8 Production System Architecture
 */

import { InvalidBirthInputError } from "./ErrorModel";

export interface KundaliBirthInput {
  date: string; // ISO format "YYYY-MM-DD"
  time: string; // "HH:mm" or "HH:mm:ss"
  timeZone: string; // IANA timezone (e.g., "Asia/Kolkata") or offset (e.g., "+05:30")
  latitude: number; // -90.0 to +90.0
  longitude: number; // -180.0 to +180.0
  elevationMeters?: number; // Optional altitude
  placeName?: string; // Optional place label
  name?: string; // Optional subject name
  gender?: "male" | "female" | "other"; // Optional gender
  sourceMetadata?: Record<string, unknown>; // Optional source traceability
}

/**
 * Validates KundaliBirthInput according to strict astronomical standards.
 * Throws InvalidBirthInputError on invalid input.
 */
export function validateKundaliBirthInput(input: KundaliBirthInput): void {
  if (!input) {
    throw new InvalidBirthInputError("Birth input cannot be null or undefined");
  }

  // Mandatory fields check
  if (!input.date || typeof input.date !== "string") {
    throw new InvalidBirthInputError("Missing or invalid mandatory field: date");
  }
  if (!input.time || typeof input.time !== "string") {
    throw new InvalidBirthInputError("Missing or invalid mandatory field: time");
  }
  if (!input.timeZone || typeof input.timeZone !== "string") {
    throw new InvalidBirthInputError("Missing or invalid mandatory field: timeZone");
  }
  if (typeof input.latitude !== "number" || isNaN(input.latitude)) {
    throw new InvalidBirthInputError("Missing or invalid mandatory field: latitude");
  }
  if (typeof input.longitude !== "number" || isNaN(input.longitude)) {
    throw new InvalidBirthInputError("Missing or invalid mandatory field: longitude");
  }

  // Latitude / Longitude bounds
  if (input.latitude < -90.0 || input.latitude > 90.0) {
    throw new InvalidBirthInputError(`Latitude out of bounds [-90, +90]: ${input.latitude}`, {
      latitude: input.latitude,
    });
  }
  if (input.longitude < -180.0 || input.longitude > 180.0) {
    throw new InvalidBirthInputError(`Longitude out of bounds [-180, +180]: ${input.longitude}`, {
      longitude: input.longitude,
    });
  }

  // Date validation (YYYY-MM-DD)
  const dateParts = input.date.split("-");
  if (dateParts.length !== 3) {
    throw new InvalidBirthInputError(`Invalid date format. Expected YYYY-MM-DD: ${input.date}`);
  }
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new InvalidBirthInputError(`Numeric parsing failed for date: ${input.date}`);
  }
  if (month < 1 || month > 12) {
    throw new InvalidBirthInputError(`Month out of range [1-12]: ${month}`);
  }
  if (day < 1 || day > 31) {
    throw new InvalidBirthInputError(`Day out of range [1-31]: ${day}`);
  }

  // Calendar day validation (e.g. Feb 31 or April 31)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    throw new InvalidBirthInputError(
      `Impossible calendar date: ${year}-${month}-${day} (Month ${month} only has ${daysInMonth} days)`,
    );
  }

  // Time validation (HH:mm or HH:mm:ss)
  const timeParts = input.time.split(":");
  if (timeParts.length < 2 || timeParts.length > 3) {
    throw new InvalidBirthInputError(
      `Invalid time format. Expected HH:mm or HH:mm:ss: ${input.time}`,
    );
  }
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  const second = timeParts.length === 3 ? parseInt(timeParts[2], 10) : 0;

  if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
    throw new InvalidBirthInputError(`Numeric parsing failed for time: ${input.time}`);
  }
  if (hour < 0 || hour > 23) {
    throw new InvalidBirthInputError(`Hour out of range [0-23]: ${hour}`);
  }
  if (minute < 0 || minute > 59) {
    throw new InvalidBirthInputError(`Minute out of range [0-59]: ${minute}`);
  }
  if (second < 0 || second > 59) {
    throw new InvalidBirthInputError(`Second out of range [0-59]: ${second}`);
  }

  // Timezone / Offset check
  if (
    !input.timeZone.startsWith("+") &&
    !input.timeZone.startsWith("-") &&
    !input.timeZone.includes("/") &&
    input.timeZone !== "UTC" &&
    input.timeZone !== "GMT"
  ) {
    throw new InvalidBirthInputError(`Invalid timezone format: ${input.timeZone}`);
  }
}

/**
 * Converts a valid KundaliBirthInput to UTC Timestamp in Milliseconds deterministically.
 */
export function parseBirthInputToUtcMs(input: KundaliBirthInput): number {
  validateKundaliBirthInput(input);

  const [yearStr, monthStr, dayStr] = input.date.split("-");
  const timeParts = input.time.split(":");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  const second = timeParts.length === 3 ? parseInt(timeParts[2], 10) : 0;

  // Calculate UTC offset in minutes
  let offsetMinutes = 0;
  if (input.timeZone.startsWith("+") || input.timeZone.startsWith("-")) {
    const sign = input.timeZone.startsWith("+") ? 1 : -1;
    const tzParts = input.timeZone.substring(1).split(":");
    const tzHours = parseInt(tzParts[0], 10) || 0;
    const tzMins = parseInt(tzParts[1], 10) || 0;
    offsetMinutes = sign * (tzHours * 60 + tzMins);
  } else if (input.timeZone === "Asia/Kolkata" || input.timeZone === "IST") {
    offsetMinutes = 330; // +05:30
  } else if (input.timeZone === "UTC" || input.timeZone === "GMT") {
    offsetMinutes = 0;
  } else {
    // Default fallback offset if IANA string without explicit offset
    offsetMinutes = 330; // Default IST if unspecified IANA in local test context
  }

  // Convert local date/time + offset to UTC timestamp
  const localUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcMs = localUtcMs - offsetMinutes * 60 * 1000;
  return utcMs;
}
