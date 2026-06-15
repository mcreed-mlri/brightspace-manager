# Handoff: Brightspace Manager — "Cool / Bold" Visual Direction

## Overview
The **Brightspace Manager** (internal name: "BM", product family: **LACE** / Mass. Legal Aid) is an internal admin + authoring tool that sits alongside the **LACE Learning Hub**. It lets staff (a) build legal-aid courses without touching Brightspace wrapper code ("Course Studio"), and (b) operate/monitor the Brightspace ↔ Supabase course pipeline (the "Operator" console).

This handoff documents a **cool, high-contrast, confident** visual direction for the entire Manager — energetic and modern (think a sharp internal tool, not a calm editorial site), with full **light + dark** theming (dark is the default). It is deliberately the same family as the existing LACE Learning Hub and course reader (cool surfaces, electric-blue accent, multicolor category system, monospace labels) but with the volume turned up.

## About the Design Files
The files in `prototypes/` are **design references created in HTML** — prototypes that demonstrate the intended look, layout, and behavior. **They are not production code to copy verbatim.** They are authored in a small custom templating runtime (`*.dc.html` + `support.js`); treat them as visual/behavioral specs.

Your task: **recreate these designs in the target codebase.** The real app is **Next.js (App Router) + React + TypeScript + Tailwind CSS** (see "Target codebase" below). Implement the direction using that stack's existing patterns and component conventions — not by porting the HTML. Where the existing app already has a screen (it has all 10), you are **re-skinning** it to this direction, not rebuilding its data layer.

## Fidelity
**High-fidelity for the two built screens** (Dashboard, Course Studio builder) — exact colors, type, spacing, and interactions are specified and should be matched closely.

**Medium-fidelity for the other eight screens** — their **structure and content are final** (captured in the warm reference prototype, which is the same app pre-reskin), but their cool-direction styling should be **derived by applying the design tokens + conventions in this README**. They were not each individually mocked in the new style; extrapolate consistently from the two hi-fi screens.

---

## Target codebase
The live app is in the attached `Brightspace-Manager/` folder. Key facts:
- **Next.js App Router**, routes under `app/` (`app/dashboard/page.tsx`, `app/courses/page.tsx`, etc.).
- **Tailwind CSS** with semantic tokens already wired in `tailwind.config.ts` + `app/globals.css` (e.g. `bg-paper`, `text-ink`, `border-line`, `bg-brand-*`, `bg-status-*`). **This direction replaces those token *values*** — keep the token *names/architecture*, swap the underlying colors/fonts to the scales below. That gives you the reskin for free across every screen.
- Shell: `components/app-shell.tsx` (flex row: sidebar + scrolling content; the builder route hides the sidebar and owns the viewport) and `components/sidebar.tsx` (two-mode nav: Author / Operator).
- Shared UI: `components/page-header.tsx`, `components/metric-card.tsx`, `components/status-badge.tsx`, `components/empty-state.tsx`, `components/drawer.tsx`.
- Data is read-only "mock mode" until credentials exist; **the only write path is the Sync "Apply changes" action.** Preserve that constraint — it's a governance requirement (archive, never delete; preview + confirm + log).

---

## Design Tokens

### Color — Dark theme (DEFAULT)
| Token | Hex / value | Use |
|---|---|---|
| `--bg` | `#0b0d12` | App background (content area) |
| `--surface` | `#13161d` | Cards, sidebar, top bar, drawer |
| `--surface-2` | `#1b1f28` | Inset fields, search, segmented control track |
| `--ink` | `#f3f5f9` | Primary text |
| `--ink-muted` | `#9aa3b2` | Secondary text / descriptions |
| `--ink-soft` | `#5e6675` | Meta, mono labels, placeholders |
| `--line` | `#242a34` | Borders, hairline dividers |
| `--line-soft` | `#1c212a` | List-row dividers |
| `--line-strong` | `#333b48` | Dashed borders, unselected radio rings |
| `--accent` | `#5b7dff` | Primary accent (electric indigo-blue) |
| `--accent-ink` | `#94aaff` | Accent text on tint |
| `--accent-tint` | `rgba(91,125,255,.15)` | Accent backgrounds, active nav |
| `--accent-glow` | `rgba(91,125,255,.40)` | Glow shadow on primary buttons |
| `--ok` | `#2fd397` | Success / connected |
| `--ok-glow` | `rgba(47,211,151,.22)` | Status-dot halo |
| `--amber` / `--amber-ink` / `--amber-tint` | `#f0a93a` / `#f0b860` / `rgba(240,169,58,.14)` | Warn / mock-data / review |
| `--danger` / `--danger-tint` | `#ff6257` / `rgba(255,98,87,.14)` | Error / broken |

