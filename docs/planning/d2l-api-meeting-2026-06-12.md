# Questions for the D2L API specialist — 2026-06-12

Prioritized: the first block unblocks Course Studio Phase B (one-click deploy), the second
unblocks the Integrity Checker. Context to share: we have a working OAuth 2.0 app
(authorization code + refresh tokens) doing read-only LP API calls today.

## 1 · Writing course packages (unblocks Studio deploy automation)

1. **Manage Files write access** — What's the supported API for uploading files to a course
   offering's Manage Files area? (Endpoint, scope name, multipart format, size limits.)
   Can we create folders (`images/`, `assets/`)?
2. **Content topic creation** — Which LE endpoints create modules and topics that point at
   HTML files in Manage Files? Can we set the topic order, and the "Automatic: Visited"
   completion method, via API?
3. **Topic URLs** — After creating a content topic via API, does the response give us the
   learner-facing URL (the `/d2l/le/content/{ou}/viewContent/{id}/View` form)? We append
   `?d2l_body_type=3` to keep clean view — any caveats?
4. **Course offering creation** — Supported endpoint + required permissions for creating a
   Course Offering under a specific parent org unit (our State → Program tree). Which fields
   are settable at creation (code, name, active status)?
5. **Scopes** — Exact scope strings to register for all of the above (we currently have
   `core:*:* users:userdata:read organizations:organization:read`). Any scopes that require
   D2L approval rather than self-service in Manage Extensibility?

## 2 · Reading content structure (unblocks Integrity Checker)

6. **Content TOC** — Best endpoint to read a course's full module/topic tree with the file
   paths each topic points at (`content:toc:read`?).
7. **Manage Files listing** — API to list files (names, paths, sizes, modified dates) in a
   course's Manage Files area, read-only.
8. **Completion data** — Read API for per-user topic completion (for future reporting), and
   whether Data Hub is preferred over live API for that at our scale.

## 3 · Service account & operations

9. **Headless/service auth** — Is there a supported pattern that doesn't depend on a human's
   refresh-token chain (service user, client-credentials, or long-lived grant)? Our syncs
   currently ride on an admin's OAuth grant.
10. **Rate limits** — Documented limits per app/token? We do bursts of ~50 calls during
    inventory sync.
11. **API versions** — We pin LP 1.49 / LE 1.82 and can auto-discover via `/d2l/api/versions/`.
    Anything deprecated soon that we should plan around?
12. **Course copy** — Is there an API to copy course components between offerings (the
    template→offering flow), or is that UI-only?

## Nice-to-confirm

- Any objection to the `?d2l_body_type=3` clean-view parameter long-term? (It's the backbone
  of our learner experience.)
- `enforced` content URLs (`/content/enforced/{ou}-{code}/file.html`) — stable contract or
  internal detail?
