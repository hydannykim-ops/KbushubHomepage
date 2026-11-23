-- Gallery/upload tabs: exterior / interior / other / registration
alter table public.vehicle_photos drop constraint if exists vehicle_photos_category_check;
alter table public.vehicle_photos
  add constraint vehicle_photos_category_check
  check (category in (
    'front', 'front_side', 'rear', 'exterior', 'interior', 'dashboard', 'engine', 'tires', 'defect',
    'other', 'registration'
  ));
