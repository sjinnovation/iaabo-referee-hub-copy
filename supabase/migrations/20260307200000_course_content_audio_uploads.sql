-- ============================================
-- Allow audio uploads (MP3) in course-content bucket
-- ============================================

update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'audio/mpeg', 'audio/mp3'
  ]
where id = 'course-content';
