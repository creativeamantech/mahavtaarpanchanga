# AI Studio Prompt: World-Class UI/UX Redesign of Mahavtaar Panchanga

Paste everything below into Google AI Studio (Build mode, repo imported).

---

## 0. ROLE AND MISSION

You are a principal product designer and staff front-end engineer who has shipped consumer products at Apple, Stripe, Linear, Airbnb and Headspace. Redesign the UI/UX of this Vedic Panchanga app so it feels like a billion-dollar consumer product: calm, premium, fast, trustworthy, and instantly understandable.

**Product truth:** People open this app daily, often for under 10 seconds, to answer one question: *"What is the state of time right now, and what should I do or avoid?"* Many are Hindi-first, on mid-range Android phones, on patchy networks. The app also serves power users (astrologers, priests) who need deep Kundali, Shadbala, Jaimini, Navtara and Matchmaking tools. The design must serve both: simple on the surface, deep underneath.

**Success criteria**
- A new user understands "today" within 3 seconds of opening the app.
- Any feature is reachable in 2 taps on mobile, or 1 click / 1 keyboard shortcut on desktop.
- Looks consistent across all views as if designed by one person in one week.
- Lighthouse mobile: Performance 90+, Accessibility 95+, CLS < 0.05, INP < 200ms.

---

## 1. TECH CONTEXT (already in the repo, do not replace)

TanStack Start + TanStack Router, React 19, Tailwind CSS v4 (tokens in `src/styles.css`), shadcn/Radix UI in `src/components/ui/`, Motion, Vaul (drawers), cmdk, Sonner, Recharts, lucide-react, vite-plugin-pwa, Firebase, jsPDF/html2canvas/xlsx. Bilingual (Hindi/English) through `src/i18n.ts`. Themes: Parchment (light) and Night Sky (dark) via `AppTheme`.

Current structure you must understand:
- `src/PanchangaApp.tsx` (about 1,750 lines) is the shell. It holds all state and switches 14 views with an `activeView` conditional. The `ActiveView` type (in `Header.tsx`) is: home, panchanga, today, timings, planets, kundli, lagna, swara, navtara, horas, tattva, calendar, festivals, navagraha.
- Only `/` exists as a real route (`src/routes/index.tsx`). No deep links, and the browser back button does not move between views.
- `Header.tsx` (about 540 lines) is a sticky gradient header with many utility buttons hidden behind `hidden sm:flex` and `hidden md:flex`.
- Desktop: a left sidebar with 4 numbered sections (01-04), collapsible. Mobile: `MobileBottomNav.tsx` (a 6-item utility dock: Location, Calendar, Sync, Menu, Settings, Account) plus `MobileMenuDrawer.tsx`.
- `lib/navPreferences.ts` lets users reorder and hide views. `SpiritualTabs.tsx`, `AccessDeniedCard.tsx` and `VIEW_PERMISSIONS_MAP` in `userAuthService` gate views by user permission (Lock icon). **Preserve both.**
- Live logic you must reuse, not rewrite: `lib/liveCosmicState.ts` (`resolveLiveCosmicState`, `formatCountdown`), `lib/dailyScheduleNormalizer.ts`, `RunningNowWidget`, `CurrentMuhurtaWidget`, `NextMajorIngressWidget`, `ActiveCosmicForcesWidget`, `MuhurtaTimelineBar`, `CalendarDaySheet`, `VedicTermTooltip`, `MoonPhaseVisualizer`, `PWAInstallButton`, `notification-sw.js`.

---

## 2. HARD CONSTRAINTS (never violate)

1. **UI layer only.** Do NOT modify: `panchangaEngine.server.ts`, anything in `src/kundali/**`, `swaraYoga.ts`, `lib/*Engine.ts`, `vedicData.ts`, `data.ts`, API routes in `routes/api/**`, `lib/mcp/**`, Firebase config, Google Calendar/Sheets services, auth logic, or the meaning of existing i18n keys. New UI strings may be added to `i18n.ts` in both `hi` and `en`.
2. **No feature removal.** Every view, modal and export (PDF, Excel, Sheets, Calendar sync, notifications, print reports) must still work.
3. **Never rewrite git history** (force-push, rebase, amend pushed commits). Commit in small steps; the project must build after every step (see AGENTS.md; this repo is connected to Lovable).
4. **Bilingual always.** Every layout must hold both Devanagari and English. Devanagari needs about 1.15x line-height compared to Latin, and must never be clipped or truncated mid-conjunct.
5. **No heavy new dependencies.** Prefer what is already installed. If you must add one, justify it in one line.
6. All existing vitest tests must still pass (`npm test`).

