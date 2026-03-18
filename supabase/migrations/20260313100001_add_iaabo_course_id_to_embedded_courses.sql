alter table public.embedded_courses
  add column if not exists iaabo_course_id text;
