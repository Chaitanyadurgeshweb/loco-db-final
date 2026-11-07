-- Loco Portal: two-level administration with Master Admin approval (migration 0003).
-- ADDITIVE except for one deliberate tightening: administrators lose DIRECT write access
-- to locomotive records (policies admin_insert / admin_update are dropped and table write
-- privileges are revoked). From now on every change is a request that only a Master Admin
-- can approve, through the review_change_request() function.
-- Run once, after 0001 and 0002. Safe to re-run. No rows are deleted or modified.

-- 1. Master admins ---------------------------------------------------------------------
create table if not exists public.master_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.master_admins enable row level security;
revoke all on public.master_admins from anon, authenticated;

create or replace function public.is_master_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.master_admins where user_id = auth.uid());
$$;
revoke all on function public.is_master_admin() from public;
grant execute on function public.is_master_admin() to anon, authenticated;

-- An account is an Admin or a Master Admin, never both (prevents self-approval by design).
create or replace function public.enforce_role_separation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'admin_users' and exists (select 1 from public.master_admins where user_id = new.user_id) then
    raise exception 'This account is already a Master Admin.';
  elsif tg_table_name = 'master_admins' and exists (select 1 from public.admin_users where user_id = new.user_id) then
    raise exception 'This account is already an Admin.';
  end if;
  return new;
end $$;
drop trigger if exists role_separation on public.admin_users;
create trigger role_separation before insert on public.admin_users for each row execute function public.enforce_role_separation();
drop trigger if exists role_separation on public.master_admins;
create trigger role_separation before insert on public.master_admins for each row execute function public.enforce_role_separation();

-- 2. Remove direct write access to live data --------------------------------------------
drop policy if exists admin_insert on public.locomotives;
drop policy if exists admin_update on public.locomotives;
revoke insert, update, delete, truncate on public.locomotives, public.loco_classes, public.sheds, public.zones, public.manufacturers from anon, authenticated;

-- Master Admins can read archived rows too (needed for before/after previews).
drop policy if exists master_read on public.locomotives;
create policy master_read on public.locomotives for select using (public.is_master_admin());
drop policy if exists master_read on public.loco_classes;
create policy master_read on public.loco_classes for select using (public.is_master_admin());
drop policy if exists master_read on public.sheds;
create policy master_read on public.sheds for select using (public.is_master_admin());

-- Internal bookkeeping tables from the initial load are not for browser roles.
alter table public.import_batches enable row level security;
alter table public.import_issues  enable row level security;
revoke all on public.import_batches, public.import_issues from anon, authenticated;
-- OPTIONAL (edits existing metadata; run only if you want the stored batch label made generic):
-- update public.import_batches set source_file = 'initial-dataset', source_label = 'Initial dataset';

-- 3. Requests, audit log, activity history, comments -----------------------------------
create table if not exists public.change_requests (
  id                 bigint generated always as identity primary key,
  request_type       text not null check (request_type in ('add','edit','bulk_upload')),
  status             text not null default 'pending' check (status in ('pending','approved','declined')),
  submitted_by       uuid not null references auth.users (id),
  submitted_by_email text not null,
  submitted_at       timestamptz not null default now(),
  reason             text not null check (char_length(btrim(reason)) between 5 and 2000),
  locomotive_numbers int[] not null default '{}',
  payload            jsonb not null,
  file_name          text,
  reviewed_by        uuid references auth.users (id),
  reviewed_by_email  text,
  reviewed_at        timestamptz,
  decline_reason     text,
  check ((status = 'pending') = (reviewed_at is null))
);
create index if not exists change_requests_status_idx on public.change_requests (status, submitted_at desc);
create index if not exists change_requests_numbers_idx on public.change_requests using gin (locomotive_numbers);
alter table public.change_requests enable row level security;
revoke all on public.change_requests from anon, authenticated;
grant select on public.change_requests to authenticated;
drop policy if exists master_select on public.change_requests;
create policy master_select on public.change_requests for select using (public.is_master_admin());   -- admins see nothing here

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  request_id  bigint references public.change_requests (id),
  event       text not null,
  actor_id    uuid,
  actor_email text,
  detail      jsonb not null default '{}',
  at          timestamptz not null default now()
);
create index if not exists audit_log_request_idx on public.audit_log (request_id);
alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;
drop policy if exists master_select on public.audit_log;
create policy master_select on public.audit_log for select using (public.is_master_admin());
create or replace function public.block_log_changes() returns trigger language plpgsql as $$
begin raise exception 'Audit and activity records are append-only.'; end $$;
drop trigger if exists audit_append_only on public.audit_log;
create trigger audit_append_only before update or delete on public.audit_log for each row execute function public.block_log_changes();

