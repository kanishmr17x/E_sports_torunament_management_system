# E-Sports Platform: Design System Specification

**Project:** E-Sports Tournament Management System  
**Design Identity:** Obsidian Cyber Arena (2026 Edition)  
**Status:** Living Design System  
**Figma Integration Note:** Remote Figma MCP integration is currently disconnected in this environment; this document serves as the single source of truth for all frontend design tokens, component variants, and layout rules implemented directly in React and CSS.

---

## 1. Design Principles

1. **Information Velocity**: Competitive gaming requires instant scanning of match fixtures, rosters, and scores without cognitive friction.
2. **Tactical Precision**: Crisp 1px boundaries, balanced padding scales, and strict alignment replace sloppy, arbitrary glow effects.
3. **Restrained Atmosphere**: Gradients and atmospheric glows are reserved for high-value focal points (hero headers, podiums, live matches, winning bracket paths) rather than painted indiscriminately across backgrounds.
4. **Data Density with Breathing Room**: Tables, brackets, and roster cards remain compact while preserving legible typography and touch-accessible tap targets (minimum 44x44px).
5. **Universal Multi-Game Agility**: Neutral dark canvas ensures that colorful game art (BGMI, Valorant, Free Fire, COD) shines without color clashes.

---

## 2. Design Tokens & CSS Variables

### 2.1 Color Tokens
```css
:root {
  /* Canvas & Surfaces */
  --bg-canvas: #07080e;
  --bg-surface-1: #0f121e;
  --bg-surface-2: #161b2e;
  --bg-surface-elevated: #1d233a;
  --bg-glass: rgba(16, 18, 30, 0.75);

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.16);
  --border-focus: rgba(0, 255, 163, 0.6);
  --border-glow: 0 0 15px rgba(0, 255, 163, 0.25);

  /* Brand Accents */
  --color-primary: #00ffa3;        /* Electric Cyan */
  --color-primary-hover: #00e08f;
  --color-primary-dim: rgba(0, 255, 163, 0.12);
  
  --color-secondary: #8a2be2;      /* Hyper Violet */
  --color-secondary-dim: rgba(138, 43, 226, 0.15);
  
  --color-accent: #00d4ff;         /* Cyber Azure */
  --color-accent-dim: rgba(0, 212, 255, 0.15);

  --color-champion: #ffd700;       /* Radiant Gold */
  --color-champion-dim: rgba(255, 215, 0, 0.15);

  /* Neutrals & Typography */
  --text-primary: #f3f4f6;         /* 96% white */
  --text-secondary: #9ca3af;       /* 65% neutral */
  --text-muted: #6b7280;           /* 45% grey */
  --text-inverse: #07080e;

  /* Semantic Feedback */
  --semantic-success: #10b981;
  --semantic-warning: #f59e0b;
  --semantic-danger: #ef4444;
  --semantic-live: #ff0055;
  --semantic-info: #00d4ff;

  /* Gradients */
  --gradient-brand: linear-gradient(135deg, #00ffa3 0%, #00d4ff 100%);
  --gradient-accent: linear-gradient(135deg, #8a2be2 0%, #00d4ff 100%);
  --gradient-gold: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  --gradient-surface: linear-gradient(180deg, rgba(22, 27, 46, 0.8) 0%, rgba(15, 18, 30, 0.95) 100%);
}
```

### 2.2 Typography Scale
- **Display Font**: Space Grotesk, Rajdhani, -apple-system, sans-serif
- **Interface Font**: Inter, Plus Jakarta Sans, -apple-system, sans-serif

```css
:root {
  --text-xs: clamp(0.7rem, 1.8vw, 0.75rem);   /* 12px */
  --text-sm: clamp(0.8rem, 2.0vw, 0.875rem);  /* 14px */
  --text-base: clamp(0.9rem, 2.2vw, 1rem);     /* 16px */
  --text-md: clamp(1.05rem, 2.5vw, 1.125rem);  /* 18px */
  --text-lg: clamp(1.2rem, 3.0vw, 1.35rem);   /* 21.6px */
  --text-xl: clamp(1.4rem, 3.5vw, 1.75rem);   /* 28px */
  --text-2xl: clamp(1.8rem, 4.5vw, 2.25rem);  /* 36px */
  --text-3xl: clamp(2.2rem, 5.5vw, 3.0rem);   /* 48px */
}
```

### 2.3 Spacing Scale
- `--space-1`: `0.25rem` (4px)
- `--space-2`: `0.5rem` (8px)
- `--space-3`: `0.75rem` (12px)
- `--space-4`: `1.0rem` (16px)
- `--space-5`: `1.25rem` (20px)
- `--space-6`: `1.5rem` (24px)
- `--space-8`: `2.0rem` (32px)
- `--space-10`: `2.5rem` (40px)
- `--space-12`: `3.0rem` (48px)
- `--space-16`: `4.0rem` (64px)

