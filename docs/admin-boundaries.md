# What lives in Brightspace Manager vs. Learning Hub admin

A working agreement for where admin features belong across the two surfaces.

## The principle

**Brightspace Manager is where you operate the _platform_. Learning Hub admin is where you
operate the _learning program_.**

The test: if the task is about keeping the three systems correct (Brightspace ↔ Supabase ↔
course templates), it lives in Brightspace Manager. If it's about people learning — who's
progressing, what to feature, who gets access — it belongs in the Learning Hub, where that
context already lives.

There is also a security argument: Brightspace Manager runs locally on an admin laptop holding
the powerful credentials (service-user OAuth, service-role writes, bulk operations). The hub is
a deployed app with a broad audience — the less privileged tooling it carries, the better.
Keep the dangerous stuff on the laptop.

## The write rule

> **Brightspace Manager is the only thing that writes to Brightspace or to Supabase catalog
> data. Every write is previewed, confirmed, and logged.**

One write path means one audit trail and one place where mistakes can happen. The hub reads;
the Manager writes.

## Lives in Brightspace Manager

| Feature                                                                                | Why here                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Course inventory, org structure monitoring                                             | System plumbing                                  |
| Sync pipeline + diagnostics (Brightspace ↔ Supabase)                                   | Cross-system correctness                         |
| Manage Files browser                                                                   | Content infrastructure                           |
| Integrity Checker (ghost topics, orphaned files, broken links, clean-view enforcement) | Cross-system correctness                         |
| Course Studio, template library, course provisioning                                   | Infrastructure writes to Brightspace             |
| Attribute Monitor / bulk user edits (CSV upload)                                       | Bulk writes need the preview–confirm–log pattern |
| Archive/cleanup workflows                                                              | Governed write actions                           |
| API health, token management, audit logs                                               | Operational by definition                        |
| Supabase table inspection                                                              | System plumbing                                  |

## Lives in Learning Hub admin

| Feature                                                  | Why there                                               |
| -------------------------------------------------------- | ------------------------------------------------------- |
| Manager/supervisor views (team progress, completions)    | Audience is legal-aid supervisors, not platform admins  |
| Engagement analytics & program evaluation                | About learners; the hub owns the events/feedback tables |
| Access approval flow (pending users, UPL acknowledgment) | Part of the hub's login/identity experience             |
| "View as learner" preview                                | Only meaningful inside the hub                          |

## The gray zone — catalog curation

Featured courses, collections, editorial boosts, search synonyms. Arguments both ways, but the
**editing** belongs in Brightspace Manager (it's a Supabase catalog write, and the one-write-path
rule is worth protecting), while the hub keeps a read-only preview of how curation renders.

Revisit if a non-technical staff member eventually owns curation day to day — that's the one
persona who would justify a small edit surface in the hub.

## One-line version

> _"Learners and supervisors live in the Learning Hub. The platform itself is managed here —
> Brightspace Manager is the only place that writes, and every write is previewed, confirmed,
> and logged."_
