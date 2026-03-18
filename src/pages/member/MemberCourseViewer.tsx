import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
  Download,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ManagedCourse, CourseEnrollment, ContentBlock, getBlockDisplayTitle, formatPrice } from '@/types/course';
import {
  getManagedCourse,
  getEnrollmentsForMember,
  getCompletedBlockIds,
  markEnrollmentCompleted,
  enrollMember,
} from '@/services/courseManagement';
import { getCertificateTemplateForMember } from '@/services/certificateTemplate';
import { generateCertificatePng, downloadBlob } from '@/utils/certificateGenerator';

/** Progress bar fill color by percentage (0–100). */
function getProgressBarColor(progress: number): string {
  if (progress >= 75) return 'bg-green-500 dark:bg-green-400';
  if (progress >= 50) return 'bg-blue-500 dark:bg-blue-400';
  if (progress >= 25) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

/** Enrolled view: block title links to detail page; shows checkmark when complete. */
function BlockTitleLink({
  courseId,
  block,
  isCompleted,
}: {
  courseId: string;
  block: ContentBlock;
  isCompleted: boolean;
}) {
  const title = getBlockDisplayTitle(block);
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/member/courses/${courseId}/block/${block.id}`)}
      className="flex w-full items-center gap-3 py-3.5 px-4 text-left text-sm font-medium rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all shadow-sm hover:shadow mb-2 group"
    >
      {isCompleted ? (
        <div className="h-9 w-9 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0 ring-2 ring-green-500/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      ) : (
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <ChevronRight className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
        {block.type === 'quiz' ? (
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        ) : (
          <FileText className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <span className="flex-1 truncate">{title}</span>
    </button>
  );
}

const MemberCourseViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<ManagedCourse | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [certificateDownloading, setCertificateDownloading] = useState(false);
  const [completedBlockIds, setCompletedBlockIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [courseData, enrollments, completedIds] = await Promise.all([
          getManagedCourse(id),
          getEnrollmentsForMember(user.id),
          getCompletedBlockIds(id, user.id),
        ]);
        if (cancelled) return;
        setCourse(courseData);
        const found = enrollments.find((e) => e.courseId === id) || null;
        setEnrollment(found);
        setCompletedBlockIds(completedIds);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, user]);

  const handleMarkComplete = async () => {
    if (!id || !user) return;
    try {
      const updated = await markEnrollmentCompleted(id, user.id);
      if (updated) {
        setEnrollment(updated);
        toast({
          title: 'Course Completed!',
          description: 'Congratulations on completing this course.',
        });
      }
      setCompleteDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to update completion.', variant: 'destructive' });
    }
  };

  const handleDownloadCertificate = async () => {
    if (!profile || !course) return;
    setCertificateDownloading(true);
    try {
      const certTemplate = await getCertificateTemplateForMember();
      if (!certTemplate?.templateUrl) {
        toast({
          title: 'Certificate not available',
          description: 'No certificate template has been set up yet. Please contact your administrator.',
          variant: 'destructive',
        });
        return;
      }
      const memberName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Member';
      const courseTitle = course.title;
      const blob = await generateCertificatePng({
        template: certTemplate,
        memberName,
        courseTitle,
      });
      const safeTitle = courseTitle.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60);
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
      setCertificateDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading course...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">This course doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/member/my-courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Not enrolled: show course header + outline (section names + block titles only), content locked
  if (!enrollment) {
    const sections = (course.sections || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const handleEnrollHere = async () => {
      if (!user || !profile) return;
      setEnrolling(true);
      try {
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Member';
        const created = await enrollMember(course.id, user.id, fullName, profile.email, undefined);
        if (created) {
          setEnrollment(created);
          toast({ title: 'Enrolled', description: `You are now enrolled in "${course.title}".` });
        } else {
          toast({ title: 'Already enrolled', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to enroll.', variant: 'destructive' });
      } finally {
        setEnrolling(false);
      }
    };
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden shadow-sm">
            <div className="p-6 pb-4">
              <div className="flex items-start gap-3">
                <Button variant="outline" size="icon" onClick={() => navigate('/member/courses')} className="shrink-0 rounded-lg">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
                  {course.description && <p className="text-muted-foreground mt-1.5">{course.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{course.category}</Badge>
                    <span>{course.estimatedDurationMinutes} min</span>
                    {!course.isFree && <Badge variant="secondary">{formatPrice(course.price, course.currency)}</Badge>}
                  </div>
                </div>
              </div>
            </div>
            {course.thumbnailUrl && (
              <img src={course.thumbnailUrl} alt="" className="w-full h-48 lg:h-64 object-cover ring-1 ring-border/50" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}} />
            )}
          </div>

          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Course Content</CardTitle>
              <CardDescription className="sr-only">Section and topic outline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              {sections.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  This course has no content yet.
                </div>
              ) : sections.map((section) => {
                const blocks = (section.contentBlocks || []).sort((a, b) => a.sortOrder - b.sortOrder);
                const topicCount = blocks.length;
                return (
                  <Collapsible key={section.id} defaultOpen={section.sortOrder === 0} className="group/section">
                    <div className="border-b last:border-b-0">
                      <CollapsibleTrigger className="flex w-full items-center justify-between py-4 px-4 text-left font-medium hover:bg-muted/30 transition-colors">
                        <span>{section.title}</span>
                        <span className="text-muted-foreground font-normal text-sm">{topicCount} Topic{topicCount !== 1 ? 's' : ''}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/section:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pb-4 pl-4 pr-4 space-y-1 bg-muted/10">
                          <div className="text-xs text-muted-foreground mb-2 px-1">Lesson Content</div>
                          {blocks.map((block) => (
                            <div key={block.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm text-muted-foreground">
                              <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                {block.type === 'quiz' ? <HelpCircle className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                              </div>
                              <span className="flex-1 truncate">{getBlockDisplayTitle(block)}</span>
                              <Lock className="w-4 h-4 shrink-0 opacity-60" />
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>

          <Alert className="rounded-xl border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You need to enroll to view the content inside each topic. Enroll in this course to get access.
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/member/my-courses')} className="rounded-lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              My Courses
            </Button>
            <Button onClick={handleEnrollHere} disabled={enrolling} className="rounded-lg shadow-sm">
              {enrolling ? 'Enrolling…' : 'Enroll in this course'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/member/courses')} className="rounded-lg">
              Browse Catalog
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isCompleted = enrollment.status === 'completed';
  const sections = (course.sections || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const hasContent = sections.some((s) => (s.contentBlocks?.length ?? 0) > 0);
  const allBlockIds = sections.flatMap((s) => (s.contentBlocks ?? []).map((b) => b.id));
  const allTopicsCompleted =
    allBlockIds.length > 0 && allBlockIds.every((blockId) => completedBlockIds.has(blockId));

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header + thumbnail in one card */}
        <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden shadow-sm">
          <div className="p-6 pb-4">
            <div className="flex items-start gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/member/my-courses')}
                className="shrink-0 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
                    {course.description && (
                      <p className="text-muted-foreground mt-1.5">{course.description}</p>
                    )}
                  </div>
                  {isCompleted && (
                    <Badge className="bg-green-600 text-white shrink-0 gap-1.5 rounded-lg px-2.5 py-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                  <Badge variant="outline" className="capitalize">{course.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.estimatedDurationMinutes} min
                  </div>
                  {course.isRequired && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  {!course.isFree && (
                    <Badge variant="secondary">{formatPrice(course.price, course.currency)}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          {course.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-48 lg:h-64 object-cover ring-1 ring-border/50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground font-medium">Your Progress</span>
                <span className="font-semibold tabular-nums">{enrollment.progress}%</span>
              </div>
              <Progress
                value={enrollment.progress}
                className="h-3 rounded-full"
                indicatorClassName={getProgressBarColor(enrollment.progress)}
              />
            </CardContent>
          </Card>
        )}

        {/* Completed Banner */}
        {isCompleted && (
          <Card className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 dark:border-green-800 shadow-sm overflow-hidden">
            <CardContent className="py-5 px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center ring-2 ring-green-500/30">
                    <Award className="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      You completed this course
                    </p>
                    {enrollment.completedAt && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                        Completed on {new Date(enrollment.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleDownloadCertificate}
                  disabled={certificateDownloading}
                  variant="outline"
                  className="border-green-300 bg-white hover:bg-green-50 dark:bg-green-950/30 dark:border-green-700 dark:hover:bg-green-900/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {certificateDownloading ? 'Generating…' : 'Download Certificate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Content: sections expandable, block titles click to open content */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Course Content</CardTitle>
            <CardDescription className="mt-0.5">Work through each topic to complete the course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {!hasContent ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">This course has no content yet.</p>
              </div>
            ) : (
              sections.map((section) => {
                const blocks = (section.contentBlocks || []).sort((a, b) => a.sortOrder - b.sortOrder);
                return (
                  <Collapsible key={section.id} defaultOpen={section.sortOrder === 0} className="group/section">
                    <div className="border-b last:border-b-0">
                      <CollapsibleTrigger className="flex w-full items-center justify-between py-4 px-4 text-left font-medium hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/20">
                        <span>{section.title}</span>
                        <span className="text-muted-foreground font-normal text-sm">
                          {blocks.length} Topic{blocks.length !== 1 ? 's' : ''}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/section:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pb-4 pt-1 px-4 bg-muted/5">
                          <div className="text-xs text-muted-foreground mb-3 px-1 font-medium">Lesson Content</div>
                          {blocks.map((block) => (
                            <BlockTitleLink
                              key={block.id}
                              courseId={id!}
                              block={block}
                              isCompleted={completedBlockIds.has(block.id)}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Mark Complete Button — only enabled when all topics are completed */}
        {!isCompleted && (
          <div className="flex flex-col items-center gap-2 pb-8">
            {!allTopicsCompleted && allBlockIds.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Complete all {allBlockIds.length} topic{allBlockIds.length !== 1 ? 's' : ''} above to unlock &quot;Mark as Complete&quot;.
              </p>
            )}
            <Button
              size="lg"
              onClick={() => setCompleteDialogOpen(true)}
              disabled={!allTopicsCompleted}
              className="gap-2 px-8 rounded-xl shadow-md"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Complete
            </Button>
          </div>
        )}
      </div>

      {/* Complete Confirmation */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you've finished all the course material? This will mark the course
              as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkComplete}>
              Yes, Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default MemberCourseViewer;
