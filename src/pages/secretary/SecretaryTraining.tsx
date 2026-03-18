import DashboardLayout from "@/components/DashboardLayout";
import { SecretarySidebar } from "@/components/SecretarySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockMembers } from "@/data/mockMembers";
import { mockCourses } from "@/data/mockCourses";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SecretaryTraining = () => {
  const boardId = "board-1";
  const members = mockMembers.filter(m => m.boardId === boardId);
  
  const memberProgress = members.map((m, index) => ({
    ...m,
    completedCourses: (index * 3 + 2) % (mockCourses.length + 1),
    totalCourses: mockCourses.length
  }));

  const handleSendReminder = (_memberId: string, memberName: string) => {
    toast({
      title: "Reminder Sent",
      description: `Training reminder sent to ${memberName}`,
    });
  };

  const columns = [
    { 
      header: "Member",
      accessor: (row: any) => row.fullName
    },
    { 
      header: "Progress",
      accessor: (row: any) => `${row.completedCourses}/${row.totalCourses}`
    },
    { 
      header: "Completion Rate",
      accessor: (row: any) => {
        const rate = Math.round((row.completedCourses / row.totalCourses) * 100);
        return (
          <Badge variant={rate >= 80 ? "default" : rate >= 50 ? "outline" : "secondary"}>
            {rate}%
          </Badge>
        );
      }
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleSendReminder(row.id, row.fullName)}
        >
          <Send className="w-4 h-4 mr-2" />
          Remind
        </Button>
      )
    }
  ];

  const statItems = [
    { title: "Avg Completion", value: "67%" },
    { title: "Fully Completed", value: "32" },
    { title: "Need Attention", value: "4" },
  ];

  return (
    <DashboardLayout sidebar={<SecretarySidebar />}>
      <div className="space-y-6">
        <PageHeader title="Training Progress" subtitle="Monitor member training completion" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <ChartCard
          title="Training Status Overview"
          description="Board member training completion status"
        >
          <div className="text-center text-muted-foreground py-8">Chart visualization placeholder</div>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Member Training Progress</CardTitle>
            <CardDescription>Track training completion for your board members</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={memberProgress} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryTraining;
