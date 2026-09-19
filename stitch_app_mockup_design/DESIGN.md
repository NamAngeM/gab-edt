---
name: GAB-EDT Institutional Engine
colors:
  surface: '#FFFFFF'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006780'
  on-secondary: '#ffffff'
  secondary-container: '#76dcff'
  on-secondary-container: '#006077'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#6cd3f7'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e61'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#F8FAFC'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
  primary-dark: '#1D4ED8'
  primary-light: '#EFF6FF'
  success: '#16A34A'
  warning: '#D97706'
  danger: '#DC2626'
  info: '#0891B2'
  text-primary: '#0F172A'
  text-secondary: '#475569'
  text-muted: '#64748B'
  border: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-h4:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  small:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  badge-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes a high-density, institutional-grade digital workplace for higher education, universities, selective "Grandes Écoles", and secondary educational institutions. The platform’s core ethos is grounded in the principle: **"Complexité fonctionnelle à l'intérieur, simplicité visuelle à l'extérieur"** (Internal functional complexity, external visual simplicity).

The interface replaces legacy, cluttered scheduling interfaces with a modern **Corporate / Modern** aesthetic that emphasizes clarity, strict alignment, structural legibility, and swift data processing. The brand evokes absolute reliability, operational control, and friction-free navigation for registrars, department chairs, faculty, and students alike. The visual mood is crisp, airy, and methodical, minimizing visual exhaustion across multi-hour scheduling and dispatch workflows.

## Colors

The color architecture is built around an authoritative deep royal blue primary, supported by functional informational hues and high-legibility slate neutrals:

- **Primary (`#2563EB`)** and **Primary Dark (`#1D4ED8`)**: Used exclusively for active navigation states, primary buttons, batch action confirmations, and focused elements.
- **Primary Light (`#EFF6FF`)**: Serves as the wash tone for selected schedule slots, active row highlights, and informational badge backdrops.
- **Functional Semantics**:
  - **Success (`#16A34A`)**: Confirmed schedule slots, zero-conflict validations, and room availability indications.
  - **Warning (`#D97706`)**: Soft room capacity constraints, non-blocking overlap notices, and unvalidated draft shifts.
  - **Danger (`#DC2626`)**: Critical room/instructor double-bookings, holiday clashes, and destructive deletions.
  - **Info (`#0891B2`)**: External instructor assignments, exam periods, and administrative notes.
- **Neutrals**:
  - Canvas background (`#F8FAFC`) creates high-contrast separation from pure white elevated surfaces (`#FFFFFF`).
  - Strict typographic values (`#0F172A`, `#475569`, `#64748B`) provide razor-sharp text hierarchies without muddy tones.
  - Borders are strictly anchored to `#E2E8F0` for structure.

## Typography

Typography relies entirely on **Inter**, an industry-standard grotesque neo-grotesque sans-serif that excels in dense numerical, tabular, and dashboard contexts:

- **Hierarchy Structure**: A strict scale with optical sizing balances data density against administrative legibility.
- **Font Feature Settings**: Calendar time-slot headers, room codes, student group IDs, and schedule blocks leverage tabular figures (`tnum`) to ensure perfect vertical alignment across weekly columns.
- **Weight Strategy**: Headings use `600` (Semi-bold) or `700` (Bold) to define anchors on the canvas. Interactive controls and data labels use `500` (Medium). General copy, descriptions, and secondary metadata use `400` (Regular).

## Layout & Spacing

Layouts follow a mathematically consistent 4px rhythm (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`):

- **Master Frame Architecture**:
  - **Sidebar Navigation**: Fixed `256px` width on desktop, collapsing to an icon-only `72px` rail to optimize grid real estate. Collapsed on viewports `< 1024px` into an off-canvas drawer.
  - **Topbar**: Fixed height of `64px` carrying breadcrumb structures, institution/campus switcher, unified command bar search, and alert queues.
- **Data Densities & Grids**:
  - **Weekly Calendar Grid**: Employs a CSS Grid structured into 5–6 day columns with fixed 30-minute interval row tracks (48px standard track height; 36px compact track height).
  - **Content Canvas**: A 12-column fluid grid system with `16px` gutters (`gutter`) and `24px` horizontal padding (`margin`) across desktop screens.
- **Breakpoints**:
  - `Mobile (< 640px)`: The weekly calendar morphs into a single-day vertical timeline with day-by-day swipe/segmented controls. Forms reflow into a single column.
  - `Tablet (640px – 1023px)`: Calendar grid supports 3–5 days with horizontal scroll tracks; navigation moves to an overlay sidebar.
  - `Desktop (1024px+)`: Complete 6-day full-week matrix with side-by-side drawer event inspector.

## Elevation & Depth

Visual depth avoids excessive drop shadows to keep the SaaS cockpit crisp and legible:

- **Low-Contrast Outlines & Tonal Surface Layers**: Contrast is driven primarily by 1px solid structural dividers (`#E2E8F0`) between modules, table headers, and calendar slots.
- **Elevation Steps**:
  - **Level 0 (Flat Canvas)**: `#F8FAFC` global page backdrop.
  - **Level 1 (Card & Module Surface)**: `#FFFFFF` fill bounded by a 1px `#E2E8F0` border. A micro-shadow (`0 1px 2px 0 rgba(15, 23, 42, 0.05)`) differentiates active cards from the background.
  - **Level 2 (Dropdowns, Popovers, & Active Event Dragging)**: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` with a 1px `#E2E8F0` border.
  - **Level 3 (Modals & Slide-out Drawers)**: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)` combined with a 40% `#0F172A` backdrop overlay.

