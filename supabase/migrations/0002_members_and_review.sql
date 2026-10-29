-- Members, dealer listings, and review-before-publish.
-- Apply after 0001. The service role bypasses RLS and stays on the server.
-- Signup creates the auth user with email_confirm = true from the server,
-- so login works before a mail provider is connected. Do not expose that key.

alter table public.vehicles drop constraint if exists vehicles_status_check;
alter table public.vehicles
  add constraint vehicles_status_check
  check (status in ('available', 'reserved', 'sold', 'hidden', 'review'));

alter table public.vehicle_photos drop constraint if exists vehicle_photos_category_check;
alter table public.vehicle_photos
  add constraint vehicle_photos_category_check
  check (category in ('front', 'front_side', 'rear', 'exterior', 'interior', 'dashboard', 'engine', 'tires', 'defect'));

alter table public.vehicles add column if not exists owner_id uuid;
alter table public.vehicles add column if not exists listing_source text not null default 'company';
alter table public.vehicles add column if not exists seller_name text;
alter table public.vehicles add column if not exists seller_email text;
alter table public.vehicles add column if not exists seller_company text;

alter table public.vehicles drop constraint if exists vehicles_listing_source_check;
alter table public.vehicles
  add constraint vehicles_listing_source_check
  check (listing_source in ('company', 'dealer'));

create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('customer', 'dealer')),
  name text not null,
  email text not null,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vehicles_owner_id_fkey'
  ) then
    alter table public.vehicles
      add constraint vehicles_owner_id_fkey
      foreign key (owner_id) references public.member_profiles (user_id) on delete set null;
  end if;
end $$;

alter table public.member_profiles enable row level security;

drop policy if exists vehicles_public_read on public.vehicles;
create policy vehicles_public_read on public.vehicles
for select to anon, authenticated
using (status in ('available', 'reserved', 'sold'));

drop policy if exists photos_public_read on public.vehicle_photos;
create policy photos_public_read on public.vehicle_photos
for select to anon, authenticated
using (
  exists (
    select 1 from public.vehicles v
    where v.id = vehicle_id and v.status in ('available', 'reserved', 'sold')
  )
);

revoke all on table public.member_profiles from anon, authenticated;
revoke select (owner_id, listing_source, seller_name, seller_email, seller_company)
  on table public.vehicles from anon, authenticated;

-- No insert policy on user_roles or member_profiles.
-- A signed-in user cannot grant themselves admin or change their role.
