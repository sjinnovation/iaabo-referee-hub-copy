import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, ArrowRight, CheckCircle, FolderOpen, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { EmbeddedCourse, EmbeddedCourseEnrollment } from '@/types/embeddedCourse';
import {
  getActiveEmbeddedCourses,
  getEmbeddedEnrollmentsForMember,
  enrollInEmbeddedCourse,
} from '@/services/embeddedCourses';
import { getCertificateTemplateForMember } from '@/services/certificateTemplate';
import { generateCertificatePng, downloadBlob } from '@/utils/certificateGenerator';

const MemberEmbeddedCourseCatalog = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<EmbeddedCourse[]>([]);
  const [enrollmentsByCourseId, setEnrollmentsByCourseId] = useState<Record<string, EmbeddedCourseEnrollment>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [certificateDownloadingId, setCertificateDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [list, enrollments] = await Promise.all([
          getActiveEmbeddedCourses(),
          user ? getEmbeddedEnrollmentsForMember(user.id) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setCourses(list);
          const byCourse: Record<string, EmbeddedCourseEnrollment> = {};
          enrollments.forEach((e) => {
            byCourse[e.embeddedCourseId] = e;
          });
          setEnrollmentsByCourseId(byCourse);
        }
      } catch {
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
  });

  const handleEnroll = async (course: EmbeddedCourse) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be signed in to enroll.', variant: 'destructive' });
      return;
    }
    setEnrollingId(course.id);
    try {
      const enrollment = await enrollInEmbeddedCourse(course.id, user.id);
      setEnrollmentsByCourseId((prev) => ({ ...prev, [course.id]: enrollment }));
      toast({ title: 'Enrolled', description: `You are enrolled in "${course.title}".` });
      navigate(`/member/embedded-courses/${course.id}`);
    } catch {
      toast({ title: 'Error', description: 'Failed to enroll.', variant: 'destructive' });
    } finally {
      setEnrollingId(null);
    }
  };

  const handleDownloadCertificate = async (course: EmbeddedCourse) => {
    if (!profile) return;
    setCertificateDownloadingId(course.id);
    try {
      const globalTemplate = await getCertificateTemplateForMember();

      const hasPerCourseTemplate =
        !!course.certificateTemplateUrl &&
        course.certificateMemberNameXPercent != null &&
        course.certificateMemberNameYPercent != null &&
        course.certificateCourseTitleXPercent != null &&
        course.certificateCourseTitleYPercent != null &&
        course.certificateMemberNameFontSizePx != null &&
        course.certificateCourseTitleFontSizePx != null;

      const templateToUse = hasPerCourseTemplate
        ? {
            templateUrl: course.certificateTemplateUrl,
            memberNameXPercent: Number(course.certificateMemberNameXPercent),
            memberNameYPercent: Number(course.certificateMemberNameYPercent),
            courseTitleXPercent: Number(course.certificateCourseTitleXPercent),
            courseTitleYPercent: Number(course.certificateCourseTitleYPercent),
            memberNameFontSizePx: Number(course.certificateMemberNameFontSizePx),
            courseTitleFontSizePx: Number(course.certificateCourseTitleFontSizePx),
          }
        : globalTemplate;

      if (!templateToUse?.templateUrl) {
        toast({
          title: 'Certificate not available',
          description: 'No certificate template has been set up yet. Please contact your administrator.',
          variant: 'destructive',
        });
        return;
      }
      const memberName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Member';
      const blob = await generateCertificatePng({
        template: templateToUse,
        memberName,
        courseTitle: course.title,
      });
      const safeTitle = course.title.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60);
      const safeName = memberName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40);
      downloadBlob(blob, `IAABO-Certificate-${safeTitle}-${safeName}.png`);
      toast({ title: 'Certificate downloaded successfully' });
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Failed to generate certificate.',
        variant: 'destructive',
      });
    } finally {
      setCertificateDownloadingId(null);
    }
  };

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embedded Courses</h1>
          <p className="text-muted-foreground mt-1">
            Browse and complete these interactive courses. Each runs in your browser.
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
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FolderOpen className="h-20 w-20 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-xl mb-1">
              {courses.length === 0 ? 'No embedded courses available' : 'No matching courses'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm text-center">
              {courses.length === 0
                ? 'Check back later for new courses.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const enrollment = enrollmentsByCourseId[course.id];
              const isEnrolled = !!enrollment;
              const isCompleted = enrollment?.status === 'completed';
              const completedAt = enrollment?.completedAt;
              return (
                <Card
                  key={course.id}
                  className="group hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="h-36 rounded-t-lg bg-muted flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                      {isCompleted && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </Badge>
                      )}
                      {isEnrolled && !isCompleted && (
                        <Badge variant="outline" className="shrink-0">Enrolled</Badge>
                      )}
                    </div>
                    {isCompleted && completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Completed on {new Date(completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    {course.description && (
                      <CardDescription className="line-clamp-2 text-xs">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto space-y-3">
                    {isEnrolled ? (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => navigate(`/member/embedded-courses/${course.id}`)}
                        >
                          {isCompleted ? 'Review Course' : 'Continue'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                        {isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Download certificate"
                            disabled={certificateDownloadingId === course.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadCertificate(course);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full gap-1.5"
                        disabled={enrollingId === course.id}
                        onClick={() => handleEnroll(course)}
                      >
                        {enrollingId === course.id ? 'Enrolling…' : 'Enroll'}
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

export default MemberEmbeddedCourseCatalog;
