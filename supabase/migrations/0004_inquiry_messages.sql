-- Async inquiry threads between buyer, listing owner, and staff.
-- Service role only — same pattern as inquiries / quotes.

alter table public.inquiries add column if not exists member_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inquiries_member_id_fkey'
  ) then
    alter table public.inquiries
      add constraint inquiries_member_id_fkey
      foreign key (member_id) references public.member_profiles (user_id) on delete set null;
  end if;
end $$;

create index if not exists inquiries_member_id_idx on public.inquiries (member_id);

create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_role text not null check (author_role in ('buyer', 'seller', 'staff')),
  author_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists inquiry_messages_inquiry_id_created_at_idx
  on public.inquiry_messages (inquiry_id, created_at);

alter table public.inquiry_messages enable row level security;

revoke all on table public.inquiry_messages from anon, authenticated;
revoke select (member_id) on table public.inquiries from anon, authenticated;

-- Backfill first thread line from the original inquiry message when empty.
insert into public.inquiry_messages (inquiry_id, author_role, author_id, body, created_at)
select i.id, 'buyer', i.member_id, i.message, i.created_at
from public.inquiries i
where not exists (
  select 1 from public.inquiry_messages m where m.inquiry_id = i.id
)
and coalesce(trim(i.message), '') <> '';
