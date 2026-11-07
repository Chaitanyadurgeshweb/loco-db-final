-- Loco Portal: administrator authorisation (Milestone 8).
-- ADDITIVE ONLY: creates one table, one function and new policies.
-- It does not drop, truncate or alter any existing table, row or policy.
-- Run once in the SQL editor AFTER 0001_schema.sql. Safe to re-run.
--
-- Model: an authenticated user is an administrator only if their
-- user id is listed in public.admin_users. That table is not readable or
-- writable by the browser roles, so it cannot be edited via the API or via
-- user-editable metadata. Admin rows are added only from the SQL Editor
-- (see README, "Create the first administrator").

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;   -- no policies => no API access

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Admins may see archived rows (existing public policies hide them).
drop policy if exists admin_read on public.locomotives;
create policy admin_read on public.locomotives for select using (public.is_admin());
drop policy if exists admin_read on public.loco_classes;
create policy admin_read on public.loco_classes for select using (public.is_admin());
drop policy if exists admin_read on public.sheds;
create policy admin_read on public.sheds for select using (public.is_admin());

-- Admins may add and edit locomotives. No delete policy: records are archived
-- (locomotives.archived) rather than deleted, which is reversible.
drop policy if exists admin_insert on public.locomotives;
create policy admin_insert on public.locomotives for insert with check (public.is_admin());
drop policy if exists admin_update on public.locomotives;
create policy admin_update on public.locomotives for update
  using (public.is_admin()) with check (public.is_admin());

-- Verification queries (run after assigning the first admin):
--   select public.is_admin();                    -- in the SQL Editor this is false (no JWT); it is true inside the app for admins
--   select polname, polcmd from pg_policy where polrelid = 'public.locomotives'::regclass;