---

## 3. STEP 0: AUDIT FIRST (output a concise report before any code)

Read: `PanchangaApp.tsx`, `Header.tsx`, `MobileBottomNav.tsx`, `MobileMenuDrawer.tsx`, `HomeHubView.tsx`, `TodayScheduleView.tsx`, `FiveAngasCard.tsx`, `PanchangaSummaryCard.tsx`, `AuspiciousTimingsCard.tsx`, `MonthlyCalendarView.tsx`, `CalendarDaySheet.tsx`, `KundliView.tsx`, `KundliWelcomeFlow.tsx`, `LocationModal.tsx`, `SettingsModal.tsx`, `styles.css`, `routes/__root.tsx`.

Verify and quantify these findings already observed, then add your own:

| Area | Observed issue |
|---|---|
| Typography | About 740 uses of `text-[9px]`, `text-[10px]`, `text-[11px]` (plus a few at 4-6px). Unreadable on phones, fails accessibility. |
| Tokens | `styles.css` defines good semantic tokens, but components hardcode `stone-*`, `amber-*`, `slate-*` plus `dark:` variants and theme ternaries, so themes drift and changes are expensive. |
| Visual noise | About 39 gradient usages, a multi-radial-gradient body background, an external texture image from `transparenttextures.com` (extra request, breaks offline PWA), a gradient header with many tiny buttons. |
| IA | A utility-first mobile dock hides core content (Today, Kundali) behind a hamburger. Desktop sidebar numbers sections 01-04 with no clear hierarchy. |
| Routing | 14 views in one state switch, so no deep links, no back button, no shareable URLs, and views cannot be code-split cleanly. |
| Accessibility | About 283 `<button>` elements vs about 32 `aria-label`s. Many icon-only buttons. Tiny touch targets. |
| Loading | A single global `isLoading`. Only about 5 skeleton usages. Motion used in only 2 files. |
| Performance | Giant components (`KundliView` 2,400+ lines, `TodayScheduleView` 1,100+, `PrintableNavtaraReport` 166 KB), 6 Google font families loaded up front, `cities.json` of 1.6 MB in `src/data`. |
| Consistency | Each card invents its own padding, radius, heading style and badge style. |

Output: a ranked list (impact vs effort) and a proposed order of work. Then proceed without waiting.

---

## 4. DESIGN PRINCIPLES (use these to resolve every decision)

1. **One hero per screen.** The first viewport answers the main question. Everything else is secondary.
2. **Progressive disclosure.** Summary, tap, detail, expert. Never show 40 data points at once.
3. **Calm luxury.** Generous whitespace, one primary accent (saffron), one secondary (temple indigo), almost no gradients, no decorative clutter. Sacred, not busy.
4. **Consistency over cleverness.** One card, one chip, one sheet, one number style, used everywhere.
5. **Meaningful state color.** Green = auspicious, red/amber = inauspicious, used consistently for Abhijit, Rahu Kala, Gulika, Yamaganda, Choghadiya, Hora ratings, and never for decoration.
6. **Motion with meaning.** 150-250ms, spring easing, respects `prefers-reduced-motion`. Nothing loops except a subtle "now" pulse.
7. **Respect the tradition.** Use refined Devanagari typography and restrained sacred motifs (a thin mandala line, a sun arc). Avoid kitsch.
8. **Trust through transparency.** Show calculation context (ayanamsa, location, method) quietly, never hidden.

---

## 5. STEP 1: DESIGN SYSTEM (single source of truth)

### 5.1 Tokens (extend `src/styles.css`, keep Parchment and Night Sky)
- Surfaces: `--surface-0` (page), `--surface-1` (card), `--surface-2` (raised/sheet), `--surface-3` (hover/selected).
- Text: `--text-1` (primary), `--text-2` (secondary), `--text-3` (tertiary/disabled). All text must pass WCAG AA (4.5:1) on its surface in both themes.
- State: `--auspicious`, `--inauspicious`, `--caution`, `--info`, each with `-subtle` background variants.
- Accent: keep saffron (`--primary`) and temple indigo. Define focus ring, selection, and "now" highlight tokens.
- Elevation: 3 levels only. In dark mode use borders and surface lightness rather than heavy shadows.
- Radius: 3 values (8 / 12 / 20px) plus full for pills. Spacing on a 4/8px grid.
- Night Sky should be true dark with subtle indigo depth, not pure black and not neon.

