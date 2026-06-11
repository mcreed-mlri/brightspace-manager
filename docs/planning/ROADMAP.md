# Brightspace Manager — Roadmap

> **The vision, one sentence:** Learners and supervisors see a calm, polished hub;
> Marlana gets a powerful operational layer that replaces Brightspace click-ops —
> and every write is previewed, confirmed, and logged.

This file is the steering wheel. When a new idea shows up (they always do), it goes in the
**Parking lot** — not into the week. Promote things from the parking lot deliberately, when a
Now slot opens. One thing in **Now** at a time.

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

## 🎯 Now (one thing)

**Present to the team + dogfood the Studio.**
Build one real course start-to-finish in Course Studio Phase A, upload the exported ZIP to
Brightspace by hand (today's normal workflow), and note every point of friction. That list
*is* the Phase B spec. Nothing new gets built until this is done — it tells us what to build.

## 📋 Next (in order)

1. **Course Studio Phase B — deploy automation.** Manage Files upload + Content topic
   creation + automatic URL backfill (kills the dual-URL dance). Needs new OAuth scopes
   (content/managefiles write) registered in Manage Extensibility. Feature-flagged, dry-run
   first, against sandbox offering 6707.
2. **Integrity Checker v1.** Read-only: ghost topics (Content node → missing file), orphaned
   files, missing `?d2l_body_type=3` links. Needs `content:toc:read` scope.
3. **Section-schema sign-off.** Final list of topic sections + fields ("the spine") once the
   official look is settled. Locks before any bulk course production. *(Cheap, important,
   easily forgotten.)*
4. **TipTap rich-text** in Studio section fields (replaces markdown-lite).

## 🔮 Later

- Attribute Monitor (read-only first; bulk edit with CSV preview/confirm much later)
- Sync scheduling (background refresh — only if manual sync becomes a chore)
- Course Creator: provision the Course Offering itself via API (after Phase B proves writes)
- Multi-state jurisdiction expansion support (when a second state is real)

## 🅿️ Parking lot

*Ideas land here so they stop taking up headspace. Nothing here is rejected.*

- Dark mode (token names already match the hub's dark block — cheap when wanted)
- "Prune broken nodes" cleanup action (behind feature flag, per original brief)
- Supabase `course_drafts` table (move drafts off-disk — only if a second machine/editor appears)
- CSV import for bulk course metadata
- Hub catalog curation editor (featured/collections) — boundary question settled in
  [admin-boundaries.md](../admin-boundaries.md): editing would live here
- Start.bat / desktop shortcut for one-click app launch
- Lighthouse/PWA polish pass, app icon refresh

---

*Update this file when a milestone lands or a decision changes. The git history of this file
is the project's story.*
