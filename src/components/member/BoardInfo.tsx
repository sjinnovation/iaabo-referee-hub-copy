import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BoardInfoProps {
  primaryBoardId: string;
  primaryBoardName: string;
  secondaryBoardId?: string;
  secondaryBoardName?: string;
  isAssociateMember: boolean;
}

export function BoardInfo({ 
  primaryBoardName, 
  secondaryBoardName,
  isAssociateMember 
}: BoardInfoProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Board Assignment</CardTitle>
        <Building2 className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isAssociateMember ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg font-semibold">{primaryBoardName}</p>
                <Badge variant="outline" className="text-xs">Current</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Temporary holding board while completing training
              </p>
            </div>
            
            {secondaryBoardName && (
              <>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-semibold text-primary">{secondaryBoardName}</p>
                    <Badge className="text-xs">Future Board</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll be transferred after completing Rules Test
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold">{primaryBoardName}</p>
            <p className="text-xs text-muted-foreground mt-1">Active member board</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
