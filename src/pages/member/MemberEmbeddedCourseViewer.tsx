import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { MemberSidebar } from '@/components/MemberSidebar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  getEmbeddedCourseById,
  getEmbeddedEnrollment,
  updateEmbeddedEnrollmentStatus,
  getEmbeddedCourseContentUrl,
  upsertEmbeddedCourseQuizResult,
  saveEmbeddedCourseQuizResult,
  getEmbeddedCourseQuizResults,
} from '@/services/embeddedCourses';
import { reportTrainingToIaabo } from '@/services/iaaboReport';
import type { EmbeddedCourse, EmbeddedCourseQuizResult } from '@/types/embeddedCourse';
import { Badge } from '@/components/ui/badge';
import {
  getEmbeddedCourseStorageContentUrl,
  getEmbeddedCourseStorageBaseUrl,
} from '@/services/embeddedCourseUpload';
import { getCertificateTemplateForMember } from '@/services/certificateTemplate';
import { generateCertificatePng, downloadBlob } from '@/utils/certificateGenerator';
import {
  getEmbeddedCourseQuizBridgeScript,
  EMBEDDED_QUIZ_RESULT_MESSAGE_TYPE,
} from '@/utils/embeddedCourseQuizBridge';

const EMBEDDED_ENROLLMENT_KEY_PREFIX = 'embedded_course_enrollment_';

