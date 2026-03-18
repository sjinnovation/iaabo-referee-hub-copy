import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCompletion {
  id: string;
  memberName: string;
  email: string;
  courseName: string;
  completedDate: string;
  source: 'iaabou.org';
  statusUpdate: 'rules-test' | 'mechanics-course';
  emailSent: boolean;
  processed: boolean;
}

interface CourseCompletionHandlerProps {
  className?: string;
}

const mockCompletions: CourseCompletion[] = [
  {
    id: '1',
    memberName: 'John Smith',
    email: 'john.smith@email.com',
    courseName: 'Basketball Rules Test 2024-25',
    completedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'iaabou.org',
    statusUpdate: 'rules-test',
    emailSent: true,
    processed: true
  },
  {
    id: '2',
    memberName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    courseName: 'Basketball Mechanics Course',
    completedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: 'iaabou.org',
    statusUpdate: 'mechanics-course',
    emailSent: true,
    processed: true
  },
  {
    id: '3',
    memberName: 'Michael Brown',
    email: 'mbrown@email.com',
    courseName: 'Basketball Rules Test 2024-25',
    completedDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    source: 'iaabou.org',
    statusUpdate: 'rules-test',
    emailSent: false,
    processed: false
  },
];

export function CourseCompletionHandler({ className }: CourseCompletionHandlerProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusLabel = (statusUpdate: string) => {
    return statusUpdate === 'rules-test' ? 'Rules Test Complete' : 'Mechanics Complete';
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Recent Course Completions
        </CardTitle>
        <CardDescription>
          Automatic updates from iaabou.org course completion webhook
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockCompletions.map((completion) => (
            <div
              key={completion.id}
              className={cn(
                "p-4 rounded-lg border",
                completion.processed ? "bg-muted/50" : "bg-background border-primary/20"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{completion.memberName}</h4>
                    {completion.processed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{completion.email}</p>
                </div>
                <Badge variant={completion.processed ? "secondary" : "default"}>
                  {completion.processed ? "Processed" : "New"}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="font-medium">{completion.courseName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{formatDate(completion.completedDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status Update:</span>
                  <Badge variant="outline" className="text-xs">
                    {getStatusLabel(completion.statusUpdate)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                {completion.emailSent ? (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>Email sent</span>
                  </div>
                ) : (
                  <Button size="sm" variant="outline">
                    <Mail className="h-3 w-3 mr-1" />
                    Send Email
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Member
                </Button>
                {!completion.processed && (
                  <Button size="sm" variant="default" className="ml-auto">
                    Process Update
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}