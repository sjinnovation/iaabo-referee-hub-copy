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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Board {
  id: string;
  name: string;
  board_number: number;
  region_id: string | null;
  secretary_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  region?: { id: string; short_name: string; full_name: string } | null;
  secretary?: { id: string; first_name: string; last_name: string; email: string } | null;
}

interface Region {
  id: string;
  short_name: string;
  full_name: string;
}

const AdminBoards = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    board_number: "",
    region_id: "",
    status: "active",
  });

  useEffect(() => {
    fetchBoards();
    fetchRegions();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select(`
          *,
          region:regions(id, short_name, full_name),
          secretary:profiles!boards_secretary_id_fkey(id, first_name, last_name, email)
        `)
        .order("board_number", { ascending: true });

      if (error) throw error;
      setBoards((data as unknown as Board[]) || []);
    } catch (error: any) {
      toast({
        title: "Error loading boards",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setRegions(data || []);
    } catch (error: any) {
      console.error("Error loading regions:", error.message);
    }
  };

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.region?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.board_number.toString().includes(searchQuery)
  );

  const handleOpenDialog = (board?: Board) => {
    if (board) {
      setEditingBoard(board);
      setFormData({
        name: board.name,
        board_number: board.board_number.toString(),
        region_id: board.region_id || "",
        status: board.status,
      });
    } else {
      setEditingBoard(null);
      setFormData({
        name: "",
        board_number: "",
        region_id: "",
        status: "active",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBoard(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.board_number) {
      toast({
        title: "Validation Error",
        description: "Name and Board Number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const boardData = {
        name: formData.name,
        board_number: parseInt(formData.board_number),
        region_id: formData.region_id || null,
        status: formData.status,
      };

      if (editingBoard) {
        const { error } = await supabase
          .from("boards")
          .update(boardData)
          .eq("id", editingBoard.id);

        if (error) throw error;
        toast({ title: "Board updated successfully" });
      } else {
        const { error } = await supabase
          .from("boards")
          .insert(boardData);

        if (error) throw error;
        toast({ title: "Board created successfully" });
      }

      handleCloseDialog();
      fetchBoards();
    } catch (error: any) {
      toast({
        title: "Error saving board",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (board: Board) => {
    setBoardToDelete(board);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!boardToDelete) return;

    try {
      const { error } = await supabase
        .from("boards")
        .delete()
        .eq("id", boardToDelete.id);

      if (error) throw error;
      toast({ title: "Board deleted successfully" });
      setDeleteDialogOpen(false);
      setBoardToDelete(null);
      fetchBoards();
    } catch (error: any) {
      toast({
        title: "Error deleting board",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const columns: { header: string; accessor: keyof Board | ((row: Board) => React.ReactNode) }[] = [
    { 
      header: "Board #", 
      accessor: "board_number" as keyof Board
    },
    { 
      header: "Board Name", 
      accessor: "name" as keyof Board
    },
    { 
      header: "Region", 
      accessor: (row: Board) => row.region?.full_name || <Badge variant="outline">No Region</Badge>
    },
    { 
      header: "Secretary",
      accessor: (row: Board) => row.secretary 
        ? `${row.secretary.first_name} ${row.secretary.last_name}`
        : <Badge variant="outline">Unassigned</Badge>
    },
    { 
      header: "Status",
      accessor: (row: Board) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: (row: Board) => (
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOpenDialog(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ];

  const statItems = [
    { title: "Total Boards", value: boards.length },
    { title: "Active Boards", value: boards.filter(b => b.status === "active").length },
    { title: "Unassigned Secretaries", value: boards.filter(b => !b.secretary_id).length },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Boards & Secretaries"
          subtitle="Manage local boards and secretary assignments"
          actions={
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Board
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Boards</CardTitle>
            <CardDescription>View and manage all local boards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search boards..." />
            </div>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading boards...</div>
            ) : (
              <DataTable columns={columns} data={filteredBoards} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBoard ? "Edit Board" : "Add New Board"}</DialogTitle>
            <DialogDescription>
              {editingBoard ? "Update the board details below." : "Fill in the details to create a new board."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Board Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Brooklyn Basketball Officials"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="board_number">Board Number *</Label>
              <Input
                id="board_number"
                type="number"
                value={formData.board_number}
                onChange={(e) => setFormData({ ...formData, board_number: e.target.value })}
                placeholder="e.g., 37"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.region_id}
                onValueChange={(value) => setFormData({ ...formData, region_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.full_name} ({region.short_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
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
            <Button onClick={handleSubmit}>{editingBoard ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{boardToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminBoards;