/** Clear saved progress for this course in localStorage so "resume" is not shown after re-enrollment. */
function clearCourseProgressStorage(folderSlug: string, courseId: string): void {
  try {
    const slug = folderSlug.toLowerCase();
    const id = courseId.toLowerCase();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const k = key.toLowerCase();
      const matchesSlugOrId = k.includes(slug) || k.includes(id);
      const matchesResume = k.includes('resume') && (k.includes('course') || k.includes('iaabo') || k.includes('progress'));
      const matchesIspring = k.includes('ispring');
      if (matchesSlugOrId || matchesResume || matchesIspring) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/** Consider enrollment "fresh" if created in the last 10 minutes (just enrolled or course re-uploaded). */
function isFreshEnrollment(enrolledAt: string): boolean {
  const age = Date.now() - new Date(enrolledAt).getTime();
  return age < 10 * 60 * 1000;
}

/** Clear progress when re-enrolled (different enrollment id) or when course was deleted/re-uploaded (new course, fresh enrollment). */
function clearProgressIfReenrolled(
  courseId: string,
  enrollmentId: string,
  folderSlug: string,
  enrolledAt: string
): void {
  try {
    const key = EMBEDDED_ENROLLMENT_KEY_PREFIX + courseId;
    const previous = sessionStorage.getItem(key);
    const enrollmentIdChanged = previous !== null && previous !== enrollmentId;
    const newCourseFreshEnrollment = previous === null && isFreshEnrollment(enrolledAt);
    if (enrollmentIdChanged || newCourseFreshEnrollment) {
      clearCourseProgressStorage(folderSlug, courseId);
    }
    sessionStorage.setItem(key, enrollmentId);
  } catch {
    // ignore
  }
}

const MemberEmbeddedCourseViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [embeddedCourse, setEmbeddedCourse] = useState<EmbeddedCourse | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [status, setStatus] = useState<'enrolled' | 'in_progress' | 'completed' | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [certificateDownloading, setCertificateDownloading] = useState(false);
  const enrollmentIdRef = useRef<string | null>(null);
  enrollmentIdRef.current = enrollmentId;
  const courseIdRef = useRef<string | undefined>(id);
  courseIdRef.current = id;
  const userIdRef = useRef<string | undefined>(user?.id);
  userIdRef.current = user?.id;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.type !== EMBEDDED_QUIZ_RESULT_MESSAGE_TYPE) return;
      const current = enrollmentIdRef.current;
      if (!current || data.enrollmentId !== current) return;
      const quizId = data.quizIdentifier;
      if (typeof quizId !== 'string' || !quizId) return;
      const courseId = courseIdRef.current;
      const memberId = userIdRef.current;
      if (!courseId || !memberId) return;
      upsertEmbeddedCourseQuizResult({
        enrollmentId: current,
        embeddedCourseId: courseId,
        memberId,
        slideTitle: typeof data.slideTitle === 'string' ? data.slideTitle : undefined,
        score: data.score != null ? Number(data.score) : null,
        maxScore: data.maxScore != null ? Number(data.maxScore) : null,
        passed: Boolean(data.passed),
      }).catch(() => {});
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  const [quizResults, setQuizResults] = useState<EmbeddedCourseQuizResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id || !user) {
        if (!cancelled) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [course, enrollment] = await Promise.all([
          getEmbeddedCourseById(id),
          getEmbeddedEnrollment(id, user.id),
        ]);
        if (cancelled) return;
        if (!course) {
          setLoading(false);
          return;
        }
        if (!course.isActive) {
          setLoading(false);
          return;
        }
        if (!enrollment) {
          setLoading(false);
          return;
        }
        setCourseTitle(course.title);
        setEmbeddedCourse(course);
        // Clear progress when re-enrolled, or when course was deleted/re-uploaded and member just enrolled (fresh enrollment, no previous id)
        clearProgressIfReenrolled(course.id, enrollment.id, course.folderSlug, enrollment.enrolledAt);
        if (course.contentInStorage) {
          const indexUrl = getEmbeddedCourseStorageContentUrl(course.folderSlug);
          const baseUrl = getEmbeddedCourseStorageBaseUrl(course.folderSlug);
          const res = await fetch(indexUrl);
          if (!res.ok) {
            if (!cancelled) setLoading(false);
            return;
          }
          let html = await res.text();
          if (!/<\s*base\s/i.test(html)) {
            const safeBase = baseUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            html = html.replace(/<\s*head(\s[^>]*)?>/i, (m) => m + '<base href="' + safeBase + '">');
          }
          // So re-enrolled members start from beginning: key progress by enrollment id (new id = no resume)
          const safeId = enrollment.id.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '\\u003c');
          const enrollmentScript = `<script>window.ENROLLMENT_ID="${safeId}";</script>`;
          html = html.replace(/<\s*head(\s[^>]*)?>/i, (m) => m + enrollmentScript);
          // Bridge script must run after ENROLLMENT_ID is set; inject it after the enrollment script
          const bridgeScript = '<script>' + getEmbeddedCourseQuizBridgeScript() + '</script>';
          html = html.replace(enrollmentScript, enrollmentScript + bridgeScript);
          const blob = new Blob([html], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          if (!cancelled) {
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = blobUrl;
            setIframeUrl(blobUrl);
          } else {
            URL.revokeObjectURL(blobUrl);
          }
        } else {
          const base = getEmbeddedCourseContentUrl(course);
          const url = base + (base.includes('?') ? '&' : '?') + 'enrollmentId=' + encodeURIComponent(enrollment.id);
          setIframeUrl(url);
        }
        setEnrollmentId(enrollment.id);
        setStatus(enrollment.status);
        setCompletedAt(enrollment.completedAt);
        if (enrollment.status === 'enrolled') {
          updateEmbeddedEnrollmentStatus(enrollment.id, 'in_progress').then(() => setStatus('in_progress')).catch(() => {});
        }
        if (enrollment.status === 'completed') {
          getEmbeddedCourseQuizResults(enrollment.id).then(setQuizResults).catch(() => {});
        }
      } catch {
        if (!cancelled) setLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [id, user]);

  // Listen for quiz-slide results sent via postMessage from the embedded course iframe.
  // Expected message shape: { type: 'QUIZ_RESULT', slide?: string, score?: number, maxScore?: number, passed?: boolean }
  useEffect(() => {
    if (!enrollmentId || !id || !user) return;
    const handler = (event: MessageEvent) => {
      const d = event.data;
      if (!d || d.type !== 'QUIZ_RESULT') return;
      saveEmbeddedCourseQuizResult({
        enrollmentId,
        embeddedCourseId: id,
        memberId: user.id,
        slideTitle: typeof d.slide === 'string' ? d.slide : undefined,
        score: typeof d.score === 'number' ? d.score : undefined,
        maxScore: typeof d.maxScore === 'number' ? d.maxScore : undefined,
        passed: typeof d.passed === 'boolean' ? d.passed : undefined,
      }).catch(() => {});
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [enrollmentId, id, user]);

  const handleMarkComplete = async () => {
    if (!enrollmentId || !id || !user) return;
    setMarkingComplete(true);
    try {
      // Validate IAABO IDs before proceeding - block if missing
      const memberIaaboId = profile?.iaabo_id?.trim();
      if (!memberIaaboId) {
        toast({
          title: 'Unable to mark as complete',
          description: 'IAABO ID is missing for your account or this course. Please contact support.',
          variant: 'destructive',
        });
        return;
      }
      const [course, enrollment] = await Promise.all([
        getEmbeddedCourseById(id),
        getEmbeddedEnrollment(id, user.id),
      ]);
      if (!course?.iaaboCourseId?.trim()) {
        toast({
          title: 'Unable to mark as complete',
          description: 'IAABO ID is missing for your account or this course. Please contact support.',
          variant: 'destructive',
        });
        return;
      }
      if (!enrollment) return;

      const updatedEnrollment = await updateEmbeddedEnrollmentStatus(enrollmentId, 'completed');
      setStatus('completed');
      setCompletedAt(updatedEnrollment.completedAt);
      toast({ title: 'Course completed', description: 'You marked this course as complete.' });
      const results = await getEmbeddedCourseQuizResults(enrollmentId);
      setQuizResults(results);

      // Compute quiz aggregates
      const totalScore = results.reduce((s, r) => s + (r.score ?? 0), 0);
      const maxScore = results.reduce((s, r) => s + (r.maxScore ?? 0), 0);
      const passed = results.length > 0 && results.every((r) => r.passed === true);

      // Format dates to YYYY-MM-DD
      const startDate = enrollment.enrolledAt.slice(0, 10);
      const completionDate = (updatedEnrollment.completedAt ?? new Date().toISOString()).slice(0, 10);

      const { success, error } = await reportTrainingToIaabo({
        memberIaaboId,
        courseIaaboId: course.iaaboCourseId,
        courseName: course.title,
        startDate,
        completionDate,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        totalScore: results.length > 0 ? totalScore : undefined,
        maxScore: results.length > 0 ? maxScore : undefined,
        passed: results.length > 0 ? passed : undefined,
      });
      if (!success) {
        console.warn('IAABO report failed:', error);
        toast({
          title: 'Note',
          description: 'Completion saved. IAABO reporting failed—please contact support if needed.',
          variant: 'default',
        });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not update completion.', variant: 'destructive' });
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!profile || !courseTitle) return;
    setCertificateDownloading(true);
    try {
      const globalTemplate = await getCertificateTemplateForMember();

      const hasPerCourseTemplate =
        !!embeddedCourse?.certificateTemplateUrl &&
        embeddedCourse.certificateMemberNameXPercent != null &&
        embeddedCourse.certificateMemberNameYPercent != null &&
        embeddedCourse.certificateCourseTitleXPercent != null &&
        embeddedCourse.certificateCourseTitleYPercent != null &&
        embeddedCourse.certificateMemberNameFontSizePx != null &&
        embeddedCourse.certificateCourseTitleFontSizePx != null;

      const templateToUse = hasPerCourseTemplate
        ? {
            templateUrl: embeddedCourse.certificateTemplateUrl,
            memberNameXPercent: Number(embeddedCourse.certificateMemberNameXPercent),
            memberNameYPercent: Number(embeddedCourse.certificateMemberNameYPercent),
            courseTitleXPercent: Number(embeddedCourse.certificateCourseTitleXPercent),
            courseTitleYPercent: Number(embeddedCourse.certificateCourseTitleYPercent),
            memberNameFontSizePx: Number(embeddedCourse.certificateMemberNameFontSizePx),
            courseTitleFontSizePx: Number(embeddedCourse.certificateCourseTitleFontSizePx),
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
        <div className="flex items-center justify-center min-h-[400px] gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading course...
        </div>
      </DashboardLayout>
    );
  }

  if (!iframeUrl) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Course not found or you are not enrolled. Go back to the catalog to enroll.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/member/embedded-courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Embedded Courses
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between gap-4 py-3 border-b bg-background shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/member/embedded-courses')}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold truncate">{courseTitle}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status !== 'completed' && (
              <Button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="gap-2"
              >
                {markingComplete ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark as complete
              </Button>
            )}
            {status === 'completed' && (
              <>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Completed{completedAt ? ` on ${new Date(completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCertificate}
                  disabled={certificateDownloading}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {certificateDownloading ? 'Generating…' : 'Download Certificate'}
                </Button>
              </>
            )}
          </div>
        </div>
        <div className={`min-h-0 border border-t-0 overflow-hidden bg-muted ${quizResults.length > 0 ? 'flex-1' : 'flex-1 rounded-b-lg'}`}>
          <iframe
            title={courseTitle}
            src={iframeUrl}
            className="w-full h-full border-0"
            allow="fullscreen; autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
        {quizResults.length > 0 && (
          <div className="shrink-0 border border-t-0 rounded-b-lg bg-background max-h-52 overflow-y-auto">
            <div className="px-4 py-2 border-b bg-muted/40 sticky top-0">
              <span className="text-sm font-semibold">Quiz Results</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left px-4 py-2 font-medium">Slide</th>
                  <th className="text-center px-4 py-2 font-medium">Score</th>
                  <th className="text-center px-4 py-2 font-medium">Max Score</th>
                  <th className="text-center px-4 py-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((r, index) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 text-left">{r.slideTitle ?? `Question ${index + 1}`}</td>
                    <td className="px-4 py-2 text-center">{r.score ?? '—'}</td>
                    <td className="px-4 py-2 text-center">{r.maxScore ?? '—'}</td>
                    <td className="px-4 py-2 text-center">
                      {r.passed === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : r.passed ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-white">Pass</Badge>
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
      </div>
    </DashboardLayout>
  );
};

export default MemberEmbeddedCourseViewer;
