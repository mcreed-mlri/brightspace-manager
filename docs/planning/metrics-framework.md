# LACE Metrics Framework (v2)

> **The question every metric must serve:** _Is LACE effective for busy legal aid
> attorneys and advocates?_ Not "are people logging in" — did the training fit into
> their week, did they finish, was it worth their time, and did it change their practice.

This is the canonical definition sheet. Dashboards (Brightspace Manager, learning-hub)
and the Supabase reporting views are built against these definitions. If a dashboard
shows a number, its numerator/denominator/window must match a row here — otherwise fix
the dashboard or fix this file, never let them drift silently.

Companion docs: [survey instruments](survey-instruments.md) ·
[proposed Supabase schema](../../../learning-hub/docs/planning/supabase-analytics.sql) ·
[completion ingestion decision](../../../INTEGRATION-PLAYBOOK.md)

---

## Framework

Kirkpatrick-lite, adapted for a no-graded-assignments platform: **Reach → Engagement fit
→ Completion → Perception (L1) → Learning (L2) → Application (L3)**, plus two
cross-cutting lenses: **Content health** and **Equity**.

The pilot (Oct 2026) reports on Reach, Engagement fit, Completion, and Perception.
Learning and Application need the survey pipeline and a 30/60-day lag, so they mature
at public launch (Jan 2027).

---

## 1. Reach — is the target population using it?

| Metric                      | Definition                                                                | Source                                                   |
| --------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| Enrolled learners           | Distinct users with ≥1 active enrollment in a LACE course offering        | Brightspace enrollments                                  |
| Active learners (30d / 90d) | Distinct enrolled users with any course access in the window              | Brightspace course access / Data Sets                    |
| **Reach %**                 | Active learners (90d) ÷ target population headcount, per org              | numerator: Brightspace; denominator: `org_rosters` table |
| New vs returning            | Of active learners this month, % whose first-ever activity was this month | Brightspace enrollments + first-activity date            |

**Why Reach % matters most here:** "74 active learners" is meaningless without knowing
whether that's 74 of 90 or 74 of 900. The `org_rosters` denominator table (org, role,
headcount, as-of date) is maintained by hand — a once-a-quarter update, worth it.

## 2. Engagement fit — does it fit a busy practitioner's week?

More hours is **not** better. A course that busy attorneys finish in short sessions over
two weeks is succeeding; one that demands long sessions is failing them.

| Metric                    | Definition                                                                               | Source                                |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| Median days to complete   | Median of (completion date − enrollment date) over completers, per course                | Brightspace enrollments + completions |
| % completed within 30d    | Completers within 30 days of enrollment ÷ all enrolled ≥30 days ago                      | same                                  |
| Sessions to complete      | Median count of distinct access days per completer, per course                           | Brightspace course access / beacon    |
| Median session length     | Median minutes per session (beacon heartbeat; treat as ordinal — idle tabs inflate it)   | course-wrapper beacon                 |
| Resume rate after idle    | Of learners idle 14+ days in an in-progress course, % who return within the next 30 days | Brightspace last-accessed             |
| Actual vs stated duration | Median total time-on-course ÷ `learning_items.duration_label`                            | beacon + catalog                      |

**Actionable reading:** "this 1-hour course actually takes 2.5 hours" → shorten it or
relabel it. "Nobody resumes after going idle" → the stalled-course nudge and course
chunking matter more than new content.

## 3. Completion — do people finish, and where do they stop?