-- Activity visible to admins: SUBMISSIONS only. It deliberately says nothing about approval state.
create table if not exists public.loco_activity (
  id          bigint generated always as identity primary key,
  loco_number int not null,
  request_id  bigint references public.change_requests (id),
  kind        text not null default 'submission',
  summary     text not null,
  actor_email text not null,
  created_at  timestamptz not null default now()
);
create index if not exists loco_activity_number_idx on public.loco_activity (loco_number, created_at desc);
alter table public.loco_activity enable row level security;
revoke all on public.loco_activity from anon, authenticated;
grant select on public.loco_activity to authenticated;
drop policy if exists staff_select on public.loco_activity;
create policy staff_select on public.loco_activity for select using (public.is_admin() or public.is_master_admin());
drop trigger if exists activity_append_only on public.loco_activity;
create trigger activity_append_only before update or delete on public.loco_activity for each row execute function public.block_log_changes();

create table if not exists public.loco_comments (
  id           bigint generated always as identity primary key,
  loco_number  int not null check (loco_number between 10000 and 99999),
  author_id    uuid not null,
  author_email text not null,
  comment      text not null check (char_length(btrim(comment)) between 1 and 2000),
  created_at   timestamptz not null default now()
);
create index if not exists loco_comments_number_idx on public.loco_comments (loco_number, created_at desc);
alter table public.loco_comments enable row level security;
revoke all on public.loco_comments from anon, authenticated;
grant select on public.loco_comments to authenticated;
drop policy if exists staff_select on public.loco_comments;
create policy staff_select on public.loco_comments for select using (public.is_admin() or public.is_master_admin());
drop trigger if exists comments_append_only on public.loco_comments;
create trigger comments_append_only before update or delete on public.loco_comments for each row execute function public.block_log_changes();

-- 4. Helpers -----------------------------------------------------------------------------
create or replace function public.field_label(k text) returns text language sql immutable as $$
  select case k when 'class' then 'Class' when 'shed' then 'Shed' when 'zone' then 'Zone' when 'manufacturer' then 'Manufacturer'
    when 'kavach_make' then 'Kavach make' when 'service_status' then 'Service status' when 'verification' then 'Verification status'
    when 'last_verified' then 'Last verified' when 'archived' then 'Archived' else k end $$;

create or replace function public.describe_item(p_item jsonb) returns text language plpgsql stable as $$
declare parts text;
begin
  if p_item->>'action' = 'add' then
    select string_agg(public.field_label(key) || ': ' || coalesce(nullif(value, ''), '—'), ', ' order by key) into parts from jsonb_each_text(p_item->'after');
    return format('Locomotive %s – new locomotive record submitted (%s)', p_item->>'number', coalesce(parts, ''));
  end if;
  select string_agg(public.field_label(a.key) ||
      case when p_item->>'mode' = 'fill_missing' or coalesce(b.value, '') = '' then ' set to ' || coalesce(nullif(a.value, ''), '(blank)')
           else ' updated from ' || b.value || ' to ' || coalesce(nullif(a.value, ''), '(blank)') end, '; ' order by a.key)
    into parts
    from jsonb_each_text(coalesce(p_item->'after', '{}')) a
    left join jsonb_each_text(coalesce(p_item->'before', '{}')) b on b.key = a.key;
  return format('Locomotive %s – %s', p_item->>'number', coalesce(parts, 'no field changes'));
end $$;

