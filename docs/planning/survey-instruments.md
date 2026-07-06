# LACE Survey Instruments (v1)

> With no graded assignments, surveys **are** the outcome measurement on this
> platform. These instruments carry the Learning (L2) and Application (L3) layers
> of [metrics-framework.md](metrics-framework.md). Keep them short — every added
> question costs response rate, and a dead survey measures nothing.

Every question has a stable `question_key` that maps to
`survey_responses.question_key` (schema:
`learning-hub/docs/planning/supabase-analytics.sql`), so dashboards can be built
against fixtures before the first real response. **Versioning rule:** changing a
question's wording means a new `survey_key` (`_v2`), never a silent reword —
otherwise trend lines quietly compare different questions.

Division of labor: the **in-hub micro-surveys** (rating card, stalled-course
nudge) handle frictionless one-click perception signals and write to `feedback`,
not here. These instruments are for anything needing more than one click.

---

## 1. `pre_course_v1` — optional pre-course confidence (Brightspace survey)

Attach as the first content item only in courses where the confidence delta
matters (skills courses, not orientation). Anonymous: **no** — matched pre/post
pairs need identity; run it identified and report only aggregates.

| question_key | Question | Type | L |
| --- | --- | --- | --- |
| `confidence_pre` | "Right now, how confident are you that you could [do the course's core skill] in a real case?" | 1–5 (Not at all → Very) | 2 |
| `experience_level` | "How often does this issue come up in your current work?" | Never / Occasionally / Weekly / Daily | — |

*Replace the bracketed skill per course, e.g. "draft and file a summary process
answer" — concrete beats abstract.*

## 2. `end_of_course_v1` — end-of-course survey (Brightspace survey)

Attach after the last topic, before the completion screen. Target: under 90
seconds to answer.

| question_key | Question | Type | L |
| --- | --- | --- | --- |
| `worth_my_time` | "Was this course worth the time it took?" | 1–5 (Not at all → Absolutely) | 1 |
| `confidence_post` | "How confident are you now that you could [do the course's core skill] in a real case?" | 1–5 | 2 |
| `right_length` | "The course length felt…" | Too short / About right / Too long | 1 |
| `expect_to_use` | "How soon do you expect to use this in your work?" | This week / This month / Someday / Probably never | 3 (leading) |
| `improve_one_thing` | "If we changed one thing about this course, what should it be?" | free text, optional | 1 |

`right_length` cross-checks the actual-vs-stated duration metric from the
beacon; `expect_to_use` is the leading indicator the 30/60-day follow-up
verifies.

## 3. `followup_30d_v1` / `followup_60d_v1` — application follow-up (email link)

Sent 30 days (and optionally 60) after completion. This is the number that
convinces funders — protect its integrity by always reporting it with its n.
Three questions, one screen, no login required (tokenized link).

| question_key | Question | Type | L |
| --- | --- | --- | --- |
| `applied_in_practice` | "Since finishing [course], have you used what you learned in your work?" | Yes / Not yet, but expect to / No — no occasion / No — didn't stick | 3 |
| `application_example` | "If yes — briefly, what did you use it for?" | free text, optional | 3 |
| `blocked_by` | "If it didn't stick or you couldn't use it, what got in the way?" | free text, optional | 3 |

*"No — no occasion" vs "No — didn't stick" is the distinction that matters:
one is a targeting problem, the other a teaching problem.*

---

## Operating notes

- **Export pipeline:** Brightspace survey results → export (Data Sets or the
  survey tool's own export) → import script maps answers to `question_key` →
  `survey_responses` with `source = 'brightspace_export'`. Follow-ups post
  directly with `source = 'followup_email'`. Build the import against the two
  Brightspace survey data-set CSVs the day the first survey closes — see
  INTEGRATION-PLAYBOOK item 9.
- **Confidence delta:** report matched pairs where both `confidence_pre` and
  `confidence_post` exist for a user+course; fall back to unmatched means
  (labeled as such) where pre wasn't run.
- **Suppression:** never report any aggregate cell with n < 5 (FERPA rule from
  the schema doc); free-text quotes only with identifying details removed.
- **Response-rate hygiene:** track responses ÷ completions per instrument. If
  `end_of_course_v1` drops under ~40%, cut a question rather than chasing
  reminders.
