import { DashaPeriod, BirthDashaBalance, DashaTimeline } from "../types/DashaTypes";
import { VIMSHOTTARI_LORDS, getLordIndex } from "./VimshottariSequence";

export interface ValidationIssue {
  field: string;
  severity: "error" | "warning";
  message: string;
  expected?: unknown;
  actual?: unknown;
}

/**
 * Validates birth dasha balance mathematical invariants
 */
export function validateBirthBalance(balance: BirthDashaBalance): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const fractionSum = balance.elapsedFraction + balance.remainingFraction;
  if (Math.abs(fractionSum - 1.0) > 1e-7) {
    issues.push({
      field: "fractionSum",
      severity: "error",
      message: `Elapsed fraction (${balance.elapsedFraction}) + Remaining fraction (${balance.remainingFraction}) must equal 1.0`,
      expected: 1.0,
      actual: fractionSum,
    });
  }

  const lordIdx = getLordIndex(balance.lord);
  const maxYears = VIMSHOTTARI_LORDS[lordIdx].years;

  if (balance.remainingYearsTotal < 0 || balance.remainingYearsTotal > maxYears + 1e-6) {
    issues.push({
      field: "remainingYearsTotal",
      severity: "error",
      message: `Remaining years (${balance.remainingYearsTotal}) out of bounds for lord ${balance.lord} (0 to ${maxYears})`,
      expected: `0 <= remaining <= ${maxYears}`,
      actual: balance.remainingYearsTotal,
    });
  }

  if (balance.months < 0 || balance.months >= 12) {
    issues.push({
      field: "balanceMonths",
      severity: "error",
      message: `Balance months (${balance.months}) must be between 0 and 11`,
      actual: balance.months,
    });
  }

  if (balance.days < 0 || balance.days > 31) {
    issues.push({
      field: "balanceDays",
      severity: "error",
      message: `Balance days (${balance.days}) must be between 0 and 31`,
      actual: balance.days,
    });
  }

  return issues;
}

/**
 * Validates parent-child nested continuity and mathematical conservation invariants:
 * 1. Start(Child_0) === Start(Parent)
 * 2. End(Child_last) === End(Parent)
 * 3. End(Child_j) === Start(Child_{j+1})
 * 4. Sum(Child durations ms) === Parent duration ms
 */
export function validateNestedPeriods(
  parent: DashaPeriod,
  children: DashaPeriod[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!children || children.length === 0) {
    return issues;
  }

  if (children.length !== 9) {
    issues.push({
      field: "childrenCount",
      severity: "warning",
      message: `Expected 9 sub-periods for Parashari Vimshottari tier, found ${children.length}`,
      expected: 9,
      actual: children.length,
    });
  }

  // 1. Start alignment
  const firstChild = children[0];
  if (Math.abs(firstChild.startTimestampMs - parent.startTimestampMs) > 1) {
    issues.push({
      field: "startAlignment",
      severity: "error",
      message: `First child start (${firstChild.startTimestampMs}) does not match parent start (${parent.startTimestampMs})`,
      expected: parent.startTimestampMs,
      actual: firstChild.startTimestampMs,
    });
  }

  // 2. End alignment
  const lastChild = children[children.length - 1];
  if (Math.abs(lastChild.endTimestampMs - parent.endTimestampMs) > 1) {
    issues.push({
      field: "endAlignment",
      severity: "error",
      message: `Last child end (${lastChild.endTimestampMs}) does not match parent end (${parent.endTimestampMs})`,
      expected: parent.endTimestampMs,
      actual: lastChild.endTimestampMs,
    });
  }

  // 3. Contiguity between adjacent children
  for (let i = 0; i < children.length - 1; i++) {
    const cur = children[i];
    const nxt = children[i + 1];
    if (Math.abs(cur.endTimestampMs - nxt.startTimestampMs) > 1) {
      issues.push({
        field: "childContiguity",
        severity: "error",
        message: `Gap or overlap between child ${cur.lord} end (${cur.endTimestampMs}) and child ${nxt.lord} start (${nxt.startTimestampMs})`,
      });
    }
  }

  // 4. Sum of durations
  const sumMs = children.reduce((acc, c) => acc + (c.endTimestampMs - c.startTimestampMs), 0);
  const parentMs = parent.endTimestampMs - parent.startTimestampMs;
  if (Math.abs(sumMs - parentMs) > 2) {
    issues.push({
      field: "durationConservation",
      severity: "error",
      message: `Sum of child durations (${sumMs} ms) does not match parent duration (${parentMs} ms)`,
      expected: parentMs,
      actual: sumMs,
    });
  }

  // 5. Verify lord sub-sequence begins with parent lord
  if (firstChild.lord !== parent.lord) {
    issues.push({
      field: "subLordSequenceStart",
      severity: "error",
      message: `First sub-lord (${firstChild.lord}) must match parent lord (${parent.lord})`,
      expected: parent.lord,
      actual: firstChild.lord,
    });
  }

  return issues;
}

/**
 * Validates an entire DashaTimeline
 */
export function validateTimeline(timeline: DashaTimeline): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Validate birth balance
  issues.push(...validateBirthBalance(timeline.balanceAtBirth));

  // Validate Level 1 periods
  const periods = timeline.periods;
  if (periods.length === 0) {
    issues.push({
      field: "periods",
      severity: "error",
      message: "Timeline contains no Mahadasha periods",
    });
    return issues;
  }

  // Start must equal birth timestamp
  if (Math.abs(periods[0].startTimestampMs - timeline.birthTimestampMs) > 1) {
    issues.push({
      field: "birthStart",
      severity: "error",
      message: `First Mahadasha start does not match birth timestamp`,
    });
  }

  // Adjacent Mahadashas must be contiguous
  for (let i = 0; i < periods.length - 1; i++) {
    const cur = periods[i];
    const nxt = periods[i + 1];
    if (Math.abs(cur.endTimestampMs - nxt.startTimestampMs) > 1) {
      issues.push({
        field: "mahadashaContiguity",
        severity: "error",
        message: `Gap/overlap between Mahadasha ${cur.lord} and ${nxt.lord}`,
      });
    }
  }

  // Recursively validate nested children if present
  function checkChildren(parent: DashaPeriod) {
    if (parent.children && parent.children.length > 0) {
      issues.push(...validateNestedPeriods(parent, parent.children));
      parent.children.forEach(checkChildren);
    }
  }

  periods.forEach(checkChildren);

  return issues;
}
