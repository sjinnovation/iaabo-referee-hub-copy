import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { MessageSquare, UserPlus, AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { getActivityStats } from "@/services/aiActivityLog";

const AdminAI = () => {
  const navigate = useNavigate();
  const [stats] = useState(() => getActivityStats('onboarding', 'today'));

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="AI Assistants" subtitle="Intelligent automation and insights for your organization" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Actions Today" value={stats.total} />
          <StatCard title="Successful" value={stats.successful} />
          <StatCard title="Errors" value={stats.errors} />
        </div>

        {/* AI Agent 1: Intelligent Member Onboarding - LIVE */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Intelligent Member Onboarding Assistant</CardTitle>
                    <Badge className="bg-green-100 text-green-700 border-green-200">LIVE</Badge>
                  </div>
                  <CardDescription>Automated registration processing with AI intelligence</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Auto-process new registrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Match members to boards by location
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Link to LearnDash accounts automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Auto-enroll in Rules Test course
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Generate personalized welcome emails
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Time Saved</h4>
                <p className="text-3xl font-bold text-primary">~2-3 hrs</p>
                <p className="text-sm text-muted-foreground">per day for administrators</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => navigate('/admin/ai/onboarding')} className="gap-2">
                Open Assistant
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/registrations')}>
                View Registrations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Agent 2: Proactive Compliance & Follow-up - COMING SOON */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Proactive Compliance & Follow-up Agent</CardTitle>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      COMING SOON
                    </Badge>
                  </div>
                  <CardDescription>Automated tracking and reminders for compliance requirements</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Scan for overdue certifications
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Track outstanding dues
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Monitor incomplete training
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Generate personalized reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Flag pending board approvals
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Estimated Time Saved</h4>
                <p className="text-3xl font-bold text-muted-foreground">~1-2 hrs</p>
                <p className="text-sm text-muted-foreground">per day for board secretaries</p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Join Waitlist
            </Button>
          </CardContent>
        </Card>

        {/* AI Agent 3: Smart Communication Assistant - PLANNED */}
        <Card className="border-2 border-dashed opacity-75">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Smart Communication Assistant</CardTitle>
                    <Badge variant="outline">PLANNED</Badge>
                  </div>
                  <CardDescription>AI-powered content creation for announcements and newsletters</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Draft announcements automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Generate newsletters
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Suggest audience segmentation
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Optimize message timing
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Create quick reply templates
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Estimated Time Saved</h4>
                <p className="text-3xl font-bold text-muted-foreground">~1.5-2 hrs</p>
                <p className="text-sm text-muted-foreground">per day for communications</p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* How AI Helps Section */}
        <Card>
          <CardHeader>
            <CardTitle>How AI Assistants Help Your Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Save Time</h4>
                <p className="text-sm text-muted-foreground">
                  Automate repetitive tasks like registration processing, board matching, and follow-up reminders
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Reduce Errors</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered duplicate detection and data validation ensures accurate member records
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Improve Experience</h4>
                <p className="text-sm text-muted-foreground">
                  Faster onboarding and personalized communications create better member experiences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAI;
