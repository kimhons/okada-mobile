import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Ban, CheckCircle, Clock, History } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface SuspensionDialogProps {
  userId: number;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SuspensionDuration = "7_days" | "30_days" | "90_days" | "permanent";

const DURATION_OPTIONS: { value: SuspensionDuration; label: string }[] = [
  { value: "7_days", label: "7 Days" },
  { value: "30_days", label: "30 Days" },
  { value: "90_days", label: "90 Days" },
  { value: "permanent", label: "Permanent" },
];

const REASON_PRESETS = [
  "Violation of terms of service",
  "Fraudulent activity",
  "Spam or abuse",
  "Multiple account violations",
  "Payment fraud",
  "Harassment or inappropriate behavior",
];

export function SuspensionDialog({
  userId,
  userName,
  isOpen,
  onClose,
  onSuccess,
}: SuspensionDialogProps) {
  const [duration, setDuration] = useState<SuspensionDuration>("7_days");
  const [reason, setReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: suspensionHistory = [], isLoading: historyLoading } = 
    trpc.users.getSuspensionHistory.useQuery(
      { userId },
      { enabled: isOpen && showHistory }
    );

  const suspendMutation = trpc.users.suspend.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User suspended successfully");
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suspend user");
    },
  });

  const unsuspendMutation = trpc.users.unsuspend.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "User reactivated successfully");
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate user");
    },
  });

  const handleClose = () => {
    setDuration("7_days");
    setReason("");
    setShowHistory(false);
    onClose();
  };

  const handleSuspend = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }
    suspendMutation.mutate({ userId, reason: reason.trim(), duration });
  };

  const handleUnsuspend = () => {
    unsuspendMutation.mutate({ userId });
  };

  const formatHistoryDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Account Suspension
          </DialogTitle>
          <DialogDescription>
            Manage suspension status for <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Suspension Form */}
          {!showHistory && (
            <>
              <div className="space-y-2">
                <Label htmlFor="duration">Suspension Duration</Label>
                <Select
                  value={duration}
                  onValueChange={(v) => setDuration(v as SuspensionDuration)}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Suspension</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for suspension..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {REASON_PRESETS.map((preset) => (
                    <Badge
                      key={preset}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setReason(preset)}
                    >
                      {preset}
                    </Badge>
                  ))}
                </div>
              </div>

              {duration === "permanent" && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <strong>Warning:</strong> Permanent suspension cannot be automatically lifted. 
                    The user will need to be manually unsuspended by an admin.
                  </div>
                </div>
              )}
            </>
          )}

          {/* Suspension History */}
          {showHistory && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <History className="h-4 w-4" />
                Suspension History
              </div>
              
              {historyLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto" />
                </div>
              ) : suspensionHistory.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No suspension history found
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {suspensionHistory.map((entry: { action: string; createdAt: Date | string; details: string }, index: number) => {
                    const details = parseDetails(entry.details);
                    const isSuspension = entry.action === "user_suspended";
                    
                    return (
                      <div
                        key={`history-${entry.createdAt}-${index}`}
                        className={`p-3 rounded-lg border ${
                          isSuspension ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isSuspension ? (
                            <Ban className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium text-sm">
                            {isSuspension ? "Suspended" : "Reactivated"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatHistoryDate(entry.createdAt)}
                          </span>
                        </div>
                        {isSuspension && details.reason && (
                          <p className="text-sm text-gray-600 ml-6">
                            Reason: {details.reason}
                          </p>
                        )}
                        {isSuspension && details.duration && (
                          <p className="text-xs text-gray-500 ml-6 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration: {details.duration.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="sm:mr-auto"
          >
            <History className="h-4 w-4 mr-2" />
            {showHistory ? "Back to Form" : "View History"}
          </Button>
          
          {!showHistory && (
            <>
              <Button
                variant="outline"
                onClick={handleUnsuspend}
                disabled={unsuspendMutation.isPending}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Reactivate Account
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={suspendMutation.isPending || !reason.trim()}
              >
                <Ban className="h-4 w-4 mr-2" />
                {suspendMutation.isPending ? "Suspending..." : "Suspend User"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SuspensionDialog;
