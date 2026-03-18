import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'embedded-courses';
const MAX_ZIP_BYTES = 150 * 1024 * 1024; // 150MB
// const REQUIRED_PATH = 'res/index.html';

/** Derive a safe folder slug from a string (alphanumeric, hyphens, underscores). */
export function slugFromName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'course';
}

/**
 * From zip file entries, determine the single top-level folder name if all paths share one,
 * otherwise null (caller can use zip filename). Paths are normalized to use /.
 */
function getTopLevelFolderName(entries: string[]): string | null {
  const normalized = entries
    .filter((p) => p.length > 0 && !p.endsWith('/'))
    .map((p) => p.replace(/\\/g, '/').split('/').filter(Boolean));
  if (normalized.length === 0) return null;
  const first = normalized[0];
  if (first.length < 1) return null;
  const candidate = first[0];
  const allSamePrefix = normalized.every((p) => p[0] === candidate);
  return allSamePrefix ? candidate : null;
}

/** Check if a folder name already exists in storage (any object with that prefix). */
export async function embeddedCourseFolderExistsInStorage(folderSlug: string): Promise<boolean> {
  const { data, error } = await supabase.storage.from(BUCKET).list(folderSlug, { limit: 1 });
  if (error) {
    if (error.message?.includes('NotFound') || (error as { error?: string })?.error === 'not_found') return false;
    throw new Error(error.message);
  }
  return Array.isArray(data) && data.length > 0;
}

/**
 * Get the folder slug that would be used for this ZIP (without uploading).
 * Use this to check storage/DB for conflicts before calling uploadEmbeddedCourseZip.
 */
export async function getFolderSlugFromZip(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Please select a ZIP file.');
  }
  const zip = await JSZip.loadAsync(file);
  const entries = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const folderSlug = getTopLevelFolderName(entries) ?? slugFromName(file.name.replace(/\.zip$/i, ''));
  return folderSlug ? slugFromName(folderSlug) || folderSlug : slugFromName(file.name.replace(/\.zip$/i, '')) || 'course';
}

