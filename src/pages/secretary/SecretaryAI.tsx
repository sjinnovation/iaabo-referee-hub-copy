import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { SecretarySidebar } from "@/components/SecretarySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { Bot, AlertTriangle, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";
import { ComplianceAgentDemo } from "@/components/secretary/ComplianceAgentDemo";
import { CommunicationAssistantDemo } from "@/components/secretary/CommunicationAssistantDemo";
import { getRecentActivity } from "@/services/aiActivityLog";
import { getComplianceStats } from "@/utils/secretaryAIDemoData";
import { formatDistanceToNow } from "date-fns";

const SecretaryAI = () => {
  const [showComplianceDemo, setShowComplianceDemo] = useState(false);
  const [showCommDemo, setShowCommDemo] = useState(false);
  
  const stats = getComplianceStats();
  const recentActivity = getRecentActivity(undefined, 5);

  return (
    <DashboardLayout sidebar={<SecretarySidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="AI Assistants"
          subtitle="Intelligent board management assistance"
          actions={
            <div className="flex items-center gap-2 text-sm">
              <Bot className="w-4 h-4" />
              <span className="font-medium">Demo Mode Active</span>
              <Badge variant="secondary" className="text-xs">
                Preview Only
              </Badge>
            </div>
          }
        />

        {/* Hero Stats Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Assistants for Northeast Board 15</h2>
                <p className="text-muted-foreground">
                  Intelligent tools to save time and improve member engagement
                </p>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{stats.hoursThisMonth}</div>
                  <div className="text-sm text-muted-foreground">Hours Saved</div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{stats.responseRate}%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                  <div className="text-xs text-muted-foreground">AI-Sent Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{stats.actionsLast7Days}</div>
                  <div className="text-sm text-muted-foreground">AI Actions</div>
                  <div className="text-xs text-muted-foreground">Last 7 Days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proactive Compliance Agent */}
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Proactive Compliance & Follow-up Agent</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      LIVE DEMO
                    </Badge>
                  </div>
                  <CardDescription>Board-specific compliance tracking and member engagement</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Features for Board Secretaries</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Track member dues status and send reminders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Monitor training completion deadlines
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Identify at-risk members needing engagement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Generate board-specific compliance reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Automate member status updates
                </li>
              </ul>
            </div>
            <Button onClick={() => setShowComplianceDemo(!showComplianceDemo)}>
              {showComplianceDemo ? 'Hide Demo' : 'Try Demo'}
            </Button>
          </CardContent>
          {showComplianceDemo && <ComplianceAgentDemo />}
        </Card>

        {/* Smart Communication Assistant */}
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle>Smart Communication Assistant</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      LIVE DEMO
                    </Badge>
                  </div>
                  <CardDescription>AI-powered board announcements and member communications</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Draft board announcements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Create member reminder templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Personalize email messages
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Optimize send timing
                </li>
              </ul>
            </div>
            <Button onClick={() => setShowCommDemo(!showCommDemo)}>
              {showCommDemo ? 'Hide Demo' : 'Try Demo'}
            </Button>
          </CardContent>
          {showCommDemo && <CommunicationAssistantDemo />}
        </Card>

        {/* Recent AI Activity Feed */}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent AI Activity
              </CardTitle>
              <CardDescription>Automated actions performed by your AI assistants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm border-b pb-3 last:border-0">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground truncate">{activity.targetName}</p>
                      {activity.aiReasoning && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          AI: {activity.aiReasoning}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About AI Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI assistants are designed to help board secretaries save time on administrative tasks, 
              improve member engagement, and ensure compliance requirements are met. These intelligent 
              tools analyze your board's data and provide personalized recommendations and automated workflows.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryAI;
