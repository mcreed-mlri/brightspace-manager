# Brightspace Manager

Internal admin PWA for MLRI's LACE learning platform. It is the operations layer that sits
alongside the learner-facing Learning Hub: admins use it to monitor, inspect, and (in later
milestones) provision Brightspace learning content without click-ops inside the LMS.

**This is not the learner-facing hub.** Learners see the calm, polished LACE Learning Hub
(`C:\dev\learning-hub`); this app is the command center behind it.

## Architecture

Three systems, one rule — **Brightspace is the system of record**:

1. **Brightspace (D2L)** at `mlri.brightspace.com` — courses, enrollments, completions
2. **Supabase** — searchable cache layer (`learning_items` table)
3. **LACE course templates** — custom HTML packages (`course-config.js`, `course-nav.js`,
   `course-style.css`) deployed via Manage Files, launched with `?d2l_body_type=3` clean view.
   Source: [brightspace-course-demo](https://github.com/mcreed-mlri/brightspace-course-demo)
   (local: `C:\dev\brightspace-courses`)

All Brightspace and Supabase calls are **server-side only** (`import "server-only"` is
compiler-enforced). Secrets never reach the browser.

## Milestone 1 (this build) — read-only foundation

- PWA shell with sidebar navigation (installable on a laptop)
- **Dashboard** — offering counts, sync drift, API health, needs-attention list
- **Course Inventory** — searchable/filterable/sortable table with detail drawer
- **Manage Files** — read-only file tree (mocked)
- **Sync Diagnostics** — Brightspace ↔ Supabase drift preview (mocked)
- **Supabase Data** — placeholder; shows a live `learning_items` preview when configured
- **Course Studio / Integrity Checker** — placeholders for later milestones
- **Settings** — connection status + env checklist (names only, never values)

No write actions exist in this milestone. Future cleanup follows MLRI governance:
**archive, do not delete**, with previews, confirmations, and change logs.

## Mock mode

With no credentials configured the app runs entirely on realistic mock fixtures
(`lib/fixtures/`) and every page shows an amber **"Showing mock data"** banner. Every data
function returns a `DataResult<T>` envelope whose `source: "mock" | "live"` field powers that
banner — fixtures can never silently masquerade as live data.

## Running it

```powershell
npm install
npm run dev        # http://localhost:3001 (learning-hub owns 3000)
npm run lint
npm run typecheck
npm run build && npm run start
```

Node is not on the global PATH on this machine; the learning-hub repo bundles a portable
runtime at `C:\dev\learning-hub\tools\node-v24.15.0-win-x64` — prepend it to PATH first.

## Going live later

Copy `.env.example` to `.env.local` and fill in:

- `BRIGHTSPACE_BASE_URL` + `BRIGHTSPACE_ACCESS_TOKEN` — enables live health checks today
- `BRIGHTSPACE_CLIENT_ID` / `BRIGHTSPACE_CLIENT_SECRET` — for the service-user
  (client-credentials) sync flow, next integration milestone
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — enables the live
  `learning_items` preview

API versions are configurable (`BRIGHTSPACE_LP_VERSION`, `BRIGHTSPACE_LE_VERSION`) — never
assume an endpoint version is final.

## Planning

- **[docs/planning/ROADMAP.md](docs/planning/ROADMAP.md)** — the steering wheel: vision,
  what's done, what's Now/Next, and the parking lot for new ideas
- **[docs/planning/decisions.md](docs/planning/decisions.md)** — settled questions, with why

## Where features belong

See [docs/admin-boundaries.md](docs/admin-boundaries.md) for the working agreement on what
lives here vs. in Learning Hub admin. Short version: this app operates the *platform* and is
the only surface that writes; the hub operates the *learning program* and reads.

## Code map

```
app/            pages (App Router) + /api route handlers
components/     shell, badges, cards, table, drawer, file tree
lib/brightspace runtime config + server-only Valence fetch helper
lib/supabase    server-only service-role client
lib/data        domain functions returning DataResult<T> (mock→live swap point)
lib/fixtures    mock data (MA jurisdiction, anchored on real org units 6703/6707)
types/          domain + API envelope types
public/         PWA manifest, service worker (never caches /api/), icons
```
