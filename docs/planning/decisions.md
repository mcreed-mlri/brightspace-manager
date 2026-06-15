# Decision log

Settled questions stay settled. One line of context each — enough to remember *why* without
re-litigating. Newest first.

| Date | Decision | Why |
| --- | --- | --- |
| 2026-06-15 | Wrapper template also readable from GitHub raw (`COURSE_TEMPLATE_URL`) for Vercel; URL wins over `COURSE_TEMPLATE_DIR` when set | Vercel has no `C:\` drive, so preview/export were local-only; GitHub raw is the *same* courses-repo files over HTTPS, so the single-source-of-truth property holds. Caveats: tracks the repo's `main` branch (edits show in prod only after `git push`); relies on the courses repo staying **public** (no auth in the fetch — a private repo would need a token) |
| 2026-06-11 | "Own the content, rent the LMS" — preserve LMS-exit optionality, don't build an LMS | 3-yr D2L contract (~2029 re-eval); content stays in JSON/Supabase, D2L behind adapters; option is leverage even if never exercised |
| 2026-06-11 | Course drafts (`course-drafts/*.json`) are **tracked in git** | They're canonical content; git = free version history + offsite backup for a solo maintainer |
| 2026-06-11 | Studio owns what Studio creates — no round-trip parsing of hand-made HTML | Parsing arbitrary HTML back to fields is unreliable; hand-made courses stay read-only / integrity-checked |
| 2026-06-11 | Drafts are canonical, HTML is a build artifact | "Official look" changes = bump wrapper + regenerate all courses from JSON |
| 2026-06-11 | Wrapper template read live from `C:\dev\brightspace-courses\Course-Template` (`COURSE_TEMPLATE_DIR`) | Single source of truth; template edits flow into every future export |
| 2026-06-11 | Brightspace Manager is the **only write surface**; hub reads | One write path = one audit trail; see admin-boundaries.md |
| 2026-06-11 | Every write: preview → explicit confirm → audit log; upsert-only, never delete | MLRI governance: archive, don't delete |
| 2026-06-11 | Brightspace auth = OAuth auth-code + rotating refresh tokens in `.brightspace-tokens.json` | Proven pattern from brightspace-admin-mcp; same OAuth app, independent token chain |
| 2026-06-11 | Jurisdiction/program from `/orgstructure/{id}/ancestors/` by type ID (State=103, Program=101) | Direct parents only return the Course Template container |
| 2026-06-11 | Fonts: Geist + IBM Plex Mono (not Lato) | Matches the hub/LACE brand; user decision at kickoff |
| 2026-06-11 | Every data function returns `DataResult<T>` with `source: "mock" \| "live"` | Powers the non-dismissable mock banner — fixtures can never impersonate live data |
| 2026-06-11 | Stack pinned to learning-hub (Next 16, Tailwind 3.4, port 3001) | Token/config reuse; the two apps feel like one product |
| 2026-06-11 | Local-first, file-backed everything (tokens, drafts, audit log) | Solo maintainer: nothing to babysit, no infra to break |
