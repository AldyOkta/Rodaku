---
name: Veloce Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#43474e'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#73777f'
  outline-variant: '#c3c6cf'
  surface-tint: '#416088'
  primary: '#001f3f'
  on-primary: '#ffffff'
  primary-container: '#12355b'
  on-primary-container: '#809eca'
  inverse-primary: '#aac8f6'
  secondary: '#a14000'
  on-secondary: '#ffffff'
  secondary-container: '#ff7528'
  on-secondary-container: '#5f2200'
  tertiary: '#1c2023'
  on-tertiary: '#ffffff'
  tertiary-container: '#313538'
  on-tertiary-container: '#9a9da1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e3ff'
  primary-fixed-dim: '#aac8f6'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#28486f'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb694'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7b2f00'
  tertiary-fixed: '#e0e3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#181c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
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
    lineHeight: 14px
  stat-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system is engineered for motorcycle riders and fleet caretakers who value mechanical reliability, speed of execution, and pristine logging clarity. The aesthetic combines automotive instrument precision with clean modern utility. It prioritizes instant legibility in high-glare environments (such as outdoor sunlight by the roadside or workshop floors) through an uncompromising 60-30-10 color balance: 60% neutral canvases (#F6F7F9 and crisp white surfaces), 30% structural deep navy (#12355B for headers, active states, and structural chrome), and 10% high-energy mechanical orange (#F26B1D reserved strictly for primary logging actions and critical indicators).

The style is modern, solid, and structural—rejecting fussy ornamental gradients or excessive glass blurs in favor of tactile confidence, clean card dividers, precise status beacons, and decisive micro-interactions.

## Colors

The palette establishes an immediate optical hierarchy through strict functional allocation:

- **Primary Canvas & Surfaces**: Background defaults to `#F6F7F9` (Surface Dim) to reduce glare and differentiate pure white (`#FFFFFF`) card units. Secondary container surfaces utilize `#F1F4F8` for subtle segmentation, such as odometer chips or table header fills.
- **Structural Navy (`#12355B`)**: Anchors app identity, primary navigation bars, active tab indicator bars, headline typography, and key data labels.
- **Accent Flare (`#F26B1D`)**: High-visibility safety orange. Applied strictly to the key record button ("Catat"), floating action clusters, mileage milestones, and crucial interactive toggles.
- **Text & Hierarchy**:
  - `Text Primary` (`#111827`): Extreme contrast on light cards for numbers, service names, and prices.
  - `Text Secondary` (`#6B7280`): Timestamps, VIN notes, part specifications, and helper labels.
  - `Borders & Rules` (`#E5E7EB`): Structural hairline edges dividing log entries and metric boxes.
- **Diagnostics & Status System**:
  - `Safe / Aman`: `#16A34A` (Oil within threshold, chain tension optimal)
  - `Due Soon / Segera Servis`: `#D97706` (Within 300 km or 14 days of scheduled check)
  - `Overdue / Terlambat`: `#DC2626` (Critical brake fluid interval missed, immediate action required)

## Typography

Plus Jakarta Sans is utilized across all tiers. Its geometry provides rapid scanning speed and contemporary energy, while open counters preserve legibility on small mobile displays under vibrating riding conditions.

- **Numerical Hierarchy**: Odometer values, trip calculations, and currency amounts utilize `stat-metric` or `headline-lg` with `tabular-nums` formatting to prevent metric jitter during real-time value changes.
- **Semantic Weighting**: Headings rely on 700 and 800 weights in `#12355B` to clearly anchor functional sections. Secondary metadata (part numbers, engine codes) is kept at 400 or 500 weight in `#6B7280` to preserve white space balance.

## Layout & Spacing

The layout is built on an ergonomic mobile-first 4-column structure, transitioning to an 8-column layout for tablets and a 12-column layout on desktop dashboards. 

- **Thumb Zone Design**: Primary trigger zones (such as the quick entry "Catat" FAB and bottom tab switches) sit comfortably inside the lower 25% screen arc on mobile.
- **Card Clustering**: Maintenance telemetry cards (Tires, Engine Oil, Spark Plugs, CVT Belt) are organized in structured 2-column or full-width grids with consistent `space-md` (0.75rem / 12px) internal gaps, allowing riders to scan component health without excessive scrolling.

## Elevation & Depth

Visual hierarchy uses crisp surface tonal contrast paired with restrained, tight mechanical drop shadows:

- **Surface Level 0 (Base)**: `#F6F7F9` canvas. No elevation.
- **Surface Level 1 (Cards, Metric Containers)**: Pure white `#FFFFFF` bounded by a crisp 1px hairline border (`#E5E7EB`). Subtle ambient drop: `0px 1px 3px rgba(18, 53, 91, 0.05), 0px 4px 12px rgba(18, 53, 91, 0.02)`.
- **Surface Level 2 (Sticky Headers, Drawers)**: `#FFFFFF` with `0px 4px 16px rgba(18, 53, 91, 0.08)`.
- **Surface Level 3 (Primary Trigger / Floating 'Catat' Action)**: `#F26B1D` surface with a localized directional shadow: `0px 8px 20px rgba(242, 107, 29, 0.35)`.
- **Modals & Overlays**: Clean dark backdrop blur (`rgba(18, 53, 91, 0.45)` with `backdrop-filter: blur(4px)`).

## Shapes

The design system adopts **Level 2 (Rounded)**:
- Standard buttons, input fields, and metric modules have a 0.5rem (8px) base radius.
- Cards, summary panels, and bottom sheets use a 1rem (16px) radius (`rounded-lg`).
- Modal sheets and primary card hero banners scale to 1.5rem (24px) (`rounded-xl`).
- Status tags, category pills, and micro-badges use full pill rounding (9999px) for clear delineation against square metric values.

## Components

- **Buttons**:
  - *Primary ("Catat" & Commit Actions)*: Solid `#F26B1D` fill with white text, bold weight (`label-lg`), height 48px, radius 8px. Hover/pressed shift: `#D95B14`.
  - *Secondary (Filter / History Navigation)*: Solid `#12355B` fill with white text, or pure white card style with 1px `#E5E7EB` border and `#12355B` text.
  - *Ghost / Tertiary*: Zero border, `#12355B` text with `#F1F4F8` pressed state.
- **Metric Cards & Service Trackers**:
  - Encased in white containers with `#E5E7EB` boundary.
  - Features an inline status badge (e.g., "Aman", "Segera Servis", "Terlambat") paired with an accent progress bar (3px height) displaying remaining mileage or service lifespan.
- **Form Inputs & Odometer Counters**:
  - Background `#FFFFFF`, 1px border `#E5E7EB`, height 44px, text `#111827`. Focus state activates a 2px outer outline in `#12355B` without offset. Monospace alignment (`font-variant-numeric: tabular-nums`) for currency and kilometer fields.
- **Chips & Filters**:
  - Base state: `#F1F4F8` fill, `#6B7280` text, no border.
  - Selected state: `#12355B` fill, `#FFFFFF` text.
- **Status Badges**:
  - Compact pill style with a tinted background and high-contrast solid text:
    - *Aman*: `#DCFCE7` background with `#16A34A` text.
    - *Segera Servis*: `#FEF3C7` background with `#D97706` text.
    - *Terlambat*: `#FEE2E2` background with `#DC2626` text.
- **Log List Rows**:
  - Clean separation using hairline `#E5E7EB` border-bottom.
  - Left column: Category icon container (40x40px, rounded, `#F1F4F8` with `#12355B` icon glyph).
  - Center column: Maintenance label (`title-md`) and subtext (`body-sm` in `#6B7280`).
  - Right column: Cost and date formatted with high optical contrast.