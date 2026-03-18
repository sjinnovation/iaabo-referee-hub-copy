import { supabase } from '@/integrations/supabase/client';
import type {
  EmbeddedCourse,
  EmbeddedCourseEnrollment,
  EmbeddedCourseEnrollmentWithMember,
  EmbeddedCourseQuizResult,
  EmbeddedCourseStatus,
} from '@/types/embeddedCourse';
import { getEmbeddedCourseStorageContentUrl } from '@/services/embeddedCourseUpload';
import { getEmbeddedCoursePublicContentUrl } from '@/types/embeddedCourse';

function mapRowToCourse(row: {
  id: string;
  title: string;
  description: string | null;
  folder_slug: string;
  iaabo_course_id?: string | null;
  is_active: boolean;
  content_in_storage?: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  certificate_template_url?: string | null;
  certificate_member_name_x_percent?: number | null;
  certificate_member_name_y_percent?: number | null;
  certificate_course_title_x_percent?: number | null;
  certificate_course_title_y_percent?: number | null;
  certificate_member_name_font_size_px?: number | null;
  certificate_course_title_font_size_px?: number | null;
}): EmbeddedCourse {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    folderSlug: row.folder_slug,
    iaaboCourseId: row.iaabo_course_id ?? undefined,
    isActive: row.is_active,
    contentInStorage: row.content_in_storage ?? false,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    certificateTemplateUrl: row.certificate_template_url ?? null,
    certificateMemberNameXPercent: row.certificate_member_name_x_percent ?? null,
    certificateMemberNameYPercent: row.certificate_member_name_y_percent ?? null,
    certificateCourseTitleXPercent: row.certificate_course_title_x_percent ?? null,
    certificateCourseTitleYPercent: row.certificate_course_title_y_percent ?? null,
    certificateMemberNameFontSizePx: row.certificate_member_name_font_size_px ?? null,
    certificateCourseTitleFontSizePx: row.certificate_course_title_font_size_px ?? null,
  };
}

/** Get the iframe content URL for an embedded course (Storage or public path). */
export function getEmbeddedCourseContentUrl(course: EmbeddedCourse): string {
  return course.contentInStorage
    ? getEmbeddedCourseStorageContentUrl(course.folderSlug)
    : getEmbeddedCoursePublicContentUrl(course.folderSlug);
}

function mapRowToEnrollment(row: {
  id: string;
  embedded_course_id: string;
  member_id: string;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
}): EmbeddedCourseEnrollment {
  return {
    id: row.id,
    embeddedCourseId: row.embedded_course_id,
    memberId: row.member_id,
    status: row.status as EmbeddedCourseStatus,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
  };
}

/** List all embedded courses (admin). For member catalog, use getActiveEmbeddedCourses. */
export async function getAllEmbeddedCourses(): Promise<EmbeddedCourse[]> {
  const { data, error } = await supabase
    .from('embedded_courses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRowToCourse);
}

/** List active embedded courses for member catalog. */
export async function getActiveEmbeddedCourses(): Promise<EmbeddedCourse[]> {
  const { data, error } = await supabase
    .from('embedded_courses')
    .select('*')
    .eq('is_active', true)
    .order('title');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRowToCourse);
}

export async function getEmbeddedCourseById(id: string): Promise<EmbeddedCourse | null> {
  const { data, error } = await supabase
    .from('embedded_courses')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data ? mapRowToCourse(data) : null;
}

