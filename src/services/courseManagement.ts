import {
  ManagedCourse,
  ContentBlock,
  CourseEnrollment,
  CourseFormData,
  CourseSection,
  CourseStatus,
} from '@/types/course';
import { supabase } from '@/integrations/supabase/client';

// ─── Row → App type mappers ──────────────────────────────────────

function mapBlockRow(row: {
  id: string;
  course_id: string;
  section_id: string | null;
  type: string;
  sort_order: number;
  title: string | null;
  text_content: string | null;
  media_url: string | null;
  media_file_name: string | null;
  youtube_video_id: string | null;
  caption: string | null;
  created_at: string;
}, quizData?: { passingScore: number; questions: { questionText: string; options: string[]; correctIndex: number }[] }): ContentBlock {
  const block: ContentBlock = {
    id: row.id,
    courseId: row.course_id,
    sectionId: row.section_id ?? undefined,
    type: row.type as ContentBlock['type'],
    sortOrder: row.sort_order,
    title: row.title ?? undefined,
    textContent: row.text_content ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    mediaFileName: row.media_file_name ?? undefined,
    youtubeVideoId: row.youtube_video_id ?? undefined,
    caption: row.caption ?? undefined,
    createdAt: row.created_at,
  };
  if (row.type === 'quiz' && quizData) {
    block.quiz = {
      passingScore: quizData.passingScore,
      questions: quizData.questions.map(q => ({ ...q })),
    };
  }
  return block;
}

