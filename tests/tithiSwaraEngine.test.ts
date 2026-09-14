import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  TITHI_SWARA_RULES,
  getTithiSwaraRule,
  getOppositeNadi,
  computeTithiSwaraEvents,
  isTithiSwaraEventActive,
  ONE_HOUR_MS,
} from "../src/lib/tithiSwaraEngine.ts";
import type { Segment } from "../src/types.ts";

describe("Tithi Swara (Nadi) Engine - Comprehensive Tests", () => {
  // Test 1: All 30 mapping rows
  test("All 30 mapping rows match the exact specification", () => {
    assert.strictEqual(TITHI_SWARA_RULES.length, 30, "Must contain exactly 30 Tithi rules");

    // Expected mapping as defined in prompt
    const expectedRules: Array<{
      number: number;
      name: string;
      paksha: "shukla" | "krishna";
      startNadi: "ida" | "pingala";
      endNadi: "ida" | "pingala";
    }> = [
      // Shukla Paksha
      { number: 1, name: "Pratipada", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 2, name: "Dwitiya", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 3, name: "Tritiya", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 4, name: "Chaturthi", paksha: "shukla", startNadi: "pingala", endNadi: "ida" },
      { number: 5, name: "Panchami", paksha: "shukla", startNadi: "pingala", endNadi: "ida" },
      { number: 6, name: "Shashthi", paksha: "shukla", startNadi: "pingala", endNadi: "ida" },
      { number: 7, name: "Saptami", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 8, name: "Ashtami", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 9, name: "Navami", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 10, name: "Dashami", paksha: "shukla", startNadi: "pingala", endNadi: "ida" },
      { number: 11, name: "Ekadashi", paksha: "shukla", startNadi: "pingala", endNadi: "ida" },
      { number: 12, name: "Dwadashi", paksha: "shukla", startNadi: "pingala", endNadi: "ida" },
      { number: 13, name: "Trayodashi", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 14, name: "Chaturdashi", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },
      { number: 15, name: "Purnima", paksha: "shukla", startNadi: "ida", endNadi: "pingala" },

      // Krishna Paksha
      { number: 16, name: "Pratipada", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 17, name: "Dwitiya", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 18, name: "Tritiya", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 19, name: "Chaturthi", paksha: "krishna", startNadi: "ida", endNadi: "pingala" },
      { number: 20, name: "Panchami", paksha: "krishna", startNadi: "ida", endNadi: "pingala" },
      { number: 21, name: "Shashthi", paksha: "krishna", startNadi: "ida", endNadi: "pingala" },
      { number: 22, name: "Saptami", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 23, name: "Ashtami", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 24, name: "Navami", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 25, name: "Dashami", paksha: "krishna", startNadi: "ida", endNadi: "pingala" },
      { number: 26, name: "Ekadashi", paksha: "krishna", startNadi: "ida", endNadi: "pingala" },
      { number: 27, name: "Dwadashi", paksha: "krishna", startNadi: "ida", endNadi: "pingala" },
      { number: 28, name: "Trayodashi", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 29, name: "Chaturdashi", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
      { number: 30, name: "Amavasya", paksha: "krishna", startNadi: "pingala", endNadi: "ida" },
    ];

    for (const exp of expectedRules) {
      const rule = getTithiSwaraRule(exp.number);
      assert.ok(rule, `Rule must exist for Tithi ${exp.number}`);
      assert.strictEqual(
        rule.tithiCycleNumber,
        exp.number,
        `Tithi cycle number must match for ${exp.name}`,
      );
      const expectedTithiNum = exp.number > 15 ? exp.number - 15 : exp.number;
      assert.strictEqual(
        rule.tithiNumber,
        expectedTithiNum,
        `Tithi number within paksha must match for ${exp.name}`,
      );
      assert.strictEqual(rule.paksha, exp.paksha, `Paksha must match for ${exp.name}`);
      assert.strictEqual(rule.startNadi, exp.startNadi, `Start nadi must match for ${exp.name}`);
      assert.strictEqual(rule.endNadi, exp.endNadi, `End nadi must match for ${exp.name}`);
      assert.strictEqual(
        getOppositeNadi(rule.startNadi),
        rule.endNadi,
        `endNadi must strictly equal opposite of startNadi for ${exp.name}`,
      );

      // Also test lookup with (paksha, tithiNumber)
      const rule2 = getTithiSwaraRule(exp.paksha, expectedTithiNum);
      assert.strictEqual(rule2.startNadi, exp.startNadi);
      assert.strictEqual(rule2.endNadi, exp.endNadi);
    }
  });

  // Test 2: Acceptance Example from requirement #17
  test("Requirement 17 Acceptance Example: Shukla Chaturthi", () => {
    // Shukla Chaturthi (tithi number 4)
    // Tithi Start: 10:35 AM
    // Tithi End: 08:20 PM
    const startMs = Date.UTC(2026, 4, 10, 10, 35, 0);
    const endMs = Date.UTC(2026, 4, 10, 20, 20, 0);

    const segment: Segment = {
      number: 4,
      name: "Chaturthi",
      startTimeMs: startMs,
      endTimeMs: endMs,
      starts: "10:35 AM",
      ends: "08:20 PM",
    };

    const swaraInfo = computeTithiSwaraEvents(segment, "UTC", startMs + 1000, "en");
    assert.ok(swaraInfo, "Swara info must be calculated");
    assert.strictEqual(swaraInfo.tithiNumber, 4);
    assert.strictEqual(swaraInfo.paksha, "shukla");
    assert.strictEqual(swaraInfo.startNadi, "pingala");
    assert.strictEqual(swaraInfo.endNadi, "ida");

    // Start Event: 10:35 AM → 11:35 AM, Pingala (Right Nostril)
    assert.ok(swaraInfo.startEvent, "Start event must exist");
    assert.strictEqual(swaraInfo.startEvent.startTimeMs, startMs);
    assert.strictEqual(swaraInfo.startEvent.endTimeMs, startMs + ONE_HOUR_MS);
    assert.strictEqual(swaraInfo.startEvent.durationMs, ONE_HOUR_MS);
    assert.strictEqual(swaraInfo.startEvent.nadi, "pingala");
    assert.match(swaraInfo.startEvent.formattedStart, /10:35/);
    assert.match(swaraInfo.startEvent.formattedEnd, /11:35/);
    assert.strictEqual(swaraInfo.startEvent.isActive, true);

    // End Event: 07:20 PM → 08:20 PM, Ida (Left Nostril)
    assert.ok(swaraInfo.endEvent, "End event must exist");
    assert.strictEqual(
      swaraInfo.endEvent.endTimeMs,
      endMs,
      "End event must strictly end at Tithi end",
    );
    assert.strictEqual(
      swaraInfo.endEvent.startTimeMs,
      endMs - ONE_HOUR_MS,
      "End event must start exactly 1 hour before Tithi end",
    );
    assert.strictEqual(swaraInfo.endEvent.durationMs, ONE_HOUR_MS);
    assert.strictEqual(swaraInfo.endEvent.nadi, "ida");
    assert.match(swaraInfo.endEvent.formattedStart, /07:20|7:20/);
    assert.match(swaraInfo.endEvent.formattedEnd, /08:20|8:20/);
    assert.strictEqual(swaraInfo.endEvent.isActive, false);

    assert.strictEqual(swaraInfo.hasOverlap, false, "Normal tithi should not have overlap");
  });

  // Test 3: Short Tithi overlap handling (< 2 hours)
  test("Short Tithi overlap handling when duration is less than 2 hours", () => {
    // 90-minute Tithi
    const startMs = Date.UTC(2026, 4, 10, 12, 0, 0);
    const endMs = startMs + 90 * 60 * 1000; // 1.5 hours

    const segment: Segment = {
      number: 1, // Shukla Pratipada -> Start: Ida, End: Pingala
      name: "Pratipada",
      startTimeMs: startMs,
      endTimeMs: endMs,
    };

    const swaraInfo = computeTithiSwaraEvents(segment, "UTC", startMs, "en");
    assert.ok(swaraInfo);
    assert.strictEqual(
      swaraInfo.hasOverlap,
      true,
      "Overlap must be flagged for < 2 hours duration",
    );

    // Start event: startMs to startMs + 1 hour
    assert.ok(swaraInfo.startEvent);
    assert.strictEqual(swaraInfo.startEvent.startTimeMs, startMs);
    assert.strictEqual(swaraInfo.startEvent.endTimeMs, startMs + ONE_HOUR_MS);

    // End event: endMs - 1 hour to endMs
    assert.ok(swaraInfo.endEvent);
    assert.strictEqual(swaraInfo.endEvent.startTimeMs, endMs - ONE_HOUR_MS);
    assert.strictEqual(swaraInfo.endEvent.endTimeMs, endMs);

    // Verify start event ends at +1 hour and end event ends strictly at Tithi end
    assert.strictEqual(swaraInfo.endEvent.endTimeMs, endMs);
    assert.strictEqual(swaraInfo.startEvent.endTimeMs, startMs + 3600000);
  });

  // Test 4: Midnight and Cross-Date Boundary
  test("Midnight and cross-date boundary calculation using Unix milliseconds", () => {
    // Starts at 23:30 UTC
    const startMs = Date.UTC(2026, 4, 10, 23, 30, 0);
    // Ends at 18:45 UTC next day
    const endMs = Date.UTC(2026, 4, 11, 18, 45, 0);

    const segment: Segment = {
      number: 15, // Purnima -> Start: Ida, End: Pingala
      name: "Purnima",
      startTimeMs: startMs,
      endTimeMs: endMs,
    };

    const swaraInfo = computeTithiSwaraEvents(segment, "UTC", startMs + 1000, "en");
    assert.ok(swaraInfo);
    assert.ok(swaraInfo.startEvent);

    // Start event spans across midnight: 23:30 to 00:30 next day
    assert.strictEqual(swaraInfo.startEvent.startTimeMs, startMs);
    assert.strictEqual(swaraInfo.startEvent.endTimeMs, startMs + ONE_HOUR_MS);
    assert.match(swaraInfo.startEvent.formattedStart, /11:30\s*PM/i);
    assert.match(swaraInfo.startEvent.formattedEnd, /12:30\s*AM/i);
  });

  // Test 5: Current event detection using Unix ms
  test("Current event active detection strictly follows startTimeMs <= nowMs && nowMs < endTimeMs", () => {
    const startTimeMs = 1000000000000;
    const endTimeMs = startTimeMs + ONE_HOUR_MS;

    const event = {
      type: "start" as const,
      nadi: "pingala" as const,
      nadiLabel: "Pingala (Right Nostril)",
      startTimeMs,
      endTimeMs,
      durationMs: ONE_HOUR_MS,
      formattedStart: "10:00 AM",
      formattedEnd: "11:00 AM",
      formattedRange: "10:00 AM → 11:00 AM",
      isActive: false,
    };

    // 1 ms before start -> Inactive
    assert.strictEqual(isTithiSwaraEventActive(event, startTimeMs - 1), false);

    // Exactly at start -> Active
    assert.strictEqual(isTithiSwaraEventActive(event, startTimeMs), true);

    // Midpoint -> Active
    assert.strictEqual(isTithiSwaraEventActive(event, startTimeMs + 1800000), true);

    // 1 ms before end -> Active
    assert.strictEqual(isTithiSwaraEventActive(event, endTimeMs - 1), true);

    // Exactly at end -> strictly INACTIVE!
    assert.strictEqual(isTithiSwaraEventActive(event, endTimeMs), false);

    // 1 ms after end -> Inactive
    assert.strictEqual(isTithiSwaraEventActive(event, endTimeMs + 1), false);
  });

  // Test 6: Missing boundary handling
  test("Graceful handling when Tithi start or end boundary is outside search bracket", () => {
    // Only start time known (e.g. extends past next sunrise)
    const startOnly: Segment = {
      number: 10,
      name: "Dashami",
      startTimeMs: 1700000000000,
    };
    const info1 = computeTithiSwaraEvents(startOnly, "UTC", 1700000000000, "en");
    assert.ok(info1.startEvent, "Start event should be computed when startTimeMs is present");
    assert.strictEqual(info1.endEvent, null, "End event should be null when endTimeMs is missing");
    assert.strictEqual(info1.hasOverlap, false);

    // Only end time known (e.g. started prior to search window)
    const endOnly: Segment = {
      number: 10,
      name: "Dashami",
      endTimeMs: 1700050000000,
    };
    const info2 = computeTithiSwaraEvents(endOnly, "UTC", 1700048000000, "en");
    assert.strictEqual(
      info2.startEvent,
      null,
      "Start event should be null when startTimeMs is missing",
    );
    assert.ok(info2.endEvent, "End event should be computed when endTimeMs is present");
    assert.strictEqual(info2.hasOverlap, false);
  });

  // Test 7: Exact 2 hours threshold
  test("Overlap flag strictly triggers only when Tithi duration < 2 hours", () => {
    const startMs = 1700000000000;

    // Exactly 2 hours: duration = 7,200,000 ms -> hasOverlap must be false
    const exact2Hours: Segment = {
      number: 5,
      startTimeMs: startMs,
      endTimeMs: startMs + 2 * ONE_HOUR_MS,
    };
    const infoExact = computeTithiSwaraEvents(exact2Hours, "UTC");
    assert.strictEqual(
      infoExact.hasOverlap,
      false,
      "2 hours duration must not be marked as overlap",
    );

    // 1 hour 59 minutes: duration = 7,140,000 ms -> hasOverlap must be true
    const under2Hours: Segment = {
      number: 5,
      startTimeMs: startMs,
      endTimeMs: startMs + (2 * ONE_HOUR_MS - 60000),
    };
    const infoUnder = computeTithiSwaraEvents(under2Hours, "UTC");
    assert.strictEqual(infoUnder.hasOverlap, true, "Duration < 2 hours must be marked as overlap");
  });

  // Test 8: Multilingual display labels
  test("Nadi labels localize accurately for English, Hindi, and Sanskrit", () => {
    const seg: Segment = {
      number: 1, // Shukla Pratipada -> start: Ida, end: Pingala
      startTimeMs: 1700000000000,
      endTimeMs: 1700050000000,
    };

    const en = computeTithiSwaraEvents(seg, "UTC", undefined, "en");
    assert.strictEqual(en.startEvent?.nadiLabel, "Ida (Left Nostril)");
    assert.strictEqual(en.endEvent?.nadiLabel, "Pingala (Right Nostril)");

    const hi = computeTithiSwaraEvents(seg, "UTC", undefined, "hi");
    assert.strictEqual(hi.startEvent?.nadiLabel, "इड़ा (बायां स्वर)");
    assert.strictEqual(hi.endEvent?.nadiLabel, "पिंगला (दायां स्वर)");

    const sa = computeTithiSwaraEvents(seg, "UTC", undefined, "sa");
    assert.strictEqual(sa.startEvent?.nadiLabel, "इडा (वामस्वरः)");
    assert.strictEqual(sa.endEvent?.nadiLabel, "पिङ्गला (दक्षिणस्वरः)");
  });
});
