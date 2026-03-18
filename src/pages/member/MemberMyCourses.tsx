import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CourseEnrollment, ManagedCourse, formatPrice } from '@/types/course';
import { getEnrollmentsForMember, getManagedCourse } from '@/services/courseManagement';

interface EnrolledCourseView {
  enrollment: CourseEnrollment;
  course: ManagedCourse | null;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; badgeVariant: 'default' | 'secondary' | 'outline' }> = {
  enrolled: { label: 'Not Started', icon: Clock, badgeVariant: 'secondary' },
  in_progress: { label: 'In Progress', icon: PlayCircle, badgeVariant: 'default' },
  completed: { label: 'Completed', icon: CheckCircle, badgeVariant: 'outline' },
};

const MemberMyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const enrollments = await getEnrollmentsForMember(user.id);
        const views: EnrolledCourseView[] = await Promise.all(
          enrollments.map(async (e) => ({
            enrollment: e,
            course: await getManagedCourse(e.courseId),
          }))
        );
        setEnrolledCourses(views);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filteredCourses = enrolledCourses.filter(({ course, enrollment }) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (course?.title || '').toLowerCase().includes(q) ||
      (course?.description || '').toLowerCase().includes(q) ||
      (enrollment.courseTitle || '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total: enrolledCourses.length,
    completed: enrolledCourses.filter((c) => c.enrollment.status === 'completed').length,
    inProgress: enrolledCourses.filter((c) => c.enrollment.status === 'in_progress').length,
    notStarted: enrolledCourses.filter((c) => c.enrollment.status === 'enrolled').length,
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Courses you are enrolled in
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold mt-0.5">{stats.total}</p>
                </div>
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold mt-0.5 text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold mt-0.5 text-amber-600">{stats.inProgress}</p>
                </div>
                <PlayCircle className="w-5 h-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Not Started</p>
                  <p className="text-2xl font-bold mt-0.5 text-blue-600">{stats.notStarted}</p>
                </div>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        {enrolledCourses.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Course Cards */}
        {filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-1">
              {enrolledCourses.length === 0
                ? 'No courses yet'
                : 'No matching courses'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center mb-4">
              {enrolledCourses.length === 0
                ? 'Browse the course catalog to enroll in courses and get started.'
                : 'Try a different search term.'}
            </p>
            {enrolledCourses.length === 0 && (
              <Button onClick={() => navigate('/member/courses')}>
                Browse Course Catalog
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map(({ enrollment, course }) => {
              const config = statusConfig[enrollment.status] || statusConfig.enrolled;
              const __StatusIcon = config.icon; void __StatusIcon;
              const courseTitle = course?.title || enrollment.courseTitle || 'Unknown Course';

              return (
                <Card
                  key={enrollment.id}
                  className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/member/courses/${enrollment.courseId}`)}
                >
                  {course?.thumbnailUrl && (
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
                      <CardTitle className="text-base line-clamp-2">{courseTitle}</CardTitle>
                      <Badge variant={config.badgeVariant} className="shrink-0 text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    {course?.description && (
                      <CardDescription className="line-clamp-2 text-xs">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress
                          value={enrollment.progress}
                          className="h-1.5"
                          indicatorClassName={
                            enrollment.progress >= 75
                              ? 'bg-green-500 dark:bg-green-400'
                              : enrollment.progress >= 50
                                ? 'bg-blue-500 dark:bg-blue-400'
                                : enrollment.progress >= 25
                                  ? 'bg-amber-500 dark:bg-amber-400'
                                  : 'bg-red-500 dark:bg-red-400'
                          }
                        />
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {course && (
                            <>
                              <span className="capitalize">{course.category}</span>
                              <span>{course.estimatedDurationMinutes} min</span>
                            </>
                          )}
                        </div>
                        {course && !course.isFree && (
                          <Badge variant="outline" className="text-xs">
                            {formatPrice(course.price, course.currency)}
                          </Badge>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        variant={enrollment.status === 'completed' ? 'outline' : 'default'}
                        size="sm"
                        className="w-full gap-1.5 mt-1"
                      >
                        {enrollment.status === 'completed' ? (
                          'Review Course'
                        ) : enrollment.status === 'in_progress' ? (
                          <>
                            Continue
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Start Course
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
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

export default MemberMyCourses;