export async function getEmbeddedCourseByFolderSlug(folderSlug: string): Promise<EmbeddedCourse | null> {
  const { data, error } = await supabase
    .from('embedded_courses')
    .select('*')
    .eq('folder_slug', folderSlug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRowToCourse(data) : null;
}

export async function createEmbeddedCourse(params: {
  title: string;
  description?: string;
  folderSlug: string;
  iaaboCourseId?: string | null;
  isActive?: boolean;
  contentInStorage?: boolean;
  createdBy?: string;
}): Promise<EmbeddedCourse> {
  const { data, error } = await supabase
    .from('embedded_courses')
    .insert({
      title: params.title,
      description: params.description ?? null,
      folder_slug: params.folderSlug.trim().replace(/\s+/g, '-'),
      iaabo_course_id: params.iaaboCourseId?.trim() || null,
      is_active: params.isActive ?? true,
      content_in_storage: params.contentInStorage ?? false,
      created_by: params.createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRowToCourse(data);
}

export async function updateEmbeddedCourse(
  id: string,
  params: {
    title?: string;
    description?: string;
    folderSlug?: string;
    iaaboCourseId?: string | null;
    isActive?: boolean;
    contentInStorage?: boolean;
    certificateTemplateUrl?: string | null;
    certificateMemberNameXPercent?: number | null;
    certificateMemberNameYPercent?: number | null;
    certificateCourseTitleXPercent?: number | null;
    certificateCourseTitleYPercent?: number | null;
    certificateMemberNameFontSizePx?: number | null;
    certificateCourseTitleFontSizePx?: number | null;
  }
): Promise<EmbeddedCourse> {
  const payload: Record<string, unknown> = {};
  if (params.title !== undefined) payload.title = params.title;
  if (params.description !== undefined) payload.description = params.description;
  if (params.folderSlug !== undefined) payload.folder_slug = params.folderSlug.trim().replace(/\s+/g, '-');
  if (params.iaaboCourseId !== undefined) payload.iaabo_course_id = params.iaaboCourseId?.trim() || null;
  if (params.isActive !== undefined) payload.is_active = params.isActive;
  if (params.contentInStorage !== undefined) payload.content_in_storage = params.contentInStorage;
  if (params.certificateTemplateUrl !== undefined) payload.certificate_template_url = params.certificateTemplateUrl;
  if (params.certificateMemberNameXPercent !== undefined) {
    payload.certificate_member_name_x_percent = params.certificateMemberNameXPercent;
  }
  if (params.certificateMemberNameYPercent !== undefined) {
    payload.certificate_member_name_y_percent = params.certificateMemberNameYPercent;
  }
  if (params.certificateCourseTitleXPercent !== undefined) {
    payload.certificate_course_title_x_percent = params.certificateCourseTitleXPercent;
  }
  if (params.certificateCourseTitleYPercent !== undefined) {
    payload.certificate_course_title_y_percent = params.certificateCourseTitleYPercent;
  }
  if (params.certificateMemberNameFontSizePx !== undefined) {
    payload.certificate_member_name_font_size_px = params.certificateMemberNameFontSizePx;
  }
  if (params.certificateCourseTitleFontSizePx !== undefined) {
    payload.certificate_course_title_font_size_px = params.certificateCourseTitleFontSizePx;
  }
  const { data, error } = await supabase
    .from('embedded_courses')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRowToCourse(data);
}

export async function deleteEmbeddedCourse(id: string): Promise<void> {
  const { error } = await supabase.from('embedded_courses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Upload a PNG certificate template for a specific embedded course and return its public URL. */
export async function uploadEmbeddedCourseCertificateTemplateFile(
  embeddedCourseId: string,
  file: File
): Promise<string> {
  if (file.type !== 'image/png') {
    throw new Error('Certificate template must be a PNG image.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be under 5MB.');
  }

  const BUCKET = 'certificate-templates';
  const path = `embedded/${embeddedCourseId}.png`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Get enrollments for a member. */
export async function getEmbeddedEnrollmentsForMember(memberId: string): Promise<EmbeddedCourseEnrollment[]> {
  const { data, error } = await supabase
    .from('embedded_course_enrollments')
    .select('*')
    .eq('member_id', memberId)
    .order('enrolled_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRowToEnrollment);
}

/** Enroll a member in an embedded course. */
export async function enrollInEmbeddedCourse(
  embeddedCourseId: string,
  memberId: string
): Promise<EmbeddedCourseEnrollment> {
  const { data, error } = await supabase
    .from('embedded_course_enrollments')
    .insert({
      embedded_course_id: embeddedCourseId,
      member_id: memberId,
      status: 'enrolled',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRowToEnrollment(data);
}

/** Set enrollment status (e.g. in_progress or completed). */
export async function updateEmbeddedEnrollmentStatus(
  enrollmentId: string,
  status: EmbeddedCourseStatus
): Promise<EmbeddedCourseEnrollment> {
  const payload: { status: string; completed_at?: string | null } = { status };
  if (status === 'completed') payload.completed_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('embedded_course_enrollments')
    .update(payload)
    .eq('id', enrollmentId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRowToEnrollment(data);
}

/** Get a member's enrollment for a given embedded course, if any. */
export async function getEmbeddedEnrollment(
  embeddedCourseId: string,
  memberId: string
): Promise<EmbeddedCourseEnrollment | null> {
  const { data, error } = await supabase
    .from('embedded_course_enrollments')
    .select('*')
    .eq('embedded_course_id', embeddedCourseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRowToEnrollment(data) : null;
}

/** Get all enrollments for an embedded course (admin), with member name/email from profiles. */
export async function getEnrollmentsForEmbeddedCourse(
  embeddedCourseId: string
): Promise<EmbeddedCourseEnrollmentWithMember[]> {
  const { data: rows, error } = await supabase
    .from('embedded_course_enrollments')
    .select('*')
    .eq('embedded_course_id', embeddedCourseId)
    .order('enrolled_at', { ascending: false });
  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const memberIds = [...new Set(rows.map((r: { member_id: string }) => r.member_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', memberIds);
  const profileMap = (profiles ?? []).reduce<Record<string, { name: string; email: string }>>((acc, p: { id: string; first_name: string | null; last_name: string | null; email: string | null }) => {
    acc[p.id] = {
      name: [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Unknown',
      email: p.email ?? '',
    };
    return acc;
  }, {});

  return rows.map((r: { id: string; embedded_course_id: string; member_id: string; status: string; enrolled_at: string; completed_at: string | null }) => ({
    ...mapRowToEnrollment(r),
    memberName: profileMap[r.member_id]?.name,
    memberEmail: profileMap[r.member_id]?.email,
  }));
}

/** Get enrollment counts by status for an embedded course (admin). */
export async function getEmbeddedEnrollmentStats(embeddedCourseId: string): Promise<{
  total: number;
  enrolled: number;
  inProgress: number;
  completed: number;
}> {
  const { data: rows, error } = await supabase
    .from('embedded_course_enrollments')
    .select('status')
    .eq('embedded_course_id', embeddedCourseId);
  if (error) throw new Error(error.message);
  const list = (rows ?? []) as { status: string }[];
  return {
    total: list.length,
    enrolled: list.filter((r) => r.status === 'enrolled').length,
    inProgress: list.filter((r) => r.status === 'in_progress').length,
    completed: list.filter((r) => r.status === 'completed').length,
  };
}

/** Save one quiz-slide result (called from postMessage listener or on completion). */
export async function saveEmbeddedCourseQuizResult(params: {
  enrollmentId: string;
  embeddedCourseId: string;
  memberId: string;
  slideTitle?: string;
  score?: number;
  maxScore?: number;
  passed?: boolean;
}): Promise<void> {
  const { error } = await supabase.from('embedded_course_quiz_results').insert({
    enrollment_id: params.enrollmentId,
    embedded_course_id: params.embeddedCourseId,
    member_id: params.memberId,
    slide_title: params.slideTitle ?? null,
    score: params.score ?? null,
    max_score: params.maxScore ?? null,
    passed: params.passed ?? null,
  });
  if (error) throw new Error(error.message);
}

/** Get all quiz-slide results for an enrollment, ordered by submission time. */
export async function getEmbeddedCourseQuizResults(
  enrollmentId: string
): Promise<EmbeddedCourseQuizResult[]> {
  const { data, error } = await supabase
    .from('embedded_course_quiz_results')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('submitted_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    enrollmentId: r.enrollment_id,
    embeddedCourseId: r.embedded_course_id,
    memberId: r.member_id,
    slideTitle: r.slide_title,
    score: r.score,
    maxScore: r.max_score,
    passed: r.passed,
    submittedAt: r.submitted_at,
  }));
}

/** Remove a member from an embedded course (admin). */
export async function unenrollFromEmbeddedCourse(
  embeddedCourseId: string,
  memberId: string
): Promise<void> {
  const { error } = await supabase
    .from('embedded_course_enrollments')
    .delete()
    .eq('embedded_course_id', embeddedCourseId)
    .eq('member_id', memberId);
  if (error) throw new Error(error.message);
}

/** Get all quiz results for a course across all enrollments (admin stats). */
export async function getAllQuizResultsForCourse(
  embeddedCourseId: string
): Promise<(EmbeddedCourseQuizResult & { memberName?: string; memberEmail?: string })[]> {
  const { data, error } = await supabase
    .from('embedded_course_quiz_results')
    .select('*')
    .eq('embedded_course_id', embeddedCourseId)
    .order('submitted_at', { ascending: true });
  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const memberIds = [...new Set(data.map((r: { member_id: string }) => r.member_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', memberIds);
  const profileMap = (profiles ?? []).reduce<Record<string, { name: string; email: string }>>((acc, p: { id: string; first_name: string | null; last_name: string | null; email: string | null }) => {
    acc[p.id] = {
      name: [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Unknown',
      email: p.email ?? '',
    };
    return acc;
  }, {});

  return data.map((r) => ({
    id: r.id,
    enrollmentId: r.enrollment_id,
    embeddedCourseId: r.embedded_course_id,
    memberId: r.member_id,
    slideTitle: r.slide_title,
    score: r.score,
    maxScore: r.max_score,
    passed: r.passed,
    submittedAt: r.submitted_at,
    memberName: profileMap[r.member_id]?.name,
    memberEmail: profileMap[r.member_id]?.email,
  }));
}

/** Insert a quiz result for an embedded course enrollment (called when iframe bridge reports quiz completion). */
export async function upsertEmbeddedCourseQuizResult(params: {
  enrollmentId: string;
  embeddedCourseId: string;
  memberId: string;
  slideTitle?: string;
  score: number | null;
  maxScore: number | null;
  passed: boolean;
}): Promise<void> {
  const { error } = await supabase.from('embedded_course_quiz_results').insert({
    enrollment_id: params.enrollmentId,
    embedded_course_id: params.embeddedCourseId,
    member_id: params.memberId,
    slide_title: params.slideTitle ?? null,
    score: params.score,
    max_score: params.maxScore,
    passed: params.passed,
  });
  if (error) throw new Error(error.message);
}