create or replace function public.loco_snapshot(p_number int) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('class', c.code, 'shed', s.code, 'zone', z.code, 'manufacturer', m.code, 'kavach_make', l.kavach_make,
    'service_status', l.service_status, 'verification', l.verification::text, 'last_verified', l.last_verified, 'archived', l.archived)
  from public.locomotives l join public.loco_classes c on c.id = l.class_id join public.sheds s on s.id = l.shed_id
  join public.zones z on z.id = l.zone_id left join public.manufacturers m on m.id = l.manufacturer_id where l.number = p_number;
$$;
revoke all on function public.loco_snapshot(int) from public, anon, authenticated;

create or replace function public.validate_items(p_type text, p_items jsonb) returns int[]
language plpgsql immutable as $$
declare i jsonb; k text; nums int[] := '{}'; n int; cnt int;
begin
  if jsonb_typeof(p_items) <> 'array' then raise exception 'INVALID: items must be a list'; end if;
  cnt := jsonb_array_length(p_items);
  if cnt < 1 or cnt > 5000 then raise exception 'INVALID: a request must contain between 1 and 5000 locomotives'; end if;
  if p_type in ('add','edit') and cnt <> 1 then raise exception 'INVALID: this request type takes exactly one locomotive'; end if;
  for i in select * from jsonb_array_elements(p_items) loop
    if coalesce(i->>'number', '') !~ '^\d{5}$' or (i->>'number')::int < 10000 then raise exception 'INVALID: bad locomotive number %', i->>'number'; end if;
    n := (i->>'number')::int;
    if n = any(nums) then raise exception 'INVALID: locomotive % appears twice', n; end if;
    nums := nums || n;
    if coalesce(jsonb_typeof(i->'after'), '') <> 'object' or i->'after' = '{}'::jsonb then raise exception 'INVALID: nothing to change for %', n; end if;
    if p_type = 'add' and i->>'action' <> 'add' then raise exception 'INVALID: add requests may only add'; end if;
    if p_type = 'edit' and not (i->>'action' = 'update' and i->>'mode' = 'edit') then raise exception 'INVALID: edit requests may only edit'; end if;
    if p_type = 'bulk_upload' and not (i->>'action' = 'add' or (i->>'action' = 'update' and i->>'mode' = 'fill_missing')) then raise exception 'INVALID: bad bulk item for %', n; end if;
    for k in select jsonb_object_keys(i->'after') loop
      if k not in ('class','shed','zone','manufacturer','kavach_make','service_status','verification','last_verified','archived') then raise exception 'INVALID: unknown field %', k; end if;
    end loop;
    if i->>'action' = 'add' and (not i->'after' ? 'class' or not i->'after' ? 'shed' or not i->'after' ? 'zone') then raise exception 'INVALID: % needs class, shed and zone', n; end if;
  end loop;
  return nums;
end $$;
revoke all on function public.validate_items(text, jsonb) from public, anon, authenticated;

-- 5. Submission (Admins) -----------------------------------------------------------------
create or replace function public.submit_change_request(p_type text, p_reason text, p_payload jsonb, p_file_name text default null)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_email text; v_id bigint; v_nums int[];
begin
  if not public.is_admin() then raise exception 'NOT_AUTHORISED' using errcode = '42501'; end if;
  if p_type not in ('add','edit','bulk_upload') then raise exception 'INVALID: unknown request type'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 5 then raise exception 'INVALID: a reason of at least 5 characters is required'; end if;
  v_nums := public.validate_items(p_type, p_payload->'items');
  select email into v_email from auth.users where id = auth.uid();
  insert into public.change_requests (request_type, submitted_by, submitted_by_email, reason, locomotive_numbers, payload, file_name)
    values (p_type, auth.uid(), coalesce(v_email, 'unknown'), btrim(p_reason), v_nums, p_payload, left(p_file_name, 255)) returning id into v_id;
  insert into public.audit_log (request_id, event, actor_id, actor_email, detail)
    values (v_id, 'submitted', auth.uid(), v_email, jsonb_build_object('type', p_type, 'locomotives', cardinality(v_nums)));
  insert into public.loco_activity (loco_number, request_id, summary, actor_email)
    select (i->>'number')::int, v_id,
           public.describe_item(i) || format('. Submitted by %s on %s. Reason: %s', v_email, to_char(now() at time zone 'Asia/Kolkata', 'DD-MM-YYYY'), btrim(p_reason)), v_email
    from jsonb_array_elements(p_payload->'items') i;
  return v_id;
