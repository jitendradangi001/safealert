-- =====================================================================
-- SafeAlert — Supabase schema, indexes, and Row Level Security policies
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- =====================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('mobile_user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read profiles (needed so admins can see alert
-- authors' names/roles). Adjust to taste for a stricter demo.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Users may only create/update their own profile row.
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- emergency_alerts
-- ---------------------------------------------------------------------
create table if not exists public.emergency_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  user_name text not null,
  latitude double precision,
  longitude double precision,
  accuracy double precision,
  created_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'acknowledged', 'resolved')),
  is_test boolean not null default false,
  is_demo boolean not null default false,
  device_info text,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  constraint valid_latitude check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint valid_longitude check (longitude is null or (longitude >= -180 and longitude <= 180))
);

create index if not exists emergency_alerts_user_id_idx on public.emergency_alerts (user_id);
create index if not exists emergency_alerts_created_at_idx on public.emergency_alerts (created_at desc);
create index if not exists emergency_alerts_status_idx on public.emergency_alerts (status);

alter table public.emergency_alerts enable row level security;

-- Mobile users can see only their own alerts.
create policy "alerts_select_own"
  on public.emergency_alerts for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can see every alert.
create policy "alerts_select_admin"
  on public.emergency_alerts for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- A user may only insert an alert as themselves.
create policy "alerts_insert_own"
  on public.emergency_alerts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only admins may update alerts (acknowledge / resolve).
create policy "alerts_update_admin"
  on public.emergency_alerts for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------
-- devices
-- ---------------------------------------------------------------------
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  device_name text not null,
  device_type text,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.devices enable row level security;

create policy "devices_select_own_or_admin"
  on public.devices for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "devices_upsert_own"
  on public.devices for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "devices_update_own"
  on public.devices for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Realtime: make sure the alerts table publishes changes
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.emergency_alerts;