### Color — Light theme
| Token | Hex / value |
|---|---|
| `--bg` | `#f4f6fa` |
| `--surface` | `#ffffff` |
| `--surface-2` | `#eef1f7` |
| `--ink` | `#0d1117` |
| `--ink-muted` | `#48505e` |
| `--ink-soft` | `#8b94a3` |
| `--line` | `#e4e8ef` |
| `--line-soft` | `#eef1f6` |
| `--line-strong` | `#cdd5e1` |
| `--accent` | `#2f5bff` |
| `--accent-ink` | `#1e44e0` |
| `--accent-tint` | `#e9eeff` |
| `--accent-glow` | `rgba(47,91,255,.26)` |
| `--ok` / `--ok-glow` | `#10b981` / `rgba(16,185,129,.18)` |
| `--amber` / `--amber-ink` / `--amber-tint` | `#e0941f` / `#9a6510` / `#fdf2dd` |
| `--danger` / `--danger-tint` | `#e0463a` / `#fdeae8` |

### Color — Category palette (theme-independent)
Used for category dots, accent bars on list rows, and per-course/topic-family accents. This is the "kept alive" multicolor system that prevents the cool palette from feeling sleepy.
`blue #3b82f6 · violet #8b5cf6 · pink #ec4899 · amber #f59e0b · green #10b981 · teal #14b8a6`

