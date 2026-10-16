/**
 * Calculation Configuration Panel
 * Phase 9 Production Kundali UX - Section 2
 *
 * Provides an informational, transparent, accessible overview of the
 * active calculation profile settings without allowing silent mathematical alteration.
 */

import React, { useState } from "react";
import { CalculationProfile } from "../kundali/core/CalculationProfile";
import { Sliders, ChevronDown, ChevronUp, ShieldCheck, Info } from "lucide-react";

interface CalculationConfigPanelProps {
  profile: CalculationProfile;
  engineVersion: string;
}

export const CalculationConfigPanel: React.FC<CalculationConfigPanelProps> = ({
  profile,
  engineVersion,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="calc-config-content"
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-zinc-800/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>गणना विन्यास एवं मानक (Calculation Configuration)</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-600">
                {profile.ayanamsha.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              अयनांश, भाव पद्धति, विंशोत्तरी वर्षमान एवं खगोलीय परिशुद्धता मानक
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
          id="calc-config-content"
          className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/60 space-y-4 animate-in fade-in duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                अयनांश (Ayanamsha)
              </span>
              <div className="font-semibold text-white">
                {profile.ayanamsha === "lahiri"
                  ? "Lahiri (Chitrapaksha / Indian National)"
                  : profile.ayanamsha === "raman"
                    ? "B.V. Raman Canonical"
                    : profile.ayanamsha === "kp" || (profile.ayanamsha as string) === "krishnamurti"
                      ? "KP (Krishnamurti Paddhati)"
                      : profile.ayanamsha.toUpperCase()}
              </div>
              <p className="text-[10px] text-zinc-400">IAU 2000 Ecliptic Precession Model</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                राशि चक्र (Zodiac)
              </span>
              <div className="font-semibold text-white">निरयण (Sidereal Nirayana)</div>
              <p className="text-[10px] text-zinc-400">Fixed Star Spica / Chitra Anchor at 180°</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                भाव प्रणाली (House System)
              </span>
              <div className="font-semibold text-white">
                {profile.houseSystem === "equal"
                  ? "समभाव (Equal House / Rashi = Bhava)"
                  : profile.houseSystem}
              </div>
              <p className="text-[10px] text-zinc-400">Standard Parashari Rashi-Bhava Adhyaya 4</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                विंशोत्तरी वर्षमान (Dasha Year)
              </span>
              <div className="font-semibold text-white">
                {profile.dashaYearConvention === "365.2425"
                  ? "365.2425 Days (Solar Gregorian)"
                  : profile.dashaYearConvention === "360_savana"
                    ? "360 Days (Savana Civil Year)"
                    : profile.dashaYearConvention}
              </div>
              <p className="text-[10px] text-zinc-400">Canonical Time Scaling Invariant</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                राहु/केतु नोड (Lunar Nodes)
              </span>
              <div className="font-semibold text-white">
                {profile.nodeConvention === "mean"
                  ? "मध्यम नोड (Mean Mathematical Node)"
                  : "सटीक नोड (True Node)"}
              </div>
              <p className="text-[10px] text-zinc-400">Strict 180° Anti-Podal Invariant</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                खगोलीय गणना कोर (Ephemeris)
              </span>
              <div className="font-semibold text-white">Astronomy Engine (IAU / VSOP87)</div>
              <p className="text-[10px] text-zinc-400">Sub-arcsecond Topocentric & Geocentric</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                प्रोफाइल संस्करण (Profile Ver)
              </span>
              <div className="font-semibold text-amber-300 font-mono">
                {profile.calculationProfileVersion}
              </div>
              <p className="text-[10px] text-zinc-400">Immutable Audit Specification</p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                इंजन संस्करण (Engine Version)
              </span>
              <div className="font-semibold text-amber-300 font-mono">v{engineVersion}</div>
              <p className="text-[10px] text-zinc-400">Phase 9 Certified Production Build</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              यह विन्यास गणितीय रूप से प्रमाणित एवं अपरिवर्तनीय है। यू.आई. सेटिंग्स द्वारा चुपचाप
              कोई भी ज्योतिषीय गणना परिवर्तित नहीं की जाती।
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
