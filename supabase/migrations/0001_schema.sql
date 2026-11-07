-- Indian Railways loco reference DB. PostgreSQL 15+.
create extension if not exists pg_trgm;

create type verification_status as enum ('unverified','source_listed','verified','disputed');

create table import_batches (
  id bigint generated always as identity primary key,
  source_file text not null, source_label text not null,
  imported_at timestamptz not null default now(),
  rows_read int, rows_loaded int, rows_flagged int, notes text
);

create table zones (
  id smallint generated always as identity primary key,
  code text not null unique, name text not null unique
);

create table sheds (
  id int generated always as identity primary key,
  code text not null unique, name text not null,
  location text, maps_query text,
  zone_id smallint references zones(id),          -- NULL when source gives conflicting zones
  division_id int,                                 -- reserved: source file has no divisions
  slug text not null unique, archived boolean not null default false
);

create table manufacturers (
  id smallint generated always as identity primary key,
  code text not null unique, name text, slug text not null unique
);

create table loco_classes (
  id int generated always as identity primary key,
  code text not null unique, slug text not null unique,
  traction text, gauge text, service_type text,    -- null until sourced
  overview text, history text, specs jsonb not null default '{}',
  archived boolean not null default false
);

create table locomotives (
  id bigint generated always as identity primary key,
  number int not null unique check (number between 10000 and 99999),
  class_id int not null references loco_classes(id),
  shed_id int not null references sheds(id),
  zone_id smallint not null references zones(id),  -- zone as recorded for this loco
  manufacturer_id smallint references manufacturers(id),
  kavach_make text,
  service_status text,                             -- null: not in source
  verification verification_status not null default 'source_listed',
  source_batch_id bigint references import_batches(id),
  last_verified date, archived boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  search tsvector generated always as (to_tsvector('simple', number::text)) stored
);

create table import_issues (
  id bigint generated always as identity primary key,
  batch_id bigint references import_batches(id),
  source_row int, issue_type text not null, detail text not null, resolved boolean not null default false
);

create index on locomotives (class_id);
create index on locomotives (shed_id);
create index on locomotives (zone_id);
create index on locomotives (manufacturer_id);
create index on locomotives using gin (search);
create index on locomotives ((number::text) text_pattern_ops);   -- fixed: number is int, so index its text form (original line failed on a fresh DB)
create index on loco_classes using gin (code gin_trgm_ops);
create index on sheds using gin (name gin_trgm_ops);

-- Public read-only; writes only via service role / admin policies (added in Milestone 8)
alter table locomotives enable row level security;
alter table loco_classes enable row level security;
alter table sheds enable row level security;
alter table zones enable row level security;
alter table manufacturers enable row level security;
create policy read_all on locomotives for select using (not archived);
create policy read_all on loco_classes for select using (not archived);
create policy read_all on sheds for select using (not archived);
create policy read_all on zones for select using (true);
create policy read_all on manufacturers for select using (true);