### Typography
| Role | Family | Weight | Tracking | Notes |
|---|---|---|---|---|
| Display (H1, big numbers, lesson/section titles, drawer title) | **Space Grotesk** | 600–700 | `-0.02em` to `-0.03em` | The "voice." Big and confident. |
| Body / UI | **Inter** | 400–700 | normal | Buttons, paragraphs, card text. |
| Labels / meta / code / IDs | **JetBrains Mono** | 400–600 | `0.04em`–`0.14em`, UPPERCASE for eyebrows | The structural signature — used liberally. |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap
```

Display scale seen in mocks: page H1 **46px/1.0**, lesson title **38px/1.08**, big metric numbers **44px/1.0**, section heading **18px**, drawer title **19px**.

### Radius, spacing, shadow
- Radius: pills/badges `6–8px`, buttons/inputs `8–10px`, cards/panels `13–16px`, drawer fields `10px`.
- Control heights: small button `30–36px`, primary button `38px`, input/select `44px`.
- Content max-width: standard pages `1000px`; builder canvas `680px`; details drawer `452px`.
- Sidebar width `236–240px`; top bar height `60px`.
- Shadows: primary button `0 3px 12–14px var(--accent-glow)`; status dot halo `0 0 0 3px <glow>`; drawer `-26px 0 70px rgba(0,0,0,.4)`.

---

## System conventions (apply these everywhere)
1. **Eyebrow + bold display**: every section/page leads with an UPPERCASE JetBrains-Mono eyebrow in `--accent` (or `--ink-soft`), then a Space Grotesk heading. Headings have *voice* (e.g. "Everything's running.", not "Dashboard").
2. **Monospace meta**: counts, IDs, timestamps, breadcrumbs, env var names, table header labels — all JetBrains Mono.
3. **Status badges**: mono, ~10px, UPPERCASE, `letter-spacing .05em`, tinted bg + colored text. Tones: `ok` (green), `warn` (amber), `error` (danger), `info`/neutral (accent). Shape: `padding 4px 9px; border-radius 6px`.
4. **Status dots** get a soft halo (`box-shadow: 0 0 0 3px <color-glow>`) — small touch that adds energy.
5. **Metric "band"**: group KPIs into one fused grid — `display:grid; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:16px; overflow:hidden`, each cell `background:var(--surface)`. Numbers oversized (Space Grotesk 44px); the lead metric's label/number tinted `--accent`. Reads like an instrument panel.
6. **Multicolor category accents**: list rows that represent items get a 3px-wide colored left bar (`--cat-*`); sidebar practice areas / nav items get a small 6px rounded-square dot.
7. **Content vs. configuration**: per-item *content* is edited in the main canvas; *configuration/settings* (course-level, connection-level) opens as a **right slide-over drawer** over the current view — never a separate full page, never inline in the canvas.
8. **`S1 / S2 / S3` section markers**: in the builder and the learner reader, each content block is introduced by a row of `[accent mono "S1"] — [hairline] — [ink-soft UPPERCASE mono label, right-aligned]`. This visual is shared with the learner-facing course reader, tying authoring to output.
9. **Dual theme**: dark default. Theme toggle (sun/moon icon button) lives in the top bar. Persist choice in `localStorage`.

---

## App shell

### Sidebar (`components/sidebar.tsx`) — 236–240px, `bg:--surface`, right border `--line`
- **Brand row**: black (`--ink`) rounded-8px square holding a white scales-of-justice glyph; "LACE" in Space Grotesk 17/700; right-aligned mono tag `OPS` in `--accent` on `--accent-tint`.
- **Search field**: `--surface-2`, `--line` border, radius 9px, height 36px — magnifier icon, "Search" placeholder (`--ink-soft`), `⌘K` mono kbd hint.
- **Mode toggle** (segmented, in `--surface-2` track, radius 9px): `Author` | `Operator`. Active segment = `--accent` fill, white text, accent glow. Switching mode swaps the nav set and routes to Home (author) / Dashboard (operator). Persist in `localStorage` (`bm-mode`).
- **Nav** (grouped; group eyebrows in mono uppercase `--ink-soft`):
  - **Author**: `Home`, `Course Studio`, `How everyone's doing`.
  - **Operator**: `Dashboard` · group **MONITOR** → `Course Inventory` (count 9), `Sync Diagnostics` (count 2), `Integrity Checker`, `Learner Progress` · group **UNDER THE HOOD** → `Manage Files`, `Supabase Data`, `Settings`.
  - Nav item: row with a 6px rounded-square category dot, label (Inter 13px), optional mono count right-aligned. Active = `--accent-tint` bg, `--ink` text, weight 600.
- **User chip** (bottom, top border): `--accent` 30px rounded-8px avatar "AL"; name "A. Liang" (12/600); mono sub "MLRI · admin".

### Top bar — 60px, `bg:--surface`, bottom border `--line`
- Left: mono breadcrumb (`operator / dashboard`), then a **MOCK DATA** pill (amber dot + mono text on `--amber-tint`) when in mock mode.
- Right: **theme toggle** (36px icon button, `--line` border) + a **primary action** button (`--accent`, white text, glow) whose label is page-specific (e.g. "Run sync check" on Dashboard, "Share with learners" in the builder).

---

## Screens / Views

> The two screens marked **[HI-FI]** are fully mocked in `prototypes/Manager Cool — *.dc.html`. The rest are documented from the warm reference (`prototypes/Brightspace Manager (warm …).dc.html`) — identical structure/content, to be styled with the tokens above.

### 1. Home — Author landing
- **Purpose**: plain-English landing for attorneys; everything read-safe.
- **Layout**: single column, max-width ~820px.
- **Components**: mono date line; Space Grotesk greeting H1 with voice ("Good afternoon, counsel."); muted intro; **Course Studio promo panel** (`--accent-tint` bg, accent eyebrow, bold heading "Build a course without touching any code.", primary "+ Start a new course" + ghost "Continue last draft"); **Your courses** list (card with rows: doc icon, title, mono meta "6 lessons · 38 min · edited 5 days ago", `draft` badge, chevron); **Who could use a nudge** placeholder card.

