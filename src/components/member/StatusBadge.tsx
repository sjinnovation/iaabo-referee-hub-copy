import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  statusCode1: 'IUR' | 'AO';
  statusCode2: 'NEW' | 'M' | 'N';
  className?: string;
}

const statusDisplayText = {
  'IUR+NEW': 'IAABO University Rules + New Member',
  'AO+M': 'Associate Official + Mechanics',
  'AO+N': 'Associate Official + New Full Member'
};

const statusExplanations = {
  'IUR+NEW': 'Complete Rules Test to proceed to next stage',
  'AO+M': 'Complete Mechanics Course to become active member',
  'AO+N': 'Active member in good standing'
};

const statusColors = {
  'IUR+NEW': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  'AO+M': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  'AO+N': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
};

export function StatusBadge({ statusCode1, statusCode2, className }: StatusBadgeProps) {
  const statusKey = `${statusCode1}+${statusCode2}` as keyof typeof statusExplanations;
  const displayText = statusDisplayText[statusKey];
  const explanation = statusExplanations[statusKey];
  const colorClass = statusColors[statusKey];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "font-mono text-sm px-3 py-1",
              colorClass,
              className
            )}
          >
            {displayText}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
