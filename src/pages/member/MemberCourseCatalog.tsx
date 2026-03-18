import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ManagedCourse, formatPrice } from '@/types/course';
import { getPublishedCourses, getEnrollmentsForMember, enrollMember } from '@/services/courseManagement';
import { toast } from '@/hooks/use-toast';

const MemberCourseCatalog = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [published, enrollments] = await Promise.all([
          getPublishedCourses(),
          user ? getEnrollmentsForMember(user.id) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setCourses(published);
          setEnrolledIds(new Set(enrollments.map((e) => e.courseId)));
        }
      } catch {
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      (course.description || '').toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q)
    );
  });

  const handleEnroll = async (course: ManagedCourse) => {
    if (!user || !profile) {
      toast({ title: 'Error', description: 'You must be signed in to enroll.', variant: 'destructive' });
      return;
    }
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Member';
    setEnrollingId(course.id);
    try {
      await enrollMember(course.id, user.id, fullName, profile.email, undefined);
      setEnrolledIds((prev) => new Set(prev).add(course.id));
      toast({
        title: 'Enrolled',
        description: `You are now enrolled in "${course.title}".`,
      });
      navigate(`/member/courses/${course.id}`);
    } catch {
      toast({ title: 'Error', description: 'Failed to enroll in course.', variant: 'destructive' });
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Browse available courses and enroll to get started
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-1">
              {courses.length === 0 ? 'No courses available' : 'No matching courses'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              {courses.length === 0
                ? 'There are no published courses yet. Check back later.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);
              return (
                <Card
                  key={course.id}
                  className="group hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {course.thumbnailUrl && (
                    <div className="h-36 overflow-hidden rounded-t-lg">
                      <img
                        src={course.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                      {isEnrolled && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Enrolled
                        </Badge>
                      )}
                    </div>
                    {course.description && (
                      <CardDescription className="line-clamp-2 text-xs">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{course.category}</span>
                      <span>{course.estimatedDurationMinutes} min</span>
                      {!course.isFree && (
                        <Badge variant="outline" className="text-xs">
                          {formatPrice(course.price, course.currency)}
                        </Badge>
                      )}
                    </div>
                    {isEnrolled ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => navigate(`/member/courses/${course.id}`)}
                      >
                        Open Course
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full gap-1.5"
                        disabled={enrollingId === course.id}
                        onClick={() => handleEnroll(course)}
                      >
                        {enrollingId === course.id ? 'Enrolling…' : 'Enroll in this course'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberCourseCatalog;
