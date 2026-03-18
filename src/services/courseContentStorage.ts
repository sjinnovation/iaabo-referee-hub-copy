import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'course-content';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_AUDIO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];

export function isAllowedImageFile(file: File): boolean {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return false;
  if (file.size > MAX_IMAGE_SIZE_BYTES) return false;
  return true;
}

export function isAllowedVideoFile(file: File): boolean {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) return false;
  if (file.size > MAX_VIDEO_SIZE_BYTES) return false;
  return true;
}

export function isAllowedAudioFile(file: File): boolean {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) return false;
  if (file.size > MAX_AUDIO_SIZE_BYTES) return false;
  return true;
}

/**
 * Upload an image to course content storage and return the public URL.
 * Path format: {prefix}/{uuid}.{ext} so multiple blocks don't clash.
 */
export async function uploadCourseContentImage(file: File, prefix = 'blocks'): Promise<string> {
  if (!isAllowedImageFile(file)) {
    throw new Error('Invalid file: use JPEG, PNG, GIF or WebP under 5MB');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeExt = ['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'png';
  const path = `${prefix}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a video to course content storage and return the public URL.
 * Path format: videos/{uuid}.{ext}
 */
export async function uploadCourseContentVideo(file: File, prefix = 'videos'): Promise<string> {
  if (!isAllowedVideoFile(file)) {
    throw new Error('Invalid file: use MP4, WebM or OGG under 200MB');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const safeExt = ['mp4', 'webm', 'ogg', 'mov'].includes(ext) ? ext : 'mp4';
  const path = `${prefix}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload an audio file (MP3) to course content storage and return the public URL.
 * Path format: audio/{uuid}.mp3
 */
export async function uploadCourseContentAudio(file: File, prefix = 'audio'): Promise<string> {
  if (!isAllowedAudioFile(file)) {
    throw new Error('Invalid file: use MP3 under 50MB');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
  const safeExt = ext === 'mp3' ? 'mp3' : 'mp3';
  const path = `${prefix}/${crypto.randomUUID()}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
