import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockRegistrations, Registration } from "@/data/mockRegistrations";
import { useAIOnboarding } from "@/hooks/useAIOnboarding";
import { getRecentActivity, AIActivity } from "@/services/aiActivityLog";
import { Bot, CheckCircle, AlertCircle, Clock, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminAIOnboarding = () => {
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const stored = localStorage.getItem('registrations');
    const storedRegs = stored ? JSON.parse(stored) : [];
    return [...storedRegs, ...mockRegistrations].filter(r => r.status === 'pending-review');
  });
  const [activities, setActivities] = useState<AIActivity[]>(() => getRecentActivity('onboarding', 10));
  const [processingDialog, setProcessingDialog] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [processingSteps, setProcessingSteps] = useState<{
    step: string;
    status: 'pending' | 'processing' | 'complete' | 'error';
    message?: string;
  }[]>([]);

  const { processRegistration } = useAIOnboarding();

  const handleAIProcess = async (registration: Registration) => {
    setCurrentRegistration(registration);
    setProcessingDialog(true);
    
    setProcessingSteps([
      { step: 'Duplicate Detection', status: 'processing' },
      { step: 'Board Matching', status: 'pending' },
      { step: 'Profile Creation', status: 'pending' },
      { step: 'LearnDash Linking', status: 'pending' },
      { step: 'Course Enrollment', status: 'pending' },
      { step: 'Welcome Email Generation', status: 'pending' },
    ]);

    try {
      const result = await processRegistration(registration.id, (step, status, message) => {
        setProcessingSteps(prev => prev.map(s => 
          s.step === step ? { ...s, status, message } : s
        ));
      });

      if (result.status === 'success') {
        toast({
          title: "AI Processing Complete",
          description: `Successfully processed ${registration.firstName} ${registration.lastName}`,
        });
        
        setRegistrations(prev => prev.filter(r => r.id !== registration.id));
        setActivities(getRecentActivity('onboarding', 10));
        
        setTimeout(() => setProcessingDialog(false), 2000);
      } else if (result.status === 'duplicate') {
        toast({
          title: "Duplicate Detected",
          description: "This registration appears to be a duplicate",
          variant: "destructive",
        });
      }
    } catch (_error) {
      toast({
        title: "Processing Error",
        description: "Failed to process registration",
        variant: "destructive",
      });
    }
  };

  const todayStats = {
    processed: activities.filter(a => a.status === 'success').length,
    pending: registrations.length,
    errors: activities.filter(a => a.status === 'error').length,
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="AI Onboarding Assistant" subtitle="Intelligent registration processing with AI" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Processed Today" value={todayStats.processed} />
          <StatCard title="Pending" value={todayStats.pending} />
          <StatCard title="Errors" value={todayStats.errors} />
        </div>

        {/* Pending Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Registrations ({registrations.length})</CardTitle>
            <CardDescription>New registrations ready for AI processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending registrations</p>
              </div>
            ) : (
              registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{reg.firstName} {reg.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{reg.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Course: {reg.courseEnrolled}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAIProcess(reg)}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Process with AI
                    </Button>
                    <Button variant="outline">Review Manually</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>AI Activity Log</CardTitle>
            <CardDescription>Recent automated actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground">{activity.targetName}</p>
                      {activity.aiReasoning && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          AI: {activity.aiReasoning}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Processing Dialog */}
        <Dialog open={processingDialog} onOpenChange={setProcessingDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>AI Processing: {currentRegistration?.firstName} {currentRegistration?.lastName}</DialogTitle>
              <DialogDescription>
                Intelligent automation in progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {processingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.step}</p>
                    {step.message && (
                      <p className="text-xs text-muted-foreground">{step.message}</p>
                    )}
                  </div>
                  {step.status === 'processing' && (
                    <Progress value={50} className="w-20" />
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminAIOnboarding;
