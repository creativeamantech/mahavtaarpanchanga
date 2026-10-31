# Mobile UI/UX Overhaul: Bottom Utility Dock & Hamburger Drawer

## User Clarification & Requirements
1. **Hamburger Menu placement**: In the **mobile bottom navigation bar** as a dedicated action button.
2. **Calendar action**: Tapping **कैलेंडर (Calendar)** in the bottom bar navigates directly to the **full Month Calendar view** (`calendar`).
3. **Bottom Navigation Panel Transformation**: Replace the current Vedic tab list with top utility controls:
   - **लोकेशन (Location)**: Opens `LocationModal` (search city or GPS).
   - **कैलेंडर (Calendar)**: Switches to the full monthly calendar view (`onViewChange('calendar')`).
   - **सिंक (Sync)**: Triggers Google Calendar daily sync modal (`onOpenCalendarSync`).
   - **मेन्यू (Menu / Hamburger)**: Opens the full Vedic module drawer.
   - **सेटिंग्स (Settings)**: Opens `SettingsModal`.
   - **साइन इन / खाता (Sign In / Account)**: Opens auth / Google Sheets login modal or shows active user profile & sign out.
4. **Comprehensive Hamburger Menu Drawer**:
   - Categorized directory of all Panchanga views (Daily Panchanga, Muhurtas, Kundali, Lagna, Hora, Choghadiya, Tattva, Swara, Navtara, Festivals, Matchmaking, Navagraha, Audits).
   - Quick language toggle (हिन्दी / English) and theme toggle (Saffron / Night Sky).
   - Smooth slide-up bottom sheet / drawer with safe-area insets.
5. **Mobile Header Clean-up**:
   - Streamline top header on mobile screens to prevent clutter and duplicate buttons.

---

## Architecture & Implementation Steps

### 1. Create `src/components/MobileMenuDrawer.tsx`
- Build a responsive slide-up bottom sheet (using Radix Dialog / Vaul / Tailwind v4) specifically designed for mobile devices.
- Group all Vedic sections into logical categories with distinct spiritual iconography and badges:
  - **दैनिक पंचांग (Daily Panchanga)**: आज का पंचांग (Today), विस्तृत पंचांग (Full Panchanga), पंच अंग (Five Angas), मुहूर्त एवं काल (Muhurtas).
  - **ज्योतिष व कुण्डली (Astrology & Kundali)**: जन्म कुण्डली (Kundali), लग्न चार्ट (Lagna Chart), नवग्रह (Navagraha), अष्टकवर्ग (Ashtakavarga), षड्बल (Shadbala), जैमिनी (Jaimini).
  - **विशेष गणनाएँ व मिलान (Vedic Tools & Matchmaking)**: गुण मिलान (Guna Milan), होरा चक्र (Hora), चौघड़िया (Choghadiya), स्वर योग (Swara), तत्व (Tattva), नवतारा (Navtara), पर्व एवं त्यौहार (Festivals).
- Include quick toggles for Language, Theme, and Print/PDF almanac.
- Provide active indicators so users can see which view is currently open.

### 2. Update `src/components/MobileBottomNav.tsx`
- Refactor the 4-item view tabs into a 6-item utility dock:
  1. `लोकेशन` (MapPin): invokes `onOpenLocation`.
  2. `कैलेंडर` (CalendarDays): invokes `onViewChange('calendar')` with active highlight when on calendar.
  3. `सिंक` (RefreshCw / CalendarSync): invokes `onOpenCalendarSync`.
  4. `मेन्यू` (Menu / Sparkles): triggers `onOpenMenu` (the Hamburger drawer).
  5. `सेटिंग्स` (Settings): invokes `onOpenSettings`.
  6. `लॉगिन / प्रोफ़ाइल` (User / LogIn): invokes `onOpenAuth` (Google Sheets authentication modal) or displays user avatar with sign-out option.
- Enforce strict touch target minimums (>= 44px x 44px) and safe-area padding at the bottom (`env(safe-area-inset-bottom)`).
- Visual feedback with tactile animations and micro-indicators.

### 3. Connect State & Drawer in `src/PanchangaApp.tsx`
- Add `isMobileMenuOpen` state in `PanchangaApp.tsx`.
- Pass necessary handlers (`onOpenLocation`, `onViewChange`, `onOpenCalendarSync`, `onOpenSettings`, `onOpenAuth`, `onLogout`, `currentUser`) to `MobileBottomNav`.
- Mount `<MobileMenuDrawer />` with smooth open/close transitions.

### 4. Optimize `src/components/Header.tsx` on Mobile
- Hide duplicate utility buttons (Location, Calendar sync, Settings) on narrow mobile screens (`hidden sm:flex` or `hidden lg:flex`), keeping the header clean and uncluttered.
- Keep the Date navigation strip (Prev/Next Day and Date label) centered and prominent.

### 5. Verification & Testing
- Run `compile_applet` to ensure zero compilation or TypeScript errors.
- Validate layout on mobile viewports (360px, 390px, 412px, 430px) in both Light and Dark (Night Sky) themes.
- Confirm all actions (Location, Calendar, Sync, Settings, Auth, Drawer views) operate seamlessly without breaking state or calculations.
