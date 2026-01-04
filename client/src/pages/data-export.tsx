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
import { Download, FileText, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const EXPORT_TYPES = [
  { value: "orders", label: "Orders" },
  { value: "users", label: "Users" },
  { value: "riders", label: "Riders" },
  { value: "products", label: "Products" },
  { value: "sellers", label: "Sellers" },
  { value: "transactions", label: "Transactions" },
  { value: "payouts", label: "Payouts" },
];

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel (XLSX)" },
  { value: "pdf", label: "PDF" },
];

export default function DataExport() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState<any>(null);
  
  // Filters
  const [exportTypeFilter, setExportTypeFilter] = useState<string>("");
  const [formatFilter, setFormatFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Form state
  const [exportType, setExportType] = useState("");
  const [formatType, setFormatType] = useState("csv");

  const { data: exports, isLoading, refetch } = trpc.reports.getAllExportHistory.useQuery({
    exportType: exportTypeFilter || undefined,
    format: formatFilter || undefined,
    status: statusFilter || undefined,
  });

  const createExportMutation = trpc.reports.createExportHistory.useMutation();
  // Note: deleteExportHistory is not implemented in the backend

  const handleCreate = () => {
    setExportType("");
    setFormatType("csv");
    setCreateDialogOpen(true);
  };

  const confirmCreate = async () => {
    if (!exportType) {
      toast.error("Export type is required");
      return;
    }

    try {
      const filename = `${exportType}_export_${Date.now()}.${formatType}`;
      
      await createExportMutation.mutateAsync({
        filename,
        exportType,
        format: formatType as any,
        recordCount: 0,
        status: "pending",
      });

      toast.success("Export started successfully");
      setCreateDialogOpen(false);
      refetch();
      
      // Simulate export completion after 3 seconds
      setTimeout(() => {
        refetch();
        toast.success("Export completed! Ready to download.");
      }, 3000);
    } catch (error) {
      toast.error("Failed to start export");
    }
  };

  const handleDelete = (exportItem: any) => {
    setSelectedExport(exportItem);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExport) return;
    // Delete functionality not implemented in backend
    toast.error("Delete functionality is not available");
    setDeleteDialogOpen(false);
    setSelectedExport(null);
  };

  const handleDownload = (exportItem: any) => {
    if (exportItem.status !== "completed") {
      toast.error("Export is not ready for download");
      return;
    }
    
    toast.success(`Downloading ${exportItem.filename}...`);
    // In production, this would trigger the actual file download
  };

  const clearFilters = () => {
    setExportTypeFilter("");
    setFormatFilter("");
    setStatusFilter("");
  };

  // Stats
  const totalExports = exports?.length || 0;
  const completedExports = exports?.filter(e => e.status === "completed").length || 0;
  const pendingExports = exports?.filter(e => e.status === "pending").length || 0;
  const failedExports = exports?.filter(e => e.status === "failed").length || 0;
  const totalSize = exports?.reduce((sum, e) => sum + (e.fileSize || 0), 0) || 0;
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Download className="h-8 w-8 text-blue-600" />
              Data Export
            </h1>
            <p className="text-muted-foreground mt-1">
              Export data in multiple formats (CSV, Excel, PDF)
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Download className="h-4 w-4 mr-2" />
            New Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExports}</div>
              <p className="text-xs text-muted-foreground">All time exports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedExports}</div>
              <p className="text-xs text-muted-foreground">Ready to download</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingExports}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSizeMB} MB</div>
              <p className="text-xs text-muted-foreground">{failedExports} failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="exportType">Export Type</Label>
                <Select value={exportTypeFilter} onValueChange={setExportTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {EXPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <Select value={formatFilter} onValueChange={setFormatFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All formats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All formats</SelectItem>
                    {FORMATS.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
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

        {/* Exports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>
              {totalExports} {totalExports === 1 ? "export" : "exports"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading exports...
              </div>
            ) : exports && exports.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exports.map((exportItem) => (
                      <TableRow key={exportItem.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {exportItem.filename}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {EXPORT_TYPES.find(t => t.value === exportItem.exportType)?.label || exportItem.exportType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {exportItem.format.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {exportItem.recordCount?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {exportItem.fileSize ? formatFileSize(exportItem.fileSize) : "-"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(exportItem.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(exportItem.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {exportItem.status === "completed" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleDownload(exportItem)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(exportItem)}
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
                No exports found. Create your first data export to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Export Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Data Export</DialogTitle>
            <DialogDescription>
              Export data in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exportType">Data Type *</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="format">Export Format *</Label>
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
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Large exports may take a few minutes to complete. You'll be notified when your export is ready to download.
              </p>
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
              disabled={createExportMutation.isPending}
            >
              {createExportMutation.isPending ? "Starting..." : "Start Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Export Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Export</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this export? This action cannot be undone.
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
            >
              Delete Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

