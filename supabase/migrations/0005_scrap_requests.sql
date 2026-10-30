-- Scrap (폐차) quote requests.
-- Extends vehicle_requests for plate number + scrap type.

alter table public.vehicle_requests drop constraint if exists vehicle_requests_type_check;
alter table public.vehicle_requests
  add constraint vehicle_requests_type_check
  check (type in ('wanted', 'sell', 'scrap'));

alter table public.vehicle_requests add column if not exists plate_no text;

revoke select (plate_no) on table public.vehicle_requests from anon, authenticated;
