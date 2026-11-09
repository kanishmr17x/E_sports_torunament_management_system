# Project Configuration & Design System Rules

## Project Overview
**E-Sports Tournament Management System** — Tier-1 2026 Competitive Gaming Platform.
- **Frontend Stack**: React 18, Vite 7, React Router 6, Axios
- **Styling Architecture**: Vanilla CSS with comprehensive CSS custom property token system
- **Design Theme**: **FINAL THEME LOCK — OBSIDIAN CYBER ARENA**
  - **Primary Background**: `#09090F` (Deep Obsidian Canvas)
  - **Secondary Background**: `#171526` (Midnight Violet-Tinted Surface)
  - **Primary Accent**: `#7657FF` (Electric Violet)
  - **Secondary Accent**: `#00D4FF` (Neon Cyan)
  - **Primary Text**: `#F5F5FA` (High-Legibility Pure White)
  - **Secondary Text**: `#9293A8` (Muted Steel Slate)
- **Figma Design System**: [Obsidian Cyber Arena File](https://www.figma.com/design/jmf4fXyXZFGpMBov3TRtfI) (Key: `jmf4fXyXZFGpMBov3TRtfI`)
- **FigJam Architecture Diagram**: [Obsidian Cyber Arena Architecture](https://www.figma.com/board/0DbJrRhklfIBzxJxg9LjyI?utm_source=other&utm_content=edit_in_figjam)

---

# MCP Servers

## Figma MCP Server Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s).
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`.
3. Run `get_screenshot` for a visual reference of the node variant being implemented.
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation.
5. Translate the output into this project's conventions, CSS variables, and layout wrappers (`.page-root`, `.page-main`).
6. Validate against Figma for 1:1 look and behavior before marking complete.

### Implementation Rules

- Treat the Figma MCP output as a representation of design and behavior, not as final code style.
- **NEVER hardcode colors** — always map colors to CSS variables from `client/src/styles/theme.css`.
- Replace any Tailwind utility classes with standard CSS classes or CSS variables used in this project.
- Reuse existing components from `client/src/components/` instead of duplicating functionality.
- Wrap all page views in `<div className="page-root"><main className="page-main">...</main></div>` for consistent atmosphere and ambient lighting.
- Respect existing routing, authentication state (`useAuth()`), and API contracts in `client/src/api/apiRoutes.js`.
- Strive for 1:1 visual parity with the Figma design while maintaining responsive behavior across all viewports (375px mobile to 1920px 4K).
- **Subtle, non-excessive styling**: Avoid excessive neon, over-glow, and heavy blur. Keep surfaces sleek, tactical, and readable.

### Asset Handling

- The Figma MCP server provides an assets endpoint which can serve image and SVG assets.
- **IMPORTANT**: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly.
- **IMPORTANT**: DO NOT import/add external icon packages (`lucide-react`, `react-icons`, fontawesome) unless approved; use SVGs or project icon conventions.
- Store downloaded assets in `client/src/assets/` or `client/public/`.

---

# Codebase Component & Architecture Rules

## Component Organization
- **Global / Shared UI**: `client/src/components/`
  - `Navbar.jsx`: Global navigation bar with auth pill, role badges, mobile drawer
  - `Footer.jsx`: 4-column footer with live platform status dot and competitive integrity links
  - `ProtectedRoute.jsx`: Authentication & role guard wrapper
  - `ConfirmModal.jsx`: Modal confirmation dialog
- **Page Modules**: `client/src/pages/`
  - Feature-grouped directory structure (`Admin/`, `Auth/`, `Bracket/`, `Contact/`, `Dashboard/`, `Home/`, `Leaderboard/`, `Matches/`, `Payment/`, `Players/`, `Register/`, `Registrations/`, `Reports/`, `Results/`, `TeamManagement/`, `Teams/`, `TournamentRegistration/`, `Tournaments/`, `Users/`, `Unauthorized.jsx`)

## Styling & Design Tokens Rules
- **Core Tokens**: `client/src/styles/theme.css`
  - All CSS variables are defined in `:root`.
  - **Backgrounds**:
    - Canvas / Base: `var(--bg-primary)` (`#09090F`)
    - Surface 1 (Cards, panels): `var(--bg-secondary)` (`#171526`)
    - Surface 2 (Sub-panels, inputs): `var(--bg-tertiary)` (`#211E35`)
    - Elevated Surface: `var(--bg-surface-elevated)` (`#282442`)
  - **Accents**:
    - Primary Accent (Competitive / CTAs): `var(--accent-primary)` / `var(--neon-purple)` (`#7657FF`)
    - Secondary Accent (Telemetry / Highlights): `var(--accent-secondary)` / `var(--neon-cyan)` (`#00D4FF`)
    - Trophies / Prize Money: `var(--radiant-gold)` (`#FFD700`)
    - Live Status / Danger: `var(--danger)` (`#FF3B3B`)
    - Warning / Pending: `var(--warning)` (`#F59E0B`)
  - **Text Colors**:
    - Primary: `var(--text-primary)` (`#F5F5FA`)
    - Secondary: `var(--text-secondary)` (`#9293A8`)
    - Muted: `var(--text-muted)` (`#64657A`)
  - **Glassmorphism**:
    - Surface backdrop: `var(--glass-bg)` (`rgba(23, 21, 38, 0.75)`) with `backdrop-filter: blur(12px)`
    - Borders: `var(--glass-border)` (`rgba(118, 87, 255, 0.18)`)
    - Subtle borders: `var(--glass-border-subtle)` (`rgba(255, 255, 255, 0.07)`)
  - **Typography**:
    - Headings & Scores: `var(--font-heading)` (`'Space Grotesk', -apple-system, sans-serif`) with weights `700`, `800`, `900`
    - Body, Tables & Meta: `var(--font-body)` (`'Inter', -apple-system, sans-serif`) with weights `400`, `500`, `600`, `700`

## Critical Constraints
1. **BACKEND CODE IS FROZEN**: NEVER edit files in `server/`, `api/`, backend controllers, routes, models, middleware, or database configurations.
2. **NO MOCK DATA REPLACEMENTS**: All data fetching must continue using the real API layer in `client/src/api/apiRoutes.js` and `client/src/api/axiosConfig.js`.
3. **NO COMMITS OR PUSHES**: Never run `git commit` or `git push` without explicit user permission.
4. **LINTING & BUILD INTEGRITY**: Always verify `npm --prefix client run lint` (0 errors, 0 warnings) and `npm --prefix client run build` after modifications.