end $$;
revoke all on function public.submit_change_request(text, text, jsonb, text) from public, anon;
grant execute on function public.submit_change_request(text, text, jsonb, text) to authenticated;

create or replace function public.add_loco_comment(p_number int, p_comment text) returns bigint
language plpgsql security definer set search_path = public as $$
declare v_email text; v_id bigint;
begin
  if not (public.is_admin() or public.is_master_admin()) then raise exception 'NOT_AUTHORISED' using errcode = '42501'; end if;
  select email into v_email from auth.users where id = auth.uid();
  insert into public.loco_comments (loco_number, author_id, author_email, comment) values (p_number, auth.uid(), coalesce(v_email, 'unknown'), btrim(p_comment)) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.add_loco_comment(int, text) from public, anon;
grant execute on function public.add_loco_comment(int, text) to authenticated;

-- 6. Applying one item (internal) ---------------------------------------------------------
create or replace function public.apply_item(p_item jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare n int := (p_item->>'number')::int; a jsonb := p_item->'after'; b jsonb := coalesce(p_item->'before', '{}'); cur jsonb; k text;
begin
  if p_item->>'action' = 'add' then
    if exists (select 1 from public.locomotives where number = n) then raise exception 'CONFLICT: locomotive % already exists', n; end if;
    if not exists (select 1 from public.loco_classes where code = a->>'class') then raise exception 'CONFLICT: class % does not exist', a->>'class'; end if;
    if not exists (select 1 from public.sheds where code = a->>'shed') then raise exception 'CONFLICT: shed % does not exist', a->>'shed'; end if;
    if not exists (select 1 from public.zones where code = a->>'zone') then raise exception 'CONFLICT: zone % does not exist', a->>'zone'; end if;
    if nullif(a->>'manufacturer', '') is not null and not exists (select 1 from public.manufacturers where code = a->>'manufacturer') then raise exception 'CONFLICT: manufacturer % does not exist', a->>'manufacturer'; end if;
    insert into public.locomotives (number, class_id, shed_id, zone_id, manufacturer_id, kavach_make, service_status, verification, last_verified)
    values (n, (select id from public.loco_classes where code = a->>'class'), (select id from public.sheds where code = a->>'shed'), (select id from public.zones where code = a->>'zone'),
      (select id from public.manufacturers where code = nullif(a->>'manufacturer', '')), nullif(a->>'kavach_make', ''), nullif(a->>'service_status', ''),
      coalesce(nullif(a->>'verification', ''), 'unverified')::verification_status, nullif(a->>'last_verified', '')::date);
    return;
  end if;
  cur := public.loco_snapshot(n);
  if cur is null then raise exception 'CONFLICT: locomotive % no longer exists', n; end if;
  for k in select jsonb_object_keys(a) loop
    if p_item->>'mode' = 'fill_missing' then
      if coalesce(cur->>k, '') <> '' then raise exception 'CONFLICT: % of locomotive % is no longer empty', public.field_label(k), n; end if;
    elsif cur->k is distinct from b->k then
      raise exception 'CONFLICT: % of locomotive % changed since this request was submitted', public.field_label(k), n;
    end if;
  end loop;
  if a ? 'class' and not exists (select 1 from public.loco_classes where code = a->>'class') then raise exception 'CONFLICT: class % does not exist', a->>'class'; end if;
  if a ? 'shed' and not exists (select 1 from public.sheds where code = a->>'shed') then raise exception 'CONFLICT: shed % does not exist', a->>'shed'; end if;
  if a ? 'zone' and not exists (select 1 from public.zones where code = a->>'zone') then raise exception 'CONFLICT: zone % does not exist', a->>'zone'; end if;
  if a ? 'manufacturer' and nullif(a->>'manufacturer', '') is not null and not exists (select 1 from public.manufacturers where code = a->>'manufacturer') then raise exception 'CONFLICT: manufacturer % does not exist', a->>'manufacturer'; end if;
  update public.locomotives set
    class_id        = case when a ? 'class' then (select id from public.loco_classes where code = a->>'class') else class_id end,
    shed_id         = case when a ? 'shed' then (select id from public.sheds where code = a->>'shed') else shed_id end,
    zone_id         = case when a ? 'zone' then (select id from public.zones where code = a->>'zone') else zone_id end,
    manufacturer_id = case when a ? 'manufacturer' then (select id from public.manufacturers where code = nullif(a->>'manufacturer', '')) else manufacturer_id end,
    kavach_make     = case when a ? 'kavach_make' then nullif(a->>'kavach_make', '') else kavach_make end,
    service_status  = case when a ? 'service_status' then nullif(a->>'service_status', '') else service_status end,
    verification    = case when a ? 'verification' then (a->>'verification')::verification_status else verification end,
    last_verified   = case when a ? 'last_verified' then nullif(a->>'last_verified', '')::date else last_verified end,
    archived        = case when a ? 'archived' then (a->>'archived')::boolean else archived end,
    updated_at      = now()
  where number = n;
end $$;
revoke all on function public.apply_item(jsonb) from public, anon, authenticated;

-- 7. Review (Master Admin only) -----------------------------------------------------------
create or replace function public.review_change_request(p_id bigint, p_decision text, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.change_requests; v_email text; i jsonb; v_count int := 0;
begin
  if not public.is_master_admin() then raise exception 'NOT_AUTHORISED' using errcode = '42501'; end if;
  if p_decision not in ('approve','decline') then raise exception 'INVALID: unknown decision'; end if;
  select * into r from public.change_requests where id = p_id for update;           -- row lock: no duplicate execution
  if not found then raise exception 'INVALID: request not found'; end if;
  if r.status <> 'pending' then raise exception 'ALREADY_REVIEWED'; end if;
  if r.submitted_by = auth.uid() then raise exception 'OWN_REQUEST'; end if;
  select email into v_email from auth.users where id = auth.uid();
  if p_decision = 'decline' then
    if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'INVALID: a rejection reason is required'; end if;
    update public.change_requests set status = 'declined', reviewed_by = auth.uid(), reviewed_by_email = v_email, reviewed_at = now(), decline_reason = btrim(p_reason) where id = p_id;
    insert into public.audit_log (request_id, event, actor_id, actor_email, detail) values (p_id, 'declined', auth.uid(), v_email, jsonb_build_object('reason', btrim(p_reason)));
    return jsonb_build_object('status', 'declined');
  end if;
  for i in select * from jsonb_array_elements(r.payload->'items') loop
    perform public.apply_item(i);          -- any failure aborts the whole approval; request stays pending
    v_count := v_count + 1;
  end loop;
  update public.change_requests set status = 'approved', reviewed_by = auth.uid(), reviewed_by_email = v_email, reviewed_at = now() where id = p_id;
  insert into public.audit_log (request_id, event, actor_id, actor_email, detail) values (p_id, 'approved', auth.uid(), v_email, jsonb_build_object('applied', v_count));
  return jsonb_build_object('status', 'approved', 'applied', v_count);
end $$;
revoke all on function public.review_change_request(bigint, text, text) from public, anon;
grant execute on function public.review_change_request(bigint, text, text) to authenticated;

-- 8. First Master Admin (SQL editor only; the user must already exist under Authentication → Users)
--   insert into public.master_admins (user_id) select id from auth.users where email = 'MASTER_ADMIN_LOGIN_EMAIL_HERE';
-- Verification:
--   select polname, polcmd from pg_policy where polrelid = 'public.locomotives'::regclass;   -- expect select policies only
--   select has_table_privilege('authenticated', 'public.locomotives', 'UPDATE');             -- expect false
