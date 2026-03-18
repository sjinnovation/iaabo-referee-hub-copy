import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockMembers } from "@/data/mockMembers";

interface RevSecSearchToolProps {
  onSelectMember?: (member: any) => void;
}

export function RevSecSearchTool({ onSelectMember }: RevSecSearchToolProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof mockMembers>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = mockMembers.filter(member => 
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or last name..."
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>
          Search RefSec
        </Button>
      </div>

      {hasSearched && (
        <div className="space-y-3">
          {searchResults.length === 0 ? (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-destructive text-xl">✗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-destructive">Not Found in RefSec</p>
                    <p className="text-sm text-muted-foreground">No member found with this email or name</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((member) => (
              <Card key={member.id} className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-xl">✓</span>
                        </div>
                        <div>
                          <p className="font-semibold text-primary">Found in RefSec</p>
                          <p className="text-sm font-medium">{member.fullName}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pl-13">
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{member.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{member.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Board Assignment</p>
                          <p className="text-sm font-medium">{member.boardName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Join Date</p>
                          <p className="text-sm font-medium">{new Date(member.joinDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Member Number</p>
                          <p className="text-sm font-medium">{member.memberNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    {onSelectMember && (
                      <Button 
                        variant="default" 
                        onClick={() => onSelectMember(member)}
                        className="ml-4"
                      >
                        Use This Member
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
