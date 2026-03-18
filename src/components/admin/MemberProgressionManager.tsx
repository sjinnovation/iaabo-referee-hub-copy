import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

interface MemberProgressionManagerProps {
  userId: string;
  userName: string;
  onUpdate?: () => void;
}

type ProgressionStepType =
  | "registration"
  | "rules_test"
  | "board_assignment"
  | "mechanics_course"
  | "payment"
  | "active_member";

type ProgressionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "failed"
  | "waived";

const STEP_LABELS: Record<ProgressionStepType, string> = {
  registration: "New Registration",
  rules_test: "Rules Test",
  board_assignment: "Board Assignment",
  mechanics_course: "Mechanics Course",
  payment: "Payment",
  active_member: "Active Member",
};

const STATUS_LABELS: Record<ProgressionStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  failed: "Failed",
  waived: "Waived",
};

export function MemberProgressionManager({
  userId,
  userName,
  onUpdate,
}: MemberProgressionManagerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ProgressionStepType>("rules_test");
  const [selectedStatus, setSelectedStatus] = useState<ProgressionStatus>("completed");
  const [notes, setNotes] = useState("");

  const handleUpdateProgression = async () => {
    if (!selectedStep || !selectedStatus) {
      toast({
        title: "Validation Error",
        description: "Please select both step and status",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the database function to update progression
      const { error } = await (supabase.rpc as any)("update_progression_step", {
        p_user_id: userId,
        p_step_type: selectedStep,
        p_status: selectedStatus,
        p_notes: notes.trim() || null,
        p_metadata: null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Progression updated for ${userName}`,
      });

      setOpen(false);
      setNotes("");
      onUpdate?.();
    } catch (error) {
      console.error("Error updating progression:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update progression",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Update Progression
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Member Progression</DialogTitle>
          <DialogDescription>
            Update progression step for {userName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="step">Progression Step</Label>
            <Select
              value={selectedStep}
              onValueChange={(value) => setSelectedStep(value as ProgressionStepType)}
            >
              <SelectTrigger id="step">
                <SelectValue placeholder="Select step" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STEP_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ProgressionStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this progression update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Quick Actions:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Mark steps as "Completed" when member finishes them</li>
              <li>• Use "In Progress" for ongoing activities</li>
              <li>• "Waived" for exempted requirements</li>
              <li>• Board assignment and activation update automatically</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateProgression} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Progression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
