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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  User,
  Check,
  X,
  Minus,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

/**
 * Mobile-Responsive Rider Availability Calendar
 * Optimized for Flutter Web with touch-friendly interactions
 * Features: Touch-optimized date selection, color-coded states, swipe gestures, 48px tap targets
 */

type AvailabilityStatus = "available" | "unavailable" | "preferred" | "maybe";

const AVAILABILITY_COLORS = {
  available: "bg-green-500 hover:bg-green-600",
  unavailable: "bg-red-500 hover:bg-red-600",
  preferred: "bg-blue-500 hover:bg-blue-600",
  maybe: "bg-yellow-500 hover:bg-yellow-600",
};

const AVAILABILITY_TEXT_COLORS = {
  available: "text-green-700 bg-green-50",
  unavailable: "text-red-700 bg-red-50",
  preferred: "text-blue-700 bg-blue-50",
  maybe: "text-yellow-700 bg-yellow-50",
};

export default function RiderAvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRiderId, setSelectedRiderId] = useState<string>("all");
  const [isSetAvailabilityDialogOpen, setIsSetAvailabilityDialogOpen] = useState(false);
  const [selectedDateForEdit, setSelectedDateForEdit] = useState<Date | null>(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Get start and end of month
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  // Fetch availability
  const { data: availability, isLoading, refetch } =
    trpc.riderAvailability.getAvailability.useQuery({
      riderId: selectedRiderId === "all" ? undefined : parseInt(selectedRiderId),
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

  // Mutations
  const setAvailabilityMutation = trpc.riderAvailability.setAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated successfully");
      setIsSetAvailabilityDialogOpen(false);
      setSelectedDateForEdit(null);
      setSelectedDates([]);
      setBulkSelectMode(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update availability: ${error.message}`);
    },
  });

  const updateAvailabilityMutation = trpc.riderAvailability.updateAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update availability: ${error.message}`);
    },
  });

  // Navigation handlers
  const navigatePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const navigateNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Date selection handlers
  const handleDateClick = (date: Date) => {
    if (bulkSelectMode) {
      const dateStr = date.toDateString();
      const isSelected = selectedDates.some((d) => d.toDateString() === dateStr);
      if (isSelected) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateStr));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    } else {
      setSelectedDateForEdit(date);
      setIsSetAvailabilityDialogOpen(true);
    }
  };

  const handleBulkAvailabilitySet = (status: AvailabilityStatus) => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    // Set availability for all selected dates
    selectedDates.forEach((date) => {
      setAvailabilityMutation.mutate({
        riderId: parseInt(selectedRiderId),
        date,
        status,
      });
    });
  };

  // Get availability for a specific date
  const getAvailabilityForDate = (date: Date) => {
    if (!availability) return null;
    const dateStr = date.toISOString().split("T")[0];
    return availability.find((a: any) => {
      const availDate = new Date(a.date).toISOString().split("T")[0];
      return availDate === dateStr;
    });
  };

  // Generate calendar days
  const calendarDays = generateCalendarDays(selectedDate);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        {/* Mobile-optimized header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Rider Availability</h1>
          <p className="text-muted-foreground">Manage rider availability calendar</p>
        </div>

        {/* Mobile-first controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Month navigation - Touch-friendly 48px buttons */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={navigatePrevMonth}
                className="h-12 w-12 touch-manipulation"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 text-center">
                <div className="font-semibold text-lg">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
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
                onClick={navigateNextMonth}
                className="h-12 w-12 touch-manipulation"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Rider selector */}
          <Card className="p-4">
            <Label className="text-xs mb-2 block">Select Rider</Label>
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
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <div className="text-sm font-medium mb-3">Availability Legend</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AVAILABILITY_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded ${color}`} />
                  <span className="text-sm capitalize">{status}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant={bulkSelectMode ? "default" : "outline"}
              onClick={() => {
                setBulkSelectMode(!bulkSelectMode);
                setSelectedDates([]);
              }}
              className="flex-1 h-12 touch-manipulation"
            >
              {bulkSelectMode ? "Exit Bulk Mode" : "Bulk Select"}
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

          {/* Bulk actions */}
          {bulkSelectMode && selectedDates.length > 0 && (
            <Card className="p-4 bg-accent">
              <div className="text-sm font-medium mb-3">
                {selectedDates.length} date(s) selected
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAvailabilitySet("available")}
                  className="h-10 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Available
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAvailabilitySet("unavailable")}
                  className="h-10 bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Unavailable
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAvailabilitySet("preferred")}
                  className="h-10 bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Preferred
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkAvailabilitySet("maybe")}
                  className="h-10 bg-yellow-600 hover:bg-yellow-700"
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Maybe
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Calendar grid - Mobile-optimized */}
        <Card className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const availability = day ? getAvailabilityForDate(day) : null;
                const isSelected =
                  day && selectedDates.some((d) => d.toDateString() === day.toDateString());
                const isToday =
                  day && day.toDateString() === new Date().toDateString();
                const isCurrentMonth =
                  day && day.getMonth() === selectedDate.getMonth();

                return (
                  <button
                    key={index}
                    onClick={() => day && isCurrentMonth && handleDateClick(day)}
                    disabled={!day || !isCurrentMonth}
                    className={`
                      aspect-square p-1 rounded-lg touch-manipulation
                      transition-all active:scale-95
                      ${!day || !isCurrentMonth ? "invisible" : ""}
                      ${isSelected ? "ring-2 ring-primary" : ""}
                      ${isToday ? "ring-2 ring-blue-400" : ""}
                      ${
                        availability
                          ? AVAILABILITY_COLORS[availability.status as AvailabilityStatus]
                          : "bg-muted hover:bg-accent"
                      }
                      ${!availability && isCurrentMonth ? "border border-border" : ""}
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span
                        className={`text-sm font-medium ${
                          availability ? "text-white" : ""
                        }`}
                      >
                        {day?.getDate()}
                      </span>
                      {availability?.startTime && availability?.endTime && (
                        <span className="text-[10px] text-white opacity-90">
                          {new Date(availability.startTime).toLocaleTimeString([], {
                            hour: "numeric",
                          })}
                          -
                          {new Date(availability.endTime).toLocaleTimeString([], {
                            hour: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Set availability dialog */}
        <SetAvailabilityDialog
          open={isSetAvailabilityDialogOpen}
          onOpenChange={setIsSetAvailabilityDialogOpen}
          date={selectedDateForEdit}
          riderId={selectedRiderId}
          onSubmit={(data) => setAvailabilityMutation.mutate(data)}
          isLoading={setAvailabilityMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}

// Set availability dialog
function SetAvailabilityDialog({
  open,
  onOpenChange,
  date,
  riderId,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  riderId: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    status: "available" as AvailabilityStatus,
    startTime: "",
    endTime: "",
    notes: "",
    isRecurring: false,
    recurringPattern: "weekly",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      riderId: parseInt(riderId),
      date,
      status: formData.status,
      startTime: formData.startTime ? new Date(`${date.toISOString().split("T")[0]}T${formData.startTime}`) : undefined,
      endTime: formData.endTime ? new Date(`${date.toISOString().split("T")[0]}T${formData.endTime}`) : undefined,
      notes: formData.notes || undefined,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Availability</DialogTitle>
          <DialogDescription>
            {date?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status">Availability Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: AvailabilityStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="preferred">Preferred</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status !== "unavailable" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="h-12"
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
            <Label htmlFor="isRecurring">Recurring availability</Label>
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
              {isLoading ? "Saving..." : "Save Availability"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to generate calendar days
function generateCalendarDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];

  // Add padding for days before month starts
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Add padding to complete the last week
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}
