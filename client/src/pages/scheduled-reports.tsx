import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Calendar, Plus, Edit, Trash2, Play, Pause } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function ScheduledReports() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  
  // Filters
  const [frequencyFilter, setFrequencyFilter] = useState<string>("");
  
  // Form state
  const [name, setName] = useState("");
  const [reportId, setReportId] = useState<number | undefined>(undefined);
  const [frequency, setFrequency] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(undefined);
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [recipients, setRecipients] = useState("");
  const [formatType, setFormatType] = useState("pdf");
  const [isActive, setIsActive] = useState(true);

  const { data: schedules, isLoading, refetch } = trpc.reports.getAllScheduledReports.useQuery({
    frequency: frequencyFilter || undefined,
  });

  const { data: reports } = trpc.reports.getAllReports.useQuery({});

  const createScheduleMutation = trpc.reports.createScheduledReport.useMutation();
  const updateScheduleMutation = trpc.reports.updateScheduledReport.useMutation();
  const deleteScheduleMutation = trpc.reports.deleteScheduledReport.useMutation();

  const handleCreate = () => {
    setName("");
    setReportId(undefined);
    setFrequency("");
    setDayOfWeek(undefined);
    setDayOfMonth(undefined);
    setTime("09:00");
    setRecipients("");
    setFormatType("pdf");
    setIsActive(true);
    setCreateDialogOpen(true);
  };

  const confirmCreate = async () => {
    if (!name || !reportId || !frequency || !time || !recipients) {
      toast.error("All fields are required");
      return;
    }

    if (frequency === "weekly" && dayOfWeek === undefined) {
      toast.error("Please select a day of the week");
      return;
    }

    if (frequency === "monthly" && !dayOfMonth) {
      toast.error("Please select a day of the month");
      return;
    }

    try {
      await createScheduleMutation.mutateAsync({
        name,
        reportId,
        frequency: frequency as any,
        dayOfWeek,
        dayOfMonth,
        time,
        recipients,
        format: formatType as any,
        isActive,
      });

      toast.success("Scheduled report created successfully");
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create scheduled report");
    }
  };

  const handleEdit = (schedule: any) => {
    setSelectedSchedule(schedule);
    setName(schedule.name);
    setReportId(schedule.reportId);
    setFrequency(schedule.frequency);
    setDayOfWeek(schedule.dayOfWeek);
    setDayOfMonth(schedule.dayOfMonth);
    setTime(schedule.time);
    setRecipients(schedule.recipients);
    setFormatType(schedule.format);
    setIsActive(schedule.isActive);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedSchedule || !name || !reportId || !frequency || !time || !recipients) {
      toast.error("All fields are required");
      return;
    }

    try {
      await updateScheduleMutation.mutateAsync({
        id: selectedSchedule.id,
        name,
        reportId,
        frequency: frequency as any,
        dayOfWeek,
        dayOfMonth,
        time,
        recipients,
        format: formatType as any,
        isActive,
      });

      toast.success("Scheduled report updated successfully");
      setEditDialogOpen(false);
      setSelectedSchedule(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update scheduled report");
    }
  };

  const handleDelete = (schedule: any) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSchedule) return;

    try {
      await deleteScheduleMutation.mutateAsync({ id: selectedSchedule.id });
      toast.success("Scheduled report deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedSchedule(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete scheduled report");
    }
  };

  const handleToggleActive = async (schedule: any) => {
    try {
      await updateScheduleMutation.mutateAsync({
        id: schedule.id,
        isActive: !schedule.isActive,
      });
      toast.success(`Schedule ${schedule.isActive ? "paused" : "activated"}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  const clearFilters = () => {
    setFrequencyFilter("");
  };

  // Stats
  const totalSchedules = schedules?.length || 0;
  const activeSchedules = schedules?.filter(s => s.isActive).length || 0;
  const pausedSchedules = totalSchedules - activeSchedules;
  const dailySchedules = schedules?.filter(s => s.frequency === "daily").length || 0;

  // Get report name by ID
  const getReportName = (reportId: number) => {
    const report = reports?.find(r => r.id === reportId);
    return report?.name || `Report #${reportId}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              Scheduled Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Automate report generation and email delivery
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSchedules}</div>
              <p className="text-xs text-muted-foreground">All scheduled reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSchedules}</div>
              <p className="text-xs text-muted-foreground">Running schedules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused</CardTitle>
              <Pause className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pausedSchedules}</div>
              <p className="text-xs text-muted-foreground">Inactive schedules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Reports</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailySchedules}</div>
              <p className="text-xs text-muted-foreground">Daily frequency</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All frequencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All frequencies</SelectItem>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>
              {totalSchedules} {totalSchedules === 1 ? "schedule" : "schedules"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading schedules...
              </div>
            ) : schedules && schedules.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Report</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.name}</TableCell>
                        <TableCell className="text-sm">
                          {getReportName(schedule.reportId)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {FREQUENCIES.find(f => f.value === schedule.frequency)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{schedule.time}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {schedule.format.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {schedule.recipients}
                        </TableCell>
                        <TableCell>
                          {schedule.isActive ? (
                            <Badge variant="default">
                              <Play className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Pause className="h-3 w-3 mr-1" />
                              Paused
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {schedule.nextRunAt ? format(new Date(schedule.nextRunAt), "MMM dd, HH:mm") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(schedule)}
                            >
                              {schedule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(schedule)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No scheduled reports found. Create your first schedule to automate report delivery.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Schedule Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Automate report generation and email delivery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Schedule Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Weekly Sales Report"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="report">Report *</Label>
              <Select value={reportId?.toString()} onValueChange={(v) => setReportId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  {reports?.map((report) => (
                    <SelectItem key={report.id} value={report.id.toString()}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            {frequency === "weekly" && (
              <div>
                <Label htmlFor="dayOfWeek">Day of Week *</Label>
                <Select value={dayOfWeek?.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {frequency === "monthly" && (
              <div>
                <Label htmlFor="dayOfMonth">Day of Month *</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  value={dayOfMonth || ""}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                />
              </div>
            )}
            <div>
              <Label htmlFor="recipients">Recipients (comma-separated emails) *</Label>
              <Input
                id="recipients"
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="format">Format *</Label>
              <Select value={formatType} onValueChange={setFormatType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Activate immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreate}
              disabled={createScheduleMutation.isPending}
            >
              {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update scheduled report configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Schedule Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Weekly Sales Report"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-report">Report *</Label>
              <Select value={reportId?.toString()} onValueChange={(v) => setReportId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  {reports?.map((report) => (
                    <SelectItem key={report.id} value={report.id.toString()}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-frequency">Frequency *</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-time">Time *</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            {frequency === "weekly" && (
              <div>
                <Label htmlFor="edit-dayOfWeek">Day of Week *</Label>
                <Select value={dayOfWeek?.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {frequency === "monthly" && (
              <div>
                <Label htmlFor="edit-dayOfMonth">Day of Month *</Label>
                <Input
                  id="edit-dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  value={dayOfMonth || ""}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit-recipients">Recipients (comma-separated emails) *</Label>
              <Input
                id="edit-recipients"
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-format">Format *</Label>
              <Select value={formatType} onValueChange={setFormatType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={updateScheduleMutation.isPending}
            >
              {updateScheduleMutation.isPending ? "Updating..." : "Update Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scheduled report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteScheduleMutation.isPending}
            >
              {deleteScheduleMutation.isPending ? "Deleting..." : "Delete Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

