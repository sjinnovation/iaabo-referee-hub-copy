export type EmbeddedCourseStatus = 'enrolled' | 'in_progress' | 'completed';

export interface EmbeddedCourse {
  id: string;
  title: string;
  description: string;
  folderSlug: string;
  iaaboCourseId?: string | null;
  isActive: boolean;
  /** When true, content is served from Supabase Storage; when false, from public/embedded-courses/ */
  contentInStorage: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  /** Optional per-course certificate template image URL. Falls back to global template when null. */
  certificateTemplateUrl?: string | null;
  /** Optional per-course member name X position (percent of width). */
  certificateMemberNameXPercent?: number | null;
  /** Optional per-course member name Y position (percent of height). */
  certificateMemberNameYPercent?: number | null;
  /** Optional per-course course title X position (percent of width). */
  certificateCourseTitleXPercent?: number | null;
  /** Optional per-course course title Y position (percent of height). */
  certificateCourseTitleYPercent?: number | null;
  /** Optional per-course member name font size in px (admin preview scale). */
  certificateMemberNameFontSizePx?: number | null;
  /** Optional per-course course title font size in px (admin preview scale). */
  certificateCourseTitleFontSizePx?: number | null;
}

export interface EmbeddedCourseEnrollment {
  id: string;
  embeddedCourseId: string;
  memberId: string;
  status: EmbeddedCourseStatus;
  enrolledAt: string;
  completedAt: string | null;
}

/** Enrollment with member display info for admin list. */
export interface EmbeddedCourseEnrollmentWithMember extends EmbeddedCourseEnrollment {
  memberName?: string;
  memberEmail?: string;
}

/** One quiz-slide result row from embedded_course_quiz_results. */
export interface EmbeddedCourseQuizResult {
  id: string;
  enrollmentId: string;
  embeddedCourseId: string;
  memberId: string;
  slideTitle: string | null;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
  submittedAt: string;
}

/** Base URL for embedded course content (res/index.html) when served from public folder. */
export function getEmbeddedCoursePublicContentUrl(folderSlug: string): string {
  return `/embedded-courses/${encodeURIComponent(folderSlug)}/res/index.html`;
}
