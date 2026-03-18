import DashboardLayout from "@/components/DashboardLayout";
import { MemberSidebar } from "@/components/MemberSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, AlertCircle, BookOpen, Building2, CreditCard, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

interface ProgressionStep {
  label: string;
  status: "completed" | "in_progress" | "pending";
  subtitle?: string;
  completedAt?: string | null;
  startedAt?: string | null;
  notes?: string | null;
}

interface BoardInfo {
  name: string;
  board_number: number;
}

interface DbProgressionStep {
  step_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

const MemberDashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [progressionData, setProgressionData] = useState<DbProgressionStep[]>([]);
  const [loadingProgression, setLoadingProgression] = useState(true);

  useEffect(() => {
    const fetchBoardInfo = async () => {
      if (profile?.board_id) {
        const { data } = await supabase
          .from("boards")
          .select("name, board_number")
          .eq("id", profile.board_id)
          .single();
        if (data) {
          setBoardInfo(data);
        }
      }
    };
    fetchBoardInfo();
  }, [profile?.board_id]);

  useEffect(() => {
    const fetchProgressionData = async () => {
      if (!profile?.id) return;

      setLoadingProgression(true);
      try {
        const { data, error } = await supabase
          .from("member_progression")
          .select("step_type, status, started_at, completed_at, notes")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching progression:", error);
        } else if (data) {
          setProgressionData(data);
        }
      } catch (error) {
        console.error("Error fetching progression:", error);
      } finally {
        setLoadingProgression(false);
      }
    };

    fetchProgressionData();
  }, [profile?.id]);

  if (authLoading || !profile) {
    return (
      <DashboardLayout sidebar={<MemberSidebar />}>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const memberId = boardInfo?.board_number ? `IAABO-${boardInfo.board_number}` : "IAABO-ADMIN";
  const isActive = profile.is_active;
  const memberStatus = isActive ? "active" : "training_in_progress";
  const boardName = boardInfo?.name || "Not Assigned";

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active Member";
      case "training_in_progress":
        return "Training in Progress";
      case "pending":
        return "Pending Approval";
      default:
        return "Training in Progress";
    }
  };

  // Map database progression data to UI format
  const mapDbStatusToUiStatus = (dbStatus: string): "completed" | "in_progress" | "pending" => {
    switch (dbStatus) {
      case "completed":
        return "completed";
      case "in_progress":
        return "in_progress";
      case "not_started":
      case "pending":
        return "pending";
      default:
        return "pending";
    }
  };

  const getStepLabel = (stepType: string): string => {
    switch (stepType) {
      case "registration":
        return "New Registration";
      case "rules_test":
        return "Rules Test";
      case "board_assignment":
        return "Board Assigned";
      case "mechanics_course":
        return "Mechanics Course";
      case "payment":
        return "Payment";
      case "active_member":
        return "Active Member";
      default:
        return stepType;
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  // Build progression steps from database data
  const progressionSteps: ProgressionStep[] = progressionData.length > 0
    ? progressionData.map((step) => {
        const status = mapDbStatusToUiStatus(step.status);
        let subtitle = "";
        
        if (status === "completed" && step.completed_at) {
          subtitle = `Completed on ${formatDate(step.completed_at)}`;
        } else if (status === "in_progress" && step.started_at) {
          subtitle = `Started on ${formatDate(step.started_at)}`;
        } else if (status === "pending") {
          subtitle = "Not started";
        }

        if (step.notes) {
          subtitle += subtitle ? ` • ${step.notes}` : step.notes;
        }

        return {
          label: getStepLabel(step.step_type),
          status,
          subtitle,
          completedAt: step.completed_at,
          startedAt: step.started_at,
          notes: step.notes,
        };
      })
    : [
        // Fallback progression if no data (should not happen after migration)
        { label: "New Registration", status: "completed" as const, subtitle: "Completed" },
        { label: "Rules Test", status: "pending" as const, subtitle: "Not started" },
        { label: "Board Assigned", status: "pending" as const, subtitle: "Not started" },
        { label: "Mechanics Course", status: "pending" as const, subtitle: "Not started" },
        { label: "Payment", status: "pending" as const, subtitle: "Not started" },
        { label: "Active Member", status: memberStatus === "active" ? "completed" as const : "pending" as const, subtitle: memberStatus === "active" ? "Completed" : "Not started" },
      ];

  const renderStepIcon = (status: ProgressionStep["status"]) => {
    if (status === "completed") {
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
      );
    }
    if (status === "in_progress") {
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gray-400" />
      </div>
    );
  };

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <PageHeader title={`Welcome Back, ${profile.first_name} ${profile.last_name}`} subtitle={`Member ID: ${memberId}`} />
        <div className="bg-red-600 text-white rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div>
              <p className="text-sm opacity-80">{boardName}</p>
            </div>
            <div className="flex gap-6">
             
              <div>
                <p className="text-xs opacity-70">Status</p>
                <p className="font-semibold">{getStatusLabel(memberStatus)}</p>
              </div>
            </div>
          </div>
          <p className="text-sm mt-3 opacity-90">
            Complete your training requirements to become an active IAABO member
          </p>
        </div>

        {/* Your Progression */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Your Progression</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your journey to becoming an active IAABO member
            </p>
          </CardHeader>
          <CardContent>
            {loadingProgression ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-0">
                {progressionSteps.map((step, index) => (
                  <div key={step.label} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {renderStepIcon(step.status)}
                      {index < progressionSteps.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="pt-1 flex-1">
                      <p className={`font-medium ${step.status === "in_progress" ? "text-red-600" : ""}`}>
                        {step.label}
                      </p>
                      {step.subtitle && (
                        <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Training Status */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Training Status</CardTitle>
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No active courses</p>
              </div>
            </CardContent>
          </Card>

          {/* Board Assignment */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Board Assignment</CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {boardName !== "Not Assigned" ? boardName : "Active member board"}
              </p>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Not Required Yet</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Payment to board required after Mechanics Course completion
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
