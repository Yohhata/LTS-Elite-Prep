-- ============================================================
-- LTS Elite Prep — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Bookings table ──────────────────────────────────────────
create table if not exists bookings (
  id             uuid        default gen_random_uuid() primary key,
  created_at     timestamptz default now()            not null,

  -- Athlete info
  name           text        not null,
  email          text        not null,
  phone          text,

  -- Session preferences
  program        text        not null
                   check (program in ('futures','high','college','private','trial')),
  preferred_date date,
  preferred_time text,
  message        text,

  -- Admin use
  status         text        not null default 'pending'
                   check (status in ('pending','confirmed','cancelled'))
);

-- ── Row Level Security ───────────────────────────────────────
alter table bookings enable row level security;

-- Anyone can INSERT a booking (public booking form)
create policy "Public can insert bookings"
  on bookings for insert
  to anon
  with check (true);

-- Only authenticated users (admin) can read/update
create policy "Authenticated can read bookings"
  on bookings for select
  to authenticated
  using (true);

create policy "Authenticated can update bookings"
  on bookings for update
  to authenticated
  using (true);

-- ── Index ────────────────────────────────────────────────────
create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx      on bookings (status);
