import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Download, Upload, Trash2, Database, HardDrive, Clock, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Calendar, Play, FileArchive, Shield } from "lucide-react";

const BACKUP_TYPES = [
  { value: "full", label: "Full Backup" },
  { value: "incremental", label: "Incremental" },
  { value: "differential", label: "Differential" },
];

const BACKUP_STATUSES = [
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { value: "failed", label: "Failed", color: "bg-red-500" },
  { value: "scheduled", label: "Scheduled", color: "bg-yellow-500" },
];

const SCHEDULE_FREQUENCIES = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function BackupRecovery() {
  const [activeTab, setActiveTab] = useState("backups");
  const [isCreateBackupOpen, setIsCreateBackupOpen] = useState(false);
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<any>(null);
  
  // Backup form state
  const [backupName, setBackupName] = useState("");
  const [backupType, setBackupType] = useState<string>("full");
  const [backupDescription, setBackupDescription] = useState("");
  
  // Schedule form state
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleType, setScheduleType] = useState<string>("full");
  const [scheduleFrequency, setScheduleFrequency] = useState<string>("daily");
  const [scheduleTime, setScheduleTime] = useState("02:00");
  const [retentionDays, setRetentionDays] = useState(30);
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(true);
  
  const utils = trpc.useUtils();
  
  const { data: backups, isLoading: backupsLoading } = trpc.backup.list.useQuery({});
  const { data: schedules, isLoading: schedulesLoading } = trpc.backup.listSchedules.useQuery({});
  
  const createBackupMutation = trpc.backup.create.useMutation({
    onSuccess: () => {
      toast.success("Backup initiated successfully");
      setIsCreateBackupOpen(false);
      resetBackupForm();
      utils.backup.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const createScheduleMutation = trpc.backup.createSchedule.useMutation({
    onSuccess: () => {
      toast.success("Backup schedule created successfully");
      setIsCreateScheduleOpen(false);
      resetScheduleForm();
      utils.backup.listSchedules.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteBackupMutation = trpc.backup.delete.useMutation({
    onSuccess: () => {
      toast.success("Backup deleted successfully");
      utils.backup.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const restoreBackupMutation = trpc.backup.restore.useMutation({
    onSuccess: () => {
      toast.success("Restore initiated successfully");
      setIsRestoreOpen(false);
      setSelectedBackup(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const toggleScheduleMutation = trpc.backup.toggleSchedule.useMutation({
    onSuccess: () => {
      toast.success("Schedule updated");
      utils.backup.listSchedules.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetBackupForm = () => {
    setBackupName("");
    setBackupType("full");
    setBackupDescription("");
  };
  
  const resetScheduleForm = () => {
    setScheduleName("");
    setScheduleType("full");
    setScheduleFrequency("daily");
    setScheduleTime("02:00");
    setRetentionDays(30);
    setIsScheduleEnabled(true);
  };
  
  const handleCreateBackup = () => {
    createBackupMutation.mutate({
      name: backupName,
      type: backupType as any,
      description: backupDescription,
    });
  };
  
  const handleCreateSchedule = () => {
    createScheduleMutation.mutate({
      name: scheduleName,
      type: scheduleType as any,
      frequency: scheduleFrequency as any,
      time: scheduleTime,
      retentionDays,
      isEnabled: isScheduleEnabled,
    });
  };
  
  const handleDeleteBackup = (id: number) => {
    if (confirm("Are you sure you want to delete this backup? This action cannot be undone.")) {
      deleteBackupMutation.mutate({ id });
    }
  };
  
  const handleRestore = () => {
    if (!selectedBackup) return;
    if (confirm("Are you sure you want to restore from this backup? Current data will be overwritten.")) {
      restoreBackupMutation.mutate({ id: selectedBackup.id });
    }
  };
  
  const handleToggleSchedule = (id: number, enabled: boolean) => {
    toggleScheduleMutation.mutate({ id, isEnabled: enabled });
  };
  
  const getStatusBadge = (status: string) => {
    const config = BACKUP_STATUSES.find(s => s.value === status);
    return (
      <Badge className={`${config?.color || "bg-gray-500"} text-white`}>
        {config?.label || status}
      </Badge>
    );
  };
  
  const formatSize = (bytes: number | null) => {
    if (!bytes) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };
  
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };
  
  // Calculate stats
  const completedBackups = backups?.filter((b: any) => b.status === "completed").length || 0;
  const failedBackups = backups?.filter((b: any) => b.status === "failed").length || 0;
  const totalSize = backups?.reduce((acc: number, b: any) => acc + (b.size || 0), 0) || 0;
  const activeSchedules = schedules?.filter((s: any) => s.isEnabled).length || 0;
  const lastBackup = backups?.find((b: any) => b.status === "completed");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backup & Recovery</h1>
            <p className="text-muted-foreground">
              Manage database backups and disaster recovery
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedBackups}</div>
              <p className="text-xs text-muted-foreground">Successful backups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{failedBackups}</div>
              <p className="text-xs text-muted-foreground">Failed backups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
              <p className="text-xs text-muted-foreground">Storage used</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSchedules}</div>
              <p className="text-xs text-muted-foreground">Automated backups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {lastBackup ? new Date(lastBackup.completedAt || lastBackup.createdAt).toLocaleDateString() : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastBackup ? `Completed at ${new Date(lastBackup.completedAt || lastBackup.createdAt).toLocaleTimeString()}` : "No backups yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Dialog open={isCreateBackupOpen} onOpenChange={setIsCreateBackupOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetBackupForm}>
                    <Database className="mr-2 h-4 w-4" />
                    Create Backup Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Manual Backup</DialogTitle>
                    <DialogDescription>
                      Create an immediate backup of your database
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Backup Name *</Label>
                      <Input
                        value={backupName}
                        onChange={(e) => setBackupName(e.target.value)}
                        placeholder="e.g., Pre-deployment backup"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Backup Type</Label>
                      <Select value={backupType} onValueChange={setBackupType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BACKUP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={backupDescription}
                        onChange={(e) => setBackupDescription(e.target.value)}
                        placeholder="Optional description..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateBackupOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBackup} disabled={!backupName || createBackupMutation.isPending}>
                      {createBackupMutation.isPending ? "Creating..." : "Start Backup"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetScheduleForm}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Backup Schedule</DialogTitle>
                    <DialogDescription>
                      Set up automated backups
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Schedule Name *</Label>
                      <Input
                        value={scheduleName}
                        onChange={(e) => setScheduleName(e.target.value)}
                        placeholder="e.g., Daily Production Backup"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Backup Type</Label>
                        <Select value={scheduleType} onValueChange={setScheduleType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BACKUP_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Frequency</Label>
                        <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHEDULE_FREQUENCIES.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Time (24h)</Label>
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Retention (days)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={365}
                          value={retentionDays}
                          onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="schedule-enabled"
                        checked={isScheduleEnabled}
                        onCheckedChange={setIsScheduleEnabled}
                      />
                      <Label htmlFor="schedule-enabled">Enable schedule</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateScheduleOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSchedule} disabled={!scheduleName || createScheduleMutation.isPending}>
                      {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="backups">Backup History</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup History</CardTitle>
                <CardDescription>
                  View and manage your database backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backupsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : backups && backups.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup: any) => (
                        <TableRow key={backup.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{backup.name}</div>
                              {backup.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {backup.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{backup.type}</TableCell>
                          <TableCell>{formatSize(backup.size)}</TableCell>
                          <TableCell>{formatDuration(backup.duration)}</TableCell>
                          <TableCell className="text-center">
                            {backup.status === "in_progress" ? (
                              <div className="flex flex-col items-center gap-1">
                                {getStatusBadge(backup.status)}
                                <Progress value={backup.progress || 0} className="w-16 h-1" />
                              </div>
                            ) : (
                              getStatusBadge(backup.status)
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(backup.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {backup.status === "completed" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedBackup(backup);
                                      setIsRestoreOpen(true);
                                    }}
                                    title="Restore"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toast.info("Download feature coming soon")}
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBackup(backup.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileArchive className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No backups yet</h3>
                    <p className="text-muted-foreground">
                      Create your first backup to protect your data
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Schedules</CardTitle>
                <CardDescription>
                  Manage automated backup schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : schedules && schedules.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Schedule Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Retention</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead className="text-center">Enabled</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule: any) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{schedule.name}</TableCell>
                          <TableCell className="capitalize">{schedule.type}</TableCell>
                          <TableCell className="capitalize">{schedule.frequency}</TableCell>
                          <TableCell>{schedule.time}</TableCell>
                          <TableCell>{schedule.retentionDays} days</TableCell>
                          <TableCell>
                            {schedule.lastRun
                              ? new Date(schedule.lastRun).toLocaleString()
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={schedule.isEnabled}
                              onCheckedChange={(checked) => handleToggleSchedule(schedule.id, checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toast.info("Run now feature coming soon")}
                              title="Run Now"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No schedules configured</h3>
                    <p className="text-muted-foreground">
                      Set up automated backups to protect your data
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Restore Confirmation Dialog */}
        <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="h-5 w-5" />
                Confirm Restore
              </DialogTitle>
              <DialogDescription>
                This action will restore your database to the state from this backup.
                <strong className="block mt-2 text-destructive">
                  All current data will be overwritten. This cannot be undone.
                </strong>
              </DialogDescription>
            </DialogHeader>
            {selectedBackup && (
              <div className="py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Backup Name:</span>
                  <span className="font-medium">{selectedBackup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(selectedBackup.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{formatSize(selectedBackup.size)}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRestoreOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRestore}
                disabled={restoreBackupMutation.isPending}
              >
                {restoreBackupMutation.isPending ? "Restoring..." : "Restore Backup"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
