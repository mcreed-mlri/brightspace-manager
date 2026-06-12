# Handoff: Brightspace Manager — Course Studio (v3)

## Overview

Brightspace Manager is an internal tool for **LACE** (Legal Aid Clinic Exchange), a legal-aid organization. It gives attorneys and legal aid staff a plain-English interface to build and manage Brightspace LMS courses — without touching any wrapper code or LMS admin UI. It also gives technical operators a monitoring console for sync health, connections, and Supabase cache state.

The design is a **single-page application** with a persistent dark sidebar and a content area that swaps between named screens. The centrepiece is the **Course Studio Builder** — a three-pane editor (lesson outline → form → live preview) that generates structured lesson content.

---

## About the Design File

`Brightspace Manager v3.html` is a **high-fidelity HTML prototype** — it is a design reference, not production code. The task for the developer is to **recreate this UI in the target codebase's environment** (Next.js / React, given the existing `Brightspace-Manager/` Next.js app in this repo), using its established patterns, routing, and component library. Do not ship the HTML directly.

**Fidelity: High.** Colors, typography, spacing, interactions, and copy are all final. Recreate pixel-accurately using the design tokens documented below.

---

## Screens / Views

### 1. App Shell

The root layout is a full-viewport flex row: `sidebar (232px fixed) + main (flex: 1)`.

- **Sidebar** — dark (`#0f1117`), fixed width 232px, flex column. Hides with `width: 0; opacity: 0` transition (200ms ease) when the builder is open (full-screen mode).
- **Main** — `overflow: hidden`, flex column. Screens are absolutely positioned and shown/hidden.
- Screen transitions: `opacity 0 → 1` + `translateY(6px → 0)`, 160ms ease (`fadeUp` keyframe).

---

### 2. Sidebar

**Structure (top → bottom):**

1. **Logo lockup** — `BM` monogram badge (30×30px, `#2a5bff`, border-radius 8px, IBM Plex Mono 11px bold white) + "LACE" eyebrow (10px, uppercase, 0.09em tracking, muted) + "Brightspace Manager" name (13px, 700, white).
2. **Author / Operator tab toggle** — two pill tabs (`flex: 1` each), 12.5px 600. Active: `rgba(255,255,255,0.13)` bg, white. Inactive: transparent, muted. border-radius 7px.
3. **Context subtitle** — italic, 11.5px, muted. Changes with mode.
4. **Nav items** — `display: flex; gap: 1px` column. Each item: 8px 10px padding, 7px border-radius, 13px 500 weight, 16×16 SVG icon (opacity 0.6, 1 when active). Active state: `rgba(255,255,255,0.11)` bg, white, 600 weight. Hover: `rgba(255,255,255,0.06)`.
5. **Group labels** — 10px, 700, uppercase, 0.1em tracking, muted. `padding: 12px 8px 3px`.
6. **Footer** — `border-top: 1px solid rgba(255,255,255,0.07)`. Green pulse dot (7px circle, `#179a72`) + status text (11px, muted).

**Author mode nav items:**
- Home → `author-home` screen
- Course Studio → `studio-list` screen
- How everyone's doing → `learners` screen

**Operator mode nav items:**
- Dashboard → `op-dash`
- Course Studio → `studio-list`
- *Group: Monitor* — Course Inventory, Sync Diagnostics, Learner Progress, Connections
- *Group: Under the hood* — Manage Files, Supabase Data, Settings (pinned to bottom)

---

### 3. Author Home (`author-home`)

Max-width 820px, padding 36px 44px 64px.

**Header:**
- Date line: 11px, IBM Plex Mono, soft ink, `margin-bottom: 5px`
- Page title: 26px, 800, −0.03em tracking (`pg-title`)
- Subtitle: 14px, muted ink, max-width 680px, line-height 1.55

**Course Studio CTA card** (`.studio-cta`):
- White surface card, 14px border-radius, light border + shadow
- `padding: 26px 28px`, eyebrow label (10px mono uppercase brand), h2 (19px, 800), body text (14px muted), two CTA buttons in a flex row with `gap: 10px`
- Primary button: `+ Start a new course` → calls `newCourse()` (clears all fields + sections, opens blank builder)
- Ghost button: `Continue last draft` → `goTo('builder')` (opens builder with last loaded content)

