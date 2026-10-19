-- Domestic bus transfer status (양도양수 / 대폐차) and horsepower for list density.
-- Export inquiry shipping preference (RoRo / container). Freight is still quoted by staff.

alter table public.vehicles
  add column if not exists transfer_type text not null default 'unknown'
    check (transfer_type in ('transfer', 'scrap_replace', 'unknown')),
  add column if not exists horsepower_ps integer
    check (horsepower_ps is null or (horsepower_ps >= 0 and horsepower_ps <= 2000));

alter table public.inquiries
  add column if not exists shipping_method text
    check (shipping_method is null or shipping_method in ('roro', 'container', 'undecided'));

comment on column public.vehicles.transfer_type is 'Domestic Korea transfer status: transfer (양도양수), scrap_replace (대폐차), or unknown.';
comment on column public.vehicles.horsepower_ps is 'Engine power in PS (metric horsepower). Null means not confirmed.';
comment on column public.inquiries.shipping_method is 'Buyer shipping preference for export quotes. Not an automatic freight quote.';
