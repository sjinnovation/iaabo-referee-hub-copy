import { useState } from "react";
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
import { resourceCategoryOptions } from "@/config/resourceCategories";
import { mockResources } from "@/data/mockResources";
import { Upload, Download, Edit, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminResources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [resources] = useState(mockResources);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    toast({
      title: "Upload Resource",
      description: "File upload dialog would open here",
    });
  };

  const columns = [
    { 
      header: "",
      accessor: () => <FileText className="w-5 h-5 text-muted-foreground" />
    },
    { header: "Title", accessor: "title" },
    { header: "Description", accessor: "description" },
    { 
      header: "Category",
      accessor: (row: any) => <Badge variant="outline">{row.category}</Badge>
    },
    { header: "Size", accessor: "fileSize" },
    { header: "Uploaded", accessor: (row: any) => row.createdAt.split('T')[0] },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toast({ title: "Download", description: `Downloading ${row.title}` })}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toast({ title: "Edit Resource", description: `Editing ${row.title}` })}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const statItems = [
    { title: "Total Resources", value: resources.length },
    { title: "Rulebooks", value: resources.filter(r => r.category === "Rulebook").length },
    { title: "Sportorials", value: resources.filter(r => r.category === "Sportorial").length },
    { title: "Training Materials", value: resources.filter(r => r.category === "Training").length },
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader
          title="Resources"
          subtitle="Manage organization documents and materials"
          actions={
            <Button onClick={handleUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
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
            <CardTitle>All Resources</CardTitle>
            <CardDescription>Search and manage resource library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search resources..." />
              </div>
              <FilterDropdown 
                label="Category" 
                options={resourceCategoryOptions} 
                value={categoryFilter} 
                onChange={setCategoryFilter}
              />
            </div>
            <DataTable columns={columns} data={filteredResources} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminResources;