**Your courses list:**
- Section header row with "All courses →" link (12.5px, brand color, 600)
- White card with `course-row` items (flex row, `gap: 12px`, padding 12px 16px, border-bottom between rows)
- Each row: doc icon (14×14 SVG, muted) + title/meta stack + status badge + arrow icon
- Hover: `background: #f0f2f6`
- Status badges: `live` (green), `draft` (neutral), `updated` (warn)

**Who could use a nudge:**
- Same card pattern, rows showing learner name + progress detail + percentage badge

---

### 4. Studio List (`studio-list`)

Max-width 820px.

**Header:** Same pg-title pattern + `+ New course` primary button (right-aligned via flex justify-content space-between). Calls `newCourse()`.

**Wrapper template card:**
- Connection status chip (pill badge showing "found" + mono file path)
- Three file chips (`.wfile`): file icon + filename + size in soft ink
- Description paragraph (12.5px, soft, line-height 1.55)

**Course list cards:** Same `course-card-row` pattern with course icon (36×36 rounded square placeholder), title/meta, status badge, "Open →" link. Clicking row or link calls `goTo('builder')`.

---

### 5. Course Studio Builder (`builder`)

**Full-screen mode** — the sidebar hides (width → 0) when this screen opens. Restored on exit.

#### Builder Top Bar (`.bl-bar`)

`height: 52px`, white surface, `border-bottom: 1px solid var(--line)`, flex row, padding 0 16px, `gap: 10px`, `align-items: center`.

- **Back button** — chevron-left icon + "All courses" text, 12.5px, ghost style, calls `goTo('studio-list')`
- **Divider** — 1px vertical line, `height: 20px`, `background: var(--line)`
- **Course title input** — borderless input, 15px, 600, `min-width: 0; flex: 0 0 auto`
- **Save status** — 12px, muted, italic
- **Action buttons** (right side, `margin-left: auto`): "Course details", "Preview" — ghost style, 13px, icon+label. Plus `Saved` badge (green) and `Publish` button (brand-fill, 13px, 700).

#### Three-pane layout (`.bl-body`)

`display: flex; flex: 1; overflow: hidden`

**Pane 1 — Lesson Outline (`.bl-outline`)**
- Width: 258px (collapses to 44px when toggled)
- White surface, right border
- Header: "Lessons" label (10.5px, uppercase, 0.1em tracking, muted) + count + **collapse chevron button** (24×24, ghost, toggles outline width with CSS transition 200ms)
- Collapsed state: only lesson number pills visible (30×30 circles), text hidden
- Module groups: module title (10px, uppercase, soft) + lesson rows
- Lesson row: number (11.5px mono) + title (13px) + optional dot indicator (6px circle, warn color = unsaved/flagged)
- Active lesson: `background: var(--brand-tint); color: var(--brand); font-weight: 600`
- `+ Add lesson` / `+ Add module` controls at the bottom of each group

