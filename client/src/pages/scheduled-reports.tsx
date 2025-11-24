import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Calendar, Clock, Mail, Trash2, Edit, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export default function ScheduledReports() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [periodType, setPeriodType] = useState<"week" | "month" | "quarter" | "year">("month");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [time, setTime] = useState("09:00");
  const [recipients, setRecipients] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const { data: scheduledReports = [], isLoading, refetch } = trpc.scheduledReports.list.useQuery({
    reportType: "transaction_analytics",
  });

  const createMutation = trpc.scheduledReports.create.useMutation({
    onSuccess: () => {
      toast.success("Scheduled report created successfully");
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create scheduled report");
    },
  });

  const updateMutation = trpc.scheduledReports.update.useMutation({
    onSuccess: () => {
      toast.success("Scheduled report updated successfully");
      setEditingReport(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update scheduled report");
    },
  });

  const toggleActiveMutation = trpc.scheduledReports.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const deleteMutation = trpc.scheduledReports.delete.useMutation({
    onSuccess: () => {
      toast.success("Scheduled report deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete scheduled report");
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setPeriodType("month");
    setFrequency("weekly");
    setDayOfWeek(1);
    setDayOfMonth(1);
    setTime("09:00");
    setRecipients("");
    setCustomMessage("");
  };

  const handleCreate = () => {
    createMutation.mutate({
      name,
      description: description || undefined,
      reportType: "transaction_analytics",
      periodType,
      frequency,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      time,
      recipients,
      customMessage: customMessage || undefined,
      isActive: true,
    });
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    setName(report.name);
    setDescription(report.description || "");
    setPeriodType(report.periodType);
    setFrequency(report.frequency);
    setDayOfWeek(report.dayOfWeek || 1);
    setDayOfMonth(report.dayOfMonth || 1);
    setTime(report.time);
    setRecipients(report.recipients);
    setCustomMessage(report.customMessage || "");
  };

  const handleUpdate = () => {
    if (!editingReport) return;

    updateMutation.mutate({
      id: editingReport.id,
      name,
      description: description || undefined,
      periodType,
      frequency,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      time,
      recipients,
      customMessage: customMessage || undefined,
    });
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !isActive });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const getFrequencyLabel = (freq: string, dayOfWeek?: number | null, dayOfMonth?: number | null) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (freq === "daily") return "Daily";
    if (freq === "weekly" && dayOfWeek !== null && dayOfWeek !== undefined) {
      return `Weekly on ${days[dayOfWeek]}`;
    }
    if (freq === "monthly" && dayOfMonth) {
      return `Monthly on day ${dayOfMonth}`;
    }
    return freq;
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      week: "Week over Week",
      month: "Month over Month",
      quarter: "Quarter over Quarter",
      year: "Year over Year",
    };
    return labels[period] || period;
  };

  const formatNextRun = (nextRunAt: string | Date | null) => {
    if (!nextRunAt) return "Not scheduled";
    const date = new Date(nextRunAt);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Reports</h1>
          <p className="text-muted-foreground mt-1">
            Automate transaction analytics reports with recurring email delivery
          </p>
        </div>
        <Dialog open={showCreateDialog || !!editingReport} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingReport(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReport ? "Edit" : "Create"} Scheduled Report</DialogTitle>
              <DialogDescription>
                Set up automated delivery of transaction analytics reports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  placeholder="Weekly Transaction Summary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description of this scheduled report"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodType">Period Type *</Label>
                  <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
                    <SelectTrigger id="periodType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week over Week</SelectItem>
                      <SelectItem value="month">Month over Month</SelectItem>
                      <SelectItem value="quarter">Quarter over Quarter</SelectItem>
                      <SelectItem value="year">Year over Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {frequency === "weekly" && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of Week *</Label>
                  <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === "monthly" && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of Month *</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="time">Time (24-hour format) *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients *</Label>
                <Input
                  id="recipients"
                  placeholder="email@example.com, another@example.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple emails with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Add a message to include in the email..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingReport(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingReport ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingReport ? "Update" : "Create"} Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading scheduled reports...</div>
      ) : scheduledReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
            <p className="text-muted-foreground mb-4">
              Create your first automated report schedule
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scheduledReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{report.name}</CardTitle>
                      <Badge variant={report.isActive ? "default" : "secondary"}>
                        {report.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {report.lastRunStatus && (
                        <Badge variant={report.lastRunStatus === "success" ? "default" : "destructive"}>
                          Last: {report.lastRunStatus}
                        </Badge>
                      )}
                    </div>
                    {report.description && (
                      <CardDescription>{report.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(report.id, report.isActive)}
                      title={report.isActive ? "Pause" : "Resume"}
                    >
                      {report.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(report)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(report.id, report.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Period Type</div>
                    <div className="font-medium">{getPeriodLabel(report.periodType)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Frequency
                    </div>
                    <div className="font-medium">
                      {getFrequencyLabel(report.frequency, report.dayOfWeek, report.dayOfMonth)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Time
                    </div>
                    <div className="font-medium">{report.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Recipients
                    </div>
                    <div className="font-medium">
                      {report.recipients.split(',').length} recipient(s)
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Run: </span>
                      <span>{report.lastRunAt ? new Date(report.lastRunAt).toLocaleString() : "Never"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Run: </span>
                      <span className="font-medium">{formatNextRun(report.nextRunAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

