import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
  Calendar,
  Flame,
  Wind,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import type { PanchangaResponse, AppTheme, CoordinateSelection } from "../../types";
import {
  type Language,
  translations,
  getLocalizedTithi,
  getLocalizedNakshatra,
  getLocalizedYoga,
  getLocalizedKarana,
  getLocalizedVaara,
  getLocalizedMasa,
  getLocalizedPaksha,
} from "../../i18n";

function translateHoraPlanet(planet: string, lang: Language): string {
  if (lang !== "hi") return planet;
  const map: Record<string, string> = {
    Sun: "सूर्य (Sun)",
    Moon: "चन्द्र (Moon)",
    Mars: "मंगल (Mars)",
    Mercury: "बुध (Mercury)",
    Jupiter: "गुरु (Jupiter)",
    Venus: "शुक्र (Venus)",
    Saturn: "शनि (Saturn)",
  };
  return map[planet] || planet;
}
import { Card, StatTile, Chip, CountdownRing, InfoTip, SectionHeader } from "../../components/ds";
import { resolveCurrentHora } from "../../horaEngine";
import { MuhurtaTimelineBar } from "../../components/MuhurtaTimelineBar";
import { AuspiciousTimingsCard } from "../../components/AuspiciousTimingsCard";
import { GauriChoghadiyaCard } from "../../components/GauriChoghadiyaCard";
import { SwaraYogaCard } from "../../components/SwaraYogaCard";
import { PlanetaryPositionsCard } from "../../components/PlanetaryPositionsCard";
import { NextMajorIngressWidget } from "../../components/NextMajorIngressWidget";
import { FestivalCard } from "../../components/FestivalCard";
import { FiveAngasCard } from "../../components/FiveAngasCard";
import type { ActiveView } from "../../components/Header";

interface TodayHeroViewProps {
  data: PanchangaResponse;
  lang: Language;
  theme: AppTheme;
  currentCity: string;
  ayanamsa: CoordinateSelection;
  onSelectView: (view: ActiveView) => void;
  onOpenCalendarSync: () => void;
  onOpenSettings: () => void;
}