### 2. Course Studio — landing
- **Purpose**: index of course drafts + wrapper-template status.
- **Components**: header + primary "+ New course"; **Your courses** draft list; **Wrapper template** card — `ok` badge "found", mono path, file chips (`index.html 4.2 KB`, `wrapper.css`, `wrapper.js`, `manifest.json`), explainer.

### 3. Course Studio — Builder **[HI-FI]** (`Manager Cool — Course Studio.dc.html`)
Full-screen editor; **sidebar hidden** (route `course-studio/[draftId]`).
- **Top bar**: scales logo; editable course-title input (Space Grotesk 17/600, focus → `--surface-2`); mono meta "2 parts · 4 lessons"; `DRAFT` accent badge; **Details** button (gear icon — opens the Course Details drawer, see §12); right: "Preview as learner" ghost button (eye icon), theme toggle, **Share with learners** primary (accent + glow, upload-arrow icon).
- **Left rail** (280px, `--surface`): mono accent eyebrow "Your course"; per **module**: mono uppercase module title, then **lesson rows** — 24px rounded number chip (active = `--accent` fill/white; else `--surface-2`), lesson title (active `--ink`/700, else `--ink-muted`/600), mono meta "Concept · 2 min", and a row of progress dots (filled = `--accent`, empty = `--line-strong`). Active row bg `--accent-tint`. Footer: "New part of the course" dashed button; auto-save row with green halo dot "Saved automatically".
- **Canvas** (max-width 680px on `--bg`): mono accent eyebrow "Concept · Topic 1 of 4"; **lesson title** input (Space Grotesk 38/700); **hook** input (16.5px `--ink-muted`); a controls strip bordered top+bottom with **Type** pills (Concept/Practice/Reflection — active = accent border + tint) and a **Length** stepper (− / "2 min" / +).
- **Content blocks** (gap 22px), each prefaced by the **S-marker row** (`S1` accent mono · hairline · right mono label like "THE SCENARIO"):
  - **Text block**: `--surface` card, radius 14, textarea (15px/1.65).
  - **Rule block**: stack of rows, each `--surface` card with a fixed-width accent mono tag ("NOTICE"/"SUMMONS"/"COURT") + bold title + muted body.
  - **Try-it block**: `--surface` card radius 16; Space Grotesk 18/600 question textarea; mono hint "TAP THE CIRCLE BY THE RIGHT ANSWER"; option rows (radio + text); the **correct** option = accent border, `--accent-tint` bg, filled accent radio with white check.
- **Add block**: full-width dashed button "Add something to this lesson" (hover → accent border + tint).

### 4. How everyone's doing / Learner Progress — placeholder
- Centered empty-state card: accent-tint rounded icon tile, Space Grotesk title "Learner progress, coming soon", muted explanation.

