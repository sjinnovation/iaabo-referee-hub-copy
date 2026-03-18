---
name: Embedded Quiz Results Table
overview: Create the `embedded_course_quiz_results` table (with `embedded_course_id`) and wire it up so a record is saved when a member marks an embedded course as complete.
todos:
  - id: migration
    content: Create supabase/migrations/20260313000000_embedded_course_quiz_results.sql with table, indexes, and RLS policies
    status: pending
  - id: types
    content: Add EmbeddedCourseQuizResult interface to src/types/embeddedCourse.ts
    status: pending
  - id: service
    content: Add saveEmbeddedCourseQuizResult() function to src/services/embeddedCourses.ts
    status: pending
  - id: viewer
    content: Call saveEmbeddedCourseQuizResult in handleMarkComplete in MemberEmbeddedCourseViewer.tsx
    status: pending
isProject: false
---

# Embedded Course Quiz Results

## What needs to be built

The `embedded_course_quiz_results` table does **not exist yet**. We need to:

1. Create a Supabase migration for the table
2. Add a TypeScript type and service function
3. Call the service from the member viewer when the course is marked complete

---

## Files to create / change

- **New:** `supabase/migrations/20260313000000_embedded_course_quiz_results.sql`
- **Edit:** `[src/types/embeddedCourse.ts](src/types/embeddedCourse.ts)`
- **Edit:** `[src/services/embeddedCourses.ts](src/services/embeddedCourses.ts)`
- **Edit:** `[src/pages/member/MemberEmbeddedCourseViewer.tsx](src/pages/member/MemberEmbeddedCourseViewer.tsx)`

---

## 1. Migration — new table

```sql
create table public.embedded_course_quiz_results (
  id                  uuid primary key default gen_random_uuid(),
  enrollment_id       uuid not null references public.embedded_course_enrollments(id) on delete cascade,
  embedded_course_id  uuid not null references public.embedded_courses(id) on delete cascade,
  member_id           uuid not null references auth.users(id) on delete cascade,
  score               integer check (score >= 0),        -- nullable; populated when iframe sends score
  total_questions     integer check (total_questions >= 0), -- nullable
  passed              boolean,                           -- nullable
  submitted_at        timestamptz not null default now()
);
```

RLS: members can select/insert their own rows; admins can do all.

---

## 2. TypeScript type

Add to `[src/types/embeddedCourse.ts](src/types/embeddedCourse.ts)`:

```typescript
export interface EmbeddedCourseQuizResult {
  id: string;
  enrollmentId: string;
  embeddedCourseId: string;
  memberId: string;
  score: number | null;
  totalQuestions: number | null;
  passed: boolean | null;
  submittedAt: string;
}
```

---

## 3. Service function

Add `saveEmbeddedCourseQuizResult()` to `[src/services/embeddedCourses.ts](src/services/embeddedCourses.ts)`:

```typescript
export async function saveEmbeddedCourseQuizResult(params: {
  enrollmentId: string;
  embeddedCourseId: string;
  memberId: string;
  score?: number;
  totalQuestions?: number;
  passed?: boolean;
}): Promise<void>
```

---

## 4. Call from viewer on completion

In `[src/pages/member/MemberEmbeddedCourseViewer.tsx](src/pages/member/MemberEmbeddedCourseViewer.tsx)`, inside `handleMarkComplete`, after `updateEmbeddedEnrollmentStatus` succeeds, call:

```typescript
await saveEmbeddedCourseQuizResult({
  enrollmentId,
  embeddedCourseId: id,   // already available from useParams
  memberId: user.id,
});
```

The `id` param (course UUID from the URL) is already in scope. Score/passed are left null for now since the iframe does not yet send those via `postMessage`.