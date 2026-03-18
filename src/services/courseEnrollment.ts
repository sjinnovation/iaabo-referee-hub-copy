import { enrollUserInCourse } from './learndash';

// Map progression stages to course requirements
const STAGE_COURSE_MAP: Record<string, number[]> = {
  'new': [], // Rules Test course ID would go here
  'rules-test': [], // Mechanics Course ID would go here
  'mechanics-course': [],
  'board-assigned': [],
  'active': [],
};

// Enroll member in required courses based on progression stage
export const enrollInRequiredCourses = async (
  learndashUserId: number,
  progressionStage: string
): Promise<{ success: boolean; enrolled: number[] }> => {
  const courseIds = STAGE_COURSE_MAP[progressionStage] || [];
  const enrolled: number[] = [];

  for (const courseId of courseIds) {
    try {
      const success = await enrollUserInCourse(learndashUserId, courseId);
      if (success) {
        enrolled.push(courseId);
      }
    } catch (error) {
      console.error(`Failed to enroll in course ${courseId}:`, error);
    }
  }

  return {
    success: enrolled.length === courseIds.length,
    enrolled,
  };
};

// Get recommended next course based on progression stage
export const getRecommendedCourse = (progressionStage: string): string | null => {
  switch (progressionStage) {
    case 'new':
      return 'IAABO University Rules Test';
    case 'rules-test':
      return 'Mechanics Course';
    case 'mechanics-course':
      return 'Advanced Officiating';
    default:
      return null;
  }
};
