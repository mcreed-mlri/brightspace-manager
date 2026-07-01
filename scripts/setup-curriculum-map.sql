-- ==========================================
-- CURRICULUM MAP — one JSONB document, team-editable
-- Run once in the Supabase SQL Editor for the project whose keys are already
-- in Brightspace Manager's .env. No new env vars are needed.
-- ==========================================

create table if not exists curriculum_map (
  id         text primary key default 'default',
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- The app reads and writes this table server-side with the service-role key
-- (see lib/data/curriculum-map.ts), so no RLS policies are required for it to
-- work. Enabling RLS with NO policies denies all *direct* anon/browser access,
-- which is the safe default: the only way in is through the authenticated save
-- route. Table-level GRANTs are still required — without them Postgres returns
-- "permission denied" even for the service-role client.
alter table curriculum_map enable row level security;

grant all on table public.curriculum_map to service_role;
grant all on table public.curriculum_map to postgres;
