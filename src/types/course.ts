export type ContentBlockType = 'text' | 'video' | 'audio' | 'youtube_embed' | 'embed' | 'drive_url' | 'quiz';

export type CourseCategory = 'rules' | 'mechanics' | 'academy' | 'seminars' | 'custom';

/** A single MCQ question in a quiz block. */
export interface QuizQuestion {
  id?: string;
  questionText: string;
  options: string[];
  correctIndex: number;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed';

export interface ContentBlock {
  id: string;
  courseId?: string;
  sectionId?: string;
  type: ContentBlockType;
  sortOrder: number;
  /** Display title for the block (e.g. "IAABO Rules Guide"). Shown in course outline. */
  title?: string;
  textContent?: string;
  mediaUrl?: string;
  /** Original file name for uploaded media (e.g. video); shown in editor instead of storage URL */
  mediaFileName?: string;
  youtubeVideoId?: string;
  caption?: string;
  createdAt?: string;
  /** Quiz config (only when type === 'quiz'). */
  quiz?: {
    passingScore: number;
    questions: QuizQuestion[];
  };
}

/** Get the display title for a content block (for outline and accordion headers). */
export function getBlockDisplayTitle(block: ContentBlock): string {
  if (block.title && block.title.trim()) return block.title.trim();
  if (block.caption && block.caption.trim()) return block.caption.trim();
  const labels: Record<ContentBlockType, string> = {
    text: 'Text',
    video: 'Video',
    audio: 'Audio',
    youtube_embed: 'YouTube',
    embed: 'Embed',
    drive_url: 'Drive URL',
    quiz: 'Quiz',
  };
  return labels[block.type] ?? 'Content';
}

/** A section (lesson) within a course, containing topics/content and optional quiz. */
export interface CourseSection {
  id: string;
  title: string;
  sortOrder: number;
  contentBlocks: ContentBlock[];
}

export interface ManagedCourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  status: CourseStatus;
  thumbnailUrl?: string;
  isRequired: boolean;
  isFree: boolean;
  price: number;
  currency: string;
  seasonYear: string;
  courseDate?: string;
  estimatedDurationMinutes: number;
  createdBy?: string;
  learndashCourseId?: number;
  createdAt: string;
  updatedAt: string;
  /** Section-based content (preferred). Each section has its own content blocks. */
  sections?: CourseSection[];
  /** Legacy flat content blocks; used when sections are empty for backward compatibility. */
  contentBlocks?: ContentBlock[];
  enrollmentCount?: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  memberId: string;
  enrolledBy?: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  memberName?: string;
  memberEmail?: string;
  courseTitle?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: CourseCategory;
  status: CourseStatus;
  thumbnailUrl: string;
  isRequired: boolean;
  isFree: boolean;
  price: number;
  currency: string;
  seasonYear: string;
  courseDate?: string;
  estimatedDurationMinutes: number;
  /** Section-based content. Each section has a title and content blocks. */
  sections: CourseSection[];
}

export const COURSE_CATEGORIES: { value: CourseCategory; label: string }[] = [
  { value: 'rules', label: 'Rules' },
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'academy', label: 'Academy' },
  { value: 'seminars', label: 'Seminars' },
  { value: 'custom', label: 'Custom' },
];

export const CONTENT_BLOCK_TYPES: { value: ContentBlockType; label: string; icon: string }[] = [
  { value: 'text', label: 'Text', icon: 'FileText' },
  { value: 'video', label: 'Video', icon: 'Video' },
  { value: 'audio', label: 'Audio', icon: 'Headphones' },
  { value: 'youtube_embed', label: 'YouTube', icon: 'Youtube' },
  { value: 'embed', label: 'Embed', icon: 'Code' },
  { value: 'drive_url', label: 'Drive URL', icon: 'HardDrive' },
  { value: 'quiz', label: 'Quiz (MCQ)', icon: 'HelpCircle' },
];

export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
