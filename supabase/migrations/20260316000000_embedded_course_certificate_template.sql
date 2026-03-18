-- Per-embedded-course certificate template configuration
-- Allows each embedded course to have its own certificate background and text placement.

alter table public.embedded_courses
  add column if not exists certificate_template_url text,
  add column if not exists certificate_member_name_x_percent numeric,
  add column if not exists certificate_member_name_y_percent numeric,
  add column if not exists certificate_course_title_x_percent numeric,
  add column if not exists certificate_course_title_y_percent numeric,
  add column if not exists certificate_member_name_font_size_px integer,
  add column if not exists certificate_course_title_font_size_px integer;

