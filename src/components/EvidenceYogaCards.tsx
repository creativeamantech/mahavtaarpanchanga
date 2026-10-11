/**
 * Evidence-Based Classical Yoga & Rule Cards
 * Phase 9 Production Kundali UX - Section 11
 *
 * Implements transparent, evidence-based Parashari Yoga & Rule presentation
 * without subjective predictions or pseudo-mystical prose.
 */

import React, { useState, useMemo } from "react";
import { RuleResult, YogaCategory } from "../kundali/rules/RuleTypes";
import { Award, CheckCircle2, XCircle, AlertTriangle, BookOpen, Search } from "lucide-react";

interface EvidenceYogaCardsProps {
  rules: RuleResult[];
}

export const EvidenceYogaCards: React.FC<EvidenceYogaCardsProps> = ({ rules = [] }) => {
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "mitigated" | "absent">(
    "present",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    rules.forEach((r) => {
      if (Array.isArray(r.category)) {
        r.category.forEach((c) => set.add(c));
      } else if (r.category) {
        set.add(r.category);
      }
    });
    return ["all", ...Array.from(set)];
  }, [rules]);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Status filter
      if (statusFilter === "present" && rule.status !== "PRESENT") return false;
      if (
        statusFilter === "mitigated" &&
        rule.status !== "CANCELLED" &&
        (rule.status as string) !== "MITIGATED"
      )
        return false;
      if (statusFilter === "absent" && rule.status !== "ABSENT") return false;

      // Category filter
      if (selectedCategory !== "all") {
        const cats = Array.isArray(rule.category) ? rule.category : [rule.category];
        if (!cats.includes(selectedCategory as YogaCategory)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameEn = (rule.nameEn || (rule as any).ruleNameEn || "").toLowerCase();
        const nameHi = (rule.nameHi || (rule as any).ruleNameHi || "").toLowerCase();
        const nameSa = (rule.nameSa || (rule as any).ruleNameSa || "").toLowerCase();
        const rId = (rule.ruleId || "").toLowerCase();
        const src = (rule.source || "").toLowerCase();
        const matches =
          nameEn.includes(q) ||
          nameHi.includes(q) ||
          nameSa.includes(q) ||
          rId.includes(q) ||
          src.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [rules, statusFilter, selectedCategory, searchQuery]);

  const presentCount = useMemo(() => rules.filter((r) => r.status === "PRESENT").length, [rules]);
  const mitigatedCount = useMemo(
    () =>
      rules.filter((r) => r.status === "CANCELLED" || (r.status as string) === "MITIGATED").length,
    [rules],
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              शास्त्रीय योग एवं ग्रह संयोजन (Evidence-Based Classical Yogas)
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            बृहत्पाराशर होराशास्त्र, सारावली एवं जातक पारिजात अनुसार प्रामाणिक शास्त्रीय सूत्रों का
            साक्ष्य-सत्यापित विश्लेषण
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700">
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              उपस्थित योग (Present)
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">{presentCount}</span>
          </div>
          <div className="h-7 w-px bg-zinc-700"></div>
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              शमित / निष्प्रभावी
            </span>
            <span className="text-lg font-black text-amber-400 font-mono">{mitigatedCount}</span>
          </div>
          <div className="h-7 w-px bg-zinc-700"></div>
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block uppercase font-bold">
              परीक्षित सूत्र
            </span>
            <span className="text-lg font-black text-zinc-300 font-mono">{rules.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Segmented Buttons */}
          <div className="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("present")}
              className={`min-h-[36px] px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "present"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              उपस्थित ({presentCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("mitigated")}
              className={`min-h-[36px] px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "mitigated"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              शमित ({mitigatedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`min-h-[36px] px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-zinc-700 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              सभी ({rules.length})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-amber-500 cursor-pointer min-h-[36px]"
              aria-label="Filter Yogas by Category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  वर्ग: {c === "all" ? "सभी वर्ग (All)" : c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="योग अथवा सूत्र खोजें..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 min-h-[36px]"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-xs">
          चयनित फिल्टर के अनुसार कोई योग उपलब्ध नहीं है।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const isPresent = rule.status === "PRESENT";
            const isMitigated =
              rule.status === "CANCELLED" || (rule.status as string) === "MITIGATED";
            const nameHi = rule.nameHi || (rule as any).ruleNameHi || "";
            const nameEn = rule.nameEn || (rule as any).ruleNameEn || rule.ruleId;
            const nameSa = rule.nameSa || (rule as any).ruleNameSa || "";
            const catLabel = Array.isArray(rule.category)
              ? rule.category.join(", ")
              : rule.category || "Classical";
            const desc = rule.descriptionHi || rule.descriptionEn || "शास्त्रीय सूत्र विधान";
            const evidenceList = rule.matchedConditions || (rule as any).evidence || [];
            const failedList = rule.failedConditions || [];
            const cancellationsList =
              rule.cancellationsTriggered || (rule as any).cancellations || [];

            return (
              <div
                key={rule.ruleId}
                className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all ${
                  isPresent
                    ? "bg-zinc-900/90 border-emerald-800/80 hover:border-emerald-600"
                    : isMitigated
                      ? "bg-zinc-900/90 border-amber-800/80 hover:border-amber-600"
                      : "bg-zinc-900/50 border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">
                        {nameHi ? `${nameHi} (` : ""}
                        {nameEn}
                        {nameHi ? ")" : ""}
                      </h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {catLabel}
                      </span>
                    </div>
                    {nameSa && (
                      <div className="text-[11px] text-amber-400/90 font-serif italic mt-0.5">
                        {nameSa}
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${
                      isPresent
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                        : isMitigated
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {isPresent
                      ? "उपस्थित (Active)"
                      : isMitigated
                        ? "शमित (Mitigated)"
                        : "अनुपस्थित (Absent)"}
                  </span>
                </div>

                {/* Evidence & Classical Conditions */}
                <div className="space-y-2 text-xs">
                  {/* Classical Condition Description */}
                  <div className="text-zinc-300 leading-relaxed text-[11px]">
                    <span className="font-semibold text-zinc-200">शास्त्रीय लक्षण: </span>
                    {desc}
                  </div>

                  {/* Specific Evidence */}
                  {evidenceList.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        संतुष्ट शर्तें एवं गणितीय साक्ष्य (Satisfied Conditions)
                      </span>
                      <ul className="space-y-0.5 text-[11px] text-zinc-300">
                        {evidenceList.map((ev: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Failed Conditions where applicable */}
                  {!isPresent && failedList.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-zinc-500" />
                        असंतुष्ट शर्तें (Unsatisfied Conditions)
                      </span>
                      <ul className="space-y-0.5 text-[11px] text-zinc-400">
                        {failedList.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-zinc-600 font-bold">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cancellations / Exceptions */}
                  {cancellationsList.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        शमन अथवा अपवाद (Exceptions / Cancellations)
                      </span>
                      <ul className="space-y-0.5 text-[11px] text-amber-200">
                        {cancellationsList.map((c: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Source and Rule ID */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>{rule.source || "Classical BPHS Corpus"}</span>
                    </span>
                    <span className="font-mono text-zinc-500">ID: {rule.ruleId}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
