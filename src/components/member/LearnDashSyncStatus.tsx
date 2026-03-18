import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useLearnDashSync } from "@/hooks/useLearnDashSync";
import { cn } from "@/lib/utils";

interface LearnDashSyncStatusProps {
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  onRefresh: () => void;
}

export function LearnDashSyncStatus({
  loading,
  error,
  lastSync,
  onRefresh,
}: LearnDashSyncStatusProps) {
  const { statusColor, statusText } = useLearnDashSync(loading, error, lastSync);

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", statusColor)} />
        <span>{statusText}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
      </Button>
    </div>
  );
}
