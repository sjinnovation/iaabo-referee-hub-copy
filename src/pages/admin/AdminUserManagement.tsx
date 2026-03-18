import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit, Shield, Users, UserCheck, UserCog, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import type { AppRole } from "@/types/profile";

type AssignableRole = "secretary" | "admin" | "area_rep" | "member";

interface Board {
  id: string;
  name: string;
  board_number: number;
}

interface UserWithRoles {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  board_id: string | null;
  board?: Board | null;
  iaabo_id: string | null;
  roles: AppRole[];
}

const ASSIGNABLE_ROLES: { value: AssignableRole; label: string; description: string }[] = [
  { value: "secretary", label: "Secretary", description: "Manages board members and dues" },
  { value: "admin", label: "Admin", description: "Full administrative access" },
  { value: "area_rep", label: "Area Rep", description: "Regional representative" },
  { value: "member", label: "Member", description: "Standard member access" },
];

const getRoleBadgeVariant = (role: AppRole): "default" | "secondary" | "destructive" | "outline" => {
  switch (role) {
    case "super_admin":
      return "destructive";
    case "admin":
      return "default";
    case "secretary":
    case "area_rep":
      return "secondary";
    default:
      return "outline";
  }
};

const AdminUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState<AssignableRole | "">("");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive">("active");
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedIaaboId, setSelectedIaaboId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    board_id: "",
    is_active: true,
  });
  const [newUserRole, setNewUserRole] = useState<AssignableRole | "">("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, email, first_name, last_name, is_active, created_at, last_sign_in_at, board_id, iaabo_id,
          board:boards!profiles_board_id_fkey(id, name, board_number)
        `)
        .order("last_name", { ascending: true });

      if (profilesError) throw profilesError;

      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const rolesByUser = allRoles?.reduce((acc, role) => {
        if (!acc[role.user_id]) {
          acc[role.user_id] = [];
        }
        acc[role.user_id].push(role.role as AppRole);
        return acc;
      }, {} as Record<string, AppRole[]>) || {};

      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile: any) => ({
        ...profile,
        roles: rolesByUser[profile.id] || [],
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.iaabo_id && user.iaabo_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDialog = (user: UserWithRoles) => {
    setEditingUser(user);
    const assignableRoles = user.roles.filter((r): r is AssignableRole => r !== "public_user" && r !== "super_admin");
    setSelectedRole(assignableRoles.length > 0 ? assignableRoles[0] : "");
    setSelectedStatus(user.is_active ? "active" : "inactive");
    setSelectedBoard(user.board_id || "");
    setSelectedIaaboId(user.iaabo_id || "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setSelectedRole("");
    setSelectedStatus("active");
    setSelectedBoard("");
    setSelectedIaaboId("");
  };

  const handleOpenCreateDialog = () => {
    setNewUserForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      board_id: "",
      is_active: true,
    });
    setNewUserRole("");
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewUserForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      board_id: "",
      is_active: true,
    });
    setNewUserRole("");
    setShowPassword(false);
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.first_name || !newUserForm.last_name) {
      toast({
        title: "Validation Error",
        description: "Email, password, first name, and last name are required",
        variant: "destructive",
      });
      return;
    }

    if (newUserForm.password.length < 6) {
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
        import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid2V2cG1jdXZhd3lrZnlyeHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTA0MjcsImV4cCI6MjA4NzQyNjQyN30.aNSK_xoj7cyPPcYubEoO5YvG-_ZH44dKBywm9CCXrso",
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data: authData, error: authError } = await signUpClient.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          data: {
            first_name: newUserForm.first_name,
            last_name: newUserForm.last_name,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: newUserForm.first_name,
          last_name: newUserForm.last_name,
          phone: newUserForm.phone || "",
          board_id: newUserForm.board_id || null,
          is_active: newUserForm.is_active,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        toast({
          title: "Warning",
          description: "User created but profile update failed. The user may need to update their profile manually.",
          variant: "destructive",
        });
      }

      if (newUserRole) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: newUserRole });

        if (roleError) {
          console.error("Role insert error:", roleError);
          toast({
            title: "Warning", 
            description: "User created but role assignment failed. Please assign the role manually.",
            variant: "destructive",
          });
        }
      }

      toast({ title: "User created successfully", description: `${newUserForm.first_name} ${newUserForm.last_name} has been added.` });
      handleCloseCreateDialog();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_active: selectedStatus === "active",
          board_id: selectedBoard || null,
          iaabo_id: selectedIaaboId.trim() || null,
        })
        .eq("id", editingUser.id);

      if (profileError) throw profileError;

      const currentAssignableRoles = editingUser.roles.filter(
        (r): r is AssignableRole => r !== "public_user" && r !== "super_admin"
      );

      for (const role of currentAssignableRoles) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editingUser.id)
          .eq("role", role);

        if (error) throw error;
      }

      if (selectedRole) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: editingUser.id, role: selectedRole });

        if (error) throw error;
      }

      toast({ title: "User updated successfully" });
      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatLastLogin = (lastSignIn: string | null) => {
    if (!lastSignIn) return "Never";
    const date = new Date(lastSignIn);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const columns: { header: string; accessor: keyof UserWithRoles | ((row: UserWithRoles) => React.ReactNode) }[] = [
    { 
      header: "Name", 
      accessor: (row: UserWithRoles) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.first_name} {row.last_name}</span>
          <span className="text-sm text-muted-foreground">{row.email}</span>
        </div>
      )
    },
    {
      header: "IAABO ID",
      accessor: (row: UserWithRoles) => (
        <span className="text-sm font-mono">{row.iaabo_id || "—"}</span>
      )
    },
    {
      header: "Board",
      accessor: (row: UserWithRoles) => (
        row.board ? (
          <span className="text-sm">#{row.board.board_number} - {row.board.name}</span>
        ) : (
          <Badge variant="outline">No Board</Badge>
        )
      )
    },
    { 
      header: "Role",
      accessor: (row: UserWithRoles) => {
        const displayRoles = row.roles.filter(r => r !== "public_user");
        return (
          <div className="flex flex-wrap gap-1">
            {displayRoles.length > 0 ? (
              displayRoles.map(role => (
                <Badge key={role} variant={getRoleBadgeVariant(role)}>
                  {role.replace("_", " ")}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No role</Badge>
            )}
          </div>
        );
      }
    },
    { 
      header: "Status",
      accessor: (row: UserWithRoles) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      header: "Last Login",
      accessor: (row: UserWithRoles) => (
        <span className="text-sm text-muted-foreground">
          {formatLastLogin(row.last_sign_in_at)}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row: UserWithRoles) => {
        const isSuperAdmin = row.roles.includes("super_admin");
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOpenDialog(row)}
            disabled={isSuperAdmin}
            title={isSuperAdmin ? "Super Admin cannot be modified" : "Edit user"}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        );
      }
    }
  ];

  const adminCount = users.filter(u => u.roles.includes("admin") || u.roles.includes("super_admin")).length;
  const secretaryCount = users.filter(u => u.roles.includes("secretary")).length;
  const areaRepCount = users.filter(u => u.roles.includes("area_rep")).length;

  const statItems = [
    { title: "Total Users", value: users.length, icon: Users },
    { title: "Admins", value: adminCount, icon: Shield },
    { title: "Secretaries", value: secretaryCount, icon: UserCheck },
    { title: "Area Reps", value: areaRepCount, icon: UserCog },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          subtitle="Manage user roles and permissions"
          actions={
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage user roles. Assign roles like Secretary, Admin, Area Rep, and Member.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email, or role..." />
            </div>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : (
              <DataTable columns={columns} data={filteredUsers} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              {editingUser && (
                <>Update settings for <strong>{editingUser.first_name} {editingUser.last_name}</strong> ({editingUser.email})</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-iaabo-id">IAABO ID</Label>
              <Input
                id="edit-iaabo-id"
                value={selectedIaaboId}
                onChange={(e) => setSelectedIaaboId(e.target.value)}
                placeholder="e.g. 12345"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={selectedRole || "none"}
                onValueChange={(value) => setSelectedRole(value === "none" ? "" : value as AssignableRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Role</SelectItem>
                  {ASSIGNABLE_ROLES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-board">Board</Label>
              <Select
                value={selectedBoard || "none"}
                onValueChange={(value) => setSelectedBoard(value === "none" ? "" : value)}
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as "active" | "inactive")}
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
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user with assigned role. The user will receive an email to confirm their account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={newUserForm.first_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={newUserForm.last_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="board">Board</Label>
              <Select
                value={newUserForm.board_id || "none"}
                onValueChange={(value) => setNewUserForm({ ...newUserForm, board_id: value === "none" ? "" : value })}
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
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUserRole || "none"}
                onValueChange={(value) => setNewUserRole(value === "none" ? "" : value as AssignableRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Role</SelectItem>
                  {ASSIGNABLE_ROLES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newUserForm.is_active ? "active" : "inactive"}
                onValueChange={(value) => setNewUserForm({ ...newUserForm, is_active: value === "active" })}
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
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminUserManagement;
