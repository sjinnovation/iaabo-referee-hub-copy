-- Add separate font size for course title (member name keeps font_size_px)
alter table public.certificate_template
  add column if not exists course_title_font_size_px integer not null default 28
  check (course_title_font_size_px >= 12 and course_title_font_size_px <= 72);

comment on column public.certificate_template.font_size_px is 'Font size (px) for member name on certificate';
comment on column public.certificate_template.course_title_font_size_px is 'Font size (px) for course title on certificate';
