import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GraduationCap, ExternalLink, ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LearnDashSyncStatus } from "./LearnDashSyncStatus";
import { CourseData } from "@/types/learndash";

interface TrainingProgressProps {
  currentCourse?: string;
  courseProgress: number;
  nextCourse?: string;
  statusCode1: 'IUR' | 'AO';
  statusCode2: 'NEW' | 'M' | 'N';
  // LearnDash integration
  courses?: CourseData[];
  loading?: boolean;
  error?: string | null;
  lastSync?: Date | null;
  onRefresh?: () => void;
}

export function TrainingProgress({ 
  currentCourse, 
  courseProgress, 
  nextCourse,
  statusCode1,
  statusCode2,
  courses,
  loading = false,
  error = null,
  lastSync = null,
  onRefresh
}: TrainingProgressProps) {
  const isActive = statusCode1 === 'AO' && statusCode2 === 'N';
  
  // Use live data if available, otherwise fallback to props
  const activeCourse = courses?.find(c => !c.completed && c.progress > 0);
  const completedCourses = courses?.filter(c => c.completed) || [];
  const displayCourse = activeCourse || (courses && courses.length > 0 ? courses[0] : null);
  
  const displayProgress = displayCourse?.progress || courseProgress;
  const displayTitle = displayCourse?.title || currentCourse;
  const isCompleted = courses ? completedCourses.length > 0 && !activeCourse : (courseProgress === 100 && !currentCourse);

  const handleGoToUniversity = () => {
    window.open('https://iaabou.org', '_blank');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Training Status</CardTitle>
        <GraduationCap className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {error && onRefresh && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Unable to sync with IAABO University. Showing cached data.
            </AlertDescription>
          </Alert>
        )}

        {loading && !courses ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : displayTitle ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{displayTitle}</p>
                <Badge variant="outline">{Math.round(displayProgress)}%</Badge>
              </div>
              <Progress value={displayProgress} className="h-2" />
            </div>
            
            <Button className="w-full" size="sm" onClick={handleGoToUniversity}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to My University
            </Button>

            {courses && courses.length > 1 && !activeCourse && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">
                  {completedCourses.length} of {courses.length} courses completed
                </p>
              </div>
            )}

            {nextCourse && !courses && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Next Course:</p>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm font-medium">{nextCourse}</p>
                </div>
              </div>
            )}

            {onRefresh && lastSync !== undefined && (
              <div className="pt-2 border-t">
                <LearnDashSyncStatus
                  loading={loading}
                  error={error}
                  lastSync={lastSync}
                  onRefresh={onRefresh}
                />
              </div>
            )}
          </>
        ) : isCompleted ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
              <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-semibold text-green-600 dark:text-green-400">
              Training Complete!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isActive ? 'All required courses completed' : 'Awaiting board approval'}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No active courses</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
