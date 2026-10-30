-- Optional month for model year (e.g. 2020/03). Year stays in model_year for filters.
alter table public.vehicles
  add column if not exists model_month smallint;

alter table public.vehicles drop constraint if exists vehicles_model_month_check;
alter table public.vehicles
  add constraint vehicles_model_month_check
  check (model_month is null or (model_month >= 1 and model_month <= 12));