### 5.2 Typography
- Floor: body 16px, secondary 14px, captions never below 12px. Ban all `text-[Npx]` below 12.
- Scale: Display 32/40, Title 24/32, Heading 18/26, Body 16/24, Label 14/20, Caption 12/16. Devanagari gets +2px line-height on each.
- Families: max two. One Latin sans (Plus Jakarta Sans is fine) plus Noto Sans Devanagari for UI. A serif (Noto Serif / Noto Serif Devanagari) only for hero titles and sacred names. Drop Cinzel if unused after the redesign.
- Self-host and subset fonts (Latin plus Devanagari), `font-display: swap`, preload only the primary weights. Remove the render-blocking Google Fonts CSS.
- `font-variant-numeric: tabular-nums` for all times, degrees and countdowns.

### 5.3 Component primitives (create in `src/components/ds/`)
`Card` (variants: flat, raised, hero), `SectionHeader` (title + optional action), `StatTile` (label, value, sublabel, state), `Chip` / `Badge`, `TimeRange` (start-end with duration, state color), `CountdownRing`, `Segmented` control, `BottomSheet` (Vaul, snap points), `EmptyState`, `ErrorState`, `Skeleton` variants, `IconButton` (enforces aria-label and a 44px target), `KeyHint` (for desktop shortcuts), `InfoTip` (wraps `VedicTermTooltip`, tap-to-open on touch).

Then refactor the existing cards to use them and replace hardcoded color classes with tokens. Delete the external texture and replace the body background with a flat `--surface-0` plus, optionally, a very subtle inline-SVG pattern at under 3% opacity.

### 5.4 Iconography and illustration
One icon set (lucide, 1.5px stroke, 20/24px). Navagraha and Rashi glyphs: consistent weight. Moon phase and sun arc as refined SVG.

---

## 6. STEP 2: INFORMATION ARCHITECTURE AND ROUTING

### 6.1 Real routes (TanStack Router file routes)
Migrate `activeView` to routes while keeping `PanchangaApp` as the layout shell (state stays, rendering moves to `<Outlet />`):

`/` (smart redirect to `/today`), `/today`, `/panchanga` (full detail), `/timings`, `/planets`, `/calendar`, `/festivals`, `/kundli` (with child routes or search params for chart, dasha, doshas, shadbala, jaimini, ashtakavarga, gochar, KP, matchmaking), `/lagna`, `/navagraha`, `/swara`, `/navtara`, `/horas`, `/tattva`, `/settings`.

- Date and location in search params (`?d=31-10-2026&city=...`) so links are shareable.
- Keep permission gating (`VIEW_PERMISSIONS_MAP`) in route guards. Show `AccessDeniedCard` redesigned as a friendly upgrade/login card.
- Route-level code splitting with `lazy` for Kundli, Shadbala, Navtara, Printable* reports, Gochar, Jaimini, Matchmaking.
- Preserve `navPreferences` (user reorder/hide) by driving the tab bar and sidebar from it.

### 6.2 Navigation model

**Mobile bottom tabs (5 max, content first, not utilities):**
1. **Today** (home hero)
2. **Calendar**
3. **Kundli**
4. **Tools** (opens a categorized full-height sheet: Muhurta/Hora/Choghadiya, Swara/Tattva, Navtara, Navagraha/Planets, Festivals, Matchmaking...)
5. **Me** (account, language, theme, sync, notifications, settings, install app, print/export)

Active tab: filled icon + label + small indicator. Never hide labels. Safe-area padding. Hide the bar on scroll-down in long Kundli screens, show on scroll-up.

**Mobile top bar (slim, 56px, no gradient):** left = location pill (tap opens `LocationModal` as a sheet), center = date with prev/next arrows (tap opens a date picker sheet), right = language quick-toggle. That is all.

