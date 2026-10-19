-- Member signup country (buyer market / preferred import destination).
alter table public.member_profiles
  add column if not exists country text;
