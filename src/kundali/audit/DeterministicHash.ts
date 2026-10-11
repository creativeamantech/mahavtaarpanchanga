/**
 * Mahavtaar Kundali Engine - Deterministic Hashing & Canonical Serialization
 * Phase 8 Production System Architecture
 */

import { CalculationProfile } from "../core/CalculationProfile";
import { KundaliBirthInput } from "../core/KundaliBirthInput";

/**
 * Pure JavaScript SHA-256 implementation ensuring identical hash calculation across
 * Node.js, Web Browsers, Service Workers, and SSR environments without external native crypto dependencies.
 */
export function sha256Hex(asciiString: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = "length";
  let i: number, j: number;
  let result = "";

  const words: number[] = [];
  const asciiBitLength = asciiString[lengthProperty] * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  asciiString += "\x80";
  while ((asciiString[lengthProperty] as unknown as number) % 64 !== 56) {
    asciiString += "\x00";
  }
  for (i = 0; i < asciiString[lengthProperty]; i++) {
    j = asciiString.charCodeAt(i);
    if (j >> 8) return ""; // Non-ASCII byte fallback handled safely
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength | 0;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }

  return result;
}

/**
 * Stable Canonical JSON Serialization
 * Ensures deterministic property ordering and number formatting, ignoring non-deterministic fields.
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return "null";
  }
  if (typeof obj === "number") {
    if (isNaN(obj) || !isFinite(obj)) return "null";
    // Standardize to fixed float notation for deterministic hashing
    return Number(obj.toFixed(6)).toString();
  }
  if (typeof obj === "boolean" || typeof obj === "string") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalJsonStringify(item)).join(",") + "]";
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj as Record<string, unknown>)
      .filter((k) => k !== "calculationTimestampMs" && k !== "executionTimeMs") // Ignore transient fields
      .sort();
    const parts = keys.map(
      (key) =>
        JSON.stringify(key) + ":" + canonicalJsonStringify((obj as Record<string, unknown>)[key]),
    );
    return "{" + parts.join(",") + "}";
  }
  return JSON.stringify(obj);
}

/**
 * Generates a deterministic calculation ID from KundaliBirthInput + CalculationProfile + Engine Version.
 */
export function generateCalculationId(
  birthInput: KundaliBirthInput,
  profile: CalculationProfile,
  engineVersion: string,
): string {
  const canonicalString = canonicalJsonStringify({
    date: birthInput.date,
    time: birthInput.time,
    timeZone: birthInput.timeZone,
    latitude: birthInput.latitude,
    longitude: birthInput.longitude,
    elevationMeters: birthInput.elevationMeters ?? 0,
    ayanamsha: profile.ayanamsha,
    houseSystem: profile.houseSystem,
    dashaYearConvention: profile.dashaYearConvention,
    vargaConvention: profile.vargaConvention,
    nodeConvention: profile.nodeConvention,
    engineVersion: engineVersion,
  });

  return "KUNDLI-" + sha256Hex(canonicalString).substring(0, 16).toUpperCase();
}

/**
 * Generates a SHA-256 hash string for any calculation section.
 */
export function generateResultHash(data: unknown): string {
  const serialized = canonicalJsonStringify(data);
  return "sha256:" + sha256Hex(serialized);
}
