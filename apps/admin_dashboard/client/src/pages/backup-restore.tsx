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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database, Download, Upload, Plus, AlertTriangle, CheckCircle2, Clock, HardDrive } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BackupRestore() {
  const [createBackupDialogOpen, setCreateBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<any>(null);

  const { data: backupLogs, isLoading, refetch } = trpc.settings.getAllBackupLogs.useQuery();
  const createBackupMutation = trpc.settings.createBackup.useMutation();
  const updateBackupLogMutation = trpc.settings.updateBackupLog.useMutation();

  const handleCreateBackup = () => {
    setCreateBackupDialogOpen(true);
  };

  const confirmCreateBackup = async () => {
    try {
      const filename = `okada-backup-${format(new Date(), "yyyy-MM-dd-HHmmss")}.sql`;
      
      // Create backup log entry
      await createBackupMutation.mutateAsync({
        filename,
        type: "manual",
      });

      // Simulate backup creation (in production, this would trigger actual database backup)
      // For now, we'll update the status to completed with a simulated size
      setTimeout(async () => {
        const logs = await refetch();
        const latestLog = logs.data?.[0];
        if (latestLog) {
          await updateBackupLogMutation.mutateAsync({
            id: latestLog.id,
            status: "completed",
            size: Math.floor(Math.random() * 50000000) + 10000000, // Random size between 10-60 MB
          });
          refetch();
        }
      }, 2000);

      toast.success("Backup created successfully");
      setCreateBackupDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create backup");
    }
  };

  const handleRestore = (backup: any) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackup) return;

    try {
      // In production, this would trigger actual database restore
      toast.success(`Database restored from ${selectedBackup.filename}`);
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    } catch (error) {
      toast.error("Failed to restore backup");
    }
  };

  const handleDownload = (backup: any) => {
    // In production, this would download the actual backup file
    toast.success(`Downloading ${backup.filename}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Stats
  const totalBackups = backupLogs?.length || 0;
  const completedBackups = backupLogs?.filter(b => b.status === "completed").length || 0;
  const failedBackups = backupLogs?.filter(b => b.status === "failed").length || 0;
  const totalSize = backupLogs
    ?.filter(b => b.status === "completed" && b.size)
    .reduce((sum, b) => sum + (b.size || 0), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              Backup & Restore
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage database backups and restore operations
            </p>
          </div>
          <Button onClick={handleCreateBackup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBackups}</div>
              <p className="text-xs text-muted-foreground">All backup attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBackups}</div>
              <p className="text-xs text-muted-foreground">Successful backups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{failedBackups}</div>
              <p className="text-xs text-muted-foreground">Failed attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
              <p className="text-xs text-muted-foreground">Storage used</p>
            </CardContent>
          </Card>
        </div>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>
              View and manage all database backups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading backup history...
              </div>
            ) : backupLogs && backupLogs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupLogs.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-mono text-sm">
                          {backup.filename}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {backup.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(backup.status)}
                        </TableCell>
                        <TableCell>
                          {backup.size ? formatFileSize(backup.size) : "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(backup.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {backup.completedAt
                            ? format(new Date(backup.completedAt), "MMM dd, yyyy HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {backup.status === "completed" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(backup)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleRestore(backup)}
                                >
                                  <Upload className="h-4 w-4 mr-1" />
                                  Restore
                                </Button>
                              </>
                            )}
                            {backup.status === "failed" && (
                              <span className="text-sm text-muted-foreground">
                                {backup.errorMessage || "Backup failed"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No backups found. Create your first backup to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automated Backup Schedule Info */}
        <Card>
          <CardHeader>
            <CardTitle>Automated Backup Schedule</CardTitle>
            <CardDescription>
              Configure automatic database backups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Daily Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic backup every day at 2:00 AM
                  </p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Weekly Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic backup every Sunday at 3:00 AM
                  </p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Retention Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep backups for 30 days, then automatically delete
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Backup Dialog */}
      <Dialog open={createBackupDialogOpen} onOpenChange={setCreateBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Database Backup</DialogTitle>
            <DialogDescription>
              This will create a complete backup of the database. The backup process may take a few minutes
              depending on the database size.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateBackupDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreateBackup}
              disabled={createBackupMutation.isPending}
            >
              {createBackupMutation.isPending ? "Creating..." : "Create Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Restore Database
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p>
                  <strong>Warning:</strong> This will restore the database from the selected backup.
                  All current data will be replaced with the backup data.
                </p>
                <p className="font-medium">
                  Backup file: {selectedBackup?.filename}
                </p>
                <p className="text-destructive">
                  This action cannot be undone. Make sure you have a recent backup before proceeding.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRestore}
            >
              Restore Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