### 5. Dashboard — Operator **[HI-FI]** (`Manager Cool — Dashboard.dc.html`)
- **Hero**: mono accent eyebrow "OPERATIONS CONSOLE"; Space Grotesk 46/700 voice headline ("Everything's running."); muted summary line. To the right, **connection chips** (Brightspace / Supabase / Sync) — `--surface` cards with a haloed status dot, name, mono "2m ago".
- **Metric band** (fused grid, see convention #5): 4 cells — **Active offerings** (lead, accent label, "9"), **Updated** ("4"), **Sync drift** ("2", `--amber-ink`, with a `REVIEW` warn badge), **Warnings** ("2", `--danger`). Each cell: mono label, big number, muted sub.
- **Needs attention**: section heading + mono `3 OPEN` danger pill + "view all →"; list card where each row = 3px category color bar + status badge (`STALE`/`METADATA`/`BROKEN`) + name + muted message + mono `#orgUnitId →`.

### 6. Course Inventory
- Search field (full width) + filter chips (`All` active / `Active` / `Housing`).
- **Table** card: mono uppercase header row (`Course · Code · Program · Status · Synced`) on `--surface-2`; body rows with title (Inter 13.5/600), mono code, program, status badge, mono relative time. Sample rows incl. "Eviction Defense: The First 48 Hours / MA-HOU-EVIC-101 / Housing / synced / 12m ago", a `stale` row, a `never`/neutral "Blank-Course" row.

### 7. Sync Diagnostics
- 3 stat cards: **In Brightspace 9**, **In Supabase 7**, **Drift detected 2** (amber).
- **Drift & mismatches** list: rows with `BROKEN`(error)/`REVIEW`(warn) badge + name + message + mono org id.
- **Write panel** (`--surface-2` card): lock icon, "Apply changes to Supabase", explainer ("only write path … previews, confirms, logs"), button **"Locked in mock mode"** (disabled). Keep this the single write affordance.

### 8. Integrity Checker — coming soon
- Panel: accent-tint shield icon tile, Space Grotesk "A later milestone", sub; mono "PLANNED CHECKS" + bulleted list (ghost topics, orphaned files, broken links/images/wrapper params, Supabase pointing at archived/missing content); governance note on `--ok`-tinted strip: "archive, do not delete — every action previews first, requires confirmation, and is logged."

### 9. Manage Files — read-only
- Course selector (dropdown look) + mono "org unit 6703".
- **File tree** card: indented rows — folders (accent folder icon, Inter 700) and files (mono name + mono size), e.g. `content/` → `index.html 4.2 KB`, `module-1.html 11.8 KB`; `assets/` → `wrapper.css`, `wrapper.js`; `images/` → `hero.png 142 KB`, `timeline.svg 18 KB`. Footnote about editing arriving with Integrity milestone.

### 10. Supabase Data — read-only inspector
- Table tabs (pill row): `learning_items` (active) / `jurisdictions` / `programs` / `tags`.
- Description line (with inline mono `provider_course_id`).
- **Data table** card: mono header (`title · item_type · course_id · practice_area · synced_at`); rows (course title, mono type/id, area, mono time); footer bar "5 of 9 rows · read-only" + **Export CSV** button.

### 11. Settings
- Two **connection cards** (Brightspace / Supabase): title + `mock mode` neutral badge, mono endpoint, and env-var rows — mono var name + `set`(ok)/`missing`(neutral) badge. Brightspace: `BRIGHTSPACE_BASE_URL`(set), `_CLIENT_ID`(set), `_CLIENT_SECRET`(missing), `_ACCESS_TOKEN`(missing). Supabase: `NEXT_PUBLIC_SUPABASE_URL`(missing), `SUPABASE_SERVICE_ROLE_KEY`(missing).
- "ABOUT MOCK MODE" section (mono eyebrow + body) + mono version line "Brightspace Manager v0.3 · read-only milestone".

### 12. Course Details drawer (slide-over)
Opened from the builder's **Details** button. Right slide-over (452px, `--surface`, left border, big shadow). Sticky header: Space Grotesk "Course details" + close (X) button. Fields (each = mono uppercase label + muted help + control):
- **Course ID** — mono input, shown **focused** (accent 1.5px border + `0 0 0 3px var(--accent-tint)` ring). Help: "Unique — namespaces learner progress. Lowercase + hyphens."
- **Subtitle** — text input.
- **Practice area** — text input ("Breadcrumb label, e.g. 'Court Skills'.").
- **Blurb** — textarea ("Outline-page lead. Supports **bold** and _italic_.").
- **Topic family** (select; carries a color swatch — **this sets the course accent** from the category palette) + **Chrome** (select: `bar` = top bar · `rail` = sidebar) in a 2-col row.
- **Home link URL** — mono input.
- **Done** button (accent + glow), bottom-left.
Inputs: height 44, radius 10, `--bg` fill, `--line` border; focus → accent border + tint ring.

---

## Interactions & Behavior
- **Mode toggle** (Author/Operator): swaps nav set + navigates to `/` or `/dashboard/`; persisted (`localStorage 'bm-mode'`); route-aware (landing on an operator-only route forces operator mode).
- **Theme toggle**: light ⇄ dark; persist; default dark.
- **Nav**: standard route navigation; active state per current path.
- **Builder**: select lesson in rail → loads it in canvas; Type pills set lesson kind; Length stepper ±1 (min 1); Try-it radio marks the single correct option; "Preview as learner" swaps the canvas to the learner reader rendering; "Share with learners" opens a publish confirmation.
- **Drawer**: opens over current view. Backdrop `rgba(6,8,12,.55)` + `backdrop-filter: blur(2px)`, `fadeIn .18s ease`. Panel `drawerIn .26s cubic-bezier(.2,.7,.2,1)` (translateX 34px→0, opacity .3→1). Dismiss via Done / X / backdrop click. Clicking inside the panel must `stopPropagation`.
- **Hover**: ghost buttons → `--surface-2`; dashed add-buttons → accent border + `--accent-tint`; primary buttons → slight brightness/glow.
- **Reduced motion**: respect `prefers-reduced-motion` (disable slide/fade).

## State Management
- `theme: 'dark' | 'light'` (persisted)
- `mode: 'author' | 'operator'` (persisted, route-derived)
- route / active screen (from router)
- Builder: `activeModule`, `activeLesson`, `detailsOpen`, content-picker open state
- **Course data model** (drives builder + reader):
  `course { id, title, subtitle, practiceArea, blurb, topicFamily(→accent), chrome, homeUrl, modules[] }`
  `module { id, title, lessons[] }`
  `lesson { id, title, hook, kind: 'concept'|'practice'|'reflection', minutes, sections[] }`
  `section { id, type: 'scene'|'rule'|'changed'|'tryit'|'remember'|'image', …type-specific }`
  - `tryit`: `{ question, options:[{id,text,correct}], answer }`
  - `rule`: rows `[{ tag, title, body }]`
- Data fetching: existing server routes (mock mode until creds). **No new write paths** beyond the Sync apply action.

## Assets
- **Logo**: scales-of-justice glyph, drawn as inline stroke SVG (24 viewBox): `M12 3v18 M5 7h14 M7 7l-3 7h6z M17 7l-3 7h6z`. Rendered white on an `--ink` (light) / `--ink` square; in some contexts on an accent square. Reuse the codebase's existing `public/icon.svg` if preferred.
- **Icons**: simple inline stroke SVGs, 24 viewBox, `stroke-width ~1.7`, round caps/joins (home, grid, refresh, shield, folder, database, gear, eye, search, chevrons, plus, check, x). Use the app's existing `components/icons.tsx` set.
- **Fonts**: Google Fonts (Space Grotesk, Inter, JetBrains Mono) — see import above. Self-host in production per the app's font setup.
- No raster/image assets; all imagery is iconographic.

## Files (in this bundle)
- `prototypes/Manager Cool — Dashboard.dc.html` — **HI-FI** Operator Dashboard (light + dark toggle).
- `prototypes/Manager Cool — Course Studio.dc.html` — **HI-FI** Course builder + Course Details drawer (light + dark toggle).
- `prototypes/Brightspace Manager (warm — structural reference for all 10 screens).dc.html` — the full app with **all 10 screens + both nav modes**, in the *prior* warm styling. Use it as the **structure/content/IA map**; ignore its palette and serif headings (those are replaced by this README's tokens).
- `prototypes/support.js` — runtime so the prototypes open in a browser. Not for production.

### How to view the prototypes
Open any `.dc.html` in `prototypes/` directly in a browser. Use the **theme toggle** (top bar) for light/dark; in the Dashboard switch is top-right; in the builder, click **Details** to see the slide-over. The warm reference's left-nav and the Author/Operator toggle navigate between all screens.
