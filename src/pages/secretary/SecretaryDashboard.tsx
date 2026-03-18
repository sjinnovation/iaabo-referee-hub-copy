import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { SecretarySidebar } from "@/components/SecretarySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Users, GraduationCap, CheckCircle, UserPlus, UserX, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BoardMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface MemberProgression {
  id: string;
  user_id: string;
  step_type: string;
  status: string;
  completed_at: string | null;
}

interface Board {
  id: string;
  name: string;
  board_number: number;
}

const SecretaryDashboard = () => {
  const { user, profile } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [progressions, setProgressions] = useState<MemberProgression[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBoardData();
    }
  }, [user]);

  const fetchBoardData = async () => {
    if (!user) return;

    try {
      let boardData: Board | null = null;

      const { data: managedBoard } = await supabase
        .from("boards")
        .select("id, name, board_number")
        .eq("secretary_id", user.id)
        .maybeSingle();

      if (managedBoard) {
        boardData = managedBoard;
      } else if (profile?.board_id) {
        const { data: assignedBoard } = await supabase
          .from("boards")
          .select("id, name, board_number")
          .eq("id", profile.board_id)
          .single();
        boardData = assignedBoard;
      }

      setBoard(boardData);

      if (boardData) {
        const { data: boardMembers } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone, is_active, created_at")
          .eq("board_id", boardData.id)
          .order("last_name");

        setMembers(boardMembers || []);

        if (boardMembers && boardMembers.length > 0) {
          const memberIds = boardMembers.map(m => m.id);
          const { data: progressionData } = await supabase
            .from("member_progression")
            .select("id, user_id, step_type, status, completed_at")
            .in("user_id", memberIds);

          setProgressions(progressionData || []);
        }
      }
    } catch (error) {
      console.error("Error loading board data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.is_active).length;
  const inactiveMembers = members.filter(m => !m.is_active).length;

  const membersWithTraining = new Set(
    progressions
      .filter(p => p.step_type === "mechanics_course" && p.status === "completed")
      .map(p => p.user_id)
  );
  const trainingPercentage = totalMembers > 0
    ? Math.round((membersWithTraining.size / totalMembers) * 100)
    : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newMembers = members.filter(m => new Date(m.created_at) > thirtyDaysAgo);

  const membersNeedingAttention = members.filter(m => {
    if (!m.is_active) return true;
    const userProgs = progressions.filter(p => p.user_id === m.id);
    const hasPayment = userProgs.some(p => p.step_type === "payment" && p.status === "completed");
    return !hasPayment;
  }).slice(0, 5);

  const stats = [
    { title: "Total Members", value: totalMembers, icon: Users },
    { title: "Active", value: activeMembers, icon: CheckCircle },
    { title: "Inactive", value: inactiveMembers, icon: UserX },
    { title: "Training Complete", value: `${trainingPercentage}%`, icon: GraduationCap },
  ];

  const boardDisplayName = board
    ? `Board #${board.board_number} — ${board.name}`
    : "No Board Assigned";

  if (loading) {
    return (
      <DashboardLayout sidebar={<SecretarySidebar />}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<SecretarySidebar />}>
      <div className="space-y-6">
        <PageHeader title="Secretary Dashboard" subtitle={boardDisplayName} />

        {newMembers.length > 0 && (
          <Alert className="border-primary/50 bg-primary/5">
            <UserPlus className="h-4 w-4" />
            <AlertTitle>New Members</AlertTitle>
            <AlertDescription>
              {newMembers.length} new member{newMembers.length !== 1 ? "s have" : " has"} joined your board in the last 30 days.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {newMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recent Members
              </CardTitle>
              <CardDescription>
                Members who joined your board in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={member.is_active ? "default" : "outline"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Members Requiring Attention</CardTitle>
            <CardDescription>Members who are inactive or have incomplete requirements</CardDescription>
          </CardHeader>
          <CardContent>
            {membersNeedingAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All members are up to date.</p>
            ) : (
              <div className="space-y-4">
                {membersNeedingAttention.map((member) => {
                  const userProgs = progressions.filter(p => p.user_id === member.id);
                  let issue = "Incomplete requirements";
                  let severity = "Info";

                  if (!member.is_active) {
                    issue = "Account is inactive";
                    severity = "Urgent";
                  } else {
                    const hasRulesTest = userProgs.some(p => p.step_type === "rules_test" && p.status === "completed");
                    const hasMechanics = userProgs.some(p => p.step_type === "mechanics_course" && p.status === "completed");
                    const hasPayment = userProgs.some(p => p.step_type === "payment" && p.status === "completed");
                    if (!hasRulesTest) {
                      issue = "Rules test not completed";
                      severity = "Pending";
                    } else if (!hasMechanics) {
                      issue = "Mechanics course not completed";
                      severity = "Pending";
                    } else if (!hasPayment) {
                      issue = "Payment not completed";
                      severity = "Pending";
                    }
                  }

                  return (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-muted-foreground">{issue}</p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded bg-primary/10 text-primary">
                        {severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {!board && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No board assigned. Contact an administrator to be assigned to a board.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
