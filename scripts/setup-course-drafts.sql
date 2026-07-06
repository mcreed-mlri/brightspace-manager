-- ==========================================
-- COURSE STUDIO DRAFTS — one JSONB document per draft, plus a private
-- image bucket. Run once in the Supabase SQL Editor for the project whose
-- keys are already in Brightspace Manager's .env. No new env vars needed.
-- After running it, `npm run import-drafts` copies the local drafts up.
-- ==========================================

create table if not exists course_drafts (
  id           text primary key,             -- the draft slug, e.g. "eviction-defense-101"
  data         jsonb not null,               -- the full CourseDraft document
  course_title text not null default '',     -- denormalised for list views
  deploy_ready boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   text                          -- signed-in editor's email, when available
);

-- The app reads and writes this table server-side with the service-role key
-- (see lib/studio/drafts.ts), same posture as curriculum_map: RLS enabled
-- with NO policies denies all direct anon/browser access — the only way in
-- is through the app's authenticated routes. Table-level GRANTs are still
-- required or Postgres returns "permission denied" even for service_role.
alter table course_drafts enable row level security;

grant all on table public.course_drafts to service_role;
grant all on table public.course_drafts to postgres;

-- Private bucket for Studio images (objects live at {draftId}/{filename}).
-- The browser never talks to the bucket — the app streams images through an
-- authenticated route with the service-role key. If this insert is rejected
-- on a future Supabase version, create the bucket in the dashboard instead:
-- Storage -> New bucket -> "course-studio-images", Public bucket OFF.
insert into storage.buckets (id, name, public)
values ('course-studio-images', 'course-studio-images', false)
on conflict (id) do nothing;