**Desktop:** left rail (240px, collapsible to 72px icon rail) with 4 clearly named groups (Daily, Astrology, Tools, Culture), no numbering, the active item with an accent bar. Top bar: date navigation, location, global search (Cmd/Ctrl+K command palette with cmdk covering views, cities, tithis, festivals), language, theme, account menu. Utilities (Sync, Print/PDF, Excel, Install) go in a single "Share and Export" menu.

---

## 7. STEP 3: SCREEN-BY-SCREEN SPEC

### 7.1 TODAY (the money screen)
**Mobile, top to bottom:**
1. **Hero card** (`Card variant=hero`): weekday + date (Hindi and English), Vikram/Shaka Samvat and masa/paksha in one line, moon phase glyph, big tithi name with end time, nakshatra with end time. A sun arc shows sunrise to sunset with a live sun marker.
2. **Now Running strip** (reuse `RunningNowWidget` / `CurrentMuhurtaWidget` / `resolveLiveCosmicState`): one line, state-colored ("Abhijit Muhurta until 12:41 PM, 38 min left") with `CountdownRing`. Tap expands to show what to do and avoid.
3. **Five Angas** as horizontally snap-scrolling `StatTile`s (Tithi, Vaara, Nakshatra, Yoga, Karana) with end time and a "next" preview. Tap opens a sheet explaining the term (using the existing tooltip content).
4. **Day timeline** (`MuhurtaTimelineBar`): a vertical or horizontal 24h bar with Rahu Kala / Gulika / Yamaganda / Abhijit / Brahma Muhurta bands and a live "now" marker. Legend in plain words.
5. **Collapsible sections** (default collapsed except Auspicious Timings): Choghadiya, Hora, Swara/Tattva, Planetary positions, Upcoming ingress, Festivals today.
6. A subtle footer line: "Calculated for {city} · {ayanamsa} · Drik".

**Desktop:** 12-column grid. Left 7 columns: hero + Five Angas (as a 5-up row) + timeline. Right 5 columns: Now Running (sticky), Auspicious timings, Choghadiya, Planet snapshot. Below: expandable detail panels.

### 7.2 CALENDAR
Month grid with per-day tithi number, a small festival dot, paksha shading (shukla light / krishna dark), special-day markers (Ekadashi, Purnima, Amavasya) as small glyphs. Swipe left/right to change months on mobile. Tap a day: bottom sheet (`CalendarDaySheet`) on mobile, right-side detail panel on desktop (master-detail). Month summary strip above the grid (upcoming 3 key days). Filter chips: All / Vrat / Festivals / Eclipses.

### 7.3 KUNDLI
- **Entry:** use `KundliWelcomeFlow` as a 3-step stepper (Name & date, Time & place with `KundliCityModal` city search, Confirm). Show saved charts as cards with avatar initials. Validation inline, native date/time inputs on mobile.
- **Chart view:** the chart is the hero (North/South Indian style toggle as `Segmented`). Below it, a scrollable `Segmented` / tab row: Overview, Charts (D1, D9, others via a picker), Dasha, Doshas, Shadbala, Ashtakavarga, Jaimini, KP, Gochar, Matchmaking, Report.
- Replace wide tables with stacked cards on mobile; planets as a list with sign, degree, nakshatra-pada, and state badges (exalted, debilitated, retrograde, combust).
- Dasha as an interactive timeline (nested periods expandable), "current period" always highlighted and pinned.
- Shadbala and Ashtakavarga as clean Recharts bar/heat views with a plain-language caption per chart ("What this means").
- Every number with a Vedic term has an `InfoTip`.
- Export/print as a single "Report" action.

### 7.4 TOOLS (Hora, Choghadiya, Swara, Tattva, Navtara, Navagraha, Festivals, Matchmaking)
Each tool: a one-line purpose subtitle, a clear "now" state at the top, then detail below. Same card, chip and timeline primitives everywhere. Guna Milan: two-person input as a stepper, result as a score ring (x/36) with an 8-koota breakdown list and a short verdict.

### 7.5 LOCATION AND SETTINGS
- Location: a full-screen sheet with search (debounced against `/api/cities`), "Use my location", recents, and favorites. Show the resolved city and timezone clearly.
- Settings: grouped list (Language, Theme, Calculation: month system / ayanamsa / birth nakshatra, Notifications, Calendar sync, Data/Export, About). Use plain-language descriptions under every advanced option, and a "Recommended" badge on defaults.

