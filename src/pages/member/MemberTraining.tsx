import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MemberSidebar } from "@/components/MemberSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchBar } from "@/components/SearchBar";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockCourses } from "@/data/mockCourses";
import { mockCurrentUser } from "@/data/mockMembers";
import { useLearnDashCourses } from "@/hooks/useLearnDashCourses";
import { Play, Download, CheckCircle, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MemberTraining = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const member = mockCurrentUser;
  
  const { courses: learnDashCourses, loading, error } = useLearnDashCourses(member.learndashUserId);
  
  const [coursesWithProgress] = useState(() => mockCourses.map((c, index) => ({
    ...c,
    progress: ((index * 37 + 13) % 100),
    isCompleted: index % 2 === 0
  })));

  const allCourses = [
    ...(learnDashCourses || []).map(c => ({
      id: `ld-${c.id}`,
      title: c.title,
      description: c.description,
      progress: c.progress,
      isCompleted: c.completed,
      durationMinutes: Math.ceil(c.stepsTotal * 15),
      isRequired: true,
      category: 'Core Training',
      isLive: true,
      link: c.link
    })),
    ...coursesWithProgress
  ];

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = allCourses.filter(c => c.isCompleted).length;
  const inProgressCount = allCourses.filter(c => !c.isCompleted && c.progress > 0).length;

  const statItems = [
    { title: "Courses Completed", value: loading ? "..." : `${completedCount}/${allCourses.length}` },
    { title: "In Progress", value: loading ? "..." : inProgressCount },
    { title: "Certificates Earned", value: loading ? "..." : completedCount },
  ];

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Training & Courses" subtitle="Complete courses to improve your skills" />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load live courses from IAABO University. Showing cached data.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search courses..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && learnDashCourses === undefined ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            filteredCourses.map((course: any) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        {course.isLive && (
                          <Badge variant="default" className="text-xs">Live</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">{course.description}</CardDescription>
                    </div>
                    {course.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.durationMinutes} mins
                    </div>
                    <Badge variant={course.isRequired ? "default" : "outline"}>
                      {course.isRequired ? "Required" : "Optional"}
                    </Badge>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                  
                  {!course.isCompleted && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(course.progress)}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        if (course.isLive && course.link) {
                          window.open(course.link, '_blank');
                        } else {
                          toast({ title: "Video Player", description: "Video player would open here" });
                        }
                      }}
                    >
                      {course.isLive ? (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {course.isCompleted ? "Review on IAABO U" : "Continue on IAABO U"}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {course.isCompleted ? "Review" : "Continue"}
                        </>
                      )}
                    </Button>
                    {course.isCompleted && (
                      <Button 
                        variant="outline"
                        onClick={() => toast({ title: "Certificate", description: "Certificate downloaded" })}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberTraining;
