---
name: AICTE PRAMAN Portal System
colors:
  surface: '#faf8ff'
  surface-dim: '#d3d8f8'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ebedff'
  surface-container-high: '#e4e7ff'
  surface-container-highest: '#dce1ff'
  on-surface: '#141a32'
  on-surface-variant: '#454654'
  inverse-surface: '#292f48'
  inverse-on-surface: '#eff0ff'
  outline: '#757686'
  outline-variant: '#c5c5d7'
  surface-tint: '#3a4fd4'
  primary: '#3348ce'
  on-primary: '#ffffff'
  primary-container: '#4f63e8'
  on-primary-container: '#f7f5ff'
  inverse-primary: '#bbc3ff'
  secondary: '#394dcf'
  on-secondary: '#ffffff'
  secondary-container: '#5467e9'
  on-secondary-container: '#fffbff'
  tertiary: '#9f3419'
  on-tertiary: '#ffffff'
  tertiary-container: '#c04b2e'
  on-tertiary-container: '#fff4f2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bbc3ff'
  on-primary-fixed: '#000d60'
  on-primary-fixed-variant: '#1b33bc'
  secondary-fixed: '#dfe0ff'
  secondary-fixed-dim: '#bcc3ff'
  on-secondary-fixed: '#000d60'
  on-secondary-fixed-variant: '#1e34b9'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0700'
  on-tertiary-fixed-variant: '#862208'
  background: '#faf8ff'
  on-background: '#141a32'
  surface-variant: '#dce1ff'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 17px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 15px
  caption:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-sm: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
  space-2xl: 2.5rem
---

## Brand & Style
The design system delivers a progressive, high-trust institutional workspace tailored for higher education regulation, institution accreditation, and faculty verification. Combining corporate governance with contemporary SaaS lightness, it translates administrative complexity into clear, approachable, and actionable workflows. 

The aesthetic reflects a soft corporate minimalism encased within an elevated floating viewport. A tinted outer canvas envelops the central application shell, giving the interface a dimensional, focused presentation. Clean white cards sit atop subtle lavender-tinted surfaces, accented by rich indigo brand elements, bright functional color tags, and polished micro-gradients. The resulting mood conveys institutional authority, speed, transparency, and effortless control.

## Colors
The color architecture establishes clear visual contrast between systemic chrome, canvas surfaces, and content cards.

- **Primary (`#4F63E8`)**: Defines active navigational highlights, primary buttons, focus rings, selected table rows, and key administrative action triggers.
- **Secondary Gradient (`#5B6EF0` to `#4A5DE0`)**: Applied exclusively to the hero announcement banner and primary metric headers.
- **Canvas & Backgrounds**:
  - Outer Presentation Canvas: `#D9DBFB` (soft tinted periwinkle backdrop framing the floating main viewport).
  - Main App Surface: `#F4F5FE` (ultra-soft lavender-gray interior base).
  - Component Cards & Panels: `#FFFFFF` (crisp white for contrast against `#F4F5FE`).
- **Category & Role Accent Gradients**:
  - Electric Blue: `#4F63E8` to `#3B4ED4`
  - Sunset Orange: `#FF7A59` to `#EE5B37`
  - Crimson Coral: `#FF5B79` to `#E03E5D`
  - Emerald Green: `#22C55E` to `#16A34A`
  - Vivid Violet: `#8B5CF6` to `#6D28D9`
- **Text & Hierarchy**:
  - Headings & Primary Text: `#1E2238`
  - Secondary & Metadata Text: `#6C728E`
  - Muted / Disabled Text: `#9DA2BA`
  - Borders & Dividers: `#E8EAF5`
- **Verification & Regulatory Status Tones**:
  - Verified / Active: `#22C55E`
  - Pending Review / In-Progress: `#4F63E8`
  - Action Required / Task: `#F59E0B`
  - Flagged / Rejected: `#EF4444`

## Typography
Plus Jakarta Sans serves as the display and heading typeface, giving regulatory metrics and greeting panels a geometric, friendly, and structured presence. Inter drives the body, data tables, micro-labels, and metadata, providing maximum legibility at compact sizes.

- Use `headline-xl` exclusively inside hero greeting units and major dashboard section titles.
- Table headers utilize `label-md` styled with uppercase treatment, neutral `#6C728E` color, and loose tracking.
- Status labels and badge indicators employ `label-sm` with medium weights to ensure high legibility against tinted backgrounds.
- Dense data values, dates, and application identification codes must use tabular figures (`font-variant-numeric: tabular-nums`).

## Layout & Spacing
The layout follows a three-column hierarchical shell nested within a responsive fixed viewport:

- **Outer Wrapper**: In desktop viewports (min-width: 1440px), the application renders as a centralized canvas with `margin: 2.5rem` on `#D9DBFB` canvas, bounded by a maximum width of 1440px.
- **Internal Column Grid**:
  - **Left Rail (Navigation)**: Fixed width 220px to 240px, containing the brand lockup, vertical navigation links, and bottom session action.
  - **Center Stage (Main Content)**: Fluid (1fr), housing the top contextual bar, hero gradient banner, quick-action verification cards, and regulatory progress records.
  - **Right Rail (Intelligence & Schedule)**: Fixed width 300px to 320px, featuring the admin profile badge, mini calendar timeline, recent applicant queue, and ready-to-certify cards.
