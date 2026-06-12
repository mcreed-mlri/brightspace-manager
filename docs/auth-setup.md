# Sign-in setup (Supabase Auth, email codes, invite-only)

How teammates sign in: enter work email → receive a one-time code by email
(8 digits on this project; the length is a Supabase setting) → enter the
code → signed in for weeks (cookie session). No passwords.

Auth is **opt-in by environment**. With `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` unset, the app runs open (mock/dev mode) —
local development needs no auth setup at all.

## How it's enforced (two layers, on purpose)

1. `middleware.ts` — refreshes the session cookie, redirects signed-out
   visitors to `/sign-in`, returns 401 envelopes for `/api/*`.
2. `requireUser()` (`lib/auth/server.ts`) — called at the top of **every**
   API route. Middleware alone is bypassable (cf. CVE-2025-29927), and the
   API routes are where the Brightspace token and Supabase service-role key
   actually get used, so each route re-checks the session itself.

Sync runs are stamped with the signed-in email in the audit log (`actor`).

Invite-only is also enforced in code: the sign-in form passes
`shouldCreateUser: false`, so even if the dashboard signups toggle is ever
flipped, uninvited emails cannot create accounts.

## One-time Supabase dashboard checklist

1. **Authentication → Emails → Magic Link template**: put `{{ .Token }}` (the
   one-time code) in the template, e.g. "Your Brightspace Manager sign-in code
   is {{ .Token }}. It expires in 1 hour."
   **This step is make-or-break**: the default template contains only a magic
   *link*, and this app's sign-in asks for a *code* — without `{{ .Token }}`
   the email that arrives is useless, and every retry burns the email budget
   (see rate limits below).
2. **Settings → API**: copy the project URL and the anon/publishable key into
   `.env` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   The new `sb_publishable_…` key format works fine as the anon key.
3. **Authentication → Sign In / Up**: turn **off** "Allow new users to sign
   up". The invite list is now the only way in. *(Checked 2026-06-12: still
   on — `shouldCreateUser: false` in code is covering for it.)*
4. **Authentication → Users → Invite user**: invite each teammate's email.
   The invite email's link can be ignored — once invited, teammates just go
   to the app and sign in with a code like everyone else.
5. Optional hardening: Authentication → Sessions — set a session timebox
   (e.g. 30 days) so lost laptops age out.

## Email rate limits (the 2026-06-12 lockout)

Supabase's **built-in email sender allows only ~2 emails per hour** per
project. An invite + one code request uses the whole budget; after that,
sends fail with "email rate limit exceeded" until the window resets. The
sign-in card now says this plainly (and starts a 60s resend cooldown), but
the real fix for day-to-day use is a **custom SMTP sender** (Authentication →
Emails → SMTP settings — e.g. a free Resend account, 100 emails/day), which
also removes the "for development only" caveat on the built-in sender.

Three things that soften the limit meanwhile:
- **Double-click `scripts\dev-code.cmd`** to mint a valid sign-in code via
  the admin API — **no email is sent**, so testing never touches the budget.
  Pure PowerShell, no node/npm needed. Defaults to the first invited user;
  pass an email for someone else
  (`powershell -File scripts\dev-code.ps1 you@mlri.org`). Needs the
  service-role key in `.env`, so it's local-machine only by design. (Each
  run invalidates the previous pending code — normal one-time-code
  behavior. `npm run dev-code` is the same thing for machines with node.)
- A code stays valid for ~1 hour — if a send fails on the rate limit, the
  code from an *earlier* email still works (the card lets you enter it).
- Local dev doesn't need auth at all: comment out
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env` and the app runs open in mock/dev
  mode (that's the opt-in design, not a bug).

## Notes

- The browser only ever holds the anon key, which is sign-in-only here: all
  data flows through our API routes, which use server-only credentials.
- The service worker uses network-first for page navigations so sign-out and
  sign-in redirects always reach the server; cache is offline fallback only.
- See "Email rate limits" above — the built-in sender is ~2 emails/hour
  total, tighter than this doc originally claimed.
- Known deploy blocker (separate from auth): `.brightspace-tokens.json` is a
  local file with a rotating refresh token — it won't work on serverless
  hosting. Preferred fix is the client-credentials service account flow
  (see docs/planning/d2l-api-meeting-2026-06-12.md).
