# Figma Integration & Design System Rules
## FINAL THEME LOCK — OBSIDIAN CYBER ARENA

**Project**: E-Sports Tournament Management System  
**Figma Design System File**: [Obsidian Cyber Arena on Figma](https://www.figma.com/design/jmf4fXyXZFGpMBov3TRtfI) (File Key: `jmf4fXyXZFGpMBov3TRtfI`)  
**FigJam Architecture Diagram**: [Obsidian Cyber Arena Architecture](https://www.figma.com/board/0DbJrRhklfIBzxJxg9LjyI?utm_source=other&utm_content=edit_in_figjam)  
**Theme**: Obsidian Cyber Arena (2026 Tier-1 Esports Platform)  

---

## 1. Locked Design System Architecture

### Token Specification (`client/src/styles/theme.css`)
| Token Category | Variable Name | Hex Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `--bg-primary` | `#09090F` | Deep obsidian canvas backdrop |
| **Secondary Background**| `--bg-secondary` | `#171526` | Primary cards, panels, and container background |
| **Sub-Surface** | `--bg-tertiary` | `#211E35` | Sub-panels, input fields, nested cards |
| **Elevated Surface** | `--bg-surface-elevated`| `#282442` | Modals, elevated dropdowns |
| **Primary Accent** | `--accent-primary` / `--neon-purple` | `#7657FF` | **Electric Violet** — Primary CTAs, active highlights |
| **Secondary Accent** | `--accent-secondary` / `--neon-cyan` | `#00D4FF` | **Neon Cyan** — Telemetry, game chips, schedule pills |
| **Primary Text** | `--text-primary` | `#F5F5FA` | High-legibility crisp white for titles, data, and buttons |
| **Secondary Text** | `--text-secondary` | `#9293A8` | Muted steel slate for labels, descriptions, and meta |
| **Trophy / Champion** | `--radiant-gold` | `#FFD700` | Prize pools, 1st place podium rows, champion badges |
| **Live / Critical** | `--danger` | `#FF3B3B` | Match losses, live heartbeat pulse, delete actions |
| **Warning** | `--warning` | `#F59E0B` | Pending approvals, status warnings |

### Typography Scale
- **Display Headings**: `'Space Grotesk'`, weights `700`, `800`, `900`
- **Body & Data Grid**: `'Inter'`, weights `400`, `500`, `600`, `700`

### Atmosphere & Restrained Lighting
- **Glassmorphism**: `rgba(23, 21, 38, 0.75)` with `backdrop-filter: blur(12px)`
- **Border Lighting**: `1px solid rgba(118, 87, 255, 0.18)`
- **Cyber Grid Mesh**: Radial glow gradients overlaid with repeating CSS grid lines pattern
- **Non-Excessive Philosophy**: Over-glow, blinding neon blur, and heavy transparency are avoided in favor of tactical sharpness, contrast, and high readability.

---

## 2. Figma MCP Translation Rules

When importing or interpreting components from the connected Figma workspace:

1. **Hierarchy Matching**:
   - Frames with layout mode `HORIZONTAL` map to `display: flex; flex-direction: row; align-items: center;`
   - Frames with layout mode `VERTICAL` map to `display: flex; flex-direction: column;`
   - Auto layout gaps map to CSS `gap: clamp(...)` or defined token spacings.
2. **Color Mapping Protocol**:
   - Never output hardcoded hex colors from Figma fills.
   - Map Electric Violet -> `var(--accent-primary)` (`#7657FF`)
   - Map Neon Cyan -> `var(--accent-secondary)` (`#00D4FF`)
   - Map Gold -> `var(--radiant-gold)` (`#FFD700`)
   - Map Dark surfaces -> `var(--bg-primary)` (`#09090F`) or `var(--bg-secondary)` (`#171526`)
   - Map Text -> `var(--text-primary)` (`#F5F5FA`) or `var(--text-secondary)` (`#9293A8`)
3. **Typography Mapping Protocol**:
   - Display/Heading styles -> `font-family: var(--font-heading);`
   - Body/Label styles -> `font-family: var(--font-body);`
4. **Button & Interactive Controls**:
   - Primary buttons map to `.btn.btn-primary` or `.tournament-action-btn-primary`
   - Ghost / Secondary buttons map to `.btn.btn-outline` or `.tournament-action-btn-secondary`
   - Destructive buttons map to `.btn.btn-danger` or `.tournament-action-btn-danger`

---

## 3. Verification Checkpoints

- **ESLint**: `npm --prefix client run lint` -> Must report 0 errors, 0 warnings.
- **Vite Build**: `npm --prefix client run build` -> Must succeed cleanly without bundle errors.
- **Backend Quarantine**: `git diff HEAD -- server api` -> Must return empty at all times.
- **Responsive Viewport Validation**: Verified on 375×812, 390×844, 768×1024, 1366×768, and 1920×1080.
