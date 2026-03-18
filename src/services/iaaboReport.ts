export interface ReportTrainingParams {
  memberIaaboId: string;
  courseIaaboId: string;
  courseName: string;
  startDate: string;
  completionDate: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  totalScore?: number;
  maxScore?: number;
  passed?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wbwevpmcuvawykfyrxvi.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid2V2cG1jdXZhd3lrZnlyeHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTA0MjcsImV4cCI6MjA4NzQyNjQyN30.aNSK_xoj7cyPPcYubEoO5YvG-_ZH44dKBywm9CCXrso';

/**
 * Reports training completion to the IAABO external API via Edge Function.
 * Called when a member marks an embedded course as complete.
 * Uses the anon key for auth since the Edge Function expects it (supabase.functions.invoke sends user JWT when logged in).
 */
export async function reportTrainingToIaabo(
  params: ReportTrainingParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/report-iaabo-training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        memberIaaboId: params.memberIaaboId,
        courseIaaboId: params.courseIaaboId,
        courseName: params.courseName ?? '',
        startDate: params.startDate,
        completionDate: params.completionDate,
        email: params.email ?? '',
        firstName: params.firstName ?? '',
        lastName: params.lastName ?? '',
        totalScore: params.totalScore,
        maxScore: params.maxScore,
        passed: params.passed,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('report-iaabo-training error:', res.status, data);
      return { success: false, error: data?.message || data?.error || `Request failed (${res.status})` };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('reportTrainingToIaabo:', message);
    return { success: false, error: message };
  }
}
