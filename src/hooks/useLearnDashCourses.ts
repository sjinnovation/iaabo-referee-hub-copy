import { useState, useEffect, useCallback } from 'react';
import { fetchUserCoursesWithProgress } from '@/services/learndash';
import { CourseData } from '@/types/learndash';

const CACHE_KEY = 'learndash_courses_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  data: CourseData[];
  timestamp: number;
}

export function useLearnDashCourses(learndashUserId?: number) {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const loadFromCache = useCallback((): CourseData[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      if (now - cacheData.timestamp < CACHE_DURATION) {
        setLastSync(new Date(cacheData.timestamp));
        return cacheData.data;
      }
      
      return null;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback((data: CourseData[]) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }, []);

  const fetchCourses = useCallback(async (useCache = true) => {
    if (!learndashUserId) {
      setLoading(false);
      return;
    }

    // Try loading from cache first
    if (useCache) {
      const cached = loadFromCache();
      if (cached) {
        setCourses(cached);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserCoursesWithProgress(learndashUserId);
      setCourses(data);
      saveToCache(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      
      // Try to use cached data on error
      const cached = loadFromCache();
      if (cached) {
        setCourses(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [learndashUserId, loadFromCache, saveToCache]);

  const refresh = useCallback(() => {
    return fetchCourses(false);
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses(true);

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchCourses(false);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    lastSync,
    refresh,
  };
}
