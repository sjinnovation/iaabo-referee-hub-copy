import { LEARNDASH_CONFIG, getAuthHeader } from '@/config/learndash';
import { LearnDashCourse, LearnDashCourseProgress, CourseData } from '@/types/learndash';

const TIMEOUT_MS = 10000;

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export const fetchUserCourses = async (userId: number): Promise<LearnDashCourse[]> => {
  try {
    const url = `${LEARNDASH_CONFIG.baseUrl}/users/${userId}/courses`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw error;
  }
};

export const fetchCourseProgress = async (
  userId: number,
  courseId: number
): Promise<LearnDashCourseProgress | null> => {
  try {
    const url = `${LEARNDASH_CONFIG.baseUrl}/users/${userId}/course-progress/${courseId}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch progress: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return null;
  }
};

export const fetchCourseDetails = async (courseId: number): Promise<LearnDashCourse | null> => {
  try {
    const url = `${LEARNDASH_CONFIG.baseUrl}/sfwd-courses/${courseId}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course details: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching course details:', error);
    return null;
  }
};

export const fetchUserCoursesWithProgress = async (userId: number): Promise<CourseData[]> => {
  try {
    const courses = await fetchUserCourses(userId);
    
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await fetchCourseProgress(userId, course.id);
        
        const percentage = progress && progress.steps_total > 0
          ? Math.round((progress.steps_completed / progress.steps_total) * 100)
          : 0;
        
        return {
          id: course.id,
          title: course.title.rendered.replace(/&#8211;/g, '–').replace(/&#8217;/g, "'"),
          description: (course.excerpt?.rendered || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&#8211;/g, '–')
            .replace(/&#8217;/g, "'")
            .trim(),
          link: course.link,
          progress: percentage,
          completed: progress?.progress_status === 'completed',
          completedDate: progress?.date_completed || null,
          stepsTotal: progress?.steps_total || 0,
          stepsCompleted: progress?.steps_completed || 0,
        };
      })
    );
    
    return coursesWithProgress;
  } catch (error) {
    console.error('Error fetching courses with progress:', error);
    throw error;
  }
};

// Fetch all courses (not user-specific)
export const fetchAllCourses = async (): Promise<LearnDashCourse[]> => {
  try {
    const url = `${LEARNDASH_CONFIG.baseUrl}/sfwd-courses`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch all courses: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
};

// Fetch LearnDash user by email
export const fetchUserByEmail = async (email: string): Promise<any | null> => {
  try {
    const url = `${LEARNDASH_CONFIG.siteUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    
    const data = await response.json();
    const users = Array.isArray(data) ? data : [];
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

// Fetch training statistics
export const fetchTrainingStats = async (): Promise<{
  totalCourses: number;
  avgCompletionRate: number;
}> => {
  try {
    const courses = await fetchAllCourses();
    
    return {
      totalCourses: courses.length,
      avgCompletionRate: 0, // Would need to aggregate across all users
    };
  } catch (error) {
    console.error('Error fetching training stats:', error);
    throw error;
  }
};

// Enroll user in course (Note: LearnDash API may not support this directly)
export const enrollUserInCourse = async (userId: number, courseId: number): Promise<boolean> => {
  try {
    // This would require custom endpoint or different approach
    console.log(`Enrolling user ${userId} in course ${courseId}`);
    return true;
  } catch (error) {
    console.error('Error enrolling user in course:', error);
    return false;
  }
};
