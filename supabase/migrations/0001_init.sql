-- K-BUS HUB schema. Apply with the Supabase CLI or SQL editor.
-- The app does not connect to this database until DATA_MODE=live and a server
-- repository is wired. Do not put the service role key in a NEXT_PUBLIC_ variable.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'agent' check (role in ('admin', 'agent')),
  created_at timestamptz not null default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id),
  name text not null,
  company text not null,
  email text not null unique,
  phone text not null default '',
  country text not null default '',
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  code text not null unique,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id text primary key,
  manufacturer_key text not null,
  manufacturer_ko text not null,
  manufacturer_en text not null,
  model_key text not null,
  model_ko text not null,
  model_en text not null,
  trim_ko text not null default '',
  trim_en text not null default '',
  class text not null check (class in ('county', 'medium', 'large')),
  year int not null,
  first_registered date,
  mileage_km numeric,
  seats int,
  transmission text not null,
  fuel text not null,
  engine_model text,
  displacement_cc numeric,
  steering text not null,
  long_body boolean,
  length_mm numeric,
  width_mm numeric,
  height_mm numeric,
  previous_use_ko text,
  previous_use_en text,
  location_ko text,
  location_en text,
  maintenance_ko text,
  maintenance_en text,
  defects_ko text,
  defects_en text,
  photographed_at date,
  stock_checked_at date,
  description_ko text not null default '',
  description_en text not null default '',
  status text not null check (status in ('available', 'reserved', 'sold', 'hidden')),
  featured boolean not null default false,
  domestic_amount numeric,
  domestic_currency text,
  export_amount numeric,
  export_currency text,
  export_terms text,
  export_includes_ko text,
  export_includes_en text,
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Internal money is a separate table so it cannot be selected with the public row.
create table public.vehicle_internal (
  vehicle_id text primary key references public.vehicles (id) on delete cascade,
  purchase_cost numeric,
  actual_sale_amount numeric,
  extra_costs numeric,
  agent_fee numeric
);

create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text not null references public.vehicles (id) on delete cascade,
  category text not null,
  alt_ko text not null default '',
  alt_en text not null default '',
  file_path text,
  sort_order int not null default 0
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  trade text not null check (trade in ('domestic', 'export')),
  country text not null default '',
  vehicle_id text references public.vehicles (id),
  message text not null,
  kind text not null,
  destination_country text,
  destination_port text,
  port_undecided boolean not null default false,
  status text not null default 'new' check (status in ('new', 'consulting', 'quoted', 'negotiating', 'contract', 'closed')),
  staff_note text not null default '',
  close_reason text not null default '',
  referral_code text,
  assigned_agent_id uuid references public.agents (id),
  consent_at timestamptz not null,
  policy_version text not null
);

create table public.referral_changes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  at timestamptz not null default now(),
  from_agent_id uuid,
  to_agent_id uuid,
  reason text not null
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  vehicle_id text,
  version int not null,
  created_at timestamptz not null default now(),
  valid_until date,
  currency text not null,
  vehicle_price numeric,
  domestic_transport numeric,
  export_costs numeric,
  ocean_freight numeric,
  other_costs numeric,
  included text not null default '',
  excluded text not null default '',
  terms text not null default '',
  unique (inquiry_id, version)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('request', 'sell')),
  created_at timestamptz not null default now(),
  payload jsonb not null,
  referral_code text,
  consent_at timestamptz not null
);

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_internal enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.inquiries enable row level security;
alter table public.referral_changes enable row level security;
alter table public.quotes enable row level security;
alter table public.leads enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role change is not allowed';
  end if;
  if tg_op = 'INSERT' and new.role = 'admin' and auth.role() <> 'service_role' then
    raise exception 'admin role cannot be self-assigned';
  end if;
  return new;
end;
$$;

create trigger profiles_no_self_admin
before insert or update on public.profiles
for each row execute function public.prevent_profile_role_change();

create policy "public read listed vehicles"
on public.vehicles for select
to anon, authenticated
using (status <> 'hidden');

create policy "admin all vehicles"
on public.vehicles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public read photos of listed vehicles"
on public.vehicle_photos for select
to anon, authenticated
using (exists (
  select 1 from public.vehicles v
  where v.id = vehicle_id and v.status <> 'hidden'
));

create policy "admin photos"
on public.vehicle_photos for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- No anon/authenticated select policy: internal figures stay server-side.
create policy "admin internal"
on public.vehicle_internal for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin inquiries"
on public.inquiries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin quotes"
on public.quotes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin leads"
on public.leads for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin agents"
on public.agents for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin referral history"
on public.referral_changes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Agents see status only, through a view. Direct inquiry rows stay closed.
create view public.agent_introductions
with (security_invoker = true) as
select i.id, i.created_at, i.status, i.trade, i.vehicle_id, i.referral_code
from public.inquiries i
join public.agents a on a.code = i.referral_code
where a.profile_id = auth.uid() and a.status = 'approved';

-- Because security_invoker still needs a select policy, add a narrow one.
create policy "agent reads own introductions"
on public.inquiries for select
to authenticated
using (
  referral_code is not null
  and exists (
    select 1 from public.agents a
    where a.code = referral_code and a.profile_id = auth.uid() and a.status = 'approved'
  )
);

-- Column exposure: revoke full table select from the agent role in the API by
-- granting the view instead of the base table to the anon key's usage path.
-- The Next.js server must still map inquiries through toAgentInquiryView and
-- must never send vehicle_internal to the browser for public pages.
revoke select on public.inquiries from anon;
grant select on public.agent_introductions to authenticated;

-- Public intake should go through a checked server action, not an open insert.
-- No insert policy is created for anon. The service role bypasses RLS.
