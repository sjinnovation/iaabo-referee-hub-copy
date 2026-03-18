import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressionStage {
  stage: 'new' | 'rules-test' | 'mechanics-course' | 'board-assigned' | 'active';
  label: string;
  date?: string;
}

interface MemberProgressionTimelineProps {
  currentStage: 'new' | 'rules-test' | 'mechanics-course' | 'board-assigned' | 'active';
  rulesTestCompletedDate?: string;
  mechanicsCompletedDate?: string;
  boardAssignmentDate?: string;
  className?: string;
}

const stages: Omit<ProgressionStage, 'date'>[] = [
  { stage: 'new', label: 'New Registration' },
  { stage: 'rules-test', label: 'Rules Test' },
  { stage: 'board-assigned', label: 'Board Assigned' },
  { stage: 'mechanics-course', label: 'Mechanics Course' },
  { stage: 'active', label: 'Active Member' }
];

export function MemberProgressionTimeline({
  currentStage,
  rulesTestCompletedDate,
  mechanicsCompletedDate,
  boardAssignmentDate,
  className
}: MemberProgressionTimelineProps) {
  const stageOrder: Record<string, number> = {
    'new': 0,
    'rules-test': 1,
    'board-assigned': 2,
    'mechanics-course': 3,
    'active': 4
  };

  const currentStageIndex = stageOrder[currentStage];

  const getStageDate = (stage: string): string | undefined => {
    switch (stage) {
      case 'rules-test':
        return rulesTestCompletedDate;
      case 'board-assigned':
        return boardAssignmentDate;
      case 'mechanics-course':
        return mechanicsCompletedDate;
      default:
        return undefined;
    }
  };

  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {stages.map((stage, index) => {
          const status = getStageStatus(index);
          const date = getStageDate(stage.stage);
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.stage} className="relative flex items-start pb-8 last:pb-0">
              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[15px] top-[32px] w-[2px] h-[calc(100%-8px)]",
                    status === 'completed' ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Stage Icon */}
              <div className="relative z-10 flex items-center justify-center">
                {status === 'completed' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <CheckCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                ) : status === 'current' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Stage Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      "font-medium",
                      status === 'completed' && "text-foreground",
                      status === 'current' && "text-primary font-semibold",
                      status === 'pending' && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </h4>
                  {date && (
                    <span className="text-sm text-muted-foreground">
                      {formatDate(date)}
                    </span>
                  )}
                </div>
                {status === 'current' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    In progress
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
