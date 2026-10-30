-- Member nationality/country for inquiry routing (Korea → domestic, others → export).
-- Same as main's 0004_member_country.sql; numbered 0006 here because this branch
-- already uses 0004 for inquiry_messages and 0005 for scrap_requests.

alter table public.member_profiles
  add column if not exists country text;

comment on column public.member_profiles.country is
  'Signup country/nationality. Korea (한국/KR/Korea) routes purchase inquiries; other countries can open export inquiries.';
