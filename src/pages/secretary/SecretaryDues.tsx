import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { SecretarySidebar } from "@/components/SecretarySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockMembers } from "@/data/mockMembers";
import { CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SecretaryDues = () => {
  const boardId = "board-1";
  const [members, setMembers] = useState(() =>
    mockMembers
      .filter(m => m.boardId === boardId)
      .map((m, index) => ({ ...m, duesStatus: index % 4 !== 0 ? "Paid" : "Outstanding" }))
  );

  const handleMarkPaid = (memberId: string) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, duesStatus: "Paid" } : m
    ));
    toast({
      title: "Payment Recorded",
      description: "Dues payment has been marked as paid",
    });
  };

  const totalDues = members.length * 35;
  const collected = members.filter(m => m.duesStatus === "Paid").length * 35;
  const outstanding = totalDues - collected;

  const columns = [
    { 
      header: "Member",
      accessor: (row: any) => row.fullName
    },
    { header: "Email", accessor: "email" },
    { 
      header: "Amount",
      accessor: () => "$35.00"
    },
    { 
      header: "Status",
      accessor: (row: any) => (
        <Badge variant={row.duesStatus === "Paid" ? "default" : "secondary"}>
          {row.duesStatus}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        row.duesStatus === "Outstanding" ? (
          <Button 
            size="sm" 
            variant="default"
            onClick={() => handleMarkPaid(row.id)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Paid
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">Paid</span>
        )
      )
    }
  ];

  const statItems = [
    { title: "Total Expected", value: `$${totalDues}` },
    { title: "Collected", value: `$${collected}` },
    { title: "Outstanding", value: `$${outstanding}` },
  ];

  return (
    <DashboardLayout sidebar={<SecretarySidebar />}>
      <div className="space-y-6">
        <PageHeader title="Dues Management" subtitle="Track and record dues payments" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member Dues</CardTitle>
            <CardDescription>View and record dues payments for your board</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={members} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDues;
