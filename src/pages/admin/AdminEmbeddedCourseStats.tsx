import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { EmbeddedCourse } from '@/types/embeddedCourse';
import {
  getEmbeddedCourseById,
  getAllQuizResultsForCourse,
} from '@/services/embeddedCourses';

interface QuizRow {
  id: string;
  slideTitle?: string | null;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
  submittedAt: string;
}

interface MemberRow {
  memberId: string;
  memberName: string;
  memberEmail: string;
  totalScore: number;
  totalMaxScore: number;
  results: QuizRow[];
}

const AdminEmbeddedCourseStats = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<EmbeddedCourse | null>(null);
  const [rawResults, setRawResults] = useState<
    Array<QuizRow & { memberId: string; memberName?: string; memberEmail?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [courseData, quizData] = await Promise.all([
        getEmbeddedCourseById(id),
        getAllQuizResultsForCourse(id),
      ]);
      if (!courseData) {
        toast({ title: 'Error', description: 'Embedded course not found', variant: 'destructive' });
        navigate('/admin/embedded-courses');
        return;
      }
      setCourse(courseData);
      setRawResults(quizData);
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to load stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const memberRows = useMemo<MemberRow[]>(() => {
    const map = new Map<string, MemberRow>();
    for (const r of rawResults) {
      if (!map.has(r.memberId)) {
        map.set(r.memberId, {
          memberId: r.memberId,
          memberName: r.memberName ?? 'Unknown',
          memberEmail: r.memberEmail ?? '',
          totalScore: 0,
          totalMaxScore: 0,
          results: [],
        });
      }
      const row = map.get(r.memberId)!;
      row.results.push({
        id: r.id,
        slideTitle: r.slideTitle,
        score: r.score,
        maxScore: r.maxScore,
        passed: r.passed,
        submittedAt: r.submittedAt,
      });
      row.totalScore += r.score ?? 0;
      row.totalMaxScore += r.maxScore ?? 0;
    }
    return Array.from(map.values()).sort((a, b) => b.totalScore - a.totalScore);
  }, [rawResults]);

  const toggleRow = (memberId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  if (loading || !course) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading stats...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
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
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Member quiz scores — click a row to expand individual results
              </p>
            </div>
          </div>
        </div>

        {/* Member scores table */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Member Scores</CardTitle>
            </div>
            <CardDescription>
              {memberRows.length > 0
                ? `${memberRows.length} member(s) with quiz submissions`
                : 'No quiz submissions yet'}
            </CardDescription>
          </CardHeader>

          {memberRows.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Quiz results will appear here once members start taking the course.
              </p>
            </CardContent>
          ) : (
            <div className="divide-y">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-2.5 bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Member</span>
                <span className="text-right w-20">Score</span>
                <span className="text-right w-20">Max Score</span>
                <span className="w-6" />
              </div>

              {memberRows.map((member) => {
                const isExpanded = expandedRows.has(member.memberId);
                return (
                  <div key={member.memberId}>
                    {/* Summary row */}
                    <button
                      className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 text-left hover:bg-muted/30 transition-colors items-center"
                      onClick={() => toggleRow(member.memberId)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.memberName}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.memberEmail}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-right w-20">
                        {member.totalScore}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums text-right w-20">
                        {member.totalMaxScore}
                      </span>
                      <span className="w-6 flex justify-end">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </span>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="bg-muted/10 border-t px-6 py-3">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs font-medium text-muted-foreground uppercase tracking-wide border-b">
                              <th className="text-left py-2 pr-4">Slide</th>
                              <th className="text-center py-2 px-4 w-24">Score</th>
                              <th className="text-center py-2 px-4 w-24">Max Score</th>
                              <th className="text-center py-2 pl-4 w-24">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {member.results.map((r, idx) => (
                              <tr key={r.id} className="hover:bg-muted/20">
                                <td className="py-2.5 pr-4 text-sm">
                                  {r.slideTitle ?? `Question ${idx + 1}`}
                                </td>
                                <td className="py-2.5 px-4 text-center tabular-nums">
                                  {r.score ?? '—'}
                                </td>
                                <td className="py-2.5 px-4 text-center tabular-nums text-muted-foreground">
                                  {r.maxScore ?? '—'}
                                </td>
                                <td className="py-2.5 pl-4 text-center">
                                  {r.passed === null ? (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  ) : r.passed ? (
                                    <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs">
                                      Pass
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-xs">
                                      Fail
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmbeddedCourseStats;
