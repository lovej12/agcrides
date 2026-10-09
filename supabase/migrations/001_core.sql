-- AGCRIDES Phase 2: secure data model. Run in Supabase SQL editor.
-- Requires PostGIS: create extension if missing.
create extension if not exists postgis;

-- profiles: id = auth.users.id
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','driver','admin')),
  name text not null,
  saved_bus_id text,
  saved_stop_id text
);

create table if not exists routes (
  id text primary key, name text not null, origin text, destination text,
  active boolean default true
);
-- add geometry after PostGIS confirmed:
-- alter table routes add column if not exists polyline geography(LineString);

create table if not exists stops (
  id text primary key, route_id text references routes(id) on delete cascade,
  name text not null, seq int not null,
  lat double precision not null, lng double precision not null,
  geofence_m int default 60, scheduled_offset_min int default 0
);

create table if not exists buses (
  id text primary key, number text unique not null,
  route_id text references routes(id), capacity int default 40, status text default 'active'
);

create table if not exists driver_assignments (
  driver_id uuid references profiles(id) on delete cascade,
  bus_id text references buses(id) on delete cascade,
  active boolean default true, primary key (driver_id, bus_id)
);

create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  bus_id text references buses(id) on delete cascade,
  token_hash text not null, source text default 'phone',
  revoked boolean default false, created_at timestamptz default now()
);

create table if not exists trips (
  id text primary key, bus_id text references buses(id),
  driver_id uuid references profiles(id),
  started_at timestamptz default now(), ended_at timestamptz,
  distance_km numeric default 0, status text default 'active'
);

create table if not exists positions (
  point_id text primary key, trip_id text, bus_id text not null,
  lat double precision not null, lng double precision not null,
  speed_mps numeric default 0, accuracy_m numeric default 20,
  recorded_at timestamptz not null, received_at timestamptz default now()
);
create index if not exists idx_positions_bus_time on positions (bus_id, recorded_at desc);

create table if not exists bus_live (
  bus_id text primary key references buses(id),
  lat double precision, lng double precision, speed_mps numeric,
  last_seen timestamptz, trip_id text, state text, eta_min int
);

create table if not exists stop_events (
  id uuid primary key default gen_random_uuid(),
  trip_id text, stop_id text references stops(id),
  arrived_at timestamptz default now(), scheduled_at timestamptz, delay_min int default 0
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  bus_id text, type text check (type in ('deviation','offline','late','sos','delay')),
  message text, created_at timestamptz default now(), resolved_at timestamptz
);

create table if not exists broadcasts (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id), title text, body text,
  audience text default 'all', created_at timestamptz default now()
);

-- RLS ON (non-negotiable)
alter table profiles enable row level security;
alter table routes enable row level security;
alter table stops enable row level security;
alter table buses enable row level security;
alter table driver_assignments enable row level security;
alter table device_tokens enable row level security;
alter table trips enable row level security;
alter table positions enable row level security;
alter table bus_live enable row level security;
alter table stop_events enable row level security;
alter table alerts enable row level security;
alter table broadcasts enable row level security;

-- Students: read routes/stops/buses/bus_live + own profile. No positions/device_tokens.
-- (Policies use auth.uid(); admins bypass via service role on server. Add granular
-- policies in Supabase dashboard per role — starter open-read for demo below, tighten pre-prod.)
-- Prototype starter (replace before prod): allow anon read on public live tables
create policy if not exists "public read routes" on routes for select using (true);
create policy if not exists "public read stops" on stops for select using (true);
create policy if not exists "public read buses" on buses for select using (true);
create policy if not exists "public read live" on bus_live for select using (true);
