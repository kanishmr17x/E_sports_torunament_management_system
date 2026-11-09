# E-SPORTS PLATFORM: DESIGN SYSTEM SPECIFICATION (SINGLE SOURCE OF TRUTH)
## THEME: OBSIDIAN CYBER ARENA (2026 EDITION)

**Project:** E-Sports Tournament Management System  
**Document Status:** Officially Locked Single Source of Truth  
**Figma Design System File:** [Obsidian Cyber Arena on Figma](https://www.figma.com/design/jmf4fXyXZFGpMBov3TRtfI) (File Key: `jmf4fXyXZFGpMBov3TRtfI`)  
**FigJam Architecture Board:** [Obsidian Cyber Arena Architecture](https://www.figma.com/board/0DbJrRhklfIBzxJxg9LjyI?utm_source=other&utm_content=edit_in_figjam)  
**Author:** Antigravity Principal Design Systems Architect & Senior Frontend Engineer  
**Date:** November 2026  

---

## 1. Locked Palette & Token Matrix

The visual identity of the entire platform is permanently locked to the **Obsidian Cyber Arena** theme. No alternative themes, uncontrolled color drifts, or uncalibrated tints may be introduced.

### 1.1 Core Platform Surfaces & Canvases

| Token Name | CSS Custom Property | Hex / RGBA Value | Usage & Layering Hierarchy |
| :--- | :--- | :--- | :--- |
| **Obsidian Black** | `--bg-primary` / `--bg-obsidian` | `#09090F` | Root platform canvas, lowest background layer |
| **Dark Graphite** | `--bg-secondary` / `--surface-1` | `#171526` | Primary cards, panels, table containers, sidebar backdrops |
| **Elevated Sub-surface** | `--bg-tertiary` / `--surface-2` | `#211E35` | Nested cards, form input fields, modal bodies, active table rows |
| **High Surface** | `--bg-surface-elevated` | `#282442` | Floating dropdown menus, tooltip surfaces, elevated popovers |
| **Glass Backdrop** | `--glass-bg` | `rgba(23, 21, 38, 0.78)` | Translucent modals, navigation bars, and sticky ribbons |
| **Glass Border Crisp** | `--glass-border` | `rgba(118, 87, 255, 0.22)`| Standard card boundaries with subtle violet luminescence |
| **Subtle Boundary** | `--glass-border-subtle` | `rgba(255, 255, 255, 0.08)`| Secondary dividers, input outlines, table cell borders |

### 1.2 Brand Accent Tokens

| Token Name | CSS Custom Property | Hex Value | Role & Interaction Semantics |
| :--- | :--- | :--- | :--- |
| **Electric Violet** | `--accent-primary` / `--neon-purple` | `#7657FF` | **Primary Brand Accent**: Primary button gradients, active tab indicators, bracket winners |
| **Neon Cyan** | `--accent-secondary` / `--neon-cyan` | `#00D4FF` | **Secondary Brand Accent**: Telemetry icons, schedule pills, input focus rings, ticker tags |
| **Soft White** | `--text-primary` | `#F5F5FA` | **Primary Typography**: Display titles, scores, button labels, high-emphasis text |
| **Muted Slate** | `--text-secondary` | `#9293A8` | **Secondary Typography**: Descriptions, table headers, subtitles, inactive states |
| **Dark Slate Muted** | `--text-muted` | `#6B6D82` | **Tertiary Typography**: Footnotes, timestamps, disabled placeholder text |

### 1.3 Semantic State Tokens

| Semantic Role | Token Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Trophy / Champion** | `--radiant-gold` | `#FFD700` | 1st Place Podium, grand prize pools, tournament champion badges |
| **Silver Medal** | `--medal-silver` | `#C0C0D0` | 2nd Place Podium, runner-up badges |
| **Bronze Medal** | `--medal-bronze` | `#CD7F32` | 3rd Place Podium, semi-finalist badges |
| **Critical / Live / Loss** | `--danger` / `--semantic-danger` | `#FF3B3B` | Live match pulse dots, match losses, destructive delete actions |
| **Pending / Warning** | `--warning` / `--semantic-warning` | `#F59E0B` | Pending approvals, disputing matches, countdown timers |
| **Success / Verified** | `--success` / `--semantic-success` | `#10B981` | Completed matches, paid registrations, verified athlete badges |

### 1.4 Gradients & Ambient Elevation

```css
:root {
  /* Carefully balanced violet-to-cyan primary gradient */
  --gradient-primary: linear-gradient(135deg, #7657FF 0%, #00D4FF 100%);
  --gradient-primary-hover: linear-gradient(135deg, #8769FF 0%, #1CE0FF 100%);
  --gradient-card: linear-gradient(180deg, rgba(23, 21, 38, 0.90) 0%, rgba(14, 13, 23, 0.98) 100%);
  --gradient-surface: linear-gradient(135deg, #171526 0%, #211E35 100%);
  --gradient-gold: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  
  /* Restrained Glow Shadows */
  --glow-violet: 0 4px 20px rgba(118, 87, 255, 0.30);
  --glow-cyan: 0 4px 18px rgba(0, 212, 255, 0.25);
  --glow-card-hover: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(118, 87, 255, 0.22);
}
```

---

## 2. Typography Specification

### 2.1 Font Families
- **Display & Numerical Typeface:** `'Space Grotesk', -apple-system, sans-serif`
  - High geometric precision, distinctive angularity, and competitive energy.
  - Applied to: Main headlines, tournament titles, match scores, prize numbers, podium ranks, and telemetry values.
- **Interface & Data Typeface:** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
  - Neutral, highly legible at small sizes (11px–14px), perfect tabular figure alignment.
  - Applied to: Navigation links, body copy, form inputs, table headers, descriptions, and buttons.

### 2.2 Scale & Weight Matrix

| Scale Step | Font Size | Line Height | Letter Spacing | Font Family | Default Weight | Target Element |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 2XL** | `clamp(2.5rem, 5vw, 3.75rem)` | `1.1` | `-0.03em` | Space Grotesk | 800 (Bold) | Hero headlines (`Home.jsx`) |
| **Display XL** | `clamp(2.0rem, 4vw, 2.75rem)` | `1.15` | `-0.02em` | Space Grotesk | 700 (Bold) | Page titles (`Tournaments`, `Bracket`) |
| **Heading LG** | `1.5rem` (24px) | `1.25` | `-0.015em` | Space Grotesk | 700 (Bold) | Section headers, card headlines |
| **Heading MD** | `1.25rem` (20px) | `1.3` | `-0.01em` | Space Grotesk | 600 (Semi) | Modal titles, sub-section headers |
| **Heading SM** | `1.0rem` (16px) | `1.4` | `0` | Space Grotesk | 600 (Semi) | StatCard labels, card titles |
| **Body Large** | `1.125rem` (18px) | `1.6` | `0` | Inter | 400 (Regular) | Hero lead text, article intros |
| **Body Base** | `0.9375rem` (15px) | `1.5` | `0` | Inter | 400 / 500 | Standard paragraphs, table data |
| **Body Small** | `0.8125rem` (13px) | `1.45` | `+0.01em` | Inter | 500 (Medium) | Card metadata, helper notes, badges |
| **Micro Caption**| `0.6875rem` (11px) | `1.35` | `+0.06em` | Space Grotesk | 700 (Uppercase)| Kicker pills, status tags, table headers |

---

## 3. Spatial System, Radii & Grid Layouts

### 3.1 Spacing Scale
- `4px` (`--space-xs`): Micro padding, badge gaps.
- `8px` (`--space-sm`): Input padding internal, button icon gap.
- `12px` (`--space-md`): Small container padding, list item gaps.
- `16px` (`--space-lg`): Standard card padding, grid gutter small.
- `24px` (`--space-xl`): Section gutters, large card padding, modal padding.
- `32px` (`--space-2xl`): Page section spacing, hero internal padding.
- `48px` (`--space-3xl`): Major page section breaks.
- `64px` (`--space-4xl`): Major layout margins.

### 3.2 Corner Radii
- `4px` (`--radius-sm`): Form inputs, table cells, micro badges.
- `8px` (`--radius-md`): Buttons, status chips, dropdown items.
- `12px` (`--radius-lg`): Cards, tournament items, match nodes.
- `16px` (`--radius-xl`): Hero cards, modals, primary feature panels.
- `9999px` (`--radius-full`): Circular avatars, rounded filter pills.

### 3.3 Core Layout Grids
- **Command Deck Grid (Dashboard):** Asymmetric 8/4 grid (`1fr 340px`) adapting to `1fr` on tablet/mobile.
- **Dossier Grid (Tournament & Team Details):** Asymmetric `2fr 1fr` on desktop, stacking on `< 1024px`.
- **Authentication Split Screen:** Asymmetric `1.15fr 1fr` on desktop, collapsing to single form column on `< 900px`.
- **Card Grids:** Fluid `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))` ensuring no horizontal overflow.

---

## 4. Component Specification & State Matrix

Below is the design and interaction specification for all **18 core component types** implemented across the platform.

---

### Component 1: `StatCard` (`StatCard.jsx`)
- **Purpose:** Displays live platform, user, and tournament telemetry with micro-kickers, formatted values, trend indicators, and progress tracks.
- **Props:** `title`, `value`, `icon`, `trend`, `trendLabel`, `variant` (`default`, `violet`, `cyan`, `gold`), `progress`.
- **Anatomy:**
  1. Micro-kicker label (Space Grotesk uppercase, 11px, `var(--text-secondary)`).
  2. Primary metric counter (Space Grotesk 700, 28px, `var(--text-primary)`).
  3. Icon container (36x36px, `var(--bg-tertiary)`, themed SVG icon).
  4. Trend pill (Green positive, red negative, or neutral).
  5. Gradient progress track (Optional 4px height bar).
- **State Matrix:**
  - *Default:* Dark Graphite background, 1px subtle glass border, `transform: translateY(0)`.
  - *Hover:* `transform: translateY(-3px)`, border shifts to accent color, subtle glow shadow.
  - *Focus:* Keyboard focus ring around card if interactive.
  - *Mobile (< 768px):* Reduced padding (14px), font size 22px, progress track maintained.

---

### Component 2: `TournamentCard` (`TournamentCard.jsx`)
- **Purpose:** Multi-variant tournament discovery card representing competitive events.
- **Variants:**
  - `featured`: Large hero spotlight with full-width game banner, prize callout, and instant join CTA.
  - `horizontal`: Wide list row for compact dashboard or tournament list views.
  - `compact` (Default): Standard grid card for the tournament directory.
- **Anatomy:**
  - Game category chip (`VALORANT`, `BGMI`, etc.) with color-coded border.
  - Status indicator (Live pulsing dot or scheduled date).
  - Tournament title with hover transition.
  - Radiant gold prize tag (`$X,XXX`).
  - Slot capacity progress bar (`14/16 Squads Filled`).
  - Action button group ("Details", "Bracket").
- **State Matrix:**
  - *Default:* Glass background, 1px border `rgba(118, 87, 255, 0.16)`.
  - *Hover:* Card rises by 4px, border lights up to Electric Violet, subtle violet box-shadow.
  - *Loading / Skeleton:* Shimmering gradient animation placeholder over slot bar and title.
  - *Disabled (Completed Tournament):* 60% opacity, "Concluded" badge, bracket link remains active.

---

### Component 3: `MatchCard` (`MatchCard.jsx`)
- **Purpose:** Versus matchup component displaying competing squads, scores, schedule, and winner highlights.
- **Modes:** Full Versus Mode (Card grid) & Ticker Mode (Horizontal ticker ribbon).
- **Anatomy:**
  - Team A avatar initial + name + seed.
  - Versus badge or scheduled time pill.
  - Team B avatar initial + name + seed.
  - Score box (`13 : 9`) with winning team highlighted in Neon Cyan/Gold.
  - Winner highlight crown icon.
- **State Matrix:**
  - *Default:* Surface-1 background with orthogonal layout.
  - *Live State:* Pulsing Neon Rose dot with "LIVE" chip.
  - *Hover:* 2px elevation, border glow.

---

### Component 4: `TeamCard` (`TeamCard.jsx`)
- **Purpose:** Squad directory dossier card.
- **Anatomy:**
  - Team avatar container with gradient border ring.
  - Team name + tag (`[FNC]`).
  - Game badge (`BGMI`, `Valorant`).
  - 3-column telemetry: Roster Size, W/L record (`14-3`), Win Ratio (`82%`).
  - Visual win ratio progress bar (`var(--gradient-primary)`).
- **State Matrix:**
  - *Default:* Clean Dark Graphite surface.
  - *Hover:* Card elevation, view team details trigger.

---

### Component 5: `PlayerCard` (`PlayerCard.jsx`)
- **Purpose:** Verified competitive athlete card.
- **Anatomy:**
  - Avatar ring with online/offline status dot.
  - In-game name (IGN) in Space Grotesk.
  - Tactical role chip (`Entry Fragger`, `Sniper`, `IGL`, `Support`).
  - Contracted team callout or "Free Agent" tag.
- **State Matrix:**
  - *Default:* Elevated sub-surface.
  - *Hover:* Border illumination in Neon Cyan.

---

### Component 6: `AdminNav` (`AdminNav.jsx`)
- **Purpose:** Universal administrative ribbon linking all 8 backend management modules.
- **Anatomy:**
  - Live system status pulse ("Operational - All Services Live").
  - 8-tab module switch: Overview, Tournaments, Teams, Matches, Users, Registrations, Payments, Reports.
  - Active module tab highlight with Electric Violet under-glow.
  - Security indicator badge.
- **State Matrix:**
  - *Active Tab:* Gradient background, high-contrast text, 2px border accent.
  - *Hover Tab:* Background tint `rgba(118, 87, 255, 0.12)`.
  - *Mobile (< 1024px):* Horizontal scrollable ribbon with drag/swipe support.

---

### Component 7: `Breadcrumbs` (`Breadcrumbs.jsx`)
- **Purpose:** Secondary tactical navigation hierarchy showing user location.
- **Anatomy:** Home icon -> Parent Route -> Current Page Name.
- **State Matrix:**
  - Interactive ancestors turn Neon Cyan on hover.
  - Current node is high-contrast white and non-clickable.

---

### Component 8: `Navbar` (`Navbar.jsx`)
- **Purpose:** Primary application navigation bar.
- **Anatomy:**
  - Platform brand logo with Electric Violet icon.
  - Navigation links: Tournaments, Matches, Results, Leaderboard, Teams, Players, Contact.
  - User authentication chip: Avatar circle, IGN, role badge (`ADMIN`, `PLAYER`), Logout CTA.
  - Mobile hamburger toggle button.
- **State Matrix:**
  - *Scrolled:* Adds `backdrop-filter: blur(16px)` and darker glass opacity (`rgba(9, 9, 15, 0.92)`).
  - *Active Link:* Neon Cyan text color with subtle bottom glow indicator.

---

### Component 9: `Footer` (`Footer.jsx`)
- **Purpose:** 4-column esports footer with status telemetry and platform links.
- **Anatomy:**
  - Col 1: Brand mission & social channel icons.
  - Col 2: Arena links (Brackets, Schedules, Tournaments).
  - Col 3: Competitive Integrity (Anti-cheat, Rulebook, Disputes).
  - Col 4: Platform operational heartbeat pill.

---

### Component 10: `ConfirmModal` (`ConfirmModal.jsx`)
- **Purpose:** Destructive action confirmation dialog preventing accidental deletions.
- **Anatomy:**
  - Backdrop blur overlay (`rgba(0,0,0,0.75)`).
  - Modal container with crimson alert icon.
  - Clear confirmation prompt text.
  - "Cancel" button (`btn-secondary`) and "Confirm Delete" button (`btn-danger`).
- **State Matrix:**
  - Focus trapped within modal; Escape key cancels.

---

### Component 11: `TournamentFilterBar`
- **Purpose:** Multi-criteria filter strip on tournament list.
- **Anatomy:**
  - Search input with magnifying glass icon.
  - Game category pills (`All`, `Valorant`, `BGMI`, `Free Fire`, `COD`, `PUBG`).
  - Status pills (`All`, `Upcoming`, `Open`, `Ongoing`, `Completed`).
- **State Matrix:**
  - Active pill: Electric Violet background with Neon Cyan border.
  - Inactive pill: Semi-transparent sub-surface with hover border.

---

### Component 12: Primary & Secondary Buttons (`.btn-primary`, `.btn-secondary`, `.btn-danger`)
- **Primary Button (`.btn-primary`):**
  - Background: `var(--gradient-primary)` (`#7657FF` -> `#00D4FF`).
  - Text: `#FFFFFF`, Space Grotesk 700.
  - *Hover:* `-2px translateY`, `box-shadow: var(--glow-violet)`.
  - *Active:* `+1px translateY`, reduced shadow.
  - *Disabled:* 40% opacity, `cursor: not-allowed`, transforms disabled.
- **Secondary / Outline Button (`.btn-secondary`, `.btn-outline`):**
  - Background: `transparent`, Border: `1px solid rgba(118, 87, 255, 0.35)`.
  - *Hover:* `border-color: #7657FF`, `background: rgba(118, 87, 255, 0.12)`.
- **Destructive Button (`.btn-danger`):**
  - Background: `rgba(255, 59, 59, 0.15)`, Border: `1px solid #FF3B3B`, Text: `#FF3B3B`.
  - *Hover:* Solid Crimson background `#FF3B3B`, Text `#FFFFFF`.

---

### Component 13: Input Fields & Selectors (`.cyber-input`, `.form-control`)
- **Anatomy:** 44px minimum touch height, Elevated Sub-surface background (`#211E35`), 1px subtle border (`rgba(255, 255, 255, 0.1)`).
- **State Matrix:**
  - *Default:* `#211E35`, placeholder text `var(--text-muted)`.
  - *Hover:* Border tint `rgba(0, 212, 255, 0.3)`.
  - *Focus:* `outline: none`, `border-color: #00D4FF`, `box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.18)`.
  - *Error:* `border-color: #FF3B3B`, red error caption below.

---

### Component 14: Badge Chips (`.badge-game`, `.badge-status`)
- **Anatomy:** Compact rounded chip with micro-typography.
- **Variants:**
  - Game badges: Color-coded left border (Valorant Red, BGMI Orange, Free Fire Yellow).
  - Status badges: Live (pulsing red dot), Upcoming (Cyan outline), Completed (Muted gray).

---

### Component 15: Tab Navigation (`.nav-tabs`, `.filter-tabs`)
- **Anatomy:** Horizontal tab row with active indicator bar.
- **State Matrix:**
  - Active tab text `#F5F5FA` with 2px bottom border in Neon Cyan.
  - Inactive tab text `var(--text-secondary)` transitioning to white on hover.

---

### Component 16: Data Tables (`.cyber-table`, `.admin-table`)
- **Anatomy:**
  - Table header: Space Grotesk 700 uppercase, 11px, `var(--text-secondary)`, sticky on scroll.
  - Rows: Alternating subtle background, 1px bottom border.
  - *Row Hover:* Background illuminates to `#282442`.
  - Mobile: Wraps horizontally with clean scroll shadows.

---

### Component 17: 3D Visual Podium (`.podium-container`)
- **Anatomy:**
  - 1st Place (Center): Elevated highest, Radiant Gold trophy badge, gold border glow.
  - 2nd Place (Left): Silver metallic tier, silver medal badge.
  - 3rd Place (Right): Bronze metallic tier, bronze medal badge.
- **State Matrix:**
  - Subtle hover zoom on podium avatars; responsive reordering on mobile screens.

---

### Component 18: Bracket Nodes (`.bracket-match-node`)
- **Anatomy:**
  - Rounded match card with 2 team rows.
  - Seed indicator, team name, and score counter.
  - Winning row highlighted in green/gold with winner crown.
  - Orthogonal SVG connector lines joining next-round matches.

---

## 5. Responsive Breakpoint Standards

| Breakpoint Name | Media Query | Layout Behavior | Target Devices |
| :--- | :--- | :--- | :--- |
| **Mobile XS** | `< 480px` | Single column, stacked buttons, full-width modals, bottom drawer navigation | iPhone SE, small smartphones |
| **Mobile Standard** | `480px - 767px`| Single column cards, horizontal scroll ribbons, compact tables | Modern smartphones (iPhone 14/15, Galaxy S) |
| **Tablet Portrait** | `768px - 1023px`| 2-column card grids, condensed dashboard, expandable sidebar | iPad, Android tablets |
| **Desktop Base** | `1024px - 1439px`| Full 8/4 dashboard grid, 3-column card grid, 2-column split screens | Standard laptops, 1366x768 screens |
| **Desktop Ultra** | `≥ 1440px` | Max-width container (1400px), 4-column card grid, full broadcast bracket | FHD, QHD, and 4K displays |

---

## 6. Accessibility & Motion Guidelines

1. **Contrast Compliance:** All text-to-background combinations meet or exceed WCAG 2.1 AA (4.5:1) and AAA (7.0:1) standards.
2. **Focus Indicators:** Interactive components support high-contrast keyboard focus outlines (`#00D4FF`, 2px offset).
3. **Motion Sensitivity (`prefers-reduced-motion`):**
   - Disables live pulse animations, background mesh drifts, and transform transitions.
   - Preserves instant state changes without motion sickness triggers.
