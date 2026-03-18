-- Optional display name for uploaded media (e.g. original video file name)
alter table public.course_content_blocks
  add column if not exists media_file_name text;
