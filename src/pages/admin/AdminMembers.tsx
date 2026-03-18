import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { FilterDropdown } from "@/components/FilterDropdown";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, UserPlus, Loader2, CheckCircle, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMemberStatusVariant } from "@/utils/memberStatus";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

interface Board {
  id: string;
  name: string;
  board_number: number;
}

interface Member {
  id: string;
  fullName: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  boardId: string | null;
  boardName: string;
  iaaboId: string | null;
  status: "active" | "pending" | "inactive" | "expired";
  joinDate: string;
  isActive: boolean;
  role: "member" | "public_user";
}

const AdminMembers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [boardFilter, setBoardFilter] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showProgressionDialog, setShowProgressionDialog] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    board_id: "",
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    board_id: "",
    iaabo_id: "",
    is_active: true,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("id, name, board_number")
        .order("board_number", { ascending: true });

      if (error) throw error;
      setBoards(data || []);
    } catch (error: any) {
      console.error("Error loading boards:", error.message);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["member", "public_user"]);

      if (rolesError) throw rolesError;

      if (!userRoles || userRoles.length === 0) {
        setMembers([]);
        return;
      }

      const userIds = userRoles.map(r => r.user_id);
      const rolesByUser = userRoles.reduce((acc, r) => {
        acc[r.user_id] = r.role as "member" | "public_user";
        return acc;
      }, {} as Record<string, "member" | "public_user">);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, email, first_name, last_name, phone, created_at, board_id, is_active, iaabo_id,
          board:boards!profiles_board_id_fkey(id, name, board_number)
        `)
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const membersList: Member[] = (profiles || []).map((profile: any) => {
        const role = rolesByUser[profile.id] || "public_user";
        const firstName = profile.first_name || "";
        const lastName = profile.last_name || "";
        return {
          id: profile.id,
          fullName: `${firstName} ${lastName}`.trim() || "Unknown",
          first_name: firstName,
          last_name: lastName,
          email: profile.email,
          phone: profile.phone || "",
          boardId: profile.board_id,
          boardName: profile.board?.name || "Unassigned",
          iaaboId: profile.iaabo_id ?? null,
          status: role === "public_user" ? "pending" : (profile.is_active ? "active" : "inactive"),
          joinDate: profile.created_at,
          isActive: profile.is_active,
          role: role,
        };
      });

      membersList.sort((a, b) => {
        if (a.role === "public_user" && b.role !== "public_user") return -1;
        if (a.role !== "public_user" && b.role === "public_user") return 1;
        return a.fullName.localeCompare(b.fullName);
      });

      setMembers(membersList);
    } catch (error: any) {
      toast({
        title: "Error loading members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.iaaboId && member.iaaboId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !statusFilter || member.status === statusFilter;
    const matchesBoard = !boardFilter || member.boardId === boardFilter;
    return matchesSearch && matchesStatus && matchesBoard;
  });

  const statusOptions = [
    { label: "Pending Approval", value: "pending" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" }
  ];

  const boardOptions = boards.map(board => ({
    label: board.name,
    value: board.id
  }));

  const handleApprove = async (memberId: string) => {
    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: "member" })
        .eq("user_id", memberId)
        .eq("role", "public_user");

      if (roleError) throw roleError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_active: true })
        .eq("id", memberId);

      if (profileError) throw profileError;

      setMembers(members.map(m => 
        m.id === memberId 
          ? { ...m, role: "member", status: "active", isActive: true } 
          : m
      ));

      toast({
        title: "Member Approved",
        description: "User has been approved and can now login to the portal",
      });
    } catch (error: any) {
      toast({
        title: "Error approving member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", memberId);

      if (error) throw error;

      setMembers(members.map(m => 
        m.id === memberId 
          ? { ...m, status: !currentStatus ? "active" : "inactive", isActive: !currentStatus } 
          : m
      ));

      toast({
        title: !currentStatus ? "Member Activated" : "Member Deactivated",
        description: `Member has been ${!currentStatus ? "activated" : "deactivated"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Board", "IAABO ID", "Status", "Join Date"].join(","),
      ...members.map(m => [
        `"${m.fullName}"`,
        m.email,
        m.phone,
        `"${m.boardName}"`,
        m.iaaboId || "",
        m.status,
        new Date(m.joinDate).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded",
    });
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setShowProgressionDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setNewMemberForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      board_id: "",
      is_active: true,
    });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewMemberForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      board_id: "",
      is_active: true,
    });
    setShowPassword(false);
  };

  const handleCreateMember = async () => {
    if (!newMemberForm.email || !newMemberForm.password || !newMemberForm.first_name || !newMemberForm.last_name) {
      toast({
        title: "Validation Error",
        description: "Email, password, first name, and last name are required",
        variant: "destructive",
      });
      return;
    }
    if (newMemberForm.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const signUpClient = createClient(
        import.meta.env.VITE_SUPABASE_URL || "https://wbwevpmcuvawykfyrxvi.supabase.co",
        import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        { auth: { persistSession: false, autoRefreshToken: false } }
      );
      const { data: authData, error: authError } = await signUpClient.auth.signUp({
        email: newMemberForm.email,
        password: newMemberForm.password,
        options: {
          data: {
            first_name: newMemberForm.first_name,
            last_name: newMemberForm.last_name,
          },
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: newMemberForm.first_name,
          last_name: newMemberForm.last_name,
          phone: newMemberForm.phone || "",
          board_id: newMemberForm.board_id || null,
          is_active: newMemberForm.is_active,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        toast({
          title: "Warning",
          description: "Member created but profile update failed. You may need to update the profile manually.",
          variant: "destructive",
        });
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: authData.user.id, role: "member" });

      if (roleError) {
        console.error("Role insert error:", roleError);
        toast({
          title: "Warning",
          description: "Member created but role assignment failed. Please assign the role manually.",
          variant: "destructive",
        });
      }

      toast({ title: "Member created successfully", description: `${newMemberForm.first_name} ${newMemberForm.last_name} has been added.` });
      handleCloseCreateDialog();
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error creating member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditDialog = (member: Member) => {
    setEditingMember(member);
    setEditForm({
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone || "",
      board_id: member.boardId || "",
      iaabo_id: member.iaaboId || "",
      is_active: member.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingMember(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim(),
          phone: editForm.phone || "",
          board_id: editForm.board_id || null,
          iaabo_id: editForm.iaabo_id.trim() || null,
          is_active: editForm.is_active,
        })
        .eq("id", editingMember.id);

      if (error) throw error;

      toast({ title: "Member updated successfully" });
      handleCloseEditDialog();
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteDialog = (member: Member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const member = memberToDelete;
    if (!member) return;
    setSaving(true);
    handleCloseDeleteDialog();
    try {
      const userId = member.id;

      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      toast({ title: "Member removed", description: `${member.fullName} has been removed from the member list.` });
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { 
      header: "Name",
      accessor: "fullName" as keyof Member
    },
    { header: "Email", accessor: "email" as keyof Member },
    { 
      header: "IAABO ID",
      accessor: (row: Member) => row.iaaboId || "—"
    },
    { 
      header: "Board",
      accessor: (row: Member) => row.boardName || "Unassigned"
    },
    { 
      header: "Status",
      accessor: (row: Member) => (
        <Badge variant={getMemberStatusVariant(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      )
    },
    { header: "Member Since", accessor: (row: Member) => new Date(row.joinDate).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row: Member) => (
        <div className="flex gap-2">
          {row.role === "public_user" ? (
            <>
              <Button 
                size="sm" 
                variant="default"
                onClick={() => handleApprove(row.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleOpenDeleteDialog(row)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleOpenEditDialog(row)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewMember(row)}
              >
                View
              </Button>
              <Button 
                size="sm" 
                variant={row.isActive ? "destructive" : "default"}
                onClick={() => handleToggleStatus(row.id, row.isActive)}
              >
                {row.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleOpenDeleteDialog(row)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const statItems = [
    { title: "Total Members", value: members.filter(m => m.role === "member").length },
    { title: "Pending Approval", value: members.filter(m => m.role === "public_user").length },
    { title: "Active", value: members.filter(m => m.role === "member" && m.status === "active").length },
    { title: "With Board", value: members.filter(m => m.boardId).length },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Members"
          subtitle="Manage all organization members"
          actions={
            <>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleOpenCreateDialog}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>Search, filter, and manage member accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search members..." />
              </div>
              <FilterDropdown 
                label="Status" 
                options={statusOptions} 
                value={statusFilter} 
                onChange={setStatusFilter}
              />
              <FilterDropdown 
                label="Board" 
                options={boardOptions} 
                value={boardFilter} 
                onChange={setBoardFilter}
              />
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No members found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter || boardFilter 
                    ? "Try adjusting your search or filters" 
                    : "Members will appear here once registered"}
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredMembers} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showProgressionDialog} onOpenChange={setShowProgressionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              {selectedMember?.fullName}
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold">{selectedMember.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IAABO ID</p>
                  <p className="text-sm font-semibold">{selectedMember.iaaboId || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Board</p>
                  <p className="text-sm font-semibold">{selectedMember.boardName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getMemberStatusVariant(selectedMember.status)}>
                    {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm font-semibold">{new Date(selectedMember.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) handleCloseCreateDialog(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Member</DialogTitle>
            <DialogDescription>
              Add a new member. They will receive an email to confirm their account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new_first_name">First Name *</Label>
                <Input
                  id="new_first_name"
                  value={newMemberForm.first_name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new_last_name">Last Name *</Label>
                <Input
                  id="new_last_name"
                  value={newMemberForm.last_name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_email">Email *</Label>
              <Input
                id="new_email"
                type="email"
                value={newMemberForm.email}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_password">Password *</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  value={newMemberForm.password}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_phone">Phone</Label>
              <Input
                id="new_phone"
                type="tel"
                value={newMemberForm.phone}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_board">Board</Label>
              <Select
                value={newMemberForm.board_id || "none"}
                onValueChange={(value) => setNewMemberForm({ ...newMemberForm, board_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Board</SelectItem>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      #{board.board_number} - {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_status">Status</Label>
              <Select
                value={newMemberForm.is_active ? "active" : "inactive"}
                onValueChange={(value) => setNewMemberForm({ ...newMemberForm, is_active: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDialog}>Cancel</Button>
            <Button onClick={handleCreateMember} disabled={saving}>
              {saving ? "Creating..." : "Create Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) handleCloseEditDialog(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              {editingMember && (
                <>Update details for <strong>{editingMember.fullName}</strong> ({editingMember.email})</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_iaabo_id">IAABO ID</Label>
              <Input
                id="edit_iaabo_id"
                value={editForm.iaabo_id}
                onChange={(e) => setEditForm({ ...editForm, iaabo_id: e.target.value })}
                placeholder="e.g. 12345"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_board">Board</Label>
              <Select
                value={editForm.board_id || "none"}
                onValueChange={(value) => setEditForm({ ...editForm, board_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Board</SelectItem>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      #{board.board_number} - {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={editForm.is_active ? "active" : "inactive"}
                onValueChange={(value) => setEditForm({ ...editForm, is_active: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) handleCloseDeleteDialog(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete && (
                <>
                  This will remove <strong>{memberToDelete.fullName}</strong> ({memberToDelete.email}) from the member list.
                  Their profile and roles will be deleted. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminMembers;
