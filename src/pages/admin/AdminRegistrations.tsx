import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Registration } from "@/data/mockRegistrations";
import { DuplicateDetection } from "@/components/DuplicateDetection";
import { UserPlus, Mail, Phone, AlertCircle, UserCheck, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Board {
  id: string;
  name: string;
  board_number: number;
}

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicUsers();
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

  const fetchPublicUsers = async () => {
    try {
      setLoading(true);
      
      const { data: publicUserRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, created_at")
        .eq("role", "public_user");

      if (rolesError) throw rolesError;

      if (!publicUserRoles || publicUserRoles.length === 0) {
        setRegistrations([]);
        return;
      }

      const userIds = publicUserRoles.map(r => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, phone, created_at, board_id, is_active")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const roleCreatedAtMap = publicUserRoles.reduce((acc, role) => {
        acc[role.user_id] = role.created_at;
        return acc;
      }, {} as Record<string, string>);

      const regs: Registration[] = (profiles || []).map(profile => ({
        id: profile.id,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email,
        phone: profile.phone || "",
        courseEnrolled: "N/A",
        registrationDate: roleCreatedAtMap[profile.id] || profile.created_at,
        source: "iaabou" as const,
        status: profile.board_id 
          ? (profile.is_active ? "activated" : "board-assigned")
          : "pending-review" as const,
        duplicateChecked: false,
        hasDuplicate: false,
        createdProfileId: profile.id,
        assignedBoardId: profile.board_id || undefined,
      }));

      regs.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());

      setRegistrations(regs);
    } catch (error: any) {
      toast({
        title: "Error loading registrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (regId: string) => {
    const registration = registrations.find(r => r.id === regId);
    if (!registration) return;

    setRegistrations(registrations.map(reg => 
      reg.id === regId 
        ? { 
            ...reg, 
            status: 'profile-created',
            createdProfileId: reg.id,
            notes: `Profile ready for board assignment`
          }
        : reg
    ));

    toast({
      title: "Profile Ready",
      description: `Profile for ${registration.firstName} ${registration.lastName} is ready for board assignment`,
    });
  };

  const handleAssignBoard = async (regId: string, boardId: string) => {
    const registration = registrations.find(r => r.id === regId);
    const board = boards.find(b => b.id === boardId);
    if (!registration || !board) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ board_id: boardId })
        .eq("id", regId);

      if (error) throw error;

      setRegistrations(registrations.map(reg => 
        reg.id === regId 
          ? { 
              ...reg, 
              assignedBoardId: boardId,
              status: 'board-assigned',
              notes: `Assigned to ${board.name} - awaiting activation`
            }
          : reg
      ));

      toast({
        title: "Board Assigned",
        description: `Member assigned to ${board.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error assigning board",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleActivateMember = async (regId: string) => {
    const registration = registrations.find(r => r.id === regId);
    if (!registration) return;

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_active: true })
        .eq("id", regId);

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: "member" })
        .eq("user_id", regId)
        .eq("role", "public_user");

      if (roleError) throw roleError;

      setRegistrations(registrations.filter(reg => reg.id !== regId));

      toast({
        title: "Member Activated",
        description: "Member account activated and upgraded to member role",
      });
    } catch (error: any) {
      toast({
        title: "Error activating member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendEmailPreview = (reg: Registration) => {
    toast({
      title: "Email Preview",
      description: `Would send welcome email to ${reg.email}`,
    });
  };

  const getSourceBadge = (source: string) => (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      {source === 'iaabou' ? 'iaabou.org' : 'Manual'}
    </Badge>
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      'pending-review': { variant: 'secondary', label: 'Pending Review' },
      'duplicate-found': { variant: 'outline', label: 'Duplicate Found' },
      'profile-created': { variant: 'default', label: 'Profile Created' },
      'board-assigned': { variant: 'default', label: 'Board Assigned' },
      'activated': { variant: 'default', label: 'Activated' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const statItems = [
    { title: "Pending Review", value: registrations.filter(r => r.status === 'pending-review').length },
    { title: "Profiles Created", value: registrations.filter(r => r.status === 'profile-created').length },
    { title: "Board Assigned", value: registrations.filter(r => r.status === 'board-assigned').length },
    { title: "Activated", value: registrations.filter(r => r.status === 'activated').length },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="New Registrations"
          subtitle="Process new member registrations and create member profiles"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="space-y-4">
          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading registrations...</span>
              </CardContent>
            </Card>
          )}

          {!loading && registrations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No pending registrations</p>
                <p className="text-sm text-muted-foreground">New public user registrations will appear here</p>
              </CardContent>
            </Card>
          )}

          {!loading && registrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {registration.firstName} {registration.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Registered {formatDate(registration.registrationDate)}
                        </span>
                        {getSourceBadge(registration.source)}
                        {getStatusBadge(registration.status)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{registration.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{registration.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Member Registration Processing
                  </h4>
                  
                  {registration.status === 'pending-review' && (
                    <DuplicateDetection
                      email={registration.email}
                      firstName={registration.firstName}
                      lastName={registration.lastName}
                      phone={registration.phone}
                      onDuplicateFound={(member) => {
                        setRegistrations(registrations.map(reg => 
                          reg.id === registration.id 
                            ? { 
                                ...reg, 
                                duplicateChecked: true,
                                hasDuplicate: true,
                                duplicateMemberId: member.id,
                                status: 'duplicate-found',
                                notes: `Duplicate found: ${member.fullName} (${member.memberNumber})`
                              }
                            : reg
                        ));
                      }}
                      onNoDuplicate={() => {
                        setRegistrations(registrations.map(reg => 
                          reg.id === registration.id 
                            ? { ...reg, duplicateChecked: true, hasDuplicate: false }
                            : reg
                        ));
                      }}
                    />
                  )}

                  {registration.duplicateChecked && !registration.hasDuplicate && registration.status === 'pending-review' && (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleCreateProfile(registration.id)}
                        variant="default"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Member Profile
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Create new member profile in the database
                      </p>
                    </div>
                  )}

                  {registration.status === 'profile-created' && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Member profile created successfully. Assign to Holding Board 900 to begin training.
                      </p>
                      <Select onValueChange={(value) => handleAssignBoard(registration.id, value)}>
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Assign to Board" />
                        </SelectTrigger>
                        <SelectContent>
                          {boards.map(board => (
                            <SelectItem key={board.id} value={board.id}>
                              {board.name} (Board {board.board_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {registration.status === 'board-assigned' && (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleActivateMember(registration.id)}
                        variant="default"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Activate Member
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Send welcome email and grant system access
                      </p>
                    </div>
                  )}

                  {registration.status === 'duplicate-found' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        <strong>Action Required:</strong> This registration appears to be a duplicate.
                        Please review manually or contact the member.
                      </p>
                    </div>
                  )}
                </div>

                {registration.notes && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-900">{registration.notes}</p>
                  </div>
                )}

                {registration.status === 'activated' && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Registration complete - member activated
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendEmailPreview(registration)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Welcome Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRegistrations;