function mapSectionRow(row: { id: string; course_id: string; title: string; sort_order: number }, blocks: ContentBlock[]): CourseSection {
  return {
    id: row.id,
    title: row.title,
    sortOrder: row.sort_order,
    contentBlocks: blocks.filter(b => b.sectionId === row.id).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

/** Fetch quiz block config and questions for given content block IDs. Returns map of content_block_id -> quiz data. */
async function fetchQuizDataForBlockIds(
  contentBlockIds: string[]
): Promise<Map<string, { passingScore: number; questions: { questionText: string; options: string[]; correctIndex: number }[] }>> {
  const map = new Map<string, { passingScore: number; questions: { questionText: string; options: string[]; correctIndex: number }[] }>();
  if (contentBlockIds.length === 0) return map;

  const { data: quizBlocks, error: qbError } = await (supabase.from as any)('course_quiz_blocks')
    .select('id, content_block_id, passing_score')
    .in('content_block_id', contentBlockIds);
  if (qbError || !quizBlocks?.length) return map;

  const quizBlockIds = (quizBlocks as any[]).map((q: any) => q.id);
  const { data: questions, error: qError } = await (supabase.from as any)('course_quiz_questions')
    .select('quiz_block_id, sort_order, question_text, options, correct_index')
    .in('quiz_block_id', quizBlockIds)
    .order('sort_order');
  if (qError) return map;

  const questionsByQuizBlock = ((questions ?? []) as any[]).reduce<Record<string, { questionText: string; options: string[]; correctIndex: number }[]>>((acc, q: any) => {
    const list = acc[q.quiz_block_id] ?? [];
    const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
    list.push({ questionText: q.question_text, options: opts, correctIndex: q.correct_index });
    acc[q.quiz_block_id] = list;
    return acc;
  }, {});

  for (const qb of quizBlocks) {
    map.set(qb.content_block_id, {
      passingScore: qb.passing_score,
      questions: questionsByQuizBlock[qb.id] ?? [],
    });
  }
  return map;
}

function mapCourseRow(row: {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  thumbnail_url: string | null;
  is_required: boolean;
  is_free: boolean;
  price: number;
  currency: string;
  season_year: string;
  estimated_duration_minutes: number;
  created_by: string | null;
  learndash_course_id: number | null;
  created_at: string;
  updated_at: string;
}): Omit<ManagedCourse, 'sections' | 'contentBlocks' | 'enrollmentCount'> {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as ManagedCourse['category'],
    status: row.status as CourseStatus,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    isRequired: row.is_required,
    isFree: row.is_free,
    price: row.price,
    currency: row.currency,
    seasonYear: row.season_year,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    createdBy: row.created_by ?? undefined,
    learndashCourseId: row.learndash_course_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEnrollmentRow(row: {
  id: string;
  course_id: string;
  member_id: string;
  enrolled_by: string | null;
  status: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
}, memberName?: string, memberEmail?: string, courseTitle?: string): CourseEnrollment {
  return {
    id: row.id,
    courseId: row.course_id,
    memberId: row.member_id,
    enrolledBy: row.enrolled_by ?? undefined,
    status: row.status as CourseEnrollment['status'],
    progress: row.progress,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at ?? undefined,
    memberName,
    memberEmail,
    courseTitle,
  };
}

/** Normalize: if no sections, build one from blocks without section_id. */
function normalizeCourseSections(course: ManagedCourse): ManagedCourse {
  if (course.sections && course.sections.length > 0) return course;
  const legacyBlocks = course.contentBlocks || [];
  const singleSection: CourseSection = {
    id: `legacy-${course.id}`,
    title: 'Course Content',
    sortOrder: 0,
    contentBlocks: legacyBlocks.map((b, i) => ({ ...b, sortOrder: i, sectionId: undefined })),
  };
  return { ...course, sections: [singleSection], contentBlocks: undefined };
}

// ─── Course CRUD ─────────────────────────────────────────────────

export async function getAllManagedCourses(): Promise<ManagedCourse[]> {
  const { data: courseRows, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .order('updated_at', { ascending: false });

  if (courseError) throw courseError;
  if (!courseRows?.length) return [];

  const courseIds = courseRows.map(c => c.id);

  const [sectionsRes, blocksRes, enrollmentsRes] = await Promise.all([
    supabase.from('course_sections').select('*').in('course_id', courseIds).order('sort_order'),
    supabase.from('course_content_blocks').select('*').in('course_id', courseIds),
    supabase.from('course_enrollments').select('course_id'),
  ]);

  if (sectionsRes.error) throw sectionsRes.error;
  if (blocksRes.error) throw blocksRes.error;
  if (enrollmentsRes.error) throw enrollmentsRes.error;

  const sections = sectionsRes.data ?? [];
  const blockRows = blocksRes.data ?? [];
  const quizBlockIds = blockRows.filter((r: { type: string }) => r.type === 'quiz').map((r: { id: string }) => r.id);
  const quizDataMap = await fetchQuizDataForBlockIds(quizBlockIds);
  const blocks = blockRows.map((row: Parameters<typeof mapBlockRow>[0]) =>
    mapBlockRow(row, quizDataMap.get(row.id))
  );
  const enrollmentCountByCourse = (enrollmentsRes.data ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.course_id] = (acc[e.course_id] ?? 0) + 1;
    return acc;
  }, {});

  return courseRows.map(row => {
    const base = mapCourseRow(row);
    const courseSections = sections
      .filter(s => s.course_id === row.id)
      .map(s => mapSectionRow(s, blocks));
    const legacyBlocks = blocks.filter(b => b.courseId === row.id && !b.sectionId);
    const course: ManagedCourse = {
      ...base,
      sections: courseSections.length > 0 ? courseSections : undefined,
      contentBlocks: courseSections.length === 0 && legacyBlocks.length > 0 ? legacyBlocks : undefined,
      enrollmentCount: enrollmentCountByCourse[row.id] ?? 0,
    };
    return normalizeCourseSections(course);
  });
}

export async function getManagedCourse(id: string): Promise<ManagedCourse | null> {
  const { data: courseRow, error: courseError } = await supabase.from('courses').select('*').eq('id', id).single();
  if (courseError || !courseRow) return null;

  const [{ data: sections }, { data: blockRows }, { data: enrollCount }] = await Promise.all([
    supabase.from('course_sections').select('*').eq('course_id', id).order('sort_order'),
    supabase.from('course_content_blocks').select('*').eq('course_id', id),
    supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('course_id', id) as any,
  ]);

  const blocks = blockRows ?? [];
  const quizIds = blocks.filter((r: { type: string }) => r.type === 'quiz').map((r: { id: string }) => r.id);
  const quizDataMap = await fetchQuizDataForBlockIds(quizIds);
  const blockList = blocks.map((row: Parameters<typeof mapBlockRow>[0]) =>
    mapBlockRow(row, quizDataMap.get(row.id))
  );
  const sectionList = (sections ?? [])
    .filter(s => s.course_id === id)
    .map(s => mapSectionRow(s, blockList));
  const legacyBlocks = blockList.filter(b => !b.sectionId);

  const course: ManagedCourse = {
    ...mapCourseRow(courseRow),
    sections: sectionList.length > 0 ? sectionList : undefined,
    contentBlocks: sectionList.length === 0 && legacyBlocks.length > 0 ? legacyBlocks : undefined,
    enrollmentCount: enrollCount ?? 0,
  };
  return normalizeCourseSections(course);
}

export async function getPublishedCourses(): Promise<ManagedCourse[]> {
  const all = await getAllManagedCourses();
  return all.filter(c => c.status === 'published');
}

export async function createCourse(data: CourseFormData, createdBy?: string): Promise<ManagedCourse> {
  const { data: courseRow, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      thumbnail_url: data.thumbnailUrl || null,
      is_required: data.isRequired,
      is_free: data.isFree,
      price: data.isFree ? 0 : data.price,
      currency: data.currency,
      season_year: data.seasonYear,
      estimated_duration_minutes: data.estimatedDurationMinutes,
      created_by: createdBy ?? null,
    })
    .select('*')
    .single();

  if (courseError) throw courseError;
  if (!courseRow) throw new Error('Failed to create course');

  const courseId = courseRow.id;

  for (let secIndex = 0; secIndex < (data.sections ?? []).length; secIndex++) {
    const sec = data.sections![secIndex];
    const { data: sectionRow, error: sectionError } = await supabase
      .from('course_sections')
      .insert({ course_id: courseId, title: sec.title, sort_order: secIndex })
      .select('*')
      .single();
    if (sectionError) throw sectionError;
    if (!sectionRow) continue;

    const sectionId = sectionRow.id;
    const contentBlocks = sec.contentBlocks ?? [];
    for (let i = 0; i < contentBlocks.length; i++) {
      const b = contentBlocks[i];
      const { data: insertedBlock, error: blockError } = await supabase
        .from('course_content_blocks')
        .insert({
          course_id: courseId,
          section_id: sectionId,
          type: b.type,
          sort_order: i,
          title: b.title ?? null,
          text_content: b.textContent ?? null,
          media_url: b.mediaUrl ?? null,
          media_file_name: b.mediaFileName ?? null,
          youtube_video_id: b.youtubeVideoId ?? null,
          caption: b.caption ?? null,
        })
        .select('id')
        .single();
      if (blockError) throw blockError;
      if (b.type === 'quiz' && b.quiz && insertedBlock) {
        const { data: quizRow, error: quizError } = await supabase
          .from('course_quiz_blocks')
          .insert({ content_block_id: insertedBlock.id, passing_score: b.quiz.passingScore })
          .select('id')
          .single();
        if (quizError) throw quizError;
        if (quizRow && b.quiz.questions?.length) {
          for (let qIdx = 0; qIdx < b.quiz.questions.length; qIdx++) {
            const q = b.quiz.questions[qIdx];
            await supabase.from('course_quiz_questions').insert({
              quiz_block_id: quizRow.id,
              sort_order: qIdx,
              question_text: q.questionText,
              options: q.options,
              correct_index: q.correctIndex,
            });
          }
        }
      }
    }
  }

  const created = await getManagedCourse(courseId);
  if (!created) throw new Error('Failed to load created course');
  return created;
}

export async function updateCourse(id: string, data: Partial<CourseFormData>): Promise<ManagedCourse | null> {
  const updatePayload: Record<string, unknown> = {};
  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.thumbnailUrl !== undefined) updatePayload.thumbnail_url = data.thumbnailUrl || null;
  if (data.isRequired !== undefined) updatePayload.is_required = data.isRequired;
  if (data.isFree !== undefined) updatePayload.is_free = data.isFree;
  if (data.price !== undefined) updatePayload.price = data.isFree ? 0 : data.price;
  if (data.currency !== undefined) updatePayload.currency = data.currency;
  if (data.seasonYear !== undefined) updatePayload.season_year = data.seasonYear;
  if (data.estimatedDurationMinutes !== undefined) updatePayload.estimated_duration_minutes = data.estimatedDurationMinutes;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase.from('courses').update(updatePayload).eq('id', id);
    if (error) throw error;
  }

  if (data.sections !== undefined) {
    const sections = data.sections;
    const submittedBlockIds = new Set(sections.flatMap((s) => (s.contentBlocks ?? []).map((b) => b.id)));
    const submittedSectionIds = new Set(sections.map((s) => s.id));

    const { data: existingSections } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', id);
    const existingSectionIds = new Set((existingSections ?? []).map((r: { id: string }) => r.id));

    const { data: existingBlocks } = await supabase
      .from('course_content_blocks')
      .select('id')
      .eq('course_id', id);
    const existingBlockIds = new Set((existingBlocks ?? []).map((r: { id: string }) => r.id));

    // Remove blocks that were removed from the form (preserves completion records for blocks we keep)
    const blockIdsToDelete = [...existingBlockIds].filter((bid) => !submittedBlockIds.has(bid));
    if (blockIdsToDelete.length > 0) {
      await supabase.from('course_content_blocks').delete().in('id', blockIdsToDelete);
    }
    // Remove sections that were removed from the form
    const sectionIdsToDelete = [...existingSectionIds].filter((sid) => !submittedSectionIds.has(sid));
    if (sectionIdsToDelete.length > 0) {
      await supabase.from('course_sections').delete().in('id', sectionIdsToDelete);
    }

    const sectionDbIdByIndex: string[] = [];

    for (let secIndex = 0; secIndex < sections.length; secIndex++) {
      const sec = sections[secIndex];
      if (existingSectionIds.has(sec.id)) {
        await supabase
          .from('course_sections')
          .update({ title: sec.title, sort_order: secIndex })
          .eq('id', sec.id);
        sectionDbIdByIndex[secIndex] = sec.id;
      } else {
        const { data: sectionRow, error: sectionError } = await supabase
          .from('course_sections')
          .insert({ course_id: id, title: sec.title, sort_order: secIndex })
          .select('id')
          .single();
        if (sectionError) throw sectionError;
        sectionDbIdByIndex[secIndex] = sectionRow!.id;
      }
    }

    for (let secIndex = 0; secIndex < sections.length; secIndex++) {
      const sec = sections[secIndex];
      const sectionDbId = sectionDbIdByIndex[secIndex];
      const contentBlocks = sec.contentBlocks ?? [];
      for (let i = 0; i < contentBlocks.length; i++) {
        const b = contentBlocks[i];
        const blockPayload = {
          section_id: sectionDbId,
          type: b.type,
          sort_order: i,
          title: b.title ?? null,
          text_content: b.textContent ?? null,
          media_url: b.mediaUrl ?? null,
          media_file_name: b.mediaFileName ?? null,
          youtube_video_id: b.youtubeVideoId ?? null,
          caption: b.caption ?? null,
        };
        if (existingBlockIds.has(b.id)) {
          await supabase.from('course_content_blocks').update(blockPayload).eq('id', b.id).eq('course_id', id);
          if (b.type === 'quiz' && b.quiz) {
            const { data: existingQuiz } = await supabase
              .from('course_quiz_blocks')
              .select('id')
              .eq('content_block_id', b.id)
              .maybeSingle();
            if (existingQuiz) {
              await supabase.from('course_quiz_questions').delete().eq('quiz_block_id', existingQuiz.id);
              await supabase
                .from('course_quiz_blocks')
                .update({ passing_score: b.quiz.passingScore })
                .eq('id', existingQuiz.id);
              for (let qIdx = 0; qIdx < (b.quiz.questions?.length ?? 0); qIdx++) {
                const q = b.quiz.questions![qIdx];
                await supabase.from('course_quiz_questions').insert({
                  quiz_block_id: existingQuiz.id,
                  sort_order: qIdx,
                  question_text: q.questionText,
                  options: q.options,
                  correct_index: q.correctIndex,
                });
              }
            } else {
              const { data: quizRow, error: quizError } = await supabase
                .from('course_quiz_blocks')
                .insert({ content_block_id: b.id, passing_score: b.quiz.passingScore })
                .select('id')
                .single();
              if (!quizError && quizRow && b.quiz.questions?.length) {
                for (let qIdx = 0; qIdx < b.quiz.questions.length; qIdx++) {
                  const q = b.quiz.questions[qIdx];
                  await supabase.from('course_quiz_questions').insert({
                    quiz_block_id: quizRow.id,
                    sort_order: qIdx,
                    question_text: q.questionText,
                    options: q.options,
                    correct_index: q.correctIndex,
                  });
                }
              }
            }
          }
        } else {
          const { data: insertedBlock, error: blockError } = await supabase
            .from('course_content_blocks')
            .insert({
              course_id: id,
              ...blockPayload,
            })
            .select('id')
            .single();
          if (blockError) throw blockError;
          if (insertedBlock && b.type === 'quiz' && b.quiz) {
            const { data: quizRow, error: quizError } = await supabase
              .from('course_quiz_blocks')
              .insert({ content_block_id: insertedBlock.id, passing_score: b.quiz.passingScore })
              .select('id')
              .single();
            if (!quizError && quizRow && b.quiz.questions?.length) {
              for (let qIdx = 0; qIdx < b.quiz.questions.length; qIdx++) {
                const q = b.quiz.questions[qIdx];
                await supabase.from('course_quiz_questions').insert({
                  quiz_block_id: quizRow.id,
                  sort_order: qIdx,
                  question_text: q.questionText,
                  options: q.options,
                  correct_index: q.correctIndex,
                });
              }
            }
          }
        }
      }
    }
    await recalculateEnrollmentProgressForCourse(id);
  }

  return getManagedCourse(id);
}

