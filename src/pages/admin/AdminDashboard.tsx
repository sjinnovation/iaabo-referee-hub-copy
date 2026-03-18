import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PageHeader } from "@/components/PageHeader";

const AdminDashboard = () => {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" subtitle="Welcome back, Administrator" />
        <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-lg">
          This page is under development
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
