-- ============================================
-- Embedded courses: content in Storage + bucket
-- ============================================

-- Add column to distinguish storage-backed courses from public-folder courses
alter table public.embedded_courses
  add column if not exists content_in_storage boolean not null default false;

comment on column public.embedded_courses.content_in_storage is 'When true, course files are in storage bucket embedded-courses; when false, in public/embedded-courses/';

-- ============================================
-- Storage bucket for uploaded embedded course packages
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'embedded-courses',
  'embedded-courses',
  true,
  52428800,
  null
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = null;

-- Admins can upload/update/delete; public read for iframe
create policy "Admins can upload embedded course files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'embedded-courses');

create policy "Admins can update embedded course files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'embedded-courses');

create policy "Admins can delete embedded course files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'embedded-courses');

create policy "Public read embedded course files"
  on storage.objects for select
  using (bucket_id = 'embedded-courses');
