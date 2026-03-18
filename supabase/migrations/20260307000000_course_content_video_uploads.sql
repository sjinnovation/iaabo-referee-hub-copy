-- ============================================
-- Allow video uploads in course-content bucket
-- ============================================

-- Extend allowed MIME types and file size for video (200MB max per file)
update storage.buckets
set
  file_size_limit = 209715200,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ]
where id = 'course-content';
