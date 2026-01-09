import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Bike, 
  Star, 
  Package, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface RiderAssignmentProps {
  orderId: number;
  currentRiderId?: number | null;
  currentRiderName?: string | null;
  orderStatus: string;
  onAssigned?: () => void;
}

export function RiderAssignment({ 
  orderId, 
  currentRiderId, 
  currentRiderName,
  orderStatus,
  onAssigned 
}: RiderAssignmentProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [unassignReason, setUnassignReason] = useState("");

  const { data: availableRiders, isLoading: loadingRiders } = trpc.orders.getAvailableRiders.useQuery();
  
  const { data: riderStats } = trpc.orders.getRiderStats.useQuery(
    { riderId: selectedRiderId! },
    { enabled: !!selectedRiderId }
  );

  const assignMutation = trpc.orders.assignToRider.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Order assigned to ${result.rider?.name}`);
        setAssignDialogOpen(false);
        setSelectedRiderId(null);
        setNotes("");
        onAssigned?.();
      } else {
        toast.error("Failed to assign rider");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign rider");
    },
  });

  const unassignMutation = trpc.orders.unassignFromRider.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Rider unassigned from order");
        setUnassignDialogOpen(false);
        setUnassignReason("");
        onAssigned?.();
      } else {
        toast.error("Failed to unassign rider");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unassign rider");
    },
  });

  const handleAssign = () => {
    if (!selectedRiderId) {
      toast.error("Please select a rider");
      return;
    }
    assignMutation.mutate({
      orderId,
      riderId: selectedRiderId,
      notes: notes || undefined,
    });
  };

  const handleUnassign = () => {
    unassignMutation.mutate({
      orderId,
      reason: unassignReason || undefined,
    });
  };

  const canAssignRider = ["pending", "confirmed"].includes(orderStatus);
  const canUnassignRider = currentRiderId && ["rider_assigned"].includes(orderStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Rider Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentRiderId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{currentRiderName || `Rider #${currentRiderId}`}</p>
                  <Badge className="bg-green-100 text-green-700 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Assigned
                  </Badge>
                </div>
              </div>
              {canUnassignRider && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setUnassignDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Unassign
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {canAssignRider ? (
              <>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">No rider assigned</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Assign a rider to start delivery
                  </p>
                </div>
                <Button 
                  onClick={() => setAssignDialogOpen(true)}
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Assign Rider
                </Button>
              </>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500 text-sm">
                  Rider assignment not available for this order status
                </p>
              </div>
            )}
          </div>
        )}

        {/* Assign Rider Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Rider to Order</DialogTitle>
              <DialogDescription>
                Select an available rider to handle this delivery
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Select Rider</Label>
                <Select 
                  value={selectedRiderId?.toString() || ""} 
                  onValueChange={(v) => setSelectedRiderId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a rider" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingRiders ? (
                      <div className="p-2 text-center text-gray-500">Loading...</div>
                    ) : availableRiders?.length === 0 ? (
                      <div className="p-2 text-center text-gray-500">No riders available</div>
                    ) : (
                      availableRiders?.map((rider) => (
                        <SelectItem key={rider.id} value={rider.id.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{rider.name}</span>
                            <span className="text-gray-400">({rider.phone})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedRiderId && riderStats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <Package className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-700">{riderStats.activeOrders}</p>
                    <p className="text-xs text-blue-600">Active Orders</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{riderStats.completedToday}</p>
                    <p className="text-xs text-green-600">Today</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{riderStats.totalDeliveries}</p>
                    <p className="text-xs text-purple-600">Total</p>
                  </div>
                </div>
              )}

              <div>
                <Label>Assignment Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions for the rider..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={!selectedRiderId || assignMutation.isPending}
              >
                {assignMutation.isPending ? "Assigning..." : "Assign Rider"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unassign Rider Dialog */}
        <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unassign Rider</DialogTitle>
              <DialogDescription>
                Remove the current rider from this order
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  This will remove <strong>{currentRiderName}</strong> from the order and set the status back to "Confirmed".
                </p>
              </div>

              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={unassignReason}
                  onChange={(e) => setUnassignReason(e.target.value)}
                  placeholder="Why is the rider being unassigned?"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUnassignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleUnassign}
                disabled={unassignMutation.isPending}
              >
                {unassignMutation.isPending ? "Unassigning..." : "Unassign Rider"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default RiderAssignment;
