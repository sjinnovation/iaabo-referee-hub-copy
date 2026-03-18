import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentBlockRenderer } from '@/components/admin/ContentBlockRenderer';
import { ArrowLeft, BookOpen, FileText, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { ManagedCourse, ContentBlock, getBlockDisplayTitle } from '@/types/course';
import {
  getManagedCourse,
  getEnrollmentsForMember,
  getCompletedBlockIds,
  markBlockComplete,
  getQuizAttempt,
  saveQuizAttempt,
} from '@/services/courseManagement';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/** Detail page for a single content block: shows block title and full content. */
const MemberCourseBlockView = () => {
  const navigate = useNavigate();
  const { id: courseId, blockId } = useParams<{ id: string; blockId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<ManagedCourse | null>(null);
  const [block, setBlock] = useState<ContentBlock | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState<{ correct: number; total: number; passed: boolean } | null | undefined>(undefined);

  useEffect(() => {
    if (!courseId || !blockId || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [courseData, enrollments, completedIds] = await Promise.all([
          getManagedCourse(courseId),
          getEnrollmentsForMember(user.id),
          getCompletedBlockIds(courseId, user.id),
        ]);
        if (cancelled) return;
        setCourse(courseData);
        const enrolled = enrollments.some((e) => e.courseId === courseId);
        setHasAccess(!!enrolled);
        setIsCompleted(completedIds.has(blockId));

        const sections = (courseData?.sections || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
        for (const section of sections) {
          const blocks = (section.contentBlocks || []).sort((a, b) => a.sortOrder - b.sortOrder);
          const found = blocks.find((b) => b.id === blockId);
          if (found) {
            setBlock(found);
            setSectionTitle(section.title);
            if (found.type === 'quiz') {
              const attempt = await getQuizAttempt(courseId, user.id, blockId);
              if (!cancelled) setQuizAttempt(attempt ?? null);
            } else {
              if (!cancelled) setQuizAttempt(undefined);
            }
            break;
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, blockId, user]);

  const handleMarkComplete = async () => {
    if (!courseId || !blockId || !user) return;
    setMarkingComplete(true);
    try {
      const { completed } = await markBlockComplete(courseId, user.id, blockId);
      if (completed) {
        setIsCompleted(true);
        toast({ title: 'Topic completed', description: 'Your progress has been updated.' });
      } else {
        toast({
          title: 'Could not mark complete',
          description: 'You may need to be enrolled, or the topic may have been removed.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not mark topic as complete.', variant: 'destructive' });
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading topic...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course || !block) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="flex flex-col items-center justify-center py-20 max-w-4xl mx-auto">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Topic Not Found</h2>
          <p className="text-muted-foreground mb-4">This topic doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(courseId ? `/member/courses/${courseId}` : '/member/my-courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="flex flex-col items-center justify-center py-20 max-w-4xl mx-auto">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Enroll to View</h2>
          <p className="text-muted-foreground mb-4">You need to be enrolled in this course to view topic content.</p>
          <Button onClick={() => navigate(`/member/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const displayTitle = getBlockDisplayTitle(block);

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Block title hero header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-primary/60" />
          <div className="relative pl-6 pr-6 py-6 sm:py-8">
            <div className="flex items-start gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/member/courses/${courseId}`)}
                className="shrink-0 rounded-xl h-11 w-11 border-2 hover:bg-primary/10 hover:border-primary/40 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/member/courses/${courseId}`)}
                    className="hover:text-foreground transition-colors truncate max-w-[180px] sm:max-w-none"
                  >
                    {course.title}
                  </button>
                  {sectionTitle && (
                    <>
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/70" />
                      <span className="truncate font-medium text-foreground/80">{sectionTitle}</span>
                    </>
                  )}
                </nav>
                {/* Block title + icon */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 ring-2 ring-primary/25 shadow-inner">
                    {block.type === 'quiz' ? (
                      <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    ) : (
                      <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                    {displayTitle}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-base sr-only">Content</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="rounded-lg">
              <ContentBlockRenderer
                block={block}
                quizAttempt={block.type === 'quiz' ? quizAttempt : undefined}
                onQuizSubmit={
                  block.type === 'quiz' && courseId && user
                    ? async (result) => {
                        const ok = await saveQuizAttempt(courseId, user.id, block.id, result);
                        if (ok) setQuizAttempt(result);
                      }
                    : undefined
                }
              />
            </div>
            {!isCompleted ? (
              <div className="pt-2 border-t">
                <Button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="gap-2 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  {markingComplete ? 'Marking…' : 'Mark as complete'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="h-9 w-9 rounded-lg bg-green-500/15 flex items-center justify-center ring-2 ring-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Completed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberCourseBlockView;