- **Breakpoints**:
  - Desktop (>1200px): Full three-column layout.
  - Tablet (768px – 1199px): Right rail collapses beneath the center stage or shifts into an off-canvas drawer; left rail collapses to an icon bar (72px).
  - Mobile (<768px): Single-column view with top app bar, horizontal pill navigation, and standard bottom tab navigation.

## Elevation & Depth
Depth is maintained through soft diffused lighting rather than harsh structural borders.

- **Outer Shell Elevation**: The main floating app frame uses an expansive, colored ambient shadow: `0 30px 60px rgba(79, 99, 232, 0.22)`.
- **Card Surface Elevation**: Standard white dashboard cards (`#FFFFFF`) feature subtle ambient diffusion: `0 4px 20px rgba(79, 99, 232, 0.05)`.
- **Raised Interactive Tiles**: Icon tiles and quick-filter category boxes receive `0 8px 24px rgba(79, 99, 232, 0.08)` on default, rising with `0 12px 28px rgba(79, 99, 232, 0.14)` on hover.
- **Active Table Highlight**: The active table row (`#4F63E8`) adopts a soft luminous glow: `0 8px 20px rgba(79, 99, 232, 0.35)`.
- **Zero Borders on Cards**: Panels do not rely on stroke borders; boundary definition is established via the contrast between `#FFFFFF` containers and the `#F4F5FE` surface base.

## Shapes
The design balances pronounced exterior organic rounds with refined, functional interior radii:

- **App Exterior Container**: Explicitly shaped with `40px` (`2.5rem`) border radius on all desktop viewport states.
- **Hero Notification Banner**: `14px` border radius with smooth inner gradient clipping.
- **Metric Tiles & Cards**: `12px` border radius for structured data and category action tiles.
- **Action Buttons & Inputs**:
  - Global Search Input & Buttons: `10px` to `12px` radius.
  - Pills & Status Tags: Fully rounded (`9999px`) for badges, dates, and circular icon wrappers.
  - Category Mini-Icon Containers: `10px` radius containing centered linear glyphs.

## Components

### Buttons & Interactive Controls
- **Primary CTA (`Add New`, `Review It`)**: Filled `#4F63E8` with white text, or solid white button with `#4F63E8` text when placed within the hero banner. Height: 38px, font: `13px`, weight: `600`, radius: `10px`. Transitions: `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Tertiary & Utility ("View All")**: Ghost style with `#4F63E8` text, `11px`, weight `600`, pill hover background `rgba(79, 99, 232, 0.08)`.
- **Compact Action Badges (`Start Training`, `Verify`)**: Filled `#4F63E8`, height: 26px, padding: `0 12px`, radius: `6px`, font size: `11px`.

### Navigation Rail
- **Item Styling**: 42px height, left padding 16px, icon-to-label gap 12px. Default state: `#6C728E` text and line icon.
- **Active State**: Inset pill or right-docked active block tinted in `rgba(79, 99, 232, 0.08)` with `#4F63E8` typography and icon, marked by a crisp primary vertical indicator bar along the right edge.

### Category Icon Tiles
- Rectangular white cards (`12px` radius, padding 16px) containing a centered 44x44px vibrant gradient icon container (`10px` radius).
- Features bold category title (`12px`, `#1E2238`), followed by count metadata (`11px`, `#9DA2BA`) in parentheses (e.g., `(10 Candidates)` or `(12 Institutes)`).

### Data Tables (Regulatory Tracking)
- **Header**: Flat `#FFFFFF` or `#F4F5FE`, borderless, lowercase or title-case subdued gray (`#6C728E`), height: 40px.
- **Standard Rows**: Height: 48px, subtle `#F0F2FA` bottom border or transparent spacing.
- **Active / Highlight Row**: Solid `#4F63E8` background fill with white text and status indicators, elevated with `0 8px 20px rgba(79,99,232,0.30)`.
- **Status Cells**: Colored dot indicator (6px circle) adjacent to status label. Colors: Green (`#22C55E`), Orange (`#F59E0B`), Blue (`#4F63E8`), Red (`#EF4444`).

### Quick Schedule Mini-Calendar
- Horizontal strip displaying day abbreviations (Mon, Tue, Wed) stacked over dates.
- Active date: Pill-shaped vertical container filled `#4F63E8` with white bold numerals. Inactive dates: Clean transparent backing with neutral text.

### Candidate & Applicant Queue Items
- Compact horizontal rows featuring a 36px circular avatar, name (`12px`, bold), role subtitle (`11px`, muted), and circular secondary contact actions (message and phone icon buttons filled with `#EEF0FC` and `#4F63E8` icons).