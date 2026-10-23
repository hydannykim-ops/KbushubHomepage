-- hey! Bus initial schema.
-- Apply in the Supabase SQL editor or with the Supabase CLI.
-- The service role bypasses RLS, so it must stay on the server.
-- Authenticated users cannot insert their own admin role.

create extension if not exists pgcrypto;

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now()
);

create table public.agent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  name text not null,
  company text,
  country text,
  email text not null,
  phone text,
  message text,
  referral_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  stock_no text not null unique,
  status text not null check (status in ('available', 'reserved', 'sold', 'hidden')),
  vehicle_class text not null check (vehicle_class in ('county', 'medium', 'large')),
  maker text not null,
  model text not null,
  trim text,
  model_year integer,
  first_registered_on date,
  mileage_km integer,
  seats integer,
  transmission text not null default 'unknown' check (transmission in ('manual', 'automatic', 'unknown')),
  fuel text not null default 'unknown' check (fuel in ('diesel', 'gasoline', 'lpg', 'cng', 'electric', 'hybrid', 'unknown')),
  engine_model text,
  displacement_cc integer,
  steering text not null default 'unknown' check (steering in ('lhd', 'rhd', 'unknown')),
  long_body boolean,
  length_mm integer,
  width_mm integer,
  height_mm integer,
  previous_use_ko text,
  previous_use_en text,
  location text,
  maintenance_ko text,
  maintenance_en text,
  defects_ko text,
  defects_en text,
  description_ko text,
  description_en text,
  photographed_on date,
  stock_checked_on date,
  featured boolean not null default false,
  domestic_price_krw bigint,
  export_price_amount numeric(14, 2),
  export_price_currency text,
  export_price_terms_ko text,
  export_price_terms_en text,
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint export_price_pair check (
    (export_price_amount is null and export_price_currency is null)
    or (export_price_amount is not null and export_price_currency is not null)
  )
);

create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  category text not null check (category in ('exterior', 'interior', 'dashboard', 'engine', 'tires', 'defect')),
  storage_path text not null,
  content_type text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  alt_ko text not null default '',
  alt_en text not null default '',
  created_at timestamptz not null default now()
);

create table public.vehicle_internal (
  vehicle_id uuid primary key references public.vehicles (id) on delete cascade,
  purchase_cost numeric(14, 2),
  purchase_currency text,
  actual_sale_amount numeric(14, 2),
  sale_currency text,
  extra_costs numeric(14, 2),
  agent_fee numeric(14, 2),
  fee_currency text,
  note text,
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('purchase', 'visit', 'quote', 'video', 'general')),
  trade_mode text not null check (trade_mode in ('domestic', 'export')),
  name text not null,
  email text,
  phone text,
  messenger text,
  country text not null,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  stock_no text,
  message text not null,
  destination_country text,
  destination_port text,
  destination_port_undecided boolean not null default false,
  first_referral_code text,
  submit_referral_code text,
  assigned_agent_id uuid references public.agent_profiles (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'consulting', 'quoted', 'negotiating', 'contracted', 'closed')),
  close_reason text,
  staff_memo text,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiry_agent_history (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  previous_agent_id uuid,
  next_agent_id uuid,
  reason text not null,
  actor text not null,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  version integer not null,
  currency text not null,
  lines jsonb not null,
  included_items text,
  excluded_items text,
  trade_terms text,
  valid_until date,
  vehicle_stock_no text,
  created_at timestamptz not null default now(),
  unique (inquiry_id, version)
);

create table public.vehicle_requests (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('wanted', 'sell')),
  model text not null,
  model_year integer,
  mileage_km integer,
  seats integer,
  quantity integer,
  budget_amount numeric(14, 2),
  budget_currency text,
  asking_price_amount numeric(14, 2),
  asking_price_currency text,
  location text,
  destination_country text,
  desired_time text,
  name text not null,
  email text,
  phone text,
  message text,
  status text not null default 'new' check (status in ('new', 'consulting', 'closed')),
  staff_memo text,
  first_referral_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sell_request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.vehicle_requests (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  content_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'hey! Bus',
  phone text,
  kakao_url text,
  whatsapp_e164 text,
  email text,
  address text,
  business_hours text,
  about_ko text,
  about_en text,
  privacy_policy_ko text,
  privacy_policy_en text,
  privacy_collection_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, company_name)
values (1, 'hey! Bus')
on conflict (id) do nothing;

alter table public.user_roles enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.vehicle_internal enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_agent_history enable row level security;
alter table public.quotes enable row level security;
alter table public.vehicle_requests enable row level security;
alter table public.sell_request_files enable row level security;
alter table public.site_settings enable row level security;

create policy vehicles_public_read on public.vehicles
for select to anon, authenticated
using (status <> 'hidden');

create policy photos_public_read on public.vehicle_photos
for select to anon, authenticated
using (
  exists (
    select 1 from public.vehicles v
    where v.id = vehicle_id and v.status <> 'hidden'
  )
);

create policy settings_public_read on public.site_settings
for select to anon, authenticated
using (true);

-- No insert, update, or delete policies are created for any table.
-- user_roles has no policies at all, so a signed-in user cannot grant admin.

create or replace function public.agent_my_referrals()
returns table (
  id uuid,
  created_at timestamptz,
  stock_no text,
  trade_mode text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select i.id, i.created_at, i.stock_no, i.trade_mode, i.status
  from public.inquiries i
  join public.agent_profiles ap on ap.user_id = auth.uid()
  where ap.status = 'approved'
    and i.first_referral_code = ap.referral_code
$$;

revoke all on function public.agent_my_referrals() from public;
grant execute on function public.agent_my_referrals() to authenticated;

revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.agent_profiles from anon, authenticated;
revoke all on table public.vehicle_internal from anon, authenticated;
revoke all on table public.inquiries from anon, authenticated;
revoke all on table public.inquiry_agent_history from anon, authenticated;
revoke all on table public.quotes from anon, authenticated;
revoke all on table public.vehicle_requests from anon, authenticated;
revoke all on table public.sell_request_files from anon, authenticated;

grant select on table public.vehicles to anon, authenticated;
grant select on table public.vehicle_photos to anon, authenticated;
grant select on table public.site_settings to anon, authenticated;

insert into storage.buckets (id, name, public)
values
  ('vehicle-photos', 'vehicle-photos', false),
  ('private-files', 'private-files', false)
on conflict (id) do nothing;
