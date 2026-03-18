import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { SecretarySidebar } from "@/components/SecretarySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Users, UserCheck, UserX, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

interface Board {
  id: string;
  name: string;
  board_number: number;
}

const SecretaryMembers = () => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBoardAndMembers();
    }
  }, [user]);

  const fetchBoardAndMembers = async () => {
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
      }
    } catch (error: any) {
      console.error("Error loading members:", error);
      toast({
        title: "Error loading members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (memberId: string, currentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentlyActive })
        .eq("id", memberId);

      if (error) throw error;

      setMembers(prev =>
        prev.map(m => m.id === memberId ? { ...m, is_active: !currentlyActive } : m)
      );

      toast({
        title: currentlyActive ? "Member deactivated" : "Member activated",
        description: `Member has been ${currentlyActive ? "deactivated" : "activated"} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.phone.includes(query)
    );
  });

  const columns: { header: string; accessor: keyof BoardMember | ((row: BoardMember) => React.ReactNode) }[] = [
    {
      header: "Name",
      accessor: (row: BoardMember) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.first_name} {row.last_name}</span>
          <span className="text-sm text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone" },
    {
      header: "Status",
      accessor: (row: BoardMember) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Member Since",
      accessor: (row: BoardMember) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (row: BoardMember) => (
        <Button
          size="sm"
          variant={row.is_active ? "outline" : "default"}
          onClick={() => handleToggleActive(row.id, row.is_active)}
        >
          {row.is_active ? (
            <>
              <UserX className="w-4 h-4 mr-1" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-1" />
              Activate
            </>
          )}
        </Button>
      ),
    },
  ];

  const activeCount = members.filter(m => m.is_active).length;
  const inactiveCount = members.filter(m => !m.is_active).length;

  const statItems = [
    { title: "Total Members", value: members.length, icon: Users },
    { title: "Active", value: activeCount, icon: UserCheck },
    { title: "Inactive", value: inactiveCount, icon: UserX },
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
        <PageHeader title="Board Members" subtitle={boardDisplayName} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member List</CardTitle>
            <CardDescription>Manage members in your board</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email, or phone..." />
            </div>
            {!board ? (
              <p className="text-center py-8 text-muted-foreground">
                No board assigned. Contact an administrator to be assigned to a board.
              </p>
            ) : (
              <DataTable columns={columns} data={filteredMembers} emptyMessage="No members found in your board." />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryMembers;