**Pane 2 — Lesson Form (`.bl-form`)**
- `flex: 1`, scrollable, `background: var(--paper)`
- Inner: `padding: 28px 36px 60px; max-width: 560px`

  **Core fields** (always shown):
  - Lesson title — text input
  - One-line summary — text input + hint "Shown in the course outline."
  - Type (select: Concept / Practice / Drafting / Reflection) + Minutes (number) + Flag (select: None / New / Updated / Law changed) — flex row, `gap: 10px`
  - The Hook — textarea (2 rows) + hint "One bold line under the title."

  **Section system** (below `<hr>`):
  - Template quick-start row: "Start from" label + three pill chips: **Standard lesson**, **Law update**, **Quick ref**
  - `#sections-container` — dynamically rendered section blocks
  - **Empty state** when no sections: dashed border box, centered message
  - `+ Add section` button — dashed border, full-width, opens 2-column block picker popover on click
  
  **Block types available in picker:**
  | Type | Name | Accent |
  |------|------|--------|
  | `scene` | Set the scene | none |
  | `rule` | State the rule | none |
  | `changed` | What changed | warn (#c8791b) |
  | `tryit` | Try it | none |
  | `remember` | Remember | brand/info (#2a5bff) |
  | `media` | Media | none |

  Each rendered section block:
  - White card, 12px border-radius, bottom-margin 14px
  - Header: number badge (24×24 circle) + name (13px, 700) + hint (11.5px, soft) + **× remove button** (22×22, top-right, hover → err-soft bg)
  - Body: borderless textarea, 13.5px, line-height 1.65
  - `changed` blocks: warn-tinted background/border
  - `remember` blocks: brand-tinted background/border

  **Templates:**
  - `standard`: scene → rule → tryit
  - `lawupdate`: scene → rule → changed → tryit
  - `quickref`: rule → remember

**Pane 3 — Live Preview (`.bl-prev`)**
- Width: 360px, fixed right, `background: #f0f0ec`, left border
- Header strip: "Live preview · as a learner sees it" label + "updates as you type" hint
- Scrollable preview area showing a mocked learner card:
  - White card with rounded corners, subtle box-shadow
  - Course progress bar (avatar + eyebrow + title + 3 progress pips)
  - Lesson pills (type+time, flag badge)
  - Lesson title (20px, 800) + hook text (13px, line-height 1.65)
  - Section previews (§1 The Scenario, §2 The Rule) — truncated to ~100 chars from first line

**State management for builder:**
```ts
// Lesson sections array — source of truth for the form
interface LessonSection {
  id: number;      // unique, from counter
  type: 'scene' | 'rule' | 'changed' | 'tryit' | 'remember' | 'media';
  content: string;
}

let lessonSections: LessonSection[] = [];
```

Key functions to implement:
- `newCourse()` — resets all fields + sections, opens builder
- `selectLesson(el, title, summary, type, minutes, flag, hook, scenario?, rule?)` — loads lesson data into form + seeds sections array
- `renderSections()` — rebuilds `#sections-container` from array
- `addSection(type)` — pushes new section, re-renders, auto-focuses textarea
- `removeSection(id)` — filters array, re-renders
- `applyTemplate(name)` — resets sections to preset types with empty content
- `togglePicker(e)` — open/close block picker popover (closes on outside click)
- `toggleOutline()` — collapse/expand lesson outline pane
- `updatePreview()` — reads form fields + lessonSections, updates live preview

---

### 6. Learners (`learners`)

Placeholder screen. Scaffold only — shows "Coming soon" card. Needs real implementation with learner progress data from Supabase.

---

### 7. Operator Dashboard (`op-dash`)

Max-width 920px.

**Connection status grid** — 3 equal columns, 14px gap:
- Cards: white, 14px border-radius, `padding: 16px 18px`
- Connection name (13.5px, 700) + latency/time (12px mono, soft) + dot + badge

**Metrics grid** — 4 equal columns, 12px gap:
- Cards: white, `padding: 18px 20px`
- Label (10.5px, uppercase, soft) + value (28px, 800, mono, tight tracking) + subtitle (12px, soft)
- Warn variant: value in `var(--warn)`, badge pinned `position: absolute; top: 16px; right: 16px`

**Needs attention list:**
- White card, rows with `border-bottom`
- Each row: badge + title (13.5px, 600) + description (12.5px, muted) + ID chip (12px, mono, brand, `margin-left: auto`)

---

## Interactions & Behavior

| Action | Behavior |
|--------|----------|
| Sidebar Author/Operator tab | Swaps nav items, navigates to default screen for that mode |
| Click nav item | `goTo(screenId)` — fades in target screen |
| Open Course Studio builder | Sidebar slides away (width → 0, opacity → 0, 200ms) |
| Exit builder (← All courses) | Sidebar slides back in |
| Click lesson in outline | Loads lesson data into form, re-renders sections, scrolls form to top |
| + Add lesson | Appends new empty lesson to module, selects it, clears form |
| + Add module | Appends new module with one empty lesson |
| Collapse outline | Width 258px → 44px (CSS transition 200ms), shows number-only rail |
| Type in any form field | Calls `updatePreview()`, marks as unsaved |
| Auto-save | 2s debounce after last keystroke, shows "saved at HH:MM" |
| Publish | Flash "✓ Published!" on button for 2s, revert |
| + New course / + Start a new course | Calls `newCourse()` — blanks all fields, empty sections, opens builder |
| Continue last draft | Opens builder with whatever lesson was last loaded |
| Template chip | Replaces sections with preset types (empty content) |
| + Add section | Opens block picker popover (2-col grid). Closes on outside click. |
| Remove section (×) | Removes from array, re-renders |
| Block picker outside click | `document.addEventListener('click')` → `closePicker()` |

---

## State Management

### Navigation state
```ts
let currentScreen: string = 'author-home';
let currentMode: 'author' | 'operator' = 'author';
```

### Builder state
```ts
let lessonSections: LessonSection[] = [];
let sectionIdCounter: number = 10;
```

### Save state
```ts
let saveTimer: ReturnType<typeof setTimeout> | null = null;
// Debounce: markUnsaved() → 2s → autoSave()
```

---

## Design Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--paper` | `#f5f6f8` | App background |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-sunken` | `#eef0f4` | Recessed surfaces, hover fills |
| `--ink` | `#14161b` | Primary text |
| `--ink-muted` | `#565c69` | Secondary text |
| `--ink-soft` | `#8b909d` | Tertiary, labels, hints |
| `--line` | `#e4e7ed` | Borders |
| `--line-soft` | `#edeff3` | Subtle dividers |
| `--line-strong` | `#d3d8e0` | Stronger borders |
| `--hover` | `#f0f2f6` | Row hover fills |
| `--brand` | `#1c3fb0` | Brand text |
| `--brand-fill` | `#2a5bff` | Primary buttons, active states |
| `--brand-tint` | `#eaf0ff` | Brand backgrounds, info tints |
| `--ok` | `#179a72` | Success green |
| `--ok-soft` | `#e2f4ed` | Success background |
| `--ok-ink` | `#0f6e51` | Success text |
| `--warn` | `#c8791b` | Warning orange |
| `--warn-soft` | `#fbf0dc` | Warning background |
| `--err` | `#c8493b` | Error red |
| `--err-soft` | `#fbe9e6` | Error background |
| `--neu` | `#8b909d` | Neutral badge |
| `--neu-soft` | `#eef0f4` | Neutral background |
| `--sb` | `#0f1117` | Sidebar background |

### Typography
| Token | Value |
|-------|-------|
| `--font` | `'Inter', system-ui, sans-serif` |
| `--mono` | `'IBM Plex Mono', monospace` |

**Scale used:**
- Page title: 26px / 800 / −0.03em
- Section title: 15px / 700 / −0.01em
- Body: 15px / 400 / 1.6
- Secondary: 14px / 400 / 1.55
- Small / label: 12–13px
- Micro / eyebrow: 10–11px / 700 / uppercase / 0.07–0.1em tracking

### Spacing & Radii
| Token | Value |
|-------|-------|
| `--r-card` | `14px` — cards, panels |
| `--r-ctrl` | `9px` — buttons, inputs, selects |
| Screen padding | `36px 44px 64px` |
| Card padding | `16–26px` |

### Shadows
| Token | Value |
|-------|-------|
| `--sh-xs` | `0 1px 2px rgba(20,22,27,.05)` |
| `--sh-card` | `0 1px 3px rgba(20,22,27,.05), 0 6px 20px rgba(20,22,27,.07)` |
| `--sh-lg` | `0 8px 32px rgba(20,22,27,.15), 0 2px 6px rgba(20,22,27,.06)` |

---

## Assets

- **Fonts:** Inter (variable, 14..32 optical size, 300..800 weight) + IBM Plex Mono (400, 500) — both from Google Fonts
- **Icons:** All inline SVG, 16×16 or 14×14, `stroke="currentColor"`, `stroke-width="1.6–1.8"`, `fill="none"` — no external icon library used
- **Images:** None — no photography or illustration in this design

---

## Files

| File | Description |
|------|-------------|
| `Brightspace Manager v3.html` | Full hi-fi prototype — all screens, full interactivity, all CSS tokens |

---

## Notes for the Developer

1. **Next.js app context** — The `Brightspace-Manager/` folder in the repo is an existing Next.js app. Implement screens as pages/routes within it, using existing component patterns and Tailwind/CSS modules as appropriate.

2. **Builder data model** — The prototype uses inline mock data embedded in `onclick` attributes. In production, lesson data should come from Supabase (the existing data layer). Wire `selectLesson()` to fetch from the real course data API.

3. **`newCourse()` vs `goTo('builder')`** — These are intentionally different: `newCourse()` blanks the form before navigation; `goTo('builder')` opens with whatever is currently loaded. Map to `router.push('/studio/new')` and `router.push('/studio/[id]')` respectively.

4. **Live preview** — The preview pane reads from in-memory form state on every keystroke. In production, this can use a debounced React state update driving a preview component. No API call needed for preview.

5. **Sidebar collapse in builder** — When the builder route is active, the sidebar should be hidden via CSS transition. A `useEffect` on route change is the right place for this in Next.js.

6. **Section block picker** — Close-on-outside-click is implemented with a `document.addEventListener('click')` in the prototype. In React, use a `useRef` + `useEffect` pattern for this.
