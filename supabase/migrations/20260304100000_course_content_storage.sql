-- ============================================
-- Storage bucket for course content images (rich text blocks)
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-content',
  'course-content',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Authenticated users (e.g. admins) can upload and update
create policy "Authenticated users can upload course content images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-content');

create policy "Authenticated users can update course content images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'course-content');

-- Anyone can read (public bucket)
create policy "Public read access for course content images"
  on storage.objects for select
  using (bucket_id = 'course-content');

-- Authenticated users can delete
create policy "Authenticated users can delete course content images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'course-content');
