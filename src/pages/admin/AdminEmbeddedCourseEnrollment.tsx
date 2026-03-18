import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/DataTable';
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
  Users,
  Search,
  UserMinus,
  CheckCircle,
  Clock,
  PlayCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { EmbeddedCourse, EmbeddedCourseEnrollmentWithMember, EmbeddedCourseQuizResult } from '@/types/embeddedCourse';
import {
  getEmbeddedCourseById,
  getEnrollmentsForEmbeddedCourse,
  getEmbeddedEnrollmentStats,
  unenrollFromEmbeddedCourse,
  getEmbeddedCourseQuizResults,
} from '@/services/embeddedCourses';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  enrolled: { label: 'Enrolled', icon: Clock, color: 'text-blue-600' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-amber-600' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
};

const AdminEmbeddedCourseEnrollment = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<EmbeddedCourse | null>(null);
  const [enrollments, setEnrollments] = useState<EmbeddedCourseEnrollmentWithMember[]>([]);
  const [stats, setStats] = useState({ total: 0, enrolled: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [memberToUnenroll, setMemberToUnenroll] = useState<EmbeddedCourseEnrollmentWithMember | null>(null);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [quizResultsOpen, setQuizResultsOpen] = useState(false);
  const [quizResultsMember, setQuizResultsMember] = useState<EmbeddedCourseEnrollmentWithMember | null>(null);
  const [quizResults, setQuizResults] = useState<EmbeddedCourseQuizResult[]>([]);
  const [quizResultsLoading, setQuizResultsLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [courseData, enrollList, statsData] = await Promise.all([
        getEmbeddedCourseById(id),
        getEnrollmentsForEmbeddedCourse(id),
        getEmbeddedEnrollmentStats(id),
      ]);
      if (!courseData) {
        toast({ title: 'Error', description: 'Embedded course not found', variant: 'destructive' });
        navigate('/admin/embedded-courses');
        return;
      }
      setCourse(courseData);
      setEnrollments(enrollList);
      setStats(statsData);
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const filteredEnrollments = useMemo(
    () =>
      enrollments.filter((e) => {
        if (!enrollmentSearch) return true;
        const q = enrollmentSearch.toLowerCase();
        return (
          (e.memberName || '').toLowerCase().includes(q) ||
          (e.memberEmail || '').toLowerCase().includes(q)
        );
      }),
    [enrollments, enrollmentSearch]
  );

  const handleUnenroll = async () => {
    if (!id || !memberToUnenroll) return;
    try {
      await unenrollFromEmbeddedCourse(id, memberToUnenroll.memberId);
      toast({
        title: 'Member Unenrolled',
        description: `${memberToUnenroll.memberName ?? 'Member'} has been removed from this course.`,
      });
      setUnenrollDialogOpen(false);
      setMemberToUnenroll(null);
      loadData();
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to unenroll',
        variant: 'destructive',
      });
    }
  };

  const handleViewResults = async (enrollment: EmbeddedCourseEnrollmentWithMember) => {
    setQuizResultsMember(enrollment);
    setQuizResults([]);
    setQuizResultsOpen(true);
    setQuizResultsLoading(true);
    try {
      const results = await getEmbeddedCourseQuizResults(enrollment.id);
      setQuizResults(results);
    } catch {
      toast({ title: 'Error', description: 'Failed to load quiz results.', variant: 'destructive' });
    } finally {
      setQuizResultsLoading(false);
    }
  };

  const enrollmentColumns = [
    {
      header: 'Member',
      accessor: (enrollment: EmbeddedCourseEnrollmentWithMember) => (
        <div>
          <p className="font-medium text-sm">{enrollment.memberName ?? 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{enrollment.memberEmail ?? ''}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (enrollment: EmbeddedCourseEnrollmentWithMember) => {
        const config = statusConfig[enrollment.status] ?? statusConfig.enrolled;
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={`text-sm ${config.color}`}>{config.label}</span>
          </div>
        );
      },
    },
    {
      header: 'Enrolled',
      accessor: (enrollment: EmbeddedCourseEnrollmentWithMember) => (
        <span className="text-xs text-muted-foreground">
          {new Date(enrollment.enrolledAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Completed',
      accessor: (enrollment: EmbeddedCourseEnrollmentWithMember) => (
        <span className="text-xs text-muted-foreground">
          {enrollment.status === 'completed' && enrollment.completedAt
            ? new Date(enrollment.completedAt).toLocaleDateString()
            : '—'}
        </span>
      ),
    },
    {
      header: '',
      accessor: (enrollment: EmbeddedCourseEnrollmentWithMember) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => handleViewResults(enrollment)}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Results
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
            onClick={() => {
              setMemberToUnenroll(enrollment);
              setUnenrollDialogOpen(true);
            }}
          >
            <UserMinus className="w-3.5 h-3.5 mr-1" />
            Unenroll
          </Button>
        </div>
      ),
    },
  ];

  if (loading || !course) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">{loading ? 'Loading enrollments...' : ''}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 px-6 py-6 shadow-sm">
          <div className="relative z-10 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/embedded-courses')}
              className="shrink-0 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight truncate">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                View and manage enrollments. Members enroll from the embedded course catalog.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Enrolled</p>
                  <p className="text-3xl font-bold mt-1 tabular-nums">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Not Started</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400 tabular-nums">{stats.enrolled}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/15 flex items-center justify-center ring-2 ring-blue-500/20">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600 dark:text-amber-400 tabular-nums">{stats.inProgress}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 flex items-center justify-center ring-2 ring-amber-500/20">
                  <PlayCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400 tabular-nums">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/15 flex items-center justify-center ring-2 ring-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Members Table */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl">Enrolled Members</CardTitle>
            <CardDescription className="mt-0.5">
              {filteredEnrollments.length} enrolled member(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {enrollments.length > 0 && (
              <div className="relative mb-6 p-4 rounded-xl bg-muted/40 border">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={enrollmentSearch}
                  onChange={(e) => setEnrollmentSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            )}

            {filteredEnrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed bg-muted/20">
                <div className="h-20 w-20 rounded-2xl bg-muted/60 flex items-center justify-center mb-5 ring-2 ring-muted-foreground/10">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl mb-1.5">No members enrolled yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Members can view this course in the embedded course catalog and enroll themselves.
                </p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden">
                <DataTable columns={enrollmentColumns} data={filteredEnrollments} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unenroll Confirmation */}
      <AlertDialog open={unenrollDialogOpen} onOpenChange={setUnenrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToUnenroll?.memberName ?? 'this member'} from this course?
              Their progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenroll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Quiz Results Modal */}
      <Dialog open={quizResultsOpen} onOpenChange={setQuizResultsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {quizResultsMember?.memberName ?? 'Member'} — Quiz Results
            </DialogTitle>
          </DialogHeader>

          {quizResultsLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading results...
            </div>
          ) : quizResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No quiz results recorded yet for this member.</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="text-left px-4 py-2.5 font-medium">Slide</th>
                    <th className="text-center px-4 py-2.5 font-medium">Score</th>
                    <th className="text-center px-4 py-2.5 font-medium">Max Score</th>
                    <th className="text-center px-4 py-2.5 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {quizResults.map((r, index) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">{r.slideTitle ?? `Question ${index + 1}`}</td>
                      <td className="px-4 py-2.5 text-center">{r.score ?? '—'}</td>
                      <td className="px-4 py-2.5 text-center">{r.maxScore ?? '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        {r.passed === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : r.passed ? (
                          <Badge className="bg-green-600 hover:bg-green-600 text-white">Pass</Badge>
                        ) : (
                          <Badge variant="destructive">Fail</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminEmbeddedCourseEnrollment;
