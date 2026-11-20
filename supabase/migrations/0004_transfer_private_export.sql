-- Transfer status gains 수출용/자가용. Existing unknown rows stay unknown.

alter table public.vehicles drop constraint if exists vehicles_transfer_type_check;

alter table public.vehicles
  add constraint vehicles_transfer_type_check
  check (transfer_type in ('transfer', 'scrap_replace', 'private_export', 'unknown'));

comment on column public.vehicles.transfer_type is
  'Domestic Korea transfer status: transfer (양도양수), scrap_replace (대폐차), private_export (수출용/자가용), or unknown.';
