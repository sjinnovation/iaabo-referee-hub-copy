import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockDuesCycles } from "@/data/mockDuesCycles";
import { Plus, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminFinance = () => {
  const [cycles] = useState(mockDuesCycles);

  const totalCollected = cycles.reduce((sum, cycle) => sum + cycle.amountCollected, 0);
  const totalExpected = cycles.reduce((sum, cycle) => sum + cycle.totalAmount, 0);
  const collectionRate = Math.round((totalCollected / totalExpected) * 100);

  const columns = [
    { header: "Cycle Name", accessor: (row: any) => `${row.year} Dues Cycle` },
    { header: "Year", accessor: "year" },
    { 
      header: "Total Amount",
      accessor: (row: any) => `$${row.totalAmount.toLocaleString()}`
    },
    { 
      header: "Collected",
      accessor: (row: any) => `$${row.amountCollected.toLocaleString()}`
    },
    { 
      header: "Collection Rate",
      accessor: (row: any) => {
        const rate = Math.round((row.amountCollected / row.totalAmount) * 100);
        return (
          <Badge variant={rate >= 80 ? "default" : rate >= 60 ? "outline" : "secondary"}>
            {rate}%
          </Badge>
        );
      }
    },
    { header: "Due Date", accessor: (row: any) => row.endDate.split('T')[0] },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => toast({ title: "Generate Invoices", description: `Generating invoices for ${row.year}` })}
        >
          <Download className="w-4 h-4 mr-2" />
          Invoices
        </Button>
      )
    }
  ];

  const statItems = [
    { title: "Total Expected", value: `$${totalExpected.toLocaleString()}` },
    { title: "Total Collected", value: `$${totalCollected.toLocaleString()}` },
    { title: "Collection Rate", value: `${collectionRate}%` },
    { title: "Outstanding", value: `$${(totalExpected - totalCollected).toLocaleString()}` },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Finance & Dues"
          subtitle="Manage dues cycles and track payments"
          actions={
            <Button onClick={() => toast({ title: "New Dues Cycle", description: "Create dues cycle form would open here" })}>
              <Plus className="w-4 h-4 mr-2" />
              New Dues Cycle
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <ChartCard
          title="Revenue Trend"
          description="Monthly dues collection over time"
        >
          <div className="text-center text-muted-foreground py-8">Chart visualization placeholder</div>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Dues Cycles</CardTitle>
            <CardDescription>View and manage annual dues cycles</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={cycles} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminFinance;
