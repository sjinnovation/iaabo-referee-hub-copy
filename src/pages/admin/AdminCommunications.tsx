import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockAnnouncements } from "@/data/mockAnnouncements";
import { Send, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminCommunications = () => {
  const [announcements] = useState(mockAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSendAnnouncement = () => {
    if (!title || !content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Announcement Sent",
      description: "All members have been notified",
    });
    setTitle("");
    setContent("");
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { 
      header: "Content",
      accessor: (row: any) => (
        <div className="max-w-md truncate">{row.content}</div>
      )
    },
    { 
      header: "Priority",
      accessor: (row: any) => (
        <Badge variant={
          row.priority === "high" ? "default" : 
          row.priority === "medium" ? "outline" : 
          "secondary"
        }>
          {row.priority}
        </Badge>
      )
    },
    { header: "Date", accessor: "date" },
    { header: "Author", accessor: "author" },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toast({ title: "Edit", description: `Editing ${row.title}` })}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toast({ title: "Delete", description: `Deleted ${row.title}` })}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const statItems = [
    { title: "Total Announcements", value: announcements.length },
    { title: "This Month", value: 12 },
    { title: "Active Recipients", value: "2,847" },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Communications" subtitle="Send announcements and manage newsletters" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
            <CardDescription>Send a message to all members or specific boards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input 
                placeholder="Announcement title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea 
                placeholder="Your announcement message..." 
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <Button onClick={handleSendAnnouncement}>
              <Send className="w-4 h-4 mr-2" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcement History</CardTitle>
            <CardDescription>View past announcements and newsletters</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={announcements} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCommunications;
