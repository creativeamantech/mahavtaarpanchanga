import React, { useState, useEffect } from "react";
import { Moon, Star, Compass, Sparkles, Sun, Wind } from "lucide-react";
import type { PanchangaResponse, Segment, AppTheme } from "../types";
import { computeTithiSwaraEvents, isTithiSwaraEventActive } from "../lib/tithiSwaraEngine";
import {
  type Language,
  translations,
  getLocalizedTithi,
  getLocalizedNakshatra,
  getLocalizedYoga,
  getLocalizedKarana,
  getLocalizedVaara,
} from "../i18n";
import {
  TITHI_ATTRIBUTES,
  NAKSHATRA_ATTRIBUTES,
  YOGA_ATTRIBUTES,
  KARANA_ATTRIBUTES,
} from "../vedicData";

interface FiveAngasCardProps {
  data: PanchangaResponse;
  lang: Language;
  theme?: AppTheme;
}

export const FiveAngasCard: React.FC<FiveAngasCardProps> = ({ data, lang, theme }) => {
  const isNight = theme === "nightSky";
  const t = translations[lang];

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const primaryTithiNum = data.tithi[0]?.number || 1;
  const tithiMod = ((primaryTithiNum - 1) % 15) + 1;
  const tithiAttr = TITHI_ATTRIBUTES[primaryTithiNum === 30 ? 30 : tithiMod];

  const primaryNakNum = data.nakshatra[0]?.number || 1;
  const nakAttr = NAKSHATRA_ATTRIBUTES[primaryNakNum];

  const primaryYogaNum = data.yoga[0]?.number || 1;
  const yogaAttr = YOGA_ATTRIBUTES[primaryYogaNum];

  const primaryKarNum = data.karana[0]?.number || 1;
  const karMod = ((primaryKarNum - 1) % 11) + 1;
  const karAttr = KARANA_ATTRIBUTES[karMod];

  const renderSegment = (
    segments: Segment[],
    defaultName: string,
    localizeFn?: (num: number, raw: string, lang: Language) => string,
    isTithi: boolean = false,
  ) => {
    if (!segments || segments.length === 0) {
      return (
        <div
          className={`text-base font-bold font-devanagari ${isNight ? "text-slate-100" : "text-stone-900"}`}
        >
          {defaultName}
        </div>
      );
    }

    const primary = segments[0];
    const secondary = segments.length > 1 ? segments[1] : null;

    const primaryLocalized =
      localizeFn && primary.number != null
        ? localizeFn(primary.number, primary.name, lang)
        : primary.name;

    const secondaryLocalized =
      secondary && localizeFn && secondary.number != null
        ? localizeFn(secondary.number, secondary.name, lang)
        : secondary?.name;

    const renderTithiSwaraEvents = (seg: Segment) => {
      const swara =
        seg.tithiSwara ||
        computeTithiSwaraEvents(
          seg,
          data.timezone,
          nowMs,
          lang === "sa" ? "sa" : lang === "hi" ? "hi" : "en",
        );
      if (!swara || (!swara.startEvent && !swara.endEvent)) return null;

      const isStartActive = swara.startEvent
        ? isTithiSwaraEventActive(swara.startEvent, nowMs)
        : false;
      const isEndActive = swara.endEvent ? isTithiSwaraEventActive(swara.endEvent, nowMs) : false;

      return (
        <div className="mt-2 pt-2 border-t border-dashed border-stone-200/90 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span
              className={`flex items-center gap-1 font-bold ${
                isNight ? "text-amber-300" : "text-amber-900"
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>
                {lang === "hi"
                  ? "स्वर (नाड़ी) घटनाएं"
                  : lang === "sa"
                    ? "स्वर (नाडी) घटनाः"
                    : "Swara (Nadi) Events"}
              </span>
            </span>
            {swara.hasOverlap && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                  isNight
                    ? "bg-amber-950/60 text-amber-300 border-amber-700/60"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}
              >
                {lang === "hi" ? "संक्षिप्त तिथि (<२ घं)" : "Short Tithi (<2h Overlap)"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {/* Start Event */}
            {swara.startEvent ? (
              <div
                className={`rounded-lg p-2 text-[11px] border flex flex-col justify-between gap-1 transition-all ${
                  isStartActive
                    ? isNight
                      ? "bg-amber-950/70 border-amber-500 shadow-xs ring-1 ring-amber-400/50"
                      : "bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400/50"
                    : isNight
                      ? "bg-slate-900/50 border-slate-800 text-slate-300"
                      : "bg-stone-50/80 border-stone-200/70 text-stone-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-stone-500 dark:text-slate-400">
                    {lang === "hi" ? "आरंभ स्वर" : lang === "sa" ? "आरम्भस्वरः" : "Start Event"}
                  </span>
                  {isStartActive && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-amber-600 text-white animate-pulse">
                      Active Now
                    </span>
                  )}
                </div>
                <div
                  className={`font-mono text-xs font-semibold ${
                    isNight ? "text-slate-100" : "text-stone-900"
                  }`}
                >
                  {swara.startEvent.formattedRange ||
                    `${swara.startEvent.formattedStart} → ${swara.startEvent.formattedEnd}`}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold ${
                      swara.startEvent.nadi === "pingala"
                        ? isNight
                          ? "text-amber-300"
                          : "text-amber-800"
                        : isNight
                          ? "text-cyan-300"
                          : "text-sky-800"
                    }`}
                  >
                    {swara.startEvent.nadiLabel}
                  </span>
                  <span className={`text-[9px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
                    1 hour
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-lg p-2 text-[11px] border ${
                  isNight
                    ? "bg-slate-900/40 border-slate-800 text-slate-500"
                    : "bg-stone-50/60 border-stone-200/50 text-stone-400"
                }`}
              >
                <div className="font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-slate-500">
                  {lang === "hi" ? "आरंभ स्वर" : lang === "sa" ? "आरम्भस्वरः" : "Start Event"}
                </div>
                <div className="text-[10px] italic">Before search bracket</div>
              </div>
            )}

            {/* End Event */}
            {swara.endEvent ? (
              <div
                className={`rounded-lg p-2 text-[11px] border flex flex-col justify-between gap-1 transition-all ${
                  isEndActive
                    ? isNight
                      ? "bg-amber-950/70 border-amber-500 shadow-xs ring-1 ring-amber-400/50"
                      : "bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400/50"
                    : isNight
                      ? "bg-slate-900/50 border-slate-800 text-slate-300"
                      : "bg-stone-50/80 border-stone-200/70 text-stone-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-stone-500 dark:text-slate-400">
                    {lang === "hi" ? "अंतिम स्वर" : lang === "sa" ? "अन्तिमस्वरः" : "End Event"}
                  </span>
                  {isEndActive && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-amber-600 text-white animate-pulse">
                      Active Now
                    </span>
                  )}
                </div>
                <div
                  className={`font-mono text-xs font-semibold ${
                    isNight ? "text-slate-100" : "text-stone-900"
                  }`}
                >
                  {swara.endEvent.formattedRange ||
                    `${swara.endEvent.formattedStart} → ${swara.endEvent.formattedEnd}`}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold ${
                      swara.endEvent.nadi === "pingala"
                        ? isNight
                          ? "text-amber-300"
                          : "text-amber-800"
                        : isNight
                          ? "text-cyan-300"
                          : "text-sky-800"
                    }`}
                  >
                    {swara.endEvent.nadiLabel}
                  </span>
                  <span className={`text-[9px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
                    Final 1 hr
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-lg p-2 text-[11px] border ${
                  isNight
                    ? "bg-slate-900/40 border-slate-800 text-slate-500"
                    : "bg-stone-50/60 border-stone-200/50 text-stone-400"
                }`}
              >
                <div className="font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-slate-500">
                  {lang === "hi" ? "अंतिम स्वर" : lang === "sa" ? "अन्तिमस्वरः" : "End Event"}
                </div>
                <div className="text-[10px] italic">Past next sunrise</div>
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-1.5">
          <span
            className={`text-base sm:text-lg font-bold font-devanagari ${isNight ? "text-slate-100" : "text-stone-950"}`}
          >
            {primaryLocalized}
          </span>
          {primary.starts ? (
            <div
              className={`flex flex-col text-[10px] sm:text-[11px] font-mono text-right ${isNight ? "text-amber-200" : "text-amber-900"}`}
            >
              <span>Starts: {primary.starts}</span>
              <span>Ends: {primary.ends || "—"}</span>
            </div>
          ) : primary.ends ? (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border font-mono ${
                isNight
                  ? "bg-amber-950/70 text-amber-200 border-amber-700/60"
                  : "bg-amber-100/90 text-amber-900 border-amber-300/80"
              }`}
            >
              {t.endsAt} {primary.ends}
            </span>
          ) : (
            <span className={`text-[11px] italic ${isNight ? "text-slate-400" : "text-stone-400"}`}>
              {t.throughoutDay}
            </span>
          )}
        </div>

        {/* Transliterated / Secondary English name if in Devanagari */}
        {lang !== "en" && primary.name !== primaryLocalized && (
          <div
            className={`text-xs font-sans tracking-wide ${isNight ? "text-slate-400" : "text-stone-500"}`}
          >
            {primary.name}
          </div>
        )}

        {/* Primary Tithi Swara Events */}
        {isTithi && renderTithiSwaraEvents(primary)}

        {secondary && (
          <div
            className={`mt-1 rounded-md p-2 text-xs border flex flex-col gap-0.5 ${
              isNight
                ? "bg-slate-900/60 text-slate-200 border-slate-700/60"
                : "bg-amber-50/70 text-stone-700 border-amber-200/60"
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] ${isNight ? "text-slate-400" : "text-stone-500"}`}
            >
              <span
                className={`font-medium uppercase tracking-wider ${isNight ? "text-amber-300" : "text-amber-900"}`}
              >
                {t.followedBy}:
              </span>
              {secondary.starts ? (
                <div
                  className={`flex flex-col text-[10px] sm:text-[11px] font-mono text-right ${isNight ? "text-amber-300/80" : "text-amber-800"}`}
                >
                  <span>Starts: {secondary.starts}</span>
                  <span>Ends: {secondary.ends || "—"}</span>
                </div>
              ) : secondary.ends ? (
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border font-mono ${
                    isNight
                      ? "bg-amber-950/40 text-amber-300/80 border-amber-800/40"
                      : "bg-amber-50/80 text-amber-800 border-amber-200/60"
                  }`}
                >
                  {t.endsAt} {secondary.ends}
                </span>
              ) : (
                <span className={`italic ${isNight ? "text-slate-400" : "text-stone-400"}`}>
                  ({t.throughoutDay})
                </span>
              )}
            </div>
            <div
              className={`font-semibold font-devanagari ${isNight ? "text-slate-100" : "text-stone-900"}`}
            >
              {secondaryLocalized}
            </div>

            {/* Secondary Tithi Swara Events */}
            {isTithi && renderTithiSwaraEvents(secondary)}
          </div>
        )}
      </div>
    );
  };

  const getVaaraDetails = (vaara: string) => {
    switch (vaara) {
      case "Ravivāra":
        return {
          deity:
            lang === "sa"
              ? "सूर्यः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: सूर्य देव"
                : "Ruled by Sūrya (Sun)",
          metal:
            lang === "sa"
              ? "ताम्रम् • माणिक्यम्"
              : lang === "hi"
                ? "तांबा • माणिक"
                : "Copper • Ruby",
        };
      case "Somavāra":
        return {
          deity:
            lang === "sa"
              ? "चन्द्रः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: चन्द्र देव"
                : "Ruled by Candra (Moon)",
          metal:
            lang === "sa"
              ? "रजतम् • मुक्ताफलम्"
              : lang === "hi"
                ? "चांदी • मोती"
                : "Silver • Pearl",
        };
      case "Maṅgalavāra":
        return {
          deity:
            lang === "sa"
              ? "मङ्गलः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: मङ्गल देव"
                : "Ruled by Maṅgala (Mars)",
          metal:
            lang === "sa"
              ? "ताम्रम् • प्रवालम्"
              : lang === "hi"
                ? "तांबा • मूंगा"
                : "Copper • Red Coral",
        };
      case "Budhavāra":
        return {
          deity:
            lang === "sa"
              ? "बुधः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: बुध देव"
                : "Ruled by Budha (Mercury)",
          metal:
            lang === "sa"
              ? "कांस्यम् • मरकतम्"
              : lang === "hi"
                ? "कांसा • पन्ना"
                : "Bronze • Emerald",
        };
      case "Guruvāra":
        return {
          deity:
            lang === "sa"
              ? "बृहस्पतिः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: बृहस्पति (गुरु)"
                : "Ruled by Bṛhaspati (Jupiter)",
          metal:
            lang === "sa"
              ? "सुवर्णम् • पुखराजम्"
              : lang === "hi"
                ? "स्वर्ण • पुखराज"
                : "Gold • Yellow Sapphire",
        };
      case "Śukravāra":
        return {
          deity:
            lang === "sa"
              ? "शुक्रः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: शुक्र देव"
                : "Ruled by Śukra (Venus)",
          metal:
            lang === "sa" ? "रजतम् • वज्रम्" : lang === "hi" ? "चांदी • हीरा" : "Silver • Diamond",
        };
      case "Śanivāra":
        return {
          deity:
            lang === "sa"
              ? "शनैश्चरः अधिपतिः"
              : lang === "hi"
                ? "स्वामी: शनि देव"
                : "Ruled by Śani (Saturn)",
          metal:
            lang === "sa"
              ? "अयः • नीलमणिः"
              : lang === "hi"
                ? "लोहा • नीलम"
                : "Iron • Blue Sapphire",
        };
      default:
        return { deity: "Solar Weekday", metal: "—" };
    }
  };

  const localizedVaara = getLocalizedVaara(data.vaara, lang);
  const vaaraInfo = getVaaraDetails(data.vaara);

  return (
    <div
      id="five-angas-card"
      className={`glass-card rounded-[1.5rem] p-6 sm:p-8 transition-colors ${
        isNight
          ? "border-indigo-800/50 bg-[#0e1424]/90 text-slate-100"
          : "border border-amber-300/50 bg-gradient-to-b from-amber-50/40 via-white/50 to-orange-50/30"
      }`}
    >
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3.5 gap-2 ${
          isNight ? "border-indigo-800/40" : "border-amber-200/70"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs font-serif-vedic text-base font-bold">
            ॐ
          </div>
          <div>
            <h2
              className={`text-lg font-bold font-serif-vedic tracking-tight ${
                isNight ? "text-amber-200" : "text-stone-900"
              }`}
            >
              {t.limbsTitle}
            </h2>
            <p className={`text-xs font-sans ${isNight ? "text-slate-400" : "text-stone-500"}`}>
              {t.limbsSubtitle}
            </p>
          </div>
        </div>
        <div
          className={`text-xs font-mono px-3 py-1 rounded-full border self-start sm:self-auto ${
            isNight
              ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
              : "text-amber-900/80 bg-amber-100/60 border-amber-300/60"
          }`}
        >
          JD: {data.sunrise_jd?.toFixed(4)}
        </div>
      </div>

      {/* Five Limbs Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
        {/* 1. Tithi */}
        <div
          id="anga-tithi"
          className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
            isNight
              ? "border-indigo-800/40 bg-[#12182b] text-slate-100 hover:border-indigo-600"
              : "border-stone-200/90 bg-white hover:border-amber-400 hover:shadow-sm"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 ${
                isNight ? "text-amber-300" : "text-amber-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  १
                </span>
                <Moon className={`h-3.5 w-3.5 ${isNight ? "text-amber-400" : "text-amber-700"}`} />
                <span>{t.tithi}</span>
              </span>
              {tithiAttr && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-serif-vedic ${
                    isNight ? "bg-slate-800 text-amber-300" : "bg-stone-100 text-amber-950"
                  }`}
                >
                  {tithiAttr.category[lang]}
                </span>
              )}
            </div>
            {renderSegment(
              data.tithi,
              "Śukla Pratipat",
              (num, raw, l) => getLocalizedTithi(num, l),
              true,
            )}
          </div>

          <div
            className={`mt-3 border-t pt-2 text-[11px] space-y-1 ${
              isNight ? "border-slate-800 text-slate-400" : "border-stone-100 text-stone-500"
            }`}
          >
            {tithiAttr && (
              <div
                className={`font-medium truncate ${isNight ? "text-amber-300" : "text-amber-900"}`}
              >
                <span className={isNight ? "text-slate-500" : "text-stone-400"}>Deity:</span>{" "}
                {tithiAttr.deity[lang]}
              </div>
            )}
            <div className={`text-[10px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
              {lang === "sa"
                ? "सूर्य-चन्द्रयोः १२° अन्तरम्"
                : lang === "hi"
                  ? "सूर्य व चन्द्रमा के बीच १२° अंतर"
                  : "12° lunar-solar elongation span"}
            </div>
          </div>
        </div>

        {/* 2. Nakshatra */}
        <div
          id="anga-nakshatra"
          className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
            isNight
              ? "border-indigo-800/40 bg-[#12182b] text-slate-100 hover:border-indigo-600"
              : "border-stone-200/90 bg-white hover:border-amber-400 hover:shadow-sm"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 ${
                isNight ? "text-amber-300" : "text-amber-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  २
                </span>
                <Star className={`h-3.5 w-3.5 ${isNight ? "text-amber-400" : "text-amber-700"}`} />
                <span>{t.nakshatra}</span>
              </span>
              {nakAttr && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {nakAttr.gana[lang]}
                </span>
              )}
            </div>
            {renderSegment(data.nakshatra, "Aśvinī", (num, raw, l) =>
              getLocalizedNakshatra(num, raw, l),
            )}
          </div>

          <div
            className={`mt-3 border-t pt-2 text-[11px] space-y-1 ${
              isNight ? "border-slate-800 text-slate-400" : "border-stone-100 text-stone-500"
            }`}
          >
            {nakAttr && (
              <div
                className={`font-medium truncate ${isNight ? "text-amber-300" : "text-amber-900"}`}
              >
                <span className={isNight ? "text-slate-500" : "text-stone-400"}>Lord:</span>{" "}
                {nakAttr.lord[lang]} • {nakAttr.symbol}
              </div>
            )}
            <div className={`text-[10px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
              {lang === "sa"
                ? "क्रान्तिवृत्ते १३°२०' नक्षत्रभागः"
                : lang === "hi"
                  ? "चन्द्रमा का १३°२०' नक्षत्र भोग"
                  : "13°20' sidereal lunar asterism"}
            </div>
          </div>
        </div>

        {/* 3. Yoga */}
        <div
          id="anga-yoga"
          className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
            isNight
              ? "border-indigo-800/40 bg-[#12182b] text-slate-100 hover:border-indigo-600"
              : "border-stone-200/90 bg-white hover:border-amber-400 hover:shadow-sm"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 ${
                isNight ? "text-amber-300" : "text-amber-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  ३
                </span>
                <Compass
                  className={`h-3.5 w-3.5 ${isNight ? "text-amber-400" : "text-amber-700"}`}
                />
                <span>{t.yoga}</span>
              </span>
              {yogaAttr && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    yogaAttr.nature === "auspicious"
                      ? isNight
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                        : "bg-emerald-100 text-emerald-900"
                      : isNight
                        ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                        : "bg-rose-100 text-rose-900"
                  }`}
                >
                  {yogaAttr.nature === "auspicious"
                    ? lang === "sa"
                      ? "शुभः"
                      : lang === "hi"
                        ? "शुभ"
                        : "Auspicious"
                    : lang === "sa"
                      ? "अशुभः"
                      : lang === "hi"
                        ? "अशुभ"
                        : "Inauspicious"}
                </span>
              )}
            </div>
            {renderSegment(data.yoga, "Viṣkambha", (num, raw, l) => getLocalizedYoga(num, raw, l))}
          </div>

          <div
            className={`mt-3 border-t pt-2 text-[11px] space-y-1 ${
              isNight ? "border-slate-800 text-slate-400" : "border-stone-100 text-stone-500"
            }`}
          >
            {yogaAttr && (
              <div
                className={`font-medium truncate ${isNight ? "text-amber-200" : "text-amber-950"}`}
              >
                {yogaAttr.meaning[lang]}
              </div>
            )}
            <div className={`text-[10px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
              {lang === "sa"
                ? "सूर्य-चन्द्रयोः योगमानम्"
                : lang === "hi"
                  ? "सूर्य व चन्द्र भोगांशों का योग"
                  : "Sum of Sun & Moon longitudes"}
            </div>
          </div>
        </div>

        {/* 4. Karana */}
        <div
          id="anga-karana"
          className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
            isNight
              ? "border-indigo-800/40 bg-[#12182b] text-slate-100 hover:border-indigo-600"
              : "border-stone-200/90 bg-white hover:border-amber-400 hover:shadow-sm"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 ${
                isNight ? "text-amber-300" : "text-amber-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  ४
                </span>
                <Sparkles
                  className={`h-3.5 w-3.5 ${isNight ? "text-amber-400" : "text-amber-700"}`}
                />
                <span>{t.karana}</span>
              </span>
              {karAttr && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isNight ? "bg-slate-800 text-slate-300" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {karAttr.type === "chara"
                    ? lang === "sa"
                      ? "चर"
                      : lang === "hi"
                        ? "चर"
                        : "Movable"
                    : lang === "sa"
                      ? "स्थिर"
                      : lang === "hi"
                        ? "स्थिर"
                        : "Fixed"}
                </span>
              )}
            </div>
            {renderSegment(data.karana, "Bava", (num, raw, l) => getLocalizedKarana(num, raw, l))}
          </div>

          <div
            className={`mt-3 border-t pt-2 text-[11px] space-y-1 ${
              isNight ? "border-slate-800 text-slate-400" : "border-stone-100 text-stone-500"
            }`}
          >
            {karAttr && (
              <div
                className={`font-medium truncate ${isNight ? "text-amber-300" : "text-amber-900"}`}
              >
                <span className={isNight ? "text-slate-500" : "text-stone-400"}>Deity:</span>{" "}
                {karAttr.deity[lang]}
              </div>
            )}
            <div className={`text-[10px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
              {lang === "sa"
                ? "तिथेः अर्धभागः (६° विस्तारः)"
                : lang === "hi"
                  ? "तिथि का आधा भाग (६° अंतर)"
                  : "Half of a Tithi (6° elongation)"}
            </div>
          </div>
        </div>

        {/* 5. Vaara */}
        <div
          id="anga-vaara"
          className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
            isNight
              ? "border-indigo-800/40 bg-[#12182b] text-slate-100 hover:border-indigo-600"
              : "border-stone-200/90 bg-white hover:border-amber-400 hover:shadow-sm"
          }`}
        >
          <div>
            <div
              className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-2 ${
                isNight ? "text-amber-300" : "text-amber-800"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  isNight ? "bg-amber-950/80 text-amber-300" : "bg-amber-100 text-amber-900"
                }`}
              >
                ५
              </span>
              <Sun className={`h-3.5 w-3.5 ${isNight ? "text-amber-400" : "text-amber-700"}`} />
              <span>{t.vaara}</span>
            </div>
            <div className="space-y-1">
              <div
                className={`text-base sm:text-lg font-bold font-devanagari ${isNight ? "text-slate-100" : "text-stone-950"}`}
              >
                {localizedVaara}
              </div>
              {lang !== "en" && (
                <div className={`text-xs ${isNight ? "text-slate-400" : "text-stone-500"}`}>
                  {data.vaara}
                </div>
              )}
              <div
                className={`text-xs font-semibold pt-0.5 ${isNight ? "text-amber-300" : "text-amber-900"}`}
              >
                {vaaraInfo.deity}
              </div>
            </div>
          </div>

          <div
            className={`mt-3 border-t pt-2 text-[11px] space-y-1 ${
              isNight ? "border-slate-800 text-slate-400" : "border-stone-100 text-stone-500"
            }`}
          >
            <div className={`text-[11px] ${isNight ? "text-amber-200" : "text-amber-950"}`}>
              <span className={isNight ? "text-slate-500" : "text-stone-400"}>Attr:</span>{" "}
              {vaaraInfo.metal}
            </div>
            <div className={`text-[10px] ${isNight ? "text-slate-400" : "text-stone-400"}`}>
              {lang === "sa"
                ? "सूर्योदयात् सूर्योदयपर्यन्तम्"
                : lang === "hi"
                  ? "सूर्योदय से अगले सूर्योदय तक"
                  : "From local sunrise to sunrise"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
