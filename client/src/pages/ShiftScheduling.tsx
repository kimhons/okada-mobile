import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { SwipeableCard } from "@/components/SwipeableCard";
import { PullToRefresh } from "@/components/PullToRefresh";

/**
 * Mobile-Responsive Shift Scheduling Dashboard
 * Optimized for Flutter Web with touch-friendly interactions
 * Features: Calendar view, swipe gestures, bottom sheets, 48px tap targets
 */

type ViewMode = "month" | "week" | "day";
type ShiftStatus = "pending" | "confirmed" | "cancelled" | "completed";

export default function ShiftScheduling() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch shifts
  const { data: shifts, isLoading, refetch } = trpc.riderShifts.getShifts.useQuery({
    riderId: selectedRiderId === "all" ? undefined : parseInt(selectedRiderId),
    status: selectedStatus === "all" ? undefined : (selectedStatus as ShiftStatus),
    startDate: getStartOfPeriod(selectedDate, viewMode),
    endDate: getEndOfPeriod(selectedDate, viewMode),
  });

  // Mutations
  const createShiftMutation = trpc.riderShifts.createShift.useMutation({
    onSuccess: () => {
      toast.success("Shift created successfully");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create shift: ${error.message}`);
    },
  });

  const updateShiftStatusMutation = trpc.riderShifts.updateShiftStatus.useMutation({
    onSuccess: () => {
      toast.success("Shift status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update shift: ${error.message}`);
    },
  });

  const cancelShiftMutation = trpc.riderShifts.cancelShift.useMutation({
    onSuccess: () => {
      toast.success("Shift cancelled");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel shift: ${error.message}`);
    },
  });

  // Navigation handlers
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-background p-4 md:p-6">
        {/* Mobile-optimized header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Shift Scheduling</h1>
          <p className="text-muted-foreground">Manage rider shifts and schedules</p>
        </div>

        {/* Mobile-first controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Date navigation - Touch-friendly 48px buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={navigatePrevious}
                className="h-12 w-12 touch-manipulation"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 text-center">
                <div className="font-semibold text-lg">
                  {formatPeriodTitle(selectedDate, viewMode)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs text-muted-foreground"
                >
                  Today
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={navigateNext}
                className="h-12 w-12 touch-manipulation"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* View mode selector */}
            <div className="flex gap-2 mt-4">
              {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="flex-1 h-10 touch-manipulation capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </Card>

          {/* Filters - Collapsible on mobile */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1">Rider</Label>
                <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Riders</SelectItem>
                    {/* TODO: Load riders dynamically */}
                    <SelectItem value="1">Rider 1</SelectItem>
                    <SelectItem value="2">Rider 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex-1 h-12 touch-manipulation"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Shift
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="h-12 w-12 touch-manipulation"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Shifts list - Card-based for mobile */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))
          ) : shifts && shifts.length > 0 ? (
            shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onUpdateStatus={(status) =>
                  updateShiftStatusMutation.mutate({ shiftId: shift.id, status })
                }
                onCancel={() => cancelShiftMutation.mutate({ shiftId: shift.id })}
              />
            ))
          ) : (
            // Empty state
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No shifts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a shift to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
            </Card>
          )}
        </div>

        {/* Create shift dialog */}
        <CreateShiftDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={(data) => createShiftMutation.mutate(data)}
          isLoading={createShiftMutation.isPending}
        />
      </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}

// Shift card component - Touch-friendly with 48px height and swipe gestures
function ShiftCard({
  shift,
  onUpdateStatus,
  onCancel,
}: {
  shift: any;
  onUpdateStatus: (status: ShiftStatus) => void;
  onCancel: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Delete shift for Rider #${shift.riderId}?`)) {
      onCancel();
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleComplete = () => {
    onUpdateStatus("completed");
  };

  return (
    <SwipeableCard
      onDelete={shift.status !== "completed" ? handleDelete : undefined}
      onEdit={shift.status !== "completed" ? handleEdit : undefined}
      onComplete={shift.status === "confirmed" ? handleComplete : undefined}
      disabled={shift.status === "cancelled"}
    >
      <div className="p-4 touch-manipulation">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getStatusVariant(shift.status)}>{shift.status}</Badge>
            {shift.isRecurring && (
              <Badge variant="outline" className="text-xs">
                Recurring
              </Badge>
            )}
          </div>
          <div className="font-medium">{shift.shiftType || "Regular Shift"}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowActions(!showActions)}
          className="h-10 w-10"
        >
          •••
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Rider #{shift.riderId}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {new Date(shift.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(shift.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {shift.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{shift.location}</span>
          </div>
        )}
      </div>

      {/* Quick actions - Shown on tap */}
      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {shift.status === "pending" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus("confirmed")}
              className="flex-1 h-10"
            >
              Confirm
            </Button>
          )}
          {shift.status !== "cancelled" && shift.status !== "completed" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              className="flex-1 h-10"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
      </div>
    </SwipeableCard>
  );
}

// Create shift dialog
function CreateShiftDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    riderId: "",
    startTime: "",
    endTime: "",
    shiftType: "",
    location: "",
    notes: "",
    isRecurring: false,
    recurringPattern: "weekly",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      riderId: parseInt(formData.riderId),
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      shiftType: formData.shiftType || undefined,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
          <DialogDescription>Schedule a new shift for a rider</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="riderId">Rider *</Label>
            <Select
              value={formData.riderId}
              onValueChange={(value) => setFormData({ ...formData, riderId: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select rider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Rider 1</SelectItem>
                <SelectItem value="2">Rider 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="h-12"
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="h-12"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shiftType">Shift Type</Label>
            <Input
              id="shiftType"
              value={formData.shiftType}
              onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
              placeholder="e.g., Morning, Evening, Peak Hours"
              className="h-12"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Douala Downtown"
              className="h-12"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) =>
                setFormData({ ...formData, isRecurring: e.target.checked })
              }
              className="h-5 w-5"
            />
            <Label htmlFor="isRecurring">Recurring shift</Label>
          </div>

          {formData.isRecurring && (
            <div>
              <Label htmlFor="recurringPattern">Recurring Pattern</Label>
              <Select
                value={formData.recurringPattern}
                onValueChange={(value) =>
                  setFormData({ ...formData, recurringPattern: value })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-12">
              {isLoading ? "Creating..." : "Create Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
}

function formatPeriodTitle(date: Date, mode: ViewMode): string {
  if (mode === "month") {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } else if (mode === "week") {
    const start = getStartOfWeek(date);
    const end = getEndOfWeek(date);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

function getStartOfPeriod(date: Date, mode: ViewMode): Date {
  const result = new Date(date);
  if (mode === "month") {
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
  } else if (mode === "week") {
    return getStartOfWeek(date);
  } else {
    result.setHours(0, 0, 0, 0);
  }
  return result;
}

function getEndOfPeriod(date: Date, mode: ViewMode): Date {
  const result = new Date(date);
  if (mode === "month") {
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
  } else if (mode === "week") {
    return getEndOfWeek(date);
  } else {
    result.setHours(23, 59, 59, 999);
  }
  return result;
}

function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getEndOfWeek(date: Date): Date {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}
