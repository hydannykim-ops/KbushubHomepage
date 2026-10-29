-- Member nationality/country for inquiry routing (Korea → domestic, others → export).

alter table public.member_profiles
  add column if not exists country text;

comment on column public.member_profiles.country is
  'Signup country/nationality. Korea (한국/KR/Korea) routes purchase inquiries; other countries can open export inquiries.';
