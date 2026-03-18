import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ExternalLink } from "lucide-react";
import { useAdminTraining } from "@/hooks/useAdminTraining";
import { LearnDashSyncStatus } from "@/components/member/LearnDashSyncStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminTraining = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { courses, stats, loading, error, lastSync, refresh } = useAdminTraining();

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      header: "Course Title", 
      accessor: (row: any) => row.title
    },
    { 
      header: "Steps",
      accessor: (row: any) => `${row.stepsTotal} steps`
    },
    { 
      header: "Status",
      accessor: () => <Badge variant="default">Active</Badge>
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.open(row.link, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View
        </Button>
      )
    }
  ];

  const statItems = [
    { title: "Total Courses", value: loading ? "..." : stats.totalCourses },
    { title: "LearnDash Sync", value: loading ? "..." : "Connected" },
    { title: "Active Platform", value: "IAABO U" },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Training & Education"
          subtitle="Manage courses from IAABO University"
          actions={
            <LearnDashSyncStatus
              loading={loading}
              error={error}
              lastSync={lastSync}
              onRefresh={refresh}
            />
          }
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>Live courses from IAABO University (LearnDash)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search courses..." />
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <DataTable columns={columns} data={filteredCourses} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminTraining;
