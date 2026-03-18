import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MemberSidebar } from "@/components/MemberSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { FilterDropdown } from "@/components/FilterDropdown";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { resourceCategoryOptions } from "@/config/resourceCategories";
import { mockResources } from "@/data/mockResources";
import { Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MemberResources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const statItems = [
    { title: "Total Resources", value: mockResources.length },
    { title: "Rulebooks", value: mockResources.filter(r => r.category === "Rulebook").length },
    { title: "Sportorials", value: mockResources.filter(r => r.category === "Sportorial").length },
    { title: "Training", value: mockResources.filter(r => r.category === "Training").length },
  ];

  return (
    <DashboardLayout sidebar={<MemberSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Resources" subtitle="Access rulebooks, sportorials, and training materials" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resource Library</CardTitle>
            <CardDescription>Browse and download available resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{resource.title}</CardTitle>
                        <CardDescription className="mt-1">{resource.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{resource.category}</Badge>
                        <span className="text-sm text-muted-foreground">{resource.fileSize}</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => toast({ title: "Download", description: `Downloading ${resource.title}` })}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberResources;
