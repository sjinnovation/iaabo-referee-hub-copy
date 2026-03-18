import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Region {
  id: string;
  short_name: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

const AdminRegions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [formData, setFormData] = useState({
    short_name: "",
    full_name: "",
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setRegions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading regions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions.filter(region =>
    region.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      setFormData({
        short_name: region.short_name,
        full_name: region.full_name,
      });
    } else {
      setEditingRegion(null);
      setFormData({
        short_name: "",
        full_name: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRegion(null);
  };

  const handleSubmit = async () => {
    if (!formData.short_name || !formData.full_name) {
      toast({
        title: "Validation Error",
        description: "Short Name and Full Name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const regionData = {
        short_name: formData.short_name,
        full_name: formData.full_name,
      };

      if (editingRegion) {
        const { error } = await supabase
          .from("regions")
          .update(regionData)
          .eq("id", editingRegion.id);

        if (error) throw error;
        toast({ title: "Region updated successfully" });
      } else {
        const { error } = await supabase
          .from("regions")
          .insert(regionData);

        if (error) throw error;
        toast({ title: "Region created successfully" });
      }

      handleCloseDialog();
      fetchRegions();
    } catch (error: any) {
      toast({
        title: "Error saving region",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (region: Region) => {
    setRegionToDelete(region);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!regionToDelete) return;

    try {
      const { error } = await supabase
        .from("regions")
        .delete()
        .eq("id", regionToDelete.id);

      if (error) throw error;
      toast({ title: "Region deleted successfully" });
      setDeleteDialogOpen(false);
      setRegionToDelete(null);
      fetchRegions();
    } catch (error: any) {
      toast({
        title: "Error deleting region",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: { header: string; accessor: keyof Region | ((row: Region) => React.ReactNode) }[] = [
    { 
      header: "Short Name", 
      accessor: "short_name" as keyof Region
    },
    { 
      header: "Full Name", 
      accessor: "full_name" as keyof Region
    },
    { 
      header: "Created", 
      accessor: (row: Region) => formatDate(row.created_at)
    },
    { 
      header: "Updated", 
      accessor: (row: Region) => formatDate(row.updated_at)
    },
    {
      header: "Actions",
      accessor: (row: Region) => (
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
    { title: "Total Regions", value: regions.length, icon: MapPin },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Regions"
          subtitle="Manage geographic regions for organizing boards"
          actions={
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Region
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
            <CardTitle>All Regions</CardTitle>
            <CardDescription>View and manage all geographic regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search regions..." />
            </div>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading regions...</div>
            ) : (
              <DataTable columns={columns} data={filteredRegions} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRegion ? "Edit Region" : "Add New Region"}</DialogTitle>
            <DialogDescription>
              {editingRegion ? "Update the region details below." : "Fill in the details to create a new region."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="short_name">Short Name *</Label>
              <Input
                id="short_name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="e.g., NE, SE, MW"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g., Northeast, Southeast, Midwest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingRegion ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Region</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{regionToDelete?.full_name}"? This action cannot be undone.
              Note: Boards associated with this region will have their region reference removed.
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

export default AdminRegions;
