---
name: GAB-EDT
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#623c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#825100'
  on-tertiary-container: '#ffcb8f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system serves the mobile academic community of Lycée National Léon Mba. It balances republican institutional gravitas with the agile immediacy required by high school students, faculty, and administrative staff navigating daily timetables, room changes, and official announcements.

The aesthetic direction is **Modern Institutional / Educational Tech**:
- **Clarity & Utility**: High legibility under direct daylight conditions, clear functional cues, and immediate scanning of complex schedules.
- **Academic Rigor & Optimism**: A solid royal blue base evoking trust and discipline, paired with energetic emerald and amber accents signifying academic success, active states, and alert thresholds.
- **Physical-Digital Transition**: Replaces paper boards with crisp, tactile card-based surfaces, subtle boundaries, and fluid mobile ergonomics designed for single-handed usage on smartphones.

## Colors

The palette establishes an authoritative yet welcoming educational hierarchy with strict compliance to WCAG AA/AAA contrast ratios:

- **Primary (`#1D4ED8` / Deep `#1E40AF`)**: Royal Blue represents institutional authority, active schedule tabs, primary CTA buttons, and key navigation identifiers.
- **Secondary (`#10B981`)**: Emerald Green indicates ongoing courses, validated attendances, positive grades, and room availability.
- **Tertiary (`#F59E0B`)**: Warm Amber marks room reassignments, schedule alerts, pending items, and upcoming exam deadlines.
- **Neutral (`#0F172A`)**: Dark Slate provides deep contrast for typography, ensuring sharp readability across high-DPI mobile screens without the starkness of pure black.
- **Surfaces & Backgrounds**: Base background is set to soft Cool Grey (`#F8FAFC`), while primary containers and interactive cards sit on Pristine White (`#FFFFFF`). Hairline borders use `#E2E8F0` to maintain definition without visual noise.

## Typography

The design system relies on **Plus Jakarta Sans** across all roles to achieve a contemporary, geometric, yet open and humane rhythm.

- **Headlines**: Weighted from SemiBold (600) to Bold (700). Used for timetable day headers, screen titles, and current subject highlights.
- **Body**: Uses Regular (400) with generous line heights to prevent visual fatigue when scanning dense hourly timelines and academic notes.
- **Labels & Microcopy**: Medium (500) to SemiBold (600) for timestamps, room codes (e.g., `BAT-B 104`), badges, and tab bars. Numerical figures use tabular lining figures (`font-variant-numeric: tabular-nums`) to maintain vertical alignment in schedule grids.

## Layout & Spacing

The layout is built on an **8pt flexible vertical grid** coupled with a mobile-optimized **4-column fluid layout** tailored for handheld viewports (360px to 428px standard device widths):

- **Screen Margins**: Default to `1rem` (16px) on compact handhelds, expanding to `1.5rem` (24px) on tablet split-views.
- **Gutters**: Set to `1rem` (16px) to keep course cards legible side-by-side where multi-column views occur (e.g., weekly agenda).
- **Rhythm & Safe Areas**: Layouts adhere strictly to top status bar notches and bottom navigation gesture bars. Vertical scroll zones feature `1.5rem` (24px) end-of-list clearance above navigation bars.

## Elevation & Depth

Visual hierarchy uses a refined combination of **tonal differentiation**, **whisper-soft ambient shadows**, and **structural hairpins**:

- **Canvas (Level 0)**: `#F8FAFC`. Zero elevation, base background for all scroll containers.
- **Surface Cards (Level 1)**: Pure white `#FFFFFF` layered with a crisp boundary `1px solid #E2E8F0` and an ultra-diffused drop shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 6px -1px rgba(15, 23, 42, 0.02)`.
- **Active / Raised State (Level 2)**: Used for current ongoing class cards and floating action triggers: `box-shadow: 0 8px 16px -4px rgba(29, 78, 216, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
- **Bottom Navigation & Sheets (Level 3)**: Fixed native chrome layers employ `rgba(255, 255, 255, 0.94)` with an active backdrop blur (`backdrop-filter: blur(12px)`) and a `1px` subtle boundary (`#E2E8F0`) at the top edge.

## Shapes

The design system incorporates a disciplined **Level 2 (Rounded)** shape strategy tailored to cards, chips, and navigational inputs:

- **Timetable & Module Cards**: Strictly governed by `border-radius: 16px` (1rem), providing an approachable, tactile card feel.
- **Buttons & Text Inputs**: Radius of `10px` to `12px` ensuring ergonomic thumb tapping.
- **Pills & Status Badges**: Full geometric radius (`border-radius: 9999px`) for filter chips, live tags, and active top segment indicators.
- **Modals & Bottom Sheets**: Top corners rounded to `24px` for natural drag affordance.

## Components

### Buttons
- **Primary**: Background `#1D4ED8`, text `#FFFFFF`, height `48px`, radius `12px`, font weight `600`. Pressed state shifts to `#1E40AF`.
- **Secondary / Ghost**: White background, `1px solid #CBD5E1` border, `#0F172A` text.
- **Contextual / Accent**: Used for quick schedule confirmation; emerald background `#10B981` with white text.

### Timetable Cards (Signature Component)
- Background `#FFFFFF`, radius `16px`, border `1px solid #E2E8F0`, padding `16px`.
- Left-side indicator bar (`4px` width, radius `4px`) color-coded by discipline category or status (e.g., `#1D4ED8` for General Courses, `#10B981` for Current/Ongoing, `#F59E0B` for Room Change/Warning).
- Features vertical layout: Subject title (Bold, 16px), Professor & Room Tag (14px), Time Block (SemiBold, 12px Slate).

### Top Segmented / Tab Controls
- Dual-mode option:
  1. **Pill Switcher**: Horizontal container with `#F1F5F9` background, `8px` padding. Active day/week pill transitions with white surface `#FFFFFF`, subtle shadow, and bold royal blue text.
  2. **Underline Tab**: Transparent background with a `2px` sliding indicator in `#1D4ED8` directly under the active label with `0.5rem` bottom padding.

### Chips & Badges
- **Status Pills**: Height `24px`, padding `0 10px`, radius `9999px`.
- **Live / In-Course Badge**: Emerald `#ECFDF5` background with `#047857` text and a pulsing 6px dot.
- **Room Alert Badge**: Amber `#FFFBEB` background with `#B45309` text.

### Form Inputs & Selectors
- Height `48px`, background `#FFFFFF`, border `1.5px solid #E2E8F0`, radius `10px`, padding `0 14px`.
- Focused state: Border transitions to `#1D4ED8` accompanied by a `3px` focus ring at `rgba(29, 78, 216, 0.15)`.

### Bottom Navigation Bar (iOS & Android)
- Height `64px` plus safe-area-inset-bottom.
- Glass background (`rgba(255, 255, 255, 0.92)` with `blur(16px)`).
- Items utilize 24px clean vector line icons with 10px labels. Active item receives `#1D4ED8` fill/tint; inactive items sit at `#64748B`.