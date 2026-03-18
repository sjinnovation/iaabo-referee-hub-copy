import DashboardLayout from "@/components/DashboardLayout";
import { SecretarySidebar } from "@/components/SecretarySidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { mockAnnouncements } from "@/data/mockAnnouncements";
import { Megaphone } from "lucide-react";

const SecretaryAnnouncements = () => {
  return (
    <DashboardLayout sidebar={<SecretarySidebar />}>
      <div className="space-y-6">
        <PageHeader title="Announcements" subtitle="Organization-wide news and updates" />

        <div className="space-y-4">
          {mockAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{announcement.author}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{announcement.date}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    announcement.priority === "high" ? "default" : 
                    announcement.priority === "medium" ? "outline" : 
                    "secondary"
                  }>
                    {announcement.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryAnnouncements;