export async function deleteCourse(id: string): Promise<boolean> {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function updateCourseStatus(id: string, status: CourseStatus): Promise<ManagedCourse | null> {
  return updateCourse(id, { status });
}

// ─── Enrollment Operations ───────────────────────────────────────

export async function getEnrollmentsForCourse(courseId: string): Promise<CourseEnrollment[]> {
  const { data: rows, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  if (!rows?.length) return [];

  const memberIds = [...new Set(rows.map(r => r.member_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', memberIds);
  const profileMap = (profiles ?? []).reduce<Record<string, { name: string; email: string }>>((acc, p) => {
    acc[p.id] = {
      name: [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Unknown',
      email: p.email ?? '',
    };
    return acc;
  }, {});

  return rows.map(r =>
    mapEnrollmentRow(
      r,
      profileMap[r.member_id]?.name,
      profileMap[r.member_id]?.email,
      undefined
    )
  );
}

export async function getEnrollmentsForMember(memberId: string): Promise<(CourseEnrollment & { courseTitle?: string })[]> {
  const { data: rows, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('member_id', memberId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  if (!rows?.length) return [];

  const courseIds = rows.map(r => r.course_id);
  const { data: courseRows } = await supabase.from('courses').select('id, title').in('id', courseIds);
  const titleMap = (courseRows ?? []).reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.title;
    return acc;
  }, {});

  return rows.map(r => ({
    ...mapEnrollmentRow(r, undefined, undefined, titleMap[r.course_id]),
    courseTitle: titleMap[r.course_id],
  }));
}

export async function enrollMember(
  courseId: string,
  memberId: string,
  _memberName: string,
  _memberEmail: string,
  enrolledBy?: string
): Promise<CourseEnrollment | null> {
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (existing) return mapEnrollmentRow(existing);

  const { data: row, error } = await supabase
    .from('course_enrollments')
    .insert({
      course_id: courseId,
      member_id: memberId,
      enrolled_by: enrolledBy ?? null,
      status: 'enrolled',
      progress: 0,
    })
    .select('*')
    .single();
  if (error) throw error;
  return row ? mapEnrollmentRow(row) : null;
}

export async function enrollMultipleMembers(
  courseId: string,
  members: Array<{ id: string; fullName: string; email: string }>,
  enrolledBy?: string
): Promise<CourseEnrollment[]> {
  const created: CourseEnrollment[] = [];
  for (const member of members) {
    const enrollment = await enrollMember(courseId, member.id, member.fullName, member.email, enrolledBy);
    if (enrollment) created.push(enrollment);
  }
  return created;
}

export async function unenrollMember(courseId: string, memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('course_enrollments')
    .delete()
    .eq('course_id', courseId)
    .eq('member_id', memberId);
  if (error) throw error;
  return true;
}

export async function updateEnrollmentProgress(
  courseId: string,
  memberId: string,
  progress: number
): Promise<CourseEnrollment | null> {
  const clamped = Math.min(100, Math.max(0, progress));
  const { data: row, error } = await supabase
    .from('course_enrollments')
    .update({
      progress: clamped,
      ...(clamped > 0 ? { status: 'in_progress' } : {}),
    })
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .select('*')
    .single();
  if (error) throw error;
  return row ? mapEnrollmentRow(row) : null;
}

export async function markEnrollmentCompleted(courseId: string, memberId: string): Promise<CourseEnrollment | null> {
  const { data: row, error } = await supabase
    .from('course_enrollments')
    .update({ status: 'completed', progress: 100, completed_at: new Date().toISOString() })
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .select('*')
    .single();
  if (error) throw error;
  return row ? mapEnrollmentRow(row) : null;
}

export async function getEnrollmentStats(courseId?: string): Promise<{
  total: number;
  enrolled: number;
  inProgress: number;
  completed: number;
}> {
  let query = supabase.from('course_enrollments').select('status');
  if (courseId) query = query.eq('course_id', courseId);
  const { data: rows, error } = await query;
  if (error) throw error;

  const list = (rows ?? []) as { status: string }[];
  return {
    total: list.length,
    enrolled: list.filter(r => r.status === 'enrolled').length,
    inProgress: list.filter(r => r.status === 'in_progress').length,
    completed: list.filter(r => r.status === 'completed').length,
  };
}

// ─── Block completion (per-enrollment) ─────────────────────────────

/** Returns set of block IDs the member has marked complete for this course. */
export async function getCompletedBlockIds(courseId: string, memberId: string): Promise<Set<string>> {
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (enrollError || !enrollment) return new Set();

  const { data: rows, error } = await supabase
    .from('course_enrollment_block_completions')
    .select('block_id')
    .eq('enrollment_id', enrollment.id);
  if (error) return new Set();
  return new Set((rows ?? []).map((r: { block_id: string }) => r.block_id));
}

/**
 * Mark a block as complete for the member's enrollment. Recalculates course progress
 * from completed blocks. Does not auto-complete the course; the user must use the
 * final "Mark as Complete" button to mark the course completed.
 */
export async function markBlockComplete(
  courseId: string,
  memberId: string,
  blockId: string
): Promise<{ enrollment: CourseEnrollment | null; completed: boolean }> {
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (enrollError || !enrollment) return { enrollment: null, completed: false };

  const { error: insertError } = await supabase
    .from('course_enrollment_block_completions')
    .insert({ enrollment_id: enrollment.id, block_id: blockId });

  const isDuplicate = insertError && (
    (insertError as { code?: string }).code === '23505' ||
    String((insertError as { message?: string }).message || '').includes('unique')
  );
  if (insertError && !isDuplicate) {
    return { enrollment: mapEnrollmentRow(enrollment), completed: false };
  }

  const totalBlocks = await countBlocksInCourse(courseId);
  if (totalBlocks === 0) {
    return { enrollment: mapEnrollmentRow(enrollment), completed: true };
  }

  const { count, error: countError } = await supabase
    .from('course_enrollment_block_completions')
    .select('*', { count: 'exact', head: true })
    .eq('enrollment_id', enrollment.id);
  if (countError) return { enrollment: mapEnrollmentRow(enrollment), completed: true };
  const completedCount = count ?? 0;
  const progress = Math.round((100 * completedCount) / totalBlocks);
  const clamped = Math.min(100, progress);

  // Update progress only; never auto-set status to 'completed' or completed_at.
  // User must use the final "Mark as Complete" button to complete the course.
  const updatePayload: { progress: number; status: string } = {
    progress: clamped,
    status: clamped > 0 ? 'in_progress' : 'enrolled',
  };

  const { data: updated, error: updateError } = await supabase
    .from('course_enrollments')
    .update(updatePayload)
    .eq('id', enrollment.id)
    .select('*')
    .single();
  if (updateError) return { enrollment: mapEnrollmentRow(enrollment), completed: true };
  return {
    enrollment: updated ? mapEnrollmentRow(updated) : mapEnrollmentRow(enrollment),
    completed: true,
  };
}

/** Unmark a block as complete; recalculates progress. */
export async function unmarkBlockComplete(
  courseId: string,
  memberId: string,
  blockId: string
): Promise<CourseEnrollment | null> {
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (enrollError || !enrollment) return null;

  await supabase
    .from('course_enrollment_block_completions')
    .delete()
    .eq('enrollment_id', enrollment.id)
    .eq('block_id', blockId);

  const totalBlocks = await countBlocksInCourse(courseId);
  const { count } = await supabase
    .from('course_enrollment_block_completions')
    .select('*', { count: 'exact', head: true })
    .eq('enrollment_id', enrollment.id);
  const completedCount = count ?? 0;
  const progress = totalBlocks === 0 ? 0 : Math.round((100 * completedCount) / totalBlocks);
  const clamped = Math.min(100, Math.max(0, progress));

  const { data: updated } = await supabase
    .from('course_enrollments')
    .update({
      progress: clamped,
      status: clamped > 0 ? 'in_progress' : 'enrolled',
      completed_at: null,
    })
    .eq('id', enrollment.id)
    .select('*')
    .single();
  return updated ? mapEnrollmentRow(updated) : null;
}

async function countBlocksInCourse(courseId: string): Promise<number> {
  const { count, error } = await supabase
    .from('course_content_blocks')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);
  if (error) return 0;
  return count ?? 0;
}

/**
 * Recalculate progress % for all enrollments in a course (e.g. after sections/blocks are added or removed).
 * Progress = (completed blocks / total blocks) * 100. If progress drops below 100, status is set to in_progress
 * and completed_at is cleared.
 */
async function recalculateEnrollmentProgressForCourse(courseId: string): Promise<void> {
  const totalBlocks = await countBlocksInCourse(courseId);
  const { data: enrollments, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId);
  if (enrollError || !enrollments?.length) return;

  for (const enrollment of enrollments) {
    const { count, error: countError } = await supabase
      .from('course_enrollment_block_completions')
      .select('*', { count: 'exact', head: true })
      .eq('enrollment_id', enrollment.id);
    if (countError) continue;
    const completedCount = count ?? 0;
    const progress =
      totalBlocks === 0 ? 0 : Math.round((100 * completedCount) / totalBlocks);
    const clamped = Math.min(100, Math.max(0, progress));

    const payload: { progress: number; status?: string; completed_at?: string | null } = {
      progress: clamped,
    };
    if (clamped < 100) {
      payload.status = clamped > 0 ? 'in_progress' : 'enrolled';
      payload.completed_at = null;
    }

    await supabase.from('course_enrollments').update(payload).eq('id', enrollment.id);
  }
}

// ─── Quiz attempts ───────────────────────────────────────────────────────

export interface QuizAttemptResult {
  correct: number;
  total: number;
  passed: boolean;
}

/** Get existing quiz attempt for a member on a quiz block, if any. */
export async function getQuizAttempt(
  courseId: string,
  memberId: string,
  contentBlockId: string
): Promise<QuizAttemptResult | null> {
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (enrollError || !enrollment) return null;

  const { data: attempt, error } = await supabase
    .from('course_quiz_attempts')
    .select('score, total_questions, passed')
    .eq('enrollment_id', enrollment.id)
    .eq('content_block_id', contentBlockId)
    .maybeSingle();
  if (error || !attempt) return null;
  return {
    correct: attempt.score,
    total: attempt.total_questions,
    passed: attempt.passed,
  };
}

/** Save or update quiz attempt (one attempt per enrollment per quiz block). */
export async function saveQuizAttempt(
  courseId: string,
  memberId: string,
  contentBlockId: string,
  result: QuizAttemptResult
): Promise<boolean> {
  const { data: enrollment, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('member_id', memberId)
    .maybeSingle();
  if (enrollError || !enrollment) return false;

  const { error } = await supabase.from('course_quiz_attempts').upsert(
    {
      enrollment_id: enrollment.id,
      content_block_id: contentBlockId,
      score: result.correct,
      total_questions: result.total,
      passed: result.passed,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'enrollment_id,content_block_id' }
  );
  return !error;
}
