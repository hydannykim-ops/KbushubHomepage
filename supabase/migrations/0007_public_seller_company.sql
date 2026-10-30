-- Allow public catalog to show dealer trade name next to location.
-- Keep seller_name / seller_email / owner_id private.
grant select (listing_source, seller_company) on table public.vehicles to anon, authenticated;
