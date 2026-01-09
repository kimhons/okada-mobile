import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Moon, 
  Plus, 
  Trash2, 
  Edit, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function DNDSettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("07:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [muteSounds, setMuteSounds] = useState(true);
  const [muteDesktopNotifications, setMuteDesktopNotifications] = useState(true);
  const [muteEmailNotifications, setMuteEmailNotifications] = useState(false);
  const [allowUrgent, setAllowUrgent] = useState(true);

  const { data: schedules = [], refetch } = trpc.dnd.getSchedules.useQuery();
  const { data: dndStatus } = trpc.dnd.checkStatus.useQuery();

  const createMutation = trpc.dnd.createSchedule.useMutation({
    onSuccess: () => {
      toast.success("DND schedule created");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create schedule");
    },
  });

  const updateMutation = trpc.dnd.updateSchedule.useMutation({
    onSuccess: () => {
      toast.success("DND schedule updated");
      setDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });

  const deleteMutation = trpc.dnd.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success("DND schedule deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete schedule");
    },
  });

  const toggleMutation = trpc.dnd.toggleSchedule.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setEditingSchedule(null);
    setName("");
    setStartTime("22:00");
    setEndTime("07:00");
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    setMuteSounds(true);
    setMuteDesktopNotifications(true);
    setMuteEmailNotifications(false);
    setAllowUrgent(true);
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setName(schedule.name);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setSelectedDays(schedule.daysOfWeek.split(",").map(Number));
    setMuteSounds(schedule.muteSounds);
    setMuteDesktopNotifications(schedule.muteDesktopNotifications);
    setMuteEmailNotifications(schedule.muteEmailNotifications);
    setAllowUrgent(schedule.allowUrgent);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a schedule name");
      return;
    }

    const data = {
      name,
      startTime,
      endTime,
      daysOfWeek: selectedDays.sort().join(","),
      muteSounds,
      muteDesktopNotifications,
      muteEmailNotifications,
      allowUrgent,
    };

    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatDays = (daysStr: string) => {
    const days = daysStr.split(",").map(Number);
    if (days.length === 7) return "Every day";
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
    return days.map((d) => DAYS_OF_WEEK[d]?.label).join(", ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Do Not Disturb
            </CardTitle>
            <CardDescription>
              Schedule quiet hours to mute notifications
            </CardDescription>
          </div>
          {dndStatus?.isDND && (
            <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1">
              <Moon className="h-3 w-3" />
              DND Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Moon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No DND schedules configured</p>
            <p className="text-sm">Create a schedule to mute notifications during specific hours</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 rounded-lg border ${
                  schedule.isActive ? "bg-purple-50 border-purple-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: schedule.id, isActive: checked })
                      }
                    />
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                        <span>•</span>
                        <span>{formatDays(schedule.daysOfWeek)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {schedule.muteSounds && (
                        <Badge variant="outline" className="text-xs">Sounds</Badge>
                      )}
                      {schedule.muteDesktopNotifications && (
                        <Badge variant="outline" className="text-xs">Desktop</Badge>
                      )}
                      {schedule.allowUrgent && (
                        <Badge variant="outline" className="text-xs bg-yellow-50">Urgent OK</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteMutation.mutate({ id: schedule.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add DND Schedule
        </Button>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Edit DND Schedule" : "Create DND Schedule"}
              </DialogTitle>
              <DialogDescription>
                Configure when to mute notifications
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Schedule Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Night Mode, Weekend Quiet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Days of Week</Label>
                <div className="flex gap-2 mt-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        selectedDays.includes(day.value)
                          ? "bg-[#2D8659] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>What to Mute</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notification Sounds</span>
                    <Switch checked={muteSounds} onCheckedChange={setMuteSounds} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Desktop Notifications</span>
                    <Switch
                      checked={muteDesktopNotifications}
                      onCheckedChange={setMuteDesktopNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Switch
                      checked={muteEmailNotifications}
                      onCheckedChange={setMuteEmailNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Allow Urgent Alerts</span>
                  <p className="text-xs text-gray-500">
                    Critical notifications will still come through
                  </p>
                </div>
                <Switch checked={allowUrgent} onCheckedChange={setAllowUrgent} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingSchedule ? "Update" : "Create"} Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default DNDSettings;