/** Get the public URL for embedded course index (storage). */
export function getEmbeddedCourseStorageContentUrl(folderSlug: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${folderSlug}/res/index.html`);
  return data.publicUrl;
}

/** Base URL for the course res/ folder (trailing slash) so relative paths in index.html resolve correctly. */
export function getEmbeddedCourseStorageBaseUrl(folderSlug: string): string {
  const indexUrl = getEmbeddedCourseStorageContentUrl(folderSlug);
  const base = indexUrl.replace(/\/index\.html$/i, '/');
  return base;
}

/** MIME type by extension for common course assets. */
function mimeForPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    cur: 'image/x-icon',
    svg: 'image/svg+xml',
  };
  return map[ext] ?? 'application/octet-stream';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  fileIndex: number;
  fileCount: number;
  currentFileName: string;
}

/**
 * Upload a ZIP file (course package) to the embedded-courses bucket.
 * ZIP should have structure like: [FolderName]/res/index.html and other files.
 * Ensures no folder with the same name exists in the bucket.
 * Returns the folder slug used (for saving in DB).
 */
export async function uploadEmbeddedCourseZip(
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<{ folderSlug: string }> {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    throw new Error('Please upload a ZIP file.');
  }
  if (file.size > MAX_ZIP_BYTES) {
    throw new Error(`ZIP must be under ${MAX_ZIP_BYTES / 1024 / 1024}MB.`);
  }

  const zip = await JSZip.loadAsync(file);
  const entries = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  if (entries.length === 0) {
    throw new Error('ZIP is empty or contains only folders.');
  }

  const normalizedEntries = entries.map((p) => p.replace(/\\/g, '/'));
  const hasResIndex = normalizedEntries.some(
    (p) => p.toLowerCase().endsWith('res/index.html') || p.toLowerCase().includes('/res/index.html')
  );
  if (!hasResIndex) {
    throw new Error('ZIP must contain res/index.html (e.g. MyCourse/res/index.html).');
  }

  let folderSlug: string = getTopLevelFolderName(entries) ?? slugFromName(file.name.replace(/\.zip$/i, ''));
  if (!folderSlug) folderSlug = slugFromName(file.name.replace(/\.zip$/i, '')) || 'course';
  folderSlug = slugFromName(folderSlug) || folderSlug;

  const existsInStorage = await embeddedCourseFolderExistsInStorage(folderSlug);
  if (existsInStorage) {
    throw new Error(`A folder named "${folderSlug}" already exists in embedded courses. Choose a different ZIP or rename the top-level folder inside the ZIP.`);
  }

  const total = entries.length;
  let uploaded = 0;
  for (const entryPath of entries) {
    const normalized = entryPath.replace(/\\/g, '/');
    const zipEntry = zip.files[entryPath];
    if (!zipEntry || zipEntry.dir) continue;

    const blob = await zipEntry.async('blob');
    const relativePath = getTopLevelFolderName(entries) ? normalized.split('/').slice(1).join('/') : normalized;
    const storagePath = `${folderSlug}/${relativePath}`;
    const contentType = mimeForPath(normalized);

    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, blob, {
      contentType,
      upsert: false,
    });
    if (error) throw new Error(`Upload failed for ${normalized}: ${error.message}`);

    uploaded += 1;
    onProgress?.({
      loaded: uploaded,
      total,
      fileIndex: uploaded,
      fileCount: total,
      currentFileName: storagePath,
    });
  }

  const indexHtmlPath = `${folderSlug}/res/index.html`;
  const indexEntry = entries.find((p) => p.replace(/\\/g, '/').toLowerCase().endsWith('res/index.html'));
  if (indexEntry) {
    const zipEntry = zip.files[indexEntry];
    if (zipEntry && !zipEntry.dir) {
      const blob = await zipEntry.async('blob');
      const { error: updateError } = await supabase.storage.from(BUCKET).upload(indexHtmlPath, blob, {
        contentType: 'text/html',
        upsert: true,
      });
      if (updateError) {
        console.warn('Could not ensure index.html Content-Type:', updateError.message);
      }
    }
  }

  return { folderSlug };
}

/** Normalize list result to array of items with .name (Supabase may return array or { files?, folders? }). */
function normalizeListData(data: unknown): { name: string }[] {
  if (Array.isArray(data)) return data.filter((i) => i && typeof (i as { name?: string }).name === 'string');
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = data as { files?: { name: string }[]; folders?: { name: string }[] };
    const files = Array.isArray(o.files) ? o.files : [];
    const folders = Array.isArray(o.folders) ? o.folders : [];
    return [...files, ...folders].filter((i) => i && typeof i.name === 'string');
  }
  return [];
}

/** Recursively collect all object paths under a prefix (for deletion). */
async function listAllPathsUnder(prefix: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) throw new Error(`Storage list failed: ${error.message}`);
  const items = normalizeListData(data);
  if (items.length === 0) return [];
  const out: string[] = [];
  for (const item of items) {
    const segment = (item.name || '').replace(/\/+$/, '');
    if (!segment) continue;
    const full = `${prefix}/${segment}`.replace(/\/+/g, '/');
    const { data: sub, error: subErr } = await supabase.storage.from(BUCKET).list(full, { limit: 1 });
    if (subErr) {
      // Path might be a file (listing a file can fail or return empty); treat as file path
      out.push(full);
      continue;
    }
    const subItems = normalizeListData(sub);
    if (subItems.length > 0) {
      out.push(...(await listAllPathsUnder(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

/** Delete all files for an embedded course folder in storage (by folder_slug). */
export async function deleteEmbeddedCourseStorageFolder(folderSlug: string): Promise<void> {
  const paths = await listAllPathsUnder(folderSlug);
  const exists = await embeddedCourseFolderExistsInStorage(folderSlug);
  if (paths.length === 0 && exists) {
    throw new Error(
      'Storage folder could not be listed (no files returned). Delete the folder manually in Supabase Storage (bucket: embedded-courses) and try again.'
    );
  }
  if (paths.length === 0) return;
  const BATCH = 100;
  for (let i = 0; i < paths.length; i += BATCH) {
    const batch = paths.slice(i, i + BATCH);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) throw new Error(`Storage delete failed: ${error.message}`);
  }
}
