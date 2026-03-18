import { useState } from "react";
import { Search, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockMembers } from "@/data/mockMembers";

interface DuplicateDetectionProps {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  onDuplicateFound?: (member: any) => void;
  onNoDuplicate?: () => void;
}

export function DuplicateDetection({ 
  email, 
  firstName, 
  lastName, 
  phone,
  onDuplicateFound,
  onNoDuplicate 
}: DuplicateDetectionProps) {
  const [checked, setChecked] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const checkForDuplicates = () => {
    // Check for duplicates in local database
    const found = mockMembers.filter(member => {
      const emailMatch = member.email.toLowerCase() === email.toLowerCase();
      const nameMatch = member.fullName.toLowerCase() === `${firstName} ${lastName}`.toLowerCase();
      const phoneMatch = member.phone === phone;
      
      return emailMatch || nameMatch || phoneMatch;
    });

    setDuplicates(found);
    setChecked(true);

    if (found.length === 0) {
      onNoDuplicate?.();
    } else {
      onDuplicateFound?.(found[0]);
    }
  };

  if (!checked) {
    return (
      <div className="flex items-center gap-3">
        <Button onClick={checkForDuplicates} variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Check for Duplicates
        </Button>
        <p className="text-sm text-muted-foreground">
          Search existing members in database
        </p>
      </div>
    );
  }

  if (duplicates.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">No Duplicates Found</p>
              <p className="text-sm text-green-700">Ready to create new member profile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-900">Potential Duplicates Found</p>
            <p className="text-sm text-yellow-700">{duplicates.length} existing member(s) match this registration</p>
          </div>
        </div>
        
        {duplicates.map((member) => (
          <div key={member.id} className="pl-9 pt-2 border-t border-yellow-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium text-yellow-900">{member.fullName}</p>
                <Badge variant="outline">{member.memberNumber}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-yellow-700">Email:</span> {member.email}
                </div>
                <div>
                  <span className="text-yellow-700">Phone:</span> {member.phone}
                </div>
                <div>
                  <span className="text-yellow-700">Board:</span> {member.boardName}
                </div>
                <div>
                  <span className="text-yellow-700">Status:</span>{" "}
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
