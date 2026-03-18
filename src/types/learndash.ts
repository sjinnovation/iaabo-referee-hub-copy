export interface LearnDashCourse {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  link: string;
  status: string;
  meta?: {
    _ld_course_steps?: number;
  };
}

export interface LearnDashCourseProgress {
  course: number;
  steps_total: number;
  steps_completed: number;
  progress_status: string;
  date_completed?: string;
  date_started?: string;
  last_step?: number;
}

export interface LearnDashUserCourse extends LearnDashCourse {
  progress?: LearnDashCourseProgress;
}

export interface CourseData {
  id: number;
  title: string;
  description: string;
  link: string;
  progress: number;
  completed: boolean;
  completedDate: string | null;
  stepsTotal: number;
  stepsCompleted: number;
}

export interface LearnDashUser {
  id: number;
  name: string;
  email: string;
  registered: string;
}

export interface TrainingStats {
  totalCourses: number;
  totalEnrollments: number;
  avgCompletionRate: number;
  coursesByCompletion: Array<{
    courseTitle: string;
    enrolled: number;
    completed: number;
    completionRate: number;
  }>;
}
