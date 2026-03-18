import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";
import { Link2, LinkIcon, ExternalLink, RefreshCw } from "lucide-react";
import { mockMembers } from "@/data/mockMembers";
import {
  autoLinkMembers,
  getMemberLearnDashId,
  linkMemberToLearnDash,
  unlinkMember,
  findLearnDashUserByEmail,
} from "@/services/learndashUserMapping";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminLearnDash = () => {
  const [members, setMembers] = useState(mockMembers);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);
  const [manualUserId, setManualUserId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Refresh linked status from localStorage
  const refreshLinkStatus = () => {
    setMembers([...mockMembers]);
  };

  useEffect(() => {
    refreshLinkStatus();
  }, []);

  const linkedCount = members.filter(m => getMemberLearnDashId(m.id) !== null).length;
  const notLinkedCount = members.length - linkedCount;

  const handleAutoLink = async () => {
    setLoading(true);
    try {
      const membersToLink = members.map(m => ({
        id: m.id,
        email: m.email,
        fullName: m.fullName,
      }));

      const results = await autoLinkMembers(membersToLink);
      
      toast.success(`Linked ${results.linked} members to LearnDash`, {
        description: results.notFound.length > 0 
          ? `${results.notFound.length} members not found in LearnDash`
          : undefined,
      });

      refreshLinkStatus();
    } catch (_error) {
      toast.error("Failed to auto-link members");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLink = async () => {
    if (!selectedMember || !manualUserId) return;

    const userId = parseInt(manualUserId);
    if (isNaN(userId)) {
      toast.error("Please enter a valid LearnDash User ID");
      return;
    }

    linkMemberToLearnDash(selectedMember.id, userId, selectedMember.email);
    toast.success(`Linked ${selectedMember.fullName} to LearnDash`);
    refreshLinkStatus();
    setDialogOpen(false);
    setManualUserId("");
  };

  const handleSearchByEmail = async (email: string) => {
    setLoading(true);
    try {
      const userId = await findLearnDashUserByEmail(email);
      if (userId) {
        toast.success(`Found LearnDash user with ID: ${userId}`);
        setManualUserId(userId.toString());
      } else {
        toast.error("No LearnDash user found with this email");
      }
    } catch (_error) {
      toast.error("Failed to search LearnDash");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = (memberId: string) => {
    unlinkMember(memberId);
    toast.success("Member unlinked from LearnDash");
    refreshLinkStatus();
  };

  const columns = [
    {
      header: "Name",
      accessor: (member: typeof members[0]) => member.fullName,
    },
    {
      header: "Email",
      accessor: (member: typeof members[0]) => member.email,
    },
    {
      header: "Member Number",
      accessor: (member: typeof members[0]) => member.memberNumber,
    },
    {
      header: "LearnDash ID",
      accessor: (member: typeof members[0]) => {
        const ldId = getMemberLearnDashId(member.id);
        return ldId ? ldId : "-";
      },
    },
    {
      header: "Link Status",
      accessor: (member: typeof members[0]) => {
        const ldId = getMemberLearnDashId(member.id);
        return ldId ? (
          <Badge variant="default" className="gap-1">
            <Link2 className="w-3 h-3" />
            Linked
          </Badge>
        ) : (
          <Badge variant="secondary">Not Linked</Badge>
        );
      },
    },
    {
      header: "Actions",
      accessor: (member: typeof members[0]) => {
        const ldId = getMemberLearnDashId(member.id);
        return (
          <div className="flex gap-2">
            {ldId ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://iaabou.org/wp-admin/user-edit.php?user_id=${ldId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnlink(member.id)}
                >
                  Unlink
                </Button>
              </>
            ) : (
              <Dialog open={dialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) {
                  setSelectedMember(member);
                  setManualUserId("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link to LearnDash</DialogTitle>
                    <DialogDescription>
                      Link {member.fullName} to their LearnDash account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email: {member.email}</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleSearchByEmail(member.email)}
                        disabled={loading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Search LearnDash by Email
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="learndash-id">LearnDash User ID</Label>
                      <Input
                        id="learndash-id"
                        type="number"
                        value={manualUserId}
                        onChange={(e) => setManualUserId(e.target.value)}
                        placeholder="Enter LearnDash User ID"
                      />
                    </div>
                    <Button onClick={handleManualLink} disabled={!manualUserId} className="w-full">
                      Link Account
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="LearnDash Integration" subtitle="Manage member connections to IAABO University (LearnDash)" />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Members" value={members.length} />
          <StatCard title="Linked to LearnDash" value={linkedCount} />
          <StatCard title="Not Linked" value={notLinkedCount} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
            <CardDescription>
              Automatically link members to their LearnDash accounts by email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAutoLink} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Auto-Link All by Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Mappings</CardTitle>
            <CardDescription>
              View and manage LearnDash account connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={members} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminLearnDash;
