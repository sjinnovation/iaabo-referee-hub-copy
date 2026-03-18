import { supabase } from '@/integrations/supabase/client';
import type { CertificateTemplate } from '@/types/certificate';
import { DEFAULT_CERTIFICATE_TEMPLATE_ID } from '@/types/certificate';

const BUCKET = 'certificate-templates';
const TEMPLATE_PATH = 'template.png';

function mapRow(row: {
  id: string;
  template_url: string | null;
  member_name_x_percent: number;
  member_name_y_percent: number;
  course_title_x_percent: number;
  course_title_y_percent: number;
  font_size_px: number;
  course_title_font_size_px?: number;
  updated_at: string;
  updated_by?: string;
}): CertificateTemplate {
  return {
    id: row.id,
    templateUrl: row.template_url,
    memberNameXPercent: Number(row.member_name_x_percent),
    memberNameYPercent: Number(row.member_name_y_percent),
    courseTitleXPercent: Number(row.course_title_x_percent),
    courseTitleYPercent: Number(row.course_title_y_percent),
    memberNameFontSizePx: row.font_size_px,
    courseTitleFontSizePx: row.course_title_font_size_px ?? row.font_size_px,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

/** Get the global certificate template (single row). Only admins should call this from admin UI; members use public template URL + positions from an API that reads this. */
export async function getCertificateTemplate(): Promise<CertificateTemplate | null> {
  const { data, error } = await (supabase.from as any)('certificate_template')
    .select('*')
    .eq('id', DEFAULT_CERTIFICATE_TEMPLATE_ID)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Parameters<typeof mapRow>[0]) : null;
}

/** Update template positions and optional new template URL. */
export async function updateCertificateTemplate(
  updates: Partial<{
    templateUrl: string | null;
    memberNameXPercent: number;
    memberNameYPercent: number;
    courseTitleXPercent: number;
    courseTitleYPercent: number;
    memberNameFontSizePx: number;
    courseTitleFontSizePx: number;
  }>,
  userId: string
): Promise<CertificateTemplate | null> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
  if (updates.templateUrl !== undefined) payload.template_url = updates.templateUrl;
  if (updates.memberNameXPercent !== undefined) payload.member_name_x_percent = updates.memberNameXPercent;
  if (updates.memberNameYPercent !== undefined) payload.member_name_y_percent = updates.memberNameYPercent;
  if (updates.courseTitleXPercent !== undefined) payload.course_title_x_percent = updates.courseTitleXPercent;
  if (updates.courseTitleYPercent !== undefined) payload.course_title_y_percent = updates.courseTitleYPercent;
  if (updates.memberNameFontSizePx !== undefined) payload.font_size_px = updates.memberNameFontSizePx;
  if (updates.courseTitleFontSizePx !== undefined) payload.course_title_font_size_px = updates.courseTitleFontSizePx;

  const { data, error } = await (supabase.from as any)('certificate_template')
    .update(payload)
    .eq('id', DEFAULT_CERTIFICATE_TEMPLATE_ID)
    .select('*')
    .single();
  if (error) throw error;
  return data ? mapRow(data as Parameters<typeof mapRow>[0]) : null;
}

/** Upload a PNG file as the certificate template and return its public URL. Replaces existing. */
export async function uploadCertificateTemplateFile(file: File): Promise<string> {
  if (file.type !== 'image/png') {
    throw new Error('Certificate template must be a PNG image.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be under 5MB.');
  }

  const { error } = await supabase.storage.from(BUCKET).upload(TEMPLATE_PATH, file, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(TEMPLATE_PATH);
  return data.publicUrl;
}

/** Get certificate template for public/member use (e.g. to generate certificate). Returns template config; template image must be loaded from templateUrl. */
export async function getCertificateTemplateForMember(): Promise<CertificateTemplate | null> {
  const { data, error } = await (supabase.from as any)('certificate_template')
    .select('*')
    .eq('id', DEFAULT_CERTIFICATE_TEMPLATE_ID)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Parameters<typeof mapRow>[0]) : null;
}
