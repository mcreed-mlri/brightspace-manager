# Brightspace Manager — Roadmap

> **The vision, one sentence:** Learners and supervisors see a calm, polished hub;
> Marlana gets a powerful operational layer that replaces Brightspace click-ops —
> and every write is previewed, confirmed, and logged.

This file is the steering wheel. When a new idea shows up (they always do), it goes in the
**Parking lot** — not into the week. Promote things from the parking lot deliberately, when a
Now slot opens. One thing in **Now** at a time.

> **The horizon bet — "own the content, rent the LMS."** MLRI is contracted with D2L for
> ~3 years (re-evaluate around 2029). We don't plan to build an LMS; we keep making the
> choices that preserve the option: course content lives in drafts (JSON) + Supabase, the
> wrapper is plain HTML/CSS/JS, and every D2L touchpoint stays behind an adapter in the data
> layer. If D2L earns renewal, nothing is wasted. If not, the content walks out the door.
> No work item may couple course *content* to D2L-specific formats.

---

## Focus rules (read me when excited about a new idea)

1. **Does it serve the next presentation or a real course going live?** If not, parking lot.
2. **Read-only before write, preview before commit, archive over delete.** Always.
3. **One "Now" at a time.** Finishing beats starting.
4. **If it's a hub feature (learners, supervisors, curation display), it doesn't belong in
   this repo.** See [../admin-boundaries.md](../admin-boundaries.md).
5. New ideas are not lost by parking them — they are saved by it.

---

## ✅ Done

| Milestone | What shipped | Date |
| --- | --- | --- |
| M1 — Read-only foundation | PWA shell, nav, dashboard, inventory, placeholders, server-side API pattern, mock-data banner system | 2026-06-11 |
| M2 — Diagnostics + data tools | Sync diff engine, Supabase data browser (search/sort/drawer/CSV), files course picker | 2026-06-11 |
| M3 — Live connections | Brightspace OAuth (rotating tokens, `npm run authorize`), live inventory with ancestors-based jurisdiction/program, live Supabase | 2026-06-11 |
| M4 — Sync pipeline (first write) | Preview → confirm → upsert learning_items → audit log | 2026-06-11 |
| M5 — Course Studio Phase A | Template library, five-section course builder, topic preview, ZIP package export; drafts tracked in git | 2026-06-11 |
| Theme | Hub "Studio" design system: tokens, type scale, button system | 2026-06-11 |
| M6 — Sign-in (team access) | Supabase Auth email codes, invite-only; middleware + per-route `requireUser()`; audit log records who ran each sync; SW network-first navigations. Setup: [docs/auth-setup.md](../auth-setup.md) | 2026-06-12 |
| M7 — Design handoff v3 (Studio UX pass) | Recreated the Claude-Design prototype (`design_handoff_brightspace_manager/`): dark sidebar with Author/Operator mode toggle, Author Home at `/` (operator dashboard moved to `/dashboard/`), and the Studio builder rebuilt as a full-screen three-pane editor — lesson outline → plain-English form with section blocks/templates → always-on live preview, 2s auto-save. Covers most of old Next item 5 ("Harborside patterns"). | 2026-06-12 |

## 🎯 Now (one thing)

**Integrity Checker v1 (read-only).**
Cross-check Brightspace Content, Manage Files, and Supabase to catch ghost topics,
orphaned files, and missing `?d2l_body_type=3` links. Needs `content:toc:read`
scope on the test tenant (https://mlritest.brightspace.com). This is the highest-value
operator gap — Studio Phase A already lets us author locally; we need to trust the
platform before scaling writes or bulk production.

## 📋 Next (in order)

1. **Manage Files live path hardened.** Real trees on the test tenant, not mocks —
   the foundation Integrity Checker and deploy automation both depend on.
2. **Course Studio Phase B — deploy automation (operator write path).** Manage Files
   upload + Content topic creation + automatic URL backfill. Feature-flagged, dry-run
   first. Develop against mlritest; sandbox offering 6707 remains prod validation.
3. **Operator dashboard polish.** Needs-attention feed wired to Integrity Checker results.
4. **Drafts → Supabase (`course_drafts` table).** Promoted when Vercel authoring matters;
   file-backed drafts can't persist on serverless. Keep the JSON shape; local disk stays
   the dev fallback.
5. **Section-schema sign-off.** Final topic sections + fields once the official look is
   settled. Locks before bulk course production.
6. **TipTap rich-text** in Studio section fields (replaces markdown-lite).
7. **Studio dogfooding (unblocked, not gating).** Build one real course in Phase A, note
   friction for Phase B — but don't block operator work on it.

## 🅿️ Parking lot

*Ideas land here so they stop taking up headspace. Nothing here is rejected.*

**Author polish** (wait until the operator loop is solid):

- "Writing tips" checklist panel in the builder
- Author Home learner-progress card (needs hub data)

**General:**

- Dark mode (token names already match the hub's dark block — cheap when wanted)
- "Prune broken nodes" cleanup action (behind feature flag, per original brief)
- CSV import for bulk course metadata
- Hub catalog curation editor (featured/collections) — boundary question settled in
  [admin-boundaries.md](../admin-boundaries.md): editing would live here
- Start.bat / desktop shortcut for one-click app launch
- Lighthouse/PWA polish pass, app icon refresh

## 🔮 Later

- Attribute Monitor (read-only first; bulk edit with CSV preview/confirm much later)
- Sync scheduling (background refresh — only if manual sync becomes a chore)
- Course Creator: provision the Course Offering itself via API (after Phase B proves writes)
- Multi-state jurisdiction expansion support (when a second state is real)

---

*Update this file when a milestone lands or a decision changes. The git history of this file
is the project's story.*
