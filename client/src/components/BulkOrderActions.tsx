import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Progress } from "@/components/ui/progress";
import { 
  ChevronDown, 
  CheckSquare, 
  Truck, 
  XCircle, 
  Clock, 
  CheckCircle,
  User
} from "lucide-react";
import { toast } from "sonner";

interface BulkOrderActionsProps {
  selectedOrderIds: number[];
  onComplete: () => void;
  onClearSelection: () => void;
}

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed", icon: <CheckCircle className="h-4 w-4" /> },
  { value: "in_transit", label: "In Transit", icon: <Truck className="h-4 w-4" /> },
  { value: "delivered", label: "Delivered", icon: <CheckSquare className="h-4 w-4" /> },
  { value: "cancelled", label: "Cancelled", icon: <XCircle className="h-4 w-4" /> },
];

export function BulkOrderActions({ selectedOrderIds, onComplete, onClearSelection }: BulkOrderActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"status" | "rider">("status");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: availableRiders } = trpc.orders.getAvailableRiders.useQuery(undefined, {
    enabled: actionType === "rider" && dialogOpen,
  });

  const bulkStatusMutation = trpc.orders.bulkUpdateStatus.useMutation({
    onSuccess: (result) => {
      toast.success(`Updated ${result.success} orders successfully${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
      setDialogOpen(false);
      resetForm();
      onComplete();
      onClearSelection();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update orders");
      setIsProcessing(false);
    },
  });

  const bulkAssignMutation = trpc.orders.bulkAssignRider.useMutation({
    onSuccess: (result) => {
      toast.success(`Assigned ${result.success} orders successfully${result.failed > 0 ? `, ${result.failed} failed` : ""}`);
      setDialogOpen(false);
      resetForm();
      onComplete();
      onClearSelection();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign rider");
      setIsProcessing(false);
    },
  });

  const resetForm = () => {
    setSelectedStatus("");
    setSelectedRiderId(null);
    setNotes("");
    setIsProcessing(false);
    setProgress(0);
  };

  const handleOpenDialog = (type: "status" | "rider") => {
    setActionType(type);
    resetForm();
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (actionType === "status" && !selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    if (actionType === "rider" && !selectedRiderId) {
      toast.error("Please select a rider");
      return;
    }

    setIsProcessing(true);
    
    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      if (actionType === "status") {
        await bulkStatusMutation.mutateAsync({
          orderIds: selectedOrderIds,
          status: selectedStatus,
          notes: notes || undefined,
        });
      } else {
        await bulkAssignMutation.mutateAsync({
          orderIds: selectedOrderIds,
          riderId: selectedRiderId!,
        });
      }
      setProgress(100);
    } finally {
      clearInterval(progressInterval);
    }
  };

  if (selectedOrderIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-[#2D8659]/10 rounded-lg border border-[#2D8659]/20">
        <CheckSquare className="h-5 w-5 text-[#2D8659]" />
        <span className="font-medium text-[#2D8659]">
          {selectedOrderIds.length} order{selectedOrderIds.length > 1 ? "s" : ""} selected
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Bulk Actions
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenDialog("status")}>
              <Clock className="h-4 w-4 mr-2" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenDialog("rider")}>
              <User className="h-4 w-4 mr-2" />
              Assign Rider
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearSelection} className="text-gray-500">
              <XCircle className="h-4 w-4 mr-2" />
              Clear Selection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "status" ? "Bulk Update Status" : "Bulk Assign Rider"}
            </DialogTitle>
            <DialogDescription>
              This action will apply to {selectedOrderIds.length} selected order{selectedOrderIds.length > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === "status" ? (
              <>
                <div>
                  <Label>New Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this bulk update..."
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label>Select Rider</Label>
                <Select 
                  value={selectedRiderId?.toString() || ""} 
                  onValueChange={(v) => setSelectedRiderId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRiders?.map((rider) => (
                      <SelectItem key={rider.id} value={rider.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {rider.name} ({rider.phone})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing orders...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isProcessing || (actionType === "status" && !selectedStatus) || (actionType === "rider" && !selectedRiderId)}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BulkOrderActions;
