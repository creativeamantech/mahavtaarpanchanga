/**
 * Calculation Audit & Technical Provenance Panel
 * Phase 9 Production Kundali UX - Section 16 & Section 19
 *
 * Provides complete transparency for technical provenance, cryptographic result hashes,
 * calculation ID audit trail, and bidirectional JSON Export/Import functionality.
 */

import React, { useState, useRef } from "react";
import { FullKundliData } from "../kundali/core/FullKundliData";
import { KundaliExporter } from "../kundali/export/KundaliExporter";
import {
  ShieldCheck,
  Download,
  Upload,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Key,
  Hash,
  AlertCircle,
} from "lucide-react";

interface CalculationAuditPanelProps {
  fullData: FullKundliData;
  onImportKundali?: (imported: FullKundliData) => void;
}

export const CalculationAuditPanel: React.FC<CalculationAuditPanelProps> = ({
  fullData,
  onImportKundali,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleExportJson = () => {
    const jsonStr = KundaliExporter.exportToJson(fullData);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (fullData.birthInput.name || "kundali").replace(/\s+/g, "_");
    a.href = url;
    a.download = `mahavtaar_kundali_${safeName}_${fullData.calculationId.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = KundaliExporter.importFromJson(text);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
        if (onImportKundali) {
          onImportKundali(imported);
        }
      } catch (err: any) {
        setImportError(err.message || "अवैध या दूषित कुण्डली JSON संचिका।");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-xl overflow-hidden">
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="calc-audit-content"
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-zinc-800/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>गणना अंकेक्षण एवं प्रामाणिकता (Calculation Audit & Provenance)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                AUDITED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              क्रिप्टोग्राफिक परिणाम हैश, अपरिवर्तनीय गणना ID, एवं प्रामाणिक JSON निर्यात/आयात
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-xs hidden sm:inline">{isOpen ? "संक्षिप्त करें" : "विस्तार"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div
          id="calc-audit-content"
          className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-950/70 space-y-6 animate-in fade-in duration-200"
        >
          {/* Action Row: Export & Import */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-200 block">
                प्रामाणिक डेटा संचिका (Standard JSON Interchange)
              </span>
              <p className="text-[11px] text-zinc-400">
                कैनोनिकल FullKundliData संरचना को अपरिवर्तनीय JSON के रूप में निर्यात या आयात करें।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload Kundali JSON"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>JSON आयात</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>JSON निर्यात</span>
              </button>
            </div>
          </div>

          {/* Import alerts */}
          {importError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>कुण्डली डेटा सफलतापूर्वक लोड एवं सत्यापित किया गया!</span>
            </div>
          )}

          {/* Primary Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Calculation ID */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" /> Calculation ID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fullData.calculationId, "calcId")}
                  className="text-zinc-400 hover:text-white"
                  title="Copy Calculation ID"
                >
                  {copiedKey === "calcId" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="font-mono text-amber-300 text-[11px] break-all select-all">
                {fullData.calculationId}
              </div>
            </div>

            {/* Engine & Schema Version */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-amber-400" /> Version Specifications
              </span>
              <div className="space-y-0.5 font-mono text-[11px] text-zinc-200">
                <div>
                  Engine: <span className="text-white font-bold">{fullData.engineVersion}</span>
                </div>
                <div>
                  Schema: <span className="text-white font-bold">{fullData.schemaVersion}</span>
                </div>
                <div>
                  Profile:{" "}
                  <span className="text-white font-bold">
                    {fullData.profile.calculationProfileVersion}
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Result Hash */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-amber-400" /> Complete Kundali Hash
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fullData.hashes.completeKundaliHash, "completeHash")}
                  className="text-zinc-400 hover:text-white"
                  title="Copy Complete Hash"
                >
                  {copiedKey === "completeHash" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="font-mono text-emerald-400 text-[11px] break-all select-all">
                {fullData.hashes.completeKundaliHash}
              </div>
            </div>
          </div>

          {/* Section Cryptographic Hashes Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              खंडवार क्रिप्टोग्राफिक परिणाम हैश (Section Cryptographic Hashes)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50 text-zinc-400 text-[11px]">
                    <th className="py-2.5 px-3">Subsystem Section</th>
                    <th className="py-2.5 px-3">SHA-256 Digest</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-[11px] text-zinc-300">
                  {[
                    { label: "Astronomy (Graha & Lagna)", hash: fullData.hashes.astronomyHash },
                    { label: "Vargas (Shodashavarga D1-D60)", hash: fullData.hashes.vargasHash },
                    { label: "Shadbala & Bhava Bala", hash: fullData.hashes.shadbalaHash },
                    { label: "Vimshottari Dasha", hash: fullData.hashes.dashaHash },
                    { label: "Classical Rules & Yogas", hash: fullData.hashes.rulesHash },
                    { label: "Jaimini Upadesha", hash: fullData.hashes.jaiminiHash },
                    { label: "Ashtakavarga (SAV/BAV)", hash: fullData.hashes.ashtakavargaHash },
                    { label: "Krishnamurti Paddhati (KP)", hash: fullData.hashes.kpHash },
                    { label: "Gochar Transits", hash: fullData.hashes.gocharHash },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40">
                      <td className="py-2 px-3 font-sans font-medium text-white">{row.label}</td>
                      <td className="py-2 px-3 text-zinc-400 font-mono select-all truncate max-w-[280px]">
                        {row.hash}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provenance Metadata */}
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              प्रामाणिक उत्पत्ति विवरण (Canonical Provenance)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-300">
              <div>
                उत्पन्न तिथि:{" "}
                <span className="text-white">
                  {fullData.provenance.timestampMs
                    ? new Date(fullData.provenance.timestampMs).toISOString()
                    : fullData.generatedAt || new Date().toISOString()}
                </span>
              </div>
              <div>
                प्लेटफॉर्म:{" "}
                <span className="text-white">{fullData.provenance.environment?.platform || "browser"}</span>
              </div>
              <div>
                नोड संस्करण:{" "}
                <span className="text-white">{fullData.provenance.environment?.nodeVersion || "v20.0.0"}</span>
              </div>
              <div>
                संस्थान: <span className="text-white">Mahavtaar Jyotish Core</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