## Shapes

The interface balances sharp corporate utility with approachable modern SaaS curves using an 8px base radius:

- **Inputs, Buttons, & Controls**: Enforce an 8px (`rounded-md`) border radius, preserving clean alignment lines across toolbar stacks.
- **Cards, Modals, & Event Blocks**: Use 12px to 16px (`rounded-lg` to `rounded-xl`) corner radii for visual separation.
- **Badges, Tags, & Status Pills**: Retain full pill shaping (`9999px`) to immediately distinguish analytical attributes and pedagogical formats (CM, TD, TP) from interactive structural containers.

## Components

### Buttons & Interactive Controls
- **Primary Button**: Solid `#2563EB` fill, white `#FFFFFF` text, `font-weight: 500`, 8px radius. Hover state shifts to `#1D4ED8`. Active state deepens with 1px inset shadow.
- **Secondary Button**: White `#FFFFFF` surface with a 1px `#E2E8F0` border, `#0F172A` text. Hover transitions to `#F8FAFC` background.
- **Danger Button**: `#DC2626` background, `#FFFFFF` text. Used for course cancelations or deleting schedules.
- **Icon Buttons**: 36px x 36px or 40px x 40px square with 8px radius, centering standard Lucide icons with `#475569` stroke.

### Input Fields & Selects
- **Height & Layout**: Fixed 38px to 40px input height, `#FFFFFF` background, 1px `#E2E8F0` border, `#0F172A` text, and 8px corner radius.
- **Focus State**: Clear 2px primary ring in `#2563EB` with an offset of 0px.
- **Campus / Institution Switcher**: A segmented trigger in the topbar displaying institution logo/avatar, establishment name, and dropdown caret.

### Topbar & Sidebar
- **Topbar**: Sticky 64px header, white background, bottom 1px `#E2E8F0` border. Houses dynamic breadcrumbs (`Text Muted` `/` dividers), global search field with `⌘K` keyboard shortcut badge, notification trigger badge, and faculty avatar.
- **Sidebar**: White background, right 1px border. Navigation items include a 20px Lucide icon, label, and nested accordion trigger. Active route: `#EFF6FF` background with `#2563EB` text and a left-aligned 3px solid `#2563EB` indicator bar.

### Calendar Grid & Event Blocks
- **Time Slots**: 1px `#E2E8F0` horizontal and vertical grid dividers. Subtle half-hour dashed guides.
- **Course Slots (Events)**:
  - **CM (Cours Magistral)**: Tinted `#EFF6FF` background, left 4px `#2563EB` accent border, `#1E40AF` course title, and `#475569` room/instructor details.
  - **TD (Travaux Dirigés)**: Tinted `#ECFDF5` background, left 4px `#16A34A` accent border, `#065F46` course text.
  - **TP (Travaux Pratiques)**: Tinted `#FFFBEB` background, left 4px `#D97706` accent border, `#92400E` course text.
  - **Conflict State**: Red-striped outline overlay, danger badge (`🔴 Conflit critique`), and warning banner.

### Badges, KPIs & Data Tables
- **Status Badges**: 20px height, 6px horizontal padding, pill-shaped. Includes dot indicators for live statuses.
- **KPI Summary Cards**: White card with 1px `#E2E8F0` border, 16px internal padding. Metric value rendered in `28px` bold `#0F172A`, trend pill badge in corner, and secondary descriptive label in `#64748B`.
- **Data Tables**: Striped hover states (`#F8FAFC`), sticky `#FFFFFF` header with sorting arrows, clean 1px row borders, right-aligned action buttons, and pinned selection checkboxes.