### 7.6 HOME HUB
If `HomeHubView` stays, make it a launcher, not a second dashboard: greeting by time of day, today in one line, then a grid of tool cards. Otherwise merge it into Today and redirect.

---

## 8. STEP 4: STATES, MOTION AND MICRO-INTERACTIONS

- **Loading:** per-section skeletons matching final layout (no layout shift), not a global spinner. Keep stale data visible while refreshing (stale-while-revalidate via the existing `panchangaCache`).
- **Empty / error / offline:** friendly copy in both languages, one clear action, and an offline banner using the PWA cache.
- **Motion:** shared-element-style transition for the Today hero to detail views, spring bottom sheets, number tick-ups on date change, fade-slide between days (direction-aware), tab indicator slide. All gated by `prefers-reduced-motion`.
- **Haptics-like feedback:** pressed states (scale 0.98), ripple-free, instant.
- **Gestures (mobile):** swipe between days on Today, swipe months on Calendar, drag-to-dismiss sheets, pull-to-refresh.
- **Toasts:** Sonner, bottom-center on mobile above the tab bar, top-right on desktop.

---

## 9. STEP 5: DESKTOP POWER FEATURES

- Command palette (Cmd/Ctrl+K): jump to any view, change city, change date ("next ekadashi"), toggle theme/language.
- Shortcuts: Left/Right = previous/next day, T = today, C = calendar, K = kundli, / = search, ? = shortcut help sheet.
- Hover cards for Vedic terms, resizable panels where it helps (Kundli chart + details using `react-resizable-panels`), sticky section headers, keyboard-navigable calendar grid (arrow keys).
- Responsive up to 1920px: content max-width ~1280px, centered, with the rail fixed.

---

## 10. STEP 6: PERFORMANCE AND CODE HEALTH

- Route-level code splitting (see 6.1). Defer Recharts, jsPDF, html2canvas, xlsx until the user triggers an export/chart.
- Split `PanchangaApp.tsx`, `KundliView.tsx`, `TodayScheduleView.tsx` into feature folders (`features/today`, `features/kundli`, ...) with the behavior unchanged. Keep each file under about 500 lines.
- Memoize heavy cards and normalizers; avoid recomputing `normalizeDailySchedule` on unrelated renders.
- Images/icons: inline SVG; PWA icons stay; preload the primary font only.
- Service worker: keep `notification-sw.js` behavior; ensure the app shell and last-viewed day are available offline.
- Add `loading="lazy"`, `content-visibility: auto` for long offscreen sections.

---

## 11. STEP 7: ACCESSIBILITY AND TRUST

- WCAG 2.2 AA in both themes: contrast, focus-visible rings on everything interactive, 44x44px targets, no information by color alone (pair state colors with an icon or label).
- Every icon-only control gets an `aria-label` (localized). Correct landmarks (`header`, `nav`, `main`), one `h1` per route, logical heading order.
- Screen readers: announce date and tithi changes with `aria-live="polite"`; label Devanagari content with `lang="hi"` and English with `lang="en"`.
- Works at 200% zoom and with large system fonts without clipping.
- Forms: labels always visible, errors adjacent, no placeholder-as-label.

---

## 12. EXECUTION PLAN AND DELIVERABLES

Work in this order, committing after each phase and keeping the build green:

1. **Audit report** (Section 3).
2. **Design system**: tokens, type, primitives (Section 5). Replace `text-[<12px]` globally and swap hardcoded colors for tokens.
3. **Shell + routing**: routes, top bar, mobile tabs, desktop rail, command palette (Section 6).
4. **Today** (mobile then desktop) (7.1).
5. **Calendar** (7.2).
6. **Kundli** (7.3).
7. **Tools** (7.4), then **Location/Settings** (7.5), then **Home** (7.6).
8. **States, motion, accessibility, performance** passes (Sections 8, 10, 11).

**After each phase, report:** files changed, what was deliberately left untouched, any behavior risks, and confirmation that `npm run build` and `npm test` pass. Test at **360, 390, 412, 768, 1024, 1440, 1920px**, in **Parchment and Night Sky**, in **Hindi and English**.

**If context is limited:** finish phases 1 to 4 completely (system, shell, routing, Today) before starting later phases, and tell me what remains.

**Definition of done:** no text under 12px, no hardcoded theme color classes in redesigned components, every route deep-linkable, every icon button labeled, every redesigned screen has loading, empty and error states, and all prior features still work.