| Metric                     | Definition                                                                                   | Source                                             |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Completion rate (course)   | Completed ÷ enrolled, per course offering                                                    | Brightspace completion source                      |
| Completion rate (org-wide) | Enrollment-weighted mean across courses                                                      | derived                                            |
| Drop-off point             | Module/topic with the largest fall-off in visit rate between consecutive modules, per course | Brightspace content progress / beacon              |
| Video completion           | % of video starts that reach ≥90% playback, per video                                        | course-wrapper beacon (page visits can't see this) |

**Caveat:** for reference-style content (look up the answer, leave), completion is the
wrong yardstick — tag those items and exclude them from completion KPIs rather than
letting them drag the org number down.

## 4. Perception (Kirkpatrick L1) — was it worth their time?

| Metric               | Definition                                                                                     | Source                          |
| -------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| Usefulness rating    | Mean + distribution of 1–5 "How useful was this course?" post-completion                       | in-hub rating card → `feedback` |
| Rating response rate | Ratings submitted ÷ completions prompted                                                       | `feedback` + completions        |
| Abandonment reasons  | Counts of `too_busy` / `too_long` / `not_relevant` / `need_help` from the stalled-course nudge | in-hub nudge → `feedback.flag`  |
| Content flags        | Counts of `outdated` / `unclear` / `not_relevant` per item                                     | `feedback.flag`                 |

Abandonment reasons are the metric completion rates can't give you: _why_ busy people
stop. `need_help` responses are routed to the Manager needs-attention feed for human
follow-up — that's a service, not just a metric.

## 5. Learning (L2) — did confidence/skill move?

| Metric               | Definition                                                                                   | Source                                   |
| -------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Confidence delta     | Mean post-course − pre-course self-efficacy score (matched pairs where possible), per course | Brightspace surveys → `survey_responses` |
| Post-only confidence | "I could now do X in a real case" 1–5, where no pre-survey ran                               | same                                     |

No graded assignments means self-reported confidence is the honest proxy. Keep the
instrument short (3–4 items) or busy people won't answer, and the metric dies of
non-response.

## 6. Application (L3) — did practice change?

| Metric                | Definition                                                                 | Source                                             |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Applied-in-practice % | 30/60-day follow-up: % answering yes to "Have you used this in your work?" | follow-up survey (email link) → `survey_responses` |
| Application stories   | Free-text examples, tagged by course                                       | same                                               |

This is the number that convinces funders and executive directors. Response rates will
be low — report it with its n, never as a bare percentage.

## 7. Content health — what's missing or decaying?

| Metric               | Definition                                                         | Source                                        |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| Zero-result searches | Distinct queries with 0 results, count + list (content-gap signal) | learning-hub search analytics (already built) |
| Search→launch rate   | Brightspace launches ÷ searches with results                       | search analytics                              |
| Flag backlog         | Open `outdated`/`unclear` flags per item                           | `feedback`                                    |

## 8. Equity lens — who is it working for, and who is it missing?

Every metric above, segmented by **role** (attorney / advocate / paralegal / support),
**org size**, and **region** — via Brightspace user attributes synced into profiles.

**Hard rule (FERPA, already in the schema doc):** suppress any segmented cell where
n < 5. A "team completion rate" for a two-person team is an individual record.

---

## Explicitly NOT KPIs

These may render as personal-facing flavor in the learner dashboard, but never appear
in effectiveness reporting or leadership decks:

- **Streak days** — busy practitioners learn in bursts; streaks punish exactly the
  usage pattern we're designing for.
- **Total hours / weekly hours** — rewards slow content; efficiency metrics (section 2)
  replace it.
- **Raw login counts** — activity, not effectiveness.
- **Activity heatmap** — fine as personal texture, meaningless as an aggregate.

---

## Data source map

| Source                                                | Feeds                                                                      | Cadence                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| Brightspace Data Sets / Data Hub                      | enrollments, completions, content progress, course access, survey attempts | nightly bulk (see INTEGRATION-PLAYBOOK) |
| Brightspace REST (`lePath()` userprogress, classlist) | near-real-time learner dashboard only                                      | on request                              |
| Course-wrapper beacon (`brightspace-courses`)         | session length, video completion, in-course drop-off                       | streamed to Supabase `events`           |
| In-hub micro-surveys (learning-hub)                   | usefulness ratings, abandonment reasons                                    | on interaction → `feedback`             |
| Brightspace surveys → export                          | confidence pre/post, follow-ups                                            | per survey close                        |
| `org_rosters` (manual)                                | reach denominators                                                         | quarterly by hand                       |

_All numbers are fixture data until the pilot; the `DataResult.source` mock banner
rule applies to every new metric the same as the old ones._