### 2.4 Border Radius System
- `--radius-sm`: `6px` (chips, tags, micro-badges)
- `--radius-md`: `10px` (buttons, inputs, dropdown items)
- `--radius-lg`: `14px` (inner cards, matchup nodes)
- `--radius-xl`: `18px` (primary cards, dashboard widgets)
- `--radius-2xl`: `24px` (hero containers, modal dialogs)
- `--radius-full`: `9999px` (avatar tokens, pill badges)

---

## 3. Core Component Library Specifications

### 3.1 Button Variants
1. **Primary (`.btn-primary`)**:
   - Background: `var(--color-primary)` (`#00FFA3`)
   - Text: `#07080E` (bold 700)
   - Border: None
   - Hover: Elevates by `-2px`, background turns `#00e08f`, subtle cyan glow shadow.
2. **Secondary (`.btn-secondary`)**:
   - Background: `var(--color-secondary-dim)`
   - Text: `var(--text-primary)`
   - Border: `1px solid rgba(138, 43, 226, 0.4)`
   - Hover: Border `#8A2BE2`, background `rgba(138, 43, 226, 0.25)`.
3. **Outline (`.btn-outline`)**:
   - Background: `rgba(255, 255, 255, 0.03)`
   - Text: `var(--text-primary)`
   - Border: `1px solid var(--border-subtle)`
   - Hover: Border `var(--color-primary)`, text `var(--color-primary)`, background `rgba(0, 255, 163, 0.06)`.
4. **Destructive (`.btn-danger`)**:
   - Background: `rgba(239, 68, 68, 0.12)`
   - Text: `var(--semantic-danger)`
   - Border: `1px solid rgba(239, 68, 68, 0.35)`
   - Hover: Background `rgba(239, 68, 68, 0.25)`, border `var(--semantic-danger)`.
5. **Pill / Filter Button (`.btn-pill`)**:
   - Padding: `0.4rem 0.9rem`, radius `9999px`, font-size `0.85rem`.

### 3.2 Form Controls
- **Input (`.form-input`), Select (`.form-select`), Textarea (`.form-textarea`)**:
  - Background: `var(--bg-surface-2)` (`#161B2E`)
  - Border: `1px solid var(--border-subtle)`
  - Text: `var(--text-primary)`
  - Radius: `var(--radius-md)`
  - Focus state: `outline: none`, `border-color: var(--color-primary)`, subtle box-shadow `0 0 12px rgba(0, 255, 163, 0.2)`.

### 3.3 Tournament Card (`.tournament-card`)
- Aspect: 16:9 header image or tactical game pattern.
- Badges: Game badge (top-left), Status badge (top-right).
- Metadata: Formats (`Single Elim`, `5v5 Squad`), Slots (`12/16 Teams`), Prize Pool (`$5,000 USD` in Radiant Gold).
- Call to Action: Full-width button with hover arrow feedback.

### 3.4 Tournament Bracket System
- Single/Double elimination bracket nodes:
  - Match card containing Team 1 and Team 2 rows.
  - Winner row highlighted with `var(--color-primary-dim)` and bold green text.
  - Visual score counter on the right (`2` - `1`).
  - Smooth horizontal scrolling with sticky round headers (`Round of 16`, `Quarterfinals`, `Semifinals`, `Grand Final`).
  - Connector curves showing progression paths.

### 3.5 Leaderboards & Standings
- Podium section for Top 3 with 1st place in Radiant Gold, 2nd in Cool Silver, 3rd in Cyber Bronze.
- Standings table with Rank, Team, Matches Played, Wins, Losses, Score Diff, and Total Points.
- Sticky table header with hover highlight on table rows.

### 3.6 Navigation & Drawer
- Fixed sticky desktop navbar with glowing active indicator line.
- User profile badge displaying initial avatar, username, and role badge (`ADMIN`, `ORGANIZER`, `PLAYER`).
- Full-screen or sliding mobile drawer with touch-friendly tap targets.

---

## 4. Accessibility & Contrast Compliance

- All primary text tokens exceed **4.5:1** contrast ratio against `#07080E` (WCAG AA).
- Primary buttons exceed **12:1** contrast ratio (`#07080E` on `#00FFA3`) (WCAG AAA).
- All interactive focusable elements have distinct focus rings.
- Motion: `@media (prefers-reduced-motion: reduce)` disables all continuous transforms, rotations, and gradient animations.

