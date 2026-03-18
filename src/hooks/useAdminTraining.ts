import { useState, useEffect, useCallback } from 'react';
import { fetchAllCourses, fetchTrainingStats } from '@/services/learndash';
import { CourseData } from '@/types/learndash';

const CACHE_KEY = 'admin_training_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  courses: CourseData[];
  stats: {
    totalCourses: number;
    avgCompletionRate: number;
  };
  timestamp: number;
}

export function useAdminTraining() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    avgCompletionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadFromCache = useCallback((): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      if (now - cacheData.timestamp < CACHE_DURATION) {
        setLastSync(new Date(cacheData.timestamp));
        return cacheData;
      }
      
      return null;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback((data: CacheData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }, []);

  const fetchData = useCallback(async (useCache = true) => {
    if (useCache) {
      const cached = loadFromCache();
      if (cached) {
        setCourses(cached.courses);
        setStats(cached.stats);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const [coursesData, statsData] = await Promise.all([
        fetchAllCourses(),
        fetchTrainingStats(),
      ]);

      const formattedCourses = coursesData.map(course => ({
        id: course.id,
        title: course.title.rendered.replace(/&#8211;/g, '–').replace(/&#8217;/g, "'"),
        description: (course.excerpt?.rendered || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&#8211;/g, '–')
          .replace(/&#8217;/g, "'")
          .trim(),
        link: course.link,
        progress: 0,
        completed: false,
        completedDate: null,
        stepsTotal: course.meta?._ld_course_steps || 0,
        stepsCompleted: 0,
      }));

      setCourses(formattedCourses);
      setStats(statsData);

      const cacheData: CacheData = {
        courses: formattedCourses,
        stats: statsData,
        timestamp: Date.now(),
      };
      saveToCache(cacheData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch training data';
      setError(errorMessage);
      
      const cached = loadFromCache();
      if (cached) {
        setCourses(cached.courses);
        setStats(cached.stats);
      }
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, saveToCache]);

  const refresh = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    courses,
    stats,
    loading,
    error,
    lastSync,
    refresh,
  };
}