/** Parse "HH:MM" or "HH:MM AM/PM" into minutes since midnight */
function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const match = clean.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export const TodayHeroView: React.FC<TodayHeroViewProps> = ({
  data,
  lang,
  theme,
  currentCity,
  ayanamsa,
  onSelectView,
  onOpenCalendarSync,
}) => {
  const t = translations[lang];
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [expandNowRunning, setExpandNowRunning] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    auspicious: true, // Open by default per Section 7.1
    detailedAngas: false,
    choghadiya: false,
    swara: false,
    planets: false,
  });

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Resolve live Hora state
  const liveHoraState = resolveCurrentHora(nowMs, data);

  // Localized core Panchanga values
  const vaaraName = getLocalizedVaara(data.vaara, lang);
  const masaName = data.masa?.includes("Adhika")
    ? lang === "hi"
      ? `अधिक ${getLocalizedMasa(data.masa.replace("Adhika ", "").trim(), lang)}`
      : `Adhika ${getLocalizedMasa(data.masa.replace("Adhika ", "").trim(), lang)}`
    : getLocalizedMasa(data.masa || "", lang);
  const pakshaName = getLocalizedPaksha(data.paksha || "", lang);

  const currentTithi = data.tithi?.[0];
  const nextTithi = data.tithi?.[1];
  const currentNakshatra = data.nakshatra?.[0];
  const nextNakshatra = data.nakshatra?.[1];
  const currentYoga = data.yoga?.[0];
  const nextYoga = data.yoga?.[1];
  const currentKarana = data.karana?.[0];
  const nextKarana = data.karana?.[1];

  const tithiLabel = currentTithi ? getLocalizedTithi(currentTithi.name, lang) : "—";
  const nakshatraLabel = currentNakshatra
    ? getLocalizedNakshatra(currentNakshatra.name, lang)
    : "—";
  const yogaLabel = currentYoga ? getLocalizedYoga(currentYoga.name, lang) : "—";
  const karanaLabel = currentKarana ? getLocalizedKarana(currentKarana.name, lang) : "—";

  // Compute Sun Arc progress (0 to 1 between sunrise and sunset)
  const sunriseMins = parseTimeToMinutes(data.sunrise) ?? 360;
  const sunsetMins = parseTimeToMinutes(data.sunset) ?? 1080;
  const nowDate = new Date(nowMs);
  const currentMins = nowDate.getHours() * 60 + nowDate.getMinutes();
  const isDaytime = currentMins >= sunriseMins && currentMins <= sunsetMins;
  const sunProgress = Math.max(
    0,
    Math.min(1, (currentMins - sunriseMins) / Math.max(1, sunsetMins - sunriseMins)),
  );

  // SVG Sun Arc coordinates (Quadratic Bezier from (16,52) to (224,52) with control point (120,-6))
  const tArc = sunProgress;
  const sunX = (1 - tArc) * (1 - tArc) * 16 + 2 * (1 - tArc) * tArc * 120 + tArc * tArc * 224;
  const sunY = (1 - tArc) * (1 - tArc) * 52 + 2 * (1 - tArc) * tArc * -6 + tArc * tArc * 52;

  // Moon Illumination SVG computation
  const illumination = data.moonPhase?.illumination ?? 50;
  const isWaxing = data.paksha?.toLowerCase().includes("shukla") ?? true;

  // Check active intervals (Rahu Kala, Abhijit, Brahma, Choghadiya)
  const isWithinInterval = (start?: string, end?: string) => {
    const s = parseTimeToMinutes(start);
    const e = parseTimeToMinutes(end);
    if (s === null || e === null) return false;
    return currentMins >= s && currentMins <= e;
  };

  const liveHasRahu = isWithinInterval(data.rahuKala?.start, data.rahuKala?.end);
  const liveHasAbhijit = isWithinInterval(data.abhijitMuhurta?.start, data.abhijitMuhurta?.end);
  const liveHasBrahma = isWithinInterval(data.brahmaMuhurta?.start, data.brahmaMuhurta?.end);

  const allChoghadiyas = [
    ...(data.choghadiya?.day || []),
    ...(data.choghadiya?.night || []),
  ];
  const activeChoghadiya = allChoghadiyas.find((c) => isWithinInterval(c.start, c.end));

  const runningSemanticState = liveHasRahu
    ? "inauspicious"
    : liveHasAbhijit || liveHasBrahma
      ? "auspicious"
      : activeChoghadiya?.type === "auspicious"
        ? "auspicious"
        : activeChoghadiya?.type === "inauspicious"
          ? "caution"
          : "info";

  const choghadiyaProgress = liveHoraState?.horaProgressPercent ?? 50;
  const remainingMins = liveHoraState?.horaRemainingSeconds
    ? Math.max(1, Math.round(liveHoraState.horaRemainingSeconds / 60))
    : 24;

  return (
    <div className="space-y-6 pb-6">
      {/* ─── 1. HERO CARD (Above the fold on 390x844) ────────────────────────── */}
      <Card variant="hero" padding="md" className="border-saffron/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: Date, Samvat, Primary Tithi & Nakshatra */}
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="saffron" size="sm">
                {vaaraName}
              </Chip>
              <span className="type-caption text-text-2 font-devanagari">
                {lang === "hi" ? "विक्रम संवत्" : "Vikram Samvat"} {data.samvat?.vikram ?? "2083"} ·{" "}
                {lang === "hi" ? "शक" : "Shaka"} {data.samvat?.shaka ?? "1948"} · {masaName} ·{" "}
                {pakshaName} {lang === "hi" ? "पक्ष" : "Paksha"}
              </span>
            </div>

            {/* Large Tithi + Moon Phase */}
            <div className="flex items-center gap-3.5 pt-0.5">
              {/* Clean SVG Moon Phase Glyph */}
              <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border-subtle shadow-inner"
                title={`${Math.round(illumination)}% ${isWaxing ? "Shukla" : "Krishna"}`}
              >
                <svg viewBox="0 0 36 36" className="w-9 h-9">
                  <circle cx="18" cy="18" r="14" fill="#18203A" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="#F0C96A"
                    clipPath={`inset(0 ${isWaxing ? 100 - illumination : 0}% 0 ${
                      isWaxing ? 0 : 100 - illumination
                    }%)`}
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="rgba(240,201,106,0.45)"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <InfoTip termKey="tithi" lang={lang} theme={theme}>
                    <h1 className="type-display text-text-1 font-devanagari leading-tight">
                      {tithiLabel}
                    </h1>
                  </InfoTip>
                  {currentTithi?.endTime && (
                    <span className="text-xs sm:text-sm text-text-2 tabular-time font-devanagari">
                      {lang === "hi" ? `${currentTithi.endTime} तक` : `until ${currentTithi.endTime}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-1 text-sm text-text-2 font-devanagari">
                  <InfoTip termKey="nakshatra" lang={lang} theme={theme}>
                    <span className="font-semibold text-text-1">{nakshatraLabel}</span>
                  </InfoTip>
                  {currentNakshatra?.endTime && (
                    <span className="text-xs text-text-2 tabular-time">
                      ({lang === "hi" ? `${currentNakshatra.endTime} तक` : `until ${currentNakshatra.endTime}`})
                    </span>
                  )}
                  <span className="text-text-3">·</span>
                  <span>
                    {Math.round(illumination)}% {lang === "hi" ? "चन्द्र प्रकाश" : "Moon"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Compact SVG Sun Arc (Sunrise -> Sunset with live sun marker) */}
          <div className="flex flex-col items-center justify-center bg-surface-2/70 border border-border-subtle rounded-2xl px-4 py-3 shrink-0 lg:w-72">
            <svg viewBox="0 0 240 62" className="w-full h-14 overflow-visible" aria-hidden="true">
              {/* Horizon baseline */}
              <line
                x1="12"
                y1="52"
                x2="228"
                y2="52"
                stroke="var(--border-subtle)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Full Sun Arc Track */}
              <path
                d="M 16 52 Q 120 -6 224 52"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Active Daytime Arc */}
              <path
                d="M 16 52 Q 120 -6 224 52"
                fill="none"
                stroke="var(--saffron)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="240"
                strokeDashoffset={240 - 240 * sunProgress}
              />
              {/* Live Sun Position Marker */}
              <circle
                cx={sunX}
                cy={sunY}
                r="6"
                fill={isDaytime ? "var(--saffron)" : "var(--text-3)"}
                stroke="var(--surface-1)"
                strokeWidth="2"
              />
            </svg>
            <div className="flex items-center justify-between w-full text-xs font-semibold tabular-time text-text-2 mt-1">
              <div className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-saffron" />
                <span>{data.sunrise || "06:00"}</span>
              </div>
              <span className="text-text-3 font-devanagari">
                {isDaytime
                  ? lang === "hi"
                    ? "दिनमान सक्रिय"
                    : "Daylight Active"
                  : lang === "hi"
                    ? "रात्रि काल"
                    : "Nighttime"}
              </span>
              <div className="flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-info" />
                <span>{data.sunset || "18:00"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── 2. "NOW RUNNING" LIVE STRIP (1-line scannable, tap to expand) ─── */}
      <Card
        variant="raised"
        padding="sm"
        className={`border-l-4 ${
          runningSemanticState === "auspicious"
            ? "border-l-auspicious"
            : runningSemanticState === "inauspicious"
              ? "border-l-inauspicious"
              : runningSemanticState === "caution"
                ? "border-l-caution"
                : "border-l-saffron"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpandNowRunning((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpandNowRunning((prev) => !prev);
            }
          }}
          className="flex flex-wrap items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-saffron" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron">
                  {lang === "hi" ? "अभी सक्रिय" : "Now Running"}
                </span>
                <Chip variant={runningSemanticState} size="sm" withIcon>
                  {liveHasRahu
                    ? lang === "hi"
                      ? "राहु काल (वर्जित)"
                      : "Rahu Kala (Avoid new starts)"
                    : liveHasAbhijit
                      ? lang === "hi"
                        ? "अभिजीत मुहूर्त (सर्वश्रेष्ठ)"
                        : "Abhijit Muhurta (Highly Auspicious)"
                      : activeChoghadiya
                        ? `${activeChoghadiya.name} ${lang === "hi" ? "चौघड़िया" : "Choghadiya"}`
                        : lang === "hi"
                          ? "सामान्य काल"
                          : "Standard Period"}
                </Chip>
                {liveHoraState?.currentHora && (
                  <Chip variant="neutral" size="sm">
                    {lang === "hi" ? "होरा:" : "Hora:"}{" "}
                    {translateHoraPlanet(liveHoraState.currentHora.planet, lang)}
                  </Chip>
                )}
              </div>
              <p className="type-caption text-text-2 font-devanagari mt-0.5 truncate">
                {liveHasRahu
                  ? lang === "hi"
                    ? "नए शुभ कार्य आरंभ करने से बचें; नियमित कार्य एवं जप जारी रखें।"
                    : "Avoid initiating new auspicious ventures; continue routine work or prayer."
                  : lang === "hi"
                    ? "महत्वपूर्ण कार्य, यात्रा एवं संकल्प के लिए अनुकूल समय।"
                    : "Favorable window for focused work, study, and auspicious commitments."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <CountdownRing
              progressPercent={choghadiyaProgress}
              label={`${remainingMins}m`}
              state={runningSemanticState}
              size={42}
            />
            <span className="text-text-3">
              {expandNowRunning ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </div>
        </div>

        {expandNowRunning && (
          <div className="mt-3.5 pt-3.5 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-devanagari">
            <div className="p-2.5 rounded-xl bg-surface-2">
              <div className="text-text-3 font-semibold mb-0.5">
                {lang === "hi" ? "राहु काल आज" : "Rahu Kala Today"}
              </div>
              <div className="font-bold text-inauspicious tabular-time">
                {data.rahuKala?.start} – {data.rahuKala?.end}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-2">
              <div className="text-text-3 font-semibold mb-0.5">
                {lang === "hi" ? "अभिजीत मुहूर्त" : "Abhijit Muhurta"}
              </div>
              <div className="font-bold text-auspicious tabular-time">
                {data.abhijitMuhurta
                  ? `${data.abhijitMuhurta.start} – ${data.abhijitMuhurta.end}`
                  : "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-2">
              <div className="text-text-3 font-semibold mb-0.5">
                {lang === "hi" ? "ब्रह्म मुहूर्त" : "Brahma Muhurta"}
              </div>
              <div className="font-bold text-auspicious tabular-time">
                {data.brahmaMuhurta
                  ? `${data.brahmaMuhurta.start} – ${data.brahmaMuhurta.end}`
                  : "—"}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ─── 3. THE FIVE ANGAS (Snap-scrolling on mobile, 5-up grid on desktop) */}
      <section aria-label={lang === "hi" ? "पंचांग के पांच अंग" : "The Five Angas"}>
        <SectionHeader
          title={lang === "hi" ? "पञ्चाङ्ग के पाँच अंग" : "The Five Angas"}
          subtitle={
            lang === "hi"
              ? "तिथि, वार, नक्षत्र, योग एवं करण — समाप्ति समय व आगामी अंग"
              : "Tithi, Vaara, Nakshatra, Yoga & Karana with end times"
          }
          action={
            <button
              type="button"
              onClick={() => toggleSection("detailedAngas")}
              className="text-xs font-semibold text-saffron hover:underline cursor-pointer"
            >
              {openSections.detailedAngas
                ? lang === "hi"
                  ? "संक्षिप्त करें"
                  : "Compact View"
                : lang === "hi"
                  ? "विस्तृत विवरण"
                  : "Detailed View"}
            </button>
          }
        />

        <div className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto pb-2 snap-x snap-mandatory cat-nav-scroll">
          <div className="min-w-[210px] sm:min-w-[220px] lg:min-w-0 snap-start flex-1">
            <StatTile
              label={
                <InfoTip termKey="tithi" lang={lang} theme={theme}>
                  <span>{t.tithi}</span>
                </InfoTip>
              }
              value={tithiLabel}
              sublabel={
                currentTithi?.endTime
                  ? `${lang === "hi" ? "समाप्ति:" : "Ends:"} ${currentTithi.endTime}`
                  : undefined
              }
              nextLabel={
                nextTithi
                  ? `${lang === "hi" ? "आगामी:" : "Next:"} ${getLocalizedTithi(nextTithi.name, lang)}`
                  : `${pakshaName} ${lang === "hi" ? "पक्ष" : "Paksha"}`
              }
              state="saffron"
              badgeText={pakshaName}
            />
          </div>

          <div className="min-w-[210px] sm:min-w-[220px] lg:min-w-0 snap-start flex-1">
            <StatTile
              label={
                <InfoTip termKey="vaara" lang={lang} theme={theme}>
                  <span>{t.vaara}</span>
                </InfoTip>
              }
              value={vaaraName}
              sublabel={`${lang === "hi" ? "सूर्योदय:" : "Sunrise:"} ${data.sunrise || "—"}`}
              nextLabel={`${lang === "hi" ? "सूर्यास्त:" : "Sunset:"} ${data.sunset || "—"}`}
              state="neutral"
            />
          </div>

          <div className="min-w-[210px] sm:min-w-[220px] lg:min-w-0 snap-start flex-1">
            <StatTile
              label={
                <InfoTip termKey="nakshatra" lang={lang} theme={theme}>
                  <span>{t.nakshatra}</span>
                </InfoTip>
              }
              value={nakshatraLabel}
              sublabel={
                currentNakshatra?.endTime
                  ? `${lang === "hi" ? "समाप्ति:" : "Ends:"} ${currentNakshatra.endTime}`
                  : undefined
              }
              nextLabel={
                nextNakshatra
                  ? `${lang === "hi" ? "आगामी:" : "Next:"} ${getLocalizedNakshatra(nextNakshatra.name, lang)}`
                  : currentNakshatra?.pada
                    ? `${lang === "hi" ? "चरण" : "Pada"} ${currentNakshatra.pada}`
                    : undefined
              }
              state="info"
              badgeText={
                currentNakshatra?.pada
                  ? `${lang === "hi" ? "चरण" : "Pada"} ${currentNakshatra.pada}`
                  : undefined
              }
            />
          </div>

          <div className="min-w-[210px] sm:min-w-[220px] lg:min-w-0 snap-start flex-1">
            <StatTile
              label={
                <InfoTip termKey="yoga" lang={lang} theme={theme}>
                  <span>{t.yoga}</span>
                </InfoTip>
              }
              value={yogaLabel}
              sublabel={
                currentYoga?.endTime
                  ? `${lang === "hi" ? "समाप्ति:" : "Ends:"} ${currentYoga.endTime}`
                  : undefined
              }
              nextLabel={
                nextYoga
                  ? `${lang === "hi" ? "आगामी:" : "Next:"} ${getLocalizedYoga(nextYoga.name, lang)}`
                  : undefined
              }
              state="auspicious"
            />
          </div>

          <div className="min-w-[210px] sm:min-w-[220px] lg:min-w-0 snap-start flex-1">
            <StatTile
              label={
                <InfoTip termKey="karana" lang={lang} theme={theme}>
                  <span>{t.karana}</span>
                </InfoTip>
              }
              value={karanaLabel}
              sublabel={
                currentKarana?.endTime
                  ? `${lang === "hi" ? "समाप्ति:" : "Ends:"} ${currentKarana.endTime}`
                  : undefined
              }
              nextLabel={
                nextKarana
                  ? `${lang === "hi" ? "आगामी:" : "Next:"} ${getLocalizedKarana(nextKarana.name, lang)}`
                  : undefined
              }
              state="neutral"
            />
          </div>
        </div>

        {openSections.detailedAngas && (
          <div className="mt-4">
            <FiveAngasCard data={data} lang={lang} theme={theme} />
          </div>
        )}
      </section>

      {/* ─── 4. DAY TIMELINE (24h Muhurta visual bar + plain-language legend) ── */}
      <section aria-label={lang === "hi" ? "दैनिक मुहूर्त समयरेखा" : "24-Hour Day Timeline"}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="type-heading text-text-1 font-devanagari">
            {lang === "hi" ? "दैनिक शुभ-अशुभ समयरेखा" : "Day Muhurta Timeline"}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Chip variant="auspicious" size="sm" withIcon>
              {lang === "hi" ? "शुभ (अभिजीत/ब्रह्म)" : "Auspicious"}
            </Chip>
            <Chip variant="caution" size="sm" withIcon>
              {lang === "hi" ? "सावधानी (गुलिक/यमगण्ड)" : "Caution"}
            </Chip>
            <Chip variant="inauspicious" size="sm" withIcon>
              {lang === "hi" ? "वर्जित (राहु काल)" : "Avoid (Rahu Kala)"}
            </Chip>
          </div>
        </div>
        <MuhurtaTimelineBar data={data} lang={lang} theme={theme} />
      </section>

      {/* ─── 5. COLLAPSIBLE SECTIONS (12-col split on Desktop, Accordion on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns on Desktop */}
        <div className="lg:col-span-7 space-y-5">
          {/* Auspicious & Inauspicious Timings (Open by default) */}
          <Card variant="raised" padding="md">
            <button
              type="button"
              onClick={() => toggleSection("auspicious")}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-saffron" />
                <div>
                  <h3 className="type-heading text-text-1 font-devanagari">
                    {lang === "hi" ? "शुभ एवं अशुभ मुहूर्त" : "Auspicious & Inauspicious Windows"}
                  </h3>
                  <p className="type-caption text-text-2 font-devanagari">
                    {lang === "hi"
                      ? "अभिजीत, ब्रह्म मुहूर्त, राहु काल, यमगण्ड एवं गुलिक काल"
                      : "Abhijit, Brahma Muhurta, Rahu Kala, Yamaganda & Gulika"}
                  </p>
                </div>
              </div>
              {openSections.auspicious ? (
                <ChevronUp className="w-5 h-5 text-text-3" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-3" />
              )}
            </button>
            {openSections.auspicious && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <AuspiciousTimingsCard data={data} lang={lang} theme={theme} />
              </div>
            )}
          </Card>

          {/* Choghadiya Accordion */}
          <Card variant="raised" padding="md">
            <button
              type="button"
              onClick={() => toggleSection("choghadiya")}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-saffron" />
                <div>
                  <h3 className="type-heading text-text-1 font-devanagari">
                    {lang === "hi" ? "दिन-रात्रि चौघड़िया चक्र" : "Day & Night Choghadiya"}
                  </h3>
                  <p className="type-caption text-text-2 font-devanagari">
                    {lang === "hi"
                      ? "अमृत, शुभ, लाभ, चर एवं उद्वेग/रोग/काल विभाग"
                      : "8 Day & 8 Night Vedic Muhurta divisions"}
                  </p>
                </div>
              </div>
              {openSections.choghadiya ? (
                <ChevronUp className="w-5 h-5 text-text-3" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-3" />
              )}
            </button>
            {openSections.choghadiya && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <GauriChoghadiyaCard data={data} lang={lang} theme={theme} />
              </div>
            )}
          </Card>

          {/* Swara & Tattva Accordion */}
          <Card variant="raised" padding="md">
            <button
              type="button"
              onClick={() => toggleSection("swara")}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Wind className="w-5 h-5 text-saffron" />
                <div>
                  <h3 className="type-heading text-text-1 font-devanagari">
                    {lang === "hi" ? "शिव स्वरोदय एवं पंच तत्व" : "Swara Yoga & Tattva Flow"}
                  </h3>
                  <p className="type-caption text-text-2 font-devanagari">
                    {lang === "hi"
                      ? "इड़ा (चन्द्र), पिङ्गला (सूर्य) नाड़ी एवं महाभूत प्रवाह"
                      : "Ida/Pingala breath alignment & elemental cycle"}
                  </p>
                </div>
              </div>
              {openSections.swara ? (
                <ChevronUp className="w-5 h-5 text-text-3" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-3" />
              )}
            </button>
            {openSections.swara && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <SwaraYogaCard
                  data={data}
                  lang={lang}
                  theme={theme}
                  onOpenCalendarSync={onOpenCalendarSync}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Right 5 Columns on Desktop */}
        <div className="lg:col-span-5 space-y-5">
          {/* Today's Festivals & Vratas */}
          <FestivalCard data={data} lang={lang} theme={theme} />

          {/* Next Planetary Ingress */}
          <NextMajorIngressWidget data={data} lang={lang} theme={theme} />

          {/* Planetary Positions Accordion */}
          <Card variant="raised" padding="md">
            <button
              type="button"
              onClick={() => toggleSection("planets")}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-saffron" />
                <div>
                  <h3 className="type-heading text-text-1 font-devanagari">
                    {lang === "hi" ? "नवग्रह स्पष्ट (ग्रह स्थिति)" : "Planetary Positions (Graha)"}
                  </h3>
                  <p className="type-caption text-text-2 font-devanagari">
                    {lang === "hi"
                      ? "राशि, अंश, नक्षत्र चरण एवं वक्री/अस्त स्थिति"
                      : "Sidereal longitudes, Nakshatra pada & retrograde state"}
                  </p>
                </div>
              </div>
              {openSections.planets ? (
                <ChevronUp className="w-5 h-5 text-text-3" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-3" />
              )}
            </button>
            {openSections.planets && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <PlanetaryPositionsCard data={data} lang={lang} theme={theme} />
              </div>
            )}
          </Card>

          {/* Quick Jump to Full Schedule / Kundli / Calendar */}
          <Card variant="flat" padding="sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectView("kundli")}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border-subtle hover:border-saffron/40 text-left transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-semibold text-text-1 font-devanagari">
                  {lang === "hi" ? "जन्म कुण्डली" : "Birth Chart"}
                </span>
                <ArrowRight className="w-4 h-4 text-saffron shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onSelectView("calendar")}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border-subtle hover:border-saffron/40 text-left transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-semibold text-text-1 font-devanagari">
                  {lang === "hi" ? "मासिक पंचांग" : "Month Calendar"}
                </span>
                <ArrowRight className="w-4 h-4 text-saffron shrink-0" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── 6. SUBTLE FOOTER ATTRIBUTION LINE ──────────────────────────────── */}
      <div className="pt-2 text-center type-caption text-text-3 font-devanagari">
        {lang === "hi"
          ? `गणना स्थान: ${currentCity} · अयनांश: ${ayanamsa} · दृग्गणित पद्धति`
          : `Calculated for ${currentCity} · ${ayanamsa} Ayanamsa · Observational Drik-Ganita`}
      </div>
    </div>
  );
};
